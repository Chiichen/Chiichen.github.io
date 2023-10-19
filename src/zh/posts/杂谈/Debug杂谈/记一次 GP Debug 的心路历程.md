---
title: 记一次 GP Debug 的心路历程
# cover: /assets/images/cover1.jpg

icon: page
order: 1
author: ChiChen
date: 2023-10-19
category:
  - 杂谈
  - Debug杂谈
tag:

  - General Protection
  - Debug
sticky: false
star: false
footer: 
copyright: 转载请注明出处
---

## 背景

背景是在重构完 Signal 之后，一开始用我们自己的 libc 测试 signal 功能没有问题，但是在用 relibc 测试的时候出问题了，出错的原因就是一个 Userland 的 General Protection(GP)，这个东西是一个硬件异常，通常是由于汇编指令出错或者内存访问出错导致，比如把一个未对齐的内存地址作为某个指令的操作数，而这个指令要求这个内存地址是 8/16 对齐的。

## 初步分析

在查看 GP 的 RIP ，反汇编了用户空间的测试程序之后，看到了对应的汇编代码是

```x86asm
movapd %XMM0 0xe0(rsp)
```

也就是说，这个地方是把寄存器的值写到栈上，查手册后得知， `movapd` 操作要求操作数是 `16 对齐`的，不对齐的话就会触发 GP ，现在问题就比较清晰了，大概就是 rsp 没有 16 对齐，接下来就是排查 rsp 的情况了。

>这里还发现了之前信号处理流程中没有正确保存浮点寄存器和清空浮点寄存器的bug，不过修复了这个bug之后还是没有解决 GP 的问题，所以这里先不提了。

## 进一步分析

在信号处理流程中，在设置用户栈帧的时候是需要手动修改传入的中断栈帧的一系列寄存器，包括 rip\rsp，并且保存这个上下文，然后在信号处理函数调用结束之后恢复的，所以这里很自然的就会开始排查，是不是 `setup_frame`，也就是设置栈帧的时候出了问题，比如没有 16对齐 rsp。但是经过一番排查之后，发现在 `setup_frame` 函数返回的时候，rsp 已经 16 对齐了，所以这里排除 `setup_frame` 函数的问题。然后就会想，是不是哪里写坏栈了，或者在 `sertup_frame` 函数返回的时候，用户空间函数执行之前，还有什么地方对 rsp 进行了修改。但是很快就排除了这个问题。

## 陷入僵局

到这就很奇怪了，返回的时候还是 16 对齐的，到了用户空间执行的时候就变成非16对齐的了。又想不到哪里会修改 rsp 的值，而且因为现在 DragonOS 还没有支持用户空间的 GDB 调试 (因为没有ptrace)，所以我们就把这个用户程序 dump 出来，看里面的汇编对 rsp 是不是有操作的。

>这里我们又犯了一点小错误，就是在看汇编的时候，我们发现了在调用入口到报错位置有奇数个 push 指令，意思就是尽管传进来的是 16对齐但是到报错位置，rsp实际上就变成 8 对齐了，不过后来发现是在上一级调用的时候有个 callq，这个指令会压栈，所以实际上还是偶数个push指令，也就是与调用入口的对齐一致

然后发现也没什么异常，于是乎到这里就陷入僵局了。

## 跑着先

因为出错位置是在浮点周围，所以我们就选择在rust编译的时候开启软浮点，关闭硬件浮点支持，试试能不能跑起来。果不其然是能跑起来的，但是在 `sigreturn` 的时候报错了。于是这里又开始排查这个问题

## 好像

经过排查之后，发现是没有正确调用用户空间的 `sigreturn` 函数，也就没有调用内核的`sigreturn` 函数，然后打日志发现，用户空间传入内核的 `sig_restorer` (值恒为用户空间的 `sigreturn` 函数指针)有问题，但是在 relibc 中打日志发现是没问题的，到这一步就发现事情好像有点露出鸡脚了。

## 真相大白

然后 @longjin 提醒我检查内核的结构体是否与用户空间传入的结构体一致，我一看，真不一样，把这个一改，果然就跑起来了。开了硬件浮点之后之前的问题也不再出现了。但是为什么之前的 libc 能跑，这就是一个未解之谜了。经此一事，我们就要知道对于用户空间传入的数据要保持 100% 的敬畏之心，因为出现的错误很有可能千奇百怪。

## 坏起来了

我第二天又仔细看了一下串口输出，发现输出不对，原来是另一个结构体的数据成员顺序与 relibc 库中用户传入的不一样，昨天改完之后实际上因为这个错误直接在 `do_signal` 中 `return` 了，所以现在似乎还是会在那个浮点寄存器的位置出现 GP，而在我尝试把用户空间定义的信号处理函数中的输出部分注释掉

```c
bool handle_ok = false;
int count = 0;
void handler(int sig)
{
    // printf("handle %d\n", sig); 原来报错的位置
    handle_ok = true;
    count ++;
}

int main()
{
    printf("handler:%d",&handler);
    signal(SIGKILL, &handler);
    printf("registered.\n");


    while (1)
    {
        // handler(SIGKILL);
            printf("Test signal running\n");
            raise(SIGKILL);
        if (handle_ok)
        {
            printf("Handle OK!\n");
            count++;
            handle_ok = false;
        }

        if (count >0){
            printf("count:%d\n", count);
            signal(SIGKILL, SIG_DFL);
        }
    }

    return 0;
}
```

然后发现，信号处理函数可以正常运行，但是在重置信号处理函数之后

```c
signal(SIGKILL,SIG_DFL); //重置为默认信号处理函数，就是退出进程
```

退出进程这个动作会卡在 Exit 过程中

```rust
    pub fn exit(exit_code: usize) -> ! {
        // 关中断
        let irq_guard = unsafe { CurrentIrqArch::save_and_disable_irq() };
        let pcb = ProcessManager::current_pcb();
        pcb.sched_info
            .write()
            .set_state(ProcessState::Exited(exit_code));
        pcb.wait_queue.wakeup(Some(ProcessState::Blocked(true)));
        drop(pcb);
        ProcessManager::exit_notify();
        drop(irq_guard);
        kdebug!(
            "current pcb shced_info:{:?}\n current pcb pid :{:?}",
            ProcessManager::current_pcb().sched_info().state(),
            ProcessManager::current_pcb().pid(),
        );
        kdebug!(
            "cfs len:{:?}",
            __get_cfs_scheduler().get_cfs_queue_len(smp_get_processor_id())
        );
        compiler_fence(Ordering::SeqCst);
        sched();
        loop {} // 卡在这里
    }
```

按逻辑来说这里应该会直接把这个进程调度走，而且不会再把它加入队列。但不知道为什么，莫名其妙没有调度它，所以又再一次卡住了，现在问题就是伪造栈帧上执行的函数的 `rsp` 寄存器有问题，而且默认处理函数调用 `ProcessManager::exit` 无法正常退出。

## 继续 debug

到这里实在没办法了，实在想不出来哪里篡改了 rsp 的值，我怀疑是某个地方有个隐藏的入栈/弹栈，但是我确实看不出来。就只能开始对着 linux/arch/x86/kernel/signal.c 的代码，看哪里有不一样，终于，我看到了这一段代码

```c
/* in /arch/x86/kernel/signal.c get_sigframe(struct ksignal *ksig, struct pt_regs *regs, size_t frame_size,
      void __user **fpstate) */

 sp = fpu__alloc_mathframe(sp, ia32_frame, &buf_fx, &math_size);
 *fpstate = (void __user *)sp;

 sp -= frame_size;

 if (ia32_frame)
  /*
   * Align the stack pointer according to the i386 ABI,
   * i.e. so that on function entry ((sp + 4) & 15) == 0.
   */
  sp = ((sp + 4) & -FRAME_ALIGNMENT) - 4;
 else
  sp = round_down(sp, FRAME_ALIGNMENT) - 8;
```

注意看最后一行 `sp = round_down(sp, FRAME_ALIGNMENT) - 8` 前面很好理解，`sp = round_down(sp, FRAME_ALIGNMENT)` 就是对齐16位栈帧，但是-8？我直接套到系统上一用，直接成功了，虽然还是无法 exit， 但是已经是巨大的一步了。

## 原来是你

现在仍有不能调度的问题，于是乎我去看调度的代码(调度器几乎是不可调试的，因为调用的极为频繁，使得日志、gdb都无能为力)，祈祷能肉眼看出问题所在，我刚点开 do_sched 一看，我 DNA 直接动了

```rust
pub fn do_sched() -> Option<Arc<ProcessControlBlock>> {
    // 当前进程持有锁，不切换，避免死锁
    if ProcessManager::current_pcb().preempt_count() != 0 {
        return None;
    }
}
```

某种直觉告诉我，这里很有可能就是死锁引起的问题。于是我回到 `do_signal` 一看，果然有个自旋锁守卫 sig_guard 没有在调用 `handle_signal->setup_frame->default_handler->exit` 这个调用链之前释放，导致无法退出，drop掉这个 guard 之后果然就没问题了。所以以后遇到没正常调度的情况，请优先考虑是否有未释放的锁。

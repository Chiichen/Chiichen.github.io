---
title: NUMA Balance实现浅析
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: ChiChen
date: 2023/10/24
category:
    - 笔记
    - Linux 内核
tag:
    - Linux 内核
    - 内存管理
    - NUMA
# this page is sticky in article list
sticky: true
# this page will appear in starred articles
star: true
footer: 
isOriginal: false
copyright: 转载请注明出处
---

## 参考资料

转载于[numa balance实现浅析](https://blog.csdn.net/faxiang1230/article/details/123709414),原作者为[wjx5210
](https://blog.csdn.net/faxiang1230?type=blog),遵循 CC 4.0 BY 版权协议

## NUMA balance的背景

在NUMA(None Uniform Memory Access)之前是UMA(Uniform Memory Access), UMA 架构下，CPU 和内存之间的通信全部都要通过前端总线，总线模型保证了 CPU 的所有内存访问速率都是一致的，不必考虑不同内存地址之间的差异。此时提高性能的方式，就是不断地提高 CPU、前端总线和内存的工作频率。但是因为物理条件的限制，不断提高工作频率的路子走不下去了，CPU 性能的提升开始从提高主频转向增加 CPU 数量（多核、多 CPU）。越来越多的 CPU 对前端总线的争用，使前端总线成为了瓶颈。为了消除 UMA 架构的瓶颈，NUMA架构诞生了。在 NUMA 架构下，CPU与CPU之间通过核间互连总线连接，内存的访问速率出现了本地和远程的区别，访问远程内存的延时会明显高于访问本地内存。
linux在2.4就支持了NUMA架构，但是存在性能问题，任务运行的CPU和需要访问的数据不在同一节点上，访问延迟会影响发挥CPU的性能。之后厂商一方面提高核间互连总线的速率来消除NUMA的差异，目前x86和arm64上访问非本节点带宽达到本节点带宽的80%，另一方面软件进行优化，争取使CPU访问本节点内存。
在2012年左右，Peter Zijlstra 和 Andrea 分别提交了NUMA优化的patch，中间的过程略过，最终有了现在的numa balance的功能。

numa balance的终极目标: 任务访问本节点内存。实现上将其拆分成两个小目标：

如果任务访问的大部分内存不在本节点，那么把任务迁移到该节点的CPU上运行；
如果任务访问的大部分数据都在本节点，那么将其他节点上的数据迁移到该节点上。

## 基本原理

- numa balance功能的基本实现过程：
  1. 周期性扫描task的地址空间并且修改页表项为PAGE_NONE(没有读/写/执行权限，但是有对应的物理地址),之后访问该数据时会发生page fault。
  2. 在page fault中，重新修改页表为正确的权限使得后面能够继续执行
  3. 在page fault中会追踪两个数据: page被哪个节点和任务访问过，任务在各个节点上发生的缺页情况
  4. 根据历史记录，决定是否迁移页和任务迁移

对于单进程单线程的程序来说比较简单，进程没有共享的数据或者非常少，选择一个合适的节点运行就可以了；对于单进程多线程来说，就比较复杂了，线程间共享数据是不确定的，CPU的繁忙程度也是不固定的，特别是对于线程池的方式没有办法采用固定的配置。

- 总体而言需要解决几个问题：
  1. 扫描尽量不要影响系统正常的性能，因为它会强制触发page fault, 所以必须对扫描周期和一次性扫描的页范围进行限制，特别是扫描周期会根据缺页的历史统计进行动态调整。
  2. 决定是否迁移页
  3. 决定是否迁移线程到不同的节点上

以下基于4.19.190内核进行分析。

### 内核配置

```json
CONFIG_ARCH_SUPPORTS_NUMA_BALANCING=y
CONFIG_NUMA_BALANCING=y
CONFIG_NUMA_BALANCING_DEFAULT_ENABLED=y
```

另外还可以通过内核启动参数的方式 `numa_balancing=enable/disable` 或者sysctl接口 `kernel.numa_balancing` 来动态控制该功能工作。
此外还提供了几个sysctl 接口配置参数来控制它的扫描周期和力度:

```json
kernel.numa_balancing = 1      //是否使能自动的numa balance
kernel.numa_balancing_scan_delay_ms = 1000     //任务启动N ms之后才开启第一次扫描，这样可以避免对短生命周期的任务进行扫描
kernel.numa_balancing_scan_period_max_ms = 6000   //扫描的最小间隔和最大间隔。
kernel.numa_balancing_scan_period_min_ms = 1000
kernel.numa_balancing_scan_size_mb = 256    //一次扫描的空间大小，它会记录上次扫描的位置，下次继续从此次位置扫描
```

## 实现

### 相关数据结构

相关的数据结构主要位于task_struct 和 mm_struct中，先清楚需要维护这些状态的用途，之后在实现过程中分析他具体的使用。

#### task_struct

```c
struct task_struct {
    int             numa_scan_seq;
    unsigned int            numa_scan_period;
    unsigned int            numa_scan_period_max;
    int             numa_preferred_nid;
    unsigned long           numa_migrate_retry;
    /* Migration stamp: */
    u64             node_stamp;
    u64             last_task_numa_placement;
    u64             last_sum_exec_runtime;
 //多个task可能共享同一片内存，具体可以是单个进程内多线程共享或者是多个进程间通过共享内存的方式
 //将这些共享物理内存的task组织起来统计，并为后面的页面迁移和task迁移提供历史依据 */
 struct numa_group __rcu     *numa_group;
 //N个节点的状态，记录在每个节点上的缺页状态
 //每个节点包含2组状态，第一组代表当前扫描窗口的平均统计，第二组是临时的buffer，存储上一个窗口的统计
 //每组4个状态:faults_memory, faults_cpu,faults_memory_buffer, faults_cpu_buffer
 //faults_memory: 记录缺页状态，每一个周期结束时会根据当前周期的统计进行衰减，类似于load的计算
  //faults_cpus:发生缺页时，cpu运行在哪个node上
  //faults_memory_buffer, faults_cpu_buffer:记录当前窗口的缺页状态
 unsigned long           *numa_faults;
 //统计线程因为numa balance标记发生了多少次fault
 unsigned long           total_numa_faults;
 //[0]: remote,缺页后迁移到其他node; [1]: local,缺页后仍然是本节点; [2]: migrate failed
 unsigned long           numa_faults_locality[3];
 //统计线程迁移了多少个页,仅做调试时展示使用
 unsigned long           numa_pages_migrated;
}
```

#### mm_struct

```c
struct mm_struct {
        //下一次允许扫描地址空间的时间
        unsigned long numa_next_scan;
  //下一次扫描的起始位置，整个扫描是顺序循环的
        unsigned long numa_scan_offset;
        //用来防止同一个进程中多线程并发扫描地址空间
        int numa_scan_seq;
 }
```

#### numa_group

8c8a743c5087 引入了numa_group, 缺页异常中将 `cpu/pid` 的部分信息放到了page flags中，将有共享页行为的线程放到一个group中。接下来如果是不同的PID访问这个page，那么这两个任务共享这个页，可以尝试将task迁移到这个group中。

```c
struct numa_group {
 //引用计数，内核常用方式，当refcount为0时进行释放
    atomic_t refcount;
 //保护并发读写操作
    spinlock_t lock; /* nr_tasks, tasks */
    //当前group中task数量
    int nr_tasks;
    //创建时task的gid,在将多个task组织到一个group中时
    pid_t gid;
    //当group中共享的内存分布在不同节点上时，并不认为所有的node都是active的，
    //只有当前node 缺页访问数量超过max_faults_cpu 1/3时才会认为是active,
    //对于缺页访问较少的node应该将这些页积极的迁移到active node上，达到页面汇聚的目的
    int active_nodes;

    struct rcu_head rcu;
 //group中发生缺页的历史统计
    unsigned long total_faults;
    //多个节点共享时，发生缺页最多的node上的数量
    unsigned long max_faults_cpu;
 //每个节点上有一组统计数据，统计数据包括share/private的数量
    unsigned long *faults_cpu;
    //group中所有task->numa_faults之和
    unsigned long faults[0];
};
```

- 在缺页统计时从两个角度出发:
  1. task发生缺页时访问的是否是本节点，分为 local/remote， 一个窗口中统计缺页时 页的节点和当前运行节点的关系，保存在 p->numa_faults_locality 中。当local占比超过70%时，适当延长当前的扫描时间
  2. 页面是否被共享，分为share/private， 在page->flags中 编码了部分的cpu和pid信息，每次缺页时都会将本次的cpu/pid更新到page->flags中，比较两次中的pid,如果相同则是私有的，如果不同则是shared.当私有占比70%时，适当延长当前的扫描时间。

cpu的share/private的意义:一个场景是jvm中的垃圾回收线程，它会访问大量的内存但是并不会实际使用它。所以在实际过程中会根据CPU运行时间进行加权运算

### 具体实现

在系统启动阶段，会根据node是否大于1来动态选择是否开启numa balance功能,不需要担心在PC这种单节点的机器上有额外的消耗。

```c
static void __init check_numabalancing_enable(void){
    if (num_online_nodes() > 1 && !numabalancing_override) {      //对于单节点并不会开启numa balance扫描
        pr_info("%s automatic NUMA balancing. Configure with numa_balancing= or the kernel.numa_balancing sysctl\n",
            numabalancing_default ? "Enabling" : "Disabling");
        set_numabalancing_state(numabalancing_default);
    }
}
```

#### 周期性扫描地址空间

每个task都有自己的扫描时间戳,task->node_stamp和task->numa_scan_period，每个线程首先根据自己的时间戳来检测是否应该扫描;而多线程共享一个mm_struct, 他们不能同时扫描 mm->numa_next_scan,开始扫描时根据当前task更新下一个阶段的numa_next_scan。
线程之间共享同一个地址空间，扫描时修改的是同一个地址空间，所以其中一个线程做就OK了。但是因为线程可能是idle的或者根本没访问多少内存，所以不能指定某个线程开始做，而是所有线程都可以尝试，但是最后只有一个才真的能够开始修改地址空间。

```c
task_tick_fair  //周期性更新
 task_tick_numa
  init_task_work(work, task_numa_work);
  task_work_add(curr, work, true);
```

系统会发起周期性的timer中断，即`tick`，在tick中更新系统状态和任务抢占，numa balance将其任务插入这个流程中，一个是这个任务的精度不需要特别精准，其次不需要单独的线程或中断来发起，总体而言放在tick中消耗最小。而且numa balance并没有将任务真正的放在tick中，只是向task 中挂上一个work。

何时执行work? 它的处理时机类似于sighandler,在 从kernel退出到userspace，或者task退出时或者stop时 处理这个work: task_work_run。

代码中被调用的位置:

```c
exit_task_work
ptrace_notify
get_signal
```

#### task_numa_work都干了什么？

```c
task_numa_work
 start = mm->numa_scan_offset;
 vma = find_vma(mm, start);
 for (; vma; vma = vma->vm_next) {
  change_prot_numa(vma, start, end); 
 }

change_prot_numa(struct vm_area_struct *vma,
            unsigned long addr, unsigned long end) {
   nr_updated = change_protection(vma, addr, end, PAGE_NONE, 0, 1);    //扫描start - end 之间的页表，修改页表权限为PAGE_NONE
 }
```

1. 多线程共享mm_struct, 他们扫描的地址空间都是同一个,所以多线程可以并发task_numa_work执行，但是最终只有一个才会实际进行扫描。 在实际修改mm->numa_next_scan，采用cmpxchg操作，只会有一个修改成功
2. 实际完成的事就是将change_prot_numa，将pte修改成PAGE_NONE,没有读/写/执行权限，再次访问时会触发缺页异常。

#### 缺页异常处理

```c
handle_mm_fault
 __handle_mm_fault
  handle_pte_fault
   do_numa_page

do_numa_page {
    pte = pte_modify(pte, vma->vm_page_prot);  //修改页表为原始权限，在下次扫描到该页时访问不再发生异常
    //判断页是否符合node的policy设置。应用程序可以通过mbind对某块地址设置不同的策略，例如当bind到某个node时就不能迁移到其他节点。
    //返回值就是应该迁移的node,如果是-1则不应该迁移
 target_nid = numa_migrate_prep(page, vma, vmf->address, page_nid, &flags);
 //迁移错误放置的page到target node上
    migrated = migrate_misplaced_page(page, vma, target_nid);
    //更新当前的缺页统计情况
    if (page_nid != -1)
        task_numa_fault(last_cpupid, page_nid, 1, flags);
}
```

numa_migrate_prep除了会根据mbind设置的策略决定目标node，在可迁移的情况下还会根据numa balance当前缺页统计来决定是否迁移。

```c
numa_migrate_prep
 mpol_misplaced
 should_numa_migrate_memory    //衡量是否需要迁移到当前节点

bool should_numa_migrate_memory(struct task_struct *p, struct page * page, 
                int src_nid, int dst_cpu)                                                                                                                                                                                                     
{
    struct numa_group *ng = deref_curr_numa_group(p);
    int dst_nid = cpu_to_node(dst_cpu);
    int last_cpupid, this_cpupid;
 //cpupid由8bit的cpu和8bit的pid组成，他要放在page->flags中，而page毕竟数据结构比较敏感。
 //所以最终截取了部分的cpu/pid信息组成，所以后面根据cpupid来查找上一次存在误判的可能，特别是
 //根据cpupid将不同的task组织到一个numa_group中时，有可能会误判。
    this_cpupid = cpu_pid_to_cpupid(dst_cpu, current->pid);
    //更新page->flags中的cpupid并返回上一次页被访问的cpupid信息
    last_cpupid = page_cpupid_xchg_last(page, this_cpupid);

     //1. 对于page->flags中还没有设置过的即第一次发生page fault，没有历史信息进行判断时，那就迁移
     //2. 对于上个周期和本周期都是同一个cpu/pid访问的，大概率是private类型的，那就内存向该CPU汇聚
    if ((p->numa_preferred_nid == -1 || p->numa_scan_seq <= 4) && 
        (cpupid_pid_unset(last_cpupid) || cpupid_match_pid(p, last_cpupid)))
        return true; 
 //如果上次访问该页时的cpu所在node和本次不同，说明task还没决定在哪长期执行或者两个task不在同一节点上，那就暂时不迁，等任务稳定下来再迁
    if (!cpupid_pid_unset(last_cpupid) &&
                cpupid_to_nid(last_cpupid) != dst_nid)
        return false;

 //如果上次访问该页时的cpu所在node和本次相同,说明这个是私有内存。而且经过上面的判断，task可能是长期在该Node上运行了，那就迁
    if (cpupid_match_pid(p, last_cpupid))
        return true; 

 //既然上面的条件都不满足，那这个page应该是被多个task共享，并且两个task在同一节点上，尝试迁移
 //迁移依赖于numa_group的统计，既然还没有汇聚，暂时不迁
    if (!ng) 
        return true; 

    //目标node上发生缺页异常的数量远大于本节点上的数量，那就都汇聚到目标node上
    if (group_faults_cpu(ng, dst_nid) > group_faults_cpu(ng, src_nid) *
                    ACTIVE_NODE_FRACTION)
        return true;

    /* 如果目标节点上最近page fault数量的3/4 大于 源节点，通过一定的阈值差避免ping-pong迁移
     * Distribute memory according to CPU & memory use on each node,
     * with 3/4 hysteresis to avoid unnecessary memory migrations:
     *
     * faults_cpu(dst)   3   faults_cpu(src)
     * --------------- * - > ---------------
     * faults_mem(dst)   4   faults_mem(src)
     */
    return group_faults_cpu(ng, dst_nid) * group_faults(p, src_nid) * 3 >
           group_faults_cpu(ng, src_nid) * group_faults(p, dst_nid) * 4;
}
```

上面也提到，在共享内存的情况下需要根据numa_group的历史信息来决定是否迁移,这部分的信息主要在task_numa_fault 中完成的。

```c
task_numa_fault {
 //根据page->flags中cpupid来检查是否是私有访问的，它不同于mmap中的PRIVATE属性，而是表示是否多线程访问。
 priv = cpupid_match_pid(p, last_cpupid); 
 //如果是共享访问的，则尝试将共享访问的task组知道一个group中
 if (!priv && !(flags & TNF_NO_GROUP))
  task_numa_group(p, last_cpupid, flags, &priv); 
 //周期性的检查是否应该迁移task到目标node上
 if (time_after(jiffies, p->numa_migrate_retry)) {
  task_numa_placement(p);
  numa_migrate_preferred(p);
 }

 // 更新p->numa_faults中统计数据
 if (migrated)
  p->numa_pages_migrated += pages;
 p->numa_faults[task_faults_idx(NUMA_MEMBUF, mem_node, priv)] += pages;
 p->numa_faults[task_faults_idx(NUMA_CPUBUF, cpu_node, priv)] += pages;
 p->numa_faults_locality[local] += pages;
}
```

task_numa_fault主要完成task级别的信息统计，并且会周期性的检查是否应该迁移任务到目标节点上。统计信息主要分为页是私有访问还是多线程共享的，而实际使用这些信息的地方主要位于task_numa_placement。

下面先看如何将有共享页行为的多个task组织到一个group中。它主要是通过page->flags中的cpupid信息找到上次访问该页的task，之后尝试合并到numa_group中。

```c
static void task_numa_group(struct task_struct *p, int cpupid, int flags, int *priv)  //注意cpupid是上次访问的
{
    struct numa_group *grp, *my_grp;
    struct task_struct *tsk;
    bool join = false;
    int cpu = cpupid_to_cpu(cpupid);
    int i;

    rcu_read_lock();
    //尝试找出上次访问page的task，这个完全凭缘分，必须task还在那个cpu上正在运行
    //如果task不是正在运行或者换cpu了，那就找不到了
    tsk = READ_ONCE(cpu_rq(cpu)->curr);
  //cpu和pid都是只用了低8bit，所以不是完全匹配，有小概率会匹配失误
    if (!cpupid_match_pid(tsk, cpupid))
        goto no_join;

    grp = rcu_dereference(tsk->numa_group);
    my_grp = deref_curr_numa_group(p);
 //汇聚成更大的group而不是拆分成小group，更大的group可以更好地完成内存和cpu汇聚
 //如果当前group大于对方group时，不做汇聚，汇聚过程中需要操作对方task->numa_faults，这是对方私有的
    if (my_grp->nr_tasks > grp->nr_tasks)
        goto no_join;

     //这个就比较搞笑了，双方一样的时候那就用地址决胜负，最终还是期望共享行为的task汇聚到一个group中的
    if (my_grp->nr_tasks == grp->nr_tasks && my_grp > grp)
        goto no_join;
 //进程内的任务存在共享页行为，理所当然地应该汇聚
    if (tsk->mm == current->mm)
        join = true;
  //对于进程间共享页地行为，它也可以汇聚到一起。
  //在do_numa_page中根据vma的vm_flags中是否是进程间共享来标记，例如mmap中MAP_SHARED的影响
    if (flags & TNF_SHARED)
        join = true;

    rcu_read_unlock();
    if (!join)
        return;
 //根据地址来决定先锁哪一个，对于任意的锁都适用，nice
    double_lock_irq(&my_grp->lock, &grp->lock);
 //将task合并到目标group中，减去源group中该task的统计信息并增加到目标group中
    for (i = 0; i < NR_NUMA_HINT_FAULT_STATS * nr_node_ids; i++) {
        my_grp->faults[i] -= p->numa_faults[i];
        grp->faults[i] += p->numa_faults[i];
    }
    my_grp->total_faults -= p->total_numa_faults;
    grp->total_faults += p->total_numa_faults;
    my_grp->nr_tasks--;
    grp->nr_tasks++;
    spin_unlock(&my_grp->lock);
    spin_unlock_irq(&grp->lock);

    rcu_assign_pointer(p->numa_group, grp);

    put_numa_group(my_grp);
    return;

no_join:
    rcu_read_unlock();
    return;
}
```

之后周期性检查是否应该迁移任务到目标node：task_numa_placement，它主要就是根据当前周期内它访问的页主要位于哪个节点上。

```c
static void task_numa_placement(struct task_struct *p)
{
 //窗口时间内总的缺页数量，包括所有node上share/privated的页
    total_faults = p->numa_faults_locality[0] +
               p->numa_faults_locality[1];
    runtime = numa_get_avg_runtime(p, &period);

    //找出哪个node上发生缺页数量最多
    for_each_online_node(nid) {
        /* Keep track of the offsets in numa_faults array */
        int mem_idx, membuf_idx, cpu_idx, cpubuf_idx;
        unsigned long faults = 0, group_faults = 0;
        int priv;

        for (priv = 0; priv < NR_NUMA_HINT_FAULT_TYPES; priv++) {
            long diff, f_diff, f_weight;
            //numa_faults有4个，两组统计信息
            //NUMA_MEM是缺页历史总和的统计信息，NUMA_MEMBUF是当前窗口的缺页的数量
            //NUMA_CPU是缺页历史总和的统计信息(带CPU运行时间系数)，NUMA_CPUBUF是当前窗口缺页的数量(带CPU运行时间系数)
            mem_idx = task_faults_idx(NUMA_MEM, nid, priv);
            membuf_idx = task_faults_idx(NUMA_MEMBUF, nid, priv);
            cpu_idx = task_faults_idx(NUMA_CPU, nid, priv);
            cpubuf_idx = task_faults_idx(NUMA_CPUBUF, nid, priv);

            /* Decay existing window, copy faults since last scan */
   //当前窗口的数量-历史值的一半进行衰减，类似于系统load的计算，避免短时间内大量的访问引起task的迁移，更新到统计信息中
   //如果历史统计值较大，则diff可能为负数，统计数量会下降。如果历史值较小，对当前统计值进行微调整。
            diff = p->numa_faults[membuf_idx] - p->numa_faults[mem_idx] / 2;
            //统计private/share的数据量
            fault_types[priv] += p->numa_faults[membuf_idx];
            //清空当前窗口的统计数据量
            p->numa_faults[membuf_idx] = 0;
            
            //根据窗口内运行时间比进行加权，运行时间越短的对结果影响越小
            f_weight = div64_u64(runtime << 16, period + 1);
            //此时cpubuf_idx和membuf_idx中的值没什么区别，当前窗口内该节点在总缺页中的占比
            f_weight = (f_weight * p->numa_faults[cpubuf_idx]) /
                   (total_faults + 1);
            //根据历史统计信息衰减
            f_diff = f_weight - p->numa_faults[cpu_idx] / 2;
            //清空当前窗口中
            p->numa_faults[cpubuf_idx] = 0;
   //更新两组统计信息
            p->numa_faults[mem_idx] += diff;
            p->numa_faults[cpu_idx] += f_diff;
            //faults只是和当前缺页数量有关
            faults += p->numa_faults[mem_idx];
            //更新任务的历史缺页数量
            p->total_numa_faults += diff;
            if (ng) {
    //更新group中node上信息
                ng->faults[mem_idx] += diff;
                ng->faults_cpu[mem_idx] += f_diff;
                ng->total_faults += diff;
                group_faults += ng->faults[mem_idx];
            }
        }
  //该node上发生的缺页异常信息已经全部统计过了,找出最多的node
        if (!ng) {
            if (faults > max_faults) {
                max_faults = faults;
                max_nid = nid;
            }
        } else if (group_faults > max_faults) {
            max_faults = group_faults;
            max_nid = nid;
        }
    }

    if (ng) {
     //更新active node信息，发生少量缺页的node并不认为是active的
        numa_group_count_active_nodes(ng);
        spin_unlock_irq(group_lock);
        max_nid = preferred_group_nid(p, max_nid);
    }
    if (max_faults) {
        //为当前task设置新的prefer node
        if (max_nid != p->numa_preferred_nid)
            sched_setnuma(p, max_nid);
    }
 //调整task的扫描周期
    update_task_scan_period(p, fault_types[0], fault_types[1]);
}
```

update_task_scan_period会根据系统设定的 kernel.numa_balancing_scan_period_min_ms 和 kernel.numa_balancing_scan_period_max_ms 范围进行调整，如果大部分的内存已经是 local 或者 和其他线程在共享，扫描时间设置的更长一些，减少扫描的频率，反之则增加扫描频率。

```c
static void update_task_scan_period(struct task_struct *p, unsigned long shared, unsigned long private)
{
    unsigned int period_slot;
    int lr_ratio, ps_ratio;
    int diff;

    unsigned long remote = p->numa_faults_locality[0];
    unsigned long local = p->numa_faults_locality[1];

     //如果没有发生缺页行为或者该窗口内迁移失败了，则增加扫描时间。
    if (local + shared == 0 || p->numa_faults_locality[2]) {
        p->numa_scan_period = min(p->numa_scan_period_max,
            p->numa_scan_period << 1);
  //调整整个地址的扫描时间
        p->mm->numa_next_scan = jiffies +
            msecs_to_jiffies(p->numa_scan_period);
        return;
    }

    /*
     * Prepare to scale scan period relative to the current period.
     *   == NUMA_PERIOD_THRESHOLD scan period stays the same
     *       <  NUMA_PERIOD_THRESHOLD scan period decreases (scan faster)
     *   >= NUMA_PERIOD_THRESHOLD scan period increases (scan slower)
     */
    //将整个扫描周期分成10份
    period_slot = DIV_ROUND_UP(p->numa_scan_period, NUMA_PERIOD_SLOTS);
    lr_ratio = (local * NUMA_PERIOD_SLOTS) / (local + remote);
    ps_ratio = (private * NUMA_PERIOD_SLOTS) / (private + shared);

    if (ps_ratio >= NUMA_PERIOD_THRESHOLD) {
     //私有访问已经占到70%，减少扫描周期。这时候应该已经将task和内存统一放到一个节点上了，慢点扫
        int slot = ps_ratio - NUMA_PERIOD_THRESHOLD;
        if (!slot)
            slot = 1;
        diff = slot * period_slot;
    } else if (lr_ratio >= NUMA_PERIOD_THRESHOLD) {
        //本节点访问已经占到70%，起码这个task已经完成它的目标了，慢点扫
        int slot = lr_ratio - NUMA_PERIOD_THRESHOLD;
        if (!slot)
            slot = 1;
        diff = slot * period_slot;
    } else {
  //和70%目标差的越远，diff越小(负数)
        int ratio = max(lr_ratio, ps_ratio);
        diff = -(NUMA_PERIOD_THRESHOLD - ratio) * period_slot;
    }

    p->numa_scan_period = clamp(p->numa_scan_period + diff,
            task_scan_min(p), task_scan_max(p));
    //清空这个窗口内的统计信息
    memset(p->numa_faults_locality, 0, sizeof(p->numa_faults_locality));
```

最后一个,将任务迁移到prefered node上

```c
/* Attempt to migrate a task to a CPU on the preferred node. */
static void numa_migrate_preferred(struct task_struct *p)
{
    unsigned long interval = HZ;

    /* This task has no NUMA fault statistics yet */
    if (unlikely(p->numa_preferred_nid == -1 || !p->numa_faults))
        return;

    /* Periodically retry migrating the task to the preferred node */
    interval = min(interval, msecs_to_jiffies(p->numa_scan_period) / 16);
    p->numa_migrate_retry = jiffies + interval;

    /* Success if task is already running on preferred CPU */
    if (task_node(p) == p->numa_preferred_nid)
        return;

    /* Otherwise, try migrate to a CPU on the preferred node */
    task_numa_migrate(p);
}
```

## 观测工具

需要打开`CONFIG_SCHED_DEBUG`宏之后，内核才会提供接口，应用可以通过 proc 接口来获取内核的统计数据。

### /proc/vmstat接口

```bash
# cat /proc/vmstat|grep numa
numa_pte_updates 343288          //系统范围内总共被标记PAGE_NONE的页数量
numa_huge_pte_updates 119        //系统范围内总共被标记PAGE_NONE的大页数量，加上numa_pte_updates就是全部被标记的页数量
numa_hint_faults 84534           //因为被标记PAGE_NONE而产生的page fault
numa_hint_faults_local 78400     //page fault发生在本地的数量。numa_hint_faults_local/numa_hint_faults是有效迁移的比例
numa_pages_migrated 49394        //因为被标记PAGE_NONE而迁移页的数量
```

### 线程的/proc/…/sched 接口

```bash
#cat /proc/9817/sched
cat (9817, \#threads: 1)
-------------------------------------------------------------------
mm->numa_scan_seq                            :                    0
numa_pages_migrated                          :                    0
numa_preferred_nid                           :                   -1
total_numa_faults                            :                    0
current_node=0, numa_group_id=0
numa_faults node=0 task_private=0 task_shared=0 group_private=0 group_shared=0
numa_faults node=1 task_private=0 task_shared=0 group_private=0 group_shared=0
numa_faults node=2 task_private=0 task_shared=0 group_private=0 group_shared=0
numa_faults node=3 task_private=0 task_shared=0 group_private=0 group_shared=0
numa_faults node=4 task_private=0 task_shared=0 group_private=0 group_shared=0
numa_faults node=5 task_private=0 task_shared=0 group_private=0 group_shared=0
numa_faults node=6 task_private=0 task_shared=0 group_private=0 group_shared=0
numa_faults node=7 task_private=0 task_shared=0 group_private=0 group_shared=0
```

## 参考

1. linux kernel source: <https://elixir.bootlin.com/linux/v4.19.237/source>
2. commit: 8c8a743c5087bac9caac8155b8f3b367e75cdd0b引入了numa_group, 当访问一个page时将cpu/pid的部分信息放到了page flags中，具体见cpu_pid_to_cpupid。接下来如果是不同的PID访问这个page，那么这两个任务共享这个页，可以尝试将task迁移到这个group中。
3. commit:37355bdc5a129899f6b245900a8eb944a092f7fd进程启动早期迁移page，使用stream测试会有提升。对于进程启动阶段就做大量工作的任务比较好。
4. commit:10f39042711ba21773763f267b4943a2c66c8bef解释了should_numa_migrate_memory的目标:1. 线程的私有内存保持本地性，对于private的数据无条件迁移； 2. 避免大量的page迁移； 3.对于共享内存分布到不同的节点上，这样可以最大的利用带宽。它标记了当前的active_nodes,对于page在active_nodes之外的迁移无条件进来，而在active_nodes中的，哪个node中发生page fault过多的时候迁移page到发生比较少的节点，这样将数据平均分布到不同节点上可以最大化利用带宽。

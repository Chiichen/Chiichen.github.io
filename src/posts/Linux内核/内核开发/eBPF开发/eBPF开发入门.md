---
title: eBPF开发入门
# cover: /assets/images/cover1.jpg
icon: page
order: 1
author: ChiChen
date: 2023-11-15
category:
    - 杂谈
    - Linux内核
tag:
    - Linux内核
    - eBPF
sticky: false
star: false
footer:
copyright: 转载请注明出处
---

## 依赖安装

### Rust安装

需要安装 Nightly 版本，略

### 系统依赖安装

安装 bpf-linker 依赖和 bpftool 工具

```bash
sudo apt-get update
sudo apt-get install llvm clang -y
cargo install bpf-linker
```

#### 安装 bpftool 工具

最后，为了生成内核数据结构的绑定，我们还必须安装 bpftool，可以从发行版中安装或从源代码中构建，可参考 [bpftool 仓库说明文档](https://github.com/libbpf/bpftool)：

- 从发行版中安装：

```bash
sudo apt install linux-tools-common linux-tools-5.15.0-52-generic linux-cloud-tools-5.15.0-52-generic -y
```

- 从源码中构建：

```bash
git clone --recurse-submodules https://github.com/libbpf/bpftool.git
cd src
make install # 这里可能提示创建 usr/local/sbin/bpftool permission deny 我直接用root运行似乎没问题
```

## Aya 向导创建 eBPF 程序

### 使用向导创建项目

Aya 提供了一套模版向导用于创建 eBPF 对应的程序类型，向导创建依赖于 cargo-generate，因此我们需要在运行程序向导前提前安装：

```bash
cargo install cargo-generate
```

在完成依赖后，我们就可以使用向导来创建 eBPF 项目，这里以 XDP 类型程序为例：

```bash
cargo generate https://github.com/aya-rs/aya-template
```

这里我们输入项目名称 memory-scan，eBPF 程序类型选择 xdp，完成相关设定后，向导会自动帮我们创建一个名为 memory-scan 的 Rust 项目，项目包括了一个最简单的 XDP 类型的 eBPF 程序及相对应的用户空间程序。 memory-scan 目录的整体夹头如下所示：

```bash
$ tree -L 3
├── Cargo.lock
├── Cargo.toml
├── README.md
├── memory-scan
│   ├── Cargo.toml
│   └── src
│       └── main.rs
├── memory-scan-common
│   ├── Cargo.toml
│   └── src
│       └── lib.rs
├── memory-scan-ebpf
│   ├── Cargo.lock
│   ├── Cargo.toml
│   ├── rust-toolchain.toml
│   └── src
│       └── main.rs
├── target
│   ├── CACHEDIR.TAG
│   ├── bpfel-unknown-none
│   │   ├── CACHEDIR.TAG
│   │   └── debug
│   └── debug
│       ├── build
│       ├── deps
│       ├── examples
│       └── incremental
└── xtask
    ├── Cargo.toml
    └── src
        ├── build_ebpf.rs
        ├── main.rs
        └── run.rs

16 directories, 17 files
```

生成的 eBPF 程序位于 memory-scan-ebpf/src 目录下，文件名为 main.rs，完整内容如下所示：

```rust
#![no_std]
#![no_main]

use aya_bpf::{bindings::xdp_action, macros::xdp, programs::XdpContext};
use aya_log_ebpf::info;

#[xdp]
pub fn memory_scan(ctx: XdpContext) -> u32 {
    match try_memory_scan(ctx) {
        Ok(ret) => ret,
        Err(_) => xdp_action::XDP_ABORTED,
    }
}

fn try_memory_scan(ctx: XdpContext) -> Result<u32, u32> {
    info!(&ctx, "received a packet");
    Ok(xdp_action::XDP_PASS)
}

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    unsafe { core::hint::unreachable_unchecked() }
}
```

### 编译 eBPF 程序

首先，我们使用 cargo 工具编译 eBPF 对应的程序：

```bash
# 在根目录下，不是在memory-scan/memory-scan下
$ cargo xtask build-ebpf
warning: virtual workspace defaulting to `resolver = "1"` despite one or more workspace members being on edition 2021 which implies `resolver = "2"`
note: to keep the current resolver, specify `workspace.resolver = "1"` in the workspace root's manifest
note: to use the edition 2021 resolver, specify `workspace.resolver = "2"` in the workspace root's manifest
note: for more details see https://doc.rust-lang.org/cargo/reference/resolver.html#resolver-versions
    Finished dev [unoptimized + debuginfo] target(s) in 0.05s
     Running `target/debug/xtask build-ebpf`
   Compiling aya-bpf-cty v0.2.1 (https://github.com/aya-rs/aya#33b2e45a)
   Compiling num_enum v0.7.1
   Compiling memory-scan-common v0.1.0 (/mnt/data/linux/ebpf/memory-scan/memory-scan-common)
   Compiling aya-bpf-bindings v0.1.0 (https://github.com/aya-rs/aya#33b2e45a)
   Compiling aya-log-common v0.1.13 (https://github.com/aya-rs/aya#33b2e45a)
   Compiling aya-bpf v0.1.0 (https://github.com/aya-rs/aya#33b2e45a)
   Compiling aya-log-ebpf v0.1.0 (https://github.com/aya-rs/aya#33b2e45a)
   Compiling memory-scan-ebpf v0.1.0 (/mnt/data/linux/ebpf/memory-scan/memory-scan-ebpf)
    Finished dev [optimized] target(s) in 1.48s
```

:::info
    在根目录下 `Cargo.toml` 下加一行`resolver = "2"`在原有的 `members = ["xtask", "memory-scan", "memory-scan-common"]` 一行后面就可以解决这个 warning
:::

编译完成后，对应的程序保存在 target 目录下：

```bash
$ llvm-objdump -S target/bpfel-unknown-none/debug/memory-scan
target/bpfel-unknown-none/debug/memory-scan:    file format elf64-bpf

Disassembly of section .text:

0000000000000000 <memset>:
       0:       15 03 06 00 00 00 00 00 if r3 == 0 goto +6 <LBB1_3>
       1:       b7 04 00 00 00 00 00 00 r4 = 0

0000000000000010 <LBB1_2>:
       2:       bf 15 00 00 00 00 00 00 r5 = r1
       3:       0f 45 00 00 00 00 00 00 r5 += r4
       4:       73 25 00 00 00 00 00 00 *(u8 *)(r5 + 0) = r2
       5:       07 04 00 00 01 00 00 00 r4 += 1
       6:       2d 43 fb ff 00 00 00 00 if r3 > r4 goto -5 <LBB1_2>

0000000000000038 <LBB1_3>:
       7:       95 00 00 00 00 00 00 00 exit

0000000000000040 <memcpy>:
       8:       15 03 09 00 00 00 00 00 if r3 == 0 goto +9 <LBB2_3>
       9:       b7 04 00 00 00 00 00 00 r4 = 0

0000000000000050 <LBB2_2>:
      10:       bf 15 00 00 00 00 00 00 r5 = r1
      11:       0f 45 00 00 00 00 00 00 r5 += r4
      12:       bf 20 00 00 00 00 00 00 r0 = r2
      13:       0f 40 00 00 00 00 00 00 r0 += r4
      14:       71 00 00 00 00 00 00 00 r0 = *(u8 *)(r0 + 0)
      15:       73 05 00 00 00 00 00 00 *(u8 *)(r5 + 0) = r0
      16:       07 04 00 00 01 00 00 00 r4 += 1
      17:       2d 43 f8 ff 00 00 00 00 if r3 > r4 goto -8 <LBB2_2>

0000000000000090 <LBB2_3>:
      18:       95 00 00 00 00 00 00 00 exit

Disassembly of section xdp:

0000000000000000 <memory_scan>:
       0:       bf 16 00 00 00 00 00 00 r6 = r1
       1:       b7 07 00 00 00 00 00 00 r7 = 0
       2:       63 7a fc ff 00 00 00 00 *(u32 *)(r10 - 4) = r7
       3:       bf a2 00 00 00 00 00 00 r2 = r10
       4:       07 02 00 00 fc ff ff ff r2 += -4
    ......
```

至此，已经完成了 eBPF 程序的编译工作，接着我们需要继续编译用户空间代码。

## 运行用户空间程序

我们可以直接使用 cargo 命令来运行用户空间程序：

```bash
$ RUST_LOG=info cargo xtask run
    Finished dev [unoptimized + debuginfo] target(s) in 0.04s
     Running `target/debug/xtask run`
    Finished dev [optimized] target(s) in 0.04s
    Finished dev [unoptimized + debuginfo] target(s) in 0.06s
Error: failed to attach the XDP program with default flags - try changing XdpFlags::default() to XdpFlags::SKB_MODE

Caused by:
    unknown network interface eth0
Failed to run `sudo -E target/debug/memory-scan`
```

:::info
RUST_LOG=info 为设置日志级别的环境变量，默认为 warn，但向导生成的代码打印的日志级别默认为 info，因此需要运行时制定，否则可能会出现程序运行查看不到日志的情况。
:::

`cargo xtask run` 命令会直接编译用户空间代码并运行，但是运行过程中我们发现出现错误 `unknown network interface eth0`，这是因为默认生成的程序指定将 XDP 程序加载到 eth0 网卡，而我们的 VM 默认网卡不为 eth0 导致，这里我们明确制定网卡使用 lo 测试，再次运行结果如下：

```bash
$ RUST_LOG=info cargo xtask run -- --iface lo
    Finished dev [unoptimized + debuginfo] target(s) in 0.04s
     Running `target/debug/xtask run -- --iface lo`
    Finished dev [optimized] target(s) in 0.04s
    Finished dev [unoptimized + debuginfo] target(s) in 0.05s
[2023-11-16T11:36:41Z INFO  memory_scan] Waiting for Ctrl-C...
```

这次可以发现用户空间程序已经正常运行，并且将对应的 eBPF 程序加载至内核中。

```bash
$ ip link show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 xdpgeneric qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    prog/xdp id 351 

$ sudo bpftool prog list
300: cgroup_device  tag e3dbd137be8d6168  gpl
        loaded_at 2023-11-15T05:07:57+0000  uid 0
        xlated 504B  jited 310B  memlock 4096B
        pids systemd(1)
......
351: xdp  name memory_scan  tag 312facef5d978746  gpl
        loaded_at 2023-11-16T11:38:22+0000  uid 0
        xlated 1416B  jited 779B  memlock 4096B  map_ids 33,32,34
        pids memory-scan(2649040)
```

我们可以看到当我们在另外一个窗口在本地端口运行 `ping -c 1 127.0.0.1` 命令的同时，在运行用户空间 myapp 的程序日志中打印了对应的日志 `received a packet`。但是由于本人是在开发机上运行的，每时每刻都有网络包收发，所以就没法展示了，如果在一个干净的虚拟机中运行应该不会有问题。

至此，我们就完成了整个基于 Aya 最简单 XDP 程序的验证，如果你打算进阶一步打印报文日志或者对特定包进行对齐，则可以参考 [Aya Book](https://aya-rs.dev/book/) 中对应的章节。

## 参考资料

[Rust Aya 框架编写 eBPF 程序](https://www.ebpf.top/post/ebpf_rust_aya/#3-aya-%E5%90%91%E5%AF%BC%E5%88%9B%E5%BB%BA-ebpf-%E7%A8%8B%E5%BA%8F)

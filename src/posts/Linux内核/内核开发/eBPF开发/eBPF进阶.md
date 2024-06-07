---
title: eBPF进阶
# cover: /assets/images/cover1.jpg
icon: page
order: 1
author: Chiichen
date: 2023-11-16
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

## 背景

在上一篇博客中我们跟着官方的 example 完成了一个 eBPF 应用的运行，接下来就要尝试为自己的需求编写一个 eBPF 应用了。我的需求是获取一个应用负载在内存地址空间上的访存频率。初步的想法是利用 Numa Balancing 中的 Page 标记，通过 Page-fault 计数来实现这个功能。

## 前期构建

首先，我们是需要知道哪个 tracepoint 可以提供给我们的 eBPF 程序来挂载。

通过命令来获取内核提供的 Tracepoint：

```bash
$ sudo  find /sys/kernel/debug/tracing/events -type d | grep page_fault
/sys/kernel/debug/tracing/events/kvmmmu/handle_mmio_page_fault
/sys/kernel/debug/tracing/events/kvmmmu/fast_page_fault
/sys/kernel/debug/tracing/events/kvm/kvm_page_fault
/sys/kernel/debug/tracing/events/iommu/io_page_fault
/sys/kernel/debug/tracing/events/exceptions/page_fault_user # 这是我们想要的
/sys/kernel/debug/tracing/events/exceptions/page_fault_kernel
```

同样地运行这个命令

```bash
 cargo generate https://github.com/aya-rs/aya-template
```

然后在选择框中选择 tracepoint

```bash
  cgroup_skb
  cgroup_sockopt
  cgroup_sysctl
  classifier
  fentry
  fexit
  kprobe
  kretprobe
  lsm
  perf_event
  raw_tracepoint
  sk_msg
  sock_ops
  socket_filter
  tp_btf
❯ tracepoint
  uprobe
  uretprobe
  xdp
```

然后在后续的 tracepoint name 和 catagery 中分别填写 page_fault_user 和 exceptions，就会创建一个新的基于 tracepoint 的应用

## 修改

### 获取上下文

每个 Tracepoint 都提供了一个上下文环境，我们可以通过命令来获取上下文中的数据：

```bash
$ sudo  cat /sys/kernel/debug/tracing/events/exceptions/page_fault_user/format
name: page_fault_user
ID: 119
format:
        field:unsigned short common_type;       offset:0;       size:2; signed:0;
        field:unsigned char common_flags;       offset:2;       size:1; signed:0;
        field:unsigned char common_preempt_count;       offset:3;       size:1; signed:0;
        field:int common_pid;   offset:4;       size:4; signed:1;

        field:unsigned long address;    offset:8;       size:8; signed:0;
        field:unsigned long ip; offset:16;      size:8; signed:0;
        field:unsigned long error_code; offset:24;      size:8; signed:0;

print fmt: "address=%ps ip=%ps error_code=0x%lx", (void *)REC->address, (void *)REC->ip, REC->error_code
```

因为这些上下文信息都是通过一个裸指针返回的，所以我们需要这些信息来通过偏移量访问这些数据。

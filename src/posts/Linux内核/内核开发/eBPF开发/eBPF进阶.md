---
title: eBPF进阶
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

## 背景

在上一篇博客中我们跟着官方的example完成了一个eBPF应用的运行，接下来就要尝试为自己的需求编写一个 eBPF 应用了。我的需求是获取一个应用负载在内存地址空间上的访存频率。初步的想法是利用 Numa Balancing 中的 Page 标记，通过 Page-fault 计数来实现这个功能。

## 前期构建

首先，我们是需要知道哪个 tracepoint 可以提供给我们的eBPF程序来挂载。

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

---
title: NUMA Balancing

# cover: /assets/images/cover1.jpg

icon: page
order: 1
author: ChiChen
date: 2023-10-17
category:
- 笔记
- Linux 内核
tag:

- Linux 内核
- NUMA
sticky: false
star: false
footer:
copyright: 转载请注明出处

---


## [numa_balancing in kernel doc](https://www.kernel.org/doc/Documentation/sysctl/kernel.txt)

Enables/disables automatic page fault based NUMA memory
balancing. Memory is moved automatically to nodes
that access it often.

Enables/disables automatic NUMA memory balancing. On NUMA machines, there
is a performance penalty if remote memory is accessed by a CPU. When this
feature is enabled the kernel samples what task thread is accessing memory
by periodically unmapping pages and later trapping a page fault. At the
time of the page fault, it is determined if the data being accessed should
be migrated to a local memory node.

The unmapping of pages and trapping faults incur additional overhead that
ideally is offset by improved memory locality but there is no universal
guarantee. If the target workload is already bound to NUMA nodes then this
feature should be disabled. Otherwise, if the system overhead from the
feature is too high then the rate the kernel samples for NUMA hinting
faults may be controlled by the numa_balancing_scan_period_min_ms,
numa_balancing_scan_delay_ms, numa_balancing_scan_period_max_ms,
numa_balancing_scan_size_mb, and numa_balancing_settle_count sysctls.

---
>numa_balancing_scan_period_min_ms, numa_balancing_scan_delay_ms,
numa_balancing_scan_period_max_ms, numa_balancing_scan_size_mb

Automatic NUMA balancing scans tasks address space and unmaps pages to
detect if pages are properly placed or if the data should be migrated to a
memory node local to where the task is running.  Every `scan delay` the task
scans the next `scan size` number of pages in its address space. When the
end of the address space is reached the scanner restarts from the beginning.

In combination, the `scan delay` and `scan size` determine the scan rate.
When `scan delay` decreases, the scan rate increases.  The scan delay and
hence the scan rate of every task is adaptive and depends on historical
behaviour. If pages are properly placed then the scan delay increases,
otherwise the scan delay decreases.  The `scan size` is not adaptive but
the higher the `scan size`, the higher the scan rate.

Higher scan rates incur higher system overhead as page faults must be
trapped and potentially data must be migrated. However, the higher the scan
rate, the more quickly a tasks memory is migrated to a local node if the
workload pattern changes and minimises performance impact due to remote
memory accesses. These sysctls control the thresholds for scan delays and
the number of pages scanned.

numa_balancing_scan_period_min_ms is the minimum time in milliseconds to
scan a tasks virtual memory. It effectively controls the maximum scanning
rate for each task.

numa_balancing_scan_delay_ms is the starting `scan delay` used for a task
when it initially forks.

numa_balancing_scan_period_max_ms is the maximum time in milliseconds to
scan a tasks virtual memory. It effectively controls the minimum scanning
rate for each task.

numa_balancing_scan_size_mb is how many megabytes worth of pages are
scanned for a given scan.

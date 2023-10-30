---
title: LWN：针对多层内存系统重新进行NUMA平衡
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: ChiChen
date: 2023-10-30
category:
    - 笔记
    - Linux 内核
tag:
    - Linux 内核
    - 内存管理
    - NUMA
# this page is sticky in article list
sticky: false
# this page will appear in starred articles
star: false
footer: 
isOriginal: false
copyright: 转载请注明出处
---

## 参考

转载自 [LWN：针对多层内存系统重新进行NUMA平衡！](https://mp.weixin.qq.com/s?__biz=Mzg2MjE0NDE5OA==&mid=2247486608&idx=1&sn=51eb34edabfbcc6f730dd9c0efb1c0c6&chksm=ce0d1f39f97a962f20b3501bdbc6684ba043b88f924ba8db52aa77710b91899d7a2e069c0d95&scene=126&&sessionid=0)，作者为公众号：Linux News搬运工，原文创作时间为  2022-05-17

## NUMA rebalancing on tiered-memory systems

:::info
May 2, 2022
This article was contributed by David Vernet
DeepL assisted translation
<https://lwn.net/Articles/893024/>
:::

传统的 NUMA 架构是围绕 node （节点）建立的，每个节点都包含一组 CPU 和一些本地内存，所有的节点或多或少都是平等的。但最近，"tiered-memory （分层内存）" 的 NUMA 系统开始出现，其中包括无 CPU 的节点，也就是只包含持久性内存（persistent memory），而不是（更快但更昂贵的）DRAM。这种内存的一个可能用途就是保存不经常使用的 page，而不是强行把这些 page 换出到后备存储设备上。不过，在这个使用案例中出现了一个有趣的问题：内核如何管理 page 在较快和较慢内存之间的移动？最近的几个 patch set 对这些系统上的内存再平衡问题采取了不同的方法。

## Migration and reclaim

内核使用一种叫做 "NUMA hint-faulting" 的技术来检测确定某一个 page 是否需要被迁移。某个 task 的地址空间范围会被周期性地取消映射（unmap），这样今后对该范围内的 page 的访问就会触发一个 page fault。当 page fault 发生时，内存管理子系统就可以使用触发 page fault 的 CPU 的位置来确定该 page 是否需要被迁移到包含该 CPU 的节点去。完全没有 fault 的话就说明该 page 正在受到冷遇，并可能在 reclaim 的时候被迁移到一个慢层（slow-tier）节点。随着工作负载的运行和访问模式的改变，page 在常用与不常用（hot and cold）之间经常转换，也就会相应地在快速和慢速 NUMA 节点之间迁移了。

内存回收（memory reclaim）是由一个 "watermark" 系统驱动的，该系统试图至少保持最低数量的 free page 可供使用。当请求分配内存时，内核会将正在进行分配的节点中的可用 page 数量与 zone watermark threshold 进行比较。如果分配后节点中的空闲页数低于 watermark 所说的阈值，那么 kswapd 内核线程就会被唤醒来异步地扫描并从节点中回收内存 page。这就可以在节点的内存压力导致分配被阻塞从而发生 direct reclaim 之前就预先释放内存。

内核中的 zone watermark 是根据 host 的内存情况来静态地决定 size 的。内存较少的系统中 zone watermark 会比较低，而内存较大的系统的 watermark 会较高。从直觉来说，这种差异化是有必要的。如果你有一台拥有大量内存的机器，那么比起拥有很少内存的机器来说，reclaim 会更早触发，因为预期在拥有更多内存的系统上应用程序会更积极地申请内存。然而，使用静态的阈值也有缺点。在 tiered-memory 系统之中，如果一个节点的阈值太低，快速节点可能不会积极地 reclaim 回收内存，也就没有空间可以把慢速节点上的 hot page 提级迁移过来。

## Optimizing reclaim and demotion

Huang Ying 最近的一个 patch 就是针对性地解决这个问题的。这项工作的基础前提是，在具有多种内存类型的系统上，工作负载的 working-set （工作集，也就是各个工作者的集合）size 经常会超过系统中快速 DRAM 的总量。这是有道理的。如果一个系统没有 overcommit （也就是承诺了比真实内存容量还多的 DRAM），那么就完全没有必要使用其他类型的内存了。

这一点就说明，在 tiered-memory 系统中，当应用程序访问时，内存 page 会在快慢内存节点之间不断迁移。如果快速节点接近容量上限了，内核就无法在 rebalancing 过程中把全局性的 hot page 提级到这些快速节点上了；由于 hot page 一直驻留在慢速节点上，导致访问延迟变高了，这是不太合适的。因此，这里的诀窍在于需要确保能够从快速节点回收到足够的 page，这样除了为未来的分配腾出空间外，快速节点也有足够的空间来把慢速节点的 hot page 迁移过来。

Ying 的 patch set 通过引入一个新的 WMARK_PROMO watermark 来解决这个需求，这个 watermark 比（以前最高的）WMARK_HIGH 限值还要高。当一个 page 由于内存压力原因而无法被迁移到更快的节点时，kswapd 会被唤醒来回收内存，确保达到这个新加入的 WMARK_PROMO 阈值。这种稍显激进的回收策略能更好地确保有足够的空间将 hot page 从慢速内存节点提级迁移到快速内存节点，从而更好地适应 tiered memory 系统中常见的 working set。

## The controversy of statically sized watermarks

虽然添加 WMARK_PROMO watermark 提高了快速节点上有足够空间把较慢节点上的 hot page 迁移过来的机会，但人们不得不怀疑是否应该重新审视静态 watermark 这个概念。如果所选择的 watermark 阈值足够高，能确保 page 可以被提级迁移到快速节点，那么一个高于必要值的阈值也会使一些 DRAM 未被使用，从而让应用程序的性能受到负面影响。这里需要一个新的 watermark 的事实就表明了问题的性质，也就是很大程度上需要取决于系统本身的特点，以及它所运行的工作负载。

在对该补丁的 review 中讨论了使用静态 watermark 的弊端。例如，在 Ying 的补丁的早期版本中，硬性规定了 reclaim 时所需的额外 page 数量应该是比 WMARK_HIGH 大 10MB，Zi Yan 质疑这样的数值是否合理：

    为什么是 10MB？10MB 大到足以避免对快速内存造成内存压力吗？这个数字似乎像是个临时方案，可能只在你的测试机器上有效果。

Ying 承认，10MB 的数值很难证实是合理的，而且在目前的实现之外还有改进的余地。根据 Johannes Weiner 的建议，这个阈值后来被改为单独的 WMARK_PROMO 水位线，他还指出，有另一个选择是让提级迁移的动作来动态地按需提高 kswapd watermark。这就能避免 DRAM 未被充分利用的问题，当然这也是以增加复杂性为代价的。

渐进式的修改当然没有错，尽量坚持使用最简单的方法（在必须要实现复杂方案之前）也没有错。然而，我们关心的是，内核最终是否需要一个更加动态和灵活的框架来进行 page reclaim 以及 page migration 决策。

## Avoiding page ping-pong

除了要求快速节点有足够的空间用于把其他 page 提级迁移过来之外，还有一个问题是分层内存系统所特有的。在传统的 NUMA 设置中，应用程序 working set 的大小通常是适合于运行在一个或多个节点上的。一旦应用程序达到稳定状态，并且大多数（或者所有的）page 都正确地位于它们本地访问的节点上，那么迁移就会逐渐减少。不过，tiered memory 系统上的应用并不是这样的，因为它们的 working set 可能无法完全在它们所运行的 NUMA 节点放得下。当应用程序访问这些 page 时，它们并没有达到一个稳定的状态，而是不断地在慢速和快速的 NUMA 节点之间来回切换。

这也是一个相关问题，但与 Ying 的 patch set 所解决的问题不同。新的 watermark 可以确保快速节点上有足够的空间让 hot page 从慢速节点上迁移过来，但并没有阻止 page 在慢速节点和快速节点之间不断地、过于积极地进行迁移。如果执行迁移的开销超过了把 page 放在在本地 DRAM 节点上的访问延迟变小而获得的性能优势，那么 page 迁移的速度显然就需要调整了。对于如何解决这个问题，已经有很多建议。

Ying 提出的一个建议是记录慢速内存中的一个 page 被 unmap 来产生 NUMA hint fault 和在内存访问中实际观察到该 fault 之间的时间差。该 page 被 unmap 之后的时间越短，那么这个 page 就越有可能是 hot 状态。该时间可以跟一些阈值（可由系统管理员调整）进行比较，只有当时间差在该阈值内时，该 page 才会被提升。

虽然访问以来的时间感觉是量化页面热度的一种自然方式，但这种方法也相当复杂，需要添加大量的新代码。定义一个页面被认为是 "热 "的阈值应该是什么，这个问题也不清楚；可能需要由系统管理员进行调整。一个后续的补丁提出了一种根据迁移量动态调整阈值的方法，但它也相当复杂。

Hasan Al Maruf 在一个 patch 中提出了另一个方法。当一个 page 被降级时，会从 active LRU list 中移除掉，并放到 inactive LRU list 中。Al Maruf 的 patch 更新了 NUMA hint fault 处理程序（handler），来检查某个 page 是否处于这种 inactive 状态，如果是，则将其移至 active 状态，并推迟到后续 fault 发生时再进行提级迁移。如果该 page 再次被访问到，那么看起来它就是在 active LRU 上，然后就会发生提级迁移。这个解决方案的优点是，它使用了内核中现有的机制来跟踪 page 的 hot 程度。随着内存压力的增加以及有更多的 page 被回收，会有更多的 page 被移到 inactive LRU list 中，从而导致 page 提级迁移会按比例被抑制。

目前还没有就选择哪种解决方案达成共识，不过 Al Maruf 的 patch set 很可能会被接受，因为它很简单，而且使用了现有的机制来跟踪 page 的 hot 程度。虽然预计该解决方案不会引起争议，但最近会有 Linux Storage, Filesystems, and Memory-Management Summit 就要召开了，开发人员可以在那里来面对面地讨论每种方法的优点了。

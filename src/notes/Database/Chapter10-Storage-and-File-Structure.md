---
title: Chapter10 Storage and File Structure
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: ChiChen
date: 2023-12-30
category:
  - 课程笔记
tag:
  - 数据库
# this page is sticky in article list
sticky: false
# this page will appear in starred articles
star: false
footer: 
isOriginal: true
copyright: 转载请注明出处
---

## 物理存储媒介(Physical Storage Media)

- 磁盘
  - 1 block = 多个连续的 sector
  - 1个文件(哈希文件除外)= 多个连续的block
- 磁头与磁盘
  - 磁头往磁盘读写数据的最小单位是sector
- 内存与磁盘
  - 内存与磁盘交换信息的最小单位是block
- 开销=寻道时间+ 旋转时间+传输时间
- 数据库只关注:
  - 寻道次数
  - 传输磁盘块个数
- 设访问的磁盘块依次分别是: B1, B2
  - 寻道次数 : 如果B1, B2相邻, 则寻道1次
  - 传输磁盘块的个数:  无论相邻与否, 都是2.
![磁盘结构示意图](<images/Chapter10 Storage and File Structure/image.png>)

## 缓冲管理(Buffer Management)

- 当程序需要从磁盘中获取一个块时，它会调用缓冲管理器。
  - 如果该块已经在缓冲区中，则缓冲管理器会返回该块在主内存中的地址。
  - 如果该块不在缓冲区中，缓冲管理器会执行以下操作：
    - 在缓冲区中为该块分配空间。
      - 如果需要，替换（抛弃）其他块，以为新块腾出空间。
      - 仅当被替换的块在最近一次写入/从磁盘获取时被修改后，才将其写回磁盘。
    - 从磁盘中读取该块到缓冲区，并将该块在主内存中的地址返回给请求者。

### 缓冲替换策略(Buffer-Replacement Policies)

- 大多数操作系统使用`最近最少使用（LRU）`策略替换块。
- LRU的思想是利用过去的块引用模式作为对未来引用的预测器。
- 查询具有明确定义的访问模式（例如顺序扫描），数据库系统可以利用用户查询中的信息来预测未来的引用。
- 对于涉及重复数据扫描的某些访问模式，LRU可能是一个不好的策略。
  - 例如：计算两个关系 $r$ 和 $s$ 的连接操作时，通过嵌套循环进行：
    - 对于 $r$ 的每个元组 $t_r$，
    - 对于 $s$ 的每个元组 $t_s$，
    - 如果元组 $t_r$ 和 $t_s$ 匹配...
  - 在这种情况下，使用立即丢弃（Toss-immediate）策略更可取。
- 固定的块(Pinned block) - 不能写回磁盘的内存块。
- 立即丢弃（Toss-immediate）策略 - 在处理完块的最后一个元组后，立即释放该块占用的空间。
- 最近使用（Most recently used (MRU) strategy）策略 - 系统必须固定当前正在处理的块。在处理完该块的最后一个元组后，取消固定该块，并使其成为最近使用的块。
- 缓冲管理器可以使用关于请求将引用特定关系的概率的统计信息。
  - 例如，数据字典经常被访问。启发式方法：将数据字典块保留在主内存缓冲区中。
- 缓冲管理器还支持强制输出块(forced output)以进行恢复的目的（有关更多信息，请参阅第16章）。

## 文件组织(File Organization)

- 数据库以文件集合的形式存储。每个文件是一系列记录，而记录则是一系列字段的序列。

### 定长记录(Fixed-Length Records)

- 一种方法是：
  - 假设记录大小是固定的。
  - 每个文件只包含一种特定类型的记录。
  - 不同的文件用于不同的关系。
- 这种情况最容易实现；稍后我们将考虑可变长度的记录。
![Fixed-Length Records](<images/Chapter10 Storage and File Structure/image-1.png>)
- 用空闲链表来存储空余空间
![Free Lists](<images/Chapter10 Storage and File Structure/image-2.png>)

### 变长记录(Variable-Length Records: Slotted Page Structure)

![Slotted Page Structure](<images/Chapter10 Storage and File Structure/image-3.png>)

- 插槽页头(Slotted page header)包含以下内容：
  - 记录条目的数量
  - 块中空闲空间的结束位置
  - 每个记录的位置和大小
- 可以在页面内部移动记录，以保持它们的连续性，中间没有空白空间；页头中的条目必须更新。
- 指针不应直接指向记录，而应指向页头中记录对应的条目。

### 文件内的记录组织

- `堆（Heap）`- 记录可以放置在文件中的任何有空间的位置。

- `顺序（Sequential）`- 根据每个记录的搜索键值，按顺序存储记录。
![顺序组织](<images/Chapter10 Storage and File Structure/image-4.png>)
![顺序组织](<images/Chapter10 Storage and File Structure/image-5.png>)
- `哈希（Hashing）`- 对每个记录的某个属性计算哈希函数；结果指定了记录应该放置在文件的哪个块中。
- 每个关系的记录可以存储在单独的文件中。在`多表聚集文件组织(multitable clustering file organization)`中，多个不同关系的记录可以存储在同一个文件中。
- 动机：将相关的记录存储在同一个块中，以最小化I/O操作。
![多表聚集文件组织(multitable clustering file organization)](<images/Chapter10 Storage and File Structure/image-6.png>)
![多表聚集文件组织(multitable clustering file organization)](<images/Chapter10 Storage and File Structure/image-7.png>)

## 数据字典存储(Data Dictionary Storage)

数据字典（也称为系统目录）存储元数据，即关于数据的数据，例如：

- 关于关系的信息
  - 关系的名称
  - 每个关系的属性的名称和类型
  - 视图的名称和定义
  - 完整性约束
- 用户和账户信息，包括密码
- 统计和描述性数据
  - 每个关系中的元组数量
- 物理文件组织信息
  - 关系的存储方式（顺序/哈希/...）
  - 关系的物理位置
- 关于索引的信息（第11章中介绍）

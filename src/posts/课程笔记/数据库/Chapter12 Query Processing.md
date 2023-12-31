---
title: Chapter12 Query Processing
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: ChiChen
date: 2023-12-31
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

## 查询处理的基本步骤

1. 语法分析与翻译
2. 优化
3. 执行
![Basic Steps in Query Processing](<images/Chapter12 Query Processing/image.png>)

### 语法分析与翻译

- 将查询转换为内部形式，然后将其转换为关系代数。
- 解析器检查语法，验证关系。

### 执行

- 查询执行引擎接收查询执行计划，执行该计划，并返回查询的结果。

### 优化

- 关系代数表达式可能有许多等价的表达式。
例如，$\sigma_{salary<75000}(\Pi_{salary}(instructor))$等价于 $\Pi_{salary}(\sigma_{salary<75000}(instructor))$。
- 每个关系代数操作可以使用多种不同的算法进行执行。相应地，关系代数表达式可以以多种方式进行执行。指定详细执行策略的注释表达式称为`执行计划或计算计划(evaluation-plan)`。
- 例如，可以使用薪水索引来查找薪水小于75000的讲师，或者执行完整的关系扫描并丢弃薪水大于等于75000的讲师。
- `查询优化(Query Optimization)`：在所有等价的执行计划中选择成本最低的计划。
- 成本是使用数据库目录中的统计信息进行估算的。
- 例如，每个关系中的元组数量、元组大小等。

## 衡量查询开销

- 成本通常以回答查询所需的总耗时来衡量。
  - 许多因素会影响时间成本，包括磁盘访问、CPU或网络通信。
- 通常，磁盘访问是主要的成本，并且相对容易估计。通过考虑以下因素进行测量：
  - 寻道次数 * 平均寻道成本
  - 读取的块数 * 平均块读取成本
  - 写入的块数 * 平均块写入成本
  - 写入块的成本大于读取块的成本，因为在写入后需要将数据读回来以确保写入成功。
- 为简单起见，我们只使用磁盘的块传输数量和寻道次数作为成本度量。
  - $t_T$ - 传输一个块的时间
  - $t_S$ - 一个寻道的时间
  - 成本为b个块传输加上S次寻道的时间：$b\times t_T+S\times t_S$
- 为简单起见，我们忽略了CPU成本。实际系统会考虑CPU成本。
- 我们在成本公式中不包括将输出写入磁盘的成本。
- 通过使用额外的缓冲空间，可以减少磁盘IO的次数。
  - 在最好的情况下，所有数据都可以读入缓冲区，不需要再次访问磁盘。
  - 在最坏的情况下，我们假设缓冲区只能容纳少量的数据块，大约每个关系一个数据块。
  - 通常我们假设最坏情况。

## 选择操作

|| 算法 | 开销 | 原因 |
|---| --- | --- | --- |
| A1 |线性搜索 |$t_s + b \times t_r$ | 一次初始搜索加上$b_r$个块传输,$b_r$表示在文件中的块数量|
|A1|线性搜索，码属性等值比较。|平均情形 $t_s+(b_r/2)\times t_T$|因为最多一条记录满足条件，所以只要找到所需的记录，扫描就可以终止。在最坏的情况下，仍需要$b_r$个块传输。|
| A2 | $B^+$树主索引，码属性等值比较|$(h_i+1)\times(t_T+t_s)$ | (其中$h_i$表示索引的高度)。索引查找穿越树的高度，再加上一次I/O来取记录；每个这样的I/O操作需要一次搜索和一次块传输。 |
|A3|$B^+$树主索引,非码属性等值比较|$h_i\times(t_T+t_s)+b\times t_T$|树的每层一次搜索，第一个块一次搜索。$b$是包含具有指定搜索码记录的块数。假定这些块是顺序存储（因为是主索引）的叶子块并且不需要额外搜索。|
| A4 | $B^+$树辅助索引，码属性等值比较|$(h_i + 1) \times (t_T+t_s)$ | 这种情形和主索引相似 |
| A4 | $B^+$树辅助索引，非码属性等值比较|$(h_i + n) \times (t_T+t_s)$ |(其中$n$是所取记录数)。索引查找的代价和A3相似，但是每条记录可能在不同的块上，这需要每条记录一次搜索。如果$n$值比较大，代价可能会非常高。 |
| A5 | $B^+$树主索引，比较|$h_i\times(t_T+t_s)+b\times t_T$|和A3，非码属性等值比较情形一样 |
| A6 |$B^+$树辅助索引，比较|$(h_i+n) \times(t_T+t_s)$| 和A4，非码属性等值比较情形一样 |  

### A1（线性搜索）

- 算法 A1（线性搜索）：扫描每个文件块，并测试所有记录以确定它们是否满足选择条件。
  - 成本估计 = $b_r$块传输 + 1次寻道
    - 其中$b_r$表示包含来自关系$r$的记录的块数。
  - 如果选择条件是基于关键属性，可以在找到记录后停止搜索。
    - 成本 = $(b_r/2)$  块传输 + 1次寻道
  - 无论选择条件如何、记录在文件中的排序如何、是否有索引可用，都可以使用线性搜索。
- 注意：二分搜索通常没有意义，因为数据不是连续存储的，除非有可用的索引，而且二分搜索需要比索引搜索更多的寻道次数。

### A2（主索引，基于关键字的相等性）

- 示例查询：select *from instructor where ID="007"，其中ID是一个主索引；
- 索引访问成本：$h* (t_T + t_S)$
- 文件访问成本：$1 *(t_T + t_S)$
- 总成本 = $(h + 1)* (t_T + t_S)$

### A3（主索引，非关键字的相等性）

- 示例查询：select * from instructor where name="Einstein"，其中name是一个主索引；
- 检索多个记录。
- 记录将位于连续的块上。
- 令b为包含匹配记录的块数。

||index|file|
|---|---|---|
|seek|h|1|
|transfer|h|b|

- 访问索引树的开销：$h\times (t_T+t_S)$
- 访问记录的开销:$t_S + t_T\times b$，因为主索引必定顺序存储
- Cost = $h\times (t_T+t_S)+t_S + t_T\times b$

### A4（辅助索引，非关键字的相等性）

- 示例查询：select *from instructor where name="Einstein"，其中ID是主索引，name是辅助索引。
  - 索引访问成本：$h* (t_T + t_S)$
  - 文件访问成本：$n *(t_T + t_S)$
  - 匹配的记录可能位于不同的块上。
  - 总成本 =$ (h + n)* (t_T+ t_S)$
- 可能非常昂贵。
- 若在候选键上，则等值为 Cost = $ (h + 1)* (t_T+ t_S)$

||index|file|
|---|---|---|
|seek|h|n|
|transfer|h|n|

### A5（主索引，比较）

- 对于形如$\sigma_{A\le V}(r)$和$\sigma_{A\ge V}(r)$的查询，我们可以用线性搜索的方法，也可以用以下的方法来使用索引
- 示例查询：select *from instructor where ID <= "9999"，ID 是主索引。
  - 算法：对于 $\sigma_{A\le V}(r)$，不使用索引。顺序扫描关系直到找到第一个 $> v$ 的元组。
- 示例查询：select* from instructor where ID >= "9999"，ID 是主索引。
  - 算法：对于 $\sigma_{A\ge V}(r)$，使用索引找到第一个元组$\ge v$，然后从这里开始线性扫描

### A6（辅助索引，比较）

- 示例查询：select *from instructor where name >= "Einstein"，其中ID是主索引，name是辅助索引。
  - 算法：对于 $\sigma _{A \geq V}(r)$，使用索引找到第一个$ \ge v$ 的索引条目，并从那里开始顺序扫描索引，以找到指向记录的指针。
- 示例查询：
select* from instructor where name <= "Einstein"，其中ID是主索引，name是辅助索引。
  - 算法：对于 $\sigma _{A \leq V}(r)$，仅扫描索引的叶子页面，找到指向记录的指针，直到找到第一个$ >v$ 的条目。
- 在任一情况下，获取所指向的记录
  - 每个记录需要一个 I/O 操作
  - 线性文件扫描可能更便宜。

## 连接操作(Join Operation)

- 有几种不同的算法可以实现连接操作：
  - 嵌套循环连接（Nested-loop join）
  - 块嵌套循环连接（Block nested-loop join）
  - 索引嵌套循环连接（Indexed nested-loop join）
  - 合并连接（Merge-join）
  - 哈希连接（Hash-join）
- 选择算法时基于成本估计进行选择。

### 嵌套循环连接（Nested-loop join）

示例查询：

```sql
select * from student, takes where student.ID = takes.ID
```

- 为了计算 $\theta$ 连接：

$$
r \bowtie_\theta s = \sigma_\theta(r\times s)
$$

- 对于关系 $r$ 中的每个元组 $t_r$：
  - 对于关系$s$ 中的每个元组 $t_s$：
    - 检查元组 $(t_r, t_s)$ 是否满足连接条件 $\theta$，如果满足条件，则将 $t_r \cdot t_s$ 添加到结果中。
- 其中，$r$ 被称为连接的外部关系(outer relation)，$s$ 被称为连接的内部关系(inner relation)。
- 嵌套循环连接不需要索引，可以与任何类型的连接条件一起使用。
- 由于它检查两个关系中的每个元组对，所以开销较高。
![嵌套循环连接(Nested-loop join) - 1](<images/Chapter12 Query Processing/image-1.png>)
![嵌套循环连接(Nested-loop join) - 2](<images/Chapter12 Query Processing/image-2.png>)

#### 开销

- $Cost  = n_r\times b_s + b_r \text{块传输}+n_r + b_r\text{次搜索}$

- 如果内存只能存储关系的一块的话，是最差情况，预估为：

|Worst case|r|s|
|---|---|---|
|transfers|$b_r$|$n_r\times b_s$|
|seeks|$b_r$|$n_r$|

- 如果比较小的关系$s$可以被整个塞进内存里，我们把它作为内关系的话，就是Best case

|Best case|r|s|
|---|---|---|
|transfers|$b_r$|$b_s$|
|seeks|1|1|

### 块嵌套循环连接（Block nested-loop join）

- 对于关系$r$中的每个块$B_r$：
  - 对于关系$s$中的每个块$B_s$：
    - 对于块 $B_r$ 中的每个元组 $t_r$(以下两个循环在内存里执行)：
      - 对于块$B_s$ 中的每个元组 $t_s$：
        - 检查元组 $(t_r, t_s)$ 是否满足连接条件 $\theta$，如果满足条件，则将 $t_r \cdot t_s$ 添加到结果中。
- 其实就是在前者的基础上多了一个读块的过程
![块嵌套循环连接（Block nested-loop join）](<images/Chapter12 Query Processing/image-3.png>)

- 如果内存只能存储关系的一块的话，是最差情况，预估为：

|Worst case|r|s|
|---|---|---|
|transfers|$b_r$|$b_r\times b_s$|
|seeks|$b_r$|$b_r$|

- 如果比较小的关系$s$可以被整个塞进内存里，我们把它作为内关系的话，就是Best case

|Best case|r|s|
|---|---|---|
|transfers|$b_r$|$b_s$|
|seeks|1|1|

:::info 改进方法
改进嵌套循环和块嵌套循环算法的方法有：

- 在块嵌套循环中，将 M - 2 个磁盘块作为外部关系的分块单位，其中 M 是内存大小（以块为单位）；使用剩下的两个块缓冲内部关系并输出结果。
- 成本 = $⌈b_r/ (M-2)⌉\times b_s + b_r \text{块传输} +2 ⌈b_r / (M-2)⌉ 寻道$
- 如果等值连接属性形成内部关系的键，可以在第一次匹配时停止内部循环。
- 交替正向和反向扫描内部循环，以利用缓冲区中剩余的块（使用最近最少使用（LRU）替换策略）。
- 如果可用，使用内部关系的索引(下一部分)
:::

### 索引嵌套循环连接（Indexed nested-loop join）

- 如果连接是等值连接或自然连接，并且`内部关系的连接属性上存在索引`，那么索引查找可以替代文件扫描。

- 可以为计算连接而构建一个索引。

- 示例查询：

```sql
select * from student, takes where student.ID = takes.ID
```

- 在 `takes.ID` 上创建一个索引。

- 算法：对于外部关系 $r$ 中的每个元组 $t_r$，使用索引查找满足与元组 $t_r$的连接条件的关系 $s$ 中的元组。

![索引嵌套循环连接（Indexed nested-loop join）](<images/Chapter12 Query Processing/image-4.png>)

||$r$|$B^+ Tree  + s$|
|---|---|---|
|transfers|$b_r$|$n_r\times(h+1)$|
|seeks|$b_r$|$n_r\times(h+1)$|

- 最坏情况下：缓冲区只有一页的空间用于关系 $r$，对于 $r$ 中的每个元组，我们在关系 $s$ 上执行一次索引查找。

- 连接的成本：$b_r(t_T+t_s)+n_r\times c$，其中 $c$ 是遍历索引并获取与 $r$ 中的一个元组匹配的所有 $s$ 元组的成本。

- 可以估计 $c$，即使用连接条件进行单个对关系 $s$ 的选择操作的成本。

- 如果在关系 $r$ 和 $s$ 的连接属性上都存在索引，选择元组较少的关系作为外部关系。

### 合并连接（Merge-join）

1. 对两个关系的连接属性进行排序（如果它们尚未按连接属性排序）。
2. 合并排序后的关系以进行连接操作。
连接步骤类似于排序-合并算法的合并阶段。
3. 主要区别在于处理连接属性中的重复值-必须匹配具有相同连接属性值的每个对。

详细的算法请参考相关的书籍。

![合并连接（Merge-join）](<images/Chapter12 Query Processing/image-5.png>)

- 该方法仅适用于等值连接和自然连接。
- 假设对于连接属性的任何给定值，所有元组都适合内存，每个块只需要读取一次。
- 成本 = 排序成本 + 合并成本。
- 对于拥有$b_b$块的大小的工作缓冲区的合并连接算法，开销为：

||r|s|
|---|---|---|
|disk traverse|1|1|
|transfers|$b_r$|$b_s$|
|seeks|$b_r/b_b$|$b_s/b_b$|

### 哈希连接（Hash-join）

- 适用于等值连接和自然连接。
- 使用哈希函数将两个关系的元组进行分区。
- 哈希函数 $h$ 将 JoinAttrs 的值映射到 $\{0, 1, \ldots, n\}$，其中 JoinAttrs 表示自然连接中使用的 $r$ 和 $s$ 的共同属性。
- $r_0,r_1,\ldots,r_n$ 表示 $r$ 元组的分区。
  - 每个元组$t_r\in r$ 被放入分区 $r_i$，其中 $i=h(t_r[JoinAttrs])$。
- $s_0,s_1,\ldots,s_n$表示 s 元组的分区。
- 每个元组$t_s\in s$ 被放入分区 $s_i$，其中 $i=h(t_s[JoinAttrs])$。
注意：在书中，$r_i$ 被表示为 $H_{ri}$，$s_i$被表示为 $H_{si}$，$n$ 被表示为 $n_h$。

![哈希连接（Hash-join）](<images/Chapter12 Query Processing/image-6.png>)

- $r$ 中的元组在$r_i$ 中只需要与 $s$ 中的元组在 $s_i$ 进行比较。不需要与其他分区中的 $s$ 元组进行比较，因为：
  - 满足连接条件的 $r$ 元组和 $s$ 元组将具有相同的连接属性值。
  - 如果该值被哈希到某个值 $i$，那么 $r$ 元组必须在 $r_i$ 中，而 $s$ 元组必须在 $s_i$ 中。
- 计算 $r$ 和 $s$ 的哈希连接的步骤如下：
    1. 使用哈希函数 $h$ 对关系 $s$ 进行分区。
    2. 类似地，对关系 $r$ 进行分区。
    3. 对于每个分区$i$：
        1. 将 $s_i$ 加载到内存中，并使用连接属性构建一个内存中的哈希索引 $f$。这个哈希索引 $f$ 与 $h$ 不同。
        2. 逐个从磁盘中读取 $r_i$中的元组 $t_r$。对于每个元组 $t_r$，使用内存中的哈希索引 $f$ 定位在 $s_i$ 中的匹配元组 $t_s$。输出它们属性的连接结果。
- 关系 $s$ 称为`构建输入（build input）`，而 $r$ 称为`探测输入（probe input）`。

- 选择的值 $n$（桶子个数）和哈希函数 $h$ 应该适合内存。
  - 通常，$n$ 被选择为 $\lceil b_s/M\rceil \times f$，其中 $f$ 是一个经验系数，通常约为 1.2。
  - 探测关系 $r_i$不需要适合内存。
- 如果分区数 $n$ 大于内存页面数 $M$，则需要进行递归分区(Recursive partitioning)。
  - 不是分区成 $n$ 个部分，可以将 $s$ 分区成 $M - 1$ 个部分。
  - 进一步使用不同的哈希函数对 $M - 1$ 个分区进行分区。
  - 在 $r$ 上使用相同的分区方法。
  - 很少需要：例如，对于块大小为 4 KB，对于小于 1GB 的关系和 2MB 内存大小，或者对于小于 36GB 的关系和 12MB 内存大小，不需要进行递归分区。

#### 哈希连接开销

- 如果不需要进行递归分区：哈希连接的成本为 $3(b_r+b_s) \text{块传输}+2(\lceil b_r/ b_b \rceil+\lceil b_s/b_b\rceil)寻道$
如果整个构建输入都可以放在主内存中，则不需要分区。
成本估计将降至 $b_r+b_s\text{次块传输}+2\text{次寻道}$
- 例如：$instructor \bowtie teaches$
  - 假设内存大小为20个块，其中$b_{instructor} = 100$和$b_{teaches} = 400$。
  - $instructor$将用作构建输入。将其分区为五个大小为20个块的分区，可以在一次遍历中完成。
  - 类似地，将$teaches$分区为五个大小为80的分区，也可以在一次遍历中完成。
  - 假设缓冲块为3，则总成本（忽略部分填充块的写入成本）为：
    $3(100 + 400) = 1500\text{个块传输} +
    2(\lceil 100/3\rceil + \lceil 400/3\rceil) = 336\text{次寻道}$。

## 表达式的执行(Evaluation of Expressions)

- 通过上面的内容，我们知道了对于单个操作的算法，我们有两个主要方法来执行整个表达式树:
  - 物化计算(Materialization evaluation)
  - 流水线(Pipeline)

### 物化计算(Materialization evaluation)

- 逐个操作地执行查询，从最低级别开始。使用中间结果物化(Materailize)为临时关系，以执行下一级别的操作。
- 示例查询：
  - Select name
  - from instructor natural join department
  - Where building=“watson”
![物化计算(Materialization evaluation)](<images/Chapter12 Query Processing/image-7.png>)
- 这种方法经常是实用的
- 会带来额外的开销，因为要把中间结果写磁盘
- 双缓冲(double buffering)(即使用两个缓冲区,其中一个用于连续执行算法,另一个用于写出结果)允许CPU活动与I/O活动并行,从而提高算法执行速度。

### 流水线(Pipelining)

- 不储存中间结果，而是把中间结果直接传输到下一个要执行的操作上
- 管道传输不一定总是可行的，例如排序和哈希连接。为了使管道传输有效，使用评估算法，在接收到输入操作的元组时生成输出元组。
- 管道传输可以通过两种方式执行：
  - 需求驱动（demand driven）
  - 生产者驱动（producer driven）
- 另一种名称：拉取（pull）和推送（push）模型的管道传输。
- 在需求驱动或惰性(lazy)管道传输中：
  - 系统会反复从顶层操作请求下一个元组。
  - 每个操作根据需要从子操作请求下一个元组，以便输出其下一个元组。
  - 在调用之间，操作必须维护“状态”，以便知道要返回什么。
- 在生产者驱动或渴望型(eager)管道传输中：
  - 操作符会主动生成元组并将它们传递给它们的父级。
  - 在操作符之间维护缓冲区，子操作符将元组放入缓冲区，父操作符从缓冲区中移除元组。
  - 如果缓冲区已满，子操作符将等待，直到缓冲区有空间，然后生成更多的元组。
  - 系统调度具有输出缓冲区空间和能够处理更多输入元组的操作符。

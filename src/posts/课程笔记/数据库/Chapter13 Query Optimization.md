---
title: Chapter13 Query Optimization
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: Chiichen
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

## 简介

- 优化给定查询的方法：
  - 等价表达式(整体优化)
  - 对每个操作的不同算法(局部优化)
- 执行计划(evaluation plan)定义了每个操作要用什么算法完成以及如何协调操作的执行
- 查询的不同评估计划之间的成本差异可能是巨大的。例如，在某些情况下可能是秒级别与天级别的差异。
- 基于成本的查询优化的步骤如下：
  1. 使用等价规则生成逻辑上等价的表达式。
  2. 对生成的表达式进行注释，以获取备选的查询计划。
  3. 根据估计的成本选择最便宜的计划。
- 计划成本的估算基于以下因素：
  - 关系的统计信息，例如元组数量，属性的不同值数量等。
  - 中间结果的统计估计，用于计算复杂表达式的成本。
  - 使用统计数据计算的算法的成本公式。

## 生成等价表达式

- 如果两个关系代数表达式在每个合法的数据库实例上生成相同的元组集合，则称这两个表达式是`等价(equivalent)`的。
  - 注意：元组的顺序无关紧要。
- 在 SQL 中，输入和输出是元组的多重集合。
  - 在关系代数的多重集合版本中，如果两个表达式在每个合法的数据库实例上生成相同的多重集合元组，则称这两个表达式是等价的。
- `等价规则(equivalence rule)`指出两种形式的表达式是等价的，可以用第一种形式替换第二种形式，或者反之亦然。

### 等价规则(equivalence rule)

1. 联合选择操作可以解构为一系列单独的选择：
   $$\sigma_{\theta_1\wedge\theta_2}(E)=\sigma_{\theta_1}(\sigma_{\theta_2}(E))$$
2. 选择操作是可交换的。
   $$\sigma_{\theta_1}(\sigma_{\theta_2}(E))=\sigma_{\theta_2}(\sigma_{\theta_1}(E))$$
3. 仅需要投影操作序列中的最后一个，其他可以省略。
   $$\Pi_{L_1}(\Pi_{L_2}(\ldots(\Pi_{Ln}(E))\ldots))=\Pi_{L_1}(E)$$
4. 选择可以与笛卡尔积和 theta 连接相结合。
   $$\begin{array}{c}\sigma_\theta(E_1\times E_2)=E_1\bowtie_\theta E_2\\\sigma_{\theta_1}(E_1\bowtie_{\theta_2}E_2)=E_1\bowtie_{\theta_1\wedge\theta_2}E_2\end{array}$$
5. Theta 连接运算（和自然连接）是可交换的。
   $$E_1\bowtie_\theta E_2 = E_2\bowtie_\theta E_1$$
6. 自然连接操作是关联的
   $$(E_1\bowtie E_2)\bowtie E_3=E_1\bowtie (E_2\bowtie E_3)$$
7. Theta 连接按以下方式关联：
   $$(E_1\bowtie_{\theta_1}E_2)\bowtie_{\theta_2\wedge\theta_3}E_3 = E_1\bowtie_{\theta_1\wedge\theta_3}(E_2\bowtie_{\theta_2}E_3)$$
   其中$\theta_2$只包含$E_2$和$E_3$中的属性
   ![等价规则(equivalence rule)补充 - 1](<images/Chapter13 Query Optimization/image.png>)
   ![等价规则(equivalence rule)补充 - 2](<images/Chapter13 Query Optimization/image-1.png>)
   ![等价规则(equivalence rule)补充 - 3](<images/Chapter13 Query Optimization/image-2.png>)

### 实现基于转换的优化(Implementing Transformation Based Optimization)

- 查询优化器使用等价规则系统地生成与给定表达式等价的表达式
- 可按如下方式生成所有等价表达式：
  - 将所有适用的等价规则应用于迄今为止找到的每个等价表达式的每个子表达式
  - 将新生成的表达式添加到等价表达式 直到上面没有生成新的等价表达式
- 上述方法在空间和时间上非常昂贵
- 两种方法
  - 基于转换规则的优化计划生成
  - 针对仅具有选择、投影和连接的查询的特殊情况方法

## 成本估算统计(Statistics for Cost Estimation)

- 每个操作符的成本根据第 12 章所描述的方法计算。
  - 需要输入关系的统计信息，例如元组数量和元组大小。
- 输入可以是子表达式的结果。
  - 需要估计表达式结果的统计信息。
  - 为此，我们需要额外的统计信息，例如属性的不同值数量。
- 成本估计：
  - 元组数量：
    - Select（选择操作）
    - Join（连接操作）
  - 属性的不同值数量：
    - Select（选择操作）
    - Join（连接操作）

### 成本估算的统计信息(Statistical Information for Cost Estimation)

- $n_r$：关系 $r$ 中的元组数量。
- $b_r$: r 的块数。
- $l_r$: $r$元组的大小。
- $f_r$：$r$ 的分块因子——即，适合一个块的 $r$ 元组的数量。
- 如果 $r$ 的元组物理上一起存储在一个文件中，则：

$$b_r= \lceil \frac{n_r}{f_r}\rceil$$

- $V(A, r)$：属性 $A$ 中 $r$ 中出现的不同值的数量；与$\Pi_A(r)$的大小相同。

//Todo 老师上课说这里比较难，应该只考概念，后面再补充笔记

## 启发式方法

- 基于成本的优化即使使用动态规划也是昂贵的。
- 系统可能使用启发式方法来减少在基于成本的方式下必须进行的选择数量。
- 启发式优化通过使用一组规则来转换查询树，通常（但不是在所有情况下）可以提高执行性能：
  - 尽早执行选择操作（减少元组数量）
  - 尽早执行投影操作（减少属性数量）
  - 在其他类似操作之前，先执行最严格的选择和连接操作（即产生最小结果大小的操作）。
- 一些系统仅使用启发式方法，而其他系统将启发式方法与部分基于成本的优化相结合。

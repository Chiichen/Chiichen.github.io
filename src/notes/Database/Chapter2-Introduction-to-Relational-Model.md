---
title: Chapter2 Introduction to Relational Model
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: Chiichen
date: 2023-12-27
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

## 关系(Relation)

![Example of a Relation](<images/Chapter2 Introduction to Relational Model/image.png>)

### 属性值(Attribute Types)

- 每个属性允许的值集合称为属性的域(domain)。
- 属性值（通常）要求是原子(atomic)的，即不可分割的。
- 特殊值 null 是每个域的成员。
- null 值在许多操作的定义中引起了复杂性。

### 关系模式和实例(Relation Schema and Instance)

- 关系模式是关系数据库中表的结构定义，它规定了表的列名、数据类型和约束条件。它描述了表的属性以及属性之间的关系。
- 关系实例是关系模式的具体实例化，即表中的具体数据。它是由行和列组成的二维表格，每行代表一个记录，每列代表一个属性。
- 简而言之，关系模式定义了表的结构，而关系实例则是实际存储在表中的数据。

:::info 形式化描述

- 例如：$A_1$是属性名，$D_1$是$A_1$的取值范围，$a_1$是$A_1$中的一个元素
- $A_1,A_2,A_3,...,A_n$就是属性(attribute)
- $R=(A_1,A_2,...,A_n)$是一个关系模式(relation schema)
  - 例如 $instrutor=(ID,name,dept\_name,salary)$
- 对于给定的若干个集合$D_1,D_2,...,D_n$，一个关系$r$是$D_1\times D_2 \times ...\times D_n$的子集

:::

- `关系是无序的`

## 数据库

- 一个数据库由多个关系组成。
- 关于一个大学的信息被分解成不同的部分。
- 不好的设计：$univ(instructor-ID，\\name，dept\_name，salary，student\_Id，...)$导致了信息的重复（例如，两个学生有相同的教师）和需要使用空值（例如，表示没有指导教师的学生）。
- 规范化理论（第 7 章）处理如何设计“好”的关系模式。

## 键(Key)

- 设 $K \subseteq R$，(其中 $R$ 是一个关系模式，由多个属性组成)。

- 如果 $K$ 的值足以唯一标识每个可能的关系 $r(R)$ 中的元组，则 $K$ 是 $R$ 的`超键(superkey)`。

  - 例如，$\{ID\}$ 和 $\{ID, name\}$都是 $instructor$ 关系的超键。

- 如果 $K$ 是最小的超键，则 $K$ 是`候选键(candidate key)`。

  - 例如，$\{ID\}$ 是 $Instructor$ 的候选键。

- 其中一个候选键被选为`主键(primary key)`。

  - 哪一个是主键？

- 外键约束(Foreign key)：一个关系中的值必须出现在另一个关系中。
  - 引用关系(Referencing relation)：包含外键的关系。
  - 被引用关系(Referenced relation)：被外键引用的关系。

## 关系查询语言(Relational Query Languages)

- 过程式 vs. 非过程式，或声明式(Procedural vs.non-procedural, or declarative)
- "纯"语言:
  - `关系代数（Relational algebra）`
  - 元组关系演算（Tuple relational calculus）
  - 域关系演算（Domain relational calculus）
- 关系操作符（Relational operators）
  ![Selection of tuples](<images/Chapter2 Introduction to Relational Model/image-1.png>)
  ![ Selection of Columns (Attributes)](<images/Chapter2 Introduction to Relational Model/image-2.png>)
  ![Joining two relations – Cartesian Product](<images/Chapter2 Introduction to Relational Model/image-3.png>)
  ![ Union of two relations](<images/Chapter2 Introduction to Relational Model/image-4.png>)
  ![Set difference of two relations](<images/Chapter2 Introduction to Relational Model/image-5.png>)
  ![ Set Intersection of two relations](<images/Chapter2 Introduction to Relational Model/image-6.png>)

:::info 合并两个关系 - 自然连接

- 假设 $r$ 和 $s$ 是分别基于模式 $R$ 和 $S$ 的关系。那么，关系 $R$ 和 $S$ 的“自然连接”是基于模式 $R \cup S$ 的关系，其过程如下：
  - 对于 $r$ 中的每个元组 $t_r$ 和 $s$ 中的每个元组 $t_s$，考虑每对元组。
  - 如果 $t_r$ 和 $t_s$ 在 $R \cap S$ 中的每个属性上有相同的值，则将一个元组 $t$ 添加到结果中。其中：
    - $t$ 和 $t_r$ 在 $r$ 上具有相同的值。
    - $t$ 和 $t_s$ 在 $s$ 上具有相同的值。

简而言之，自然连接操作是基于两个关系中共同属性的值相等的元组进行并。结果是一个新的关系，包含了具有相同共同属性值的元组。

:::

![Natural Join Example](<images/Chapter2 Introduction to Relational Model/image-7.png>)
![Relational algebra](<images/Chapter2 Introduction to Relational Model/image-8.png>)

---
title: Chapter6 Formal Relational Query Languages
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: ChiChen
date: 2023-12-29
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

## 分类

关系代数（Relational Algebra）、元组关系演算（Tuple Relational Calculus）和域关系演算（Domain Relational Calculus）是用于关系数据库的不同查询语言和形式。它们的主要区别如下：

1. 关系代数（Relational Algebra）：
关系代数是一种基于集合论的查询语言，用于操作关系数据库中的关系。它使用一组操作符，如选择（selection）、投影（projection）、连接（join）、并（union）、差（difference）等来执行关系操作。关系代数提供了一种形式化的方法来描述和操作关系数据库中的关系。

2. 元组关系演算（Tuple Relational Calculus）：
元组关系演算是一种基于逻辑的查询语言，用于描述关系数据库中的查询。它使用逻辑谓词（predicate）来描述所需的元组集合。元组关系演算的查询结果是满足指定谓词的关系中的元组集合。元组关系演算描述了所需的结果，而不是如何计算结果。

3. 域关系演算（Domain Relational Calculus）：
域关系演算也是一种基于逻辑的查询语言，用于描述关系数据库中的查询。它使用逻辑谓词来描述所需的属性集合。域关系演算的查询结果是满足指定谓词的关系中的属性集合。域关系演算描述了所需的属性，而不是如何计算结果。

## 关系代数( Relational Algebra)

- 过程语言(Procedural language)
- 六个基本运算子：
  - 查询(Selection)：$\sigma$
  - 投影(Projection)：$\Pi$
  - 集合并(Union)：$\cup$
  - 差集(Set difference)：$-$
  - 笛卡尔积(Cartesian product)：$\times$
  - 重命名(Reanme)： $\rho$

### 六个基本运算符号

#### 查询(Select Operation)

![Selction操作](<images/Chapter6 Formal Relational Query Languages/image.png>)

- 基本形式：$\sigma_{p}(R)$
- $p$称为选择谓词，可以由多个独立的命题通过
- 被定义为：$\sigma_{p}(r)=\{t\mid t\in r\mathrm{~and~}p(t)\}$
- 例如：$\sigma_{dept\_name=``Physics"}(instructor)$

#### 投影(Project Operation)

![Project操作](<images/Chapter6 Formal Relational Query Languages/image-1.png>)

- 基本形式：$\Pi_{a_1,\ldots,a_n}\left(r\right)$
- 其中$a_1,\ldots,a_n$是属性名称，$r$是关系名称
- 由于关系是集合，因此从结果中删除了重复行
- 例如：$\Pi_{ID,name,salary}(instructor)$

#### 集合并(Union Operation)

![Union操作](<images/Chapter6 Formal Relational Query Languages/image-2.png>)

- 基本形式：$r\cup s$
- 定义为：$r \cup s=\{t\mid t\in r\mathrm{~or~} t\in s\}$
- $r\cup s$需要满足两个条件：
    1. r, s必须具有相同的arity（相同的属性数量）
    2. 属性域必须兼容（例如：$r$的第$k$列与$s$的第$k$列处理相同类型的值）
- 例如，查找 2009 年秋季学期或 2010 年春季学期或两者都教授的所有课程：$$\begin{aligned}\Pi_{\mathrm{course\_}id}\left(\sigma_{\mathrm{~semester=“}\mathsf{Fall”~}\land\mathrm{~year=}2009}\left(\mathrm{section}\right)\right)\cup\\\Pi_{\mathrm{course\_}id}\left(\sigma_{\mathrm{~semester=“}\mathsf{Spring”}\land\mathrm{~year=}2010}\left(\mathrm{section}\right)\right)\end{aligned}$$

#### 差集(Set difference)

![Set difference](<images/Chapter6 Formal Relational Query Languages/image-3.png>)

- 基本形式：$r-s$
- 定义为：$r-s=\{t\mid r\in r \mathrm{~and~} t \notin s\}$
- 跟集合并一样，必须有一样的属性数量和兼容的属性域
- 例如，查找 2009 年秋季学期教授的所有课程，但 2010 年春季学期不教授的所有课程：
$$\begin{aligned}\Pi_{\mathrm{course\_}id}\left(\sigma_{\mathrm{~semester=“}\mathsf{Fall”~}\land\mathrm{~year=}2009}\left(\mathrm{section}\right)\right)-\\\Pi_{\mathrm{course\_}id}\left(\sigma_{\mathrm{~semester=“}\mathsf{Spring”}\land\mathrm{~year=}2010}\left(\mathrm{section}\right)\right)\end{aligned}$$

#### 笛卡尔积(Cartesian-Product Operation)

![Cartesian-Product](<images/Chapter6 Formal Relational Query Languages/image-4.png>)

- 基本形式：$r\times s$
- 定义为：$r\times s =\{t,q\mid t\in r \mathrm{~and~} q\in s\}$
- 假设 $r(R)$和$s(S)$ 的属性是不相交的（即，$R\cap S = \varnothing$）。  如果 $r(R)$ 和 $s(S)$ 的属性相交，则必须使用重命名。

#### 重命名(Rename Operation)

- 基本形式：$\rho_{x}(R)$或者$\rho_{x(A_1,\ldots,A_n)}(R)$表示把关系$R$重命名为$x$，把属性重命名为$A_1,\ldots,A_n$

### 其它运算符号

#### 集合交(Set-Intersection Operation)

![Set-Intersection](<images/Chapter6 Formal Relational Query Languages/image-5.png>)

- 基本形式：$r \cap s$
- 定义为：$r\cap s = \{t\mid t \in r \mathrm{~and~} t \in s\}$
- 需要$r$和$s$有相同的属性数量和匹配的属性域

#### 自然连接(Natural-Join Operation)

![Natural-Join](<images/Chapter6 Formal Relational Query Languages/image-6.png>)

- 基本形式：$r \bowtie s$
- 设 $r$ 和 $s$ 分别是基于模式 $R$ 和 $S$ 的关系。那么，$r \bowtie s$是基于模式 $R \cup S$ 的关系，其获取方式如下：
考虑每对元组 t：
  - 如果来自 $r$ 的元组 $t_r$ 和来自 $s$ 的元组 $t_s$ 在 $R \cap S$ 的每个属性上具有相同的值，则将一个元组 $t$ 添加到结果中，
    - 其中 $t$ 在 $r$ 上具有与 $t_r$ 相同的值，
    - $t$ 在 $s$ 上具有与 $t_s$ 相同的值。
- 在没有公共属性的时候退化为笛卡尔积
- 例如：

$$
\begin{array}{c}
R= (A, B, C, D)\\
S = (E, B, D)\\
Result \;schema = (A, B, C, D, E)\\
r \bowtie s = \Pi_{r.A,r.B,r.C,r.D,s.E}(\sigma_{r.B=s.B\wedge r.D=s.D}(r\times s))
\end{array}
$$

#### Theta连接(Theta Join)

- 定义为：$r \bowtie_\theta s=\sigma_\theta(r\times s)$
- 例如，假设一个顾客要购买一个车模和一个船模，但不想为船花费比车更多的钱。那么可以有$car \bowtie_{Carprice\le BoatPrice} boat $
- 当$\theta$为等号时，又被称为相等连接

#### 赋值(Assignment Operation)

- 基本形式：$r \leftarrow p$
- 用来表示一个临时的关系变量
- 例如：$a\leftarrow \sigma_P(E)$

#### 外连接

- 一种扩展的连接操作，避免了信息的丢失。
- 首先计算连接操作，然后将一方关系中与另一方关系中的元组不匹配的元组添加到连接结果中。
- 使用空值（null）：
  - 空值表示值是未知的或不存在的。
  - 所有涉及空值的比较（粗略地说）根据定义都是false。
  - 我们将在后面详细研究与空值的比较的确切含义。
![Outer Join –Example](<images/Chapter6 Formal Relational Query Languages/image-7.png>)
![Outer Join –Example2](<images/Chapter6 Formal Relational Query Languages/image-8.png>)
![Outer Join –Example3](<images/Chapter6 Formal Relational Query Languages/image-9.png>)

:::info 空值(Null Values)

- 某些属性的元组可能具有空值（null）。
- 空值表示一个未知的值或值不存在。
  - 任何涉及空值的算术表达式的结果都是空值。
  - 聚合函数简单地忽略空值（与SQL中类似）。
  - 在去重和分组中，空值被视为任何其他值，并且假设两个空值是相同的（与SQL中类似）。

:::

:::info Join之解析

- 连接主要由连接方向、连接类型组成
- 连接方向包括：左右内外
- 连接类型包括：自然连接、ON子句和HAVING子句
:::

#### 除法(Division Operation)

- 基本形式：$r\div s $
- 定义为:$R\div S =\{t[a_1,\ldots,a_n]\mid t\in R \wedge \forall s\in S((t[a_1,\ldots,a_n]\cup s)\in R)\} $，这里的$[a_1,\ldots,a_n]$时唯一于$R$的属性名字的集合
![Division Example](<images/Chapter6 Formal Relational Query Languages/image-10.png>)
- 如果DBProject包含数据库项目的所有任务，那么上述划分的结果恰好包含完成数据库项目中两项任务的学生。
![Division Example 2](<images/Chapter6 Formal Relational Query Languages/image-11.png>)

#### 广义投影( Generalized Projection)

- 基本形式：$\Pi_{F_1,F_2,\ldots,F_n}(E)$
- 其中$F_1,F_2,\ldots,F_n$都是关于属性的算数表达式
- 例如：$\Pi_{ID,name,dept\_name,salary/12}(instructor)$

#### 聚集函数(Aggregate Functions and Operations)

- 基本形式：$_{G_1,G_2,\ldots,G_n}G_{F_1(A_1),F_2(A_2),\ldots,F_{m}(A_{m})}(E)$
  - $E$ 是任意关系代数表达式。
  - $G_1、G_2、\ldots、G_n$ 是用于分组的属性列表（可以为空）。
  - 每个$F_i$是一个聚合函数。
  - 每个$A_i$是一个属性名。
- 输出的关系有$n+m$个属性
![Aggregate Function——Sum](<images/Chapter6 Formal Relational Query Languages/image-12.png>)

### 修改(Modification)

- 增加(Insertion)：$r\leftarrow r-E$
- 删除(Deletion)：$r\leftarrow r \cup E$
- 更新(Updating)：$r\leftarrow \Pi_{F_1,\ldots,F_n}(r)$

---
title: Chapter7 Entity-Relationship Model
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

## 建模

- 一个数据库可以被建模为：
  - 实体的集合，
  - 实体之间的关系。

### 实体集

- 实体(entity)是存在的对象，并且可与其他对象区分开来。
  - 例如：具体的人、公司、事件、植物。
- 实体具有属性(attribute)。
  - 例如：人有姓名和地址。
- 实体集(entity set)是一组具有相同属性的同类实体的集合。
  - 例如：所有人、公司、树木、假日的集合。
![Entity set](<images/Chapter7 Entity-Relationship Model/image.png>)

### 关系集

- 关系(relationship)：$t=(e_1,\ldots,e_n),e_1\in E_1,\ldots,e_n\in E_n$，是一种多个实体之间的联系
- 关系集(relationship set)：$L\subseteq E_1\times E_2\ldots \times E_n$，是一种多个实体之间的数学关系，关系集本身也可以有属性
![Attribute of  Relationship Sets](<images/Chapter7 Entity-Relationship Model/image-1.png>)

#### 关系集的度(Degree)

- 二元关系涉及两个实体集（或度为2）。
- 在数据库系统中，大多数关系集是二元的。
- 两个以上实体集之间的关系很少见。
- 大多数关系是二元的（稍后详细讨论）。
- 例如：学生在指导教师的指导下参与研究项目。
- 关系 proj_guide 是指导教师、学生和项目之间的三元关系。

#### 属性

- 实体由一组属性表示，这些属性是实体集的所有成员所具有的描述性特征。
  - 例如：
    - 指导教师 = (ID, 姓名, 街道, 城市, 薪水)
    - 课程 = (课程ID, 标题, 学分)
- 域（Domain）- 每个属性允许的值的集合。
- 属性类型：
  - 简单(Simple)属性和复合(Composite)属性。
  - 单值(Single-valued)属性和多值(multivalued)属性
    - 例如：多值属性：phone_numbers
  - 派生(Derived)属性：可以从其他属性计算得出
    - 例如：年龄，根据出生日期计算得出

#### 映射基数约束( Mapping Cardinality Constraints)

- 表达通过关系集可以将另一个实体关联到的实体数量。
- 在描述二元关系集时最有用。
- 对于二元关系集，映射基数必须是以下类型之一：
  - 一对一
  - 一对多
  - 多对一
  - 多对多
![Mapping Cardinalities](<images/Chapter7 Entity-Relationship Model/image-2.png>)
![Mapping Cardinalities](<images/Chapter7 Entity-Relationship Model/image-3.png>)

#### 键(Keys)

- 实体集的超键(super key)是一组一个或多个属性，其值可以唯一确定每个实体。
- 实体集的候选键(candidate key)是最小的超键。
  - ID 是指导教师的候选键。
  - course_id 是课程的候选键。
- 虽然可能存在多个候选键，但会选择其中一个候选键作为主键( primary key)。

$$\begin{aligned}
&r\subseteq E_1\times E_2 \\
&E_{1},E_{2}\colon\text{ entity sets involved;} \\
&p_i:E_i'\text{s primary key} \\
&d_1,d_2{:\text{descriptive attributes of }}\;R . \\
&\Rightarrow  \\
&r=(p_1,p_2,d_1,d_2)
\end{aligned}$$

- 例如$r=(s\_ID,I\_ID,date)$，那么哪个是主键？
  - 多对多，主键是 $(p_1, p_2)$
  - 一对多，主键是 $p_2$。
  - 一对一 主键是 $p_1$ 或 $p_2$。

#### 冗余属性(Redundant Attributes)
假设我们有以下实体集和关系：
- instructor，包括属性 ID、姓名、部门名和薪水。
- department，包括属性部门名、建筑和预算。
- 关系 inst_dept，关联 instructor 和 department。
- 实体 instructor 中的属性部门名是冗余的，因为已经存在一个明确的关系 inst_dept，将教师与部门关联起来。
  - 该属性复制了关系中存在的信息，应从 instructor 中删除。
  - 但是：在某些情况下，在转换回表格时，该属性可能会重新引入，我们将在后面看到。

## E-R图

![E-R图](<images/Chapter7 Entity-Relationship Model/image-4.png>)
- 矩形表示实体集。
- 菱形表示关系集。
- 实体矩形内列出属性。
- 下划线表示主键属性。

![Entity With Composite, Multivalued, and Derived Attributes](<images/Chapter7 Entity-Relationship Model/image-5.png>)
![Relationship Sets with Attributes](<images/Chapter7 Entity-Relationship Model/image-6.png>)
![E-R Diagram with a Ternary Relationship](<images/Chapter7 Entity-Relationship Model/image-14.png>)
### 角色(Role)
![Role](<images/Chapter7 Entity-Relationship Model/image-7.png>)
- 关系的实体集不一定是不同的。
- 每个实体集的出现在关系中扮演一个"角色"。"course_id"和"prereq_id"这些标签被称为角色。

### 基数约束(Cardinality Constraints)

- 我们通过在关系集和实体集之间绘制有向线（$\rightarrow$）表示“一”或无向线（$——$）表示“多”。来表达基数约束。
- 一对一关系：
  - 一个学生和他的学生证。
![One-to-One Relationship](<images/Chapter7 Entity-Relationship Model/image-8.png>)
![One-to-Many Relationship](<images/Chapter7 Entity-Relationship Model/image-9.png>)
![Many-to-One Relationships](<images/Chapter7 Entity-Relationship Model/image-10.png>)
![Many-to-Many Relationship](<images/Chapter7 Entity-Relationship Model/image-11.png>)
![ Participation of an Entity Set in a Relationship Set](<images/Chapter7 Entity-Relationship Model/image-12.png>)
![Alternative Notation for Cardinality Limits](<images/Chapter7 Entity-Relationship Model/image-13.png>)
- 对于三元（或更高度）关系，我们最多允许从关系中有一个箭头出去，以表示基数约束。
- 例如，从 proj_guide 到 instructor 的箭头表示每个学生至多有一个项目导师。
- 如果有多个箭头，有两种定义含义的方式。
  - 例如，A、B 和 C 之间的三元关系 R，带有指向 B 和 C 的箭头，可能意味着：
    1. 每个 A 实体与 B 和 C 的唯一实体相关联。
    2. 每对 (A, B) 实体与唯一的 C 实体相关联，并且每对 (A, C) 实体与唯一的 B 相关联。
  - 不同的形式主义使用了每种不同的定义方式。
  - 为避免混淆，我们禁止多个箭头的情况。

## 弱实体集(Weak Entity Sets)

- 没有主键的实体集被称为弱实体集。
- 弱实体集的存在依赖于标识实体集的存在。
- 标识联系（identifying relationship）：
  - 弱实体集 ---> 标识实体集
  - 多对一关系
  - 弱实体集完全参与关系
- 使用双钻石来表示标识联系。
- 弱实体集的鉴别器（或部分键）是区分弱实体集中所有实体的属性集。
- 弱实体集的主键由以下形式组成：（标识实体集的主键，弱实体集的鉴别器）
- 我们用虚线下划线标记弱实体集的鉴别器。
- 我们将弱实体的标识关系放在一个双钻石中。
- 课程章节的主键为：（课程ID，章节ID，学期，年份）
![Weak Entity Sets](<images/Chapter7 Entity-Relationship Model/image-15.png>)

:::info
- 强实体集的主键不会显式存储在弱实体集中，因为它在标识关系中是隐含的。
- 例如，课程章节（section）不包含课程ID。如果包含，则与sec_course的关系是多余的。
- 如果明确存储course_id，可以将section设置为强实体，但是这样就会通过course和section共有的course_id属性定义一个隐含的关系，导致section和course之间的关系重复
:::

## 关系模式的转化(Reduction to Relation Schemas)

- 在实体集和关系集的图示中，它们可以统一地表示为代表数据库内容的关系模式。
- 符合E-R图的数据库可以表示为一组模式。
- 对于每个实体集和关系集，都有一个唯一的模式，其名称与相应的实体集或关系集相同。
- 每个模式都有一些列（通常对应属性），这些列具有唯一的名称。
- E-R  Diagram -> schemas 的基本步骤：
  1. entities -> schemas
  2. relationships -> schemas
  3. Optimization Remove redundancy schemas

//TODO还有部分要补充

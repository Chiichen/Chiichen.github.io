---
title: Chapter7 Entity-Relationship Model
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: Chiichen
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

- 二元关系涉及两个实体集（或度为 2）。
- 在数据库系统中，大多数关系集是二元的。
- 两个以上实体集之间的关系很少见。
- 大多数关系是二元的（稍后详细讨论）。
- 例如：学生在指导教师的指导下参与研究项目。
- 关系 proj_guide 是指导教师、学生和项目之间的三元关系。

#### 属性

- 实体由一组属性表示，这些属性是实体集的所有成员所具有的描述性特征。
  - 例如：
    - 指导教师 = (ID, 姓名, 街道, 城市, 薪水)
    - 课程 = (课程 ID, 标题, 学分)
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

$$
\begin{aligned}
&r\subseteq E_1\times E_2 \\
&E_{1},E_{2}\colon\text{ entity sets involved;} \\
&p_i:E_i'\text{s primary key} \\
&d_1,d_2{:\text{descriptive attributes of }}\;R . \\
&\Rightarrow  \\
&r=(p_1,p_2,d_1,d_2)
\end{aligned}
$$

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

## E-R 图

![E-R图](<images/Chapter7 Entity-Relationship Model/image-4.png>)

- 矩形表示实体集。
- 菱形表示关系集。
- 实体矩形内列出属性。
- 下划线表示主键属性。

![Entity With Composite, Multivalued, and Derived Attributes](<images/Chapter7 Entity-Relationship Model/image-5.png>)
![Relationship Sets with Attributes](<images/Chapter7 Entity-Relationship Model/image-6.png>)
![E-R Diagram with a Ternary Relationship](<images/Chapter7 Entity-Relationship Model/image-14.png>)
![E-R图示例](<images/Chapter7 Entity-Relationship Model/image-16.png>)

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
- 下图表示学生有且只有一名指导老师，而老师可以指导$0\ldots n$名学生
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
- 课程章节的主键为：（课程 ID，章节 ID，学期，年份）
  ![Weak Entity Sets](<images/Chapter7 Entity-Relationship Model/image-15.png>)

:::info

- 强实体集的主键不会显式存储在弱实体集中，因为它在标识关系中是隐含的。
- 例如，课程章节（section）不包含课程 ID。如果包含，则与 sec_course 的关系是多余的。
- 如果明确存储 course_id，可以将 section 设置为强实体，但是这样就会通过 course 和 section 共有的 course_id 属性定义一个隐含的关系，导致 section 和 course 之间的关系重复
  :::

## 关系模式的转化(Reduction to Relation Schemas)

- 在实体集和关系集的图示中，它们可以统一地表示为代表数据库内容的关系模式。
- 符合 E-R 图的数据库可以表示为一组模式。
- 对于每个实体集和关系集，都有一个唯一的模式，其名称与相应的实体集或关系集相同。
- 每个模式都有一些列（通常对应属性），这些列具有唯一的名称。
- E-R Diagram -> schemas 的基本步骤：
  1. entities -> schemas
  2. relationships -> schemas
  3. Optimization Remove redundancy schemas

### entities -> schemas

- 强实体集：$(A_1,A_2,\ldots,A_n)$，其中$A_1,A_2,\ldots,A_n$是实体集内的属性
- 弱实体集：$(A_1,A_2,\ldots,A_n,p)$，其中$A_1,A_2,\ldots,A_n$是实体集内的属性，$p$是识别强实体集的主键
  ![弱实体集转换示例](<images/Chapter7 Entity-Relationship Model/image-17.png>)

### relationships -> schemas

$$
\begin{aligned}
&r\subseteq E_1\times E_2 \\
&E_{1},E_{2}\colon\text{ entity sets involved;} \\
&p_i:E_i'\text{s primary key} \\
&d_1,d_2{:\text{descriptive attributes of }}\;R . \\
&\Rightarrow  \\
&r=(p_1,p_2,d_1,d_2)
\end{aligned}
$$

![relationships -> schemas示例](<images/Chapter7 Entity-Relationship Model/image-18.png>)

- 例如$r=(s\_ID,I\_ID,date)$，那么哪个是主键？
  - 多对多，主键是 $(p_1, p_2)$
  - 一对多，主键是 $p_2$。
  - 一对一 主键是 $p_1$ 或 $p_2$。

### 优化——删除冗余模式

- 主要就是$1:n$和$1:1$的模式下，在合并的时候选用那个$1$的键
- 例如：
  - $inst\_dept (ID, dept\_name) + instructor (ID, name, salary) \Rightarrow instructor ={ID, name, dept\_name, salary}$
  - $stud\_dept (ID, dept\_name) + student (ID, name, tot cred) \Rightarrow student={ID, name, dept\_name, tot cred}$
  - $course\_dept (course\_id, dept\_name) + course (course\_ id, title, credits) \Rightarrow course={course\_id, title, dept\_name, credits}$

### 复合和多值属性(Composite and Multivalued Attributes)

- 就是会把每个复合属性拆分到最底下，例如：
  ![复合和多值属性示例](<images/Chapter7 Entity-Relationship Model/image-20.png>)
- 就会拆分成:

```sql
CREATE TABLE instructor(ID,
 first_name, middle_initial, last_name,
 street_number, street_name,
  apt_number, city, state, zip,
 date_of_birth)
```

- 多值属性也是一样，例如把固定电话号码拆成区号+电话号码
- 特殊情况：例如下面的$time\_slot$，它除了主键只有一个属性，而且这个属性还是多值的，就可以考虑把这个属性拆分后放到关系里，形如$section(sec\_id,semester,year,start\_time,end\_time)$，而不是为这个实体集单独创建一个关系(缺点是不能对它有外键引用)
  ![特殊情况示例](<images/Chapter7 Entity-Relationship Model/image-21.png>)

## 设计问题(Design Issue)

- 实体集$or$属性：例如是把电话号码作为$instructor$的一个属性还是把它单独作为要给实体集？实体集的好处是能存储额外信息
- 实体集$or$关系集：可能的准则是指定一个关系集来描述实体之间发生的操作(action)
- 二元关系集$or$ $n$元关系集 虽然可以用许多不同的二元关系集替换任何非二元（$n$ 元，对于 $n > 2$）关系集，但 $n$ 元关系集更清楚地表明多个实体参与单一关系。
- 关系属性的放置，例如，属性日期作为顾问的属性或作为学生的属性

### 非二元关系转二元关系

- 如下图所示，在关系之间插入关系和实体集作为中间值，就可以实现转换：
  ![非二元关系转二元关系示例](<images/Chapter7 Entity-Relationship Model/image-22.png>)
- 还需要翻译约束(translate constraints)，但是翻译所有约束可能是不可能的，翻译模式中可能存在无法对应于 $R$ 的任何实例的实例

## 扩展 E-R 特性(Extended ER Features)

### 泛化与特化(Generalization and Specialization)

![泛化与特化示例图](<images/Chapter7 Entity-Relationship Model/image-23.png>)

- 可以基于不同特征对实体集进行多个特化。
  - 例如，除了教师与秘书之外，还可以有永久员工与临时员工的特化。
  - 每个具体的员工将是：
    - permanent_employee 或 temporary_employee 的成员之一，
    - 同时也是 instructor 或 secretary 的成员之一。
  - ISA 关系也被称为超类——子类关系。

#### 泛化

- 自底向上的设计过程
  - 将共享相同特征的多个实体集合并为一个较高级别的实体集。
- 特化和泛化是彼此简单的反转；它们在 E-R 图中以相同的方式表示。
- "特化"和"泛化"这两个术语可以互换使用。

#### 特化

- 自顶向下的设计过程；我们在实体集中指定与其他实体有区别的子分组。
- 这些子分组成为具有属性或参与关系的较低级别实体集，这些属性或关系不适用于较高级别的实体集。
- 用一个标有 ISA 的三角形组件来表示（例如，教师“是一个”人）。
- 属性继承(Attribute inheritance)
  - 一个较低级别的实体集继承了与其链接的较高级别实体集的所有属性和关系参与。

#### 对特化/泛化的设计约束

- 对于给定的较低级别实体集，约束哪些实体可以成为其成员。
  - 条件定义：
    - 例如，所有年龄超过 65 岁的顾客都是 seniorcitizen 实体集的成员；senior-citizen 是 person 的特化。
  - 用户定义：
    - 约束实体是否可以属于同一泛化中的多个较低级别实体集。
    - 不相交（Disjoint）：
      - 一个实体只能属于一个较低级别实体集。
      - 在 E-R 图中通过多个较低级别实体集连接到同一个三角形来表示。
      - 例如，一个人（超类）不能既是学生又是雇员。
    - 重叠（Overlapping）：
      - 一个实体可以属于多个较低级别实体集。
      - 例如，一个员工（超类）既是教学老师（子类）又是行政人员（子类）。
- 完整性约束 - 指定在泛化中，较高级别实体集中的实体是否必须属于至少一个较低级别实体集。
  - 全部（total）：实体必须属于较低级别实体集之一。
    - 例如，每个员工（超类）要么是教学人员（子类），要么是行政人员（子类）。
  - 部分（partial）：实体不必属于较低级别实体集之一。 - 例如，有些人（超类）既不是员工（子类）也不是学生（子类）。
    ![total & partial](<images/Chapter7 Entity-Relationship Model/image-24.png>)

### 聚合(Aggregation)

- 考虑之前我们看到的三元关系 proj_guide。
- 假设我们想记录学生在项目上由指导者评估的情况。

![聚合(Aggregation)示例 - 1](<images/Chapter7 Entity-Relationship Model/image-25.png>)

- 关系集 eval_for 和 proj_guide 表示了重叠的信息。
  - 每个 eval_for 关系对应一个 proj_guide 关系。
  - 然而，一些 proj_guide 关系可能没有对应的 eval_for 关系。
    - 因此，我们不能丢弃 proj_guide 关系。
- 通过聚合消除这种冗余。
  - 将关系视为抽象实体。
  - 允许关系之间的关系。
  - 将关系抽象成新的实体，避免引入冗余。
- 在不引入冗余的情况下，以下图表表示：
  - 一个学生由特定的教师指导在特定的项目上。
  - 一个学生、教师、项目的组合可能有一个关联的评估。

![聚合(Aggregation)示例 - 2](<images/Chapter7 Entity-Relationship Model/image-26.png>)

### 表示特化为模式(Representing Specialization as Schemas)

#### 方法一

- 为高级实体形成一个模式
- 为每个低级实体集形成一个模式，包括上层实体集的主键和局部属性

| schema   | attributes             |
| -------- | ---------------------- |
| person   | ID，name，street，city |
| student  | ID,tot_cred            |
| employee | ID，salary             |

- 缺点：获取有关员工的信息需要访问两个关系，即对应于低级别模式和高级别模式的关系。

#### 方法二

- 为每个实体集构建模式，包括所有本地和继承的属性。

| schema   | attributes                      |
| -------- | ------------------------------- |
| person   | ID，name，street，city          |
| student  | ID，name，street，city,tot_cred |
| employee | ID，name，street，city,salary   |

- 如果特化是完全的，泛化实体集（person）的模式不需要存储信息。
  - 可以定义为包含特化关系并集的“视图”关系。
  - 但是，外键约束可能仍然需要明确的模式。
- 缺点：对于既是学生又是员工的人，姓名、街道和城市可能会冗余存储。

## E-R 图设计

- 使用属性或实体集来表示对象。
- 判断实际世界概念最适合由实体集还是关系集来表示。
- 使用三元关系还是一对二元关系。
- 使用强实体集或弱实体集。
- 使用特化/泛化 - 有助于设计中的模块化。
- 使用聚合 - 可以将聚合实体集视为单个单位，而不必关心其内部结构的细节。

![E-R图中用到的图形符号 - 1](<images/Chapter7 Entity-Relationship Model/image-19.png>)
![E-R图中用到的图形符号 - 2](<images/Chapter7 Entity-Relationship Model/image-27.png>)

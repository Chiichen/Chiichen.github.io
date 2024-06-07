---
title: Chapter8 Relational Database Design
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: Chiichen
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

## 分解(decompose)

![Example](<images/Chapter8 Relational Database Design/image-2.png>)

- 如果分解后无法重建原始信息，那么就是有损分解(Lossy Decomposition)，反之则为无损分解(Lossless-Join Decomposition)
  ![有损分解](<images/Chapter8 Relational Database Design/image.png>)
  ![无损分解](<images/Chapter8 Relational Database Design/image-1.png>)
- 所以我们需要一个理论来告诉我们怎么合理的分解关系。好的分解要做到：
  1. 无损分解
  2. 依赖保存
- BCNF 分解可以保证无损，3NF 可以保证依赖保存，但是 3NF 无法保证没有冗余，因此需要在 BCNF 和 3NF 间权衡

## 第一范式(First Normal Form)

- 如果一个域的元素被认为是不可分割的单元，则该域是原子的。
- 非原子域的示例：
  - 名称集合，复合属性
  - 可以分解为部分的标识号，例如 CS101
- 如果关系模式 R 的所有属性的域都是原子的，则关系模式 R 符合第一范式。
- 非原子值会使存储变得复杂，并鼓励数据的冗余（重复存储）。
  - 例如：每个客户都存储了一组账户，每个账户都存储了一组所有者。
  - 我们假设所有关系都符合第一范式（并在第 22 章: 基于对象的数据库中重新讨论这一点）。

:::info 原子性

- 原子性实际上是与域的元素如何使用相关的属性。
- 例如，字符串通常被认为是不可分割的。
- 假设学生被赋予类似 SE0012 或 EE1127 的字符串形式的学号。
- 如果提取前两个字符来确定学院，那么学号的域就不是原子的。
- 这样做是一个坏主意：会导致信息被编码在应用程序而不是数据库中。
  :::

## 第二范式(Second Normal Form)

- 数据库表中不存在非关键字段对任一候选键的部分函数依赖，也即所有非关键字段都完全依赖于任意一组候选关键字。
- 2NF 的违例只会出现在候选键由超过一个字段构成的表中，因为对单关键字字段不存在部分依赖问题。

:::info 例子

给定关系模式的函数依赖集合如下：

1. $\{(\text{学号}, \text{课程名称}) \rightarrow (\text{姓名}, \text{年龄}, \text{成绩}, \text{学分})\}$

2. $\{(\text{课程名称}) \rightarrow (\text{学分})\}$

3. $\{(\text{学号}) \rightarrow (\text{姓名}, \text{年龄})\}$

在这个例子中，候选键只有一个，即$(\text{学号}, \text{课程名称})$，因此主键也是$(\text{学号}, \text{课程名称})$。

我们可以观察到，属性$\text{姓名}$、$\text{年龄}$和$\text{学分}$是部分依赖于主键的，而属性$\text{成绩}$是完全依赖于主键的。由于存在部分依赖关系，这个关系模式不满足第二范式。

为了使关系模式满足第二范式，我们需要进行分解，将属性$\text{姓名}$、$\text{年龄}$和$\text{学分}$从主关系模式中分离出来，形成新的关系模式。最终的关系模式可能如下：

关系模式 1: $(\text{学号}, \text{课程名称}, \text{成绩})$

关系模式 2: $(\text{课程名称}, \text{学分})$

关系模式 3: $(\text{学号}, \text{姓名}, \text{年龄})$

这样，每个关系模式都满足第二范式，并且保留了原始关系模式的函数依赖。

:::

## 函数依赖(Functional Dependencies)

- 函数依赖是对合法关系集合的约束条件。
- 要求某个属性集合的值唯一确定另一个属性集合的值。
- 函数依赖是对键的概念的一种推广。
- 定义为：$\alpha \rightarrow \beta$等价于
  1. $\alpha$是模式$(\alpha,\beta)$的`超码(super key)`
  2. 属性$\alpha$的取值决定$\beta$的取值
- 在函数依赖$\alpha \rightarrow \beta$中，如果$\beta \subseteq a$，我们就称它是`平凡(trivial)`的。因为对于任意的关系$R$它总是成立的。
  - 例如：$ID, name \rightarrow ID$ 是平凡的 $name \rightarrow name$ 也是平凡的
- 在函数依赖$\alpha \rightarrow \beta$中，如果对于$\alpha$的任何一个真子集$\alpha '$，都有$\alpha '\nrightarrow\beta$那么就称$\beta$对$\alpha$有完全函数依赖
- 在函数依赖$\alpha \rightarrow \beta$中，如果$\beta$不完全函数依赖于$\alpha$就称$\beta$对$\alpha$部分函数依赖

### 函数依赖与超键

- 当且仅当 $K \rightarrow R$，$K$ 是关系模式 $R$ 的超键。
- 当且仅当满足以下条件时，$K$ 是 $R$ 的候选键：

  - $K \rightarrow R$，并且
  - 对于任何 $\alpha \subset K$，都不满足 $\alpha \rightarrow R$。

- 函数依赖允许我们表达无法使用超键来表示的约束。考虑以下模式：
  $$inst\_dept (ID, name, salary, dept\_name, building, budget)$$
  - 我们期望以下函数依赖成立：
    $$
    \begin{array}{c}
    dept\_name \rightarrow building\\
    ID \rightarrow building
    \end{array}
    $$
  - 但我们不期望以下函数依赖成立：
    $$
    dept\_name \rightarrow salary
    $$

### 函数依赖的作用

我们使用函数依赖来进行以下操作：

- 检验关系是否在给定的函数依赖集合下合法。
  - 如果关系 $r$在函数依赖集合 $F$ 下是合法的，我们说 $r$ `满足(satisfy)` $F$。
- 指定对合法关系集的约束。
  - 如果在关系模式 $R$ 上的所有合法关系都满足函数依赖集合 $F$，我们说 $F$ 在模式 $R$上`成立(holds on)`。

注意：一个关系模式的特定实例可能满足一个函数依赖，即使该函数依赖不在所有合法实例上成立。
例如，$instructor$ 关系模式的一个特定实例可能恰好满足 $name \rightarrow ID$。

#### 无损连接与分解(Lossless-join Decomposition)

- 对于关系 $R = (R_1, R_2)$ 的情况，我们要求对于满足下式的所有可能的关系 r

$$
r=\Pi_{R1}(r)\bowtie \Pi_{R_2}(r)
$$

- 如果一个从$R$分解为$R_1$和$R_2$的分解的无损的，那么以下两个式子中至少有一个要在$F^+$中

$$\begin{aligned}&R_1\cap R_2\to R_1\\&R_1\cap R_2\to R_2\end{aligned}$$

- 上述是保证无损分解的充分条件。

### 函数依赖闭包

- $F^+$表示所有能从函数依赖$F$中推出的函数依赖闭包
- 如果两个函数依赖集的闭包相等，那么我们就说这两个函数依赖集是等价的
- 我们可以通过反复应用 Armstrong 公理（Armstrong's Axioms）来找到$F^+$，即$F$的闭包：
  - 自反性：如果$\beta$是$\alpha$的子集，那么$\alpha \rightarrow \beta$。
  - 扩充性：如果$\alpha \rightarrow \beta$，那么对于任意$\gamma$，都有$\gamma\alpha \rightarrow \gamma\beta$。
  - 传递性：如果$\alpha \rightarrow \beta$，且$\beta \rightarrow \gamma$，那么$\alpha \rightarrow \gamma$。
- 这些规则是完备(sound)的（生成所有成立的函数依赖）且合理(complete)的（仅生成实际成立的函数依赖）。
- 附加规则：
  - 并集规则：如果$\alpha \rightarrow \beta$成立且$\alpha \rightarrow \gamma$成立，则$\alpha \rightarrow \beta\gamma$成立。
  - 分解规则：如果$\alpha \rightarrow \beta\gamma$成立，则$\alpha \rightarrow \beta$和$\alpha \rightarrow \gamma$成立。
  - 伪传递性规则：如果$\alpha \rightarrow \beta$成立且$\gamma\beta \rightarrow \delta$成立，则$\alpha\gamma \rightarrow \delta$成立。
- 这些附加规则可以从 Armstrong 的公理推导出来，并且可以用于计算函数依赖的闭包。
  ![函数依赖闭包计算示例](<images/Chapter8 Relational Database Design/image-3.png>)

### 属性集闭包(Closure of Attribute Sets)

- 定义为：$\alpha^+=\{A\mid (\alpha \rightarrow A) \subseteq F^+\}$
- 也就是通过函数依赖确定$\alpha$可以决定的所有属性
  ![属性集闭包计算示例](<images/Chapter8 Relational Database Design/image-4.png>)

#### 属性集闭包与函数依赖

- 我们有关系：
  $$\alpha\rightarrow\beta\Leftrightarrow\beta\subseteq\alpha^{+}$$
- 因此可以通过计算属性集闭包来计算函数依赖

#### 属性集闭包与超键

- 我们有关系：
  $$\alpha\text{ is a superkey }\Leftrightarrow R\subseteq\alpha^{+}.$$
- 因此通过属性集可以确定$\alpha$是不是超键

#### 属性集闭包与函数依赖闭包

通过属性集闭包计算函数依赖闭包：

1. $F^+ \leftarrow F$
2. 对每个$\gamma \subseteq R$，计算$\gamma^+$
3. 对每个$S\subseteq \gamma^+$，计算$F^+\leftarrow\{\gamma\rightarrow S\}\cup F^+$
4. 输出$F^+$

## 规范化的目标

- 给定一个关系模式 R 和函数依赖集合 F，判断关系模式 R 是否处于“良好”的形式。
- 如果关系模式 R 不处于“良好”的形式，则将其分解为一组关系模式 $\{R_1, R_2,\ldots, R_n\}$，其中每个关系模式都处于良好的形式。
- 分解应该是无损连接（lossless-join）的分解，即通过连接分解后的关系能够恢复到原始关系模式。
- 最好的情况是分解应该是依赖保持的，即在分解后的每个关系模式上仍然能够保持原始的函数依赖关系。

## 规范覆盖(Canonical Cover)

- 规范覆盖（Canonical Cover）是指函数依赖集合中的一组“最小”等价函数依赖，它不包含冗余的依赖关系或冗余的依赖关系部分。函数依赖集$F$的规范覆盖记作$F_c$，它满足：
  - $F \Leftrightarrow F_c$
  - $F_c$ 中的每个函数依赖都不包含冗余属性。
  - $F_c$ 中每个函数依赖的左侧是唯一的，不会存在相同的左侧。不能有$\alpha_1 \rightarrow \beta_1$和$\alpha_1 \rightarrow \beta_2$只能有$\alpha_1 \rightarrow \beta_1\beta_2$
- 函数依赖集合中的依赖关系可能存在冗余的依赖关系，可以从其他依赖关系中推导出来。例如，在集合$\{A \rightarrow B, B \rightarrow C, A \rightarrow C\}$中，$A \rightarrow C$是冗余的。
- 函数依赖的部分可能也是冗余的。例如，在右侧的依赖集合$\{A \rightarrow B, B \rightarrow C, A \rightarrow CD\}$可以简化为$\{A \rightarrow B, B \rightarrow C, A \rightarrow D\}$；在左侧的依赖集合$\{A \rightarrow B, B \rightarrow C, AC \rightarrow D\}$可以简化为$\{A \rightarrow B, B \rightarrow C, A \rightarrow D\}$。
- 直观地说，规范覆盖是等价于函数依赖集合$F$的一组“最小”函数依赖，它不包含冗余的依赖关系或冗余的依赖关系部分。规范覆盖的目的是简化函数依赖集合，使其更加简洁和有效。

### 计算规范覆盖

- 计算函数依赖集合$F$的规范覆盖的步骤如下：
  - 重复以下步骤：
    1. 使用并集规则（union rule）替换$F$中的任何函数依赖，例如将函数依赖$\alpha_1 \rightarrow \beta_1$和$\alpha_1 \rightarrow \beta_2$替换为$\alpha_1 \rightarrow \beta_1\beta_2$。
    2. 查找具有冗余属性的函数依赖$\alpha \rightarrow \beta$，冗余属性可能存在于$\alpha$或$\beta$中。注意：对冗余属性的测试是使用$F_c$而不是$F$进行的
    3. 如果找到冗余属性，则从$\alpha \rightarrow \beta$中删除它。
  - 直到$F$不再发生变化为止。
- 需要注意的是，删除一些冗余属性后，可能会使并集规则再次适用，因此需要重新应用并集规则。
- 通过执行上述步骤，最终得到的函数依赖集合$Fc$就是原函数依赖集合$F$的规范覆盖。
  ![计算规范覆盖](<images/Chapter8 Relational Database Design/image-9.png>)

## 冗余属性(Extraneous Attributes)

- 冗余属性（Extraneous Attributes）是指在给定的函数依赖集合中，某个属性在依赖关系中是冗余的，可以被删除而不影响函数依赖的表达。

- 例如，给定函数依赖集合$F = \{A \rightarrow C, AB \rightarrow C\}$，我们要判断属性$B$是否是冗余的。通过删除属性$B$，得到新的依赖集合$H = \{A \rightarrow C\}$。如果满足$F \Leftrightarrow H$，那么属性$B$就是冗余的。

- 对于函数依赖集合$F$中的函数依赖$\alpha x \rightarrow \beta$，如果删除属性$x$后得到的新的函数依赖集合$H$满足$F \Leftrightarrow (F - \{\alpha x \rightarrow \beta\}) \cup \{\alpha \rightarrow \beta\}$，那么属性$x$就是冗余的。

- 需要注意的是，上述情况中，逆向的蕴含关系在每种情况下都是显而易见的，因为“更强”的函数依赖总是蕴含着“更弱”的函数依赖。

### 验证冗余属性

- 要检查一个属性$x$对于给定的$\alpha x \rightarrow \beta$和$F$是否是冗余的，方法一很显然，既然$\alpha$能推出右侧式子，那$x$就是冗余的
  1. 在$F$下计算$\alpha^+$
  2. 验证$\alpha^+\supseteq \beta$
- 方法二，利用$F \Leftrightarrow (F - \{\alpha x \rightarrow \beta\}) \cup \{\alpha \rightarrow \beta\}$：
  1. $F' = (F - \{\alpha x \rightarrow \beta\}) \cup \{\alpha \rightarrow \beta\}$
  2. 在$F'$下计算$\alpha^+$
  3. 验证$x\in \alpha^+$

## BCNF 范式(Boyce-Codd Normal Form)

- 关系模式 R 在 BCNF（Boyce-Codd 范式）中，如果对于$R$中的存在的所有函数依赖关系$F$，形式为$\alpha \rightarrow \beta$，其中$\alpha \subseteq R$且$\beta \subseteq R$，至少满足以下条件之一：
  - $\alpha \subseteq \beta$
  - $\alpha$是$R$的超键
- 换言之。BCNF 意味着在关系模式中每一个决定因素都包含候选键，也就是说，只要属性或属性组 A 能够决定任何一个属性 B，则 A 的子集中必须有候选键。BCNF 范式排除了任何属性(不光是非主属性，2NF 和 3NF 所限制的都是非主属性)对候选键的传递依赖与部分依赖。

- 示例中的关系模式不符合 BCNF：

$$
inst\_dept(ID，name，salary，dept\_name，building，budget)
$$

因为$dept\_name\rightarrow (building,budget)$在$inst\_dept$上成立，但$dept\_name$不是超键。

- 又例如：

  - 假设仓库管理关系表为$\text{StorehouseManage}(\text{仓库ID}, \text{存储物品ID}, \text{管理员ID}, \text{数量})$，且有一个管理员只在一个仓库工作；一个仓库可以存储多种物品。这个数据库表中存在如下决定关系：

  - $(\text{仓库ID}, \text{存储物品ID}) \rightarrow (\text{管理员ID}, \text{数量})$

  - $(\text{管理员ID}, \text{存储物品ID}) \rightarrow (\text{仓库ID}, \text{数量})$

  - 所以，$(\text{仓库ID}, \text{存储物品ID})$和$(\text{管理员ID}, \text{存储物品ID})$都是$\text{StorehouseManage}$的候选关键字（Candidate Key），表中的唯一非关键字段为数量，它是符合第三范式的。但是，由于存在如下决定关系：

  - $(\text{仓库ID}) \rightarrow (\text{管理员ID})$

  - $(\text{管理员ID}) \rightarrow (\text{仓库ID})$

  - 仓库 ID 是决定因素，但仓库 ID 不包含候选键。
  - 同样的，管理员 ID 也是决定因素，但不包含候选键。
  - 所以该表不满足 BCNF。

### 检查 BCNF

- 如何检查非平凡依赖关系$\alpha \rightarrow \beta$是否符合 BCNF？算法：
  1. 计算函数依赖的闭包 $\alpha^+$。
  2. 验证是否满足$R \subseteq \alpha^+$
- 如何检查关系模式 $R$ 是否符合 BCNF？算法：
  - 对于每个非平凡函数依赖 $\alpha \rightarrow \beta$，根据上面的算法检查是否满足
- 优点：
  - 不需要计算所有可能的函数依赖 $F^+$。

### 分解模式为 BCNF

- 如果我们有模式$R$和由非平凡依赖$\alpha \rightarrow \beta$导致的一个 BCNF 冲突，我们把$R$分解为
  - $R_1=(\alpha\cup\beta)$
  - $R_2=R-R_1+\alpha$

![分解模式为BCNF示例](<images/Chapter8 Relational Database Design/image-5.png>)

### BCNF 与依赖保留(BCNF and Dependency Preservation)

![BCNF与依赖保留例子](<images/Chapter8 Relational Database Design/image-6.png>)

- 设$F_i$为仅包含属性在关系$R_i$上的依赖集$F \cup F^+$的子集。
- 如果一个分解是依赖保持的（dependency preserving），则满足以下条件：
  $$(F_1 \cup F_2 \cup \ldots \cup F_n)^+ = F^+$$
- 如果不满足上述条件，那么检查违反函数依赖的更新可能需要计算连接操作，这是非常昂贵的。换句话说，如果分解不是依赖保持的，那么在更新操作中检查函数依赖的违规可能需要进行昂贵的连接计算。

![示例](<images/Chapter8 Relational Database Design/image-7.png>)

#### 验证依赖保留

![验证依赖保留](<images/Chapter8 Relational Database Design/image-8.png>)

#### 缺点

- 在某些情况下，BCNF 不具备依赖保持性，并且在更新操作中高效地检查函数依赖的违规非常重要。
- 解决方案是定义一个较弱的规范形式，称为第三范式（3NF）。
- 第三范式允许一定程度的冗余（带来相关问题；我们将在稍后看到示例），但可以在单个关系上检查函数依赖，而无需计算连接操作。
- 总是存在一种无损连接、依赖保持的分解，使其满足第三范式。

## 第三范式(Third Normal Form)

- 在第二范式的基础上，数据表中如果不存在非关键字段对任一候选关键字段的传递函数依赖则符合第三范式
- 一个关系模式 R 在第三范式（3NF）中，如果对于 F 中的所有$\alpha \rightarrow \beta$，至少满足以下条件之一：
  - $\alpha \subseteq \beta$
  - $\alpha$是$R$的超键
  - $\beta-\alpha$中的每个属性$A$都包含在$R$的候选键中（注意：每个属性可能在不同的候选键中）
- 如果一个关系符合 BCNF，那么它也符合 3NF（因为在 BCNF 中，上述的前两个条件之一必须成立）。
- 第三个条件是 BCNF 的最小放宽，以确保依赖性的保持（稍后会看到为什么）。
- 例子：

  - 表：$(\text{学号}, \text{姓名}, \text{年龄}, \text{所在学院}, \text{学院地点}, \text{学院电话})$

  - 该表中候选字段只有“学号”，于是“学号”做主键。由于主键是单一属性，所以不存在非主属性对主键的部分函数依赖的问题，所以必然满足第二范式。但是存在如下传递依赖：

  - $(\text{学号}) \rightarrow (\text{所在学院}) \rightarrow (\text{学院地点}, \text{学院电话})$

  - 学院地点和学院电话传递依赖于学号，而学院地点和学院电话都是非关键字段，即表中出现了“某一非关键字段可以确定出其他非关键字段”的情况，于是违反了第三范式。

### 检查第三范式

- 给定关系模式$R$和函数依赖集合$F$，测试$R$是否符合第三范式（3NF）的算法如下：
  对于每个非平凡的函数依赖$\alpha \rightarrow \beta$：

  - 检查$\alpha$是否是超键（superkey）：$\alpha^{+}\supseteq R$
  - 如果$\alpha$不是超键，则需要验证$\beta$中的每个属性是否包含在$R$的候选键中。
    - 这个测试相对来说更加昂贵，因为它涉及到候选键的查找。

- 有趣的是，测试是否符合第三范式已被证明是 NP 困难问题的。然而，将关系分解为第三范式（稍后会进行描述）可以在多项式时间内完成。

### 分解为第三范式

步骤：

1. 计算规范覆盖$F_c=\{\alpha_1 \rightarrow\beta_1,\alpha_2\rightarrow\beta_2,\ldots,\alpha_n\rightarrow\beta_n\}$
2. 生成新关系$R_1=\alpha_1\beta_1,R_2=\alpha_2\beta_2,\ldots ,R_n=\alpha_n\beta_n$
3. 找到$R$的候选键：$\gamma_1,\gamma_2,\ldots,\gamma_m$
4. 如果没有模式$R_j$包含$R$的候选键，那么生成一个新的模式$R_{n+1}=\gamma_1$
5. 输出$R_1,R_2,\ldots,R_{n+1}$(可选)

- 为什么 3NF 是依赖保存的：因为每一个依赖$\alpha \rightarrow \beta$都有一个模式$(\alpha,\beta)$专门保存
  ![分解为第三范式示例1-1](<images/Chapter8 Relational Database Design/image-10.png>)
  ![分解为第三范式示例1-2](<images/Chapter8 Relational Database Design/image-11.png>)
  ![分解为第三范式示例1-3](<images/Chapter8 Relational Database Design/image-12.png>)
  ![分解为第三范式示例2](<images/Chapter8 Relational Database Design/image-13.png>)

:::info 3NF VS BCNF

- 总是可以将一个关系分解为一组符合第三范式（3NF）的关系，满足以下条件：

  - 分解是无损的，即通过连接分解后的关系能够恢复到原始关系。
  - 依赖关系得到保留，即分解后的每个关系仍然能够保持原始的函数依赖关系。

- 总是可以将一个关系分解为一组符合 BCNF（Boyce-Codd 范式）的关系，满足以下条件：

  - 分解是无损的，即通过连接分解后的关系能够恢复到原始关系。
  - 可能无法保留所有的依赖关系，即在分解后的关系中，可能无法保持原始的所有函数依赖关系。

- 换句话说，对于 3NF，我们可以找到一组关系进行分解，使得分解后的关系满足 3NF 并且保留依赖关系。而对于 BCNF，我们可以找到一组关系进行分解，使得分解后的关系满足 BCNF，但不一定能保留所有的依赖关系。

|      | 无损分解? | 依赖保留？ | 移除冗余？ |
| ---- | --------- | ---------- | ---------- |
| BCNF | Y         | N          | Y          |
| 3NF  | Y         | Y          | N          |

:::

### 第三范式的冗余

在第三范式中，确实存在一些冗余问题。

以下是一个示例，展示了第三范式中冗余可能导致的问题：
假设关系模式为$R = (J, K, L)$，函数依赖集合为$F = \{JK \rightarrow L, L \rightarrow K\}$。

| J    | K   | L    |
| ---- | --- | ---- |
| j1   | k1  | l1   |
| j2   | k1  | l1   |
| j3   | k1  | l2   |
| null | k2  | null |

在上述示例中，存在信息的重复（例如，l1 与 j1、k1 之间的关系重复出现）。同时，为了表示没有对应值的关系，使用了空值（例如，表示 j3、k2 与 l2 之间没有对应值的关系）。

此外，如果没有单独的关系将教师与部门进行映射，可能需要使用空值来表示（例如，(i_ID, dept_name)中的记录，当没有对应的关系时）。

以上是第三范式中可能出现的冗余问题的示例。

## 数据库设计

- 关系数据库设计的目标是：
  - 满足 BCNF（Boyce-Codd 范式）。
  - 保证无损连接。
  - 保持依赖关系。
- 如果无法同时满足这些目标，我们需要接受以下之一：
  - 缺乏依赖关系的保持。
  - 由于使用了 3NF（第三范式）而导致的冗余。
- 有趣的是，SQL 并没有直接提供指定函数依赖关系的方法，除了超键（superkey）之外。虽然可以使用断言来指定函数依赖关系，但是这种方法在测试上是昂贵的，并且目前没有任何广泛使用的数据库支持它们。
- 即使我们有一个保持依赖关系的分解，使用 SQL 也无法有效地测试左侧不是关键字的函数依赖关系。

### 非规范化以提高性能

可能希望为了提高性能而使用非规范化的模式，例如，显示课程 ID 和标题以及先决条件需要将课程表与先决条件表进行连接。

- 备选方案 1：使用包含课程属性和先决条件属性的非规范化关系，具有上述所有属性。
  - 查找速度更快。
  - 更新时需要额外的空间和执行时间。
  - 程序员需要额外编码工作，并可能在额外的代码中出现错误。
- 备选方案 2：使用定义为"course prereq"的物化视图。
  - 利弊与上述相同，但程序员无需额外编码工作，并避免可能出现的错误。

## 第四范式(Fourth Normal Form)

![Why Fourth Normal Form - 1?](<images/Chapter8 Relational Database Design/image-14.png>)
![Why Fourth Normal Form - 2?](<images/Chapter8 Relational Database Design/image-15.png>)
![Why Fourth Normal Form - 3?](<images/Chapter8 Relational Database Design/image-16.png>)

- 一个关系模式 $R$ 相对于函数依赖集合 $D$ 来说，如果对于 $D^+$ 中的所有形如 $\alpha \rightarrow \beta$ 的多值依赖，其中 $\alpha \subseteq R$ 且 $\beta \subseteq R$，至少满足以下条件之一，那么关系模式 $R$ 是符合第四范式（4NF）的：

  - $\alpha \rightarrow \beta$ 是平凡的（即 $\beta \subseteq \alpha$ 或 $\alpha \cup \beta = R$）。
  - $\alpha$ 是关系模式 $R$ 的超键。

- 如果一个关系模式符合第四范式（4NF），那么它也符合 BCNF（Boyce-Codd 范式）。
  $4NF\subset BCNF \subset 3NF \subset 2NF \subset 1NF$

:::info 范式之间的关系
第一范式(1NF)
非码的非平凡 | ↓ 消除非主属性对码的部分函数依赖
第二范式(2NF)
↓ 消除非主属性对码的传递函数依赖
第三范式(3NF)
↓ 消除主属性对码的部分和传递函数依赖
BC 范式(BCNF)
↓ 消除非平凡且非函数依赖的多值依赖
第四范式(4NF)
↓ 消除不是由候选码所蕴含的连接依赖
第五范式(5NF)

:::

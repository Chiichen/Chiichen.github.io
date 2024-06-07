---
title: Chapter5 语法生成
# cover: /assets/images/cover1.jpg

icon: page
order: 1
author: Chiichen
date: 2023-10-11
category:
  - 课程笔记
tag:
  - 编译原理
sticky: true
star: false
footer:
copyright: 转载请注明出处
isOriginal: true
---

# Chapter5 代码生成

## 介绍

- 代码生成取决于：源代码、目标系统体系结构、运行时环境
- 代码生成可以被划分为三步：

1.  生成中间代码(IR Iermediate code 码)
2.  生成某种汇编形式的代码，而不是真正的可执行代码
3.  优化目标代码

## 中间代码

- 以三地址码(TAC Three Address code)为例

### 生成三地址码

#### 运算

![[TAC_Code1.png]](./images/代码生成/TAC_Code1.png)

#### 变量赋值

![[TAC_Instruction.png]](./images/代码生成/TAC_Instruction.png)

#### 布尔值

![[TAC_Code2.png]](./images/代码生成/TAC_Code2.png)

#### 流程控制语句

![[TAC_Code3.png]](./images/代码生成/TAC_Code3.png)
![[TAC_Code4.png]](./images/代码生成/TAC_Code4.png)

### 三地址码的实现

- 有四元组和三元组实现，一般都用四元组实现，因为利于后面进行进一步的优化

#### 四元组实现

- 用$(op,operand1,operand2,operand3)$来表示一个三地址指令，用$\_$来表示缺省的操作数
- 例如$t2=fact*x\rightarrow (mul,fact,x,\_ t2)$ ,$label\;L2\rightarrow (lab,L2,\_,\_)$

#### 三元组实现

- 用指令的地址来替换掉一个返回值变量来压缩掉一个变量
- 例如$t2=fact*x \rightarrow (4)(mul,fact,x)$$fact=t2\rightarrow (5)(asn,(4),fact)$

#### 区别

- 三元组比较高效，因为空间占用减少了，并且编译器不需要为临时变量生成名称
- 三元组使用指令索引来表示临时值，那么它们的位置的任何移动都变得困难。 四元组更适合优化

### 生成三地址码的细节

#### 综合属性

$$
\begin{aligned}
&\text{exp}\to\text{id}=\text{exp}\big|\text{aexp} \\
&\text{aexp}\to\text{aexp+factor}\mid\text{factor} \\
&\text{factor}\to\text{(exp)}\mid\text{num}\mid\text{id}
\end{aligned}
$$

![[综合属性语义规则1.png]](./images/代码生成/综合属性语义规则1.png)
![[综合属性语义规则2.png]](./images/代码生成/综合属性语义规则2.png)
![[综合属性语义分析.png]](./images/代码生成/综合属性语义分析.png)

#### 语言结构

##### If

$$
\begin{aligned}
\text{if-stmt}& \to\text{if}\text{(exp)}\;\text{stmt}  \\
&|\text{if}(\text{exp})\;\text{stmt else stmt}
\end{aligned}
$$

$$
\begin{aligned}
&\text{<code to evaluate E to t1>} \\
&\text{if}\_\text{false t1 goto L1} \\
&\text{<code for S1>} \\
&\text{goto L2} \\
&\text{label L1} \\
&\text{<code for S2>} \\
&\text{label L2}
\end{aligned}
$$

###### $S\to\text{if E then S1}$

![[if结构.png]](./images/代码生成/if结构.png)

$$
\begin{aligned}
&\text{E.true}=\text{newlabel ();} \\
&\text{E.false}=\text{S.next;} \\
&\text{S.code}=\text{E.code}++\text{Label E.true}++\text{S1.code}
\end{aligned}
$$

###### $S\to\text{if E then S1 else S2}$

![[if-else结构.png]](./images/代码生成/if-else结构.png)

$$
\begin{aligned}
&\text{E.true=newlabel};\text{E.false=newlabel}; \\
&\text{S1.next=S.next};\text{S2.next=S.next;} \\
&\text{S.code=E.code}++\text{LabelE.true}++S1.\text{code}++\text{goto S.next}++ \\
&\text{Label E.false++S2.code}
\end{aligned}
$$

##### While

$$\text{while-stmt}\to\text{while}(\exp)\text{stmt}$$

$$
\begin{aligned}
&\text{label L1} \\
&\text{<code to evaluate E to t1>} \\
&\text{if}\_\text{false t1 goto L2} \\
&\text{<code for S>} \\
&\text{goto L1} \\
&\text{label L2}
\end{aligned}
$$

###### $\text{S}\to\text{while E do S1}$

![[while结构.png]](./images/代码生成/while结构.png)

$$
\begin{aligned}
&\text{S.begin=newlabel};\text{E.true=newlabel};\text{E.false=S.next;} \\
&\text{S1.next=S.begin;} \\
&\text{S.code=Label S.beginin}++\text{E.code}++\text{Label E.true}++\text{S1.code} \\
&\text{++goto S.begin}
\end{aligned}
$$

##### 布尔表达式

- 布尔表达式有两个主要作用，一个是用来计算逻辑值，另一个是用在 if 或 while 等语句中作为条件控制。
  $$
  \begin{gathered}
  \text{E}\to\text{E or E}\mid\text{E and E}\mid\text{not E}\mid\text{(E)} \\
  \big|\text{id relop id}\big|\text{true}\big|\text{false} \\
  relop:关系运算符(\ge,\le,\lt,\gt,=,\neq)
  \end{gathered}
  $$
- 例如$\text{a or b and not c}$ 就会被翻译成
  $$
  \begin{aligned}
  &\text{\_t1} =\text{not c}  \\
  &\text{\_t2} =\text{b and t1}  \\
  &\text{\_t3} = \text{a or t2}
  \end{aligned}
  $$

###### $\text{E}\to\text{E1 or E2}$

![[or结构.png]](./images/代码生成/or结构.png)

$$
\begin{aligned}
&\text{E1.true=E.true;} \\
&\text{E1.false=newlabel;}  \\
&\text{E2.true=E.true;} \\
&\text{E2.false=E.false;} \\
&\text{E.code=E1.code++label E1.false++E2.code}
\end{aligned}
$$

###### $\text{E}\to \text{E1 and E2}$

![[and结构.png]](./images/代码生成/and结构.png)

$$
\begin{aligned}
&\text{E1.true=newlabel;} \\
&\text{E1.false=E.false;} \\
&\text{E2.true=E.true;} \\
&\text{E2.false=E.false;} \\
&\text{E.code=E1.code++ Label E1.true++ E2.code}
\end{aligned}
$$

###### $\text{E}\to \text{not E1}$

$$
\begin{gathered}
\text{E1.true=} \text{E.false;} \\
\text{E1.false=} \text{E.true;} \\
\text{E.code=E1.code;}
\end{gathered}
$$

###### 例子

![[布尔表达式例子.png]](./images/代码生成/布尔表达式例子.png)

##### 流程控制与布尔表达式翻译

- 流程控制的语法(其中$E$为布尔表达式)：
  $$
  \begin{aligned}
  S\to&\text{if E then S1} \\
  & \text{| if E then S1 else S2} \\
  &\text{| while E do S1}
  \end{aligned}
  $$
- 在流程控制中，布尔表达式的值不再是由临时变量来表示并存储，而是用程序跳转的位置来表示。

###### 例子

```c
while a<b do
  if c<d then
    x=y+z
  else
    x=y-z
```

![[流程控制示例图.png]](./images/代码生成/流程控制示例图.png)

## 代码优化

### 常见的优化

#### 寄存器优化

- 通过提高程序运行时的缓存命中率来提高运行速度

#### 冗余的操作

##### 相同的子表达式

$$
\begin{aligned}
\text{(1)T}_1&= 4*\text{I}  \\
\text{(2)}\text{T}_2&= \text{addr(A)-4}  \\
\text{(3)T}_3&= \text{T}_2[\text{T}_1]  \\
\text{(4)T}_4&=4*\text{I}\rightarrow(4)\mathrm T_4:=\mathrm T_1\\
\\

\end{aligned}
$$

##### 没有用到的变量

$$
\begin{aligned}
&\text{(1)I}=1 \\
&\text{(2)}\text{T}_1=4   \\
&\text{(3)T}_3=\text{T}_2[\text{T}_1] \\
&\text{(4)} \text{T}_4=\text{T}_1 \\
&\text{(5)I}=\text{I}+1 \\
&\mathrm{(6)T_1=T_1+4} \\
&(7)\text{if T}_1\text{≤80 goto (3)}\\
\end{aligned}
$$

- (1)、(4)、(5)都是无用代码，于是可以化简成

$$
\begin{aligned}
& \text{(2)}\text{T}_1:=4  \\
&(3)T_3:=T_2[T_1] \\
&(6)T_1:=T_1+4 \\
&(7)\text{if T}_1\leq80\text{ goto}(3)
\end{aligned}
$$

##### 消除死代码

$$\text{if(E) do stmt}$$

- 如果$E$的值恒为$\text{false}$ ，那么$\text{stmt}$将永远不会执行，也就是所说的死代码

#### 耗时的操作

##### 乘法与移位

- 把乘二优化成向左移位

#### 常量优化

##### 常量折叠

$a=2+3\rightarrow a=5$

##### 常量传播

$a=2;b=3;c=a+b\rightarrow c=5$

#### 内联展开和尾递归

![[尾递归优化.png]](./images/代码生成/尾递归优化.png)

### 优化的时期

- 三地址码生成时：直接优化语义树，可能对某个子树进行删除或者替换
- 三地址码生成后：很多时候，从语法树上获取不到足够的信息来进行优化，这时候就要在中间代码上进行优化
- 目标代码生成时：有可能要对某个特定的指令集进行优化又被称为窥孔优化(peephole optimization)，在编译器理论中，窥孔优化是一种在生成的代码段中对非常小的指令集合执行的优化。该集合称为“窥孔”或“窗口”

### 优化的范围

#### 局部优化(Local Optimizations)

- 局部优化适用于直线代码段，即没有跳入或跳出序列的代码序列。一个最大的直线代码序列被称为一个基本块(basic block)。局部优化就是被限制在一个基本块中

#### 全局优化(Global Optimizations)

- 优化超出了基本块的范围，但仅限于单个过程。
- 循环是很重要的优化位置，尤其是内部循环。

##### Code motion

- 代码移动减少了循环中的代码量，就是把循环内的和循环无关的代码移动到循环外
  ![[代码移动.png]](./images/代码生成/代码移动.png)

##### Induction variables deletion

- 归纳变量（Induction Variable）是指在循环的每次迭代中都会增加或减少固定数量的变量，或者是另一个归纳变量的线性函数。归纳变量通常用于循环优化中，例如循环展开和代码移动。

![[删除.png]](./images/代码生成/删除.png)

#### 线程间优化（Interprocedural optimization)

- 超出单个线程的范围，对整个程序进行优化

### 优化的工具

### Flow graph

1. 第一个指令是一个 basic block 的开始
2. 每个作为 jump 的目标的 label 的语句是一个新的 basic block 的开始
3. 每个跟着有条件跳转的指令都会开启一个新的 basic block (跟 2 差不多)
   ![[flowgraph.png]](./images/代码生成/flowgraph.png)

#### DAG(directed acyclic graph)

- DAG 跟踪在 basic block 中发生的计算和重新赋值
- 叶子节点是从这个 block 之外来的变量和值
- 内部节点都是对值的操作
- 赋值被表现为把目标变量或临时变量 attach 到这个节点上
  ![[DAG1.png]](./images/代码生成/DAG1.png)

- 基本块的开始标签和最后的跳转标签不被包括在 DAG 中
- 复制操作不会增加新的节点，誓师会把新的标签添加到被复制值的节点上
- 对相同值的重复使用也会被体现在 DAG 中

##### 几种情况

- 对于 x=y+z，如果 y 和 z 不变，则+的内部节点不需要创建，而是执行 y+z （常量折叠）
- 对于 x=y+z，如果已经存在一个与 y+z 具有相同值的节点，我们不会创建新节点，而是给现有节点附加标签 x。 （局部公共子表达式消除）
- 如果 x 之前标记过其他节点，我们删除该标签，因为 x 的“当前”值是刚刚创建的节点（消除不必要的分配）
  ![[DAG2.png]](./images/代码生成/DAG2.png)
  ![[DAG3.png]](./images/代码生成/DAG3.png)

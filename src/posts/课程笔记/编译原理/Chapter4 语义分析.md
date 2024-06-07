---
title: Chapter4 语义分析
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

# Chapter4 语义分析

## 目录

## 介绍

- 语义分析核心是类型检查(Type check)和作用域检查(Scope check)
- 语义通过属性的值来刻画
- 通过一系列属性等式来进行计算，按照一定的顺序进行计算

## Recursive AST Walk

- 一种语义分析的实现方法，本书暂时不表

## Attribute Grammars

### 语法制导的语法分析(Syntax-Directed Semantics Analysis )

- 又称 SDS、SDT、SDD
- 属性是附着在文法符号上的

#### 属性(Attribute)

- CFG 中的所有文法符号$X$都用属性以描述，把某个属性$a$ 表示为$X.a$

##### 属性等式(Attribute Equation)

- 又叫语义规则(Semantic Rule)
- 给定属性 集合$a_1 ，... ,a_k$
- 对于每个语法规则$X_0→X_1X_2...X_n$，每个语法符号$X_i$ 的属性 $X_i.a_j$ 的值与规则中其他符号的属性值相关
- 属性等式就是如下格式
  $$X_i.a_j = f_{ij} (X_0 .a_1,...,X_0.a_k,X_1 .a_1,... ,X_1.a_k,...,X_n.a_1,...,X_n.a_k)$$

##### 属性文法

- 通常是以下格式：

| Grammar Rule | Semantic Rules                 |
| ------------ | ------------------------------ |
| Rule1        | Associated attribute equations |
| ...          |                                |
| Rule n       | Associated attribute equations |

###### 无符号数和数字属性

![[属性示意图.png]](./images/语法分析/属性示意图.png)
![[无符号数和数字属性.png]](./images/语义分析/无符号数和数字属性.png)

###### 变量声明和数据类型属性

![[变量声明和数据类型属性1.png]](./images/语义分析/变量声明和数据类型属性1.png)
![[变量声明和数据类型属性2.png]](./images/语义分析/变量声明和数据类型属性2.png)

###### 类型检查与表达式的类型属性

![[类型检查与表达式的类型属性.png]](./images/语义分析/类型检查与表达式的类型属性.png)

#### 属性计算

- 属性计算可以在分析树构建完成后进行，也可以在分析的过程中同时进行。

##### 属性计算的算法

1. 依赖图的生成和计算顺序的确定

   - 每一个属性等式对应一个依赖图(有向图，边代表属性值计算的计算依赖顺序)
   - 多个属性等式构成一个组合依赖图，通过这个附着在抽象语法树或者分析树的依赖图可以对计算次序进行计算

2. 综合(Synthesized)属性和继承(Inherited)属性

   - 综合属性：属性由子节点属性决定(如果所有属性都是综合属性，那这个文法是一个综合属性文法 S-attributed grammar)，在 bottom-up 的过程中，可以边分析边计算属性(从叶子节点生成父节点)
   - 继承属性：属性由兄弟节点或兄弟和子节点属性决定(不是综合就是继承)

3. 在分析的过程中计算属性

   - 属性计算的困难：
     - 属性语法是一种抽象规范，属性方程可以按任意顺序编写而不影响其有效性，它们不指定属性计算的顺序
     - 问题主要在于找到*属性计算和分配的顺序*，以确保每次计算中使用的所有属性值在执行每次计算时都可用
     - 属性方程本身表明属性计算的顺序约束。 我们将使用*依赖图*来明确顺序约束

##### 依赖图和计算顺序

- 依赖图：
  - 每个符号的每个属性 $X_i.a_j$ 对应一个节点
  - 对于每个属性方程 $X_i.a_j=f_{ij}(…,X_m.a_k,…)$ 都有一条从右侧的每个节点 $X_m.a_k$ 到节点 $X_i.a_j$ 的边（表示 $X_i.a_j$ 对 $X_m.a_k$ 的依赖关系)

![[依赖图和计算顺序1.png]](./images/语义分析/依赖图和计算顺序1.png)
![[依赖图和计算顺序2.png]](./images/语义分析/依赖图和计算顺序2.png)

- 我们通常把依赖图直接叠加绘制在分析树上

![[依赖图和计算顺序3.png]](./images/语义分析/依赖图和计算顺序3.png)

###### 综合属性

- 如果解析树中的所有依赖项都从子级指向父级，那么就是综合属性。
- 等价地，如果给定语法规则 $A → X_1X_2…X_n$，左侧带有 $a$ 的*唯一*(不能存在另一个可能为从非子节点获取属性的属性方程)关联属性方程的形式为以下所示，那么$a$就是综合属性
  $$A.a=f(x_1.a_1,..X_1.a_k,…,X_n.a_1,…X_n.a_k)$$
  ![[综合属性定义.png]](./images/语义分析/综合属性定义.png)

###### 综合属性文法(S-attributed grammar)

- 如果文法中所有属性都是综合属性，那么这就是一个综合属性文法。
- 对综合属性的计算可以在分析树的基础上，通过一次自顶向下或者后续遍历完成计算

```c
procedure PostEval(T:treenode)
begin
 for each child C of T do
 PostEval(C);
 compute all synthesized attributes of T;
end;
```

###### 继承属性(Inherited Attribute)

- 一个属性不是综合属性就被称为一个继承属性
- 继承属性具有在解析树中从父级流向子级或从同级流向同级的依赖关系
  ![[继承属性示例1.png]](./images/语义分析/继承属性示例1.png)
  ![[继承属性示例2.png]](./images/语义分析/继承属性示例2.png)

- 继承属性的计算可以通过前序遍历(preorder traversal)来完成

```c
procedure PreEval(T:treenode);
begin
 for each child C of T do
 compute all inherited attributes of C;
 PreEval(C);
end;
```

###### 属性计算示例

![[属性计算dtype1.png]](./images/语义分析/属性计算dtype1.png)
![[属性计算dtype2.png]](./images/语义分析/属性计算dtype2.png)

![[属性计算dtype3.png]](./images/语义分析/属性计算dtype3.png)
![[属性计算dtype4.png]](./images/语义分析/属性计算dtype4.png)

- 这种递归的属性计算方法可以在自顶向下的分析中使用

###### 属性的存储

- 属性的存储有三种方法：一是跟上面的一样，与属性节点绑定，二是作为函数的参数和返回值，三是存储在外部的数据结构中

- 有一些值在计算的过程中反复使用，如果用上面的方法，会在分析树中占用大量的空间来存储这些相同的属性值。
- 例如：
  ![[属性计算basenum1.png]](./images/语义分析/属性计算basenum1.png)
  ![[属性计算basenum2.png]](./images/语义分析/属性计算basenum2.png)
  ![[属性计算basenum3.png]](./images/语义分析/属性计算basenum3.png)

- 可以把属性作为函数的参数和返回值
- 事实上，一个单个递归遍历的函数中，通过前序遍历计算继承属性，后序遍历计算综合属性，可以将继承属性值作为参数传递给子级的递归调用，并接收综合属性值作为这些相同调用的返回值

- 例如，在十进制和八进制的语法中，base 是继承属性而 val 是综合属性，递归的属性计算函数为：

![[属性计算basenum4.png]](./images/语义分析/属性计算basenum4.png)
![[属性计算basenum5.png]](./images/语义分析/属性计算basenum5.png)

- base 值作为一个共享的属性值，在每个节点都保存一个值会占用大量的空间，因此可以通过把这个属性作为参数进行传递

- 当属性值具有重要结构并且在翻译过程中的任意点可能需要时，数据结构（例如查找表、图表和其他结构）可能有助于属性值的正确行为和可访问性。主要数据结构之一是符号表，它存储与程序中声明的常量、变量和过程相关的属性

#### 分析期属性计算

![[分析期属性计算例子.png]](./images/语义分析/分析期属性计算例子.png)

##### 条件

- 所有属性都是由综合属性或者满足特定条件的继承属性决定
- L-Attributed grammar：满足从左至右计算，即对于一个语法规则：
  $$\begin{array}{c}X_0\rightarrow X_1X_2...X_n\\那么每个属性X_i.a_i都只能由比它靠前的属性计算出来\\即X_i.a_i=f(X_0.a_1,…,X_0.a_k,X_1.a_1,…X_1.a_k,…X_i-1.a_1,…X_i-1.a_k)\end{array}$$
- 把综合属性作为返回值，继承属性作为传入参数

##### 在递归下降中的属性计算

![[递归下降计算属性1.png]](./images/语义分析/递归下降计算属性1.png)
![[递归下降计算属性2.png]](./images/语义分析/递归下降计算属性2.png)
![[递归下降计算属性3.png]](./images/语义分析/递归下降计算属性3.png)
![[递归下降计算属性4.png]](./images/语义分析/递归下降计算属性4.png)

##### 在 LR 分析中的属性计算

###### 综合属性计算

- 增加一个 Value stack 来存储综合属性
- 在 parsing stack 运行的过程中，这个 value stack 也在并行的工作
- 当在 parsing stack 中进行一次规约，在 value stack 中会进行一次 value 的计算
- shift 操作在 parsing stack 和 value stack 中都提现为 push 一个 token 到栈顶
  ![[LR分析计算属性1.png]](./images/语义分析/LR分析计算属性1.png)
  ![[LR分析计算属性2.png]](./images/语义分析/LR分析计算属性2.png)

###### 继承属性计算

![[LR分析计算属性继承属性1.png]](./images/语义分析/LR分析计算属性继承属性1.png)

- 通过插入一个$\varepsilon$ 表达式来在不改变语法规则的情况下增加一个语义规则，来对这个继承属性进行分析
  ![[LR分析计算属性继承属性2.png]](./images/语义分析/LR分析计算属性继承属性2.png)

## 符号表

- 存储程序中声明的常量、变量和函数
- 存储数据类型、作用域、内存位置
- 主要的操作有：
  - Insert：用于在声明时，向符号表中插入变量所声明的信息。
  - Lookup：当在关联代码中使用该名称时，需要检索与该名称关联的信息
  - Delete：当声明不再适用时，需要删除该声明提供的信息
    ![[符号表.png]](./images/语义分析/符号表.png)

### 常见的语义

#### Dclarations

- 一个声明中的信息会被插入到符号表中$insert(id.name,dtype)$
- 属性文法如下
  ![[声明的属性文法.png]](./images/语义分析/声明的属性文法.png)

#### Statements

- 通常用来进行类型检查
  ![[statement的属性文法4.png]](./images/语义分析/statement的属性文法4.png)
  ![[statement的属性文法3.png]](./images/语义分析/statement的属性文法3.png)
  ![[statement的属性文法1.png]](./images/语义分析/statement的属性文法1.png)
  ![[statement的属性文法2.png]](./images/语义分析/statement的属性文法2.png)

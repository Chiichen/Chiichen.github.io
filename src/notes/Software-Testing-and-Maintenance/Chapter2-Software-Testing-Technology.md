---
title: 第2章 软件测试技术
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: ChiChen
date: 2024-05-07
category:
  - 课程笔记
tag:
  - 软件测试与维护
# this page is sticky in article list
sticky: false
# this page will appear in starred articles
star: false
footer:
isOriginal: true
copyright: 转载请注明出处
---

## 静态验证(Static Verification)与动态验证(Dynamic Verification)

- 静态验证是指在不运行程序的情况下对程序进行验证
- 动态验证是指借助测试用例等方式，通过运行成勋来对程序进行验证，将输入值(input value)输入程序中，将真实输出(actual value)与预期输出(expected value)做比对，来判断程序的正确性
![Dynamic Verification](images/Chapter2-Software-Testing-Technology/image.png)

- 理想系统(ideal system)由规范表示，而真实系统是实际代码。
- 测试成功并不需要通过结果。 失败的测试也会传授一些关于系统的新知识

:::info 黑盒测试(Black Box Testing)与白盒测试(White Box Testing)

- 黑盒测试完全基于程序规范(specification)，旨在验证程序是否满足规定的要求
- 白盒测试使用软件的实现来导出测试。 这些测试旨在测试程序代码的某些方面

:::

## 黑盒测试

- 黑盒测试也称为功能测试、数据驱动测试或基于规范的测试，是从用户角度进行的测试。
- 黑盒测试的主要错误类型有：
  - 功能不正确或缺失；
  - 接口及接口错误；
  - 性能误差；
  - 数据结构或外部数据访问错误；
  - 初始化或终止条件等错误。
- 每个软件功能必须包含在测试用例或经批准的例外情况中。
- 使用最小的数据类型和数据值集进行测试。
- 使用一系列实际数据类型和数据值来测试过载和其他“最坏情况”结果。
- 使用假设的数据类型和数据值来测试拒绝不规则输入的能力。
- 测试影响性能的关键模块，如基本算法、精度、时间、容量等是否正常。

### 优点

- 有目的地发现Bug，更准确地定位Bug。
- 黑盒测试可以证明产品是否满足用户所需的功能，满足用户的工作要求。
- 黑盒测试与软件本身如何无关实施的。如果实现发生变化，黑盒测试用例仍然存在可用（可重用性，面向回归测试）
- 测试用例开发可以与软件开发同时进行，可以节省软件开发时间。 大多数黑盒测试用例可以通过软件用例来设计。
- 可以重复相同的动作，试验中最枯燥的部分可以由机器完成。

### 缺点

- 需要充分了解待测试的软件产品所使用的技术，测试人员需要有较多的经验。
- 大量的测试用例
- 测试用例可能会产生大量冗余
- 功能测试覆盖率达不到100%
- 在测试过程中，很多都是手工测试操作。
- 测试人员负责大量文件和报告的准备和整理。

### 过程

1. 计划阶段(Test plan stage)
2. 设计阶段(Test design stage):根据程序需求说明书或用户手册，按照一定的标准化方法划分软件功能并设计测试用例
3. 测试执行阶段(Test execution stage):
根据设计的测试用例执行测试；
免费测试（作为测试用例测试的补充）
4. 测试总结阶段(Test summary stage)

### 测试用例(Test case)

- 测试用例是描述输入、操作或时间以及期望结果的文档。 其目的是确定应用程序的某个功能是否正常工作。
- 软件测试用例的基本要素包括测试用例编号、测试标题、重要性级别、测试输入、操作步骤和预期结果。

### 黑盒测试方法

- 等价划分(Equivalence Partitioning)
- 边界值分析(Boundary value analysis)
- 因果图(决策表)(Cause-Effect Graphs[Decision table])
- 随机测试(Random Testing)
- 错误猜测(Error Guessing)
- 场景测试(Scenario Testing)

#### 等价划分(Equivalence Partitioning)

- 就是将所有可能的输入数据，即程序的输入域，划分为若干部分（子集），然后从每个子集中选取几个有代表性的数据作为测试用例，该方法是一种重要且常用的黑盒测试用例设计方法，有两种类型的等价类(qeuivalence class):有效等价类(effective equivalence class)和无效等价类(invalid equivalence class)
- 有效等价类(effective equivalence class)它是指对程序的规范来说合理且有意义的输入数据的集合。
有效等价类可以用来检查程序是否实现了规范中规定的功能和性能。
- 无效等价类(invalid equivalence class):与有效等价类的定义相反。无效等价类是指对于程序规范来说不合理或无意义的输入数据集。对于具体问题，至少应该有一个无效的等价类，也可以有多个。
- 等价分类标准:完成测试并避免冗余,划分等价类重要的是把集合分成一组不相交的子集，子集就是整个集合

#### 边界值分析(Boundary value analysis)

- 就是对等价划分的补充，比如我只允许输入为`0-255`,那我就检测`-1,0,1,254,255,256`

#### 因果图(决策表)(Cause-Effect Graphs[Decision table])

- 前面介绍的等价划分和边界值分析都侧重于考虑输入条件，但没有考虑输入条件之间的联系和组合。
- 考虑输入条件的组合可能会导致一些新的情况，但检查输入条件的组合并不是一件容易的事，即使所有输入条件都被划分为等价的类，它们之间的组合仍然相当多。因此，有必要考虑以适合描述多个条件的组合并相应地生成多个动作的形式来设计测试用例。这需要使用因果图(又称石川馨图/鱼骨图)
![Symbol of Cause-Effect Graphs](images/Chapter2-Software-Testing-technology/image-1.png)
- 还有一些约束符号
![Restriction-Symbols](images/Chapter2-Software-Testing-technology/image-2.png)
- 因果图方法的最终结果是判定表(Decision table)，因此因果图的使用顺序是：
  1. 通过分析规格说明，为每个原因(输入)和结果(输出)分配标识符
  2. 根据关系画出因果图
  3. 标明限制条件
  4. 把图转换为判定表
  5. 把判定表的每一列拿出来作为依据
- 判定表的建立步骤：
  1. 确定规则的个数.假如有$n$个条件。每个条件有两个取值$(0,1)$,故有$2^n$种规则。
  2. 列出所有的条件桩和动作桩。
  3. 填入条件项。
  4. 填入动作项。等到初始判定表。
  5. 简化.合并相似规则（相同动作）。

##### 示例

- 问题要求：”……对功率大于50马力的机器、维修记录不全或已运行10年以上的机器，应给予优先的维修处理……” 。这里假定，“维修记录不全”和“优先维修处理”均已在别处有更严格的定义 。请建立判定表

1. 确定规则的个数：这里有3个条件，每个条件有两个取值，故应有$2\times 2\times 2=8$种规则。
2. 列出所有的条件茬和动作茬：
![example-1](images/Chapter2-Software-Testing-technology/image-3.png)
3. 填入条件项。可从最后1行条件项开始，逐行向上填满。
4. 填入动作桩和动作顶。这样便得到形如图的初始判定表。
![Decision table](images/Chapter2-Software-Testing-technology/image-4.png)
5. 化简，合并相似规则
![Reduced Decision table](images/Chapter2-Software-Testing-technology/image-5.png)

---
title: Chapter1 词法分析器之Chumsky
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: ChiChen
date: 2023/11/03
category:
  - 笔记
  - 编译器
tag:
  - 编译器
  - 词法分析
# this page is sticky in article list
sticky: false
# this page will appear in starred articles
star: false
footer: 
isOriginal: true
copyright: 转载请注明出处
---

## 库的选择

一开始我其实是选择的[nom](https://docs.rs/nom/7.1.3/nom/index.html)这个库来完成词法分析的，但是写了一段时间之后还是选择了[chumsky](https://docs.rs/chumsky/1.0.0-alpha.6/chumsky/index.html)，有几点因素在里面：

1. 左递归问题：其实`nom`写起来要比`chumsky`优雅很多，因为前者的主题是一系列函数指针，类型很清晰，但是后者是泛型对象，一旦报错就是嵌套几十层的泛型可读性几乎为零，而且前者是`PEC`(Parser Expression Combinator)，可以把每个函数的职责划分得很清楚，而后者是 `PEG`(Parser Expression Generator)，相对来说没有这么优雅。但是这一切都被左递归打破了。大多数学生都知道，消除左递归的方法就是重写文法，然而重写文法会导致每个产生式之间的大量耦合，使得原来职责清晰的函数变得很答辩。而`chumsky`使用了`packrat`算法(求证中)，来实现对左递归的消除，大大提高了产生式的可读性，虽然仍然需要解决一部分的优先级问题，但是比起`nom`来说已经是好太多了
2. 错误恢复和抛出：在编译器中，错误处理其实是很重要的一部分，这直接关系到用户的编程体验，`chumsky`恰恰是考虑到了这点，它有一个孪生的[ariadne](https://github.com/zesterer/ariadne)库，可以生成一些可视化程度较高的错误信息，而且在分析的过程中提供了错误恢复的操作，这些都是`nom`缺乏的

- 简单来说，`nom`其实不算是为一门编程语言而生的，它一开始只能解析二进制文件(`&[u8]`)，它主要是为了解析自定义文件和部分简单的文本文件来提供便捷的实现的，而如果说要分析一门编程语言的话，我觉得还是chumsky更合适

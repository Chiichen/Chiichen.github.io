---
title: Chapter1 编译器组成
# cover: /assets/images/cover1.jpg

icon: page
order: 1
author: ChiChen
date: 2023-10-11
category:
  - 笔记
tag:

  - 笔记/编译原理
sticky: true
star: false
footer: 
copyright: 转载请注明出处
---

# Chapter1 编译器组成

## 编译器的结构

- 词法分析Lexical analysis (Scanning)
- 语法分析Syntax analysis (Parsing)
- 语义分析 Semantic analysis

::: info
 以上三步的目的是通过分析输入代码，生成能被统一处理的中间层代码，亦即编译器前端（front-end）
:::

- 中间代码生成 IR Generation
- 中间代码优化 IR Optimization
- 最终代码生成 Generation
- 最终代码优化 Optimization

$$C(源代码)\rightarrow TAC(Three Address Code)中间（intermediate）码\rightarrow 机器码$$

## 词法分析

- 本质上就是为了输出一个合法的token序列，每个token就是一个关键词或者一个关键词+词素(lexeme)的组合如
  
  $$\begin{array}{c}T\_While\quad 关键词\\ T\_Identifier \;\;x \quad 关键词+词素\end{array}$$

## 语法分析

- 就是将一个token序列表示为一棵语法树

## 语义分析

- 就是将语法分析得到的语法树转化为一个带注解（annotated）的语法树

## 中间代码生成

- 从语法树生成通用的中间代码

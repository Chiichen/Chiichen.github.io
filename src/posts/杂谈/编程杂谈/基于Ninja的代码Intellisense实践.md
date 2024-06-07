---
title: 基于Ninja的代码Intellisense实践
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: Chiichen
date: 2024-02-26
category:
  - 杂谈
tag:
  - 杂谈/编程杂谈
# this page is sticky in article list
sticky: false
# this page will appear in starred articles
star: false
footer:
isOriginal: true
copyright: 转载请注明出处
---

## 插件安装

在 VSCode 中安装 clangd 作为前端，要记得关闭 C/C++的 Intellisense

## 生成 compile_commands.json

在 Ninja 输出目录，以`out`为例，执行

```bash
ninja -C out -t  compdb cxx cc > compile_commands.json
```

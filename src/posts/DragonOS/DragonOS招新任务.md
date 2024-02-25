---
title: DragonOS招新任务
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: ChiChen
date: 2024-02-25
category:
  - DragonOS
tag:
  - DragonOS
# this page is sticky in article list
sticky: false
# this page will appear in starred articles
star: false
footer: 
isOriginal: true
copyright: 转载请注明出处
---

## 简介

ramfs指内存文件系统，其显著特性为所有文件均保存于硬盘中，不同于通常理解的保存在硬盘上的文件。因此内存文件系统屏蔽掉了跟硬盘这类底层硬件交互的部分，抽离出来了文件系统的基础功能，适合作为操作系统入门任务。

## 任务介绍

1. 系统中已经有完成的ramfs模块，位于`kernel/src/filesystem/ramfs/mod.rs`中，你需要做的就是把这个ramfs替换为自己的实现，当然，对现有代码的借鉴是允许的，但是你要知其然并知其所以然，知道代码这样设计背后的含义，比如为什么要加锁，为什么要用Arc。
2. 替换完之后你需要编写测试程序测试你的ramfs，现在的推荐做法是在内核初始化文件系统的代码中，多初始化一个ramfs并挂载到根目录，然后编写用户程序，测试这个文件系统的基本功能，例如创建、删除目录，读写文件。

## FAQ

怎么编写用户程序？

- 以[NovaShell](https://github.com/DragonOS-Community/NovaShell)为例，这是一个在DragonOS中运行的shell程序，这是用rust编写用户空间程序的标准范例。你需要注意两点，第一，在用户空间程序代码目录下的`.cargo/config.toml`文件中指定target为`"x86_64-unknown-linux-musl"`，第二，在DragonOS项目代码目录下创建一个配置文件，例如`user/dadk/config/nova_shell-0.1.0.dadk`，配置文件可以手动写，也可以用`dadk new`这个命令来交互式的配置。

遇到问题怎么办？

- 尝试自己解决无果后，可以到[DragonOS开源社区](https://bbs.dragonos.org.cn/)进行提问，以便让项目组内的同学都能回答你的问题。

## 相关链接

[DragonOS开源社区](https://bbs.dragonos.org.cn/)
[DragonOS项目仓库](https://github.com/DragonOS-Community/DragonOS)

---
title: Chapter1 Introdction
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: ChiChen
date: 2023-03-21
category:
  - 课程笔记
tag:
  - 操作系统
# this page is sticky in article list
sticky: false
# this page will appear in starred articles
star: false
footer: 
isOriginal: true
copyright: 转载请注明出处
---
## 目录

1. 什么是操作系统
2. 操作系统的历史
3. 操作系统硬件
4. 操作系统zoo
5. 操作系统概念
6. 系统调用
7. 操作系统结构

## 什么是操作系统

- 操作系统的位置

<!-- ![操作系统的位置](<images/Chapter1-Introdction/操作系统的位置>) -->

### 操作系统的功能

- 自上而下：虚拟机，扩展机（extended machine），隐藏底层复杂丑陋的接口，给用户简洁，高效的接口
- 自下而上：资源管理器（resource manager），允许多个程序同时运行（多进程），调度资源以实现时间、空间上的复用。管理、保护内存安全，管理I/O设备

## 操作系统的历史

### 第一代 1945-1955 真空管——插件板

- 使用模式
  - 用户既是使用者，也是编程者
  - 使用机器语言
  - IO使用插件版和穿孔卡片
- 特点
  - 一个用户独占一个机器
  - CPU需要等待使用者加载和卸载插件版
- 冲突：
  - CPU的高速和人工操作的慢速

### 第二代 1955-1965 晶体管——批处理系统

- 模式
  - 用户是操作员或者程序员
  - 使用汇编语言、Fortran
  - I/O：卡片、磁带
  - 通常I/O、计算、输出由不同机器执行，由人工进行数据传递

### 第三代 1965-1980 电子芯片——多道程序系统

- 分时系统：
  - 多个用户共享一个计算机，每个人都有一个线上终端
  - 将CPU进行切片，将时间片分给用户进行运行
  - 能够快速响应

### 第四代 1980-现代 大规模集成电路（LSI）——GUI操作系统

## 操作系统硬件

### 寄存器(快速、高价、低容量)

- 数据寄存器
- 地址寄存器
- PC：程序计数器
- IR：指令寄存器
- PSW：程序状态字

### 指令执行

<!-- ![指令执行过程](<images/Chapter1-Introdction/指令执行过程>) -->

### 多线程架构

### Cache

- 缓存存储策略
- 缓存读取策略
- 缓存组织策略(全相联、组相联、直接访问)

### RAM

- 程序内存保护
- 处理重定位

### 磁盘

- 盘面、柱面、磁道

### I/O

- I/O控制器和I/O设备本身
- Program-controlled I/O(Polling)
- Interrupt-driven I/O
- Direct Memory Access(DMA)

## 操作系统大家庭

- 大型机系统：OS/390、zOS
- 服务器系统：Linux
- 多处理器系统
- 个人电脑系统：Windows、Linux
- 手持操作系统：Android、IOS
- 嵌入式操作系统：QNX、VxWorks
- 传感器节点操作系统：Tiny OS
- 实时操作系统：硬实时、软实时系统
- 智能卡系统：JVM

## 操作系统概念

### 进程(process)

- 一个执行中的程序被称为一个进程
- 为了描述和控制进程的运行，系统为每个进程定义了一个数据结构——进程控制块PCB(Process Control Block)。所谓系统创建一个进程，就是由系统为某个程序设置一个PCB，用于对该进程进行控制和管理。进城任务完成，由系统收回其PCB，该进程便消亡。系统将根据某PCB而感知响应进程的存在，故说PCB是进程存在的唯一标志。
- PCB的所有信息会被存储在一个表中，被称为进程表(process table)。
- 一个叫命令解释器(command interpreter)或shell的进程可以从终端读取命令(只接受而不执行，会创建一个新的进程来执行命令)
- 如果一个进程可以创建进程，就形成了树形的进程树
- 在UNIX系统中，所有进程有一个最终的父进程
- 进程有许多状态：running、blocked(堵塞，等待I/O的状态，可以执行其他进程)、ready
- 每个被准许使用系统的用户都有一个UID(User IDentification)，一个进程被赋予一个PID(Process IDentification)
- 用户可以被分为若干个用户组，而每个用户组都有GID(Group IDentification)
- superuser(root in UNIX)有特殊权限去侵入一些由规则保护的内容
- 进程间的通信被称为interprocess communication，用来执行进程合作和同步进程

### 存储器(Address Spaces & Files)

- 地址空间(Address Space)：进程可读写的一系列的地址从0到最大值，是一个地址范围。
- 虚拟内存(virtual memory)：操作系统将地址空间的一部分内存从主存扩展到硬盘
- 文件系统(与设备、系统无关的)：
- 一个目录用于组织文件(目录也是一个文件，系统文件)
- 一个路径用于指定文件的位置
- 根目录是目录结构的顶端，在UNIX中用/表示根目录
- 每个进程都有一个当前工作路径(pwd)
- 如果一个文件访问被允许，操作系统将会返回一个小整数称为文件描述符(file descriptor)，来被用于随后的操作
- 在UNIX的/dev目录中，有两种特殊文件：块特殊文件(block special files)，用于磁盘设备；和字符特殊文件，用于打印机等字符流操作设备(I/O设备也是作为文件访问的)
- 可移动设备(如U盘)，也会用mount指令来将移动设备的目录树mount到UNIX系统的根目录上
- 管道(pipe)是一种连接两个进程的伪文件(是由两个文件描述符引用的伪文件，一个表示读端，一个表示写端，伪文件是一种特殊的文件，它不是真实的物理设备，而是由内核提供的一种抽象接口。伪文件通常用于内核和用户空间之间的通信，例如在Linux中，/proc和/sys目录下的文件就是伪文件)

### I/O

- 每个操作系统都有一个I/O子系统来管理I/O设备
- 有一些I/O软件是设备无关的
- 其他的例如设备驱动，就是对于特定I/O设备需要单独安装的

### 资源保护

- 在UNIX中的文件被一个9-bit的二进制保护码保护：
- 每个保护码由三个3-bit的字段组成，一个表示文件所有者，一个表示文件所有组，一个表示其他用户的访问权限，
- 每个字段的每个bit分别表示读、写、执行权限

## 系统调用

- 用于请求系统服务的
- 通过系统API调用系统服务：
- WIN32
- JAVA API
- POSIX API(Portable可移植的 Operating System Interface)
- 遵循IEEE标准，包含强制部分和可选部分
- 大部分POSIX过程执行一个系统调用，而且通常是一对一同名的，把一个系统调用转化为一个库过程(library procedure)

### 进程的系统调用

- Fork是POSIX中创建新进程的唯一方式
- Fork创建了原进程的一个副本，被创建的副本是原进程的子进程
- Fork被调用一次但是会返回两次：
- 在子进程中返回0，在父进程中返回子进程的PID，错误返回-1
- execve被用于fork后，来把进程的内存空间让给一个新的程序，可以用于让子进程来执行与父进程不同的内容
- exec有很多类型的调用(execl execle等等)
- waitpid是被用于把父进程移出ready队列直到子进程终止
- 如果成功返回PID，错误返回-1
- pid参数为-1则等待任一子进程，等价于wait
- pid>0则等待pid为输入参数的子进程

### 文件管理的系统调用

|call|Description|
|-----|-----|
|fd = open(file, how, ...)|Close an open file|
|s = close(fd)|Close an open file|
|n=read(fd,buffer,nbytes)|Read data from a file into a buffer|
|n = write(fd, buffer, nbytes)|Write data from a buffer into a file|
|position = lseek(fd, offset, whence)|Move the file point|
|s = stat(name, &buf)|Get a file's status information|

### 目录管理系统调用

|call|Description|
|-----|-----|
|s = mkdir(name, mode)|Create a new directory|
|s = rmdir(name)|Remove an empty(!) directoty|
|s = link(name1 ,name2)|Create a new entry, name2, pointing to name1|
|s = unlink(name)|Remove a directory entry|
|s = mount(special, name, flag)|Mount a file system|
| s = umount(special)|Unmount a file system|

### 其他系统调用

|call|Description|
|-----|-----|
|s = chdir(dirname)|Change the working directory|
|s = chmod(name, mode)|Change a file's protection bits|
|s = kill(pid, signal)|Send a signal to a process|
|seconds = time(&seconds)|Get the elapsed time since Jan.1 , 1970|

## 操作系统结构

### 单体系统(Monolithic System)

- 大杂烩，所有操作系统的操作都在一个文件中，互相调用

### 分层系统(Layered System)

- 以第一个分层系统THE为例
|Layer|Function|
|---|---|
|5|The operatior|
|4|User programs|
|3|I/O management|
|2|Operator-process communication|
|1|Memory and drum management|
|0|Processor allocation and multiprogramming|

### 微内核系统(Microkernels)

- 操作系统内核非常小，提供最小功能
- 基本内存管理(地址空间)
- 其他操作系统功能在

### Client-server

- 是微内核系统的一个变种
- 把process分为servers和clients
- Microkernels负责client和server之间通过message的通信
- 可以把servers和clients放在不同的设备上

### 虚拟机

- 虚拟机软件是位于硬件层上
- 每个虚拟机都相当于一台单独的硬件设备，每个虚拟机上安装的操作系统都认为自己拥有单独的硬件
- 有两种类型的hypervisor

### 外内核(Exokernel)

- 把一部分原来由操作系统内核态提供的底层硬件抽象接口提升到用户层，使得应用程序可以有限制地访问操作系统的资源(如网络socket，内存VMA)

---
title: PARSEC测试套件 3.0 介绍和安装
# cover: /assets/images/cover1.jpg
icon: page
order: 1
author: ChiChen
date: 2023-11-15
category:
    - Linux内核
tag:
    - Linux内核
    - 性能测试
sticky: false
star: false
footer:
isoriginal: false 
copyright: 转载请注明出处
---

## 转载信息

转载自[parsec3.0介绍和安装](https://www.jianshu.com/p/b301f0dc0678)

## 依赖安装

### 安装gcc g++ m4

```bash
# 如果是 Ubuntu 请使用 yum install gcc gcc-c++ m4 -y
yum install gcc gcc-c++ m4 -y

```

### parsec3.0下载和安装

:::info
以下内容是针对Centos等发行版的，Ubuntu系统即Debian系(其它发行版没测过)请转至[Parsec-3.0](https://github.com/Chiichen/parsec-3.0)
:::

```bash
wget http://parsec.cs.princeton.edu/download/3.0/parsec-3.0-core.tar.gz
# 2023/12/06日测试该网站被关闭了，可以通过archive下载
# http://web.archive.org/web/20230902151148/http://parsec.cs.princeton.edu/download/3.0/parsec-3.0-core.tar.gz
# http://web.archive.org/web/20160809002339/http://parsec.cs.princeton.edu/download/3.0/parsec-3.0-input-sim.tar.gz
# http://web.archive.org/web/20160809000537/http://parsec.cs.princeton.edu/download/3.0/parsec-3.0-input-native.tar.gz
tar -zxvf parsec-3.0-core.tar.gz                                    #解压压缩包
cd parsec3.0
source env.sh                                                   #更新环境变量 
parsecmgmt -a build -p streamcluster                               #单独编译benchmark streamcluster
parsecmgmt -a run -p streamcluster                                 #单独测试benchmark streamcluster
parsecmgmt -a fulluninstall -p streamcluster                       #清除streamcluster文件
#到这里后建议先建议先看一看本文后面的参数配置和benchmark说明，然后再下载安装parsec3.0
#一次性编译所有benchmark，正常情况下大约7分钟编译完，如果编译报错，可以参考本文后面列出的错误描述及解决方法
parsecmgmt -a build -p all
parsecmgmt -a run -p all  -i simdev                                #采用所有benchmark进行测试                                
```

## 参数配置和benchmark说明

### 测试集

parsec3.0有6个测试集，分别是Test，Simdev，Simsmall，simmedium，Simlarge，Native，如果不指定测试集，parsec3.0会默认使用Test。这6个测试集具体信息如下表：

![Alt text](images/parsec3.0%E4%BB%8B%E7%BB%8D%E5%92%8C%E5%AE%89%E8%A3%85/image.png)

### 查看测试集

parsec3.0压缩包不一定都包含这6个测试集，可以通过如下方式查看自己下载的parsec3.0源码包含的测试集：

```bash
cd ./pkgs/kernels/dedup/inputs/
ls
```

## benchmark介绍

parsec3.0有自身的benchmark和集成第三方的，下标所列是自身的benchmark和用途，第三方有splash2、splash2x。

![Alt text](images/parsec3.0%E4%BB%8B%E7%BB%8D%E5%92%8C%E5%AE%89%E8%A3%85/image-1.png)

通过命令parsecmgmt -a info可以查看具体benchmark信息。

## 错误及解决方法

### 错误1

错误描述：

```bash
No package 'xext found'
```

解决方法：

```bash
yum install libXext-devel libXfixes-devel libX11-devel libXt-devel libXmu-devel libXi-devel -y
```

### 错误2

错误描述：

```bash
/usr/include/wchar.h:94:3: error: conflicting types for ‘._mbstate_t’
```

解决方法：

```bash
vim ./pkgs/libs/uptcpip/src/include/sys/bsd__types.h
# 注释bsd_types.h的102行到105行代码
# typedef union {
# char __mbstate8[128];
# __int64_t _mbstateL; /* for alignment */
# } __mbstate_t;
```

### 错误3

错误描述：

```bash
[PARSEC] Error: 'env version=tbb /usr/bin/make' failed.
```

解决方法：

```bash
yum install -y tbb tbb-devel
```

### 错误4

错误描述：

```bash
POD document had syntax errors at /usr/bin/pod2man line 69.
```

解决方法：

```bash
rm -f /usr/bin/pod2man
```

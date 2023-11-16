---
title: vscode+qemu开发Linux内核

# cover: /assets/images/cover1.jpg

icon: page
order: 1
author: ChiChen
date: 2023-10-28
category:
    - 笔记
    - Linux 内核
tag:
    - Linux 内核
    - 开发环境
sticky: true
star: true
footer:
copyright: 转载请注明出处

---

参考于[QEMU调试Linux内核环境搭建](http://kerneltravel.net/blog/2021/debug_kernel_szp/)

## 获取Linux源码

- 略

## 编译Linux内核

```bash
cd /linux
export ARCH=x86
make CC=clang x86_64_defconfig
# ./scripts/config --file .config -e CONFIG_NUMA_BALANCE CONFIG_NUMA_BALANCING_DEFAULT_ENABLED CONFIG_NUMA
# Todo 还有一些nuuma_balance相关设置项要打开，不然后面要在编译时手动选择Y
```

### config可选项

```bash

# 可选，可以开启调试选项
make menuconfig
# in menu
Kernel hacking  ---> 
    [*] Kernel debugging
    Compile-time checks and compiler options  --->
        [*] Compile the kernel with debug info
        [*]   Provide GDB scripts for kernel debuggin

# 关闭内核随机地址
Processor type and features ---->
    [] Randomize the address of the kernel image (KASLR)
```

### 编译

```bash
# 下面这行官方脚本获取的编译命令有问题，很多文件clangd编译不过
# ./scripts/config --file .config -e CONFIG_NUMA_BALANCE
#编译,linux默认编译器使用的是gcc，会导致clangd索引不全，使用bear获取compile_command.json，索引后可以改成 make -j 32
bear -- make CC=clang -j 32
 # 结束输出Kernel: arch/x86/boot/bzImage is ready
```

### clangd配置

```bash
--compile-commands-dir=${workspaceFolder}
--background-index
--completion-style=detailed
--header-insertion=never
-log=info
-pretty

```

## 配置BusyBox

启动内核还需要一个具有根文件系统的磁盘镜像文件，根文件系统中提供可供交互的shell程序以及一些常用工具命令。
我们借助busybox工具来制作根文件系统。

```bash
# 下载busybox源码
wget https://busybox.net/downloads/busybox-1.32.1.tar.bz2
tar -xvf busybox-1.32.1.tar.bz2
cd busybox-1.32.1
make menuconfig
# 配置为静态编译
# Settings  --->
#            [*] Build BusyBox as a static binary (no shared libs) 
```

## 制作 rootfs

```bash
szp@r420-PowerEdge-R420:~/busybox-1.32.0$ dd if=/dev/zero of=rootfs.img bs=1M count=10

szp@r420-PowerEdge-R420:~/busybox-1.32.0$ mkfs.ext4 rootfs.img

szp@r420-PowerEdge-R420:~/busybox-1.32.0$ mkdir fs

szp@r420-PowerEdge-R420:~/busybox-1.32.0$ sudo mount -t ext4 -o loop rootfs.img ./fs

szp@r420-PowerEdge-R420:~/busybox-1.32.0$ sudo make install CONFIG_PREFIX=./fs

szp@r420-PowerEdge-R420:~/busybox-1.32.0/fs$ sudo mkdir proc dev etc home mnt

szp@r420-PowerEdge-R420:~/busybox-1.32.0/fs$ sudo cp -r ../examples/bootfloppy/etc/* etc/

szp@r420-PowerEdge-R420:~/busybox-1.32.0$ sudo chmod -R 777 fs/ 

# 写在 rootfs.img
szp@r420-PowerEdge-R420:~/busybox-1.32.0$ sudo umount fs
```

## 启动qemu

这里用的是我的配置，就是要有这个目录结构，然后cd进linux源码文件夹执行下面的命令即可

```bash
/.
/..
/linux
/busybox-1.32.1
```

```bash
 qemu-system-x86_64 -kernel ./arch/x86_64/boot/bzImage  -hda ../busybox-1.32.1/rootfs.img  -append "root=/dev/sda console=ttyS0" -nographic
 ```

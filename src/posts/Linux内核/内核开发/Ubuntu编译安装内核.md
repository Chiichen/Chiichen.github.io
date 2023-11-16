---
title: Ubuntu编译安装内核
# cover: /assets/images/cover1.jpg
icon: page
order: 1
author: ChiChen
date: 2023-11-15
category:
    - 杂谈
    - Linux内核
tag:
    - Linux内核
sticky: false
star: false
footer:
copyright: 转载请注明出处
---

## 下载目标内核代码

略

## 安装依赖

```bash
sudo apt install gdb bison m4 autoconf automake libtool libncurses5-dev build-essential fakeroot debhelper libelf-dev
```

## 设置

```bash
scripts/config --disable SYSTEM_TRUSTED_KEYS
scripts/config --disable SYSTEM_REVOCATION_KEYS
scripts/config --set-str CONFIG_SYSTEM_TRUSTED_KEYS ""
scripts/config --set-str CONFIG_SYSTEM_REVOCATION_KEYS ""
```

## 编译打包

暂时省略 ccache 的配置

```bash
fakeroot make -j 72 deb-pkg CC="ccache gcc"
```

完成会在根目录的上级目录看到一系列 `*.deb` 文件，形如 `linux-image-6.6.0_6.6.0-15_amd64.deb` 的就是我们需要的

## 安装内核

把deb包拷贝到目标机器

```bash
sudo dpkg -i *.deb
# 查看当前kernel
uname -a
```

## 卸载内核

查看当前所有kernel:

```bash
$ dpkg --get-selections |grep linux-image
# 移除想要删除的kernel:
$ sudo apt-get remove \
<kernel_list_by_above_command>
```

```bash
$ dpkg --get-selections |grep linux-image
linux-image-5.10.100-sriov-fix                  install
linux-image-5.10.82-cvhb                        install
linux-image-5.15.74-cvhb                        install
linux-image-5.4.130-cvhb                        install
linux-image-unsigned-5.10.9-051009-generic      install

$ sudo apt-get remove \
linux-image-5.10.100-sriov-fix
```

状态为 deinstall 即已经卸载，如果觉得看着不舒服的话可以使用 purge 连配置文件里一起彻底删除，清理内核列表

```bash
$ sudo apt-get purge \
linux-image-5.10.100-sriov-fix
```

然后更新grub

```bash
sudo update-grub
```

## 更换默认 Kernel

### Case1

:::info
大部分应该都是 Case2 的模式，至少 `ubuntu-23.10-live-server-amd64` 经测试是Case2，而且网上绝大多数都是只有Case2的
:::

- 如果你的启动项在开机界面第一页（就是第一个菜单界面），那么就很简单了，如果是第一项，那么GRUB_DEFAULT=0（选项默认从0开始计数）
- 如果是第二项，那么GRUB_DEFAULT=1，以此类推。

### Case2

- 多内核，内核选择界面在第二页（就是第二个菜单界面），比如要启动5.4.0的内核（在第二个菜单界面的第一项），那么

```bash
　　　　GRUB_DEFAULT="1>0"
```

- 1表示第一个菜单界面开机时选择第二项，0表示第二个菜单界面开机时选择第一项，

- 在系统中查找自己想切换的默认kernel在内核选择的第二个页面的第几项：
　　　　查看有哪些内核可切换：

```bash
cat /boot/grub/grub.cfg | grep menuentry
```

想要查看更具体，可以查询 /boot/grub/grub.cfg 中的内容

- 我们想以submenu中 哪个kernel作为默认启动，只需要数这个kernel排在"Advanced options for ubuntu"后面的第几个(从0开始数)，然后把 /etc/default/grub 中 GRUB_DEFAULT="1> 对应kernel的序号"。

#### 例子

```bash
$ cat /boot/grub/grub.cfg | grep menuentry
if [ x"${feature_menuentry_id}" = xy ]; then
  menuentry_id_option="--id"
  menuentry_id_option=""
export menuentry_id_option
menuentry 'Ubuntu' --class ubuntu --class gnu-linux --class gnu --class os $menuentry_id_option 'gnulinux-simple-dbceaf9c-37a8-4269-b300-d7e7f6794f10' {
submenu 'Advanced options for Ubuntu' $menuentry_id_option 'gnulinux-advanced-dbceaf9c-37a8-4269-b300-d7e7f6794f10' {
        menuentry 'Ubuntu, with Linux 6.5.0-10-generic' --class ubuntu --class gnu-linux --class gnu --class os $menuentry_id_option 'gnulinux-6.5.0-10-generic-advanced-dbceaf9c-37a8-4269-b300-d7e7f6794f10' {
        menuentry 'Ubuntu, with Linux 6.5.0-10-generic (recovery mode)' --class ubuntu --class gnu-linux --class gnu --class os $menuentry_id_option 'gnulinux-6.5.0-10-generic-recovery-dbceaf9c-37a8-4269-b300-d7e7f6794f10' {
        menuentry 'Ubuntu, with Linux 6.6.0' --class ubuntu --class gnu-linux --class gnu --class os $menuentry_id_option 'gnulinux-6.6.0-advanced-dbceaf9c-37a8-4269-b300-d7e7f6794f10' {
        menuentry 'Ubuntu, with Linux 6.6.0 (recovery mode)' --class ubuntu --class gnu-linux --class gnu --class os $menuentry_id_option 'gnulinux-6.6.0-recovery-dbceaf9c-37a8-4269-b300-d7e7f6794f10' {
                menuentry 'UEFI Firmware Settings' $menuentry_id_option 'uefi-firmware' {
```

假如我们想把 Ubuntu, with Linux 6.6.0 作为默认kernel，那么他的编号为2(从0开始)，只需要如下编辑/etc/default/grub然后update-grub即可：

```bash
$sudo vim /etc/default/grub
...
GRUB_DEFAULT="1>2"
...

$ sudo update-grub
$ sudo reboot

$ cat /proc/cmdline    #查看启动项是否正确
```

## 参考链接

1. [Ubuntu安装、卸载和更换默认kernel](https://www.cnblogs.com/ArsenalfanInECNU/p/16952333.html)

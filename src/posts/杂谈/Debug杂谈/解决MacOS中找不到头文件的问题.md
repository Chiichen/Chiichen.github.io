---
title: 解决MacOS中找不到头文件的问题
# cover: /assets/images/cover1.jpg

icon: page
order: 1
author: ChiChen
date: 2024-02-29
category:
  - 杂谈
  - Debug杂谈
tag:

  - MacOS
  - Debug
sticky: false
star: false
footer: 
copyright: 转载请注明出处
---

## 背景

在交叉编译LVGL的时候一直出现找不到头文件的问题，但是Intellisense却又能定位到头文件位置

## 解决方法

因为MacOS中的头文件不在`usr/include`等目录下，而是在`/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/`目录下，创建这个软连接后就解决了问题

```bash
sudo ln -s /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/* /usr/local/include/
```
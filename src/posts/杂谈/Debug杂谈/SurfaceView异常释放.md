---
title: Surface View 异常释放引起的 Segv Fault

# cover: /assets/images/cover1.jpg

icon: page
order: 1
author: ChiChen
date: 2024-04-03
category:
  - 杂谈
  - Debug杂谈
tag:
  - Android
sticky: false
star: false
footer:
copyright: 转载请注明出处
---

## 背景

最近在研究通过 Rust 进行 Android Native 渲染的相关内容，基本方法是，在 Android 里创建一个 Surface View，然后在 OnSurfaceCreated 方法处，将一个 SurfaceHolder 通过 JNI 传到 Rust 层，获取 ANativeWindow 指针，同时搭配`raw_window_handler`和`wgpu`进行渲染。当然这里还有很多细节，例如 Rust 侧事件循环的设计等等，后续有时间可以单独出一篇特辑。

## Bug 出现

Bug 的出现首先要从 Andoird 的刷新原理开始讲起(无特别说明，以下部分的安卓版本均为测试机版本——Android 12)

### Android 刷新原理

在旋转屏幕时，如果旋转 180 度，会直接复用之前的 Surface View，如果旋转 90 度，那么是会 Recreate 整个 Surface View 对象的，也就是会走一遍 `OnDestryed->OnCreated->OnChanged` 那么在这个过程中，在上一个 Surface View 释放到下一个 Surface View 生成并传递给 Rust 层，是有一个 Timing 的，如果在这个 Timing 内试图绘制到原来的 Surface View 上，或者试图绘制到任何一个 Surface Target 上都是会出错的。因此 Surface View 理想的生命周期应该是，Created 之后，通过 JNI 传递到 Rust 层后，由 Rust 层控制生命周期，当 Surface View 被摧毁时，通过 JNI 通知 JNI 销毁，这样才能保证 Rust 侧依赖这个 Surface 的部分不会出现 `Used after free`。

### Bug 出现的背景

在切换 Surface View 时，在 Rust 层通过 `ANativeWindowReelase` 方法释放指针后，在 `OnSurfaceCreated` 方法返回时出现段错误，调用栈顶层是 `incRef` ，递增引用计数。看起来是因为需要被递增引用计数的指针被释放了引起的，可是按道理在 `Surface View` 被摧毁后不应该还会递增这个引用计数

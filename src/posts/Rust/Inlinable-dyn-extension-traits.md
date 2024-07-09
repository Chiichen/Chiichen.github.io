---
title: Rust中的Optional Trait
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: Chiichen
date: 2024-07-09
category:
  - 笔记
  - Rust
tag:
  - Rust
# this page is sticky in article list
sticky: true
# this page will appear in starred articles
star: true
footer:
isOriginal: false
copyright: 转载请注明出处
---

# 探索 Rust 中的可选 Trait 方法

**原作者: [daniel5151](https://github.com/daniel5151/inlinable-dyn-extension-traits/blob/master/writeup.md)**

**注意：** 如果你时间紧迫，只想看所有方法的列表及其优缺点，请跳到[总结和比较](#summary-and-comparisons)部分。


## 一个激励示例 - 可扩展协议

这篇文章是我在开发 [`gdbstub`](https://github.com/daniel5151/gdbstub) 时的产物，这是一个实现 GDB 远程串行协议的 crate。GDB RSP 是一个非常古老的协议，大约诞生于80年代中期，拥有许多可选且互不兼容的扩展。

在 `gdbstub` 中，用户为其特定系统实现 `Target` trait，并将其交给一个通用的 `GdbStub` 控制器，该控制器处理 GDB 协议的细节，并在需要时调用提供的 `Target` 方法。

那么，如何编写一个 API，使用户能够实现协议的子集呢？

换句话说：如何在 Rust 中实现可选的 trait 方法？

理想情况下，我们希望具备以下所有特性：

- **方法可以在运行时动态启用/禁用**
  - 例如：通过 CLI 标志选择功能
- **API 消费者易于理解和实现**
  - 看起来像一个“典型”的 Rust API
  - 使用“标准”的方法签名（即：没有包装的 Option<Result<..>> 类型）
  - 方法实现的单一“真理来源”（即：没有“辅助”方法）
- **API 作者易于使用和维护**
  - 调用方法时的样板代码最少
  - 在调用方法之前检查方法是否存在
  - 易于处理“缺失方法”的情况
- **编译时安全性和性能**
  - 借助编译器在编译时强制执行协议不变量。即：“如果它能编译，它就是一个有效的实现”
    - 编译时互相依赖的方法
    - 编译时互相排斥的方法
  - 与死代码消除配合良好（在适用时 - 支持显式死代码提示）
    - 如果某个方法在静态上被禁用 - 不生成任何代码！

### 一个简化的示例协议 - 远程 ALU 协议

与其使用这个项目的现实灵感——GDB 远程串行协议，不如考虑一个更简单的、具有类似属性的人工协议：远程 ALU 协议。

```rust
pub enum Command {
    // ---------- 基础协议 ---------- //
    /// 打印当前累加器状态
    PrintState,
    /// 设置累加器的状态
    SetState(isize),
    // -------- IncDec 扩展 -------- //
    /// 增加累加器
    Inc,
    /// 减少累加器
    Dec,
    /// 元操作：同时增加和减少累加器
    /// 注意：这是一个遗留功能，但出于“兼容性原因”需要
    IncDec,
    // ---------- 乘法扩展 ---------- //
    /// 将累加器乘以某个值
    Mul(isize),
}
```

它包含了我们关心的很多东西：

- 通用的“基础”协议
- 多个协议扩展
- 互相依赖的命令（inc/dec + incdec）

为了简化，我没有在这个示例协议中包含互相排斥的命令，但在讨论各种方法时会涉及这种用例。

那么，我们如何编写一个库来运行这个协议呢？首先，让我们从一个控制器开始：

```rust
pub struct TargetController<T: Target> {
    target: T,
}

impl<T: Target> TargetController<T> {
    /// 创建一个操作给定目标的目标控制器
    pub fn new(target: T) -> TargetController<T> {
        TargetController { target }
    }

    /// 使用给定目标运行指定命令
    pub fn run(&mut self, cmds: &[Command]) -> Result<(), Error<T::Error>>;
}
```

问题是：实现 `Target` trait 的最佳方法是什么？

```rust
pub trait Target {
    type Error;

    fn get_state(&self) -> isize;
    fn set_state(&mut self, n: isize) -> Result<(), Self::Error>;

    // “IncDec”扩展的可选方法
    fn inc(&mut self) -> Result<(), Self::Error>;
    fn dec(&mut self) -> Result<(), Self::Error>;

    // “Mul”扩展的可选方法
    fn mul(&mut self, n: isize) -> Result<(), Self::Error>;
}
```

## “静态”解决方案 - 使用 `cargo` 特性进行条件编译

如果我们忽略第一个要求，并且不允许在运行时启用/禁用方法，那么解决方案显而易见：为每个协议扩展设置一个 cargo 特性！简单明了 :smile:

```rust
pub trait Target {
    type Error;

    fn get_state(&self) -> isize;
    fn set_state(&mut self, n: isize) -> Result<(), Self::Error>;

    #[cfg(feature = "ext_incdec")]
    fn inc(&mut self) -> Result<(), Self::Error>;
    #[cfg(feature = "ext_incdec")]
    fn dec(&mut self) -> Result<(), Self::Error>;

    #[cfg(feature = "ext_mul")]
    fn mul(&mut self, n: isize) -> Result<(), Self::Error>;
}
```

事实上，这种方法效果很好，并且几乎满足所有其他要求：

- 最终生成一个标准的 Rust trait，没有任何“魔法”
- 在实现中调用方法时没有额外开销或样板代码（除了用 `#[cfg(feature = "blah")]` 标记相关代码块）
- 使用 `#[cfg]` 指令强制执行互相依赖和排斥的方法
- 实际上是禁用代码，这是死代码消除的终极形式
  - 不需要依赖优化编译器，并确保在调试构建中生成更少的代码

但它也有几个缺点：

- 在一个项目中拥有多个具有不同功能的协议实现变得非常困难。
  - 这并非不可能 https://github.com/rust-lang/cargo/issues/674，但需要一些高级的 cargo 技巧。
- 随着添加的特性越来越多，在 CI 中测试每个特性组合的正确行为变得越来越困难
  - 本质上，它不再是一个代码库，而是变成了 `num_features!` 个代码库！

那么，如何在不需要在编译时切换的情况下实现可选的 trait 方法呢？

## 1. 使用 `is_supported` 方法

```rust
pub trait Target {
    type Error;

    fn get_state(&self) -> isize;
    fn set_state(&mut self, n: isize) -> Result<(), Self::Error>;

    fn ext_incdec_supported(&self) -> bool { false }
    fn inc(&mut self) -> Result<(), Self::Error> { unimplemented!() }
    fn dec(&mut self) -> Result<(), Self::Error> { unimplemented!() }

    fn ext_mul_supported(&self) -> bool { false }
    fn mul(&mut self, n: isize) -> Result<(), Self::Error> { unimplemented!() }
}
```

它的最大优点是任何人都能立即理解。

它的最大缺点是缺乏很多编译时安全性...

- 容易忘记实现这两个方法之一
  - 如果 `_supported` 方法未实现，则协议将默默地运行不支持的代码路径
  - 如果 `_supported` 方法已实现，但相应的方法未被覆盖，则在运行时会出现错误
    - 在嵌入式系统上，panic 机制开销很大，而且很糟糕

## 2. 使用 Options

```rust
pub trait Target {
    type Error;

    fn get_state(&self) -> isize;
    fn set_state(&mut self, n: isize) -> Result<(), Self::Error>;

    fn inc(&mut self) -> Option<Result<(), Self::Error>> { None }
    fn dec(&mut self) -> Option<Result<(), Self::Error>> { None }

    fn mul(&mut self, n: isize) -> Option<Result<(), Self::Error>> { None }
}
```

### 使用裸 `Option<Result<T, E>>`

即：调用方法，如果返回 `None`，则表示未实现。

最大缺点：无法在不调用方法的情况下查询方法是否存在。这使得“探测”操作变得困难，因为操作需要有一个“逆操作”。

### 使用 `OptResult<T, E>` 伪装

一个缺点是它使用了非标准的返回类型，这会破坏函数体中的 `?` 操作符。通过一些类型系统的技巧，可以在一定程度上解决这个问题：

```rust
#[derive(Debug, Clone)]
enum MaybeUnimplInner<E> {
    NoImpl,
    Error(E),
}

/// 包装一个错误类型，增加一个“未实现”状态。只能通过 `.into()` 或 `?` 操作符构造。
#[derive(Debug, Clone)]
pub struct MaybeUnimpl<E>(MaybeUnimplInner<E>);

impl<E> MaybeUnimpl<E> {
    pub(crate) fn unimplemented() -> Maybe
```rust
Unimpl<E> {
        MaybeUnimpl(MaybeUnimplInner::NoImpl)
    }
}

impl<T> From<T> for MaybeUnimpl<T> {
    fn from(e: T) -> Self {
        MaybeUnimpl(MaybeUnimplInner::Error(e))
    }
}

/// 包含“未实现”状态的结果类型。
///
/// `OptResult<T, E>` 应该与 `Result<T, E>` 无异，除了在返回 `Err` 变体时需要使用 `.into()`（即：`return Err(foo)` 将无法编译）。
pub type OptResult<T, E> = Result<T, MaybeUnimpl<E>>;

/// 使使用 OptResult 更加容易。
pub(crate) trait OptResultExt<T, E> {
    /// 如果 `OptResult` 未实现，返回 `Ok(None)`。否则，返回 `Ok(Some(T))` 或 `Err(E)`。
    fn map_unimpl(self) -> Result<Option<T>, E>;
    fn unimplemented() -> MaybeUnimpl<E> {
        MaybeUnimpl(MaybeUnimplInner::NoImpl)
    }
}

impl<T, E> OptResultExt<T, E> for OptResult<T, E> {
    fn map_unimpl(self) -> Result<Option<T>, E> {
        match self {
            Ok(t) => Ok(Some(t)),
            Err(MaybeUnimpl(MaybeUnimplInner::NoImpl)) => Ok(None),
            Err(MaybeUnimpl(MaybeUnimplInner::Error(e))) => Err(e),
        }
    }
}
```

然后：

```rust
pub trait Target {
    type Error;

    fn get_state(&self) -> isize;
    fn set_state(&mut self, n: isize) -> Result<(), Self::Error>;

    fn inc(&mut self) -> OptResult<(), Self::Error> { Err(MaybeUnimpl::unimplemented()) }
    fn dec(&mut self) -> OptResult<(), Self::Error> { Err(MaybeUnimpl::unimplemented()) }

    fn mul(&mut self, n: isize) -> OptResult<(), Self::Error> { Err(MaybeUnimpl::unimplemented()) }
}
```

不幸的是，这只是一个权宜之计，并没有解决根本问题...

## 3. 使用函数指针

啊，经典的 C 风格方法。使用函数指针表。

```rust
pub trait Target {
    type Error;

    fn get_state(&self) -> isize;
    fn set_state(&mut self, n: isize) -> Result<(), Self::Error>;

    fn ext_incdec(&mut self) -> Option<&'static TargetExtIncDecOps<Self>> { None }
    fn ext_mul(&mut self) -> Option<&'static TargetExtMulOps<Self>> { None }
}

pub struct TargetExtIncDecOps<This: Target + ?Sized> {
    pub inc: fn(&mut This) -> Result<(), This::Error>,
    pub dec: fn(&mut This) -> Result<(), This::Error>,
}

pub struct TargetExtMulOps<This: Target + ?Sized> {
    pub mul: fn(&mut This, n: isize) -> Result<(), This::Error>,
}
```

一个 `Ops` 结构的实现是什么样的？

```rust
// 例如：
const OPT_EXT_OPS: TargetExtIncDecOps<ExampleTarget> = TargetExtIncDecOps {
    inc: |this| -> Result<(), &'static str> {
        this.state += 1;
        Ok(())
    },

    dec: |this| -> Result<(), &'static str> {
        this.state -= 1;
        Ok(())
    },
};
```

- 注意：不能使用 `Self::Error`，必须使用 `<Self as Target>::Error` 或具体的错误类型

这最终满足了所有编译时安全性和性能要求。

不幸的是，这是一个极其不符合 Rust 风格的 API。它使用 `this` 而不是 `self`，需要使用原始函数指针，不清晰的 `'static` 引用，等等...

...但等等，这不就是我们自己在实现虚表吗？为什么不让编译器为我们做呢！

## 4. 使用内联动态扩展 Trait（IDETs）

在探索这个问题时，发现这不是一个特别广为人知的技术。

- https://stackoverflow.com/questions/30274091/is-it-possible-to-check-if-an-object-implements-a-trait-at-runtime
- https://stackoverflow.com/a/55914318
- https://users.rust-lang.org/t/working-around-specialisation/13367

好吧，如果还没有人写过这个，我就给它起个名字！**内联动态扩展 Trait**

什么是“内联动态扩展 Trait”？让我们分解一下：

- **扩展 Trait** - 一种常见的 [Rust 约定](https://rust-lang.github.io/rfcs/0445-extension-trait-conventions.html#what-is-an-extension-trait)，用于扩展 Trait 的功能，而不修改原始 Trait。
- **Dyn** - 暗示使用动态调度通过 [Trait 对象](https://doc.rust-lang.org/book/ch17-02-trait-objects.html)。
- **内联** - 暗示这种方法可以轻松内联，使其成为真正的零成本抽象。

简而言之，内联动态扩展 Trait（或 IDETs）是滥用 Rust trait 系统和现代编译器优化来模拟编译时可选的 trait 方法！

```rust
pub trait Target {
    type Error;

    fn base(&mut self) -> TargetBaseOps<Self>;

    #[inline(always)]
    fn ext_incdec(&mut self) -> Option<TargetExtIncDecOps<Self>> {
        None
    }

    #[inline(always)]
    fn ext_mul(&mut self) -> Option<TargetExtMulOps<Self>> {
        None
    }
}

pub trait TargetBase: Target {
    fn get_state(&self) -> isize;
    fn set_state(&mut self, n: isize) -> Result<(), Self::Error>;
}

pub trait TargetExtIncDec: Target {
    fn inc(&mut self) -> Result<(), Self::Error>;
    fn dec(&mut self) -> Result<(), Self::Error>;
}

pub trait TargetExtMul: Target {
    fn mul(&mut self, n: isize) -> Result<(), Self::Error>;
}

macro_rules! define_ops {
    ($exttrait:ident -> $extname:ident) => {
        #[allow(missing_docs)]
        pub type $extname<'a, T> = &'a mut dyn $exttrait<Error = <T as Target>::Error>;
    };
}

define_ops!(TargetBase -> TargetBaseOps);
define_ops!(TargetExtIncDec -> TargetExtIncDecOps);
define_ops!(TargetExtMul -> TargetExtMulOps);
```

类似于 Go 中的 [接口转换](https://golang.org/doc/effective_go.html#interface_conversions)。

- https://stackoverflow.com/questions/27892375/can-i-do-type-introspection-with-trait-objects-and-then-downcast-it

#### 技术概述

内联动态扩展 Trait 的基本原理最好通过示例来解释：

- （库）创建一个新的 `trait MyFeat: Target { ... }`。
  - 使 `MyFeat` 成为 `Target` 的超 trait，可以使用 `Target` 的关联类型。
- （库）通过一个新的 `Target` 方法将 `MyFeat` 扩展链接到原始 `Target` trait。签名根据扩展类型而有所不同：

```rust
// 使用类型定义以提高可读性
type MyFeatExt<T> = &'a mut dyn MyFeat<Arch = <T as Target>::Arch, Error = <T as Target>::Error>;

trait Target {
    // 必需的扩展
    fn ext_my_feat(&mut self) -> MyFeatExt<Self>;
    // 可选的扩展
    fn ext_my_feat(&mut self) -> Option<MyFeatExt<Self>> {
        None
    }
    // 互斥的扩展
    fn either_a_or_b(&mut self) -> EitherOrExt<Self::Arch, Self::Error>;
}
enum EitherOrExt<A, E> {
    MyFeatA(&'a mut dyn MyFeatA<Arch = A, Error = E>),
    MyFeatB(&'a mut dyn MyFeatB<Arch = A, Error = E>),
}
```

- （用户）为其目标实现 `MyFeat`。
- （用户）实现 `Target`，在需要 `MyFeatExt<Self>` 时返回 `self`。

```rust
impl Target for MyTarget {
    // 必需的扩展
    fn ext_my_feat(&mut self) -> MyFeatExt<Self> {
        self
    }
    // 可选的扩展 - 已实现
    fn ext_my_optfeat(&mut self) -> Option<MyFeatExt<Self>> {
        Some(self) // 如果 `MyTarget` 也实现了 `MyFeat`，否则无法编译
    }
    // 互斥的扩展
    fn either_a_or_b(&mut self) -> EitherOrExt<Self::Arch, Self::Error> {
        EitherOrExt::MyFeatA(self)
    }
}
```

- （库）现在可以查询扩展是否可用，而无需实际调用目标上的任何方法！

```rust
// 在接受 `target: impl Target` 的方法中
match target.ext_my_optfeat() {
    Some(ops) => ops.cool_feature(),
    None => { /* Report unsupport */
    }
}
```

如果你查看生成的汇编代码（例如：使用 godbolt.org），你会发现编译器能够内联并去虚拟化所有的 `ext_` 方法，这反过来允许死代码消除器发挥作用，移除库代码中所有未使用的分支！即：如果一个目标不支持 `MyFeat`，那么上面的 `match` 语句将等同于直接调用 `self.cool_feature()`！

### 注意事项：

恶意实现

类似的过去问题：https://github.com/rust-lang/rust/issues/29701

简而言之：没有理由说一个实现不能返回一些不是 `self` 的东西。

```rust
impl Target for AdvancedTarget {
    type Error = &'static str;

    #[inline(always)]
    fn base(&mut self) -> TargetBaseOps<Self> {
        if fifty_fifty() {
            TargetBaseOps::A(self)
        } else {
            TargetBaseOps::B(self)
        }
    }

    #[inline(always)]
    fn ext_incdec(&mut self) -> Option<TargetExtIncDecOps<Self>> {
        if fifty_fifty() {
            Some(self)
        } else {
            None
        }
    }

    #[inline(always)]
    fn ext_mul(&mut self) -> Option<TargetExtMulOps<Self>> {
        Some(self)
    }
}
```

### （待办？）探索如何使用特化简化这一过程

- https://www.reddit.com/r/rust/comments/8wbfi3/conditional_compilation_based_on_traits/
- https://www.reddit.com/r/rust/comments/g5gly6/any_hacks_to_imitate_specialisation/

### （待办）：使用 `Any` 解决这个问题？

- 毕竟，这种技术几乎就是将基类型向下转换为一组已知的“派生”类型，对吧？
  - https://users.rust-lang.org/t/how-to-downcast-from-trait-object/5852
- 根据 https://www.reddit.com/r/rust/comments/85ki2p/downcasting_a_trait_object/，没有任何方法可以向下转换 trait 对象，但第三方 crate 可以做到
  - 也许 `traitcast`？https://docs.rs/traitcast/0.5.0/traitcast/index.html？
    - 看起来 https://github.com/CodeChain-io/intertrait 是对它的严格改进？
  - `traitcast` 似乎几乎就是这样做的，尽管有一些注意事项
    - 不兼容 `#![no_std]`
    - 依赖于 `Any` trait
    - 使用链接时的技巧来构建有效转换的映射
    - （尚未进行基准测试），使用 `lazy_static` 暗示优化不会容易
    - 仍然需要用户显式指定具体类型实现了各种 trait
      - `traitcast!` 宏，或 `#[cast_to(...)]` 标记

如果你可以直接写 `fn foo_ext(&mut self) -> Option<impl FooExt<Self>>;` 那该多好？可惜，你不能在 trait 定义中这样做。

## 总结和比较

### 特性比较

#### 方法可以在运行时启用/禁用

除了 `cargo` 特性和特化之外的每种技术。

#### API 消费者易于理解和实现

|                               | `cargo` 特性 | `is_supported` | Options | 函数指针 | IDETs | 特化 |
| ----------------------------- | ------------ | -------------- | ------- | -------- | ----- | ---- |
| 看起来像一个“典型”的 Rust API | ✔️            | ✔️              | ✔️\*     | ❌        | ➖     | ✔️    |
| 使用“标准”方法签名            | ✔️            | ✔️              | ❌       | ✔️        | ✔️     | ✔️    |
| 方法实现的单一“真理来源”      | ✔️            | ❌              | ✔️       | ❌\*\*    | ❌\*\* | ✔️    |

\* `OptResult` 类型可能会引起混淆

\*\* 参见[未来工作](#future-work)以了解如何缓解这一问题

#### API 作者易于使用和维护

|                                | `cargo` 特性 | `is_supported` | Options | 函数指针 | IDETs | 特化 |
| ------------------------------ | ------------ | -------------- | ------- | -------- | ----- | ---- |
| 调用方法时的样板代码最少       | ✔️            | ➖              | ❌       | ➖        | ➖     | ✔️    |
| 在调用方法之前检查方法是否存在 | N/A          | ✔️              | ❌       | ✔️        | ✔️     | N/A  |
| 易于处理“缺失方法”的情况       | ✔️            | ✔️              | ❌       | ✔️        | ✔️     | ✔️    |

#### 编译时安全性和性能

“如果它能编译，它就是一个有效的实现”

|                      | `cargo` 特性 | `is_supported` | Options | 函数指针 | IDETs | 特化 |
| -------------------- | ------------ | -------------- | ------- | -------- | ----- | ---- |
| 编译时互相依赖的方法 | ✔️            | ❌              | ❌       | ✔️        | ✔️     | ✔️    |
| 编译时互相排斥的方法 | ✔️            | ❌              | ❌       | ✔️        | ✔️\*   | ❔    |
| 确保有效的死代码消除 | ✔️++          | ✔️\*\*          | ❌       | ✔️\*\*    | ✔️\*\* | ✔️    |

\* 假设实现遵循约定且不是“恶意的”

\*\* 可能需要额外的“提示”以确保死代码消除

### 性能分析

[daniel5151/optional-trait-methods](https://github.com/daniel5151/optional-trait-methods) 包含许多这些方法的示例代码，并包括汇编列表。

待办：将 `NOTES.md` 的内容整合到本文档中。

## 结论

优化编译器是魔法。
Rust 的类型系统非常强大。
API 设计很难。

对于“动态”可选方法，我认为 IDETs 是最干净的一种（因此我在 `gdbstub` 中广泛使用了这种技术）。

- 结果是最干净的 `Controller` 实现
- 虽然 API 有点不正统，但并不难理解/实现，并且带来了重大好处

## 未来工作

- 创建一个 proc 宏以简化 IDETs 的声明和实现

随便想想：

```rust
#[optional_trait_methods]
pub trait Target {
    type Error;

    fn get_state(&self) -> isize;
    fn set_state(&mut self, n: isize) -> Result<(), Self::Error>;

    #[optional(group = "incdec")]
    fn inc(&mut self) -> Result<(), Self::Error>;

    #[optional(group = "incdec")]
    fn dec(&mut self) -> Result<(), Self::Error>;

    #[optional(group = "mul")]
    fn mul(&mut self, n: isize) -> Result<(), Self::Error>;
}

#[optional_trait_methods]
impl Target for AdvancedTarget {
    type Error;

    fn get_state(&self) -> isize { /* ... */ }
    fn set_state(&mut self, n: isize) -> Result<(), Self::Error> { /* ... */ }

    // 是否可以省略这些注释，并让 proc 宏从原始声明中推断组？

    #[optional(group = "incdec")]
    fn inc(&mut self) -> Result<(), Self::Error> { /* ... */ }
    #[optional(group = "incdec")]
    fn dec(&mut self) -> Result<(), Self::Error> { /* ... */ }

    #[optional(group = "mul")]
    fn mul(&mut self, n: isize) -> Result<(), Self::Error> { /* ... */ }
}
```
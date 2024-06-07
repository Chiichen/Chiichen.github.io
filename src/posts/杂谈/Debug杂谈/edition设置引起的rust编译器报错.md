---
title: Edition 设置引起的一个 Rust 编译器报错

# cover: /assets/images/cover1.jpg

icon: page
order: 1
author: Chiichen
date: 2023-11-15
category:
  - 杂谈
  - Debug杂谈
  - Rust
tag:
  - Rust
sticky: false
star: false
footer:
copyright: 转载请注明出处
---

## 背景

交流过程可见于 [Github Discussions](https://github.com/zesterer/chumsky/discussions/564)。起因是我在学习 rust 的一个 PEG(Parser Expression Generator)库来实现编译器的时候，看到了这段示例代码 [nano_rs](https://github.com/zesterer/chumsky/blob/main/examples/nano_rust.rs)，当我把它复制进我的项目中时发生了报错

```bash
error: lifetime may not live long enough
   --> src/parser/chumsky_parser/nano_rs.rs:206:5
    |
200 |   fn expr_parser<'tokens, 'src: 'tokens>() -> impl Parser<
    |                  -------  ---- lifetime `'src` defined here
    |                  |
    |                  lifetime `'tokens` defined here
...
206 | /     recursive(|expr| {
207 | |         let inline_expr = recursive(|inline_expr| {
208 | |             let val = select! {
209 | |                 Token::Null => Expr::Value(Value::Null),
...   |
405 | |             )
406 | |     })
    | |______^ function was supposed to return data with lifetime `'src` but it is returning data with lifetime `'tokens`
    |
    = help: consider adding the following bound: `'tokens: 'src`
```

然后我尝试了在`chumsky`项目中直接运行

```bash
cargo run --example nano_rust -- examples/sample.nrs
```

这样是不会报错的，于是我开始排查

## 问题所在

我创建了一个新项目，一点点试，结果发现把原来的 `src` 直接拷贝到新项目中是没有问题的。最后发现是 `cargo.toml` 中的 `edition` 字段影响了这个结果。也就是说，只要把

```yml
[package]
name = "nano_rs"
version = "0.1.0"
# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
chumsky = { version = "1.0.0-alpha.6", features = ["label"] }
ariadne = "0.3.0"
```

改成

```yml
[package]
name = "nano_rs"
version = "0.1.0"
edition = "2021"
# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
chumsky = { version = "1.0.0-alpha.6", features = ["label"] }
ariadne = "0.3.0"
```

就不会出现这个错误了。但是具体的原因我还不清楚，cargo 生成的 rustc 编译命令中也只是把 `edition = "2021"` 作为参数传入了，暂不清楚这个参数具体是怎么作用于编译器的，虽然按照官方的说法，如果不指定 `edition = "2015|2018|2021"` 默认是用 `edition = "2015"`的，但是在系统内是没有这个版本的编译器的，我猜测这个 edition 是通过开关某些 feature 来实现的，因此虽然安装的是最新的编译器，但是默认使用了 2015 的 feature，就会导致编译器行为异常

---
title: Github 中配置 Cargo 项目的 Workflow
# cover: /assets/images/cover1.jpg
icon: page
order: 1
author: Chiichen
date: 2023-11-07
category:
  - 杂谈
  - 编程杂谈
tag:
  - Github Workflow
sticky: false
star: false
footer:
copyright: 转载请注明出处
---

## 项目背景

[rcc 编译器](https://github.com/RccCommunity/rcc)

## 示例

```yml
name: Rust

on: [push, pull_request]

env:
  CARGO_TERM_COLOR: always

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check out
        uses: actions/checkout@v3
      - name: Set up cargo cache
        uses: actions/cache@v3
        with:
          path: |
            ./target
            ~/.cargo
          key: debug-${{ runner.os }}-${{ hashFiles('rust-toolchain.toml') }}-${{ hashFiles('Cargo.lock') }}
          restore-keys: |
            debug-${{ runner.os }}-${{ hashFiles('rust-toolchain.toml') }}-
            debug-${{ runner.os }}-
      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: nightly
          override: true
          components: rustfmt, clippy
      - name: Lint
        run: |
          cargo fmt --all -- --check
          cargo clippy -- -D warnings
      - name: Install cargo check tools
        run: |
          cargo install --locked cargo-deny || true
          cargo install --locked cargo-outdated || true
          cargo install --locked cargo-udeps || true
          cargo install --locked cargo-audit || true
          cargo install --locked cargo-pants || true
      - name: Rustfmt
        run: cargo fmt --all -- --check
      - name: Check
        run: |
          cargo deny check
          cargo outdated
          cargo udeps
          rm -rf ~/.cargo/advisory-db
          cargo audit
          cargo pants
      - name: Test
        run: cargo test
      - name: Build
        run: cargo build --verbose
```

:::info
但是 actions-rs/toolchain@v1 在 2023 年 10 月被 Archived 了，所以后面等没用了要看看有没有别的替代品，没有的话就只能自己写一个了
:::

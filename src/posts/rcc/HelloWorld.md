---
title: template
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: ChiChen
date: 2023/11/1
category:
  - 笔记
  - 编译器
tag:
  - 编译器
# this page is sticky in article list
sticky: false
# this page will appear in starred articles
star: false
footer:
isOriginal: true
copyright: 转载请注明出处
---

```bash
sudo apt-get -y install clang curl llvm-14.0.0-dev
```

```bash
sudo ln -s /usr/bin/llvm-config-14.0.0 /usr/bin/llvm-config
#如果llvm-config已存在，先删除一下再创建软链接
sudo rm -f /usr/bin/llvm-config
```

```rust
// in /main.rs
//! Construct a function that does nothing in LLVM IR.

extern crate llvm_sys as llvm;

use std::ptr;

fn main() {
    unsafe {
        // Set up a context, module and builder in that context.
        let context = llvm::core::LLVMContextCreate();
        let module = llvm::core::LLVMModuleCreateWithName(b"nop\0".as_ptr() as *const _);
        let builder = llvm::core::LLVMCreateBuilderInContext(context);

        // Get the type signature for void nop(void);
        // Then create it in our module.
        let void = llvm::core::LLVMVoidTypeInContext(context);
        let function_type = llvm::core::LLVMFunctionType(void, ptr::null_mut(), 0, 0);
        let function = llvm::core::LLVMAddFunction(module, b"nop\0".as_ptr() as *const _, function_type);

        // Create a basic block in the function and set our builder to generate
        // code in it.
        let bb = llvm::core::LLVMAppendBasicBlockInContext(context, function,b"entry\0".as_ptr() as *const _);
        llvm::core::LLVMPositionBuilderAtEnd(builder, bb);

        // Emit a `ret void` into the function
        llvm::core::LLVMBuildRetVoid(builder);

        // Dump the module as IR to stdout.
        llvm::core::LLVMDumpModule(module);

        // Clean up. Values created in the context mostly get cleaned up there.
        llvm::core::LLVMDisposeBuilder(builder);
        llvm::core::LLVMDisposeModule(module);
        llvm::core::LLVMContextDispose(context);
    }
}
```

```toml
in /Cargo.toml
[package]
name = "llvm-example"
version = "0.1.0"
authors = ["Ulysse Carion <ulysse@ulysse.io>"]

[[bin]]
name = "main"

[dependencies]
llvm-sys = "140" #对应 14版本的llvm
```

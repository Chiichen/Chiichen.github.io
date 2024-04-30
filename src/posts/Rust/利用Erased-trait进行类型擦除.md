---
title: 利用Erased-trait进行类型擦除
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: ChiChen
date: 2024/04/30
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

## 为什么要类型擦除

这里的类型擦除和通常我们听到的，在 Java 里的类型擦除不太一样，这里的类型擦除是指，通过某些手段，屏蔽掉一些我们不关心的范型，从而达到统一存储的目的，这样说可能很抽象，直接看代码

```rust
pub trait Source{
    type Event
    pub fn poll(&self)->Result<Self::Event,SourceError>
}

pub struct SourceEntry<S:Source,T>{
    source:S,
    callback: Box<dyn Fn(S::Event,T)>
}

pub struct SourceList<S:Source,T>{
    sources:Vec<Rc<RefCell<SourceEntry<S,T>>>>
}
```

我想实现一个事件源的队列，然后每次 poll 对应的事件，如果 poll 方法返回`Ok(event)`，就使用对应的回调进行处理，接收事件本身带来的`event`和从外部传入的参数`T`，这看起来没什么问题，但是，如果我要存储多个类型的事件源(或者有不同 event 的同种源，例如`type Event = ()`和`type Event = Instant`这两种`Timeout`事件源，实际上是不同类型的 Source)，因为`Vec<>`只能存储相同类型的对象，因此就没办法通过一个`SourceList`存储了，而从上层的视角来看，我其实并不关心底层的`Source`是什么类型，我只是想要知道`poll`的结果，然后传一个`T`类型的参数给回调闭包即可，所以我们就需要通过一些方法，把`S`类型擦除掉，对上层只保留`T`范型。

## 抽象层

> All problems in computer science can be solved by another level of indirection
> —— Butler Lampson

我们现在知道，不管怎样，总会有一个中间层需要同时处理底层`poll`返回的`event`和上层传来的`T`，然后视结果对 callback 进行调用，我们不妨先记为

```rust
pub trait SourceDispatcher<T> {
    fn poll(&mut self, value: &mut T) -> Result<(), SourceError>;
}
```

同时，因为我们希望`S`和`T`只会同时出现在这一层，也就是把`S`隔离在底层，`T`隔离在上层，因此 `callback` 应该设计成一个没有类型的形式，再在中间层进行约束

```rust
pub struct SourceEntry<S,F>{
    source:S,
    callback: F
}
```

并实现`SourceDispatcher`

```rust
impl<S, T, F> SourceDispatcher<T> for RefCell<SourceEntry<S, F>>
where
    S: Source,
    F: FnMut(S::Event, &mut T),
{
    fn poll(&mut self, value: &mut T) -> Result<(), SourceError> {
        let mut entry = self.borrow_mut();
        let r = entry.source.poll();
        if let Ok(msg) = r {
            (entry.callback)(msg, value);
            return Ok(());
        } else {
            return r.unwrap_err();
        }
    }
}
```

那么我只要实现从`RefCell<SourceEntry<S, F>>`到`dyn SourceDispatcher<T>`到转换就可以了，这里就引入了`erased trait`

## Erased Trait

```rust
trait ErasedDispatcher<'a, S, T> {
    fn as_source_ref(&self) -> Ref<S>;
    fn as_source_mut(&self) -> RefMut<S>;
    fn into_source_inner(self: Rc<Self>) -> S;
    fn into_event_dispatcher(self: Rc<Self>) -> Rc<dyn SourceDispatcher<T> + 'a>;
}


impl<'a, S, T, F> ErasedDispatcher<'a, S, T> for RefCell<SourceEntry<S, F>>
where
    S: Source + 'a,
    F: FnMut(S::Event, &mut T) + 'a,
{
    fn as_source_ref(&self) -> Ref<S> {
        return Ref::map(self.borrow(), |inner| &inner.source);
    }

    fn as_source_mut(&self) -> RefMut<S> {
        return RefMut::map(self.borrow_mut(), |inner| &mut inner.source);
    }

    fn into_source_inner(self: Rc<Self>) -> S {
        if let Ok(ref_cell) = Rc::try_unwrap(self) {
            ref_cell.into_inner().source
        } else {
            panic!("Dispatcher is borrowed");
        }
    }

    fn into_event_dispatcher(self: Rc<Self>) -> Rc<dyn SourceDispatcher<T> + 'a> {
        self as Rc<dyn SourceDispatcher<T> + 'a>
    }
}
```

至此，`source_list`就可以被转换成，屏蔽掉了`S`类型

```rust
pub struct SourceList<T>{
    sources: Vec<Box<dyn SourceDispatcher<T>>>
}
```

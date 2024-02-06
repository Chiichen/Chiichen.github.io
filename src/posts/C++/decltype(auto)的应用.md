---
title: 记一次 GP Debug 的心路历程
# cover: /assets/images/cover1.jpg

icon: page
order: 1
author: ChiChen
date: 2023-10-19
category:
  - C++
tag:
  - C++
sticky: false
star: false
footer: 
copyright: 转载请注明出处
---

## 非模板中应用

印象中google的C++编程规范手册说过，如果不是为了代码更安全或者不熟悉项目的人读起来更方便，尽量不要使用类型推导，比如为了省显示类型书写。

### 最常见推导

对于变量或者普通的返回值来说，常见有4种auto用法，还有一种`const auto &&`基本没有用，不去讨论。

1. `auto`: 产生拷贝,可以修改
2. `auto&`: 左值引用，接受左值，可以修改
3. `const auto&`: const引用,可以接受左右值，不可修改
4. `auto&&`: 万能引用，可以接受左右值，const引用时不能修改

代码示例：

```cpp
int a = 100;
const int b = 100;
auto a1 = 3; // a1为int
auto a2 = a; // a2为int
auto& a3 = a;// a3为int&,左引用
auto&& a4 = a;// a4为int&,左引用
auto&& a5 = 102;// a5为int&&,右引用
auto&& a6 = b;// a6为const int&,左引用
const auto& a7 = b;// a7为const int&,左引用
const auto&& a8 = 103;// a8为const int&&,右引用
auto* p1 = &a;// p1为int*
const auto* p2 = &a;// p2为const int*
auto p3 = &TestType::v1; // p3为int TestType::*,成员对象指针
```

这里对于最普通的`auto`写法，就算=右边的表达式或者函数返回是引用，这里也还是会`产生一次拷贝的代价，产生副本`，现实项目还遇到代码非常复杂，有新人不熟悉业务，刚好这个类没有实现深拷贝导致拷贝崩溃的。如果从安全角度出发推荐用`const auto&`，因为如果产生了修改编译不过，再推荐用`auto&&`万能引用。

`decltype(auto)` 本质是对括号auto的表达式替换，然后再decltype推断。

### 函数返回值推导

auto可以作函数返回值的推导，我了解有三类写法,相互接近，但有时略有不同。

1. 最普通的`auto作返回`，编译器会从返回语句的所用表达式类型推到，符合模板实参推导，对应下面示例代码中fun1,fun2,funlambda
2. `auto配合尾随返回类型`，在模板编程中用的比较多些，函数返回类型为尾随返回类型，一般来说这种用于复杂的或者不太好直接书写的返回类型,比如`函数指针`，对应下面示例代码中fun3,fun4，funp,作为对比：funp写法明显比以前的funp1写法易读
3. `decltype(auto)作返回`,它实质是将返回值表达式代入到auto然后`再用decltype规则进行推断`，所以是不同于第一种的，比如直接推出引用，对应下面示例代码中fun5,fun6

```cpp
// 返回值是float型
auto fun1(float a) {return a;}
// 返回值是const float&型
const auto& fun2() {return a;}
// 返回值是lambda表达式
auto funlambda() { 
  return [](int a)->int {return a; };}

// 返回值是float型,尾随返回类型
auto fun3(float a)->float {return a;}
auto fun33(float a)->auto { return a;}
// 返回值是doulbe型,尾随返回类型
// 由表达式(a+b)类型推出
auto fun4(int a,double b)
    ->decltype(a+b)
{ return a+b;}
// 返回值是函数指针,尾随返回类型
// 函数是返回int型，传float与double两个参数
auto funp(int)
    ->int (*)(float, double)
{ return testfun;}
// funp1以前的写法,很不直观
int (*funp1(int))(float, double)
{ return testfun;}    

// 返回值是float型，decltype(value)
float value;
decltype(auto) fun5() {return value;}
// 返回值是float&型,decltype((value))
decltype(auto) fun6(){return (value);}
```

函数返回中也有几个注意点：

- 不能对虚函数用auto作返回推断
- 返回值类型必一致，比如if，else返回有return 18和return 18.f时不通过,我们平时不用auto写法可以,只是发生了转换
- 不能对decltype(auto)进行修饰,比如加上const或&等
- 不能对返回语句是花括号初始化器列表推导，如auto fun7() return {1};

## 在模板中的应用

### 普通函数内实用简写

通常模板类通过相互嵌套略微复杂，显示写出类型会比较长，在语意明确的情况下，可以用auto简写，这种情况可以用typedef或using代替，如下代码：

```cpp
std::map<std::string,
      std::pair<MyTestClass::DataType,
              bool(*)(const MyTestClass::DataType&)>
    > myMap;
// 简写迭代器
auto iter = myMap.find("abcd");
// 简写unique_ptr
auto unptr_TestClass = std::make_unique<MyTestClass>();

```

### 模板函数中简写

普通函数内简写可能还比较容易，或者感觉只是省略一点点，但我们再放到模板类或模板函数中，可能就比较有用了，可以省去很多typename,给一段对比代码

```cpp
template<typename TContainer>
void TestContainer(const TContainer& cont)
{
  // 简写pos
  auto pos = cont.begin();
  while (pos != cont.end())
  {
    // 简写elem
    auto& elem = *pos++;
    // .....
    // 也可以这样
    decltype(*pos) elem1 = *pos;
    decltype(auto) elem1 =*pos;
  }

  // 显示全写pos
  typename TContainer::iterator pos = cont.begin();
  while (pos != cont.end())
  {
      // 显示全写elem，用了两个typename
      typename std::iterator_traits<
                  typename TContainer::iterator
          >::reference elem = *pos++;
      // .....
  }
}
```

### auto非类型模板形参推断

在C++模板形参中，还有一部分为非类型的，比如直接整数18，枚举类型，在[从常量字符串编译期映射初探C++模板元编程《一》](https://zhuanlan.zhihu.com/p/377145104)一文中有经典用法，我人我们先看一个例子：

```cpp
template<typename T,T v>
struct TNonType{};
// 非类型示例，形参100是整数
TNonType<int, 100> t1;
```

从C++17起，这种无类型形参，可以用auto代替,根据规定，可以由下面类型

- 整数类型
- 指针类型
- 左引用类型
- 成员指针类型
- 枚举

```cpp
std::nullptr_t
template<auto  v>
struct TNonTypeAuto
{
    using TType = decltype(v);
};
// auto 推断为int
TNonTypeAuto<100> t2;
// auto 推断为float,C++ 20起
TNonTypeAuto<100.f> t3;
```

还可以支持`模板参数包`，就是可变的多个模板参数，类型可以一致也可以不一致，每个`auto就单独推导的`

```cpp
template<auto ...vs>
struct TNonTypeAutos{};
// auto... 推断为int,int,int
TNonTypeAutos<1, 2, 3> t4;
// auto... 推断为int,char,nullptr
TNonTypeAutos < 1, 'a', nullptr > t5;

template<auto v,decltype(v)... resets>
struct TNonTypeAutosSame{};
// 形参必须都是一致或者直接转换
TNonTypeAutosSame < 'a', 'b','c','d'> t6;
// t7编译错误,类型不一致
TNonTypeAutosSame < 'a', 'b', 'c', nullptr> t7;
```

对于C++17也可以用decltype(auto) 作模板参数

```cpp
template<decltype(auto) v>
struct TNonTypeDecltypeAuto{};

constexpr int a1 = 100;
TNonTypeDecltypeAuto<a1> t8; // int
extern int g_value;
TNonTypeDecltypeAuto<(g_value)> t9;// int&
```

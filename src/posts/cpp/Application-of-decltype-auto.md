---
title: decltype(auto)的应用
# cover: /assets/images/cover1.jpg
icon: page
order: 1
author: Chiichen
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

印象中 google 的 C++编程规范手册说过，如果不是为了代码更安全或者不熟悉项目的人读起来更方便，尽量不要使用类型推导，比如为了省显示类型书写。

### 最常见推导

对于变量或者普通的返回值来说，常见有 4 种 auto 用法，还有一种`const auto &&`基本没有用，不去讨论。

1. `auto`: 产生拷贝,可以修改
2. `auto&`: 左值引用，接受左值，可以修改
3. `const auto&`: const 引用,可以接受左右值，不可修改
4. `auto&&`: 万能引用，可以接受左右值，const 引用时不能修改

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

`decltype(auto)` 本质是对括号 auto 的表达式替换，然后再 decltype 推断。

### 函数返回值推导

auto 可以作函数返回值的推导，我了解有三类写法,相互接近，但有时略有不同。

1. 最普通的`auto作返回`，编译器会从返回语句的所用表达式类型推到，符合模板实参推导，对应下面示例代码中 fun1,fun2,funlambda
2. `auto配合尾随返回类型`，在模板编程中用的比较多些，函数返回类型为尾随返回类型，一般来说这种用于复杂的或者不太好直接书写的返回类型,比如`函数指针`，对应下面示例代码中 fun3,fun4，funp,作为对比：funp 写法明显比以前的 funp1 写法易读
3. `decltype(auto)作返回`,它实质是将返回值表达式代入到 auto 然后`再用decltype规则进行推断`，所以是不同于第一种的，比如直接推出引用，对应下面示例代码中 fun5,fun6

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

- 不能对虚函数用 auto 作返回推断
- 返回值类型必一致，比如 if，else 返回有 return 18 和 return 18.f 时不通过,我们平时不用 auto 写法可以,只是发生了转换
- 不能对 decltype(auto)进行修饰,比如加上 const 或&等
- 不能对返回语句是花括号初始化器列表推导，如 auto fun7() return {1};

:::info 关于 auto 与 decltype(auto)以及 return a 与 return (a)的区别

- `auto`默认为永不推断为引用，而`decltype(auto)`会根据实际情况可能推断为引用
- 在使用`auto`为返回值时，`return a` 和 `return (a)`没区别(a 为一个标识符，)
- 而在用 decltype(auto)为返回值时，`return a`的返回类型就是标识符`a`的声明类型(假设为`int a`)即为`int`，而`(a)`是一个表达式，因此会把这个左值推断为引用类型，即为`int& a`，因此如果返回值改为`(a++)`，这是个右值，因此类型推导为`int`
  :::

## 在模板中的应用

### 普通函数内实用简写

通常模板类通过相互嵌套略微复杂，显示写出类型会比较长，在语意明确的情况下，可以用 auto 简写，这种情况可以用 typedef 或 using 代替，如下代码：

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

普通函数内简写可能还比较容易，或者感觉只是省略一点点，但我们再放到模板类或模板函数中，可能就比较有用了，可以省去很多 typename,给一段对比代码

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

### auto 非类型模板形参推断

在 C++模板形参中，还有一部分为非类型的，比如直接整数 18，枚举类型，在[从常量字符串编译期映射初探 C++模板元编程《一》](https://zhuanlan.zhihu.com/p/377145104)一文中有经典用法，我人我们先看一个例子：

```cpp
template<typename T,T v>
struct TNonType{};
// 非类型示例，形参100是整数
TNonType<int, 100> t1;
```

从 C++17 起，这种无类型形参，可以用 auto 代替,根据规定，可以由下面类型

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

对于 C++17 也可以用 decltype(auto) 作模板参数

```cpp
template<decltype(auto) v>
struct TNonTypeDecltypeAuto{};

constexpr int a1 = 100;
TNonTypeDecltypeAuto<a1> t8; // int
extern int g_value;
TNonTypeDecltypeAuto<(g_value)> t9;// int&
```

### 模板 auto 综合类型擦除应用

我们来看一应用，算是比较综合，体会一下 auto 的妙用，可以更加通用，不用显式传入类型，做到类型擦除。这里用到了成员对象指针和对应用法，不太了解的可以参考文章[C++中几种原生指针（普通指针，成员指针，函数指针）](https://zhuanlan.zhihu.com/p/361462790)

```cpp
struct OneTestStruct
{
    int value;
};

// 辅助模板，获取class的类型
template<typename>
struct PMClassHelper;

// 特化
template<typename ClassType,typename MemberType>
struct PMClassHelper<MemberType ClassType::*>
{
    using Type = ClassType;
};

// 模板别名
// 给一个成员对象指针，提取出类型
template<typename PM>
using PMClassType = typename PMClassHelper<PM>::Type;

template<auto PMD>
struct CounterHandle
{
    CounterHandle(PMClassType<decltype(PMD)>& _c) :c(_c) {}
    void increase() { ++(c.*PMD); }

    PMClassType<decltype(PMD)>& c;
};
// 应用
OneTestStruct one{ 100 };
CounterHandle<&OneTestStruct::value> h(one);
h.increase();
```

辅助模板`PMClassHelper`用于给一个成员对象指针 PM 作模板参数（形式如：T1 T2::\*），推断出指针对应类的类型 ClassType，以及成员对象类型 MemberType；`CounterHandle`模板类使用 auto PMD 作参数，是一个非类型的模板形参，当为成员对象指针时实例化时，decltype(PMD)能推出其指针类型 T1 T2::\*；然后用 PMClassType 相当于萃取出 T2 的具体类型，也就是\_c 所对应类。结构看到这里，基本发现有个很重要设计点，就是类型擦除。

再看一下`CounterHandle`设计，其成员 c 是一个引用类型，在构造函数里面初始化，不产生拷贝，保证一定性能，通过 auto 与 decltype 的联合设计，可以不显示声明类型，可以做到类型擦除。在 increase 函数，调用成员对象指针自增，可以统一出一个接口，也可以进行特化处理，这都是模板编程的常用手段。

我们再看一下，不用 auto,要么用`template<typename T1,T1 v> struct CounterHandleOld`定义时不显式，但需要在实例化时显式声明`CounterHandleOld<int OneTestStruct::*,&OneTestStruct::value>` ,要么`template<int OneTestStruct::*v> struct CounterHandleOld2`显式定义，更不好的设计，但实例化可以隐式`CounterHandleOld2<&OneTestStruct::value>`。

```cpp
template<typename T1,T1 v>
struct CounterHandleOld
{
  CounterHandleOld(PMClassType<T1>& _c)
    :c(_c) {}
  void increase() { ++(c.*v); }

  PMClassType<T1>& c;
};

template<int OneTestStruct::*v>
struct CounterHandleOld2
{
  CounterHandleOld2(PMClassType<decltype(v)>& _c)
    :c(_c) {}
  void increase() { ++(c.*v); }

  PMClassType<decltype(v)>& c;
};

// 应用
CounterHandleOld<int OneTestStruct::*,
          &OneTestStruct::value> h1(one);
h1.increase();
CounterHandleOld2<&OneTestStruct::value> h2(one);
h2.increase();
```

## 在泛型 lambda 中应用

可以用 auto 代替难以书写的 lambda 表达式类型，这是最常用的

```cpp
auto alam1= [](int x)->int {return x; };
```

泛型 lambda 表达式：
对于形参中为 auto 的参数，该 lambda 为泛型 lambda 表达式。

```cpp
auto alam2 = [](auto a, auto&& b) { return a < b; };
bool b = alam2(100, 100.1f);

auto alam3 = []<class T>(T a, auto&& b) { return a < b; };

template<typename F,typename ... Params>
void MyInvoke(F f,Params... ps)
{
    f(ps...);
}
MyInvoke([]
      (auto x, auto y)
      {std::cout << x + y << std::endl; },
      100, 101);
```

## 结构化绑定、

这一小部分也是 C++17 引入，将指定的名称绑到指定对象上，算是已有对象的别名，和引用相似，但不一定为引用类型。先看一下代码：

```cpp
struct  stBindType
{
    bool bValid;
    int iValue;
};
stBindType st{true,100};
auto [b, N] = st;
auto& [br, Nr] = st;
```

第一处：创建一个对象 e，将 st 内容复制到 e，期中 b 指代 e 的 bValid，N 指代 e 的 iValue
第二处：直接 br 指代 st 的 bValid，Nr 指代 st 的 iValue
结构化绑定，这一块我用的不多，其它不再讨论。

## 参考

基本内容搬运自[谈谈 C++的 auto，decltype(auto)及在模板中的应用](https://zhuanlan.zhihu.com/p/404831186)

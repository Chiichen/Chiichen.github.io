---
title: 解决在VSCode里刷Leetcode的重定义问题
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: Chiichen
date: 2024-01-27
category:
  - 杂谈
tag:
  - 杂谈/编程杂谈
# this page is sticky in article list
sticky: false
# this page will appear in starred articles
star: false
footer:
isOriginal: true
copyright: 转载请注明出处
---

## 背景

最近刷了几道 Leetcode，感觉没有补全写得太不舒服了，所以用 Leetcode 官方插件搭配 VSCode 写，用 xmake 构建，用 clangd 提供代码补全，写起来体验很好，但是还是有一个小问题

## 问题

比如以下默认代码

```cpp

// Definition for a binary tree node.
// struct TreeNode {
//   int val;
//   TreeNode *left;
//   TreeNode *right;
//   TreeNode() : val(0), left(nullptr), right(nullptr) {}
//   TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
//   TreeNode(int x, TreeNode *left, TreeNode *right)
//       : val(x), left(left), right(right) {}
// };

class Solution {
public:
  bool isValidBST(TreeNode *root) {}
};
```

它会把`TreeNode`给注释掉，如果想在写的时候有补全就不能注释，但是不注释提交的时候就会报 redefinition 的错误，因此只能写的时候不注释，提交的时候注释掉，但是这样一点都不优雅，因此我想到了宏的方法

## 实现

因为我用的是 xmake，它用 lua 脚本作为配置文件我只需要加一行预定义宏

```lua
add_rules("mode.debug", "mode.release")

target("src")
    set_kind("static")
    add_files("src/*.cpp")
    add_defines("LOCAL") //加入这个

```

生成新的`compile_commands`

```bash
xmake project -k compile_commands
```

然后再把上面的代码改成

```cpp
#ifdef LOCAL

using namespace std;
// Definition for a binary tree node.
struct TreeNode {
  int val;
  TreeNode *left;
  TreeNode *right;
  TreeNode() : val(0), left(nullptr), right(nullptr) {}
  TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
  TreeNode(int x, TreeNode *left, TreeNode *right)
      : val(x), left(left), right(right) {}
};

#endif

class Solution {
public:
  bool isValidBST(TreeNode *root) {}}
```

就可以做到想要的效果了

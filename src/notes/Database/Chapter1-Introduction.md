---
title: Chapter1 Introduction
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: Chiichen
date: 2023-10-30
category:
  - 课程笔记
tag:
  - 数据库
# this page is sticky in article list
sticky: false
# this page will appear in starred articles
star: false
footer:
isOriginal: true
copyright: 转载请注明出处
---

## Database Management System (DBMS)

- DBMS 包括：
  1. 相关数据的集合
  2. 访问数据的程序集
  3. 一个既方便又高效的使用环境

## 文件系统存储数据的缺点

- 数据冗余和不一致：多种文件格式，不同文件中的信息重复
- 访问数据困难：需要编写新程序来执行每项新任务
- 数据隔离——多个文件和格式
- 完整性问题 ：

  - 完整性约束（例如，帐户余额 > 0）被“隐藏”在程序代码中，而不是明确声明
  - 很难添加新的约束或更改现有的约束

- 更新的原子性
  - 故障可能会使数据库处于与执行的部分更新不一致的状态
  - 示例：资金从一个账户转移到另一个账户要么完成，要么根本不发生
- 多用户并发访问
  - 并发访问以提高性能
  - 不受控制的并发访问可能会导致不一致
  - 示例：两个人同时读取余额（例如 100）并通过提款（例如每人 50）来更新余额
- 安全问题 难以向用户提供对部分（但不是全部）数据的访问权限

## 抽象层级

### 物理层(Physical level)

- 描述一条记录(record)是如何被存储的

### 逻辑层(Logical level)

- 描述数据库中存储的记录和数据之间的关系

```go
  type instructor = record{
     ID : string; 
     name : string; 
     dept_name : string; 
     salary : int;
  }
```

### 视图层(View level)

应用程序隐藏数据类型的详细信息。 出于安全目的，视图还可以隐藏信息（例如员工的工资）。

![视图层](<images/Chapter1 Introduction/20231030152526.png>)

## Instances and Schemas

类似于编程语言中的类型和变量

- Schema——数据库的逻辑结构 示例：学生（ID、姓名、部门名称、tot_cred） 类似于程序中变量的类型信息 物理模式：物理层面的数据库设计 逻辑模式：逻辑层面的数据库设计
- Instance——特定时间点数据库的实际内容，类似于变量的值
- 物理数据独立性 —— 能够在不更改逻辑模式的情况下修改物理模式
  - 应用程序取决于逻辑模式
  - 一般来说，各个层次和组件之间的接口应该被很好地定义，以便某些部分的变化不会严重影响其他部分。

## Data Models

- 描述工具的集合：
  - 数据
  - 数据关系
  - 数据语义
  - 数据限制
- 关系模型 (第二章)
- 实体-关系数据模型（主要用于数据库设计）
- 基于对象的数据模型（面向对象和对象关系）
- 半结构化数据模型 (XML)
- 其他旧模型：
  - 网络模型
  - 层次模型

## 数据操作语言(Data Manipulation Language, DML)

- 有两种类型的程序操作语言：
  - 程序性(Procedural)：用户指定需要哪些数据以及如何获取这些数据
  - 声明性(Declarative)(nonprocedural)：用户指定需要哪些数据，而不指定如何获取这些数据

## SQL

例：查找 ID 为 22222 的讲师姓名

```sql
select name
from instructor
where instructor.ID = '22222
```

应用程序通常通过以下方式之一访问数据库：

1. 允许嵌入 SQL 的语言扩展 应用程序接口（例如 ODBC/JDBC）
2. 允许将 SQL 查询发送到数据库

将在第 3、4、5 章做详细介绍

## Data Definition Language (DDL)

用于定义数据库模式的规范符号

例如：

```sql
create table instructor (
ID             char(5),
name           varchar(20),
dept_name      varchar(20),
salary         numeric(8,2))
```

- DDL 编译器生成一组存储在数据字典中的表模板
- 数据字典包含元数据（即有关数据的数据）
  - 数据库架构
  - 完整性约束
    - 主键（唯一标识讲师的 ID）
    - 引用完整性（SQL 中的引用约束）
      - 例如 任何讲师元组中的 dept_name 值必须出现在部门关系中
- 授权

## 数据库设计

- 归一化理论（第 8 章）
  - 正式确定哪些设计不好，并对其进行测试
- 实体关系模型（第 7 章）
  - 将企业建模为实体和关系的集合
    - 实体：企业中区别于其他对象的“事物”或“对象” 由一组属性描述
    - 关系：多个实体之间的关联 用实体关系图来形象地表示：

![实体关系图](<images/Chapter1 Introduction/20231030170439.png>)

## Storage Management

- 存储管理器是一个程序模块，它提供存储在数据库中的低级数据与提交给系统的应用程序和查询之间的接口。
- 存储管理器负责以下任务：
  - 与文件管理器交互
  - 高效存储、检索和更新数据
- 需要解决的问题：
  - 存储访问
  - 文件组织
  - 索引和散列

## Query Processing

1. SQL 翻译
2. 优化
3. 执行

![Query Processing](<images/Chapter1 Introduction/20231030170724.png>)

- 评估给定查询的替代方法
  - 等价表达式
  - 每个操作都有不同的算法
- 评估查询的好方法和坏方法之间的成本差异可能是巨大的
- 需要估算运营成本
  - 很大程度上取决于数据库必须维护的关系的统计信息
  - 需要估计中间结果的统计数据以计算复杂表达式的成本

## Transaction Management

- 如果系统出现故障怎么办？
- 如果多个用户同时更新相同的数据怎么办？
- 事务是在数据库应用程序中执行单个逻辑功能的操作的集合
- 事务管理组件确保即使出现系统故障（例如电源故障和操作系统崩溃）和事务失败，数据库仍保持一致（正确）状态。
- 并发控制管理器控制并发事务之间的交互，以保证数据库的一致性。

## 数据库用户和管理员

![数据库用户和管理员](<images/Chapter1 Introduction/20231030172452.png>)

## 数据库内部一览

![数据库内部一览](<images/Chapter1 Introduction/20231030172520.png>)

## 数据库架构

数据库系统的架构很大程度上取决于运行数据库的操作系统的架构

- 集中
- CS 架构(Client-Server)
- 并行（多处理器）
- 分布式

![Alt text](<images/Chapter1 Introduction/image.png>)

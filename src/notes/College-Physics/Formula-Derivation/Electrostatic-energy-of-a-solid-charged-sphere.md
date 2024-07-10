---
title: 实心带电球体静电能的推导
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: Chiichen
date: 2023-03-01
category:
  - 课程笔记
tag:
  - 计算机网络
# this page is sticky in article list
sticky: false
# this page will appear in starred articles
star: false
footer:
isOriginal: true
copyright: 转载请注明出处
---


# 均匀带电球体静电能的推导

考虑一个半径为 \( a \) 的均匀带电球体，总电荷量为 \( Q \)。我们需要计算这个球体的静电能。

## 1. 电场

根据高斯定律，球体内外的电场分别为：

$
\mathbf{E} = 
\begin{cases} 
\frac{Q \mathbf{r}}{4 \pi \epsilon_0 a^3} = \frac{\rho \mathbf{r}}{3 \epsilon_0}, & (r < a) \\
\frac{Q \mathbf{r}}{4 \pi \epsilon_0 r^3}, & (r \geq a)
\end{cases}
$

其中，\($\rho = \frac{Q}{\frac{4}{3} \pi a^3}$\) 是电荷密度。

## 2. 球内电势

球内任意点 \( $r$ \) 处的电势 \($\varphi(r)$\) 可以通过积分电场得到：

$$
\varphi(r) = \int_r^a \vec{E} \cdot d\vec{l} = \int_r^a E \, dr + \int_a^\infty E \, dr
$$

对于 \( $r < a$ \) 的情况：

$$
\varphi(r) = \int_r^a \frac{Q r}{4 \pi \epsilon_0 a^3} \, dr + \int_a^\infty \frac{Q}{4 \pi \epsilon_0 r^2} \, dr
$$

计算积分：

$$
\varphi(r) = \left. \frac{Q r^2}{8 \pi \epsilon_0 a^3} \right|_r^a + \left. -\frac{Q}{4 \pi \epsilon_0 r} \right|_a^\infty
$$

$$
\varphi(r) = \frac{Q a^2}{8 \pi \epsilon_0 a^3} - \frac{Q r^2}{8 \pi \epsilon_0 a^3} + \frac{Q}{4 \pi \epsilon_0 a}
$$

$$
\varphi(r) = \frac{Q}{4 \pi \epsilon_0 a} \left( \frac{a^2}{2 a^2} - \frac{r^2}{2 a^2} + 1 \right)
$$

$$
\varphi(r) = \frac{Q}{4 \pi \epsilon_0 a} \left( \frac{3}{2} - \frac{r^2}{2 a^2} \right)
$$

$$
\varphi(r) = \frac{Q}{4 \pi \epsilon_0 a} \left( \frac{3}{2} - \frac{r^2}{2 a^2} \right) = \frac{\rho a^2}{6 \epsilon_0} \left( 3 - \frac{r^2}{a^2} \right)
$$

## 3. 静电能

静电能 \( $W$ \) 为电荷密度和电势的乘积在整个球体体积上的积分：

$$
W = \frac{1}{2} \int_V \rho \varphi(r) \, dV
$$

$$
W = \frac{1}{2} \int_0^a \rho \left( \frac{\rho a^2}{6 \epsilon_0} \left( 3 - \frac{r^2}{a^2} \right) \right) 4 \pi r^2 \, dr
$$

$$
W = \frac{1}{2} \cdot \frac{\rho^2 a^2}{6 \epsilon_0} \cdot 4 \pi \int_0^a \left( 3 - \frac{r^2}{a^2} \right) r^2 \, dr
$$

计算积分：

$$
\int_0^a \left( 3r^2 - \frac{r^4}{a^2} \right) \, dr = \left[ r^3 - \frac{r^5}{5a^2} \right]_0^a = a^3 - \frac{a^5}{5a^2} = a^3 - \frac{a^3}{5} = \frac{4a^3}{5}
$$

因此：

$$
W = \frac{1}{2} \cdot \frac{\rho^2 a^2}{6 \epsilon_0} \cdot 4 \pi \cdot \frac{4a^3}{5} = \frac{4 \pi \rho^2 a^5}{15 \epsilon_0}
$$

将 \($\rho = \frac{Q}{\frac{4}{3} \pi a^3}$\) 代入：

$$
\rho = \frac{3Q}{4 \pi a^3}
$$

$$
W = \frac{4 \pi \left( \frac{3Q}{4 \pi a^3} \right)^2 a^5}{15 \epsilon_0} = \frac{4 \pi \cdot \frac{9Q^2}{16 \pi^2 a^6} \cdot a^5}{15 \epsilon_0} = \frac{36 Q^2}{60 \pi \epsilon_0 a} = \frac{3 Q^2}{5 \cdot 4 \pi \epsilon_0 a} = \frac{3 Q^2}{20 \pi \epsilon_0 a}
$$

## 4. 结论

均匀带电球体的静电能为：

$$
W = \frac{3 Q^2}{20 \pi \epsilon_0 a}
$$
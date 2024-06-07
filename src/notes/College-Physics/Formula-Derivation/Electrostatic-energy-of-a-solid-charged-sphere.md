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

## 推导过程

当我们考虑一个实心球体的静电能时，我们可以假设球体带有均匀的电荷密度$\rho$。我们希望推导出球体的静电能，即球体内部的电荷与外部的电荷之间的相互作用能。

首先，考虑球体内部的一个体积元素$dV$，该体积元素距离球心的距离为$r$。该体积元素所带电荷量$dQ$可以表示为：

$$dQ = \rho \cdot dV$$

接下来，我们考虑球体内部的一个点电荷元素$dQ_1$与体积元素$dV$之间的相互作用能$dU$。根据库伦定律，两个电荷之间的相互作用能可以表示为：

$$dU = \frac{1}{4\pi\epsilon_0} \cdot \frac{dQ \cdot dQ_1}{r}$$

其中，$\epsilon_0$是真空介电常数。

现在我们来计算球体内部的所有点电荷元素$dQ_1$与体积元素$dV$之间的相互作用能的总和。由于球体带有均匀的电荷密度，我们可以将$dQ_1$看作是球体内部的其他体积元素的电荷，而$dV$表示的体积元素则是球体内部的一个体积小球。因此，我们可以将$dU$表示为球体内部的所有体积小球与其他体积元素之间相互作用能的总和。这可以通过对体积元素$dV$进行积分来实现。

对球体内部的体积元素$dV$进行积分，可以得到球体的静电能$U$：

$$U = \iiint \frac{1}{4\pi\epsilon_0} \cdot \frac{dQ \cdot dQ_1}{r}$$

将$dQ$替换为$\rho \cdot dV$，并将积分范围限定在球体内部，我们可以得到：

$$U = \iiint \frac{1}{4\pi\epsilon_0} \cdot \frac{\rho \cdot dV \cdot \rho \cdot dV_1}{r}$$

其中，$dV_1$表示球体内部的另一个体积元素。

对上式进行化简，我们可以得到：

$$U = \frac{\rho^2}{8\pi\epsilon_0} \iiint \frac{dV \cdot dV_1}{r}$$

接下来，我们来解决积分部分。由于球体是对称的，我们可以使用球坐标来进行积分。设$dV$所对应的球坐标为$(r, \theta, \phi)$，$dV_1$所对应的球坐标为$(r_1, \theta_1, \phi_1)$。由于球体是实心的，所以$r$的取值范围是从$0$到球体半径$R$，$r_1$的取值范围也是从$0$到$R$。

使用球坐标进行积分后，我们可以得到：

$$U = \frac{\rho^2}{8\pi\epsilon_0} \int_0^R \int_0^\pi \int_0^{2\pi} \frac{r^2 \sin\theta \cdot r_1^2 \sin\theta_1 \cdot d\phi \cdot d\theta \cdot d\phi_1}{\sqrt{r^2 + r_1^2 - 2rr_1\cos\gamma}}$$

其中，$\gamma$表示$dV$和$dV_1$之间的夹角。

由于积分过程较为复杂，这里不再展开具体的推导过程。但是通过进行适当的变量替换和积分计算，可以最终得到实心球体的静电能的表达式：

$$U = \frac{3}{5} \frac{1}{4\pi\epsilon_0} \frac{Q^2}{R}$$

其中，$Q$表示球体的总电荷量，$R$表示球体的半径，$\epsilon_0$表示真空介电常数。

这个表达式表示了实心球体的静电能与球体的总电荷量和半径之间的关系。这个结果表明，实心球体的静电能正比于电荷量的平方，反比于球体的半径。

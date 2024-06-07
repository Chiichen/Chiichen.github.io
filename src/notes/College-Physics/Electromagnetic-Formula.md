---
title: 电磁学公式
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: Chiichen
date: 2023-10-30
category:
  - 课程笔记
tag:
  - 大学物理
# this page is sticky in article list
sticky: false
# this page will appear in starred articles
star: false
footer:
isOriginal: true
copyright: 转载请注明出处
---

## 14 章——静电场

### 1.库仑定律

$$\overrightarrow{F}=\frac{1}{4 \pi \varepsilon_0}\frac{q_1q_2}{r^2}\overrightarrow{e_r}\;(\varepsilon_0=8.85\times10^{-12}C^2\cdot N^{-1}\cdot m^{-2})\;\;\overrightarrow{e_r} \; 是径向向量$$

### 2.经典模型的电场强度

#### 电偶极子的电场强度

$$
\begin{array}{ll}
 \overrightarrow{P} = q\overrightarrow{l} \qquad \overrightarrow{l}\;是由负电荷指向正电荷的位矢 \\
 E=\frac{1}{4\pi\varepsilon_0}\frac{ql}{(r^2+(l/2)^2)^{3/2}}\;r\;是轴线中垂线上一点到中点的距离\\
 \overrightarrow{E} = -\frac{\overrightarrow{P}}{4\pi\varepsilon_0r^3}\quad(r\gg l) \\
\end{array}
$$

- 外电场对电偶极子的力矩和取向作用
  $$
  \begin{array}{c}\overrightarrow{M}=\overrightarrow{p}\times\overrightarrow{E}\\\overrightarrow{M}=0 \begin{cases}
  \theta=0\;稳定平衡\\  \theta=\pi \;非稳定平衡
  \end{cases}\\
  \theta为力矩和电场方向的夹角
  \end{array}
  $$

#### 细棒的电场强度

$$
\begin{array}{ll}
 任意点:
\begin{array}{ll}
 E_x = \frac{\lambda}{4\pi\varepsilon_0r}(\sin\theta_2-\sin\theta_1)\quad \\
 E_y = \frac{\lambda}{4\pi\varepsilon_0r}(\cos\theta_1-\cos\theta_2)\\
\end{array}\\
 中垂面:E=\frac{1}{2\pi\varepsilon_0r}\frac{\lambda l}{\sqrt{r^2+l^2}}\\
 无限长:E=\frac{\lambda}{2\pi\varepsilon_0r}\\
 r\gg l:E=\frac{\lambda l}{2\pi\varepsilon_0r^2}=\frac{q}{4\pi\varepsilon_0r^2}\\
 细棒长为2l，\lambda为电荷线密度=q/2l
\end{array}
$$

#### 圆环的电场强度

$$
\begin{array}{c}
中垂线上：E=\frac{qx}{4\pi\varepsilon_0(x^2+R^2)^{3/2}}\\
x\gg R\quad E\approx \frac{q}{4\pi\varepsilon_0x^2}\\
x\approx0\quad E_0\approx 0\\
\frac{dE}{dx}=0\quad x=\pm \frac{\sqrt{2}}{2}R
\end{array}
$$

#### 圆盘的电场强度

$$
\begin{array}{c}
E=\frac{\sigma}{2\varepsilon_0}(1-\frac{x}{\sqrt{x^2+R^2_0}})\\
x\ll R_0\quad E\approx \frac{\sigma}{2\varepsilon_0}(无限大均匀带电平板)\\
x\gg R_0 \quad E\approx\frac{q}{4\pi\varepsilon_0x^2}(点电荷电场强度)
\end{array}
$$

### 3.高斯定理

$$\Phi_e=\mathop{\oint}\limits_S\overrightarrow{E}\cdot d\overrightarrow{S}=\frac{1}{\varepsilon_0}\sum^n_{i=1}q^{in}$$

- 在真空中，通过任意闭合曲面的电场强度通量等于该曲面所包围的所有电荷的代数和除以$\varepsilon_0$

#### 计算场强的方法：

1. 根据叠加原理通过积分求各部分产生的电场强度之和
2. 利用高斯定理(主要解决电场强度均匀分布或者具有对称性的问题)
3. 由$\overrightarrow{E}=-gradU$计算

:::info
不能说可以直接忽略面外电荷，面外电荷对通量有影响，只是影响的积分总体上呈现为 0
:::

### 4.电势与电势能

- 静电场力是保守场，静电场力所做的功等于电荷电势能增量的负值
- 通常取无穷远处为电势零点
  $$
  \begin{array}{c}W_A=\int^\infty_Aq_0\overrightarrow{E} \cdot d \overrightarrow{l}\\U_A=\int^\infty_A\overrightarrow{E} \cdot d \overrightarrow{l}
  \end{array}
  $$

#### 计算电势的方法

1. 利用$U_A=\int^\infty_A\overrightarrow{E} \cdot d \overrightarrow{l}$
2. 利用点电荷电势的叠加原理$U=\frac{1}{4\pi\varepsilon_0}\int\frac{dq}{r}$

### 5.经典模型的电势能

#### 圆环的电势能

$$U_P=\frac{q}{4\pi\varepsilon_0\sqrt{x^2+R^2}}\;x是轴线上P点与中心的距离$$

#### 圆平面的电势能

$$U=\frac{\sigma}{2\varepsilon_0}(\sqrt{x^2+R^2}-x)$$

#### 球的电势能

$$
\begin{cases}
U=\frac{Q}{4\pi\varepsilon_0R}\;r<R\\
U=\frac{Q}{4\pi\varepsilon_0r}\;r\geq R
\end{cases}
$$

#### 电偶极子的电势能

$$
\begin{cases}
\theta=0 &W_p=-p\cdot E\quad&能量最低\\
\theta=\pi /2 &W_p=0\\
\theta = \pi &W_p=p\cdot E\quad &能量最高
\end{cases}
$$

## 15 章——电介质和电容

### 1.静电平衡

- 导体内电场强度=外电场强度+感应电荷电场强度=0
  $$\overrightarrow{E}=\overrightarrow{E}_0+\overrightarrow{E}^{\prime}$$
- 导体内部任何一点处的电场强度为零
- 导体表面处的电场强度的方向都与导体表面垂直
- 导体表面越尖锐，聚集越多电荷，电场强度越大

### 2.电介质

- 相对介电常数$\varepsilon_r>1$
- 介电常数$\varepsilon=\varepsilon_0 \varepsilon_r$
- 电极化强度定义
  $$\overrightarrow{P}=\frac{\sum\overrightarrow{p}_i}{\Delta V}=\chi_e\varepsilon_0\overrightarrow{E}\quad\chi_e:介质的极化率$$
  如果取$dS$面为电介质表面，即所有电荷的分布平面，则有$$\overrightarrow{P}\cdot \overrightarrow{e}_n=\sigma^{\prime}(极化电荷面密度)$$
  - 设$\sum q_i$是封闭曲面$S$包围的自由电荷， $q_内^{\prime}$是$S$包围的极化电荷
    $$
    \begin{array}{c}\oint\limits_S \varepsilon_o\overrightarrow{E} \cdot d \overrightarrow{S}=\sum q_i+ q_内^{\prime}\\
    \oint\limits_S (\varepsilon_o\overrightarrow{E}+\overrightarrow{P}) \cdot d \overrightarrow{S}=\sum q_i
    \end{array}
    $$
    定义电位移矢量$\overrightarrow{D}=\varepsilon_0\overrightarrow{E}+\overrightarrow{P}$ 得介质中的高斯定理：
    $$\oint\limits_S \overrightarrow{D} \cdot d \overrightarrow{S}=\sum q_i$$
    那么对于各向同性的电介质有以下几个关系式
    $$
    \begin{array}{c}
    \varepsilon_r=1+\chi_e\\
    \overrightarrow{D}=\varepsilon_0\varepsilon_r\overrightarrow{E}=\varepsilon\overrightarrow{E}
    \end{array}
    $$
- 有介质时静电场的计算：
  1. 根据介质中的高斯定理$\oint\limits_S \overrightarrow{D} \cdot d \overrightarrow{S}=\sum q_i$ 计算出电位移矢量
  2. 根据$\overrightarrow{E}=\frac{\overrightarrow{D}}{\varepsilon}$ 计算场强

### 3.电容

- 计算步骤：
  1. 设两极板分别带电$\pm Q$
  2. 求两极板间的电场强度$\overrightarrow{E}$
  3. 求两极板间的电势差$U$
  4. 由$C=Q/U$ 求出 C

### 4.经典模型的电容

#### 平行平板电容器的电容

$$C=\frac{\varepsilon S}{d}$$

#### 球形电容器的电容

$$
\begin{array}{c}C=\frac{4\pi\varepsilon R_AR_B}{R_B-R_A}\\当R_B\gg R_A\quad C=4\pi\varepsilon R_A\;(孤立导体球的电容)
\end{array}
$$

#### 圆柱形电容器(两平行柱面)的电容

$$C=\frac{2\pi\varepsilon l}{\ln \frac{R_B}{R_A}}$$

#### 平行长直导线的电容

- 半径为$R$的平行长直导线，中心间距为$d$，且$d\gg R$，则单位长度的电容为
  $$C=\frac{\pi\varepsilon}{\ln \frac{d}{R}}$$

### 5.电容的串并联

- 串联电容的等效电容的倒数等于各电容的倒数和 $$\frac{1}{C}=\sum \frac{1}{C_i}$$
- 并联电容的等效电容等于各个电容之和$$C=\sum C_i$$

### 电场能量与密度

- 电场能量是指将每个微小电荷$dq$从无穷远处移到带电体上要克服的功
- 点电荷系的能量$$W=\frac{1}{4\pi\varepsilon_0}\frac{q_1q_2}{r}$$
- 电容的能量$$W=\frac{1}{2}CU^2$$
- 电场的能量密度$$w_e=\frac{1}{2}\varepsilon E^2=\frac{1}{2} ED$$
- 电场的能量$$\int\limits_Vw_edV=\int\limits_V\frac{1}{2}\varepsilon E^2dV=\int\limits_V\frac{1}{2} EDdV$$

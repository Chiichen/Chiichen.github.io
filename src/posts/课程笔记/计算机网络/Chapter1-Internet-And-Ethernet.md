---
title: Chapter1 Internet And Ethernet
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: ChiChen
date: 2023-06-10
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
## 网络模型

![[网络基础模型]]

- 组网设备(networking device)：组成网络中除计算机之外的部分，即proxy部分的设备
- 一个计算机网络利用组网设备和数据链路(data links)去连接若干台地理上分离的计算机，通过完善的网络协议(protocol)和网络应用来达成共享网络资源和信息传输的功能
- 在网络中，信息以离散的二进制比特流传输，每组二进制比特流被称为data packets(数据包)

### 问题

#### 效率问题

- 简单的网络中没有统一管理，所有设备都要建立点对点连接后才能通信，造成严重的链路堵塞
- 解决办法：Packets Switching（数据包交换网络），利用交换机

#### 置信问题

- 在传输过程中可能造成的包数据丢失、数据包交换过程中可能造成的包异常复制等
- 解决办法：TCP协议

#### 地址问题

- 不同层需要不同的地址，传输层需要端口号，网络层需要IP地址，数据链路层需要MAC地址
- 解决办法：IP协议(国际互联协议)

#### 路由问题

- 从A到B有巨量的路径可选，网络设备怎么选择传输路径，来达成全局最优
- 解决办法：Routing Protocol(路由协议)

## 协议

### 协议栈(协议分层)

![[协议栈]]

#### 应用层

应用层是网络应用程序和他们的协议存留的位置，包括但不限于*HTTP* 、*SMTP*、*FTP* 协议，以及把域名解析为特定的32位IPv4网络地址的*DNS*系统，应用层的消息我们称为报文(message)

#### 传输层

传输层在应用程序端口之间传送应用层报文，有TCP和UDP两种协议，其中TCP为应用程序提供了面向连接的服务，包括传输保障、流量控制、拥塞控制等机制，而UDP是一种无连接服务。在传输层中的消息我们成为报文段(Segment)

#### 网络层

网络层负责将称为数据报(datagram)的网络包(network-layer packets)在主机之间移动。源主机的传输层协议会向网络层传递传输层报文段和目的地址。网络层的协议是IP协议，所有具有网络层的Internet组件都必须运行IP协议。

#### 链路层

网络层通过源和目的地之间的一系列路由器来路由数据报。为了将分组不断从网络中的一个节点移动到另一个节点，就需要链路层的参与。包括但不限于以太网、WiFi和电缆接入网的DOCSIS协议。在数据报传输过程中有可能会被不同的链路层协议来处理。我们把链路包(link-layer packets)称为帧(frames)

#### 物理层

链路层的任务是将整个帧从一个网络节点移动到临近的网络节点，而物理层的任务是把该帧中的一个个bit从一个节点移动到下一个节点，而物理层的协议就与具体的传输介质有关，例如双绞铜线、光纤等。

#### OSI模型

OSI模型还额外添加了表示层和会话层。表示层的作用是使得通信的程序能够解释在网络上交换的数据的含义，包括数据的压缩、加密以及数据的描述。会话层提供了数据交换的定界和同步，包括建立检查点和恢复方案的方法。
然而实际上这些服务在我们Internet的实践中被交由应用开发者管理，意思是如果开发者认为自己需要上述功能，就在应用层中实现对应的功能，而不由具体协议统一提供。
![[两种协议模型.png]]

### 封装

每一层(除了物理层)，都会对来自上一层的数据进行封装，或者对到来的数据进行解封装传递到上层，每个包(packet)都包括两个类型的字段：头部字段(header)和有效载荷字段(payload field)，有效载荷字段通常都是来自上一层的packet。

![[数据包封装.png]]

### 协议的内容

1. 发送方和接收方(server和client)
2. action：又包括发送后的action和接受后的action
3. 消息：包括消息本身和各层添加的协议头，亦即消息的格式

## 信息传输流程

- Link、Network、Transport层都会各自向信息添加协议头(proctol header)

## 电路交换(circuit switching)

- 最早的交换网络，主要用于电话通信网中
- 先建立端到端的稳定连接，再进行通信，直到通信结束才释放
- 基本能占满带宽，保证传输速率，但是互联网中的信息大都是突发传输的(burst)，这种交换方式极大地浪费通信资源
- 有两种实现，分频复用(FDM)和分时复用(TDM):
- FDM是将一个信道的频带分为多个子信道，每个子信道都能并行传输一路数据
- TDM是将一个信道分为多个时隙(slot)，每个时隙传输一路数据，一个frame完成一轮

## 包交换(packet switching)

- 数据被分割为若干个包进行传输，经过数据链路和包交换器
- 一个包在链路中的传输是满速传输的
- 每个包都必须被包交换器完全接受并缓存，而且要检测其接受者，再把它发送给其他交换器
- 包交换器是多路设备，并且对每条链路都有输入输出缓存
- 一个包会被以队列的方式存储在交换器的缓存中
- 在交换器中发生的存储转发会带来

 1. 延迟
 2. 丢包

- 有两种类型：路由和链路层交换器

### 包交换的定量分析

#### 节点延迟

$$d_{nodal}=d_{proc}+d_{queue}+d_{trans}+d_{prop}$$

- 节点处理延迟(Nodal processing delay)：节点检查位错误和选择输出链路的时间
- 队列延迟(Queuing delay)：在交换器队列中等待的延迟，取决于路由的堵塞成都
- 传输延迟(Transmission delay)：$R=link \;bandwidth(bps)$$L=packet \;length(bits)$$L/R=time \;to\; send\; bits\; to\; link$
- 传播延迟(Propagation delay)：$d=length\;of\;physical\;link$$s=propogation\;speed \;in\;medium(2\times10^8m/sec)$$d/s=propagation\;delay$
- 总延迟就是所有$nodal$的延迟之和

#### 流量强度(traffic intensity)与队列延迟

- $R=link\;bandwidth(bps)$
- $L=packet\;length(bits)$
- $a=average\;packet\;arrival\;rate$
- $Traffic\; Intensity = La/R$
- $La/R\approx 0:\text{平均队列延迟较小}$
- $La/R\rightarrow 1：\text{队列延迟逐渐变大}$

#### 丢包

- 队列(又名缓冲区)只有有限的空间
- 到达一个满的队列的包会被丢弃，又称为丢包
- 丢弃的包可能会被前一个节点重传，也有可能被源终端重传，或者不重传

#### 吞吐量

- sender和receiver之间传输的比率($R\;bits/time \;unit$)
- 瞬时(instantaneous)吞吐量：某一时刻的比率
- 平均吞吐量：一段时间内的比率
- 链路上的总吞吐量取决于吞吐量最小的组网设备/源端/终端

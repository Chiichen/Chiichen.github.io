---
title: could not dial endpoint 'orderer-api.127-0-0-1.nip.io:8080' 问题解决

# cover: /assets/images/cover1.jpg

icon: page
order: 1
author: ChiChen
date: 2023-10-18
category:
- 杂谈
- 网络问题
tag:

- Debug
- 网络问题
sticky: false
star: false
footer:
copyright: 转载请注明出处

---

## could not dial endpoint 'orderer-api.127-0-0-1.nip.io:8080'

今天完成区块链实验的时候，在用 `IBM-BlockChain-Platform` vscode 插件完成实验内容的时候，在部署服务到 `Local Docker` 时出现了如下错误

```http
could not dial endpoint 'orderer-api.127-0-0-1.nip.io:8080'
```

刚开始的时候一直在想这个域名是什么，看起来是某个服务的端口，但是似乎这个过程中又没有让我登录，不可能不登陆就能访问这种 API 服务的吧。后来上网搜索发现 `.nip.io` 会被 DNS 服务器 rebind 成一个特殊的地址，例如 `hello.192.168.199.12.nip.io` 就会变成 `192.168.199.12` ，那么这个原来的地址理应是 `127.0.0.1` 也就是 `Localhost` ，我ping了一下

``` bash
ping orderer-api.127-0-0-1.nip.io
```

发现是能 ping 通的，但是我执行

```bash
nslookup orderer-api.127-0-0-1.nip.io
```

却发现输出为

```text
服务器:  UnKnown
Address:  198.18.0.2

名称:    orderer-api.127-0-0-1.nip.io
Address:  198.18.0.147
```

这 DNS 服务器地址怎么看都不对劲啊，而且解析出来的也不对。为什么 DNS 会出错呢，因为这是在我个人电脑上运行的，我就换到平时实验室的开发环境里试一下，同样运行

```bash
nslookup orderer-api.127-0-0-1.nip.io
```

输出却是

```text
Server:         127.0.0.53
Address:        127.0.0.53#53

Non-authoritative answer:
Name:   orderer-api.127-0-0-1.nip.io
Address: 127.0.0.1
```

:::info
127.0.0.53 是 Linux 的 systemd-resolve 机制的一个虚拟 DNS 服务器
:::

后来我想了一下，这个东西应该跟我 Windows 上开启的 `Clash for Windows` ， 有关系，它可能把这些流量都劫持了，用来做一些域名分流之类的工作，所以就无法实现 `DNS rebind` 了

我只要把 `Clash for Windows` 退出，这个问题就不存在了

```bash
nslookup orderer-api.127-0-0-1.nip.io
```

返回

```text
服务器:  dns.google
Address:  8.8.8.8

非权威应答:
名称:    orderer-api.127-0-0-1.nip.io
Address:  127.0.0.1
```

不过 `新版本的 Clash Core` 应该解决了这个问题，因为我看到 [这里](https://github.com/Dreamacro/clash/blob/d034a408be42815e98f3aea80be24949946aea83/test/dns_test.go#L40)有针对这种情况的测试用例，不过是两个月前加上的，因为本人用的是 `2022.11` 版本的，所以才出现了这个问题。

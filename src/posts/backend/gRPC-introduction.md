---
title: gRPC入门
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: ChiChen
date: 2023-11-29
category:
  - 笔记
  - 后端
tag:
  - 后端
  - gRPC
  - go
# this page is sticky in article list
sticky: true
# this page will appear in starred articles
star: false
footer: 
isOriginal: true
copyright: 转载请注明出处
---

## 什么是gRPC

## 前期准备

在本篇内容中，我们将通过`go+gin+gRPC`的组合来初步认识gRPC，并实现一个简单的网关应用

### Go环境安装

略

### 创建项目

```bash
mkdir app-gateway
cd app-gateway
go mod init app-gateway
```

### 安装依赖项

```bash
go get -u github.com/gin-gonic/gin
go get -u google.golang.org/grpc
sudo apt install protobuf-compiler # 安装 protobuf 编译器
go install github.com/golang/protobuf/protoc-gen-go@latest # 安装go编译插件
sudo cp -r $GOPATH/bin/protoc-gen-go /usr/bin # 或者把 $GOPATH/bin 添加到 PATH
```

## 定义gRPC服务

定义gRPC服务实际上就是编写`.proto`文件并编译为对应高级语言的过程

### 构建proto文件

我们新建如下的项目结构

```bash
.
├── Makefile
├── README.md
├── go.mod
├── go.sum
├── src
│   ├── cmd
│   ├── controller
│   └── proto
│       └── message.proto
└── workflows
    └── docker-image.yml
```

`message.proto`就是我们的proto文件，有如下内容

```proto3
syntax = "proto3";
//option go_package = "path;name";
//path 表示生成的go文件的存放地址，会自动生成目录的。
//name 表示生成的go文件所属的包名
option go_package="./;proto";
// 定义包名
package proto;

service MessageService {
    rpc SendMessage (SendMessageRequest) returns (SendMessageResponse);
    rpc ReceiveMessage (ReceiveMessageRequest) returns (ReceiveMessageResponse);
}

message SendMessageRequest {
    string content = 1;
}

message SendMessageResponse {
    string status = 1;
}

message ReceiveMessageRequest {
    string id = 1;
}

message ReceiveMessageResponse {
    string content = 1;
}

:::info Highlight
vscode中可以使用插件`vscode-proto3`获得高亮提示
:::

```

### 编译proto文件

:::info 编译指令

```bash
protoc --proto_path=IMPORT_PATH  --go_out=OUT_DIR  --go_opt=paths=source_relative path/to/file.proto
```

- proto_path或者-I ：指定 import 路径，可以指定多个参数，编译时按顺序查找，不指定时默认查找当前目录。
  - proto 文件中也可以引入其他 .proto 文件，这里主要用于指定被引入文件的位置。
- go_out：golang编译支持，指定输出文件路径
- go_opt：指定参数，比如--go_opt=paths=source_relative就是表明生成文件输出使用相对路径。
- path/to/file.proto ：被编译的 .proto 文件放在最后面

:::

对于我们的项目，执行下述命令进行编译

```bash
protoc -I ./src/proto/ --go_out=plugins=grpc:./src/proto ./src/proto/message.proto
```

:::info 参数说明

- -I 指定代码输出目录，忽略服务定义的包名，否则会根据包名创建目录
- --go_out 指定代码输出目录，格式：--go_out=plugins=grpc:目录名
- 命令最后面的参数是proto协议文件 编译成功后在proto目录生成了helloworld.pb.go文件，里面包含了，我们的服务和接口定义。

:::

## 实现gRPC服务

在项目/src目录下下创建一个名为`server`的文件夹，并在其中创建一个名为`server.go`的文件。这个文件将实现我们的 gRPC 服务。

```go
package server

import (
 "app-gateway/src/proto"
 "context"
)

type MessageServer struct{}

func (s *MessageServer) SendMessage(ctx context.Context, req *proto.SendMessageRequest) (*proto.SendMessageResponse, error) {
 // 在这里实现消息发送逻辑
 return &proto.SendMessageResponse{Status: "Success"}, nil
}

func (s *MessageServer) ReceiveMessage(ctx context.Context, req *proto.ReceiveMessageRequest) (*proto.ReceiveMessageResponse, error) {
 // 在这里实现消息接收逻辑
 return &proto.ReceiveMessageResponse{Content: "Hello, gRPC!"}, nil
}

```

## 实现HTTP服务

在项目/src/cmd目录下创建一个名为 main.go 的文件。这个文件将使用 Gin 实现 HTTP 服务，并调用 gRPC 服务。

```go
package main

import (
 "app-gateway/src/proto"
 "log"
 "net/http"

 "github.com/gin-gonic/gin"
 "google.golang.org/grpc"
)

func main() {
 r := gin.Default()

 r.POST("/send", func(c *gin.Context) {
  content := c.PostForm("content")

  conn, err := grpc.Dial(":50051", grpc.WithInsecure())
  if err != nil {
   log.Fatalf("did not connect: %v", err)
  }
  defer conn.Close()

  client := proto.NewMessageServiceClient(conn)
  res, err := client.SendMessage(c, &proto.SendMessageRequest{Content: content})
  if err != nil {
   c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
   return
  }

  c.JSON(http.StatusOK, gin.H{"status": res.Status})
 })

 r.GET("/receive/:id", func(c *gin.Context) {
  id := c.Param("id")

  conn, err := grpc.Dial(":50051", grpc.WithInsecure())
  if err != nil {
   log.Fatalf("did not connect: %v", err)
  }
  defer conn.Close()

  client := proto.NewMessageServiceClient(conn)
  res, err := client.ReceiveMessage(c, &proto.ReceiveMessageRequest{Id: id})
  if err != nil {
   c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
   return
  }

  c.JSON(http.StatusOK, gin.H{"content": res.Content})
 })

 r.Run(":8080")
}

```

## 运行

首先，启动 gRPC 服务：

```bash
go run src/server/server.go
```

然后，启动 Gin HTTP 服务：

```bash
go run src/cmd/main.go
```

## 参考资料

- [GO-GRPC使用教程](https://zhuanlan.zhihu.com/p/411317961)
- [使用 Gin 和 gRPC 实现后端消息发送和接收接口 ｜ 青训营](https://juejin.cn/post/7270831230077173818)

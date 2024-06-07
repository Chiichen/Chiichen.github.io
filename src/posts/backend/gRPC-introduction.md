---
title: gRPC入门
# cover: /assets/images/cover1.jpg
icon: page
# This control sidebar order
order: 1
author: Chiichen
date: 2024-06-01
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

## 什么是 gRPC

## 前期准备

在本篇内容中，我们将通过`go+gin+gRPC`的组合来初步认识 gRPC，并实现一个简单的网关应用

### Go 环境安装

略

### 创建项目

```bash
mkdir app-gateway
cd app-gateway
go mod init app-gateway
```

### 安装依赖项

```bash
go get -u google.golang.org/grpc
sudo apt install protobuf-compiler # 安装 protobuf 编译器
go install github.com/golang/protobuf/protoc-gen-go@latest # 安装go编译插件
sudo cp -r $GOPATH/bin/protoc-gen-go /usr/bin # 或者把 $GOPATH/bin 添加到 PATH
```

## 定义 gRPC 服务

定义 gRPC 服务实际上就是编写`.proto`文件并编译为对应高级语言的过程

### 构建 proto 文件

我们新建如下的项目结构

```bash
.
├── go.mod
├── go.sum
└── src
    ├── cmd
    │   ├── client
    │   │   └── client.go
    │   └── server
    │       └── server.go
    ├── proto
    │   ├── message.pb.go
    │   └── message.proto
    └── server
        └── server.go

```

`message.proto`就是我们的 proto 文件，有如下内容

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

enum SendMessageStatus{
    Success=0;
    MessageExist=1;
    Failed=2;
}

message SendMessageRequest {
    uint64 id=1;
    string content=2;
}

message SendMessageResponse {
    SendMessageStatus status=1;
}

message ReceiveMessageRequest {
    uint64 id=1;
}

message ReceiveMessageResponse {
    string content=1;
}

```

:::info Highlight
vscode 中可以使用插件`vscode-proto3`获得高亮提示
:::

### 编译 proto 文件

:::info 编译指令

```bash
protoc --proto_path=IMPORT_PATH  --go_out=OUT_DIR  --go_opt=paths=source_relative path/to/file.proto
```

- proto_path 或者-I ：指定 import 路径，可以指定多个参数，编译时按顺序查找，不指定时默认查找当前目录。
  - proto 文件中也可以引入其他 .proto 文件，这里主要用于指定被引入文件的位置。
- go_out：golang 编译支持，指定输出文件路径
- go_opt：指定参数，比如--go_opt=paths=source_relative 就是表明生成文件输出使用相对路径。
- path/to/file.proto ：被编译的 .proto 文件放在最后面

:::

对于我们的项目，执行下述命令进行编译

```bash
protoc -I ./src/proto/ --go_out=plugins=grpc:./src/proto ./src/proto/message.proto
```

:::info 参数说明

- -I 指定代码输出目录，忽略服务定义的包名，否则会根据包名创建目录
- --go_out 指定代码输出目录，格式：--go_out=plugins=grpc:目录名
- plugins=grpc 表示启用 rpc，并且指定是 grpc
- 命令最后面的参数是 proto 协议文件 编译成功后在 proto 目录生成了 helloworld.pb.go 文件，里面包含了，我们的服务和接口定义。

:::

## 实现 gRPC 服务

在项目/src 目录下下创建一个名为`server`的文件夹，并在其中创建一个名为`server.go`的文件。这个文件将实现我们的 gRPC 服务。

```go
package server

import (
	"context"
	"fmt"
	"grpc-demo/src/proto"
	"log"
)

type MessageServer struct {
	contentMap map[int64]string
}

func (s *MessageServer) SendMessage(ctx context.Context, req *proto.SendMessageRequest) (*proto.SendMessageResponse, error) {
	log.Printf("Sending %s", req)
	_, ok := s.contentMap[int64(req.Id)]
	if ok {
		return &proto.SendMessageResponse{Status: proto.SendMessageStatus_MessageExist}, nil
	} else {
		s.contentMap[int64(req.Id)] = req.Content
	}
  // 以上可以替换成自己的逻辑
	return &proto.SendMessageResponse{Status: proto.SendMessageStatus_Success}, nil
}

func (s *MessageServer) ReceiveMessage(ctx context.Context, req *proto.ReceiveMessageRequest) (*proto.ReceiveMessageResponse, error) {
	log.Printf("Receiving %s", req)
	v, ok := s.contentMap[int64(req.Id)]
	if ok {
		return &proto.ReceiveMessageResponse{Content: v}, nil
	} else {
		return &proto.ReceiveMessageResponse{Content: "No Message"}, fmt.Errorf("No Message for id %d", req.Id)
	}
  // 以上可以替换成自己的逻辑
}

func NewMessageServer() *MessageServer {
	return &MessageServer{contentMap: map[int64]string{}}
}

```

### 实现 Server

我们还需要一个 server 来承载 grpc

```go
// src/cmd/server.go
package main

import (
	"fmt"
	"log"
	"net"

	pb "grpc-demo/src/proto"
	"grpc-demo/src/server"

	"google.golang.org/grpc"
)

const port = 8080

func main() {
	lis, err := net.Listen("tcp", fmt.Sprintf("localhost:%d", port))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	var opts []grpc.ServerOption
	grpcServer := grpc.NewServer(opts...)
	pb.RegisterMessageServiceServer(grpcServer, server.NewMessageServer())
	grpcServer.Serve(lis)
}
```

### 实现 Client

```go
// src/cmd/client
package main

import (
	"context"
	"log"

	"google.golang.org/grpc"

	pb "grpc-demo/src/proto"
)

const PORT = "8080"

func main() {
	conn, err := grpc.NewClient(":"+PORT, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("grpc.Dial err: %v", err)
	}
	defer conn.Close()

	client := pb.NewMessageServiceClient(conn)
	resp, err := client.SendMessage(context.Background(), &pb.SendMessageRequest{
		Id:      0,
		Content: "Client sending content",
	})
	log.Printf("Seding resp: %s", resp.String())
	if err != nil {
		log.Fatalf("client.send err: %v", err)
	}
	receiveResp, err := client.ReceiveMessage(context.Background(), &pb.ReceiveMessageRequest{
		Id: 0,
	})
	if err != nil {
		log.Fatalf("client.receive err: %v", err)
	}
	log.Printf("Receive resp: %s", receiveResp.String())
}

```

## 运行

首先，启动 gRPC 服务：

```bash
go run src/cmd/server.go
```

然后，启动 gRPC 客户端:

```bash
go run src/cmd/client.go
```

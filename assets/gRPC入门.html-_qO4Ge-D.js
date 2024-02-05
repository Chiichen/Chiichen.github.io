import{_ as t}from"./plugin-vue_export-helper-x3n3nnut.js";import{r as p,o,c as i,a as n,b as a,d as e,e as c}from"./app-AkkacCA_.js";const l={},u=c(`<h2 id="什么是grpc" tabindex="-1"><a class="header-anchor" href="#什么是grpc" aria-hidden="true">#</a> 什么是gRPC</h2><h2 id="前期准备" tabindex="-1"><a class="header-anchor" href="#前期准备" aria-hidden="true">#</a> 前期准备</h2><p>在本篇内容中，我们将通过<code>go+gin+gRPC</code>的组合来初步认识gRPC，并实现一个简单的网关应用</p><h3 id="go环境安装" tabindex="-1"><a class="header-anchor" href="#go环境安装" aria-hidden="true">#</a> Go环境安装</h3><p>略</p><h3 id="创建项目" tabindex="-1"><a class="header-anchor" href="#创建项目" aria-hidden="true">#</a> 创建项目</h3><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">mkdir</span> app-gateway
<span class="token builtin class-name">cd</span> app-gateway
go mod init app-gateway
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="安装依赖项" tabindex="-1"><a class="header-anchor" href="#安装依赖项" aria-hidden="true">#</a> 安装依赖项</h3><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>go get <span class="token parameter variable">-u</span> github.com/gin-gonic/gin
go get <span class="token parameter variable">-u</span> google.golang.org/grpc
<span class="token function">sudo</span> <span class="token function">apt</span> <span class="token function">install</span> protobuf-compiler <span class="token comment"># 安装 protobuf 编译器</span>
go <span class="token function">install</span> github.com/golang/protobuf/protoc-gen-go@latest <span class="token comment"># 安装go编译插件</span>
<span class="token function">sudo</span> <span class="token function">cp</span> <span class="token parameter variable">-r</span> <span class="token variable">$GOPATH</span>/bin/protoc-gen-go /usr/bin <span class="token comment"># 或者把 $GOPATH/bin 添加到 PATH</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="定义grpc服务" tabindex="-1"><a class="header-anchor" href="#定义grpc服务" aria-hidden="true">#</a> 定义gRPC服务</h2><p>定义gRPC服务实际上就是编写<code>.proto</code>文件并编译为对应高级语言的过程</p><h3 id="构建proto文件" tabindex="-1"><a class="header-anchor" href="#构建proto文件" aria-hidden="true">#</a> 构建proto文件</h3><p>我们新建如下的项目结构</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token builtin class-name">.</span>
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>message.proto</code>就是我们的proto文件，有如下内容</p><div class="language-proto3 line-numbers-mode" data-ext="proto3"><pre class="language-proto3"><code>syntax = &quot;proto3&quot;;
//option go_package = &quot;path;name&quot;;
//path 表示生成的go文件的存放地址，会自动生成目录的。
//name 表示生成的go文件所属的包名
option go_package=&quot;./;proto&quot;;
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
vscode中可以使用插件\`vscode-proto3\`获得高亮提示
:::

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="编译proto文件" tabindex="-1"><a class="header-anchor" href="#编译proto文件" aria-hidden="true">#</a> 编译proto文件</h3><div class="hint-container info"><p class="hint-container-title">编译指令</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>protoc <span class="token parameter variable">--proto_path</span><span class="token operator">=</span>IMPORT_PATH  <span class="token parameter variable">--go_out</span><span class="token operator">=</span>OUT_DIR  <span class="token parameter variable">--go_opt</span><span class="token operator">=</span>paths<span class="token operator">=</span>source_relative path/to/file.proto
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li>proto_path或者-I ：指定 import 路径，可以指定多个参数，编译时按顺序查找，不指定时默认查找当前目录。 <ul><li>proto 文件中也可以引入其他 .proto 文件，这里主要用于指定被引入文件的位置。</li></ul></li><li>go_out：golang编译支持，指定输出文件路径</li><li>go_opt：指定参数，比如--go_opt=paths=source_relative就是表明生成文件输出使用相对路径。</li><li>path/to/file.proto ：被编译的 .proto 文件放在最后面</li></ul></div><p>对于我们的项目，执行下述命令进行编译</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>protoc <span class="token parameter variable">-I</span> ./src/proto/ <span class="token parameter variable">--go_out</span><span class="token operator">=</span>plugins<span class="token operator">=</span>grpc:./src/proto ./src/proto/message.proto
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="hint-container info"><p class="hint-container-title">参数说明</p><ul><li>-I 指定代码输出目录，忽略服务定义的包名，否则会根据包名创建目录</li><li>--go_out 指定代码输出目录，格式：--go_out=plugins=grpc:目录名</li><li>命令最后面的参数是proto协议文件 编译成功后在proto目录生成了helloworld.pb.go文件，里面包含了，我们的服务和接口定义。</li></ul></div><h2 id="实现grpc服务" tabindex="-1"><a class="header-anchor" href="#实现grpc服务" aria-hidden="true">#</a> 实现gRPC服务</h2><p>在项目/src目录下下创建一个名为<code>server</code>的文件夹，并在其中创建一个名为<code>server.go</code>的文件。这个文件将实现我们的 gRPC 服务。</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">package</span> server

<span class="token keyword">import</span> <span class="token punctuation">(</span>
 <span class="token string">&quot;app-gateway/src/proto&quot;</span>
 <span class="token string">&quot;context&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">type</span> MessageServer <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>s <span class="token operator">*</span>MessageServer<span class="token punctuation">)</span> <span class="token function">SendMessage</span><span class="token punctuation">(</span>ctx context<span class="token punctuation">.</span>Context<span class="token punctuation">,</span> req <span class="token operator">*</span>proto<span class="token punctuation">.</span>SendMessageRequest<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token operator">*</span>proto<span class="token punctuation">.</span>SendMessageResponse<span class="token punctuation">,</span> <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
 <span class="token comment">// 在这里实现消息发送逻辑</span>
 <span class="token keyword">return</span> <span class="token operator">&amp;</span>proto<span class="token punctuation">.</span>SendMessageResponse<span class="token punctuation">{</span>Status<span class="token punctuation">:</span> <span class="token string">&quot;Success&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token boolean">nil</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>s <span class="token operator">*</span>MessageServer<span class="token punctuation">)</span> <span class="token function">ReceiveMessage</span><span class="token punctuation">(</span>ctx context<span class="token punctuation">.</span>Context<span class="token punctuation">,</span> req <span class="token operator">*</span>proto<span class="token punctuation">.</span>ReceiveMessageRequest<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token operator">*</span>proto<span class="token punctuation">.</span>ReceiveMessageResponse<span class="token punctuation">,</span> <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
 <span class="token comment">// 在这里实现消息接收逻辑</span>
 <span class="token keyword">return</span> <span class="token operator">&amp;</span>proto<span class="token punctuation">.</span>ReceiveMessageResponse<span class="token punctuation">{</span>Content<span class="token punctuation">:</span> <span class="token string">&quot;Hello, gRPC!&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token boolean">nil</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="实现http服务" tabindex="-1"><a class="header-anchor" href="#实现http服务" aria-hidden="true">#</a> 实现HTTP服务</h2><p>在项目/src/cmd目录下创建一个名为 main.go 的文件。这个文件将使用 Gin 实现 HTTP 服务，并调用 gRPC 服务。</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
 <span class="token string">&quot;app-gateway/src/proto&quot;</span>
 <span class="token string">&quot;log&quot;</span>
 <span class="token string">&quot;net/http&quot;</span>

 <span class="token string">&quot;github.com/gin-gonic/gin&quot;</span>
 <span class="token string">&quot;google.golang.org/grpc&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
 r <span class="token operator">:=</span> gin<span class="token punctuation">.</span><span class="token function">Default</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

 r<span class="token punctuation">.</span><span class="token function">POST</span><span class="token punctuation">(</span><span class="token string">&quot;/send&quot;</span><span class="token punctuation">,</span> <span class="token keyword">func</span><span class="token punctuation">(</span>c <span class="token operator">*</span>gin<span class="token punctuation">.</span>Context<span class="token punctuation">)</span> <span class="token punctuation">{</span>
  content <span class="token operator">:=</span> c<span class="token punctuation">.</span><span class="token function">PostForm</span><span class="token punctuation">(</span><span class="token string">&quot;content&quot;</span><span class="token punctuation">)</span>

  conn<span class="token punctuation">,</span> err <span class="token operator">:=</span> grpc<span class="token punctuation">.</span><span class="token function">Dial</span><span class="token punctuation">(</span><span class="token string">&quot;:50051&quot;</span><span class="token punctuation">,</span> grpc<span class="token punctuation">.</span><span class="token function">WithInsecure</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
  <span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
   log<span class="token punctuation">.</span><span class="token function">Fatalf</span><span class="token punctuation">(</span><span class="token string">&quot;did not connect: %v&quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
  <span class="token punctuation">}</span>
  <span class="token keyword">defer</span> conn<span class="token punctuation">.</span><span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

  client <span class="token operator">:=</span> proto<span class="token punctuation">.</span><span class="token function">NewMessageServiceClient</span><span class="token punctuation">(</span>conn<span class="token punctuation">)</span>
  res<span class="token punctuation">,</span> err <span class="token operator">:=</span> client<span class="token punctuation">.</span><span class="token function">SendMessage</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> <span class="token operator">&amp;</span>proto<span class="token punctuation">.</span>SendMessageRequest<span class="token punctuation">{</span>Content<span class="token punctuation">:</span> content<span class="token punctuation">}</span><span class="token punctuation">)</span>
  <span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
   c<span class="token punctuation">.</span><span class="token function">JSON</span><span class="token punctuation">(</span>http<span class="token punctuation">.</span>StatusInternalServerError<span class="token punctuation">,</span> gin<span class="token punctuation">.</span>H<span class="token punctuation">{</span><span class="token string">&quot;error&quot;</span><span class="token punctuation">:</span> err<span class="token punctuation">.</span><span class="token function">Error</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">}</span><span class="token punctuation">)</span>
   <span class="token keyword">return</span>
  <span class="token punctuation">}</span>

  c<span class="token punctuation">.</span><span class="token function">JSON</span><span class="token punctuation">(</span>http<span class="token punctuation">.</span>StatusOK<span class="token punctuation">,</span> gin<span class="token punctuation">.</span>H<span class="token punctuation">{</span><span class="token string">&quot;status&quot;</span><span class="token punctuation">:</span> res<span class="token punctuation">.</span>Status<span class="token punctuation">}</span><span class="token punctuation">)</span>
 <span class="token punctuation">}</span><span class="token punctuation">)</span>

 r<span class="token punctuation">.</span><span class="token function">GET</span><span class="token punctuation">(</span><span class="token string">&quot;/receive/:id&quot;</span><span class="token punctuation">,</span> <span class="token keyword">func</span><span class="token punctuation">(</span>c <span class="token operator">*</span>gin<span class="token punctuation">.</span>Context<span class="token punctuation">)</span> <span class="token punctuation">{</span>
  id <span class="token operator">:=</span> c<span class="token punctuation">.</span><span class="token function">Param</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">)</span>

  conn<span class="token punctuation">,</span> err <span class="token operator">:=</span> grpc<span class="token punctuation">.</span><span class="token function">Dial</span><span class="token punctuation">(</span><span class="token string">&quot;:50051&quot;</span><span class="token punctuation">,</span> grpc<span class="token punctuation">.</span><span class="token function">WithInsecure</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
  <span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
   log<span class="token punctuation">.</span><span class="token function">Fatalf</span><span class="token punctuation">(</span><span class="token string">&quot;did not connect: %v&quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
  <span class="token punctuation">}</span>
  <span class="token keyword">defer</span> conn<span class="token punctuation">.</span><span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

  client <span class="token operator">:=</span> proto<span class="token punctuation">.</span><span class="token function">NewMessageServiceClient</span><span class="token punctuation">(</span>conn<span class="token punctuation">)</span>
  res<span class="token punctuation">,</span> err <span class="token operator">:=</span> client<span class="token punctuation">.</span><span class="token function">ReceiveMessage</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> <span class="token operator">&amp;</span>proto<span class="token punctuation">.</span>ReceiveMessageRequest<span class="token punctuation">{</span>Id<span class="token punctuation">:</span> id<span class="token punctuation">}</span><span class="token punctuation">)</span>
  <span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
   c<span class="token punctuation">.</span><span class="token function">JSON</span><span class="token punctuation">(</span>http<span class="token punctuation">.</span>StatusInternalServerError<span class="token punctuation">,</span> gin<span class="token punctuation">.</span>H<span class="token punctuation">{</span><span class="token string">&quot;error&quot;</span><span class="token punctuation">:</span> err<span class="token punctuation">.</span><span class="token function">Error</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">}</span><span class="token punctuation">)</span>
   <span class="token keyword">return</span>
  <span class="token punctuation">}</span>

  c<span class="token punctuation">.</span><span class="token function">JSON</span><span class="token punctuation">(</span>http<span class="token punctuation">.</span>StatusOK<span class="token punctuation">,</span> gin<span class="token punctuation">.</span>H<span class="token punctuation">{</span><span class="token string">&quot;content&quot;</span><span class="token punctuation">:</span> res<span class="token punctuation">.</span>Content<span class="token punctuation">}</span><span class="token punctuation">)</span>
 <span class="token punctuation">}</span><span class="token punctuation">)</span>

 r<span class="token punctuation">.</span><span class="token function">Run</span><span class="token punctuation">(</span><span class="token string">&quot;:8080&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="运行" tabindex="-1"><a class="header-anchor" href="#运行" aria-hidden="true">#</a> 运行</h2><p>首先，启动 gRPC 服务：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>go run src/server/server.go
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>然后，启动 Gin HTTP 服务：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>go run src/cmd/main.go
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="参考资料" tabindex="-1"><a class="header-anchor" href="#参考资料" aria-hidden="true">#</a> 参考资料</h2>`,33),r={href:"https://zhuanlan.zhihu.com/p/411317961",target:"_blank",rel:"noopener noreferrer"},d={href:"https://juejin.cn/post/7270831230077173818",target:"_blank",rel:"noopener noreferrer"};function k(v,m){const s=p("ExternalLinkIcon");return o(),i("div",null,[u,n("ul",null,[n("li",null,[n("a",r,[a("GO-GRPC使用教程"),e(s)])]),n("li",null,[n("a",d,[a("使用 Gin 和 gRPC 实现后端消息发送和接收接口 ｜ 青训营"),e(s)])])])])}const h=t(l,[["render",k],["__file","gRPC入门.html.vue"]]);export{h as default};

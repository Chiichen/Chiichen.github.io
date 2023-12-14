import{_ as n}from"./plugin-vue_export-helper-x3n3nnut.js";import{o as s,c as e,e as a}from"./app-Hg23Z3SM.js";const i={},t=a(`<h2 id="背景" tabindex="-1"><a class="header-anchor" href="#背景" aria-hidden="true">#</a> 背景</h2><p>在上一篇博客中我们跟着官方的example完成了一个eBPF应用的运行，接下来就要尝试为自己的需求编写一个 eBPF 应用了。我的需求是获取一个应用负载在内存地址空间上的访存频率。初步的想法是利用 Numa Balancing 中的 Page 标记，通过 Page-fault 计数来实现这个功能。</p><h2 id="前期构建" tabindex="-1"><a class="header-anchor" href="#前期构建" aria-hidden="true">#</a> 前期构建</h2><p>首先，我们是需要知道哪个 tracepoint 可以提供给我们的eBPF程序来挂载。</p><p>通过命令来获取内核提供的 Tracepoint：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">sudo</span>  <span class="token function">find</span> /sys/kernel/debug/tracing/events <span class="token parameter variable">-type</span> d <span class="token operator">|</span> <span class="token function">grep</span> page_fault
/sys/kernel/debug/tracing/events/kvmmmu/handle_mmio_page_fault
/sys/kernel/debug/tracing/events/kvmmmu/fast_page_fault
/sys/kernel/debug/tracing/events/kvm/kvm_page_fault
/sys/kernel/debug/tracing/events/iommu/io_page_fault
/sys/kernel/debug/tracing/events/exceptions/page_fault_user <span class="token comment"># 这是我们想要的</span>
/sys/kernel/debug/tracing/events/exceptions/page_fault_kernel
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>同样地运行这个命令</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code> <span class="token function">cargo</span> generate https://github.com/aya-rs/aya-template
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>然后在选择框中选择 tracepoint</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>  cgroup_skb
  cgroup_sockopt
  cgroup_sysctl
  classifier
  fentry
  fexit
  kprobe
  kretprobe
  lsm
  perf_event
  raw_tracepoint
  sk_msg
  sock_ops
  socket_filter
  tp_btf
❯ tracepoint
  uprobe
  uretprobe
  xdp
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后在后续的 tracepoint name 和 catagery 中分别填写 page_fault_user 和 exceptions，就会创建一个新的基于 tracepoint 的应用</p><h2 id="修改" tabindex="-1"><a class="header-anchor" href="#修改" aria-hidden="true">#</a> 修改</h2><h3 id="获取上下文" tabindex="-1"><a class="header-anchor" href="#获取上下文" aria-hidden="true">#</a> 获取上下文</h3><p>每个 Tracepoint 都提供了一个上下文环境，我们可以通过命令来获取上下文中的数据：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">sudo</span>  <span class="token function">cat</span> /sys/kernel/debug/tracing/events/exceptions/page_fault_user/format
name: page_fault_user
ID: <span class="token number">119</span>
format:
        field:unsigned short common_type<span class="token punctuation">;</span>       offset:0<span class="token punctuation">;</span>       size:2<span class="token punctuation">;</span> signed:0<span class="token punctuation">;</span>
        field:unsigned char common_flags<span class="token punctuation">;</span>       offset:2<span class="token punctuation">;</span>       size:1<span class="token punctuation">;</span> signed:0<span class="token punctuation">;</span>
        field:unsigned char common_preempt_count<span class="token punctuation">;</span>       offset:3<span class="token punctuation">;</span>       size:1<span class="token punctuation">;</span> signed:0<span class="token punctuation">;</span>
        field:int common_pid<span class="token punctuation">;</span>   offset:4<span class="token punctuation">;</span>       size:4<span class="token punctuation">;</span> signed:1<span class="token punctuation">;</span>

        field:unsigned long address<span class="token punctuation">;</span>    offset:8<span class="token punctuation">;</span>       size:8<span class="token punctuation">;</span> signed:0<span class="token punctuation">;</span>
        field:unsigned long <span class="token function">ip</span><span class="token punctuation">;</span> offset:16<span class="token punctuation">;</span>      size:8<span class="token punctuation">;</span> signed:0<span class="token punctuation">;</span>
        field:unsigned long error_code<span class="token punctuation">;</span> offset:24<span class="token punctuation">;</span>      size:8<span class="token punctuation">;</span> signed:0<span class="token punctuation">;</span>

print fmt: <span class="token string">&quot;address=%ps ip=%ps error_code=0x%lx&quot;</span>, <span class="token punctuation">(</span>void *<span class="token punctuation">)</span>REC-<span class="token operator">&gt;</span>address, <span class="token punctuation">(</span>void *<span class="token punctuation">)</span>REC-<span class="token operator">&gt;</span>ip, REC-<span class="token operator">&gt;</span>error_code
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>因为这些上下文信息都是通过一个裸指针返回的，所以我们需要这些信息来通过偏移量访问这些数据。</p>`,16),c=[t];function l(p,d){return s(),e("div",null,c)}const r=n(i,[["render",l],["__file","eBPF进阶.html.vue"]]);export{r as default};

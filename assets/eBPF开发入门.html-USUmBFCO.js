import{_ as p}from"./plugin-vue_export-helper-x3n3nnut.js";import{r as o,o as i,c as l,a as s,b as n,d as e,e as t}from"./app-zbifJm3d.js";const c={},r=t(`<h2 id="依赖安装" tabindex="-1"><a class="header-anchor" href="#依赖安装" aria-hidden="true">#</a> 依赖安装</h2><h3 id="rust安装" tabindex="-1"><a class="header-anchor" href="#rust安装" aria-hidden="true">#</a> Rust安装</h3><p>需要安装 Nightly 版本，略</p><h3 id="系统依赖安装" tabindex="-1"><a class="header-anchor" href="#系统依赖安装" aria-hidden="true">#</a> 系统依赖安装</h3><p>安装 bpf-linker 依赖和 bpftool 工具</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">sudo</span> <span class="token function">apt-get</span> update
<span class="token function">sudo</span> <span class="token function">apt-get</span> <span class="token function">install</span> llvm clang <span class="token parameter variable">-y</span>
<span class="token function">cargo</span> <span class="token function">install</span> bpf-linker
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="安装-bpftool-工具" tabindex="-1"><a class="header-anchor" href="#安装-bpftool-工具" aria-hidden="true">#</a> 安装 bpftool 工具</h4>`,7),u={href:"https://github.com/libbpf/bpftool",target:"_blank",rel:"noopener noreferrer"},d=t(`<ul><li>从发行版中安装：</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">sudo</span> <span class="token function">apt</span> <span class="token function">install</span> linux-tools-common linux-tools-5.15.0-52-generic linux-cloud-tools-5.15.0-52-generic <span class="token parameter variable">-y</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li>从源码中构建：</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">git</span> clone --recurse-submodules https://github.com/libbpf/bpftool.git
<span class="token builtin class-name">cd</span> src
<span class="token comment"># 安装libelf</span>
<span class="token function">sudo</span> <span class="token function">apt-get</span> <span class="token function">install</span> libelf-dev
<span class="token function">make</span> <span class="token function">install</span> <span class="token comment"># 这里可能提示创建 usr/local/sbin/bpftool permission deny 我直接用root运行似乎没问题</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="aya-向导创建-ebpf-程序" tabindex="-1"><a class="header-anchor" href="#aya-向导创建-ebpf-程序" aria-hidden="true">#</a> Aya 向导创建 eBPF 程序</h2><h3 id="使用向导创建项目" tabindex="-1"><a class="header-anchor" href="#使用向导创建项目" aria-hidden="true">#</a> 使用向导创建项目</h3><p>Aya 提供了一套模版向导用于创建 eBPF 对应的程序类型，向导创建依赖于 cargo-generate，因此我们需要在运行程序向导前提前安装：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">cargo</span> <span class="token function">install</span> cargo-generate
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>在完成依赖后，我们就可以使用向导来创建 eBPF 项目，这里以 XDP 类型程序为例：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">cargo</span> generate https://github.com/aya-rs/aya-template
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>这里我们输入项目名称 memory-scan，eBPF 程序类型选择 xdp，完成相关设定后，向导会自动帮我们创建一个名为 memory-scan 的 Rust 项目，项目包括了一个最简单的 XDP 类型的 eBPF 程序及相对应的用户空间程序。 memory-scan 目录的整体夹头如下所示：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ tree <span class="token parameter variable">-L</span> <span class="token number">3</span>
├── Cargo.lock
├── Cargo.toml
├── README.md
├── memory-scan
│   ├── Cargo.toml
│   └── src
│       └── main.rs
├── memory-scan-common
│   ├── Cargo.toml
│   └── src
│       └── lib.rs
├── memory-scan-ebpf
│   ├── Cargo.lock
│   ├── Cargo.toml
│   ├── rust-toolchain.toml
│   └── src
│       └── main.rs
├── target
│   ├── CACHEDIR.TAG
│   ├── bpfel-unknown-none
│   │   ├── CACHEDIR.TAG
│   │   └── debug
│   └── debug
│       ├── build
│       ├── deps
│       ├── examples
│       └── incremental
└── xtask
    ├── Cargo.toml
    └── src
        ├── build_ebpf.rs
        ├── main.rs
        └── run.rs

<span class="token number">16</span> directories, <span class="token number">17</span> files
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,12),m={href:"http://main.rs",target:"_blank",rel:"noopener noreferrer"},k=t(`<div class="language-rust line-numbers-mode" data-ext="rs"><pre class="language-rust"><code><span class="token attribute attr-name">#![no_std]</span>
<span class="token attribute attr-name">#![no_main]</span>

<span class="token keyword">use</span> <span class="token namespace">aya_bpf<span class="token punctuation">::</span></span><span class="token punctuation">{</span><span class="token namespace">bindings<span class="token punctuation">::</span></span>xdp_action<span class="token punctuation">,</span> <span class="token namespace">macros<span class="token punctuation">::</span></span>xdp<span class="token punctuation">,</span> <span class="token namespace">programs<span class="token punctuation">::</span></span><span class="token class-name">XdpContext</span><span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token keyword">use</span> <span class="token namespace">aya_log_ebpf<span class="token punctuation">::</span></span>info<span class="token punctuation">;</span>

<span class="token attribute attr-name">#[xdp]</span>
<span class="token keyword">pub</span> <span class="token keyword">fn</span> <span class="token function-definition function">memory_scan</span><span class="token punctuation">(</span>ctx<span class="token punctuation">:</span> <span class="token class-name">XdpContext</span><span class="token punctuation">)</span> <span class="token punctuation">-&gt;</span> <span class="token keyword">u32</span> <span class="token punctuation">{</span>
    <span class="token keyword">match</span> <span class="token function">try_memory_scan</span><span class="token punctuation">(</span>ctx<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">Ok</span><span class="token punctuation">(</span>ret<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> ret<span class="token punctuation">,</span>
        <span class="token class-name">Err</span><span class="token punctuation">(</span>_<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token namespace">xdp_action<span class="token punctuation">::</span></span><span class="token constant">XDP_ABORTED</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">fn</span> <span class="token function-definition function">try_memory_scan</span><span class="token punctuation">(</span>ctx<span class="token punctuation">:</span> <span class="token class-name">XdpContext</span><span class="token punctuation">)</span> <span class="token punctuation">-&gt;</span> <span class="token class-name">Result</span><span class="token operator">&lt;</span><span class="token keyword">u32</span><span class="token punctuation">,</span> <span class="token keyword">u32</span><span class="token operator">&gt;</span> <span class="token punctuation">{</span>
    <span class="token macro property">info!</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>ctx<span class="token punctuation">,</span> <span class="token string">&quot;received a packet&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">Ok</span><span class="token punctuation">(</span><span class="token namespace">xdp_action<span class="token punctuation">::</span></span><span class="token constant">XDP_PASS</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token attribute attr-name">#[panic_handler]</span>
<span class="token keyword">fn</span> <span class="token function-definition function">panic</span><span class="token punctuation">(</span>_info<span class="token punctuation">:</span> <span class="token operator">&amp;</span><span class="token namespace">core<span class="token punctuation">::</span>panic<span class="token punctuation">::</span></span><span class="token class-name">PanicInfo</span><span class="token punctuation">)</span> <span class="token punctuation">-&gt;</span> <span class="token operator">!</span> <span class="token punctuation">{</span>
    <span class="token keyword">unsafe</span> <span class="token punctuation">{</span> <span class="token namespace">core<span class="token punctuation">::</span>hint<span class="token punctuation">::</span></span><span class="token function">unreachable_unchecked</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="编译-ebpf-程序" tabindex="-1"><a class="header-anchor" href="#编译-ebpf-程序" aria-hidden="true">#</a> 编译 eBPF 程序</h3><p>首先，我们使用 cargo 工具编译 eBPF 对应的程序：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 在根目录下，不是在memory-scan/memory-scan下</span>
$ <span class="token function">cargo</span> xtask build-ebpf
warning: virtual workspace defaulting to <span class="token variable"><span class="token variable">\`</span>resolver <span class="token operator">=</span> <span class="token string">&quot;1&quot;</span><span class="token variable">\`</span></span> despite one or <span class="token function">more</span> workspace members being on edition <span class="token number">2021</span> <span class="token function">which</span> implies <span class="token variable"><span class="token variable">\`</span>resolver <span class="token operator">=</span> <span class="token string">&quot;2&quot;</span><span class="token variable">\`</span></span>
note: to keep the current resolver, specify <span class="token variable"><span class="token variable">\`</span>workspace.resolver <span class="token operator">=</span> <span class="token string">&quot;1&quot;</span><span class="token variable">\`</span></span> <span class="token keyword">in</span> the workspace root<span class="token string">&#39;s manifest
note: to use the edition 2021 resolver, specify \`workspace.resolver = &quot;2&quot;\` in the workspace root&#39;</span>s manifest
note: <span class="token keyword">for</span> <span class="token function">more</span> details see https://doc.rust-lang.org/cargo/reference/resolver.html<span class="token comment">#resolver-versions</span>
    Finished dev <span class="token punctuation">[</span>unoptimized + debuginfo<span class="token punctuation">]</span> target<span class="token punctuation">(</span>s<span class="token punctuation">)</span> <span class="token keyword">in</span> <span class="token number">0</span>.05s
     Running <span class="token variable"><span class="token variable">\`</span>target/debug/xtask build-ebpf<span class="token variable">\`</span></span>
   Compiling aya-bpf-cty v0.2.1 <span class="token punctuation">(</span>https://github.com/aya-rs/aya<span class="token comment">#33b2e45a)</span>
   Compiling num_enum v0.7.1
   Compiling memory-scan-common v0.1.0 <span class="token punctuation">(</span>/mnt/data/linux/ebpf/memory-scan/memory-scan-common<span class="token punctuation">)</span>
   Compiling aya-bpf-bindings v0.1.0 <span class="token punctuation">(</span>https://github.com/aya-rs/aya<span class="token comment">#33b2e45a)</span>
   Compiling aya-log-common v0.1.13 <span class="token punctuation">(</span>https://github.com/aya-rs/aya<span class="token comment">#33b2e45a)</span>
   Compiling aya-bpf v0.1.0 <span class="token punctuation">(</span>https://github.com/aya-rs/aya<span class="token comment">#33b2e45a)</span>
   Compiling aya-log-ebpf v0.1.0 <span class="token punctuation">(</span>https://github.com/aya-rs/aya<span class="token comment">#33b2e45a)</span>
   Compiling memory-scan-ebpf v0.1.0 <span class="token punctuation">(</span>/mnt/data/linux/ebpf/memory-scan/memory-scan-ebpf<span class="token punctuation">)</span>
    Finished dev <span class="token punctuation">[</span>optimized<span class="token punctuation">]</span> target<span class="token punctuation">(</span>s<span class="token punctuation">)</span> <span class="token keyword">in</span> <span class="token number">1</span>.48s
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container info"><p class="hint-container-title">相关信息</p><pre><code>在根目录下 \`Cargo.toml\` 下加一行\`resolver = &quot;2&quot;\`在原有的 \`members = [&quot;xtask&quot;, &quot;memory-scan&quot;, &quot;memory-scan-common&quot;]\` 一行后面就可以解决这个 warning
</code></pre></div><p>编译完成后，对应的程序保存在 target 目录下：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ llvm-objdump <span class="token parameter variable">-S</span> target/bpfel-unknown-none/debug/memory-scan
target/bpfel-unknown-none/debug/memory-scan:    <span class="token function">file</span> <span class="token function">format</span> elf64-bpf

Disassembly of section .text:

0000000000000000 <span class="token operator">&lt;</span>memset<span class="token operator">&gt;</span>:
       <span class="token number">0</span>:       <span class="token number">15</span> 03 06 00 00 00 00 00 <span class="token keyword">if</span> r3 <span class="token operator">==</span> <span class="token number">0</span> goto +6 <span class="token operator">&lt;</span>LBB1_<span class="token operator"><span class="token file-descriptor important">3</span>&gt;</span>
       <span class="token number">1</span>:       b7 04 00 00 00 00 00 00 r4 <span class="token operator">=</span> <span class="token number">0</span>

0000000000000010 <span class="token operator">&lt;</span>LBB1_<span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span>:
       <span class="token number">2</span>:       bf <span class="token number">15</span> 00 00 00 00 00 00 r5 <span class="token operator">=</span> r1
       <span class="token number">3</span>:       0f <span class="token number">45</span> 00 00 00 00 00 00 r5 <span class="token operator">+=</span> r4
       <span class="token number">4</span>:       <span class="token number">73</span> <span class="token number">25</span> 00 00 00 00 00 00 *<span class="token punctuation">(</span>u8 *<span class="token punctuation">)</span><span class="token punctuation">(</span>r5 + <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">=</span> r2
       <span class="token number">5</span>:       07 04 00 00 01 00 00 00 r4 <span class="token operator">+=</span> <span class="token number">1</span>
       <span class="token number">6</span>:       2d <span class="token number">43</span> fb ff 00 00 00 00 <span class="token keyword">if</span> r3 <span class="token operator">&gt;</span> r4 goto <span class="token parameter variable">-5</span> <span class="token operator">&lt;</span>LBB1_<span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span>

0000000000000038 <span class="token operator">&lt;</span>LBB1_<span class="token operator"><span class="token file-descriptor important">3</span>&gt;</span>:
       <span class="token number">7</span>:       <span class="token number">95</span> 00 00 00 00 00 00 00 <span class="token builtin class-name">exit</span>

0000000000000040 <span class="token operator">&lt;</span>memcpy<span class="token operator">&gt;</span>:
       <span class="token number">8</span>:       <span class="token number">15</span> 03 09 00 00 00 00 00 <span class="token keyword">if</span> r3 <span class="token operator">==</span> <span class="token number">0</span> goto +9 <span class="token operator">&lt;</span>LBB2_<span class="token operator"><span class="token file-descriptor important">3</span>&gt;</span>
       <span class="token number">9</span>:       b7 04 00 00 00 00 00 00 r4 <span class="token operator">=</span> <span class="token number">0</span>

0000000000000050 <span class="token operator">&lt;</span>LBB2_<span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span>:
      <span class="token number">10</span>:       bf <span class="token number">15</span> 00 00 00 00 00 00 r5 <span class="token operator">=</span> r1
      <span class="token number">11</span>:       0f <span class="token number">45</span> 00 00 00 00 00 00 r5 <span class="token operator">+=</span> r4
      <span class="token number">12</span>:       bf <span class="token number">20</span> 00 00 00 00 00 00 r0 <span class="token operator">=</span> r2
      <span class="token number">13</span>:       0f <span class="token number">40</span> 00 00 00 00 00 00 r0 <span class="token operator">+=</span> r4
      <span class="token number">14</span>:       <span class="token number">71</span> 00 00 00 00 00 00 00 r0 <span class="token operator">=</span> *<span class="token punctuation">(</span>u8 *<span class="token punctuation">)</span><span class="token punctuation">(</span>r0 + <span class="token number">0</span><span class="token punctuation">)</span>
      <span class="token number">15</span>:       <span class="token number">73</span> 05 00 00 00 00 00 00 *<span class="token punctuation">(</span>u8 *<span class="token punctuation">)</span><span class="token punctuation">(</span>r5 + <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">=</span> r0
      <span class="token number">16</span>:       07 04 00 00 01 00 00 00 r4 <span class="token operator">+=</span> <span class="token number">1</span>
      <span class="token number">17</span>:       2d <span class="token number">43</span> f8 ff 00 00 00 00 <span class="token keyword">if</span> r3 <span class="token operator">&gt;</span> r4 goto <span class="token parameter variable">-8</span> <span class="token operator">&lt;</span>LBB2_<span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span>

0000000000000090 <span class="token operator">&lt;</span>LBB2_<span class="token operator"><span class="token file-descriptor important">3</span>&gt;</span>:
      <span class="token number">18</span>:       <span class="token number">95</span> 00 00 00 00 00 00 00 <span class="token builtin class-name">exit</span>

Disassembly of section xdp:

0000000000000000 <span class="token operator">&lt;</span>memory_scan<span class="token operator">&gt;</span>:
       <span class="token number">0</span>:       bf <span class="token number">16</span> 00 00 00 00 00 00 r6 <span class="token operator">=</span> r1
       <span class="token number">1</span>:       b7 07 00 00 00 00 00 00 r7 <span class="token operator">=</span> <span class="token number">0</span>
       <span class="token number">2</span>:       <span class="token number">63</span> 7a fc ff 00 00 00 00 *<span class="token punctuation">(</span>u32 *<span class="token punctuation">)</span><span class="token punctuation">(</span>r10 - <span class="token number">4</span><span class="token punctuation">)</span> <span class="token operator">=</span> r7
       <span class="token number">3</span>:       bf a2 00 00 00 00 00 00 r2 <span class="token operator">=</span> r10
       <span class="token number">4</span>:       07 02 00 00 fc ff ff ff r2 <span class="token operator">+=</span> <span class="token parameter variable">-4</span>
    <span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>至此，已经完成了 eBPF 程序的编译工作，接着我们需要继续编译用户空间代码。</p><h2 id="运行用户空间程序" tabindex="-1"><a class="header-anchor" href="#运行用户空间程序" aria-hidden="true">#</a> 运行用户空间程序</h2><p>我们可以直接使用 cargo 命令来运行用户空间程序：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token assign-left variable">RUST_LOG</span><span class="token operator">=</span>info <span class="token function">cargo</span> xtask run
    Finished dev <span class="token punctuation">[</span>unoptimized + debuginfo<span class="token punctuation">]</span> target<span class="token punctuation">(</span>s<span class="token punctuation">)</span> <span class="token keyword">in</span> <span class="token number">0</span>.04s
     Running <span class="token variable"><span class="token variable">\`</span>target/debug/xtask run<span class="token variable">\`</span></span>
    Finished dev <span class="token punctuation">[</span>optimized<span class="token punctuation">]</span> target<span class="token punctuation">(</span>s<span class="token punctuation">)</span> <span class="token keyword">in</span> <span class="token number">0</span>.04s
    Finished dev <span class="token punctuation">[</span>unoptimized + debuginfo<span class="token punctuation">]</span> target<span class="token punctuation">(</span>s<span class="token punctuation">)</span> <span class="token keyword">in</span> <span class="token number">0</span>.06s
Error: failed to attach the XDP program with default flags - try changing XdpFlags::default<span class="token punctuation">(</span><span class="token punctuation">)</span> to XdpFlags::SKB_MODE

Caused by:
    unknown network interface eth0
Failed to run <span class="token variable"><span class="token variable">\`</span><span class="token function">sudo</span> <span class="token parameter variable">-E</span> target/debug/memory-scan<span class="token variable">\`</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container info"><p class="hint-container-title">相关信息</p><p>RUST_LOG=info 为设置日志级别的环境变量，默认为 warn，但向导生成的代码打印的日志级别默认为 info，因此需要运行时制定，否则可能会出现程序运行查看不到日志的情况。</p></div><p><code>cargo xtask run</code> 命令会直接编译用户空间代码并运行，但是运行过程中我们发现出现错误 <code>unknown network interface eth0</code>，这是因为默认生成的程序指定将 XDP 程序加载到 eth0 网卡，而我们的 VM 默认网卡不为 eth0 导致，这里我们明确制定网卡使用 lo 测试，再次运行结果如下：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token assign-left variable">RUST_LOG</span><span class="token operator">=</span>info <span class="token function">cargo</span> xtask run -- <span class="token parameter variable">--iface</span> lo
    Finished dev <span class="token punctuation">[</span>unoptimized + debuginfo<span class="token punctuation">]</span> target<span class="token punctuation">(</span>s<span class="token punctuation">)</span> <span class="token keyword">in</span> <span class="token number">0</span>.04s
     Running <span class="token variable"><span class="token variable">\`</span>target/debug/xtask run -- <span class="token parameter variable">--iface</span> lo<span class="token variable">\`</span></span>
    Finished dev <span class="token punctuation">[</span>optimized<span class="token punctuation">]</span> target<span class="token punctuation">(</span>s<span class="token punctuation">)</span> <span class="token keyword">in</span> <span class="token number">0</span>.04s
    Finished dev <span class="token punctuation">[</span>unoptimized + debuginfo<span class="token punctuation">]</span> target<span class="token punctuation">(</span>s<span class="token punctuation">)</span> <span class="token keyword">in</span> <span class="token number">0</span>.05s
<span class="token punctuation">[</span><span class="token number">2023</span>-11-16T11:36:41Z INFO  memory_scan<span class="token punctuation">]</span> Waiting <span class="token keyword">for</span> Ctrl-C<span class="token punctuation">..</span>.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这次可以发现用户空间程序已经正常运行，并且将对应的 eBPF 程序加载至内核中。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">ip</span> <span class="token function">link</span> show
<span class="token number">1</span>: lo: <span class="token operator">&lt;</span>LOOPBACK,UP,LOWER_UP<span class="token operator">&gt;</span> mtu <span class="token number">65536</span> xdpgeneric qdisc noqueue state UNKNOWN mode DEFAULT group default qlen <span class="token number">1000</span>
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    prog/xdp <span class="token function">id</span> <span class="token number">351</span> 

$ <span class="token function">sudo</span> bpftool prog list
<span class="token number">300</span>: cgroup_device  tag e3dbd137be8d6168  gpl
        loaded_at <span class="token number">2023</span>-11-15T05:07:57+0000  uid <span class="token number">0</span>
        xlated 504B  jited 310B  memlock 4096B
        pids systemd<span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
<span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span>
<span class="token number">351</span>: xdp  name memory_scan  tag 312facef5d978746  gpl
        loaded_at <span class="token number">2023</span>-11-16T11:38:22+0000  uid <span class="token number">0</span>
        xlated 1416B  jited 779B  memlock 4096B  map_ids <span class="token number">33,32</span>,34
        pids memory-scan<span class="token punctuation">(</span><span class="token number">2649040</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们可以看到当我们在另外一个窗口在本地端口运行 <code>ping -c 1 127.0.0.1</code> 命令的同时，在运行用户空间 myapp 的程序日志中打印了对应的日志 <code>received a packet</code>。但是由于本人是在开发机上运行的，每时每刻都有网络包收发，所以就没法展示了，如果在一个干净的虚拟机中运行应该不会有问题。</p>`,17),v={href:"https://aya-rs.dev/book/",target:"_blank",rel:"noopener noreferrer"},b=s("h2",{id:"参考资料",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#参考资料","aria-hidden":"true"},"#"),n(" 参考资料")],-1),f={href:"https://www.ebpf.top/post/ebpf_rust_aya/#3-aya-%E5%90%91%E5%AF%BC%E5%88%9B%E5%BB%BA-ebpf-%E7%A8%8B%E5%BA%8F",target:"_blank",rel:"noopener noreferrer"};function g(h,y){const a=o("ExternalLinkIcon");return i(),l("div",null,[r,s("p",null,[n("最后，为了生成内核数据结构的绑定，我们还必须安装 bpftool，可以从发行版中安装或从源代码中构建，可参考 "),s("a",u,[n("bpftool 仓库说明文档"),e(a)]),n("：")]),d,s("p",null,[n("生成的 eBPF 程序位于 memory-scan-ebpf/src 目录下，文件名为 "),s("a",m,[n("main.rs"),e(a)]),n("，完整内容如下所示：")]),k,s("p",null,[n("至此，我们就完成了整个基于 Aya 最简单 XDP 程序的验证，如果你打算进阶一步打印报文日志或者对特定包进行对齐，则可以参考 "),s("a",v,[n("Aya Book"),e(a)]),n(" 中对应的章节。")]),b,s("p",null,[s("a",f,[n("Rust Aya 框架编写 eBPF 程序"),e(a)])])])}const B=p(c,[["render",g],["__file","eBPF开发入门.html.vue"]]);export{B as default};

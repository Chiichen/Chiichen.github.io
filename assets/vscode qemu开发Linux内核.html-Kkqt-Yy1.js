import{_ as e}from"./plugin-vue_export-helper-x3n3nnut.js";import{r as i,o as l,c as o,a as n,b as s,d as c,e as r}from"./app-5A85a_sk.js";const t={},d={href:"http://kerneltravel.net/blog/2021/debug_kernel_szp/",target:"_blank",rel:"noopener noreferrer"},p=r(`<h2 id="获取linux源码" tabindex="-1"><a class="header-anchor" href="#获取linux源码" aria-hidden="true">#</a> 获取Linux源码</h2><ul><li>略</li></ul><h2 id="编译linux内核" tabindex="-1"><a class="header-anchor" href="#编译linux内核" aria-hidden="true">#</a> 编译Linux内核</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> /linux
<span class="token builtin class-name">export</span> <span class="token assign-left variable">ARCH</span><span class="token operator">=</span>x86
<span class="token function">make</span> <span class="token assign-left variable">CC</span><span class="token operator">=</span>clang x86_64_defconfig
<span class="token comment"># ./scripts/config --file .config -e CONFIG_NUMA_BALANCE CONFIG_NUMA_BALANCING_DEFAULT_ENABLED CONFIG_NUMA</span>
<span class="token comment"># Todo 还有一些nuuma_balance相关设置项要打开，不然后面要在编译时手动选择Y</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="config可选项" tabindex="-1"><a class="header-anchor" href="#config可选项" aria-hidden="true">#</a> config可选项</h3><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
<span class="token comment"># 可选，可以开启调试选项</span>
<span class="token function">make</span> menuconfig
<span class="token comment"># in menu</span>
Kernel hacking  ---<span class="token operator">&gt;</span> 
    <span class="token punctuation">[</span>*<span class="token punctuation">]</span> Kernel debugging
    Compile-time checks and compiler options  ---<span class="token operator">&gt;</span>
        <span class="token punctuation">[</span>*<span class="token punctuation">]</span> Compile the kernel with debug info
        <span class="token punctuation">[</span>*<span class="token punctuation">]</span>   Provide GDB scripts <span class="token keyword">for</span> kernel debuggin

<span class="token comment"># 关闭内核随机地址</span>
Processor <span class="token builtin class-name">type</span> and features ----<span class="token operator">&gt;</span>
    <span class="token punctuation">[</span><span class="token punctuation">]</span> Randomize the address of the kernel image <span class="token punctuation">(</span>KASLR<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="编译" tabindex="-1"><a class="header-anchor" href="#编译" aria-hidden="true">#</a> 编译</h3><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 下面这行官方脚本获取的编译命令有问题，很多文件clangd编译不过</span>
<span class="token comment"># ./scripts/config --file .config -e CONFIG_NUMA_BALANCE</span>
<span class="token comment">#编译,linux默认编译器使用的是gcc，会导致clangd索引不全，使用bear获取compile_command.json，索引后可以改成 make -j 32</span>
bear -- <span class="token function">make</span> <span class="token assign-left variable">CC</span><span class="token operator">=</span>clang <span class="token parameter variable">-j</span> <span class="token number">32</span>
 <span class="token comment"># 结束输出Kernel: arch/x86/boot/bzImage is ready</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="clangd配置" tabindex="-1"><a class="header-anchor" href="#clangd配置" aria-hidden="true">#</a> clangd配置</h3><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>--compile-commands-dir<span class="token operator">=</span><span class="token variable">\${workspaceFolder}</span>
--background-index
--completion-style<span class="token operator">=</span>detailed
--header-insertion<span class="token operator">=</span>never
<span class="token parameter variable">-log</span><span class="token operator">=</span>info
<span class="token parameter variable">-pretty</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="配置busybox" tabindex="-1"><a class="header-anchor" href="#配置busybox" aria-hidden="true">#</a> 配置BusyBox</h2><p>启动内核还需要一个具有根文件系统的磁盘镜像文件，根文件系统中提供可供交互的shell程序以及一些常用工具命令。<br> 我们借助busybox工具来制作根文件系统。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 下载busybox源码</span>
<span class="token function">wget</span> https://busybox.net/downloads/busybox-1.32.1.tar.bz2
<span class="token function">tar</span> <span class="token parameter variable">-xvf</span> busybox-1.32.1.tar.bz2
<span class="token builtin class-name">cd</span> busybox-1.32.1
<span class="token function">make</span> menuconfig
<span class="token comment"># 配置为静态编译</span>
<span class="token comment"># Settings  ---&gt;</span>
<span class="token comment">#            [*] Build BusyBox as a static binary (no shared libs) </span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="制作-rootfs" tabindex="-1"><a class="header-anchor" href="#制作-rootfs" aria-hidden="true">#</a> 制作 rootfs</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>szp@r420-PowerEdge-R420:~/busybox-1.32.0$ <span class="token function">dd</span> <span class="token assign-left variable">if</span><span class="token operator">=</span>/dev/zero <span class="token assign-left variable">of</span><span class="token operator">=</span>rootfs.img <span class="token assign-left variable">bs</span><span class="token operator">=</span>1M <span class="token assign-left variable">count</span><span class="token operator">=</span><span class="token number">10</span>

szp@r420-PowerEdge-R420:~/busybox-1.32.0$ mkfs.ext4 rootfs.img

szp@r420-PowerEdge-R420:~/busybox-1.32.0$ <span class="token function">mkdir</span> fs

szp@r420-PowerEdge-R420:~/busybox-1.32.0$ <span class="token function">sudo</span> <span class="token function">mount</span> <span class="token parameter variable">-t</span> ext4 <span class="token parameter variable">-o</span> loop rootfs.img ./fs

szp@r420-PowerEdge-R420:~/busybox-1.32.0$ <span class="token function">sudo</span> <span class="token function">make</span> <span class="token function">install</span> <span class="token assign-left variable">CONFIG_PREFIX</span><span class="token operator">=</span>./fs

szp@r420-PowerEdge-R420:~/busybox-1.32.0/fs$ <span class="token function">sudo</span> <span class="token function">mkdir</span> proc dev etc home mnt

szp@r420-PowerEdge-R420:~/busybox-1.32.0/fs$ <span class="token function">sudo</span> <span class="token function">cp</span> <span class="token parameter variable">-r</span> <span class="token punctuation">..</span>/examples/bootfloppy/etc/* etc/

szp@r420-PowerEdge-R420:~/busybox-1.32.0$ <span class="token function">sudo</span> <span class="token function">chmod</span> <span class="token parameter variable">-R</span> <span class="token number">777</span> fs/ 

<span class="token comment"># 写在 rootfs.img</span>
szp@r420-PowerEdge-R420:~/busybox-1.32.0$ <span class="token function">sudo</span> <span class="token function">umount</span> fs
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="启动qemu" tabindex="-1"><a class="header-anchor" href="#启动qemu" aria-hidden="true">#</a> 启动qemu</h2><p>这里用的是我的配置，就是要有这个目录结构，然后cd进linux源码文件夹执行下面的命令即可</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>/.
/<span class="token punctuation">..</span>
/linux
/busybox-1.32.1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code> qemu-system-x86_64 <span class="token parameter variable">-kernel</span> ./arch/x86_64/boot/bzImage  <span class="token parameter variable">-hda</span> <span class="token punctuation">..</span>/busybox-1.32.1/rootfs.img  <span class="token parameter variable">-append</span> <span class="token string">&quot;root=/dev/sda console=ttyS0&quot;</span> <span class="token parameter variable">-nographic</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,19);function u(b,m){const a=i("ExternalLinkIcon");return l(),o("div",null,[n("p",null,[s("参考于"),n("a",d,[s("QEMU调试Linux内核环境搭建"),c(a)])]),p])}const h=e(t,[["render",u],["__file","vscode qemu开发Linux内核.html.vue"]]);export{h as default};

import{_ as i}from"./plugin-vue_export-helper-x3n3nnut.js";import{r as t,o,c as r,a as e,b as n,d as a,e as l}from"./app-DsKBI1s6.js";const c={},d=e("h2",{id:"背景",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#背景","aria-hidden":"true"},"#"),n(" 背景")],-1),p={href:"https://github.com/zesterer/chumsky/discussions/564",target:"_blank",rel:"noopener noreferrer"},u={href:"https://github.com/zesterer/chumsky/blob/main/examples/nano_rust.rs",target:"_blank",rel:"noopener noreferrer"},v=l(`<div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>error: lifetime may not live long enough
   --<span class="token operator">&gt;</span> src/parser/chumsky_parser/nano_rs.rs:206:5
    <span class="token operator">|</span>
<span class="token number">200</span> <span class="token operator">|</span>   fn expr_parser<span class="token operator">&lt;</span><span class="token string">&#39;tokens, &#39;</span>src: <span class="token string">&#39;tokens&gt;() -&gt; impl Parser&lt;
    |                  -------  ---- lifetime \`&#39;</span>src<span class="token variable"><span class="token variable">\`</span> defined here
    <span class="token operator">|</span>                  <span class="token operator">|</span>
    <span class="token operator">|</span>                  lifetime <span class="token variable">\`</span></span><span class="token string">&#39;tokens\` defined here
...
206 | /     recursive(|expr| {
207 | |         let inline_expr = recursive(|inline_expr| {
208 | |             let val = select! {
209 | |                 Token::Null =&gt; Expr::Value(Value::Null),
...   |
405 | |             )
406 | |     })
    | |______^ function was supposed to return data with lifetime \`&#39;</span>src<span class="token variable"><span class="token variable">\`</span> but it is returning data with lifetime <span class="token variable">\`</span></span><span class="token string">&#39;tokens\`
    |
    = help: consider adding the following bound: \`&#39;</span>tokens: &#39;src\`
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后我尝试了在<code>chumsky</code>项目中直接运行</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">cargo</span> run <span class="token parameter variable">--example</span> nano_rust -- examples/sample.nrs
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>这样是不会报错的，于是我开始排查</p><h2 id="问题所在" tabindex="-1"><a class="header-anchor" href="#问题所在" aria-hidden="true">#</a> 问题所在</h2><p>我创建了一个新项目，一点点试，结果发现把原来的 <code>src</code> 直接拷贝到新项目中是没有问题的。最后发现是 <code>cargo.toml</code> 中的 <code>edition</code> 字段影响了这个结果。也就是说，只要把</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token punctuation">[</span>package<span class="token punctuation">]</span>
name = &quot;nano_rs&quot;
version = &quot;0.1.0&quot;
<span class="token comment"># See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html</span>

<span class="token punctuation">[</span>dependencies<span class="token punctuation">]</span>
chumsky = <span class="token punctuation">{</span> version = &quot;1.0.0<span class="token punctuation">-</span>alpha.6&quot;<span class="token punctuation">,</span> features = <span class="token punctuation">[</span><span class="token string">&quot;label&quot;</span><span class="token punctuation">]</span> <span class="token punctuation">}</span>
ariadne = &quot;0.3.0&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>改成</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token punctuation">[</span>package<span class="token punctuation">]</span>
name = &quot;nano_rs&quot;
version = &quot;0.1.0&quot;
edition = &quot;2021&quot;
<span class="token comment"># See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html</span>

<span class="token punctuation">[</span>dependencies<span class="token punctuation">]</span>
chumsky = <span class="token punctuation">{</span> version = &quot;1.0.0<span class="token punctuation">-</span>alpha.6&quot;<span class="token punctuation">,</span> features = <span class="token punctuation">[</span><span class="token string">&quot;label&quot;</span><span class="token punctuation">]</span> <span class="token punctuation">}</span>
ariadne = &quot;0.3.0&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>就不会出现这个错误了。但是具体的原因我还不清楚，cargo 生成的 rustc 编译命令中也只是把 <code>edition = &quot;2021&quot;</code> 作为参数传入了，暂不清楚这个参数具体是怎么作用于编译器的，虽然按照官方的说法，如果不指定 <code>edition = &quot;2015|2018|2021&quot;</code> 默认是用 <code>edition = &quot;2015&quot;</code>的，但是在系统内是没有这个版本的编译器的，我猜测这个 edition 是通过开关某些 feature 来实现的，因此虽然安装的是最新的编译器，但是默认使用了2015的feature，就会导致编译器行为异常</p>`,10);function m(b,k){const s=t("ExternalLinkIcon");return o(),r("div",null,[d,e("p",null,[n("交流过程可见于 "),e("a",p,[n("Github Discussions"),a(s)]),n("。起因是我在学习 rust 的一个 PEG(Parser Expression Generator)库来实现编译器的时候，看到了这段示例代码 "),e("a",u,[n("nano_rs"),a(s)]),n("，当我把它复制进我的项目中时发生了报错")]),v])}const g=i(c,[["render",m],["__file","edition设置引起的rust编译器报错.html.vue"]]);export{g as default};

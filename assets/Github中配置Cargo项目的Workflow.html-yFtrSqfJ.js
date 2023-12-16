import{_ as e}from"./plugin-vue_export-helper-x3n3nnut.js";import{r as t,o as c,c as l,a as n,b as s,d as p,e as i}from"./app-RfL3a13A.js";const o={},u=n("h2",{id:"项目背景",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#项目背景","aria-hidden":"true"},"#"),s(" 项目背景")],-1),r={href:"https://github.com/RccCommunity/rcc",target:"_blank",rel:"noopener noreferrer"},k=i(`<h2 id="示例" tabindex="-1"><a class="header-anchor" href="#示例" aria-hidden="true">#</a> 示例</h2><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">name</span><span class="token punctuation">:</span> Rust

<span class="token key atrule">on</span><span class="token punctuation">:</span> <span class="token punctuation">[</span>push<span class="token punctuation">,</span> pull_request<span class="token punctuation">]</span>

<span class="token key atrule">env</span><span class="token punctuation">:</span>
  <span class="token key atrule">CARGO_TERM_COLOR</span><span class="token punctuation">:</span> always

<span class="token key atrule">jobs</span><span class="token punctuation">:</span>
  
  <span class="token key atrule">check</span><span class="token punctuation">:</span>
    <span class="token key atrule">runs-on</span><span class="token punctuation">:</span> ubuntu<span class="token punctuation">-</span>latest
    <span class="token key atrule">steps</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Check out
        <span class="token key atrule">uses</span><span class="token punctuation">:</span> actions/checkout@v3
      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Set up cargo cache
        <span class="token key atrule">uses</span><span class="token punctuation">:</span> actions/cache@v3
        <span class="token key atrule">with</span><span class="token punctuation">:</span>
          <span class="token key atrule">path</span><span class="token punctuation">:</span> <span class="token punctuation">|</span><span class="token scalar string">
            ./target
            ~/.cargo            </span>
          <span class="token key atrule">key</span><span class="token punctuation">:</span> debug<span class="token punctuation">-</span>$<span class="token punctuation">{</span><span class="token punctuation">{</span> runner.os <span class="token punctuation">}</span><span class="token punctuation">}</span><span class="token punctuation">-</span>$<span class="token punctuation">{</span><span class="token punctuation">{</span> hashFiles(&#39;rust<span class="token punctuation">-</span>toolchain.toml&#39;) <span class="token punctuation">}</span><span class="token punctuation">}</span><span class="token punctuation">-</span>$<span class="token punctuation">{</span><span class="token punctuation">{</span> hashFiles(&#39;Cargo.lock&#39;) <span class="token punctuation">}</span><span class="token punctuation">}</span>
          <span class="token key atrule">restore-keys</span><span class="token punctuation">:</span> <span class="token punctuation">|</span><span class="token scalar string">
            debug-\${{ runner.os }}-\${{ hashFiles(&#39;rust-toolchain.toml&#39;) }}-
            debug-\${{ runner.os }}- </span>
      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Install Rust
        <span class="token key atrule">uses</span><span class="token punctuation">:</span> actions<span class="token punctuation">-</span>rs/toolchain@v1
        <span class="token key atrule">with</span><span class="token punctuation">:</span>
          <span class="token key atrule">profile</span><span class="token punctuation">:</span> minimal
          <span class="token key atrule">toolchain</span><span class="token punctuation">:</span> nightly
          <span class="token key atrule">override</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
          <span class="token key atrule">components</span><span class="token punctuation">:</span> rustfmt<span class="token punctuation">,</span> clippy
      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Lint
        <span class="token key atrule">run</span><span class="token punctuation">:</span> <span class="token punctuation">|</span><span class="token scalar string">
          cargo fmt --all -- --check
          cargo clippy -- -D warnings          </span>
      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Install cargo check tools
        <span class="token key atrule">run</span><span class="token punctuation">:</span> <span class="token punctuation">|</span><span class="token scalar string">
          cargo install --locked cargo-deny || true
          cargo install --locked cargo-outdated || true
          cargo install --locked cargo-udeps || true
          cargo install --locked cargo-audit || true
          cargo install --locked cargo-pants || true     </span>
      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Rustfmt
        <span class="token key atrule">run</span><span class="token punctuation">:</span> cargo fmt <span class="token punctuation">-</span><span class="token punctuation">-</span>all <span class="token punctuation">-</span><span class="token punctuation">-</span> <span class="token punctuation">-</span><span class="token punctuation">-</span>check  
      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Check
        <span class="token key atrule">run</span><span class="token punctuation">:</span> <span class="token punctuation">|</span><span class="token scalar string">
          cargo deny check
          cargo outdated
          cargo udeps
          rm -rf ~/.cargo/advisory-db
          cargo audit
          cargo pants          </span>
      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Test
        <span class="token key atrule">run</span><span class="token punctuation">:</span> cargo test
      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Build
        <span class="token key atrule">run</span><span class="token punctuation">:</span> cargo build <span class="token punctuation">-</span><span class="token punctuation">-</span>verbose
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container info"><p class="hint-container-title">相关信息</p><p>但是 actions-rs/toolchain@v1 在2023年10月被 Archived 了，所以后面等没用了要看看有没有别的替代品，没有的话就只能自己写一个了</p></div>`,3);function d(v,m){const a=t("ExternalLinkIcon");return c(),l("div",null,[u,n("p",null,[n("a",r,[s("rcc编译器"),p(a)])]),k])}const y=e(o,[["render",d],["__file","Github中配置Cargo项目的Workflow.html.vue"]]);export{y as default};

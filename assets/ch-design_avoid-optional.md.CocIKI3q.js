import{_ as i,c as a,o as n,ag as t}from"./chunks/framework.D53w8jfx.js";const d=JSON.parse('{"title":"Item 37: Limit the Use of Optional Properties","description":"","frontmatter":{},"headers":[],"relativePath":"ch-design/avoid-optional.md","filePath":"ch-design/avoid-optional.md"}'),p={name:"ch-design/avoid-optional.md"};function l(h,s,k,e,g,r){return n(),a("div",null,s[0]||(s[0]=[t(`<h1 id="item-37-limit-the-use-of-optional-properties" tabindex="-1">Item 37: Limit the Use of Optional Properties <a class="header-anchor" href="#item-37-limit-the-use-of-optional-properties" aria-label="Permalink to &quot;Item 37: Limit the Use of Optional Properties&quot;">​</a></h1><h2 id="要点" tabindex="-1">要点 <a class="header-anchor" href="#要点" aria-label="Permalink to &quot;要点&quot;">​</a></h2><ul><li>Optional properties can prevent the type checker from finding bugs and can lead to repeated and possibly inconsistent code for filling in default values.</li><li>Think twice before adding an optional property to an interface. Consider whether you could make it required instead.</li><li>Consider creating distinct types for un-normalized input data and normalized data for use in your code.</li><li>Avoid a combinatorial explosion of options.</li><li>可选属性可能会阻止类型检查器发现错误，并可能导致重复且可能不一致的代码来填充默认值。</li><li>在向接口添加可选属性之前，三思而后行。考虑是否可以将其改为必填属性。</li><li>考虑为未标准化的输入数据和标准化的数据创建不同的类型，以便在代码中使用。</li><li>避免选项的组合爆炸。</li></ul><h2 id="正文" tabindex="-1">正文 <a class="header-anchor" href="#正文" aria-label="Permalink to &quot;正文&quot;">​</a></h2><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> FormattedValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  units</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> formatValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> FormattedValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /* ... */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGIHsoFs5kgEwDU4AbAVxQG8AoZZAN1IoC5kQysAjaAbluTIhgYAM6sRYKKADmfAL7UYghGGDoQyGJhxhi5CAApG+1hmy4CeigEpklZAHoAVMgB075E4fIFQA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Hike</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  miles</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  hours</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> formatHike</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">miles</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">hours</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Hike</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> distanceDisplay</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> formatValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ value: miles, units: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;miles&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> paceDisplay</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> formatValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ value: miles </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> hours, units: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;mph&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">distanceDisplay</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">} at \${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">paceDisplay</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGIHsoFs5kgEwDU4AbAVxQG8AoZZAN1IoC5kQysAjaAbluTIhgYAM6sRYKKADmfAL7UYghGGDoQyGJhxhi5CAApG+1hmy4CeigEpklZAHoAVMgB075E4fIFoSLEQUAAlgAGsqfixgEggxNg5uKD46AAt0Mig49i5eagUlEBU1DS1zMBDwg0oomJEAGmQ0jJE5VgqIWxo6BHUJZHxgCThCiAARQYAHEjgAT2QAXk1tXCtDSmMWZBrYhsFhOIBybZEDuWtk5B6QPonA8ZEp2YWlstWqjYhWY8dG9MzdoSiVhHCYpU7nfhQCBgDIaAAGABJKAMhiN7o8ZnJkLhkEjbkh0dNMXD5NQgA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UnitSystem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;metric&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;imperial&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> FormattedValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  units</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** default is imperial */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  unitSystem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UnitSystem</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAqgdgS2AZRAZ2BAtlAvFAciwmACcEBjAqAH0IS0nIEMAbAgbgCgE5NSAZswrQAYgHtSWZsEwATAGpsArtADeXKFABuKiAC4ocZVgBGEUty3LEwNIYzk4AcytQA9ACpPUORCHKrMBQCGghjBYIbFCe7ppQNkioGNgA-IbwSeiYWNwAvlxAA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AppConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  darkMode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // ... other settings ...</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** default is imperial */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  unitSystem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UnitSystem</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAqgdgS2AZRAZ2BAtlAvFAciwmACcEBjAqAH0IS0nIEMAbAgbgCgE5NSAZswrQAYgHtSWZsEwATAGpsArtADeXKFABuKiAC4ocZVgBGEUty3LEwNIYzk4AcytQA9ACpPUORCHKrMBQCGghjBYIbFCe7ppQNkioGNgA-IbwSeiYWNwAvjx8FkIiUACCYGAAwuJwAgjOUBpacsykANYAsuJ+hqbi4qwQzHBu7u5QAHTTUOLAABYWUGgkwLzOYdOT8V4+fgFBIWEMTFGsMXHWtsk56bDX2dj5XEA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> formatHike</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">miles</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">hours</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Hike</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">config</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AppConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unitSystem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> config</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> distanceDisplay</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> formatValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    value: miles,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    units: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;miles&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    unitSystem,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  })</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> paceDisplay</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> formatValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    value: miles </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> hours,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    units: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;mph&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// forgot unitSystem, oops!</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  })</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">distanceDisplay</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">} at \${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">paceDisplay</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAqgdgS2AZRAZ2BAtlAvFAciwmACcEBjAqAH0IS0nIEMAbAgbgCgE5NSAZswrQAYgHtSWZsEwATAGpsArtADeXKFABuKiAC4ocZVgBGEUty3LEwNIYzk4AcytQA9ACpPUORCHKrMBQCGghjBYIbFCe7ppQNkioGNgA-IbwSeiYWNwAvjx8FkIiUACCYGAAwuJwAgjOUBpacsykANYAsuJ+hqbi4qwQzHBu7u5QAHTTUOLAABYWUGgkwLzOYdOT8V4+fgFBIWEMTFGsMXHWtsk56bDX2dj5hfwl0AASCO3q8VgIQ-YjCZzJZ4vNxMpSIDjGYLM8BDYKGtalABJJpMAlKxVAAKXTYgxQCRSGTyLGqACUTQ8Pi2FygBQRcCRCBRaJJwE+3xxaj+AIANFBwZC0HlDFyIIKKLV6s5DBVqjKGlTmlBpXAMNTEihHjg8ng1UrXPF1Zq5KFgCMRAARUJgVjMEAG9kY8kQHnxLT41SGPkQNCC7WAoj-f0EQMPFJYeJ5CluU3BMDCCC2tD2x3O9EyN0erRevS+0NhCbCqERpDBxjzageCbs5xzBKRnKCgZgNAAQhjcfipBIkLgUAABgASNTmjBWlN2h0gfUyKBjpM2meOvJD55AA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">declare</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> config</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AppConfig</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> unitSystem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> config.unitSystem </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">??</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;imperial&#39;</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAqgdgS2AZRAZ2BAtlAvFAciwmACcEBjAqAH0IS0nIEMAbAgbgCgE5NSAZswrQAYgHtSWZsEwATAGpsArtADeXKFABuKiAC4ocZVgBGEUty3LEwNIYzk4AcytQA9ACpPUORCHKrMBQCGghjBYIbFCe7ppQNkioGNgA-IbwSeiYWNwAvjx8FkIiUACCYGAAwuJwAgjOUBpacsykANYAsuJ+hqbi4qwQzHBu7u5QAHTTUOLAABYWUGgkwLzOYdOT8V4+fgFBIWEMTFGsMXHWtsk56bDX2dj5hfwl0AASCO3q8VgIQ-YjCZzJZ4vNxMpSIDjGYLM8BDYKGtalABJJpMAlKxVAAKXTYgxQCRSGTyLGqACUTQ8Pi2FygBT8FFYbWgQ2CFFq9Wchgq1S5DW4nLgGASDxSOHwwu5k0SKEeOFSqXoERY7G4QA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> unitSystem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> config.unitSystem </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">??</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;metric&#39;</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAqgdgS2AZRAZ2BAtlAvFAciwmACcEBjAqAH0IS0nIEMAbAgbgCgE5NSAZswrQAYgHtSWZsEwATAGpsArtADeXKFABuKiAC4ocZVgBGEUty3LEwNIYzk4AcytQA9ACpPUORCHKrMBQCGghjBYIbFCe7ppQNkioGNgA-IbwSeiYWNwAvjx8FkIiUACCYGAAwuJwAgjOUBpacsykANYAsuJ+hqbi4qwQzHBu7u5QAHTTUOLAABYWUGgkwLzOYdOT8V4+fgFBIWEMTFGsMXHWtsk56bDX2dj5hfwl0AASCO3q8VgIQ-YjCZzJZ4vNxMpSIDjGYLM8BDYKGtalABJJpMAlKxVAAKXTYgxQCRSGTyLGqACUTQ8Pi2FygBT8FFYbWgQ2CFFq9Wchgq1S5DW4nLgGASDxSOHwwu5k0SKEeOFSqUIxDIlE4XCAA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> InputAppConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  darkMode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // ... other settings ...</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** default is imperial */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  unitSystem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UnitSystem</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AppConfig</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> InputAppConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  unitSystem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UnitSystem</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // required</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAqgdgS2AZRAZ2BAtlAvFAciwmACcEBjAqAH0IS0nIEMAbAgbgCgE5NSAZswrQAknDABXYAEEwYAMIB7OAIQBzKAG8uUKABNmpANYBZJfogAuKACMlS1hGZxuegPTuoAOl9QlwAAWEKRQaCTAvOpoPr66UO4AVIkGEEKSrMBQCDEMTAhsUInu8ZKIKOiYWAD8NvBIqBjY3AC+PHwhQiJQcooqapoQAB6YcPox4lKy8sqqGtql5Y1VdUuVzR5epBAAjpII2-pcbUA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> normalizeAppConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">inputConfig</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> InputAppConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AppConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    ...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">inputConfig,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    unitSystem: inputConfig.unitSystem </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">??</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;imperial&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAqgdgS2AZRAZ2BAtlAvFAciwmACcEBjAqAH0IS0nIEMAbAgbgCgE5NSAZswrQAknDABXYAEEwYAMIB7OAIQBzKAG8uUKABNmpANYBZJfogAuKACMlS1hGZxuegPTuoAOl9QlwAAWEKRQaCTAvOpoPr66UO4AVIkGEEKSrMBQCDEMTAhsUInu8ZKIKOiYWAD8NvBIqBjY3AC+PHwhQiJQcooqapoQAB6YcPox4lKy8sqqGtql5Y1VdUuVzR5epBAAjpII2-pcbQJlFJEqUHBKpFhsCABeEL2zAwAUvFOvGjaT0i-9DQAShsALmmh0em2wEkpDgCz0el83k+0m+6gANPE9GUGussDZUcB0d5cRUmjhqtV6IwQgV2Fi9C1WlwgA" target="_blank" rel="noreferrer">💻 playground</a></p>`,30)]))}const E=i(p,[["render",l]]);export{d as __pageData,E as default};

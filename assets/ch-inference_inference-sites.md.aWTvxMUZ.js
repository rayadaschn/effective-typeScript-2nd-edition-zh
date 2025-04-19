import{_ as i,c as a,o as h,ag as t}from"./chunks/framework.D53w8jfx.js";const d=JSON.parse('{"title":"Item 28: Use Classes and Currying to Create New Inference Sites","description":"","frontmatter":{},"headers":[],"relativePath":"ch-inference/inference-sites.md","filePath":"ch-inference/inference-sites.md"}'),n={name:"ch-inference/inference-sites.md"};function e(p,s,l,k,g,r){return h(),a("div",null,s[0]||(s[0]=[t(`<h1 id="item-28-use-classes-and-currying-to-create-new-inference-sites" tabindex="-1">Item 28: Use Classes and Currying to Create New Inference Sites <a class="header-anchor" href="#item-28-use-classes-and-currying-to-create-new-inference-sites" aria-label="Permalink to &quot;Item 28: Use Classes and Currying to Create New Inference Sites&quot;">​</a></h1><h2 id="要点" tabindex="-1">要点 <a class="header-anchor" href="#要点" aria-label="Permalink to &quot;要点&quot;">​</a></h2><ul><li>For functions with multiple type parameters, inference is all or nothing: either all type parameters are inferred or all must be specified explicitly.</li><li>To get partial inference, use either classes or currying to create a new inference site.</li><li>Prefer the currying approach if you&#39;d like to create a local type alias.</li><li>对于具有多个类型参数的函数，推断是全有或全无的：要么所有类型参数都被推断，要么必须全部显式指定。</li><li>若要实现部分推断，可以使用类或柯里化来创建新的推断位置。</li><li>如果想创建一个局部类型别名，优先使用柯里化方法。</li></ul><h2 id="正文" tabindex="-1">正文 <a class="header-anchor" href="#正文" aria-label="Permalink to &quot;正文&quot;">​</a></h2><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SeedAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &#39;/seeds&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Seed</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &#39;/seed/apple&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Seed</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &#39;/seed/strawberry&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Seed</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eEA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">declare</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetchAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">API</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Path</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> keyof</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> API</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  path</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Path</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">API</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]&gt;</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPIxVADTIynBg5chCkCCY5MgA1hAhojDIVXgAfAAUwi3lZM2tAJRzUKIswHrVVSbz5WZjDEA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fetchAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SeedAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/seed/strawberry&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//       ~~~~~~~ Expected 2 type arguments, but got 1.</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPIxVADTIynBg5chCkCCY5MgA1hAhojDIVXgAfAAUwi3lZM2tAJRzUKIswHrVVSbz5WZjDCVllWrVEVWTXrac-kFQoZoLDNGEL4QAfh+fb8gAoiIpkGwACZkGAQsIUOkaFk2OByI0AllJDRRJIAIyxPBAA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> berry</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetchAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SeedAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/seed/strawberry&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/seed/strawberry&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ok</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//    ^? const berry: Promise&lt;Seed&gt;</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPIxVADTIynBg5chCkCCY5MgA1hAhojDIVXgAfAAUwi3lZM2tAJRzUKIswHrVVSbz5WZjDAiFlMhBUKHIALzFpRVV1RENnrrenP6noZqTXravgcFhCzohGiyFEvTwIMIyAAegB+ZCHEDHd4hZardYQe4KMZ4IA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">declare</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ApiFetcher</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">API</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  fetch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Path</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> keyof</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> API</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">path</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">API</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPIxVADTIynBg5chCkCCY5MgA1hAhojDIVXgAfAAUwi3lZM2tAJRzUKIswHrVVSbz5WZjDMmp6ShH5D2KwsAAYqUV0JtqYxqEJWXl1Tvtgp3dfQNDI0eUxmcxmSyaKzWGy2Oz2DH4QA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> fetcher</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ApiFetcher</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SeedAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> berry</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> fetcher.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fetch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/seed/strawberry&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// OK</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//    ^? const berry: Seed</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">fetcher.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fetch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/seed/chicken&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//            ~~~~~~~~~~~~~~~</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Argument of type &#39;&quot;/seed/chicken&quot;&#39; is not assignable to type &#39;keyof SeedAPI&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> seed</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Seed</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> fetcher.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fetch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/seeds&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//    ~~~~ Seed[] is not assignable to Seed</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5&amp;module=7&amp;target=4#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPIxVADTIynBg5chCkCCY5MgA1hAhojDIVXgAfAAUwi3lZM2tAJRzUKIswHrVVSbz5WZjDMmp6ShH5D2KwsAAYqUV0JtqYxqEJWXl1Tvtgp3dfQNDI0eUxmcxmSyaKzWGy2Oz2DH4CEKlGKt3K0GQAF4mBA-CNLjc3vcIlVJgsGIiQMiglBQpjkP44MBJK87lBYizyhMvLZOP5qaFNGTkNFkAB5ADSeBFhGQAD0APzIClU4IhIwKPB4DnQdmorm6bwVYAIfogQUMaUyq0ygB+dvtDsdUpiiigNCybHAyABYBCwhQmgARAbbEaTRAQIHNEQeiBRJI4GdgDRmAFnMgwKIM36A-1BsNiWpNJrlZIbKQ3NgsQymSjCWyOfrywYyc6rQ7K+YY0x4-Skym4GmUJnK3ggA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">declare</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getDate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">mon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">day</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Date</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getDate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;dec&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, 25)</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5&amp;module=7&amp;target=4#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPIxVADTIynBg5chCkCCY5MgA1hAhojDIVXgAfAAUwi3lZM2tAJRzUKIswHrVVSbz5WZjDMmp6ShH5D2KwsAAYqUV0JtqYxqEJWXl1Tvtgp3dfQNDI0eUxmcxmSyaKzWGy2Oz2DH4hzSGWKOTyBSKNFKABEWhAJixChwqLRGpg4CEyCAsiwglBwTjIAxMWAGXjNIdNI0AEwAVgWDCAA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">declare</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getDate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">mon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">day</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Date</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getDate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;dec&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)(25)</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5&amp;module=7&amp;target=4#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPIxVADTIynBg5chCkCCY5MgA1hAhojDIVXgAfAAUwi3lZM2tAJRzUKIswHrVVSbz5WZjDMmp6ShH5D2KwsAAYqUV0JtqYxqEJWXl1Tvtgp3dfQNDI0eUxmcxmSyaKzWGy2Oz2DH4hzSGWKOTyBSKNFKABEWhAJixChwqLRwRNMHAQmQQFkWEEoAtkABeJ44yAMTFgVl4zSHTQLCYAJgArAsGEA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">declare</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetchAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">API</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;()</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Path</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> keyof</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> API</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  path</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Path</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">API</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]&gt;</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPFUAfAAUAJQkjNXKcGDlyEKQIJjkyADWECGiMMj1DcKd5WQdXU3IALx1yMpQoizAerVqJgvlZnUMQA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> berry</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetchAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SeedAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;()(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/seed/strawberry&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// OK</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//    ^? const berry: Seed</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fetchAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SeedAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;()(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/seed/chicken&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//                  ~~~~~~~~~~~~~~~</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Argument of type &#39;&quot;/seed/chicken&quot;&#39; is not assignable to type &#39;keyof SeedAPI&#39;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> seed</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Seed</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetchAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SeedAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;()(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/seeds&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//    ~~~~ Seed[] is not assignable to Seed</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5&amp;module=7&amp;target=4#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPFUAfAAUAJQkjNXKcGDlyEKQIJjkyADWECGiMMj1DcKd5WQdXU3IALx1yMpQoizAerVqJgvlZnUMCIWUyEFQoSvI-nDAkiVllWrVEVNNDV62nP5XoU0TToyGiyAA8gBpPBgwjIAB6AH5kGcQBcASEjAo8HhnhUqu8FJ9vrpvBVgAgRiAgQxYXD6Qz6QA-FmstnsmExRRQGhZNjgZDjZBgELCFCaABEpNs5MpEBAEs0REGIFEkjg5HIwBozACzmFomFovFIzGEw+ak0nLwqIuNlIbmwyzufgeT1K+LeFtUjS+PwGNM5zNZjvMyqYarumu1uv1YENETwQA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> fetchSeedAPI</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetchAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SeedAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> berry</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetchSeedAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/seed/strawberry&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//    ^? const berry: Seed</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5&amp;module=7&amp;target=4#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPFUAfAAUAJQkjNXKcGDlyEKQIJjkyADWECGiMMj1DcKd5WQdXU3IALx1yMpQoizAerVqJgvlZnUMCIWUxaUVEVUrl2WVatU3ao1Np+eSQVChd-5wwEkJQeL1UDS8tk4-m+oU07zw0UIhAAegB+ZBnEAXGEhIwKPBAA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">declare</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> apiFetcher</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">API</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;()</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  fetch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Path</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> keyof</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> API</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">path</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">API</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> fetcher</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> apiFetcher</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SeedAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">fetcher.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fetch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/seed/strawberry&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ok</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5&amp;module=7&amp;target=4#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPFUAfAAUAJQkjNXKcGDlyEKQIJjkyADWECGiMMj1DcKd5WQdXU3IALx1yMpQoizAerVqJgvlZnUMyanpmTl5BUX2wABipRXQe6qNLRqEJWXl7bM9gj6A2Go3GkzUjRmXXmsw+Gy2OwgrwOs2ODH4eAQhUoxSe5WgK2Qd0ePxeESmTQY32eUFi1PKDS8tk4-iCUFCmkphGiyFEQzwQA" target="_blank" rel="noreferrer">💻 playground</a></p><hr><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetchAPI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">API</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Routes</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> keyof</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> API</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // local type alias</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Path</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Routes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">path</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">API</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    fetch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(path).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">then</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">r</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> r.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">())</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><a href="https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eDAAriAIYMCiIMgwEGAIABYqqgA8xQB8ABQAlBqEYCHCKABKosmQ5MgAvMgA1hAhojDIxcgAZBRUtHSE0ciOoghwjsgNTcjLwHDkeIxQeclQ2SXKcGAFyEKQIJidre0Q5FWMhMJnBWSn54zVn1CiLGAejKahMXwKZnK3ShuXyBUqb3O1Vi5wgIEqUGhyCgsQAVuQsjVqgx+EA" target="_blank" rel="noreferrer">💻 playground</a></p>`,42)]))}const y=i(n,[["render",e]]);export{d as __pageData,y as default};

# Item 73: 使用 Source Maps 调试 TypeScript

## 要点

- 不要调试生成的 JavaScript。使用 source maps 在运行时调试你的 TypeScript 代码。
- 确保你的 source maps 能够一直映射到你实际运行的代码。
- 了解如何调试用 TypeScript 编写的 Node.js 代码。
- 根据你的设置，你的 source maps 可能包含原始代码的内联副本。除非你知道自己在做什么，否则不要发布它们！

## 正文

当你运行 TypeScript 代码时，你实际上运行的是 TypeScript 编译器生成的 JavaScript。这对于任何源码到源码的编译器都是如此，无论是压缩器、编译器还是预处理器。希望这大部分是透明的，你可以假装 TypeScript 源代码正在被执行，而不必查看 JavaScript。

这在大多数情况下都很好，直到你需要调试代码。调试器通常在你执行的代码上工作，不知道它经历的转换过程。由于 JavaScript 是如此流行的目标语言，浏览器厂商合作解决了这个问题。结果是 source maps。它们将生成文件中的位置和符号映射回原始源代码中对应的位置和符号。大多数浏览器和许多 IDE 都支持它们。如果你不使用它们来调试你的 TypeScript，你就错过了！

假设你创建了一个小脚本来向 HTML 页面添加一个按钮，每次点击时都会递增：

```ts
// index.ts
function addCounter(el: HTMLElement) {
  let clickCount = 0
  const button = document.createElement('button')
  button.textContent = 'Click me'
  button.addEventListener('click', () => {
    clickCount++
    button.textContent = `Click me (${clickCount})`
  })
  el.appendChild(button)
}

addCounter(document.body)
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEEsDsBMFMA8B0AXAzgKAGYFdIGNlwB7SUAQ2mgGEjdlYAnAClgBsAuUACQBUBZADIBRVrAC2sSMgCUoAN7pQoUclB5W4PAGsadUAF5QABgDcitSVSqARtmTISB0NCJ5sEqYjwNYZeiPFJZCYAclt7EhDpMyVwh0gUBGQaKSCnEKoNbVAJEJjQOJJECmghADcggXArSUZQ9U0tEIAaUCZZfQA+eXMlBu1dKQBqIfzYu3jE+GSSeiknAANMxpzYNoASOX6dWikAX2kF-IP8tmKAB3PJagALcFZoJkLIaPQ99HQSwfpmFzcPZCIaxEaAAT1eQA)

如果你在浏览器中加载这个并打开调试器，你会看到生成的 JavaScript（这里我们使用 ES5 目标）。这与原始源代码非常匹配，所以调试不是太困难，如图 9-2 所示。

![图 9-2. 使用 Chrome 开发者工具调试生成的 JavaScript。对于这个简单的例子，生成的 JavaScript 与 TypeScript 源代码非常相似。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506240846723.png)

让我们通过从 numbersapi.com 获取每个数字的有趣事实来让页面更有趣：

```ts
// index.ts
function addCounter(el: HTMLElement) {
  let clickCount = 0
  const triviaEl = document.createElement('p')
  const button = document.createElement('button')
  button.textContent = 'Click me'
  button.addEventListener('click', async () => {
    clickCount++
    const response = await fetch(`http://numbersapi.com/${clickCount}`)
    const trivia = await response.text()
    triviaEl.textContent = trivia
    button.textContent = `Click me (${clickCount})`
  })
  el.appendChild(triviaEl)
  el.appendChild(button)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEEsDsBMFMA8B0AXAzgKAGYFdIGNlwB7SUAQ2mgGEjdlYAnAClgBsAuUACQBUBZADIBRVrAC2sSMgCUoAN7pQoUclB5W4PAGsadUAF5QABgDcitSVSrkDcADdwZEQdDQiebBKmI8DWGXoRcUlkJgByAAcw6TMlPEtVACNsZGQSFzcPL2QfPwDYIOzw5NSSaNjQErTIFARkGikQlzCqDW1QCTCKqpJECmghOxCBcCtJRnD1TS0wgBpyVABPfFAmWX0APnlzOLadWikAakOKuITQP1QIy1gXMgB3MnBVTFhkPAALJgADD9SI9ggSCeRKMVBkCLgHxEMTAAAkcim2l0UgAvt8YjsLJArKAbPZHHdHs8LrArjdavBQpilEp8Q4nKxKfUSPQpC56Y5TpUUtVmQ02apDN9WtMOrcmAikfs6KjpN8KnKKmw+hEIpJqB9wKxoExOYyaaAVRD1TAqFqdUwepBMaj0EA)

如果你快速点击按钮几次，你可能会发现一个竞态条件！如果你现在打开浏览器的调试器来调查，你会看到生成的源代码变得 dramatically 更复杂（见图 9-3）。

![图 9-3. TypeScript 编译器生成的 JavaScript 与原始 TypeScript 源代码不再相似。这会使调试变得更加困难。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506240848910.png)

为了在旧浏览器中支持 async 和 await，TypeScript 将事件处理程序重写为状态机。这具有相同的行为，但代码不再与原始源代码如此相似。这就是 source maps 可以帮助的地方。

要告诉 TypeScript 生成一个，在你的 tsconfig.json 中设置 sourceMap 选项：

```json
{
  "compilerOptions": {
    "sourceMap": true
  }
}
```

现在当你运行 tsc 时，它会为每个 .ts 文件生成两个输出文件：一个 .js 文件和一个 .js.map 文件。后者是 source map。有了这个文件，一个新的 index.ts 文件会出现在你的浏览器调试器中。你可以在其中设置断点和检查变量，就像你希望的那样（见图 9-4）。

![图 9-4. 当存在 source map 时，你可以在调试器中处理原始 TypeScript 源代码，而不是生成的 JavaScript。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506240849360.png)

注意，index.ts 在左侧文件列表中显示为斜体。这表明它不是网页包含的"真实"文件。相反，它是通过 source map 包含的。根据你的设置，index.js.map 将包含对 index.ts 的引用（在这种情况下，浏览器通过网络加载它）或它的内联副本（在这种情况下不需要请求）。

关于 source maps 有几件事需要注意：

- 如果你将打包器或压缩器与 TypeScript 一起使用，它可能会生成自己的 source map。为了获得最佳的调试体验，你希望这能够一直映射回原始 TypeScript 源代码，而不是生成的 JavaScript。如果你的打包器内置了对 TypeScript 的支持，那么这应该可以正常工作。如果没有，你可能需要寻找一些标志来让它读取 source map 输入。
- 注意你是否在生产环境中提供 source maps。如果你的 JS 文件有对 source map 的引用，那么浏览器只会在调试器打开时加载它，所以对最终用户没有性能影响。（内联 source maps 总是被下载，所以你应该在生产环境中避免它们。）如果你的 source map 包含原始源代码的副本，那么可能有一些你不打算公开的内容。世界真的需要看到你的讽刺评论或内部错误跟踪器 URL 吗？

你也可以使用 source maps 调试 Node.js 程序。这通常通过你的编辑器或从浏览器的调试器连接到你的 Node 进程来完成。这里有一些用 TypeScript 编写的代码，旨在在 Node.js 中运行：

```ts
// bedtime.ts
async function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log('Good night!')
  await sleep(1000)
  console.log('Morning already!?')
}

main()
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAECMFMBMBcEsC2kB0sDOAoAhugngHYDGoAZgK7EID2Bo6ANpJAA4AUi6AXKAeYlABOASlABvTKFCDIscoLoFIAd1AAFQdUTx0kADwA3avGgA+NjPTUGByKAC8p+rIAqSSNXKwLkKzcgANKCcwsIA3JgAvpg4+MRklEQ0dIjY8ARsohJSRLR+qAzUAOZsAOQA4tTU0LzwRQAWsACEpeGSoNjKabD0TKxsAIwADCNtOXnWBcVlALLUCulFHQwy2NB4TQD8rRHRmKnpmRFAA)

（Promise<void> 中的 void 表示 sleep 不会解析为可用的值，类似于从函数返回 void。）

要调试这个，在你的 tsconfig.json 中设置 sourceMap 将其编译为 JavaScript。然后使用 --inspect-brk 标志用 node 运行它：

```bash
$ tsc bedtime.ts
$ node --inspect-brk bedtime.js
Debugger listening on ws://127.0.0.1:9229/587c380b-fdb4-48df-8c09-a83f36d8a2e7
For help, see: https://nodejs.org/en/docs/inspector
```

现在你可以打开浏览器进行调试。例如，在 Chrome 中，你导航到 chrome://inspect。你应该看到一个可以"检查"的远程目标，如图 9-5 所示。

![图 9-5. 在 Google Chrome (chrome://inspect) 中选择远程调试目标进行检查。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506240849906.png)

一旦连接，你会看到通常的浏览器开发工具，显示生成的 JavaScript，如图 9-6 所示（这里我们使用 ES2015 目标）。

![图 9-6. Google Chrome Devtools 中 Node.js 程序的生成 JavaScript。注意底部的 source map 引用。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506240850120.png)

除了打开运行远程调试协议的 websocket 外，--inspect-brk 标志还会在代码的最开始暂停执行。这对于切换到 TypeScript 视图并在原始源代码中设置断点很方便，如图 9-7 所示。

![图 9-7. 调试 Node.js 程序的原始 TypeScript 源代码。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506240851039.png)

JavaScript 的 debugger 语句是另一个在你想要的地方精确设置断点的便捷方法。

如果你为项目生成 .d.ts 文件（通过设置 declaration 选项），TypeScript 也可以生成 .d.ts.map 文件，将你的类型声明映射回原始源代码。你通过设置 declarationMap 来启用这个。这对于改进编辑器中的语言服务（如"转到定义"）很有用，特别是如果你使用项目引用（Item 78）。

类型检查器可以在你运行代码之前捕获许多错误，但它不能替代好的调试器。使用 source maps 来获得出色的 TypeScript 调试体验。

## 要记住的事情

- 不要调试生成的 JavaScript。使用 source maps 在运行时调试你的 TypeScript 代码。
- 确保你的 source maps 能够一直映射到你实际运行的代码。
- 了解如何调试用 TypeScript 编写的 Node.js 代码。
- 根据你的设置，你的 source maps 可能包含原始代码的内联副本。除非你知道自己在做什么，否则不要发布它们！

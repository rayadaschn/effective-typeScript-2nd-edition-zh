# 第 6 条: 使用编辑器来查询和探索类型系统

## 要点

- 使用支持 TypeScript 语言服务的编辑器，以充分发挥其优势。
- 通过编辑器来培养对 TypeScript 类型系统的直觉，并理解 TypeScript 是如何推导类型的。
- 熟悉 TypeScript 提供的重构工具，比如符号重命名、文件重命名等功能。
- 学会查看类型声明文件，了解它们是如何描述行为的。

## 正文

安装 TypeScript 后，你会得到两个可执行文件：

- `tsc`，即 TypeScript 编译器
- `tsserver`，即 TypeScript 独立服务器

你可能会直接运行 TypeScript 编译器 `tsc`，但 `tsserver` 同样重要，因为它提供了语言服务，包括自动补全、检查、导航和重构。你通常通过编辑器使用这些服务。如果你的编辑器没有配置这些服务，那你可就错过了！像自动补全这样的服务正是 TypeScript 的优势之一。

除了便利性之外，编辑器还是最适合你构建和测试类型系统的工具。这将帮助你建立 TypeScript 类型直觉。了解什么时候 TypeScript 可以自动推断类型，这对编写简洁、符合规范的代码至关重要（见第 18 条）。

通常可以将鼠标悬停在一个变量符号上，查看 TypeScript 对它的类型定义。

![An editor (VS Code) showing that the inferred type of the num symbol is
number.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202503262124257.png)

上面代码中，并未对 `num` 进行显式类型声明，但 TypeScript 编辑器推断出它的类型是 `number`。

编辑器也可以对函数进行类型推断，并显示函数参数的类型。

![Using an editor to reveal the inferred return type for a function.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202503262126688.png)

需要注意的信息是 TypeScript 推断出的返回类型为 `number`。如果这与预期不符，你应该添加类型声明并找出差异（见第 9 条）。

查看 TypeScript 在任何给定时刻对变量类型的推断，对于培养你对类型系统的直觉非常重要，特别是关于类型扩展（见第 20 条）和类型收缩（见第 22 条）。观察变量在条件分支中的类型变化，是增强对类型系统信心的绝佳方式。

![The type of message is string | null outside the branch, but string
inside.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202503262128842.png)

你可以检查一个较大对象中的单个属性，查看 TypeScript 对它们的推断结果。

![Inspecting how TypeScript has inferred types in an object](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202503262129782.png)

如果你的意图是让 `x` 成为一个元组类型（`[number, number]`），那么需要添加类型注解。

要查看在一连串操作中的推断泛型类型，可以检查方法名称。

![Revealing inferred generic types in a chain of method calls](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202503262130802.png)

`Array<string>` 表明 TypeScript 理解了 `split` 方法产生了一个字符串数组。虽然在这个例子中并没有太多的歧义，但这个信息在编写和调试长链函数调用时非常重要。TypeScript 还为 `slice` 方法提供了有用的文档。第 68 条将解释这是如何运作的。

在编辑器中看到类型错误也是学习类型系统细节的好方法。例如，这个函数试图通过 ID 获取一个 `HTMLElement`，或者返回一个默认的元素。TypeScript 标记了两个错误：

```ts
function getElement(elOrId: string | HTMLElement | null): HTMLElement {
  if (typeof elOrId === 'object') {
    return elOrId
    // ~~~ Type 'HTMLElement | null' is not assignable to type 'HTMLElement'
  } else if (elOrId === null) {
    return document.body
  }
  elOrId
  // ^? (parameter) elOrId: string
  return document.getElementById(elOrId)
  // ~~~ Type 'HTMLElement | null' is not assignable to type 'HTMLElement'
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQKIBtUFtVhQAUqWA8gE4CSAJgFyIDOUFMYyiAPogBIAqAWQAy2PAShdEYEFiwBKBv2Gj8hRAG8AUIkQxgiIlACeAB1Rx9pSrUQBee4gDkcAEYArVNEdyN2nYgp0EAokK2oaAG4-HQB6GMQAPyTEPlNUJyURHFUJbmlZR11GKTgJAENGRhhkMDKXHEQoOEa0jMEssUJHPwBfRFJGdL0DMJt7WykZeV9-AKCQxBo4CBAcgDoXOBojKJ0ev1GaPzjEAD0AfgMTMooy-ChUCh9DhmZWdj9AqGCkJZX1tCYbLiABCRloJHI4Tku0QJySCRSrUcmRU4kk+SwhRgxTApUQFSqNTqDSaLTMbWUwK6mn2QA)

在 `if` 语句的第一个分支中的意图是将结果过滤为仅包含对象，即 `HTMLElement`。但奇怪的是，在 JavaScript 中，`typeof null` 的结果是 `"object"`，因此在这个分支中，`elOrId` 仍然可能是 `null`。你可以通过将 `null` 检查放在前面来修复这个问题。第二个错误是因为 `document.getElementById` 可能返回 `null`，所以你需要处理这种情况，可能是通过抛出一个异常：

```ts
function getElement(elOrId: string | HTMLElement | null): HTMLElement {
  if (elOrId === null) {
    return document.body
  } else if (typeof elOrId === 'object') {
    return elOrId
    //     ^? (parameter) elOrId: HTMLElement
  }
  const el = document.getElementById(elOrId)
  //                                 ^? (parameter) elOrId: string
  if (!el) {
    throw new Error(`No such element ${elOrId}`)
  }
  return el
  //     ^? const el: HTMLElement
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQKIBtUFtVhQAUqWA8gE4CSAJgFyIDOUFMYyAPgBIAqAsgBlseAlA5gQWLAEoGvQcPyFEAbwBQiRDGCIS5ajUQBeE4glTpqjZsQV0ICkhpwIIJVAB0AIzg0AngDc1gC+iKSMqFo6RFB+AA6ocDqklLTGpgDkcF4AVqjQGZbqNrb2jmH6tEElAPQ1JYgAegD8unEAhhTt+FCoFJYpBnL8QjjuIdYQCMwVxojOru4eaJhjogBCfrR6qTTS1Yh1DccnpyctbZ3d6H0DlfRMLGzI1tq6AISkRdaaUAAWFDgAHczKgQRgKICKEQAAYAOTgTBAED+FREygAJCpBrRgjD9hNNHYoA4kKQDkcShcpmAZqRhgo1oQ1ME1EA)

TypeScript 的语言服务还提供了重构工具。其中最简单但最有用的工具之一是重命名符号。这比查找和替换要复杂，因为相同的名称可能在不同的地方引用不同的变量。例如，在这段代码中，存在三个名为 `i` 的不同变量：

```ts
let i = 0
for (let i = 0; i < 10; i++) {
  console.log(i)
  {
    let i = 12
    console.log(i)
  }
}
console.log(i)
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/DYUwLgBAlhC8EAYDcAoAZgewE4QBSkhnmWggB4IBGEqAaloEoIBvFCCAYwwDsBnDUADpgGAOa4oDVO1bt2BUvEoAmaXK58BIYWIlS2EAL4pjG-kJHjJqIA)

在 VS Code 中，如果你点击 `for` 循环中的 `i` 并按下 F2，一个文本框会弹出，允许你输入一个新的名称。

![Renaming a symbol in your editor.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202503262150699.png)

当你的代码被重构时，只有与重命名的 `i` 相关的引用会被更改。

```ts
let i = 0
for (let x = 0; x < 10; x++) {
  console.log(x)
  {
    let i = 12
    console.log(i)
  }
}
console.log(i)
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/DYUwLgBAlhC8EAYDcAoAZgewE4QBSkgA85EkJiAeCARmXIGp6BKCAbxQggGMMA7AZwygAdMAwBzXISapO7TpwLQS1AEyyFPAUJCiJuKDI4QAvijNbBIsZMOogA)

如果你重命名一个从其他模块导入的符号，相关的导入也会自动更新。TypeScript 还提供了许多实用的重构功能，比如重命名或移动文件（会自动更新所有导入），以及将某个符号移动到新文件中。熟悉这些功能可以大幅提升你在大型 TypeScript 项目中的开发效率。

此外，TypeScript 的语言服务还能帮助你快速浏览自己的代码、外部库和类型声明。例如，如果你在代码中看到全局 `fetch` 函数的调用，并想了解更多细节，你的编辑器应该会提供“跳转到定义”功能。在我的编辑器里，它的界面类似如下。

![The TypeScript language service provides a “Go to Denition” feature that should be available in your editor.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202503262153154.png)

选择这个选项后，你会进入 _lib.dom.d.ts_，这是 TypeScript 内置的 DOM 类型声明文件。

```ts
declare function fetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtVJAzAAsAKAKHni1QAdkMAueAJRAEdkQBnDASVSIc8AD7wAqiwAyAGmqosGAPzM2nHvwUZyASmYAFGDgC2WbiAA8bbrTzmAfAG5yQA)

你会看到 `fetch` 返回一个 `Promise`，并接受两个参数。点击 `RequestInfo` 后，你会跳转到这里：

```ts
type RequestInfo = Request | string
```

从这里你可以继续跳转到 `Request`：

```ts
interface Request extends Body {
  // ...
}
declare var Request: {
  prototype: Request
  new (input: RequestInfo | URL, init?: RequestInit | undefined): Request
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoQI4FcIGczIQAekIAJrsgEID2ZAnsgN4BQyyA9B8gHR8sBfFmQgIANnCgoAbpLSYc+AFzM2yAA5QaYbfXUQV6bHjABuNSAgB3ABSh1WMIYUmAkiBg1kAH2QBVVAAZABpkUGAwAH5nY3x3CJ9kLHIIGFAIMgBKGMUzQXMgA)

在这里，你会发现 `Request` 的类型和具体实现是分开的（参考第 8 条）。你之前已经见过 `RequestInfo`，继续点击 `RequestInit`，就能看到构造 `Request` 时可用的所有选项。

```ts
interface RequestInit {
  body?: BodyInit | null
  cache?: RequestCache
  credentials?: RequestCredentials
  headers?: HeadersInit
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoQI4FcIGcwCSIwYyA3gFDLIBGA9gCYCeA-AFzIBCjTRJyAH2QgsAG1EBuKsgSIAFhHZpMOfAGF5EKdQRQIDCOGBxRuJemx4wavQaMnc25ArgGoZjgAkIr6Lj5gTgD0QcgAdBEUAL4UQA)

这里还有许多类型可以继续追踪，但你已经明白大概的思路了。刚开始阅读类型声明可能会有点吃力，但它们是一个很好的途径，让你了解 TypeScript 能做什么、你所使用的库是如何建模的，以及如何调试错误。关于类型声明的更多内容，请参阅第 8 章。

### 关键点总结

- 使用支持 TypeScript 语言服务的编辑器，以充分发挥其优势。
- 通过编辑器来培养对 TypeScript 类型系统的直觉，并理解 TypeScript 是如何推导类型的。
- 熟悉 TypeScript 提供的重构工具，比如符号重命名、文件重命名等功能。
- 学会查看类型声明文件，了解它们是如何描述行为的。

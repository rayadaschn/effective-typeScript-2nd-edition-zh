# Item 78: 注意编译器性能

## 要点

- TypeScript 性能问题有两种形式：构建性能（`tsc`）和编辑器延迟（`tsserver`）。识别每种问题的症状并相应地指导你的优化。
- 将类型检查与构建过程分开。
- 删除死代码和依赖项，警惕类型依赖中的代码膨胀。使用树形图可视化 TypeScript 正在编译的内容。
- 使用增量构建和项目引用来减少 `tsc` 在构建之间所做的工作。
- 简化你的类型：避免大型联合类型，使用 `interface` 扩展而不是交叉类型，并考虑为函数返回类型添加注解。

## 正文

正如 Item 3 所解释的，当你将代码编译为 JavaScript 时，TypeScript 类型会被擦除。因此，一般来说，TypeScript 对你的代码运行时性能没有影响。

然而，TypeScript 可能会影响你的开发工具的性能。TypeScript 带有两个可执行文件：`tsc` 和 `tsserver`（Item 6）。谈论两者的性能是有意义的：

**tsc，TypeScript 编译器**
这里的性能慢意味着你的代码在批处理过程中（可能在你的 CI 系统上）进行类型检查需要更长时间，并且生成构建产物（.js 和 .d.ts 文件）需要更长时间。

**tsserver，TypeScript 语言服务**
这里的性能慢意味着你的编辑器可能感觉迟钝或无响应。在你更改代码后，错误出现或消失可能需要令人沮丧的长时间。

如果构建或编辑器性能在你的项目中成为问题，有许多可用的技术可能会有所帮助。本条目将介绍几个最有影响力的技术。对于每一个，都会说明它影响哪种类型的性能。

### 将类型检查与构建分开

这只影响 `tsc`（构建）性能，不影响 `tsserver`（编辑器）。

在高层次上，TypeScript 做两件事：检查代码的类型错误并发出 JavaScript。类型检查通常是两者中 CPU 密集型的。如果你不需要类型检查，那么跳过这一步可以节省大量时间。

乍一看，这听起来像是一件奇怪的事情。类型检查不是使用 TypeScript 而不是 JavaScript 的全部意义吗？然而，在实践中，你可能通过其他工具间接运行 TypeScript，可能是打包工具（webpack、vite 等）或 ts-node。默认情况下，这些工具会类型检查你的代码，然后打包或运行生成的 JavaScript。但它们不需要这样做。你可以告诉它们中的任何一个以"仅转译"模式运行以跳过检查。

即使对于简单的程序，这也可能产生明显的差异：

```ts
// hello.ts
console.log('Hello World!')
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAsFMBtoewHQBcDOAoAxnAdiu1IF4BzACgHIAJGeUAdTgCdoATAQnIEoBuNIA)

以下是使用 ts-node 进行和不进行类型检查的运行速度：

```bash
$ time ts-node --transpileOnly hello.ts
Hello World!

ts-node --transpileOnly hello.ts 0.12s user 0.02s system 110% cpu 0.123 total
$ time ts-node hello.ts
Hello World!
ts-node hello.ts 1.60s user 0.08s system 255% cpu 0.656 total
```

这个简单的程序进行类型检查需要 1.6 秒，但不进行类型检查只需要 0.12 秒。如果 ts-node 或打包工具是你工具链的一部分，关闭类型检查可以显著缩短你的迭代周期并改善你的开发体验（DX）。你甚至可能能够插入替代的 TypeScript 编译器，如 swc，以获得更大的加速。

当然，类型检查仍然很重要！你在编辑器中开发代码时仍然会得到类型错误（通过 `tsserver`），你应该确保在 CI 服务上运行 `tsc` 以确保只提交通过类型检查器的代码。

### 删除未使用的依赖项和死代码

这影响构建和编辑器性能。

你拥有的代码越少，TypeScript 处理它的速度就越快。更少的类型和符号也意味着 `tsserver` 的 RAM 使用量更低，这将使你的编辑器更响应。

缩小项目的一个好方法是通过死代码消除。如果你设置 `noUnusedLocals` 标志，TypeScript 将检测一些未使用的代码和类型：

```ts
function foo() {}
//       ~~~ 'foo' is declared but its value is never read.

export function bar() {}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noUnusedLocals=true#code/GYVwdgxgLglg9mABMOcAUBKRBvAvgKAHpDFSzEA-KxAchThsRgGdEATAUwgBsBDAJw5tEAIxBQmUVgDde3EByaswHaR36JBvNgDp8+DgA8ADnH4TQkWAlEDMOAkA)

这对于未导出的符号效果很好。但导出的符号也可能是未使用的，如果它从未在任何地方被导入。要检测这一点，你需要一个更复杂的工具，如 knip。这也会报告未使用的第三方依赖项（例如，node modules）。删除这些可能是一个巨大的胜利，因为它们的类型声明可能有数万行。

事实上，你项目中的大部分类型可能来自第三方代码。你可以运行 `tsc --listFiles` 来获得进入你 TypeScript 项目的所有源的打印输出：

```bash
$ tsc --listFiles
.../lib/node_modules/typescript/lib/lib.es5.d.ts
.../lib/node_modules/typescript/lib/lib.es2015.d.ts
.../lib/node_modules/typescript/lib/lib.es2016.d.ts
.../lib/node_modules/typescript/lib/lib.es2017.d.ts
...
```

结果可能会让你惊讶！有时一个依赖项可以拉入数百或数千个其他依赖项（Item 70 描述了一种避免这种情况的方法）。可视化这个的一个好方法是使用树形图。由于 `tsc` 在大型文件上花费的时间比小型文件多，你想要可视化正在编译的每个文件中的字节数。

这是神奇的咒语（stat 语法可能因你的平台而异）：

```bash
$ tsc --noEmit --listFiles | xargs stat -f "%z %N" | npx webtreemap-cli
```

对于作者的一个项目，结果看起来像图 9-8。

![图 9-8. TypeScript 考虑的文件树形图，按文件大小加权。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506240901002.png)

这是很多代码：接近 110 MB！而且大部分显然是 Google API？其中许多是 API（compute、dialogflow、dfareporting、healthcare），我的项目没有使用。事实证明，Google 将其所有 300+ 个 API 打包为一个包，重量达到令人印象深刻的 80.5 MB。我的项目只依赖一两个 API，但这种设计意味着它仍然拉入了所有三百个 API。

在这种情况下，更新到更新版本的 googleapis 解决了问题，因为它们添加了对仅依赖一个 API 的支持。如果依赖项特别大，你可能想要寻找替代方案。你可能还会注意到你正在拉入同一库的多个版本。解决方案是更新版本直到你的依赖项对齐（Item 66）。

无论你采取什么行动，树形图可视化都会让你更清楚地了解你正在构建什么，并让你嗅到潜在问题的气味。在查看我的树形图之前，我没有太多考虑我的项目对 googleapis 的使用。之后，我想不出其他什么了！

### 增量构建和项目引用

这些只影响构建（`tsc`）性能。

如果你连续运行 `tsc` 两次，它会在第二次调用时重复所有工作。但如果你设置 `incremental` 选项，它会做一些更聪明的事情：在第一次调用时，它会写入一个 `.tsbuildinfo` 文件，保存它已完成的一些工作。在第二次调用时，它会读取该文件并使用它来更快地检查你的类型。

TypeScript 允许你通过"项目引用"将这种增量方法更进一步。这里的想法是，如果你的代码库有不同的部分（比如客户端/服务器或源代码/测试），那么对一部分的更改应该对另一部分有有限的影响。特别是，如果你更改源代码中函数的实现（但不是其类型签名），那么 TypeScript 不应该重新进行测试的类型检查。对测试的任何更改都不应该要求 TypeScript 重新进行源代码的类型检查。

要设置项目引用，你为仓库的每个不同部分创建一个 `tsconfig.json` 文件。这些文件说明它们可以引用代码的哪些其他部分。你的测试将引用你的源代码，但反之则不然。你通常还有一个顶级的 `tsconfig.json` 用于共享配置。设置可能看起来像这样：

```
root
├── src
│ ├── fib.ts
│ └── tsconfig.json
├── test
│ ├── fib.test.ts
│ └── tsconfig.json
├── tsconfig-base.json
└── tsconfig.json
```

这些文件看起来像这样：

```ts
// tsconfig-base.json
{
  "compilerOptions": {
    // other settings
    "declaration": true,
    "composite": true
  }
}

// tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./src" },
    { "path": "./test" }
  ]
}

// src/tsconfig.json
{
  "extends": "../tsconfig-base.json",
  "compilerOptions": {
    "outDir": "../dist/src",
    "rootDir": "."
  }
}

// src/fib.ts
export function fib(n: number): number {
  if (n < 2) {
    return n
  }
  return fib(n - 1) + fib(n - 2)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noUnusedLocals=true#code/PTAEGcCcGNgMwJYCMB0AXcAoApgDwA4D2kaocArgHbRoKGVnIAUlAXKJeQLZLaQCU7Tjz6gA3plCgEcUC1AAeUACZ+4yVNCRsacpAaUA3BoC+G7bv2Mk8gLSgAjGoDU1uyv7GzQA)

```ts
// test/tsconfig.json
{
  "extends": "../tsconfig-base.json",
  "compilerOptions": {
    "outDir": "../dist/test",
    "rootDir": "."
  },
  "references": [
    { "path": "../src" }
  ]
}

// test/fib.test.ts
import { fib } from '../src/fib'

describe('fib', () => {
  it('should handle base cases', () => {
    expect(fib(0)).toEqual(0)
    expect(fib(1)).toEqual(1)
  })

  it('should handle larger numbers', () => {
    expect(fib(2)).toEqual(1)
    expect(fib(3)).toEqual(2)
    expect(fib(4)).toEqual(3)
    expect(fib(5)).toEqual(5)
    expect(fib(16)).toEqual(987)
  })
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noUnusedLocals=true#code/PTAEBcFMGd2AzAlgIwHRVu6AoRBbABwHsAncUAbyWQF9R4Si9QByVVYaEgYwRRYDc2bABMY3EikgAKFtRYAaUNICUoALwA+StlChE4WdAAWRAK4AbEaGMBDAHYiLkUMlvQX3dzEXK1WnT09SAAPAkhuQ2ppAAYVFXQiAFEARzNbC1iVISDQUPDI6WiARnjE1PTM0pzQGhVhPQMjU0trO0dnUAtbEgBzSBJQezM8ZAHoX1UNbQpdIPyIqJRpACYy8GS0jOlqueCwxaLlgGZ1zcrV7L28g8LogBYziu3Tmv2CpeRpAFYnrczfm8bh8jl9igA2P4XACcAA4AOxXPR1IQo7BAA)

这是很多配置！以下是有趣的部分：

- src 和 test `tsconfig.json` 继承共享的基础配置，设置 `composite` 和 `declaration`（输出 .d.ts 文件）。
- 顶级 `tsconfig.json` 只包含对子项目的引用列表。
- test `tsconfig.json` 引用 src，但反之则不然。

有了这个设置，你可以使用 `-b / --build` 标志运行 `tsc`，使其充当一种构建协调器。在第一次运行后，如果你对 `src/fib.ts` 进行不影响 API 的更改，你会看到类似这样的内容：

```bash
$ tsc -b -v
Project 'src/tsconfig.json' is out of date because output
'dist/src/tsconfig.tsbuildinfo' is older than input 'src/fib.ts'
Building project 'src/tsconfig.json'...
Project 'test/tsconfig.json' is up to date with .d.ts files from its
dependencies
```

最后一行是重要的。我们的更改没有影响 .d.ts 文件（这是一个实现更改，而不是 API 更改），所以测试项目不需要重建。

使用项目引用时需要注意几个注意事项：

- 为了使它们有用，你必须设置 `declaration`，以便 `tsc` 在磁盘上输出 .d.ts 文件。如果你使用 `noEmit` 或通过 webpack、vite 或其他工具运行 `tsc`，那么项目引用不会帮助你。
- 项目引用在大型单体仓库中最有用。一般经验法则是，它们主要在你拥有比第三方代码更多的第一方代码时有用（即，你自己的代码行数比 node modules 中的多）。这对于中小型项目很少是这种情况，但在大公司中通常是这种情况。
- 虽然创建少量项目可以加速你与 TypeScript 的交互，但创建太多项目可能会产生相反的效果。尝试将项目范围限定为代码的大块。为 src 和 test，或 client 和 server 创建不同的项目，在大型应用程序上会是一个胜利。但为你的一千个 UI 组件中的每一个创建单独的项目将创建组织开销，不太可能改善 TypeScript 性能。

### 简化你的类型

这影响构建和编辑器性能。

假设你想创建一个类型来表示年份。Item 29 鼓励你制作只能表示有效状态的类型，所以你制作了一个应该在本千年剩余时间里保持的类型：

```ts
type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
type Year = `2${Digit}${Digit}${Digit}`
const validYear: Year = '2024'
const invalidYear: Year = '1999'
//    ~~~~~~~~~~~ Type '"1999"' is not assignable to type
//                '"2000" | "2001" | "2002" | ... 996 more ... | "2999"'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noUnusedLocals=true#code/C4TwDgpgBAIglgczsKBeKByADBqAfTARlwIwCYTMBmSjAFloFZaA2WgdloA5aBODANwAoUJCgBNCAEMATmigADMgBIA3vCTAAvmo3Id6xPoXCAxgHsAdgGcUANykAbOABNJsgFwTpc9OSxkDGZWtlBwlg7Obj5e7r5EvImCQgD0KVAZUAB+Obl5WVAAKuDQGABEhIm8Zbhw1lCW5ihS1taIllIARo7QwOZQohCp6ZmjY5nlZFjTZfhQZVNYhLMEC9NkK1AAdDtQiSxQALbmMtA7W3MLVTVbQkA)

虽然我们可以使用 TypeScript 的类型系统表示这个类型很有趣，但这可能不明智。错误提示了原因：Year 类型是一个有一千个元素的联合类型！每次 TypeScript 必须对这个类型做某事时，它都必须检查所有这些。这可能会使 `tsc` 和 `tsserver` 变得迟钝。最好使用更简单的东西，如字符串或数字，或者如果你想要明确地建模这个，甚至使用品牌类型（Item 64）。

这是一个极端的例子，但巨大的联合类型确实有时会出现，你应该意识到它们可能是性能问题。使你的类型更高效的其他方法包括：

- 扩展接口而不是交叉类型别名。Item 13 详细讨论了 type 和 interface 之间的相似性和差异。通常它们是可互换的。但对于子类型化，TypeScript 能够更高效地与 extends 一起操作。
- 注解返回类型。Item 18 讨论了添加类型注解的利弊，但为函数的返回类型提供显式注解可以节省 TypeScript 推断类型的工作。

如果你正在编写复杂的递归类型，你应该特别小心。Item 57 更详细地介绍了如何防止这些类型爆炸。

## 要点回顾

- TypeScript 性能问题有两种形式：构建性能（`tsc`）和编辑器延迟（`tsserver`）。识别每种问题的症状并相应地指导你的优化。
- 将类型检查与构建过程分开。
- 删除死代码和依赖项，警惕类型依赖中的代码膨胀。使用树形图可视化 TypeScript 正在编译的内容。
- 使用增量构建和项目引用来减少 `tsc` 在构建之间所做的工作。
- 简化你的类型：避免大型联合类型，使用 interface 扩展而不是交叉类型，并考虑为函数返回类型添加注解。

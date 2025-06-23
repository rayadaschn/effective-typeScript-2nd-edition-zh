# 第 49 条: 跟踪你的类型覆盖率以防止类型安全性回归

## 要点

- 即使设置了 `noImplicitAny`，`any` 类型仍然可能通过显式的 `any` 或第三方类型声明（`@types`）进入你的代码中。
- 考虑使用诸如 `type-coverage` 之类的工具来跟踪你的程序的类型覆盖情况。这将鼓励你重新审视使用 `any` 的决策，并随着时间的推移提高类型安全性。

## 正文

你已经启用了 `noImplicitAny` 并为所有具有隐式 `any` 类型的值添加了类型注解。你是否已经免受与 `any` 类型相关的问题？答案是"不"；`any` 类型仍然可以通过两种主要方式进入你的程序：

### 通过显式的 any 类型

即使你遵循了第 43 和 44 条的建议，使你的 `any` 类型既狭窄又具体，它们仍然是 `any` 类型。特别是，像 `any[]` 和 `{[key: string]: any}` 这样的类型一旦你索引到它们，就会变成普通的 `any`，并且产生的 `any` 类型可以在你的代码中流动。

### 来自第三方类型声明

这特别阴险，因为来自 `@types` 声明文件的 `any` 类型会静默进入：即使你启用了 `noImplicitAny` 并且从未写过"any"这个词，你仍然有 `any` 类型在你的代码中流动。

由于 `any` 类型对类型安全性和开发者体验的负面影响（第 5 条），跟踪代码库中它们的数量是一个好主意。有很多方法可以做到这一点，包括 npm 上的 `type-coverage` 包：

```bash
$ npx type-coverage
9985 / 10117 98.69%
```

这意味着，在这个项目的 10,117 个符号中，9,985 个（98.69%）具有除 `any` 或 `any` 别名之外的类型。如果一个更改无意中引入了 `any` 类型并且它在你的代码中流动，你会看到这个百分比的相应下降。

从某种意义上说，这个百分比是跟踪你遵循本章其他建议程度的一种方式。使用范围狭窄的 `any` 将减少具有 `any` 类型的符号数量，使用更具体的形式如 `any[]` 也是如此。数字化跟踪这一点有助于你确保事情只会随着时间的推移变得更好。

即使只收集一次类型覆盖率信息也可能是有益的。使用 `--detail` 标志运行 `type-coverage` 将打印每个 `any` 类型在代码中出现的位置：

```bash
$ npx type-coverage --detail
path/to/code.ts:1:10 getColumnInfo
path/to/module.ts:7:1 pt2
...
```

这些值得调查，因为它们可能会发现你之前没有考虑过的 `any` 来源。让我们看几个例子。

显式的 `any` 类型通常是你之前为了便利而做出的选择的结果。也许你遇到了一个你不想花时间解决的类型错误。也许这个类型是你还没有写出来的。或者你可能只是太匆忙了。

带有 `any` 的类型断言可以防止类型流向它们本来会流向的地方。也许你构建了一个处理表格数据的应用程序，需要一个单参数函数来构建某种列描述：

```ts
function getColumnInfo(name: string): any {
  return utils.buildColumnInfo(appState.dataSchema, name) // Returns any
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBArlAlgGwjAvDA3gKBjAIzhQBMBhEZOAWzAEkwAzEACggC4YBDMATwBoYYLtQCmnaACdEYAOYBKTj17YAvvxyqA3DhKjgyLpNExko2FwAOlgMpQuUcdhgkHXG8AAWo6l05wwAGswEAB3MBhtHEYA4CRwGFlzCipaBmYWYTEJKGk5RW4+bDwYYyg4SQiEFAgAOiJSFJp6JlYrW3tHWtd7D29fQSzReS18AHoxmAAlcwrIQt5NHCA)

`utils.buildColumnInfo` 函数在某个时候返回了 `any`。作为提醒，你为函数添加了注释和显式的 `: any` 注解。

然而，在接下来的几个月中，你也为 `ColumnInfo` 添加了类型，并且 `utils.buildColumnInfo` 不再返回 `any`。`any` 注解现在正在丢弃有价值的类型信息。摆脱它！

第三方的 `any` 类型可能以几种形式出现，但最极端的是当你给整个模块一个 `any` 类型时：

```ts
declare module 'my-module'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBArlAlgGwjAvDA3gKBjAIzhQBMBhEZOAWzAEkwAzEACggC4YBDMATwBoYYLtQCmnaACdEYAOYBKTj17YAvvxyqA3DhKjgyLpNExko2FwAOlgMpQuUcdhgkHXG8AAWo6l05wwAGswEAB3MBhtXX1DYxhqEBI4MxgAcmpeAFoEpLNUnSA)

现在你可以从 `my-module` 导入任何东西而不会出错。这些符号都有 `any` 类型，如果你通过它们传递值，将导致更多的 `any` 类型：

```ts
import { someMethod, someSymbol } from 'my-module' // OK

const pt1 = { x: 1, y: 2 }
//    ^? const pt1: { x: number; y: number; }
const pt2 = someMethod(pt1, someSymbol) // OK
//    ^? const pt2: any
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBArlAlgGwjAvDA3gKBjAIzhQBMBhEZOAWzAEkwAzEACggC4YBDMATwBoYYLtQCmnaACdEYAOYBKTj17YAvvxyqA3DhKjgyLpNExko2FwAOlgMpQuUcdhgkHXG8AAWo6l05wwAGswEAB3MBhtHERqSxBJWCwIEDEAWXNPEBJBZLEbXmoCSlUYRkkUmAByal4AWmosuDNKrXwAejaYAHkAaRwcUEhYSygARgxnAA9OUcFeTgAmSJ0O-HwAPQB+GEHoGBHRziwYaaEaAlFJVvmzwsvW1QHwPZGlzFzRdKhMkhYDnJSonyhUo8laMFWvRwqzWWx2z2GUAWSj4OCAA)

由于使用方式看起来与类型良好的模块相同，很容易忘记你存根化了模块。或者也许同事做了这件事，而你一开始就不知道。值得不时重新审视这些。也许模块有官方的类型声明。或者也许在阅读第 8 章之后，你已经对模块有了足够的理解，可以自己编写类型并将它们贡献回社区。

第三方声明的 `any` 的另一个常见来源是类型中存在错误。也许声明没有遵循第 30 条的建议，声明一个函数返回联合类型，而实际上它返回的东西要具体得多。当你第一次使用这个函数时，这似乎不值得修复，所以你使用了 `any` 断言。但也许声明从那以后已经被修复了。或者也许是时候自己修复它们了！

如果你想持续了解代码中的 `any` 类型，可以将 `type-coverage` 设置为 TypeScript 语言服务插件。这就像拥有 X 射线视觉，让你看到代码中隐藏的所有 `any` 类型（图 5-1）。

![图 5-1. 在编辑器中高亮显示具有 any 类型的符号。这些都不会是 noImplicitAny 错误。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506221431668.png)

如果你将 `type-coverage` 添加到你的持续集成系统中，你会在类型安全性意外下降时立即发现。

导致你使用 `any` 类型的考虑可能不再适用。也许现在有一个类型可以插入，而你之前使用了 `any`。也许不安全的类型断言不再必要。也许你一直在回避的类型声明中的错误已经被修复了。跟踪你的类型覆盖率突出了这些选择，并鼓励你继续重新审视它们。

## 要点回顾

- 即使设置了 `noImplicitAny`，`any` 类型仍然可能通过显式的 `any` 或第三方类型声明（`@types`）进入你的代码中。
- 考虑使用诸如 `type-coverage` 之类的工具来跟踪你的程序的类型覆盖情况。这将鼓励你重新审视使用 `any` 的决策，并随着时间的推移提高类型安全性。

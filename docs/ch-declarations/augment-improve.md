# Item 71: Use Module Augmentation to Improve Types

## 要点

- Use declaration merging to improve existing APIs or disallow problematic constructs.
- Use `void` or error string returns to "knock out" methods and mark them `@deprecated`.
- Remember that overloads only apply at the type level. Don't make the types diverge from reality.
- 使用声明合并来改进现有的 API 或禁止问题构造。
- 使用 `void` 或错误字符串返回值来"废弃"方法，并标记为 `@deprecated`。
- 记住，重载只适用于类型层面。不要让类型与实际情况不一致。

## 正文

JavaScript 有一些著名的"糟糕部分"，比如隐式全局变量和类型强制转换。其中大部分都是 90 年代中期黄金时代做出的设计决策，事实证明这些决策极难逆转。

TypeScript 也有自己的一些历史遗留问题。其中之一就是 `JSON.parse` 的类型声明，它返回 `any`：

```ts
declare let apiResponse: string
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEEQBd5QA4EsBKIDO6A9gHZ4gBc8eyMmxA5gNwBQQA)

---

```ts
const response = JSON.parse(apiResponse)
const cacheExpirationTime = response.lastModified + 3600
//    ^? const cacheExpirationTime: any
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEEQBd5QA4EsBKIDO6A9gHZ4gBc8eyMmxA5gNwBQYJ18cB7CAvPACkAygHkAcgDp0sMgAoMOfEVIgAlCzalUYKGAAWIAKIAPLDCjJMJACqYAtn05KeE6NQCyhYJgBmmEMDwANTwAMwAbAAMkSwA9LHwifAAegD88JocOvpGppjmljb2FGjEAJ7MQA)

如果你没有给 `response` 指定类型，它会悄无声息地在你的代码中传播 `any` 类型。正如第 5 条所解释的，这会破坏类型安全，阻碍语言服务，并让你在 TypeScript 中获得糟糕的体验。

如果 `JSON.parse` 返回 `unknown` 会更好，正如第 46 条所解释的，`unknown` 可以作为 `any` 的类型安全替代品。那么为什么不这样做呢？这是因为 `unknown` 类型直到 2018 年 7 月发布的 TypeScript 3.0 才被引入。在此之前已经编写了大量的 TypeScript 代码，改变 `JSON.parse` 的返回类型会造成极大的破坏性影响。所以 TypeScript 团队向实用性做出了让步。未来的代码会稍微不那么安全，但现有代码不会破坏。

但仅仅因为 TypeScript 团队决定保留这个类型签名，并不意味着你也必须这样做。回想第 13 条，接口有一个类型别名所没有的特殊能力：它们参与"声明合并"，即同一接口的重复定义会被合并形成最终结果。

我们可以利用这个特性来改变 `JSON.parse` 的类型签名。以下是它的样子（在 `lib.es5.d.ts` 中）：

```ts
interface JSON {
  parse(
    text: string,
    reviver?: (this: any, key: string, value: any) => any
  ): any
  // ...
}
declare var JSON: JSON
```

我们关心的是接口。如果你在项目的类型声明文件中定义自己的 `JSON` 接口，TypeScript 会将其与库声明合并。

```ts
// declarations/safe-json.d.ts
interface JSON {
  parse(
    text: string,
    reviver?: (this: any, key: string, value: any) => any
  ): unknown
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEEQBd5QA4EsBKIDO6A9gHZ4gBc8eyMmxA5gNwBQA9K-KJLFMpiXlZ4oAMxABaAFZ4SAOmCzkeZnWQgYIqGAQApAMoB5AHLwA3s3jx0sMgAoLl+GoAeyStVoMANA8twAbpj+6gD8lLbIABaYeJRQxACeXvAA1iAJ7jR09Mn+UBAArhRoiQCU8AC8AHwlCQ6llAXEKcSEAO7ELAC+zEA)

注意返回类型的改变。结果类似于 TypeScript 函数重载（第 52 条）。由于库在我们的代码之前加载，我们的重载总是会获胜。结果是 `JSON.parse` 现在返回 `unknown`：

```ts
const response = JSON.parse(apiResponse)
//    ^? const response: unknown
const cacheExpirationTime = response.lastModified + 3600
//                          ~~~~~~~~ response is of type 'unknown'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEEQBd5QA4EsBKIDO6A9gHZ4gBc8eyMmxA5gNwBQYJ18cB7CAvPACkAygHkAcgDp0sMgAoMOfEVIgAlCwD0G+DvgA9APzw2pVF2VlKAV2IBrYoQDuxVu1RgoYABYgAogA8sGChkTBIAFUwAWz5OJR4JaGoAWUJgTAAzTBBgeABqeABmADYABlLNbV1qmtq6gD9Gpsa47hV4TDx4Qgz4ZABPdAQAcht7J2JhiWYgA)

使用它需要类型断言，这正是你想要的：

```ts
interface ApiResponse {
  lastModified: number
}
const response = JSON.parse(apiResponse) as ApiResponse
const cacheExpirationTime = response.lastModified + 3600 // ok
//    ^? const cacheExpirationTime: number
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEEQBd5QA4EsBKIDO6A9gHZ4gBc8eyMmxA5gNwBQdyIMAZlGAgIJZcBEmXgBvZvERRqAWULBMnTCGCViAVwC2AIw4sAvszAjUcYaQQBeeACkAygHkAcgDp0sMgAoMOfEUsASjQ8eAE-CzIWE1JUMB4ACxAAUQAPLBgoZEwSABVMLWt4cwCyV2g5BSUVYHgAangAZgA2AAZWxikAei74QgBrZh6pKQA9AH54GOopxJT0zEzsvIKKeE1dDmYgA)

你可以对 fetch API 的 `Response.prototype.json()` 做类似的事情，它也返回 `any`。以下是修复方案：

```ts
// declarations/safe-response.d.ts
interface Body {
  json(): Promise<unknown>
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEEQBd5QA4EsBKIDO6A9gHZ4gBc8eyMmxA5gNwBQA9K-KJLFMpiXlZ4oAMxABaOAQEgAdMFnI8zOshAwRUMAgBChYAE94Ab2bx4AKzwkAFAEpKABRiEAtpjIAeAK7EA1sSEAO7EAHwsAL7MQA)

这些改变都是明显的胜利。但由于你只做影响自己代码的改变，你也可以自由地做出更有争议的改变，这些改变在更广泛的 TypeScript 生态系统中永远不会被接受。

例如，语言规范的一部分是 `Set` 构造函数可以接受字符串。这会导致可能不是你期望的结果：

```ts
> new Set('abc')
Set(3) { 'a', 'b', 'c' }
```

如果你的意图是创建一个包含 `'abc'` 的单元素集合，那么这可能会在你的代码中引入错误。由于两者的类型都是 `Set<string>`，而且这是 JavaScript 的工作方式，TypeScript 无法帮你捕获这个错误。

但没有理由你不能在自己的代码中禁止用字符串调用 `Set` 构造函数。这比改变 `JSON.parse` 的返回类型稍微困难一些，但都归结为声明合并。

以下是来自 `lib.es2015.collections.d.ts` 的 `Set` 声明：

```ts
interface Set<T> {
  add(value: T): this
  delete(value: T): boolean
  has(value: T): boolean
  readonly size: number
  // ...
}
interface SetConstructor {
  new <T = any>(values?: readonly T[] | null): Set<T>
  readonly prototype: Set<any>
}
declare var Set: SetConstructor
```

在 `lib.es2015.iterable.d.ts` 中还有构造函数的重载：

```ts
interface SetConstructor {
  new <T>(iterable?: Iterable<T> | null): Set<T>
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEEQBd5QA4EsBKIDO6A9gHZ4gBc8eyMmxA5gNwBQdyIMAZlGAgMooAwiWowArmGSEY8AN7N48YiADu8ADwAVAHwAKTOxhQARkgD8lAJKGTSLdvgAfJWIgQAlJQHJ7LAL7MQA)

这是我们想要"废弃"的重载。以下是方法：

```ts
// declarations/ban-set-string-constructor.d.ts:
interface SetConstructor {
  new (str: string): void
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEBMFMGMBsEMBO8AuBLA9gOwM7AEbxYC0OkKpKiaWA5sdNjlQK7QoaIB04XKOALgBQNFJEQAzeNEigAyuQDCTVu06gA3kNCgskAO6gAFM0QDQpmrQCU5gG4Y04ANxCAvkKA)

有了这个声明，用字符串构造 `Set` 仍然不会产生类型错误。但它会返回 `void`，所以尝试对结果做任何事情都会给你一个提示，表明有什么地方不对劲：

```ts
const s = new Set('abc')
//    ^? const s: void
console.log(s.has('abc'))
//            ~~~ Property 'has' does not exist on type 'void'.
const otherSet: Set<string> = s
//    ~~~~~~~~ Type 'void' is not assignable to type 'Set<string>'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBBMF4ZgKYHcYGUVQBQHIBDAI2HwEoBuAKAHpaZGYA9AfhlElggC4YA3EAEsAJtU4QQAGxQA6KSADmuCLIAWhCARJlyVOgyZGjAPzMwACgCcQABxRWoATxj4NEfDBEgU8MCFgUAA8haBhwGGd7V0FRfFlxcDCAtQdsKD50gB5oKyEwRQA+RDgaelMzSvMAFSdo-FiRT1DkAJhNCCFFMBIZSJBIupRXbNz8ovjqIA)

为了给用户更强的提示，你可以让 `Set` 构造函数返回包含错误的字符串字面量类型。你还可以用 `@deprecated` 标记这个构造函数，让它在用户的编辑器中显示为删除线（第 68 条）：

```ts
interface SetConstructor {
  /** @deprecated */
  new (str: string): 'Error! new Set(string) is banned.'
}

const s = new Set('abc')
//    ^? const s: "Error! new Set(string) is banned."
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoTAYQPYgM5hQCuCY2UyA3gFDLID0AVI8gAIAmEADlBAnJHbJG9WshAQA7sgAUBKAC5k80AHMAlEoDkAUShRyAQnFS0GOYTXrkwPMgBGcEBPYA6LQG5qAX2rUEuATKyAC8JtLoYDJacPYIWupe9PR0dAB6APzIAfhgykoARHoGUMYSEeYqIBo2do7OEG4F1EA)

这些都不是完美的解决方案：如果我们在构造 `Set` 时产生类型错误会更好，而不是产生一个不可用的类型。但这在 TypeScript 中是不可能的，这就是这种技术的实际应用通常看起来的样子。

当然，能力越大，责任越大。以下是一些需要注意的事项：

- 与所有类型级构造一样，这只影响类型检查。`JSON.parse` 和 `Set` 构造函数的运行时行为不会受到影响，无论是在你自己的代码中还是在库代码中。
- 这种技术最好用于使内置类型更严格和更精确，或者禁止某些事情。如果你添加不反映运行时现实的声明，你可能会创建一个令人困惑的情况。正如第 40 条所解释的，错误的类型可能比没有类型更糟糕。
- 我们通过让 `Set` 构造函数返回 `void` 或错误字符串来"废弃"它。但如果你想禁止一个已经返回 `void` 的函数或方法，这种方法就不会那么好用。

我们使用声明合并来改进内置类型，但同样的技术也可以用于第三方 `@types` 和捆绑的类型声明。你可以在 `ts-reset` npm 包中找到对内置类型的改进集合。

## 要点回顾

- 使用声明合并来改进现有的 API 或禁止问题构造。
- 使用 `void` 或错误字符串返回值来"废弃"方法，并标记为 `@deprecated`。
- 记住，重载只适用于类型层面。不要让类型与实际情况不一致。

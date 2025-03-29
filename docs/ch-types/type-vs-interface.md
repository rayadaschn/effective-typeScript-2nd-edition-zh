# 第 13 条：了解 `type` 与 `interface` 的区别

## 要点

- 理解 `type` 和 `interface` 之间的异同。
- 知道如何使用两种语法编写相同的类型。
- 了解 `interface` 的声明合并和 `type` 的类型内联。
- 对于没有既定风格的项目，优先使用 `interface` 来定义对象类型。

## 正文

如果你想在 TypeScript 中定义一个具名类型，有两种选择。你可以使用类型别名 type，如下所示：

```ts
type TState = {
  name: string
  capital: string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKgysAhsaBeKBvAUFKA7RAWwgC4oBnYAJwEs8BzAbhygGNEwakAbMy2hswC+zIA)

或者使用接口 interface：

```ts
interface IState {
  name: string
  capital: string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKgysAhsaBeKBvAUFKA7RAWwgC4oBnYAJwEs8BzAbhygGNEwakAbMy2hswC+zOiioAzRK2gBJBMmjZcBYn2p0mLdpx7qBWoViA)

> 你也可以使用 `class`，但它是一个 JavaScript 运行时概念，同时还会引入一个值。详见第 8 条。

那么，在 TypeScript 中应该使用 `type` 还是 `interface`？这两者的界限相当越模糊，大多数情况下你可以使用任意一种。你需要了解它们之间仍然存在的区别，并在适当的场景中保持一致。但同时，你也应该学会如何用两种方式编写相同的类型，这样在阅读不同风格的 TypeScript 代码时会更加轻松。

如果是在新代码中选择风格，一般的经验法则是：尽可能使用 `interface`，只有在 `type` 是必须的（比如定义联合类型）或 `type` 语法更简洁（比如定义函数类型）时才使用 `type`。我们会在本条目末尾讨论具体的理由，但现在先来看这两种方式的相似点和不同点。

> [!TIP]
> 在本节的示例中，在类型名前加上 `I` 或 `T`，只是为了区分它们是用 `interface` 还是 `type` 定义的。在实际开发中，不应该这样做！
>
> 在 C# 中，给 `interface` 类型加 `I` 是常见做法，这种习惯在 TypeScript 早期也曾流行过。但现在它被认为是糟糕的风格，因为它没有必要，几乎没有价值，而且 TypeScript 的标准库中也没有一致地遵循这个命名方式。

首先来看相似之处：这两种 `State` 类型几乎没有区别。如果你定义一个 `IState` 或 `TState` 值，并添加一个额外的属性，因为存在 **多余属性检查**（详见第 11 条），你会得到完全相同的错误提示，甚至连字符都一模一样。

```ts
const wyoming: TState = {
  name: 'Wyoming',
  capital: 'Cheyenne',
  population: 578_000,
  // ~~~~~~~ Object literal may only specify known properties,
  //         and 'population' does not exist in type 'TState'
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKgysAhsaBeKBvAUFKA7RAWwgC4oBnYAJwEs8BzAbhygGNEwakAbMy2hswC+zOiioAzRK2gBJBMmjZcBYn2p0mLdpx7qBWoVlYB7PJSgB3ECcKay8JCijpl+IqSgByAOo27DF4ANNocXIi83gDCABYQIBB4eBDBLGAmYACu3Mg0ZmQArADsABwA+gAMVSwA9DVQAH5NzQ1QAPIARgBWEKzAUNxcEFQRUISIIFBm3JPkkKw0EpMA1ngmlnhQYFQZw8A0EOQhuHW4Z+eIeAAm3ulZOftmXlBXJof4Jv0QAB40FnRQUCQbyORReLAiLBAA)

在 `interface` 和 `type` 中都可以使用索引签名：

```ts
type TDict = { [key: string]: string }
interface IDict {
  [key: string]: string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKgysAhsaBeKBvAUFKA7RAWwgC4oBnYAJwEs8BzAbhygGNEwakAbMy2hswC+zOiioAzRK2gBJBMmjZcBYn2p0mLdpx7qBWoVlCRYAERqtgUdBigBtANYQQ+zQF03DKCKxiIktJyFlaYLE4uXvSeFBqCWEZAA)

你也可以使用下面任一一种方式来定义一个函数类型：

```ts
type TFn = (x: number) => string
interface IFn {
  (x: number): string
}
type TFnAlt = {
  (x: number): string
}

const toStrT: TFn = (x) => '' + x // OK
const toStrI: IFn = (x) => '' + x // OK
const toStrTAlt: TFnAlt = (x) => '' + x // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKgysAhsaBeKBvAUFKA7RAWwgC4oBnYAJwEs8BzAbhygGNEwakAbMy2hswC+zOiioAzRK2gBJBMmjZcBYn2p0mLdpx7qBWoVlCRYAMTxR0ACgAeZPAFdCAIwhUAlFYB8FDYKwxdykZKFkLTBY7B2c3T31NYWNwaBgLAEFuYCtI3Gj8WPcPBICRLCxWAHs8SihgSoQqGDI0y3RbHygAci6oAGooW0ZcAHoRqAB5AGkK6tr6xtkycLbBzp7+weGoMcmZqprsheoYTOAWjKycjtRfDYGh0fHprCA)

第一种类型别名的写法（`TFn`）在表示函数类型时更自然，也更简洁。这种写法是推荐的方式，并且在类型声明中最常见。

后两种写法反映了 JavaScript 中函数本质上是可调用对象的事实。在某些情况下（比如 **重载函数签名**，详见第 52 条），它们可能会更有用。

类型别名和接口都可以是 **泛型**：

```ts
type TBox<T> = {
  value: T
}
interface IBox<T> {
  value: T
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKgysAhsaBeKBvAUFKA7RAWwgC4oBnYAJwEs8BzAbhygGNEwakAbMy2hswC+zOiioAzRK2gBJBMmjZcBYn2p0mLdpx7qBWoVlCRYAIQD2ADwA8MAHxR0yqADdE3AK6lYw0XnEpGShZS1sHTBZ3Lx8YYSwgA)

`interface` 可以扩展 `type`（不过有一些注意事项，我们稍后会讨论），而 `type` 也可以扩展 `interface`：

```ts
// IStateWithPop 继承 TState，并额外添加 {population: number}。
// 注意: 这里的 extends 关键字只能用于对象类型，即 {} 形式的结构。
interface IStateWithPop extends TState {
  population: number
}

type TStateWithPop = IState & { population: number }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKgysAhsaBeKBvAUFKA7RAWwgC4oBnYAJwEs8BzAbhygGNEwakAbMy2hswC+zOiioAzRK2gBJBMmjZcBYn2p0mLdpx7qBWoVjERJ0uQpQB1LgAsACgHswUCAA8UeACblYlpSxgzgCu3Mg0jnhkeMGEAEamwligkH5I1nZOLujy6dAAZJhQQWCh4ZHRsQlUjFAiWEA)

这些俩种类型也完全相同。但需要注意的是，`interface` **只能扩展可以用 `interface` 定义的对象类型**（即使它们实际上是用 `type` 定义的）。例如，`interface` **不能** 直接扩展一个 **联合类型**。如果你需要这样做，就必须使用 `type` 并用 `&` 交叉类型来组合。

错误 ❎ 使用:

```ts
type TState = { name: string } | { code: number } // 联合类型

// 拓展联合类型会报错:
interface IStateWithPop extends TState {
  population: number
}

// 使用 type 进行拓展是正确的
type TStateWithPop = TState & { population: number } // ✅ 正确
```

> 为什么`interface` **不能**直接扩展联合类型?
>
> `interface` 主要用于对象类型的扩展，它默认假设基类型是单一对象结构，而联合类型可能是多个结构之一，`interface` 无法处理这种情况。
>
> `type` 的 `&` 交叉类型可以用于联合类型，因为它会创建新的组合类型。

此外，`class` 既可以实现 `interface`，也可以实现一个简单的 `type`：

```ts
class StateT implements TState {
  name: string = ''
  capital: string = ''
}
class StateI implements IState {
  name: string = ''
  capital: string = ''
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKgysAhsaBeKBvAUFKA7RAWwgC4oBnYAJwEs8BzAbhygGNEwakAbMy2hswC+zOiioAzRK2gBJBMmjZcBYn2p0mLdpx7qBWoVlbdE5clAUoYUGoTDcIxPMAvwkKTC1WkKGhlDoAORBzLg6XIi8fgaBUCHCxqbmlh4Qsrb2js6uUPJpXipEvvyacQnaHJHRpQHBoVhGQA)

最后，`type` 和 `interface` 都可以是递归的（详见第 57 条）。

这些都是相似之处。那么它们的区别是什么呢？你已经看到其中一个区别——**它们都有联合 type，但没有联合接口**：

```ts
type AorB = 'a' | 'b'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAgg9gJwEJQLxQOQEMNQD6YBGGA3AFBA)

`interface` 可以扩展一些类型，但不能扩展联合类型。扩展联合类型有时会很有用。如果你有分别表示输入和输出变量的类型，并且有一个从名称到变量的映射：

```ts
type Input = {
  /* ... */
}
type Output = {
  /* ... */
}
interface VariableMap {
  [name: string]: Input | Output
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAkgdmArsKBeKBvKB6AVFAOiKl2ygF8BuAKFEigHlkkV0s9DjSKaBLOYBABOAMwCGAY2gA1MUN5iARgBsIAWTFhM1KFADacMQFsIALigBnYPLgBzALrn4LKAB9GzZDXLUgA)

那么你可能希望定义一个 type，将名称与变量关联起来。这可以是：

```ts
type NamedVariable = (Input | Output) & { name: string }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAkgdmArsKBeKBvKB6AVFAOiKl2ygF8BuAKFEigHlkkV0s9DjSKaBLOYBABOAMwCGAY2gA1MUN5iARgBsIAWTFhM1KFADacMQFsIALigBnYPLgBzALrn4LKAB9GzZDXK1w0AHLGEAAmsvJKqmhQABTOyG4ewCwAlFAAZJhQhibmVja2PNRAA)

这个类型无法通过接口来表达。一般来说，类型比接口更强大。它可以是联合类型，还可以利用一些高级的类型特性，比如映射类型（第 15 条）和条件类型（第 52 条）。

`interface` 和 `extends` 比 `type` 和 `&` 提供了更多的错误检查。

```ts
interface Person {
  name: string
  age: string
}

type TPerson = Person & { age: number } // no error, unusable type

interface IPerson extends Person {
  //      ~~~~~~~ Interface 'IPerson' incorrectly extends interface 'Person'.
  //                Types of property 'age' are incompatible.
  //                  Type 'number' is not assignable to type 'string'.
  age: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmA3EcnA1TXYywL4EEwATwAOKACroo2XAF40mHMgBk+Nh2ogArmQBG0Jsl6HkAelMksyaFCxQANMi3aMcXQBsUwsQNCRYiCgAklIy1gAekCAAJhgK0kqExObEqcgAfplZ6chB4NDwSMgA5CGKIMXIoAh2UBAIYO5CEVGxVfkBRcWhOMUAdKwpacMj4qIQcVgwyCK2YlDCJewQlXB17TVkInBgwB4QA8kWIydpY2Il2nrQlcBxIFhgbBgYwAyk+8hgVt4oxbT0EAMfqsZaaHT6KB8AhAA)

在子类型中更改属性的类型是可以的，只要它与基类型兼容（见第 7 条）。通常，你会希望有更严格的安全检查，因此这是使用 `extends` 继承接口的一个重要原因。

类型别名更适合用于表示元组和数组类型：

```ts
type Pair = [a: number, b: number]
type StringList = string[]
type NamedNums = [string, ...number[]]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBACghgSwE5QLxQNpwFxQHYCuAtgEYRIA0UJuhp5AugNwBQokUAysEgngOYAZBAGdgaKGN4CMzNuGgA5OEQgATRcRESMUvvyoA6Y3TJJZcoA)

不过，接口确实有一些类型别名没有的能力。其中之一就是接口可以被扩展。回到 `State` 的例子，你还可以通过另一种方式添加一个 `population` 字段：

```ts
interface IState {
  name: string
  capital: string
}
interface IState {
  population: number
}
const wyoming: IState = {
  name: 'Wyoming',
  capital: 'Cheyenne',
  population: 578_000,
} // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgJIGUx0sg3gKGWRDgFsIAuZAZzClAHMBuQ5BOAB2CwBsrb6IZvgC++UJFiIUGLDgJEOAew4BXHtmBKQVEKtIAjaCzEJttZAHcAnktKMqs7CgC8eViXJUA5AHVb9kLeADSs7Fy8PgDCABYQ1hAgIBAhrMpqGmBaOsgArADsABwA+gAM5aJMRAD01cgA8gDS+EA)

这被称为“声明合并”，如果你以前没见过，可能会觉得很意外。它主要用于类型声明文件（第 8 章）。如果你在编写类型声明文件，应该遵循规范，使用 `interface` 来支持这种特性。其核心思想是，你的类型声明可能存在一些空缺，而用户可以通过这种方式补充它。（第 71 条会详细介绍这个过程。）

要理解这个特殊功能为何有用，可以看看 TypeScript 是如何利用声明合并来适配不同版本的 JavaScript 标准库的。例如，`Array` 接口的定义就存在于 _lib.es5.d.ts_ 文件中：

```ts
// lib.es5.d.ts
interface Array<T> {
  /** Gets or sets the length of the array. */
  length: number
  // ...
  [n: number]: T
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEBsEsCMDoFMDOBWWATWAXRAoSA7TeAJwDMBDAY3lAEFjjyBPAHgBUA+UAbx1FGAAqQaADi8bKAD2xUIgmJQmABY1w8fAHMV00ktWhyDZrFCDgfCBu3KAXKHwBXALbQSAbkshQsX5YDa+PZOriQAuvZsngC+OEA)

如果你在 _tsconfig.json_（见第 2 条）中将 `target` 设为 `ES5`，那么你获得定义较少。这些定义只包含了 ES5 规范发布（2009 年）时数组的所有属性和方法。但如果你将 `target` 设为 `ES2015`，TypeScript 还会引入 _lib.es2015.core.d.ts_，其中包含 `Array` 接口的另一份声明：

```ts
// lib.es2015.core.d.ts
interface Array<T> {
  /** Returns the index of the first element in the array where predicate... */
  findIndex(
    predicate: (value: T, index: number, obj: T[]) => unknown,
    thisArg?: any
  ): number

  // ... also find, fill, copyWithin
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEBsEsCMDoFMDOAmADARgKywMYHsAneWAE1gBdEAoSAO3PgIDMBDHeUAQQIJYE8APABUAfKADeVUKGAAqWaABK8cgFcCtRKHIALDnRLwAHqDxNte0E0gFE5UPHDwAtvHqg6Fjix79QAdz0iUAAHIhJIHBYGWFjQWWApKwMASVpDIwAKJOkw+AiohgAuUEyANxZwVXgSoQAaD3TjEtpVZ2hGBrxoACtagG0AXQBKUABeMVVaAGtaPH9aOpyLSERuAHMAfhKWWj4k4Za2joIAbiokkFBY2FBKxDxk9IbrcHAG-BC+AHVIXToqABfKhAA)

这个声明只包含了 ES2015 新增的四个数组方法：`find`、`findIndex`、`fill` 和 `copyWithin`。这些方法通过声明合并被添加到 ES5 的 `Array` 接口中。最终的效果是，你会得到一个 `Array` 类型，它的可用方法恰好匹配你的目标 JavaScript 版本。

顾名思义，声明合并最适用于声明文件。它也可以在用户代码中发生，但前提是两个接口必须定义在同一个模块（即同一个 `.ts` 文件）。这样可以避免与全局接口（如 `Location` 和 `FormData` 这种通用名称）意外冲突。

另一个区别是，TypeScript 总是尽量使用接口的名称，而对类型别名的处理则更灵活，可能会直接用它的具体定义替换。在错误消息和类型展示中（见第 56 条）有时会看到这种区别，但它也会影响具体的输出，例如当你在 _tsconfig.json_ 中设置 `declaration: true` 时，TypeScript 生成的 `.d.ts` 文件。

举个例子，看看这个返回静态类型对象的函数，它使用了一个作用域受限的类型别名：

```ts
export function getHummer() {
  type Hummingbird = { name: string; weightGrams: number }
  const ruby: Hummingbird = { name: 'Ruby-throated', weightGrams: 3.4 }
  return ruby
}

const rubyThroat = getHummer()
//    ^? const rubyThroat: Hummingbird
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/KYDwDg9gTgLgBAMwK4DsDGMCWEVwObAwASSAtqcFABQCUcA3gFBxwwCeYwcJ5mKeAI0xQAJnAC8DOCgCGFAFxwAzjCh88AbjgB3YJjwALGAHEocpYpRkBlLQF8NzOGhwq4UJALaKepdUNEJKVkFOAByACVPNgBaGAMoCBkYYBEwgBodPUMTM1ILOABmADoAFjgHJyhCJChcDy9HSsYXFDcGtgAVBKT4SQJiMgpqGkcAejGWFgA9AH5nV3gO7sTknyH-YRFGIA)

有趣的是，TypeScript 在这里报告的类型使用了一个超出作用域的类型名称（`Hummingbird`）。更有意思的是，当你为这段代码生成 `.d.ts` 文件时，会发生什么：

```ts
// get-hummer.d.ts
export declare function getHummer(): {
  name: string
  weightGrams: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEHMFMBcFoAsCuBbZkBOA6AJp6BnAKEgA8AHAe3WlG0gGMAbAQ3UlADNEA7e6ASwrcIMABIo06ABQBKAFygA3oVChuzNAvzR0-buADcK0AHdI-cPGgBxdBvwLuKAEYYjAXyNA)

由于 `.d.ts` 文件中没有函数体来定义类型别名（因为这是一个类型声明文件），TypeScript 选择了**内联**这个类型别名。也就是说，类型名称被移除，只保留了类型结构。

由于 TypeScript 的类型系统是**结构化**的（见第 4 条），这对可以赋值给该类型的值没有影响。但它会影响类型的显示方式，并改变生成的 `.d.ts` 文件。在某些情况下，这种**内联行为**可能会导致类型重复，甚至严重到影响编译器的性能（见第 78 条）。

如果你改用 `interface`，情况会有所不同：

```ts
export function getHummer() {
  //            ~~~~~~~~~
  // Return type of exported function has or is using private name 'Hummingbird'.
  interface Hummingbird {
    name: string
    weightGrams: number
  }
  const bee: Hummingbird = { name: 'Bee Hummingbird', weightGrams: 2.3 }
  return bee
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&declaration=true#code/KYDwDg9gTgLgBAMwK4DsDGMCWEVwObAwASSAtqcFABQCUcA3gFBxwD0rLnXnAfn--2ZsOAJUJIouGAE8wwOBARxQkWMAAmiVBmy4AFgEMAzgqhxMJpEcwo8cMFEwA3AzHkoDFOAHIS5G3gARphQ6t4AdEI2blAIBmjyfqQBwaEMcB4UAFxwRjCOtgDccADuwJh4ejAA4lCeRjkoZIGUxQC+hUJoOHlwLcA5SSkhmgC86ZkDPgBCwIlkybapYQA0peWVNXWkDXAATOEAzHAdQlDikn1znadAA)

因为 `Hummingbird` 是一个接口，TypeScript 需要通过名称引用它。但在类型声明文件中，这个名称不可用，因此会报错。虽然内联行为在这个例子中看起来更方便，但它可能导致类型过于庞大。而且，正如第 67 条所述，通常**最好将你的类型导出**。更好的解决方案是保留 `interface`，并将其作为顶层导出。

回到最初的问题：应该使用 `type` 还是 `interface`？

对于复杂类型，`type` 是唯一的选择，因为 `interface` 无法完成复杂类型的定义。例如，函数类型、元组类型和数组类型，使用 `type` 语法会更简洁、自然。但对于可以用两种方式表示的**简单对象类型**，该如何选择呢？

如果你在一个已有风格的代码库中工作，最好遵循已有的风格。这样你通常不会出错。

对于一个没有既定风格的新项目，建议使用 `interface`。这样你在错误信息和类型展示中会更一致，并且你会得到更多关于正确扩展其他接口的检查。以下是 TypeScript 官方手册中的建议：

大多数情况下，你可以根据个人喜好来选择，TypeScript 会告诉你何时需要使用另一种声明。如果你需要一个经验法则，那就优先使用 `interface`，直到你需要使用 `type` 的特性。

换句话说，尽可能使用 `interface`，而当必须使用或更符合开发习惯时再使用 `type`。但也不用太过担心。

你可以使用 `typescript-eslint` 的 `consistent-type-definitions` 规则来强制统一使用 `type` 或 `interface`，这是该工具的风格预设之一（默认偏好使用 `interface`）。

## 关键点总结

- 理解 `type` 和 `interface` 之间的差异和相似之处。
- `interface` 不能拓展联合类型，而 `type` 可以。
- 对于没有既定风格的项目，优先使用 `interface` 来定义对象类型。

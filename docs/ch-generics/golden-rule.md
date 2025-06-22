# Item 51: Avoid Unnecessary Type Parameters

## 要点

- Avoid adding type parameters to functions and classes that don't need them.
- Since type parameters relate types, every type parameter must appear two or more times to establish a relationship.
- Remember that a type parameter may appear in an inferred type.
- Avoid "return-only generics."
- Unneeded type parameters can often be replaced with the `unknown` type.
- 避免给不需要类型参数的函数和类添加类型参数。
- 由于类型参数关联类型，因此每个类型参数必须至少出现两次或更多次以建立关系。
- 记住，类型参数可能出现在推断类型中。
- 避免"仅返回类型的泛型"。
- 不必要的类型参数通常可以用 `unknown` 类型替代。

## 正文

关于泛型函数，官方 TypeScript 手册是这样说的：

编写泛型函数很有趣，很容易过度使用类型参数。拥有太多类型参数或在不需要的地方使用约束会使类型推断不太成功，让函数的调用者感到沮丧。

手册还提供了关于如何使用泛型的具体建议，包括有时被称为"泛型黄金法则"的规则：

### 类型参数应该出现两次

类型参数用于关联多个值的类型。如果类型参数在函数签名中只使用一次，那么它就没有关联任何东西。

**规则：如果类型参数只出现在一个位置，强烈建议重新考虑是否真的需要它。**

这个规则为你提供了一种具体的方法来判断任何类型参数是好是坏，但如何应用它并不总是显而易见的，而且它没有提供太多关于如何重构代码的指导。在本条目中，我们将通过一些泛型使用的好例子和坏例子来说明这个规则是如何工作的，并重写那些不好的例子。

让我们从 identity 函数开始：

```ts
function identity<T>(arg: T): T {
  return arg
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABDAJgUzLKBPAPAFQD4AKAQwCcBzALkXwEpb9EBvAKEUXLShHKQqUA3GwC+bIA)

这个函数接受一个参数并返回它，保持其类型不变。以下是你可能的使用方式：

```ts
const date = identity(new Date())
//    ^? const date: Date
const nums = [1, 2, 3]
//    ^? const nums: number[]
const numsCopy = nums.map(identity)
//    ^? const numsCopy: number[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABDAJgUzLKBPAPAFQD4AKAQwCcBzALkXwEpb9EBvAKEUXLShHKQqUA3GwC+bCAgDOURClJQ0iALzJ0mGDmJg0Ad0QARBWmL16IgPQXOnAHoB+RJLAy5x2kcUTpssCAC2UiqIANoAjAA0iABMUQDMALqW1jYOTj6IfoG0WQBGaOQhCd4uvgFSAMJwAA7YwVlSAHT+pNXEqBhY2OZsVjaIac6uDVW1OQH5hcVAA)

如果你需要传入回调函数但不想改变数据，这个函数在实践中很有用。考虑黄金法则，这是泛型的好用法还是坏用法？在这个例子中，类型参数 T 在声明后出现在两个地方：

```ts
function identity<T>(arg: T): T {
  //           (decl.)    1   2
  return arg
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABDAJgUzLKBPAPAFQD4AKAQwCcBzALkXwEpb9EBvAKEUQHovO--OxdBAA2AOnr8AjHwBMHROTRQQ5JBUoBuNgF82QA)

所以这通过了测试，是泛型的好用法。这是正确的：它关联了两个类型，因为它表明输入参数的类型和函数的返回类型是相同的。

那么这个呢？

```ts
function third<A, B, C>(a: A, b: B, c: C): C {
  return c
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABFAFjATgEwDwEEA0iAQoQMIB8AFAIYBciBiARvSYhPaQJSeIDeAKESJ0AUygh0SCAG4BAXwFA)

类型参数 C 出现两次，所以没问题。但是 A 和 B 只出现一次（除了在它们的声明中），所以这个函数没有通过测试。你可以只使用一个类型参数重写它：

```ts
function third<C>(a: unknown, b: unknown, c: C): C {
  return c
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABFAFjATgEwDwGEB8AFAIYBci4A1mHAO5gA0iARuVTfUxObgJQ+IA3gChEidAFMoIdEggBuYQF9hQA)

这是一个解析 YAML 的函数类型声明：

```ts
declare function parseYAML<T>(input: string): T
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwAdYBnEATQEEBZAGQB4AVAPgAotUDkMAueYjGOwDmASl4MA3ACggA)

这是泛型的好用法还是坏用法？类型参数 T 只出现一次，所以一定是坏的。如何修复它？这取决于你的目标是什么。这些所谓的"仅返回类型的泛型"是危险的，因为它们等同于类型断言（条目 9），但不使用 `as` 关键字：

```ts
interface Weight {
  pounds: number
  ounces: number
}

const w: Weight = parseYAML('')
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwAdYBnEATQEEBZAGQB4AVAPgAotUDkMAueYjGOwDmASl4MA3ACh2GEDERQwCAOogsQgBYZ4AbynxCONMGK9UyALYAjedMPH0IM-As27UgL5SpYPP3gAd141DW14AF5CEnJqGhYAcgSRaSA)

乍一看，这段代码看起来很安全，因为没有类型断言或任何类型。但这是一种错觉。你可以用任何其他类型替换 Weight，这段代码仍然会通过类型检查。为类型参数设置默认值不会改变这一点：

```ts
declare function parseYAML<T = null>(input: string): T
const w: Weight = parseYAML('') // still allowed
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgOoWAcwBZmQbwChlkAHAewFcQATAZwC5kRKBbAI2gG5jkqQkjZm05QeAX0I0ICADZwoKGNQRhg5EGQV0IATQCCAWQAyAHgAqAXhazZAPgAUoUpTBM6YKKEwBKJuZ4EDQ9kAHcmdCxcZEstKB0DEwcAcmSfLhIAekzkD2BbZDhbclCIGkIgA)

最好让这个函数返回 `unknown` 类型（参见条目 46 了解 `unknown` 类型的复习）：

```ts
declare function parseYAML(input: string): unknown
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgOoWAcwBZmQbwChlkAHAewFcQATAZwC5kRKBbAI2gG5jkqQkjZm05QeAX0I0ICADZwoKGNQRhg5EGQV0IATQCCAWQAyAClClKYJnTBRQmAJRNqAaxDkA7iB5A)

这将强制函数的使用者对结果执行类型断言：

```ts
const w = parseYAML('') as Weight
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgOoWAcwBZmQbwChlkAHAewFcQATAZwC5kRKBbAI2gG5jkqQkjZm05QeAX0I0ICADZwoKGNQRhg5EGQV0IATQCCAWQAyAClClKYJnTBRQmAJRNqAaxDkA7iB4INt5E9kAF4tKB0DE1MAcmjHZDg6NAwcMB4gA)

这实际上是一件好事，因为它强制你明确地处理不安全的类型断言。这里没有类型安全的错觉！

那么这个呢？

```ts
function printProperty<T, K extends keyof T>(obj: T, key: K) {
  console.log(obj[key])
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwE4zFACquyCmqUAngDwAqANIgNKL4AeU+YAJgM6IDW+xcwicgD4AFHABGAKwBcg6j2KyaASkQBvAFCJEEBOzgAbfADoDcAOZipAbQUBdZQG4NAXw1A)

由于 K 只出现一次，这是泛型的坏用法（T 没问题，因为它既作为参数类型出现，又作为 K 的约束出现）。通过将 `keyof T` 移到参数类型中并消除 K 来修复它：

```ts
function printProperty<T>(obj: T, key: keyof T) {
  console.log(obj[key])
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwE4zFACquyCmqUAngDwAqAfABRwBGAVgFyLkA0iA1vsS98XGCsAlIgDeAKESIICAM5wANvgB0iuAHNajANr8AusIDcEgL4SgA)

这个函数看起来表面上相似：

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key]
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQAoCc4AdVZQCeAPACoA0iA0oqgB5SpgAmAzogNapFzCJkAfAAo4AIwBWALgFVuRGdQCUiAN4AoRIizoQWJOIkBteQF0A3OoC+6oA)

然而，这个实际上是泛型的好用法。要了解原因，我们需要查看函数的推断返回类型。如果你在编辑器中检查 `getProperty`，你会看到它的返回类型是 `T[K]`。这意味着这个签名等同于：

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQAoCc4AdVZQCeAPACoA0iA0oqgB5SpgAmAzogNapFzCJkAfAAo4AIwBWALgFVuRGdQCUMsgG1qAXUQBvAFCJEWdCCxJxEtfM0BuPQF89QA)

所以 K 确实出现了两次！这是泛型的好用法：K 与 T 相关，返回类型与 K 和 T 都相关。

类呢？

```ts
class ClassyArray<T> {
  arr: T[]
  constructor(arr: T[]) {
    this.arr = arr
  }

  get(): T[] {
    return this.arr
  }
  add(item: T) {
    this.arr.push(item)
  }
  remove(item: T) {
    this.arr = this.arr.filter((el) => el !== item)
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEDC5QJ4EEBOqyIDwBUB80A3gFDTRjoBc0OA2gLoDcp0wA9gHYQAuqArsG5tUACgqpqdegEoi0bgAsAlhAB046AF5y6RtAC+xFgHMAptxHTJDOanN9UHecrXi9hsmAAmXkUu6mALaSsoTOKuroqgAOfBAKfgGB0u4sdoFsAG6miUEhRCxkihEa2sWuUQBmSiABoqYgWgQN0ACEmtr+QdIshoZAA)

这很好，因为 T 在实现中出现了很多次（我数了 5 次）。当你实例化 `ClassyArray` 时，你绑定类型参数，它关联类上所有属性和方法的类型。（这对于创建推断站点很有用，正如我们在条目 28 中看到的。）

另一方面，这个类没有通过测试：

```ts
class Joiner<T extends string | number> {
  join(els: T[]) {
    return els.map((el) => String(el)).join(',')
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEBSD2BLAdgUwE4B4Aq1UA8AXVZAExgkPRQHNoAfaZAVwFsAjDAPmgG8AoaNABWSZAApUICAC5o2ANoBdAJR9BQ6OlSFm6ZHmkA6VmAAOkkNAC8PAMpVallSqOiU4gOQAaTyoDcGgC+-CFAA)

首先，T 只适用于 `join`，所以它可以移到方法上，而不是类上：

```ts
class Joiner {
  join<T extends string | number>(els: T[]) {
    return els.map((el) => String(el)).join(',')
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEBSD2BLAdgUwE7QN4ChrQCslkAeAFWlQA8AXVZAExghvRQHNoAfaZAVwC2AIwwA+ABSoQEAFzQyAbQC6ASmx580dKhp90yStIB0AsAAdJIaAF5R0AMqsOllSqNEU4gOQAaLyoBuDQBfHFCgA)

通过将 T 的声明移到更接近其使用的地方，我们使 TypeScript 能够推断 T 的类型。通常，这正是你想要的！但在这种情况下，由于 T 只出现一次，你应该让它成为非泛型的：

```ts
class Joiner {
  join(els: (string | number)[]) {
    return els.map((el) => String(el)).join(',')
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEBSD2BLAdgUwE7QN4ChrQCslkAKVECALmhIgBd0UBzaAH2mQFcBbAIwwCUAbQC6A7HnzR0qOp3TJo5CADpuYAA5kQ0ALwA+aAGUGzbQIEqiKEgHIANLYEBuSQF8cHoA)

最后，为什么这需要是一个类呢？这种包装类在 Java 中很常见（Java 不支持独立函数），但在 JavaScript 中是不必要的。让它成为一个独立函数：

```ts
function join(els: (string | number)[]) {
  return els.map((el) => String(el)).join(',')
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAKzjMAKApgGwM4BciGeUATugOYA+YIAtgEZZkCUA2gLquIDeAUIkRksUEGSS48AOnoBDAA7YciALwA+RAGVyVZa1bTU6DAHIANKdYBufgF9+QA)

这个获取任何类数组对象长度的函数呢？

```ts
interface Lengthy {
  length: number
}
function getLength<T extends Lengthy>(x: T) {
  return x.length
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgDIRAczACwJ7IDeAUMsgDYbY4BcyIArgLYBG0A3MQL7EwMgIwwAPYhkmCGHRZcAHgAqyCAA9IIACYBnNFVx4AfAApldeQEoipZFEkMoY5QDpKMnJx5A)

由于 T 在定义后只出现一次，这是泛型的坏用法。它可以写成：

```ts
function getLength(x: Lengthy) {
  return x.length
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgDIRAczACwJ7IDeAUMsgDYbY4BcyIArgLYBG0A3MQL7EwMgIwwAPYhkmCGHRZcACgAedadTwBKIqWRRJDKGPkA6SjJyceQA)

或者甚至：

```ts
function getLength(x: { length: number }) {
  return x.length
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgDIRAczACwJ7IDeAUMsgDYbY4BcyIArgLYBG0A3MQL7EwMgIwwAPYhkmCGHRZcACgAedQpRm16zNlC4BKIqWRRJDKGPkA6FdU48gA)

或者，由于 TypeScript 有一个内置的 `ArrayLike` 类型：

```ts
function getLength(x: ArrayLike<unknown>) {
  return x.length
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgDIRAczACwJ7IDeAUMsgDYbY4BcyIArgLYBG0A3MQL7EwMgIwwAPYhkmCGHRZcACgAedAIJQocPKmABrCAB5+WkMIDuIAHwBKIqWRRJDKGPkA6SjJyceQA)

每个规则都有例外，那么这个规则有例外吗？在一些罕见的情况下，多余的类型参数可以帮助你正确实现。例如，这个函数中的两个类型参数都是坏的：

```ts
declare function processUnrelatedTypes<A, B>(a: A, b: B): void
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgDIRAczACwJ7IDeAUMsgDYbY4BcyIArgLYBG0A3MQL7EAmECcnCgoYDEAjDAA9iGQAHKNKQBnFQFUQIoZF4AVPPIgqAPAEEANMgBCAPgAUcOpeQs61gJR0AbtOC9OIA)

修复方法是重写为：

```ts
declare function processUnrelatedTypes(a: unknown, b: unknown): void
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgDIRAczACwJ7IDeAUMsgDYbY4BcyIArgLYBG0A3MQL7EAmECcnCgoYDEAjDAA9iGQAHKNKQBnFQFUQIoZF4AVPPIgqAFHDriA1iGkB3EABpkLCyGt2QASjoA3acF5OIA)

然而，这对函数的实现有影响。在第一个声明中，a 和 b 在函数体中不能相互赋值：

```ts
function processUnrelatedTypes<A, B>(a: A, b: B) {
  a = b
  //  ~ Type 'B' is not assignable to type 'A'.
  b = a
  //  ~ Type 'A' is not assignable to type 'B'.
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgDIRAczACwJ7IDeAUMsgDYbY4BcyIArgLYBG0A3MQL7EwMgIwwAPYhkAByjCkAZxkBVEFAjk4kACYAVPOIgyAPAEEANMgBCAPgAUcOieQs6ZgJRFSZZHGQBeB5wD0-mQAfsjausgA5GaRyMAy9MJgnnLAmCBwLJTIYMI5OiiRhpEAdO5kLD6eAUHIoeGFxXEJIEkpMmkZWSi5+RHRpdzEQA)

使用改进的类型签名，它们可以：

```ts
function processUnrelatedTypes(a: unknown, b: unknown) {
  a = b // ok
  b = a // ok
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgDIRAczACwJ7IDeAUMsgDYbY4BcyIArgLYBG0A3MQL7EwMgIwwAPYhkAByjCkAZxkBVEFAjk4kACYAVPOIgyAFHDr8A1iGEB3EABpkLYyDOWQASiKlkcZAF477MgD0AcjCJh4sPp7+yEEhYTxAA)

一个变通方法是使用单个重载来为调用者创建与实现不同的类型签名。条目 52 展示了这是什么样子。但作为一般规则，这种情况很少见，你应该避免只出现一次的泛型类型参数。

现在你应该对如何应用泛型黄金法则以及如何修复违反它的声明有了很好的理解。当你阅读和编写泛型函数时，想想它们是否遵循这个规则！如果函数或类不需要是泛型的，那么它不是泛型时会更容易理解和维护。

换句话说，泛型的第一条规则是"不要使用"。

## 要点回顾

- 避免给不需要类型参数的函数和类添加类型参数。
- 由于类型参数关联类型，因此每个类型参数必须至少出现两次或更多次以建立关系。
- 记住，类型参数可能出现在推断类型中。
- 避免"仅返回类型的泛型"。
- 不必要的类型参数通常可以用 `unknown` 类型替代。

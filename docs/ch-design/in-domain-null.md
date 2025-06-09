# 第 36 条：为特殊值使用特殊类型

## 要点

- 避免使用那些在类型中本身就是合法值的“特殊值”，否则会削弱 TypeScript 检查 bug 的能力。
- 如果要用特殊值，优先考虑 `null` 或 `undefined`，不要用 `0`、`-1` 或 `""`。
- 如果 `null` 或 `undefined` 的含义不够清晰，建议用“标记联合类型”来明确表达你的意图。

## 正文

JavaScript 的字符串 `split` 方法非常方便，可以用分隔符把字符串拆开：

```js
'abcde'.split('c') // [ 'ab', 'de' ]
```

我们想写一个类似功能的函数，不过是针对数组的。尝试写成这样：

```ts
function splitAround<T>(vals: readonly T[], val: T): [T[], T[]] {
  const index = vals.indexOf(val)
  return [vals.slice(0, index), vals.slice(index + 1)]
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZwA4BsZQIICc7gAmAPACoB8AFAG4CG6yAXIrgKa2ELoCeipA2gF0ANIjrpmpAJTN+AkXyGDEAbwBQiRBATIoiGGEKsAHogC8Y+sgB0Bo8YDywGvSkBuDS1ZQQuJP3EbZEwIVkoABlE7EylRQOtgmFDKaOMAagBGKUEPAF81IA)

用法和预期一样：

```ts
splitAround([1, 2, 3, 4, 5], 3) // [ [1, 2], [4, 5] ]
```

但是，如果你传入的元素不在数组里，结果就很奇怪了：

```ts
splitAround([1, 2, 3, 4, 5], 6) // [ [1, 2, 3, 4], [1, 2, 3, 4, 5] ]
```

虽然函数在这种情况下该怎么处理不太明确，但结果肯定不是预期的。为什么这么简单的代码会出现这种奇怪行为？

根本原因是：`indexOf` 找不到元素时返回 `-1`。这个 `-1` 是一个特殊值，表示查找失败，而不是有效索引。

但 `-1` 本身只是一个普通数字。你把它传给数组的 `slice` 方法，也能做算术运算。传负数给 `slice` 表示从数组末尾往回数。当你对 `-1` 加 1 时，结果是 0。

所以最终执行的是：

```ts
;[vals.slice(0, -1), vals.slice(0)]
```

即：

- `vals.slice(0, -1)`：从开头到倒数第一个元素（不包含最后一个元素）
- `vals.slice(0)`：从开头到结尾（整个数组）

第一个 `slice` 返回数组除了最后一个元素以外的所有元素，第二个 `slice` 返回整个数组的完整拷贝。

这种行为其实是个 bug。而且很遗憾，TypeScript 并没有帮我们发现这个问题。问题的根源是 `indexOf` 找不到元素时返回了 `-1`，而不是比如返回 `null`。

为什么会这样呢？

虽然我们不能穿越回 1995 年去访问 Netscape 办公室，但可以推测一下：JavaScript 受到 Java 影响很大，而 Java 的 `indexOf` 也是这样设计的。在 Java（和 C）里，函数不能返回一个基本类型或者 `null`，只有对象（或指针）可以是可空的。所以这个设计很可能是源于 Java 的技术限制，而 JavaScript 并没有这个限制。

在 JavaScript（和 TypeScript）里，函数返回数字或者 `null` 都没问题，所以我们可以对 `indexOf` 做个封装：

```ts
function safeIndexOf<T>(vals: readonly T[], val: T): number | null {
  const index = vals.indexOf(val)
  return index === -1 ? null : index
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZwIbAKYEkwBMMAeA8sADwAqAfABQBuqANsgFyIBOGquCDAnouQDaAXQA0ieg1bkAlKzAgAtgCMMbRAB9EChg0QBvAFCJEEBMiiIYeQogC8ExsgB01-MWB1GMgNzH2GFAgbEhutnYRiAC0AIyIAPzaILqIrGEEfgC+hkA)

如果我们把这个封装版的 `indexOf` 用在最开始的 `splitAround` 函数里，立刻就会遇到两个类型错误：

```ts
function splitAround<T>(vals: readonly T[], val: T): [T[], T[]] {
  const index = safeIndexOf(vals, val)
  return [vals.slice(0, index), vals.slice(index + 1)]
  //                    ~~~~~              ~~~~~ 'index' is possibly 'null'
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZwIbAKYEkwBMMAeA8sADwAqAfABQBuqANsgFyIBOGquCDAnouQDaAXQA0ieg1bkAlKzAgAtgCMMbRAB9EChg0QBvAFCJEEBMiiIYeQogC8ExsgB01-MWB1GMgNzH2GFAgbEhutnYRiAC0AIyIAPzaILqIrGEEfgC+hqCQsAgoAA4MMFAAgmxw4LgUNJIsAVw8-EJijlICcoiCreKtwgb+ZmAWVjYE9ijo2OMkXkzikr7+HEEh3fXOyCUQGNQADOLpMotOWzt76QDUMTLCfiYA9I8mr2-vHwB+398ff4g-X4AcnSQKsyEQhTgyGQMGUfEQQJ0DCBhmyQA)

这正是我们想要的效果！使用原生的 `indexOf`，TypeScript 无法区分查找成功和失败两种情况。但用我们封装后的版本，TypeScript 能明确知道有两种可能：返回的是 `number` 或 `null`，并且能提醒我们只处理了其中一种情况。

解决办法就是显式地处理查找失败的情况：

```ts
function splitAround<T>(vals: readonly T[], val: T): [T[], T[]] {
  const index = safeIndexOf(vals, val)
  if (index === null) {
    return [[...vals], []]
  }
  return [vals.slice(0, index), vals.slice(index + 1)] // ok
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZwIbAKYEkwBMMAeA8sADwAqAfABQBuqANsgFyIBOGquCDAnouQDaAXQA0ieg1bkAlKzAgAtgCMMbRAB9EChg0QBvAFCJEEBMiiIYeQogC8ExsgB01-MWB1GMgNzH2GFAgbEhutnYRiAC0AIyIAPzaILqIrGEEfgC+hqCQsAgoAA4MMFAAgmxw4LgUNJIsAVw8-EJijlICcoiCreKtwgb+ZmAWVjYE9ijo2OMkXkzikr7+MMCI1On2kToMMoMmJhxBId2Czuf1bSLCfibZh4HBSIL1zsglEBjUAAzi6TKLJxvD5fdIAahiMhuJgA9DDEHAANaGbJAA)

这是不是“正确行为”还值得讨论，但至少 TypeScript 迫使我们认真思考这个问题！

第一个实现的根本问题在于，`indexOf` 有两种完全不同的情况，但它在特殊情况（返回 -1）下的返回值类型和正常情况（返回找到的索引）一样，都是 `number`。这就导致在 TypeScript 看来，这只是一个统一的情况，它无法察觉我们有没有去检查 -1 的返回值。

这种情况在设计类型时经常会遇到。比如你有一个用来描述商品的类型：

```ts
interface Product {
  title: string
  priceDollars: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZwIbAKYEkwBMMAeA8sADwAqAfABQBuqANsgFyIBOGquCDAnouQDaAXQA0ieg1bkAlKzAgAtgCMMbRAB9EChg0QBvAFCJEEBMiiIYeQogC8ExsgB01-MWB1GMgNzH2GFAgbEhutnYRiAC0AIyIAPzaILqIrGEEfgC+htZQasCoEBiIAApscLgg0Ab+sFAMGKwWbNYA5n4mAA4tRQAicLqobCxJKmpZhkA)

然后你意识到，有些商品的价格是未知的。如果把这个字段改成可选的，或者改成 `number | null`，可能就需要做数据迁移，还要改很多代码。于是你决定引入一个特殊值来表示未知价格：

```ts
interface Product {
  title: string
  /** Price of the product in dollars, or -1 if price is unknown */
  priceDollars: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgApQPYBMCuCzIDeAUMsmMGADYQBcyAzmFKAOYDcpyA9AFS9oWSZBhjkAFigAOmXPmShkWDFSpwoDADQioyALQBGBWJnBhwBshwgA1iAwB3EMl7cuppABEVajfRA4ALYARtCcAL7EQA)

你把这个改动上线了。一周后，你老板大发雷霆，质问为什么你会往客户的银行卡里打钱。你们团队开始紧急回滚改动，而你被安排去写事故复盘。事后看来，如果一开始就认真处理那些类型错误，反而会轻松得多！

选择一些“在领域内”的特殊值，比如 `-1`、`0` 或 `""`，其实就和关闭 `strictNullChecks` 差不多。当关闭了 `strictNullChecks`，你就可以把 `null` 或 `undefined` 赋值给任何类型：

```ts
// @strictNullChecks: false
const truck: Product = {
  title: 'Tesla Cybertruck',
  priceDollars: null, // ok
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&strictNullChecks=false#code/JYOwLgpgTgZghgYwgAgApQPYBMCuCzIDeAUMsmMGADYQBcyAzmFKAOYDcpyA9AFS9oWSZBhjkAFigAOmXPmShkWDFSpwoDADQioyALQBGBWJnBhwBshwgA1iAwB3EMl7cuppABEVajfRA4ALYARtCcAL7E3NzIAAJMQmAAcjiqAMKSCDYM9PBUDBDECBggTORQeDb06Nh4BAC8RFwU1HTIAOQAKhAMashpAJ6hUMyV7ZruQhDequo5yAGq2jwxGDbE4ZxAA)

这会让大量的 bug 悄无声息地绕过类型检查器，因为 TypeScript 并不会区分 `number` 和 `number | null`，它会把 `null` 当作所有类型的合法值。而当你开启了 `strictNullChecks`，TypeScript 才会区分这些类型，从而能发现更多潜在问题。
当你使用像 `-1` 这样的“领域内特殊值”时，实际上是在你的类型系统中人为挖了一个“非严格的漏洞”。虽然这样做图省事，但从长远看并不是个好选择。

当然，`null` 和 `undefined` 并不总是最合适的“特殊值”，因为它们的含义可能会因上下文不同而变化。比如，如果你在表示一个网络请求的状态，使用 `null` 代表出错、`undefined` 代表等待中，这其实会让语义很模糊。更好的做法是使用“标记联合类型”（tagged union），用显式的方式来表达这些特殊状态。第 29 条有详细讲这个例子。

## 关键点总结

- 避免使用那些在类型中本身就是合法值的“特殊值”，否则会削弱 TypeScript 检查 bug 的能力。
- 如果要用特殊值，优先考虑 `null` 或 `undefined`，不要用 `0`、`-1` 或 `""`。
- 如果 `null` 或 `undefined` 的含义不够清晰，建议用“标记联合类型”来明确表达你的意图。

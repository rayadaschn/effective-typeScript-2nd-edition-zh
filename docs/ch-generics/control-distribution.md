# Item 53: 了解如何控制联合类型在条件类型上的分发

## 要点

- 考虑是否希望联合类型在你的条件类型上分发（distribute）。
- 了解如何通过添加条件或将条件包装在单元素元组（one-tuples）中来启用或禁用分发。
- 注意 `boolean` 和 `never` 类型在分发到联合类型时的意外行为。

## 正文

Item 52 讨论了条件类型如何在联合类型上分发，以及这对于为 double 函数提供类型标注是如何有帮助的：

```ts
declare function double<T extends number | string>(
  x: T
): T extends string ? string : number

const num = double(12)
//    ^? const num: number
const str = double('x')
//    ^? const str: string

declare let numOrStr: number | string
const either = double(numOrStr)
//    ^? const either: number | string
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtX2B2QCMIQAeAFXhAA8MRVgBneVZAW2JBngB94zDDCyoA5gD4AFACh48WgC54lGQEpl1OgyashI8fAD8g4aLHxl7LjwDcMmWDxC2neAF4CRUiCkBGACY1ewB6EPl5AD0TJ1QXaytObhhHZwxTXk9CEjIpAHJaPOCZMIj4aPhYl31lfXMHUEhYBDJ06wB5GABlYUSbXgE68Xsq9JAsDAALHg8vHN8O7uFi0oiK0ZoJ6Zg+5P4M+qA)

在这种情况下，联合类型上的分发产生了期望的结果。这通常是，但并非总是如此。

为了看一个分发不可取的例子，让我们定义一个 `isLessThan` 函数，它判断第一个参数是否小于第二个参数。我们希望它能处理日期、数字和字符串。为了方便起见，如果你将 Date 作为第一个参数传入，我们希望允许你将数字（自纪元以来的毫秒数）作为第二个参数传入。

你可以使用条件类型来建模这个：

```ts
type Comparable<T> = T extends Date
  ? Date | number
  : T extends number
  ? number
  : T extends string
  ? string
  : never

declare function isLessThan<T>(a: T, b: Comparable<T>): boolean
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwg9gWzAQwE7IEYBsIB4AqAfFALwBQUlU+UEAHsBAHYAmAzlACLKNQD8XHtAA+UJgFcEGCKgBcFKjXqNWHCVJn8xk6aijyq1Wg2bsobYKgCWTAOZaL1u-oWUmEAG4yA3GTIsIAGMsNGgAM3EmQOArOCYoKzYAGQg2NnwAC2QmAkIACmRZagAaKAwi+CQ0TBxcgEoijDg4HGzfIA)

这似乎允许和禁止了我们期望的组合：

```ts
isLessThan(new Date(), new Date()) // ok
isLessThan(new Date(), Date.now()) // ok, Date/number comparison allowed
isLessThan(12, 23) // ok
isLessThan('A', 'B') // ok
isLessThan(12, 'B')
//             ~~~ Argument of type 'string' is not assignable to parameter
//                 of type 'number'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwg9gWzAQwE7IEYBsIB4AqAfFALwBQUlU+UEAHsBAHYAmAzlACLKNQD8XHtAA+UJgFcEGCKgBcFKjXqNWHCVJn8xk6aijyq1Wg2bsobYKgCWTAOZaL1u-oWUmEAG4yA3GTIsIAGMsNGgAM3EmQOArOCYoKzYAGQg2NnwAC2QmAkIACmRZagAaKAwi+CQ0TBxcgEoijDg4HGzfRJS0zOy89wB3QUY8utL+wYhhuu9KAHoZqDgAazIO1PSspl6IAe4hkfGAOiY4PsnpqDmFxdLdiBn1XShAxBRrNjioZCwsE4gWFeSa26mwAjAAmUpggDMU1m8yWAM66x6AHIAIIo0oogBCKNhF3hy1WXQ2eXBWNxUzIl0MtKoAD9GVA0ahbJJmMAFmEoKBIFAUY4bLYUQk1HBOcg0lZbEwatBgHAoK9kAgIIxUNT5nTtVQ4NzedAUQ8ZCiDmQgA)

由于它的编写方式，`Comparable` 在联合类型上分发。这是可取的吗？显然不是：

```ts
let dateOrStr = Math.random() < 0.5 ? new Date() : 'A'
//  ^? let dateOrStr: Date | string
isLessThan(dateOrStr, 'B') // ok, but should be an error
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwg9gWzAQwE7IEYBsIB4AqAfFALwBQUlU+UEAHsBAHYAmAzlACLKNQD8XHtAA+UJgFcEGCKgBcFKjXqNWHCVJn8xk6aijyq1Wg2bsobYKgCWTAOZaL1u-oWUmEAG4yA3GTIsIAGMsNGgAM3EmQOArOCYoKzYAGQg2NnwAC2QmAkIACmRZagAaKAwi+CQ0TBxcgEoijDg4HGzfHGAoFiEAeVQAZUtSKABZHgyAOnRWRDy6qFwoAAYJgFYtdwB3QUY5-SgAcgBBA98AejPKAD0BDq7egcsi7l5RRxtbMkSUtMzsvO6jD6g1QpQOACEDvMoBcoHAANalDDiTpsDJwcRYFhlaDZWioVBwVBkIA)

第二个参数实际上应该是两种可能性的交集，而不是并集。而 `(Date | number) & string` 是 `never`，所以这个调用根本不应该被允许。

我们如何防止分发呢？联合类型只有在条件是裸类型（`T extends ...`）时才会在条件类型上分发。所以为了防止分发，我们需要稍微复杂化表达式。标准做法是将 `T` 包装在单元素元组类型 `[T]` 中：

```ts
type Comparable<T> = [T] extends [Date]
  ? Date | number
  : [T] extends [number]
  ? number
  : [T] extends [string]
  ? string
  : never
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwg9gWzAQwE7IEYBsIB4AqAfFALwBQUlUA2vgLpQQAewEAdgCYDONAIsqwYB+KP1ZQAPlDYBXBBgioAXBSq0GzVpx7VZ8xcOlyFqKCqo16jFu240uwVAEs2Ac0MPnbs6spsIAG6KANxkQA)

类型 `[A]` 可以赋值给 `[B]` 当且仅当 `A` 可以赋值给 `B`。所以从表面上看，这个改变看起来不应该影响 `Comparable` 的行为。但由于 `[T]` 不是裸类型，联合类型不再在 `Comparable` 上分发，我们得到了期望的错误，同时不会破坏其他有效的调用：

```ts
isLessThan(new Date(), new Date()) // ok
isLessThan(new Date(), Date.now()) // ok, Date/number comparison allowed
isLessThan(12, 23) // ok
isLessThan('A', 'B') // ok
isLessThan(12, 'B')
//             ~~~ Argument of type 'string' is not assignable to parameter
//                 of type 'number'.
isLessThan(dateOrStr, 'B')
//                    ~~~ Argument of type 'string' is not assignable to
//                        parameter of type 'never'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwg9gWzAQwE7IEYBsIB4AqAfFALwBQUlUA2vgLpQQAewEAdgCYDONAIsqwYB+KP1ZQAPlDYBXBBgioAXBSq0GzVpx7VZ8xcOlyFqKCqo16jFu240uwVAEs2Ac0MPnbs6spsIAG6KANxkHBAAxlho0ABmMmwRwE5wbFBOXAAyEFxc+AAWyGwEhAAUyEpQ+AA0UBiV8EhomDglAJSVGHBwOEWh4VExUDjAUBwCEADyqADKjpVi0FKeLq6hGdm5BUWl-gDuohOlbbX7h6zHbcGUAPQ3UHAA1mQbOXmFbLsQB4vHtYsAOjYcD2l2uUDuD0e-wmNz0JigEUQKGcXFSUGQWCwIIgHBeWTe20+AEYAEy1UkAZiut3uT3xm3eOwA5ABBZm1ZkAIWZNIhdOery2H1KZM5PKuZEhFhlVAAfgqoKzUK45OxRnBYlBQJAoMyVm5mekeMDRshck5XGwWtBgHAoCjkAgIKxUFL7rLPVRNdrwNBmfDFMyAQzCSLxqxpnNUOLeaFpV7E1AFXKlSq1WwNVqdf6Da4jRlpHAzRarTbtXB3Unq1RHc7XQ9s369f4gqhg2QgA)

有时情况是相反的，你有一个不分发的条件类型，但你希望它分发。这通常是由于泛型类型的实现方式而产生的意外后果。

为了看看这是如何发生的，让我们实现一个泛型类型 `NTuple<T, N>`，它产生一个包含 N 个元素的元组，所有元素都是类型 T。这比我们之前看到的类型复杂一些，但我们会逐步解释。这是使用累加器的一种方法：

```ts
type NTuple<T, N extends number> = NTupleHelp<T, N, []>

type NTupleHelp<T, N extends number, Acc extends T[]> = Acc['length'] extends N
  ? Acc
  : NTupleHelp<T, N, [T, ...Acc]>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAcgKgVzAGwgHjgGllCAPYCAOwBMBnKIhAWwCMIAnAPigF5ZEUIAJCZMDNhjYA2gF0mAbgBQ00JA5JUvfoJz5CpClTqNsAQQDGh3AWLkoccS1bSoUI4ZEByVEQDmwABbOxpzRYwdlAA-A7GwQBcilwqAliwogkAdKmOEjJAA)

这里的技巧是不断向元组类型添加元素，直到其 `length` 属性匹配我们想要的数字。记住，这个查找是在类型系统中进行的。在数组类型上查找 `'length'` 会产生 `number`，但对于元组类型，它会产生更精确的数字字面量类型，如 `0`、`1`、`2` 等。

如果 N 是单个数字，这个泛型类型按我们期望的方式工作来构造 N 元组：

```ts
type PairOfStrings = NTuple<string, 2>
//   ^? type PairOfStrings = [string, string]
type TripleOfNumbers = NTuple<number, 3>
//   ^? type TripleOfNumbers = [number, number, number]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAcgKgVzAGwgHjgGllCAPYCAOwBMBnKIhAWwCMIAnAPigF5ZEUIAJCZMDNhjYA2gF0mAbgBQ00JA5JUvfoJz5CpClTqNsAQQDGh3AWLkoccS1bSoUI4ZEByVEQDmwABbOxpzRYwdlAA-A7GwQBcilwqAliwogkAdKmOEjLy0AAKAIYAlgwA8gBmAMrADPkeFOzwSuhkldXu2ABMUtIA9F32UAB6YVlQeYWlFVU1bFAiTZOtUHMtYnLg0HBVXKUwNPQMtTGoaDp72ADMnT19g1DDG-lbJTu6+9MiJ3qUu58fDCtAA)

但如果 N 是联合类型，它就不按我们期望的方式工作：

```ts
type PairOrTriple = NTuple<bigint, 2 | 3>
//   ^? type PairOrTriple = [bigint, bigint]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAcgKgVzAGwgHjgGllCAPYCAOwBMBnKIhAWwCMIAnAPigF5ZEUIAJCZMDNhjYA2gF0mAbgBQ00JA5JUvfoJz5CpClTqNsAQQDGh3AWLkoccS1bSoUI4ZEByVEQDmwABbOxpzRYwdlAA-A7GwQBcilwqAliwogkAdKmOEjLy0AAKAIYAlgwA8gxwDPlcbDGoaLT57vlEwNgATFAAPlAAzFLSAPR99lAAemFZUHmFJWUVqFUidQ1N2IuNwGLSQA)

这应该是 `[bigint, bigint] | [bigint, bigint, bigint]`。直接问题是 `Acc['length'] extends 2 | 3` 在累加器变成一对时就为真。但更深层的问题是我们的条件类型不在联合类型上分发。我们希望它分发。为什么不是，我们如何修复它？

问题是条件是 `Acc['length'] extends N`，它不以分发所需的裸 `"N extends..."` 开头。所以最简单的修复是添加一个额外的条件类型，看起来像这样：

```ts
type NTuple<T, N extends number> = N extends number
  ? NTupleHelp<T, N, []>
  : never
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAcgKgVzAGwgCQssAeOAaWKCAD2AgDsATAZynIQFsAjCAJwIEEBjLo0imlDgBtALoA+KAF4AUFCjcuwgOSpyAc2AALZaL5kqtGHKgB+BTxMAuWIhTpMOfLALDnAOk+KJAbhmhIWyRUXAIYfQFaemY2SVl5eXCSA0FollYTeXN4YIcsUJcoMXFMqBtyCAA3Nj8gA)

由于 N 被约束为扩展 `number`，这个条件总是评估为真（如果你愿意，你可以让它变成 `N extends any` 或 `N extends unknown`）。它的唯一目的是以正确的形式添加条件类型以进行分发。它有效！

```ts
type PairOrTriple = NTuple<bigint, 2 | 3>
//   ^? type PairOrTriple = [bigint, bigint] | [bigint, bigint, bigint]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAcgKgVzAGwgCQssAeOAaWKCAD2AgDsATAZynIQFsAjCAJwIEEBjLo0imlDgBtALoA+KAF4AUFCjcuwgOSpyAc2AALZaL5kqtGHKgB+BTxMAuWIhTpMOfLALDnAOk+KJAbhmhIWyRUXAIYfQFaemY2SVl5eXCSA0FollYTeXN4YIcsUJcoMXFMqBtyCAA3Nj8A6AAFAEMAS1YAeVY4Vmb7aSD7bCZm9WbyYAIAJigAHygAZnE-AHolhIA9czqoJtaOrp7UPuEhkbGCE9HgPVnj4cvzu7OoC7HRGSA)

这是因为 `NTupleHelp` 用 `N = 2` 和 `N = 3` 实例化，结果被联合在一起。使用累加器是递归泛型类型的常见技术，因为它可以提高它们的性能。Item 57 将解释如何做到这一点。

条件类型在分发到 `boolean` 和 `never` 类型时还有两个其他令人惊讶的行为，你应该注意。

首先是 `boolean`。让我们定义一个泛型类型，如果它的参数是 `true`，它就产生一个庆祝消息：

```ts
type CelebrateIfTrue<V> = V extends true ? 'Huzzah!' : never

type Party = CelebrateIfTrue<true>
//   ^? type Party = "Huzzah!"
type NoParty = CelebrateIfTrue<false>
//   ^? type NoParty = never
type SurpriseParty = CelebrateIfTrue<boolean>
//   ^? type SurpriseParty = "Huzzah!"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwhA2EBGAnAhsCBJAZgFRQFcIAeANQD4oBeKMqCAD0wDsATAZymCOgH4oAcgAShAF5i0ACwCEgqAC4oLCADcIKANwAobaEhQACmhSgasBMnSZcBYiR7EKOgPQuoHgHoD90Y6ZBzACJRCWkZIL1waAA5AHt-M1o4RFQMbHxeEhw0eA4IZ203DyhvbmioeMTA2hV1FCiDAGVCFDAUAEt86vMUq3TbLKQ4uMQ0FkLirx8KlrbO7pMkqBDxSVlIoA)

令人惊讶的是，最后一个实例化解析为 `"Huzzah!"`，因为你不会期望 `boolean extends true` 为真。发生的事情有点更微妙。在内部，TypeScript 将 `boolean` 视为联合类型：

```ts
type boolean = true | false
```

因为 `boolean` 是联合类型，它可以在条件类型上分发。所以稍微展开一下，评估看起来像这样：

```ts
type SurpriseParty
= CelebrateIfTrue<boolean>
= CelebrateIfTrue<true | false>
= CelebrateIfTrue<true> | CelebrateIfTrue<false>
= "Huzzah!" | never
= "Huzzah!"
```

在这种情况下，这可能不是你想要的。和之前一样，你可以通过将条件包装在单元素元组中来防止分发：

```ts
type CelebrateIfTrue<V> = [V] extends [true] ? 'Huzzah!' : never

type SurpriseParty = CelebrateIfTrue<boolean>
//   ^? type SurpriseParty = never
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwhA2EBGAnAhsCBJAZgFRQFcIAeANQD4oBeKAbTIF0oIAPTAOwBMBne4IhGYB+KAHIAEoQBe0tAAsAhGKgAuKBwgA3CCgDcAKAOhIUAMqEUYFAEseEAApoUoGrATJ0mXAWIkkAPYBiGgcFIYA9BFQMQB6oibQFla29k4uIG6aOigGQA)

另一个惊喜来自 `never` 类型。看这个定义，你会期望 `AllowIn<T>` 总是评估为 `"Yes"`、`"No"` 或可能是 `"Yes" | "No"`：

```ts
type AllowIn<T> = T extends { password: 'open-sesame' } ? 'Yes' : 'No'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAggNnA9gdwJIDsA8AVAfFAXimyggA9gJ0ATAZygG8wBDW25RAJ2oC4oAiRJHQBaWhFrMAthH4BfKAH4BATQn8offgDlE-ANwAoIA)

但如果 T 是 `never`，还有另一种可能性：

```ts
type N = AllowIn<never>
//   ^? type N = never
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAggNnA9gdwJIDsA8AVAfFAXimyggA9gJ0ATAZygG8wBDW25RAJ2oC4oAiRJHQBaWhFrMAthH4BfKAH4BATQn8offgDlE-ANwAoUJCjbCsBCgyZ0EAG4ROuIwHpXUTwD1lJ6OaI7R05DIA)

为什么这评估为 `never`，如果条件的两边都不是 `never`？再次，这都是关于联合类型上的分发。TypeScript 将 `never` 类型视为空联合，如果没有什么可以分发，你就得到空回来。如果你用 `T|never`（与 T 相同）替换 T 并看看会发生什么，这可能更有意义：

```ts
AllowIn<T>
= AllowIn<T | never>
= AllowIn<T> | AllowIn<never>
= AllowIn<T> | never
= AllowIn<T>
```

当然 `T|never` 应该与 T 相同对待。当分发适用时，这意味着 `F<never>` 必须是 `never`，无论你如何定义 F。和之前一样，如果你不想要这个，一个解决方案是将你的条件包装在单元素元组中。

条件类型在联合类型上分发的方式是它们最强大和最有用的能力之一。这通常是，但并非总是，你想要的行为。当你编写泛型类型时，考虑你是否希望它在联合类型上分发，并注意看似无害的重构如何启用或禁用分发。

## 要点回顾

- 考虑是否希望联合类型在你的条件类型上分发。
- 了解如何通过添加条件或将条件包装在单元素元组中来启用或禁用分发。
- 注意 `boolean` 和 `never` 类型在分发到联合类型时的意外行为。

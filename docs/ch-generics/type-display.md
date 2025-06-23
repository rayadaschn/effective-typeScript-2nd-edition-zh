# Item 56: Pay Attention to How Types Display

## 要点

- There are many valid ways to display the same type. Some are clearer than others.
- TypeScript gives you some tools to control how types display, notably the `Resolve` generic. Make judicious use of this to clarify type display and hide implementation details.
- Consider handling important special cases of generic types to improve type display.
- Write tests for your generic types and their display to avoid regressions.
- 展示同一类型的方式有很多种，某些方式比其他方式更清晰。
- TypeScript 提供了一些控制类型显示的工具，特别是 `Resolve` 泛型。要谨慎使用它来澄清类型显示并隐藏实现细节。
- 考虑处理泛型类型的重要特殊情况，以改善类型显示。
- 为你的泛型类型及其显示编写测试，以避免回归错误。

## 正文

通常，我们关心的是类型是什么，以及哪些值可以赋给它们。但当你在使用 TypeScript 库时，类型的显示方式会极大地影响你的使用体验。这意味着，作为库的作者，你需要关注你的类型是如何显示的。

对于任何类型，都有多种有效的显示方式。例如，联合类型通常会按照你列出的顺序显示其成员：

```ts
type T123 = '1' | '2' | '3'
//   ^? type T123 = "1" | "2" | "3"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKgjAJgMxQLxQORw1APphHfDJDAbgCgB6KqOgPQH4pRJZEV0AiOLvKLgj74uSLhSA)

但如果你之前引入了一个有重叠的联合类型，显示结果可能会不同：

```ts
type T21 = '2' | '1'
//   ^? type T21 = "2" | "1"

type T123 = '1' | '2' | '3'
//   ^? type T123 = "2" | "1" | "3"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKgTARigXigcjmqAfdC0DcAUAPQlQUB6A-FKJLIilAERws6sItFH3QwEcAMzM0+Thiy40wwqXJVa-WENGo2HXC26cWwnkA)

到底是 1, 2, 3 还是 2, 1, 3？它们其实是同一个类型的两种等价表示。在这个例子中，两者的可读性差不多，但有时不同表示方式的可读性差异会很大。

来看一个不太理想的类型显示例子。假设我们实现一个 PartiallyPartial 泛型，让对象的部分属性变为可选，其他属性保持必选。实现如下：

```ts
type PartiallyPartial<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBACghgJ2ASzgGzSeTVoDwAqANFANJQQAewEAdgCYDOUA1hCAPYBmUBAfFAC8AKCixEKdHhjIAxi0IlSfAQDIoAeQC2yYIrJ8A3MKA)

实际使用时可能是这样：

```ts
interface BlogComment {
  commentId: number
  title: string
  content: string
}

type PartComment = PartiallyPartial<BlogComment, 'title'>
//   ^? type PartComment =
//          Partial<Pick<BlogComment, "title">> &
//          Omit<BlogComment, "title">
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBACghgJ2ASzgGzSeTVoDwAqANFANJQQAewEAdgCYDOUA1hCAPYBmUBAfFAC8AKCixEKdHhjIAxi0IlSfAQDIoAeQC2yYIrJ8A3MOS0aCLnFnQAQmg4BzAMIctWusCgBvUVFmv3MwBJegAuKFoAVy0AIwgEYzEUYDQIcMZgBFMHRL8OMw90zOzjAF9hYVBIcSQXNw8hGskMLAlcPDtHOsDgEgByZNS+o2EAelGxKAA9AH4oKuhsYG6GkXHJjcml9pl5DvtnAI8SACJBiBOVKFUxic2N7V19rqOzU-PL4SA)

这个泛型类型实现是正确的，显示结果也是完全有效的。但对于查看 PartComment 的用户来说，这种显示方式还有提升空间：`title` 的类型是什么？它可以为 `null` 吗？`Omit` 后面还有哪些字段？整体看起来更像是实现细节，而不是最终类型的样子。

我们希望 TypeScript 能多做一步，把这些泛型类型"解析"出来。这里有个常用技巧可以做到这一点：

```ts
type Resolve<T> = T extends Function ? T : { [K in keyof T]: T[K] }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAShDOB7ANgNwgHgCoD4oF4osoIAPYCAOwBN4oAxAV0oGNgBLRSqAfiKgBcUAN4BtANJR23ANYQQiAGZEAukKwSVAXwDcAKCA)

稍后我们会讲讲它的原理。先来看下如何使用它：

```ts
type PartiallyPartial<T, K extends keyof T> = Resolve<
  Partial<Pick<T, K>> & Omit<T, K>
>

type PartComment = PartiallyPartial<BlogComment, 'title'>
//   ^? type PartComment = {
//          title?: string | undefined;
//          commentId: number;
//          content: string;
//      }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&exactOptionalTypes=true#code/C4TwDgpgBAShDOB7ANgNwgHgCoD4oF4osoIAPYCAOwBN4oAxAV0oGNgBLRSqAfiKgBcUAN4BtANJR23ANYQQiAGZEAukKwSVAXwDcAKGkUATooCGLaACFkiAOYBhRAFsnVYCL1QoLZ68rAASWohSkYnACMII30vDmBkCCF4YCNpWxjvLgp-JJS0-S09UEgoAAVTIw5TZGQQcsr2auwAGihJMmzaKDkFZVwCT1gEFHQMeqrkMfYWGRa2nDwAMigAeSd2YDnxBf0i8Ghxxxc3AjKKidrxxsnrOyO-YFaAcjiEp5x9AHpPrygAPT4xQO53uJ0Iwj031+0N+rwgPFyqUotigAB8oMxqBBFNIINQvj8YdCfMd-EEQmFItFIYSiV4fP43Ij8jSiYUgA)

通过用 Resolve 包裹泛型类型，我们神奇地让 TypeScript 展开并显示了所有属性。现在这个类型就清晰多了。更棒的是，所有实现细节都消失了。类型的使用者无需关心它是用 Partial、Pick 还是 Omit 实现的。

那么 Resolve 是如何工作的？如果忽略条件类型，剩下的表达式看起来像是对象类型的恒等式：

```ts
type ObjIdentity<T> = { [K in keyof T]: T[K] }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&exactOptionalTypes=true#code/C4TwDgpgBAShDOB7ANgNwgHgCoD4oF4osoIAPYCAOwBN4oAxAV0oGNgBLRSqAfiKgBcUAN4BtANJR23ANYQQiAGZEAukKwSVAXwDcAKGkUATooCGLaACFkiAOYBhRAFsnVYCL1QoLZ68rAASWohSkYnACMII30vDmBkCCF4YCNpWxjvLgp-JJS0-S09UEgoAHlwgCsgt3ZQbDxCMUlpKDkFZSw1Ik1dPSA)

实际上，这确实能"解析"一些类型。因为它是同态映射类型（见第 15 条），所以原始类型会原样通过：

```ts
type S = ObjIdentity<string>
//   ^? type S = string
type N = ObjIdentity<number>
//   ^? type N = number
type U = ObjIdentity<'A' | 'B' | 'C'>
//   ^? type U = "A" | "B" | "C"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&exactOptionalTypes=true#code/C4TwDgpgBAShDOB7ANgNwgHgCoD4oF4osoIAPYCAOwBN4oAxAV0oGNgBLRSqAfiKgBcUAN4BtANJR23ANYQQiAGZEAukKwSVAXwDcAKGkUATooCGLaACFkiAOYBhRAFsnVYCL1QoLZ68rAASWohSkYnACMII30vDmBkCCF4YCNpWxjvLgp-JJS0-S09UEgoAHlwgCsgt3ZQbDxCMUlpKDkFZSw1Ik1dIvBoAGUCMsrq-1qQDGTUylscfQB6Ba8oAD0+YsHh6bS+koA5YfKq6hq60Iio+b0llfWoTahDwgvIoz3oAFUj0dPxuoA5ABBAFQAA+UABllBEIB9gB11uXnuj2+hAARED0eCoOjLNiIej7Oi9EA)

但对于函数类型，它并不是恒等式，这也是我们需要在 `Resolve` 里加条件类型保护的原因：

```ts
type F = ObjIdentity<(a: number) => boolean>
//   ^? type F = {}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&exactOptionalTypes=true#code/C4TwDgpgBAShDOB7ANgNwgHgCoD4oF4osoIAPYCAOwBN4oAxAV0oGNgBLRSqAfiKgBcUAN4BtANJR23ANYQQiAGZEAukKwSVAXwDcAKGkUATooCGLaACFkiAOYBhRAFsnVYCL1QoLZ68rAASWohSkYnACMII30vDmBkCCF4YCNpWxjvLgp-JJS0-S09UEgoAHlwgCsgt3ZQbDxCMUlpKDkFZSw1Ik1dIvBoegIyyur-WpAMAApTELDIowBKAjxwxBQIU0ocfQB6Ha8oAD0+YoGh4UKgA)

这个辅助类型在大量使用泛型类型的 TypeScript 代码中非常常见。Resolve 是我喜欢的命名方式，你也可能见到它被叫做 Simplify、NOP、NOOP 或 Merge Insertions。

你可以实现一个 DeepResolve，递归地解析对象类型，但通常不建议这样做，因为 Resolve 对类类型会过于激进：

```ts
type D = Resolve<Date>
//   ^? type D = {
//        toLocaleString: {
//            (locales?: Intl.LocalesArgument,
//             options?: Intl.DateTimeFormatOptions | undefined): string;
//            (): string;
//            (locales?: string | string[] | undefined,
//             options?: Intl.DateTimeFormatOptions | undefined): string;
//        };
//        ... 42 more ...;
//        [Symbol.toPrimitive]: {
//            ...;
//        };
//      }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&exactOptionalTypes=true#code/C4TwDgpgBAShDOB7ANgNwgHgCoD4oF4osoIAPYCAOwBN4oAxAV0oGNgBLRSqAfiKgBcUAN4BtANJR23ANYQQiAGZEAukKwSVAXwDcAKGkUATooCGLaACFkiAOYBhRAFsnVYCL1QoLZ68rAASWohSkYnACMII30vDmBkCCF4YCNpWxjvLgp-JJS0-S09UEgoAHlwgCsgt3ZQbDxCMUlpKDkFZSw1Ik1dIvBoABECWAQUdAwB0wocfQB6Wa8oAD0+YsHh4T15xZ2oYEQAGUQWUwSAZTzKWyFN7d37gAobE4T4HiEA-2QAOiOXhAAgkZbGE3AAaLYLe73RBgDhcN4fL7fSYULDsVz0RBGJxTUpwziUOgAHygzGoEEU0gg1AAlLlUlc5lDoYsHvSoMlGelIaydk9jqcEO9OZdbFBSVy0qIVBKyTRKdTqBC7nyvLD4USRZ94iiphB0ZjsbjgPjNST5RSqZQaRypUzedDeqrdt83VAACwAJigTmx0Dd32ZrNEZxAERQ332AAVUk5aux0F1biy+YHg06MztCkA)

这里类型被内联反而适得其反。更好的做法是让这个类型直接显示为 Date。

你也可以用 `Resolve` 来内联 `keyof` 表达式，如果你觉得这样更清晰：

```ts
interface Color {
  r: number
  g: number
  b: number
  a: number
}
type Chan = keyof Color
//   ^? type Chan = keyof Color
type ChanInline = Resolve<keyof Color>
//   ^? type ChanInline = "r" | "g" | "b" | "a"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&exactOptionalTypes=true#code/C4TwDgpgBAShDOB7ANgNwgHgCoD4oF4osoIAPYCAOwBN4oAxAV0oGNgBLRSqAfiKgBcUAN4BtANJR23ANYQQiAGZEAukKwSVAXwDcAKGkUATooCGLaACFkiAOYBhRAFsnVYCL1QoLZ68rAASWohSkYnACMII30vDmBkCCF4YCNpWxjvLgp-JJS0-S09UEgoAHlwgCsgt3ZQbDxCMUlpKDkFZSw1Ik1dA38oswsoRxsjESgjELDI6KhbKYionShwhZnl0zWoqF7i6HsAC1NuQjalYZREaL0AehuvKAA9Pj3ho5PW+XORq6LwffeAUoyGk0EIcCQaEwZ2UPyMOH0dwezygr0OxyBIMoYKgACIjLioAAfPG2Qkk3Hhcl40y4vRAA)

有时你会希望某些特殊情况的类型显示得更简洁。对于 PartiallyPartial，当类型参数 `K` 为 `never`（即没有字段变为可选）时就是这样。用当前定义处理这个情况的结果如下：

```ts
type FullComment = PartiallyPartial<BlogComment, never>
//   ^? type FullComment = {
//             title: string;
//             commentId: number;
//             content: string;
//           }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&exactOptionalTypes=true#code/C4TwDgpgBAShDOB7ANgNwgHgCoD4oF4osoIAPYCAOwBN4oAxAV0oGNgBLRSqAfiKgBcUAN4BtANJR23ANYQQiAGZEAukKwSVAXwDcAKGkUATooCGLaACFkiAOYBhRAFsnVYCL1QoLZ68rAASWohSkYnACMII30vDmBkCCF4YCNpWxjvLgp-JJS0-S09UEgoAHlwgCsgt3ZQbDxCMUlpKDkFZSw1Ik1dIvBoAAVTIw5TZGQQIZH2MewAGihJMmzaVvklIgbPWAQUdAwp0eQD9hYZecWcPAAyMqdai-Er-T6Sw8cXNwIoQ5nxyeGRww1jsHz8wAWAHI4glITh9AB6BFeKAAPT4xUGgLBX0aeiRKMJKJhEB4uVSlFsUAAPlBmNQIIppBBqIjkUTCT5Pv4giEwpFovj2RyvD5-G5yfkhRzCpiGIxxjj-N9fmMJqrjiCHL43AtKBB0EZ4dKvOioHKmIqdcq8QSRUSSZLKWz7USueDeVBQhEoi7XSixdlgE70ibXYUgA)

这个结果是正确的，也是有效的显示方式。但其实有更简洁的表示：FullComment 就是 BlogComment。我们可以通过判断这种情况让类型更简洁：

```ts
type PartiallyPartial<T extends object, K extends keyof T> = [K] extends [never]
  ? T // special case
  : T extends unknown // extra conditional to preserve distribution over unions
  ? Resolve<Partial<Pick<T, K>> & Omit<T, K>>
  : never

type FullComment = PartiallyPartial<BlogComment, never>
//   ^? type FullComment = BlogComment
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAShDOB7ANgNwgHgCoD4oF4osoIAPYCAOwBN4oAxAV0oGNgBLRSqAfiKgBcUAN4BtANJR23ANYQQiAGZEAukKwSVAXwDcAKGkUATooCGLaACFkiAOYBhRAFsnVYCL1QoLZ68rAASWohSkYnACMII30vDmBkCCF4YCNpWxjvLgp-JJS0-S09UEgoAAVTIw5TZGQQcsr2auwScipaKERwgCsINgAaKEkybPa5BWVcAk8oTRaRulFKCHQjFWm+YigAei2oeEgWRuRvU3gIafU5trpmGUpEAHdubd3ho1NMmnYOLmqoYEQUDARgQUXQUGo7GSqXCjB+3EQKygzE4lHg61gCBQ6Aw9SqyFx7BYMmwA3EODwADIoAB5JzfUmDCkXKBLFb6IrgaBMGqOFxuAhlCr42p4o4Yax2Pl+YADNlRHD6HZeKAAPT4xW5jF5vgFhElDl1-j0QA)

为什么用元组包裹条件（`[K]` 而不是 `K`），以及为什么加上 `T extends unknown`，可以参考第 53 条的解释。加上这个特殊分支不会改变 PartiallyPartial 的行为，只是让它在某些情况下显示得更好看。

你可能还会见到其他调整类型显示的技巧，比如：

- 用 `Exclude<keyof T, never>` 内联 `keyof` 表达式
- 用 `unknown & T` 或 `{} & T` 内联对象类型
  这些都可以用 `Resolve` 替代，效果一样但更稳健。

当你调整类型的显示方式时，要确保不会为了某种情况的可读性而牺牲了其他情况。由于这些操作很微妙且不会影响赋值兼容性，回归问题很容易被忽略。TypeScript 的新版本也可能影响类型的显示方式。因此，建立类型显示的测试体系非常重要。第 55 条会介绍如何做。

# Item 77: 理解类型检查和单元测试之间的关系

你有时会听到这样的说法：采用 TypeScript 可以让你删除大部分单元测试。或者，反过来论证，既然你仍然需要编写单元测试，那么向代码中添加类型就没有意义。

这两种都是极端的立场，但在这些夸大的说法背后隐藏着一个有趣的区分。单元测试和类型检查都是程序验证的形式。那么两者之间的关系是什么？什么时候应该编写测试，什么时候应该依赖类型？

让我们考虑一个将两个数字相加的函数：

```ts
/** 返回两个数字的和。 */
function add(a, b) {
  // 实现省略
}
```

如果这看起来太简单而不需要测试，那么快速看一下 IEEE 754 浮点数规范。有很多边界情况！以下是单元测试可能的样子：

```ts
test('add', () => {
  expect(add(0, 0)).toEqual(0)
  expect(add(123, 456)).toEqual(579)
  expect(add(-100, 90)).toEqual(-10)
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoBTIFyLCAWwCMBTAJwBpEjd9jyBKWw0sxAbwChFEySoQZJMkQBqagG5OAX05QSAZygYA5GlQqqGBogC8APg7dEJAB4AHEtCzoMABip2GDAHRQ4AUQCOIZABt7BikeM0trdQwARgAmAGYqABYAVgA2ZzdPH38MJIB2AE4g41CrZQiAWki7B0R8p1d3b18AyqcpaSKgA)

假设这些测试通过，我们对 `add` 函数正确性的信心应该有多大？有大量的可能输入。JavaScript 中的数字是 64 位浮点数，所以每个参数有 2^64 个可能的值，总共有 2^128 个可能的输入。这是一个巨大的数字：它以 3 开头，后面跟着 38 个数字。我们的三个测试用例只覆盖了可能性的极小部分。

这些空白为 bug 的潜入创造了空间。例如，如果这是实现会怎样？

```ts
function add(a, b) {
  if (isNaN(a) || isNaN(b)) {
    return 'Not a number!'
  }
  return (a | 0) + (b | 0)
}
```

这通过了我们的单元测试。但是对 NaN 值的行为是令人惊讶的，可能是错误的（当然应该在文档中说明！）。按位操作的效果是在相加之前将输入向零舍入。大概，函数也应该能相加非整数。除非我们专门为这些情况编写单元测试，否则我们无法捕获这些 bug。

现在让我们看看添加类型会发生什么：

```ts
function add(a: number, b: number): number {
  if (isNaN(a) || isNaN(b)) {
    return 'Not a number!'
    // ~~~ Type 'string' is not assignable to type 'number'.
  }
  return (a | 0) + (b | 0)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoBTIFyLCAWwCMBTAJwBpEjd9jyBKWw0sxAbwChFEZhEMMAM4A5ZCKwNEAH2m9R4jEQZSuPHmRJQQZJAHIRcKCjwtyAQj0BubuoD0dxAD8XiACoBPAA4lEeoVBkMGAA5nryeEYoQkIwIWDIRAA2vlBwiFDevnp0rHoAdLYAvraa2roCyNIADFIA1AJENQw2JUA)

多亏了我们的类型注解，TypeScript 能够发现其中一个 bug。它可以防止整类的实现错误：返回错误的类型或对输入执行无效操作。你可以编写一个单元测试来检查 `add` 返回一个数字，但你永远无法为所有 2^128 个可能的输入测试这个。TypeScript 可以。

当然，有很多错误是类型检查器无法捕获的。它没有捕获小数与整数的问题。事实上，这里有另一个通过类型检查器但明显错误的实现：

```ts
function add(a: number, b: number): number {
  return a - b // oops!
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoBTIFyLCAWwCMBTAJwBpEjd9jyBKWw0sxAbwChFEySoQZJMkQBaagG5EAemmI4cAA4BnAIScAvpyA)

任何 `b` 非零的单元测试都会捕获这个 bug，但类型检查器对此是盲目的。

单元测试和类型检查是互补的过程。单元测试证明你的代码至少在某种情况下行为正确。换句话说，它们提供了正确性的下界。类型检查器可以证明你没有犯特定类的错误，比如返回错误的类型。它提供了错误性的上界。你可以将这两个过程想象为从两端削减 bug，直到你满意你的代码工作得足够好。

无论文档或类型说什么，在 JavaScript 中，函数可以用任何类型的参数调用。除了相加数字，`add` 函数的简单版本（`return a+b`）有以下行为：

```
> add(null, null)
0
> add(null, 12)
12
> add(undefined, null)
NaN
> add('ab', 'cd')
'abcd'
```

你应该测试这些行为吗？如果你这样做，TypeScript 会不高兴：

```ts
test('out-of-domain add', () => {
  expect(add(null, null)).toEqual(0)
  //         ~~~~ Type 'null' is not assignable to parameter of type 'number'.
  expect(add(null, 12)).toEqual(12)
  //         ~~~~ Type 'null' is not assignable to parameter of type 'number'.
  expect(add(undefined, null)).toBe(NaN)
  //         ~~~~~~~~~ Type 'undefined' is not assignable to parameter of ...
  expect(add('ab', 'cd')).toEqual('abcd')
  //         ~~~~ Type 'string' is not assignable to parameter of type 'number'.
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoBTIFyLCAWwCMBTAJwBpEjd9jyBKWw0sxAbwChFEySoQZJMkQBqagG5OAX05QSAZygYA5HBBQAtHGCbUcAshjD0KqhgaIAvAD4O3RCQAeABxLQs6DPgA2Pqr4+DAwAdFBwAKIAjiDIPhgADAxSPAD0qTyZWQB+udmIACoAnm6IKoEqiDAKeHBQKAoKMADmYMhEPiSI4YguyGTIBPzkiDrdJV3lLOQqIQ7Obh5omIFUAIwATMFhkTFxGJvJDulZp3n5xaVTfpXVtfXIjS1tHV09fQND8mxjUBNldFYs3mrncymWGHAqBIwGMJFQARAfm24QAQiQMAA5ZCYo5pDKnTLnYmFf4qKEwuGoW41MB1BpNVrtTrdOC9fqDYY-YCIEJ8kGLcFeFTtMxlCDUlG7WLxEVECUqPGIE6EnjnUlXJRkYzNGn3BnPZlvNkfTnfUY8v5XQEzObSI5AA)

这是有道理的。单元测试是关于演示预期行为的。对于无效输入，没有预期行为可以演示。你应该依赖类型检查器来防止这些无效调用。没有必要编写这些类型的单元测试。

对于具有潜在有害副作用的函数，这有一个重要的警告。想象你有一个更新数据库中用户记录的函数：

```ts
interface User {
  id: string
  name: string
  memberSince: string
}

declare function updateUserById(
  id: string,
  update: Partial<Omit<User, 'id'>> & { id?: never }
): Promise<User>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoBTIFyLCAWwCMBTAJwBpEjd9jyBKWw0sxAbwChFEySoQZJMkQBqagG5OAX04wwUcsGQQSiAKoBnch26IYqXJqhl5Acyk8wyAiSMnzlxLfpkAyvNX3TYCzM6cqCQQADbIfIigkLAIiCAADqjIilrkAEIAngCSmHoG3uYUeglJirgACuGwyCEAPADyBDBQtamUiADkBh0AfD2IAGQcBgD8tCQAbuSyTIjlZHBN2q3aZD1SQA)

`update` 参数上复杂类型的意图是这个函数真的不应该用来改变用户的 ID。（Item 63 解释了"可选 never"技巧。）这样做可能会导致冲突，甚至如果它允许一个用户冒充另一个用户，可能会造成安全问题。但这只在类型级别强制执行。如果你从 JavaScript 调用这个函数，甚至可能使用不受信任的用户输入，那么 `update` 参数完全可能有 `id` 属性。如果函数抛出异常（即拒绝）而不是破坏数据库，会更好。

这是一个值得指定和测试的好行为，即使它被类型禁止。你可以在测试中使用 `@ts-expect-error` 指令来断言它是一个类型错误：

```ts
test('invalid update', () => {
  // @ts-expect-error Can't call updateUserById to update an ID.
  expect(() => updateUserById('123', { id: '234' })).toReject()
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoBTIFyLCAWwCMBTAJwBpEjd9jyBKWw0sxAbwChFEySoQZJMkQBqagG5OAX05QSAZygYA5DDAA3ZABsYqRCAAOqZPJVUMDRAF4AfB26IA9E8QABKAoC0JAB6GSaB8yMjg2AGFkMBUoRAgdbQNjUxIAVQVyACEATwBJfSg4JJN5FCRcgBEAOkc-AOgMSxt7IxK0jLIc-NUARgAmAGZzDj1cFUGAFhVpBgYqwoAlEgArQOUGKRmpIA)

软件质量保证（QA）的主要目标之一是尽早发现问题，此时修复它们的成本很低。了解 bug 的最糟糕方式是让最终用户（或安全研究人员！）在它已经在生产环境中时报告它。更好但仍然昂贵的是在手动 QA 过程中捕获它。更好的是自动化 QA 过程，比如集成测试。单元测试更早更快地捕获 bug。但类型检查是最直接的，在你的编辑器中报告 bug，希望在你在确切的地方犯了错误。

为了尽快捕获 bug，你应该在可能的地方依赖类型检查器。TypeScript 可以捕获许多错误，但有时需要一点帮助。Item 59、61 和 64 都提出了帮助类型检查器捕获新类错误的技术。但当你无法依赖类型检查时，即对于测试行为，单元测试是次佳选择。

如果你的类型本身包含逻辑（第 6 章都是关于这个的），那么你绝对需要为它们编写测试。类型测试是与单元测试不同类型的测试。Item 55 探索了类型测试的迷人世界。

最后，虽然类型和单元测试都会在重构时帮助捕获 bug，但类型也为语言服务提供动力，使编程成为更愉快的体验。正如 Item 6 解释的那样，它们甚至可以为你做重构！

单元测试和类型检查都是程序验证的形式，但它们以不同和互补的方式工作。你通常想要两者。保持它们各自的角色清晰，避免用两者重复相同的检查。

## 要点回顾

- 类型检查和单元测试是演示程序正确性的不同、互补的技术。你需要两者。
- 单元测试演示特定输入的正确行为，而类型检查消除了整类的不正确行为。
- 依赖类型检查器来检查类型。为无法用类型检查的行为编写单元测试。
- 避免测试会导致类型错误的输入，除非有安全或数据损坏的担忧。

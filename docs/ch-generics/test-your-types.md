# Item 55: Write Tests for Your Types

## 要点

- When testing types, be aware of the difference between equality and assignability, particularly for function types.
- For functions that use callbacks, test the inferred types of the callback parameters. Don't forget to test the type of `this` if it's part of your API.
- Avoid writing your own type testing code. Use one of the standard tools instead.
- For code on DefinitelyTyped, use `dtslint`. For your own code, use `vitest`, `expect-type`, or the Type Challenges approach. If you want to test type display, use `eslint-plugin-expect-type`.
- 在测试类型时，要注意等同性与可赋值性之间的区别，尤其是对于函数类型。
- 对于使用回调函数的函数，测试回调参数的推断类型。如果 `this` 是你 API 的一部分，也不要忘记测试 `this` 的类型。
- 避免编写自己的类型测试代码。使用标准工具进行测试。
- 对于 DefinitelyTyped 上的代码，使用 `dtslint`。对于你自己的代码，使用 `vitest`、`expect-type` 或 Type Challenges 方法。如果你想测试类型的显示，使用 `eslint-plugin-expect-type`。

## 正文

将恐惧转化为无聊之前，请一直写测试。
——Phlip（引自 Kent Beck，《测试驱动开发：实用示例》）

你不会写没有测试的代码（希望如此！），同样你也不应该在没有为类型声明编写测试的情况下就写类型声明。但你要如何测试类型呢？如果你正在编写类型声明或 TypeScript 库，测试你的类型是必不可少的，但这项工作却比想象中要复杂得多。

与大多数其他编程语言相比，TypeScript 对类型测试的需求尤其突出，原因有两个：

- TypeScript 允许你在类型中编写大量逻辑。有逻辑的地方就可能有 bug，而有 bug 的地方就应该写测试。
- 对于 JavaScript 库，甚至某种程度上的 TypeScript 代码，你可以将类型与运行时代码分离声明。这意味着两者可能会不同步，因此你需要编写测试来确保它们保持一致。

测试类型主要有两种方式：一种是利用类型系统本身，另一种是借助类型系统之外的工具。两种方式都可行，各有优劣。本文会先介绍一些无效的类型测试方式，然后讨论两种标准方法的优缺点。

假设你为一个工具库（比如流行的 Lodash 库或原生数组）提供的 map 函数写了如下类型声明：

```ts
declare function map<U, V>(array: U[], fn: (u: U) => V): V[]
```

你如何检查这个类型声明能否得到预期的类型结果？（实现的测试应该是分开的。）一种常见的做法是写一个测试文件，直接调用这个函数：

```ts
map(['2017', '2018', '2019'], (v) => Number(v))
```

这种方式可以做一些粗略的错误检查：比如如果你的 map 声明只列出了一个参数，这样的测试就能发现问题。但你是否觉得还缺了点什么？

这种测试风格在运行时代码中的等价物可能是这样：

```js
test('square a number', () => {
  square(1)
  square(2)
})
```

当然，这样可以测试 square 函数不会抛出异常。但它并没有检查返回值，因此并没有真正测试行为。即使 square 的实现是错的，这个测试也能通过。

这种方式在测试类型声明文件时很常见，因为可以直接复制/粘贴已有的单元测试。虽然它确实有一定价值，但如果能真正检查类型会更好！

一种改进方式是将结果赋值给一个带有显式类型的变量：

```ts
const lengths: number[] = map(['john', 'paul'], (name) => name.length)
```

这正是第 18 条建议你移除的那种多余类型声明。但在这里它却起到了关键作用：它能让你确信 map 的类型声明至少在类型层面是合理的。实际上，你会在 DefinitelyTyped 上看到很多类型声明用的就是这种测试方式。

不过，用赋值来测试类型也有一些问题。

一个问题是你必须创建一个很可能不会用到的命名变量。这会增加样板代码，也意味着你需要禁用关于未使用变量的 linter 规则。

通常的变通方法是定义一个辅助函数：

```ts
function assertType<T>(x: T) {}
assertType<number[]>(map(['john', 'paul'], (name) => name.length))
```

第二个问题是我们检查的是类型的可赋值性，而不是等同性。通常这会如你所愿。例如：

```ts
const n = 12
assertType<number>(n) // OK
```

如果你在编辑器中查看 n 的类型，会发现它其实是 12（一个数字字面量类型）。它是 number 的子类型，因此可赋值性检查通过，正如你所期望的。

到目前为止一切顺利。但当你开始检查对象类型时，情况就变得复杂了：

```ts
const beatles = ['john', 'paul', 'george', 'ringo']
assertType<{ name: string }[]>(
  map(beatles, (name) => ({
    name,
    inYellowSubmarine: name === 'ringo',
  }))
) // OK
```

map 返回的是 `{ name: string, inYellowSubmarine: boolean }[]`，它可以赋值给 `{ name: string }[]`，所以类型检查通过。但 `yellow submarin`e 怎么办？在这种情况下，我们其实更希望检查类型的等同性。

对函数类型来说，测试可赋值性也会带来一些意外行为：

```ts
const add = (a: number, b: number) => a + b
assertType<(a: number, b: number) => number>(add) // OK

const double = (x: number) => 2 * x
assertType<(a: number, b: number) => number>(double) // OK!?
```

令人惊讶的是，第二个断言也通过了，尽管这两个函数的参数数量不同。但这正是 TypeScript 可赋值性的工作方式：一个函数类型可以赋值给另一个参数更少的函数类型：

```ts
const g: (x: string) => any = () => 12 // OK
```

这反映了 JavaScript 允许你用比声明更多的参数调用函数的事实。TypeScript 选择模拟这种行为，而不是禁止它，主要是因为回调中这种情况非常普遍。例如 Lodash 的 map 回调最多可以有三个参数：

```ts
map(array, (element, index, array) => {
  /* ... */
})
```

虽然你可以用到全部三个参数，但实际上通常只用一个，有时用两个，像本条目前为止的例子一样。实际上很少会用到全部三个。如果 TypeScript 禁止这种赋值，很多 JavaScript 代码都会报错。

那你该怎么办？你可以拆解函数类型，分别用内置的 Parameters 和 ReturnType 类型测试各部分：

```ts
const double = (x: number) => 2 * x
declare let p: Parameters<typeof double>
assertType<[number, number]>(p)
//                           ~ Argument of type '[number]' is not
//                             assignable to parameter of type [number, number]
declare let r: ReturnType<typeof double>
assertType<number>(r) // OK
```

但如果"this"还不够复杂，还有另一个问题：Lodash 的 map 会为回调设置 this 的值。TypeScript 可以建模这种行为（见第 69 条），所以你的类型声明也应该体现这一点，并且你也应该测试它。那要怎么做？

到目前为止我们对 map 的测试有点"黑盒"风格：我们把数组和函数传给 map，然后测试结果类型，但没有测试中间步骤的细节。我们可以通过完善回调函数，直接验证其参数和 this 的类型来做到这一点：

```ts
const beatles = ['john', 'paul', 'george', 'ringo']
assertType<number[]>(
  map(beatles, function (name, i, array) {
    // ~~~ Argument of type '(name: any, i: any, array: any) => any' is
    //     not assignable to parameter of type '(u: string) => any'
    assertType<string>(name)
    assertType<number>(i)
    assertType<string[]>(array)
    assertType<string[]>(this)
    //                   ~~~~ 'this' implicitly has type 'any'
    return name.length
  })
)
```

这暴露了我们之前 map 声明的几个问题：它的回调只接收一个参数，而且没有为 this 指定类型。注意这里用的是函数表达式而不是箭头函数，这样才能测试 this 的类型。

下面这个声明就能通过这些检查：

```ts
declare function map<U, V>(
  array: U[],
  fn: (this: U[], u: U, i: number, array: U[]) => V
): V[]
```

不过还有一个大问题。下面是一个完整的类型声明文件，即使对 map 做最严格的测试也能通过，但它毫无用处：

```ts
declare module 'your-amazing-module'
```

这会把整个模块的类型都变成 any。你的类型断言都会通过，但你得不到任何类型安全。更糟糕的是，调用这个模块的任何函数都会悄悄产生 any 类型，进而在你的代码中传播，彻底破坏类型安全。即使开启了 noImplicitAny，类型声明文件里依然可能出现 any 类型。

一种解决办法是加一些"负面"测试：即预期会失败的测试。TypeScript 允许你用 @ts-expect-error 注释来实现：

```ts
// @ts-expect-error only takes two parameters
map([1, 2, 3], (x) => x * x, 'third parameter')
```

这颠倒了通常的错误检查流程：现在如果没有类型错误，编译器就会报错。这确实能在一定程度上防止 any 类型，但要注意：@ts-expect-error 是个很粗暴的工具。你无法精确指定期望的错误。例如，前面的代码片段在 any 类型下依然能通过，因为函数参数会有隐式 any 错误：

```ts
declare const map: any
map([1, 2, 3], (x) => x * x, 'third parameter')
//             ~ Parameter 'x' implicitly has an 'any' type.
```

一种变通方法是把代码拆成多行，缩小指令的作用范围：

```ts
map(
  [1, 2, 3],
  (x) => x * x,
  // @ts-expect-error only takes two parameters
  'third parameter'
)
```

不过如果我们能让 assertType 也能检测这些讨厌的 any 类型就更好了。通过一些巧妙的类型别名，你可以检测 any 类型。但与其让测试代码变复杂，不如直接引入一个测试库。

在类型系统内比较流行的选择是 expect-type。你可以单独用它，也可以通过 vitest 测试框架（它自带 expect-type）来用。用法如下：

```ts
import { expectTypeOf } from 'expect-type'

const beatles = ['john', 'paul', 'george', 'ringo']
expectTypeOf(
  map(beatles, function (name, i, array) {
    expectTypeOf(name).toEqualTypeOf<string>()
    expectTypeOf(i).toEqualTypeOf<number>()
    expectTypeOf(array).toEqualTypeOf<string[]>()
    expectTypeOf(this).toEqualTypeOf<string[]>()
    return name.length
  })
).toEqualTypeOf<number[]>()
```

正如你所希望的，它能捕捉 any 类型、不同的函数类型，以及只读属性等细微差别：

```ts
const anyVal: any = 1
expectTypeOf(anyVal).toEqualTypeOf<number>()
//                                 ~~~~~~
//           Type 'number' does not satisfy the constraint 'never'.

const double = (x: number) => 2 * x
expectTypeOf(double).toEqualTypeOf<(a: number, b: number) => number>()
//                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//           Type ... does not satisfy '"Expected: function, Actual: never"'

interface ABReadOnly {
  readonly a: string
  b: number
}
declare let ab: { a: string; b: number }
expectTypeOf(ab).toEqualTypeOf<ABReadOnly>()
//               ~~~~~~~~~~~~~
//           Arguments for the rest parameter 'MISMATCH' were not provided.
expectTypeOf(ab).toEqualTypeOf<{ a: string; b: number }>() // OK
```

用这种方式测试类型有很多优点：

- 不需要额外工具。所有类型测试都通过 tsc 完成，你本来就会用它。
- 类型是结构化测试的，不会被 1|2 和 2|1 这种无意义的差别绊倒。
- TypeScript 的语言服务有助于重构。例如你重命名接口时，类型断言里的名字也会自动更新。
- 如果你用 prettier 之类的格式化工具，类型断言也会和代码一样被格式化。

当然也有一些缺点：

- 类型不匹配时的错误信息（'MISMATCH'）并不会告诉你哪里错了、错在哪。
- 由于它测试的是类型结构，无法检测类型的显示方式。第 56 条会详细介绍，你对此应该有所关注。

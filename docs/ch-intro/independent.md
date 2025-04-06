# 第 3 条：理解代码生成与类型系统是相互独立的

## 要点

- 代码生成和类型系统是分开的，也就是说 TypeScript 的类型不会影响代码运行时的行为。
- 即使程序有类型错误，也还是可能被编译生成代码。
- TypeScript 的类型在运行时是不存在的。如果你想在运行时获取类型信息，得靠你自己想办法“重构”类型，通常可以用标记联合（tagged unions）或属性检查来实现。
- 有些语法，比如 `class`，既会生成一个类型，也会在运行时留下一个可以用的值。
- TypeScript 的类型在编译时会被“擦除”，所以它们不会影响代码在运行时的性能。

## 正文

从整体来看，tsc（TypeScript 编译器）主要做两件事：

- 把新版本的 TypeScript/JavaScript 转换成旧版的 JavaScript，让它能在浏览器或其他运行环境中运行（这个过程叫“转译”）；
- 检查你的代码有没有类型错误。

让人意外的是，这两个功能是完全独立的。换句话说，你写的类型信息不会影响 TypeScript 最终生成的 JavaScript。因为最终执行的是这个 JavaScript，所以类型信息不会影响代码的运行方式。

这带来了一些意想不到的结果，也提醒我们要清楚 TypeScript 到底能帮上什么忙，又有哪些事是它帮不了的。

### 你不能在运行时检查 TypeScript 的类型

有时候，你可能会写出这样的代码：

```ts
interface Square {
  width: number
}
interface Rectangle extends Square {
  height: number
}
type Shape = Square | Rectangle

function calculateArea(shape: Shape) {
  if (shape instanceof Rectangle) {
    //                 ~~~~~~~~~ 'Rectangle' only refers to a type,
    //                           but is being used as a value here
    return shape.height * shape.width
    //           ~~~~~~ Property 'height' does not exist on type 'Shape'
  } else {
    return shape.width * shape.width
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoEcCucooN4BQyyA7sACZgAWAXMiJgLYBG0A3AQL4GiSyIoAShARg4IAOYAbFBAAekEOQDOaLDnxFkVCMAlUwdBi3ZcCYAJ4AHFKipwbyALxrsuZAB9kw0eOkQOAhhMEFFgAHsQZAQ4KQRMKThIAEFcOAAKZXsbOjsHCABKZEJiYBhkTOyUUGUxUIhw8p86-yKS4mQAek6O3r6+gD8h4eHkAHJmvxkx5EipC2RcGGhVMHDkOGRLGwAaLWJu-qPj-uZMMGRgVVZQCWRMZQhyDdVNgDdYzBQdXH3FiDAmCgUSy+QAdDo9AZkAAqZCgmxgsiUKgcXqHE7IEZDZAABSg4RsUEs40h+jAM3I4QgqhA4Qu8iuF0iW2sKDGeRsYy0nGQECkj2Kf1wgOB8KqSIo1Fh4vByOoaOQ3G4QA)

`instanceof` 会在 js 运行时进行检查，但 `Rectangle` 是一个 ts 类型，所以它不会对代码的运行时行为产生任何影响。此前介绍到 TypeScript 的类型是“可擦除”的：编译成 JavaScript 的过程之一，就是把你代码里的所有接口、类型和类型注解都删掉。

你只要看看这段代码编译后的 JavaScript，就能很清楚地看到这一点：

```js
function calculateArea(shape) {
  if (shape instanceof Rectangle) {
    return shape.height * shape.width
  } else {
    return shape.width * shape.width
  }
}
```

可以看到，在 `instanceof` 检查之前，JavaScript 代码里根本没有 `Rectangle` 的踪影，这正是问题所在。要想知道当前处理的 `shape` 到底是什么类型，你需要在运行时“重构”它的类型——也就是说，用一种在编译后后的 JavaScript 中也能起作用的方式来识别类型，而不是只在编译前的 TypeScript 里有效。

有几种方法可以做到这一点，其中一种就是检查对象是否有 height 属性：

```ts
function calculateArea(shape: Shape) {
  if ('height' in shape) {
    return shape.width * shape.height
    //     ^? (parameter) shape: Rectangle
  } else {
    return shape.width * shape.width
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoEcCucooN4BQyyA7sACZgAWAXMiJgLYBG0A3AQL4GiSyIoAShARg4IAOYAbFBAAekEOQDOaLDnxFkVCMAlUwdBi3ZcCYAJ4AHFKipwbyALxrsuZAB9kw0eOkQOGEwQUWAAexBkBDgpBEwpOEgAQVw4AAplexs6OwcIAEpkQmJgGGQ0gHIdPQMK5FBkTLzC4uJkXDBMKEimmwA6MkoqZAAqRqyIPur9MA425AB6BfnkAD0AfnKrHDhGCD5C3og6HzFJGS1OZAgpZU15jq6eiYGKalHxvNehueRubiAA)

这个方法之所以有效，是因为属性检查用的是运行时能访问到的值，但它依然能让类型检查器把 `shape` 的类型缩小为 `Rectangle`。

另一种方式是加一个“标签”，用来显式地在运行时保存类型信息：

```ts
interface Square {
  kind: 'square'
  width: number
}
interface Rectangle {
  kind: 'rectangle'
  height: number
  width: number
}
type Shape = Square | Rectangle

function calculateArea(shape: Shape) {
  if (shape.kind === 'rectangle') {
    return shape.width * shape.height
    //     ^? (parameter) shape: Rectangle
  } else {
    return shape.width * shape.width
    //     ^? (parameter) shape: Square
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoEcCucooN4BQyyA1qACYBcyA5AM5Y4Q0DcRyA7sOWABbUhMAWwBG0NgF8CoSLEQoAShARg4IAOYAbfOzIgqtXCrVbmbYrwjB1vMAOFio5ztz73R4glLABPAA4oqLxwAcgAvGiMuMgAPshKxhrabAQwmCAqwAD2IMgIcJoImJpwkACCuHAAFHTBAdRBIRAAlMiExMAwyDV1EAB0euThYRE0RqpJzK3txMi4YJhQubVNfVw8vMgAVMgrAX2W1rbOxAD0p7PEAHoA-N1+OHBCELKtexDUCROm7BLIEJo6DpLvNFstemtXJsdu9IRsTshzpdkLd7o9nq9dr0GlEIL8vAQgA)

这里的 `kind` 属性就是那个“标签”，我们称这种类型为“标记联合”（tagged union）。它有时也被叫做“可区分联合”（discriminated union），这时候 `kind` 就是“区分字段”（discriminant）。这两个术语是可以互换的。由于它们能让你在运行时轻松获取类型信息，所以在 TypeScript 中非常常见。

有些结构既会引入一个类型（在运行时不存在），也会引入一个值（在运行时可用），比如 `class` 关键字。把 `Square` 和 `Rectangle` 改写成类，也是解决这个问题的另一种方式：

```ts
class Square {
  width: number
  constructor(width: number) {
    this.width = width
  }
}
class Rectangle extends Square {
  height: number
  constructor(width: number, height: number) {
    super(width)
    this.height = height
  }
}
type Shape = Square | Rectangle

function calculateArea(shape: Shape) {
  if (shape instanceof Rectangle) {
    return shape.width * shape.height
    //     ^? (parameter) shape: Rectangle
  } else {
    return shape.width * shape.width
    //     ^? (parameter) shape: Square
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEDKCOBXMAnAptA3gKGtA7gJYAmALgBYBc0AdogLYBGaKA3LtMAPY0SkqJgpLigAURMlVoNmKAJRYOeCoQgA6CRWgBeAiQrs8AX2wnQkGACU0QsDQDmIDGgAepNDWIwEydIrzkaIT25KTUdEwshpw8fAJCIuL6UhGyADTQgcGh4TIsCjh4eBCIAA4sSZJy0crkqmpZIaQ6mUFN0SYmpACe5XDkYH26PqgYAD7Q1rYOTuzYAGaINEKEPJxgIMCI4O4AguhgohAD5dSwJ2gFHITz0EcX0IS8pHbAaFy3Uy8zl-5F6KRECgaNBjoM0BpktAAFSgi4NNqhGrQAD0KKKeAAegB+O6lVBgehodzyOHg6hfOyONAcIzQNAgCAYQr-YlAkFg8qQyQwslczTkZFojHQHF4glEkkKTloM5IUa00zYIA)

这样之所以可以正常运行，是因为 `class Rectangle` 同时引入了一个类型和一个值，而 `interface` 只引入了类型。

在 `type Shape = Square | Rectangle` 中的 `Rectangle` 指的是类型，而在 `shape instanceof Rectangle` 中的 `Rectangle` 指的是值，也就是构造函数。这种区别非常重要，但也比较容易混淆。第 8 条会教你怎么分辨两者。

### 带有类型错误的代码也能生成输出

因为代码生成和类型检查是彼此独立的，所以即使代码有类型错误，也仍然可能生成可运行的输出！

```bash
$ cat test.ts
let x = 'hello';
x = 1234;

$ tsc test.ts
test.ts:2:1 - error TS2322: Type '1234' is not assignable to type 'string'

2 x = 1234; ~

$ cat test.js
var x = 'hello';
x = 1234;
```

如果你之前用的是 C 或 Java 这类语言，这点可能会让你感到意外——因为在那些语言里，类型检查不过关是不会生成输出的。

你可以把 TypeScript 的所有错误理解为类似这些语言中的“警告”：它们很可能提示了某些问题，值得你去查一查，但它们不会阻止代码被编译出来。

> [!NOTE] 编译和类型检查
> 这可能是 TypeScript 中一些常见不严谨说法的来源。你经常会听到有人说他们的 TypeScript “不能编译”，其实他们是想表达代码有错误。但从技术上讲，这并不完全准确！只有代码生成的过程叫“编译”。只要你的 TypeScript 是有效的 JavaScript（即使有时不是），TypeScript 编译器还是会生成输出。为了避免听起来太过挑剔，最好说你的代码有错误，或者说它“类型检查不通过”。

在有错误的情况下生成代码实际上在实践中很有帮助。如果你在构建一个 web 应用，你可能已经知道某个部分存在问题。但因为 TypeScript 会在有错误的情况下仍然生成代码，你可以先测试应用的其他部分，等到修复错误之后再回过头来解决那个问题。

在提交代码时，你应该尽量保证没有错误，否则你可能会掉进一个陷阱：记不清哪些错误是预期的，哪些是意外的。如果你想在错误发生时禁用输出，可以在 `tsconfig.json` 中使用 `noEmitOnError` 选项，或者在你的构建工具中使用相应的设置。

### 类型操作不能影响运行时的值

假设你有一个值，它可能是字符串或数字，你想把它标准化成始终是一个数字。下面是一个类型检查器接受的错误做法：

```ts
function asNumber(val: number | string): number {
  return val as number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwM4DkQFsBGBTAJwAoA3ZAGwC5Ext8DEAfRVKAmMAcwEprbdCiAN4AoRIgJ4oIAkjLkUqGnUIBuEQF8RQA)

查看生成的 JavaScript 就能清楚地看到这个函数实际上做了什么：

```js
function asNumber(val) {
  return val
}
```

根本没有进行任何转换。`as number` 是一个类型操作，因此它无法影响代码的运行时行为。为了标准化这个值，你需要检查它的运行时类型，并使用 JavaScript 的构造来进行转换：

```ts
function asNumber(val: number | string): number {
  return Number(val)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwM4DkQFsBGBTAJwAoA3ZAGwC5Ext8DEAfRVKAmMAcwEprbdCiAN4AoRIgJ4oIAkkwDiZctwDcIgL4igA)

“`as number`” 是一个类型断言，有时被不准确地称为“强制类型转换”。关于什么时候使用类型断言，参考第 9 条。

### 运行时类型可能与声明的类型不同

这个函数最终会执行到 `console.log` 吗？

```ts
function setLightSwitch(value: boolean) {
  switch (value) {
    case true:
      turnLightOn()
      break
    case false:
      turnLightOff()
      break
    default:
      console.log(`I'm afraid I can't do that.`)
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABFEAnMAZGBzAFlAeTAAoBKRAbwF8AoUSWBZNTHfA4YMy2+6eJAGcAplCx4oAZQDuMKBFzEAbgEMANiGEAuRACM4cNcJVhyFGokSDZ83ImXrNZi5cQQVI5Kk1aXr5uji7CSkANx+rrqoxgDW4f7unsDqIr7+liiBbIScZPHpUbH5lgAmwskgalBp6RAIgobCAHRqcNjEAAYAkgDkALaIKsCoKjAliF1uJj1QiCVwyLgqUE0dYS60tEA)

TypeScript 通常会标记死代码（Dead Code, 指的是程序中那些永远不会被执行到的代码），但即使在启用严格选项的情况下，它也不会对此发出警告。那你怎么可能会执行到这段代码呢？

关键在于记住 `boolean` 是声明的类型。因为它是 TypeScript 类型，它在运行时会消失。在 JavaScript 代码中，用户可能不小心用像 `"ON"` 这样的值调用 `setLightSwitch`。

其实也有办法在纯 TypeScript 中触发这个代码路径。例如，函数可能是通过网络请求返回的值来调用的：

```ts
interface LightApiResponse {
  lightSwitchValue: boolean
}
async function setLight() {
  const response = await fetch('/light')
  const result: LightApiResponse = await response.json()
  setLightSwitch(result.lightSwitchValue)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABFEAnMAZGBzAFlAeTAAoBKRAbwF8AoUSWBZNTHfA4YMy2+6eJAGcAplCx4oAZQDuMKBFzEAbgEMANiGEAuRACM4cNcJVhyFGokSDZ83ImXrNZi5cQQVI5Kk1aXr5uji7CSkANx+rrqoxgDW4f7unsDqIr7+liiBbIScZPHpUbH5lgAmwskgalBp6RAIgobCAHRqcNjEAAYAkgDkALaIKsCoKjAliF1uJj1QiCVwyLgqUE0dYS60tDBgUMKoyRDCiEFQAIIADjAASsKC5-VH5pZq2TJyCgBqjtp6BkYm4VoHgAnpBEHxGEJRCduE83PVZtE7g9EABeQbSUazYCiBTEHoAeheEh660sdTAgkRt0q1WO2Qu11u90pR3RKkxckQSJZIiaACsGiF8iIxK8bHikbSWuL3rgvhphOtaEA)

上面代码声明了 `/light` 请求的结果是 `LightApiResponse` 类型，但并没有什么机制强制执行这一点。如果你误解了 API，且 `lightSwitchValue` 实际上是一个字符串，那么在运行时就会将字符串传递给 `setLightSwitch`。或者，可能是 API 在你部署之后发生了变化。

当你的运行时类型与声明的类型不匹配时，TypeScript 可能会变得非常令人困惑，你应该尽量避免这种所谓的“不安全类型”。但要注意，值的运行时类型可能与声明的类型不同。关于类型安全性，参考第 48 条。

### 你不能基于 TypeScript 类型重载函数

像 C++ 这样的语言允许你定义多个版本的函数，这些版本仅在参数的类型上有所不同。这叫做“函数重载”。由于代码的运行时行为与其 TypeScript 类型是独立的，因此在 TypeScript 中无法实现这种构造：

```ts
function add(a: number, b: number) {
  return a + b
}
//       ~~~ Duplicate function implementation
function add(a: string, b: string) {
  return a + b
}
//       ~~~ Duplicate function implementation
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoBTIFyLCAWwCMBTAJwBpEjd9jyBKRAb0TJKhDKWUQGpqAbkQBfAFAB6CYhmzEAP0WIAIiAAOAGxgRkUEolCRYCRDAKaSBEmCi74YMYej2U6LLgDOUMjDABzKhpELx9-JlZ2Tm4UfiFRSWk5GUV5FXUtHT0DcGcTMwsrGzsEMSA)

TypeScript 确实提供了函数重载的功能，但它完全是在类型层面上进行的。你可以为一个函数提供多个类型签名，但只能有一个实现：

```ts
function add(a: number, b: number): number
function add(a: string, b: string): string

function add(a: any, b: any) {
  return a + b
}

const three = add(1, 2)
//    ^? const three: number
const twelve = add('1', '2')
//    ^? const twelve: string
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoBTIFyLCAWwCMBTAJwBpEjd9jyBKWw0sgbgChRJYEV0suAM5QyMMAHMqNRCLGSms0eImcu4aPCRpMOFGACe03MkMNEAbw6JEZElBBltiANTVOAXw4cICEYigACzsSRABefkwARioAJgZOAHpEmxsAPQB+RF8wfyCQ5noyHz8oAIB3EgAbADdQiJ0MAHIopqom2KaEjmTUxEzs0orquuFlSQ4gA)

`add` 的前两个签名仅提供类型信息。当 TypeScript 生成 JavaScript 输出时，这些签名会被删除，只有实现部分保留。实现中的 `any` 参数并不是很好，我们将在第 52 条中探讨如何处理这些参数，那里也会讨论一些关于 TypeScript 函数重载的细节。

### TypeScript 类型对运行时性能没有影响

因为类型和类型操作在生成 JavaScript 时会被擦除，所以它们不会对运行时性能产生影响。TypeScript 的静态类型实际上是零成本的。

不过有两个注意事项：

- 虽然没有运行时开销，但 TypeScript 编译器会引入构建时开销。TypeScript 团队非常重视编译器性能，编译通常非常快，尤其是增量构建。如果开销变得显著，你的构建工具可能有一个“仅转译”选项来跳过类型检查。关于编译器性能的更多内容将在第 78 条中讨论。
- TypeScript 为了支持旧版运行时，可能会产生相对于原生实现的性能开销。例如，如果你使用了生成器函数并且将目标设置为 ES5（即生成器的出现之前的版本），`tsc` 会生成一些辅助代码来使其正常工作。与生成器的原生实现相比，这会产生一些开销。任何 JavaScript “转译器”都会遇到这种情况，而不仅仅是 TypeScript。无论如何，这与 emit 目标和语言级别有关，依然与类型无关。

## 关键点总结

- 代码生成和类型系统是分开的，也就是说 TypeScript 的类型不会影响代码运行时的行为。
- 即使程序有类型错误，也还是可能被编译生成代码。
- TypeScript 的类型在运行时是不存在的。如果你想在运行时获取类型信息，得靠你自己想办法“重构”类型，通常可以用标记联合（tagged unions）或属性检查来实现。
- 有些语法，比如 `class`，既会生成一个类型，也会在运行时留下一个可以用的值。
- TypeScript 的类型在编译时会被“擦除”，所以它们不会影响代码在运行时的性能。

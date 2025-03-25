# 理解代码生成与类型系统是相互独立的

## 要点

- **代码生成与类型系统是独立的。** 这意味着 TypeScript 的类型不会影响代码的运行时行为。
- **即使程序存在类型错误，仍然可能生成 JavaScript 代码（即“编译”仍会进行）。**
- **TypeScript 类型在运行时不可用。** 如果需要在运行时获取类型信息，必须通过某种方式重新构造它，例如使用**标签联合（tagged union）**或**属性检查（property checking）**。
- 有些结构，比如 `class`，会同时产生 TypeScript 的类型和一个运行时可用的值。
- **TypeScript 类型在编译时会被移除，因此不会影响代码的运行时性能。**

## 正文

TypeScript 的编译器`tsc`主要做两件事：

- 将新一代的 TypeScript/JavaScript 转换为较旧版本的 JavaScript，以便在浏览器或其他运行环境中使用（即“转译”）。
- 检查代码中的类型错误。

令人惊讶的是，这两种行为完全独立。换句话说，你的代码中的类型不会影响 TypeScript 生成的 JavaScript。由于最终执行的是 JavaScript，这意味着**类型不会影响代码的运行方式**。

这带来了一些意想不到的影响，并且应该让你明确 TypeScript 能做什么，不能做什么。

### 无法在运行过程中检查类型错误

你可能想写出下面这样的代码:

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

`instanceof` 检查发生在运行时，而 `Rectangle` 是一个类型，不能影响代码的运行时行为。TypeScript 的类型是“可擦除的”：在编译为 JavaScript 的过程中，所有接口、类型和类型注解都会被移除。

在 `instanceof` 检查之前，JavaScript 代码中并没有 `Rectangle` 的任何信息，这正是问题所在。

要确定 `shape` 的类型，需要一种在运行时重建其类型的方法，也就是说，必须在生成的 JavaScript 中有效，而不仅仅是在 TypeScript 代码中有效。

有几种方法可以实现这一点，其中一种是检查对象是否具有 `height` 属性：

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

这种方法有效，是因为属性检查只涉及运行时可用的值，同时 TypeScript 仍然可以据此推断 `shape` 的类型为 `Rectangle`。

另一种方法是引入一个“类型标签”（tag），显式地在运行时存储类型信息：

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

这里的 `kind` 属性充当了“标签”（tag），因此我们称 `Shape` 类型为**“标签联合”**（tagged union）。这种模式有时也被称为**“可区分联合”**（discriminated union），其中 `kind` 被称为“区分标识”（discriminant）。这两个术语是可以互换使用的。

由于这种方式可以轻松在运行时恢复类型信息，因此**标签联合**/**可区分联合**在 TypeScript 中非常常见。

有些构造既引入类型（仅在编译时可用），也引入值（在运行时可用）。`class` 关键字就是其中之一。因此，将 `Square` 和 `Rectangle` 定义为类也是修正错误的另一种方法：

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

这是因为 `class Rectangle` 同时引入了类型和值，而 `interface` 只引入了类型。

在 `type Shape = Square | Rectangle` 中，`Rectangle` 指的是类型，而在 `shape instanceof Rectangle` 中，`Rectangle` 指的是值（即构造函数）。这种区别非常重要，但可能有些微妙。在第 8 条中将介绍如何区分它们。

### 具有类型错误的代码可以被编译器保留

由于代码的输出与类型检查是独立的，因此即使代码存在类型错误，仍然可以生成 JavaScript 代码并执行。

```bash
$ cat test.ts
let x = 'hello';
x = 1234;

$ tsc test.ts
test.ts:2:1 - error TS2322: Type 'number' is not assignable to type 'string'.

2 x = 1234;
  ~

$ cat test.js
var x = 'hello';
x = 1234;
```

如果你熟悉 C 或 Java 这类语言，可能会觉得惊讶，因为这些语言的类型检查和代码输出是紧密相关的。

你可以把 TypeScript 的所有错误看作这些语言中的警告：**它们很可能提示了一个问题，值得关注和修复，但不会阻止代码的构建。**

> **编译与类型检查**
>
> 这可能是 TypeScript 社区中一些用词不严谨的来源。你经常会听到有人说他们的 TypeScript “无法编译”，实际上他们的意思是代码有错误。但这在技术上并不准确！
>
> 严格来说，只有代码生成才算“编译”。只要你的 TypeScript 代码是合法的 JavaScript（甚至很多时候即使不是），TypeScript 编译器仍然会生成输出。
>
> 尽管这样说可能显得有些较真，但更准确的说法应该是 **“代码有错误”** 或 **“无法通过类型检查”**。

即使存在错误，TypeScript 仍然会生成代码，这在实际开发中是有帮助的。如果你在构建一个 Web 应用，你可能知道某个部分存在问题。但由于 TypeScript 仍会生成代码，你可以先测试其他部分，而不必等到所有错误修复后再运行应用。

尽管如此，在提交代码时，还是应尽量确保零错误。否则，你可能会陷入需要记住哪些错误是预期的，哪些是意外的困境。

如果想在有错误时禁止生成代码，可以在 _tsconfig.json_ 中启用 `noEmitOnError` 选项，或者在你的构建工具中使用等效的配置。

### 类型操作不能影响运行时的 Value

假设你有一个变量，它可能是字符串或数字，并且你希望将其规范化为始终是数字。下面是一个类型检查器会接受的错误尝试：

```ts
function asNumber(val: number | string): number {
  return val as number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwM4DkQFsBGBTAJwAoA3ZAGwC5Ext8DEAfRVKAmMAcwEprbdCiAN4AoRIgJ4oIAkjLkUqGnUIBuEQF8RQA)

在生成的 js 代码中可以清楚的看到这个代码的意图:

```js
function asNumber(val) {
  return val
}
```

这里并没有发生任何转换。`as number` 是一个类型操作，因此它无法影响代码的运行时行为。要规范化这个值，你需要检查它的运行时类型，并使用 JavaScript 的构造进行转换：

```ts
function asNumber(val: number | string): number {
  return Number(val)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwM4DkQFsBGBTAJwAoA3ZAGwC5Ext8DEAfRVKAmMAcwEprbdCiAN4AoRIgJ4oIAkkwDiZctwDcIgL4igA)

“as number” 是一个类型断言，有时被不准确地称为“强制转换”。关于何时适合使用类型断言，请参见第 9 条。

### 运行时类型可能与声明的类型不同

可以看一下，下面这个函数会运行到`console.log`吗？

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

TypeScript 通常会自动检测无效代码，但在这种情况下即使开启了严格模式选项也不会报错。那如何触发这个代码路径呢？

关键在于理解 `boolean` 是类型声明。它是 TypeScript 的类型注解，在代码运行时会被擦除。但在实际的 JavaScript 环境中，用户也可能会传入一个像 `"ON"` 这样的值来调用 `setLightSwitch`，从而触发这个默认情况。

在纯 TypeScript 中，也有可能触发这个代码路径。例如，函数可能是用来自网络请求的值来调用的：

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

上面的代码声明了 `/light` 请求的返回结果是 `LightApiResponse`，但实际上并没有任何机制强制执行这个约定。如果开发人员误解了这个请求 API，实际返回的 `lightSwitchValue` 结果实际上是一个字符串，那么在运行时，`setLightSwitch` 可能会接收到一个字符串。或者，这个请求 API 在生产环境中发生了变更，都可能产生意外结果。

当运行时的类型与声明的类型不匹配时，TypeScript 可能会变得相当令人困惑。因此，应该尽量避免这些所谓的“不健全”（unsound）类型。但请注意，变量 Value 的运行时类型可能与声明的类型不同。关于类型健全性的问题，请参考第 48 条。

### 基于 TS 的函数无法被重载

像 C++ 这样的语言允许你定义多个仅参数类型不同的函数版本，这被称为“函数重载”（function overloading）。

但由于 TypeScript 代码的运行时行为与其类型无关，这种机制在 TypeScript 中是不可行的：

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

不过实际上，TypeScript 确实提供了函数重载的机制，但它完全作用于类型层面。你可以为一个函数提供多个类型签名，但只能有一个具体的实现：

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

`add` 函数的前两个签名仅提供了类型信息。在 TypeScript 生成 JavaScript 代码时，这些类型签名会被移除，最终只保留函数的具体实现。

在最终实现中，使用 `any` 类型来定义参数变量并不是理想的做法。我们将在第 52 条讨论如何更好地处理这种情况，以及 TypeScript 函数重载中的一些技巧。

### TypeScript 类型不会影响运行时性能

由于在生成 JavaScript 代码时，类型和类型操作都会被擦除，因此它们不会影响运行时性能。TypeScript 的静态类型实际上是零成本的。下次如果有人以“运行时开销”为理由反对使用 TypeScript，你就知道如何回应了！

不过，有两个需要注意的地方：

- **没有运行时开销，但会有构建时开销。** TypeScript 编译器需要额外的时间进行类型检查和代码转换。TypeScript 团队非常重视编译器性能，通常增量构建速度很快(最新的 TS 已由 Go 进行重写，速度提升显著)。如果编译开销变得显著，你的构建工具可能提供“仅转换”（transpile only）选项，以跳过类型检查。关于编译性能，我们将在第 78 条详细讨论。
- **为了支持旧版 JavaScript 运行时，TypeScript 可能会引入额外的代码，导致一定的性能开销。** 例如，如果你在代码中使用了生成器函数（generator function），但目标设为 ES5（该版本不支持生成器），`tsc` 会生成一些辅助代码来模拟生成器的行为。这种方式相比原生生成器实现会有一定的性能损失。不过，这种开销与所有 JavaScript “转译器”（transpiler）相同，并不特定于 TypeScript，并且它仍然是与类型无关的，只与目标 JavaScript 版本有关。

## 关键点总结

- **代码生成与类型系统是独立的。** 这意味着 TypeScript 的类型不会影响代码的运行时行为。
- **即使程序存在类型错误，仍然可能生成 JavaScript 代码（即“编译”仍会进行）。**
- **TypeScript 类型在运行时不可用。** 如果需要在运行时获取类型信息，必须通过某种方式重新构造它，例如使用**标签联合（tagged union）**或**属性检查（property checking）**。
- 有些结构，比如 `class`，会同时产生 TypeScript 的类型和一个运行时可用的值。
- **TypeScript 类型在编译时会被移除，因此不会影响代码的运行时性能。**

# Item 52: 优先使用条件类型而不是重载签名

## 要点

- 优先使用条件类型（conditional types）而不是重载类型签名。通过对联合类型进行分布，条件类型使得你的声明能够支持联合类型，而不需要额外的重载。
- 如果联合类型中的某个情况不太可能发生，考虑将你的函数分解为多个具有不同名称的函数，这样可能会更清晰。
- 在实现使用条件类型声明的函数时，可以考虑使用单一重载策略。

## 正文

你如何为这个 JavaScript 函数编写类型声明？

```ts
function double(x) {
  return x + x
}
```

`double` 可以接受字符串或数字作为参数。所以你可能会使用联合类型：

```ts
declare function double(x: string | number): string | number
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtX2B2QCMIQAKADwC54BnDGLVAc3gB95VkBbYkGAEpaDJqw5de-GAG4AUEA)

虽然这个声明是准确的，但有点不够精确：

```ts
const num = double(12)
//    ^? const num: string | number
const str = double('x')
//    ^? const str: string | number
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtX2B2QCMIQAKADwC54BnDGLVAc3gB95VkBbYkGAEpaDJqw5de-GAG4AUGDwNJPeAF4CRUhQCMAJkHyA9Efhn4APQD88RamXceIxszadH0hUoz1G6zSRk5ADklMGGcibmljZ2yqLOYm4qnkA)

当 `double` 传入数字时，它返回数字。当传入字符串时，它返回字符串。这个声明遗漏了这种细微差别，会产生难以使用的类型。

你可能会尝试通过使函数泛型来捕获这种关系：

```ts
declare function double<T extends string | number>(x: T): T

const num = double(12)
//    ^? const num: 12
const str = double('x')
//    ^? const str: "x"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtX2B2QCMIQAeAFXhAA8MRVgBneZjGLVAc3gB94qZAFtiIGAD4AFLQBc8SgEp5lANwAodWDztBI+AF4CRUiCkBGAEyKNAelvxH8AHoB+eNtS6hw+Va06GGwchsYkZFIA5LSRNur2Ti7unrrsMPIARLQZ6kA)

不幸的是，在我们追求精确性的热情中，我们过度了。类型现在有点过于精确了。当传入字符串类型时，这个 `double` 声明会产生字符串类型，这是正确的。但当传入字符串字面量类型时，返回类型是相同的字符串字面量类型。这是错误的：将 'x' 翻倍结果是 'xx'，而不是 'x'。正如 Item 40 所解释的，不精确的类型比不准确的类型更可取，所以这是向错误方向迈出的一步。我们怎样才能做得更好？

另一个选择是提供多个类型声明，也称为"重载签名"（参见 Item 3 复习）。虽然 JavaScript 只允许你编写一个函数实现，但 TypeScript 允许你编写任意数量的类型签名。你可以使用这个来改进 `double` 的类型：

```ts
declare function double(x: number): number
declare function double(x: string): string

const num = double(12)
//    ^? const num: number
const str = double('x')
//    ^? const str: string
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtX2B2QCMIQAKADwC55VkBbYkGASlvqZYG4AoUSLAQp02PASKkKNeAGcMMLKgDm7OQqXK+vMHnl1G8ALwSSZcgEYATKz4B6O-CfwAegH54u1Ps4dGzGB09DHUYY1MpcgBySijbXgdnVw8vfXkYWnTNXiA)

这是进步！但还有一个微妙的错误。这个类型声明对于要么是字符串要么是数字的值有效，但对于可能是两者之一的值无效：

```ts
function f(x: string | number) {
  return double(x)
  //            ~ Argument of type 'string | number' is not assignable
  //              to parameter of type 'string'
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtX2B2QCMIQAKADwC55VkBbYkGASlvqZYG4AoUSLAQp02PASKkKNeAGcMMLKgDm7OQqXK+vMHnl1G8ALwSSZcgEYATKz4B6O-CfwAegH54u1Ps4dGzGB09DHUYY1MpcgBySijbXgdnVw8vfXkYWnTNXhFMXHxEKkyNFXgAHwMuNngAb14nOAxkGHxCM2l4p0SknqcAP3gAQRhlRhBUEJxEeAwATwAHBCis0orOAKj4LFk6HBCoWVksZVQoKXr4bt7ejBx4edgoBhAMFngpmYWlleUo3gBfXhAA)

对 `double` 的这个调用是安全的，应该返回 `string|number`。当你提供重载签名时，TypeScript 会逐个处理它们，直到找到匹配项。你看到的错误是最后一个重载（字符串版本）失败的结果，因为 `string|number` 不能赋值给 `string`。

虽然你可以通过添加第三个 `string|number` 重载来修复这个问题，但更好的解决方案是使用条件类型。条件类型就像类型空间中的 if 语句（条件）。它们非常适合像这样的情况，你需要覆盖几种可能性：

```ts
declare function double<T extends string | number>(
  x: T
): T extends string ? string : number
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtX2B2QCMIQAeAFXhAA8MRVgBneZjGLVAc3gB94qZAFtiIGAD4AFACh48WgC54lGQEpl1Ogyat2nHvAD8bDl17Kho8QG4ZYPO0Ej4AXgJFSIKQEYATGp2APRB8vIAeiYOqE5WliJiMPaOGKYwbh4kZFIA5LQ5gTIhYfCR8NFO+sr65jIyKOjYeEhSSmnm-M7WMGrwAN5y8MUlZQ2YuPiIrdVmhgJWiRrtc12Jg3AYyDD4hFnetIHyxTgA1jIAvjJAA)

这类似于第一次尝试使用泛型函数来类型化 `double`，但返回类型更复杂。你像在 JavaScript 中读取三元（?:）运算符一样读取条件类型：

- 如果 T 是 string 的子类型（即 string，或字符串字面量，或字符串字面量的联合，或模板字面量类型），那么返回类型是 string。
- 否则返回 number。

使用这个声明，我们所有的例子都能工作：

```ts
const num = double(12)
//    ^? const num: number
const str = double('x')
//    ^? const str: string

function f(x: string | number) {
  //     ^? function f(x: string | number): string | number
  return double(x) // ok
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtX2B2QCMIQAeAFXhAA8MRVgBneZjGLVAc3gB94qZAFtiIGAD4AFACh48WgC54lGQEpl1Ogyat2nHvAD8bDl17Kho8QG4ZYPO0Ej4AXgJFSIKQEYATGp2APRB8vIAeiYOqE5WliJiMPaOGKYwbh4kZFIA5LQ5gTIhYfCR8NFO+sr65jIyKOjYeEhSSmnm-M7WMGrwAN5y8MUlZQ2YuPiIrdVmhgJWiRrtc12Jg3AYyDD4hFnetIHyxTgA1jIAvjJAA)

`string|number` 的例子有效是因为条件类型在联合类型上进行分布。当 T 是 `string|number` 时，TypeScript 按如下方式解析条件类型：

```
(string|number) extends string ? string : number
→ (string extends string ? string : number) |
  (number extends string ? string : number)
→ string | number
```

条件类型在联合类型上分布的方式是 TypeScript 类型系统设计的一部分。它不必是这样的。但在许多情况下（比如这种情况），这种行为是正确的且极其方便。

虽然使用重载签名的类型声明写起来更简单，但使用条件类型的版本更正确，因为它可以推广到各个情况的联合。重载签名通常就是这种情况。虽然重载被独立处理，但类型检查器可以将条件类型作为单个表达式进行分析，在联合类型上分布它们。

每当你编写条件类型时，你都应该考虑是否希望它在联合类型上分布。通常你希望这样，但这并不总是如此。Item 53 展示了一个分布不正确的情况，并展示了如何获得一些控制。

是否有任何情况你应该优先选择重载？如果联合情况不太可能发生，或者如果你的函数真的表现为两个或更多具有完全不同签名的非常不同的函数，那么处理它可能不值得，保持不同的重载分离会产生更可读的代码。

不过，如果你发现自己处于这种情况，想想是否有两个不同的函数会更清晰。Node 标准库就是这样的一个例子，它提供了基于回调和基于 Promise 的文件系统函数版本，如 `readFile`。这可以是一个根据其参数表现不同的单一函数。但你通常事先知道你是使用回调还是 Promise，所以有两个不同的函数更清晰和简单。

由于这是关于类型级编程的章节，我们完全专注于类型。但值得简要讨论如何实现重载函数和返回条件类型的函数。这通常会很尴尬，需要在函数体中进行类型断言。TypeScript 不会为变量推断条件类型。

一种策略是定义一个单一的重载，向调用者展示与你用于实现函数的类型签名不同的类型签名。例如：

```ts
function double<T extends string | number>(
  x: T
): T extends string ? string : number
function double(x: string | number): string | number {
  return typeof x === 'string' ? x + x : x + x
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAEziARgGwKYB4Aqi2AHlNmMgM6KVQBOMYA5ogD6JggC262dAfAAoAUIkTEAXInzCAlFMIkyFarQbNEAfhr1GLKZx58A3MNCRYCFGizZBknepbtDvOvMd62Hbm8QBvUUQ6bCgQOiQoAE8AB2w4YHFEAF5UxAByNT10rSSAaiSpYkQC4lMAX2EgA)

这里我们对外部可见的 API 使用条件类型，但对实现使用更简单的类型。（typeof 检查看起来有点奇怪，但为我们节省了类型断言。）TypeScript 会检查两个签名是否兼容，但它无法做到完美。正如 Item 55 所解释的，测试你的类型仍然很重要。

## 要点回顾

- 优先使用条件类型而不是重载类型签名。通过对联合类型进行分布，条件类型使得你的声明能够支持联合类型，而不需要额外的重载。
- 如果联合类型中的某个情况不太可能发生，考虑将你的函数分解为多个具有不同名称的函数，这样可能会更清晰。
- 在实现使用条件类型声明的函数时，可以考虑使用单一重载策略。

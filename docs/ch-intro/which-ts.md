# 了解你正在使用哪些 TypeScript 配置项

## 要点

- TypeScript 编译器有多个设置，会影响语言的核心特性。
- 使用 **tsconfig.json** 配置 TypeScript，而不是命令行参数。
- 除非是在将 JavaScript 项目迁移到 TypeScript，否则应开启 `noImplicitAny`，避免隐式的 `any` 类型。
- 开启 `strictNullChecks`，防止运行时报出 “undefined 不是对象” 这类错误。
- 建议启用 `strict`，享受 TypeScript 最全面的类型检查。

## 正文

请看下面这段代码是否通过了 TypeScript 的编译？

```ts
function add(a, b) {
  return a + b
}
add(10, null)
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=false&strictNullChecks=false#code/GYVwdgxgLglg9mABAQwCaoBTIDSIEYCUiA3gFCKIBOAplCJUsogNT4DcpAvqWpgIwAGXGBAAbUQQ5A)

如果不知道你用了哪些配置选项，是无法给出确定答案的！TypeScript 编译器有非常多的配置选项，截至目前为止，已经超过一百个了。

这些选项可以通过命令行设置：

```sh
$ tsc --noImplicitAny program.ts
```

或者通过 **tsconfig.json** 文件设置：

```json
{
  "compilerOptions": {
    "noImplicitAny": true
  }
}
```

推荐使用配置文件，这样可以确保你的同事和工具都清楚你打算如何使用 TypeScript。你可以通过运行 `tsc --init` 来创建配置文件。

TypeScript 的很多配置选项用于控制它在哪里查找源文件，以及生成什么样的输出。但有一部分配置会影响语言本身的核心特性。这些属于高层设计决策，大多数语言并不会把这些决定交给用户。TypeScript 的配置不同，使用体验也会大不相同。想要用好 TypeScript，你需要重点理解其中两个关键设置：`noImplicitAny` 和 `strictNullChecks`。

## `noImplicitAny`

默认情况下，TypeScript 不会对隐式的 `any` 类型进行检查。`noImplicitAny` (implicit，含蓄的)是控制当 TypeScript 无法确定变量类型时的行为。以下代码在 `noImplicitAny` 关闭时是有效的：

```ts
function add(a, b) {
  return a + b
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=false#code/GYVwdgxgLglg9mABAQwCaoBTIDSIEYCUiA3gFCKIBOAplCJUsogNT4DcpAvqUA)

如果你把鼠标悬停在编辑器中的 `add` 符号上，就会看到 TypeScript 对这个函数推断出的类型：`(a: any, b: any) => any`。

`any` 类型会让涉及这些参数的代码绕过类型检查。虽然 `any` 有一定用途，但必须谨慎使用。

这种情况被称为“隐式 any”，因为你虽然没有显式写出 `any`，但最终参数的类型还是变成了危险的 `any`。如果你开启 `noImplicitAny` 选项，这种情况会直接报错：

```ts
function add(a, b) {
  //         ~    Parameter 'a' implicitly has an 'any' type
  //            ~ Parameter 'b' implicitly has an 'any' type
  return a + b
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=true#code/GYVwdgxgLglg9mABAQwCaoBTIDSIEYCUiA3gFCKID0lFtdAfnQArIBOyAtgKZReuIByZAMQwOABwA2MCDCiSAnogAWyAM4okQsApFQF4ruSo06ZioxbtuvfgLwixUmXMUr1mwch16DRiqw8IKxIyIgA1PgA3KQAvqRAA)

这些错误可以通过显式添加类型声明来修复，可以写成 `: any`，也可以指定一个更具体的类型：

```ts
function add(a: number, b: number) {
  return a + b
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=true#code/GYVwdgxgLglg9mABAQwCaoBTIFyLCAWwCMBTAJwBpEjd9jyBKRAbwChFEySoQyllEAamoBuVgF9WQA)

TypeScript 在拥有类型信息时才能发挥最大作用，因此应尽量开启 `noImplicitAny`。一旦你习惯了所有变量都有明确类型，关闭 `noImplicitAny` 的 TypeScript 会让人感觉像是另一种语言。

对于新项目，建议一开始就开启 `noImplicitAny`，这样可以在写代码的同时补全类型声明，有助于 TypeScript 发现问题、提升代码可读性，并改善开发体验（详见第 6 条）。

只有在将项目从 JavaScript 迁移到 TypeScript 时，才可以暂时关闭 `noImplicitAny`（详见第 10 章）。但即便如此，也应该尽快开启。关闭 `noImplicitAny` 会让 TypeScript 的类型检查变得意外地宽松，第 83 条会具体讲到这样可能带来的问题。

## `strictNullChecks`

`strictNullChecks` 选项会影响 TypeScript 如何处理 `null` 和 `undefined`。默认情况下，`strictNullChecks` 为 false，`null` 和 `undefined` 可以赋值给任何类型：

```ts
const x: number = null // OK, null is a valid number
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=true&strictNullChecks=false#code/MYewdgzgLgBAHgLhmArgWwEYFMBOMC8yKANsQNwwwD0VMA8gNIA0RpMAlhDAIYwBu3YuwAmRTLgBQQA)

当开启 `strictNullChecks` 时，`null` 和 `undefined` 只能赋值给它们自己和 `void` 类型：

```ts
const x: number = null
//    ~ Type 'null' is not assignable to type 'number'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=true&strictNullChecks=true#code/MYewdgzgLgBAHgLhmArgWwEYFMBOMC8yKANsQNwBQA9FTHTAH4wAqAngA5YwDkqp3MAJYRkIWAEMIEQQHMw4jMS5QQMKBy6902HNwpA)

如果想允许赋值 null，可以使用联合类型：

```ts
const x: number | null = null
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=true&strictNullChecks=true#code/MYewdgzgLgBAHgLhmArgWwEYFMBOMA+yKANsTALxGkDcAUEA)

如果你不希望允许 `null`，就需要查明它的来源，并添加检查或断言来处理：

```ts
const statusEl = document.getElementById('status')
statusEl.textContent = 'Ready'
// ~~~~~ 'statusEl' is possibly 'null'.

if (statusEl) {
  statusEl.textContent = 'Ready' // OK, null has been excluded
}
statusEl!.textContent = 'Ready' // OK, we've asserted that el is non-null
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=true&strictNullChecks=true#code/MYewdgzgLgBNCGUCuECiAbGBeGATEwSAtgKZhQB0A5iVBiaeQEICeAkrgBQDkCyE3AJQBuAFB8UGClBIAPKAGFwM8thjcASiXi4W3MQHoDMAH5mz6iWnTcYASwgwADiAgQ7AI3Qt1YJOhsKUVE7ADMYTisMQRgAb1EYOChESXRpOUVlMlgcTW1dfUSjGAB5AGkAGhg-AJgAC3hHDxIyGDlgdCRcElxRAF9xZP4MAEJ0+SVybLU8nT1hIuNyqoB3Em4ANxIYRogSACcZXBgoBtgSTAdq8ABaGvRRIA)

用 `if` 语句进行类型判断的方式称为“类型收窄”或“类型细化”，这个模式会在第 22 条中讲到。最后一行的 `!` 被称为“非空断言”。类型断言在 TypeScript 中有其作用，但也可能导致运行时异常，第 9 条会讲什么时候该用、什么时候不该用类型断言。

`strictNullChecks` 对于捕获涉及 `null` 和 `undefined` 的错误非常有用，但确实会增加一些使用难度。如果你是新建项目，并且有一定 TypeScript 经验，建议开启 `strictNullChecks`。  
但如果你刚接触 TypeScript 或正在迁移 JavaScript 代码，可以先不开启。不过一定要先开启 `noImplicitAny`，再考虑开启 `strictNullChecks`。

如果你选择不启用 `strictNullChecks`，要特别注意常见的 “undefined is not an object” 运行时错误。每遇到一次，都可以提醒你：是时候考虑开启更严格的检查了。项目越大，切换这个设置越困难，所以不要拖太久。大多数 TypeScript 代码都会启用 `strictNullChecks`，这也是你最终应该迈向的方向。

## 其它选项

还有许多其他设置会影响语言语义，比如 `noImplicitThis` 和 `strictFunctionTypes`，但它们相比 `noImplicitAny` 和 `strictNullChecks` 影响较小。要一次性开启所有这些检查，可以打开 `strict` 选项。开启 `strict` 时，TypeScript 能帮你捕获最多的错误，因此这应该是你的目标。

使用 `tsc --init` 创建项目时，默认就会启用 `strict` 模式。

此外，还有一些比 `strict` 更严格的选项，可以让 TypeScript 更激进地检查错误。其中一个是 `noUncheckedIndexedAccess`，它有助于捕捉对象和数组访问时可能出现的错误。例如，下面这段代码在开启 `--strict` 时**没有类型错误**，但运行时会抛出异常：

```ts
const tenses = ['past', 'present', 'future']
tenses[3].toUpperCase()
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=true&strictNullChecks=true#code/MYewdgzgLgBFCml4RgXhgbQOQAcCG0WANDLgE7KJTGkBmArlPRVgLoDcAUAkhBgMysAdFBABVHDnhkAwgXgAKAJRcgA)

运行报错：

```ts
const tenses = ['past', 'present', 'future']
tenses[3].toUpperCase()
// ~~~~~~ Object is possibly 'undefined'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=true&strictNullChecks=true&noUncheckedIndexedAccess=true#code/MYewdgzgLgBFCml4RgXhgbQOQAcCG0WANDLgE7KJTGkBmArlPRVgLoDcAUAkhBgMysAdFBABVHDnhkAwgXgAKAJRcA9KpgA-bTpgB5AEYAreMFgBLFDhAQI5gwBsAnqXpgAJvFrmw8d1iFOIA)

实际上许多有效的方法，也会被标记为未定义。

```ts
tenses[0].toUpperCase()
// ~~~~~~ Object is possibly 'undefined'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=true&strictNullChecks=true&noUncheckedIndexedAccess=true#code/MYewdgzgLgBFCml4RgXhgbQOQAcCG0WANDLgE7KJTGkBmArlPRVgLoDcAUAkhBgMysAdFBABVHDnhkAwgXgAKAJRcA9KpgA-bTpgB5AEYAreMFgBLFDhAQI5gwBsAnqXpgAJvFrmw8d1iFuRAhkDAAGYVEJKVl5ZTUNHV1DEzMYSxhrW3tnVw8vHz8AziA)

有些 TypeScript 项目会启用这个`noUncheckedIndexedAccess`设置，有些则不会。你至少要知道它的存在。第 48 条会对这个设置有更多说明。

务必了解自己使用了哪些配置！如果同事分享了一个 TypeScript 示例，而你复现不了他们遇到的错误，记得先检查一下你们的编译器选项是否一致。

## 关键点总结

- TypeScript 编译器有多个设置，会影响语言的核心特性。
- 使用 **tsconfig.json** 配置 TypeScript，而不是命令行参数。
- 除非是在将 JavaScript 项目迁移到 TypeScript，否则应开启 `noImplicitAny`，避免隐式的 `any` 类型。
- 开启 `strictNullChecks`，防止运行时报出 “undefined 不是对象” 这类错误。
- 建议启用 `strict`，享受 TypeScript 最全面的类型检查。

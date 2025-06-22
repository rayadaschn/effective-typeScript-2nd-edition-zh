# Item 48: Avoid Soundness Traps

## 要点

- "不健全性"（Unsoundness）是指符号的运行时值与其静态类型不一致。这可能导致崩溃和其他不良行为，而没有类型错误的提示。
- 注意常见的不健全性来源：`any` 类型、类型断言（`as`、`is`）、对象和数组查找，以及不准确的类型定义。
- 避免修改函数参数，因为这可能导致不健全性。如果不打算修改它们，请将参数标记为只读（`readonly`）。
- 确保子类的方法声明与父类匹配。
- 注意可选属性可能导致不健全类型。

## 正文

如果你经常上网，你会听到关于 TypeScript 不够"健全"的抱怨，认为这使它成为一个糟糕的语言选择。本条目将解释这意味着什么，并带你了解 TypeScript 中常见的不健全性来源。

请放心，TypeScript 是一个很棒的语言，听信网上的人从来都不是一个好主意！

如果一个语言中每个符号的静态类型都保证与其运行时值兼容，那么这个语言就被称为"健全的"。使用条目 7 中的术语，这意味着每个符号的运行时值都保持在该符号静态类型的域内。

以下是一个健全类型的例子：

```ts
const x = Math.random()
//    ^? const x: number
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAHjAvDAsgQygCwHQCc1gAmIAtgBQCUA3AFAD0dMTMAegPwyiSxwBcMYAK4kARgFNcNIA)

TypeScript 为 `x` 推断出静态类型 `number`，这是健全的：无论 `Math.random()` 在运行时返回什么值，它都会是一个数字。这并不意味着 `x` 在运行时可能是任何数字：更精确的类型应该是半开区间 `[0, 1)`，但 TypeScript 无法表达这一点。`number` 已经足够好了。健全性更多是关于准确性而不是精确性。

以下是 TypeScript 中不健全性的一个例子：

```ts
const xs = [0, 1, 2]
//    ^? const xs: number[]
const x = xs[3]
//    ^? const x: number
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAHhGBeGBtADAGhgRmwJgF0BuAKAHpyZqYA9AfhlElgQC4YwBXAWwCMApgCdUhUs2jxk8CKgDMJClRoMm4SXA7d+w0kA)

`x` 的静态类型被推断为 `number`，但在运行时它的值是 `undefined`，这不是一个数字。所以这是不健全的，可能导致运行时问题，例如，如果你尝试在 `x` 上调用方法：

```ts
console.log(x.toFixed(1))
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAHhGBeGBtADAGhgRmwJgF0BuAKAHpyZqYA9AfhlElgQC4YwBXAWwCMApgCdUhUs2jxk8CKgDMJClRoMm4SXA7d+w8epAAbAQDoDIAOYAKOMaggAYgEs4AgCaWcASk9kgA)

没有类型错误，但当你运行这段代码时它会抛出错误：

```
console.log(x.toFixed(1))
              ^
TypeError: Cannot read properties of undefined (reading 'toFixed')
```

不健全的类型很容易导致运行时错误，所以健全的类型系统通常被认为是编程语言的一个理想特性。

然而，健全性是有代价的。表达能力较弱的类型系统更容易实现健全性。例如，如果 TypeScript 不支持泛型类型，它会消除你稍后读到的许多不健全性来源。但泛型类型是有用的！这个假设版本的 TypeScript 在建模 JavaScript 模式时会更加困难，并且会捕获更少的错误。

换句话说，在类型系统的表达能力、健全性和便利性之间存在权衡。TypeScript 让你可以选择在这个谱系中的位置：通过启用 `strictNullChecks`（条目 2），你接受一些不便（需要注释 null 类型并进行 null 检查）以换取增加的表达能力。

正如我们之前看到的，TypeScript 作为一个整体绝对不是健全的。事实上，健全性根本不是 TypeScript 的设计目标。相反，它更倾向于便利性和与现有 JavaScript 库协作的能力。

尽管如此，不健全性可能导致崩溃、错误甚至数据损坏，你应该在可能的情况下避免它。未检查的数组访问是一个众所周知的不健全性陷阱，但 TypeScript 中还有许多其他陷阱。本条目的其余部分将介绍 TypeScript 中一些不健全性的来源，并展示如何重构代码以避免它们。

### any

如果你"给它加上 `any`"，那么什么都可能发生。静态类型可能与真实的运行时类型有关，也可能无关：

```ts
function logNumber(x: number) {
  console.log(x.toFixed(1)) // x is a string at runtime
  //          ^? (parameter) x: number
}
const num: any = 'forty two'
logNumber(num) // no error
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAGzgcwHIgLYCMCmATgBQAeAXImDgYQJSIDeAUIohAgM5zL4B0qNGT5Q4AMRil8AE2IBGOnQDcbAPSrEpRDE6IAhok5RCMMGn1REhcLGz5WidW2cvEAPQD8iYgAc9hPTsoIgYKKhoiZgBfZg4wI3DsSj0wAE9EAF5EAHJgOEIodKgAdzhspWZBLDwiYmpsZTUNMDhEIkJ85iA)

这里没有类型错误，但这段代码会在运行时抛出异常。

解决方案很简单：限制你对 `any` 的使用，或者更好的是，根本不要使用它！本章有很多关于如何缓解和避免 `any` 这种静态类型灾难的建议，但要点是限制 `any` 的作用域，并在可能的情况下使用 `unknown` 作为更安全的替代方案。对于像 `JSON.parse` 这样返回 `any` 类型的内置函数，条目 71 会向你展示如何使用声明合并来获得更安全的替代方案。

### 类型断言

`any` 的稍微不那么令人反感的表亲是"类型断言"。我们已经在条目 9 中讨论过这个问题，但这里是对它的回顾：

```ts
function logNumber(x: number) {
  console.log(x.toFixed(1))
}
const hour = new Date().getHours() || null
//    ^? const hour: number | null
logNumber(hour)
//        ~~~~ ... Type 'null' is not assignable to type 'number'.
logNumber(hour as number) // type checks, but might blow up at runtime
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAGzgcwHIgLYCMCmATgBQAeAXImDgYQJSIDeAUIohAgM5zL4B0qNGT5Q4AMRil8AE2IBGOnQDczAL7MOYTlEQALOCEKIAvImJh8Ad0QARAIZR8xRXzT4oACQOFOzxAB9-KhBkZBUAenC2NgA9AH52Lh19Q0pqPCIA4NDmQSwMkhT6CKjosoA-SvLEPlrEABUATwAHfEQAcmpQ9sQYTio4HTtOThg0MDtcXkRRGZa2zpoidr5c9HzaYiLEYeCC5TZIudb2XXwIAGtOABpEXBAdbDHdHSm4axBmnZ1CcFhsfDMIA)

最后一行中的 `as number` 是类型断言，它让错误消失了。

你能对此做什么？你可以用条件语句（if 语句或三元运算符）替换许多断言：

```ts
if (hour !== null) {
  logNumber(hour) // ok
  //        ^? const hour: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAGzgcwHIgLYCMCmATgBQAeAXImDgYQJSIDeAUIohAgM5zL4B0qNGT5Q4AMRil8AE2IBGOnQDczAL7MOYTlEQALOCEKIAvImJh8Ad0QARAIZR8xRXzT4oACQOFOzxAB9-KhBkZBUAenC2NgA9AH52Lh19Q0pqPCIA4NDmQSwMkhT6CKjosoA-SvLEPlrEABUATwAHfEQAcmpQ9sQYTio4HTtOThg0MDtcXkRRGZa2zpoidr5c9HzaYiLEYeCC5TZIudb2XXwIAGtOABpEXBAdbDHdHSm4axBmnZ1CcFhsfDMGDAMzbACExlMXWQDBYbDyS0K3gOiCOcAurFRpTKsQSmm0em8aURamYQA)

在 if 块内，`hour` 的静态类型基于条件被收窄，所以不需要类型断言（有关收窄的更多信息，请参见条目 22）。

类型断言经常出现在输入验证的上下文中。采用系统性的方法来保持 TypeScript 类型和运行时验证逻辑同步是一个好主意。条目 74 将带你了解你的选择。

### 对象和数组查找

即使在严格模式下，TypeScript 也不会对数组查找进行任何边界检查。正如我们在本条目介绍中看到的，这可以直接导致不健全性和运行时错误。

当你使用索引类型引用对象上的属性时，同样的情况也可能发生：

```ts
type IdToName = { [id: string]: string }
const ids: IdToName = { '007': 'James Bond' }
const agent = ids['008'] // undefined at runtime.
//    ^? const agent: string
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAkgJgFQPYDkCGBbaBeKBvKAbQEs4AuKAZ2ACdiA7AcwF0Lq6moBfAbgCgAxknrUopShXjJ0WKLjwByAAxKA7AooKAUpgiUoAIWFwFvQcNFpGEesDli4lQsqUAOBcx5QoAeh9QAV3o4CAAzBgg4KDQ7GiDgYiwAOj4-b28APQB+KCEROysbYDZaBkY+IA)

为什么 TypeScript 允许这种代码？因为它非常常见，而且很难证明任何特定的索引/数组访问是否有效。如果你希望 TypeScript 尝试，有一个 `noUncheckedIndexedAccess` 选项。如果你打开它，它会发现介绍中示例的错误，但也会标记完全有效的代码：

```ts
const xs = [1, 2, 3]
alert(xs[3].toFixed(1)) // invalid code
//    ~~~~~ Object is possibly 'undefined'.
alert(xs[2].toFixed(1)) // valid code
//    ~~~~~ Object is possibly 'undefined'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noUncheckedIndexedAccess=true#code/MYewdgzgLgBAHhGBeGBtAjAGhgJmwZgF0BuAKAEMAbAUwCcoAKBVIgOihADEBLOagEwboAlMOIwYAekkxuYAG5Vu-GKH7VS0iRIB+evTADyAIwBW1YLG6IADiAgRuxygE8YAcgCuYdQDM5Au6sFDT0TBCoOITsXLwCQqLiUjKKlMqqIOqaMtr6BibmlrK29o7Obl4+1P5ggcFAA)

这个选项让你在健全性与便利性的谱系中移动到不同的位置：TypeScript 能够捕获更多错误，但使用起来不太方便，因为它也会标记不是错误的代码。`noUncheckedIndexedAccess` 至少足够聪明，能够理解一些常见的数组构造：

```ts
const xs = [1, 2, 3]
for (const x of xs) {
  console.log(x.toFixed(1)) // OK
}
const squares = xs.map((x) => x * x) // also OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAHhGBeGBtAjAGhgJmwZgF0BuAKADMQAnGAClEljhhHPggEoYBvUmGBhBAAbAKYA6YSADmtOOKggAYgEs4ogCa10HDsX4B6AzADyAaVIBfUoNgQAjgFcAhlVGIUCcQFtnABzlkAD54GAAqeD1DY2dhIVMLIA)

如果你担心对特定数组或对象的不安全访问，你可以显式地将 `undefined` 添加到它们的值类型中：

```ts
const xs: (number | undefined)[] = [1, 2, 3]
alert(xs[3].toFixed(1))
//    ~~~~~ Object is possibly 'undefined'.

type IdToName = { [id: string]: string | undefined }
const ids: IdToName = { '007': 'James Bond' }
const agent = ids['008']
//    ^? const agent: string | undefined
alert(agent.toUpperCase())
//    ~~~~~ 'agent' is possibly 'undefined'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAHhAXDAFGArgWwEYFMBOMAPjOmACa4BmAlmLuQJQDaAujALwzMCMANDABMAgMysA3ACgAhgBsCUFAmZiAdFBAAxGnAYoejRlID0xmOZgA-a9ZgB5bACtcwWDQgwADiAgQa2WQBPGAByMkpaenIQ1UlJKEDPXBgASXIAFRAAOWlMZK4Ab24acmRofDoAc1YyqAqwSuJSCmo6BhgAXylQSDdyJFSM7Nz8mAKQgAYJgHYQ5BCAKRGPACFwaK7JHugYaUrcMFguEohmSYmADhCJSVMLGAA9AH4Ybdg9g6ha+saScNaojJ5PhFB9DuoQABVTxJfAAYWkEFwKEMJjMFhsthCYKgIRg7i8Pj8AWCYRakQYMUkQA)

这种方法相对于 `noUncheckedIndexedAccess` 的优势是，它让你可以限制该标志的作用域（以及可能的误报）。缺点是它缺乏该标志的智能：for-of 循环会给你带来错误。它还引入了你可能将 `undefined` 推入数组的可能性。

最后，通常可以重构代码以减少对这些查找的需求。与其将索引或键传递给函数，尝试使用它们引用的对象。

### 不准确的类型定义

JavaScript 库的类型声明就像一个巨大的类型断言：它们声称静态地建模库的运行时行为，但没有什么能保证这一点。（除非，也就是说，库是用 TypeScript 编写的，声明是由 `tsc` 生成的，并且库没有不健全的类型！）

很难在这里展示当前的例子，因为一旦你突出显示这些类型的错误，它们往往会被修复，特别是对于 DefinitelyTyped（@types）上的声明。但一个著名的历史例子是 @types/react 中的 React.FC 定义，它让 UI 组件接受 children，即使这在逻辑上没有意义。

你如何解决这个问题？最好的方法是修复错误！对于 DefinitelyTyped 上的类型，这通常需要一周或更短的时间。如果这不是一个选项，你可以通过增强或在最坏的情况下通过类型断言来解决一些问题。

还值得注意的是，一些函数的类型很难静态建模。看看 `String.prototype.replace` 的参数列表，这是一个令人困惑的例子：

```ts
'foo'.replace(/f(.)/, (fullMatch, group1, offset, fullString, namedGroups) => {
  console.log(fullMatch) // "fo"
  console.log(group1) // "o"
  console.log(offset) // 0
  console.log(fullString) // "foo"
  console.log(namedGroups) // undefined
  return fullMatch
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/OQMw9mwHQE4KYAcA2BDAxnAFAehJqAlNgDQAEmIArkkgLIoAuaAFmQOYxiUICMZYIEAGc4DMlRoBlBjACWAOzZl5KALZwAJgHFO3IQVIBeAHykA3gChSpNGHlCwSOFCRg2FanUYsCAbmvY2KQARODBVjZ2Dk4ubpgcXLx+AUHBYOHWtvaOzq7uAsKiyaSBpAAMEVnRuXESSNJyismloRAZkdkxeZgq6tq6CPr+JUGU8hpwIAqaEfAMlDDypHX0TMy+FgC+fhZAA)

如果你对 `offset` 参数感兴趣，它的位置将取决于正则表达式中捕获组（括号表达式）的数量。TypeScript 没有正则表达式字面量类型的概念，所以无法静态确定捕获组的数量。所以回调参数得到 `any` 类型。

还有一些函数由于历史原因被错误地类型化，例如 `Object.assign`。如果这给你带来麻烦，条目 71 有一个修复方案。

类型声明建模的不仅仅是 JavaScript 库。它们还描述了代码运行的环境：预期的 JavaScript 运行时和其他全局环境。条目 76 有更多关于创建环境准确模型重要性的内容。

### 类层次结构中的双变性

函数类型的可赋值性很难思考。它对返回类型和参数类型的工作方式略有不同。对于返回类型，可赋值性的工作方式与任何其他类型完全一样：

```ts
declare function f(): number | string
const f1: () => number | string | boolean = f // OK
const f2: () => number = f
//    ~~ Type '() => string | number' is not assignable to type '() => number'.
//         Type 'string | number' is not assignable to type 'number'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtVIAoBKALnlWQFsAjEGeAH3gGcMYtUBzAbgCgw8rJAEYyxeAF4AfOSq16TVuy6N41HDgggo+CUm7x4AeiPwA8gGl+gjEgBMYopJkUadSft4nDhgH6-4ABUATwAHBABycWkWNg5OVVd5CPgsZnIcWyhmZixOVChqLXgMHBKwyOiXOToIgDovUx9moIr4CKV4xJqYFLSMrJy8gqKEUvLw9qTahqA)

这是有道理的：如果你调用一个期望返回数字的函数，但该函数也可能返回字符串，那么麻烦就会随之而来。我们说函数在其返回类型上是协变的。

参数类型则相反：

```ts
declare function f(x: number | string): void
const f1: (x: number | string | boolean) => void = f
//    ~~
// Type 'string | number | boolean' is not assignable to type 'string | number'.
const f2: (x: number) => void = f // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtVIAoAPALnlWQFsAjEGeAH3gGcMYtUBzASjIDccWYAG4AUGDyskARjLEyFGnUYs2HTiuo4cEEFFTd4AXgB88AUONIxAehvwH8AH5PRd+ABUAngAcEAclZ2LhVFWnomLR09VH94LGZyHAx4KGZmLE5UKGpdeAwcfN8AoPVQqnD-ADpxSRTEACY5UnIKukNTc0FgK0RhB3cAeQBpUSA)

这也有道理：你不应该能够用 boolean 调用期望 `number|string` 的函数。函数在其参数类型上是逆变的。

现在让我们看看当我们将这应用到类时会发生什么：

```ts
class Parent {
  foo(x: number | string) {}
  bar(x: number) {}
}
class Child extends Parent {
  foo(x: number) {} // OK
  bar(x: number | string) {} // OK
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEAKYCcCmA7ALtA3gKGtAZgPaEAUAHgFzQoCuAtgEZILQA+0EaCAligOYBKLAF9c0BonJVajZkMyjRoSDADCAC24gAJtCRk0qbTHjJ0WMUVKVq9JgnnC8AemfQA8gGkxEhFNuyLOycPPyOLm5e2KJAA)

回想条目 7，类或接口上的 `extends` 可以读作"的子类型"。但在这种情况下，考虑到我们刚刚学到的关于函数可赋值性的知识，Child 上的两个方法之一肯定应该是错误。由于函数在其参数类型上是逆变的，Child 的 foo 方法不应该可赋值给 Parent 的 foo。

你可以适应这种形式的不健全性来获得未检测到的异常：

```ts
class FooChild extends Parent {
  foo(x: number) {
    console.log(x.toFixed())
  }
}
const p: Parent = new FooChild()
p.foo('string') // No type error, crashes at runtime
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEAKYCcCmA7ALtA3gKGtAZgPaEAUAHgFzQoCuAtgEZILQA+0EaCAligOYBKLAF9c0BonJVajZkMyjRoSDABixAMIALbiAAm0JGTSo9MeMnR4ceIqUrV6TBPLF5ghFBEIgkAOhBCPnI-NEJVbjIkPRIBAQBuMUVsDy8MAAcqC1QMAF5qJAB3aHVCbV0YhOx0vzsSAHJOHn56hLwAenboADlCaDQAT3SkQwQEQgQAGmhgBEgtJBgwDAQadG46JGwgA)

TypeScript 将类上的方法建模为双变的：如果父方法或子方法中的任何一个可赋值给另一个，那么它就是有效的。历史上这是所有函数赋值建模的方式。但随着 2017 年 TypeScript 2.6 中引入的 `strictFunctionTypes`，独立函数类型被更准确地处理。

在实践中，这意味着当你从类继承时，你需要格外小心以获得正确的方法签名。通常，子类应该与其父类具有完全相同的方法签名。但如果你更改父类的签名并期望所有子实现都出现类型错误，它们可能会随着时间的推移而不同步。要注意这一点！当你更改层次结构中类的方法签名时，检查任何父类或子类上的相同方法。

### TypeScript 对对象和数组变性的不准确建模

这个在网上被广泛讨论。以下是它如何工作的标准例子：

```ts
function addFoxOrHen(animals: Animal[]) {
  animals.push(Math.random() > 0.5 ? new Fox() : new Hen())
}

const henhouse: Hen[] = [new Hen()]
addFoxOrHen(henhouse) // oh no, a fox in the henhouse!
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAECCB2BLAtmE0DeBfAUD0kMAYgPYAe0ApmQC6XwAmMCKamO00iEpZAXNBoAnAK6VoAXkGjKAbg5cIACXoCAZmgjipGkFvm584KNBXwqtekzhJU6DAu691m7dF37Hy1dLGTfcji4aiLwwDSIJOZgDAy8APJCZgAUYLaaAix2ANoAugCU7JxprHoAdAAOIhAAFskAsmA0NWVCaQwkyMmFAHzQAAxlAKzQAPzQ8JQA7tC83dACkzMp+fkGeMBREDTQNfQ1JNWUAmZ5-tlLpvTdufIxceSJKXvwB0dr0AD0n9AkNRMkAA00DA7nIXHMzXELzeWgAhDggA)

问题是，只有在你不修改数组的情况下，将 `Hen[]` 赋值给 `Animal[]` 才是安全的。换句话说，只有 `readonly Hen[]` 应该可赋值给 `readonly Animal[]`。不过，TypeScript 并不总是有 `readonly`，在早期它选择允许这种代码。也许将来会有一个新的严格选项来处理这种不健全性来源。

你能对此做什么？最好不要修改函数参数，你可以用 `readonly` 注释来强制执行（条目 14）：

```ts
function addFoxOrHen(animals: readonly Animal[]) {
  animals.push(Math.random() > 0.5 ? new Fox() : new Hen())
  //      ~~~~ Property 'push' does not exist on type 'readonly Animal[]'.
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAECCB2BLAtmE0DeBfAUD0kMAYgPYAe0ApmQC6XwAmMCKamO00iEpZAXNBoAnAK6VoAXkGjKAbg5cIACXoCAZmgjipGkFvm584KNBXwqtekzhJU6DAu691m7dF37Hy1dLGTfcji4aiLwwDSIJOZgDAy8APJCZgAUYLaaAkKUMVEgAJ42rCAA2gC6AJTsnGlFEAB0AA4iEAAWyQCyYDQtdUJpDCTIyZUAfNAADHUArNAA-NDwlADu0LzD0AKLKynl5fKcAPQHnCfQAH4XZ9AACkIkDZRCNAUA5E2tL9ADlDDwJDQWbgAqKCPIPaAvLI5eD5Qp2MovOpBHBAA)

你可以通过重写初始示例来完全回避这个问题，让函数返回一个 `Animal`，而不是将其添加到数组中：

```ts
function foxOrHen(): Animal {
  return Math.random() > 0.5 ? new Fox() : new Hen()
}

const henhouse: Hen[] = [new Hen(), foxOrHen()]
//                                  ~~~~~~~~~~ error, yay! Chickens are safe.
// Type 'Animal' is missing the following properties from type 'Hen': ...
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAECCB2BLAtmE0DeBfAUD0kMAYgPYAe0ApmQC6XwAmMCKamO00iEpZAXNBoAnAK6VoAXkGjKAbg5cIACXoCAZmgjipGkFvm584KNBXwqtekzhJU6DAu691m7dF37Hy1dLGTfcji4aiLwwDSIJOZq5ADyQmYAFACUAix27JxClDQiQuYAsmA0ABYAdEJgjCTIKdAAfNAADGUArNAA-NDwlADu0Lx1Aj39SckGeMBREDTQJfQlJCJaAmYA2gC6-msjpvQpADTucQn7yRvyAPSXnLd39w+PjwB+r2-vVEJCJEJHAJ5gP4AQmgAGESohgABregwMDZaAQMBqShlHDXaAAFT+AAdxABydJofGKaDIbgQRDwADmgnmxxAIBIvSptJx3zxQgilBgam+yEEuIJZnxAjK4pwQA)

你可能会遇到类似的问题，任何被函数修改的对象，不仅仅是数组。如果你为对象创建别名（条目 23）并修改它，那么即使没有函数调用，你也可能遇到麻烦。

虽然变性很难思考，但这里的教训很简单：避免修改函数参数！为了确保你不这样做，将它们声明为 `readonly` 或 `Readonly`。

### 函数调用不会使细化失效

以下是一些乍一看不太可疑的代码（至少从类型安全的角度来看）：

```ts
interface FunFact {
  fact: string
  author?: string
}

function processFact(fact: FunFact, processor: (fact: FunFact) => void) {
  if (fact.author) {
    processor(fact)
    console.log(fact.author.blink()) // ok
    //               ^? (property) FunFact.author?: string
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAECCB2BLAtmE0DeBfAUD0kMAYgPYAe0ApmQC6XwAmMCKamO00iEpZAXNBoAnAK6VoAXkGjKAbg5cIACXoCAZmgjipGkFvm584KNBXwqtekzhJU6DAu691m7dF37Hy1dLGTfcji4iPB0QhrA4kQi8ERgwDTsnBE0AhDCIQDm8pxgIjQAFiRCAPxpGfDZQXhqMQmIJOYADkIkkVBxCQAUKQLRsfE0ADTQLW2UUMUCPYN9MZ00AJSSAHzQAG4kiAzLDpyIatAzCQB0eYXFuwqcY+0QxcdLOZzQwI33IJQnICSZj2f5IpCE4AIxAIQA1l1FotZJwAPTw6AkCHXaCIl6YrEvAB6JSOYyalCENAAnst+gsARdSuUhFkFLhcEA)

然而，根据 `processor` 做什么，对 `blink()` 的调用可能在运行时抛出：

```ts
processFact(
  { fact: 'Peanuts are not actually nuts', author: 'Botanists' },
  (f) => delete f.author
)
// Type checks, but throws `Cannot read property 'blink' of undefined`.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAECCB2BLAtmE0DeBfAUD0kMAYgPYAe0ApmQC6XwAmMCKamO00iEpZAXNBoAnAK6VoAXkGjKAbg5cIACXoCAZmgjipGkFvm584KNBXwqtekzhJU6DAu691m7dF37Hy1dLGTfcji4iPB0QhrA4kQi8ERgwDTsnBE0AhDCIQDm8pxgIjQAFiRCAPxpGfDZQXhqMQmIJOYADkIkkVBxCQAUKQLRsfE0ADTQLW2UUMUCPYN9MZ00AJSSAHzQAG4kiAzLDpyIatAzCQB0eYXFuwqcY+0QxcdLOZzQwI33IJQnICSZj2f5IpCE4AIxAIQA1l1FotZJwAPTw6AkCHXaCIl6YrEvAB6JSOYyalCENAAnst+gsARdSuUhFkFLhcLcJjxBl0FBhetAAOQABUoYHg+RgYCE4ngJESgxEaBApOgwpoEB5I3OQIEPIAQlKhdxlTysEMFIcJGsGJRPnR3NSgThYTgMQAVUlE14FSjACEQEYg-KCAqtADuMAABgBhIWSxLisAMUatIkkhU8sGQnnIw4xC1qEKUBihk44IA)

问题是 `if (fact.author)` 将 `fact.author` 的类型从 `string|undefined` 细化为 `string`。这是健全的。然而，对 `processor(fact)` 的调用应该使这种细化失效。`fact.author` 的类型应该恢复到 `string|undefined`，因为 TypeScript 无法知道回调会对我们细化的 fact 做什么。

为什么 TypeScript 允许这个？因为大多数函数不会修改它们的参数，这种模式在 JavaScript 中很常见。

你如何避免这个？再次，不要修改你的函数参数！你可以通过向它们传递对象的 `Readonly` 版本来强制执行回调这样做（条目 14）。

### 可赋值性和可选属性

重要的是要记住，TypeScript 类型中的对象类型不是"密封的"：它们可能具有你声明之外的属性（条目 4）。当与可选属性结合时，这可能导致不健全性。

这可能是如何发生的：

```ts
interface Person {
  name: string
}
interface PossiblyAgedPerson extends Person {
  age?: number
}
const p1 = { name: 'Serena', age: '42 years' }
const p2: Person = p1
const p3: PossiblyAgedPerson = p2
console.log(`${p3.name} is ${p3.age?.toFixed(1)} years old.`)
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAECCB2BLAtmE0DeBfAUD0kMAYgPYAe0ApmQC6XwAmMCKamO00iEpZAXNBoAnAK6VoAXkGjKAbg5cIACXoCAZmgjipGkFvm584KNBXwqtekzhJU6DAu691m7dF37Hy1dLGTfcji4iPB0QhrA4kQi8ERgwDTsnBE0AhDCIQDm8pxgIjQAFiRCAPxpGfDZQXhqMQmIJOYADkIkkVBxCQAUKQLRsfE0ADTQLW2UUMUCPYN9MZ00AJSSAHzQAG4kiAzLDpyIatAzCQB0eYXFuwqcY+0QxcdLOZzQwI33IJQnICSZj2f5IpCE4AIxAIQA1l1FotZJwAPTw6AkCHXaCIl6YrEvAB6JSOYyalCENAAnst+gsARdSuUhFkFLhgqFiRFxAAFYn3cx7aDwMDISh0rIGHAhMJs6DskhQRBg0mwTKUBicoTcix0RgwVXq3lgJVlPkiZAg4mit7wdKjACM-gwfIFQugACIAMrE+hgZ0jfVO50AFgATNBSZQwGrndAsPILVamoGBDrGv4mtaY+9Ek0AMyJmUQOUgBVKlVc5NSePpy0kT7fX5dAAGABIMNmTvzBVhFNBm63fSUTjQSEREGRlV1rYtO6HwzBqwwTvXYTggA)

从 `p1` 到 `p2` 的赋值绕过了多余属性检查（条目 11）。`p2` 的静态类型是 `Person`。这是健全的，因为类型 `{name: string; age: string}` 可赋值给 `Person`。使用结构类型，拥有额外属性是可以的。

对 `p3` 的赋值是我们失去健全性的地方。如果你认为类型是密封的，没有额外属性，那么这个赋值应该是允许的：`Person` 不会有 `age` 属性，由于这个属性在 `PossiblyAgedPerson` 上是可选的，那就可以了。但类型不是密封的，正如这里发生的那样，它们可能有与可选属性类型不兼容的额外属性。

如果你遇到这个问题，可能是因为你在过于通用的属性名称（例如 `type`）之间发生了名称冲突。尝试选择更具体的属性名称。在这个例子中将属性命名为 `ageInYears` 和 `ageFormatted` 会防止这个错误。

不健全性只是可选属性问题中的一个。条目 37 讨论了在添加可选属性之前应该仔细考虑的其他原因。

TypeScript 中还有其他一些不健全性来源，但这些是你在实践中最可能遇到的。记住，不健全性不是语言的缺陷。它反映了关于 TypeScript 希望在便利性、表达能力和安全性谱系中定位的选择。如果你想移动到该谱系中的不同点，你有一些旋钮可以让你这样做（例如 `strictNullChecks` 和 `noUncheckedIndexedAccess`）。否则，要注意导致不健全性的常见模式并尝试避免它们。

## 要点回顾

- "不健全性"（Unsoundness）是指符号的运行时值与其静态类型不一致。这可能导致崩溃和其他不良行为，而没有类型错误的提示。
- 注意常见的不健全性来源：`any` 类型、类型断言（`as`、`is`）、对象和数组查找，以及不准确的类型定义。
- 避免修改函数参数，因为这可能导致不健全性。如果不打算修改它们，请将参数标记为只读（`readonly`）。
- 确保子类的方法声明与父类匹配。
- 注意可选属性可能导致不健全类型。

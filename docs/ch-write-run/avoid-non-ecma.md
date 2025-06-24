# Item 72: 优先使用 ECMAScript 特性而非 TypeScript 特性

## 要点

- 总的来说，你可以通过移除代码中的所有类型来将 TypeScript 转换为 JavaScript。
- 枚举、参数属性、三斜杠导入、实验性装饰器和成员可见性修饰符是这条规则的历史例外。
- 为了尽可能清晰地保持 TypeScript 在代码库中的作用，并避免未来的兼容性问题，请避免使用非标准特性。

## 正文

TypeScript 和 JavaScript 之间的关系随着时间的推移而改变。当微软在 2010 年首次开始开发 TypeScript 时，围绕 JavaScript 的主流态度是它是一门有问题的语言，需要被修复。框架和源码到源码编译器为 JavaScript 添加缺失的特性（如类、装饰器和模块系统）是很常见的。TypeScript 也不例外。早期版本包含了自制的类、枚举和模块版本。

随着时间的推移，管理 JavaScript 的标准机构 TC39 将这些相同的特性添加到了核心 JavaScript 语言中。而他们添加的特性与 TypeScript 中存在的版本不兼容。这让 TypeScript 团队陷入了尴尬的困境：采用标准中的新特性还是维护现有代码？

TypeScript 在很大程度上选择了前者，并最终阐明了其当前的治理原则：TC39 定义运行时，而 TypeScript 仅在类型空间中进行创新。

在这个决定之前还有一些剩余的特性。识别和理解这些特性很重要，因为它们不符合语言其余部分的模式。一般来说，我建议避免使用它们，以尽可能清晰地保持 TypeScript 和 JavaScript 之间的关系。这也将确保你的代码与替代的 TypeScript 编译器兼容，并且不会因为未来的标准对齐而破坏。

如果你遵循这个建议，你可以将 TypeScript 视为"带类型的 JavaScript"。

### 枚举

许多语言使用枚举或 enums 来建模可以取一小部分值的类型。TypeScript 将它们添加到 JavaScript 中：

```ts
enum Flavor {
  Vanilla = 0,
  Chocolate = 1,
  Strawberry = 2,
}

let flavor = Flavor.Chocolate
//  ^? let flavor: Flavor

Flavor // Autocomplete shows: Vanilla, Chocolate, Strawberry
Flavor[0] // Value is "Vanilla"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/KYOwrgtgBAYgNgQwG4HsBOUDeAoKUBqCIAlnIlALxQAMANLlAMIAWKAxiogC7CVQCM9PAGUuaBAHcARsDRoAnnwBM9AL7ZscYFygAzRKgxV4ydADoW7Tgh4BubAHoHeAHoB+KFp37TaAFywBugaJoZ4TlAAgmBcVhAADl68AM6sEskBhCRkCLRMrBzcwHmi4tKyCtih6ADa1AC64c6EcGC8xMlQAERZpIhd2EA)

支持枚举的论点是它们比裸数字提供更多的安全性和透明度。但 TypeScript 中的枚举有一些怪癖。实际上有几种枚举变体，它们都有微妙的不同行为：

- **数字值枚举**（如 Flavor）：数字类型可以赋值给它，所以不是很安全。（这样设计是为了使位标志结构成为可能。）
- **字符串值枚举**：这确实提供了类型安全，并且在运行时也有更多信息性的值。但它不是结构类型化的，与 TypeScript 中的每个其他类型不同（稍后会详细介绍）。
- **const enum**：与常规枚举不同，const 枚举在运行时完全消失。如果你在前面的例子中改为 `const enum Flavor`，编译器会将 `Flavor.Chocolate` 重写为 `1`。这也打破了我们对编译器行为的期望，并且仍然存在字符串和数字值枚举之间的不同行为。
- **设置了 preserveConstEnums 标志的 const enum**：这会为 const 枚举发出运行时代码，就像常规枚举一样。

字符串值枚举是名义类型化的，这特别令人惊讶，因为 TypeScript 中的每个其他类型都使用结构类型化进行可赋值性（Item 4）：

```ts
enum Flavor {
  Vanilla = 'vanilla',
  Chocolate = 'chocolate',
  Strawberry = 'strawberry',
}

let favoriteFlavor = Flavor.Chocolate // Type is Flavor
favoriteFlavor = 'strawberry'
// ~~~~~~~~~~~ Type '"strawberry"' is not assignable to type 'Flavor'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/KYOwrgtgBAYgNgQwG4HsBOUDeAoKUBqCIAlnIlALxQDkSRpi1ANLlAMIAWKAxiogC7BKNbl14DgzVgGV+aBAHcARsDRoAnsOoBnOYpVr1UgL7ZscYPygAzZOmKD4djFSeo0AOk48+CQQG48AHogqAAVdQAHIWJtWER3bFt3B2A3dC1deWVVDWp-bBCoAD9SsvLi8KihagAiLP1c9VrqKFioEBQrBG1tYgBzEAQlCyh+FDHqmnS0amwgA)

当你发布库时，这会产生影响。假设你有一个接受 Flavor 的函数：

```ts
function scoop(flavor: Flavor) {
  /* ... */
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/KYOwrgtgBAYgNgQwG4HsBOUDeAoKUBqCIAlnIlALxQDkSRpi1ANLlAMIAWKAxiogC7BKNbl14DgzVgGV+aBAHcARsDRoAnsOoBnOYpVr1UgL7ZscYPygAzZOmKD4djFSeo0AOk48+CQQG48AHogqAAVdQAHIWJtWER3bFt3B2A3dC1deWVVDWp-bBCoAD9SsvLi8KihagAiLP1c9VrqKFioEBQrBG1tYgBzEAQlCyh+FDHqmnS0aiSwEG5+YhQQKG1eFEiACmsE9AAueOcASiwoIIAqKA9bqEvQ0yA)

因为 Flavor 在运行时实际上只是一个字符串，你的 JavaScript 用户用字符串调用它是可以的：

```ts
scoop('vanilla')
//    ~~~~~~~~~ '"vanilla"' is not assignable to parameter of type 'Flavor'

import { Flavor } from 'ice-cream'
scoop(Flavor.Vanilla) // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYWwDg9gTgLgBAbwM4GMITAXzgMyhEOAcmBQFMBaFKMgQxCIG4AoVdMACiIDdaA7YABtBtIgEoWAeklxZcAH6KlS4gCJeA4bVVE4wJHD4R4tJEmABzPrQBGgsnBgQ4YWlHpkYZKHAg5HAJ5gDkQAYiLc0ETMzKCQsIjhtJFQ2HgExKSU1HQMLGwYHEkpAHQAavxCIhKy0nAA8gDSzEA)

JavaScript 和 TypeScript 用户的这种不同体验是避免字符串值枚举的原因。

TypeScript 提供了枚举的替代方案，这在其他语言中不太常见：字面量类型的联合。

```ts
type Flavor = 'vanilla' | 'chocolate' | 'strawberry'

let favoriteFlavor: Flavor = 'chocolate' // OK
favoriteFlavor = 'americone dream'
// ~~~~~~~~~~~ Type '"americone dream"' is not assignable to type 'Flavor'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAYgNgQwG4HsBOUC8UDkSEB2AlnIjlAD64DGAFitSosBOVTgM7BoIDuARhDRoQOANwAoCXAjAoAM2ToiLeErQAuWIlQZsOOgyYIW4qFAD0FqAHkA0hMW6VENbqy4EAWyFFGBaAATNAhvcQkrKAA-GNi4qKgAFXBoHAAib19-IJDvNPIiDigCFDkEDg4iAHMCBH4ZKGAURpTcN3QcCSA)

这提供了与枚举一样的安全性，并且具有更直接地转换为 JavaScript 的优势。它还在你的编辑器中提供自动完成功能，如图 9-1 所示。

![图 9-1. TypeScript 为字符串字面量类型的联合提供自动完成。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506240838026.png)

关于字符串字面量类型联合的更多信息，请参见 Item 35。

那么像我们最初定义的 Flavor 这样的数字枚举呢？如果你有选择，强烈考虑使用字符串作为你的值。数字枚举不提供你期望的安全性，而且它们比字符串更难处理。你更愿意在 JavaScript 调试器或网络请求中看到 `{"flavor": 1}` 还是 `{"flavor": "chocolate"}`？

### 参数属性

在初始化类时，将构造函数参数分配给属性是很常见的：

```ts
class Person {
  name: string
  constructor(name: string) {
    this.name = name
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEAKCmAnCB7AdtA3gKGtNYAtvAFzQQAuiAlmgOYDcu0w6liArsBSogBQFiZdrToBKLMzwUAFtQgA6QfGgBefEXhM8AX2x6gA)

TypeScript 为此提供了更紧凑的语法：

```ts
class Person {
  constructor(public name: string) {}
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEAKCmAnCB7AdtA3gKGtY6EALogK7BEqIAUADqQEYgCWw0aYAtvAFzTGJmaAOYBKLAF9sUoA)

这被称为"参数属性"，它与第一个例子中的代码等价。使用参数属性时需要注意几个问题：

- 它们是少数在编译为 JavaScript 时生成代码的构造之一（枚举是另一个）。通常，编译只涉及擦除类型。
- 因为参数只在生成的代码中使用，源代码看起来有未使用的参数。
- 参数和非参数属性的混合可以隐藏类的设计。

例如：

```ts
class Person {
  first: string
  last: string
  constructor(public name: string) {
    ;[this.first, this.last] = name.split(' ')
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEAKCmAnCB7AdtA3gKGtAZgJbIAuAXNBCYoWgOYDcu04VFVN9Tew6HArsBIpEACgAO-AEYhCwaGjABbeO2q06ASizM8AbRIALQhAB0RUgBpoRk6dYkAutAC8C5fFMRxskqIDk0P6a3NAAvtgRQA)

这个类有三个属性（first、last、name），但这很难从代码中读出来，因为只有两个在构造函数之前列出。如果构造函数还接受其他参数，这会变得更糟。

如果你的类只包含参数属性而没有方法，你可以考虑将其设为接口并使用对象字面量。记住，由于结构类型化（Item 4），两者可以相互赋值：

```ts
class PersonClass {
  constructor(public name: string) {}
}
const p: PersonClass = { name: 'Jed Bartlet' } // OK

interface Person {
  name: string
}
const jed: Person = new PersonClass('Jed Bartlet') // also OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEAKCmAnCB7AdgYXFaBvAUNNMOhAC6ICuwZKiAFAA6UBGIAlsNGmALbwAuaOUTs0AcwCUeAL745JNOWiMhCZOiyQYAXjzc+g6AHIAUvAAm0AEJhEZEPDLHoMgNxEA9J+gB5ANL4+GJkSABmYMDwcEioaHiEBvxCImLibvL4isoAVpZqsejQemjwAO4xGpjYEPRmljZ2Dk7Gkh7Q3tBgIKh+gUA)

关于参数属性的意见存在分歧。虽然我通常避免使用它们，但其他人欣赏节省的按键。要注意，它们不符合 TypeScript 其余部分的模式，实际上可能会对新开发者隐藏这种模式。尽量避免在参数和非参数属性的混合背后隐藏类的设计。

### 命名空间和三斜杠导入

在 ECMAScript 2015 之前，JavaScript 没有官方的模块系统。不同环境以不同方式添加了这个缺失的特性：Node.js 使用 `require` 和 `module.exports`，而在浏览器中，AMD 系统使用带有回调的 `define` 函数。

TypeScript 也用自己的模块系统填补了这个空白。这是使用 `module` 关键字和"三斜杠"导入完成的。在 ECMAScript 2015 添加了官方模块系统后，TypeScript 添加了 `namespace` 作为 `module` 的同义词，以避免混淆：

```ts
// other.ts
namespace foo {
  export function bar() {}
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEHsBcAsFMCcB0kDOAoAdgQwLaxQA5YDGsoAZuOKAN5qiiwAeB48kFArhsZAJbgMoAEZZ4ACgCUtAL5o5QA)

```ts
// index.ts
/// <reference path="other.ts"/>
foo.bar()
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEEsDsBMFMA8B0AXAzgKBGAPAJ1gGaz6QDGsoADgIbIAWAvAEQD29xKqTwAfOgSxaIARtVwAKAJQBudEA)

在类型声明文件之外，三斜杠导入和 `module` 关键字只是一个历史奇观。在你自己的代码中，你应该使用 ECMAScript 2015 风格的模块（`import` 和 `export`）。

### 实验性装饰器

装饰器可用于注释或修改类、方法和属性。如果一个符号前面有 `@` 符号，那么它就是一个装饰器。它们在 Angular 和其他几个框架中很常见。

2015 年，TypeScript 添加了对装饰器草稿提案的支持，以支持 Angular。这被 `--experimentalDecorators` 标志控制。

八年后，在 2023 年，装饰器提案以非常不同的形式达到了第 3 阶段。你可以使用标准装饰器，无需任何标志。以下是 ECMAScript 标准装饰器的样子：

```ts
class Greeter {
  greeting: string
  constructor(message: string) {
    this.greeting = message
  }
  @logged // <-- this is the decorator
  greet() {
    return `Hello, ${this.greeting}`
  }
}

function logged(originalFn: any, context: ClassMethodDecoratorContext) {
  return function (this: any, ...args: any[]) {
    console.log(`Calling ${String(context.name)}`)
    return originalFn.call(this, ...args)
  }
}

console.log(new Greeter('Dave').greet())
// Logs:
// Calling greet
// Hello, Dave
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEDiBOBTRAXR9oG8BQ1oHMlUBLAO3wC5oIV4z8BuXaYAe1JvgFdgVX4AFAFtEUMPkRVO9AJRZmeFAAtiEAHSFkKetAC80EWIlM8AX2YABEK3wSAJngD0j6AB4AtO+jLV0X8sRoO0Q2eDA+eGZNVAE5HDw8JBQueFJoAAMACUQQawAaaAASTB91aO1yU3STaHNzbAAzLlJeYnZoa1tEOwF+YnwyMBAAMVIqMFIATwK2UjQADxQqAGFwKABZVCVWOwAREP5w-mX2BZQ45iSUtKaW7XYBUvGpgrU3sHh8CGfJgG0AXQuCRY7AgrBAiDUnQE6WWQxAOmKAGVaPQBLMzmpSGARDIqjIaolUNdoH0BtiRqQ1MB4Y8VBBXu9PhACcxTEx6rMwRCoTYBKREAB3OBENCCADkuzAADdEOKZBpRbFWc5oAAZGzfbCquG5HTlbUubK5VgFKWy7BAA)

你可以通过检查 `tsconfig.json` 中的 `experimentalDecorators` 来判断你使用的是哪个版本的装饰器。如果设置了，那么你使用的是非标准装饰器。

如果你能够的话，关闭这个设置！但你可能被库或框架强制保持这个设置，至少直到它采用最新标准。

如果你正在使用 `experimentalDecorators`，尽量不要通过编写自己的非标准装饰器来加深这个坑。你最终必须将这些迁移到标准版本。

如果你没有设置这个标志，那么可以随意编写装饰器。只是要记住，装饰器不是所有问题的最佳解决方案，有时会让你的代码更难理解。例如，尽量避免改变方法类型签名的装饰器。

### 成员可见性修饰符（Private、Protected 和 Public）

历史上，JavaScript 缺乏使类的属性和方法私有化的方法。通常的解决方法是一个约定，即下划线前缀的字段不是类公共 API 的一部分：

```ts
class Foo {
  _private = 'secret123'
}
```

但这只是阻止用户访问私有数据。很容易绕过：

```ts
const f = new Foo()
f._private // 'secret123'
```

TypeScript 添加了 `public`、`protected` 和 `private` 字段可见性修饰符，它们似乎提供了一些强制执行：

```ts
class Diary {
  private secret = 'cheated on my English test'
}

const diary = new Diary()
diary.secret
//    ~~~~~~ Property 'secret' is private and only accessible within ... 'Diary'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEAiCWYBOBPaBvAUNaAHJ8AbmAC4Cm0EZwSZJ0AvNAOTAAWZpZAJtAPYA7aAFs0AUQEBzEPAhto5CCWYBuTAF9MmYIKXRuiVI2gCyAdziGUACgCUag8hQA6KjTqYA9J5w4AfgGB0AAKSHy4ZEgkaMxutMrQsngExOTQYAK8giBoYMDAZFDwAEYgFGbwJGzwQs51LAhOzJhAA)

但 `private` 是类型系统的一个特性，正如 Item 3 所解释的，类型系统的所有特性在运行时都会消失。当 TypeScript 将其编译为 JavaScript 时，这个代码片段看起来像这样：

```ts
class Diary {
  constructor() {
    this.secret = 'cheated on my English test'
  }
}
const diary = new Diary()
diary.secret
```

`private` 指示符消失了，你的秘密泄露了！就像 `_private` 约定一样，TypeScript 的可见性修饰符只是阻止你访问私有数据。你甚至可以使用类型断言或迭代从 TypeScript 内部访问私有属性：

```ts
const diary = new Diary()
;(diary as any).secret // OK

console.log(Object.entries(diary))
// logs [["secret", "cheated on my English test"]]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEAiCWYBOBPaBvAUNaAHJ8AbmAC4Cm0EZwSZJ0AvNAOTAAWZpZAJtAPYA7aAFs0AUQEBzEPAhto5CCWYBuTAF9MwQUujdEqRtAFkA7nAMoAFAEo1V-cjSRoYAShsA6KjTo4A9P7QAPIA0phaOnwgZJ4gfJJWwQBGAFbUJJ5kAiQEZBAOljZ2mIHQ8ZIwANpVAEQ+tCS1ADTQteyc5LyCIuJSMnIK+U0AuiOYQA)

ES2022 正式添加了对私有字段的支持。与 TypeScript 的 `private` 不同，ECMAScript 的 `private` 在类型检查和运行时都强制执行。要使用它，在类属性前加上 `#`：

```ts
class PasswordChecker {
  #passwordHash: number

  constructor(passwordHash: number) {
    this.#passwordHash = passwordHash
  }

  checkPassword(password: string) {
    return hash(password) === this.#passwordHash
  }
}

const checker = new PasswordChecker(hash('s3cret'))
checker.#passwordHash
//      ~~~~~~~~~~~~~ Property '#passwordHash' is not accessible outside class
//                    'PasswordChecker' because it has a private identifier.
checker.checkPassword('secret') // Returns false
checker.checkPassword('s3cret') // Returns true
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEAiCWYBOBPaBvAUNaAHJ8AbmAC4Cm0EZwSZJ0AvNAOTAAWZpZAJtAPYA7aAFs0AUQEBzEPAhto5CCWYBuTAF9M3auFrQAZgFcBwEvEHQ2kNgApyADxIAuSiQJSAlC4GHhAIzIkNVBIGAAFUIB3PiRuAGEOYABrQIxsaABiXCiY7gAJa29fAKDMdOBBJSRDUxibbKho2IK5Iv9AjzScHBI2WQA6LJzm60Y8YfzrNRxNcsSkiMbc+omXKvhPLu7aEkMkISs5FaXYzoZzhT6IQYaIJsm5aehNWYqBJWh2ahSkMYEySLQRZ3XIJb6BGyHWzMCAAZhodGYHg8wXmgRuExabEwAHocd1ugA-Ykk0kkoFIPi4QIkNDMIYnB5sZjQWTQAR8ehgYDAMhQeB+EAUPiGEgQeDaT7gKC4-EE+UKgnMYH3MHJQIsgLAMCGKis+iHaBgPAEYjkVnaARmfTwdGYL7qpD9B0LCY2GHUHZIlQ4PHQABKdD27wMYBAVHtaKdLpVyxh8K9KN9+MDu32MDchjImCAA)

`#passwordHash` 属性无法从类外部访问，并且不可枚举。即使对于不原生支持私有字段的目标（ES2021 或更早），也有一个后备实现来保持你的数据私有。ECMAScript 私有字段是标准的、广泛支持的，并且比 TypeScript 的 `private` 更安全。你应该使用它们。

那么 `public` 和 `protected` 呢？在 JavaScript（和 TypeScript）中，`public` 是默认可见性，所以不需要显式注释。虽然 `private` 意味着封装，但 `protected` 意味着继承。面向对象编程的一般规则是优先使用组合而不是继承，所以 `protected` 的实际用途相当罕见。

`readonly` 作为字段修饰符是类型级别的构造，可以安全使用。参见 Item 14。字段可以同时是 `#private` 和 `readonly`。

## 要点回顾

- 总的来说，你可以通过移除代码中的所有类型来将 TypeScript 转换为 JavaScript。
- 枚举、参数属性、三斜杠导入、实验性装饰器和成员可见性修饰符是这条规则的历史例外。
- 为了尽可能清晰地保持 TypeScript 在代码库中的作用，并避免未来的兼容性问题，请避免使用非标准特性。

# 第 8 条: 了解符号处于类型空间还是值空间

## 要点

- 在阅读 TypeScript 表达式时，要了解如何区分类型空间和值空间。可以使用 TypeScript playground 来帮助建立这种直觉。
- 每个值都有一个静态类型，但只有在类型空间中才能访问。像 `type` 和 `interface` 这样的类型空间构造会被擦除，在值空间中无法访问。
- 一些构造，比如 `class` 或 `enum`，同时引入了类型和值。
- `typeof`、`this` 以及许多其他操作符和关键字在类型空间和值空间中有不同的含义。

## 正文

在 TypeScript 中，符号有两种存在方式：
• 类型空间
• 值空间

这可能会让人困惑，因为相同的名称在不同的空间中可以指代不同的内容。

```ts
interface Cylinder {
  radius: number
  height: number
}

const Cylinder = (radius: number, height: number) => ({ radius, height })
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIE8A2oAm1kDeAUMslHDsAK4DOAXMiFQLYBG0A3CcgBYTABzHmAZM2nIgF8iRBAHsQNMGiy58AXmQAKcpVqiW7KABpe-ISMaHoASmTqAfNoK7qNU30HDJNrkA)

`interface Cylinder` 在类型空间中引入了一个符号。`const Cylinder` 在值空间中引入了一个同名的符号。它们彼此没有任何关系。根据上下文，当你写 `Cylinder` 时，可能指代的是类型或值。有时这会导致错误：

```ts
function calculateVolume(shape: unknown) {
  if (shape instanceof Cylinder) {
    shape.radius
    //    ~~~~~~ Property 'radius' does not exist on type '{}'
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIE8A2oAm1kDeAUMslHDsAK4DOAXMiFQLYBG0A3CcgBYTABzHmAZM2nIgF8iRBAHsQNMGiy58AXmQAKcpVqiW7KABpe-ISMaHoASmTqAfNoK7qNU30HDJNrjCogCGDACsgIcJgIVJhwkABqcpgsEFo0PHAADhAMAQDWIHIA7iB2xKTAMNppmSigSnCBEHKVGNggeFCl3KTVWQB0rrTdyAD0I6SkAH7TM8gAClByWVBg6MgA5IM068g4chA0jHLKEAAewErIoatZGwSS69zS0kA)

这是怎么回事呢？你可能本意是用 `instanceof` 来检查 `shape` 是否属于 `Cylinder` 类型。但 `instanceof` 是 JavaScript 的运行时操作符，它作用于值。所以 `instanceof Cylinder` 指的是那个函数，而不是类型。

乍一看，某个符号属于类型空间还是值空间并不总是那么明显。你需要根据符号出现的上下文来判断。尤其让人困惑的是，很多类型空间的写法和值空间的写法长得一模一样。

比如字面量类型：

```ts
type T1 = 'string literal'
const v1 = 'string literal'
type T2 = 123
const v2 = 123
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKgjFAvFA5AZ2AJwJYDsDmUANtsBJgIZEoDcAUAMYD2uGUAbgsulnoSWUrV6oSLABMSKHHEBmes1bAOk5DPl0gA)

在 `type` 或 `interface` 后面出现的符号属于类型空间，而在 `const` 或 `let` 声明中引入的符号是值。

理解这两种空间的最好方法之一是使用 TypeScript Playground，它可以将你的 TypeScript 代码编译成的 JavaScript。类型在编译时会被擦除（见第 3 条），所以如果某个符号在编译后消失了，那它就是类型空间里的。

![Figure 2-11. The TypeScript playground showing generated JavaScript. The symbols on the first two lines go away, so they were in type space.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202504061918012.png)

TypeScript 中的语句可能会在类型空间和值空间之间来回切换。类型声明（冒号 `:`）或类型断言（`as`）后面的符号属于类型空间，而赋值语句中等号 `=` 后面的内容属于值空间。

比如：

```ts
interface Person {
  first: string
  last: string
}
const jane: Person = { first: 'Jane', last: 'Jacobs' }
//    ――――           ――――――――――――――――――――――――――――――――― Values
//          ―――――― Type
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAXMhVKAOYDcRyANnBdbQ8wL4EIcFZACs4ICNXTkcyALz4SZTsgDkAKXERVAGjYcqazYIBGGVcl7MA9NeLFAqAROH916+cfPX7z+QA1OFYAVwgMAls3Ny9kABUATwAHCAIgA)

尤其是函数语句，它们在类型空间和值空间之间可能会反复切换：

```ts
function email(to: Person, subject: string, body: string): Response {
  //     ――――― ――          ―――――――          ――――                    Values
  //               ――――――           ――――――        ――――――   ―――――――― Types
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAXMhVKAOYDcRyANnBdbQ8wL4EIcFZACs4ICNXTkcyALz4SZTsgDkAKXERVAGjYcqazYIBGGVcl7MA9NeLFAqAROH916+cfPX7z+QA1OFYAVwgMAls3Ny9kABUATwAHCAIYIJAEMGBZCABbOGBWAAowLClMHD0MIJMRCAyuMDoQej0TLAATOIam+gBKagAlUIShFEJiCPcPZCdIqc85+2nFleIA4NCWSdWlhdXouYOZ71jEzYm7AGEAeQBZVAGAUQBlZ5YoCDAgqFwJAHdkEMMCMQBgIIVeswLshHgA5AAiBH4BCAA)

`class` 和 `enum` 这两种结构会同时引入一个类型和一个值。回到最开始的例子，`Cylinder` 也可以是一个类：

```ts
class Cylinder {
  radius: number
  height: number
  constructor(radius: number, height: number) {
    this.radius = radius
    this.height = height
  }
}

function calculateVolume(shape: unknown) {
  if (shape instanceof Cylinder) {
    shape
    // ^? (parameter) shape: Cylinder
    shape.radius
    //    ^? (property) Cylinder.radius: number
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAXMhVKAOYDcRyANnBdbQ8wL4EIcFZACs4ICNXTkcyALz4SZTsgDkAKXERVAGjYcqazYIBGGVcl7MA9NeLFAqAROH916+cfPX7z+QA1OFYAVwgMAls3Ny9kABUATwAHCAIYIJAEMGBZCABbOGBWAAowLClMHD0MIJMRCAyuMDoQej0TLAATOIam+gBKagAlUIShFEJiCPcPZCdIqc85+2nFleIA4NCWSdWlhdXouYOZ71jEzYm7AGEAeQBZVAGAUQBlZ5YoCDAgqFwJAHdkEMMCMQBgIIVeswLshHgA5AAiBH4AnYGAwyEucVYoHa0Hw7zg7WAQQw1BAQRyJmgUOQAAsIMB6LTDOTKdSWIJQY0ghksFBClBCcTSchWVSoHp6YzmWSKeLevjXGBacAMAA6QVEknyZCa4U04jK1VqqVMsA603Mmn8ZGpdKZWQIQIIILsSB+LDBHLgjC0uBJahpADWICwfxACvGyGAMGQhV9-pQoAo4iQWFjmOxIFxUEjLGICaS+eQEQAegB+OMJOCC72QXM0P0BjFYnHQYuFiAaoUk4vbZAVqtQLBJKBgOIKzNtqDdrUisXt4g2ghAA)

`class` 引入的 TypeScript 类型是基于它的结构（也就是它的属性和方法），而对应的值是它的构造函数。

有很多操作符和关键字在类型上下文和值上下文中含义不同，比如 `typeof`：

```ts
type T1 = typeof jane
//   ^? type T1 = Person
type T2 = typeof email
//   ^? type T2 = (to: Person, subject: string, body: string) => Response

const v1 = typeof jane // Value is "object"
const v2 = typeof email // Value is "function"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAXMhVKAOYDcRyANnBdbQ8wL4EIcFZACs4ICNXTkcyALz4SZTsgDkAKXERVAGjYcqazYIBGGVcl7MA9NeLFAqAROH916+cfPX7z+QA1OFYAVwgMAls3Ny9kABUATwAHCAIYIJAEMGBZCABbOGBWAAowLClMHD0MIJMRCAyuMDoQej0TLAATOIam+gBKagAlUIShFEJiCPcPZCdIqc85+2nFleIA4NCWSdWlhdXouYOZ71jEzYm7AGEAeQBZVAGAUQBlZ5YoCDAgqFwJAHdkEMMCMQBgIIVeswLshHgA5AAiBH4AnYGAwyEucVYoHa0Hw7zg7WAQQw1BAQRyJmgUOQAAsIMB6LTDOTKdSWIJQY0ghksFBClBCcTSchWVSoHp6YzmWSKeLevjXGBacAMAA6QVEknyZCa4U04jK1VqqVMsA603Mmn8ZGpdKZWQIQIIILsSB+LDBHLgjC0uBJahpADWICwfxACvGyGAMGQhV9-pQoAo4iQWFjmOxIFxUEjLGICaS+eQEQAegB+OMJOCC72QXM0P0BjFYnHQYuFiAaoUk4vbZAVqtQLBJKBgOIKzNtqDdrUisXt4g2gjjpKxACMOtXEHToi0NjsxEH243Ouk2BAK7OsQATFuzrvcvlWAf7MfrzE7wpiqU0OUQJU1S1PUNCNAwrQdF0oE9AqcgAHyAsMowEAIQjmgAbpuCjbruYgSIw0LrCE0bogARFgNR1GApGoVyyDoV+yA4bGT4FARJZ2ERSZkXaGRZCANFAA)

在类型上下文中，`typeof` 接收一个值，并返回它的 TypeScript 类型。你可以把这个类型作为更大类型表达式的一部分，或者用 `type` 语句给它起个名字。

在值上下文中，`typeof` 是 JavaScript 的运行时操作符，它返回的是一个字符串，表示某个符号的运行时类型。但这和 TypeScript 的类型是两码事！JavaScript 的运行时类型系统比 TypeScript 的静态类型系统简单得多。相比 TypeScript 拥有的无限种类型，JavaScript 的 `typeof` 只能返回 8 种字符串值：`"string"`、`"number"`、`"boolean"`、`"undefined"`、`"object"`、`"function"`、`"symbol"` 和 `"bigint"`。

`[]` 属性访问器在类型空间中也有长得一模一样的用法。但要注意，在值空间中，`obj['field']` 和 `obj.field` 是等价的；可是在类型空间中，它们并不等价。你必须使用前者（中括号形式）来获取另一个类型的属性类型：

```ts
const first: Person['first'] = jane['first'] // Or jane.first
//    ―――――                    ――――――――――――― Values
//           ―――――― ―――――――                  Types
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAXMhVKAOYDcRyANnBdbQ8wL4EIcFZACs4ICNXTkcyALz4SZTsgDkAKXERVAGjYcqazYIBGGVcl7MA9NeLFAqAROH916+cfPX7z+QA1OFYAVwgMAls3Ny9kABUATwAHCAIYIJAEMGBZCABbOGBWAAowLClMHD0MIJMRCAyuMDoQej0TLAATOIam+gBKagAlUIShFEJiCPcPZCdIqc85+2nFleIA4NCWSdWlhdXouYOZ71jEzYm7AGEAeQBZVAGAUQBlZ5YoCDAgqFwJAHdkEMMCMQBgIIVeswLshHgA5AAiBH4AnYGAwyEucVYoHa0Hw7zg7WAQQw1BAQRyJmgUOQAAsIMB6LTDOTKdSWIJQY0ghksFBClBCcTSchWVSoHp6YzmWSKeLevjXGBacAMAA6QVEknyZCa4U04jK1VqqVMsA603Mmn8ZGpdKZWQIQIIILsSB+LDBHLgjC0uBJahpADWICwfxACvGyGAMGQhV9-pQoAo4iQWFjmOxIFxUEjLGICaS+eQEQAegB+OMJOCC72QXM0P0BjFYnHQYuFiAaoUk4vbZAVqtQLBJKBgOIKzNtqDdrUisXt4g2gRCc2kciGaTYEAAbVU64oqgAujqxBI9wewMfGNDrlBRFo1ZfwnZds4disfAt1iEwv3DgsJwfm48RJGEQA)

`Person['first']` 在这里是一个类型，因为它出现在类型上下文中（在冒号 `:` 后）。你可以在中括号里的索引位置放入任何类型，包括联合类型或原始类型：

```ts
type PersonEl = Person['first' | 'last']
//   ^? type PersonEl = string
type Tuple = [string, number, Date]
type TupleEl = Tuple[number]
//   ^? type TupleEl = string | number | Date
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAXMhVKAOYDcRyANnBdbQ8wL4EIcFZACs4ICNXTkcyALz4SZTsgDkAKXERVAGjYcqazYIBGGVcl7MA9NeLFAqAROH916+cfPX7z+QA1OFYAVwgMAls3Ny9kABUATwAHCAIYIJAEMGBZCABbOGBWAAowLClMHD0MIJMRCAyuMDoQej0TLAATOIam+gBKagAlUIShFEJiCPcPZCdIqc85+2nFleIA4NCWSdWlhdXouYOZ71jEzYm7AGEAeQBZVAGAUQBlZ5YoCDAgqFwJAHdkEMMCMQBgIIVeswLshHgA5AAiBH4AnYGAwyEucVYoHa0Hw7zg7WAQQw1BAQRyJmgUOQAAsIMB6LTDOTKdSWIJQY0ghksFBClBCcTSchWVSoHp6YzmWSKeLevjXGBacAMAA6QVEknyZCa4U04jK1VqqVMsA603Mmn8ZGpdKZWQIQIIILsSB+LDBHLgjC0uBJahpADWICwfxACvGyGAMGQhV9-pQoAo4iQWFjmOxIFxUEjLGICaS+eQEQAegB+OMJOCC72QXM0P0BjFYnHQYuFiAaoUk4vbZAVqtQLBJKBgOIKzNtqDdrUisXt4g2gjjpJocogR6sHXSbAgADaqlI5DAFgAPmpUaeALo2OzEQerlC7nBbnXcZors6xIIJVgoBR9w-FpRTlaA9HhOBIFvL81xiX9-zfBR4L-CB9wXKAYO2R9vxQxDtwUYDkAvDDiOQSDIAIIA)

更多关于类型操作以及类型之间映射的方法，请参见第 15 条。

还有很多其他结构在类型空间和值空间中的含义不同：

- 在值空间中，`this` 是 JavaScript 的 `this` 关键字（见第 69 条）；而在类型空间中，`this` 是 TypeScript 中的 “多态 this” 类型，用于在子类中实现方法链。
- 在值空间中，`&` 和 `|` 是按位与和按位或运算符；在类型空间中，它们是交叉类型（`&`）和联合类型（`|`）运算符。
- 在值空间中，`const` 是用来声明变量的；而在类型空间中，`as const` 会改变字面量或字面量表达式的推导类型（见第 20 条）。
- 在值空间中，`extends` 用于定义子类（如 `class A extends B`）；而在类型空间中，它用于定义子类型（如 `interface A extends B`）或泛型的约束（如 `Generic<T extends number>`）。
- 在值空间中，`in` 用于 `for` 循环（如 `for (key in object)`）；而在类型空间中，它用于映射类型（见第 15 条）。
- 在值空间中，`!` 是 JavaScript 的逻辑非操作符（如 `!x`）；而在类型空间中，它是非空断言（如 `x!`，见第 9 条）。

如果你发现 TypeScript 完全无法理解你的代码，很可能是你在类型空间和值空间之间搞混了。比如说你把之前的 `email` 函数改成只接受一个参数对象（第 38 条会解释为什么要这样做）：

```ts
function email(options: { to: Person; subject: string; body: string }) {
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAXMhVKAOYDcRyANnBdbQ8wL4EwAriARhgOZBAC2cYKwAUWAA5icGanjBZq6cjgA0NQQCMAVhFFcwdEPUPGsAEwCeVm-V4BKfCwD0v5AA6YIJ+IA)

在 JavaScript 中，你可以使用解构赋值来为对象中的每个属性创建对应的本地变量：

```js
function email({ to, subject, body }) {
  // ...
}
```

如果你在 TypeScript 中尝试做同样的事情，你会遇到一些令人困惑的错误：

```ts
function email({
  to: Person,
  //  ~~~~~~ Binding element 'Person' implicitly has an 'any' type
  subject: string,
  //       ~~~~~~ Binding element 'string' implicitly has an 'any' type
  body: string,
  //    ~~~~~~ Binding element 'string' implicitly has an 'any' type
}) {
  /* ... */
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAXMhVKAOYDcRyANnBdbQ8wL4EwAriARhgOZBAC2cYKwAUhYmCzV05HABoWAeh3EAfkePIAQqAAmDSa2kRwyAOTrsIR8mBSADq2AJgYKwAnsgAFhzIcLiOUUHuYEFeECwYggBGAFYQolxgdCD02sR6xKWGxkZmltYQtlL2YE7cBe6ePn4BwWERUU6x8YnJxGlYFkG5+fS6+qUVleYgVgU2dg6OzfSt3r7+gSHhGJHR-cgJSQS8AJT4yDoAVMgAdM-Id-r8QA)

问题在于 `Person` 和 `string` 被解释为值上下文。你试图创建一个名为 `Person` 的变量和两个名为 `string` 的变量。正确的做法是分开类型和值：

```ts
function email({
  to,
  subject,
  body,
}: {
  to: Person
  subject: string
  body: string
}) {
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAXMhVKAOYDcRyANnBdbQ8wL4EwAriARhgOZBAC2cYKwAULPGCwAaGoIBGAKwij1mrABMAnr2rKs1dORzqMW3aK5g6IegeMmXb+vwCU+CwA9MHIAHSRBPxAA)

这虽然显得更冗长，但在实际使用中，你可能会为参数创建一个命名类型，或者可以从上下文中推断出类型（见第 24 条）。

虽然类型空间和值空间中的类似结构一开始可能会让人困惑，但一旦掌握了，它们最终会作为记忆法变得很有用。

## 关键点总结

- 在阅读 TypeScript 表达式时，知道如何判断自己处于类型空间还是值空间。使用 TypeScript Playground 来帮助建立这种直觉。
- 每个值都有一个静态类型，但这个类型只在类型空间中可以访问。像 `type` 和 `interface` 这样的类型空间结构会在编译时被擦除，在值空间中无法访问。
- 一些结构，如 `class` 或 `enum`，会同时引入类型和值。
- `typeof`、`this` 和许多其他操作符和关键字在类型空间和值空间中的含义不同。

# 第 9 条: 优先使用类型注解而非类型断言

## 要点

- 优先使用类型注解（`: Type`），少用类型断言（`as Type`）。
- 熟悉如何为箭头函数标注返回类型。
- 只有在你确信自己比 TypeScript 更清楚类型情况时，才使用类型断言或非空断言。
- 使用类型断言时，务必加注释解释为什么这样写是安全的。

## 正文

TypeScript 有两种方式可以给变量赋值并指定类型：

```ts
interface Person {
  name: string
}

const alice: Person = { name: 'Alice' }
//    ^? const alice: Person
const bob = { name: 'Bob' } as Person
//    ^? const bob: Person
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN7IhwC2EAXMhmFKAObIC+A3AFAsI5XJwA2wSFdFGy4AvPkIlyyAOQBBPkhmNWAelXJNyAHoB+ZBxBde-aUJHtOYZACMsN5OIJFSFGQCF7yhtwxpMOGoaWnoGVrb2ggEgLEA)

虽然它们实现的效果差不多，但其实差别很大！第一种（`alice: Person`）是给变量加了一个类型注解，确保赋的值符合这个类型。第二种（`as Person`）是**类型断言**，意思是告诉 TypeScript：“我知道你推断的类型，但我更了解这个值的实际类型，我说它就是 `Person`。”

通常来说，你应该优先使用类型注解，而不是类型断言。原因如下：

```ts
const alice: Person = {}
//    ~~~~~ Property 'name' is missing in type '{}' but required in type 'Person'
const bob = {} as Person // No error
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN7IhwC2EAXMhmFKAObIC+A3AFAI5XJwA2wSF6KNlwBefMxYB6SclnIAfosVooWAA7QwAT2QByIqV3JgGZMRMY6x3No168DIwCMArmGRQIARxfBPAE2tkWxRdQWFdNg53JywnZDEHLlNwnCZZaWQAOSxkaFUoFiA)

类型注解会检查这个值是否符合接口的要求。如果不符合，TypeScript 就会报错。而类型断言则会“屏蔽”这个错误，意思是无论什么原因，你告诉 TypeScript：“我比你更清楚这个值的类型。”

如果你多写了一个属性，情况也是一样的：

```ts
const alice: Person = {
  name: 'Alice',
  occupation: 'TypeScript developer',
  // ~~~~~~~~~ Object literal may only specify known properties,
  //           and 'occupation' does not exist in type 'Person'
}
const bob = {
  name: 'Bob',
  occupation: 'JavaScript developer',
} as Person // No error
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN7IhwC2EAXMhmFKAObIC+A3AFAI5XJwA2wSF6KNlwBefC2SES5ZAHIAgrySyANBORYECAK4AHOGGA4KsgCoBPXRADKCGrrDIAJhABuEblitRZLAPR+yAB+IaGhyADyAEYAVhAIjryQUDzIxHDmGiDcmRhWCMAwmQDWIFgA7ri6UF7QhhAYagGSLa2ScCBOcpo6+oY4ss5YDYRYjhAAHsCcoMhgliiygsK+zGwcjlFYUchieOpEpCYAQtuq6j16BkYgJgBScK5wtvaOLu6e3qtcGGiYOExJM0AHJYZDQGpQFhAA)

从结构类型的角度来看（见第 4 条），多写的属性是合法的，但通常都是写错了。TypeScript 提供了一种额外的检查机制，叫做“多余属性检查”，它能在对象有多余属性时发出警告，不过这个警告在你用类型断言时是不会生效的。第 11 条会详细讲这个检查机制。

正因为类型注解能提供更多安全检查，除非你有特别明确的理由，否则应该优先使用类型注解，而不是类型断言。

> [!TIP]
> 你可能还会看到像 `const bob = <Person>{}` 这样的代码。这是早期的类型断言语法，和 `{}` as Person 是一样的。不过现在不太常用了，因为在 `.tsx` 文件（TypeScript + React）中，`<Person>` 会被当作一个 HTML 标签的开始标签来解析。

在箭头函数中使用类型注解有时候会比较麻烦。如果你想在这段代码里用上 `Person` 这个命名接口，该怎么办呢？

```ts
const people = ['alice', 'bob', 'jan'].map((name) => ({ name }))
// { name: string; }[]... but we want Person[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN7IhwC2EAXMhmFKAObIC+A3AFAI5XIAOEWXANigC8yANoByOP2BJxAGmTiARliXzFAKzghxAXQB0xOFwAURUsiEA+ZCbzmIDAJRPWAejf5CJcpWp0mRlEDfX1kJQBXMGQAdxQY7Wj0KGwQYJYgA)

在这里你可能会忍不住想用类型断言，看起来好像也能解决问题：

```ts
const people = ['alice', 'bob', 'jan'].map((name) => ({ name } as Person)) // Type is Person[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN7IhwC2EAXMhmFKAObIC+A3AFAI5XIAOEWXANigC8yANoByOP2BJxAGmTiARliXzFAKzghxAXQB0xOFwAULZIRLCAfMhN4ipBsjgY0mHAEoWnpsgD0-sgAKgCePMjAbuhQ2CCiuixAA)

但这种写法也会遇到和直接使用类型断言一样的问题。比如说：

```ts
const people = ['alice', 'bob', 'jan'].map((name) => ({} as Person))
// No error
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN7IhwC2EAXMhmFKAObIC+A3AFAI5XIAOEWXANigC8yANoByOP2BJxAGmTiARliXzFAKzghxAXQB0xOFwAURUsiEA+ZCbwNkcDGkw4AlG9YB6L8gByWMjQUFhQLEA)

那在这种情况下该怎么用类型注解呢？最直接的方式就是在箭头函数里先声明一个变量：

```ts
const people = ['alice', 'bob', 'jan'].map((name) => {
  const person: Person = { name }
  return person
}) // Type is Person[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN7IhwC2EAXMhmFKAObIC+A3AFAI5XIAOEWXANigC8yANoByOP2BJxAGmTiARliXzFAKzghxAXQB0xOFwAURUsiEA+fC2TJ2ITjyjYQFdK5yX85iMztkKAgwAFcoXBc3FgYASiZkAHpE5AAVAE8eZGAMNEwcUV0WIA)

不过，这样做相比原始代码会引入不少冗余。更简洁的方式是注解箭头函数的返回类型：

```ts
const people = ['alice', 'bob', 'jan'].map((name): Person => ({ name })) // Type is Person[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN7IhwC2EAXMhmFKAObIC+A3AFAI5XIAOEWXANigC8yANoByOP2BJxAGmTiARliXzFAKzghxAXQB0xOFwAULZMhNFSASgroo2XEIB8lvNYgMbLG02QA9AHIACoAnjzIwBhomDiiuixAA)

这和之前的版本一样，会对值进行相同的检查。这里的圆括号非常重要！`(name): Person` 允许推断 `name` 的类型，并指定返回类型应该是 `Person`。但如果写成 `(name: Person)`，则会指定 `name` 的类型为 `Person`，同时让返回类型推断，这样会导致错误。关于函数参数的类型推断，详见第 24 条。

在这种情况下，你也可以直接写出最终的期望类型，让 TypeScript 来检查赋值是否有效：

```ts
const people: Person[] = ['alice', 'bob', 'jan'].map((name) => ({ name })) // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN7IhwC2EAXMhmFKAObIC+A3AFAI5XIAOEWXANuTSYcAbQC6yALzJRAcjj9gSOQBpkcgEZZNajQCs4IOeIB0xOFwAURUtIB8yK3lsQGASndNkAeh-IAeQBpFiA)

但在较长的函数调用链中，可能需要或更希望早点使用命名类型，这样能更快发现错误，定位问题也更精确。

那么，什么时候应该使用类型断言呢？类型断言最适合在你确实比 TypeScript 更了解某个类型的时候，通常这种情况是因为有些上下文信息类型检查器无法获取到。比如说，如果你在浏览器中工作，你可能比 TypeScript 更清楚一个 DOM 元素的类型：

```ts
document.querySelector('#myButton')?.addEventListener('click', (e) => {
  e.currentTarget
  // ^? (property) Event.currentTarget: EventTarget | null
  // currentTarget is #myButton is a button element
  const button = e.currentTarget as HTMLButtonElement
  //    ^? const button: HTMLButtonElement
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYewxgrgtgpgdgFwHQEcIwE4E8DKMA2MYCIGAFAOQDEUWAQhAiXBQJQD8SAhsMAKIA3eAgAyASwDOCeJkph8YsAGsKAGgAEMdQF4AfOoDeAKHWakkDBmEAVLhgDmMBCfUB6V+oB67dWQAOGCB+mAhYrOqCwuYQljZ2jggAXBFCiLYOTuoAPupwEPj4Lu7qFlZp8ZmS6jT0jMzqVVzqAEZ1IHCahLCILmDtUi1tHdpmpXEZCOpcEuoAEtYAsiIMTO18XcIA3EUepl4+fXADratwyfNLK8zrMN3OAL6s20A)

因为 TypeScript 无法访问页面的 DOM，它不知道 `#myButton` 是一个按钮元素，也不知道当前事件的 Target 应该是这个按钮。由于你有 TypeScript 无法获取的信息，因此在这里使用类型断言是合理的。有关 DOM 类型的更多信息，请参见第 75 条。

使用类型断言时，最好在注释中解释为什么它是有效的。这为人类读者提供了缺失的信息，帮助他们判断这个断言是否仍然成立。

如果一个变量的类型包含了 `null`，但你从上下文中知道这不可能是 `null`，你可以使用类型断言来移除 `null`：

```ts
const elNull = document.getElementById('foo')
//    ^? const elNull: HTMLElement | null
const el = document.getElementById('foo') as HTMLElement
//    ^? const el: HTMLElement
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBApgGwHIFcEJgXhgExMFAWzjCgDoBzOKAUQTmNICEBPASRwAoByAMxBDcAlAG4AUAHoJMGTAB6AfhihIsRKnQAuGAAkAKgFkAMnQYlYAHxhg0CMSujwM2PAUbkqteu9Yce-QSEYAEMIXUMTb3NxKVl5JQc1BG19Y1N3MSA)

这种类型断言非常常见，以至于它有了专门的语法，称为“非空断言”：

```ts
const el = document.getElementById('foo')!
//    ^? const el: HTMLElement
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBApgGxgXhgExMArgWzmKAOgHM4oBRBOPAgIQE8BJNACgHIAzEENgSgEIA3ACgA9KJiSYAPQD8MUJFiIAXDAASAFQCyAGUrV8UYUA)

作为前缀时，`!` 是 JavaScript 的逻辑非运算符。但作为后缀时，`!` 被解释为类型断言，表示该值非 `null`。这种写法比 `as` 更优，因为它让类型中的非空部分保持不变。

不过，你应该像对待任何其他断言一样谨慎使用 `!`：它会在编译时被移除，所以只有在你知道类型检查器无法获取的信息并且能够确保值非 `null` 时，才应该使用它。如果不能确保，你应该使用条件语句来检查是否为 `null`。

如果你正在访问一个可能为 `null` 的对象的属性或方法，使用“可选链”运算符 `?.` 会更加方便：

```ts
document.getElementById('foo')?.addEventListener('click', () => {
  alert('Hi there!')
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYewxgrgtgpgdgFwHQHMYIKIBsa0QIQE8BJYACgHIAzEECgSgH4kBDYYDAN3gQBkBLAM4J4MAE6UwWfmADWFADQACMvSUBeAHxKA3gCglSljjEJKACX5KEAC3EwAhAwDcegL71XQA)

这看起来和 `!` 有些相似，但实际上差别很大。`a?.b` 是一个 JavaScript 构造，表示在运行时检查对象是否为 `null`（或 `undefined`），然后再继续计算表达式。而 `a!.b` 是一个类型级别的构造，编译后只会变成 `a.b`。如果对象在运行时是 `null`，它会抛出异常。`a?.b` 比 `a!.b` 更安全，但也不要过度使用。以上面代码为例，那么你可能希望事件监听器是否添加成功！

类型断言是有局限的：它们不能让你在任意类型之间转换。一般规则是，如果类型 A 和 B 之间是“可比较”的，你可以使用类型断言进行转换。用第 7 条中的集合术语来说，A 和 B 必须有非空交集。例如，`HTMLElement` 是 `HTMLElement | null` 的子类型，所以这种类型断言是可以的。（这两种类型的交集是 `HTMLElement`。）`HTMLButtonElement` 是 `EventTarget` 的子类型，所以这种类型断言也可以。而 `Person` 是 `{}` 的子类型，所以这种断言也是可以的。

但你不能在 `Person` 和 `HTMLElement` 之间进行转换，因为它们的交集是空的（即 `never` 类型）：

```ts
interface Person {
  name: string
}
const body = document.body
const el = body as Person
//         ~~~~~~~~~~~~~~
// Conversion of type 'HTMLElement' to type 'Person' may be a mistake because
// neither type sufficiently overlaps with the other. If this was intentional,
// convert the expression to 'unknown' first.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN7IhwC2EAXMhmFKAOYDcyAvgFAI5XIBGWAJgJ7IAvMl5YEAV1LgAdDwH02HMMggAbYdz6C4GNJhyKA9EeRnz5gH7Wbt2yxPIAwjgBumYDmRYYyMPwAHFAByAAkAFQBZABkAUTUIaTBgvyw-QJD0KGwQFOI4QS4UOGRiYCo4AGsUIoQ4CQwIB1MQCGAwAAtodKDKCRgYYARgCHA1QSx3KDU4AL0Ad3aOvy7vTugZZABJX07y5HndZFBIcE8iNQAaZuR2ECmVddUADwCoCAwMc9TkYIkQSogLDzXLIQbZMAyFhAA)

这个错误提示了一个建议————期待使用 `unknown` 类型（见第 46 条）。每种类型都是 `unknown` 的子类型，所以涉及 `unknown` 的断言总是可以的。这让你可以在任意类型之间进行转换，但至少你明确表明了你正在做一些可疑的操作！

```ts
const el = document.body as unknown as Person // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN7IhwC2EAXMhmFKAOYDcyAvgFAI5XIQA2yAvMgAmWBAFdS4AHQAjLIICeyOBmSiQAaxBYA7rmVpMORsgD0J5AHkA0iyA)

并不是每个类型断言都使用 `as` 关键字。第 22 条解释了“用户定义的类型保护”（`is`），它允许你在类型断言中关联一些逻辑来检查其有效性。也可以使用泛型类型推断来断言类型，但这并不是一个好主意，因为你很容易误以为 TypeScript 在检查类型，实际上并没有。这个模式（“只返回泛型”）在第 51 条中有详细讲解。

类型断言有时被称为“类型转换”。然而，这个术语是误导性的，最好避免使用。在像 C 这样的语言中，类型转换可以在运行时改变一个值（比如从 `int` 转换为 `float`）。而类型断言不能这样做。它们是类型级别的构造，在运行时会被移除，不会改变值。它们只是“断言”一些已经成立的事实。

最后，还有 `as const`。虽然这看起来像是类型断言，但更准确的说法是“常量上下文”。虽然 `as T` 会引起你的警惕，但 `as const` 会使类型更加精确，并且完全安全。第 24 条展示了如何使用常量上下文来改善类型推断。

## 关键点总结

- 优先使用类型注解（`: Type`），少用类型断言（`as Type`）。
- 熟悉如何为箭头函数标注返回类型。
- 只有在你确信自己比 TypeScript 更清楚类型情况时，才使用类型断言或非空断言。
- 使用类型断言时，务必加注释解释为什么这样写是安全的。

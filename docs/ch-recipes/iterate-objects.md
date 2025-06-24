# Item 60: Know How to Iterate Over Objects

## 要点

- Be aware that any objects your function receives as parameters might have additional keys.
- Use `Object.entries` to iterate over the keys and values of any object.
- Use a ++for-in++ loop with an explicit type assertion to iterate objects when you know exactly what the keys will be.
- Consider `Map` as an alternative to objects since it's easier to iterate over.
- 要注意函数接收的任何对象作为参数可能包含额外的键。
- 使用 `Object.entries` 来遍历任何对象的键和值。
- 当你确切知道对象的键时，使用 `for-in` 循环并进行显式的类型断言来遍历对象。
- 考虑使用 `Map` 作为对象的替代品，因为它更容易进行迭代。

## 正文

这段代码运行正常，但 TypeScript 却标记了一个错误。为什么？

```ts
const obj = {
  one: 'uno',
  two: 'dos',
  three: 'tres',
}
for (const k in obj) {
  const v = obj[k]
  //        ~~~~~~ Element implicitly has an 'any' type
  //               because type ... has no index signature
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBCBGArGBeGBvAUDOYCmAXDAOQCuYIxANNjFAO4hHEAmIE1tUAFgE56ESUfhxoBfANyYAZiF4wAFKEiwA1jACWYOEgCUGWsugwAbqh2IA2qoC6UnAHoHOFy4B+HzzACiAGzwAtnhgsBoBAA6+GsAaUL4AnjDcAIYQMMnaxBnxxHTx4Xi0Tq4lpfB4wMmkEHh5BTAAdE1JqTAUmmAseAAeMBAaAOZgyVCk-JhimEA)

检查 `obj` 和 `k` 符号会给出线索：

```ts
const obj = { one: 'uno', two: 'dos', three: 'tres' }
//    ^? const obj: {
//         one: string;
//         two: string;
//         three: string;
//       }
for (const k in obj) {
  //       ^? const k: string
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBCBGArGBeGBvOYCmAuGA5AK5ggEA0MUA7iPgQCYgQVUAWATtnoVFyzAC+AbgBQAenExpMAHoB+GKEiwEifOglSZOrD2gcAlmADmYybp006MA8bNbLMqJ2747p89t2DRAMxAOGAAKZWgYAGsYYzgkAEoMUWkLSwUlcHCI9z57JJgLADoi0V8gA)

`k` 的类型是 `string`，但你试图索引一个类型只有三个特定键的对象：`'one'`、`'two'` 和 `'three'`。除了这三个之外还有其他字符串，所以这必须失败。

使用类型断言来获得 `k` 的更窄类型可以解决这个问题：

```ts
for (const kStr in obj) {
  const k = kStr as keyof typeof obj
  //    ^? const k: "one" | "two" | "three"
  const v = obj[k] // OK
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBCBGArGBeGBvAUDOYCmAXDAOQCuYIxANNjFAO4hHEAmIE1tUAFgE56ESUfhxoBfANyYAZiF4wAFKEiwA1jACWYOEgCUGWsugwAbqh2IA2qoC6UnAHoHOFy4B+HzzACiAGzwAtnhgsBoBAA6+GsAaUL4AnjDcAIYQMMnaxBnxxHTx4Xi0Tq4lpfB4wMmkEHh5BTAAdE1JqTAUmmAseAAeMBAaAOZgyVCk-JhiMnKKRmoAysIdFvpYOLMw6miqC-KtqnjxINJ1eEcW9jDFLgB6APww66pEAETgeM8wAD4wzwwgH99fnwBM9DOBjGY0AgrLYJI5nAB5ADSE0wQA)

所以真正的问题是：为什么在第一个例子中 `k` 的类型被推断为 `string` 而不是 `"one" | "two" | "three"`？

为了理解，让我们看一个稍微不同的例子：

```ts
interface ABC {
  a: string
  b: string
  c: number
}

function foo(abc: ABC) {
  for (const k in abc) {
    //       ^? const k: string
    const v = abc[k]
    //        ~~~~~~ Element implicitly has an 'any' type
    //               because type 'ABC' has no index signature
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBCBGArGBeGBvAUDOYCmAXDAOQCuYIxANNjFAO4hHEAmIE1tUAFgE56ESUfhxoBfANyYAZiF4wAFKEiwA1jACWYOEgCUGWsugwAbqh2IA2qoC6UnAHoHOFy4B+HzzACiAGzwAtnhgsBoBAA6+GsAaUL4AnjDcAIYQMMnaxBnxxHTx4Xi0Tq4lpfB4wMmkEHh5BTAAdE1JqTAUmmAseAAeMBAaAOZgyVCk-JhimFpQeLzSycC1AIIAQgDCBjjJRNC8WgP2MPA7wvuHwERgpAHlvFKTMuTAUBrgMLIgCsnwFzCra-osDhZPIlOBjOotOkfoDaI5nKUAHoAfhgRjUJz2YAGcLR4NgZjQ32A1jsuOKpRgni8fkCwVCESiMTiiRSaQyJGyuSg+UKrgplLKFSqNTqtWI-1ybLaIA6XV6-SGIzGfJgk0mQA)

这是和之前一样的错误。你可以使用相同类型的类型断言来"修复"它（`k as keyof ABC`）。但在这种情况下，TypeScript 的抱怨是正确的。原因如下：

```ts
const x = { a: 'a', b: 'b', c: 2, d: new Date() }
foo(x) // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBCBGArGBeGBvAUDOYCmAXDAOQCuYIxANNjFAO4hHEAmIE1tUAFgE56ESUfhxoBfANyYAZiF4wAFKEiwA1jACWYOEgCUGWsugwAbqh2IA2qoC6UnAHoHOFy4B+HzzACiAGzwAtnhgsBoBAA6+GsAaUL4AnjDcAIYQMMnaxBnxxHTx4Xi0Tq4lpfB4wMmkEHh5BTAAdE1JqTAUmmAseAAeMBAaAOZgyVCk-JhimFpQeLzSycC1AIIAQgDCBjjJRNC8WgP2MPA7wvuHwERgpAHlvFKTMuTAUBrgMLIgCsnwFzCra-osDhZPIlOBjOotOkfoDaI5nKUAHoAfhgRjUJz2YAGcLR4NgZjQ32A1jsuOKpRgni8fkCwVCESiMTiiRSaQyJGyuSg+UKrgplLKFSqNTqtWI-1ybLaIA6XV6-SGIzGfJgk0m6JgvTQ6G2nOoR2Y8ANvwATFQYCxLnh6DAACIjPAKXSSGQgT7dXQSeEwADyAGlMEA)

函数 `foo` 可以用任何可赋值给 `ABC` 的值调用，而不仅仅是具有 `'a'`、`'b'` 和 `'c'` 属性的值。完全有可能该值还有其他属性（参见 Item 4 了解原因）。为了允许这种情况，TypeScript 给 `k` 它唯一能确定的类型，即 `string`。

使用类型断言到 `keyof ABC` 在这里还有另一个缺点：

```ts
function foo(abc: ABC) {
  for (const kStr in abc) {
    let k = kStr as keyof ABC
    //  ^? let k: keyof ABC (equivalent to "a" | "b" | "c")
    const v = abc[k]
    //    ^? const v: string | number
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgIICEDCyDeAoZZOALmQGcwpQBzAbgOQCNSKqQ6GFSQBXAW0bR6AXzwweIBGGAB7EMhgyZACjiMuaLAEpcDRVGTKEcisgDaAawA0yAG4BdZDJjIA8owBWEKQDoI4KggyVXUtHXxCQgB6KMi45AA9AH5kYxBTCxZKGgZCNLIZABsIH0KZamVbLXo4mPj45NSTMDtSOBAATwZRUSA)

如果 `"a" | "b" | "c"` 对 `k` 来说太窄，那么 `string | number` 对 `v` 来说肯定也太窄。在前面的例子中，其中一个值是 `Date`，但它可能是任何东西。这可能导致运行时的混乱。正如 Item 9 所解释的，类型断言应该总是让你紧张，因为 TypeScript 可能发现了什么。（令人惊讶的是，TypeScript 会让你在这个 for-in 循环上方声明 `let k: keyof ABC` 并使用 `k` 作为迭代器，但这并不比类型断言更安全，而且不够明确。）

那么如果你只想遍历对象的键和值而不出现类型错误怎么办？`Object.entries` 让你可以同时遍历两者：

```ts
function foo(abc: ABC) {
  for (const [k, v] of Object.entries(abc)) {
    //        ^? const k: string
    console.log(v)
    //          ^? const v: any
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgIICEDCyDeAoZZOALmQGcwpQBzAbgOQCNSKqQ6GFSQBXAW0bR6AXzwweIBGGAB7EMhgyZACjiMuaLAEpcDRVGTKEcisgDaAawA0yAG4BdZDJjIA8owBWEKQDoI4KggyVXUtHXxCQgB6KMi45AA9AH5kYxBTCxZKGgZCNLIZABsIH0KZamVbLXo4mPj45NSTMDtSOBAATwZRUSA)

虽然这些类型可能很难处理，但它们至少是诚实的！

TypeScript 在 for-in 循环中推断 `string` 的另一个原因是原型污染。这是一个安全问题，其中定义在 `Object.prototype` 上的属性被所有其他对象继承。这些继承的属性将被 for-in 循环枚举，所以 `string` 是一个更安全的选择。（`Object.entries` 排除了继承的属性。）

获得更精确类型的安全方法是明确列出你感兴趣的键：

```ts
function foo(abc: ABC) {
  const keys = ['a', 'b', 'c'] as const
  for (const k of keys) {
    //       ^? const k: "a" | "b" | "c"
    const v = abc[k]
    //    ^? const v: string | number
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgIICEDCyDeAoZZOALmQGcwpQBzAbgOQCNSKqQ6GFSQBXAW0bR6AXzwweIBGGAB7EMhgyZACjiMuaLAEpcnORWQBrCAE8yyALzIA2gHI4tgDTJbjJy4S2AukXMJ9YPSEilDIyv4gBobIMjBGpmQ6+ISEAPSpKZkAegD8yBFRpABEcEXIAD7IRYxllUUIRQyEBWDIAG6WROrWhl5BKenZeS3tLJQ0Fci8AtAMoqJAA)

如果你的意图是覆盖 `ABC` 中的所有键，你需要某种方式来保持键数组与类型同步。

虽然遍历对象有很多危险，但遍历 `Map` 则没有：

```ts
const m = new Map([
  //  ^? const m: Map<string, string>
  ['one', 'uno'],
  ['two', 'dos'],
  ['three', 'tres'],
])
for (const [k, v] of m.entries()) {
  //        ^? const k: string
  console.log(v)
  //          ^? const v: string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgIICEDCyDeAoZZOALmQGcwpQBzAbgOQCNSKqQ6GFSQBXAW0bR6AXzwIA9iArI+yALzIQEAO7IAsnAAOACgDaDAPQHCAPQD8yCVLAzSGzQB5WNADTlKNAHwNdAckkQvm6+PCDivgC6Lj6+YMrhwQAm4mSR0YR+YAAWUBCBwZQQqVF4EQCU9DDiUMjaVtK6ANZuAG4RyOIwMgB0EOBURdplZbiGxoQTphb1No0sHuyckmTiADYQ3avi1NotFWOTh8jmlss2LfNs1HiiQA)

Map 更容易遍历，因为它们没有与对象相同的结构行为：你永远不会在不使用类型断言或通过 `any` 类型的情况下在 `Map<string, string>` 中放入数字值。但如果你的数据来自 JSON 或已经设计为使用对象的另一个 API，它们可能不太方便使用。Item 16 有一个例子，说明如何用 Map 替换对象类型可以提高代码的类型安全性。

如果你想遍历不可变对象中的键和值，你可以在 for-in 循环中对键使用显式类型断言。要安全地遍历可能具有额外属性的对象，请使用 `Object.entries`。它总是安全的，尽管键和值类型更难处理。并考虑 Map 是否可能是合适的替代方案。

## 要点回顾

- 要注意函数接收的任何对象作为参数可能包含额外的键。
- 使用 `Object.entries` 来遍历任何对象的键和值。
- 当你确切知道对象的键时，使用 `for-in` 循环并进行显式的类型断言来遍历对象。
- 考虑使用 `Map` 作为对象的替代品，因为它更容易进行迭代。

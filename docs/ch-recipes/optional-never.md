# Item 63: Use Optional Never Properties to Model Exclusive Or

## 要点

- In TypeScript, "or" is "inclusive or": `A | B` means either `A`, `B`, or both.
- Consider the "both" possibility in your code, and either handle it or disallow it.
- Use tagged unions to model exclusive or where it's convenient. Consider using optional `never` properties where it isn't.
- 在 TypeScript 中，"或"是"包括性或"：`A | B` 意味着可以是 `A`、`B`，或者两者都有。
- 在代码中考虑"同时"的情况，并对其进行处理或禁止。
- 在方便的情况下，使用标记联合（tagged unions）来建模互斥或（exclusive or）。在不方便使用时，可以考虑使用可选的 `never` 属性。

## 正文

在普通语言中，"或"意味着"互斥或"。只有程序员和逻辑学家才使用包括性或。

在 TypeScript 中，很容易混淆这两种情况：

```ts
interface ThingOne {
  shirtColor: string
}
interface ThingTwo {
  hairColor: string
}
type Thing = ThingOne | ThingTwo
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgCoAtQHMDyIUDeAUMsgM6ZRgDCA9gDa1QBc5YU2A3EQL5GiRYiFBmyoA7rWTFS6OMCh1GLNhxBZufMAE8ADiMzrkAXjSHc+ZAB8zYydyA)

我们通常将最后一行读作"类型 Thing 是 ThingOne 或 ThingTwo"。但就像 JavaScript 运行时的或（||）一样，TypeScript 类型级别的或（|）是包括性或。没有理由一个对象不能同时是 ThingOne 和 ThingTwo：

```ts
const bothThings = {
  shirtColor: 'red',
  hairColor: 'blue',
}
const thing1: ThingOne = bothThings // ok
const thing2: ThingTwo = bothThings // ok
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgCoAtQHMDyIUDeAUMsgM6ZRgDCA9gDa1QBc5YU2A3EQL5GiRYiFBmyoA7rWTFS6OMCh1GLNhxBZufMAE8ADiMzrkAXjSHc+ZAB8zYydwS0QZMMgBGtMOlHqyJ6STklDQMTKwA5FAQACbhADSBcgpKYcjhbvQArhDxvA5OLshe2ACMrD4WKKYeXhVknKQA9I3ItADWRI7OrsXqAEzl5hJS1Z7e5vVNLe1EQA)

为什么这样是可行的？这是因为 TypeScript 具有结构类型系统（Item 4）。ThingOne 和 ThingTwo 类型都允许额外的属性，这些属性没有在它们的接口中声明，尽管正如 Item 11 所解释的，这有时会被多余属性检查所掩盖。

那么如果你真的想要互斥或呢？如果你想要保持 ThingOne 和 ThingTwo 分离呢？你如何建模这种情况？

标准的技巧是在你的接口中使用可选的 never 类型来禁止某个属性：

```ts
interface OnlyThingOne {
  shirtColor: string
  hairColor?: never
}
interface OnlyThingTwo {
  hairColor: string
  shirtColor?: never
}
type ExclusiveThing = OnlyThingOne | OnlyThingTwo
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBARiKALAKkglmA5hGBeGAbwCgYYIMAnKAYRABsRKAuGAckoFMATNgGlIwkAQ3SU6jFuzj0Arp37EAvgG5imKJ0oAzYcE4wA8mHoBPNJizGDJMhTG0GTVtEqW1ZEWIlMA-KzBOADctNSV1ME0dPQNjMwtsFAB3ECJBL3EnKVd3QXtqH0p-GECQyjDiKFMABwMAUQAPYDkIdBCErHwjE3MMbGsYAB9u+L6sZJA1IA)

现在之前的赋值都不能通过类型检查器：

```ts
const thing1: OnlyThingOne = bothThings
//    ~~~~~~ Types of property 'hairColor' are incompatible.
const thing2: OnlyThingTwo = bothThings
//    ~~~~~~ Types of property 'shirtColor' are incompatible.
const allThings: ExclusiveThing = {
  //  ~~~~~~~~~ Types of property 'hairColor' are incompatible.
  shirtColor: 'red',
  hairColor: 'blue',
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBARiKALAKkglmA5hGBeGAbwCgYYIMAnKAYRABsRKAuGAckoFMATNgGlIwkAQ3SU6jFuzj0Arp37EAvgG5imKJ0oAzYcE4wA8mHoBPNJizGDJMhTG0GTVtEqW1ZEWIlMA-KzBOADctNSV1ME0dPQNjMwtsFAB3ECJBL3EnKVd3QXtqH0p-GECQyjDiKFMABwMAUQAPYDkIdBCErHwjE3MMbGsYAB9u+L6sZJA1UEhYZEsARlY43ssBggRkDog1AHodsjIAP2OTmBQazlwQbRhqyhBa6lN2DMK2GGEuGExQAFtq4RQdAyTgAOmI02gMDm2AATEseh0Jl0NqgxttiHsDjATqdzrUrjc7g8tFV2PlHJJ3p8DD8QP9AcD6GCIeAocJ6PQtqxGs1ZK12mMurYYFicbjcWcLoTbvdHmS2K8stSvnSGUCQeC7FRKc52FxeAJPKJMpJWGwZPJFKpiEA)

这是可行的，因为没有值可以赋值给 never 类型。但因为属性是可选的，所以恰好有一种出路：不拥有该属性。

这不仅对联合类型有用。回想一下 Item 4，结构类型化对于二维和三维向量来说不是一个好的模型。你可以使用可选的 never 来直接禁止 2D 向量上的 z 属性：

```ts
interface Vector2D {
  x: number
  y: number
  z?: never
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubY4BeAfh4QAbvwC+JIA)

使用这种类型，如果你意外地将三维向量传递给期望二维向量的函数（如 norm），你会得到一个错误：

```ts
function norm(v: Vector2D) {
  return Math.sqrt(v.x ** 2 + v.y ** 2)
}
const v = { x: 3, y: 4, z: 5 }
const d = norm(v)
//             ~ Types of property 'z' are incompatible.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubY4BeAfh4QAbvwC+JGHRCZgWELRwMAFGJrpMOAgEpiHKBDB0oygLJwwACwB0AZwCOUMBrsVkAKi-JcyAGpkMTtOb19cPXZpBCUHMGDkAF5iamQAZgAaLhoAFmyBGgBWSXZYkHjkABNklSh1MSiSAHpm8naOjoA-ZAAVTgAHCAdkLBhkAagsIdcwgHIBOeQ4Y2RQWIYB62AmABsIOxIgA)

如果没有 `z?: never`，这不会是一个错误，因为调用在结构上是有效的，尽管在语义上是不正确的。我们将在 Item 64 中看到另一种修复 Vector2D 问题的方法：品牌（brands）。

你也可以使用标记联合（Item 34）来实现互斥或：

```ts
interface ThingOneTag {
  type: 'one'
  shirtColor: string
}
interface ThingTwoTag {
  type: 'two'
  hairColor: string
}
type Thing = ThingOneTag | ThingTwoTag
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgCoAtQHMDyIKpxbIDeAUMsmAJ4AOEAXMgOQD2+zA3BcgM6ZQwAYVYAbVlCa8wUbNwC+ZUJFiIUGbKgDurQsXKUa9JszA6uPdHGBQR4yXxlyyio+swhiAXjQfc+PWQAH19NHT1uIA)

一个字符串不能同时是 'one' 和 'two'，所以这些类型之间没有重叠。这意味着包括性或和互斥或之间没有区别。这是在你能够使用时使用标记联合的众多好理由之一。

与其手动添加可选的 never 属性，可以定义一个通用的互斥或（XOR）辅助类型：

```ts
type XOR<T1, T2> =
  | (T1 & { [k in Exclude<keyof T2, keyof T1>]?: never })
  | (T2 & { [k in Exclude<keyof T1, keyof T2>]?: never })
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAGg8gJQDwBUCMAaKKBMA+KAXgCgoyoAKdKAMigG8BtAaygEsA7KAUQA8BjADYBXACYQkzCCAD2AM2w4sU2QvR4AugH4AXFA4QAbhABOAXwCUUAD6lyVHLQYt2XPkLESV87Jije1fG09A2NzCwBuYiA)

你可以使用这个来直接从本条目开头的接口构造 ExclusiveThing：

```ts
type ExclusiveThing = XOR<ThingOne, ThingTwo>
const allThings: ExclusiveThing = {
  //  ~~~~~~~~~ Types of property 'hairColor' are incompatible.
  shirtColor: 'red',
  hairColor: 'blue',
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAGg8gJQDwBUCMAaKKBMA+KAXgCgoyoAKdKAMigG8BtAaygEsA7KAUQA8BjADYBXACYQkzCCAD2AM2w4sU2QvR4AugH4AXFA4QAbhABOAXwCUUAD6lyVHLQYt2XPkLESV87Jije1fG09A2NzCwBuYk5gUzkAQ35oFAALTgBzOAMGOwBnNJNgAGEZQRkTPVzgEwyos2iOWJMEpOw0jnSUAHcZHLIU+LYTErKKqCqajrriUEg2jKJ5jqzoayXOnqjZ6HcRXLZjVIXCWERUdsyDLCOO7pk8KP4ZDiqoeMFBG-TcvV3hfcOF0W9DsAHpQWQAH7QmEw7DgCC5KA+MAmGSQQogKAAcgGQxG5WxbxM0E4TwAtmB4sA2AAjQQQAB0eQKxVK5T02JJomxGDseOG7LG2PpwggvOIZiiQA)

虽然标记联合是在 TypeScript 中创建互斥类型的更常见方式，但在你无法或不想添加显式标记的情况下，可选的 never 技巧可能会有所帮助。

## 要点回顾

- 在 TypeScript 中，"或"是"包括性或"：`A | B` 意味着可以是 `A`、`B`，或者两者都有。
- 在代码中考虑"同时"的情况，并对其进行处理或禁止。
- 在方便的情况下，使用标记联合来建模互斥或。在不方便使用时，可以考虑使用可选的 `never` 属性。

# 第 21 条：一次性创建对象

## 要点

- 更倾向于一次性构建对象，而不是逐步添加属性。
- 使用多个对象和对象展开语法（`{...a, ...b}`）以类型安全的方式添加属性。
- 知道如何有条件地向对象添加属性。

## 正文

正如第 19 条所说，虽然变量的值可以改变，但在 TypeScript 中变量的类型通常不会变。这让某些 JavaScript 写法在 TypeScript 中不好实现，尤其是建议你一次性创建完整对象，而不是一点一点地给对象添加属性。

JavaScript 中，你可能会这样创建一个二维点对象：

```js
const pt = {}
pt.x = 3
pt.y = 4
```

但是在 TypeScript 中，这样写会报错：

```ts
const pt = {}
pt.x = 3 // 报错：{} 类型上不存在属性 'x'
pt.y = 4 // 报错：{} 类型上不存在属性 'y'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBADrAvDA3gXwNwCgD0OYEwB6A-DKJLAgFyppYIB0AHjMgMzZ4wB+MACgCcQcAKaCoATxgByZjJgATEKIgwwIWKOYBLaDHAwpY2ehkMojacgAsXfHyEjxU2ZIXLV6zTG17YhsaipmjmQA)

因为 `pt` 的类型是根据初始化值 `{}` 推断出来的，只能赋值给已知的属性。

如果你定义了一个接口 `Point`，再用空对象赋值，也会有问题：

```ts
interface Point {
  x: number
  y: number
}
const pt: Point = {} // 报错：{} 缺少 'x' 和 'y' 属性
pt.x = 3
pt.y = 4
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgAoHtRmQb2QDwC5kQBXAWwCNoBuZAT2LKtuQF8AoBdEAZ2wAOYYhizIAvLjY0OyOQHp5yAH7LkAFXoCUAchxsdyYL2TljvUAHNkYABYoY6ADZP0AdyvIBUdNqhhgCBMYH3IbLV1RcB1ifAAaBg4hADp8CWQAZhkU+nSAFhkgA)

用类型断言似乎解决了问题：

```ts
const pt = {} as Point
//    ^? const pt: Point
pt.x = 3
pt.y = 4 // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgAoHtRmQb2QDwC5kQBXAWwCNoBuZAT2LKtuQF8AoBdEAZ2wAO2ALy42yOLzSZwNDgHp5yZcgB6AfmTc+gsMQxYOQgHT5kogMxyT9c8gAsdZIuQB5ANIcgA)

但这样做有风险：TypeScript 不会检查你是否给 `pt` 赋齐所有属性，少赋了某个属性，类型检查也会通过，可能导致运行时出错。类型断言不应当成为首选方案。

最佳做法是一次性定义完整对象：

```ts
const pt: Point = { x: 3, y: 4 }
```

如果要用小对象组合成大对象，避免多步赋值：

```ts
const pt = { x: 3, y: 4 }
const id = { name: 'Pythagoras' }
const namedPoint = {}
Object.assign(namedPoint, pt, id)
namedPoint.name // 报错：{} 类型没有 'name' 属性
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgAoHtRmQb2QDwC5kQBXAWwCNoBuZAT2LKtuQF8AoBdEAZ2wAO2ALy4iyAMwAaBsQAsbGlx79kwACbJROEHHIRiAclT0wACzgBzdFDi9Di5X2y796jFi25HAeUoArCAQwADo7XmBLEAAKVwh3THAZIRkNAEolOISsELilZALCgoB6YuQAP0rytCh0AWgwemRDOMNkdXQIXhJ0bAh8YFUeZEb65pw2Qw4gA)

应该用对象展开语法一次性合并：

```ts
const namedPoint = { ...pt, ...id }
// 类型是 { name: string; x: number; y: number; }
namedPoint.name // 不报错
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgAoHtRmQb2QDwC5kQBXAWwCNoBuZAT2LKtuQF8AoBdEAZ2wAO2ALy4iyAMwAaBsQAsbGlx79kwACbJROEHHIRiAclT0wACzgBzdFDi9Di5X2y796jFi24AdL6Ezfbw1HAHoQ5AjkAD0AfmRuZxI9CHdMcGI8VwNkfihQSzpxZmooOkYSChK6TizUrG8sumQw5AB5AGkOFsie6LiACgEodAFoMHoASiT9Ylz8jiA)

你也可以用对象展开语法分步构造对象，每次都用新变量，这样每个变量都会有新的类型（符合第 19 条）：

```ts
const pt0 = {}
const pt1 = { ...pt0, x: 3 }
const pt: Point = { ...pt1, y: 4 } // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgAoHtRmQb2QDwC5kQBXAWwCNoBuZAT2LKtuQF8AoBdEAZ2wAOYAAzIAvLjY0uPfsiEBGcbgB0aocIA0BYgGYpMvoLDEMWZTjUrF2xsgAsU5MgD0L5AHkA0hyA)

最后一行的类型声明确保属性都已赋齐。虽然写法有点绕，但对复杂对象分步构建很有用。

要有条件地添加属性，可以用展开和空对象或假值（null、undefined、false 等）来避免加属性：

```ts
declare let hasMiddle: boolean
const firstLast = { first: 'Harry', last: 'Truman' }
const president = { ...firstLast, ...(hasMiddle ? { middle: 'S' } : {}) }
//    ^? const president: {
//         middle?: string;
//         first: string;
//         last: string;
//       }
// or: const president = {...firstLast, ...(hasMiddle && {middle: 'S'})};
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&exactOptionalPropertyTypes=true#code/CYUwxgNghgTiAEEQBd4AsoGcCyBLYwSAXPAEYD25SUAdgNwBQY5NmqAZrjGwDJaoBeeAG9O3ZCQDkACVgwAnpIA0iflIAqMAK4BbWpIC+jZq1QAHOJnwgagkQDpHY3vxWP7ACgw58hBAH4RHV9ieEkAZUN4EmEDAEojBgB6JPg0+AA9QJM2eAsQK1BbGOTU9PL4YIIkfxI2GFwaAHNGFIry5wl4esaW0vb06DY65Abm1rKKg37yGBIc80trW3ghYXdOvjY3Ry8sPGqEADIjoJCQKUj4xKA)

这样推断出的类型中 `middle` 是可选属性。

你也可以用类似方法同时条件添加多个字段：

```ts
declare let hasDates: boolean
const nameTitle = { name: 'Khufu', title: 'Pharaoh' }
const pharaoh = { ...nameTitle, ...(hasDates && { start: -2589, end: -2566 }) }
//    ^? const pharaoh: {
//         start?: number;
//         end?: number;
//         name: string;
//         title: string;
//       }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&exactOptionalPropertyTypes=true#code/CYUwxgNghgTiAEEQBd4AsoGcAiVkkwC54AjAezKSgDsBuAKDDOs1WqgFsQAVAS2STwAvPADe7LsQDkAaTQBXAGbypAGnjJ+SaQAUMMKGTRSAvgyYtUAB32G0wsfAB0LiTy0h1LpwAoMOPAJ4ADJgsVZYZGIAWgAmAFYADgBOdRBqYBiEgDZskwBKM3oAemL4cvgAPQB+eAtWeBtYO2JRErKKzvgImGRq4mp5DhIQGAZSrs704H74QeHR8Y7Juc4QYlYYXmoAcyWV8s0Bde7kLd39yZN6IA)

如果你从 `pharaoh` 取出 `start`，类型是 `number | undefined`，需要考虑它可能是 `undefined`：

```ts
const { start } = pharaoh // 类型 number | undefined
```

有时你需要通过转换另一个对象来创建新对象或数组，这时“全量创建”的思路对应于用内置的函数式方法或像 Lodash 这样的工具库，而不是用循环。第 26 条有更多相关内容。

## 关键点总结

- 更倾向于一次性构建对象，而不是逐步添加属性。
- 使用多个对象和对象展开语法（`{...a, ...b}`）以类型安全的方式添加属性。
- 知道如何有条件地向对象添加属性。

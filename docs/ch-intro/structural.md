# 熟悉结构化类型

## 要点

- 理解 JavaScript 是鸭子类型（duck typed），而 TypeScript 使用结构化类型来模拟这一点：符合接口的值可能还包含接口中未声明的其他属性。类型并不是“封闭”的。
- 注意**类**也遵循结构化类型规则。你拿到的实例可能并不是你预期的那个**类**的实例。
- 利用结构化类型的特性，有助于单元测试的编写与执行。

> 鸭子类型（英语：duck typing）在程序设计中是动态类型的一种风格。在这种风格中，一个对象有效的语义，不是由继承自特定的类或实现特定的接口，而是由“当前方法和属性的集合”决定。
>
> 这个概念的名字来源于由詹姆斯·惠特科姆·莱利提出的鸭子测试：
> “当看到一只鸟走起来像鸭子、游泳起来像鸭子、叫起来也像鸭子，那么这只鸟就可以被称为鸭子。”

## 正文

### JavaScript 的“鸭子类型”与 TypeScript 的结构类型系统

JavaScript 提倡“**鸭子类型（duck typing）**”：如果一个值具有正确的属性，函数就会接受它，而不关心它的来源。TypeScript 通过**结构类型系统（structural typing）** 来建模这种行为。

但这有时会导致意想不到的结果，因为 TypeScript 的类型检查可能比你的预期更宽松或严格。理解**结构类型系统**可以帮助你更好地理解 TypeScript 的错误（或非错误），并编写更健壮的代码。

假设你现在正在开发一个 tsScript 库，需要定义一个二维向量类型 `Vector2D`：

```ts
interface Vector2D {
  x: number
  y: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubZIC+JIA)

并编写一个函数来计算它的长度:

```ts
function calculateLength(v: Vector2D) {
  return Math.sqrt(v.x ** 2 + v.y ** 2)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubZIC+JGHRCZgWEMgRwANgjqy4kADIQQAczAALABQA3Gukw4CASmIcoEMHShSAssu0A6AM4BHKGAMuKyACoA5FxkAGpkfRdOQODcM3YhIA)

现在定义命名向量的概念：

```ts
interface NamedVector {
  name: string
  x: number
  y: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubZIC+JGHRCZgWEMgRwANgjqy4kADIQQAczAALABQA3Gukw4CASmIcoEMHShSAssu0A6AM4BHKGAMuKyACoA5FxkAGpkfRdOQODcM3YhUEhYRBQAOTgGCAATY2woS3IQLIgaNzAoUA12cmpaRhYoWq4eRv4hIA)

`calculateLength` 函数可以用于 `NamedVectors`，因为它们具有数值类型的 `x` 和 `y` 属性。TypeScript 足够智能，可以推断出这一点。

```ts
const v: NamedVector = { x: 3, y: 4, name: 'Pythagoras' }
calculateLength(v) // OK, result is 5
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubZIC+JGHRCZgWEMgRwANgjqy4kADIQQAczAALABQA3Gukw4CASmIcoEMHShSAssu0A6AM4BHKGAMuKyACoA5FxkAGpkfRdOQODcM3YhUEhYRBQAOTgGCAATY2woS3IQLIgaNzAoUA12cmpaRhYoWq4eRv4hBEkKyJpM7LyMAuQAXmJKGgBmABpW5AAWWZLsmgByAAVOHTgNHDg3VeQBdhl5RWUINU0dAwTyAHp75AB5AGlZ6zdFMGRgN2QAKwkIA)

有趣的是，你从未显式声明 `Vector2D` 和 `NamedVector` 之间的关系，也不需要为 `NamedVector` 额外编写 `calculateLength` 的实现。TypeScript 的类型系统模拟了 JavaScript 的运行时行为（参见第 1 条），它允许 `calculateLength` 被 `NamedVector` 调用，因为它的结构与 `Vector2D` 兼容。这正是“结构化类型”（structural typing）这个术语的由来。

但这也可能带来问题。假设你添加了一个 3D 向量类型：

```ts
interface Vector3D {
  x: number
  y: number
  z: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubZIC+JGHRCZgWEMgRwANgjqy4kADIQQAczAALABQA3Gukw4CASmIcoEMHShSAssu0A6AM4BHKGAMuKyACoA5FxkAGpkfRdOQODcM3YhUEhYRBQAOTgGCAATY2woS3IQLIgaNzAoUA12cmpaRhYoWq4eRv4k8Gh4JDQMAoBmQlI6tr5mjm4G8ZaALzGmxJIgA)

并编写一个函数来对它们进行归一化（使它们的长度为 1）：

```ts
function normalize(v: Vector3D) {
  const length = calculateLength(v)
  return {
    x: v.x / length,
    y: v.y / length,
    z: v.z / length,
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubZIC+JGHRCZgWEMgRwANgjqy4kADIQQAczAALABQA3Gukw4CASmIcoEMHShSAssu0A6AM4BHKGAMuKyACoA5FxkAGpkfRdOQODcM3YhUEhYRBQAOTgGCAATY2woS3IQLIgaNzAoUA12cmpaRhYoWq4eRv4k8Gh4JDQMAoBmQlI6tr5mjm4G8ZaALzGmxOFRcUlaHAY5YFmIAyN+nCGLEelJCuRZdS1tZABeaTkFJVUrnQMEqxs7KRPRyL9kAB6C6vbQAGg45CmURiwMumh0EPI5Hm-1mQJBCPBHAESyAA)

如果调用这个函数，你可能会得到一个长度大于 1 的向量：

```bash
> normalize({x: 3, y: 4, z: 5})
{ x: 0.6, y: 0.8, z: 1 }
```

这个向量的长度大约是 1.4，而不是 1。那么问题出在哪里，为什么 TypeScript 没有捕获这个错误呢？

问题在于 `calculateLength` 处理的是 2D 向量，而 `normalize` 处理的是 3D 向量。因此，在归一化过程中，`z` 分量被忽略了。

更令人惊讶的是，TypeScript 的类型检查器并没有捕获这个问题。

为什么你可以用 3D 向量调用 `calculateLength`，尽管它的类型声明表明它只接受 2D 向量？

在 `NamedVector` 中发挥作用的结构化类型检查机制，在这里却导致了问题。当 `calculateLength` 被传入一个 `{x, y, z}` 对象时，并不会抛出错误。因此，TypeScript 的类型检查器也不会报错，而这种行为最终导致了一个 bug。

（如果你希望 TypeScript 抛出错误，你可以选择一些方法。第 63 条介绍了一种技巧，可以专门禁止 `z` 属性，而第 64 条展示了如何使用“类型标记”（branding）来完全避免这种结构化类型检查。）

在编写函数时，你可能会假设它们的参数只包含你声明的属性，而不会有额外的属性。这种假设被称为“封闭”（closed）、“封装”（sealed）或“精确”（precise）类型，但 TypeScript 的类型系统无法表达这种约束。不管你是否喜欢，你的类型都是“开放的”。

这有时会带来一些意想不到的问题：

```ts
function calculateLengthL1(v: Vector3D) {
  let length = 0
  for (const axis of Object.keys(v)) {
    const coord = v[axis]
    //            ~~~~~~~ Element implicitly has an 'any' type because ...
    //                    'string' can't be used to index type 'Vector3D'
    length += Math.abs(coord)
  }
  return length
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubZIC+JGHRCZgWEMgRwANgjqy4kADIQQAczAALABQA3Gukw4CASmIcoEMHShSAssu0A6AM4BHKGAMuKyACoA5FxkAGpkfRdOQODcM3YhUEhYRBQAOTgGCAATY2woS3IQLIgaNzAoUA12cmpaRhYoWq4eRv4k8Gh4JDQMAoBmQlI6tr5mjm4G8ZaALzGmxOFRcUlaHAY5YFmIAyN+nCGLEelJCuRZdS1tZABeaTkFJVUrnQMEqxs7KRPRyL9kAB6C6vbQAGg45CmURiwMumh0EPI5Hm-1mQJBCPBHAESxEYjAEikMnkimUEDUWJUAEY9n0TFAjkUQWBMdc7sgAAwtGA4ZC6BBnVlwCjANzILAwZAAeSYACt+i4ANYQThud7HSGnEDnQU4HIc-QAbRFYoAui1yIDgcjbbaAH6Op325AAUUu2XAyGADAADrJgAhgGBZDFtHBxXApAByKOcaPIMCcX0oFgyOhuFAubNa612-MF8jRipVTQJmQgaOsljIDO5RNYb0gHIQfxJlPIaP5Q74aNa+HssL3Jw6FxwJjqvVQHIfchCcjWWz2Nk6JZAA)

为什么这是一个错误？因为 `axis` 是 `v`（一个 `Vector3D` 类型）的键之一，它应该是 "x"、"y" 或 "z" 中的一个。而根据 `Vector3D` 的声明，这些应该都是**数字类型**，那么 `coord` 的类型可能并不是 `number`。

因为在上一段的逻辑假设 `Vector3D` 是封闭的，不包含其他属性。但实际上它可能有其他属性：

```ts
const vec3D = { x: 3, y: 4, z: 1, address: '123 Broadway' }
calculateLengthL1(vec3D) // OK, returns NaN
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubZIC+JGHRCZgWEMgRwANgjqy4kADIQQAczAALABQA3Gukw4CASmIcoEMHShSAssu0A6AM4BHKGAMuKyACoA5FxkAGpkfRdOQODcM3YhUEhYRBQAOTgGCAATY2woS3IQLIgaNzAoUA12cmpaRhYoWq4eRv4k8Gh4JDQMAoBmQlI6tr5mjm4G8ZaALzGmxOFRcUlaHAY5YFmIAyN+nCGLEelJCuRZdS1tZABeaTkFJVUrnQMEqxs7KRPRyL9kAB6C6vbQAGg45CmURiwMumh0EPI5Hm-1mQJBCPBHAESxEYjAEikMnkimUEDUWJUAEY9n0TFAjkUQWBMdc7sgAAwtGA4ZC6BBnVlwCjANzILAwZAAeSYACt+i4ANYQThud7HSGnEDnQU4HIc-QAbRFYoAui1yIDgcjbbaAH6Op325AAUUu2XAyGADAADrJgAhgGBZDFtHBxXApAByKOcaPIMCcX0oFgyOhuFAubNa612-MF8jRipVTQJmQgaOsljIDO5RNYb0gHIQfxJlPIaP5Q74aNa+HssL3Jw6FxwJjqvVQHIfchCcjWWz2Nk6JaCnWs-QYIYcoj1AZg1rIAAsh9R1MPcByOWsbjcNGj1NwA2QACEoFgrwB3ODx3EkEknnJSlrhpAxt3wBIrWBaUAGlD0Xb5xUydISCAA)

因为 `v` 可能包含任何属性，所以 `axis` 的类型是 `string`。TypeScript 没有理由相信 `v[axis]` 是数字，因为正如你刚才看到的，它可能不是数字。（这里的 `vec3D` 变量避免了过度属性检查，这在第 11 条中讨论。）

遍历对象的类型可能很难正确处理。我们将在第 60 条中再次讨论这个话题，但在这种情况下，没有循环的实现会更好：

```ts
function calculateLengthL1(v: Vector3D) {
  return Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAzAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubY4BePRiyjsAviRh0QmYFhDIEcADYI6KuJAAyEEAHMwAC20BGABQA3Gukw4CASmIcoEMHSiKAslqMA6OCYAZys-CicAamQfYwDg0M5I6N84kMs-AQcJEiA)

值得注意的是，结构化类型也可能在类的使用中带来意外的结果，因为类是通过结构进行可赋值性比较的：

```ts
class SmallNumContainer {
  num: number
  constructor(num: number) {
    if (num < 0 || num >= 10) {
      throw new Error(`You gave me ${num} but I want something 0-9.`)
    }
    this.num = num
  }
}

const a = new SmallNumContainer(5)
const b: SmallNumContainer = { num: 2024 } // OK!
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEDKC2YQgHIFd4GED2A7ALmAJa4CmATtAN4BQ00uGAXAxgEYUDcd0weE+cmmD5s5ABSN4LKR3IBKaj3pEAZtEkZoAHmgAGaAB9DreNAB8AXmgBGPYtr0n0fAAty2AO4NS3gKLkHhIABgCa2GjQAOZgAG6k0PAJACRUUgC+0Gxo+NAAktCeYATQENhJbiRR+gC0AJwAdMHyytDprZUQDVLQ1lLc9O3tNHy4AtBgvT7eCEioGDgExGQSAKzy3KPjbCyzyOhYeIQkFFNUpiwATHqXACxtnPQA9E-QAPIA0gCENEA)

为什么 `b` 可以赋值给 `SmallNumContainer`？因为它有一个 `num` 属性，且类型是 `number`。所以它们的结构是匹配的。如果你写一个假设 `SmallNumContainer` 构造函数中的验证逻辑已经执行过的函数，这可能会导致问题。对于具有更多属性和方法的类，虽然这种问题发生的概率较低，但它与 C++ 或 Java 等语言不同，在这些语言中，声明一个参数为 `SmallNumContainer` 类型可以保证它要么是 `SmallNumContainer` 本身，要么是它的子类，因此构造函数中的验证逻辑肯定已经执行。

结构化类型在编写测试时是有利的。假设你有一个在数据库上运行查询并处理结果的函数：

```ts
interface Author {
  first: string
  last: string
}
function getAuthors(database: PostgresDB): Author[] {
  const authorRows = database.runQuery(`SELECT first, last FROM authors`)
  return authorRows.map((row) => ({ first: row[0], last: row[1] }))
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgAoHsDOYDmUKYAiAQsgN4BQyyUAriAIq3QCeAXMgBSYCOANh2xRQOAJTIAvAD5kcECwDaAXQDcFAL4VQkWIhQBBWmAAW6KOSrIYwKNkFhhIHGup84d5EJFrNMegjBgdBBkHAgwQxMzTE4AEzgwOAAjdwgODGw8AhJRDkjTKGULagRg7FkjAoAldAB3TElkeMSUzAgAOjpGZigWTgADAGUAUQAZYYBhABUrG2wAGmQ3coAxKoB5AFkKqNt+0RcacNooELhKsxr69oBbOAAHTig6yRlOMmtbMA5n2oUABiUi2W3xodQUAEYlOpRAcNBQgA)

为了测试上述代码，你可以创建一个模拟的 PostgresDB。但一种更简单的方法是使用结构化类型，定义一个更狭窄的接口：

```ts
interface DB {
  runQuery: (sql: string) => any[]
}
function getAuthors(database: DB): Author[] {
  const authorRows = database.runQuery(`SELECT first, last FROM authors`)
  return authorRows.map((row) => ({ first: row[0], last: row[1] }))
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgAoHsDOYDmUKYAiAQsgN4BQyyUAriAIq3QCeAXMgBSYCOANh2xRQOAJTIAvAD5kcECwDaAXQDcFAL4VQkWIhQBBWmAAW6KOSrIYwKNkFhhIHGup84d5EJFrN26PCRkEgtqOkZmKHYuXgFPBxFxaVl5ZR8KGHoEMGB0EGQcCDBDEzNMTgATODA4ACN3CA4SUQ5i0yhlEOQEXOxZIzaAJXQAd0xJZErquswIADowplZOAAMAZQBRABl1gGEAFSsbbAAaZDdegDEBgHkAWT6S22XRFxpC2ig8uH6zIdHZgC2cAADpwoCNJDJOGRrLYwBxwcMFAAGJSnc7wmgjBQARiU6lELw0FCAA)

由于结构化类型的原因，你仍然可以在生产环境中将 `PostgresDB` 传递给 `getAuthors`，因为它有一个 `runQuery` 方法。`PostgresDB` 不需要声明它实现了 `DB`，TypeScript 会推断出它确实实现了。

在编写测试时，你可以传递一个更简单的对象：

```ts
test('getAuthors', () => {
  const authors = getAuthors({
    runQuery(sql: string) {
      return [
        ['Toni', 'Morrison'],
        ['Maya', 'Angelou'],
      ]
    },
  })
  expect(authors).toEqual([
    { first: 'Toni', last: 'Morrison' },
    { first: 'Maya', last: 'Angelou' },
  ])
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgAoHsDOYDmUKYAiAQsgN4BQyyUAriAIq3QCeAXMgBSYCOANh2xRQOAJTIAvAD5kcECwDaAXQDcFAL4VQkWIhQBBWmAAW6KOSrIYwKNkFhhIHGup84d5EJFrN26PCRkEgtqOkZmKHYuXgFPBxFxaVl5ZR8KGHoEMGB0EGQcCDBDEzNMTgATODA4ACN3CA4SUQ5i0yhlEOQEXOxZIzaAJXQAd0xJZErquswIADowplZOAAMAZQBRABl1gGEAFSsbbAAaZDdegDEBgHkAWT6S22XRFxpC2ig8uH6zIdHZgC2cAADpwoCNJDJOGRrLYwBxwcMFAAGJSnc7wmgjBQARiU6lELw0FEg2E4AHICkUfrZyadOIkZJRqN0QL1vo8xhJ8oVWqVoZZQvRFpFuPx7I4xJ1qKF3p9kAoFOS9rlgHTkOTbmZhJhcuS0QrNXAWHB1eT9E4IHx0LR9apBchNNQCa8IAAPYEQLKcDltTCiWZgdDrHi0OB8TgKB0wo6Y5Wq9UYjia7XAXUgcnqY7R2EeI0mxPuOMWgrW21O5BKIkuihAA)

TypeScript 会验证我们的测试数据库是否符合接口。而且你的测试不需要了解任何关于生产数据库的内容：无需使用模拟库！通过引入抽象（`DB`），我们将逻辑（和测试）与特定实现（`PostgresDB`）的细节解耦。

结构化类型的另一个优点是，它可以干净地切断库之间的依赖关系。有关更多内容，请参见第 70 条。

## 关键点总结

- 理解 JavaScript 是鸭子类型（duck typed），而 TypeScript 使用结构化类型来模拟这一点：符合接口的值可能还包含接口中未声明的其他属性。类型并不是“封闭”的。
- 注意**类**也遵循结构化类型规则。你拿到的实例可能并不是你预期的那个**类**的实例。
- 利用结构化类型的特性，有助于单元测试的编写与执行。

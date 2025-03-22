# 熟悉结构化类型

## 要点

- 理解 JavaScript 是鸭子类型，TypeScript 用结构化类型来模拟这一点：符合接口的值可能还包含接口中未声明的其他属性。类型并不是“封闭”的。
- 注意类同样遵循结构化类型规则，你拿到的实例可能并不是你预期的那个类的实例。
- 利用结构化类型的特性，有助于单元测试的编写与执行。

> 鸭子类型（英语：duck typing）在程序设计中是动态类型的一种风格。在这种风格中，一个对象有效的语义，不是由继承自特定的类或实现特定的接口，而是由“当前方法和属性的集合”决定。
>
> 这个概念的名字来源于由詹姆斯·惠特科姆·莱利提出的鸭子测试：
> “当看到一只鸟走起来像鸭子、游泳起来像鸭子、叫起来也像鸭子，那么这只鸟就可以被称为鸭子。”

## 正文

```ts
interface Vector2D {
  x: number
  y: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubZIC+JIA)

---

```ts
function calculateLength(v: Vector2D) {
  return Math.sqrt(v.x ** 2 + v.y ** 2)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubZIC+JGHRCZgWEMgRwANgjqy4kADIQQAczAALABQA3Gukw4CASmIcoEMHShSAssu0A6AM4BHKGAMuKyACoA5FxkAGpkfRdOQODcM3YhIA)

---

```ts
interface NamedVector {
  name: string
  x: number
  y: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubZIC+JGHRCZgWEMgRwANgjqy4kADIQQAczAALABQA3Gukw4CASmIcoEMHShSAssu0A6AM4BHKGAMuKyACoA5FxkAGpkfRdOQODcM3YhUEhYRBQAOTgGCAATY2woS3IQLIgaNzAoUA12cmpaRhYoWq4eRv4hIA)

---

```ts
const v: NamedVector = { x: 3, y: 4, name: 'Pythagoras' }
calculateLength(v) // OK, result is 5
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubZIC+JGHRCZgWEMgRwANgjqy4kADIQQAczAALABQA3Gukw4CASmIcoEMHShSAssu0A6AM4BHKGAMuKyACoA5FxkAGpkfRdOQODcM3YhUEhYRBQAOTgGCAATY2woS3IQLIgaNzAoUA12cmpaRhYoWq4eRv4hBEkKyJpM7LyMAuQAXmJKGgBmABpW5AAWWZLsmgByAAVOHTgNHDg3VeQBdhl5RWUINU0dAwTyAHp75AB5AGlZ6zdFMGRgN2QAKwkIA)

---

```ts
interface Vector3D {
  x: number
  y: number
  z: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubZIC+JGHRCZgWEMgRwANgjqy4kADIQQAczAALABQA3Gukw4CASmIcoEMHShSAssu0A6AM4BHKGAMuKyACoA5FxkAGpkfRdOQODcM3YhUEhYRBQAOTgGCAATY2woS3IQLIgaNzAoUA12cmpaRhYoWq4eRv4k8Gh4JDQMAoBmQlI6tr5mjm4G8ZaALzGmxJIgA)

---

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

---

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

---

```ts
const vec3D = { x: 3, y: 4, z: 1, address: '123 Broadway' }
calculateLengthL1(vec3D) // OK, returns NaN
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubZIC+JGHRCZgWEMgRwANgjqy4kADIQQAczAALABQA3Gukw4CASmIcoEMHShSAssu0A6AM4BHKGAMuKyACoA5FxkAGpkfRdOQODcM3YhUEhYRBQAOTgGCAATY2woS3IQLIgaNzAoUA12cmpaRhYoWq4eRv4k8Gh4JDQMAoBmQlI6tr5mjm4G8ZaALzGmxOFRcUlaHAY5YFmIAyN+nCGLEelJCuRZdS1tZABeaTkFJVUrnQMEqxs7KRPRyL9kAB6C6vbQAGg45CmURiwMumh0EPI5Hm-1mQJBCPBHAESxEYjAEikMnkimUEDUWJUAEY9n0TFAjkUQWBMdc7sgAAwtGA4ZC6BBnVlwCjANzILAwZAAeSYACt+i4ANYQThud7HSGnEDnQU4HIc-QAbRFYoAui1yIDgcjbbaAH6Op325AAUUu2XAyGADAADrJgAhgGBZDFtHBxXApAByKOcaPIMCcX0oFgyOhuFAubNa612-MF8jRipVTQJmQgaOsljIDO5RNYb0gHIQfxJlPIaP5Q74aNa+HssL3Jw6FxwJjqvVQHIfchCcjWWz2Nk6JaCnWs-QYIYcoj1AZg1rIAAsh9R1MPcByOWsbjcNGj1NwA2QACEoFgrwB3ODx3EkEknnJSlrhpAxt3wBIrWBaUAGlD0Xb5xUydISCAA)

---

```ts
function calculateLengthL1(v: Vector3D) {
  return Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAzAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubY4BePRiyjsAviRh0QmYFhDIEcADYI6KuJAAyEEAHMwAC20BGABQA3Gukw4CASmIcoEMHSiKAslqMA6OCYAZys-CicAamQfYwDg0M5I6N84kMs-AQcJEiA)

---

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

---

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

---

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

---

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

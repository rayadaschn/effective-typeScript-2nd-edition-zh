# Item 64: Consider Brands for Nominal Typing

## 要点

- With nominal typing, a value has a type because you say it has a type, not because it has the same shape as that type.
- Consider attaching brands to distinguish primitive and object types that are semantically distinct but structurally identical.
- Be familiar with the various techniques for branding: properties on object types, string-based enums, private fields, and unique symbols.
- 在命名类型系统中，一个值之所以有某种类型，是因为你声明它具有该类型，而不是因为它的形状与该类型相同。
- 考虑附加标记来区分语义上不同但结构上相同的原始类型和对象类型。
- 熟悉多种标记技术：对象类型的属性、基于字符串的枚举、私有字段和唯一符号等。

## 正文

Item 4 讨论了结构类型以及它有时如何导致令人惊讶的结果：

```ts
interface Vector2D {
  x: number
  y: number
}
function calculateNorm(p: Vector2D) {
  return Math.sqrt(p.x ** 2 + p.y ** 2)
}

calculateNorm({ x: 3, y: 4 }) // OK, result is 5
const vec3D = { x: 3, y: 4, z: 1 }
calculateNorm(vec3D) // OK! result is also 5
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZADwC5kQBXAWwCNoBuM5ATxvubZIC+JGHRCZgWEMgRwANgjqy4kAHI4GACgAONdJhwEAlMQ5QIYOlCkBZZQAsAdAGcAjlDDaHFZACofyXGQAamQtB05ff1xDdiESGXlFZQg1KE0iamQAZgAaLhoAFgEY8gB6UuQAeQBpPLMnRTBkYCdkAFZ4yScmgDcMLMIAXmJM3PzkAryALxoARgF2BIUlVXUNPoQBkuRyquqAQmR6xubWuScsdpIgA)

如果你希望 `calculateNorm` 拒绝 3D 向量怎么办？这违背了 TypeScript 的结构类型模型，但在数学上肯定是更正确的。

Item 63 展示了如何使用可选的 `never` 属性来专门防止 `z` 字段。这是一个纯粹的类型级别修复。它不需要你在运行时更改值。

你也可以通过在运行时向值添加"标签"来防止类型相互赋值：

```ts
interface Vector2D {
  type: '2d'
  x: number
  y: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG8AoZZMATwAcIAuZAclwBNGBuM5ADwZAFcAtgCNoncpT5DRUTgF8SQA)

这里的 `type` 属性充当"标签"。这种模式在联合类型中特别常见。Item 34 更详细地探讨了"标记联合"，它们确实是缓解这个问题的一种方法。但是，它们确实有一些缺点。它们增加了运行时开销，将以前只有数字属性的非常简单的类型变成了字符串和数字混合的类型。此外，你只能向对象类型添加这样的显式标签。

有趣的是，你可以通过仅在类型系统中操作来获得与显式标签相同的许多好处。在这种情况下，标签通常被称为"品牌"（想想奶牛，而不是可口可乐）。这种仅类型的方法消除了运行时开销，还允许你为内置类型（如 `string` 或 `number`）添加品牌，而你无法在这些类型上附加额外的属性。这被称为命名类型，与 TypeScript 通常的结构类型相对。使用命名类型，一个值是 `Vector2D` 是因为你说它是，而不是因为它有正确的形状。

让我们看看这在文件系统路径中是如何工作的。如果你有一个在文件系统上运行的函数，并且需要绝对路径（相对于相对路径）怎么办？这在运行时很容易检查（路径是否以"/"开头？），但在类型系统中就不那么容易了。

以下是使用品牌的方法：

```ts
type AbsolutePath = string & { _brand: 'abs' }
function listAbsolutePath(path: AbsolutePath) {
  // ...
}
function isAbsolutePath(path: string): path is AbsolutePath {
  return path.startsWith('/')
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAggRgZwPYBsCuwIAUCGwAWUAvFAsAE4CWAdgOZQBkUA3gPpzk7UAmAXFAHIciAQF8A3ACgAZmmoBjYJSTUoKSmXjJ0mXAQAUYPPn5bUGbMYCULSVCgB6B1AB0byaJlzFy1RrM6lgZGBPxkVHRW-CGEGrCI5rrGtvbkEMBo5KoxLmQ45MAIAOqUBgIOAlZSnkA)

你无法构造一个既是字符串又具有 `_brand` 属性的对象。这纯粹是类型系统的一个游戏。（如果你认为你可以向字符串分配属性，Item 10 将解释为什么你是错误的。）

如果你有一个可能是绝对路径或相对路径的字符串路径，你可以使用类型守卫进行检查，这将细化其类型：

```ts
function f(path: string) {
  if (isAbsolutePath(path)) {
    listAbsolutePath(path)
  }
  listAbsolutePath(path)
  //               ~~~~ Argument of type 'string' is not assignable to
  //                    parameter of type 'AbsolutePath'
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAggRgZwPYBsCuwIAUCGwAWUAvFAsAE4CWAdgOZQBkUA3gPpzk7UAmAXFAHIciAQF8A3ACgAZmmoBjYJSTUoKSmXjJ0mXAQAUYPPn5bUGbMYCULSVCgB6B1AB0byaJlzFy1RrM6lgZGBPxkVHRW-CGEGrCI5rrGtvbkEMBo5KoxLmQ45MAIAOqUBgIOAlZSnrIKSipQ0obGYRQ0tDbMdlCU0lD6-gmBevjNBFad3fbqmkMWI2P4Vd2e0xrAAfPGi8v2TvYHh0dQAH5nJ7DktGgAthDUwFBIfaCQguHtAj0IUNRIjzgEAhKLRqMIUNBgEhuvtjnDjkZOHdMOQni9wNABJskgQBB5JEA)

这有助于记录哪些函数期望绝对路径或相对路径，以及每个变量持有哪种类型的路径。这不是一个铁定的保证：`path as AbsolutePath` 对任何字符串都会成功。但如果你避免这些类型的断言，那么获得 `AbsolutePath` 的唯一方法就是被给予一个或进行检查，这正是你想要的。

你也可以为数字类型添加品牌——例如，附加单位：

```ts
type Meters = number & { _brand: 'meters' }
type Seconds = number & { _brand: 'seconds' }

const meters = (m: number) => m as Meters
const seconds = (s: number) => s as Seconds

const oneKm = meters(1000)
//    ^? const oneKm: Meters
const oneMin = seconds(60)
//    ^? const oneMin: Seconds
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAshwQE4GcoF4oDsCuBbARklAGRQDeA+vogIaYAmAXFAOS7xLIsC+A3AFChIUAMoQAxgHsGqDDgJFSlanSatkE6fS59+-KZmTAo7BCnRQAFLmbzCiAJToAfCag1UcM8gEGjUDQNtC0tkWzx7JzRXVA9RTRkBfWl-aQgAaVwLU05LAEYABiKHAQB6UqhKqAA9AH4oP2M0zOYvTmTDJswIGABLTAtArWRLADYCkv5yqpr6xqg0vsxmMSDkfiA)

然而，这在实践中可能很尴尬，因为算术运算使数字忘记它们的品牌：

```ts
const tenKm = oneKm * 10
//    ^? const tenKm: number
const v = oneKm / oneMin
//    ^? const v: number
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAshwQE4GcoF4oDsCuBbARklAGRQDeA+vogIaYAmAXFAOS7xLIsC+A3AFChIUAMoQAxgHsGqDDgJFSlanSatkE6fS59+-KZmTAo7BCnRQAFLmbzCiAJToAfCag1UcM8gEGjUDQNtC0tkWzx7JzRXVA9RTRkBfWl-aQgAaVwLU05LAEYABiKHAQB6UqhKqAA9AH4oP2M0zOYvTmTDJswIGABLTAtArWRLADYCkv5yqpr6xqg0vsxmMSDkDv8ETEyLZqyAKihCsoqquoaU4y2WrAikDeMAN13unYrF-pOZ8-nH8IVEPwgA)

如果你的代码涉及大量混合单位的数字，这仍然可能是记录数字参数预期类型的有吸引力的方法。

还有其他技术可以为类型添加品牌。你可能会遇到使用私有字段为类添加品牌的代码，或者与 TypeScript 基于字符串的枚举的交集，它们是命名类型的（Item 72）。

另一种常见的技术是使用唯一符号类型：

```ts
declare const brand: unique symbol
export type Meters = number & { [brand]: 'meters' }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEYD2A7AzgF3gIxlFwAXPAK4oCWAjiQmgJ4C22SEA3AFAgAeADkjFgx0eCALIgMIGGngBeeChJMp8AGTwA3gG1c+YAF1iAcgYSpaIwF8OQA)

这种技术的优点是，由于品牌符号没有被导出，用户将不得不使用类型断言或辅助函数来获得具有 `Meters` 类型的值。他们不能直接使用品牌或创建与之兼容的另一种类型。

无论你如何构造它们，品牌都可以用来建模类型系统中无法表达的许多属性。例如，使用二分搜索在列表中查找元素：

```ts
function binarySearch<T>(xs: T[], x: T): boolean {
  let low = 0,
    high = xs.length - 1
  while (high >= low) {
    const mid = low + Math.floor((high - low) / 2)
    const v = xs[mid]
    if (v === x) return true
    ;[low, high] = x > v ? [mid + 1, high] : [low, mid - 1]
  }
  return false
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAIxmAhgJwJ4GUCmWEAFgDwAqAfABQAeAzgFyLkDaAugDSK3PkCUzZHDgAbQkgDeAKESJxUeXADuiALyIADN2IwA5sXU96AOnFg9UQwFpEARgDcsxMt3jE1XQcSUNolfyIMnJyEAj0igC2MAAmRv6qANSIALLoVibA-nCY1J76NkrKgQD0iABM-E4hiGFgEYgAbkYMrNEx7NUhMMAezWoDPIGY+FAgmEhQmCD4XXKsCToF7C0+TYgA-IhtsYjJdksGK8wLKtztiLZ2nc4Avs4jYxOIwOii9LPS90A)

如果列表已排序，这可以工作，但如果未排序，将导致假阴性。你无法在 TypeScript 的类型系统中表示已排序的列表。但你可以创建一个品牌：

```ts
type SortedList<T> = T[] & { _brand: 'sorted' }

function isSorted<T>(xs: T[]): xs is SortedList<T> {
  for (let i = 0; i < xs.length - 1; i++) {
    if (xs[i] > xs[i + 1]) {
      return false
    }
  }
  return true
}

function binarySearch<T>(xs: SortedList<T>, x: T): boolean {
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAyg9gJ2BAJgGQJYGdgB4AqAfFALxT4DaAulAGRQDeA+gEYICGAdigFxQDkWRMhT8AvgG4AUFIBmAV04BjYBjico2eElQFCACgAeWPpSoBKPsc1ZYw1Jhx7GUqFFmIo+gDYRgm0igABgkA3ChjADpfTgBzYAALKABaKABGUIwAaizzFzc3DFkvYwoMGmJSjCgs9It8grcEP3kEDVl2bywIaUaxVyh+ppa2qGAEeR6pfrlFFTUNFgxOdgQQGAhVpQS9IxM7HXRsPCIAGgjTSygWODhfLgaAekeoAGEAeQBZAAUAJQBRGAwAa+fzeOAAd0CQXOCQwsSSZCiMXiSVSGQGELhvi8cIRUEIZHBELyDAGbiU6hwUAAthgUIFiTUoJ92IlIrJwYh9Po8WioMS8i8AEzmXoFSmcakAN0CpTpKCo4sKxX0spIGoieWawFaGnGk2VUAoxNh8ISNCRBKgsoA-MaFcy0maETQ+CbIedHeilQMhlAdXr3J1uuLnlB-gA5AAi0xkQA)

要调用这个版本的 `binarySearch`，你需要要么被给予一个 `SortedList`（即，有证据证明列表已排序），要么使用 `isSorted` 自己证明它已排序。线性扫描不是很好，但至少你会是安全的！

这是对类型检查器的一般有用观点。例如，要在对象上调用方法，你需要要么被给予一个非空对象，要么用条件自己证明它是非空的。这类似于获得 `SortedList` 的两种方式：你可以要么被给予一个，要么自己证明列表已排序。

## 要点回顾

- 在命名类型系统中，一个值之所以有某种类型，是因为你声明它具有该类型，而不是因为它的形状与该类型相同。
- 考虑附加标记来区分语义上不同但结构上相同的原始类型和对象类型。
- 熟悉多种标记技术：对象类型的属性、基于字符串的枚举、私有字段和唯一符号等。

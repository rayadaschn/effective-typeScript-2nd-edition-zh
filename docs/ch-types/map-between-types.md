# 第 15 条: 利用类型运算和泛型减少重复

## 要点

- DRY（Don’t Repeat Yourself，别重复自己）原则在类型设计中同样适用，就像在业务逻辑中一样。
- 给类型命名，避免重复定义。可以用 `extends` 来继承接口字段，减少重复。
- 熟悉 TypeScript 提供的类型映射工具，比如 `keyof`、`typeof`、索引访问和映射类型。
- 泛型类型就像类型层面的函数，用它们来进行类型转换，而不是重复操作。
- 熟悉标准库中的常用泛型类型，比如 `Pick`、`Partial` 和 `ReturnType`。
- 避免滥用 DRY，确保你复用的属性和类型确实是同一个概念。

## 正文

这个脚本会打印出几个圆柱体的尺寸、表面积和体积。

```ts
console.log(
  'Cylinder r=1 × h=1',
  'Surface area:',
  6.283185 * 1 * 1 + 6.283185 * 1 * 1,
  'Volume:',
  3.14159 * 1 * 1 * 1
)
console.log(
  'Cylinder r=1 × h=2',
  'Surface area:',
  6.283185 * 1 * 1 + 6.283185 * 2 * 1,
  'Volume:',
  3.14159 * 1 * 2 * 1
)
console.log(
  'Cylinder r=2 × h=1',
  'Surface area:',
  6.283185 * 2 * 1 + 6.283185 * 2 * 1,
  'Volume:',
  3.14159 * 2 * 2 * 1
)
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgziA2CmB00QHMAUAoABJg5AYQE9oBLMAE1gCdNKBeARkwHXMALBnAGi1wGUBXSgDMAhsFiYRlWCIBcXTADZ4AJgAcAZnpqArJgBUmRocYBqJas3a9Jg0e7YcANRj8AtrHmdMG+PQAs9DoAnHbGRmHoAJQA3OigkDAISGg8+ESkFNR0jCzsKlxpAsJiElIyXhbqWrphdebK1dZ2KmEOuC7Q7p4KvgFBobaGrSbRcQlQcIgoGI6EJORUNLSteRztOMWi4pLScgqNVrXD9VVHNpgj9mmd3ZV9gSEtz6Ox6EA)

这段代码看起来是不是让人不太舒服？确实如此。它非常重复，像是同一行代码被复制粘贴后稍作修改而成的。它重复了数值和常量，也正因如此，才容易引入错误（你发现了吗？）。
更好的做法是，把其中的一些函数、常量和循环提取出来。

```ts
type CylinderFn = (r: number, h: number) => number
const surfaceArea: CylinderFn = (r, h) => 2 * Math.PI * r * (r + h)
const volume: CylinderFn = (r, h) => Math.PI * r * r * h

for (const [r, h] of [
  [1, 1],
  [1, 2],
  [2, 1],
]) {
  console.log(
    `Cylinder r=${r} × h=${h}`,
    `Surface area: ${surfaceArea(r, h)}`,
    `Volume: ${volume(r, h)}`
  )
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwiA2BLAdgEwgJwGLKgXigAoMAuKZAVwFsAjTAGigAszLbMBKfAPnOrowBuAFABjAPbIAzsChSKGAGYBDURACCGCMrJwkaTDnxEMjJlzy8ATFABUUALLLgTAHQAFAJJ2oGH8SgAamYOEQlpWQA3cXhqCF0EFHRsXAJiMwteJxcPb3s-fJ8mEWFFcT9CcJkoAG1TZgBdKHFFWpqARkZ2hsYOxise2qsuhoauAG9hKCgqmIhXeHEAc0Ip6agAAz0kzF88ABJxjABfKAB15gPxpmON+jXpjYBlBRU1KGUtHShD+SVVDRfdIhW73dabABqMTiZEO0ViVAgwPMt1CwmOwiAA)

当公式被清晰地写出来后，那个 bug 就消失了（前面的例子中，计算表面积时本该是 `r*r`，结果写成了 `r*h`）。这就是 DRY 原则：Don't Repeat Yourself（别重复你自己）。这是软件开发中最通用的建议之一。但很多开发者在代码里小心翼翼地避免重复，却在类型定义中毫不在意地重复。

```ts
interface Person {
  firstName: string
  lastName: string
}

interface PersonWithBirthDate {
  firstName: string
  lastName: string
  birth: Date
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAcnALYQBcyFUoA5gNxHIA2cF1dRszacAvgQKhIsRCnTkcAdWBgAFgCEyagCJxI+LqXJVaDJmBYgOXXv1NCLIrgCMtqxrshiCQA)

类型中的重复和代码中的重复会带来类似的问题。比如你决定给 `Person` 添加一个可选的 `middleName` 字段，那现在 `Person` 和 `PersonWithBirthDate` 就不一样了。

类型里重复更常见的一个原因是：我们不太熟悉怎么把重复的部分抽出来。在代码中，我们知道可以用辅助函数来简化，但在类型系统中该怎么做呢？通过学习如何在类型之间做映射，你就可以把 DRY 原则运用到类型定义中。

最简单的减少重复的方法就是给你的类型起个名字。比如与其这样写一个 `distance` 函数：

```ts
function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAExgZygQ0gUwBSYBciA3gB7FggC2ARjgE4A0iAnpTfQwL4u3HkOdRi3aIqwngEpSAKESIGOKCAZIAspigALAHRoAjgyh4CusogC0iWuZkAqe4gBMiANSIzrKzd2sHTs5SANyy3LJAA)

给这个类型起个名字，然后使用它：

```ts
interface Point2D {
  x: number
  y: number
}
function distance(a: Point2D, b: Point2D) {
  /* ... */
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgAoHtRgEwBFkDeAUMsgB4BcyIArgLYBG0A3CcgJ5W2MtEC+RGDRAIwwdCGQATYAGcwcERAAUcKhix4ANMgbrM4PAEpCyAPQAqZADpbyC2eQCgA)

这就相当于在类型系统里，把一个重复使用的常量提取出来。重复的类型有时候不那么容易发现，因为可能被语法“掩盖”了。

比如说，若干函数有相同的类型签名：

```ts
function get(url: string, opts: Options): Promise<Response> {
  /* ... */
}
function post(url: string, opts: Options): Promise<Response> {
  /* ... */
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAkEkBEFECgCWA7ALgUwE4DMCGBjdUAeQAdVEB7ZAZ1AG8BfeEUWAOWnmwFdl8K1UAHN0qABQ9MAGwBcoGqkwphAGlCVyNeWUG0AlPIAKmSgFtENdAB4ASuhqlqVgHwNQwAFSgAwsQCyRrawAMohoJ5gmGJSyKAm5pboAHTRNJTSAG7o4sjoAO6g9o7OOfr6ANwe3hzQEWDMvPx6oE6KkjLyisrIahpaOuRUBsamFlZ2Dk606G701b4BQaHhkaDRqLHxY0mpDhnZuQVFU6Xi5VVebJz1oMzwQA)

那你就可以参考第 12 条，把这个签名提取成一个具名类型：

```ts
type HTTPFunction = (url: string, opts: Options) => Promise<Response>
const get: HTTPFunction = (url, opts) => {
  /* ... */
}
const post: HTTPFunction = (url, opts) => {
  /* ... */
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAkEkBEFECgCWA7ALgUwE4DMCGBjdUAeQAdVEB7ZAZ1AG8BfeEUWAOWnlQE9SjwAFUEAFAGIBXZPgrVQAXlAAKCZgA2ALlA1UmFAHMANKErkaWsrNoBKBQD5QIzJQC2iGugA8AJXQ1S1B52ANzw+IGooProqFpCopLSVgrKqmrGpqg0tvIO9KDAAFSgAMLEALIi3rAAyjWghWCYMarIjs5uHgB0zTSUagBu6ErI6ADuoL7+gcPW1sEFxRzQDWCMoeG0kQE6ccLiUjJUbYoq6hlmOXmLpRVVtfWNoM2ore2u7ug9fv1DI+OTPwBWizeY3ZarUDreDwIA)

一开始提到的 `CylinderFn` 类型也是一个类似的例子。那么 `Person` 和 `PersonWithBirthDate` 又该怎么处理呢？你可以通过让一个接口继承另一个接口，来消除重复：

```ts
interface Person {
  firstName: string
  lastName: string
}

interface PersonWithBirthDate extends Person {
  birth: Date
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAcnALYQBcyFUoA5gNxHIA2cF1dRszacAvgQKhIsRCnTkcAdWBgAFgCEyagCJxIyCAA9IIACYY0mHPi4AjLasa7IYgkA)

现在你只需要写出额外的字段。如果两个接口共享一些字段，你可以把这些公共字段提取到一个基接口中。比如说，与其为 Bird 和 Mammal 定义独立的类型：

```ts
interface Bird {
  wingspanCm: number
  weightGrams: number
  color: string
  isNocturnal: boolean
}
interface Mammal {
  weightGrams: number
  color: string
  isNocturnal: boolean
  eatsGardenPlants: boolean
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAcnALYQBcyFUoA5gNxHIA2cF1dRszacAvgVCRYiFACEyAE3xcA7mwwAHOCADCNRiACuNAEbROxFRGCsAFmADiUWhgPGzUC8gRZuWKEJgLCAcXMAYlFgIYIZQIHDcjCZYvhDaYhLg0PBIyACytDQJypbWdo7ONK7IRqbmXD5+AUxBImERUTFxCUkp3GkgXmlgGA5wUAoQIKi84NXJqekE4kA)

你可以把一些共享的属性提取到一个 `Vertebrate` 类中：

```ts
interface Vertebrate {
  weightGrams: number
  color: string
  isNocturnal: boolean
}
interface Bird extends Vertebrate {
  wingspanCm: number
}
interface Mammal extends Vertebrate {
  eatsGardenPlants: boolean
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAcnALYQBcyFUoA5gNxHIA2cF1dRszacAvgVCRYiFADVokAEZQ4kfFwDuEYKwAWYAOIqaGRiACuNRdE7EEWblihCwLEBy7AMlLAjDmoEDhuRkUsBwg4EDEJcGh4JGQAITIAE2QIAA9IEFSMZHkoJRU1QmINNgwAByiAYRozS2soGMl4mWQAWVoaYIzsiFz8wuLVFDKM1QwDOChUwdRecFNkMIiomKA)

现在，如果你修改了基类的属性或为它们添加了 TSDoc 注释（第 68 条），这些更改会在 `Bird` 和 `Mammal` 中得到反映。继续类比代码重复，这就像是写 `PI` 和 `2*PI`，而不是写 `3.141593` 和 `6.283185`。

你也可以使用交叉操作符（`&`）来扩展一个现有的类型，尽管这种方式相对较少见：

```ts
type PersonWithBirthDate = Person & { birth: Date }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAcnALYQBcyFUoA5gNxHIA2cF1dRszacAvgTABPAA4p05HAHVgYABYAhMmoAicSMgC8aTDmQAyfMgBGW1Y137RnIA)

这种技术在你想要为联合类型（无法扩展的类型）添加一些额外属性时最为有用。关于这一点，可以参考第 13 条。

你也可以反过来处理。如果你有一个类型 `State`，表示整个应用的状态，而另一个类型 `TopNavState` 仅表示其中的一部分呢？

```ts
interface State {
  userId: string
  pageTitle: string
  recentFiles: string[]
  pageContents: string
}
interface TopNavState {
  userId: string
  pageTitle: string
  recentFiles: string[]
  // omits pageContents
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpjpZBvAUM5AVwGdoBJAEwC5liwpQBzAbn2QAc5GIAVYMADYQadBiBZsoEJOABiwIcRH0mAbQC6rAp24BhAPbgI4JbRXjWAX1yhIsRCh772AOTgA3dJhR4CJctRmYhLaXLz8QsrBWshSMmDyilFqmmwA9GnI+gC2-MQcYQZGJrjWQA)

与其通过扩展 `TopNavState` 来构建 `State`，你可能更希望将 `TopNavState` 定义为 `State` 中字段的一个子集。这样你就可以保持一个单一的接口来定义整个应用的状态。

你可以通过索引 `State` 来移除属性类型中的重复：

```ts
interface TopNavState {
  userId: State['userId']
  pageTitle: State['pageTitle']
  recentFiles: State['recentFiles']
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpjpZBvAUM5AVwGdoBJAEwC5liwpQBzAbn2QAc5GIAVYMADYQadBiBZsoEJOABiwIcRH0mAbQC6rAp24BhAPbgI4JbRXjWAX1yhIsRCh772AOTgA3dJhR4CJctRoGJCqAOT+UJShmmw6vPxCNF4hoXF8ghDRWshSMmDyiknBEGG5xvkKEMRZuJasQA)

虽然这样写更长了，但这是进步：`State` 中 `pageTitle` 的类型变动会反映到 `TopNavState` 中。不过，这仍然是重复的。你可以通过映射类型来做得更好：

```ts
type TopNavState = {
  [K in 'userId' | 'pageTitle' | 'recentFiles']: State[K]
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpjpZBvAUM5AVwGdoBJAEwC5liwpQBzAbn2QAc5GIAVYMADYQadBiBZsoEJOABiwIcRH0mAbQC6rAp24BhAPbgI4JbRXjWAX1xgAnuxQ997AHJwAbukwoAvDjaqANLIoMgA5CTkFGHIAD7hOrz8QjHxYVIyYPKKYeo0XpBB6riWrEA)

将鼠标悬停在 `TopNavState` 上时，你会发现这个定义实际上与之前的完全相同（见图 2-12）。

![Figure 2-12.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202505142345457.png)

映射类型在类型系统中的作用，就像是在数组中遍历字段一样。这个模式非常常见，因此在标准库中有一个内置工具类型专门用于这种情况，它叫做 `Pick`：

```ts
type Pick<T, K> = { [k in K]: T[k] }
```

你可以像下面这样使用它:

```ts
type TopNavState = Pick<State, 'userId' | 'pageTitle' | 'recentFiles'>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpjpZBvAUM5AVwGdoBJAEwC5liwpQBzAbn2QAc5GIAVYMADYQadBiBZsoEJOABiwIcRH0mAbQC6rAp24BhAPbgI4JbRXjWAX1xgAnuxQ997AHJwAbukwoAvMgAKwAgA1gA8XpAANMgA5CTkFDHIAD6xOrz8QkmpMVIyYPKKMQB8rEA)

`Pick` 是泛型类型的一个例子。继续类比代码去重的思路，使用 `Pick` 就像是在调用一个函数。`Pick` 接收两个类型参数：`T` 和 `K`，然后返回第三个类型，就像函数接收两个值并返回一个结果一样。第 6 章将深入讲解类型层级的编程，第 50 条会探讨将泛型类型看作“类型上的函数”这一理念。

另一种重复可能出现在带标签的联合类型中。比如说，你想单独提取出标签字段的类型怎么办？

```ts
interface SaveAction {
  type: 'save'
  // ...
}
interface LoadAction {
  type: 'load'
  // ...
}
type Action = SaveAction | LoadAction
type ActionType = 'save' | 'load' // Repeated types!
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpwG4QIILMAexGQG8AoZZMATwAcIAuZAcgGdMJmBuC5Aej7IAdCLIBfMqEixEKADIE4AE1z4ipXjXpNmAG0VLuvAcNEStKVYWIBeNByvqAPsgXLHIHheQeAKnRQ7Ng5mZBc9A25KEwAlCHo4SCUqANYAQjIgA)

你可以通过在 `Action` 联合类型上进行索引，来定义 `ActionType`，而不用重复写类型：

```ts
type ActionType = Action['type']
//   ^? type ActionType = "save" | "load"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpwG4QIILMAexGQG8AoZZMATwAcIAuZAcgGdMJmBuC5Aej7IAdCLIBfMqEixEKADIE4AE1z4ipXjXpNmAG0VLuvAcNEStKVYWIBeNByvqAPsgXLHIHheQeAKnRQ7DwBtZgtmAF0eE0oAPQB+KgCfPGt-emQ7ACJ2LCzkFyz9ZSyyIA)

当你向 `Action` 联合类型中添加更多类型时，`ActionType` 会自动包含它们。这个类型和使用 `Pick` 得到的结果不同，`Pick` 会返回一个带有 `type` 属性的接口类型：

```ts
type ActionRecord = Pick<Action, 'type'>
//   ^? type ActionRecord = { type: "save" | "load"; }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpwG4QIILMAexGQG8AoZZMATwAcIAuZAcgGdMJmBuC5Aej7IAdCLIBfMqEixEKADIE4AE1z4ipXjXpNmAG0VLuvAcNEStKVYWIBeNByvqAPsgXLHIHheQeAShAQCKCVkOwAFYAQAawAeDwAaFgtmAD4eE0oAPQB+KjpLPGt-QODQ0jztZAAidiwq5Bcq-WUqrmQJIA)

如果你正在定义一个类，这个类既可以在初始化时设置参数，也可以通过后续的 `update` 方法更新参数，那么 `update` 方法的参数类型很可能是构造函数参数的大部分字段的可选版本：

```ts
interface Options {
  width: number
  height: number
  color: string
  label: string
}
interface OptionsUpdate {
  width?: number
  height?: number
  color?: string
  label?: string
}
class UIWidget {
  constructor(init: Options) {
    /* ... */
  }
  update(options: OptionsUpdate) {
    /* ... */
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgPIAczAPYgM7IDeAUMsgO7AAmYAFgFzIgCuAtgEbQDcpytEwAOa0wjFh268E2ADbYojPGCihBPMjLicZi5ap4BfYqEixEKDFlx4AquipxIRXpRq0A-GLaco6vgOEwTyZvSTJpOShgpRUQNV5NbWi9OMNiBE08AhsASQB1akEIMGdw62VmBDB5AApQYFE0TBx8AEoiZAB6ACpkADoB5G7O5CMyZntHCBrsZutGSxbbSch2wi7egb6hkaMjIA)

你可以通过映射类型加上 `keyof`，从 `Options` 构造出 `OptionsUpdate`：

```ts
type OptionsUpdate = { [k in keyof Options]?: Options[k] }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgPIAczAPYgM7IDeAUMsgO7AAmYAFgFzIgCuAtgEbQDcpytEwAOa0wjFh268E2ADbYojPGCihBPMjLicZi5ap4BfYmACe6FBiy48AVXRU4kZAF4iAbQDWyUMg8QT2DBomDj4ALoA-IyWoXieYQY8QA)

`keyof` 会获取一个类型的所有键，并生成一个联合类型：

```ts
type OptionsKeys = keyof Options
//   ^? type OptionsKeys = keyof Options
//      (equivalent to "width" | "height" | "color" | "label")
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgPIAczAPYgM7IDeAUMsgO7AAmYAFgFzIgCuAtgEbQDcpytEwAOa0wjFh268E2ADbYojPGCihBPMjLicZi5ap4BfYmACe6FBiy48AaQgmCAXmQBre9hhpMOfDwD0fmTIAHoA-Mim5l5W+HYOyM5uJh7RPnjGZigAShB4sgBuEAA8WXDkAHwJyKXkyBAAHpAgVAQAYswgCDHI4TXIjIQA2jbIoK7unjUAuow1w1MGPJEoAMom4LSWaXFO1bkFxVvWO+X+gWRhEZnIaxtHsfa7AESUNLRPyAA+yE-8QiIfb5PaRyKCAn6abRPYjEIA)

映射类型（`[k in keyof Options]`）会遍历这些键，并查找 `Options` 中对应的值类型。`?` 表示每个属性都是可选的。

这个模式也非常常见，在标准库中也有对应的工具类型，叫做 `Partial`：

```ts
class UIWidget {
  constructor(init: Options) {
    /* ... */
  }
  update(options: Partial<Options>) {
    /* ... */
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgPIAczAPYgM7IDeAUMsgO7AAmYAFgFzIgCuAtgEbQDcpytEwAOa0wjFh268E2ADbYojPGCihBPMjLicZi5ap4BfYgk14CAVQCSAdWqCIYIlNxKozBGHkAKUMFFpMHHwASiJkAHoAKmQAOjjkSPDkIzJmdCo4SC9sQJdGAAU4KCw4GQAeDCwXAD5QwgjouJiEpKMjIA)

映射类型还有一些额外技巧。你可以在其中使用 `as` 子句来重命名键。这种方式有很多用法，其中一个用途是反转一个映射中的键和值：

```ts
interface ShortToLong {
  q: 'search'
  n: 'numberOfResults'
}
type LongToShort = { [k in keyof ShortToLong as ShortToLong[k]]: k }
//   ^? type LongToShort = { search: "q"; numberOfResults: "n"; }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoAsD2UwBVMAymIA5sgN4BQyyAjgFzIDkAzhHFAukwNzXIhGTEAFcAtgCNoAeRgAlCCxEAbMC16UAvpTABPAA4oipfBmxhkAXgrIA2gGtkoZPYi7MMNFhz5jZOCxe5r7EJA4AuuGMjpp8APRxNMgAegD8yHqGyH6m3hbW5MhsHFyMAES0ZTwC4lJQsgpKqizlIFXI2kA)

这种技巧与模板字面量类型（template literal types）配合使用效果尤佳，模板字面量类型允许你在类型层面上操作字符串字面量类型，第 54 条会专门讲这个内容。

如果你的映射类型中的索引部分是 `K in keyof T` 或类似形式，那么 TypeScript 会把它当作“同态映射类型”（homomorphic mapped type）。这意味着原类型中的修饰符（比如 `readonly` 和 `?` 可选）以及文档注释都会被保留到新类型中。

```ts
interface Customer {
  /** How the customer would like to be addressed. */
  title?: string
  /** Complete name as entered in the system. */
  readonly name: string
}

type PickTitle = Pick<Customer, 'title'>
//   ^? type PickTitle = { title?: string; }
type PickName = Pick<Customer, 'name'>
//   ^? type PickName = { readonly name: string; }
type ManualName = { [K in 'name']: Customer[K] }
//   ^? type ManualName = { name: string; }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&exactOptionalPropertyTypes=true#code/JYOwLgpgTgZghgYwgAgMIFcDOYD2BbaZAbwChlkB6AKiuQAkcB3ZMACxQS1wKmUZ3QAbACbJBwANYpcyAEYo4w4VAiZMEYQDpkVCmRbAwgiAH4AXMmxRQAcwDc+6rVT4ADscjIQcAsjiZkCHBoDWRQFnZLAE9sCDxtXX0VRRwQQSivHwgLK1sHAF8SEjAo1xQABWAECQAVQ2NkAF5kSuqAHgxsfGgAGmQAcjB6iH6APgcKCnJkAD0TFlKKqtrhpuIDI1McsGsQe2RCkrKW5YA5LLXWiQ6ubqg+-u8CMYmp8jmF46vz32aiZGSwlS6UyBG2u32h0WyAAsnAQOg4IIfig-sgANoAaTCIAGTxGAF0LJ1uNAsQS7AdXtMPkcUHCEUiUWt-vjwXkDiQgA)

在这个例子中，`Pick` 是一个同态映射类型，它会保留原类型中的 `optional`（可选）和 `readonly`（只读）修饰符。而 `ManualName` 映射类型没有使用 `keyof` 表达式，因此它不是同态的，也不会传递这些修饰符。

如果你用某个同态类型来定义一个值，你会发现连文档注释也被一并保留了（见图 2-13）。

![图 2-13](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202505142351124.png)

同态映射类型还有一个有趣的行为：它们允许原始类型（非对象类型）原样通过，不做任何修改。

```ts
type PartialNumber = Partial<number>
//   ^? type PartialNumber = number
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&exactOptionalPropertyTypes=true#code/C4TwDgpgBACghgJ2ASzgGwHIFcC2AjCBKAXlkRXQB4A7XAhAPgG4AoAejai4D0B+KUJDJJUmOoRJRa+QiyA)

这看起来有点奇怪，但在你构建自己泛型类型时，它是非常方便的。

在定义映射类型时，考虑它们是否是同态的，以及你是否希望它们是同态的。

你也可能会发现自己需要定义一个类型，来匹配一个值的形状：

```ts
const INIT_OPTIONS = {
  width: 640,
  height: 480,
  color: '#00FF00',
  label: 'VGA',
}
interface Options {
  width: number
  height: number
  color: string
  label: string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&exactOptionalPropertyTypes=true#code/MYewdgzgLgBAkgOTgFQPoHkAKy7oQZRgF4YBvAKBhgHcBLAEygAsAuGANgBYAGAGkphMAprQDmTKG04AOPgNAAbEACc2AcgDE3bgDEd2tfyoKAhgCMhC9QDUA4gEFD5AL4BucrTBQhygGYngIRh0AAcoWnAIMgE6RlYYMABXAFsLZXcqYTEJNiTUnwyYRRU2aGVPUULTCysYMor3Z3IgA)

你可以通过 `typeof` 来做到这一点：

```ts
type Options = typeof INIT_OPTIONS
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&exactOptionalPropertyTypes=true#code/MYewdgzgLgBAkgOTgFQPoHkAKy7oQZRgF4YBvAKBhgHcBLAEygAsAuGANgBYAGAGkphMAprQDmTKG04AOPgNAAbEACc2AcgDE3bgDEd2tfyoKAhgCMhC9QDUA4gEFD5AL4BuclACeAByEx03lC04BDEMF6+IABm8EhoWDh4+O5AA)

这看起来有点像 JavaScript 的运行时 `typeof` 操作符，但它是在 TypeScript 类型层面上操作，且精度更高。关于 `typeof` 的更多内容，可以参考第 8 条。不过，使用值来推导类型时要小心。通常，最好先定义类型，再声明值可以赋给这些类型。这样可以让你的类型更明确，并且减少因类型扩展（第 20 条）导致的不确定性。

`typeof` 的经典用例是当你有一个单一的值，且希望这个值成为类型的“真理来源”时（可能它是某种模式或 API 规范）。通过将值作为真理来源，你可以避免在定义类型时的重复。

类似地，你可能希望为函数或方法推断出的返回值创建一个具名类型：

```ts
function getUserInfo(userId: string) {
  // ...
  return {
    userId,
    name,
    age,
    height,
    weight,
    favoriteColor,
  }
}
// Return type inferred as { userId: string; name: string; age: number, ... }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&exactOptionalPropertyTypes=true#code/MYewdgzgLgBAkgOTgFQPoHkAKy7oQZRgF4YBvAKBhgHcBLAEygAsAuGANgBYAGAGkphMAprQDmTKG04AOPgNAAbEACc2AcgDE3bgDEd2tfyoKAhgCMhC9QDUA4gEFD5AL4BucgDMArmGBRa4DCiQlAAqhBCynBgHiAAFF4RUfRs0Mq0YKIAlGQCAPR5MADC6ACymABKAKL4+PLg0DBgJgC2QsQwagBCIGZq7lSgkLAmwR0AjABMAzBDjcJiEh0yM3Ow1CLisCQA7NyrDbAeJgBuKrRQQkUgSsodamYKXkL9+YVVCAAiAsohXspgXJUKiJSJwehGYHNNqQqijISwwSbCSIjaLKCI45ndKXa63SFuFzkAowCp-AEwKAATwADu0Mh5Ir96DATBAyDBQclUlB0plXE1WkIeXzRAL4WwwF4WhZlLwYAA6JUwZzkchAA)

直接这么做需要使用条件类型（见第 52 条）。但是，正如我们之前看到的，标准库为常见模式定义了泛型类型。在这种情况下，`ReturnType` 泛型正好做了你想要的事情：

```ts
type UserInfo = ReturnType<typeof getUserInfo>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&exactOptionalPropertyTypes=true#code/MYewdgzgLgBAkgOTgFQPoHkAKy7oQZRgF4YBvAKBhgHcBLAEygAsAuGANgBYAGAGkphMAprQDmTKG04AOPgNAAbEACc2AcgDE3bgDEd2tfyoKAhgCMhC9QDUA4gEFD5AL4BucgDMArmGBRa4DCiQlAAqhBCynBgHiAAFF4RUfRs0Mq0YKIAlGQCAPR5MADC6ACymABKAKL4+PLg0DBgJgC2QsQwagBCIGZq7lSgkLAmwR0AjABMAzBDjcJiEh0yM3Ow1CLisCQA7NyrDbAeJgBuKrRQQkUgSsodamYKXkL9+YVVCAAiAsohXspgXJUKiJSJwehGYHNNqQqijISwwSbCSIjaLKCI45ndKXa63SFuFzkAowCp-AEwKAATwADu0Mh5Ir96DATBAyDBQclUlB0plXE1WkIeXzRAL4WwwF4WhZlLwYAA6JUwZzkcjUukwcJgmIgDpkqD-MDIWlCAA8GqEIA8QRC2qiuoAfO4gA)

注意，`ReturnType` 是作用于 `typeof getUserInfo`，即函数的类型，而不是 `getUserInfo` 这个函数的值。和 `typeof` 一样，使用这种技术时要谨慎。不要搞混你的“真理来源”。

在抽取类型中的重复时，不要过于极端。仅仅因为两个类型声明在源代码中共享相同的字符，并不意味着它们是相同的。例如，以下这两个类型共享了一些共同的属性：

```ts
interface Product {
  id: number
  name: string
  priceDollars: number
}
interface Customer {
  id: number
  name: string
  address: string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgApQPYBMCuCzIDeAUMssFgFzIg4C2ARtANyk1x0TUDOYUoAc1ZkADvyQARDABtpcKN2q1GLYgF9ioSLEQoAwjl4ZOUImwpL6TKMPacefQbbhYsUCN0XJe-EEPXEQA)

如果重构成下面这样，则并不明智：

```ts
// Don't do this!
interface NamedAndIdentified {
  id: number
  name: string
}
interface Product extends NamedAndIdentified {
  priceDollars: number
}
interface Customer extends NamedAndIdentified {
  address: string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEBEHsDsHIBdQBNKngCwJYGcCEAoTaeAUwCcAzAQwGMTQA5KgWxKQEFokBJJE4zBUxtQAb3yhQmJAC5Q0AK7MARuQDcE+SxJzs8MkQDmGgL6Fi5anVAAFMpCQKaiEgA9SXbI20cuvfvCCwkhimgAOBnRQADbRVGTYcooq6vhmRKSUtPQAwgp6kKxkoG4eSF5MrL48fAJCIuKSVEhIZCTYiaB6BtDGafhAA)

这是因为，虽然 `id` 和 `name` 属性恰好有相同的名称和类型，但它们并不代表相同的事物。将来，你可能会把一个 `id` 改为字符串类型，而另一个不变。或者你可能会把客户的名字拆分为 `firstName` 和 `lastName`，这对于产品来说就不太合适了。在这种情况下，将公共基接口抽取出来是一个过早的抽象，可能会使得这两个类型在未来更难独立演化。

一个好的经验法则是，如果很难为某个类型（或函数）命名，那么它可能不是一个有用的抽象。在这种情况下，`NamedAndIdentified` 只是描述了类型的结构，而没有描述它到底是什么。而之前提到的 `Vertebrate` 类型则有独立的意义。记住，“重复比错误的抽象便宜得多。”

在类型空间中，重复和复制粘贴的编码问题和在值空间中的问题一样严重。你用来避免类型空间中重复的构造可能比用于程序逻辑的构造更不常见，但它们值得学习。不要重复自己！

## 关键点总结

- DRY（Don’t Repeat Yourself，别重复自己）原则在类型设计中同样适用，就像在业务逻辑中一样。
- 给类型命名，避免重复定义。可以用 `extends` 来继承接口字段，减少重复。
- 熟悉 TypeScript 提供的类型映射工具，比如 `keyof`、`typeof`、索引访问和映射类型。
- 泛型类型就像类型层面的函数，用它们来进行类型转换，而不是重复操作。
- 熟悉标准库中的常用泛型类型，比如 `Pick`、`Partial` 和 `ReturnType`。
- 避免滥用 DRY，确保你复用的属性和类型确实是同一个概念。

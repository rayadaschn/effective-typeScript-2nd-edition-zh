# 第 25 条：理解“类型演化”

## 要点

- 虽然 TypeScript 类型通常只是 _细化_，但初始化为 `null`、`undefined` 或 `[]` 的值的类型允许 _演变_。
- 识别并理解这一构造的出现，并利用它减少在代码中对类型注解的需求。
- 为了更好的错误检查，考虑提供显式的类型注解，而不是使用演变类型。

## 正文

在 TypeScript 中，变量的类型通常在声明时就确定了。之后你可以通过一些判断来“收窄”它的类型（比如检查是否为 `null`，参见第 22 条），但**不能扩展**它的类型去包含新的值。

不过有一个例外，就是所谓的“类型演化”（evolving types）。理解它能帮你**减少显式的类型注解**，也能让你更容易读懂别人写的 TypeScript 代码。

在 JavaScript 里，你可能会写一个生成数字区间的函数，比如：

```js
function range(start, limit) {
  const nums = []
  for (let i = start; i < limit; i++) {
    nums.push(i)
  }
  return nums
}
```

转成 TypeScript 后，照常写也能正常推导出类型：

```ts
function range(start: number, limit: number) {
  const nums = []
  for (let i = start; i < limit; i++) {
    nums.push(i)
  }
  return nums
  //     ^? const nums: number[]
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAJwIZgOYFMAUBnKVZKALkTBAFsAjLZAGkQBsZKZTyrbkBKRAbwBQiRBAQFOlPIgC8iANoBdANzDEwOMkQ4mWKIhizEBIlGUHEAHmat25mAGoHfISJEUpAOgAOIPAAscGB5VEQBfNWQ9EGQkDzxQxAB6JLcRAD0AflFxfXiyD24lQQigA)

这看起来很神奇，因为 `nums` 初始化为 `[]`，理论上可以是任意类型的数组。但 TypeScript 居然最后推断出它是 `number[]`，这并不符合它通常的推导规则（参见第 20 条）。

你要是在每一行观察一下 `nums` 的类型，会发现：

```ts
function range(start: number, limit: number) {
  const nums = []
  //    ^? const nums: any[]
  for (let i = start; i < limit; i++) {
    nums.push(i)
    // ^? const nums: any[]
  }
  return nums
  //     ^? const nums: number[]
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAJwIZgOYFMAUBnKVZKALkTBAFsAjLZAGkQBsZKZTyrbkBKRAbwBQiRBAQFOlPIgC8iANoBdANzDEAenUiRAPQD8o8VEl4y6AJ5K1wOMkQ4mWYzFmICRKMsQuAPM1bsXjAA1MF8QtomAHQADiB4ABY4MDyqkZqI+oZgEhRSZmCWimoAvmrITiDISHl4aRpakVliOca1ZHncVmVAA)

`nums` 的初始类型是 `any[]`，也就是“未具体化的数组”。但当我们往里面推入 `number` 类型的值后，它的类型就会“演化”为 `number[]`。

这种“类型演化”不同于“类型收窄”（也叫类型细化）。空数组的类型是可以通过往里添加不同类型的元素而扩展的：

```ts
const result = []
//    ^? const result: any[]
result.push('a')
result
// ^? const result: string[]
result.push(1)
result
// ^? const result: (string | number)[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBATgUwgVwDawLwwNoF0DcAUAPTEzkwB6A-DKJLIiugFwwCGYAnnoU2lAB0AB2QQAFgAoA5O2kBKIv3QkyNOuGjwkAttDgBLMAHNeyoaImSAjIr46VpKrXpbzbSfqPGYAHxhgyAC2AEYIcPK8QA)

在条件语句中，变量的类型甚至可以在不同分支中变化。下面的例子展示了这种行为，不过用的是一个普通的值，而不是数组：

```ts
let value
//  ^? let value: any
if (Math.random() < 0.5) {
  value = /hello/
  value
  // ^? let value: RegExp
} else {
  value = 12
  value
  // ^? let value: number
}
value
// ^? let value: number | RegExp
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/DYUwLgBAbghsCuIDcAoA9GiEB6B+CoksCIAXBDAHYCeKAlgGYQAUAsjGABYB0ATlQBMA9gFtmASggAeCAAZuAVkkBvFFmKIIAXghpOIYMCFpU6uIjW7MeAuGjmyEAEogA5gFEAHgAcUAXwgDAGcQCFUzEm0IAEYAJlN7EksMHHxCRMRySngRACMQXn8UDRB0azS7Eqyc-N4IAB9nNy9fIA)

> [!TIP]
> 这种行为在编辑器中可能会让人困惑，因为变量的类型只有在你赋值或使用 `push` 之后才会“演化”。如果你查看赋值那一行的类型，它仍然会显示为 `any` 或 `any[]`。

这种写法是减少类型注解的一种便捷方式。你可以在自己的代码中使用它，也应该能在阅读别人的代码时认出它。这种用法有时被称为 “evolving any”，因为变量一开始隐式地是 `any` 类型，但这不是那种危险的 `any`（稍后会具体解释）。它有时也被称为 “evolving let” 或 “evolving arrays”。

另一种会触发这种“演化”行为的情况是变量最初被设为 `null` 或 `undefined`。这在使用 `try/catch` 给变量赋值时很常见：

```ts
let value = null
//  ^? let value: any
try {
  value = doSomethingRiskyAndReturnANumber()
  value
  // ^? let value: number
} catch (e) {
  console.warn('alas!')
}
value
// ^? let value: number | null
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtX2BwGUcBbEDACy1QHMAlLAZwGsBPAQVWHouRlQcAcslIAjEDAAUASgBc8VKIkwA3ACgIFeADcoEZAgC8i5BAgaA9JfjwAegH54WjLv2GFUVG3UYYbeABvdVs9A2MCYjIKajpGVk5uXgx+QRFxSVkNUPcQEPhreycXN3CFJQyYdQBfeDAoDDBKeCkQGSD8sDwmHC0AOgB3WFQpAHJ9KCYAQlGZDWr1MMN1QsdnbSWQcuVJeAAfU3N1IA)

如果你在对“演化中的类型”赋值或使用 `push` 之前就尝试使用它，那么会触发一个隐式 `any` 错误：

```ts
function range(start: number, limit: number) {
  const nums = []
  //    ~~~~ Variable 'nums' implicitly has type 'any[]' in some
  //         locations where its type cannot be determined
  if (start === limit) {
    return nums
    //     ~~~~ Variable 'nums' implicitly has an 'any[]' type
  }
  for (let i = start; i < limit; i++) {
    nums.push(i)
  }
  return nums
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAJwIZgOYFMAUBnKVZKALkTBAFsAjLZAGkQBsZKZTyrbkBKRAbwBQiRBAQFOlPIgC8iANoBdANzDEAenUiRAPz07EANSIxU1JlkQByClKuJWABxYR2TAJ6IAFqmlR3jpZW6O5K9jBIeHCUWGqa2gkiTHAQqLDiiADuXnSW7H4BlqlgYHBQiLSIACZYUHRsYFhVajDAiPiExLIycixsUHxCCci1IMhItniqCfEJ+gbGyKbmQZPhlM4wrlAe3r6I6NYhYYj+gWoAvmrAcMjtFuUwsogERFDKDogAPMys7B8wADUgMGahEkwAdI4QHgvDgYDxpogriIRlAxhMqFNBFcgA)

换句话说，“演化类型”只有在你往里面写入数据时才是 `any`。如果你在它还处于 `any` 状态时就读取它，就会报错。这不是第 5 条中提到的那种“恐怖的 any”，它不会像其他 `any` 一样在整个应用中蔓延。

隐式的 `any` 类型不会通过函数调用进行演化。比如下面这个箭头函数的用法就会让类型推断失败：

```ts
function makeSquares(start: number, limit: number) {
  const nums = []
  //    ~~~~ Variable 'nums' implicitly has type 'any[]' in some locations
  range(start, limit).forEach((i) => {
    nums.push(i * i)
  })
  return nums
  //     ~~~~ Variable 'nums' implicitly has an 'any[]' type
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAJwIZgOYFMAUBnKVZKALkTBAFsAjLZAGkQBsZKZTyrbkBKRAbwBQiRBAQFOlPIgC8iANoBdANzDEAenUiRAPQD8o8VEl4y6AJ5K1wOMkQ4mWYzFmICRKMsQuAPM1bsXjAA1MF8QtomAHQADiB4ABY4MDyqkZqI+oZgEhRSZmCWimoAvmrITiDISHl4aRpakVliOca1ZHncVmWgkLAIiJSoANZYAMoAjiBEWHj4hMQdXHSMLGwcnXThai25VNJySvUZ2gB+56eIAGpEMKjUjogA5LVP3pQxLBDsTOaICahpFBzDEsM8LEo3jAkHg4JQwUw4BBUP0cuV0Nh5h5VgEoDwojZkABRVAQJIuGQAPgEahEtVi8XJiAAVN5UqV2SIKlAqjV9sdGmcLtdbvdHi99lCPl8fn8AdJ0ODCpDEMDQYIykA)

更强的类型推断能力是 TypeScript 推荐使用 `for-of` 循环而不是 `forEach` 的一个理由。但在这个具体场景中，使用数组内置的 `map` 方法进行转换会更好，可以一行搞定，既避免了手动循环，也避免了使用“演化类型”。

当然，“演化类型”也有类型推断方面常见的问题。比如你要问：这个数组的正确类型到底是 `(string | number)[]`，还是应该是 `number[]` 而你不小心推入了个字符串？所以你可能还是更倾向于加上显式的类型注解来获得更好的错误检查，或者至少给函数的返回值加个类型，避免实现上的错误泄露到类型定义中（详见第 18 条）。

当你通过 `push` 构建数组，或用条件语句给变量赋值时，可以考虑是否使用“演化类型”这种方式，来减少不必要的类型注解，同时让类型在代码中自然流动。

## 关键点总结

- TypeScript 的类型通常是“收窄”的，但初始值为 `null`、`undefined` 或 `[]` 的变量，其类型是可以“演化”的。
- 在代码中识别并理解这种写法，合理使用它可以减少类型注解。
- 如果你希望更严格的错误检查，考虑加上明确的类型注解而不是依赖演化类型。

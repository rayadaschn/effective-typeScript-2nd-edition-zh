# 第 44 条：比起直接用 `any`，更推荐用更具体的替代类型

## 要点

- 每次使用 `any` 时，都要想清楚：是否真的允许传入任何 JavaScript 值？
- 如果有更精确的方式表达你的数据，比如 `any[]`、`{[id: string]: any}` 或 `() => any`，就优先使用这些方式，而不是直接用 `any`。

## 正文

`any` 类型代表了 JavaScript 中**所有可能的值**，这个范围非常大：

- 所有数字、字符串、数组、对象
- 正则表达式、函数、类、DOM 元素
- 甚至还包括 `null` 和 `undefined`

换句话说，**用 `any` 就等于完全放弃了类型检查**。

所以当你写下 `any` 时，不妨问问自己：

> “我真的想接受任何类型的值吗？传一个函数或正则表达式进来也可以？”

很多时候答案其实是 “不行”。这时候就应该换个更具体一点的类型，来保留一定的类型安全性。比如：

```ts
function getLengthBad(array: any) {
  // Don't do this!
  return array.length
}

function getLength(array: any[]) {
  // This is better
  return array.length
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQDKrMqALAIQEMATACiICdKiBPALkSLFoEpEBvRRAeh8QAiCAORREJOInwwAzgEIAUN0roQlJFRq0AdABtsuPAG4FAXwULQkWAhTosOfBWp1GzWgG0Auuy69+ACp4soghAEboUKiUSogqUGoaLjr6jsZmCkA)

后面这个版本用的是 `any[]` 而不是 `any`，好处有三点：

- 函数里对 `array.length` 的访问会有类型检查；
- 函数的返回值会被自动推断为 `number`，而不是 `any`；
- 调用 `getLength` 时，TypeScript 会检查传入的参数是否真的是数组；

```ts
getLengthBad(/123/) // No error, returns undefined
getLength(/123/)
//        ~~~~~
// Argument of type 'RegExp' is not assignable to parameter of type 'any[]'.

getLengthBad(null) // No error, throws at runtime
getLength(null)
//        ~~~~
// Argument of type 'null' is not assignable to parameter of type 'any[]'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQDKrMqALAIQEMATACiICdKiBPALkSLFoEpEBvRRAeh8QAiCAORREJOInwwAzgEIAUN0roQlJFRq0AdABtsuPAG4FAXwULQkWAhTosOfBWp1GzWgG0Auuy69+ACp4soghAEboUKiUSogqUGoaLjr6jsZmCmiYBvjE5DwAjABMAMw8rEbcfIgAcpLRlHCUADRxquoyiOAkqMAwYKgkmfY5eGSFpeUm1dyz3AB+i4sK1QCClMggALbYYnDAUrQADqiIwgBKqMgAogAeR8KhnWBwYkQyMjDIYERh+lKSI5UIg7KKURD7Q4nM7ubzCbQWLIOQx5MhgEC6XQVKr8OqIBpNVr4RoAd06RDElHAsB2w2yaTRGKx034c1mS3mK34602OzAewOUGOp2E6MxjxCLzeHy+Pz+pyggOBoOiEMFwphLDhCKAA)

如果你期望的参数是**数组组成的数组**，但不关心里面的具体类型，可以用 `any[][]`。

如果你期望的是某种**对象类型**，但不知道里面的值具体是什么，可以用：

- `{ [key: string]: any }`
- 或者 `Record<string, any>`（作用一样，写法更简洁）

```ts
function hasAKeyThatEndsWithZ(o: Record<string, any>) {
  for (const key in o) {
    if (key.endsWith('z')) {
      console.log(key, o[key])
      return true
    }
  }
  return false
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQDKrMqALAIQEMATACiICdKiBPALkSLFoEpEBvRRAeh8QAiCAORREJOInwwAzgEIAUN0roQlJFRq0AdABtsuPAG4FAXwULQkWAhTosOfBWp1GzWgG0Auuy69+ACp4soghAEboUKiUSogqUGoaLjr6jsZmluDQ8Eh4RDIAggDSqLRBRFAAomAkMgDqMPgAWmRwjABKqBBwlCQAPDJQlDA4ADRMLAB8vrHAPYhk3WCDiADWpaFIcDPc3DDAC+s62LUNTsIAXsKsO7vcSzJw+npwyGRH43AeRz4md8qqdRSSggVB-XbmbiQuKApDAIi6GRgjJAA)

你也可以在这种情况下使用 `object` 类型，它包含所有非原始类型。不过它有点特殊：你可以枚举这些对象的键，但却无法访问它们的值。

```ts
function hasAKeyThatEndsWithZ(o: object) {
  for (const key in o) {
    if (key.endsWith('z')) {
      console.log(key, o[key])
      //               ~~~~~~ Element implicitly has an 'any' type
      //                      because type '{}' has no index signature
      return true
    }
  }
  return false
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQDKrMqALAIQEMATACiICdKiBPALkSLFoEpEBvRRAeh8QAiCAORREJOInwwAzgEIAUN0roQlJFRq0AdABtsuPAG4FAXwULQkWAhTosOfBWp1GzWgG0Auuy69+ACp4soghAEboUKiUSogqUGoaLjr6jsZmluDQ8Eh4RDIAggDSqLRBRFAAomAkMgDqMPgAWmRwjHBhAFao0L6xwHCUiGQQCDJiANaloUhwfdzcMMDDUzrYtQ1OwgBewqzzC9yjYDJw+npwyGSrADSIcB6rPiaH3HyvH4cAfj+-iJX6AC22DEMEBAAddDAII1dLREHkZEwkMJ3MIpLRwahYod3p98R8IhAiCAZKgMVjEMIOKZ0YjEGBJDAaqgAB6IGQwZBgCpqbEfeKJKSUECoF4LczcSVxVTqRDAIi6MkmcxAA)

在 TypeScript 中，遍历对象类型特别棘手。第 60 条会更详细地讲解如何绕过这个问题。

如果你期望是一个函数类型，就尽量避免使用 `any`。这里有多种写法，取决于你希望定义得多具体：

```ts
type Fn0 = () => any // any function callable with no params
type Fn1 = (arg: any) => any // With one param
type FnN = (...args: any[]) => any // With any number of params
// same as "Function" type
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQDKrMqALAIQEMATACiICdKiBPALkSLFoEpEBvRRAeh8QAiCAORREJOInwwAzgEIAUN0roQlJFRq0AdABtsuPAG4FAXwULQkWAhTosOfBWp1GzWgG0Auuy69+ACp4soghAEboUKiUSogqUGoaLjr6jsZmClC0AA6oiABiYAAMiAC8iGTspQB8TCxG3Hx1tIhW0PBIEES6ukRh+ogA7jD4iGCS2VREALYymTl5hQCMZRVUyG4sVbXuDf6IAOojeIgIeZM00-O5BWAAcqtk2s-rMpuePmU79Y38R6PuMYgaYRSinYCIC4zObcWFw+EIxFI36IGQzPJEGSIABE+XA7QQ2KkCwUQA)

这些写法都比 `any` 更精确，因此更推荐使用。注意在最后一个例子中，使用了 `any[]` 作为剩余参数的类型。这里用 `any` 也可以，但精确度会更差一些：

```ts
const numArgsBad = (...args: any) => args.length
//    ^? const numArgsBad: (...args: any) => any
const numArgsBetter = (...args: any[]) => args.length
//    ^? const numArgsBetter: (...args: any[]) => number
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQDKrMqALAIQEMATACiICdKiBPALkSLFoEpEBvRRAeh8QAiCAORREJOInwwAzgEIAUN0roQlJFRq0AdABtsuPAG4FAXwULQkWAhTosOfBWp1GzWgG0Auuy69+ACp4soghAEboUKiUSogqUGoaLjr6jsZmChAIMmJgIAC2AIKUyDLEJIgAvIhk2nVUpW4s7JUAfEwlMnoG+CZ83NwAegD8iFlgOYh5RZ3ljLX1nU1sVe3umdm5BcWlBJHRVTV12g0yy94ta53daX38AyNjm1Pbs-uU88en5z6rL-kRGJAA)

注意这些函数的返回类型是不同的。剩余参数可能是 `any[]` 类型最常见的用法。

如果你只想表示“这是一个数组”，但不关心里面的元素类型，可以考虑用 `unknown[]` 替代 `any[]`。这更推荐，因为它更安全。关于 `unknown` 类型的更多内容可以参考第 46 条。

## 关键点总结

- 每次使用 `any` 时，都要想清楚：是否真的允许传入任何 JavaScript 值？
- 如果有更精确的方式表达你的数据，比如 `any[]`、`{[id: string]: any}` 或 `() => any`，就优先使用这些方式，而不是直接用 `any`。

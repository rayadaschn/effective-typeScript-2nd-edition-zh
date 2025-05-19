# 第 19 条: 不同类型使用不同变量

## 要点

- 变量的值可以变，但它的类型基本是固定的。
- 别把不同类型的值塞进同一个变量里，这样人看得糊涂，TypeScript 也容易报错。

## 正文

在 JavaScript 里，把一个变量反复拿来装不同类型的值是没问题的，也常这么干：

```js
let productId = '12-34-56'
fetchProduct(productId) // Expects a string

productId = 123456
fetchProductBySerialNumber(productId) // Expects a number
```

这在 TypeScript 中，你也可以这么做，但 TypeScript 会给你报错：

```ts
let productId = '12-34-56'
fetchProduct(productId)

productId = 123456
// ~~~~~~ Type 'number' is not assignable to type 'string'
fetchProductBySerialNumber(productId)
//                         ~~~~~~~~~
// Argument of type 'string' is not assignable to parameter of type 'number'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABMAplCALACgJzgExGgAoZ8AuRAZyhxjAHMBKRAbwF8AoUSWBZNJlwEiUAEIBPAMoo6AQwA2AORABbAEazSFRGDWacLDpwVpEABzyFoASXyIAvIgBEARgBMAWgDMAFk8ArABszgDc3ILYVqLEliK2+EzhnHHWUHaOiB5+weEA9HmIAH4lpYgAKhLmKIgA5HoasrWIMFS6cFCIclRUMAxgcuqmiFBwI1U1tTR0jLUR6FHx4tKyMIoqjTix0QlJnAWIh0fHJ6fHpRcl+4UAgjgMaihgnXDA49V10-QMza3tnd1ev1BsNRhY5Dg5Ko0LJEK93pMGgY5kA)

将鼠标悬停在编辑器里第一个 `productId` 上，你就能看出点端倪（见图 3-3）。

![Figure 3-3. The inferred type of productId is string.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202505182134897.png)

根据值 `"12-34-56"`，TypeScript 推断出 `productId` 是个字符串（string）。
你不能把数字赋值给字符串类型的变量，所以才会报错。

这就引出了 TypeScript 中一个关键的概念：变量的值可以变，但它的**类型一般不会变**。
类型唯一比较常见的“变化”方式是**收窄**（详见第 22 条），也就是说类型变得更具体、更小，而不是扩展去包含更多种值。第 25 条有个比较特别的例外，但那是个例外，不是常规做法。

那该怎么改这个例子呢？
要让 `productId` 的类型不变，就得一开始就设成一个能同时包含字符串和数字的类型——这正是联合类型（`string | number`）的用武之地。

```ts
let productId: string | number = '12-34-56'
fetchProduct(productId)

productId = 123456 // OK
fetchProductBySerialNumber(productId) // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABMAplCALACgJzgExGgAoZ8AuRAZyhxjAHMBKRAbwF8AoUSWBZNJlwEiUAEIBPAMoo6AQwA2AORABbAEazSFRGDWacLDpwVpEABzyFoASR006jRAB9d+2YgC8iAEQBGACYAWgBmABYggFYANh8Abm5BbCtRYksRW3wmBM506yg7L0RA8Ji4xEQAekrEAHkAaUT0ZIzxaVkYRRUNLTzRO2yK6rrGoA)

这样就不会报错了。有意思的是，TypeScript 能根据赋的值判断 `id` 的真实类型：第一次是字符串，第二次是数字。它自动把联合类型“收窄”成了具体的类型。

虽然联合类型能用，但它可能会带来更多麻烦。相比 `string` 或 `number` 这种单一类型，联合类型更难处理，因为你通常得先判断它到底是哪种类型，才能继续操作。

更好的做法是：干脆新建一个变量。

```ts
const productId = '12-34-56'
fetchProduct(productId)

const serial = 123456 // OK
fetchProductBySerialNumber(serial) // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABMAplCALACgJzgExGgAoZ8AuRAZyhxjAHMBKRAbwF8AoUSWBZNJlwEiUAEIBPAMoo6AQwA2AORABbAEazSFRGDWacLDpwgIaiAA55C0AJL5EAXkQAiAIwAmALQBmACxeAKwAbC4A3NyC2NaixFYidvhMESZmUNSyMIpOiJ7+IWGIiAD0xYgA8gDSkejRCeLSmYoqGlpUTQrJRaUV1UA)

在之前的版本中，第一次和第二次用到的 `productId` 其实语义上没什么关系，只是你复用了同一个变量而已。这不仅会让 TypeScript 搞不清楚，也会让人看代码时一头雾水。

而使用两个变量的版本就好多了，原因有好几个：

- 把两个不相关的概念（比如 ID 和序列号）拆开了，各管各的。
- 可以起更贴切的变量名，让人一眼看懂。
- 类型推断更精准，根本不需要写类型注解。
- 类型更简单，不用混用 `string | number`，直接是字符串或数字字面量。
- 可以用 `const` 声明变量，而不是 `let`，这让代码更容易理解，对类型检查器也更友好。

这一整章反复强调的一个主题就是：**变量的“变”会让类型检查器更难跟上你的思路**。尽量避免会变类型的变量。如果你能用不同的名字代表不同的东西，不管是对人还是对 TypeScript，代码都会更清晰。

你写的 `const` 应该比 `let` 多得多。

不过这里说的不是“变量遮蔽”（shadowing），比如下面这种情况就另说：

```ts
const productId = '12-34-56'
fetchProduct(productId)

{
  const productId = 123456 // OK
  fetchProductBySerialNumber(productId) // OK
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABMAplCALACgJzgExGgAoZ8AuRAZyhxjAHMBKRAbwF8AoUSWBZNJlwEiUAEIBPAMoo6AQwA2AORABbAEazSFRGDWacLDpwgIaiAA55C0AJL5EAXkQAiAIwAmALQBmACxeAKwAbC4A3NyC2NaixFYidvhMEZysnIiIpmDm8TZQ9k6Inv4hYRkA9OWIAPIA0ukC6NEJ4tKyMIoqGlq5ovbJFVV1nFxAA)

虽然这两个 `productId` 名字一样，但其实是两个完全不相关的变量，类型不同也没问题，TypeScript 能分得清。但人就不一定了，看代码的人可能会觉得混乱。

一般来说，不同的概念最好用不同的名字。很多团队会用 linter（比如 ESLint 的 `no-shadow` 规则）来禁止这种变量“遮蔽”的写法。

本条讲的是标量值（像字符串、数字这些），但同样的道理也适用于对象。更多细节可以参考第 21 条。

## 关键点总结

- 变量的值可以变，但它的类型基本是固定的。
- 别把不同类型的值塞进同一个变量里，这样人看得糊涂，TypeScript 也容易报错。

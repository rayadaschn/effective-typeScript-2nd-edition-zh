# 第 17 条: 避免数字索引签名

## 要点

- 要知道数组本质上是对象，它们的键实际是字符串，不是数字。TypeScript 中的 `number` 索引签名只是为了帮你更好地捕获错误，属于类型层面的设计。
- 比起自己写带 `number` 索引签名，优先使用内置的 `Array`、元组、`ArrayLike` 或 `Iterable` 类型。

## 正文

JavaScript 是一门出了名“有点怪”的语言。其中一些最臭名昭著的怪癖，来自于它的隐式类型转换：

```js
> "0" == 0
true
```

这些情况通常可以通过使用 `===` 和 `!==` 来避免，而不是用它们更“宽松”的兄弟 `==` 和 `!=`。

JavaScript 的对象模型也有一些奇怪的地方，而理解这些就更重要了，因为 TypeScript 的类型系统也参考并模拟了其中的一部分。在第 10 条中你已经见过一个例子，那一节讲了**对象包装类型**。这节讲的是另一个问题。

**什么是对象？** 在 JavaScript 中，对象就是一组“键值对”的集合。键通常是字符串（从 ES2015 开始，也可以是 symbol），值可以是任何东西。

这比很多其他语言都更有限。在 Python 或 Java 中，对象可以用作“可哈希”的键。但在 JavaScript 里，如果你试图用复杂的对象当作键，它会先被调用 `toString` 方法转成字符串。

```js
> x = {}
{}

> x[[1, 2, 3]] = 2
2

>x
{ '1,2,3': 2 }
```

特别地，**数字不能作为对象的键**。如果你试图用数字作为属性名，JavaScript 运行时会把它转换成字符串：

```js
> { 1: 2, 3: 4 }
{ '1': 2, '3': 4 }
```

那数组是什么呢？它们当然也是对象：

```js
> typeof []
'object'
```

但我们平时却习惯用数字来访问数组的元素：

```js
> x = [1, 2, 3]
[1, 2, 3]

> x[0]
1
```

这些数字索引其实也会被转成字符串吗？最奇怪的一点来了，**答案是“是的”**。你也可以用字符串形式来访问数组：

```js
> x['1']
2
```

如果你用 `Object.keys` 列出数组的键，会发现返回的是字符串：

```js
> Object.keys(x)
[ '0', '1', '2' ]
```

TypeScript 在建模数组类型时允许使用数字作为键，并且把数字键和字符串键区分开来。如果你去查 `Array` 的类型声明（参考第 6 条），在 `lib.es5.d.ts` 里可以看到这样的定义：

```ts
interface Array<T> {
  // ...
  [n: number]: T
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgIJSnAngHgCoB8yA3gFDLID0lyAdPecgNogBcyIArgLYBG0AXXZ4A3KQC+pIA)

这其实是个“虚构的设定”——在运行时，字符串键当然是被接受的，因为 ECMAScript 标准就是这么规定的——但 TypeScript 这么设计是有帮助的，它能帮你提前发现一些错误：

```ts
const xs = [1, 2, 3]
const x0 = xs[0] // OK
const x1 = xs['1'] // stringified numeric constants are also OK

const inputEl = document.getElementsByTagName('input')[0]
const xN = xs[inputEl.value]
//            ~~~~~~~~~~~~~ Index expression is not of type 'number'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAHhGBeGBtAjAGhgJmwZgF0BuAKFEljgAZl4JVqSYYB6VmAeQGlzxp46OglQBydKOZsO0AE4BLMAHN5AM3kBTACYwwAVwC2GhcBgVoAQzBREF2RpgWANhBBdefSjEUAHPVABRJzotEGBDDWsAOiUNQKcNI2sIACEATwAVCyUAOQsjAApRX39RAEpGEk8BOBzhBhL4qIA3Zz0NKvYWbp7ugD8BwaHBmABJMC0NOBgpn3sICHlwb0QwEFgQVRgoNJ8HUX0DACNjUSjSIA)

在这种情况下，使用 `inputEl.valueAsNumber` 会更合适，也能修复类型错误。

虽然“数字键”的设定在 TypeScript 中很有帮助，但你得记住，它**只是个虚构的概念**。就像 TypeScript 类型系统的所有部分一样，这些类型信息在运行时都会被“擦除”（参考第 3 条）。这就意味着像 `Object.keys` 这样的函数，返回的仍然是字符串：

```ts
const keys = Object.keys(xs)
//    ^? const keys: string[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAHhGBeGBtAjAGhgJmwZgF0BuAKFElgGsBTAT0RQHkAjAKxuCgDpaGAKBAEoyAelExJMAHoB+GBWgw+EAFwAC6ACcAlmADmqQqSA)

这里的模式是：**数字索引签名**表示你传进去的必须是数字，但你拿出来的却是字符串。

如果这听起来让人困惑，那是因为它确实很让人困惑！一般来说，没什么特别的理由要用 `number` 作为类型的索引签名。如果你是想表示“这个东西可以用数字来索引”，那你更应该用 `Array` 或 **元组（tuple）类型**。

使用 `number` 作为索引类型，可能会让你或阅读你代码的人误以为 JavaScript 里真的存在所谓的“数字属性”。

如果你不太愿意用数组类型，可能是因为数组有很多你用不到的方法（比如 `push` 和 `concat`），那很好——说明你已经开始用“结构化”的方式思考了！（如果你想回顾一下这个概念，可以看看第 4 条。）

如果你确实想接受任意长度的元组，或是任何类似数组的结构，TypeScript 提供了一个叫 `ArrayLike` 的类型可以使用：

```ts
function checkedAccess<T>(xs: ArrayLike<T>, i: number): T {
  if (i >= 0 && i < xs.length) {
    return xs[i]
  }
  throw new Error(`Attempt to access ${i} which is past end of array.`)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAHhGBeGBtAjAGhgJmwZgF0BuAKADMBXMYKAS3BmAAsBTYAa1YBMBBYYKwgQAPABUAfAAoEALhi8ATooCGATwAydLuInY68sJQC2AI1aKAlPLEwA3qRgw65GFLowJKAAwwAZH7OMCLwEAB0ADasYADmUMyW9o5OMIqsUJSKYKGodCTJAL7J8YogAO4wYKwVAKLKIIpSAAa8UFCsxgAOsFAgMCoCQogAJHZ0BTBlzHQszoidKtAw0dwwIK4qyuphTZakRUA)

（TypeScript 还有一个叫 `noUncheckedIndexedAccess` 的配置项，可以让你更安全地访问数组。详见第 48 条。）

`ArrayLike` 类型只包含一个 `length` 属性和一个数字索引签名。顾名思义，它适用于那些“看起来像数组”的结构，比如 `NodeList`。在少数情况下你真的需要这种结构时，应该优先使用 `ArrayLike`，而不是普通数组。

但别忘了，**这些“数字”键，在底层其实仍然是字符串！**

```ts
const tupleLike: ArrayLike<string> = {
  '0': 'A',
  '1': 'B',
  length: 2,
} // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAHhGBeGBtAjAGhgJmwZgF0BuAKFEligFcAHAGwFMAZASwGtGAuGAQQCd+AQwCebTgB5o-VmADmAPmQwA3qRgwA5AAZNPTb02Z1W9Hq0AhIyabyoACx55SAX2IaA9B5gB5ANKkQA)

如果你只是需要一个可以被遍历的东西，可以使用 `Iterable` 类型，它允许你把生成器表达式传给函数使用（参考第 30 条）。

在 JavaScript（和 TypeScript）中，对象的键只能是字符串或 symbol。所谓的“数字索引类型”更像是一种“妥协”，是为了让 `Array` 类型在 TypeScript 中更好用。但你要记住，**数字索引在 JavaScript 中并不是真实存在的**。在你自己定义的类型里，尽量不要使用它们。

## 关键点总结

- 要知道数组本质上是对象，它们的键实际是字符串，不是数字。TypeScript 中的 `number` 索引签名只是为了帮你更好地捕获错误，属于类型层面的设计。
- 比起自己写带 `number` 索引签名，优先使用内置的 `Array`、元组、`ArrayLike` 或 `Iterable` 类型。

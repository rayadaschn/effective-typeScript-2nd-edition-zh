# 第 43 条：为 any 类型设置尽可能小的作用域

## 要点

- 尽可能将 `any` 的使用范围限定得尽量窄，以避免在代码的其他地方丧失类型安全。
- 永远不要从函数中返回 `any` 类型。这会悄悄导致调用该函数的代码失去类型安全。
- 对于较大的对象，最好只对单个属性使用 `as any`，而不是对整个对象使用。

## 正文

来看一段代码：

```ts
declare function getPizza(): Pizza
function eatSalad(salad: Salad) {
  /* ... */
}

function eatDinner() {
  const pizza = getPizza()
  eatSalad(pizza)
  //       ~~~~~
  // Argument of type 'Pizza' is not assignable to parameter of type 'Salad'
  pizza.slice()
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArAF4bsg3ssAewAdjQBzALmQGcwoKBuWgG2CQAoBKagN0OAATZAF8AUKEixEKAMpwWcYfjABPYhGp0GIcs3GCICRVBQwAriARhghEMnIQw6LHG7UX2RmItWbd5Ag4MHlFQQ4aBSVqUKUuPGQAegAqZAA6DORkxNExH0trW3sgsAARUBBobjwxZGQEOzpkMldkAF4HJ083Lm86ktjwluxe2qScusnkAD9Z2bHEnIBBKHJzAFsIcGRCGAJ1FABybsPkYBpkEEIwZDgaGmByEDgAIxYUIma4KDhNqR29moNMhDoNDmNhnA0jQ2JxRuIgA)

如果你非常确定调用 `eatSalad(pizza)` 是没问题的，最好方式是调整类型定义，让 TypeScript 也能理解这一点。

但如果你不能或不想改类型定义，可以用 `any` 来强行让 TypeScript 接受这段代码，方法有两种：

```ts
function eatDinner1() {
  const pizza: any = getPizza() // Don't do this
  eatSalad(pizza) // ok
  pizza.slice() // This call is unchecked!
}

function eatDinner2() {
  const pizza = getPizza()
  eatSalad(pizza as any) // This is preferable
  pizza.slice() // this is safe
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArAF4bsg3ssAewAdjQBzALmQGcwoKBuWgG2CQAoBKagN0OAATZAF8AUKEixEKAMpwWcYfjABPYhGp0GIcs3GCICRVBQwAriARhghEMnIQw6LHG7UX2RmItWbd5Ag4MHlFQQ4aBSVqUKUuPGQAegAqZAA6DORkxNEfS2tbeyCwABFQEGgARm48MWRkBDs6ZDJXajgQVWQAXgcnTzcuZiSckrsAcjBkQUICAAtgGjrA4Njw1uwh+sScwgBrZY24NJo2Ti2R5AAVBZoGhRZkReR8uaM9iEEAQjFxPL9CitSuVoAAmGq4ZaNEDNI49PrOTDYbjeerFNYcOFwO4dVQXHbXW5PO7EUwwaBwABGLAghyRx1O7AgKO2OTAROekXJvzEQA)

第二种方式更好，原因如下：

- 第一种是把整个变量 `pizza` 的类型变成了 `any`，从定义到作用域结束都不会有类型检查；
- 第二种只是在函数参数的位置用了一次 `as any`，类型“污染”范围很小。`pizza` 在其他地方依然是 `Pizza` 类型，依然有类型检查。

换句话说，**“作用域越小，风险越小”**。

如果你让 `eatSalad` 函数接受 `any` 参数，那就更糟了：这会让程序中所有调用 `eatSalad` 的地方都失去了类型检查的保护，而不仅仅是这一个地方。

如果你把 `pizza` 从 `eatDinner` 返回出去，风险还会更大——继续看下去就知道了。

```ts
function eatDinner1() {
  const pizza: any = getPizza()
  eatSalad(pizza)
  pizza.slice()
  return pizza // unsafe pizza!
}

function spiceItUp() {
  const pizza = eatDinner1()
  //    ^? const pizza: any
  pizza.addRedPepperFlakes() // This call is also unchecked!
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArAF4bsg3ssAewAdjQBzALmQGcwoKBuWgG2CQAoBKagN0OAATZAF8AUKEixEKAMpwWcYfjABPYhGp0GIcs3GCICRVBQwAriARhghEMnIQw6LHG7UX2RmItWbd5Ag4MHlFQQ4aBSVqUKUuPGQAegAqZAA6DORkxNEfS2tbeyCwABFQEGgARm48MWRkBDs6ZDJXajgQVWQAXgcnTzcub3ri2PDW7CG6lsxsNJo2Tin60zBzKHsJuGYknMtImBQtgEIxcTy-QtoyJABJMABVYhrcacaQZq2ewOCykAqoNVlrt6vUAHoAfgaTTAMzayA6qmmWzSSkEACUIIJUBBSNAAGKKADWEBo3B2iRyABUABbAGgNBQsZD0hEsGiEZD5GlGEmCU7iIA)

`any` 类型具有“传染性”，一旦出现在返回值中，就可能悄悄蔓延到整个代码库。

比如我们在 `eatDinner1` 中的改动，会导致 `any` 类型“悄悄”地传入到 `spiceItUp` 函数里。但如果是 `eatDinner2` 那样作用域更小的 `any`，这种情况就不会发生。

这也是为什么**即使返回值能被自动推断出来，也建议你显式写出函数返回类型**。这样可以避免 `any` 类型“悄悄溜出去”。如果你想返回 `any`，那就必须**显式写出来**，更容易被注意到。

（关于是否写返回类型，详见第 18 条。）

还有一些标准库里的函数返回的就是 `any`，比如 `JSON.parse`，这些函数本身就有风险，第 71 条会讲如何自我防护。

我们在这里用 `any` 是为了**压制一个我们认为是错误的报错**。还有另一种方式也能达到类似效果，就是使用 `@ts-ignore` 或 `@ts-expect-error`：

```ts
function eatDinner1() {
  const pizza = getPizza()
  // @ts-ignore
  eatSalad(pizza)
  pizza.slice()
}

function eatDinner2() {
  const pizza = getPizza()
  // @ts-expect-error
  eatSalad(pizza)
  pizza.slice()
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArAF4bsg3ssAewAdjQBzALmQGcwoKBuWgG2CQAoBKagN0OAATZAF8AUKEixEKAMpwWcYfjABPYhGp0GIcs3GCICRVBQwAriARhghEMnIQw6LHG7UX2RmItWbd5Ag4MHlFQQ4aBSVqUKUuPGQAegAqZAA6DORkxNEfS2tbeyCwABFQEGgARm48MWRkBDs6ZDJXZABeBydPNy5vesScgAEwGgBaYHIQQlM6wODY8NbsPrnluDSaNk5V8Ty-QvnS8ugAJhrcOcaQZvWOrudMbG5+pOHRsYgADw1rT6goDM5sVFhx1qt6utNtsIC8xOIgA)

这些指令会让下一行的类型错误静默处理，同时不会改变 `pizza` 的类型。

在 `@ts-ignore` 和 `@ts-expect-error` 这两者中，**更推荐使用 `@ts-expect-error`**，因为如果将来错误消失了（比如 `eatSalad` 的类型签名改了），TypeScript 会提醒你这条指令已经没用了，你就可以把它删掉。

由于它们只作用于一行代码，`@ts-ignore` 和 `@ts-expect-error` 不像 `any` 那样会“传染”到其他地方。

不过还是要注意，**尽量少依赖这些指令**。通常 TypeScript 的报错是有道理的，如果下一行代码的错误变得更严重了，这些指令会让 TypeScript 无法发出警告。而且如果这一行将来又多了另一个错误，你也不会知道。

你还可能遇到这样的情况：一个大对象中，**只有某一个属性报了类型错误**。

```ts
const config: Config = {
  a: 1,
  b: 2,
  c: {
    key: value,
    // ~~~ Property ... missing in type 'Bar' but required in type 'Foo'
  },
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArAF4bsg3ssAewAdjQBzALmQGcwoKBuWgG2CQAoBKagN0OAATZAF8AUKEixEKAMpwWcYfjABPYhGp0GIcs3GCICRVBQwAriARhghEMnIQw6LHG7UX2RmItWbd5Ag4MHlFQQ4aBSVqUKUuPGQAegAqZAA6DORkxNEJcGh4JGQAMUJCBJgyrXomZErCAFknAAtCcJ5kfiFcyQKZZAAhOCgEgCNh6p09HvzpIoBhOxhgcjwxZGQ4ahBzAFtR6G8N0e29g6gj5ARqXHWN5ABrCFVqUsJLkW8DIxMUBDs6J0FOZNINht5-iBAZDllRkIsQLDkABeNYbLbIACMABo7idkAAmXEba5o+5PF5Algg9aJHIAP0ZaCgJGganSmV2wBoNAoyFABHUKAA5EMoMLkKNzGBkKYAI7mYCmYQCtQaZDCt7Cu7iT5iIA)

你可以通过把整个对象用 `as any` 包起来来屏蔽类型错误：

```ts
const config: Config = {
  a: 1,
  b: 2,
  c: {
    key: value,
  },
} as any // Don't do this!
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArAF4bsg3ssAewAdjQBzALmQGcwoKBuWgG2CQAoBKagN0OAATZAF8AUKEixEKAMpwWcYfjABPYhGp0GIcs3GCICRVBQwAriARhghEMnIQw6LHG7UX2RmItWbd5Ag4MHlFQQ4aBSVqUKUuPGQAegAqZAA6DORkxNEJcGh4JGQAMUJCBJgyrXomZErCAFknAAtCcJ5kfiFcyQKZZAAhOCgEgCNh6p09HvzpIoBhOxhgcjwxZGQ4ahBzAFtR6G8N0e29g6gj5ARqXHWN5ABrCFVqUsJLkW8DIxMUBDs6J0FOZNINht5-iBAZDllRkIsQLDkABeNYbLbIACMABo7idkAAmXEba5o+5PF5Alggu7iESbGibECqZhJHIAETsAHIwMhBOUwM1gDQAIRiIA)

但这样会带来副作用：其他属性（a 和 b）的类型检查也会被关掉。

更好的方式是只在出问题的那一部分用 `as any`，把影响范围缩小：

```ts
const config: Config = {
  a: 1,
  b: 2, // These properties are still checked
  c: {
    key: value as any,
  },
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArAF4bsg3ssAewAdjQBzALmQGcwoKBuWgG2CQAoBKagN0OAATZAF8AUKEixEKAMpwWcYfjABPYhGp0GIcs3GCICRVBQwAriARhghEMnIQw6LHG7UX2RmItWbd5Ag4MHlFQQ4aBSVqUKUuPGQAegAqZAA6DORkxNEJcGh4JGQAMUJCBJgyrXomZErCAFknAAtCcJ5kfiFcyQKZZAAhOCgEgCNh6p09HvzpIoBhOxhgcjwxZGQ4ahBzAFtR6G8N0e29g6gj5ARqXHWN5ABrCFVqUsJLkW8DIxMUBDs6J0FOZNINht5-iBAZDllRkIsQLDkABeNYbLbIACMABo7idkAAmbEbRI5AAqzQgNBQxCgJGgNipm1MtBsLBYV0pCCegju1zR9yeLyBLBBmxomxAqju4k+YiAA)

如果说前面的例子是“在时间上”缩小 `any` 的作用范围，这里就是“在空间上”缩小作用范围。两种情况目的都是一样的：**如果你真的必须用 `any`，就尽量把它控制在最小范围内，避免牵连无辜**。

如果你使用 `typescript-eslint` 的 `recommended-type-checked` 配置，它会启用一些规则，比如 `no-unsafe-assignment` 和 `no-unsafe-return`，可以帮助你发现 `any` 类型的扩散问题。

## 关键点总结

- 尽可能将 `any` 的使用范围限定得尽量窄，以避免在代码的其他地方丧失类型安全。
- 永远不要从函数中返回 `any` 类型。这会悄悄导致调用该函数的代码失去类型安全。
- 对于较大的对象，最好只对单个属性使用 `as any`，而不是对整个对象使用。

# 第 28 条：用类和柯里化创建新的类型推断点

## 要点

- 对于具有多个类型参数的函数，推断是全有或全无的：要么所有类型参数都被推断，要么必须全部显式指定。
- 若要实现部分推断，可以使用类或柯里化来创建新的推断位置。
- 如果想创建一个局部类型别名，优先使用柯里化方法。

## 正文

假设你用 TypeScript 接口定义了一个 API：

```ts
export interface SeedAPI {
  '/seeds': Seed[]
  '/seed/apple': Seed
  '/seed/strawberry': Seed
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eEA)

这表示我们的 API 有一个 `/seeds` 端点，返回一个 Seed 对象数组；`/seed/apple` 和 `/seed/strawberry` 端点返回单个 Seed 对象。

接下来写一个函数来调用这些 API 端点。函数需要校验端点是否存在，并返回正确的数据类型。这对于客户端安全调用 API 非常有帮助。

下面是这个函数的工作方式：

```ts
declare function fetchAPI<API, Path extends keyof API>(
  path: Path
): Promise<API[Path]>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPIxVADTIynBg5chCkCCY5MgA1hAhojDIVXgAfAAUwi3lZM2tAJRzUKIswHrVVSbz5WZjDEA)

遗憾的是，当你尝试使用这个函数时，会遇到一个错误：

```ts
fetchAPI<SeedAPI>('/seed/strawberry')
//       ~~~~~~~ Expected 2 type arguments, but got 1.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPIxVADTIynBg5chCkCCY5MgA1hAhojDIVXgAfAAUwi3lZM2tAJRzUKIswHrVVSbz5WZjDCVllWrVEVWTXrac-kFQoZoLDNGEL4QAfh+fb8gAoiIpkGwACZkGAQsIUOkaFk2OByI0AllJDRRJIAIyxPBAA)

问题在于 TypeScript 的类型推断是“全有或全无”的：要么你让 TypeScript 从使用中自动推断所有类型参数，要么你必须全部手动指定，中间没有折中。（虽然可以给类型参数设置默认值，但默认值只能引用其它类型参数，不能根据使用情况推断。）

这里的 API 类型参数可以是任何类型：因为我们希望 fetchAPI 能支持任意 API，所以它没法自动推断，必须手动指定。因此，Path 类型也只能显式写出来：

```ts
const berry = fetchAPI<SeedAPI, '/seed/strawberry'>('/seed/strawberry') // ok
//    ^? const berry: Promise<Seed>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPIxVADTIynBg5chCkCCY5MgA1hAhojDIVXgAfAAUwi3lZM2tAJRzUKIswHrVVSbz5WZjDAiFlMhBUKHIALzFpRVV1RENnrrenP6noZqTXravgcFhCzohGiyFEvTwIMIyAAegB+ZCHEDHd4hZardYQe4KMZ4IA)

这样虽然能用，但写起来特别重复。肯定有更好的办法。我们需要把显式写 `API` 类型参数的地方，和推断 `Path` 类型参数的地方分开。

常用的两种方法是：类和柯里化。

### 类

类特别擅长保存状态，省得你每次调用相关函数（类的方法）都要重复传同样的数据。在 TypeScript 里，类也很擅长保存类型信息。

你可以这样定义一个类来解决这个问题：

```ts
declare class ApiFetcher<API> {
  fetch<Path extends keyof API>(path: Path): Promise<API[Path]>
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPIxVADTIynBg5chCkCCY5MgA1hAhojDIVXgAfAAUwi3lZM2tAJRzUKIswHrVVSbz5WZjDMmp6ShH5D2KwsAAYqUV0JtqYxqEJWXl1Tvtgp3dfQNDI0eUxmcxmSyaKzWGy2Oz2DH4QA)

使用方法：

```ts
const fetcher = new ApiFetcher<SeedAPI>()
const berry = await fetcher.fetch('/seed/strawberry') // OK
//    ^? const berry: Seed

fetcher.fetch('/seed/chicken')
//            ~~~~~~~~~~~~~~~
// Argument of type '"/seed/chicken"' is not assignable to type 'keyof SeedAPI'

const seed: Seed = await fetcher.fetch('/seeds')
//    ~~~~ Seed[] is not assignable to Seed
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&module=7&target=4#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPIxVADTIynBg5chCkCCY5MgA1hAhojDIVXgAfAAUwi3lZM2tAJRzUKIswHrVVSbz5WZjDMmp6ShH5D2KwsAAYqUV0JtqYxqEJWXl1Tvtgp3dfQNDI0eUxmcxmSyaKzWGy2Oz2DH4CEKlGKt3K0GQAF4mBA-CNLjc3vcIlVJgsGIiQMiglBQpjkP44MBJK87lBYizyhMvLZOP5qaFNGTkNFkAB5ADSeBFhGQAD0APzIClU4IhIwKPB4DnQdmorm6bwVYAIfogQUMaUyq0ygB+dvtDsdUpiiigNCybHAyABYBCwhQmgARAbbEaTRAQIHNEQeiBRJI4GdgDRmAFnMgwKIM36A-1BsNiWpNJrlZIbKQ3NgsQymSjCWyOfrywYyc6rQ7K+YY0x4-Skym4GmUJnK3ggA)

这正是我们想要的类型检查效果。（当然你还得实现这个类，这里重点是类型）

之前需要写两个泛型参数的函数，现在变成了一个类，构造函数时显式指定一个泛型参数（API），调用 fetch 方法时自动推断一个泛型参数（Path）。TypeScript 完全支持你在 new ApiFetcher<SeedAPI>() 时绑定 API 类型，然后在调用 fetch 时推断 Path。

用类来划分绑定位置特别适合有多个方法都需要用同一个类型参数的情况。

### 柯里化

有趣的是，编程语言其实不一定非得用多参数函数。比如：

```ts
declare function getDate(mon: string, day: number): Date
getDate('dec', 25)
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&module=7&target=4#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPIxVADTIynBg5chCkCCY5MgA1hAhojDIVXgAfAAUwi3lZM2tAJRzUKIswHrVVSbz5WZjDMmp6ShH5D2KwsAAYqUV0JtqYxqEJWXl1Tvtgp3dfQNDI0eUxmcxmSyaKzWGy2Oz2DH4hzSGWKOTyBSKNFKABEWhAJixChwqLRGpg4CEyCAsiwglBwTjIAxMWAGXjNIdNI0AEwAVgWDCAA)

也可以写成一个返回另一个函数的函数：

```ts
declare function getDate(mon: string): (day: number) => Date
getDate('dec')(25)
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&module=7&target=4#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPIxVADTIynBg5chCkCCY5MgA1hAhojDIVXgAfAAUwi3lZM2tAJRzUKIswHrVVSbz5WZjDMmp6ShH5D2KwsAAYqUV0JtqYxqEJWXl1Tvtgp3dfQNDI0eUxmcxmSyaKzWGy2Oz2DH4hzSGWKOTyBSKNFKABEWhAJixChwqLRwRNMHAQmQQFkWEEoAtkABeJ44yAMTFgVl4zSHTQLCYAJgArAsGEA)

注意第二种写法调用方式稍有不同。这种技巧叫“柯里化”，得名于逻辑学家 Haskell Curry，尽管他一直否认是他发明的。

柯里化给了我们更多灵活性，可以在每次函数调用时引入新的类型推断点。

用柯里化重写 fetchAPI 大致是这样：

```ts
declare function fetchAPI<API>(): <Path extends keyof API>(
  path: Path
) => Promise<API[Path]>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPFUAfAAUAJQkjNXKcGDlyEKQIJjkyADWECGiMMj1DcKd5WQdXU3IALx1yMpQoizAerVqJgvlZnUMQA)

fetchAPI 不接受参数，但返回一个接受 path 的函数。

用法是：

```ts
const berry = await fetchAPI<SeedAPI>()('/seed/strawberry') // OK
//    ^? const berry: Seed

fetchAPI<SeedAPI>()('/seed/chicken')
//                  ~~~~~~~~~~~~~~~
// Argument of type '"/seed/chicken"' is not assignable to type 'keyof SeedAPI'
//
const seed: Seed = await fetchAPI<SeedAPI>()('/seeds')
//    ~~~~ Seed[] is not assignable to Seed
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&module=7&target=4#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPFUAfAAUAJQkjNXKcGDlyEKQIJjkyADWECGiMMj1DcKd5WQdXU3IALx1yMpQoizAerVqJgvlZnUMCIWUyEFQoSvI-nDAkiVllWrVEVNNDV62nP5XoU0TToyGiyAA8gBpPBgwjIAB6AH5kGcQBcASEjAo8HhnhUqu8FJ9vrpvBVgAgRiAgQxYXD6Qz6QA-FmstnsmExRRQGhZNjgZDjZBgELCFCaABEpNs5MpEBAEs0REGIFEkjg5HIwBozACzmFomFovFIzGEw+ak0nLwqIuNlIbmwyzufgeT1K+LeFtUjS+PwGNM5zNZjvMyqYarumu1uv1YENETwQA)

和类方案一样，这个方案对的地方工作正常，错误也能正确报出。

你可以用中间变量减少重复调用：

```ts
const fetchSeedAPI = fetchAPI<SeedAPI>()
const berry = await fetchSeedAPI('/seed/strawberry')
//    ^? const berry: Seed
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&module=7&target=4#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPFUAfAAUAJQkjNXKcGDlyEKQIJjkyADWECGiMMj1DcKd5WQdXU3IALx1yMpQoizAerVqJgvlZnUMCIWUxaUVEVUrl2WVatU3ao1Np+eSQVChd-5wwEkJQeL1UDS8tk4-m+oU07zw0UIhAAegB+ZBnEAXGEhIwKPBAA)

柯里化和类的区别其实没那么大。如果改成返回对象而非函数，它们几乎一样：

```ts
declare function apiFetcher<API>(): {
  fetch<Path extends keyof API>(path: Path): Promise<API[Path]>
}

const fetcher = apiFetcher<SeedAPI>()
fetcher.fetch('/seed/strawberry') // ok
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&module=7&target=4#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eJgQCI5wUCgwAK4gCGDAoiDIMBBgCAAWKqoAPFUAfAAUAJQkjNXKcGDlyEKQIJjkyADWECGiMMj1DcKd5WQdXU3IALx1yMpQoizAerVqJgvlZnUMyanpmTl5BUX2wABipRXQe6qNLRqEJWXl7bM9gj6A2Go3GkzUjRmXXmsw+Gy2OwgrwOs2ODH4eAQhUoxSe5WgK2Qd0ePxeESmTQY32eUFi1PKDS8tk4-iCUFCmkphGiyFEQzwQA)

唯一不同是用类时调用时需要 new。

如果你想部分泛型参数显式指定，部分自动推断，类和柯里化是两种常见方案。

那选哪个呢？看你个人习惯，哪个用着舒服就选哪个。柯里化在 TypeScript 中有个额外优点：你可以在函数内部定义局部类型别名，比如：

```ts
function fetchAPI<API>() {
  type Routes = keyof API & string // local type alias

  return <Path extends Routes>(path: Path): Promise<API[Path]> =>
    fetch(path).then((r) => r.json())
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQgE2QbwFDLLCYBcyAzmFKAOYDcByIcAthGZdSPXgL54QAHgAcA9lDBFw0eEjQZMAQQAKASVyMA5AHpyC8prLosAbQC6DQjr1ZtcYcIA2EQ-KyXk1hbqpwA7gBG0FAAnq7GmB7a2sgAdPF8eDAAriAIYMCiIMgwEGAIABYqqgA8xQB8ABQAlBqEYCHCKABKosmQ5MgAvMgA1hAhojDIxcgAZBRUtHSE0ciOoghwjsgNTcjLwHDkeIxQeclQ2SXKcGAFyEKQIJidre0Q5FWMhMJnBWSn54zVn1CiLGAejKahMXwKZnK3ShuXyBUqb3O1Vi5wgIEqUGhyCgsQAVuQsjVqgx+EA)

只有实现函数才会引入新作用域，声明函数做不到这一点。局部类型别名能帮你减少复杂类型表达式的重复，这在类里没办法实现。

## 关键点总结

- 对于具有多个类型参数的函数，推断是全有或全无的：要么所有类型参数都被推断，要么必须全部显式指定。
- 若要实现部分推断，可以使用类或柯里化来创建新的推断位置。
- 如果想创建一个局部类型别名，优先使用柯里化方法。

# 第 18 条: 避免在代码中添加可推断的类型

## 要点

- 当 TypeScript 能推断类型时，避免写类型注解。
- 理想的 TypeScript 代码只在函数/方法签名里写类型注解，不在函数体内部的局部变量上写。
- 对对象字面量使用显式注解，可以开启多余属性检查，确保错误在靠近出错位置被报告。
- 除非函数有多个返回语句、是公共 API，或者想用命名返回类型，否则不要给函数返回类型写注解。

## 正文

很多刚接触 TypeScript 的开发者，在把 JavaScript 代码迁移过来时，第一反应就是给所有地方都加上类型注解。毕竟 TypeScript 就是为了类型而生的嘛！

但实际上，很多类型注解是没必要的。给所有变量都声明类型反而适得其反，还被认为是不好的编码风格。

例如不要这样:

```ts
let x: number = 12
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/DYUwLgBAHgXBB2BXAtgIxAJwgXggRgCYBuAKCA)

相应的，TypeScript 会自动推断出 `x` 的类型为 `number`，所以可以简化为：

```ts
let x = 12
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/DYUwLgBAHhC8EEYBMBuAUEA)

如果你把鼠标悬停在编辑器里的 `x` 上，你会看到它的类型被自动推断为 `number`（如图 3-1 所示）

![Figure 3-1. A text editor showing that the inferred type of x is number](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202505172226748.png)

显式写类型注解是多余的，只会增加代码的冗余感。如果你不确定变量的类型，可以在编辑器里查看。

TypeScript 也能自动推断更复杂对象的类型。与其写成这样：

```ts
const person: {
  name: string
  born: {
    where: string
    when: string
  }
  died: {
    where: string
    when: string
  }
} = {
  name: 'Sojourner Truth',
  born: {
    where: 'Swartekill, NY',
    when: 'c.1797',
  },
  died: {
    where: 'Battle Creek, MI',
    when: 'Nov. 26, 1883',
  },
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBADgUwE4XALhgbwFAxmAQwFsENokBLMAcwG5cYAjEJMDHPPAdwAtlSY5KnQbc+bQVEo16eAL6yYAEwoIl7UTF78yU4YrEIJQmQznY5MALxYGhEhgDkAZRAArEAFdWyGABUkTygeRwAaBmZWDU4tPiQBFy4CJCgEAGsKABtM0JgAOQBNMM1tCUdgADoARgB2AE4a4vlwvBU1aM5teKcAIQIoKEyEGABhePTcgFkASSbO8Sc8kAA3CpgAJgA2XKqADl2AZkczC3ogA)

你可以简化为：

```ts
const person = {
  name: 'Sojourner Truth',
  born: {
    where: 'Swartekill, NY',
    when: 'c.1797',
  },
  died: {
    where: 'Battle Creek, MI',
    when: 'Nov. 26, 1883',
  },
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBADgUwE4XDAvDA3gKBjMAQwFsEAuGAcgGUQArEAVyTGRgBUlGoALSgGjwwARiBYVc+fAHceyclWrTCSKAgDWASwA22-jAByATQFCZcsBUrAAdAEYA7AE4Hp-AF9B+ACaaE3iTMYWXkrACFCKChtBBgAYSQEDX0AWQBJNykQyyoDEAA3GxgAJgA2fTsADkqAZkohdxx3AG4cIA)

同样，这两种写法的类型完全一样。在值后面再写类型注解，只会让代码变得啰嗦。（第 20 条会讲 TypeScript 如何推断对象字面量的类型。）

对于数组来说也是一样。TypeScript 能轻松根据函数的输入和操作推断出它的返回类型：

```ts
function square(nums: number[]) {
  return nums.map((x) => x * x)
}
const squares = square([1, 2, 3, 4])
//    ^? const squares: number[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZwI4gIYCcCmAKMEAW2QC5FCiAjHLAbQF0BKRAbwChFFcoQslKyAHREMABzwAPRAF4AfImkAqRUwDc7AL7sICZFBTpsOZLMOZceOgEYANIgBM9gMz2ALMw0B6L1y4A9AH5EXTB9c2MyCmIaegZ2IA)

TypeScript 可能会推断出比你预期更精确的类型，这通常是件好事。比如：

```ts
const axis1: string = 'x'
//    ^? const axis1: string
const axis2 = 'y'
//    ^? const axis2: "y"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAhgDwJYQIwC4bQE5LAcxgF4YByBUgbgCgB6WmRmAPQH4ZRJZEUMspcBap2jxkEAEzEyATyp0GTNh3CiekzACIZm6kA)

对于变量 `axis2` 来说，"y" 是更精确的类型。给 `axis1` 显式写上字符串类型注解反而多余，还会降低类型安全。

让类型自动推断还能方便重构。比如你有一个 `Product` 类型和一个打印它的函数：

```ts
interface Product {
  id: number
  name: string
  price: number
}

function logProduct(product: Product) {
  const id: number = product.id
  const name: string = product.name
  const price: number = product.price
  console.log(id, name, price)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgApQPYBMCuCzIDeAUMssFgFzIg4C2ARtANyk1x0TUDOYUoAc1ZkADvyTVajFsQC+xYjBwh8wDCGQAbDAPTY8YABRj9+antz4AlETYJ1vclRr0mUZAF5kJy2AB0FMLI9iCOIBxcyLz8IAKe3pi+fuGcQSGOYsASLtLuXj4GfplIaQ4YmhB+2gKGFAA07JwNxRBWrPJAA)

后来你发现产品的 ID 里除了数字还有字母，所以你修改了 `Product` 类型中 `id` 的定义：

```ts
interface Product {
  id: string
  name: string
  price: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgApQPYBMCuCzIDeAUMssFgFzIDOYUoA5gNynIhwC2E1dDILNgAcGSaiBycARtFYBfYkA)

因为你在 `logProduct` 里的所有变量都写了显式注解，修改后就会导致类型错误：

```ts
function logProduct(product: Product) {
  const id: number = product.id
  // ~~ Type 'string' is not assignable to type 'number'
  const name: string = product.name
  const price: number = product.price
  console.log(id, name, price)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgApQPYBMCuCzIDeAUMssFgFzIDOYUoA5gNynIhwC2E1dDILNgAcGSaiBycARtFYBfYjBwh8wDCGQAbDI3TY8YABQj9+antz4AlETYJ1dclXaSZUZAF5kJy2AB0FKxkwQD0IcgAfhHIACoAnkIoAOR8TEnkNOwYBHA0NMCMHFKaKGAYyGAJyRLS0El2DgQc3Lz0TJ7emL5+zRBByPYgjiLAYi617l4+Bn4jSP2DNBglftqMhhQANOxcENtzEFbyxEA)

如果你在 `logProduct` 函数体里不写任何类型注解，修改后代码就能顺利通过类型检查（而且运行时也没问题）。

下面是一个更好的 `logProduct` 实现，允许所有局部变量的类型被自动推断，同时使用了解构赋值：

```ts
function logProduct(product: Product) {
  const { id, name, price } = product
  console.log(id, name, price)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgApQPYBMCuCzIDeAUMssFgFzIDOYUoA5gNynIhwC2E1dDILNgAcGSaiBycARtFYBfYjBwh8wDCGQAbDI3TY8YABQj9+antz4AlETYJ1dIhQA07LhFcjgSOcgC8yCaWYKxk9iA0GJoQAHTajIYubtyeohBW8sRAA)

带显式类型注解的对应版本，看起来重复且杂乱无章：

```ts
function logProduct(product: Product) {
  const { id, name, price }: { id: string; name: string; price: number } =
    product
  console.log(id, name, price)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgApQPYBMCuCzIDeAUMssFgFzIDOYUoA5gNynIhwC2E1dDILNgAcGSaiBycARtFYBfYjBwh8wDCGQAbDI3TY8YABQj9+antz4AlETYJ1dIhQA07LhFcjgSOdUIVeeiZmN25A-hZkLzF2SRkoZDlkAF4ozEswVjJ7EBoMTQgAOm1GQxdQjzTvCCt5YiA)

你不能直接在解构赋值里写类型注解，因为正如第 8 条解释的那样，TS 会把它当成重命名指令处理。解构赋值是让代码更简洁的好方法，它鼓励统一命名，也更适合类型推断。

不过，有些情况下还是必须写显式类型注解，因为 TypeScript 没法自动推断出类型。你之前见过其中一种情况：函数参数。

有些语言会根据参数的使用情况推断类型，但 TypeScript 不会。TS 里变量的类型通常是在它首次出现时确定的。（第 25 条讲了这个规则的重要例外。）

理想的 TypeScript 代码，是在函数或方法的签名里写类型注解，但函数体内部创建的局部变量就交给 TS 自动推断。这样可以减少冗余，让读代码的人更专注于实现逻辑。

当然，有些情况下函数参数也可以省略类型注解，比如参数有默认值时：

```ts
function parseNumber(str: string, base = 10) {
  //                              ^? (parameter) base: number
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwIYCcDOBTAciAWwCNt0AKTKdALkUvRjAHMAaRI1HAXgEYAGAJSIA3gChEiAPSSJsufIWLZAPQD8iMmnSoC2KKSEcctMIRLpxUmQDpbogL6igA)

这里 `base` 的类型因为默认值 `10` 被推断为 `number`。

当函数作为带类型声明的库的回调使用时，参数类型通常也能被推断出来。比如这个用 express HTTP 服务器库的例子，`request` 和 `response` 的类型声明其实是多余的：

```ts
// Don't do this:
app.get('/health', (request: express.Request, response: express.Response) => {
  response.send('OK')
})

// Do this:
app.get('/health', (request, response) => {
  //                ^? (parameter) request: Request<...>
  response.send('OK')
  // ^? (parameter) response: Response<...>
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYWwDg9gTgLgBAUwB5iggzuuAzKERwDkyqG6hA3AFADGEAduvAIZhhwC8iKamAFAEpqAemFwAIg0LwAJhDgwAFsHQAuKqzAA6AOYIYfQsMUJmAGyWEANHD5oAjgFcMMVd1KYtAJQROXN3khGBDcSXnRvDCD0BAFOAD44AG8qODhAhhitGPoZQwB5AGlCISoAX1KqUQl5JRV1TV19Q2NTC0VrWwdnJgCozNiE5NS4arTxicm4AD0AflswZihmEH0EKDjulzcfPyYAHi0j+JGM4OyEXILi0rTquYWllbWN9P7gnfeYw+Py0qA)

第 24 条对类型推断中的上下文使用有更多讲解。

有些情况下，即使类型可以被推断，你仍然可能想显式指定类型。

其中一种情况是定义对象字面量时：

```ts
const elmo: Product = {
  name: 'Tickle Me Elmo',
  id: '048188 627152',
  price: 28.99,
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgApQPYBMCuCzIDeAUMssFgFzIDOYUoA5gNynIhwC2E1dDILNgAcGSaiBycARtFYBfYjBwh8wDCGQAbDI3TY8YABQj9+antz4AlETYJ1dIhQA07LhFcjgSOcgC8yCaWYKxk9iA0GJoQAHTajIYubtyeohBW8sThjhCanBjmmMH+tmQc3NQA5AAq3gDW0cgAsigAonkYlc5sFFUADAAsABwAjENDyABsAEwA7CMArNNdwmnU00MxAJxb3XKsQA)

当你给这样的定义显式指定类型时，会开启“多余属性检查”（参考第 11 条）。这有助于发现错误，尤其是对于带可选字段的类型。

同时，这也增加了错误会在正确位置被报告的可能性。如果不写类型注解，对象定义里的错误会在使用它的地方才报错，而不是在定义处报错：

```ts
const furby = {
  name: 'Furby',
  id: 630509430963,
  price: 35,
}
logProduct(furby)
//         ~~~~~ Argument ... is not assignable to parameter of type 'Product'
//               Types of property 'id' are incompatible
//               Type 'number' is not assignable to type 'string'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgApQPYBMCuCzIDeAUMssFgFzIDOYUoA5gNynIhwC2E1dDILNgAcGSaiBycARtFYBfYjBwh8wDCGQAbDI3TY8YABQj9+antz4AlETYJ1dIhQA07LhFcjgSOcgC8yCaWYKxk9iA0GJoQAHTajIYubtyeohBW8sThjkpQUgCe-rZkHNzUAOQAYjh5+eXObBTUAGwAzAAMAKztAJwALB09bQ1kXmLIrZ0NcqzxFgaGuQUZxAD0q2SbWwB+u7vIAIJQjJIQ4Mgxl+Q07BgEcDQ0wIwcUtHIYBiBcFDukFDIDAwD75IQocrzfDlNYbLZwuEAFVBEBuQMCmDBUDAhXKFHKyB+KFA9k4QjgYGAbwgMPhtLISLByHKEmk0HxwBuIDuBMez1e70+IMZ5T4TGhQA)

在大型代码库里，这种类型错误可能会出现在与对象定义毫无关联的另一个文件中。有了类型注解，错误会更简洁明了地出现在出错的确切位置：

```ts
const furby: Product = {
  name: 'Furby',
  id: 630509430963,
  // ~~ Type 'number' is not assignable to type 'string'
  price: 35,
}
logProduct(furby)
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgApQPYBMCuCzIDeAUMssFgFzIDOYUoA5gNynIhwC2E1dDILNgAcGSaiBycARtFYBfYjBwh8wDCGQAbDI3TY8YABQj9+antz4AlETYJ1dIhQA07LhFcjgSOcgC8yCaWYKxk9iA0GJoQAHTajIYubtyeohBW8sThjkpQUgCe5pjB-rZkyTzIAOQAYjh5+VXObORUyABsAMwADACs3QCcACw9A13NAPQTyAB+M8gAKvlCKFUS0tBV5DTsGARwNDTAjBxS0chgGBfLq3xMVS1eYsidvc1yrPEWBoa5BRnEIA)

类似的情况也适用于函数的返回类型。即使返回类型可以被推断出来，你仍然可能想显式标注，确保实现上的错误不会影响到函数的调用者。这对作为公共 API 的导出函数尤其重要。

比如，你有一个用来获取股票报价的函数：

```ts
function getQuote(ticker: string) {
  return fetch(`https://quotes.example.com/?q=${ticker}`).then((response) =>
    response.json()
  )
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQIojlVAKWCAa1QCcAuRAZylJjGQEpEBvAKEUVPRFKWHQQAFngAGQqFAAOVcgHo5AR2y4qAOlQAPAIYBbKQBtUaiHF1yA-IoC8AEhaESpAL6jGHTp7VQhqMHm4qKQQqVERrAD4uVCCQ4wArKgQ8RkYAbjZnNiA)

你决定加个缓存，避免重复发起网络请求：

```ts
const cache: { [ticker: string]: number } = {}
function getQuote(ticker: string) {
  if (ticker in cache) {
    return cache[ticker]
  }
  return fetch(`https://quotes.example.com/?q=${ticker}`)
    .then((response) => response.json())
    .then((quote) => {
      cache[ticker] = quote
      return quote as number
    })
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMCGwAWBTAXDA3gbSgS2AGsUAnDaEvMAcwF0MwBXAWwCNSBfGAXiw4G4AUADNGYYPnAxqKKAEVGIKCgAU+IqXJRKNAJRZBMGHmEw1BYiWNg4iVPsyGjMErMYkbCZClwXStISMOJ1codxthWWQVAAMkKCgABwg0AHpUgEdFZQgAOhQAD3hmRIAbFFzQZlSAfgzuABJMdUsOGN0nZxhcqFQwFVcIRPAIFB4APhcUIZGKgCsIcBVdDq6jHr6VLKUx7knHNecvVF8NEloeGG3lQMOpsI8r7LH4CBgmNlJbro5dIWCgA)

这个实现里有个错误，你可以通过查看 `getQuote` 的推断返回类型看出来：

```ts
getQuote
// ^? function getQuote(ticker: string): number | Promise<number>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMCGwAWBTAXDA3gbSgS2AGsUAnDaEvMAcwF0MwBXAWwCNSBfGAXiw4G4AUADNGYYPnAxqKKAEVGIKCgAU+IqXJRKNAJRZBMGHmEw1BYiWNg4iVPsyGjMErMYkbCZClwXStISMOJ1codxthWWQVAAMkKCgABwg0AHpUgEdFZQgAOhQAD3hmRIAbFFzQZlSAfgzuABJMdUsOGN0nZxhcqFQwFVcIRPAIFB4APhcUIZGKgCsIcBVdDq6jHr6VLKUx7knHNecvVF8NEloeGG3lQMOpsI8r7LH4CBgmNlJbro5dIWCZPJnkJ0jAAHo1GCicSSGyAhQ7cxnLQ6ai6BgsdhWAA+MAACiQQMw8KMADwfLHjQRAA)

你实际上应该返回 `Promise.resolve(cache[ticker])`，这样 `getQuote` 才会始终返回一个 Promise。这个错误很可能会导致报错……但错误会出现在调用 `getQuote` 的代码里，而不是 `getQuote` 函数本身：

```ts
getQuote('MSFT').then(considerBuying)
//               ~~~~ Property 'then' does not exist on type
//                    'number | Promise<number>'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMCGwAWBTAXDA3gbSgS2AGsUAnDaEvMAcwF0MwBXAWwCNSBfGAXiw4G4AUADNGYYPnAxqKKAEVGIKCgAU+IqXJRKNAJRZBMGHmEw1BYiWNg4iVPsyGjMErMYkbCZClwXStISMOJ1codxthWWQVAAMkKCgABwg0AHpUgEdFZQgAOhQAD3hmRIAbFFzQZlSAfgzuABJMdUsOGN0nZxhcqFQwFVcIRPAIFB4APhcUIZGKgCsIcBVdDq6jHr6VLKUx7knHNecvVF8NEloeGG3lQMOpsI8r7LH4CBgmNlJbro5dIWDROJJJ4RngACakABCjAAnlRqCoChh4GAYQ5gjJ5M8VAByACyAGUAGIAFRxug2KH6oEg4KhsPhf0E6TurIAfhy2TAAAokECJUhQGEwHG9Kk4mBgkDTd5KGCFPDQGBSIUC5mpVma5w4j7sKwAHx5fOYipQAB5daRxjjBEA)

如果你给返回类型写上了注解（比如 `Promise<number>`），错误就会在正确的位置被发现：

```ts
const cache: { [ticker: string]: number } = {}
function getQuote(ticker: string): Promise<number> {
  if (ticker in cache) {
    return cache[ticker]
    // ~~~ Type 'number' is not assignable to type 'Promise<number>'
  }
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMCGwAWBTAXDA3gbSgS2AGsUAnDaEvMAcwF0MwBXAWwCNSBfGAXiw4G4AUADNGYYPnAxqKKAEVGIKCgAU+IqXJRKNAJQYACiRDM8EFAB4mbUgD4sgmDDzCYagsRLOwcRKl0OTk4ksowkPgjIKLgepLRCQTAA9EkwAH4ZMAAqAJ4ADigwAOTW7CRFzhAwYEow8BAQeNRg8KwANoVQIDBQ+YVFRiZmlqV2RY4wHBMpMADCAPIAsgYASgCiAMobEyFQYT6DpuYAdCEQIG0AbqoADLoJyalrAHIAIoJTgkA)

当你标注了返回类型，就能防止实现上的错误跑到调用代码里去报错。这对于像 `getQuote` 这样有多个返回语句的函数尤其重要。如果你想让 TypeScript 检查所有返回值类型一致，就必须写类型注解，明确告诉它你的意图。（第 27 条会讲 async 函数如何有效避免这类错误。）

写出返回类型还能帮你更清晰地思考函数：你应该在实现前就知道函数的输入和输出类型。虽然实现细节可能会变，但函数的“契约”（类型签名）一般不该变。这和测试驱动开发（TDD）的思想类似，先写测试再写实现。先写完整的类型签名，能帮你写出你想要的函数，而不是为了实现方便写出的函数。

另一个写返回类型的理由是：如果你想用命名类型。比如，你可能不会给这个函数写返回类型：

```ts
interface Vector2D {
  x: number
  y: number
}
function add(a: Vector2D, b: Vector2D) {
  return { x: a.x + b.x, y: a.y + b.y }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lATAEWQG9kAPALmRAFcBbAI2gG5kBPSmh55AXwCgY1EJmBYQyOABNJACjiV0mHAQA0yegozY8+AJTE+yZFAhhqUcSQoSAdKWQBqdXbXtbrR8488mffkA)

TypeScript 会推断返回类型为 `{ x: number; y: number; }`。这个类型和 `Vector2D` 是兼容的，但当用户看到输入参数是 `Vector2D` 类型，而返回值却不是时，可能会感到意外（见图 3-2）。

![Figure 3-2. The parameters to the add function have named types, but the inferred return value does not.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202505172235320.png)

如果你给返回类型写了注解，代码表达会更清晰。如果你还为这个类型写了文档（见第 68 条），文档也会和返回值关联起来。随着推断返回类型复杂度的增加，提供一个命名类型会越来越有帮助。

最后，标注返回类型还能减少 TypeScript 的推断负担，对大型项目的编译性能有积极影响。第 78 条会讲当构建变慢时该怎么办。

那么，应该给返回类型写注解吗？为了减少代码量和方便重构，默认答案是“不写”。但满足以下情况时，写注解是明智的选择：函数有多个返回语句，是公共 API 的一部分，或者你想用命名返回类型。

如果你用 linter，typescript-eslint 的 `no-inferrable-types` 规则可以帮你确保所有类型注解都是必要的。

## 关键点总结

- 当 TypeScript 能推断类型时，避免写类型注解。
- 理想的 TypeScript 代码只在函数/方法签名里写类型注解，不在函数体内部的局部变量上写。
- 对对象字面量使用显式注解，可以开启多余属性检查，确保错误在靠近出错位置被报告。
- 除非函数有多个返回语句、是公共 API，或者想用命名返回类型，否则不要给函数返回类型写注解。

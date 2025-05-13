# 第 12 条：尽可能为整个函数表达式提供类型

## 要点

- 考虑给整个函数表达式加类型注解，而不是单独给参数和返回类型加注解。
- 如果你重复写相同的类型签名，可以提取出一个函数类型，或者寻找一个现有的类型。
- 如果你是库的作者，提供常用回调函数的类型。
- 使用 `typeof fn` 来匹配另一个函数的签名，或者如果需要改变返回类型，可以使用 `Parameters` 和剩余参数。

## 正文

JavaScript（和 TypeScript）区分“函数声明”和“函数表达式”：

```ts
function rollDice1(sides: number): number {
  /* ... */
} // Statement
const rollDice2 = function (sides: number): number {
  /* ... */
} // Expression
const rollDice3 = (sides: number): number => {
  /* ... */
} // Also expression
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAJzgGzQERhApgRgAoBnGAE12IC5EwQBbAI12QEoa6mXEBvRAegBUiAMIB5ALIAFAEoBRAMoLEg-ilxQQyJAAYA3AOFyAcphVqAvogFqFUAIZRc9XGCgAoCAmJQU6LDi4AEyIALyIoJCwCCTklBwMzGwJXMi8hqKSsorKquqa2oj6GSZmeRYGNohyAB4ADsiUpAie3r6oGNh4AMxhiLEU1LSJLOzDqWEAfOlCmdLySub5WroGs6VLFdb8agCCaMRwiLj1jcTNYO7uQA)

在 TypeScript 中，函数表达式的一个好处是你可以一次性给整个函数加上类型声明，而不需要分别给参数和返回值单独指定类型：

```ts
type DiceRollFn = (sides: number) => number
const rollDice: DiceRollFn = (sides) => {
  /* ... */
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAIglgYwgJQPYBt0DEB2UC8UAFAM5wAmEJAXFDgK4C2ARhAE4CUBAfHU62wDcAKASocJYFDYZ08JLXkpZuAlDKUSPKAG8oAegBUUAMIB5ALIAFZAFEAyvaiH90iMHps8ABkEHjtgByMM6uAL4iwkA)

如果你在编辑器里把鼠标悬停在 `sides` 上，会看到 TypeScript 知道它的类型是 `number`。在这么短的例子里，函数类型看起来没什么用，但这种写法确实带来了不少好处。

其中一个好处就是减少重复。比如你要写好几个用于数字运算的函数，可以像下面这样写：

```ts
function add(a: number, b: number) {
  return a + b
}
function sub(a: number, b: number) {
  return a - b
}
function mul(a: number, b: number) {
  return a * b
}
function div(a: number, b: number) {
  return a / b
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoBTIFyLCAWwCMBTAJwBpEjd9jyBKRAb0TJKhDKWUQGpqAbkQBfAFChIsBIgDOIIllqFSlasvpkmrdp24pEAWiGiJ4aPCQEQAGyV4V5KjQebtbDlx6IAVCfGSFjKoMABu9nSqzhqq7rpeBgD0-mJAA)

或者你也可以用一个函数类型把这些重复的函数签名统一起来。

```ts
type BinaryFn = (a: number, b: number) => number
const add: BinaryFn = (a, b) => a + b
const sub: BinaryFn = (a, b) => a - b
const mul: BinaryFn = (a, b) => a * b
const div: BinaryFn = (a, b) => a / b
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAQglgOwIYCcQDEFQLxQBRIBcUCArgLYBGEKANFJcWVTQJQ4B8JF1KA3ACgAxgHsEAZ2BQkAExnF4yNJhz4k9Su2xckUANQNBoiVPGlGsRKgxZcBDVp1QAtIeFjJUcqQA2Cq8q2ag6c0lAAVG7GnjJwAG7+Sjaq9gyOYQD0bkA)

这样写的话，类型注解更少了，而且也和具体的函数实现分开了，看起来逻辑更清晰。而且还有一个好处，就是 TypeScript 会帮你检查所有这些函数表达式的返回值是不是 `number`。

很多库也会提供常见函数签名的类型。例如，React 的类型定义里就有一个 `MouseEventHandler` 类型，你可以直接把它用在整个函数上，而不用单独给参数写 `MouseEvent` 类型。如果你在写库，也可以考虑为常用的回调函数提供类型声明。

还有一种适合给函数表达式加类型的情况，就是你需要让它符合另一个函数的签名。比如在浏览器中，`fetch` 函数会发起一个 HTTP 请求：

```ts
const response = fetch('/quote?by=Mark+Twain')
//    ^? const response: Promise<Response>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBATgUwgB3BBMC8MBmCrAAWAFAOQD0AjgK4hQID8ARgJ6YCyAhnANYDUAFQDunAJZhSASgDcAKHLkYSmAD0GMUJFiIUaBAC4YABTggAtqPQAeAEpJUkBAD5ZQA)

你可以通过 `response.json()` 或 `response.text()` 从响应中提取数据：

```ts
async function getQuote() {
  const response = await fetch('/quote?by=Mark+Twain')
  const quote = await response.json()
  return quote
}
// {
//   "quote": "If you tell the truth, you don't have to remember anything.",
//   "source": "notebook",
//   "date": "1894"
// }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/IYZwngdgxgBAZgV2gFwJYHsIwOYFNkCKC6yuAFAJQwDeAUDDFJiMjAE64gAOzuMAvDGAB3YKlZx8UABZkA5AHoAjsVIB+AEZh+AWWBsA1gGoAKqNQQ5FANz1GzVipJ9BIsaw7deAOgBWITEpbBg5kBDYsJ1JbAF9aBQUaeMSGACIo3FSALhhUgEk4GDB0BBhSABtysuk+ZDYEZGkAGiKSmAATTDlWaWAAN1r0dlwAW1GNXDYhCDBGi2xvVKbkhlyA8KhMnNSIZw10dAMllbT24FJs3IBGAA4ATgAWVJW4oA)

这里有个 bug：如果请求 `/quote` 失败，响应体可能会是类似 “404 Not Found” 这样的提示。这不是合法的 JSON，所以 `response.json()` 会返回一个被拒绝的 Promise，错误信息只会说 JSON 无效，而忽略了真正的错误 —— 其实是 404。

我们很容易忘记，`fetch` 在出错时并不会返回一个被拒绝的 Promise。所以我们可以写一个叫 `checkedFetch` 的函数，来帮我们检查状态码。`fetch` 的类型声明在 `lib.dom.d.ts` 中，大致是这样的：

```ts
declare function fetch(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtVJAzAAsAKAKHni1QAdkMAueAJRAEdkQBnDASVSIcAGmqosGAPzM2nHv3EZh5AJTMACjBwBbLNxAAeNt1p59APgDc5IA)

所以你可以这样写 `checkedFetch` 函数：

```ts
async function checkedFetch(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init)
  if (!response.ok) {
    // An exception becomes a rejected Promise in an async function.
    throw new Error(`Request failed: ${response.status}`)
  }
  return response
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/IYZwngdgxgBAZgV2gFwJYHsIygCwKZQDWeAJgGJ7K4AUqEADgsgFwwBKeAjgniMgJIQ46ADQw6qZAH5WHbrwERJAShgBvAFAxsmPjABOverrwwAvDGAB3YJPiUadRsjETkygNxbxcGNQCEhiDGECB4AHTohKqa2toA9PEwAIJYeAAeUHj0aJgwAEYE6AC2vJYGeABWBMikMAAK+iWoYeJYwO3g0PBIULkQ4d7ayDhNVjAQeOMAovpN+tQABnI8enC2ADakrAAkakEhYeF8wMgIIAC+i57eF96GZ-pYByZed0A)

这样写是可以的，但其实还能更简洁一些：

```ts
const checkedFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init)
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMAWBTYBrRATAYoqCBcMUAngA6IgBmMFOCMAvDAIYRFjAwAUAlmCQK5QANDF7coASgYA+GAG8AUDDjhoMAE6IIJVYgbMA7k3HVa8Hn0EixkgNxLRVTgEJN23QDoQKKYuXKoeHUQAxgwRFCAUXVg9U4AAwAlRABHfi1YCmMAGwwCABI5Nx1IRA9oJih+CABfeIl7ZRqHTSr1MA0tEohEe2agA)

我们把函数声明改成了函数表达式，并且给整个函数加上了一个类型（`typeof fetch`）。这样 TypeScript 就能自动推断出 `input` 和 `init` 参数的类型了。

这个类型注解还能保证 `checkedFetch` 的返回类型和 `fetch` 一样。比如你要是写成了 `return` 而不是 `throw`，TypeScript 就会发现这个错误：

```ts
const checkedFetch: typeof fetch = async (input, init) => {
  //  ~~~~~~~~~~~~
  //  'Promise<Response | HTTPError>' is not assignable to 'Promise<Response>'
  //    Type 'Response | HTTPError' is not assignable to type 'Response'
  const response = await fetch(input, init)
  if (!response.ok) {
    return new Error('Request failed: ' + response.status)
  }
  return response
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMAWBTYBrRATAYoqCBcMUAngA6IgBmMFOCMAvDAIYRFjAwAUAlmCQK5QANDF7coASgYA+GAG8AUDBgB6FcoB+W7Tq1LV6mAHIACgCcQAW24REAHgBKiCCXC2YAHxgAJACq+TAFEzCzNpI1EIGDAQWBYIbgBzMCYAIwAbREIQY3MrG3snFzdEcP01ZWVfUiyjItdILK8-AODQiJto2OYIBOS0zOzCGuN6kqN9UEhYM2cG90YmAHcmcWpaeB4+QRExSQBufW4qTgBCWeLGgDoQFClFSphZqH4zMGjEJZg2kDNOOsQAEd+M5YBRVpl0AQIgBqJ5zEpXaBMF4QCSHZQAX30z1e7wu80Qh2xQA)

在第一个例子中，犯同样的错误可能会导致错误发生在调用 `checkedFetch` 的地方，而不是在实现中。除了更加简洁外，给整个函数表达式加类型，而不是单独给参数加类型，还能提供更好的安全性。

如果你想匹配另一个函数的参数类型，但改变返回类型怎么办？可以使用剩余参数和内置的 `Parameters` 工具类型来实现：

```ts
async function fetchANumber(
  ...args: Parameters<typeof fetch>
): Promise<number> {
  const response = await checkedFetch(...args)
  const num = Number(await response.text())
  if (isNaN(num)) {
    throw new Error(`Response was not a number.`)
  }
  return num
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMAWBTYBrRATAYoqCBcMUAngA6IgBmMFOCMAvDAIYRFjAwAUAlmCQK5QANDF7coASgYA+GAG8AUDBgB6FcoB+W7Tq1LV6mAHIACgCcQAW24REAHgBKiCCXC2YAHxgAJACq+TAFEzCzNpI1EIGDAQWBYIbgBzMCYAIwAbREIQY3MrG3snFzdEcP01ZWVfUiyjItdILK8-AODQiJto2OYIBOS0zOzCGuN6kqN9UEhYM2cG90YmAHcmcWpaeB4+QRExSQBufW4qTgBCWeLGgDoQFClFSphZqH4zMGjEJZg2kDNOOsQAEd+M5YBRVpl0AQIgBqJ5zEpXaBMF4QCSHZQAX30z1e7wu80Qh2xLDYHAo-HYUG44HWuHgAEEAHL8SypRB-fTKK48phmRIQAgmPlMSw4DkQOzEMiUOkIaQKCRCizWWx2MCs9lheSTNwzBGNBjMFZrBDINBYDacHlXPkC9G66bRVlGllsjmcZarfWXWxXKCIAAeUE4EgdymOXBsTKYTM4GssYZ1jyg8AsXzAn2+IV+nAABmNDSsojE4s73WYrnnwzBscpcW9y8SFEA)

如果你在编辑器中查看 `fetchANumber`，你会发现 `args` 根本不会出现。它被 `fetch` 的参数名所替代，这正是你想要的效果：

```ts
fetchANumber
// ^? function fetchANumber(
//      input: RequestInfo | URL, init?: RequestInit | undefined
//    ): Promise<number>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMAWBTYBrRATAYoqCBcMUAngA6IgBmMFOCMAvDAIYRFjAwAUAlmCQK5QANDF7coASgYA+GAG8AUDBgB6FcoB+W7Tq1LV6mAHIACgCcQAW24REAHgBKiCCXC2YAHxgAJACq+TAFEzCzNpI1EIGDAQWBYIbgBzMCYAIwAbREIQY3MrG3snFzdEcP01ZWVfUiyjItdILK8-AODQiJto2OYIBOS0zOzCGuN6kqN9UEhYM2cG90YmAHcmcWpaeB4+QRExSQBufW4qTgBCWeLGgDoQFClFSphZqH4zMGjEJZg2kDNOOsQAEd+M5YBRVpl0AQIgBqJ5zEpXaBMF4QCSHZQAX30z1e7wu80Qh2xLDYHAo-HYUG44HWuHgAEEAHL8SypRB-fTKK48phmRIQAgmPlMSw4DkQOzEMiUOkIaQKCRCizWWx2MCs9lheSTNwzBGNBjMFZrBDINBYDacHlXPkC9G66bRVlGllsjmcZarfWXWxXKCIAAeUE4EgdymOXBsTKYTM4GssYZ1jyg8AsXzAn2+IV+nAABmNDSsojE4s73WYrnnwzBscpcW9y8SFDR6czNRyFBUAHoAfmolOA1NprYQ7YrnC7hkevAEUAITmBoIAkmAKDkvABVBwAGV2YHEvYXQJB0FXay8lPQiAovAwU8eSpgeVV9gTWoVQA)

这里的语法比直接给整个函数加类型稍微复杂一些。你可以根据实际情况判断，是直接写出参数类型更好，还是使用这种方法。第 62 条将讨论在泛型类型中使用剩余参数。

不管你是否意识到，每当你把回调函数传递给另一个函数时，你都会受益于这种技术。例如，当你使用 `Array` 的 `map` 或 `filter` 方法时，TypeScript 能够推断出回调函数参数的类型，并将该类型应用到你的函数表达式中。有关类型推断中如何使用上下文的信息，请参见第 24 条。

当你编写一个与另一个函数具有相同类型签名的函数，或者写很多具有相同类型签名的函数时，考虑是否可以给整个函数加类型声明，而不是重复写参数和返回值的类型。这里的“很多”和“重复”很重要。不要过度使用！并不是每个函数都需要提取类型。对于常见的、具有独特类型签名的单个独立函数，传统的函数声明就足够了。当有多个具有相同或相关类型签名的函数时，使用函数类型会更合适。

## 关键点总结

- 考虑给整个函数表达式加类型注解，而不是单独给参数和返回类型加注解。
- 如果你重复写相同的类型签名，可以提取出一个函数类型，或者寻找一个现有的类型。
- 如果你是库的作者，提供常用回调函数的类型。
- 使用 `typeof fn` 来匹配另一个函数的签名，或者如果需要改变返回类型，可以使用 `Parameters` 和剩余参数。

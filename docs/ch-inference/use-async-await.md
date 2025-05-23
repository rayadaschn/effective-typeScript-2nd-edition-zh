# 第 27 条：使用 async 函数替代回调以改善类型推导

## 要点

- 为了更好的组合性和类型转换，优先使用 Promises 而非回调函数。
- 尽可能使用 `async` 和 `await` 替代原始的 Promises，它们可以生成更简洁、直接的代码，并消除一类常见的错误。
- 如果一个函数返回 Promise，声明该函数为 `async`。

## 正文

经典的 JavaScript 用回调函数来处理异步操作，这就产生了臭名昭著的“回调地狱”（也叫“死亡金字塔”）：

```ts
declare function fetchURL(
  url: string,
  callback: (response: string) => void
): void

fetchURL(url1, function (response1) {
  fetchURL(url2, function (response2) {
    fetchURL(url3, function (response3) {
      // ...
      console.log(1)
    })
    console.log(2)
  })
  console.log(3)
})
console.log(4)

// Logs:
// 4
// 3
// 2
// 1
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAkEkBEFECgDGB7AdgZwC6gK4CcAbARlAF5QByIigbiTS10ICYzLnb6Nt8CBmNhT6cQoWADlo8ACYBTRAQCGeWaABmOVIkwBLNOtmZEACwCqAJQAyACnigmBAFygseHagDmAGlCJFBAgAjRUQAa2drFXQABwZZZ1d3DwBKMgA+UAA3ZB1peGTnbNy6eDVDEwsbXiIfDS1dNEjZGLiiVIBvOwMjMytrXmZazW09VCaWjFlmDq77Mp7K-sI+IfrR8djJvhn7XdBRADoj2d2UDGQCWQOCZA9rNro9gF9kx9OGC6ubu+m3l7ezuhPtdbtZtnR-lwgZcQXcACyveDwUSWW7oRzIsBwzGgPg45g4ojwIA)

这段代码嵌套层级很深，而且从日志可以看到，执行顺序和代码顺序正好相反，导致回调代码难以阅读。如果你想并行执行请求或者遇错就中止，代码会变得更加复杂和混乱。

ES2015 引入了 Promise 的概念，用来打破“回调地狱”。Promise 表示未来某个时间点会得到的结果（有时也叫“未来值”）。下面是用 Promise 改写的同样代码：

```ts
const page1Promise = fetch(url1)
page1Promise
  .then((response1) => {
    return fetch(url2)
  })
  .then((response2) => {
    return fetch(url3)
  })
  .then((response3) => {
    // ...
  })
  .catch((error) => {
    // ...
  })
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAkEkBEFECgDGB7AdgZwC6gK4CcAbARlAF5QByIigbiTS10ICYzLnb6Nt8CBmNhT6cQoWADlo8ACYBTRAQCGeWaABmOVIkwBLNOtmZEACwCqAJQAyACnigmBAFygseHagDmAGlCJFBAgAjRUQAa2drFXQABwZZZ1d3DwBKMgA+UAA3ZB1peGTnbNy6eDVDEwsbXiIfDS1dNEjZGLiiVIBvOwMjMytrXmZazW09VCaWjFlmDq77Mp7K-sI+IfrR8djJvhn7XdBRADoj2d2UDGQCWQOCZA9rNro9gF9kx9OGC6ubu+m3l7ezuhPtdbtZtnR-lwgZcQXcACyveDwUSWW7oRzIsBwzGgPg45g4ohQ7DRRQeWREAAKeGQAFsdOhVOR5iYlsREaTyVSafTGQdMMZZGMoptGSRSBlOvYVJh8KhuqyBoiXvzBcLmqKpulQFLQDK5QrjGzwfAVQKhRs4gIJTquodjiq-D1rLI8DS8NrdfaDqbEUA)

现在代码嵌套更少，执行顺序也更贴近代码顺序。错误处理更容易集中管理，还能方便地使用像 `Promise.all` 这样的高级工具。

ES2017 引入了 `async` 和 `await` 关键字，让代码写得更简洁明了：

```ts
async function fetchPages() {
  const response1 = await fetch(url1)
  const response2 = await fetch(url2)
  const response3 = await fetch(url3)
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAkEkBEFECgDGB7AdgZwC6gK4CcAbARlAF5QByIigbiTS10ICYzLnb6Nt8CBmNhT6cQoWADlo8ACYBTRAQCGeWaABmOVIkwBLNOtmZEACwCqAJQAyACnigmBAFygseHagDmAGlCJFBAgAjRUQAa2drFXQABwZZZ1d3DwBKMgA+UAA3ZB1peGTnbNy6eDVDEwsbXiIfDS1dNEjZGLiiVIBvOwMjMytrXmZazW09VCaWjFlmDq77Mp7K-sI+IfrR8djJvhn7XdBRADoj2d2UDGQCWQOCZA9rNro9gF9kx9OGC6ubu+m3l7ezuhPtdbtZtnR-lwgZcQXcACyveDwUSWW7oRzIsBwzGgPg45g4ojwRToACeWnUwwaqG6JgACooPM1rDtfAxsFFNuhZCRyIoAO6KHTYeYmJbERH2QEc5pcqZsAVCkXlYzi35daWgTlxAR8wXC2mq3jgrqHY5PeBAA)

`await` 关键字会暂停 `fetchPages` 函数的执行，直到每个 Promise 解决（resolve）。在 `async` 函数内部，如果等待的 Promise 被拒绝（reject），它会抛出异常。这样你就可以用常规的 `try/catch` 来处理错误了：

```ts
async function fetchPages() {
  try {
    const response1 = await fetch(url1)
    const response2 = await fetch(url2)
    const response3 = await fetch(url3)
    // ...
  } catch (e) {
    // ...
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAkEkBEFECgDGB7AdgZwC6gK4CcAbARlAF5QByIigbiTS10ICYzLnb6Nt8CBmNhT6cQoWADlo8ACYBTRAQCGeWaABmOVIkwBLNOtmZEACwCqAJQAyACnigmBAFygseHagDmAGlCJFBAgAjRUQAa2drFXQABwZZZ1d3DwBKMgA+UAA3ZB1peGTnbNy6eDVDEwsbXiIfDS1dNEjZGLiiVIBvOwMjMytrXmZazW09VCaWjFlmDq77Mp7K-sI+IfrR8djJvhn7XdBRADoj2d2UDGQCWQOCZA9rNro9gF9kx9OGC6ubu+m3l7ezuhPtdbtZtnR-lwgZcQXcACyveDwUSWW7oRzIsBwzGgPg45g4ojwRToACeWnUwwaqG6JgACooPM1rDtQJg8KTQJ09oDsFFNuhZCRyIoAO6KHTYeYmJbERE8hh85oCqZsMUSqXlYyy34nXmgflxAQi8WS2na3jgk6HY72J6+RQ9UDWWSs+w2g5dJ7wb1AA)

和异常一样，TypeScript 中的 Promise 拒绝（rejection）也是无类型的。

`async` 和 `await` 被所有现代 JavaScript 运行环境支持，但即使你编译到 ES5 或更早版本，TypeScript 编译器也会做复杂的转换让它们能正常工作。换句话说，无论你的运行环境如何，用 TypeScript 都能用 `async/await`。

相比回调，推荐使用 Promise 或 `async/await` 有几个好处：

- Promise 比回调更容易组合（组合多个异步操作更方便）。
- 类型信息更容易在 Promise 中转换，而回调中类型转换更难。

比如你想并行请求多个页面，可以用 `Promise.all` 来组合 Promise：

```ts
async function fetchPages() {
  const [response1, response2, response3] = await Promise.all([
    fetch(url1),
    fetch(url2),
    fetch(url3),
  ])
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAkEkBEFECgDGB7AdgZwC6gK4CcAbARlAF5QByIigbiTS10ICYzLnb6Nt8CBmNhT6cQoWADlo8ACYBTRAQCGeWaABmOVIkwBLNOtmZEACwCqAJQAyACnigmBAFygseHagDmAGlCJFBAgAjRUQAa2drFXQABwZZZ1d3DwBKMgA+UAA3ZB1peGTnbNy6eDVDEwsbXiIfDS1dNEjZGLiiVIBvOwMjMytrXmZazW09VCaWjFlmDq77Mp7K-sI+IfrR8djJvhn7XdBRADoj2d2UDGQCWQOCZA9rNro9gF9kx9OGC6ubu+m3l7ezuhPtdbtZtnR-lwgZcQXcACyveDwUSWW7oRzIsBwzGgPg45g4ojwRToACeWnUwwaqG6JgACooPM1rDtfAxsABtKKbdCyGqgblxQYC5o82R8AC6bEUAHdFDpsHS8MgALY6XkHfwEawck7zExLYjJWrlYyG6YmnqG7ZdCWI+yHY5PeBAA)

在这种情况下，用解构赋值配合 `await` 特别方便。
TypeScript 能自动推断出这三个响应变量的类型都是 `Response`。

而用回调来实现并发请求，代码会更复杂，还得写类型注解：

```ts
function fetchPagesWithCallbacks() {
  let numDone = 0
  const responses: string[] = []
  const done = () => {
    const [response1, response2, response3] = responses
    // ...
  }
  const urls = [url1, url2, url3]
  urls.forEach((url, i) => {
    fetchURL(url, (r) => {
      responses[i] = url
      numDone++
      if (numDone === urls.length) done()
    })
  })
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAkEkBEFECgDGB7AdgZwC6gK4CcAbARlAF5QByIigbiTS10ICYzLnb6Nt8CBmNhT6cQoWADlo8ACYBTRAQCGeWaABmOVIkwBLNOtmZEACwCqAJQAyACnigmBAFygseHagDmAGlCJFBAgAjRUQAa2drFXQABwZZZ1d3DwBKMgA+UAA3ZB1peGTnbNy6eDVDEwsbXiIfDS1dNEjZGLiiVIBvOwMjMytrXmZazW09VCaWjFlmDq77Mp7K-sI+IfrR8djJvhn7XdBRADoj2d2UDGQCWQOCZA9rNro9gF9kx9OGC6ubu+m3l7ezuhPtdbtZtnR-lwgZcQXcACyveDwUSWW7oRzIsBwzGgPg45g4oilYYNVDdEwABUUHmaAHUdJhjABhfxBEKhdDWHagS7YVA4AC20DQqnIAAYAQxsFFNuhmglMG5PABtAC6bDVku4oGkIrYXPSoE6e0B2GVMtaPgtk0GoGtcr46vI9uab3sh2O9ieWsYvHQGuqPgGQeWqrefoOamQeFgIWM1iWBB8OlSpAyxt28wqfV4VsNGb2LvQyp0Tocbt2-KFIoA1DWK-YdGpQNYq8LUKLSOQI5dPIzUrqO1yK5CvYinvAgA)

扩展到包含错误处理，或者做到像 `Promise.all` 那样通用，难度会比较大。

类型推断对 `Promise.race` 也很友好——它会在第一个输入的 Promise 解决（resolve）时完成。你可以用它来给 Promise 添加通用的超时功能：

```ts
function timeout(timeoutMs: number): Promise<never> {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject('timeout'), timeoutMs)
  })
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  return Promise.race([fetch(url), timeout(timeoutMs)])
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAkEkBEFECgDGB7AdgZwC6gK4CcAbARlAF5QByIigbiTS10ICYzLnb6Nt8CBmNhT6cQoWADlo8ACYBTRAQCGeWaABmOVIkwBLNOtmZEACwCqAJQAyACnigmBAFygseHagDmAGlCJFBAgAjRUQAa2drFXQABwZZZ1d3DwBKMgA+UAA3ZB1peGTnbNy6eDVDEwsbXiIfDS1dNEjZGLiiVIBvOwMjMytrXmZazW09VCaWjFlmDq77Mp7K-sI+IfrR8djJvhn7XdBRADoj2d2UDGQCWQOCZA9rNro9gF9kx9OGC6ubu+m3l7ezuhPtdbtZtnR-lwgZcQXcACyveDwUSWW7oRzIsBwzGgPg45g4oilYYNVCgXQAW1kyBwmGslOptIAsujQKgcBTArI8AVQAAFPDICk6dCyAA8qFkmW5GU69hUmHwZMlAHd+YLhaLrOMLtKfCoAFbyTCpUiyk4uQwAFR0VJpdOspoyhuN1goDPtFGSPg9zPQiPskKeSMU6AAnlp1CTRt0TAB1HSYYw2u20pZOFyYNyeH22xmYFnOdmc7k7UAKpXqoUiq54EKyawAbXmJnT3vJeft9M7fuSAF1EcGgA)

函数 fetchWithTimeout 的返回类型被推断为 `Promise<Response>`，所以不需要写类型注解。这里为什么会这样挺有意思的：`Promise.race` 的返回类型是它输入类型的联合，在这个例子里是 `Promise<Response | never>`。但和 never（空集合）做联合其实没影响，所以会简化成 `Promise<Response>`。在处理 Promise 时，TypeScript 会自动帮你推断出正确的类型。

有时候你可能得用原生 Promise，特别是当你包装像 setTimeout 这样的回调 API。但如果可以选择，通常建议用 `async/await` 替代原生 Promise，原因有两个：

1. 代码更简洁明了。
2. async 函数保证一定返回 Promise。

这个特性可以帮你避免一些容易混淆的 bug。根据定义，async 函数总是返回 Promise，即使里面没有用 await。TypeScript 能帮你理解这一点：

```ts
async function getNumber() {
  return 42
}
//             ^? function getNumber(): Promise<number>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAkEkBEFECgDGB7AdgZwC6gK4CcAbARlAF5QByIigbiTS10ICYzLnb6Nt8CBmNhT6cQoWADlo8ACYBTRAQCGeWaABmOVIkwBLNOtmZEACwCqAJQAyACnigmBAFygseHagDmAGlCJFBAgAjRUQAa2drFXQABwZZZ1d3DwBKMgA+UAA3ZB1peGTnbNy6eDVDEwsbXiIfDS1dNEjZGLiiVIBvOwMjMytrXmZazW09VCaWjFlmDq77Mp7K-sI+IfrR8djJvhn7XdBRADoj2d2UDGQCWQOCZA9rNro9gF9kx9OGC6ubu+m3l7ezuhPtdbtZtnR-lwgZcQXcACyveDwUSWW7oRzIsBwzGgPg45g4ojwRToACeWnUwwaqFAHkM4hwAFtArI8NYOqAVJh8DS4cwaKAnji9iLdgA9AD8lLW+jpmAZzNZ7OcAAU8MhGTp0LIADyoJksvBpeBAA)

你也可以用异步箭头函数：

```ts
const getNumber = async () => 42
//    ^? const getNumber: () => Promise<number>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAkEkBEFECgDGB7AdgZwC6gK4CcAbARlAF5QByIigbiTS10ICYzLnb6Nt8CBmNhT6cQoWADlo8ACYBTRAQCGeWaABmOVIkwBLNOtmZEACwCqAJQAyACnigmBAFygseHagDmAGlCJFBAgAjRUQAa2drFXQABwZZZ1d3DwBKMgA+UAA3ZB1peGTnbNy6eDVDEwsbXiIfDS1dNEjZGLiiVIBvOwMjMytrXmZazW09VCaWjFlmDq77Mp7K-sI+IfrR8djJvhn7XdBRADoj2d2UDGQCWQOCZA9rNro9gF9kx9OGC6ubu+m3l7ezuhPtdbtZtnR-lwgZcQXcACyveDwUSWW7oRzIsBwzGgPg45g4ohQ7AeQziHAAW0CsjwbEU6AAnlpQNZUqQMnDmHRRLsAHoAfl8DBJZMp1LwETZGQACnhkBSdOhZAAeVBimlpeBAA)

等价的原生 Promise 写法是：

```ts
const getNumber = () => Promise.resolve(42)
//    ^? const getNumber: () => Promise<number>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAkEkBEFECgDGB7AdgZwC6gK4CcAbARlAF5QByIigbiTS10ICYzLnb6Nt8CBmNhT6cQoWADlo8ACYBTRAQCGeWaABmOVIkwBLNOtmZEACwCqAJQAyACnigmBAFygseHagDmAGlCJFBAgAjRUQAa2drFXQABwZZZ1d3DwBKMgA+UAA3ZB1peGTnbNy6eDVDEwsbXiIfDS1dNEjZGLiiVIBvOwMjMytrXmZazW09VCaWjFlmDq77Mp7K-sI+IfrR8djJvhn7XdBRADoj2d2UDGQCWQOCZA9rNro9gF9kx9OGC6ubu+m3l7ezuhPtdbtZtnR-lwgZcQXcACyveDwUSWW7oRzIsBwzGgPg45g4ohQ7AeQziHAAW0CsjwbGsqVIGQACnhkBSdOgrlELplZNY4b8cbsAHoAfl8DBJZMp1LwEQZzNZ7M5AB5UDKaWl4EA)

虽然看起来立即可用的值返回 Promise 有点奇怪，但这其实帮助保证了一个重要规则：一个函数要么始终同步执行，要么始终异步执行，不能两者混用。

为了演示违反这条规则可能引发的混乱，我们试着给 fetch URL 的函数加个缓存：

```ts
// Don't do this!
const _cache: { [url: string]: string } = {}
function fetchWithCache(url: string, callback: (text: string) => void) {
  if (url in _cache) {
    callback(_cache[url])
  } else {
    fetchURL(url, (text) => {
      _cache[url] = text
      callback(text)
    })
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAkEkBEFECgDGB7AdgZwC6gK4CcAbARlAF5QByIigbiTS10ICYzLnb6Nt8CBmNhT6cQoWADlo8ACYBTRAQCGeWaABmOVIkwBLNOtmZEACwCqAJQAyACnigmBAFygseHagDmAGlCJFBAgAjRUQAa2drFXQABwZZZ1d3DwBKMgA+UAA3ZB1peGTnbNy6eDVDEwsbXiIfDS1dNEjZGLiiVIBvOwMjMytrXmZazW09VCaWjFlmDq77Mp7K-sI+IfrR8djJvhn7XdBRADoj2d2UDGQCWQOCZA9rNro9gF9kx9OGC6ubu+m3l7ezuhPtdbtZtnR-lwgZcQXcACyveDwUSWW7oRzIsBwzGgPg45g4og46BoCjYaTIUCYYw6dAAQih2AA+n4TPFQO0ANq8BKYNyeAC6vP5HiebHaTzodRG+nmJgA6jpqQBhELGWRLJwuPlJHx+ALBMIRTCyAAemGFSVSpAyRWkO1AOjUoE1jtQoBZatkDvs+qCIVC1k9bO5hAFiPsYtkBHQqk6ezlvSqhB8JvN6Q5J3swfVoYIArYacwbz2fsNgaLEd2kMj8Ce8CAA)

虽然立即调用回调看起来像是一种优化，但这会让调用这个函数的代码变得非常难用：

```ts
let requestStatus: 'loading' | 'success' | 'error'
function getUser(userId: string) {
  fetchWithCache(`/user/${userId}`, (profile) => {
    requestStatus = 'success'
  })
  requestStatus = 'loading'
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAkEkBEFECgDGB7AdgZwC6gK4CcAbARlAF5QByIigbiTS10ICYzLnb6Nt8CBmNhT6cQoWADlo8ACYBTRAQCGeWaABmOVIkwBLNOtmZEACwCqAJQAyACnigmBAFygseHagDmAGlCJFBAgAjRUQAa2drFXQABwZZZ1d3DwBKMgA+UAA3ZB1peGTnbNy6eDVDEwsbXiIfDS1dNEjZGLiiVIBvOwMjMytrXmZazW09VCaWjFlmDq77Mp7K-sI+IfrR8djJvhn7XdBRADoj2d2UDGQCWQOCZA9rNro9gF9kx9OGC6ubu+m3l7ezuhPtdbtZtnR-lwgZcQXcACyveDwUSWW7oRzIsBwzGgPg45g4og46BoCjYaTIUCYYw6dAAQih2AA+n4TPFQO0ANq8BKYNyeAC6vP5HiebHaTzodRG+nmJgA6jpqQBhELGWRLJwuPlJHx+ALBMIRTCyAAemGFSVSpAyRWkO1AOjUoE1jtQoBZatkDvs+qCIVC1k9bO5hAFiPsYtkBHQqk6ezlvSqhB8JvN6Q5J3swfVoYIArYacwbz2fsNgaLEd2kMj8Ce8Eu2BUAEccM1MABlTCKTA4dGUG6KaRJCigAA+lHQOEQiGa6FHE4osjweGQeE40oa7o8hlMsbw-X3kGkls8DsTipVXusAANgH3l8AACTtB94Y9PG8+aKrtQ6S4ZvGuwtm2WBdj2faCFOM5zpwkZViB7bgb26CCIOw6eJw9ZAA)

调用 `getUser` 后，`requestStatus` 的值会是什么？这完全取决于 profile 是否有缓存。如果没有缓存，`requestStatus` 会被设置成 “success”；如果有缓存，先被设置成 “success”，然后又被改回 “loading”。哎呀！

用 `async` 来写这两个函数，可以保证行为一致：

```ts
const _cache: { [url: string]: string } = {}
async function fetchWithCache(url: string) {
  if (url in _cache) {
    return _cache[url]
  }
  const response = await fetch(url)
  const text = await response.text()
  _cache[url] = text
  return text
}

let requestStatus: 'loading' | 'success' | 'error'
async function getUser(userId: string) {
  requestStatus = 'loading'
  const profile = await fetchWithCache(`/user/${userId}`)
  requestStatus = 'success'
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBA+sAhsAFgUwFwwN4G0CuATgDZbSECWYA5gLplSU0C+MAvDswNwBQiEATzDAYAM3zCoFcGLRRUAdQpQUAYWToAFEVIxyVagEocPGDAqiY2kubDwkqNMeymzMQnKJ2EGtARK0vGbMrqCQsB4QAA7gEGjsMIgA7ojKsvIo1sSGQTBh0DBQaAAesBzJqRFo0bFoAHRFpZo5rj6O-sS0CY1QuR5QXoUlvTwhPMRy7mgAjvjVUADKUIgDEFgA5MQgiAAmBuswAD4w6xD4wMDVEAfH62iEhCCE67z8QiLiktJ21HIAqnFCNpAQBJHYMJhGExmDyzeZLFb4CAJTbbPY0F6hWKwKKPUQUCYJCppURyRTKNS+TQAAwA9Ej7rSACTYBmEMHMaktGEzObQBGrFFnC5XTEhIA)

现在很清楚，requestStatus 最终一定是 “success”。用回调或原生 Promise，很容易不小心写出半同步的代码，但用 async 就很难犯这个错误。

注意，如果你从 `async` 函数里返回一个 Promise，它不会被再包一层 Promise：返回类型是 `Promise<T>`，而不是 `<Promise<Promise<T>>`。TypeScript 会帮你理解这个道理：

```ts
async function getJSON(url: string) {
  const response = await fetch(url)
  const jsonPromise = response.json()
  return jsonPromise
  //     ^? const jsonPromise: Promise<any>
}
getJSON
// ^? function getJSON(url: string): Promise<any>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/IYZwngdgxgBAZgV2gFwJYHsIwOYFNkBSAygPIByAFAgE4A2AXDCMtahNgJQwDeAUDDCiZmMarhAAHYbhgBeGMADuwVMnj4oACyp0OAbn6DhagFYhMABWroAtqhAz5YydIB0ZzBX2GxyGlg8IK1t7XAMBAHoIgRiAPQB+IwgRQOC7B0Y00IAeYAgwAD5eAF9ePEJSMl4omAT4JCg0TBx8YnIdBiYWNk5M63TcXPyioA)

## 关键点总结

- 为了更好的组合性和类型转换，优先使用 Promises 而非回调函数。
- 尽可能使用 `async` 和 `await` 替代原始的 Promises，它们可以生成更简洁、直接的代码，并消除一类常见的错误。
- 如果一个函数返回 Promise，声明该函数为 `async`。

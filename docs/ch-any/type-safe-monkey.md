# 第 47 条：优先使用类型安全的方法进行 Monkey Patching

JavaScript 最著名的特性之一是其对象和类是"开放的"，这意味着你可以向它们添加任意属性。这有时被用来通过在 `window` 或 `document` 上赋值来创建全局变量：

```ts
window.monkey = 'Tamarin'
document.monkey = 'Howler'
```

或者将数据附加到 DOM 元素上：

```ts
const el = document.getElementById('colobus')
el.home = 'tree'
```

在运行时向内置对象添加属性被称为"monkey patching"，在使用 jQuery 或 D3 的代码中特别常见。

你甚至可以向内置对象的原型附加属性，有时会产生令人惊讶的结果：

```ts
RegExp.prototype.monkey = 'Capuchin'
// 'Capuchin'
/123/.monkey
// 'Capuchin'
```

这些方法通常不是好的设计。当你将数据附加到 `window` 或 DOM 节点时，你实际上是在将其变成全局变量。这使得在程序的远距离部分之间很容易无意中引入依赖关系，并且意味着每次调用函数时都必须考虑副作用。在严格模式之外，JavaScript 使引入全局变量变得非常容易：只需在赋值时去掉 `let`、`var` 或 `const`。

添加 TypeScript 会引入另一个问题：虽然类型检查器知道 `Document` 和 `HTMLElement` 的内置属性，但它肯定不知道你添加的属性：

```ts
document.monkey = 'Tamarin'
//       ~~~~~~ Property 'monkey' does not exist on type 'Document'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYewxgrgtgpgdgFwHRRHA1jAngAgLw4DkAKgIZSkBOAlnIQNwBQA9MzuxzgH4+84AKlEAAcYlBLkKoM2QjlAwAzjjggEOGAA9qi9WhwTRRACLho8BIUZA)

修复此错误最直接的方法是使用 `any` 断言：

```ts
;(document as any).monkey = 'Tamarin' // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/BQEw9gxgrgtgpgOwC4AICGBndCCeBKAOhjAQGs4cUBeFAcgBU0Y0AnASwVoG4UUB6PigDyAaQBQQA)

这满足了类型检查器，但正如现在应该不令人惊讶的那样，它有一些缺点。与任何使用 `any` 的情况一样，你失去了类型安全和语言服务：

```ts
;(document as any).monky = 'Tamarin' // Also OK, misspelled
;(document as any).monkey = /Tamarin/ // Also OK, wrong type
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/BQEw9gxgrgtgpgOwC4AICGBndCCeBKAOhjAQGscUBeFAcgBU0Y0AnASwRoG4UUB6XlAEEANhjAoA8gGkANChisMGAA5xhwuCABQoSLESpM2fERKk4FarwZM2CXtz4CRYybJQB3ZiQDmKJDiqWkA)

最好的解决方案是将数据移出 `window`、`document` 或 DOM。但如果你不能这样做（也许你正在使用需要它的库，或者正在迁移 JavaScript 应用程序），那么 monkey patch 就是你环境的一部分（第 76 条），你应该用 TypeScript 来建模它。没有完美的方法来做到这一点，但 `as any` 为安全性和开发体验设定了低标准，有方法可以做得更好。

想象你正在构建一个 Web 应用程序，你有一个包含当前登录用户信息的对象。你通过 API 在页面加载时获取这个信息，并将其存储为全局变量，以便在代码中方便地访问：

```ts
interface User {
  name: string
}

document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('/api/users/current-user')
  const user = (await response.json()) as User
  window.user = user
  //     ~~~~ Property 'user' does not exist
  //          on type 'Window & typeof globalThis'.
})

// ... elsewhere ...
export function greetUser() {
  alert(`Hello ${window.user.name}!`)
  //                    ~~~~ Property 'user' does not exist on type Window...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgKoGdrIN4ChnIhwC2EAXMumFKAOYDcuAvrrgCYD2CArqeAHRw2bAKIA3COAAywKpOgAKAEQARAPIBZAMIdwksFI5CIbJQBpkcdAE8QCZAoCUyALwA+HPmQJdVZFAh0AAdfFBdLAHc4YDBkGAgwBAALBQByAHo4IOB07kwodHSeKADwAFo86FTHRgIfED9KqFcHOCiY-0CQhoh+ACt0XSdnKzR82uQI0E4I-iaWpon09IJVgD8NteQABSgOIOgwa2RUptTkTkDCDliIAA9ZMC9l1dfV3WQjg5OAdWmOCLIABkn2sBw4MGQtAANhwAEZwaEAFSSslS-GYNVYL34uOQEGhmAiSWgKFxGPuISgsRg3DsYGAH1oAQSGEUzjwBERhwUAAMABIE2HIAAk2CmIBmc3y-CIpCYAEJeViCC83uqNchNltdvtDsdTvlzpd0Ndbg8-B8vig-pKAeTmLggA)

类型错误出现是因为 TypeScript 不知道我们对全局对象的补丁。与其写 `(window as any)`，一个选择是使用扩展，这是 `interface` 的特殊能力之一（第 13 条）：

```ts
declare global {
  interface Window {
    /** The currently logged-in user */
    user: User
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgKoGdrIN4ChnIhwC2EAXMumFKAOYDcuAvrhAB4AOA9lGDiwBMICADZwoKWiK4AjOCJz5koSLEQoA6qAFcA7ooIEA9ACoTyACoALFAgCuUCeBEBPZNNq0IAgLShkdphQyCZGSgSB0BQY0IwELCxAA)

这告诉 TypeScript `Window` 有另一个它从内置 DOM 类型中不知道的属性。有了扩展，我们的代码通过了类型检查器：

```ts
document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('/api/users/current-user')
  const user = (await response.json()) as User
  window.user = user // OK
})

// ... elsewhere ...
export function greetUser() {
  alert(`Hello ${window.user.name}!`) // OK
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgKoGdrIN4ChnIhwC2EAXMumFKAOYDcuAvrhAB4AOA9lGDiwBMICADZwoKWiK4AjOCJz5koSLEQoA6qAFcA7ooIEA9ACoTyACoALFAgCuUCeBEBPZNNq0IAgLShkdphQyCZGSgSB0BQY0IwELIJc9qTgAHRwAgIAogBuEOAAMsBU+dAAFABEACIA8gCyAMJc4PlgBVwZ3hUANMhw6C4gCMhlAJTIALwAfAbICM1UyBLo3CCYk326cMB8MBBgCFZlAORGcBzARpFQ6Eb2jq0+18ejcXMLfNcbZXBbO0sQFYLCCpABW6GaY3G-TQQTeum0elSXwmAThxiMyBqAGlmK9cLgjJjUiTkBARJhdDYJMgSalWJweLs7EMwMBmshaBJ9jEoGNZvJoGAygADAAS5OkyAAJNgESAdLpkUFUkRSEwAIQi14YrG4lhAA)

这比使用 `any` 在几个方面有所改进：

- 你获得类型安全。类型检查器会标记拼写错误或错误类型的赋值。
- 你可以为属性附加文档（第 68 条）。
- 你在属性上获得自动完成和其他语言服务。
- 有关于 monkey patch 确切内容的记录。

扩展方法有一些问题。在全局变量在应用程序运行时设置的情况下（如 `user`），没有办法只在这发生之后引入扩展。这掩盖了我们代码中的竞态条件。如果我们在 `window.user` 设置之前调用 `greetUser()` 会发生什么？

为了避免这样的问题，你可能想要在全局变量中包含 `undefined` 作为可能性。这将强制你在访问 `user` 的任何地方处理 `user` 不可用的可能性：

```ts
declare global {
  interface Window {
    /** The currently logged-in user */
    user: User | undefined
  }
}

// ...
export function greetUser() {
  alert(`Hello ${window.user.name}!`)
  //             ~~~~~~~~~~~ 'window.user' is possibly 'undefined'.
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgKoGdrIN4ChnIhwC2EAXMumFKAOYDcuAvrgCYQIA2cUKtnAewBGcTjnzJQkWIhQB1UKwEB3cQQIB6AFRbkAFQAWKBAFcovcJwCeyQbVoRWAWlDITmKMi0aJBd9AoMLAAfNxB2GFBHRgIWFlwNDWQAOlTcCAAPAAcBKDBkGBMQBDBgARBkWl4IMCCoAAoASjVkUWgweoADAAkITkFkABJsZUUVZP8oZKJSJgBCTsaY5ET1NfXkAD9tnd3N5AByUfDxyYPJdGQc9HRgIWtDooio1gPk5lwgA)

这里在正确性和便利性之间存在权衡。

如果你的服务基础设施允许，这种特定情况的另一个解决方案是将 `user` 变量内联到页面的 HTML 中：

```html
<script type="text/javascript">
  window.user = { name: 'Bill Withers' }
</script>
<script src="your-code.js"></script>
```

这样你可以安全地移除 `undefined` 的可能性，因为 `user` 在你的任何代码运行之前已经被无条件设置，并且没有竞态条件的可能性。

扩展的另一个问题是，正如 `declare global` 所暗示的，它全局应用。你无法将其从代码的其他部分或库中隐藏。如果你的应用程序包含多个页面，而 `user` 只在其中一些页面上可用，全局扩展将无法准确建模。

不污染全局作用域的另一种方法是使用更窄的类型断言。而不是 `(window as any)`，我们可以定义另一个带有我们添加属性的类型：

```ts
type MyWindow = typeof window & {
  /** The currently logged-in user */
  user: User | undefined
}

document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('/api/users/current-user')
  const user = (await response.json()) as User
  ;(window as MyWindow).user = user // OK
})

// ...
export function greetUser() {
  alert(`Hello ${(window as MyWindow).user.name}!`)
  //             ~~~~~~~~~~~~~~~~~~~~~~~~~ Object is possibly 'undefined'.
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgKoGdrIN4ChnIhwC2EAXMumFKAOYDcuAvrmAJ4AOKAsmwOqgAJgHsA7sgC8yABTsuwmMlFCxASmQAyHPmQB6AFT7kAFQAWKBAFcoUCOAA2bZPeG1aEQQFpQyS5ijI+ro6ftAUGFgAPr4gghAwoB6MLLgiVqTgAHRwgoIAogBudmAAMsBUdtDSAEQAIgDy3ADCwuDFJcI5HtUANMhw6GwgCDLqEgB82gQIrVTItugcsyhScKJwwGDIMBBgCKbSAOS6cBzAuqFQ6LpWNsWel4eqjNOzW5eSMmsbWwtLIJhMgArdCtaSqdQDND+F4yZSxMT9dDIXgCBGiVSZD5SS70Ai6XTIeoAaWYz1wuAJyEyNNwEAAHksoFsYJZhmBgK1kLRbLsIlBwVN+vZoGBpAADAASEHsLmQABJsNJ4SJxFDUSoMVj-JkiKQmABCcXk-GEgjmi3mgB+NttdvtDrtRIARkCIAgtuVkEt0OhgM7HMhDmy4gkQB5DplmLggA)

TypeScript 对类型断言没问题，因为 `Window` 和 `MyWindow` 共享属性（第 9 条）。你在赋值中获得类型安全。作用域问题也更易于管理：没有对 `Window` 类型的全局修改，只是引入了一个新类型（只有在你导入它时才有作用域）。

缺点是每次引用 monkey-patched 属性时都必须写断言（或引入新变量）。你会想要强制执行没有人偷偷使用 `(window as any)`，也许使用 linter 规则。

但你可以把这一切当作鼓励重构为更结构化的东西。Monkey patching 不应该太容易！

## 要点回顾

- 优先使用结构化代码，而不是将数据存储在全局变量或 DOM 上。
- 如果必须将数据存储在内建类型上，使用类型安全的方法（如扩展或断言自定义接口）。
- 理解扩展的作用域问题。如果在运行时可能出现 `undefined`，则需要在类型中包含 `undefined`。

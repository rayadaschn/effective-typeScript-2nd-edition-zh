# Item 49: Track Your Type Coverage to Prevent Regressions in Type Safety

## 要点

- Even with `noImplicitAny` set, `any` types can make their way into your code either through explicit ++any++s or third-party type declarations (`@types`).
- Consider tracking how well-typed your program is using a tool like `type-coverage`. This will encourage you to revisit decisions about using `any` and increase type safety over time.
- 即使设置了 `noImplicitAny`，`any` 类型仍然可能通过显式的 `any` 或第三方类型声明（`@types`）进入你的代码中。
- 考虑使用诸如 `type-coverage` 之类的工具来跟踪你的程序的类型覆盖情况。这将鼓励你重新审视使用 `any` 的决策，并随着时间的推移提高类型安全性。

## 正文

```ts
function getColumnInfo(name: string): any {
  return utils.buildColumnInfo(appState.dataSchema, name) // Returns any
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBArlAlgGwjAvDA3gKBjAIzhQBMBhEZOAWzAEkwAzEACggC4YBDMATwBoYYLtQCmnaACdEYAOYBKTj17YAvvxyqA3DhKjgyLpNExko2FwAOlgMpQuUcdhgkHXG8AAWo6l05wwAGswEAB3MBhtHEYA4CRwGFlzCipaBmYWYTEJKGk5RW4+bDwYYyg4SQiEFAgAOiJSFJp6JlYrW3tHWtd7D29fQSzReS18AHoxmAAlcwrIQt5NHCA)

---

```ts
declare module 'my-module'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBArlAlgGwjAvDA3gKBjAIzhQBMBhEZOAWzAEkwAzEACggC4YBDMATwBoYYLtQCmnaACdEYAOYBKTj17YAvvxyqA3DhKjgyLpNExko2FwAOlgMpQuUcdhgkHXG8AAWo6l05wwAGswEAB3MBhtXX1DYxhqEBI4MxgAcmpeAFoEpLNUnSA)

---

```ts
import { someMethod, someSymbol } from 'my-module' // OK

const pt1 = { x: 1, y: 2 }
//    ^? const pt1: { x: number; y: number; }
const pt2 = someMethod(pt1, someSymbol) // OK
//    ^? const pt2: any
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBArlAlgGwjAvDA3gKBjAIzhQBMBhEZOAWzAEkwAzEACggC4YBDMATwBoYYLtQCmnaACdEYAOYBKTj17YAvvxyqA3DhKjgyLpNExko2FwAOlgMpQuUcdhgkHXG8AAWo6l05wwAGswEAB3MBhtHERqSxBJWCwIEDEAWXNPEBJBZLEbXmoCSlUYRkkUmAByal4AWmosuDNKrXwAejaYAHkAaRwcUEhYSygARgxnAA9OUcFeTgAmSJ0O-HwAPQB+GEHoGBHRziwYaaEaAlFJVvmzwsvW1QHwPZGlzFzRdKhMkhYDnJSonyhUo8laMFWvRwqzWWx2z2GUAWSj4OCAA)

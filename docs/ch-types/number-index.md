# Item 17: Avoid Numeric Index Signatures

## 要点

- 要知道数组本质上是对象，它们的键实际是字符串，不是数字。TypeScript 中的 `number` 索引签名只是为了帮你更好地捕获错误，属于类型层面的设计。
- 比起自己写带 `number` 索引签名，优先使用内置的 `Array`、元组、`ArrayLike` 或 `Iterable` 类型。

## 正文

```ts
interface Array<T> {
  // ...
  [n: number]: T
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgIJSnAngHgCoB8yA3gFDLID0lyAdPecgNogBcyIArgLYBG0AXXZ4A3KQC+pIA)

---

```ts
const xs = [1, 2, 3]
const x0 = xs[0] // OK
const x1 = xs['1'] // stringified numeric constants are also OK

const inputEl = document.getElementsByTagName('input')[0]
const xN = xs[inputEl.value]
//            ~~~~~~~~~~~~~ Index expression is not of type 'number'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAHhGBeGBtAjAGhgJmwZgF0BuAKFEljgAZl4JVqSYYB6VmAeQGlzxp46OglQBydKOZsO0AE4BLMAHN5AM3kBTACYwwAVwC2GhcBgVoAQzBREF2RpgWANhBBdefSjEUAHPVABRJzotEGBDDWsAOiUNQKcNI2sIACEATwAVCyUAOQsjAApRX39RAEpGEk8BOBzhBhL4qIA3Zz0NKvYWbp7ugD8BwaHBmABJMC0NOBgpn3sICHlwb0QwEFgQVRgoNJ8HUX0DACNjUSjSIA)

---

```ts
const keys = Object.keys(xs)
//    ^? const keys: string[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAHhGBeGBtAjAGhgJmwZgF0BuAKFElgGsBTAT0RQHkAjAKxuCgDpaGAKBAEoyAelExJMAHoB+GBWgw+EAFwAC6ACcAlmADmqQqSA)

---

```ts
function checkedAccess<T>(xs: ArrayLike<T>, i: number): T {
  if (i >= 0 && i < xs.length) {
    return xs[i]
  }
  throw new Error(`Attempt to access ${i} which is past end of array.`)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAHhGBeGBtAjAGhgJmwZgF0BuAKADMBXMYKAS3BmAAsBTYAa1YBMBBYYKwgQAPABUAfAAoEALhi8ATooCGATwAydLuInY68sJQC2AI1aKAlPLEwA3qRgw65GFLowJKAAwwAZH7OMCLwEAB0ADasYADmUMyW9o5OMIqsUJSKYKGodCTJAL7J8YogAO4wYKwVAKLKIIpSAAa8UFCsxgAOsFAgMCoCQogAJHZ0BTBlzHQszoidKtAw0dwwIK4qyuphTZakRUA)

---

```ts
const tupleLike: ArrayLike<string> = {
  '0': 'A',
  '1': 'B',
  length: 2,
} // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAHhGBeGBtAjAGhgJmwZgF0BuAKFEligFcAHAGwFMAZASwGtGAuGAQQCd+AQwCebTgB5o-VmADmAPmQwA3qRgwA5AAZNPTb02Z1W9Hq0AhIyabyoACx55SAX2IaA9B5gB5ANKkQA)

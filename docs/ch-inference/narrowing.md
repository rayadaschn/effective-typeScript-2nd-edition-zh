# 第 22 条: 理解类型收窄

## 要点

- 了解 TypeScript 如何基于条件语句和其他控制流缩小类型范围。
- 使用标记/区分联合类型和用户定义的类型保护来帮助缩小类型。
- 考虑是否可以重构代码，使 TypeScript 更容易跟随并推断类型。

## 正文

缩小类型（Narrowing），也叫“类型收窄”或“类型细化”，是指 TypeScript 将一个宽泛的类型缩小为更具体类型的过程。最常见的例子就是对 `null` 的检查。

```ts
const elem = document.getElementById('what-time-is-it')
//    ^? const elem: HTMLElement | null
if (elem) {
  elem.innerHTML = 'Party Time'.blink()
  // ^? const elem: HTMLElement
} else {
  elem
  // ^? const elem: null
  alert('No element #what-time-is-it')
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBApgGzgWxgXhgExMArsuMKAOgHM4oBRJAogIQE8BJTACgHIB3ACwEMoAtFACWBAcIjio7AJQBuAFAB6JTDUwAegH4YoSLEQoAXDAASAFQCyAGWopCsAD4wwuBAgXCAZjFaHkMjAA3gpq-sTCYGBwAE4WNugw7AAKvDFQDDDmonDsxABGCJEA1qzyoTAqmjp60PA0JvG2NA4KAL71EHDBFf4VVdq64HX+Jq7uFbxI6RwAciD19kQwAMQ8-EI54pLC0uVtCkA)

如果 `elem` 是 `null`，那么第一个分支里的代码就不会执行。所以在这个分支中，TypeScript 会把 `null` 从联合类型中排除掉，得到一个更具体、更好用的类型。这种根据代码执行路径来判断类型的能力，被称为**控制流分析**（control flow analysis）。TypeScript 的类型检查器通常很擅长在这种条件判断中“看懂”你的逻辑并自动缩小类型，但有时候会被“别名引用”（aliasing，见第 23 条）干扰。

注意同一个变量 `elem` 在代码的不同位置上，它的静态类型可能是不同的。这种特性在编程语言中比较少见，比如在 C++、Java、Rust 里，一个变量一旦声明就有固定的类型，要想“缩小类型”，只能新建一个变量。但在 TypeScript 里，**一个符号在不同代码位置可以有不同的类型**。学会利用这个特性，可以写出更简洁、更地道的 TypeScript 代码。

TypeScript 提供了很多方式来缩小类型。比如通过 `throw` 或 `return` 提前退出某个分支，就可以让剩下的代码中变量的类型变得更具体：

```ts
const elem = document.getElementById('what-time-is-it')
//    ^? const elem: HTMLElement | null
if (!elem) throw new Error('Unable to find #what-time-is-it')
elem.innerHTML = 'Party Time'.blink()
// ^? const elem: HTMLElement
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBApgGzgWxgXhgExMArsuMKAOgHM4oBRJAogIQE8BJTACgHIB3ACwEMoAtFACWBAcIjio7AJQBuAFAB6JTDUwAegH4YoSLEQoAXDAASAFQCyAGWopCsAD4wwuBAgXCAZjFYBCQ2QZGChuACcQThc4KMowiLCOAFUwXgAjJBCQGC9hMEwYAGIefiFROHFJYWl5BUDiPLA4MIsbdBh2AAVeMKgGGHNy9mIMvIBrVlqVTR09aHgaE1bbGgcFIA)

你也可以使用 `instanceof` 来判断类型：

```ts
function contains(text: string, search: string | RegExp) {
  if (search instanceof RegExp) {
    return !!search.exec(text)
    //       ^? (parameter) search: RegExp
  }
  return text.includes(search)
  //                   ^? (parameter) search: string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABBBUCGMwGcAUUCmAHlAFyJZQBOmA5gDTn5qUQAWZF1YNiAPogCV8NAKKEADgEpEAbwBQiRDGCIcWJi1ZLs6SPjgqhoidPmLFlfFBCUkAQjvrmbAHRF8EPESiSA3AvMAekDzUIA9AH5VcWY0AFsrfEppJ00yIzFxAIBfAMtrW0QCYhdMCAAbEAATfFxUtj8A4NCW1vConBjKeMTkxmd2cipaOVygA)

检查对象属性也可以达到缩小类型的目的：

```ts
interface Apple {
  isGoodForBaking: boolean
}
interface Orange {
  numSlices: number
}
function pickFruit(fruit: Apple | Orange) {
  if ('isGoodForBaking' in fruit) {
    fruit
    // ^? (parameter) fruit: Apple
  } else {
    fruit
    // ^? (parameter) fruit: Orange
  }
  fruit
  // ^? (parameter) fruit: Apple | Orange
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgIIAd0BsUG9nADOA4gPakAmAYqVAEJwDWoA5gFzIBG5OcIA3MgC+AKFCRYiFAHkofFnmQgArgFsAylmBJCHFas7RBomMpAIwwUiGTptjKlGXAwAChhOXHDNhQAfZFl5CABKZFwRZAIYZFcAciIyShp6JlY4ghsPZzAwiKio7JdIgoB6UuQAPQB+WPQ4OVUICTCisG9MHBKhZAgsQjwSws8wIeRyqtrXesbm6FaRjiCQBW6StpKJmrqGuCaW5DaO32QA5dXRIA)

部分原生函数也能缩小类型，比如 `Array.isArray`：

```ts
function contains(text: string, terms: string | string[]) {
  const termList = Array.isArray(terms) ? terms : [terms]
  //    ^? const termList: string[]
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABBBUCGMwGcAUUCmAHlAFyJZQBOmA5gDSIGUC2WZF1YNiAPuVbQDaAXQCUiAN4AoRMgQVG+FgBkYCgLyIAgpUpoAngDo1OvfrxLW4gPyKWWRGUFNWwgNwzEAei+zZAPVsUbCg7ZlUKdgEuEU8fRENEqQBfKSA)

TypeScript 通常在处理条件语句里的类型推断表现很好。所以在使用类型断言（type assertion）前，建议先想清楚是不是 TypeScript 判断得更准确。比如下面的例子是错误的方式：

```ts
const elem = document.getElementById('what-time-is-it')
//    ^? const elem: HTMLElement | null
if (typeof elem === 'object') {
  elem
  // ^? const elem: HTMLElement | null
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBApgGzgWxgXhgExMArsuMKAOgHM4oBRJAogIQE8BJTACgHIB3ACwEMoAtFACWBAcIjio7AJQBuAFAB6JTDUwAegH4YoSLEQoAXDAASAFQCyAGWopCsAD4wwuBAgXCAZjFZQGAA5wID6GqGgRMOwgAEYAVnDA0jIwAN4KamGKaiqaOnrQ8DQmFjZ2tE4ubh4AvgpAA)

这是因为在 JavaScript 里，`typeof null` 是 `"object"`，所以你并没有真正排除掉 `null`！

类似的问题也可能出现在处理“falsy”值时：

```ts
function maybeLogX(x?: number | string | null) {
  if (!x) {
    console.log(x)
    //          ^? (parameter) x: string | number | null | undefined
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAWwIYE8BGBTAMnAcwA0AKADwH4AuRMEZHAJ0QB9EBnKRmMA12kABtBASkQBvAFCJEMYIhIBCMmKkyZEBOziDsAOkGFyIgNzT1Aegvqb6gHoUFAB1SNUybFGyMxZGp25efjoGb2ChQX5wABNsYB5saPMAX0lUoA)

这里因为空字符串和数字 0 也会被当作 falsy 值，所以 `x` 仍然可能是 `string` 或 `number`。TypeScript 的判断是对的！

还有一种常用的方法是使用“标签联合类型”来帮助 TypeScript 缩小类型：

```ts
interface UploadEvent {
  type: 'upload'
  filename: string
  contents: string
}
interface DownloadEvent {
  type: 'download'
  filename: string
}
type AppEvent = UploadEvent | DownloadEvent

function handleEvent(e: AppEvent) {
  switch (e.type) {
    case 'download':
      console.log('Download', e.filename)
      //                      ^? (parameter) e: DownloadEvent
      break
    case 'upload':
      console.log('Upload', e.filename, e.contents.length, 'bytes')
      //                    ^? (parameter) e: UploadEvent
      break
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgKoAcA2B7OATAUQDcJxkBvZMAT3QgC5kByAVy1zyYG5kZhNScALYNkAZzBRQAcx4Js4UmDGMJUkNOQBfAFChIsRCgAi2AO4gc+YkopVaopnnOWO3Xv0EjVkmT100dMgAgujoNmQAvGjs1iRkAD7IphZWhPFgXDo6MCwgCGDACsgAFnAgeAIRYAAUoqHhGQCUFDrI4mbAYAglyHUAdIEQLeRt7cgIcGIoTi5pTPRj4xMKYtgC-TjSNUwprvhMADTIEP18AiDCw1nL7QD0d7dPz8sAegD8fehwUFcGLaI9mlqktxgAjKAQOAAaxu40m02YbHmiye8hAaw2Wx2GHmx1O5y8EHx-XRkHAYk2pGkYBKxyYYOokDETCacOWDxeXPGHy+Pz+0ABjFxHBBTwhUNhY10uiAA)

这叫做“标签联合”或“可区分联合”，在 TypeScript 中非常常见。第 4 章会再次提到这个模式。写 `switch` 语句时，最好能确保你覆盖了所有的情况，第 59 条会教你怎么做。

如果 TypeScript 无法推断出某个变量的具体类型，你可以定义一个**类型保护函数**来帮它一把：

```ts
function isInputElement(el: Element): el is HTMLInputElement {
  return 'value' in el
}

function getElementContent(el: HTMLElement) {
  if (isInputElement(el)) {
    return el.value
    //     ^? (parameter) el: HTMLInputElement
  }
  return el.textContent
  //     ^? (parameter) el: HTMLElement
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABDAzgSTABxFAogGwFMBbQsKACkPwC5ECSyoBKO65FRACQBUBZADIZseIqXKIA3gChEiAE6EoIeUgDkANwCG+EITXIk1ANzSAvtOmhIsBIgDmShuKgBhBFCZVa3fgOdMzFKyyMCIFKjCOAHk3sxBMnJyisqqiNQAdNq6hKZJiAD0BfmIAHoA-OGYWvJapJ7yQdR0vIJRoozkIRbJSipG+BmeAB5uHkx5hcX5FVU1dUqEjek+rf5iTObSQA)

这被称为**用户自定义类型保护函数**，其中的 `el is HTMLInputElement` 是一种**类型谓词**（type predicate）。作为返回类型，它告诉 TypeScript：如果函数返回 true，那么可以把参数类型缩小。

有些数组方法也能结合类型保护函数使用，比如 `filter`：

```ts
const formEls = document.querySelectorAll('.my-form *')
const formInputEls = [...formEls].filter(isInputElement)
//    ^? const formInputEls: HTMLInputElement[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABDAzgSTABxFAogGwFMBbQsKACkPwC5ECSyoBKO65FRACQBUBZADIZseIqXKIA3gChEiAE6EoIeUgDkANwCG+EITXIk1ANzSAvtOmhIsBIgDmShuKgBhBFCZVa3fgOdMzFKyyMCIFKjCOAHk3sxBMnJyisqqiNQAdNq6hKZJiAD0BfmIAHoA-OGYWvJapJ7yQdR0vIJRoozkIRbJSipG+BmeAB5uHkx5hcX5FVU1dUqEjek+rf5iTObSEAgoUIjAcPLEBJwAvIgAJnAQIC4ZAI568gCeAMrUhNBHAIL4+BQ1BliC8ALSHY6IABUamYph2YD2ByOxHap0QFwA2hkcRCTvgUABdDLAGD4BoRdBYaIbchw6RFGaVBFIvFogktPzszpQTGE6RAA)

不过要注意，用户自定义的类型保护函数并不比类型断言（如 `as HTMLInputElement`）更安全：TypeScript 并不会检查你写的函数逻辑是否真的和返回的类型匹配。（比如有些元素也有 `value` 属性，但它们并不是 `HTMLInputElement`。）

你有时也可以稍微调整代码结构，让 TypeScript 更好地跟踪类型。例如下面使用 `Map` 的代码是正确的，但却报了类型错误：

```ts
const nameToNickname = new Map<string, string>()
declare let yourName: string
let nameToUse: string
if (nameToNickname.has(yourName)) {
  nameToUse = nameToNickname.get(yourName)
  // ~~~~~~ Type 'string | undefined' is not assignable to type 'string'.
} else {
  nameToUse = yourName
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBGCGBbApgFRAOQJbANYJRgF45kB3GAWXgAcAeaAJyzAHMAaGJl1gPgAoAlAG4AUABNkwADbxGyGNOSwAniACujDEmQAuLlGZsxS2ATQgAqhD0GjrMVgBmMfufTY85gHQALeBD8apraKIKCMADeojBwOujWCiTumDj4Ot6sykEaWjoiMTAA9EUwAH4VlTCoKjQKAOTcbDAAPjDqYJJOLMji9TBYEHAgsAEQWKwIAEZKMFAgc7UNTaz13qIAvjDI0jZRhSmJxDDBeShiG6JAA)

问题在于，TypeScript 并不理解 `Map` 的 `has` 和 `get` 方法之间的关系。它不知道当你先调用 `has` 检查后，接着用 `get` 获取值时，结果就不可能是 `undefined`。稍作修改，就可以消除这个类型错误，同时保留原有行为：

```ts
const nickname = nameToNickname.get(yourName)
let nameToUse: string
if (nickname !== undefined) {
  nameToUse = nickname
} else {
  nameToUse = yourName
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBGCGBbApgFRAOQJbANYJRgF45kB3GAWXgAcAeaAJyzAHMAaGJl1gPgAoAlAG4AUABNkwADbxGyGNOSwAniACujDEmQAuLlGZsxoSLDA58O4nB3pseAsgB0rZfzWbtKEaKXm7EABVCD0DI1YxLAAzGH4LR2sAQiISdTBJaJZkcUEYAG9RGFsUdBCFEgSrFDEAXxhkaVCCopK0YOaSTy0dOtEgA)

这种写法很常见，也可以用更简洁的“空值合并运算符（??）”来写：

```ts
const nameToUse = nameToNickname.get(yourName) ?? yourName
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBGCGBbApgFRAOQJbANYJRgF45kB3GAWXgAcAeaAJyzAHMAaGJl1gPgAoAlAG4AUABNkwADbxGyGNOSwAniACujDEmQAuLlGZsxoSLAJoQAVQgKSF9NjwWAdK2X81m7SkEwA-P4wXlo6YkA)

如果你发现自己在某个条件判断里和类型检查器“较劲”，不妨想想能不能换个写法，让 TypeScript 更容易跟得上你的逻辑。

理解哪些情况**不会触发类型缩小**也很重要。一个典型例子是**回调函数中的缩小失效**：

```ts
function logLaterIfNumber(obj: { value: string | number }) {
  if (typeof obj.value === 'number') {
    setTimeout(() => console.log(obj.value.toFixed()))
    // 报错：'toFixed' 可能不存在于类型 'string | number' 上
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAGzgcwDIEMoFMBOAksAHIgC2ARgQBRyUBWAXIgN6IBuWyIuLAzlHwwwaRAB9EYCtXyIAvgEo2AKESIYwRDSgBPAA644W+gwB0XHrkQBeO4gBE0qgQfLWa9Yn64oAFRhyIxAoGhplGwA+RAgEfjhkXDNUNDpGC25eMyg4ADEYAA9cABNwxUUAbk91AHoarwbGpuaWhoA-Ds626sQ6xAAFfDhDfD1EAHIc-KLi8cRiuFx+KTgoRFwCmEFEBEQ9QwnBYVEJKRkCcbNPeRUboA)

我们明明做了 `typeof` 类型判断，理论上应该已经缩小了 `obj.value` 的类型，为什么还会报错？

这是因为调用代码可能是这样的：

```ts
const obj: { value: string | number } = { value: 123 }
logLaterIfNumber(obj)
obj.value = 'Cookie Monster'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAGzgcwDIEMoFMBOAksAHIgC2ARgQBRyUBWAXIgN6IBuWyIuLAzlHwwwaRAB9EYCtXyIAvgEo2AKESIYwRDSgBPAA644W+gwB0XHrkQBeO4gBE0qgQfLWa9Yn64oAFRhyIxAoGhplGwA+RAgEfjhkXDNUNDpGC25eMyg4ADEYAA9cABNwxUUAbk91AHoarwbGpuaWhoA-Ds626sQ6xAAFfDhDfD1EAHIc-KLi8cRiuFx+KTgoRFwCmEFEBEQ9QwnBYVEJKRkCcbNPeRUb2LBt0xZ2S14BIRExSWdZBVs2TiZPiIACMACYAMwKKopbB4Iikc74NIMSoqUwZKz-cYAYTgcAA1jBrABZOLw8ZVIA)

虽然进入 `setTimeout` 的时候 `obj.value` 是 `number`，但在真正执行回调函数时，外部代码可能已经把它改成了 `string`。TypeScript 无法保证值在异步执行时仍然是你当初检查时的类型，所以回退成了最安全的联合类型。

## 关键点总结

- 了解 TypeScript 如何基于条件语句和其他控制流缩小类型范围。
- 使用标记/区分联合类型和用户定义的类型保护来帮助缩小类型。
- 考虑是否可以重构代码，使 TypeScript 更容易跟随并推断类型。

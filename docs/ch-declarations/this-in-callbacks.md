# Item 69: Provide a Type for this in Callbacks if It's Part of Their API

## 要点

- Understand how `this` binding works.
- Provide a type for `this` in callbacks if it's part of your API.
- Avoid dynamic `this` binding in new APIs.
- 理解 `this` 绑定是如何工作的。
- 如果 `this` 是你 API 的一部分，在回调中提供 `this` 的类型。
- 避免在新 API 中使用动态 `this` 绑定。

## 正文

JavaScript 的 `this` 关键字是该语言中最令人困惑的部分之一。与使用 `let` 或 `const` 声明的变量（它们是词法作用域的）不同，`this` 是动态作用域的：它的值不取决于它在代码中出现的位置，而是取决于你如何到达那里。

`this` 最常用于类中，它通常引用对象的当前实例：

```ts
class C {
  vals = [1, 2, 3]
  logSquares() {
    for (const val of this.vals) {
      console.log(val ** 2)
    }
  }
}

const c = new C()
c.logSquares()
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEDC0G8BQ1oDcwhgXmgbQEYAaaAJhIGYBdAbhWhAHsBzAZQEcBXMAJwFMIACgCUieqgBmjHtEHBGAOwgAXdJmiMJ0ZQAsAlhAB0GLKOSoL0eUsYg+hps0EnoAKldlhdSwF96fvyRrFStoXAU+AHc4ETpgBxYObn4hLyQgA)

这会输出：

```
1
4
9
```

现在看看如果你尝试将 `logSquares` 放入变量并调用会发生什么：

```ts
const c = new C()
const method = c.logSquares
method()
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEDC0G8BQ1oDcwhgXmgbQEYAaaAJhIGYBdAbhWhAHsBzAZQEcBXMAJwFMIACgCUieqgBmjHtEHBGAOwgAXdJmiMJ0ZQAsAlhAB0GLKOSoL0eUsYg+hps0EnoAKldlhdSwF96fv2sVK2hcBT4AdzgROiDVAFs+XUYAE1CrBxYObn4IOkTklJikIA)

这个版本在运行时抛出错误：

```
for (const val of this.vals) {
                           ^
TypeError: Cannot read properties of undefined (reading 'vals')
```

问题在于 `c.logSquares()` 实际上做了两件事：它调用 `C.prototype.logSquares` 并将该函数中的 `this` 值绑定到 `c`。通过提取 `logSquares` 的引用，你已经分离了这些，`this` 被设置为 `undefined`。

JavaScript 让你完全控制 `this` 绑定。你可以使用 `call` 显式设置 `this` 并修复问题：

```ts
const c = new C()
const method = c.logSquares
method.call(c) // Logs the squares again
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEDC0G8BQ1oDcwhgXmgbQEYAaaAJhIGYBdAbhWhAHsBzAZQEcBXMAJwFMIACgCUieqgBmjHtEHBGAOwgAXdJmiMJ0ZQAsAlhAB0GLKOSoL0eUsYg+hps0EnoAKldlhdSwF96fv2sVK2hcBT4AdzgROiDVAFs+XUYAE1CrBxYObn4IOkTklMNgTBA5L1QAekroABkWGF0+aAguXgFoMGYwPQUkIA)

没有理由说 `this` 必须绑定到 `C` 的实例。它可以绑定到任何东西。所以库可以，也确实将 `this` 的值作为其 API 的一部分。甚至 DOM 在事件处理程序中也会这样做，例如：

```ts
document.querySelector('input')?.addEventListener('change', function (e) {
  console.log(this) // Logs the input element on which the event fired.
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEDC0G8BQ1oDcwhgXmgbQEYAaaAJhIGYBdAbhWhAHsBzAZQEcBXMAJwFMIACgCUieqgBmjHtEHBGAOwgAXdJmiMJ0ZQAsAlhAB0GLKOSoL0eUsYg+hps0EnoAKldlhdSwF96fvwATRmBOAFs+BWVDLj4eAE9WPjtgZWlBAHI9BQAHTmUM4QB+QzBAwIBRNEjlABkDZUi4zOAdMAVmPgySCU4FVL1FQT4zemsIW3tHQV0DL1QAegXoWpYYXT5obLzVZL4IqI0FaAB3fVbtHU2+asOJPX5AwyQfLyQgA)

`this` 绑定经常出现在像这样的回调上下文中。如果你想在类中定义 `onClick` 处理程序，例如，你可能会尝试这样做：

```ts
class ResetButton {
  render() {
    return makeButton({ text: 'Reset', onClick: this.onClick })
  }
  onClick() {
    alert(`Reset ${this}`)
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwFsoBrEAIWQwzwAoAHGHOgZwC54BvDEADw3eYYYWVAHMANPDwBhCFjDF2NAJTwAvAD54ANxxZg8AL7L2u-QG4AUJCjNm8AEohmIDBSp5Ol+PDipQMCpePj5wGMgw+ESk7tSoNFy8-PAA5E4uGCmSMnIK7BgAFljMAHQ58sTGVj6G3lKoshVBHHU+UBAgMBg0AAbprvAAJFxFzIY9ytVGlrVAA)

当用户点击按钮时，它会弹出 "Reset undefined"。糟糕！通常的罪魁祸首是 `this` 绑定。一个常见的解决方案是在构造函数中创建方法的绑定版本：

```ts
class ResetButton {
  constructor() {
    this.onClick = this.onClick.bind(this)
  }
  render() {
    return makeButton({ text: 'Reset', onClick: this.onClick })
  }
  onClick() {
    alert(`Reset ${this}`)
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwFsoBrEAIWQwzwAoAHGHOgZwC54BvDEADw3eYYYWVAHMANPDwBhCFjDF2NAJTwAvAD54ANxxZg8AL7L2u-QG4AUJCjNm8AEohmIDBSp5Ol+PDB5BMMiYODAqXj4+GAAWWMwAdDJyCurw0bEJqLLyxHEARiLANGnMylY+ht7wcKigoaoclT5wGMgw+ESk7tSoNFy8-PAA5E4uGIOSidnsxRlZCsZlRpWTCmENEfBQECAwGDQABiOu8AAkXDHMhvullRUVQA)

`onClick() { ... }` 定义在 `ResetButton.prototype` 上定义了一个属性。这由所有 `ResetButton` 实例共享。当你在构造函数中绑定 `this.onClick = ...` 时，它会在 `ResetButton` 实例上创建一个名为 `onClick` 的属性，并将 `this` 绑定到该实例。`onClick` 实例属性在查找序列中位于 `onClick` 原型属性之前，所以 `this.onClick` 在 `render()` 方法中引用绑定的函数。

有一个非常方便的 `this` 绑定简写：

```ts
class ResetButton {
  render() {
    return makeButton({ text: 'Reset', onClick: this.onClick })
  }
  onClick = () => {
    alert(`Reset ${this}`) // "this" refers to the ResetButton instance.
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&alwaysStrict=false&moduleResolution=2&module=99&target=8#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwFsoBrEAIWQwzwAoAHGHOgZwC54BvDEADw3eYYYWVAHMANPDwBhCFjDF2NAJTwAvAD54ANxxZg8AL7L2u-QG4AUJCjNm8AEohmIDBSp5Ol+PDipQMCpePj5wGMgw+ESk7tSoNFy8-PAA5E4uGCmSMnIK7BgAFljMAHQ58sTGVj6G3lKoshXq8EGawSFQECAwGDQABumu8AAkXEXMhn3K5vAA9LPwAESFxYu+IIjd9tTwhQiDbpRx8CKCUOggJXW1tUA)

这里我们用箭头函数替换了 `onClick`。这将在每次构造 `ResetButton` 时定义一个新函数，并将 `this` 设置为适当的值。查看生成的 JavaScript 是有启发性的：

```js
class ResetButton {
  constructor() {
    this.onClick = () => {
      alert(`Reset ${this}`) // "this" refers to the ResetButton instance.
    }
  }
  render() {
    return makeButton({ text: 'Reset', onClick: this.onClick })
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEBKCmF4BcBCBXZyD2A7aA3gFDTTB4TIBO6wOVAFAJSEmnTIAWAlhAHR4AwiG7AA1tAC80ZlIB8rduzAh4VZAwAGCJMmgASAl14BfTUwDc0APTXoAImMR70KvABmamDg6d4cRBQMLDxoblxKMFxgeD42UhMLNhM2N1wAEzVZYiU3ZHQqfABbMDF4YJxcBgIOeAAPZAAuaAByHRQWgBpoIRFxZqcBXGFRCRNLZKIUoA)

那么这一切与 TypeScript 有什么关系呢？因为 `this` 绑定是 JavaScript 的一部分，TypeScript 会建模它。这意味着如果你正在编写（或类型化）一个在回调上设置 `this` 值的库，那么你也应该建模它。

你可以通过在回调中添加 `this` 参数来实现：

```ts
function addKeyListener(
  el: HTMLElement,
  listener: (this: HTMLElement, e: KeyboardEvent) => void
) {
  el.addEventListener('keydown', (e) => listener.call(el, e))
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoNIFMCeAZGAZyizCwCcAKAKEUSwBsAuRACQBUBZPAUQawC2pKABpaiBkRJlyLSlAAWRFh259BwkfRbYcAIzjJyqHgDdhASkQBeAHyJTcGKmpWA3uMYA6NCfNgoAmJSCkoAcgBrXFQ4AHcwMK0sG3tJYJkvCGQGBkpGJIsLAG5qAF9qIA)

`this` 参数是特殊的：它不仅仅是另一个位置参数。如果你尝试用两个参数调用它，你可以看到这一点：

```ts
function addKeyListener(
  el: HTMLElement,
  listener: (this: HTMLElement, e: KeyboardEvent) => void
) {
  el.addEventListener('keydown', (e) => {
    listener(el, e)
    //           ~ Expected 1 arguments, but got 2
  })
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoNIFMCeAZGAZyizCwCcAKAKEUSwBsAuRACQBUBZPAUQawC2pKABpaiBkRJlyLSlAAWRFh259BwkfRbYcAIzjJyqHgDdhASkQBeAHyJTcGKmpWA3uMYA6NCfNgoAmJSCkoAcgBrXFQ4AHcwMK0sG3sPOjpJYJlKRiSLAG5xOgB6YvTy8oA-RB4ADwAHLGgsVEQARhRyAHMQIQDCLT0QKEQuuBGAJnEAXwLqaeogA)

更好的是，TypeScript 会强制你用正确的 `this` 上下文调用函数：

```ts
function addKeyListener(
  el: HTMLElement,
  listener: (this: HTMLElement, e: KeyboardEvent) => void
) {
  el.addEventListener('keydown', (e) => {
    listener(e)
    // ~~~~~~~~ The 'this' context of type 'void' is not assignable
    //          to method's 'this' of type 'HTMLElement'
  })
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoNIFMCeAZGAZyizCwCcAKAKEUSwBsAuRACQBUBZPAUQawC2pKABpaiBkRJlyLSlAAWRFh259BwkfRbYcAIzjJyqHgDdhASkQBeAHyJTcGKmpWA3uMYA6NCfNgoAmJSCkoAcgBrXFQ4AHcwMK0sG3sPOjpJYJlKLAsAbnE6AHoixAA-CsqKxHYFZLDFIjDECAQSAA8oRDhgRCgcAAd6x2dmokQwOC7kQkIYAHMwZD1+QsQS9M30qDhEIUU4VDDCRAalQmaevsH61V5+IQCw8QBffOoX6iA)

作为这个函数的用户，你可以在回调中引用 `this` 并获得完整的类型安全：

```ts
declare let el: HTMLElement
addKeyListener(el, function (e) {
  console.log(this.innerHTML)
  //          ^? this: HTMLElement
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoNIFMCeAZGAZyizCwCcAKAKEUSwBsAuRACQBUBZPAUQawC2pKABpaiBkRJlyLSlAAWRFh259BwkfRbYcAIzjJyqHgDdhASkQBeAHyJTcGKmpWA3uMYA6NCfNgoAmJSCkoAcgBrXFQ4AHcwMK0sG3sPOjpJYJlKLAsAbnE6AHoixAA-CsqKxHYFZLDFIjDECAQSAA8oRDhgRCgcAAd6x2dmokQwOC7kQkIYAHMwZD1+QsQS9M30qDhEIUU4VDDCRAalQmaevsH61V5+IQCw8QBffOoX6lQsCAYjZP4XUYKi49w0AQKvl0QWkoUYWlAkFgCBy7nErTAhDg-C8DDg83k5y8MDAMju72KpS2mwAegB+PrnEFqB7CD7vIA)

当然，如果你在这里使用箭头函数，你会覆盖 `this` 的值。TypeScript 会捕获这个问题：

```ts
class Foo {
  registerHandler(el: HTMLElement) {
    addKeyListener(el, (e) => {
      console.log(this.innerHTML)
      //               ~~~~~~~~~ Property 'innerHTML' does not exist on 'Foo'
    })
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoNIFMCeAZGAZyizCwCcAKAKEUSwBsAuRACQBUBZPAUQawC2pKABpaiBkRJlyLSlAAWRFh259BwkfRbYcAIzjJyqHgDdhASkQBeAHyJTcGKmpWA3uMYA6NCfNgoAmJSCkoAcgBrXFQ4AHcwMK0sG3sPOjpJYJlKLAsAbnE6AHoixAA-CsqKxHYFZLDFIjDECAQSAA8oRDhgRCgcAAd6x2dmokQwOC7kQkIYAHMwZD1+QsQS9M30qDhEIUU4VDDCRAalQmaevsH61V5+IQCw8QBffOoX6ggGGZOAMTguzSiHIWHmUgorGQYFQ-CojBUXHuGgC7jWvl0QWkoUYSRSiGBm1aYEIcH4XgYcHm8nOXhgYBkd3eW3WpRZ7PKVSqiAACuQ4ENyP1TvTGUjmjEsCdJl0sO0pN0kGEAXBnps3gU6J9PkA)

不要忘记 `this`！如果你在回调中设置 `this` 的值，那么它就是你的 API 的一部分，你应该在类型声明中包含它。

如果你正在设计一个新的 API，尽量不要使用动态 `this` 绑定。虽然它在历史上很流行，但它一直是混乱的根源，而箭头函数的普及使得这种 API 在现代 JavaScript 中使用起来更加困难。

## 要点回顾

- 理解 `this` 绑定是如何工作的。
- 如果 `this` 是你 API 的一部分，在回调中提供 `this` 的类型。
- 避免在新 API 中使用动态 `this` 绑定。

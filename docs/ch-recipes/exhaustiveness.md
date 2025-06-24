# Item 59: Use Never Types to Perform Exhaustiveness Checking

## 要点

- Use an assignment to the `never` type to ensure that all possible values of a type are handled (an "exhaustiveness check").
- Add a return type annotation to functions that return from multiple branches. You may still want an explicit exhaustiveness check, however.
- Consider using template literal types to ensure that every combination of two or more types is handled.
- 使用赋值给 `never` 类型来确保所有可能的类型值都被处理（"穷尽性检查"）。
- 为返回多个分支的函数添加返回类型注解。尽管如此，你仍然可能需要显式的穷尽性检查。
- 考虑使用模板字面量类型来确保每种两种或更多类型的组合都被处理。

## 正文

静态类型分析是发现你不应该做的事情的好方法。当你赋值错误的类型值、引用不存在的属性，或者用错误数量的参数调用函数时，你会得到一个类型错误。

但是还有遗漏错误：你应该做某事但你没有做的时候。虽然 TypeScript 不会总是自己捕获这些错误，但有一个流行的技巧可以用来将 switch 或 if 语句中缺失的情况转换为类型错误。这被称为"穷尽性检查"。让我们看看它是如何工作的。

假设你正在构建一个绘图程序，可能使用 HTML `<canvas>` 元素。你可以使用标记联合来定义可以绘制的形状集合：

```ts
type Coord = [x: number, y: number]
interface Box {
  type: 'box'
  topLeft: Coord
  size: Coord
}
interface Circle {
  type: 'circle'
  center: Coord
  radius: number
}
type Shape = Box | Circle
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwg9nATgEygXigbQB4C4oB2ArgLYBGEiANFCPseZQLoDcAUAJYHCUBmAhgGNoAITjYoAbzZQooSPgDkZcYvazgcMABkIvYPnhJk6qAGcOALwiGEKdgF9O3PkOgwOiQQBto0jeA2UIqCnj4QajJQwi6ItsamiPzIHERm9KQUiI5s8tAAygAW-JDoUGISAD6wYb7sQA)

你可以使用内置的 canvas 方法来绘制这些形状：

```ts
function drawShape(shape: Shape, context: CanvasRenderingContext2D) {
  switch (shape.type) {
    case 'box':
      context.rect(...shape.topLeft, ...shape.size)
      break
    case 'circle':
      context.arc(...shape.center, shape.radius, 0, 2 * Math.PI)
      break
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwg9nATgEygXigbQB4C4oB2ArgLYBGEiANFCPseZQLoDcAUAJYHCUBmAhgGNoAITjYoAbzZQooSPgDkZcYvazgcMABkIvYPnhJk6qAGcOALwiGEKdgF9O3PkOgwOiQQBto0jeA2UIqCnj4QajJQwi6ItsamiPzIHERm9KQUiI5s8tAAygAW-JDoUGISAD6wYb7svEQEgsAccARQyEkA7kUlEAAUZsUKUL2QNIJtPNgGsPwEAG78ZgBKEATIlFwA5vAuMwBMACIAlFJRZl0cwIKFUIPDEAB0eWf+stHL0MqquFEf0SmEBmT0QEGa-SeUKGfReWl0+hoUKeMMgKKsEBOpgBZDB-AA1tjPmZvqEvL5FH8AbJJvtgE9+F5IdDHk8YjxqOZWUkUmkaAAGGgHKAAKigAFl+MBCk8AAoASSx-w+uIgBNMTicQA)

到目前为止，一切正常。现在你决定添加第三个形状：

```ts
interface Line {
  type: 'line'
  start: Coord
  end: Coord
}
type Shape = Box | Circle | Line
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwg9nATgEygXigbQB4C4oB2ArgLYBGEiANFCPseZQLoDcAUAJYHCUBmAhgGNoAITjYoAbzZQooSPgDkZcYvazgcMABkIvYPnhJk6qAGcOALwiGEKdgF9O3PkOgwOiQQBto0jeA2UIqCnj4QajJQwi6ItsamiPzIHERm9KQUiI7OPIgCwlDaXH5R8kGK3iWRsmbA-IgGsHYmURAEyPH2bE7lUADKABb8kOhQYhIAPrBhvlDTxQQQ7EA)

没有类型错误，但这个更改引入了一个 bug：`drawShape` 会静默忽略任何线条形状。这是一个遗漏错误。我们如何让 TypeScript 捕获这种错误？

如果你查看穷尽性 switch 语句后 shape 的类型，有一个线索：

```ts
function processShape(shape: Shape) {
  switch (shape.type) {
    case 'box':
      break
    case 'circle':
      break
    case 'line':
      break
    default:
      shape
    // ^? (parameter) shape: never
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwg9nATgEygXigbQB4C4oB2ArgLYBGEiANFCPseZQLoDcAUAJYHCUBmAhgGNoAITjYoAbzZQooSPgDkZcYvazgcMABkIvYPnhJk6qAGcOALwiGEKdgF9O3PkOgwOiQQBto0jeA2UIqCnj4QajJQwi6ItsamiPzIHERm9KQUiI7OPIgCwlDaXH5R8kGK3iWRsmbA-IgGsHYmURAEyPH2bE7lUADKABb8kOhQYhIAPrBhvlDTxQQQ7LxEBILAHHAEUMhJAO5DIxAAFGbDCgMXEDSC2zzYTTD8BABu-GYASu3IlFwA5vAXI8AEwAEQAlFIomZ9hxgIJBlAztcAHTlKH+WTRD7QZSqXBRbHRe4QR6oxAQDYnVG087HdFaXT6Gi01H0yDsqwQCGmYlkSn8ADWfJxZjxoS8vkUhOJsjuwOAqIaghpdLRMTyNA5EApyVSZhoAAYaCCoAAqKAAWX4wEGqIACgBJXlE7ECiDC0xOJyrdabbZQMCIODCMxmI6QFHHfCRnnQ2pwhFI6OcjEJ7GCXHBFTYGVQD1et1Z8XBSXhfOFkXF7OVar4Kui34CIjeAxu2rXDtQAD0PagAD0APzIsANfgkCB5KE6+gQV6UKI+thAA)

回想第 7 条，`never` 类型是一个"底部"类型，其域是空集。当我们覆盖了 Shape 的所有可能类型时，这就是剩下的全部。如果我们遗漏了一个情况，那么类型就会是 `never` 以外的其他东西：

```ts
function processShape(shape: Shape) {
  switch (shape.type) {
    case 'box':
      break
    case 'circle':
      break
    // (forgot 'line')
    default:
      shape
    // ^? (parameter) shape: Line
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwg9nATgEygXigbQB4C4oB2ArgLYBGEiANFCPseZQLoDcAUAJYHCUBmAhgGNoAITjYoAbzZQooSPgDkZcYvazgcMABkIvYPnhJk6qAGcOALwiGEKdgF9O3PkOgwOiQQBto0jeA2UIqCnj4QajJQwi6ItsamiPzIHERm9KQUiI7OPIgCwlDaXH5R8kGK3iWRsmbA-IgGsHYmURAEyPH2bE7lUADKABb8kOhQYhIAPrBhvlDTxQQQ7LxEBILAHHAEUMhJAO5DIxAAFGbDCgMXEDSC2zzYTTD8BABu-GYASu3IlFwA5vAXI8AEwAEQAlFIomZ9hxgIJBlAztcAHTlKH+WTRD7QZSqXBRbHRe4QR6oxAQDYnVG087HdFaXT6Gi01H0yDsqwQCGmYlkSn8ADWfJxZjxoS8vkUhOJsjuwOAqIaghpdLRMTyNA5EApyVSZhoAAYaCCoAAqKAAWX4wEGqIACgBJXlE7ECiDC0xOJyrdabbZQMCIODCMxmI6QFHHfCRnnQ2pwhFI6OcjEJ7GCXHBFTYGVQD1et1Z8XBSXhfOFkVugD0NeRvCQ-zgwGCVSWighbt+AiI3gMbtq10HUDrUAAegB+ZFgBr8EgQPJQnX4RYQKI+thAA)

没有值可以赋值给 `never` 类型，我们可以利用这一点将遗漏转换为类型错误：

```ts
function assertUnreachable(value: never): never {
  throw new Error(`Missed a case! ${value}`)
}

function drawShape(shape: Shape, context: CanvasRenderingContext2D) {
  switch (shape.type) {
    case 'box':
      context.rect(...shape.topLeft, ...shape.size)
      break
    case 'circle':
      context.arc(...shape.center, shape.radius, 0, 2 * Math.PI)
      break
    default:
      assertUnreachable(shape)
    //                ~~~~~
    // ... type 'Line' is not assignable to parameter of type 'never'.
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwg9nATgEygXigbQB4C4oB2ArgLYBGEiANFCPseZQLoDcAUAJYHCUBmAhgGNoAITjYoAbzZQooSPgDkZcYvazgcMABkIvYPnhJk6qAGcOALwiGEKdgF9O3PkOgwOiQQBto0jeA2UIqCnj4QajJQwi6ItsamiPzIHERm9KQUiI7OPIgCwlDaXH5R8kGK3iWRsmbA-IgGsHYmURAEyPH2bE7lUADKABb8kOhQYhIAPrBhvlDTxQQQ7LxEBILAHHAEUPxmZpTAAKoEiBBCw2S+ABQAbvzeREFLt5QAlPQQr4hSZYOIcAA7oQIMCAKKIAGIa4AAwAshx9hBUPxonsIABCKAAEkk90eEAcMLeOTYq3Wm22UGQSUBQxGEGuZmGCgGLIgNEE2x42CaMH4BHuZgASu1kJQuABzeAuXkAJgAIm9frVARxgIJBlAmeyAHTlZX+WRog7BFTYRS4KLG6LciC83VnDbXXWu5kM-VaXT6Giu3XuyD+qwQEnW41kM78ADWplkgnRwVCXl8lrDcbtDoaghdbr1MTyNADEEdyVSZhoAAYaHKoAAqKBw-jAQa6gAKAElQzbZBHzjGw+KBERvAY07skY0TpHNfwroyi13uwB6JfdtfdgB+W63Y5XUD9ckCwUWESgiMIcGA44skoIs7mmigYAa-BIEDyUDgvEPo0UL0oii6lEThOEAA)

我们稍后会详细讨论 `assertUnreachable`，但首先让我们通过覆盖缺失的情况来修复错误：

```ts
function drawShape(shape: Shape, context: CanvasRenderingContext2D) {
  switch (shape.type) {
    case 'box':
      context.rect(...shape.topLeft, ...shape.size)
      break
    case 'circle':
      context.arc(...shape.center, shape.radius, 0, 2 * Math.PI)
      break
    case 'line':
      context.moveTo(...shape.start)
      context.lineTo(...shape.end)
      break
    default:
      assertUnreachable(shape) // ok
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwg9nATgEygXigbQB4C4oB2ArgLYBGEiANFCPseZQLoDcAUAJYHCUBmAhgGNoAITjYoAbzZQooSPgDkZcYvazgcMABkIvYPnhJk6qAGcOALwiGEKdgF9O3PkOgwOiQQBto0jeA2UIqCnj4QajJQwi6ItsamiPzIHERm9KQUiI7OPIgCwlDaXH5R8kGK3iWRsmbA-IgGsHYmURAEyPH2bE7lUADKABb8kOhQYhIAPrBhvlDTxQQQ7LxEBILAHHAEUPxmZpTAAKoEiBBCw2S+ABQAbvzeREFLt5QAlPQQr4hSZYOIcAA7oQIMCAKKIAGIa4AAwAshx9hBUPxonsIABCKAAEkk90eEAcMLeOVW6022ygyCSgKGIwg1zMwwUA2ZEBogm2PGwTRg-AI9zMACV2shKFwAObwFw8gBMABE3r9aoCOMBBIMoIy2QA6cpK-yyNEHYIqbCKXBRI3RLkQHk6s4ba46l1M+l6rS6fQ0F06t2QP1WCAkq1GshnfgAa1MskE6OCoS8vgtodjtvtDUEztdupieRo-ogDuSqTMNAADDRZVAAFRQOH8YCDHUABQAkiHrbJw+do6G4ybKtVLV2bTLgDqSHBXgAVODZv26uoNYCdruc8c6qpLOcLws60Vr609qMxql6fhEbwGVO7JGNE4RjX8K4MwskqAAek-UDgkaiThOEAA)

重要的是要保留 `assertUnreachable` 调用，即使它如名称所示是不可达的。它保护你免受将来引入额外形状时的遗漏错误。

为什么在 `assertUnreachable` 中抛出异常？这段代码不是不可达的吗？对于类型良好的 TypeScript 可能是这样，但 `drawShape` 总是可能从 JavaScript 调用，或者使用 `any` 或其他不健全的类型（第 48 条）。抛出异常保护我们免受运行时的意外值，而不仅仅是在类型检查期间。

穷尽性检查对 `drawShape` 特别有帮助，因为它没有返回值。它只是为了副作用而运行。如果你的函数确实返回值，那么注解返回类型可以给你一些防止遗漏情况的保护：

```ts
function getArea(shape: Shape): number {
  //                            ~~~~~~ Function lacks ending return statement and
  //                                   return type does not include 'undefined'.
  switch (shape.type) {
    case 'box':
      const [width, height] = shape.size
      return width * height
    case 'circle':
      return Math.PI * shape.radius ** 2
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwg9nATgEygXigbQB4C4oB2ArgLYBGEiANFCPseZQLoDcAUAJYHCUBmAhgGNoAITjYoAbzZQooSPgDkZcYvazgcMABkIvYPnhJk6qAGcOALwiGEKdgF9O3PkOgwOiQQBto0jeA2UIqCnj4QajJQwi6ItsamiPzIHERm9KQUiI7OPIgCwlDaXH5R8kGK3iWRsmbA-IgGsHYmURAEyPH2bE7lUADKABb8kOhQYhIAPrBhvlDTxQQQ7LxEBILAHHAEUPxmZpTAAKoEiBBCw2S+ABQAbvzeREFLt5QAlPQQr4hSZYOIcAA7oQIMCAKKIAGIa4AAwAshx9hBUPxonsIABCKAAEkk90eEAcMLeOVW6022ygAHMIMAAIJnfjXMzDBQDVkQD6ETKUX6yAD0-NkwpForF4qgAD9pTKoAAxNYbLY7bxCADWZig7RSBCpUDOwCIiB2dX4PBI7WAuw6UUFEvtDolBqNOz6yDgEE1BDgVq4PiIyGgijWgd4JWQigAdFEzICOMBBIMoMyOZHym8+cLBOjgipsIpcFERYJtnUsHHkMBBjRBhAOFTBsAmGMWSMIJGLNZTCLncaoBWq1AAFRQWv1xvdtEHYKhLy+AtF4W9nZws2DSMABQAksPzKmkik0sORwAmUxOJxAA)

正如错误所说，如果 `undefined` 是一个合法的返回值，那么这个检查不会保护你。即使函数返回值，进行穷尽性检查也可能是一个好主意。

这就是为什么我们之前为 `assertUnreachable` 添加 `never` 作为返回类型。由于 `never` 可以赋值给所有其他类型，你可以安全地返回它，无论函数的返回类型是什么：

```ts
function getArea(shape: Shape): number {
  switch (shape.type) {
    case 'box':
      const [width, height] = shape.size
      return width * height
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'line':
      return 0
    default:
      return assertUnreachable(shape) // ok
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwg9nATgEygXigbQB4C4oB2ArgLYBGEiANFCPseZQLoDcAUAJYHCUBmAhgGNoAITjYoAbzZQooSPgDkZcYvazgcMABkIvYPnhJk6qAGcOALwiGEKdgF9O3PkOgwOiQQBto0jeA2UIqCnj4QajJQwi6ItsamiPzIHERm9KQUiI7OPIgCwlDaXH5R8kGK3iWRsmbA-IgGsHYmURAEyPH2bE7lUADKABb8kOhQYhIAPrBhvlDTxQQQ7LxEBILAHHAEUPxmZpTAAKoEiBBCw2S+ABQAbvzeREFLt5QAlPQQr4hSZYOIcAA7oQIMCAKKIAGIa4AAwAshx9hBUPxonsIABCKAAEkk90eEAcMLeOVW6022ygAHMIMAAIJnfjXMzDBQDVkQD6ETKUX61QEcYCCQZQZkcgB05TefNkaIOwRU2EUuCisui2zqWAFyGAgxogwgHCpg2ATDGLJGEHFFmspjVZ2AREQO21uqgACooAajSa7XLoCFZhEVWrZA6nTs4fxdeKAAoASQ95glSRSaQ9noATH7BOjglUlsrVbLw86oAAGP3IPT8IjeAzFsO0iO7JGNE6M4X8K4QMWWkmyAD0g6gcAA1lEnE4gA)

`assertUnreachable` 模式在 TypeScript 代码中很常见，你可能会遇到它的其他变体，要么使用直接赋值给 `never`：

```ts
function processShape(shape: Shape) {
  switch (shape.type) {
    case 'box':
      break
    case 'circle':
      break
    default:
      const exhaustiveCheck: never = shape
      //    ~~~~~~~~~~~~~~~ Type 'Line' is not assignable to type 'never'.
      throw new Error(`Missed a case: ${exhaustiveCheck}`)
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwg9nATgEygXigbQB4C4oB2ArgLYBGEiANFCPseZQLoDcAUAJYHCUBmAhgGNoAITjYoAbzZQooSPgDkZcYvazgcMABkIvYPnhJk6qAGcOALwiGEKdgF9O3PkOgwOiQQBto0jeA2UIqCnj4QajJQwi6ItsamiPzIHERm9KQUiI7OPIgCwlDaXH5R8kGK3iWRsmbA-IgGsHYmURAEyPH2bE7lUADKABb8kOhQYhIAPrBhvlDTxQQQ7LxEBILAHHAEUPxmZpTAAKoEiBBCw2S+ABQAbvzeREFLt5QAlPQQr4hSZYOIcAA7oQIMCAKKIAGIa4AAwAshx9hBUPxonsIABCKAAEkk90eEAcMLeOVW6022ygYABwn2QxGEGuZmGCgGLIgb1+tUBHGAgkGUCZ7IAdOVOf5ZGiDsEVNhFPgyGd+ABrUyyQTo4KhLy+eVQRXnVVRWTIPT8IjeAzGyWCbZ1KAQbDDNKbV4wQYQQTKz7fMbMhlqyUAeiDkqgAD9I1HozGoAAVQLBRYRKCIwhwYC7fYcADmBH4V2gmjkicUL0oimF1o0-yBIPBkKQsIRSJRUqCuMdzrqHDdHq9RJJUScTiAA)

要么使用 `satisfies` 操作符：

```ts
function processShape(shape: Shape) {
  switch (shape.type) {
    case 'box':
      break
    case 'circle':
      break
    default:
      shape satisfies never
      //    ~~~~~~~~~ Type 'Line' does not satisfy the expected type 'never'.
      throw new Error(`Missed a case: ${shape}`)
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAwg9nATgEygXigbQB4C4oB2ArgLYBGEiANFCPseZQLoDcAUAJYHCUBmAhgGNoAITjYoAbzZQooSPgDkZcYvazgcMABkIvYPnhJk6qAGcOALwiGEKdgF9O3PkOgwOiQQBto0jeA2UIqCnj4QajJQwi6ItsamiPzIHERm9KQUiI7OPIgCwlDaXH5R8kGK3iWRsmbA-IgGsHYmURAEyPH2bE7lUADKABb8kOhQYhIAPrBhvlDTxQQQ7LxEBILAHHAEUPxmZpTAAKoEiBBCw2S+ABQAbvzeREFLt5QAlPQQr4hSZYOIcAA7oQIMCAKKIAGIa4AAwAshx9hBUPxonsIABCKAAEkk90eEAcMLeOVW6022ygYABwn2QxGEGuZmGCgGLIgb1+tUBHGAgkGUCZ7IAdOVOf5ZGiDsEVNhFPgyGd+ABrUyyQTo4KhLy+eVQRXnVVRWTIPT8IjeAzGyXMhnmfibMy8DgQMwg77W2QAei9kqgAD9A0Gg1AACqBYKLCJQZBwV2EODAe2O3ggOSDaAQbCQDbIuQRxQvSiKYWe9MA4FLcGQpCwhFIlFSoK422QIkkqJOJxAA)

所有这些模式都以相同的方式工作。使用你最喜欢的任何一个。

通过一些巧妙的方法，同样的技巧可以扩展到确保你处理两种类型的所有对，即笛卡尔积。例如，假设你写一些代码来玩"石头、剪刀、布"：

```ts
type Play = 'rock' | 'paper' | 'scissors'

function shoot(a: Play, b: Play) {
  if (a === b) {
    console.log('draw')
  } else if (
    (a === 'rock' && b === 'scissors') ||
    (a === 'paper' && b === 'rock')
  ) {
    console.log('A wins')
  } else {
    console.log('B wins')
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBACgNgQxFAvFA5AJwPYGMDW6UAPhmApJkaegM64CWtt2mt6A3AFBcBmArgDtcwBtkFRaAC2zZgACgQAuWIhAAaKACMV8JAEooAby5QoDXlEWoUaLYZNmzucSzgQAdHGwBzeegATTAQAd3R9bjMAXygIOFpoCytTJ2tbNCw8QigAMhztGwz6JhY2cJJiFLM02zIKCCpc-K1CjBwCcJSHKqgXQTdPbz90AEEoEIZ+8MioGLiE4x6+ga9ffwAhccn2CJSorn2gA)

不幸的是，我们遗漏了一个情况。如果 A 用剪刀对 B 的布，那么，让玩家 A 大吃一惊的是，这个函数会报告 B 赢了。我们可以使用模板字面量类型（第 54 条）和穷尽性检查来强制自己明确覆盖每个可能的情况：

```ts
function shoot(a: Play, b: Play) {
  const pair = `${a},${b}` as `${Play},${Play}` // or: as const
  //    ^? const pair: "rock,rock" | "rock,paper" | "rock,scissors" |
  //                   "paper,rock" | "paper,paper" | "paper,scissors" |
  //                   "scissors,rock" | "scissors,paper" | "scissors,scissors"
  switch (pair) {
    case 'rock,rock':
    case 'paper,paper':
    case 'scissors,scissors':
      console.log('draw')
      break
    case 'rock,scissors':
    case 'paper,rock':
      console.log('A wins')
      break
    case 'rock,paper':
    case 'paper,scissors':
    case 'scissors,rock':
      console.log('B wins')
      break
    default:
      assertUnreachable(pair)
    //                ~~~~ Argument of type "scissors,paper" is not
    //                     assignable to parameter of type 'never'.
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwM6oKYCcoFUxYbIQAWyARgDYYAUAbspSBgFyJgZ3YCUbHXWRAG8AUIkRQSWOAHd2GOQFEs0rDQAGAWRjoMAExSIIaDAEJEAEiEMmGAL7ruAbhF2RUAJ4AHDIgAKlMgeiAC8iADk0hAA1uGIAD4RXsg+WHGJ4agQOqhwWKjhLqCQsAiIqCRwcFA0yGwBQQA0iOT1gR7cwmJGCKhQiMkwgmHqVsh2jVbkDiioiKNCDR4TVksOTuIA9JuIeWxoPWB93dvi4gB6APyHfQPIQ2wARFHRjS+PCYjPcDGNyakfRLfX5ZHJ5VCAk47M4w2Fwx7-bBvH7RQFfRFYP4pbBohHYzGg9DgyFbaFw8kwx6E3L5ZExXHU8FYgGfKnZIm0xn5R7dVAyGBQUiIGiDLCdUQw4yYCIvOmxFjdcRS3zhDHM7DhBWSkwRLmoRp6zWKs4QXpwagAOkocAA5jRwnosMgZOFnMbxORCMhoi5tdLIiiDeyaQUtSadar8XKjXDTUdzRgrbb7QBBRD8o6u32wz1EH3G5UywMYmPh-1qw1hpURvXRqsms2W6128IAIXTMEzbrhue92fEegwwGQIEoUHr4jQmBw+C9pAo1BF9zF-bOpwp5IAftvN4gU1gbSAALYYMD9ODACTeXxssG0jEfHTsaruxDrjcfqcwG1gBe+KBwHcTonlA2C7Jeng+BE-Aaha3RuG4QA)

默认情况下，`${a},${b}` 的类型是 `string`。`${Play},${Play}` 是 `string` 的子类型，由用逗号分隔的九种可能的游戏对组成。我们可以应用通常的穷尽性检查技巧来确保我们覆盖了所有九种情况。在这种情况下，我们遗漏了一种，结果产生了类型错误。错误甚至包含了我们遗漏的组合！和之前一样，添加缺失的情况并保留断言，以防你以后添加额外的可能游戏。

虽然它比直接的穷尽性检查出现频率低，但这种技术偶尔有助于建模状态之间的转换。

typescript-eslint 规则 `switch-exhaustiveness-check` 也可以用于穷尽性检查。而 `assertUnreachable` 是选择加入的，linter 规则是选择退出的。如果你启用它，你可能会发现你的一些 switch 语句本来就不打算是穷尽的，或者它们由于难以在类型系统中捕获的原因而是穷尽的。你可以在其他打算穷尽的情况下使用 `assertUnreachable`，比如 if 语句。但你也可能会发现一些 bug，所以 linter 规则值得一试！

遗漏错误和委托错误同样重要。使用 `never` 类型和 `assertUnreachable` 技巧让 TypeScript 帮助你避免它们。

## 要点回顾

- 使用赋值给 `never` 类型来确保所有可能的类型值都被处理（"穷尽性检查"）。
- 为返回多个分支的函数添加返回类型注解。尽管如此，你仍然可能需要显式的穷尽性检查。
- 考虑使用模板字面量类型来确保每种两种或更多类型的组合都被处理。

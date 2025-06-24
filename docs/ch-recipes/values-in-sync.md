# Item 61: Use Record Types to Keep Values in Sync

## 要点

- Recognize the fail open versus fail closed dilemma.
- Use ++Record++ types to keep related values and types synchronized.
- Consider using ++Record++ types to force choices when adding new properties to an interface.
- 认识到"失败开放"（fail open）与"失败封闭"（fail closed）之间的两难问题。
- 使用 `Record` 类型来保持相关值和类型的同步。
- 在向接口添加新属性时，可以考虑使用 `Record` 类型来强制做出选择。

## 正文

假设你正在编写一个用于绘制散点图的 UI 组件。它有几个不同类型的属性来控制其显示和行为：

```ts
interface ScatterProps {
  // The data
  xs: number[]
  ys: number[]

  // Display
  xRange: [number, number]
  yRange: [number, number]
  color: string

  // Events
  onClick?: (x: number, y: number, index: number) => void
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoLmSUAKUD2ADgM7IDeAUMsgPQ3IAqAFigCaZxXIAexAXMhABXALYAjaAG0AugG4uAT36DREqDPlc6yACLBihADZwFXbgCU4IAOYQBk4eOgAaFU6hzFlm3eQPVLm5qntQI+Ib4UALEYFCg1prU2gCiAG4Q4MRc+CAAwobACADWAPwCABTcAo5qrgrVAVCuoKwQVUHQAJTIALwAfMip+MCs8gC+FEA)

为了避免不必要的工作，你希望只在需要时重绘图表。更改数据或显示属性将需要重绘，但更改事件处理器则不需要。

以下是你可能实现这种优化的一种方式：

```ts
function shouldUpdate(oldProps: ScatterProps, newProps: ScatterProps) {
  for (const kStr in oldProps) {
    const k = kStr as keyof ScatterProps
    if (oldProps[k] !== newProps[k]) {
      if (k !== 'onClick') return true
    }
  }
  return false
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoLmSUAKUD2ADgM7IDeAUMsgPQ3IAqAFigCaZxXIAexAXMhABXALYAjaAG0AugG4uAT36DREqDPlc6yACLBihADZwFXbgCU4IAOYQBk4eOgAaFU6hzFlm3eQPVLm5qntQI+Ib4UALEYFCg1prU2gCiAG4Q4MRc+CAAwobACADWAPwCABTcAo5qrgrVAVCuoKwQVUHQAJTIALwAfMip+MCs8gC+FDBCIAhgwDnIxEz4QoasAKqE7JDl2Wt4RMromNgHJM5cIBAA7mdHGFjQdxTdlNQwkcjlYSAxyEWoWLIUDIcKsO6vLihHJ-Iq9f6AqDIOCkIoQBT4GBoB6nAgkeTUajALHlMF3SRFaTIACEPR6ghu5MpkMJhOJXzhtPpAHIcvlCkVud0oBAwEIoCBkLEhBACYSJtQFcgRWKJch4IZiLKKBMgA)

（关于此循环中 `keyof` 断言的解释，请参见第 60 条。这个断言是安全的，因为我们不关心值的类型，只关心它们是否相等。）

当你或同事添加新属性时会发生什么？`shouldUpdate` 函数将在属性发生变化时重绘图表。你可能会称这种方法为保守的或"失败开放"（fail open）方法。好处是图表总是看起来正确。缺点是它可能被绘制得太频繁。

"失败封闭"（fail closed）方法可能看起来像这样：

```ts
function shouldUpdate(oldProps: ScatterProps, newProps: ScatterProps) {
  return (
    oldProps.xs !== newProps.xs ||
    oldProps.ys !== newProps.ys ||
    oldProps.xRange !== newProps.xRange ||
    oldProps.yRange !== newProps.yRange ||
    oldProps.color !== newProps.color
    // (no check for onClick)
  )
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoLmSUAKUD2ADgM7IDeAUMsgPQ3IAqAFigCaZxXIAexAXMhABXALYAjaAG0AugG4uAT36DREqDPlc6yACLBihADZwFXbgCU4IAOYQBk4eOgAaFU6hzFlm3eQPVLm5qntQI+Ib4UALEYFCg1prU2gCiAG4Q4MRc+CAAwobACADWAPwCABTcAo5qrgrVAVCuoKwQVUHQAJTIALwAfMip+MCs8gC+FDBCIAhgwDnIxEz4QoasAKqE7JDl2Wt4RMromNgHJM5cIBAA7mdHGFjQdxTdlNRQEGBCUCDIu9TUcKsO4AOl4yAAhD0eoIbqDwQAfBFcQH7AgkEFKSHQ2G3dHETGkJEo5BA+HeWzYmFXPGHMEUlDEgGktF0hQMqm40HsqyUpkAsn4kFhCJQTk00EiyIk7TlED4ZAIFjFZAwSKkvIFYqdLidcYUIA)

使用这种方法不会有任何不必要的重绘，但可能会有一些必要的绘制被遗漏。优化中的一个重要原则是"首先，不要造成伤害"。我们不应该为了性能而牺牲正确的行为。

两种方法都不理想。你真正想要的是在添加新属性时强制你的同事或未来的自己做出决定。你可能会尝试添加注释：

```ts
interface ScatterProps {
  xs: number[]
  ys: number[]
  // ...
  onClick?: (x: number, y: number, index: number) => void

  // Note: if you add a property here, update shouldUpdate!
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoLmSUAKUD2ADgM7IDeAUMsgPQ3IAqAFigCaZxXIAexAXMhABXALYAjaAG0AugG4uAT36DREqDPlc6yACLBihADZwFXbgCU4IAOYQBk4eOgAaFU6hzFlm3eQPVLm5qntQI+Ib4UALEYFCg1prU2gCiAG4Q4MRc+CAAwobACADWAPwCABTcAo5qrgrVAVCuoKwQVUHQAJTIALwAfMip+MCs8gC+FKDY8EhoGFjQeESklNS8De4aiso1UiG09AB0x9l5BcVlyJUbtcj1HU3ILW03Xb0DQyOJB8gAcviQATAGB3fBCZBwVisCHIQgEQjQMAKZAsKAQVxCQjsSDIYhMMGGVgAVSxmAgAEIKBMgA)

但你真的期望这会起作用吗？如果类型检查器能为你强制执行这一点会更好。

如果你设置得当，它可以做到。关键是使用具有正确键集的 `Record` 类型：

```ts
const REQUIRES_UPDATE: Record<keyof ScatterProps, boolean> = {
  xs: true,
  ys: true,
  xRange: true,
  yRange: true,
  color: true,
  onClick: false,
}

function shouldUpdate(oldProps: ScatterProps, newProps: ScatterProps) {
  for (const kStr in oldProps) {
    const k = kStr as keyof ScatterProps
    if (oldProps[k] !== newProps[k] && REQUIRES_UPDATE[k]) {
      return true
    }
  }
  return false
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoLmSUAKUD2ADgM7IDeAUMsgPQ3IAqAFigCaZxXIAexAXMhABXALYAjaAG0AugG4uAT36DREqDPlc6yACLBihADZwFXbgCU4IAOYQBk4eOgAaFU6hzFlm3eQPVLm5qntQI+Ib4UALEYFCg1prU2gCiAG4Q4MRc+CAAwobACADWAPwCABTcAo5qrgrVAVCuoKwQVUHQAJTIALwAfMip+MCs8gC+FGEgMcjmyQCKAKoAknOoAPqLODoAggzJAuYQYVCsADxFEAr4MGgYWNB4RMSuYvjhEFYDPeRmyrFCCDORT-KCA4HUCxWWwCAFArzQ3xwiHIMIRKLIZHZPIFYoCeCGYjwsaaGBCEAIMDAHLIYhMfBCQysRaEdiQcrZJlPEgCdCYbDcl5cEAQADugt59wFBBIFG6lGoMEiyHKUxmRVQsWQoGQ4VYgvlXFCOXVvWQGq1cFIl2utz5D1wMuI8mo1GAt3KesFkiK0mQAEIej8ReKnT6-QAyCOzBYrNabbZ7ZLhw2u11QCBgIRQECYsEQF2uibUYvIDNZnPIAlE8YUIA)

`keyof ScatterProps` 注解告诉类型检查器 `REQUIRES_UPDATE` 应该具有与 `ScatterProps` 相同的所有属性。关键的是，这些都是必需的属性。

现在如果将来你向 `ScatterProps` 添加新属性：

```ts
interface ScatterProps {
  // ...
  onDoubleClick?: () => void
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoLmSUAKUD2ADgM7IDeAUMsgPQ3IAqAFigCaZxXIAexAXMhABXALYAjaAG0AugG4uAT36DREqDPlc6yACLBihADZwFXbgCU4IAOYQBk4eOgAaFU6hzFlm3eQPVLm5qntQI+Ib4UALEYFCg1prU2gCiAG4Q4MRc+CAAwobACADWAPwCABTcAo5qrgrVAVCuoKwQVUHQAJTIALwAfMip+MCs8gC+FKDY8EhoGFjQeESklEn0AHSb2SA6+EJihhD5haUV3f2Dw6MUE0A)

那么这将在 `REQUIRES_UPDATE` 的定义中产生错误：

```ts
const REQUIRES_UPDATE: Record<keyof ScatterProps, boolean> = {
  //  ~~~~~~~~~~~~~~~ Property 'onDoubleClick' is missing in type ...
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoLmSUAKUD2ADgM7IDeAUMsgPQ3IAqAFigCaZxXIAexAXMhABXALYAjaAG0AugG4uAT36DREqDPlc6yACLBihADZwFXbgCU4IAOYQBk4eOgAaFU6hzFlm3eQPVLm5qntQI+Ib4UALEYFCg1prU2gCiAG4Q4MRc+CAAwobACADWAPwCABTcAo5qrgrVAVCuoKwQVUHQAJTIALwAfMip+MCs8gC+FKDY8EhoGFjQeESklEn0AHSb2SA6+EJihhD5haUV3f2Dw6MUE2EgMcjmyQCKAKoAkk+oAPqvODoAQQYyQE5ggYSgrAAPEUIAp8DA5phsEsSK4xPhwhArAMeuQtPRkAA-Emksnk5Co6BgBTIADkOV2+0Ox2KdOQ+mQIn0xHiHJAyBphBQm3WBOQuQA8gBZHBfVBmZSxIQQZyKJVQFVq6gWKy2ATK1VePW+Q3a5BhCJRQWao3UHKsooCeCGYh22j0ZIAOR0N00QA)

这肯定会强制解决这个问题！删除或重命名属性也会导致类似的错误。这是过度属性检查（第 11 条）在起作用，它让我们强制执行对象具有我们想要的属性集，不多不少。TypeScript 在经典的失败开放/失败封闭两难问题中给了我们第三个选择，即"直接失败"。

重要的是我们在这里使用了具有布尔值的对象。如果我们使用数组：

```ts
const PROPS_REQUIRING_UPDATE: (keyof ScatterProps)[] = [
  'xs',
  'ys',
  // ...
]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoLmSUAKUD2ADgM7IDeAUMsgPQ3IAqAFigCaZxXIAexAXMhABXALYAjaAG0AugG4uAT36DREqDPlc6yACLBihADZwFXbgCU4IAOYQBk4eOgAaFU6hzFlm3eQPVLm5qntQI+Ib4UALEYFCg1prU2gCiAG4Q4MRc+CAAwobACADWAPwCABTcAo5qrgrVAVCuoKwQVUHQAJTIALwAfMip+MCs8gC+FKDY8EhoGFjQeESklEn0AHSb2SA6+EJihhD5haUV3f2Dw6MUE2EgMcg45gDyOKgA+ubJAIoAqgCS5n+ADkAOLvX44HQAQQYyQqRQgCnwMDmmGwSxInRkvT8XAA5Lx8c4CUpiVoNltPEA)

那么我们将被迫进入同样的失败开放/失败封闭选择。

如果你希望一个对象具有与另一个对象完全相同的属性，那么 Record 和映射类型是理想的。在这里我们用它来避免经典的失败开放/失败封闭两难问题，但还有许多其他应用，例如要求应用程序状态中的每个属性都有对应的 URL 参数。

## 要点回顾

- 认识到"失败开放"（fail open）与"失败封闭"（fail closed）之间的两难问题。
- 使用 `Record` 类型来保持相关值和类型的同步。
- 在向接口添加新属性时，可以考虑使用 `Record` 类型来强制做出选择。

# 第 34 条：优先使用接口的联合类型，而不是属性为联合类型的接口

## 要点

- 拥有多个联合类型属性的接口通常是不好的设计，因为它会掩盖这些属性之间的关系。
- 多个接口组成的联合类型更精确，TypeScript 也能更好地理解。
- 使用“带标签的联合类型”（tagged unions）可以帮助 TypeScript 更好地进行控制流分析。这种模式在 TypeScript 中非常常见。
- 如果你有多个可选属性，可以考虑把它们组合成一个对象，以更准确地表达数据结构。

## 正文

如果你定义的接口中属性是联合类型，你应该考虑是否用多个更精确的接口组成的联合类型会更合理。

假设你在做一个矢量绘图程序，想为具有特定几何类型的图层定义接口：

```ts
interface Layer {
  layout: FillLayout | LineLayout | PointLayout
  paint: FillPaint | LinePaint | PointPaint
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEBUAsFMGdtAO2tAJqALge1AIwQJaIDGWAtgA4CGGBuANggGSimWMAeo0iWArgHNImHLwygB0cUXpE0oItwBOSrEtBk4sKpNgA6AFAYAnhQQAxAvXoAFKkXEBeUAG9L1uw4BcoAOS+AXwBuI1MEABk5T0QnV0jkaIwff2DQs1AbLAdE0GcXTOz7GOTAkJN093pwqmN+WLcrKpq6ktTyiLlq2r56+Ogulr9StIQCmIGe3NcxjAmkodSHaCUAMypiCJrl1wNQUHpmnp9KudAAH1A+04uZuZC96m9QSpyLvteMrJjEkICDIA)

`layout` 字段控制形状的绘制方式和位置（圆角还是直角？），而 `paint` 字段控制样式（线条是蓝色的？粗的？细的？虚线？）。

设计的初衷是 `Layer` 应该有匹配的 `layout` 和 `paint` 属性。比如 `FillLayout` 应该配 `FillPaint`，`LineLayout` 应该配 `LinePaint`。但目前这个 `Layer` 类型却允许 `FillLayout` 搭配 `LinePaint`，这容易导致使用时出错，也让接口不好用。

更好的做法是为每种图层类型分别定义接口：

```ts
interface FillLayer {
  layout: FillLayout
  paint: FillPaint
}
interface LineLayer {
  layout: LineLayout
  paint: LinePaint
}
interface PointLayer {
  layout: PointLayout
  paint: PointPaint
}
type Layer = FillLayer | LineLayer | PointLayer
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEBUAsFMGdtAO2tAJqALge1AIwQJaIDGWAtgA4CGGBuANggGSimWMAeo0iWArgHNImHLwygB0cUXpE0oItwBOSrEtBk4sKpNgA6AFAYAnhQQAxAvXoAFKkXEBeUAG9L1uw4BcoAOS+AXwBuI1MEABk5T0QnV0jkaIwff2DQs1AbLAdE0GcXTOz7GOTAkJN093pwqmN+WLcrKpq6ktTyiLlq2r56+Ogulr9StIQCmIGe3NcxjAmkodSHaCUAMypiC0au5dcDUFB6Zp6fSrmQ-epvUErEkICDJdX1juRt9Rc9g6P5vrPPy+KoD6twM90eaw2GSy4xqOw++0O3XmMz+FyKyOhGBB93aQNh6mcp3xoAAPkDOsSySj8SEgA)

通过这样定义 `Layer`，你排除了混合 `layout` 和 `paint` 属性的可能性。这就是遵循第 29 条建议——优先使用只表示有效状态的类型——的一个例子。

这种模式最常见的例子就是“带标签的联合类型”（tagged union，也叫判别联合）。在这种情况下，其中一个属性是字符串字面量类型的联合：

```ts
interface Layer {
  type: 'fill' | 'line' | 'point'
  layout: FillLayout | LineLayout | PointLayout
  paint: FillPaint | LinePaint | PointPaint
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEBUAsFMGdtAO2tAJqALge1AIwQJaIDGWAtgA4CGGBuANggGSimWMAeo0iWArgHNImHLwygB0cUXpE0oItwBOSrEtBk4sKpNgA6AFAYAnhQQAxAvXoAFKkXEBeUAG9L1uw4BcoAOS+AXwBuI1MEABk5T0QnV0jkaIwff2DQs1AbLAdE0GcXTOz7GOTAkJN093pwqmN+WLcrKpq6ktTyiLlq2r56+Ogulr9StIQCmIGe3NcxjAmkodSHaCUAMypiCJrl1wNQTDDklcbfUAAfP1lkE-PfCiyY3xC9+maen0q5s9A+z-OZuaeoGo3lAlRy5z64Iy9wwiRCAQMQA)

就像之前说的，`type` 是 `'fill'`，却配了 `LineLayout` 和 `PointPaint`，这显然不合理。
把 `Layer` 改成接口的联合类型，就能排除这种错误组合的可能性：

```ts
interface FillLayer {
  type: 'fill'
  layout: FillLayout
  paint: FillPaint
}
interface LineLayer {
  type: 'line'
  layout: LineLayout
  paint: LinePaint
}
interface PointLayer {
  type: 'paint'
  layout: PointLayout
  paint: PointPaint
}
type Layer = FillLayer | LineLayer | PointLayer
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEBUAsFMGdtAO2tAJqALge1AIwQJaIDGWAtgA4CGGBuANggGSimWMAeo0iWArgHNImHLwygB0cUXpE0oItwBOSrEtBk4sKpNgA6AFAYAnhQQAxAvXoAFKkXEBeUAG9L1uw4BcoAOS+AXwBuI1MEABk5T0QnV0jkaIwff2DQs1AbLAdE0GcXTOz7GOTAkJN093pwqmN+WLcrKpq6ktTyiLlq2r56+Ogulr9StIQCmIGe3NcxjAmkodSHaCUAMypiC0au5dcDUEww5JXG3xD9+maen0q5s9Bqb1BKxJCAgyXV9Y7kbfUXPYOZmSsmQpwBF268z6twBD2KoD6LwMbw+aw2GSy4xqO3++3ayThGDB50u8xmMP2hJ8MyRb3aCOx6mcN0ZoAAPgjOqyOeTGSEgA)

`type` 属性就是“标签”或“判别符”。它在运行时可以访问，并且为 TypeScript 提供足够的信息来确定你正在操作联合类型中的哪一个分支。在这里，TypeScript 能根据这个标签，在 `if` 语句中缩小 `Layer` 的类型：

```ts
function drawLayer(layer: Layer) {
  if (layer.type === 'fill') {
    const { paint } = layer
    //     ^? const paint: FillPaint
    const { layout } = layer
    //     ^? const layout: FillLayout
  } else if (layer.type === 'line') {
    const { paint } = layer
    //     ^? const paint: LinePaint
    const { layout } = layer
    //     ^? const layout: LineLayout
  } else {
    const { paint } = layer
    //     ^? const paint: PointPaint
    const { layout } = layer
    //     ^? const layout: PointLayout
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEBUAsFMGdtAO2tAJqALge1AIwQJaIDGWAtgA4CGGBuANggGSimWMAeo0iWArgHNImHLwygB0cUXpE0oItwBOSrEtBk4sKpNgA6AFAYAnhQQAxAvXoAFKkXEBeUAG9L1uw4BcoAOS+AXwBuI1MEABk5T0QnV0jkaIwff2DQs1AbLAdE0GcXTOz7GOTAkJN093pwqmN+WLcrKpq6ktTyiLlq2r56+Ogulr9StIQCmIGe3NcxjAmkodSHaCUAMypiC0au5dcDUEww5JXG3xD9+maen0q5s9Bqb1BKxJCAgyXV9Y7kbfUXPYOZmSsmQpwBF268z6twBD2KoD6LwMbw+aw2GSy4xqO3++3ayThGDB50u8xmMP2hJ8MyRb3aCOx6mcN0ZoAAPgjOqyOeTGSEVnwSLQsIhQKglFQAO6-AAUEOWPl+AEpdvsCCtQHLGXp6Y49X5jtZfCrcftWCLYOIXISAlN5Uo7vsQGb9gA9AD85sQlvuRXmzz9AP2pG9VohdVtzntjtAzpdHq9PvDVyeW1JANt0Ho8AUGq1xmWOrCuX1vhB0GNqrNIZ91r9kdA0aDsbA8c9NfEVM5CUDLo7rmTGAbTZdcbNCf7g8VXMhGe42YQpuDFqtNrtfObY7d7ZXvseNN71d3LkHw43o9b453ocbpOpmNm6f2bzeQA)

通过正确建模这些属性之间的关系，你帮助 TypeScript 更好地检查代码的正确性。如果用最初的 `Layer` 定义，代码里可能会充满各种类型断言。

因为带标签的联合类型和 TypeScript 的类型检查器配合得非常好，它们在 TypeScript 代码中无处不在。学会识别这种模式，能用时就用。如果你能用带标签的联合类型来表示一个数据类型，通常这是个好选择。

如果把可选字段看作它们类型和 `undefined` 的联合类型，那它们也符合“属性为联合类型的接口”这种模式。来看下面这个类型：

```ts
interface Person {
  name: string
  // These will either both be present or not be present
  placeOfBirth?: string
  dateOfBirth?: Date
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmA3EcgPRvIAqAFhBigDuwADYjkEYGD5RkAIyzT5KAA5R+EcMiyyQi5cjUbwrFSMQQA8jABCwKNID81WvRDNWAEziRrdhzzOyAAiPhAsAL4EQA)

正如第 31 条所说，带有类型信息的注释通常表明这里可能存在问题。`placeOfBirth` 和 `dateOfBirth` 这两个字段之间有某种关系，但你没有告诉 TypeScript。

更好的做法是把这两个属性合并到一个对象里。这类似于把 null 值推到边缘（见第 33 条）：

```ts
interface Person {
  name: string
  birth?: {
    place: string
    date: Date
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmA3EcgEbBRgAWA-NYWLEADgBtEVGnUYshyACZxI1ACJKIs5AF8COoA)

现在 TypeScript 会对有出生地但没有出生日期的值发出警告：

```ts
const alanT: Person = {
  name: 'Alan Turing',
  birth: {
    // ~~~~ Property 'date' is missing in type
    //      '{ place: string; }' but required in type
    //      '{ place: string; date: Date; }'
    place: 'London',
  },
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmA3EcgEbBRgAWA-NYWLEADgBtEVGnUYshyACZxI1ACJKIs5AF8COhDlrI44kABVq6KNlwBefK1IVqAcgCCJ5KYCu9EA2cANKwcXNwCBAD0EcgAfnExaFBYwtBgAJ7IzoqQzsjAGMhk+RiMebjpKZHRcpl4yGIS1LS+zNq5bF5gyFAQAI5enBDyZcgVEFU1tfXiSE3SfkwK6qrqi1rOrCIzks4AMjjyOBvEOjpAA)

而且，接收 `Person` 对象的函数只需要做一次检查就够了：

```ts
function eulogize(person: Person) {
  console.log(person.name)
  const { birth } = person
  if (birth) {
    console.log(`was born on ${birth.date} in ${birth.place}.`)
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmA3EcgEbBRgAWA-NYWLEADgBtEVGnUYshyACZxI1ACJKIs5AF8COmAFcQCMMBzII+0VgbAAXhAAUwzDmroo2EAEp8rBDmxRCAA6KwYnFxBg0govTX8QWnwOLm4tZABeZGcPHE1gGGQHFJ4fQSEEwJCwhwADAHc4DHYsKFwzABI8Eu5gxUh00GQunuCxCS1g2rjWHR0gA)

如果这个类型的结构不是你能控制的（比如来自某个 API），你仍然可以用我们之前讲过的接口联合类型来建模这两个字段之间的关系：

```ts
interface Name {
  name: string
}

interface PersonWithBirth extends Name {
  placeOfBirth: string
  dateOfBirth: Date
}

type Person = Name | PersonWithBirth
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgHJwLYoN4ChnIiYQBcyAzmFKAOYDcuAvrrqJLIigArTkD2IAOrAwACwBCwKGOQQAHpBAATcmmLI8BAA4AbTgHkYk6aLKVqIevmRK4kQ8bFkAInYgNmuMAE8t3XgLIALxqWMgAPsg8UPxCIhJSYgxAA)

这样你就能获得和嵌套对象类似的一些好处：

```ts
function eulogize(person: Person) {
  if ('placeOfBirth' in person) {
    person
    // ^? (parameter) person: PersonWithBirth
    const { dateOfBirth } = person // OK
    //     ^? const dateOfBirth: Date
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgHJwLYoN4ChnIiYQBcyAzmFKAOYDcuAvrrqJLIigArTkD2IAOrAwACwBCwKGOQQAHpBAATcmmLI8BAA4AbTgHkYk6aLKVqIevmRK4kQ8bFkAInYgNmuMAE8t3XgLIALxqWMgAPsg8UPxCIhJSYgwwAK4gCGDAgRApOnw0wABeEAAUfjECZNGxAJQa1sAwyCUA5LoGRomiLcigyOW19QTaASDWBAD0E8gAegD8zVpwUMTsdQOVUaPCYo6i48gIApQatvadJozB-aN0k9P6ANIHU8ME84fHYDZuDl0ubmszGYQA)

无论哪种情况，类型定义都更清晰地表达了属性之间的关系。

虽然可选属性经常很有用，但在给接口添加可选属性之前，最好三思。第 37 条会详细讲可选字段的更多弊端。

## 关键点总结

- 拥有多个联合类型属性的接口通常是不好的设计，因为它会掩盖这些属性之间的关系。
- 多个接口组成的联合类型更精确，TypeScript 也能更好地理解。
- 使用“带标签的联合类型”（tagged unions）可以帮助 TypeScript 更好地进行控制流分析。这种模式在 TypeScript 中非常常见。
- 如果你有多个可选属性，可以考虑把它们组合成一个对象，以更准确地表达数据结构。

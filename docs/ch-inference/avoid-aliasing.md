# 第 23 条：使用别名时要保持一致

## 要点

- 类型别名可能会阻止 TypeScript 缩小类型范围。如果为变量创建了别名，应该始终如一地使用它。
- 了解函数调用如何使属性上的类型细化失效。相比属性，应该更信任局部变量上的类型细化。

## 正文

当你为某个值引入一个新名字时：

```ts
const place = { name: 'New York', latLng: [41.6868, -74.2692] }
const loc = place.latLng
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBADgGwIbAKYwLwwN5iQW1QC4YByAOVQHcYBNEAJwGtSAaGZKAGTAHMSA2gBYAjADoAbAA5p7ALQB2IWIBMEgJwqAugF8A3AChQkWAhDBM8ZGjGcevQ0A)

你就创建了一个“别名”。对这个别名属性的修改会反映到原始对象上：

```js
loc[0] = 0

place.latLng
// => [0, -74.2692]
```

如果你用过带有指针或引用类型的语言（比如 C++ 或 Java），这就是类似的概念：两个变量指向了同一个底层对象。

对编译器作者来说，别名是个大麻烦，因为它会让代码的控制流分析变得更困难。但如果你**有意识地使用别名**，TypeScript 就能更好地理解你的代码，帮助你发现更多真实的问题。

假设你有一个表示多边形的数据结构：

```ts
interface Coordinate {
  x: number
  y: number
}

interface BoundingBox {
  x: [number, number]
  y: [number, number]
}

interface Polygon {
  exterior: Coordinate[]
  holes: Coordinate[][]
  bbox?: BoundingBox
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHt1QCajpZAbwChlkAPALmRAFcBbAI2gG5TkBPaup14gX2LFQkWIhQAhdLRC4QAcynki7KsgDaPZlAA0NBtoC6bMlw1boei1GMChI6PCTIACugA2HeehAqyEclFgLGoMLDl8CHVbMgALDwgAZ1DMHDxIaOiTZEZGdHIAfmopGTlFfLZBIA)

多边形的几何结构是通过 `exterior` 和 `holes` 属性来定义的。（`holes` 是一个数组，用来表示像甜甜圈那样中间有空洞的图形。）`bbox` 属性是一个可选的优化项，用来提升性能，比如在进行“点是否在多边形内”的判断时，可以加速处理过程。

```ts
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  if (polygon.bbox) {
    if (
      pt.x < polygon.bbox.x[0] ||
      pt.x > polygon.bbox.x[1] ||
      pt.y < polygon.bbox.y[0] ||
      pt.y > polygon.bbox.y[1]
    ) {
      return false
    }
  }

  // ... more complex check
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHt1QCajpZAbwChlkAPALmRAFcBbAI2gG5TkBPaup14gX2LFQkWIhQAhdLRC4QAcynki7KsgDaPZlAA0NBtoC6bMlw1boei1GMChI6PCTIACugA2HeehAqyEclFgLGoMLDl8CHVbMgALDwgAZ1DMHDxIaOiTZEZGdHIAfmopGTlFfLZBGBkEMGDfYES3EQBJEDdPbxAACgAHDy8fag7BkD1esBTw9IgASj9kYBhkPoGugDpc-PmSMjIllYn15QAeZH7On0288mP1AAZDZAAfZ-OwY+QAPnO1q63buR1ABGJ6vdh7PZHDjIM4XUbXfLrDgPMFvaHfX6XECI24o0E7CF7KAQMC0KC+eDuRIQbJkQT0oRkAD0zOQ6w5yHoWBQCHQ9F67gCyAQsQgCAA1nYgA)

这段代码虽然能正常运行（也通过了类型检查），但有点重复啰嗦：`polygon.bbox` 在三行代码中出现了五次！我们可以尝试引入一个中间变量来减少重复：

```ts
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  const box = polygon.bbox
  if (polygon.bbox) {
    if (
      pt.x < box.x[0] ||
      pt.x > box.x[1] ||
      //     ~~~                ~~~  'box' is possibly 'undefined'
      pt.y < box.y[0] ||
      pt.y > box.y[1]
    ) {
      //     ~~~                ~~~  'box' is possibly 'undefined'
      return false
    }
  }
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHt1QCajpZAbwChlkAPALmRAFcBbAI2gG5TkBPaup14gX2LFQkWIhQAhdLRC4QAcynki7KsgDaPZlAA0NBtoC6bMlw1boei1GMChI6PCTIACugA2HeehAqyEclFgLGoMLDl8CHVbMgALDwgAZ1DMHDxIaOiTZEZGdHIAfmopGTlFfLZBGBkEMGDfYES3EQBJEDdPbxAACgAHDy8fag7BkD1esBTw9IgASj9kBB9EsBz85ABeZH7OnwA6XIr2YBhkPoGug7zyeZIyMhOzib3lAB418hf1AAZDZAAff7bMAvZAAPg+XwAjH9Aex7vcAPSIhHIAB+GNRWNRGLRZAA5Nd8chGtt0IlEsBGJ5kPjShAYKAINh8fDUc8OMh3tc9hwfrCgRzwZC+TDbmyEcicZjsbLcQSiSTEmSKVSaXTZAymSyJcgoBAwLQoL54O5EhBsmRBFb2FK9va7EA)

这段代码依然能运行，但为什么会报错呢？原因在于你通过引入 `box` 变量，为 `polygon.bbox` 创建了一个别名，而这**破坏了原本在第一版代码中悄悄起作用的控制流分析**。

你可以查看 `box` 和 `polygon.bbox` 的类型，来看看发生了什么：

```ts
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  polygon.bbox
  //      ^? (property) Polygon.bbox?: BoundingBox | undefined
  const box = polygon.bbox
  //    ^? const box: BoundingBox | undefined
  if (polygon.bbox) {
    console.log(polygon.bbox)
    //                  ^? (property) Polygon.bbox?: BoundingBox
    console.log(box)
    //          ^? const box: BoundingBox | undefined
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHt1QCajpZAbwChlkAPALmRAFcBbAI2gG5TkBPaup14gX2LFQkWIhQAhdLRC4QAcynki7KsgDaPZlAA0NBtoC6bMlw1boei1GMChI6PCTIACugA2HeehAqyEclFgLGoMLDl8CHVbMgALDwgAZ1DMHDxIaOiTZEZGdHIAfmopGTlFfLZBGBkEMGDfYES3EQBJEDdPbxAACgAHDy8fag7BkD1esBTw9IgASj9kfs6fADpc-PYAek2yXeQAPQLkPqh0XugwDnmRrrW8wuLpWVBy5QAfZFKIGFAIbHYED5EmAcvlkABeRYDW7rcjZbZ7Q7IQEgYGgtQlZ4KJTID5fH4gP7sYAwY5LUZ3fLzEh7FGJBIrdzoeR9aGrWGzbJkBF7Xl8shIk5nC5XVxskCUh7ITFlJTsMh0hlMln3Tny5A8-kHI50kH3R6lF44vGyb6-f5kQSCIA)

属性检查确实缩小了 `polygon.bbox` 的类型，但并没有改变 `box` 的类型，这就导致了错误。这也引出了别名的黄金法则：**既然你创建了一个别名，就要始终如一地使用它。**

在属性检查时直接使用 `box` 就可以解决这个问题：

```ts
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  const box = polygon.bbox
  if (box) {
    if (
      pt.x < box.x[0] ||
      pt.x > box.x[1] ||
      pt.y < box.y[0] ||
      pt.y > box.y[1]
    ) {
      // OK
      return false
    }
  }
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHt1QCajpZAbwChlkAPALmRAFcBbAI2gG5TkBPaup14gX2LFQkWIhQAhdLRC4QAcynki7KsgDaPZlAA0NBtoC6bMlw1boei1GMChI6PCTIACugA2HeehAqyEclFgLGoMLDl8CHVbMgALDwgAZ1DMHDxIaOiTZEZGdHIAfmopGTlFfLZBGBkEMGDfYES3EQBJEDdPbxAACgAHDy8fag7BkD1esBTw9IgASj9kBB9EsBz85ABeZH7OnwA6XIr2YBhkbrzyeZIyMhOzib3lAB418kf1AAZDZAAfH+2wI9kAA+V7vACM3z+7BuNweHGQLwuew4nyh-3hILBqMhVzIAHp8cgAPIAaRhNygEDAtCgvng7kSEGyZEErPYhOQe25diAA)

类型检查器现在没意见了，但对人类读者来说可能有点混乱：我们用了两个名字表示同一个东西——`box` 和 `bbox`。这其实是“无意义的区分”（参考第 41 条）。

使用对象解构语法可以让我们写出更简洁、命名一致的代码，甚至可以用在数组和嵌套结构上：

```ts
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  const { bbox } = polygon
  if (bbox) {
    const { x, y } = bbox
    if (pt.x < x[0] || pt.x > x[1] || pt.y < y[0] || pt.y > y[1]) {
      return false
    }
  }
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHt1QCajpZAbwChlkAPALmRAFcBbAI2gG5TkBPaup14gX2LFQkWIhQAhdLRC4QAcynki7KsgDaPZlAA0NBtoC6bMlw1boei1GMChI6PCTIACugA2HeehAqyEclFgLGoMLDl8CHVbMgALDwgAZ1DMHDxIaOiTZEZGdHIAfmopGTlFfLZBGBkEMGDfYES3EQBJEDdPbxAACgAHDy8fag7BkD1esBTw9IgASj9kBB9EsCJc-P5kAF5kfs6fbOAYZG718nmSMjIlkBWicj0OTZ2z7LIjk4mAOmUAHgp1AAGQzIAA+oN2YB+yAAfACAIwg8GQr4cZD-DhApEQ75ouGYxEXdhXZBQCBgWhQXzwdyJCBvZCCMhM5AAelZyC+XLsQA)

另外几点补充说明：

- 如果 `x` 和 `y` 属性是可选的，那么我们就需要对它们分别做空值检查；而现在 `bbox` 整体是可选的，这让代码更简单。这呼应了第 33 条建议：**让 null 值尽量靠近类型边界**。
- `bbox` 是可选属性很合理，但 `holes` 就不应该是可选的。因为如果 `holes` 是可选的，它既可能是 `undefined`，也可能是空数组 `[]`，这就造成了“无意义的区分”。直接用空数组表示“没有洞”已经足够了。

使用别名时要注意，运行时也可能引发混乱：

```ts
const { bbox } = polygon
if (!bbox) {
  calculatePolygonBbox(polygon) // Fills in polygon.bbox
  // Now polygon.bbox and bbox refer to different values!
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHt1QCajpZAbwChlkAPALmRAFcBbAI2gG5TkBPaup14gX2LFQkWIhQAhdLRC4QAcynki7KsgDaPZlAA0NBtoC6bMlw1boei1GMChI6PCTIACugA2HeehAqyEclFgLGoMLDl8CHVbMgALDwgAZ1DMHDxIaOiTZEZGdHIAfmopGTlFfLZBAHoq5AAJAEkAEQBRYgQfRLBkAAcPLx9qN09vXwBeImQAoJCNQz149yTqaOR+NhgZBDBg3wQ4dwRad0jhgZAJPPIACj6Rwdd+0YBKImraloA5JvbO7sJcvl+MgJndzmxgDBkNcAISA8ivEhkfaHY6nJ4+S75W4YkDPFhkGrIABiwHc7kSyFAvVxADp4ewiZ90AB3Gn3ED0q7IOCyHLcqAQGDQZBgdDIXAwYWC8DIABuB1oSRhdmIQA)

TypeScript 在局部变量上的控制流分析做得很好。但对于属性，就要小心了：

```ts
function expandABit(p: Polygon) {
  /* ... */
}

polygon.bbox
//      ^? (property) Polygon.bbox?: BoundingBox | undefined
if (polygon.bbox) {
  polygon.bbox
  //      ^? (property) Polygon.bbox?: BoundingBox
  expandABit(polygon)
  polygon.bbox
  //      ^? (property) Polygon.bbox?: BoundingBox
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHt1QCajpZAbwChlkAPALmRAFcBbAI2gG5TkBPaup14gX2LFQkWIhQAhdLRC4QAcynki7KsgDaPZlAA0NBtoC6bMlw1boei1GMChI6PCTIACugA2HeehAqyEclFgLGoMLDl8CHVbMgALDwgAZ1DMHDxIaOiTZEZGdHIAfmopGTlFfLZBAHoq5AAJAEkAEQBRYgQfRLBkAAcPLx9qN09vXwBeImQAoJCNQz149yTqaOR+NhgZBDBg3wQ4dwRad0jhgZAJPPIACj6Rwdd+0YBKImraloA5JvbO7sJcvl+MgJndzmxgDBkNcAISA8ivEhkfaHY6nJ4+S75W4YkDPFhkGrIABiwHc7kSyFAvVxADp4ewiZ90AB3Gn3ED0q7IOCyHLcqAQGDQZBgdDIXAwYWC8DIABuB1oSRhdmImxA212U3IPV52AAghJgGBbkNcYjkFUAFTIWl25BW2qCYhg0Zc-LEIlkb0APQK0J6UHQPWgYA4rzObvhRWQJVkoHKygAPshSkLQBBsMIoTiOe6EX52ed84zat6yH6A0GQ1AwxG6dHitJ4wolOwArrZIbjbnzvj2K6fCXCWXy5XbtXQ+HHnnG7Hm2U24IgA)

调用 `expandABit(polygon)` 可能会改变 `polygon.bbox`，所以理论上类型应该退回为 `BoundingBox | undefined`。但 TypeScript 为了减少麻烦，默认认为函数不会破坏类型缩小（更详细情况见第 48 条）。

如果你事先用了局部变量 `bbox` 而不是一直用 `polygon.bbox`，那么 `bbox` 的类型会保持准确，但它可能已经和原对象脱钩。如果你担心这种副作用，**最好的做法是传递一个只读版本的 polygon（参考第 14 条）**。这样可以防止对象被修改，也提高了类型安全性。

这种问题主要出现在对象（包括数组）这种可变类型上；对于数字、字符串等原始类型则不用担心，因为它们本身就是不可变的。

## 关键点总结

- 类型别名可能会阻止 TypeScript 缩小类型范围。如果为变量创建了别名，应该始终如一地使用它。
- 了解函数调用如何使属性上的类型细化失效。相比属性，应该更信任局部变量上的类型细化。

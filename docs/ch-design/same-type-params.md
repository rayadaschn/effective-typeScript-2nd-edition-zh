# 第 38 条：避免重复的同类型参数

## 要点

- Avoid writing functions that take consecutive parameters with the same TypeScript type.
- Refactor functions that take many parameters to take fewer parameters with distinct types, or a single object parameter.
- 避免编写接受连续具有相同 TypeScript 类型的参数的函数。
- 重构接受多个参数的函数，使其接受较少的参数且具有不同的类型，或者将这些参数合并为一个单一的对象参数。

## 正文

这个函数调用到底做了什么？

```ts
drawRect(25, 50, 75, 100, 1)
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAEwE4EMDuAlAptACgA8AuRMEAWwCNdUAaRATzIprsc1atocQAtu7PnAAO6CDCgtyPOgEpEAbwBQiRAHoNiAHR6VAXxVoseQgCYArI0sAGRgHZriAIy37r+QG4VQA)

如果不去看函数的参数列表，你根本没法确定它的作用。下面是几种可能的解释：

- 它绘制了一个宽 75、高 100 的矩形，左上角在 (25, 50)，不透明度为 1.0；
- 它绘制了一个从 (25, 50) 到 (75, 100) 的对角矩形，线宽为 1 像素；

没有更多上下文，你很难判断这个函数是否被正确调用。而且因为所有参数类型都是 `number`，如果你把顺序搞错了，或者把宽高当成了坐标传进去，类型检查器也帮不了你。

假设这是它的函数声明：

```ts
function drawRect(x: number, y: number, w: number, h: number, opacity: number) {
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAEwE4EMDuAlAptACgA8AuRMEAWwCNdUAaRATzIprsc1atocQAtu7PnAAO6CDCgtyPOgEpEAbwBQiRAHoNiAHR6VAXxVA)

任何接受一串相同类型参数的函数都容易出错，因为类型检查器无法发现参数顺序搞错的问题。改进的方法之一是将参数封装成不同的类型，比如 `Point` 和 `Dimension`：

```ts
interface Point {
  x: number
  y: number
}
interface Dimension {
  width: number
  height: number
}
function drawRect(topLeft: Point, size: Dimension, opacity: number) {
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgAoHtRmQbwFDLIAeAXMiAK4C2ARtANwHICeZltDeAvnltPEmQARYFQggAzsHQhcTAO7AAJmAAWbanSiNCqiMADmqsBo7bueGBRAIw02Uqhx5AJQi2AFGHQAHADIQMCZomOAANMhSAF4QZCJikvYRvojAYKzkmtAAlHKEAPT5yAB0pRZAA)

因为这个函数现在接收的是三个参数，并且它们分别属于三种不同的类型，类型检查器就能区分它们了。如果你错误地传入了两个 `Point` 类型的参数，编译器就会报错：

```ts
drawRect({ x: 25, y: 50 }, { x: 75, y: 100 }, 1.0)
//                        ~
// Argument ... is not assignable to parameter of type 'Dimension'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgAoHtRmQbwFDLIAeAXMiAK4C2ARtANwHICeZltDeAvnltPEmQARYFQggAzsHQhcTAO7AAJmAAWbanSiNCqiMADmqsBo7bueGBRAIw02Uqhx5AJQi2AFGHQAHADIQMCZomOAANMhSAF4QZCJikvYRvojAYKzkmtAAlHKEAPT5yAB0pRaOzm6eOKTIAEwArBEZDQAMXBE1ZADsTSxkAIyt7REDxa3ZjIWEM7Nz87MAfnjTAIJQBtTi2KXFyMAS5OjYcBJSBiBwNAA2KN7IPnBOYpBQyOgwyOk+KADk8eIpDJfsU8EA)

另一种解决方案是把所有参数合并到一个对象里：

```ts
interface DrawRectParams extends Point, Dimension {
  opacity: number
}
function drawRect(params: DrawRectParams) {
  /* ... */
}

drawRect({ x: 25, y: 50, width: 75, height: 100, opacity: 1.0 })
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgAoHtRmQbwFDLIAeAXMiAK4C2ARtANwHICeZltDeAvnltPEmQARYFQggAzsHQhcTAO7AAJmAAWbanSiNCqiMADmqsBo7buvcP0QohUOPIBKEBGFRx7VCcghFIIJW8MLAAaYVFxKRk5QnQAB0RgMFZyTU4eGAoQV2lZJXsnFzAACgTPCTI7B2dXd3KASlxkAHoAKmQAOi7kVubkHjx86qLinFJkACYAVjCUqYAGMMUVdWQAdhnkPUNjMgBGecXkeMTk-Y75rnrGIA)

把函数改成接受一个对象而不是一堆位置参数，可以让代码更清晰易懂。给每个数字都加上名字，类型检查器也能更好地帮你发现调用错误。

随着代码演进，函数的参数可能会越来越多。即使一开始位置参数没问题，参数多了之后它们就会变成麻烦。俗话说：“一个函数有 10 个参数，说明设计肯定有问题。”当函数参数超过 3、4 个时，就应该考虑重构减少参数数量。（TypeScript ESLint 的 `max-params` 规则可以帮你检测这个）

参数类型相同的时候，更要警惕位置参数带来的问题，哪怕只有两个参数也可能出错。

当然，这条规则有几个例外：

- 如果参数是可交换的（顺序无所谓），比如 `max(a, b)` 和 `isEqual(a, b)`，就没问题，调用很明确。
- 如果参数有“自然顺序”，混淆的可能性会降低，比如 `array.slice(start, stop)` 比 `slice(stop, start)` 更合理。但也别太绝对，不同开发者对“自然顺序”的理解可能不同（比如日期是“年-月-日”，还是“月-日-年”）。

正如 Scott Meyers 在《Effective C++》里写的：“让接口使用起来既简单又不容易出错。”这话没毛病！

## 关键点总结

- 避免写接受一串相同 TypeScript 类型参数的函数。
- 参数多时，重构成参数更少、类型不同的参数，或者用一个对象参数。

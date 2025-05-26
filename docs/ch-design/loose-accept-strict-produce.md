# 第 30 条：对输入要宽容，对输出要严格

## 要点

- 输入类型通常比输出类型更宽松。参数类型里可选属性和联合类型更常见，而返回类型应尽量避免。
- 避免返回类型太宽泛，因为这会让调用者用起来很麻烦。
- 如果参数和返回值需要共用类型，给返回值定义一个标准的“规范”格式，参数用更宽松的类型。
- 如果你只需要遍历函数参数，使用 `Iterable<T>` 替代 `T[]`。

## 正文

条目 30：对输入要宽容，对输出要严格

这个观点被称为**健壮性原则**，也叫 **Postel 定律**，源自 Jon Postel 在设计 TCP 网络协议时的建议：

> “在你做的事情上要保守，在你接收的内容上要宽容。”

这个原则同样适用于函数的“契约”。你的函数在**接收输入时可以灵活**一些，但在**返回输出时应该更严格、更明确**。

举个例子，一个 3D 地图的 API 可能提供了设置摄像头和根据边界框计算视图的方法：

```ts
declare function setCamera(camera: CameraOptions): void
declare function viewportForBounds(bounds: LngLatBounds): CameraOptions
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMJwLbTgeQA5jAD2IAzsgN4BQyyS40A-AFzIAyIA5m3GANw1kALyJEMLZCACuGAEbQBteXCihOE6XIWC8wMAgAWGmfKgCAvlTABPPCg7deyALyCKyADZdWm030+8PiYKyObIAD5uniRBWmYBYLF+oRGCANq+0AA0ksFQALoCNnbsXDxgAEJEUiAAJuSutBQgRFBgBhBwpImljmA5pNXtAO4Q3awO5WGRtGmTvDnzYPmps5lQOeubedtxhVS1EAgeKigwNQiEJMikEGDoWFBwABQImNisD9j4V2QAlKwAG5EYC1ASHY6nZDnECXYggZCA4AQYZ4VpgABirSqNXqz1k1TqpAmZV4OKJALQ7yeP3hpAEQA)

这样我们就可以直接把 `viewportForBounds` 的结果传给 `setCamera`，非常方便。

下面我们来看看这些类型的定义：

```ts
interface CameraOptions {
  center?: LngLat
  zoom?: number
  bearing?: number
  pitch?: number
}
type LngLat =
  | { lng: number; lat: number }
  | { lon: number; lat: number }
  | [number, number]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMJwLbTgeQA5jAD2IAzsgN4BQyyS40A-AFzIAyIA5m3GANw1kALyJEMLZCACuGAEbQBteXCihOE6XIWC8wMAgAWGmfKgCAvlTABPPCg7deyALyCKyADZdWm030+8PiYKyObIAD5uniRBWmYBYLF+oRGCANq+0AA0ksFQALoCQA)

`CameraOptions` 类型里的字段都是可选的，这是因为有时候你可能只想设置中心点（center）或缩放级别（zoom），而不想改动方向（bearing）或倾斜角度（pitch）。

`LngLat` 类型也体现了“对输入宽容”的原则：你可以传一个 `{lng, lat}` 对象，也可以传 `{lon, lat}` 对象，甚至可以传一个 `[lng, lat]` 的数组（只要你确定顺序没搞错）。这些灵活性让函数调用起来非常方便。

`viewportForBounds` 函数的参数也是一种“宽容”的类型：

```ts
type LngLatBounds =
  | { northeast: LngLat; southwest: LngLat }
  | [LngLat, LngLat]
  | [number, number, number, number]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMJwLbTgeQA5jAD2IAzsgN4BQyyS40A-AFzIAyIA5m3GANw1kALyJEMLZCACuGAEbQBteXCihOE6XIWC8wMAgAWGmfKgCAvlTABPPCg7deyALyCKyADZdWm030+8PiYKyObIAD5uniRBWmYBYLF+oRGCANq+0AA0ksFQALoCNnbsXDxgAEJEUiAAJuSutBQgRFBgBhBwpImljmA5pNXtAO4Q3awO5WGRtGmTvDnzYPmps5lQOeubedtxhVRAA)

你可以用多种方式来指定边界：使用命名的角点、一对经纬度，或者是四元组（只要你确定顺序没错）。由于 `LngLat` 本身就支持三种格式，所以 `LngLatBounds` 理论上有多达 19 种写法（3 × 3 + 3 × 3 + 1），可谓相当“宽容”！

现在我们来写一个函数，用来调整视图范围以适应一个 GeoJSON 要素，并把新的视图参数存储到 URL 中（我们假设已有一个辅助函数可以计算 GeoJSON 要素的边界框）：

```ts
function focusOnFeature(f: Feature) {
  const bounds = calculateBoundingBox(f) // helper function
  const camera = viewportForBounds(bounds)
  setCamera(camera)
  const {
    center: { lat, lng },
    zoom,
  } = camera
  // ~~~      Property 'lat' does not exist on type ...
  //      ~~~ Property 'lng' does not exist on type ...
  zoom
  // ^? const zoom: number | undefined
  window.location.search = `?v=@${lat},${lng}z${zoom}`
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMJwLbTgeQA5jAD2IAzsgN4BQyyS40A-AFzIAyIA5m3GANw1kALyJEMLZCACuGAEbQBteXCihOE6XIWC8wMAgAWGmfKgCAvlTABPPCg7deyALyCKyADZdWm030+8PiYKyObIAD5uniRBWmYBYLF+oRGCANq+0AA0ksFQALoCNnbsXDxgAEJEUiAAJuSutBQgRFBgBhBwpImljmA5pNXtAO4Q3awO5WGRtGmTvDnzYPmps5lQOeubedtxhVS1EAgeKigwNQiEJMikEGDoWFBwABQImNisD9j4V2QAlKwAG5EYC1ASHY6nZDnECXYggZCA4AQYZ4VpgABirSqNXqz1k1TqpAmZV4OKJALQ7yeP3hpCKthQGM6YCkUBQzmQcBA1nBRxO7OhF1+dDgHgQUhOkHJtTUVQAHs8YKxmbw2RBKRkdrk4rtTHroPsYXDrjAiBLSDgQKrWeylSqWeq-pRBAgSN1kATcQ1ReLJbwIDK5URFTA-v4APQR5AdDx2KBC2G-V3usCix5wFyI5Go9FYqAy0j4wn1cOCW73akvN4Zsu0N1kNMUeiQKCsChSnJeTjmHIiMRhTk17CKWhj8cTqPIAB+s4nyAAClAiPGbMgAORS9fIWpEMaSIhpiDy4Ae67FFAAOmvgnnd6nE9n08Xy9X1g33e3u-3LSPJ7PCIXsg16XoI-YYKOU4AHqMHQqbCKIGBJNAETILiEAwKAEC1IIwygLuwyXh45q8PCl63CohhZgABowgLOAAAgAJB2vC9ix3bmEILHgeY1EWFQQA)

不幸的是！返回结果里只有 `zoom` 属性存在，但它的类型被推断成了 `number | undefined`，这也会带来问题。问题在于 `viewportForBounds` 的类型声明不仅对输入很宽容，对输出也很宽容。要想安全地使用返回的 `camera` 对象，就必须为联合类型的每个可能情况编写条件分支。

这种带有大量可选属性和联合类型的返回值，让 `viewportForBounds` 变得难以使用。它的参数类型很宽松，调用方便；但它的返回类型也很宽松，反而不方便。更理想的 API 应该**对返回值更严格**。

一种改进方式是，明确区分“标准格式”的坐标。例如，JavaScript 里有 “数组（array）” 和 “类数组（array-like）” 的区分（参见第 17 条），我们也可以类似地区分 `LngLat` 和 `LngLatLike`。同时，也可以区分“完整定义的 Camera 类型”和 `setCamera` 可接受的“部分定义类型”：

```ts
interface LngLat {
  lng: number
  lat: number
}
type LngLatLike = LngLat | { lon: number; lat: number } | [number, number]

interface Camera {
  center: LngLat
  zoom: number
  bearing: number
  pitch: number
}
interface CameraOptions extends Omit<Partial<Camera>, 'center'> {
  center?: LngLatLike
}
type LngLatBounds =
  | { northeast: LngLatLike; southwest: LngLatLike }
  | [LngLatLike, LngLatLike]
  | [number, number, number, number]

declare function setCamera(camera: CameraOptions): void
declare function viewportForBounds(bounds: LngLatBounds): Camera
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgDIgOarmZBvZAG0wC5kQBXAWwCNoBuInMy2h5AX3oCgwBPAA4p0WHKmABrFAF40mbLgA++IgHsQLanSiNCzclvYdkygNqttAGgNsoAXR7dQkWIhQBhOFWhx83ZMhI4NBkIgo8AQBeqqpUmrYRyHRwUKAY8dqJAsBgCAAWGQzcHE7BrkjInt5QcADyAmDA6gDOyBAAHpAgACattVQ5ADwACimNcISDVT4AfNYA5EEu8zN+AUvQAPyh8mKSEDwl-EJyomAAQqoUPa3S-vggqlBgeRBwzWA7Z+JS1s1XLwA7hAPl8FD8IMZFPdTGE9r9TuD9nYTDCLNBrOioJjDNibNoHNxuN0IAg9FAUDBrghGupkM0IGBpjUABQILw+MjMuoNJogZoASjIADdVMBujwSWSUpTqbSQMhhcAIICBE8wAAxJ6Xa69Fk0K43ME4HU3IWVDk1HhAA)

宽松的 `CameraOptions` 类型是对严格的 `Camera` 类型的“适配”。在 `setCamera` 的参数类型中直接使用 `Partial<Camera>` 并不适合，因为你希望 `center` 属性能接受 `LngLatLike` 类型的对象。

而你也不能写成 `"CameraOptions extends Partial<Camera>"`，因为 `LngLatLike` 是 `LngLat` 的**父类型**，而不是子类型（如果你觉得这有点反直觉，可以回去看看第 7 条内容复习一下）。

如果你觉得这种方式太复杂，也可以直接**手动写出这个类型**，虽然会有一些重复：

```ts
interface CameraOptions {
  center?: LngLatLike
  zoom?: number
  bearing?: number
  pitch?: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgDIgOarmZBvZAG0wC5kQBXAWwCNoBuInMy2h5AX3oCgwBPAA4p0WHKmABrFAF40mbLgA++IgHsQLanSiNCzclvYdkygNqttAGgNsoAXR6hIsRCgDCcKtDgB5AWGB1AGd8bmRkJHBoAH4yEQVxKR5wgC9VVSpYm21k5Do4KFAMLIsGMOQBYDAEAAsSwx1uDm4gA)

无论你选择哪种方式，有了这些新的类型声明之后，`focusOnFeature` 函数就能通过类型检查了：

```ts
function focusOnFeature(f: Feature) {
  const bounds = calculateBoundingBox(f)
  const camera = viewportForBounds(bounds)
  setCamera(camera)
  const {
    center: { lat, lng },
    zoom,
  } = camera // OK
  //                         ^? const zoom: number
  window.location.search = `?v=@${lat},${lng}z${zoom}`
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAYhCGwCuAnaBeK8B2IDcAUACYQDGANvGlAGZLanACWA9tlKfOaUpcBACEW9Ik2wBzIQA8AFDQBcsBMjQBKRQG1sSALYAjCCgA0UbfsMmzB46d3WAuoTH8UNeKWgAZCZ8RQA3lDkEopWhnhBiKF24VAAvoSgkFDe4r7AnkwA1hgpPn4APgFBbNHmKBF8ZdYRcVBFWjE2YSiOBATOhm4eUADC8DqG8AEEUBwQ2C6KqemEYwBeLCw61eGjUAZUYuKrFetgTMCkABa7hHEdk13u0P2DKPAA8mDMbADOUBBS-NhEH486Q4AHgAClRmFwgXchgA+EwAcg8VxQ8JhIzGSJcAH5pvkMtkIOcCEkvHihCIPuh1v5sCwUMBjgg3sBcWlEJkciY3sIGQB3CDM1npDkQOoFdYaGbsgkmKX4nL2eoSlqWJqq8rqhyEYhkSjUOgMV7sN4QYDQh4yTj3eCKc1PF6sbBvdRQABuLCYREIJAoVGgBsYjrdTAgvLAdOAMDp5N+bxkemEsaFiBjfxddsIAaNtBYPDej2wcEQqAgckURZUEFU6I472AG0TfygmE43F4iEEje20jkqjmtad9atQ2bwdD4fpUZQqbjCYpffWJrNAyGlpXDwXGLrAUxhkU-j4JmC4jiJkWyzqLfX8AiUAA9HeoI8ANLrB9jD+fr-fr8APSxA7MlA54rLY5TrLyYhECwvIAHTkLmiCOrBJpUCco4AAZYq66AAAIACQHogp6EcecTzIRIFxBhRJAA)

这一次，`zoom` 的类型是 `number`，而不是 `number | undefined` 了。现在 `viewportForBounds` 函数变得更容易使用了。

如果你还有其他函数也会返回边界框（bounds），那你也需要定义一个“标准格式”，并区分 `LngLatBounds` 和 `LngLatBoundsLike`。

那允许边界框有 19 种不同的写法，是不是一个好设计？可能不是。但如果你要为这样的库编写类型声明，你就得按照它的行为来建模。**只是别让你的函数返回值也有 19 种类型！**

这种“对输入宽容、对输出严格”的模式最常见的应用场景之一，就是函数的参数是数组的情况。比如下面这个函数，用来对数组中的元素求和：

```ts
function sum(xs: number[]): number {
  let sum = 0
  for (const x of xs) {
    sum += x
  }
  return sum
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZxAWwBQA9kC5FjoBGApgE4DaAugJT6FqlmIDeAUIogDYlQrqIAvIgAMAbg6JgcZhggJkfLIjjBEOGq0mdUaRAGphWCZwC+ksrxBkkuieaA)

`number` 作为返回类型是非常严格的，这很好！但参数类型 `number[]` 就显得有点太窄了，因为我们其实并没有用到它数组的所有功能，所以这里可以放宽一些。

第 17 条提到过 `ArrayLike` 类型，`ArrayLike<number>` 在这里就挺合适。第 14 条讲过只读数组，`readonly number[]` 也很适合作为参数类型。

不过如果你只需要对参数进行遍历，那最宽泛的类型其实是 `Iterable<number>`：

```ts
function sum(xs: Iterable<number>): number {
  let sum = 0
  for (const x of xs) {
    sum += x
  }
  return sum
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZxAWwBQA9kC5ECSUApgE4CGARgDbEA8Y6lZAfAJT6NrOmIDeAKESJaUFOkQBeRAAYA3EMTA4vDBATIxWRHGCIcbfouGo0iANTSsC4QF9FpYlBCkkphfaA)

这在处理数组时效果如预期那样好用：

```ts
const six = sum([1, 2, 3])
//    ^? const six: number
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZxAWwBQA9kC5ECSUApgE4CGARgDbEA8Y6lZAfAJT6NrOmIDeAKESJaUFOkQBeRAAYA3EMTA4vDBATIxWRHGCIcbfouGo0iANTSsC4QF9FpYlBCkkphffVhNKGNummGADaAIwANIgATBEAzAC6bAoA9EnCwgB6APyIXj7IfpxMZAJAA)

这里用 `Iterable` 而不是 `Array` 或 `ArrayLike` 的好处是，它还能支持生成器（generator）表达式：

```ts
function* range(limit: number) {
  for (let i = 0; i < limit; i++) {
    yield i
  }
}
const zeroToNine = range(10)
//    ^? const zeroToNine: Generator<number, void, unknown>
const fortyFive = sum(zeroToNine) // ok, result is 45
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZxAWwBQA9kC5ECSUApgE4CGARgDbEA8Y6lZAfAJT6NrOmIDeAKESJaUFOkQBeRAAYA3EMTA4vDBATIxWRHGCIcbfouGo0iANTSsC4QF9FpYlBCkkphfdCRYCAFSIKMABzYgxqGDQYKE4mMkNBYWVVUUQYKVk5VMQ6EQiozJhzc3jjRABPGGJqABNUm0R7e3UwTUQALzI4ABU4ADkYMGJ0wJCMAEYZNgUAemnhYQA9AH5EZtaO0m6+geJ8AHFiQYooFQZY0gAaRAA3OBhqq-AAazA4AHcwFgE1sSSoMoAYjBrkNpKYMBstv1BlNhLMdE8ro5UNQxDBkIgACwAVgEQA)

如果你的函数只是需要遍历参数，使用 `Iterable` 类型，这样也能兼容生成器（generators）。而且如果你用的是 `for-of` 循环，代码一行都不用改。

## 关键点总结

- 输入类型通常比输出类型更宽松。参数类型里可选属性和联合类型更常见，返回类型尽量避免。
- 避免返回类型太宽泛，因为这会让调用者用起来很麻烦。
- 如果参数和返回值需要共用类型，给返回值定义一个标准的“规范”格式，参数用更宽松的类型。
- 如果你只需要遍历函数参数，使用 `Iterable<T>` 替代 `T[]`。

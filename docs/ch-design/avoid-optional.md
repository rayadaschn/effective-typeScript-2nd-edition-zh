# 第 37 条: 限制可选属性的使用

## 要点

- 可选属性可能让类型检查器漏掉 bug，而且会导致设置默认值的代码重复甚至不一致。
- 给接口添加可选属性之前要三思，考虑是否可以改成必填。
- 可以把“未处理的输入数据”和“已处理的数据”用不同的类型表示。
- 避免出现组合爆炸的问题。

## 正文

随着你的类型不断演进，你肯定会想往里面加一些新属性。为了不让现有的代码或数据失效，你可能会选择把这些新属性设为可选的。虽然有时候这么做是合理的，但“可选属性”是有代价的，添加之前你最好三思。

想象一下你有一个 UI 组件，用来展示带标签和单位的数字，比如 “高度: 12 英尺” 或 “速度: 10 英里/小时”：

```ts
interface FormattedValue {
  value: number
  units: string
}
function formatValue(value: FormattedValue) {
  /* ... */
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGIHsoFs5kgEwDU4AbAVxQG8AoZZAN1IoC5kQysAjaAbluTIhgYAM6sRYKKADmfAL7UYghGGDoQyGJhxhi5CAApG+1hmy4CeigEpklZAHoAVMgB075E4fIFQA)

你用这个组件构建了一个大型的网页应用。其中一部分可能会显示你徒步旅行的信息（比如：“5 英里，速度 2 英里每小时”）：

```ts
interface Hike {
  miles: number
  hours: number
}
function formatHike({ miles, hours }: Hike) {
  const distanceDisplay = formatValue({ value: miles, units: 'miles' })
  const paceDisplay = formatValue({ value: miles / hours, units: 'mph' })
  return `${distanceDisplay} at ${paceDisplay}`
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGIHsoFs5kgEwDU4AbAVxQG8AoZZAN1IoC5kQysAjaAbluTIhgYAM6sRYKKADmfAL7UYghGGDoQyGJhxhi5CAApG+1hmy4CeigEpklZAHoAVMgB075E4fIFoSLEQUAAlgAGsqfixgEggxNg5uKD46AAt0Mig49i5eagUlEBU1DS1zMBDwg0oomJEAGmQ0jJE5VgqIWxo6BHUJZHxgCThCiAARQYAHEjgAT2QAXk1tXCtDSmMWZBrYhsFhOIBybZEDuWtk5B6QPonA8ZEp2YWlstWqjYhWY8dG9MzdoSiVhHCYpU7nfhQCBgDIaAAGABJKAMhiN7o8ZnJkLhkEjbkh0dNMXD5NQgA)

有一天你了解到了公制系统，决定在应用中支持它。为了同时支持公制和英制，你在 `FormattedValue` 中添加了一个对应的选项。如果需要，组件会在显示数值前进行单位转换。为了尽量减少对现有代码和测试的改动，你决定把这个属性设为可选的：

```ts
type UnitSystem = 'metric' | 'imperial'
interface FormattedValue {
  value: number
  units: string
  /** default is imperial */
  unitSystem?: UnitSystem
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAqgdgS2AZRAZ2BAtlAvFAciwmACcEBjAqAH0IS0nIEMAbAgbgCgE5NSAZswrQAYgHtSWZsEwATAGpsArtADeXKFABuKiAC4ocZVgBGEUty3LEwNIYzk4AcytQA9ACpPUORCHKrMBQCGghjBYIbFCe7ppQNkioGNgA-IbwSeiYWNwAvlxAA)

为了让用户进行配置，我们还需要在整个应用的配置中指定使用哪种单位系统：

```ts
interface AppConfig {
  darkMode: boolean
  // ... other settings ...
  /** default is imperial */
  unitSystem?: UnitSystem
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAqgdgS2AZRAZ2BAtlAvFAciwmACcEBjAqAH0IS0nIEMAbAgbgCgE5NSAZswrQAYgHtSWZsEwATAGpsArtADeXKFABuKiAC4ocZVgBGEUty3LEwNIYzk4AcytQA9ACpPUORCHKrMBQCGghjBYIbFCe7ppQNkioGNgA-IbwSeiYWNwAvjx8FkIiUACCYGAAwuJwAgjOUBpacsykANYAsuJ+hqbi4qwQzHBu7u5QAHTTUOLAABYWUGgkwLzOYdOT8V4+fgFBIWEMTFGsMXHWtsk56bDX2dj5XEA)

现在我们可以更新 `formatHike` 来支持公制系统了：

```ts
function formatHike({ miles, hours }: Hike, config: AppConfig) {
  const { unitSystem } = config
  const distanceDisplay = formatValue({
    value: miles,
    units: 'miles',
    unitSystem,
  })
  const paceDisplay = formatValue({
    value: miles / hours,
    units: 'mph', // forgot unitSystem, oops!
  })
  return `${distanceDisplay} at ${paceDisplay}`
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAqgdgS2AZRAZ2BAtlAvFAciwmACcEBjAqAH0IS0nIEMAbAgbgCgE5NSAZswrQAYgHtSWZsEwATAGpsArtADeXKFABuKiAC4ocZVgBGEUty3LEwNIYzk4AcytQA9ACpPUORCHKrMBQCGghjBYIbFCe7ppQNkioGNgA-IbwSeiYWNwAvjx8FkIiUACCYGAAwuJwAgjOUBpacsykANYAsuJ+hqbi4qwQzHBu7u5QAHTTUOLAABYWUGgkwLzOYdOT8V4+fgFBIWEMTFGsMXHWtsk56bDX2dj5hfwl0AASCO3q8VgIQ-YjCZzJZ4vNxMpSIDjGYLM8BDYKGtalABJJpMAlKxVAAKXTYgxQCRSGTyLGqACUTQ8Pi2FygBQRcCRCBRaJJwE+3xxaj+AIANFBwZC0HlDFyIIKKLV6s5DBVqjKGlTmlBpXAMNTEihHjg8ng1UrXPF1Zq5KFgCMRAARUJgVjMEAG9kY8kQHnxLT41SGPkQNCC7WAoj-f0EQMPFJYeJ5CluU3BMDCCC2tD2x3O9EyN0erRevS+0NhCbCqERpDBxjzageCbs5xzBKRnKCgZgNAAQhjcfipBIkLgUAABgASNTmjBWlN2h0gfUyKBjpM2meOvJD55AA)

我们在一次调用 `formatValue` 时设置了 `unitSystem`，但在另一次调用中却没有设置。这是一个 bug，导致使用公制系统的用户看到的是英制和公制单位混合的结果。

事实上，我们的设计本身就很容易出这种 bug。每当我们使用 `formatValue` 组件时，都需要记得传入 `unitSystem`。如果哪次忘了，公制用户就会看到一些让人困惑的英制单位，比如码、英亩或者英尺-磅。

如果能有一种方法，自动找出哪些地方漏传了 `unitSystem`，那就太好了。而这正是类型检查特别擅长的事情，但我们因为把 `unitSystem` 属性设为了可选，反而让 TypeScript 帮不上忙。

如果你把它设为必填的，那么凡是漏写的地方，TypeScript 都会报错。你虽然得一个个修复，但总比等用户困惑地来反馈问题要好得多！

还有一句“默认是英制”的注释也挺令人担忧的。在 TypeScript 中，对象中可选属性的默认值始终是 `undefined`。如果我们想实现一个自定义默认值，代码里很可能会到处都是类似下面这样的逻辑：

```ts
declare let config: AppConfig
const unitSystem = config.unitSystem ?? 'imperial'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAqgdgS2AZRAZ2BAtlAvFAciwmACcEBjAqAH0IS0nIEMAbAgbgCgE5NSAZswrQAYgHtSWZsEwATAGpsArtADeXKFABuKiAC4ocZVgBGEUty3LEwNIYzk4AcytQA9ACpPUORCHKrMBQCGghjBYIbFCe7ppQNkioGNgA-IbwSeiYWNwAvjx8FkIiUACCYGAAwuJwAgjOUBpacsykANYAsuJ+hqbi4qwQzHBu7u5QAHTTUOLAABYWUGgkwLzOYdOT8V4+fgFBIWEMTFGsMXHWtsk56bDX2dj5hfwl0AASCO3q8VgIQ-YjCZzJZ4vNxMpSIDjGYLM8BDYKGtalABJJpMAlKxVAAKXTYgxQCRSGTyLGqACUTQ8Pi2FygBT8FFYbWgQ2CFFq9Wchgq1S5DW4nLgGASDxSOHwwu5k0SKEeOFSqXoERY7G4QA)

这些地方每一个都可能埋下 bug。也许你的团队中有其他开发者忘了“默认是英制”（而且为什么要默认用英制呢？），误以为应该默认是公制：

```ts
const unitSystem = config.unitSystem ?? 'metric'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAqgdgS2AZRAZ2BAtlAvFAciwmACcEBjAqAH0IS0nIEMAbAgbgCgE5NSAZswrQAYgHtSWZsEwATAGpsArtADeXKFABuKiAC4ocZVgBGEUty3LEwNIYzk4AcytQA9ACpPUORCHKrMBQCGghjBYIbFCe7ppQNkioGNgA-IbwSeiYWNwAvjx8FkIiUACCYGAAwuJwAgjOUBpacsykANYAsuJ+hqbi4qwQzHBu7u5QAHTTUOLAABYWUGgkwLzOYdOT8V4+fgFBIWEMTFGsMXHWtsk56bDX2dj5hfwl0AASCO3q8VgIQ-YjCZzJZ4vNxMpSIDjGYLM8BDYKGtalABJJpMAlKxVAAKXTYgxQCRSGTyLGqACUTQ8Pi2FygBT8FFYbWgQ2CFFq9Wchgq1S5DW4nLgGASDxSOHwwu5k0SKEeOFSqUIxDIlE4XCAA)

结果又会出现显示不一致的问题。

如果你需要兼容旧版本的 `AppConfig`（比如它们是以 JSON 格式保存在磁盘或数据库中的），那你就不能把新字段设为必填。这种情况下，你可以把类型拆成两个：一个用于读取磁盘上的原始配置，另一个用于应用内部使用，包含更少的可选属性：

```ts
interface InputAppConfig {
  darkMode: boolean
  // ... other settings ...
  /** default is imperial */
  unitSystem?: UnitSystem
}
interface AppConfig extends InputAppConfig {
  unitSystem: UnitSystem // required
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAqgdgS2AZRAZ2BAtlAvFAciwmACcEBjAqAH0IS0nIEMAbAgbgCgE5NSAZswrQAknDABXYAEEwYAMIB7OAIQBzKAG8uUKABNmpANYBZJfogAuKACMlS1hGZxuegPTuoAOl9QlwAAWEKRQaCTAvOpoPr66UO4AVIkGEEKSrMBQCDEMTAhsUInu8ZKIKOiYWAD8NvBIqBjY3AC+PHwhQiJQcooqapoQAB6YcPox4lKy8sqqGtql5Y1VdUuVzR5epBAAjpII2-pcbUA)

如果在子类型中把一个可选属性改成必填让你感觉有些奇怪，可以参考第 7 条。你也可以在这里使用 `Required<InputAppConfig>`。

你还需要添加一些“规范化”的代码：

```ts
function normalizeAppConfig(inputConfig: InputAppConfig): AppConfig {
  return {
    ...inputConfig,
    unitSystem: inputConfig.unitSystem ?? 'imperial',
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAqgdgS2AZRAZ2BAtlAvFAciwmACcEBjAqAH0IS0nIEMAbAgbgCgE5NSAZswrQAknDABXYAEEwYAMIB7OAIQBzKAG8uUKABNmpANYBZJfogAuKACMlS1hGZxuegPTuoAOl9QlwAAWEKRQaCTAvOpoPr66UO4AVIkGEEKSrMBQCDEMTAhsUInu8ZKIKOiYWAD8NvBIqBjY3AC+PHwhQiJQcooqapoQAB6YcPox4lKy8sqqGtql5Y1VdUuVzR5epBAAjpII2-pcbQJlFJEqUHBKpFhsCABeEL2zAwAUvFOvGjaT0i-9DQAShsALmmh0em2wEkpDgCz0el83k+0m+6gANPE9GUGussDZUcB0d5cRUmjhqtV6IwQgV2Fi9C1WlwgA)

这种拆分方式解决了几个问题：

1. 它允许配置结构演进的同时保持向后兼容，而不需要在整个应用中增加复杂性。
2. 它把默认值的设置集中管理，避免分散到各处。
3. 它避免了在需要 `AppConfig` 的地方误用了 `InputAppConfig`。

这类“还没处理完的”类型在处理网络请求数据时很常见。你可以在第 33 条的 `UserPosts` 中看到另一个例子。

当你在接口中添加越来越多的可选属性时，会遇到一个新问题：如果你有 N 个可选属性，那么就有 2 的 N 次方种组合方式。这是个天文数字！比如你有 10 个可选属性，你真的测试了全部 1,024 种组合吗？这些组合都合理吗？很可能这些选项之间是有某种结构关系的，比如有些是互斥的。如果是这样，那你应该在状态模型中表现出来（参见第 29 条）。

这个问题不只是可选属性独有，而是“选项”本身就可能导致混乱。

最后一点，可选属性可能会导致 TypeScript 的类型系统不够严谨，具体内容见第 48 条。

综上所述，使用可选属性的问题很多。那么，什么时候该用它们呢？主要是在描述已有 API，或在保证向后兼容的同时演进 API 时，它们是几乎不可避免的。对于超大的配置对象，也许为所有字段提供默认值的成本太高。而且有些属性确实就是可选的，比如并不是每个人都有中间名，那么在 `Person` 类型中设置一个可选的 `middleName` 是合理的。

但你要清楚可选属性的各种弊端，知道该怎么规避它们，如果有更好的选择，一定要三思后再加。

## 关键点总结

- 可选属性可能让类型检查器漏掉 bug，而且会导致设置默认值的代码重复甚至不一致。
- 给接口添加可选属性之前要三思，考虑是否可以改成必填。
- 可以把“未处理的输入数据”和“已处理的数据”用不同的类型表示。
- 避免出现组合爆炸的问题。

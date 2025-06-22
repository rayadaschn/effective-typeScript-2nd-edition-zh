# 第 45 条：在类型良好的函数中隐藏不安全的类型断言

## 要点

- 有时不安全的类型断言和 `any` 类型是必要的，因为能加快开发进度。当你需要使用它们时，将其隐藏在具有正确签名的函数内部。
- 不要为了修复实现中的类型错误而妥协函数的类型签名。
- 确保解释为什么你的类型断言是有效的，并且对代码进行充分的单元测试。

## 正文

在理想情况下，你写的函数应该既有你想要的准确类型签名，函数实现也能顺利通过 TypeScript 的类型检查器，不包含任何类型断言（`as`）或显式的 `any` 类型，也不会踩到类型系统的坑（详见第 48 条）。幸运的是，大多数时候你写的函数确实可以做到这一点。

但既然我们现在讨论的是 `any` 和类型不安全的问题，那你大概已经猜到，事情并不总是那么理想。

如果你必须在“一个安全、没有类型断言的函数实现” 和 “一个你想要的类型签名” 之间做选择，那么请优先选择**你想要的类型签名**。因为类型签名是你函数的公共接口，它会暴露给你的整个代码库甚至其他开发者。而函数的内部实现是“隐藏细节”，别人看不到。你可以在里面用断言、用 `any`，这些都藏在内部。相比之下，一个内部实现有些不安全（但经过充分测试）总比你为了内部写法去妥协 API 类型签名更好，后者会让用户很痛苦。

为了说明这种情况是怎么发生的，先看下面这段获取山峰信息的示例代码：

```ts
interface MountainPeak {
  name: string
  continent: string
  elevationMeters: number
  firstAscentYear: number
}

async function checkedFetchJSON(url: string): Promise<unknown> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Unable to fetch! ${response.statusText}`)
  }
  return response.json()
}

export async function fetchPeak(peakId: string): Promise<MountainPeak> {
  return checkedFetchJSON(`/api/mountain-peaks/${peakId}`)
  // ~~~~~ Type 'unknown' is not assignable to type 'MountainPeak'.
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgLIHsCu46gAoRwDWyA3gFDLIhwC2EAXMgM5hSgDmA3JcguuFARwTVuxDdeEADYQAbnDDABqCJCjMmITLQBG0HlRjANYAILMk4AJqEoWnfqg8AvuXJxmATxAJkMbAQlAT4ACwgEIggAEwAxNQRQgCkAZQB5ADkACkwoaVE2TgBKJjwodFpgZggAHmwiEHQAdxAAPjJefhBWZCgIZgAHAWrkAF5kOCbcMH8E0Jy8osNkYBhkLIBCPsHhiAA6dCIijqoqMFDypuoIK4BRKHKoLIADAFUaXVlkMHRZsESNsgACSkbZDbr7ViKTDMAAqEAAHmAXM8lrw3FQ+mBciBev1wdU9gArZgCLJotzkRFDKAzTw+PwBXzBXEwOYEYhZAaEIgASWiBXEHBKyDKFSqtQw2DAuBAHKI7QomLUOLCESicTmqUyLwA9HABsBdbQsDhQABabnEZi6kFWvnRFFo3W65AAPw9HuQsK83OQAHJ6o0Wv6VsxqOg6cxmMAOB8vj9vr6UP6pWa5Tz-XtyG4gA)

`checkedFetchJSON` 这个包装函数提供了两个作用。首先，它会检查 `fetch` 是否成功，如果失败就抛出错误（从而拒绝这个 Promise）。其次，它把返回的 JSON 数据标记为 `unknown` 类型（详见第 46 条），这比默认的 `any` 类型更安全。

但不巧的是，这里会出现一个类型错误，因为 `unknown` 不能直接赋值给 `MountainPeak`。如果你想在 `fetchPeak` 函数的实现中避免使用类型断言或 `any` 类型，那你就得把它的返回类型也改成匹配 `unknown`：

```ts
export async function fetchPeak(peakId: string): Promise<unknown> {
  return checkedFetchJSON(`/api/mountain-peaks/${peakId}`) // ok
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgLIHsCu46gAoRwDWyA3gFDLIhwC2EAXMgM5hSgDmA3JcguuFARwTVuxDdeEADYQAbnDDABqCJCjMmITLQBG0HlRjANYAILMk4AJqEoWnfqg8AvuXJxmATxAJkMbAQlAT4ACwgEIggAEwAxNQRQgCkAZQB5ADkACkwoaVE2TgBKJjwodFpgZggAHmwiEHQAdxAAPjJefhBWZCgIZgAHAWrkAF5kOCbcMH8E0Jy8osNkYBhkLIBCPsHhiAA6dCIijqoqMFDypuoIK4BRKHKoLIADAFUaXVlkMHRZsESNsgACSkbZDbr7ViKTDMAAqEAAHmAXM8lrw3FQ+mBciBev1wdU9gArZgCLJotzkRFDKAzTw+PwBXzBXEwOYEYhZAaEIgASWiBXEHBKyDKFSqtXqjRa7QomLUOLCESicTmqUyLwA9HABsBNbQsDhQABabnEZiakFmvnRFFLKiazXIQ7kNxAA)

这样写确实可以通过类型检查，而且没有使用任何不安全的类型断言（这当然是好事！），但也带来了一个明显的问题：
`fetchPeak` 函数现在**非常难用**。

```ts
const sevenPeaks = [
  'aconcagua',
  'denali',
  'elbrus',
  'everest',
  'kilimanjaro',
  'vinson',
  'wilhelm',
]
async function getPeaksByHeight(): Promise<MountainPeak[]> {
  const peaks = await Promise.all(sevenPeaks.map(fetchPeak))
  return peaks.toSorted(
    // ~~~ Type 'unknown' is not assignable to type 'MountainPeak'.
    (a, b) => b.elevationMeters - a.elevationMeters
    //        ~                   ~ 'b' and 'a' are of type 'unknown'
  )
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgLIHsCu46gAoRwDWyA3gFDLIhwC2EAXMgM5hSgDmA3JcguuFARwTVuxDdeEADYQAbnDDABqCJCjMmITLQBG0HlRjANYAILMk4AJqEoWnfqg8AvuXJxmATxAJkMbAQlAT4ACwgEIggAEwAxNQRQgCkAZQB5ADkACkwoaVE2TgBKJjwodFpgZggAHmwiEHQAdxAAPjJefhBWZCgIZgAHAWrkAF5kOCbcMH8E0Jy8osNkYBhkLIBCPsHhiAA6dCIijqoqMFDypuoIK4BRKHKoLIADAFUaXVlkMHRZsESNsgACSkbZDbr7ViKTDMAAqEAAHmAXM8lrw3FQ+mBciBev1wdU9gArZgCLJotzkRFDKAzTw+PwBXzBXEwOYEYhZAaEIgASWiBXEHBKyDKFSqtXqjRa7QomLUOLCESicTmqUyLwA9HABsBNbQsDhQABabnEZiakFmvnRFFLKiazXIQ7kNxdHrVOTCDlEZhjZAAbV4AHJEAIEHAOJg4MGADTIYPRYRwaTAOMJmS6KAw9PB+TQfpgXNEYCp2hwEBEuDlXNyUCkkC5pql8LSWjB8gAXR49N8-kCLOQHDUPuYACEvAAJCDADihMDk0rlSrVGoYbBgXAgH0BzuyzrDGbWv3jSbTUXLiV7FPSLKe7085h7csDLJs-6hH1FNHy7FQXHHnsPwpOgtIxFkvCOsgAB+sHILCXjcgmUrNI2Kx+o0dLMMws4fF8PzfIhKDBuuRrbjywZ7LwVBZHA8a6McoztLoewyPIijKCAqjqH6xoTKxsgKCy3HQMw1HIFBpxSdBUmyXJ0kJrowYTCA0QJjGEx9M6axgERyEgA0qEdlQFLkEAA)

任何调用这个函数的代码，很可能都不得不自己加上类型断言：

```ts
async function getPeaksByDate(): Promise<MountainPeak[]> {
  const peaks = (await Promise.all(sevenPeaks.map(fetchPeak))) as MountainPeak[]
  return peaks.toSorted((a, b) => b.firstAscentYear - a.firstAscentYear)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgLIHsCu46gAoRwDWyA3gFDLIhwC2EAXMgM5hSgDmA3JcguuFARwTVuxDdeEADYQAbnDDABqCJCjMmITLQBG0HlRjANYAILMk4AJqEoWnfqg8AvuXJxmATxAJkMbAQlAT4ACwgEIggAEwAxNQRQgCkAZQB5ADkACkwoaVE2TgBKJjwodFpgZggAHmwiEHQAdxAAPjJefhBWZCgIZgAHAWrkAF5kOCbcMH8E0Jy8osNkYBhkLIBCPsHhiAA6dCIijqoqMFDypuoIK4BRKHKoLIADAFUaXVlkMHRZsESNsgACSkbZDbr7ViKTDMAAqEAAHmAXM8lrw3FQ+mBciBev1wdU9gArZgCLJotzkRFDKAzTw+PwBXzBXEwOYEYhZAaEIgASWiBXEHBKyDKFSqtXqjRa7QomLUOLCESicTmqUyLwA9HABsBNbQsDhQABabnEZiakFmvnRFFLKiazXIQ7kNxdHrVOTCDlEZhjZAAbV4AHJEAIEHAOJg4MGADTIYPRYRwaTAOMJmS6KAw9PB+TQfpgXNEYCp2hwEBEuDlXNyUCkkC5pql8LSWjB8gAXR49N8-kCLOQHDUPuYACEvAARRQQcmlcqVao1DDYMC4EA+gOd2WdYYza1+8aTaaihcSvYp6RZT3ennMPblgZZNn-UI+orHTxoQ1r-A8rfLFiioHnsPwpOgtIxFkWRwPGujHKM7S6HsximBYVhgLY1bIMaEwoSYrDocImF2BS5BAA)

这会导致你的代码中每次调用 `fetchPeak` 时都要加上类型断言。这样不仅重复、繁琐，而且还有可能在不同地方断言成不同的类型，埋下隐患。

与其为了让类型检查器满意而修改 `fetchPeak` 的返回类型，不如保留原来的类型签名，在函数内部加上一句类型断言，这样会更好：

```ts
export async function fetchPeak(peakId: string): Promise<MountainPeak> {
  return checkedFetchJSON(
    `/api/mountain-peaks/${peakId}`
  ) as Promise<MountainPeak>
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&target=9#code/JYOwLgpgTgZghgYwgAgLIHsCu46gAoRwDWyA3gFDLIhwC2EAXMgM5hSgDmA3JcguuFARwTVuxDdeEADYQAbnDDABqCJCjMmITLQBG0HlRjANYAILMk4AJqEoWnfqg8AvuXJxmATxAJkMbAQlAT4ACwgEIggAEwAxNQRQgCkAZQB5ADkACkwoaVE2TgBKJjwodFpgZggAHmwiEHQAdxAAPjJefhBWZCgIZgAHAWrkAF5kOCbcMH8E0Jy8osNkYBhkLIBCPsHhiAA6dCIijqoqMFDypuoIK4BRKHKoLIADAFUaXVlkMHRZsESNsgACSkbZDbr7ViKTDMAAqEAAHmAXM8lrw3FQ+mBciBev1wdU9gArZgCLJotzkRFDKAzTw+PwBXzBXEwOYEYhZAaEIgASWiBXEHBKyDKFSqtQw2DAuBAHKI7QomLUOLCESicTmqUyWV4VGeAHo4ANgAbaFgcKAALTc4jMA0g2186IogA0vGOnlF5Uq1RqUstcp5rVc5CAA)

由于类型断言被藏在了函数内部，调用这个函数的代码就可以写得干净利落，完全不用知道我们偷偷用了不安全的写法：

```ts
async function getPeaksByContinent(): Promise<MountainPeak[]> {
  const peaks = await Promise.all(sevenPeaks.map(fetchPeak)) // no assertion!
  return peaks.toSorted((a, b) => a.continent.localeCompare(b.continent))
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&target=9#code/JYOwLgpgTgZghgYwgAgLIHsCu46gAoRwDWyA3gFDLIhwC2EAXMgM5hSgDmA3JcguuFARwTVuxDdeEADYQAbnDDABqCJCjMmITLQBG0HlRjANYAILMk4AJqEoWnfqg8AvuXJxmATxAJkMbAQlAT4ACwgEIggAEwAxNQRQgCkAZQB5ADkACkwoaVE2TgBKJjwodFpgZggAHmwiEHQAdxAAPjJefhBWZCgIZgAHAWrkAF5kOCbcMH8E0Jy8osNkYBhkLIBCPsHhiAA6dCIijqoqMFDypuoIK4BRKHKoLIADAFUaXVlkMHRZsESNsgACSkbZDbr7ViKTDMAAqEAAHmAXM8lrw3FQ+mBciBev1wdU9gArZgCLJotzkRFDKAzTw+PwBXzBXEwOYEYhZAaEIgASWiBXEHBKyDKFSqtQw2DAuBAHKI7QomLUOLCESicTmqUyWV4VGeAHo4ANgAbaFgcKAALTc4jMA0g2186IogA0vGOnlF5Uq1RqUstcp5rVc5C6PWqcmE8uYY2QAG1eAByRACBBwDiYOBJ13IJPRYRwaTAHN5mS6KAw0tJ+TQfpgatEYDF2hwEBEuDlatyUCkkDVprN8LSWhJ8gAXR49N8-kCLOQHDUMYAQl4AMICJQgYRgcmlH0S-0WmX4Hnx8eKzrDGZO2PjSbTb3iwlF6RZSPRnnMPatgZZNn-KE8pFEsVAGga1C-J41S0soIAbLwWKqreew-Ck6C0jEWRZHAua6McoztHAexdFuO57NI6DprIG60AMnYQFkugkZuQjgCBoZAA)

通过把类型断言限制在函数内部，我们也更容易提升它的安全性。下面这个版本就做了一些基本的结构检查：

```ts
export async function fetchPeak(peakId: string): Promise<MountainPeak> {
  const maybePeak = checkedFetchJSON(`/api/mountain-peaks/${peakId}`)
  if (
    !maybePeak ||
    typeof maybePeak !== 'object' ||
    !('firstAscentYear' in maybePeak)
  ) {
    throw new Error(`Invalid mountain peak: ${JSON.stringify(maybePeak)}`)
  }
  return checkedFetchJSON(
    `/api/mountain-peaks/${peakId}`
  ) as Promise<MountainPeak>
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgLIHsCu46gAoRwDWyA3gFDLIhwC2EAXMgM5hSgDmA3JcguuFARwTVuxDdeEADYQAbnDDABqCJCjMmITLQBG0HlRjANYAILMk4AJqEoWnfqg8AvuXJxmATxAJkMbAQlAT4ACwgEIggAEwAxNQRQgCkAZQB5ADkACkwoaVE2TgBKJjwodFpgZggAHmwiEHQAdxAAPjJefhBWZCgIZgAHAWrkAF5kOCbcMH8E0Jy8osNkYBhkLIBCPsHhiAA6dCIijqoqMFDypuoIK4BRKHKoLIADAFUaXVlkMHRZsESNsgACSkbZDbr7ViKTDMAAqEAAHmAXM8lrw3FQ+mBciBev1wdU9gArZgCLJotzkRFDKAzTw+PwBXzBXEwOYEYhZAaEIgASWiBXEHBKyDKFSqtQw2DAuBAHKI7QoVC6PVocC8+nlYzCESicTmqUyLwA9HABsBjbQsDhQABabnEZjGkEOvnRFFoqirda8KgbNUaiBagA+wd93y83PQawDmp5yA2o3GAHJ0LoiREwMnkKHwxsssnjKYLFYwLY4FBs6BkLGgzyirxjkrTudLtc7g90E9nryQAppMBojXrTLq66mCDDRk9mJOKsvFla-Kih7lhi8dioLjErqYvF-sl0tlw89TebLSPZfaeU6XTz+SiADSNibMUXlSrVGpSm1ynmtVxyCAA)

你不太可能在每个调用点都做这种结构检查，但如果把类型断言集中在一个地方，实现起来就轻松多了。（如果你经常需要写这类校验代码，第 74 条会介绍一些更系统的方法，用于在运行时验证 TypeScript 类型。它们的核心思想也是：把类型断言隐藏在类型良好的函数里！）

另一种隐藏类型断言的方式是：为函数提供一个单独的重载：

```ts
export async function fetchPeak(peakId: string): Promise<MountainPeak>
export async function fetchPeak(peakId: string): Promise<unknown> {
  return checkedFetchJSON(`/api/mountain-peaks/${peakId}`) // OK
}

const denali = fetchPeak('denali')
//    ^? const denali: Promise<MountainPeak>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgLIHsCu46gAoRwDWyA3gFDLIhwC2EAXMgM5hSgDmA3JcguuFARwTVuxDdeEADYQAbnDDABqCJCjMmITLQBG0HlRjANYAILMk4AJqEoWnfqg8AvuXJxmATxAJkMbAQlAT4ACwgEIggAEwAxNQRQgCkAZQB5ADkACkwoaVE2TgBKJjwodFpgZggAHmwiEHQAdxAAPjJefhBWZCgIZgAHAWrkAF5kOCbcMH8E0Jy8osNkYBhkLIBCPsHhiAA6dCIijqoqMFDypuoIK4BRKHKoLIADAFUaXVlkMHRZsESNsgACSkbZDbr7ViKTDMAAqEAAHmAXM8lrw3FQ+mBciBev1wdU9gArZgCLJotzkRFDKAzTw+PwBXzBXEwOYEYhZAaEIgASWiBXEHBKyDKFSqtQw2DAuBAHKIrR41PQtIm3l8-kCLL+iXlXJ5-MFxVK5Uq1TqIAazTaJzx2KguMSESicTmqUyLwA9HABsBPbQsDhQABabnEZiekFhvnRFFLKiez3INIAaXIlK6PWiwjg0mAYx1oT1AHJszQ88W0YnTsgAHoAfj4wxmZdzwBN4vNUqDcp5rXIQA)

在这种情况下，函数的重载向调用方展示的是一个类型签名，而实现内部使用的是另一个。这样写有一定的安全性：TypeScript 会检查这两个签名是否兼容。但本质上，它和类型断言并没有什么区别，你最好还是做一些数据校验来提高安全性。

有时候你也可能被迫使用类型断言，是因为 TypeScript 的类型检查器没法完全理解你的代码逻辑。比如，下面这个函数用于判断两个对象是否浅层相等：

```ts
function shallowObjectEqual(a: object, b: object): boolean {
  for (const [k, aVal] of Object.entries(a)) {
    if (!(k in b) || aVal !== b[k]) {
      //                      ~~~~ Element implicitly has an 'any' type
      //                           because type '{}' has no index signature
      return false
    }
  }
  return Object.keys(a).length === Object.keys(b).length
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZwBYEMA2m4HcDyARgFYCm0AogI4hYAU6AXInCeVADSKHOtnQBKZoThxMpdEgDeAKESJgcAE6I6EBMiiIA2gGsu6AGpYAui2CIi-KADpSYKEpilkDAQMSz58mBboBCOl1EGCRCDwAfCMQjLER-AF4E7j0TDy9veQB6LMy8-IKAP2LCxApxAFt7LRgKgAdMGAgYKEwAT0QMZBikAHJJNt7EKDa60jk8nILpme9CcnQQZFJh0ZXeqQBfIa7EMDgQsAATUgAPFBgAczB0KBAlcfyHu6UkYCxlgG4J+U2Jv-kz3uSCs7BsulIbVc6AENnEYEuUFQiCSyVB0HBkNc4Th9kRqG+fyAA)

虽然你刚刚检查过 `k in b` 为真，TypeScript 却仍然对 `b[k]` 报错，这确实有点让人意外。但事实就是如此，所以你只能用 `@ts-expect-error` 注释或者把它写成 `any` 类型来绕过。

下面这种写法是错误的修复方式：

```ts
function shallowObjectEqualBad(a: object, b: any): boolean {
  for (const [k, aVal] of Object.entries(a)) {
    if (!(k in b) || aVal !== b[k]) {
      // ok
      return false
    }
  }
  return Object.keys(a).length === Object.keys(b).length
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZwBYEMA2m4HcDyARgFYCm0AogI4hYAU6AXInCeVADSKHOtnQBKZoThxMpdEgDeAKESJgcAE6I6EBMiiIA2gGsu6AGpYAui2CIi-KADpSYKEpilkDAQMSz58mBboBCOl1EGCRCDwAfCMQjLER-AF4E7j0TDy9veQB6LMy8-IKAP2LCxApxAFt7LRgKgAdMGAgYKEwAT0QMZBikAHJJNt7EKDa60jk8nILpme9CcnQQZFJh0ZXeqQBfIa7EMDgQsAATUgAPFBgAczB0KBAlcfyHu6UkYCxlgG4J+U2Jv-kz3uSCs7BsulIbVc6AENnEYEuUFQiCSyVB0HBkNc4Th9kRqG+f1AkFgCBQGGweHRUGotEwACF0EcGLw2NAuDwem0hNxROJJJ4JooVGoNFo9AZjJgzHALNS7A4nC43OkfiE-IFgqFuJForFMPEkildGlPNlcnBdGrAaQXm8PqRvpkAYgXUDXpY2bYIVC3LiEUiUUb5T7sbD4fjCTIgA)

把参数 `b` 的类型改成 `any`，会允许传入运行时会崩溃的代码：

```ts
shallowObjectEqual({ x: 1 }, null)
//                         ~~~~ Type 'null' is not assignable to type 'object'.
shallowObjectEqualBad({ x: 1 }, null) // ok, throws at runtime
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZwBYEMA2m4HcDyARgFYCm0AogI4hYAU6AXInCeVADSKHOtnQBKZoThxMpdEgDeAKESJgcAE6I6EBMiiIA2gGsu6AGpYAui2CIi-KADpSYKEpilkDAQMSz58mBboBCOl1EGCRCDwAfCMQjLER-AF4E7j0TDy9veQB6LMy8-IKAP2LCxApxAFt7LRgKgAdMGAgYKEwAT0QMZBikAHJJNt7EKDa60jk8nILpme9CcnQQZFJh0ZXeqQBfIa7EMDgQsAATUgAPFBgAczB0KBAlcfyHu6UkYCxlgG4J+U2Jv-kz3uSCs7BsulIbVc6AENnEYEuUFQiCSyVB0HBkNc4Th9kRqG+f1AkFgCBQGGweHRUGotEwACF0EcGLw2NAuDwem0hNxROJJJ4JooVGoNFo9AZjJgzHALNS7A4nC43OkfiE-IFgqFuJForFMPEkildGlPNlcnBdGrAaQXm8PqRvpkAYgXUDXpY2bYIVC3LiEUiUUb5T7sbD4fjCTI0FgcAQvbT6FJTswAIybLhgEDYAQyKazAveEqlAAqa0QvSz2CGMG6+y06GQyCuN0I4mGBxGYwrfHYvRs0YpcepiYZTLoybTGb22cwAk+5pY+mGqCUeG6t0QSnAsCqMiAA)

更好的做法是把 `any` 类型隐藏在函数实现内部：

```ts
function shallowObjectEqualGood(a: object, b: object): boolean {
  for (const [k, aVal] of Object.entries(a)) {
    if (!(k in b) || aVal !== (b as any)[k]) {
      // `(b as any)[k]` is OK because we've just checked `k in b`
      return false
    }
  }
  return Object.keys(a).length === Object.keys(b).length
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZwBYEMA2m4HcDyARgFYCm0AogI4hYAU6AXInCeVADSKHOtnQBKZoThxMpdEgDeAKESJgcAE6I6EBMiiIA2gGsu6AGpYAui2CIi-KADpSYKEpilkDAQMSz58mBboBCOl1EGCRCDwAfCMQjLER-AF4E7j0TDy9veQB6LMy8-IKAP2LCxApxAFt7LRgKgAdMGAgYKEwAT0QMZBikAHJJNt7EKDa60jk8nILpme9CcnQQZFJh0ZXeqQBfIa7EMDgQsAATUgAPFBgAczB0KBAlcfyHu6UkYCxlgG4J+U2Jv-kz3uSCs7BsulIbVc6AENnEYEuUFQiCSyVB0HBkNc4Th9kRqG+f1AkFgCBQGGweHRUGotEwACF0EcGLw2NAuDwem0hNxROJJJ4JooVGoNFo9AZjJgzHALNS7A4nC43OkfiE-IFgqFuJForFMPEkildGlPNlcnBdGrAaQXm8PqRvpkAYgXUDXpY2bYIVC3LiEUiUUb5T7sbD4fjCTJidB4Eg0FgcAQvbSsABxUTMpgsL0c1nWHkiMQSaRC5SqdRgTQ6fQxKUyuVehWOZzQ9yCzK+VSaw46xBROtxRLJOiEGLdAYCVKq-JTAAGo-HXKnJrnIW6+AA0twFksVrhSL0AG4rYhLLQQVDkCFHRBzrVhOfWxDu+2YL5ql1u23Az3WTG+jC-r4kGaJNqGo7hniSJRkAA)

这里的 `any` 作用域很窄（参见第 43 条），不影响函数的类型签名，而且还加了注释说明为什么这样写是合理的。这种用法是 `any` 和类型断言的合理使用。你的代码既正确，类型签名也清晰，使用者完全不用担心。

当然，你应该对所有代码做单元测试，尤其是使用了类型断言的部分。既然你告诉 TypeScript 要信任你，那么就必须自己负责保证代码没问题。写注释说明为什么类型断言没问题很有帮助，但更重要的是写全面的测试来证明你的代码是正确的。

## 关键点总结

- 有时不安全的类型断言和 `any` 类型是必要的，因为能加快开发进度。当你需要使用它们时，将其隐藏在具有正确签名的函数内部。
- 不要为了修复实现中的类型错误而妥协函数的类型签名。
- 确保解释为什么你的类型断言是有效的，并且对代码进行充分的单元测试。

# 第 35 条: 使用更精确的替代方案代替字符串类型

## 要点

- 避免“stringly typed”（大量使用宽泛字符串）代码，尽量用更合适的类型，而不是让任何字符串都成为可能。
- 如果一个变量的取值域更准确地用字符串字面量联合类型表示，就优先用联合类型代替宽泛的 `string`，这样能让类型检查更严格，也让开发体验更好。
- 对于期望传入对象属性名的函数参数，优先用 `keyof T` 代替 `string`。

## 正文

还记得第 7 条提到的“类型的值域”吗？意思是某个类型可以接受的所有值的集合。比如 `string` 类型的值域非常大，"x" 和 "y" 属于它，但《白鲸记》整本书的文本（开头是 “Call me Ishmael...”，大约有 120 万个字符）也属于它。

所以当你声明一个 `string` 类型的变量时，你应该想一想：有没有更具体、更窄的类型会更合适？

比如你正在做一个音乐收藏系统，需要定义一个专辑（album）的类型，可以这样尝试：

```ts
interface Album {
  artist: string
  title: string
  releaseDate: string // YYYY-MM-DD
  recordingType: string // E.g., "live" or "studio"
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgIIBsBGBXAtsgbwChlk4oxgBnMALmRqlAHMBuE5SsdCexl9qSgQecKhAAicSHzBMQbUgHolyAJoa1AWgCyOrRIkdhCAPZQAJiwAqATwAOvBnIHLVAUQB0zTwBpkAETowABuEAHI5oE02FamAUQAvkRAA)

接口中大量使用 `string` 类型，以及用注释来补充类型信息（参考第 31 条），这两个信号都强烈说明这个接口设计可能不太合理。以下是可能出错的地方：

```ts
const kindOfBlue: Album = {
  artist: 'Miles Davis',
  title: 'Kind of Blue',
  releaseDate: 'August 17th, 1959', // Oops!
  recordingType: 'Studio', // Oops!
} // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgIIBsBGBXAtsgbwChlk4oxgBnMALmRqlAHMBuE5SsdCexl9qSgQecKhAAicSHzBMQbUgHolyAJoa1AWgCyOrRIkdhCAPZQAJiwAqATwAOvBnIHLVAUQB0zTwBpkAETowABuEAHI5oE02FamAUQAvkRmIDTIANagFgDyMABC6NhOGDj4ALyEHOSUNPQA5DrAPFTIUiHU9b4cXDwNANLZkTDIhcVdxiIQYpLSTvWo2MzY6QCMAOxgABb+qwCcAKx7XW7IOab2VACEk2aWNg7zAMpgscCmJ8gqZxfXSaynHL9IhAA)

比如 `releaseDate` 字段的格式和注释里要求的不一样，而 `studio` 的值应该是小写，却写成了大写的 'Studio'。但因为它们都是字符串，这个对象依然可以赋值给 `Album` 类型，TypeScript 的类型检查器也不会报错。

即使对象本身是合法的 `Album`，这种宽泛的 `string` 类型也可能掩盖一些错误。比如：

```ts
function recordRelease(title: string, date: string) {
  /* ... */
}
recordRelease(kindOfBlue.releaseDate, kindOfBlue.title) // OK, should be error
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgIIBsBGBXAtsgbwChlk4oxgBnMALmRqlAHMBuE5SsdCexl9qSgQecKhAAicSHzBMQbUgHolyAJoa1AWgCyOrRIkdhCAPZQAJiwAqATwAOvBnIHLVAUQB0zTwBpkAETowABuEAHI5oE02FamAUQAvkRmIDTIANagFgDyMABC6NhOGDj4ALyEHOSUNPQA5DrAPFTIUiHU9b4cXDwNANLZkTDIhcVdxiIQYpLSTvWo2MzY6QCMAOxgABb+qwCcAKx7XW7IOab2VACEk2aWNg7zAMpgscCmJ8gqZxfXSaynHL9IgwbAgBCUUwgZAmcwWABKUxmAApek5+Ap-BY5rJ5MwAJSEL4AKmQnnJyGJqmSsMsiNE4mRWRAuQKRQgnmEDNmkH8zNZYw5aPxAK+qiB-ioW1M2HQFmQmBQ0Cg5iIQA)

在调用 `recordRelease` 时，两个参数的位置写反了，但因为它们都是字符串，类型检查器也不会报错。正因为这种情况经常发生，所以人们把这种大量依赖字符串的代码叫做 “stringly typed”。

你能否通过缩小类型范围来避免这类问题？比如说，虽然把整本《白鲸记》当作歌手名或专辑名有点夸张，但理论上是说得通的，所以 `artist` 和 `title` 字段使用 `string` 类型是合适的。

但是 `releaseDate` 字段最好用 `Date` 对象，这样可以避免格式错误的问题。

至于 `recordingType` 字段，可以定义成只有两个值的联合类型（你也可以用枚举类型，但我通常建议避免使用它；详见第 72 条）：

```ts
type RecordingType = 'studio' | 'live'

interface Album {
  artist: string
  title: string
  releaseDate: Date
  recordingType: RecordingType
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAShDGB7ATgEwJYDsDmAVc0AvFAOQDOwArhoiVAD6kA26AbhCQNwBQ3WwEZADMAhvGgBBJgCNKAWygBvblCgjkwdBQBcUCsizYeqzcCYRd+w8ajII5kWQgAREQN2uBNu0jSH8kLpwvhg4ARA8AL7cQA)

通过这些修改，TypeScript 就能更严格地检查错误了。

```ts
const kindOfBlue: Album = {
  artist: 'Miles Davis',
  title: 'Kind of Blue',
  releaseDate: new Date('1959-08-17'),
  recordingType: 'Studio',
  // ~~~~~~~~~~~~ Type '"Studio"' is not assignable to type 'RecordingType'
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAShDGB7ATgEwJYDsDmAVc0AvFAOQDOwArhoiVAD6kA26AbhCQNwBQ3WwEZADMAhvGgBBJgCNKAWygBvblCgjkwdBQBcUCsizYeqzcCYRd+w8ajII5kWQgAREQN2uBNu0jSH8kLpwvhg4ARA8AL7cSJgUUADWWKgA8kIAQkyUFlBSsgrEyqrqmjqkALLo5mRQrqxaJAA0KlCm5rokANLJUIhCUJnZTS12Dk6eOZgQAO61bhAAFCQAjACcAKyrALQADAAcW8sA7CQAlM2qPiiheAQdAMpUNCTcAPSvUAB+3z+-31DhUgAIke1HQiCBdC0UEwiGAajIZHQ2EwImk5laiFaBFIwWu-gIL0iPCAA)

这种做法的好处不只是类型检查更严格。

首先，显式地定义类型可以确保它的含义在传来传去的过程中不会丢失。比如你想找出某种特定录音类型（`recordingType`）的专辑，可能会写这样一个函数：

```ts
function getAlbumsOfType(recordingType: string): Album[] {
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAShDGB7ATgEwJYDsDmAVc0AvFAOQDOwArhoiVAD6kA26AbhCQNwBQ3WwEZADMAhvGgBBJgCNKAWygBvblCgjkwdBQBcUCsizYeqzcCYRd+w8ajII5kWQgAREQN2uBNu0jSH8kLpwvhg4ARA8AL7cQpSY8JqImFDYEMBSsnJkAPJC4QAUPiiheASWwAY4AJS6GfIA2gC6SipQAPRtUADC2QCyAAowAKIAyiOtdlTIyU02HVBDAHLO3NHcQA)

那调用这个函数的人怎么知道 `type` 应该传什么？虽然实际只支持 'studio' 或 'live'，但类型是 `string`，没法明确表达这个约束。而解释这些值含义的注释藏在 `Album` 类型的定义里，调用者可能根本不会去看。

其次，显式定义类型还能让你为它写文档（详见第 68 条），提升可读性和维护性。

```ts
/** What type of environment was this recording made in? */
type RecordingType = 'live' | 'studio'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PQKhAIHUAsEMBdzwJ4AcCm4D2Azc6A7ANwEsAnLAgW0MQHdYBnJaE5s9AYyzIBMSCAc3BVYvTAID84EMABQKDOABKXHvyEAVNJgC84AOQAbEkXQHwAH0ON4AV35YDAbjlA)

当你把 `getAlbumsOfType` 的参数类型从 `string` 改为 `RecordingType` 后，调用这个函数的人就可以点进去查看 `RecordingType` 的文档了（见图 4-1）。

![图 4-1. Using a named type instead of string makes it possible to attach documen‐ tation to the type that is surfaced in your editor.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506082202084.png)

另一个常见的字符串误用场景是在函数参数中。

比如你想写一个函数，从一个对象数组中提取某个字段的所有值。Underscore 和 Ramda 这样的工具库把这个函数叫做 `pluck`。

```js
function pluck(records, key) {
  return records.map((r) => r[key])
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwDYggawBQCcCmEcuAJgM4A0im+AngJSIDeAUIogVCLkgUaWQB0AWwCGyPIgC8APg4BtGrQC69ANwsAviyA)

那你该怎么给这个函数写类型呢？下面是一个最初的尝试：

```ts
function pluck(records: any[], key: string): any[] {
  return records.map((r) => r[key])
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwDYggawBQCcCmEcuAJgM4BciAhmAJ4DaAugDSKb51VlS4xgBzAJRVajJogDeAKESICUELiQEipMgDoAttWR5EAXgB88hhzpMhAbmkBfaUA)

虽然这样写类型检查不会报错，但效果很差。特别是返回值的 any 类型，会带来很多问题（详见第 43 条）。

改进这个类型签名的第一步，是引入一个泛型类型参数：

```ts
function pluck<T>(records: T[], key: string): any[] {
  return records.map((r) => r[key])
  //                      ~~~~~~ Element implicitly has an 'any' type
  //                             because type '{}' has no index signature
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwDYggawDwBUB8AFAE4CmEcxAJgM4BciuA2gLoA0impAngzVMRhgA5gEoGAQzDdWiAN4AoRIjJQQxJGQrUaAOgC2E5CUQBefCqZduLUQG4liAPRPlb9x8-KAfr7+IAUVRSfVIwKEQYfTQYCBgoVG5EAAsJGkQpRAByKW4sxChuZFJHFy9yio8AI3IJEBpSAqLGrLkAX3zU9LA4SLAqUgAPRBoYYTAJNTIFNoUgA)

TypeScript 现在会提示：`key` 的类型是 `string` 太宽泛了。而这个提示是对的 —— 如果你传入的是 `Album` 类型的数组，那 `key` 实际上只能是 `"artist"`、`"title"`、`"releaseDate"` 或 `"recordingType"`，而不是任意字符串。

这正是 `keyof Album` 类型要表达的意思 —— 它表示 `Album` 类型所有属性名组成的联合类型。

```ts
type K = keyof Album
//   ^? type K = keyof Album
//      (equivalent to "artist" | "title" | "releaseDate" | "recordingType")
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAShDGB7ATgEwJYDsDmAVc0AvFAOQDOwArhoiVAD6kA26AbhCQNwBQ3WwEZADMAhvGgBBJgCNKAWygBvblCgjkwdBQBcUCsizYeqzcCYRd+w8ajII5kWQgAREQN2uBNu0jSH8kLpwvhg4ARA8AL7coJBQANJQxADWECCIQlBSsnI8APR5qlAAegD8ULHQiSlpGVky8jEEsBBkiEzsADwwIgDuAHxJsH1QEAAeApioZFAAYpSY8JqImFDlPb1QuooA2olYUKnpmRsAukF9e6eRPJVQAMogmMAAFtUtbR0QnfH9+YWqMoVZqPZ5vIYAInUmgoEIYUAhpnMcMYELsDicnggKIRPhQoTwBAhvCAA)

所以解决办法就是把 `string` 替换成 `keyof T`：

```ts
function pluck<T>(records: T[], key: keyof T) {
  return records.map((r) => r[key])
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAShDGB7ATgEwJYDsDmAVc0AvFAOQDOwArhoiVAD6kA26AbhCQNwBQ3WwEZADMAhvGgBBJgCNKAWygBvblCgjkwdBQBcUCsizYeqzcCYRd+w8ajII5kWQgAREQN2uBNu0jSH8kLpwvhg4ARA8AL7cQpSY8JqImFBgTJTwANYAPLgAfAAUPiioZLq4ANoAugA0UBkQILr1IIhCULgAlEoqthBUyMlFaGQAdHIiYIVQhLm25c2VHVHcQA)

这个版本可以通过类型检查，而且我们还让 TypeScript 自动推断返回类型。那么推断得怎么样呢？如果你在编辑器里把鼠标悬停在 `pluck` 上，看到的返回类型是：

```ts
function pluck<T>(record: T[], key: keyof T): T[keyof T][]
```

这个类型表示：`T` 中任意字段的值组成的数组。换句话说，可能是 `T` 里任何字段的值类型。

但如果你只传入了一个确定的字符串作为 `key`，这个推断就太宽泛了。例如：

```ts
const releaseDates = pluck(albums, 'releaseDate')
//    ^? const releaseDates: (string | Date)[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAShDGB7ATgEwJYDsDmAVc0AvFAOQDOwArhoiVAD6kA26AbhCQNwBQ3WwEZADMAhvGgBBJgCNKAWygBvblCgjkwdBQBcUCsizYeqzcCYRd+w8ajII5kWQgAREQN2uBNu0jSH8kLpwvhg4ARA8AL7cQpSY8JqImFBgTJTwANYAPLgAfAAUPiioZLq4ANoAugA0UBkQILr1IIhCULgAlEoqthBUyMlFaGQAdHIiYIVQhLm25c2VHVHcqAhM6tDmwGoy8qVQUrJyVTxImBS9Dk6eEGTTKWmZ+SK7cmS1JHZXLm4cS9wAegBqlUAD0APxQM4XL4QRw-AT7fJWHAMKA3DpVbhAA)

返回类型应该是 `Date[]`，而不是 `(string | Date)[]`。虽然 `keyof T` 比 `string` 要窄很多，但仍然不够精确。

要进一步缩小类型范围，我们需要引入第二个类型参数，这个参数是 `keyof T` 的子类型，通常是某个具体的属性名：

```ts
function pluck<T, K extends keyof T>(records: T[], key: K): T[K][] {
  return records.map((r) => r[key])
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwDYggawDwBUA0iA0ogKYAeUpYAJgM6KakCecwiuAfABQBOpEOL3oAuDgG0AuoSbMxRAJRjc4opKmIA3gChEiflBC8k-QcLoA6ALYBDZH0QBeTvvGzJCgNzaAvtqA)

现在类型签名就完全正确了。我们可以通过不同的调用方式来验证这一点：

```ts
const dates = pluck(albums, 'releaseDate')
//    ^? const dates: Date[]
const artists = pluck(albums, 'artist')
//    ^? const artists: string[]
const types = pluck(albums, 'recordingType')
//    ^? const types: RecordingType[]
const mix = pluck(albums, Math.random() < 0.5 ? 'releaseDate' : 'artist')
//    ^? const mix: (string | Date)[]
const badDates = pluck(albums, 'recordingDate')
//                             ~~~~~~~~~~~~~~~
// Argument of type '"recordingDate"' is not assignable to parameter of type ...
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwDYggawDwBUA0iA0ogKYAeUpYAJgM6KakCecwiuAfABQBOpEOL3oAuDgG0AuoSbMxRAJRjc4opKmIA3gChEiflBC8k-QcLoA6ALYBDZH0QBeTvvGzJCgNzaAvtqjMyKSIAEoCQjQwYADmuIHBjogA5HSGkXBJiAA+yagwAG6kSd7aUVS8wDYQwQCCqABGIFZauog2vLCpYqm8UdHeerBQqKTdUL0xA-qkIzZ0pAAiNlRiS1RTphF9cUFiYWaRMTuk3n40AqjtwSNQbQ1NdGJ1jVZS3oJgqYg0y6QMiWgMJhuDZ7lY6IQkvxZvM1kUvNoAPSIvR6AB6AH5EB8vj8qI9EHCpNocbd2p0oP8UOgsCCwRDkuSYKkkgjkajEJjsQgvkzUgSen1iaTEAEglTAbTQS8GVDwsJtvFWd52aiuSKxX89vLDrF4sKebcrDByE5qUC6TLCABZZYACwsvBstDgVm4CkQ2EQAAYLABWRBYuUwxa-TJiJJ8qDKpEotVYkXG8hibiCmLZQm-BQGz63eo2GhwiU04HSh6QzYKmJwmOqjn1huN+sAP1bbfbHdjiBqvGiTWotzYoviyQARJXdXDR5lmYgwHAyXQ6DBomAbPURqK4Ch2jYrKRyogh5rEBYz9ogA)

语言服务还能根据 `Album` 的键提供自动补全功能（如图 4-2 所示）。

![图 4-2.Using a parameter type of keyof Album instead of string results in better autocomplete in your editor.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506082211155.png)

`string` 类型和 `any` 有些类似的问题：用得不恰当时，它允许无效的值出现，还会隐藏类型之间的关系。这会干扰类型检查器，掩盖真实的 bug。

TypeScript 能定义字符串的子集，这是给 JavaScript 代码带来类型安全的强大手段。使用更精确的类型，不仅能捕获错误，还能提升代码的可读性。

本条重点讲的是有限集合的字符串，但 TypeScript 也支持建模无限集合，比如所有以 "http:" 开头的字符串。这种情况可以用模板字面量类型，详见第 54 条。

## 关键点总结

- 避免“stringly typed”（大量使用宽泛字符串）代码，尽量用更合适的类型，而不是让任何字符串都成为可能。
- 如果一个变量的取值域更准确地用字符串字面量联合类型表示，就优先用联合类型代替宽泛的 `string`，这样能让类型检查更严格，也让开发体验更好。
- 对于期望传入对象属性名的函数参数，优先用 `keyof T` 代替 `string`。

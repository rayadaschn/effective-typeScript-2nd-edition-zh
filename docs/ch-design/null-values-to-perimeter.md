# 第 33 条：把 `null` 值留在类型的外层

## 要点

- 避免设计中一个值是否为 `null` 隐式地与另一个值是否为 `null` 相关联。
- 通过使较大的对象要么为 `null`，要么完全非 `null`，将 `null` 值推到 API 的外围。这将使代码对程序员和类型检查器更加清晰。
- 考虑创建一个完全非 `null` 的类，并在所有值都可用时构造它。

## 正文

当你刚开启 `strictNullChecks` 时，可能会觉得代码里得加一大堆 `if` 判断来检测 `null` 和 `undefined`。这通常是因为 `null` 和非 `null` 值之间的关系是隐含的：当变量 A 非 `null` 时，你知道变量 B 也非 `null`，反之亦然。这种隐含关系让代码阅读者和类型检查器都感到困惑。

如果值要么完全是 `null`，要么完全不是 `null`，比起混合状态，处理起来会更简单。你可以通过把 `null` 值保留在数据结构的外层。

举个例子，假设你想计算一组数字的最小值和最大值，我们称之为“范围（extent）”。下面是一个尝试的写法：

```ts
// @strictNullChecks: false
function extent(nums: Iterable<number>) {
  let min, max
  for (const num of nums) {
    if (!min) {
      min = num
      max = num
    } else {
      min = Math.min(min, num)
      max = Math.max(max, num)
    }
  }
  return [min, max]
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&strictNullChecks=false#code/PTAEAEGcBcCcEsDG0ByBXANhgwgCwKaIDWkAXKAGYCGGk+AUBWgHbLwD2zo+AHtPs2gAKZmgC2ZUAEl+sKgCMM+ADyix8-LAB8ASlABveqFBLooMfGYAac1R4BuI5XaxQQxJxig1odhW-ikHqGxsbw-kIAhBbMwU6h5pagALwBYo4JxmJ2KWkZoQC+3LT4BvGhMbkAslTQuAB0MUIxNmo6+QnZPNW1DV3Ndq3i7eUFTmPGsPjQaLBcANottjwAuo5jQA)

这段代码在关闭 `strictNullChecks` 时类型检查是通过的，返回类型被推断为 `number[]`，看起来没问题。但它存在一个 bug 和一个设计缺陷：

- 如果 `min` 或 `max` 是 0，可能会被覆盖。例如，`extent([0, 1, 2])` 会返回 `[1, 2]`，而不是 `[0, 2]`。
- 如果传入的 `nums` 数组是空的，函数会返回 `[undefined, undefined]`。

这种带有多个 `undefined` 的返回值对象，调用起来很麻烦，也正是这条建议想要避免的类型。我们通过阅读源码知道，要么 `min` 和 `max` 都是 `undefined`，要么都不是，但这种信息没有在类型系统中体现出来。

打开 `strictNullChecks` 后，这个 `undefined` 的问题就更明显了。

```ts
function extent(nums: Iterable<number>) {
  let min, max
  for (const num of nums) {
    if (!min) {
      min = num
      max = num
    } else {
      min = Math.min(min, num)
      max = Math.max(max, num)
      //             ~~~ Argument of type 'number | undefined' is not
      //                 assignable to parameter of type 'number'
    }
  }
  return [min, max]
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAUwB5WWKAKMIC2AzgFyICSGATgIYBGANsgDx763KUB8AlIgN4AoRIkZRE+GGAA046qgDcQxMDiVE2CAkJjWiOMEStCvQcOEwD2AIQSwJpWfGTEAXkMFFj4fjmv3+TzMAXxR6QmR+BzNbPwBZaigACwA6W2xbGVZuQMcfVDiElLz0uUyCbKjhAHoqrzrhAD8mxABBSgBzAkwxfUQoAE8ABwiAclZ2NQAfRHAAE2RgSWRZkcQYQkM4KErEGvr94WpCQhh2sDpGPrhEQeoafGQqPQMB4cQxggmRqKClX+FKI8QJQkABtDKyVAAXUUvyAA)

现在 `extent` 的返回类型被推断为 `(number | undefined)[]`，这让设计缺陷更加明显了。每当你调用 `extent` 的时候，很可能都会因为类型错误而报错。

```ts
const [min, max] = extent([0, 1, 2])
const span = max - min
//           ~~~   ~~~ Object is possibly 'undefined'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAUwB5WWKAKMIC2AzgFyICSGATgIYBGANsgDx763KUB8AlIgN4AoRIkZRE+GGAA046qgDcQxMDiVE2CAkJjWiOMEStCvQcOEwD2AIQSwJpWfGTEAXkMFFj4fjmv3+TzMAXxR6QmR+BzNbPwBZaigACwA6W2xbGVZuQMcfVDiElLz0uUyCbKjhAHoqrzrhAD8mxABBSgBzAkwxfUQoAE8ABwiAclZ2NQAfRHAAE2RgSWRZkcQYQkM4KErEGvr94WpCQhh2sDpGPrhEQeoafGQqPQMB4cQxggmRqKClX+FKI8QJQkABtDKyVAAXUUv00YG0iHBkhkeShfjQGCw2FBAAYZABGGQAJihFXhiMItyQbjyiAAtE4wIo9gdEE0GmYOYgAPK0ABWyGgaw2gzgxxgDH67zmCyWKwEQA)

`extent` 实现中的错误是因为你排除了 `undefined` 作为 `min` 的值，但没有对 `max` 做同样的处理。虽然 `min` 和 `max` 是一起初始化的，但这种关系没有在类型系统中体现出来。你可以通过给 `max` 也加一个检查来“修复”，但这其实只是把 bug 固化了。

更好的做法是，把 `min` 和 `max` 放在同一个对象里，并让这个对象要么整体是 `null`，要么整体都不是 `null`。

```ts
function extent(nums: Iterable<number>) {
  let minMax: [number, number] | null = null
  for (const num of nums) {
    if (!minMax) {
      minMax = [num, num]
    } else {
      const [oldMin, oldMax] = minMax
      minMax = [Math.min(num, oldMin), Math.max(num, oldMax)]
    }
  }
  return minMax
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAUwB5WWKAKMIC2AzgFyICSGATgIYBGANsgDx763KUB8AlIgN4AoRIkZRE+GGACy1VKQDardpQA0iJRwC6iAD7qQ9eogC8+wwG4hiYHEqJsEBITGtEcYPqK9Bw4TA-YAIQS0rLeVr7ikjKoJoiKBGqsmpaRAL4o9ITI-BG+jmDO8XD0ACZSkmol5bLapiExqZFRobGm8jJQABYAdCG4iW5lFWDcap29+LID+FXDYSl5aVbLwpTIUCCUSA2ylstAA)

现在的返回类型是 `[number, number] | null`，这对使用者来说更友好。可以通过非空断言来获取 `min` 和 `max`：

```ts
const [min, max] = extent([0, 1, 2])!
const span = max - min // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAUwB5WWKAKMIC2AzgFyICSGATgIYBGANsgDx763KUB8AlIgN4AoRIkZRE+GGACy1VKQDardpQA0iJRwC6iAD7qQ9eogC8+wwG4hiYHEqJsEBITGtEcYPqK9Bw4TA-YAIQS0rLeVr7ikjKoJoiKBGqsmpaRAL4o9ITI-BG+jmDO8XD0ACZSkmol5bLapiExqZFRobGm8jJQABYAdCG4iW5lFWDcap29+LID+FXDYSl5aVbLwpTIUCCUSA2ylssFRfIhalOodSjomDjyAAxqAIxqAEya3IGWh2KEAA7USPVZIgALQtczCAD0EMQAHkANICIA)

或者通过一次性判断是否为 `null` 来处理：

```ts
const range = extent([0, 1, 2])
if (range) {
  const [min, max] = range
  const span = max - min // OK
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAUwB5WWKAKMIC2AzgFyICSGATgIYBGANsgDx763KUB8AlIgN4AoRIkZRE+GGACy1VKQDardpQA0iJRwC6iAD7qQ9eogC8+wwG4hiYHEqJsEBITGtEcYPqK9Bw4TA-YAIQS0rLeVr7ikjKoJoiKBGqsmpaRAL4o9ITI-BG+jmDO8XD0ACZSkmol5bLapiExqZFRobGm8jJQABYAdCG4iW5lFWDcap29+LID+FXDYSl5aVbLwpTIUCCUSA2ylssFRTRgAOY5pmgYWNjyAAxqAIxqAEya3Jb+9sdn4cKHYvIQmopqg6ohvsgmv9EIQAA7UJD1WSIAC0LXMwgA9JjEAB5ADSAmWQA)

通过用一个对象来统一管理 `extent`，我们改进了设计，让 TypeScript 能更好地理解 null 值之间的关系，同时也修复了 bug：现在的 `if (!minMax)` 检查完全没有问题了。

（下一步可以考虑禁止传入空数组给 `extent`，这样就不会再返回 `null` 了。第 64 条讲了如何在 TypeScript 的类型系统中表示“非空数组”。）

混合使用 null 和非 null 值，在类中也可能引发问题。比如，假设你有一个类，用来同时表示一个用户和他在论坛上的帖子：

```ts
class UserPosts {
  user: UserInfo | null
  posts: Post[] | null

  constructor() {
    this.user = null
    this.posts = null
  }

  async init(userId: string) {
    return Promise.all([
      async () => (this.user = await fetchUser(userId)),
      async () => (this.posts = await fetchPostsForUser(userId)),
    ])
  }

  getUserName() {
    // ...?
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgKoGdoEkQwPbIDeyIcAthAFzLphSgDmyAvgFCiSyIoAKetRZAAd+YarXogmbACYQEAGzhQUMAK4gEYYHhDIYEMAgAWGaAAo1mKFhni6jAJTUeUPGWCYAPGZu48AHwA3KxyisqqGlo6egZGxny06ABieFC+lta29pIMzsiu7p4QXolgANoAusGs4ejoaNZlDYSsyMhW0NS+OPjIAD4kagoKIe0iSS6iVQNDIyFtyAi6EmpaaeaORIvtYMaeAHSdUMgAvHOjO8h7hxNgDecgw5ftbItw6ACemsigwGCZbB2GgOKRbVrtdoqMBqKB6QoeTAHOAjczlK7tD7fBDITZnALXfboI7WM7IOAAdzg-30hhMGWOtkcABoMeSvj88acCTdiXcHuSqTS4iZmql0tZATYZI4rpVHGMWKxFgxDL4AHLkCB4iGQgD0euQB2NAH5Fmw2EA)

在两个网络请求加载期间，`user` 和 `posts` 属性都是 `null`。在任何时刻，它们的状态可能是：

1. 两个都是 `null`
2. 一个是 `null`，另一个不是
3. 两个都不是 `null`

一共存在四种可能。这种复杂性会蔓延到类的每一个方法中，几乎肯定会引发混乱、大量的 null 检查，以及各种 bug。

更好的设计是：等到所有需要的数据都准备好之后，再创建这个类的实例。

```ts
class UserPosts {
  user: UserInfo
  posts: Post[]

  constructor(user: UserInfo, posts: Post[]) {
    this.user = user
    this.posts = posts
  }

  static async init(userId: string): Promise<UserPosts> {
    const [user, posts] = await Promise.all([
      fetchUser(userId),
      fetchPostsForUser(userId),
    ])
    return new UserPosts(user, posts)
  }

  getUserName() {
    return this.user.name
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgKoGdoEkQwPbIDeyIcAthAFzLphSgDmyAvgFCiSyIoAKetRZAAd+YarXogmbACYQEAGzhQUMAK4gEYYHhDIYEMAgAWGaAAo1mKFhni6jAJTUeUPGWCYAPGZu48AHwA3KxyisqqGlo6egZGxny06ABieFC+lta29pIMzsiu7p4QXolgANoAusGs4ejoaNZlDYSsyMhW0NS+OPgh7SJJLqJVIW3ICLoSalppmV2N2P4ANMKi6MO0VY5E4+1gxp4AdJ1QyAC8Hdb97cgHx4NgDZeP6Dds47Rw2gjIcOgAT00yFAwDA8xsdhoDik+UKHm8vmaAV2twmUzAyHKp1Wr0qFz+AHc4GCCm4ERAjnAFApzOU9rc4iYMqdbI5lgz2kyEutUulrBC2QzKo4bu0VGA1FA9CAIITFlBmhDcetReMPu0GIZfAA5cgQcw7VpoiVSvT3dAnaxHUgUd6sNhAA)

现在的 `UserPosts` 类中所有属性都不是 `null`，这样写出来的方法更容易正确。当然，如果你确实需要在数据还没完全加载时就开始操作，那就必须面对各种 null 和非 null 状态组合的复杂性。

不要想着用 Promise 来替代可空属性。这样做通常会让代码更混乱，而且会迫使你把所有方法都变成 `async`。Promise 虽然能让加载数据的逻辑更清晰，但在使用这些数据的类中，反而会让代码更难理解。

## 关键点总结

- 避免让某个值是否为 null 与另一个值的 null 状态之间存在隐式关联。
- 尽量把 null 推到 API 的边缘——让整个对象要么为 null，要么完全非 null。这样写出来的代码对人类读者和类型检查器都更友好。
- 考虑只在所有值都准备好时再创建一个完全非 null 的类实例。

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

---

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

---

```ts
const [min, max] = extent([0, 1, 2])
const span = max - min
//           ~~~   ~~~ Object is possibly 'undefined'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAUwB5WWKAKMIC2AzgFyICSGATgIYBGANsgDx763KUB8AlIgN4AoRIkZRE+GGAA046qgDcQxMDiVE2CAkJjWiOMEStCvQcOEwD2AIQSwJpWfGTEAXkMFFj4fjmv3+TzMAXxR6QmR+BzNbPwBZaigACwA6W2xbGVZuQMcfVDiElLz0uUyCbKjhAHoqrzrhAD8mxABBSgBzAkwxfUQoAE8ABwiAclZ2NQAfRHAAE2RgSWRZkcQYQkM4KErEGvr94WpCQhh2sDpGPrhEQeoafGQqPQMB4cQxggmRqKClX+FKI8QJQkABtDKyVAAXUUv00YG0iHBkhkeShfjQGCw2FBAAYZABGGQAJihFXhiMItyQbjyiAAtE4wIo9gdEE0GmYOYgAPK0ABWyGgaw2gzgxxgDH67zmCyWKwEQA)

---

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

---

```ts
const [min, max] = extent([0, 1, 2])!
const span = max - min // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAUwB5WWKAKMIC2AzgFyICSGATgIYBGANsgDx763KUB8AlIgN4AoRIkZRE+GGACy1VKQDardpQA0iJRwC6iAD7qQ9eogC8+wwG4hiYHEqJsEBITGtEcYPqK9Bw4TA-YAIQS0rLeVr7ikjKoJoiKBGqsmpaRAL4o9ITI-BG+jmDO8XD0ACZSkmol5bLapiExqZFRobGm8jJQABYAdCG4iW5lFWDcap29+LID+FXDYSl5aVbLwpTIUCCUSA2ylssFRfIhalOodSjomDjyAAxqAIxqAEya3IGWh2KEAA7USPVZIgALQtczCAD0EMQAHkANICIA)

---

```ts
const range = extent([0, 1, 2])
if (range) {
  const [min, max] = range
  const span = max - min // OK
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAUwB5WWKAKMIC2AzgFyICSGATgIYBGANsgDx763KUB8AlIgN4AoRIkZRE+GGACy1VKQDardpQA0iJRwC6iAD7qQ9eogC8+wwG4hiYHEqJsEBITGtEcYPqK9Bw4TA-YAIQS0rLeVr7ikjKoJoiKBGqsmpaRAL4o9ITI-BG+jmDO8XD0ACZSkmol5bLapiExqZFRobGm8jJQABYAdCG4iW5lFWDcap29+LID+FXDYSl5aVbLwpTIUCCUSA2ylssFRTRgAOY5pmgYWNjyAAxqAIxqAEya3Jb+9sdn4cKHYvIQmopqg6ohvsgmv9EIQAA7UJD1WSIAC0LXMwgA9JjEAB5ADSAmWQA)

---

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

---

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

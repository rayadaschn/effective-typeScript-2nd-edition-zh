# 第 26 条：使用函数式写法和函数式库来帮助类型推导

## 要点

- 使用内置的函数式写法和像 Lodash 这样的工具库，代替手写循环，这样能让类型更好地传递，代码更易读，也减少显式类型注解的需求。

## 正文

JavaScript 一直没有像 Python、C 或 Java 那样的标准库。多年来，很多库试图填补这个空缺。jQuery 不仅提供了操作 DOM 的工具，也有遍历和映射对象、数组的辅助方法；Underscore 更专注于通用工具函数，Lodash 在此基础上进一步扩展；而如今的 Ramda 则把函数式编程的思想带入了 JavaScript 世界。

其中一些函数式库的功能，比如 `map`、`flatMap`、`filter` 和 `reduce`，现在已经被纳入 JavaScript 的原生语法中。这些写法本身在 JavaScript 中就已经比手写循环更简洁，而在 TypeScript 中优势会更明显——因为它们的类型定义可以让类型“自动流动”起来，而你用手写循环时需要自己负责类型管理。

举个例子，比如你要解析一些 CSV 数据，你可以用普通的 JavaScript 以命令式风格来写：

```js
const csvData = '...'
const rawRows = csvData.split('\n')
const headers = rawRows[0].split(',')

const rows = rawRows.slice(1).map((rowStr) => {
  const row = {}
  rowStr.split(',').forEach((val, j) => {
    row[headers[j]] = val
  })
  return row
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMEDcAiBDKKYF4YCIB0BOA3AFCiSwBOKA7gEog0RZyKrp4QAOANgJZQAFAHIAOmGEBKUuWgwAFgFMUAE0WVm2avUYQA2gAYAup14CRAGimky4OZV0ttDJp37BFggIyS8AWxQuQUEHGgBlKEpJLAA+GABvEhg4OypGFniAX1Jk0IjKU34hHAscXwAzEEoAURRgeWCEFB4LGAAraMw4xOTcxj0lVXV9NqMjFiaeHJhM6SSYSkUoAFdKMAXGUlnSIA)

更偏向函数式编程的 JavaScript 开发者可能更喜欢用 `reduce` 来构建行对象：

```js
const rows = rawRows
  .slice(1)
  .map((rowStr) =>
    rowStr
      .split(',')
      .reduce((row, val, i) => ((row[headers[i]] = val), row), {})
  )
```

这种写法虽然更简洁，但可能对部分人来说不太直观。Lodash 提供的 `zipObject` 函数，可以通过“拉链”方式把键数组和值数组组合成对象，使代码更加简洁：

```ts
import _ from 'lodash'
const rows = rawRows
  .slice(1)
  .map((rowStr) => _.zipObject(headers, rowStr.split(',')))
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMEDcAiBDKKYF4YCIB0BOA3AFCiSwBOKA7gEog0RZyKrp4QAOANgJZQAFAHIAOmGEBKUuWgwAFgFMUAE0WVm2avUYQA2gAYAup14CRAGimk+AWy4hKsAPowAZpRC2YwniBUoEPLCMuBynkws2gxMnPzAioIAjJIkMOkweLYoXIIRAMpQlFgAfDDOeABefFwA8gBGAFaKwEJKquoQFjAFRab8QsJWkiOkQA)

我个人觉得这种写法是所有方案里最清晰的。但引入第三方库会增加项目依赖，也需要团队成员学习使用，这样做值不值得呢？

如果加上 TypeScript，这个天平会更倾向于 Lodash 方案。

无论是哪个纯 JavaScript 版本的 CSV 解析器，在 TypeScript 中都会出现同样的错误：

```ts
const rowsImperative = rawRows.slice(1).map((rowStr) => {
  const row = {}
  rowStr.split(',').forEach((val, j) => {
    row[headers[j]] = val
    // ~~~~~~~~~~~~ No index signature with a parameter of
    //              type 'string' was found on type '{}'
  })
  return row
})
const rowsFunctional = rawRows.slice(1).map((rowStr) =>
  rowStr.split(',').reduce(
    (row, val, i) => ((row[headers[i]] = val), row),
    //                 ~~~~~~~~~~~~~~~ No index signature with a parameter of
    //                                 type 'string' was found on type '{}'
    {}
  )
)
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMEDcAiBDKKYF4YCIB0BOA3AFCiSwBOKA7gEog0RZyKrp4QAOANgJZQAFAHIAOmGEBKUuWgwAFgFMUAE0WVm2avUYQA2gAYAup14CRAGimk+AWy4hKsAPowAZpRC2YwniBUoEPLCMuBynkwAkvbqaHwIiizaDEyc-MCKggCMkni2KFyCEQDKUJRYAHwwAN4kMHBhVIws1QC+pPUlZab8QsJWuW6OAKIowPKCgggoPBYwAFaSlTV19TARekqq6vrzRkYs0zwdawD0pzAAftc3t9cwAHIgMHxgagAeMBB8AOZgaABXSiJGgCeQwDBcFDUWyKKDqGAgNyrernNbojH1KAATy4iWE0Eorx+whgNEC7hAALeiLAMBxeJ8bWEq1a0lWwKgQLpEVIbNCFHWugAYtTgFA+OAZklaCkIGk+BlspJVnkCpMupQlpgKiihTRSpQ9fUeuYcBYcCrMXhgSoAUrjWsiow5kc5nxtVUNYxNso1Bo9Hx9ocZpI5hEw47URdMbG1ncE7dHs9Xh8vr9-lzgWSwRCYFCYXCEUiozA0XGK5WMQz8YTiaTycwhtSVLT6bj8czS21HVaYOygA)

解决方法是在 `{}` 上添加类型注解，比如 `{ [column: string]: string }` 或者使用 `Record<string, string>`。

而 Lodash 版本则无需修改，直接通过类型检查：

```ts
const rowsLodash = rawRows
  .slice(1)
  .map((rowStr) => _.zipObject(headers, rowStr.split(',')))
rowsLodash
// ^? const rowsLodash: _.Dictionary<string>[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMEDcAiBDKKYF4YCIB0BOA3AFCiSwBOKA7gEog0RZyKrp4QAOANgJZQAFAHIAOmGEBKUuWgwAFgFMUAE0WVm2avUYQA2gAYAup14CRAGimk+AWy4hKsAPowAZpRC2YwniBUoEPLCMuBynkwAMv6B8lgkMDDaDEyc-MCKggCMkni2KFyCEQDKUJRYAHwwzngAXnxcAPIARgBWisBCSqrqEBZJjKWUpvxCwlaSk6QRENEBQSQA9IswAHoA-HBhVLpzsQBc1XhIfJ184CiUAJ4APNCUfGAA5hV6RiRAA)

`Dictionary` 是 Lodash 提供的类型别名。`Dictionary<string>` 和 `{ [key: string]: string }` 或 `Record<string, string>` 是一样的。这里关键是 `rows` 的类型完全正确，根本不需要额外的类型注解。

当你的数据处理变得更复杂时，这些优势会更加明显。比如，假设你有一个对象，里面包含了 NBA 各队球员名单：

```ts
interface BasketballPlayer {
  name: string
  team: string
  salary: number
}
declare const rosters: { [team: string]: BasketballPlayer[] }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMEDcAiBDKKYF4YCIB0BOA3AFCiSwBOKA7gEog0RZyKrp4QAOANgJZQAFAHIAOmGEBKUuWgwAFgFMUAE0WVm2avUYQA2gAYAup14CRAGimk+AWy4hKsAPowAZpRC2YwniBUoEPLCNmBQ6m4owIowAEKBANaKUABGKDw8AAo8KACe6jAA3iQwMGAotooAXDDQlHxgAOakpeEVNXUNzSW16SiUuTVgAK62KeqkAL4kasA5lDGyVCDQ6hA1hXptth1Q9U1GNfEQSanpWTn5lHpGk6RAA)

如果用循环和 `concat` 来构建一个扁平列表，代码虽然能正常运行，但不会通过类型检查：

```ts
let allPlayers = []
//  ~~~~~~~~~~ Variable 'allPlayers' implicitly has type 'any[]'
//             in some locations where its type cannot be determined
for (const players of Object.values(rosters)) {
  allPlayers = allPlayers.concat(players)
  //           ~~~~~~~~~~ Variable 'allPlayers' implicitly has an 'any[]' type
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMEDcAiBDKKYF4YCIB0BOA3AFCiSwBOKA7gEog0RZyKrp4QAOANgJZQAFAHIAOmGEBKUuWgwAFgFMUAE0WVm2avUYQA2gAYAup14CRAGimk+AWy4hKsAPowAZpRC2YwniBUoEPLCNmBQ6m4owIowAEKBANaKUABGKDw8AAo8KACe6jAA3iQwMGAotooAXDDQlHxgAOakpeEVNXUNzSW16SiUuTVgAK62KeqkAL4kasA5lDGyVCDQ6hA1hXptth1Q9U1GNfEQSanpWTn5lHpGk6Q8yTDn2XlrLDekAPSfpQB+-wDATAAGr9PgoFIPHzPS5rYQwOxmYACHi5BSBGBQXJcGLCFBgXI3YQkb6lMnk8kNWpeGJ+YBoPjgZg0JQLBFQZhYnFwfFgECwcYwNThSi2BqKFQkNyOGCCJYwXivDQwEBuGAAeRSACtFMAoHgEOlhooIIJPKsNJJJEUejClZonhkXlcIHhyPShIqXdIeqSKRTAYHfiCwRCoXinbCNPDEfxkVBUejmPjoQSiZjsYoSNMgA)

（`concat` 方法不会触发第 25 条中提到的“演化”行为。）

要修复这个错误，你需要给 `allPlayers` 添加类型注解：

```ts
let allPlayers: BasketballPlayer[] = []
for (const players of Object.values(rosters)) {
  allPlayers = allPlayers.concat(players) // OK
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMEDcAiBDKKYF4YCIB0BOA3AFCiSwBOKA7gEog0RZyKrp4QAOANgJZQAFAHIAOmGEBKUuWgwAFgFMUAE0WVm2avUYQA2gAYAup14CRAGimk+AWy4hKsAPowAZpRC2YwniBUoEPLCNmBQ6m4owIowAEKBANaKUABGKDw8AAo8KACe6jAA3iQwMGAotooAXDDQlHxgAOakpeEVNXUNzSW16SiUuTVgAK62KeqkAL4kasA5lDGyVCDQ6hA1hXptth1Q9U1GNfEQSanpWTn5lHpGk6Q8yTDn2XlrR4nJaRkvVzcsN6Q3I4YIIljBeK8NDAQG4YAB5FIAK0UwCgeAQ6WGigggk8qw0kkkRR6z0uaxYpMhEDw5GAaEEEKuEGkpQA9Kz4QBpEjTIA)

不过，更好的解决方案是使用 `Array.prototype.flat` 方法：

```ts
const allPlayers = Object.values(rosters).flat() // OK
//    ^? const allPlayers: BasketballPlayer[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMEDcAiBDKKYF4YCIB0BOA3AFCiSwBOKA7gEog0RZyKrp4QAOANgJZQAFAHIAOmGEBKUuWgwAFgFMUAE0WVm2avUYQA2gAYAup14CRAGimk+AWy4hKsAPowAZpRC2YwniBUoEPLCNmBQ6m4owIowAEKBANaKUABGKDw8AAo8KACe6jAA3iQwMGAotooAXDDQlHxgAOakpeEVNXUNzSW16SiUuTVgAK62KeqkAL4kasA5lDGyVCDQ6hA1hXptth1Q9U1GNfEQSanpWTn5lHpGkzLgcufZeWssAPIpAFaKwFB4COlhooIIJPKsNJI8G4ckJpDAAPTwmBvADSJERpVKAD0APxwB6wJ6XNZHRLJNIZZ5XG4kIA)

`flat` 方法可以把多维数组拍平。它的类型大致是 `T[][] => T[]`。这种写法最简洁，也不需要任何类型注解。额外好处是你可以用 `const` 来定义 `allPlayers`，防止以后被修改。

假设你想从 `allPlayers` 出发，做一个按薪水排序的各队最高薪球员列表。

下面是不使用 Lodash 的解决方案，凡是不使用函数式写法的地方，都需要加类型注解：

```ts
const teamToPlayers: { [team: string]: BasketballPlayer[] } = {}
for (const player of allPlayers) {
  const { team } = player
  teamToPlayers[team] = teamToPlayers[team] || []
  teamToPlayers[team].push(player)
}

for (const players of Object.values(teamToPlayers)) {
  players.sort((a, b) => b.salary - a.salary)
}

const bestPaid = Object.values(teamToPlayers).map((players) => players[0])
bestPaid.sort((playerA, playerB) => playerB.salary - playerA.salary)
console.log(bestPaid)
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMEDcAiBDKKYF4YCIB0BOA3AFCiSwBOKA7gEog0RZyKrp4QAOANgJZQAFAHIAOmGEBKUuWgwAFgFMUAE0WVm2avUYQA2gAYAup14CRAGimk+AWy4hKsAPowAZpRC2YwniBUoEPLCNmBQ6m4owIowAEKBANaKUABGKDw8AAo8KACe6jAA3iQwMGAotooAXDDQlHxgAOakpeEVNXUNzSW16SiUuTVgAK62KeqkAL4kasA5lDGyVCDQ6hA1hXptth1Q9U1GNfEQSanpWTn5lHpGkzLgcufZeWssAPIpAFaKwFB4COlhooIIJPKsNJI8G4ckJpDAAPTwmBvADSJERpVKAD0APxwB6wJ6XNZHRLJNIZZ5XG5kAkwbYAFRAVJJRS2yh2tT2XUOcTJZ0pxOutxYhTuJDcjhggiWMF4L0oMBAbhgRIVEEkRR6ssK20mLHlVxa9I5TJZGnZFSMLEZzKF+m21oAPk6YDdjbbzQ6OSYuMMgoJDeppCRphKpTK6UGNEqVR9vr9-oDgYJPfbJJriqVoxBOI4hIIUBYYClNZgAHwlzh9AYwAC0qur81yIbDsvG0EyKD4KneXx+fwBPCBILT6shthQXED9qwlZzhiMIY7UC7PbzTkEM4VAEFi9HYmX50LYk3+rl63KhTuzwMQ7IQDxFHg-I1BCu1yoQ0A)

这里会输出：

```bash
[
  { team: 'GSW', salary: 51915615, name: 'Stephen Curry' },
  { team: 'PHO', salary: 47649433, name: 'Kevin Durant' },
  { team: 'DEN', salary: 47607350, name: 'Nikola Jokić' },
  { team: 'PHI', salary: 47607350, name: 'Joel Embiid' },
  { team: 'LAL', salary: 47607350, name: 'LeBron James' },
  ...
]
```

下面是用 Lodash 实现的等价写法：

```ts
const bestPaid = _(allPlayers)
  .groupBy((player) => player.team)
  .mapValues((players) => _.maxBy(players, (p) => p.salary)!)
  .values()
  .sortBy((p) => -p.salary)
  .value()
console.log(bestPaid.slice(0, 10))
//          ^? const bestPaid: BasketballPlayer[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBMEDcAiBDKKYF4YCIB0BOA3AFCiSwBOKA7gEog0RZyKrp4QAOANgJZQAFAHIAOmGEBKUuWgwAFgFMUAE0WVm2avUYQA2gAYAup14CRAGimk+AWy4hKsAPowAZpRC2YwniBUoEPLCNmBQ6m4owIowAEKBANaKUABGKDw8AAo8KACe6jAA3iQwMGAotooAXDDQlHxgAOakpeEVNXUNzSW16SiUuTVgAK62KeqkAL4kasA5lDGyVCDQ6hA1hXptth1Q9U1GNfEQSanpWTn5lHpGkzLgcufZeWssAPIpAFaKwFB4COlhooIIJPKsNJI8G4ckJpDAAPTwmBvADSJERpVKAD0APxwB6wJ6XNZHRLJNIZZ5XG5kAkwcbQTIoPgqFjOQREl4Qnp4RqeYZcWK5QS8LlYAB8MFFVzw20kPNsKC4ADVAcCRcSNBKYM48IqAB5CjVciAWKXaricPoDSQAQnlpX+apBDpgnEcUCNXG1AFpLRBrblXU6eEDBNJaZAQDxFHg-I1BAyoEyWZx+NFBAYzQBGAySCMYzFF7F4pb04HJ5kqUkncmc6lGEhAA)

这段代码不仅只有一半长度，而且只需要一个非空断言（因为类型检查器不知道传给 `_.maxBy` 的 players 数组非空）。它用了 Lodash 和 Underscore 的“链式调用”概念，让你能更自然地写一连串操作。比如，不用写成：

```js
_.c(_.b(_.a(v)))
```

而是写成：

```js
_(v).a().b().c().value()
```

`_(v)` 是把值“包裹”起来，`.value()` 则是把结果“解包”。

你可以在链中逐步检查每个函数调用的类型，类型始终是正确的。

类型能如此顺畅地在这些内置函数式写法和 Lodash 这类库中转换，绝非巧合。它们避免了可变操作，每次调用都返回新值，因此也能产生新的类型（参见第 19 条）。TypeScript 的发展，很大程度上就是为了准确建模现实中 JavaScript 库的行为。好好利用这些成果，多用它们吧！

## 关键点总结

- 使用内置的函数式写法和像 Lodash 这样的工具库，代替手写循环，这样能让类型更好地传递，代码更易读，也减少显式类型注解的需求。

# 第 82 条：按依赖图逐个模块升级

## 要点

- 通过为第三方模块和外部 API 调用添加 `@types` 来开始迁移。
- 从依赖图子模块开始迁移你自己的模块，逐步向上迁移。第一个模块通常是某种实用工具代码。考虑可视化依赖图来帮助你跟踪进度。
- 抵制在发现奇怪设计时重构代码的冲动。保持一个未来重构的想法列表，但要专注于 TypeScript 的转换。
- 注意转换过程中常见的错误。必要时将 JSDoc 类型转换为 TypeScript 类型注解，以避免在转换过程中丢失类型安全。

## 正文

你已经用上了现代 JavaScript，把项目改成了 ES 模块和类（第 79 条）。TypeScript 也集成到了构建流程里，测试全通过了（第 81 条）。现在来点好玩的：把 JavaScript 代码转成 TypeScript。但从哪儿开始呢？

当你给一个模块加类型时，所有引入它的模块都可能冒出新的类型错误。理想情况是每个模块只改一次就完事。这意味着应该顺着依赖图从下往上改：从子模块（不依赖其他模块的）开始，逐步改到根模块。

首先要迁移的是第三方依赖，因为按定义是你引入它们，而它们不会引入你。通常就是装`@types`类型包。比如用 lodash 工具库的话，就运行： `npm install --save-dev @types/lodash`

这些类型声明会让类型在你代码里转换，并暴露使用库时的问题。注意保持包版本一致（见第 66 条）。如果第三方库自带类型，这步可以跳过，TypeScript 会自动找到。

如果你的代码调外部 API，早期也该加上它们的类型声明。虽然这些调用可能出现在代码任何地方，但这依然符合"从下往上"原则——因为你依赖 API，而 API 不依赖你。很多类型是从 API 调用传过来的，这些通常很难从上下文推断。例如你可能要把：

```ts
async function fetchTable() {
  const response = await fetch('/data')
  if (!response.ok) throw new Error('Failed to fetch!')
  return response.json()
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/IYZwngdgxgBAZgV2gFwJYHsLwKbKgCwBVgAjAG2wAoBKGAbwCgYYpMRkYAnbEABzewwAvDGAB3YKg5xcBSgHIA9ABNgyYPOoBuJjFRwYlAITc+AgHToA1rWT5O6MTAjYnAUU4POCgGKSKyjDI6Dh4+EaaOszcyAicWKb8ECDY5gBWIJg0OgC+DEA)

写成:

```ts
interface TabularData {
  columns: string[]
  rows: number[][]
}
async function fetchTable(): Promise<TabularData> {
  const response = await fetch('/data')
  if (!response.ok) throw new Error('Failed to fetch!')
  return response.json()
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgCpwEYFcA2coAicYcyA3gFDLIID2OWAtiAM4BcyLYUoA5gNoBdANxVkUWgHd2yEEwzQhQ0QF8KcFgE8QCZDCw6wwWiD0QwCABboMOCAAoAlBwAKExsBYQAPDdz4iEgA+cjE6VjBxCBYABxMvZABeZDhJOGBImHMrewByAHoAE2I4XMdRamAYZHsAQihouNYIADpaAGtHZDBLCUlZCH6AUSgJKDyAMXS7Qu7aMwtLWrKKqLAsKFMG2PjWgCsWEydVCiA)

现在所有调用`fetchTable`的地方都会传递类型。如第 42 条所述，如果能找到现成的类型来源（比如规范文档或数据库表结构），最好不要从头手写类型。

迁移自己的模块时，可视化依赖图会很有帮助。图 10-3 展示了一个中型 JS 项目 dygraphs 的依赖图示例，是用优秀的 madge 工具生成的。

这张图的最底部是`utils.js`和`tickers.js`的循环依赖。虽然有很多模块会引入它们俩，但这俩模块只互相引用。这种模式很常见：多数项目在依赖图底部都会有某种工具类模块。

![Figure 10-3. The dependency graph for a medium-sized JavaScript project. Arrows indi‐ cate imports. Darker-shaded boxes indicate that a module is involved in a circular import.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506102226468.png)

如果想彻底消除排序顾虑，可以对依赖图进行拓扑排序。把结果放到表格里，再结合每个文件的行数，就能清晰掌握当前进度和剩余工作量。

迁移代码时，重点放在添加类型而非重构上。如果是老项目，你可能会发现一些奇怪代码并想修复——忍住！现阶段目标是把项目转成 TypeScript，而不是改进设计。做无关重构会拖慢进度、增加代码审查难度、引入 bug 风险。遇到代码异味时先记录下来，列入未来重构清单。现在报 bug，以后再修。如果这期间需要用`any`或`@ts-expect-error`也没关系。

转换到 TypeScript 时会遇到几种常见错误，部分在第 80 条提过，但还有些新情况，比如未声明的类成员和类型会变化的值。下面我们具体看看这些错误及应对方法。

### 未声明的类成员

JavaScript 的类不需要声明成员，但 TypeScript 必须声明。当你把类的`.js`文件重命名为`.ts`时，每个用到的属性都会报错：

```ts
class Greeting {
  constructor(name) {
    this.greeting = 'Hello'
    //   ~~~~~~~~ Property 'greeting' does not exist on type 'Greeting'
    this.name = name
    //   ~~~~ Property 'name' does not exist on type 'Greeting'
  }
  greet() {
    return `${this.greeting} ${this.name}`
    //             ~~~~~~~~         ~~~~ Property ... does not exist
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=false&strictNullChecks=false#code/MYGwhgzhAEDiBOBTRAXAlgOwObQN4ChppgB7DCFeAV2BRPgAoMwBbRASj0KOhQAs0EAHRYkqTDgC80AOQAJRCBAkZAbm5EA9Jp4A-fQf3QACvBIAHRPBQBPWaOTpsM6ABMSiGBhIpoiAB6CvmS8NpayCI4SMhq8AsLMbNDSiYjqPNDaegYmZpbWdjKpLu6e0N6+AUHQIbbhMpHiztwAvtwOqAycBBlIKFTwGNAABgAkuPyCImJOWC3Q45MJrIgtw+k8WRnb2YZGO0SGuRZWttBCF24eXj5+gRSt+G1AA)

有个实用快速修复功能（见图 10-4）可以解决这个问题。

![Figure 10-4. The quick fix to add declarations for missing members is particularly help‐ ful in converting a class to TypeScript.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506102228576.png)

这会根据代码用法自动补上缺失的成员声明：

```ts
class Greeting {
  greeting: string
  name: any
  constructor(name) {
    this.greeting = 'Hello'
    this.name = name
  }
  greet() {
    return `${this.greeting} ${this.name}`
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=false&strictNullChecks=false#code/MYGwhgzhAEDiBOBTRAXAlgOwObQN4ChposlVMsAuaCFecgbkOgzAFtEqwMBPRo4APYYa8AK7AUA+AAoW7AJR4mRFAAs0EAHQlk6bNAC80AOQAJRCBADjfItDUbNcxIeZtEtgL5MdqaYoI7aCQUUXgMaAADABJcBy1fPSxPaFj4p3dPSK98byA)

TypeScript 能正确推断出`greeting`的类型，但`name`的类型没推断出来。应用快速修复后，你应该检查属性列表并修正那些被推断为`any`的类型。

如果是第一次看到类的完整属性列表，可能会吓一跳。当我转换`dygraph.js`（图 10-3 中的根模块）的主类时，发现它居然有足足 45 个成员变量！迁移到 TypeScript 会暴露出这种原本隐式的糟糕设计。当这些设计明晃晃摆在眼前时，就很难再为它们找借口了——不过再次提醒，现在先忍住别重构。记下这些异常点，以后再来考虑怎么改进。

### 类型会变化的值

TypeScript 会报错这样的代码：

```ts
const state = {}
state.name = 'New York'
//    ~~~~ Property 'name' does not exist on type '{}'
state.capital = 'Albany'
//    ~~~~~~~ Property 'capital' does not exist on type '{}'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=false&strictNullChecks=false#code/MYewdgzgLgBNCGUCmMC8MDeBfA3AKAWQDox4BbFdAcgDkkB3GATRACcBrK-Aem5n5gA-YYJgAFViAAOSVlACeMKqQpUYAExBIIMMCFhIAHgEtoMcDAUyl2KgSiIkRYPCnGHAGzRKAgh4BG8GDyXHi8AkIiIuKSMnKKVC5unmqa2rr6MEamsBZWKFS2eEA)

第 21 条有深入讨论过这个问题，遇到这类错误时可以回顾该条目。如果修复很简单，可以一次性构建完整对象：

```ts
const state = {
  name: 'New York',
  capital: 'Albany',
} // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=false&strictNullChecks=false#code/MYewdgzgLgBNCGUCmMC8MDeAoGMzwFskAuGAcgDkkB3GATRACcBrMgGhxmHgAcBLKPAA2pMgEEhAI3hgAnuywBfANy4A9GpgB5ANJYgA)

如果不行，这时就适合用类型断言：

```ts
interface State {
  name: string
  capital: string
}
const state = {} as State
state.name = 'New York' // OK
state.capital = 'Albany' // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=false&strictNullChecks=false#code/JYOwLgpgTgZghgYwgAgMpjpZBvAUM5EOAWwgC5kBnMKUAcwG59kE4AHYDAGwutpEa4AvrgQB7ENSoYsAXhxDkcSmhkQm1TBAB0RUsnkByAHIQA7sgCaYqAGtDDAgHonyAPIBpXJsjbWHbgNkQwBBLgAjOBAATwdnV09cIA)

类型断言有问题应尽量避免（第 9 条解释了原因），最终应该重构掉它。但迁移阶段用断言能快速推进进度，记得加`TODO`注释或创建 bug 后续清理。

如果你之前用 JSDoc 和`@ts-check`（第 80 条），要注意转 TypeScript 后反而可能失去类型安全。例如 TypeScript 能捕获这段 JS 代码的错误：

```js
// @ts-check
/**
 * @param {number} num
 */
function double(num) {
  return 2 * num
}

double('trouble')
//     ~~~~~~~~~
// Argument of type 'string' is not assignable to parameter of type 'number'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=false&strictNullChecks=false&allowJs=true&noEmit=true#code/PTAEAEBcGcFoGMAWBTeBrAUMAVNjpsIAHAQwCcSBbUAbwDsBXSgI2TIF9RHL9tgMAZgzrxIASwD2dUABMJDZgBtkACm4BKWvlBlkkBmWkAmAlyYBuDOwwY5C5SoDkkMvKXJH6yyFC-fAP0CgoKwwAEEyAHMmZDpIUAkBUEgATyJkUEdoFzE6SMdQMWguCXiSaGgxSLoSd2SJUFIKSj02BKTU9MzuVjJHDCA)

转换为 TypeScript 后，`@ts-check`和 JSDoc 就不再强制生效。这意味着`num`的类型隐式变成`any`，所以不会报错：

```ts
/**
 * @param {number} num
 */
function double(num) {
  return 2 * num
}

double('trouble') // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=false&strictNullChecks=false&allowJs=true&noEmit=true#code/PQKhCgAIUgBAHAhgJ0QW0gbwHYFc0BGApsgL6R5pQjDgBmu2AxgC4CWA9tpACYe4EANkQAUlAJRYokZERa5k3AEzQK+ANzhS4cHwHCRAchbJ+QoofHrIkYMEgB5ANLggA)

幸运的是，可以用快速修复功能将 JSDoc 类型转为 TypeScript 类型（如图 10-5 所示）。

![Figure 10-5. Quick fix to copy JSDoc annotations to TypeScript type annotations.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506102229776.png)

如果这个快速修复功能可用，一定要用！当你把类型注解从 JSDoc 复制到 TypeScript 后，记得删除 JSDoc 中的冗余类型声明（参考第 31 条）：

```ts
function double(num: number) {
  return 2 * num
}

double('trouble')
//     ~~~~~~~~~
// Argument of type 'string' is not assignable to parameter of type 'number'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=false&strictNullChecks=false&allowJs=true&noEmit=true#code/GYVwdgxgLglg9mABAEziARgGwKYAowgC2AXIgYetgE4CUiA3gFCKJXZQhVIBMiAVGSIBuRgF9GjVBhy4A5FCpos2WTREB6dS20A-Pfv2NNiAIJUA5kWxgoiOMERQAngAdsiWQGcFMMOdmIMJ5kcLYAhp6eMOZgYcqOcIguYVRhhOzUdg7Obh7klFSyjEA)

开启`noImplicitAny`后也会捕获这类问题，但不如现在就加上类型。

最后迁移测试代码。它们应该在依赖图顶部（因为生产代码不会导入测试），当发现测试在未经修改的情况下依然通过时，会极大增强信心——TypeScript 迁移是纯重构，不应改变代码或测试的运行时行为。

## 关键点总结

- 通过为第三方模块和外部 API 调用添加 `@types` 来开始迁移。
- 从依赖图子模块开始迁移你自己的模块，逐步向上迁移。第一个模块通常是某种实用工具代码。考虑可视化依赖图来帮助你跟踪进度。
- 抵制在发现奇怪设计时重构代码的冲动。保持一个未来重构的想法列表，但要专注于 TypeScript 的转换。
- 注意转换过程中常见的错误。必要时将 JSDoc 类型转换为 TypeScript 类型注解，以避免在转换过程中丢失类型安全。

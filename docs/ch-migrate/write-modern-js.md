# 第 79 条：编写现代 JavaScript

## 要点

- TypeScript lets you write modern JavaScript whatever your runtime environment. Take advantage of this by using the language features it enables. In addition to improving your codebase, this will help TypeScript understand your code.
- Adopt ES modules (`import`/`export`) and classes to facilitate your migration to TypeScript.
- Use TypeScript to learn about language features like classes, destructuring, and `async`/`await`.
- Check the TC39 GitHub repo and TypeScript release notes to learn about all the latest language features.

## 正文

TypeScript 不仅能检查代码类型安全，还能将其编译回至 2009 年的 ES5 等任何 JavaScript 版本。由于 TypeScript 是 JavaScript 最新版本的超集，这意味着你可以把`tsc`当作“转译器”(transpiler)——它能将新 JavaScript 代码转换为更老旧、兼容性更好的 JavaScript 代码。

换个角度看，当你决定将现有 JavaScript 代码库迁移到 TypeScript 时，采用所有最新 JavaScript 特性有百利而无一害。事实上，这反而大有裨益：因为 TypeScript 本就是为现代 JavaScript 设计的，先升级 JS 代码正是迈向 TypeScript 的重要第一步。

由于 TypeScript 是 JavaScript 的超集，学习编写更现代、地道的 JavaScript 也意味着你在学习编写更好的 TypeScript。

本条将介绍现代 JavaScript（这里定义为 ES2015/ES6 及之后版本）的核心亮点。如需深入细节，可参考其他书籍或网络资源。若遇到不熟悉的概念，建议主动学习——比如在接触`async/await`等新特性时，TypeScript 能提供远超你当前理解的精准指导。

虽然这些特性都值得掌握，但对 TypeScript 迁移最关键的是**ECMAScript 模块**和**ES2015 类**。我们将优先探讨这两点，再简要列举其他亮点。如果你的项目已采用这些特性，恭喜！迁移难度会大幅降低。

### 采用 ECMAScript 模块

在 2015 版 ECMAScript（ES）之前，JavaScript 缺乏官方的模块拆分方案。开发者曾用多种变通方法：多个`<script>`标签、手动合并代码、Makefile 工具，或是 Node.js 的`require`语句和 AMD 的`define`回调。TypeScript 甚至曾拥有自己的模块系统（参见第 72 条）。

如今标准已统一：**ECMAScript 模块**（即`import`/`export`语法）。如果你的代码仍堆在单一文件中，或还在使用代码合并等旧方案，是时候切换到 ES 模块了。这可能需要配置 webpack 或 ts-node 等工具。TypeScript 对 ES 模块的支持最完善，采用它们能显著降低迁移难度——特别是允许逐个迁移模块（详见第 82 条）。

具体操作因环境而异。例如，若你当前使用 CommonJS 的`require`：

```js
// CommonJS
// a.js
const b = require('./b')
console.log(b.name)

// b.js
const name = 'Module B'
module.exports = { name }
```

对应的 ES 模块写法如下：

```ts
// ECMAScript模块
// a.ts
import * as b from './b'
console.log(b.name)

// b.ts
export const name = 'Module B'
```

你可以在 TypeScript 中使用 ES 模块语法，同时让编译输出的 JavaScript 保持原有模块系统（比如 CommonJS）。只需在`tsconfig.json`中将`module`选项设为`"commonjs"`，TypeScript 就会自动把上面的 ES 模块代码转译成类似这样的 CommonJS 代码。

### 改用类替代原型

JavaScript 原本采用灵活的原型继承模型，但大多数开发者更倾向使用更结构化的类模型。这一偏好最终被语言官方采纳——ES2015 正式引入了`class`关键字。

如果你的代码目前直接操作原型链，建议改用类语法。例如，将这样的原型写法：

```js
function Person(first, last) {
  this.first = first
  this.last = last
}

Person.prototype.getName = function () {
  return this.first + ' ' + this.last
}

const marie = new Person('Marie', 'Curie')
console.log(marie.getName())
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABQKYCcDOCAUwZZQA0iANgIaZQCUiA3gFCKJQAWMmAdPoYgLyIeVANxMW7LhSr8ylKKIC+DBmiwJOAB3RwoOgJ4bUnAOaooAOXIBbVDNCRYuWo2bozIdEjYduBaQGpEAHJgxEDvSTlFZQgEaStydBhbATBUAHcUDGwwHCCAWUTkoJIggGEPYupRWLBsUiNSOGMcBKSjUwtrVBxqaoYgA)

转换为更清晰的类语法：

```js
class Person {
  constructor(first, last) {
    this.first = first
    this.last = last
  }

  getName() {
    return this.first + ' ' + this.last
  }
}

const marie = new Person('Marie', 'Curie')
console.log(marie.getName())
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEAKCmAnCB7AdtA3gKGtY6EALogK7BEqIAUAZgJbJEA004xAlFrntEQBb0IAOgZNoAXmhjiAbh54BQ4eyKS2kIvLwBfbDwDm8IgDkwAW3jUuOXtETHSiDEpEy1AamgByH9C+uKpra0Hp62ARoxNDmYIj08Opo8ADucEioaNTeALJxCd6s3gDCTgUc8pGoIPAqKAbUsfG1RqYWVhwV2EA)

TypeScript 处理原型版的`Person`会很吃力，但对基于类的版本只需极少量类型标注就能完美理解。如果你不熟悉类语法，TypeScript 会实时指导你正确使用。

对于使用旧式类写法的代码，TypeScript 语言服务提供了"转换为 ES2015 类"的快速修复功能（见图 10-1），能极大加速转换过程。

### 其他现代 JavaScript 特性

虽然采用 ES 模块和类对 TypeScript 迁移帮助最大，但 JavaScript 每年都在更新，掌握这些特性能让代码更简洁地道（自然也就更符合 TypeScript 风格）。以下列出关键特性，不熟悉的建议主动学习：

#### 基础优化

- **变量声明**：用`let`/`const`替代`var`。`var`的作用域规则反直觉（详见《Effective JavaScript》），直接弃用更省心
- **循环**：用`for-of`或`map`等数组方法替代 C 风格`for(;;)`。传统循环易出错且不兼容迭代器（参见第 17 条），对象遍历技巧见第 60 条

#### 异步与函数

- **异步处理**：用`async/await`替代回调或裸`Promise`（详见第 27 条）
- **箭头函数**：比`function`更简洁且自动绑定`this`（第 69 条详解`this`绑定规则）
- **默认参数**：直接在声明处写`param=123`，TypeScript 还能据此推断参数类型

#### 数据结构与操作

- **对象简写**：用`{x}`替代`{x: x}`，变量命名更一致
- **解构赋值**：用`[x,y] = pair`提取数组/对象值，与 TypeScript 元组类型绝配
- **集合类型**：用`Map`/`Set`替代普通对象实现关联数组，避免`constructor`等原型属性冲突

#### 空值处理

- **可选链**：用`x?.y`替代`x && x.y`，安全访问可能为`null`的属性或方法（如`fn?.()`）
- **空值合并**：用`??`替代`||`。`x || 10`在`x=0`时会误判，而`x ?? 10`能准确识别`null/undefined`

#### 其他

- **严格模式**：无需手动写`"use strict"`。TypeScript 生成的模块代码会自动添加，且类型检查比严格模式更严格

### 持续跟进新特性

TC39（JavaScript 标准委员会）每年都会新增特性。TypeScript 团队承诺支持所有进入 Stage 3 阶段的提案，因此你甚至无需等待正式发布。当前值得关注的提案：

- **管道操作符**（Pipeline）
- **记录与元组**（Records & Tuples）

## 关键点总结

1. **环境无关的现代 JS**：TypeScript 让你无视运行时环境限制，尽享新特性红利，同时提升代码质量与类型推断
2. **迁移两大核心**：优先采用**ES 模块**和**类**语法
3. **用 TS 学 JS**：通过 TypeScript 的类型提示学习类、解构、`async/await`等特性
4. **追踪动态**：关注[TC39 GitHub](https://github.com/tc39/proposals)和 TypeScript 更新日志

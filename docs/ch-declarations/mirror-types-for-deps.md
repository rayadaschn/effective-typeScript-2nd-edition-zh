# Item 70: Mirror Types to Sever Dependencies

## 要点

- Avoid transitive type dependencies in published npm modules.
- Use structural typing to sever dependencies that are nonessential.
- Don't force JavaScript users to depend on `@types`. Don't force web developers to depend on Node.js.
- 避免在发布的 npm 模块中出现传递类型依赖。
- 使用结构化类型来切断非必要的依赖。
- 不要强迫 JavaScript 用户依赖 `@types`，也不要强迫 web 开发者依赖 Node.js。

## 正文

假设你编写了一个用于解析 CSV 文件的库。它的 API 很简单：你传入 CSV 文件的内容，然后得到一个将列名映射到值的对象列表。

为了方便你的 Node.js 用户，你允许内容既可以是字符串，也可以是 Node.js Buffer：

```ts
// parse-csv.ts
import { Buffer } from 'node:buffer'

function parseCSV(contents: string | Buffer): { [column: string]: string }[] {
  if (typeof contents === 'object') {
    // It's a buffer
    return parseCSV(contents.toString('utf8'))
  }
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAcEMCcGcFMC0BjWA3AdAF1gKAJYC24A9tFqAN4BCArgGb3zQC+o90JhoA5AHYkAJvABcAIwZNoPANy5c9Wn2RZ8JPhBgIAwgGUAagApk6rPD44RoWFmj4+Ac1AAfUHUbMAlFcoBtEwA2tIR8VjZ2jgC6Ybb2Diy+kaBUuMn49KCGWACe4PAkGSYW5jigALwVvCRiAFbwKjyeKcnJIKAAklg8sKCQoBIe0Kkt0PBYtNAaUHDwekZFZhaw2CS6sY6GPLRY9AAcjZ5yySzDbdoA8gCyAAoASgCiurrDo+OToIlHoG33AHIAIrgTrggA)

Buffer 的类型定义来自 Node.js 类型声明，你必须安装它：

```bash
npm install --save-dev @types/node
```

这里我们遵循了第 65 条的建议，将 `@types` 作为开发依赖而不是生产依赖。

当你发布你的 CSV 解析库时，你使用 `--declaration` 生成类型声明并将其打包。生成的 `.d.ts` 文件如下所示：

```ts
// parse-csv.d.ts
import { Buffer } from 'node:buffer'
export declare function parseCSV(contents: string | Buffer): {
  [column: string]: string
}[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAcEMCcGcFMC0BjWA3AdAEwwF1gFACWAtuAPbS6gDeoAQgK4Bmz80oAvqM9OSaADkAO3JZ4ALgBGLNtEEBuAvAAeFKqHHIANjHg9Gw5LiLlhEGAgDCAZQBqACmRnc8YfgmhYuaEWEBzUAAfBll2AEpPGgJQWNAAbWdtRhJhT29fAIBddJ8-fyVOeKylIA)

如果你采用这种方法，你的库的 JavaScript 用户会很高兴，但 TypeScript web 开发者不会。你会收到他们的投诉，说他们从你的库中得到了错误：

```
Cannot find module 'node:buffer' or its corresponding type declarations.
```

因为我们将 `@types/node` 作为 devDependency，所以它不会随我们的包一起安装，即使我们的类型（作为我们包的一部分）依赖于它。

那么我们应该将 `@types/node` 作为生产依赖吗？这会让错误消失，但现在你可能会收到另一组投诉：

- JavaScript 开发者会想知道这些他们依赖的 `@types` 模块是什么。
- TypeScript web 开发者会想知道为什么他们要依赖 Node.js。
- 使用不同版本 Node.js 的 TypeScript 开发者会想知道为什么他们有重复的类型定义。

这些投诉是合理的。Buffer 行为不是必需的，只对已经在使用 Node.js 的用户相关。而 `@types/node` 中的声明只对同时使用 TypeScript 的 Node.js 用户相关。`@types/node` 包不小（近 10 万行代码），我们的库只使用了其中很小的一部分。

TypeScript 的结构化类型（第 4 条）可以帮助你摆脱困境。与其使用来自 `@types/node` 的 Buffer 声明，你可以只写你需要的方法和属性。在这种情况下，只是一个可以接受编码的 toString 方法：

---

```ts
export interface CsvBuffer {
  toString(encoding?: string): string
}
export function parseCSV(
  contents: string | CsvBuffer
): { [column: string]: string }[] {
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/KYDwDg9gTgLgBASwHY2FAZgQwMbDgYQGcA3AIQFd1004BvAKDjhggGUYpkBzACmCWwQAJtwD8ALjiEO3AJSTpnJFwDc9AL71QkWHHTkBMBBCRwwmKIWD5WANR6M4glPxiEFM5XAA+BEhSo0enk6AG1BABtyAFskDyUuAF147nVQxKYGJgB6bIIAeQBZAAUAJQBRVlZHKGAYcihTdLUcvPKAOQARDXp6c0trOx4kYAB3OADqKB4AIkiYpABGABp52IAmAB0kYkwIld2I9ZnluBnyGHQAWgAOGdlZFVa4fIBpeiA)

这个接口比完整的接口短得多，但它确实捕获了我们对 Buffer 的（简单）需求。在 Node.js 项目中，用真实的 Buffer 调用 parseCSV 仍然可以，因为类型是兼容的：

```ts
parseCSV(new Buffer('column1,column2\nval1,val2', 'utf-8')) // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/KYDwDg9gTgLgBASwHY2FAZgQwMbDgYQGcA3AIQFd1004BvAKDjhggGUYpkBzACmCWwQAJtwD8ALjiEO3AJSTpnJFwDc9AL71QkWHHTkBMBBCRwwmKIWD5WANR6M4glPxiEFM5XAA+BEhSo0enk6AG1BABtyAFskDyUuAF147nVQxKYGJgB6bIIAeQBZAAUAJQBRVlZHKGAYcihTdLUcvPKAOQARDXp6c0trOx4kYAB3OADqKB4AIkiYpABGABp52IAmAB0kYkwIld2I9ZnluBnyGHQAWgAOGdlZFVa4fIBpeiA)

再次查看 CsvBuffer 接口，它没有任何特定于 CSV 文件的内容。给它一个更"结构化"的名称可以强化这一点：

---

```ts
/** Anything convertible to a string with an encoding, e.g. a Node buffer. */
export interface StringEncodable {
  toString(encoding?: string): string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PQKhAIEEDsE8BcAWBLaBzcBjA9tAbgKYBO8yARgDYHjzbgCG4AzvEahgO7JIPTgHQcAE3YAafgDo0EhuABy2IdTIBXAGZriMkMABQBAB4AHbCXCp4xNfUzUAyq3YBRQYvqVqAb13ga2B2zoABQCwuwA-ABczI7oAJTRLIFoANy6AL66QA)

---

```ts
import { Buffer } from 'node:buffer'
import { parseCSV } from './parse-csv'

test('parse CSV in a buffer', () => {
  expect(parseCSV(new Buffer('column1,column2\nval1,val2', 'utf-8'))).toEqual([
    { column1: 'val1', column2: 'val2' },
  ])
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYWwDg9gTgLgBAbwEIFcBmaCmUC+c1QQhwDkAdhACaYBcARullCQNwBQoksiYAhlAGdMAYQDKANTwEipAHQB6PoMwBaAMYCAbqzZsYmATAAUJJULhjxcYGTi84DDNhIAaOEYCUcALwA+RGxwcJgAHmCYasaBQXBmIhJGZJgA7nCoTlBGAERqEAA2KCBkAIwuuQVFAEwAOmSavHml9XmVWW5ZKDBoKgAcWR4e0R6yMBAAogCOKA1G0UEA2gjlhSU0pM3FrnDLVWskzZUkOAC6Q+w4HuxAA)

这个测试验证了你的代码的运行时行为和 Node Buffer 对 StringEncodable 的可赋值性。测试导入了 `node:buffer`，但这没关系，因为 `@types/node` 可以是 devDependency 而不影响你的库的用户。

如果你的代码开始使用 Buffer 接口的更多方法，那么你还需要将它们添加到你的接口版本中。这可能感觉重复，但正如 Go 语言社区所说，"一点复制比一点依赖更好"。如果你依赖另一个库类型的大部分，你可以选择通过供应商化依赖来正式化这种复制。

无论如何，通过切断 `@types` 依赖，你为 JavaScript 和各种 TypeScript 开发者提供了良好的体验。如果 `@types` 依赖有自己的依赖，那么你可能会切断整个依赖树，这对编译器性能有巨大的积极影响（第 78 条）。

这种技术也有助于切断单元测试和生产系统之间的依赖。参见第 4 条中的 getAuthors 示例。

## 要点回顾

- 避免在发布的 npm 模块中出现传递类型依赖。
- 使用结构化类型来切断非必要的依赖。
- 不要强迫 JavaScript 用户依赖 `@types`，也不要强迫 web 开发者依赖 Node.js。

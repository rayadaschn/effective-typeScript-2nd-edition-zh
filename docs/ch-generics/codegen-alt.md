# Item 58: Consider Codegen as an Alternative to Complex Types

## 要点

- While type-level TypeScript is an impressively powerful tool, it's not always the best tool for the job.
- For complex type manipulations, consider generating code and types as an alternative to writing type-level code. Your code generation tool can be written in ordinary TypeScript or any other language.
- Run codegen and `git diff` on your continuous integration system to make sure generated code stays in sync.
- 虽然 TypeScript 的类型层次非常强大，但并不总是最适合的工具。
- 对于复杂的类型操作，考虑生成代码和类型作为写类型层次代码的替代方案。你的代码生成工具可以用普通的 TypeScript 或其他语言编写。
- 在持续集成系统上运行代码生成和 `git diff`，以确保生成的代码与源代码保持同步。

## 正文

警惕"图灵泥潭"，在那里一切皆有可能，但没有什么是容易的。
——Alan Perlis

本章探讨了在 TypeScript 中进行类型层级编程。这意味着实现作用于类型而非值的逻辑和函数（参见第 50 条）。就像常规程序一样，我们可以为类型级程序编写测试（第 55 条）并考虑它们的性能（第 57 条）。尤其是结合模板字面量类型的工具（第 54 条），TypeScript 的类型级程序可以实现一些非常令人印象深刻的功能。

TypeScript 的类型系统是图灵完备的，因此理论上你可以用它表示任何计算。但正如本条开头的引言所警示的那样，仅仅因为某事是可能的，并不意味着它是容易的，或者是明智的。

假设你的 TypeScript 程序需要与数据库交互，并包含如下 SQL 查询：

```ts
async function getBooks(db: Database) {
  const result = await db.query(
    `SELECT title, author, year, publisher FROM books`
  )
  return result.rows
}
```

通过一些巧妙的技巧，你也许可以利用模板字面量类型和条件类型，在 TypeScript 的类型系统中解析该查询。结合一个表示数据库模式的类型，你甚至可能能够从 SQL 查询本身推断出结果类型。这确实是一个令人印象深刻的成就，并且你会因此获得更精确的类型。

但如果你的程序还包含如下查询呢？

```ts
async function getLatestBookByAuthor(db: Database, publisher: string) {
  const result = await db.query(
    `SELECT author, MAX(year) FROM books GROUP BY author WHERE publisher=$1`,
    [publisher]
  )
  return result.rows
}
```

为这个查询获得正确的类型就要困难得多。你的 SQL 查询解析器需要理解 GROUP BY 子句、MAX 表达式，并且知道 $1 占位符意味着你需要传递一个包含单个字符串的数组作为第二个参数。即使你能够为第一个查询构建一个解析器，这个查询很可能会让你的代码陷入"图灵泥潭"，一切皆有可能，但没有什么是容易的。你还可能发现，遵循第 40 条"宁可类型不精确，也不要类型不准确"的建议变得越来越困难。随着程序变得更复杂，出错的可能性也会增加。

不过，有一种更简单的替代方案：代码生成（codegen）。代码生成是真正意义上的元编程：编写操作代码并生成其他代码的程序。代码生成的美妙之处在于，你可以用任何你喜欢的语言来编写类型操作逻辑。是的，TypeScript 的类型系统很强大，但它可能并不是你完成任务的首选工具。通过代码生成，你可以用普通的 TypeScript 编写类型操作代码，也可以用 Python 或 Rust，甚至 shell 脚本也可以胜任。

对于 SQL 查询，一个选择是使用 PgTyped 库。它会在你的 TypeScript 代码中查找带有特定标签的 SQL 查询，针对实际数据库进行检查，并生成包含输入和输出类型的类型声明文件。下面是如何在 TypeScript 中结合 PgTyped 编写查询的示例：

```ts
// books-queries.ts
import { sql } from '@pgtyped/runtime'
const selectLatest = sql`
    SELECT author, MAX(year)
    FROM books
    GROUP BY author
    WHERE publisher=$publisher
`

async function getLatestBookByAuthor(db: Database, publisher: string) {
  const result = await selectLatest.run({ publisher }, db)
  //    ^? const result: any[]
  return result
}
```

然后你可以运行 pgtyped 命令进行代码生成：

```
$ npx pgtyped -c pgtyped.config.json
```

（pgtyped.config.json 是一个告诉 PgTyped 如何连接数据库的配置文件）

这会生成一个包含类型定义的新文件：

```ts
// books-queries.types.ts
/** Types generated for queries found in "books-queries.ts" */

/** 'selectLatest' parameters type */
export interface selectLatestParams {
  publisher: string
}

/** 'selectLatest' return type */
export interface selectLatestResult {
  author: string
  year: number
}

/** 'selectLatest' query type */
export interface selectLatestQuery {
  params: selectLatestParams
  result: selectLatestResult
}
```

并对 books-queries.ts 做出一些更改：

```ts
// books-queries.ts
import { sql } from '@pgtyped/runtime'
import { selectLatestQuery } from './books-queries.types'
export const selectLatestBookByAuthor = sql<selectLatestQuery>`
    SELECT author, MAX(year)
    FROM books
    GROUP BY author
    WHERE publisher=$publisher
`

async function getLatestBookByAuthor(db: Database, publisher: string) {
  const result = await selectLatestBookByAuthor.run({ publisher }, db)
  //    ^? const result: selectLatestResult[]
  return result
}
```

现在，我们的查询已经有了正确的类型！PgTyped 当然不是一个简单的程序，但它是用 TypeScript 编写的，使用了标准的数据库和测试库，开发起来肯定比用 TypeScript 类型系统实现同等功能的工具要轻松得多。

除了让你可以在更常规的编程系统中工作之外，代码生成方法还让你可以完全控制类型的显示方式。第 56 条中提到的技巧，在你生成的类型中就不再需要了。你可以让类型看起来完全符合你的喜好。不喜欢 snake_case 的类型名？只需用 sed 或你喜欢的文本处理工具处理一下即可。

生成的类型对 TypeScript 编译器和语言服务的负担也很可能远小于你手写的 SQL 解析器。

代码生成唯一值得注意的成本是，它增加了一个新的构建步骤，必须定期运行以确保生成的代码保持同步。对于 SQL 场景，这意味着每当查询或数据库模式发生变化时，都需要重新运行 pgtyped 命令。通常的做法是在持续集成（CI）系统上执行代码生成，并运行 `git diff` 以确保没有变化。你也可以将其作为 `pre-push` 检查的一部分。

软件工程是一场与复杂性的持久战。TypeScript 这样的主流编程语言及其生态系统，正是为了让你有能力应对这场战斗而构建的。类型层级 TypeScript 虽然是一个令人印象深刻的工具，但并不是这场战斗中最好的武器。如果你在 TypeScript 中写了一些炫酷的类型层级代码，却感觉像是在泥潭中挣扎，不妨考虑一下是否可以通过生成类型，将代码写在更常规的语言中。

第 42 条和第 74 条还探讨了代码生成在提升类型安全性和减少维护负担方面的其他用法。

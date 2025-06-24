# Item 74: 了解如何在运行时重建类型

## 要点

- TypeScript 类型在代码运行前会被擦除。没有额外工具的情况下，你无法在运行时访问它们。
- 了解运行时类型的选项：使用独立的运行时类型系统（如 Zod）、从值生成 TypeScript 类型（`json-schema-to-typescript`）、从 TypeScript 类型生成值（`typescript-json-schema`）。
- 如果你的类型有其他规范（例如模式），使用那个作为真相来源。
- 如果需要引用外部 TypeScript 类型，使用 `typescript-json-schema` 或等效工具。
- 否则，权衡是否更喜欢额外的构建步骤或指定类型的其他系统。

## 正文

在学习 TypeScript 的过程中，大多数开发者都会有一个顿悟时刻，当他们意识到 TypeScript 类型并不是"真实的"：它们在运行时被擦除了（Item 3）。这可能会伴随着一种恐惧感：如果类型不是真实的，你如何信任它们？

类型与运行时行为的独立性是 TypeScript 和 JavaScript 之间关系的关键部分（Item 1）。大多数时候这个系统工作得很好。但不可否认的是，有时在运行时访问 TypeScript 类型会非常方便。本条目探讨了这种情况可能出现的原因以及你的选择。

想象你正在实现一个 Web 服务器，并为在博客文章上创建评论定义了一个 API 端点（我们在 Item 42 中见过这个 API）。你为请求体定义了一个 TypeScript 类型：

```ts
interface CreateComment {
  postId: string
  title: string
  body: string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMJQnSqD2BbPCcZAbwChlkAHHAZzAEkATALmXqlAHMBuC5MMDAAbCGw7c+lAEY4mAT3FhOIXmQC+ZIA)

你的请求处理器应该验证请求。其中一些验证将在应用层面进行（postId 是否引用了存在且用户可以评论的文章？），但有些将在类型层面进行（请求是否具有我们期望的所有属性，它们是否是正确的类型，是否有额外的属性？）。

这可能是这样的：

```ts
app.post('/comment', (request, response) => {
  const { body } = request
  if (
    !body ||
    typeof body !== 'object' ||
    Object.keys(body).length !== 3 ||
    !('postId' in body) ||
    typeof body.postId !== 'string' ||
    !('title' in body) ||
    typeof body.title !== 'string' ||
    !('body' in body) ||
    typeof body.body !== 'string'
  ) {
    return response.status(400).send('Invalid request')
  }
  const comment = body as CreateComment
  // ... application validation and logic ...
  return response.status(200).send('ok')
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMJQnSqD2BbPCcZAbwChlkAHHAZzAEkATALmXqlAHMBuC5MMDAAbCGw7c+lAEY4mAT3FhOIXmQC+ZYHhpQwyCAA8qGWrWQwo+ZAHIjJiGZt8EOEPWRwqVZAF4Dxqa0ABQAlHxeVAB0NPTBNgD0rgREYDYANMjBGACOAK6OYJmmNO4QoX4AfKT8ru76JLIK6n7IuQX0UsjAMFn8lACETfLIAD6j-QLyVBA4vcPIA77+NjjSAFYQCGljE5SUAPIbW2BRANYQ8iHDoVGiqmAAFovLyADMu5MD8bGMTDbdEDIG67KYzObAuTyGJ0P4vFYSVQA8ZfeKCEQQAGgSEKCrjMGzeZQqLo0Tw2yIrjIvb7b42YZYoEg-FgaaEnHQhZLBHKbg2fgVcj7NoQMB5KBAkpuWgQKL0LB5EIAFgADCrbjKQEx4gwQAA3ODCYBMEX5Qo2cL8TSUOoeZKEYj+BZwczoTDYfAOsBdBIJZBRAOebxGhBYYBuZAGo1MMMRuBa5DCHBcYAIf0B-gYMUSkW0UoyuVgBUhABMao1RG1qzOFr46ktQA)

这已经是很多验证代码了，即使只有三个属性。更糟的是，没有任何东西确保检查是准确的并与我们的类型同步。没有任何东西检查我们是否正确拼写了属性。如果我们添加一个新属性，我们也需要记住添加一个检查。

这是最糟糕的代码重复。我们有两个需要保持同步的东西（类型和验证逻辑）。如果有一个单一的真相来源会更好。接口似乎是自然的真相来源，但它在运行时被擦除，所以不清楚如何以这种方式使用它。

让我们看看这个难题的几个可能解决方案。

### 从另一个来源生成类型

如果你的 API 以某种其他形式指定，也许使用 GraphQL 或 OpenAPI 模式，那么你可以使用那个作为真相来源，并从中生成你的 TypeScript 类型。

这通常涉及运行外部工具来生成类型，可能还有验证代码。例如，OpenAPI 规范使用 JSON Schema，所以你可以使用像 `json-schema-to-typescript` 这样的工具来生成 TypeScript 类型，并使用像 Ajv 这样的 JSON Schema 验证器来验证请求。

这种方法的缺点是需要添加一些复杂性和构建步骤，每当你的 API 模式更改时都必须运行。但如果你已经在使用 OpenAPI 或其他系统指定你的 API，那么这具有不引入任何新真相来源的巨大优势，这是你应该首选的方法。

如果这适合你的情况，那么 Item 42 包含了从模式生成 TypeScript 类型的示例。

### 使用运行时库定义类型

TypeScript 的设计使得从静态类型派生运行时值是不可能的。但走相反的方向（从运行时值到静态类型）使用类型级别的 `typeof` 操作符是直接的：

```ts
const val = { postId: '123', title: 'First', body: 'That is all' }
type ValType = typeof val
//   ^? type ValType = { postId: string; title: string; body: string; }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAbgQwDYwLwwN4wA4mgSQBMAuGAcgEYAmAZjIBoYoBLKJAU1LIDFmAnaAxgAjEIQCeXACoALBLGYQYyJGQC+AbgBQUcdnYwAasil6D6XfpAAzeMm0B6BzBcA9APxMzRk9-RZcAhIYaD5mMABzDSZWDlJQ8KiRMUkQqDDI6LUtIA)

所以一个选择是使用运行时构造定义你的类型，并从中派生静态类型。这通常使用库来完成。有很多这样的库，但目前最受欢迎的是 Zod（React 的 PropTypes 是另一个例子）。

使用 Zod 的请求验证逻辑会是这样的：

```ts
import { z } from 'zod'

// runtime value for type validation
const createCommentSchema = z.object({
  postId: z.string(),
  title: z.string(),
  body: z.string(),
})

// static type
type CreateComment = z.infer<typeof createCommentSchema>
//   ^? type CreateComment = { postId: string; title: string; body: string; }

app.post('/comment', (request, response) => {
  const { body } = request
  try {
    const comment = createCommentSchema.parse(body)
    //    ^? const comment: { postId: string; title: string; body: string; }
    // ... application validation and logic ...
    return response.status(200).send('ok')
  } catch (e) {
    return response.status(400).send('Invalid request')
  }
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYWwDg9gTgLgBAUwB5iggzuuAzKERwDkyqG6hA3AFADGEAduvAIZhhwC8iKamAFAEpqoSLDgBvOAC84AXxx4ChKRAAmlKlQD0WuFACu9GKARwAbswA2+09mhwYATzCmLl4KubGGtBkzg0aF4IAML4IAhGAMo0ABYIIMyc0gB0EABGAFYINDB84lRwcJBMAJKqAFypTFDA9ADmggA0hQ7AMJYIVVIpNXWNAi1F6WqO3b0wtQ3NVLJCmjpwTF7ANA7OCFROLnAhQTCh4ZHwXD112AhQADzbCBDYAfuHIBHRcQnMAHzUi0UAegB+dY7PYIYJhF7HZKSEowcpVPoNChtDpdJaTfrIkaqMboqb1ZGyTSsMApWF8QhaOiQoyEJpwPhoACONiY9N4kEYCAEnE+EladEY8HE2Mc8i4zNZMGoRUmjn5RSKgv81NeJ0eYIOELVMXiiTJzCg6AQfFF80VcF+-yByvgquOVRhEDKlTxmJRnQRGKRcFFXvxhNaRUWKVDcBJ7hoKwY5isHmj9HD9FUcEsEHqqzgoZSQb0CBg+igiY5fgQEy8+nQfAATAAGWsCXqRVQUiAAa0I5rkAS8cQZ3IVirQBaLefQnON5YLVYALPXG8bkxTSvQ3B48yyMDBOzK5LN5kA)

Zod 完全消除了重复：值 `createCommentSchema` 现在是真相来源，静态类型 `CreateComment` 和模式验证（`createCommentSchema.parse`）都从中派生。

Zod 和其他运行时类型库在解决这个问题方面非常有效。那么使用它们有什么缺点呢？

- 你现在有两种定义类型的方式：Zod 的语法（`z.object`）和 TypeScript 的（`interface`）。虽然这些系统有很多相似之处，但它们并不完全相同。你已经在使用 TypeScript，所以假设你的团队已经承诺学习如何使用它定义类型。现在每个人都需要学习使用 Zod。
- 运行时类型系统往往具有传染性：如果 `createCommentSchema` 需要引用另一个类型，那么该类型也需要重新设计为运行时类型。这可能使得与其他类型来源的互操作变得困难，例如，如果你想引用外部库的类型或从数据库生成一些类型（Item 58）。

拥有独立的运行时类型验证系统还有一些其他优势：

- 像 Zod 这样的库可以表达许多难以用 TypeScript 类型捕获的约束，例如"有效的电子邮件地址"或"整数"。如果你不使用像 Zod 这样的工具，你将不得不自己编写这种验证。
- 没有额外的构建步骤。一切都是通过 TypeScript 完成的。如果你期望你的模式经常更改，那么这将消除一个失败模式并收紧你的迭代周期。

### 从你的类型生成运行时值

如果你愿意引入新工具和构建步骤，那么还有另一种可能性：你可以反转前一节的方法，从你的 TypeScript 类型生成运行时值。JSON Schema 是一个流行的目标。

为了使这个工作，我们将把我们的 API 类型放在 `api.ts` 文件中：

```ts
// api.ts
export interface CreateComment {
  postId: string
  title: string
  body: string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEEMAcEsDoBcDOAoApgD0gewE71NAHbyo4Bm4AxqqAMI6rgm1YC2rqxoA3sqKNkTwAkgBMAXKCE4iAcwDcfUPGjwANqknS5i-gCMsogJ5b4MwguQBfZEA)

然后我们可以运行 `typescript-json-schema` 来为这个类型生成 JSON Schema：

```bash
$ npx typescript-json-schema api.ts '*' > api.schema.json
```

这个文件看起来像这样：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "CreateComment": {
      "type": "object",
      "properties": {
        "body": { "type": "string" },
        "postId": { "type": "string" },
        "title": { "type": "string" }
      }
    }
  }
}
```

现在我们可以在运行时加载 `api.schema.json`。如果你启用 TypeScript 的 `resolveJsonModule` 选项，这可以通过普通的 import 完成。你可以使用任何 JSON Schema 验证库执行验证。这里我们使用 Ajv 库：

```ts
import Ajv from 'ajv'

import apiSchema from './api.schema.json'
import { CreateComment } from './api'

const ajv = new Ajv()

app.post('/comment', (request, response) => {
  const { body } = request
  if (!ajv.validate(apiSchema.definitions.CreateComment, body)) {
    return response.status(400).send('Invalid request')
  }
  const comment = body as CreateComment
  // ... application validation and logic ...
  return response.status(200).send('ok')
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&resolveJsonModule=true&esModuleInterop=true#code/JYWwDg9gTgLgBAUwB5iggzuuAzKERwDkyqG6hA3AFADGEAduvAIZhhwC8iKamAFAEpqoSLDgBBAFYA3HHgKFmMylSojoLMMADKNABYIQzOfiIA6APStgZ9PsPMzk9AxXqxAbwDCaZjARe+CAI9DAAviYKltYqtAxMcEqyXPQIAO4SMoLUVKxgZpBMfIQWdCDBoYQANHB8aACOAK4YMDW8kIwIApwAfHAeVHBwdIzwHgBGEAAmAJ4RXA3NTNRDwNi1AIRJZtLMADbAU34IfNa6BkZmUwjYwPTAMMDxZj4Ix4HlIa1wk7MC3QMhkM0DBGlB6HB2vEELYYH5Gug+AAWAAMKIEthCU2KAEl6LsDlNIQgmi1CEJBnAwpSRgkyhV4FxfjNElhXu8gl8VnALBY4GYBYk2AcaH4nhCCYcxQxEvQiXsIABzYA0fkCykgsEQqGdWHwxEAJjRGPQWOKEAA1uTqGEKUA)

从你的 TypeScript 类型生成值的巨大优势是你可以继续使用你熟悉和喜爱的所有 TypeScript 工具来定义你的类型。你不需要学习第二种定义类型的方式，因为 JSON Schema 是一个实现细节。你的 API 类型可以引用来自 `@types` 或其他来源的类型，因为它们只是 TypeScript 类型。

缺点是引入了新工具和新的构建步骤。每当你更改 `api.ts` 时，你需要重新生成 `api.schema.json`。在实践中，你会想要使用你的持续集成系统来强制这些保持同步。

虽然你通常不需要在运行时访问 TypeScript 类型，但偶尔会有像输入验证这样的情况，在那里它非常有用。我们已经看到了解决这个问题的三种方法。那么你应该选择哪一个呢？

不幸的是，没有完美的答案。每个选项都是一个权衡。如果你的类型已经以某种其他形式表达，比如 OpenAPI 模式，那么使用那个作为你的类型和验证逻辑的真相来源。这将产生一些工具和过程开销，但拥有单一真相来源是值得的。

如果不是，那么决定就更棘手了。你宁愿引入构建步骤还是定义类型的第二种方式？如果你需要引用只使用 TypeScript 类型定义的类型（也许它们来自库或是生成的），那么从你的 TypeScript 类型生成 JSON Schema 是最好的选择。否则，你需要选择你的毒药！

## 要点回顾

- TypeScript 类型在代码运行前会被擦除。没有额外工具的情况下，你无法在运行时访问它们。
- 了解运行时类型的选项：使用独立的运行时类型系统（如 Zod）、从值生成 TypeScript 类型（`json-schema-to-typescript`）、从 TypeScript 类型生成值（`typescript-json-schema`）。
- 如果你的类型有其他规范（例如模式），使用那个作为真相来源。
- 如果需要引用外部 TypeScript 类型，使用 `typescript-json-schema` 或等效工具。
- 否则，权衡是否更喜欢额外的构建步骤或指定类型的其他系统。

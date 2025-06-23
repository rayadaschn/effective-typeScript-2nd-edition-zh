# Item 68: Use TSDoc for API Comments

## 要点

- 使用 JSDoc/TSDoc 格式的注释来记录导出的函数、类和类型。这有助于编辑器在最相关时为用户提供信息。
- 使用 `@param`、`@returns` 和 Markdown 来进行格式化。
- 避免在文档中包含类型信息（参见第 31 条）。
- 使用 `@deprecated` 标记已废弃的 API。

## 正文

下面是一个用于生成问候语的 TypeScript 函数：

```ts
// Generate a greeting. Result is formatted for display.
function greet(name: string, title: string) {
  return `Hello ${title} ${name}`
}
```

作者贴心地为这个函数写了注释，描述了它的作用。但如果你希望为函数的使用者编写文档，最好使用 JSDoc 风格的注释：

```ts
/** Generate a greeting. Result is formatted for display. */
function greetJSDoc(name: string, title: string) {
  return `Hello ${title} ${name}`
}
```

原因在于，几乎所有编辑器都会在调用函数时显示 JSDoc 风格的注释（见下图 8-1）。

![图 8-1. JSDoc 风格的注释会在编辑器的工具提示中显示。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506221501248.png)

相比之下，内联注释则不会被这样处理（见下图 8-2）。

![图 8-2. 内联注释通常不会在工具提示中显示。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506221502421.png)

TypeScript 语言服务支持这种约定，你应该充分利用它。如果注释描述的是公共 API，就应该使用 JSDoc。在 TypeScript 语境下，这类注释有时也被称为 TSDoc。你可以使用许多常见的标签，比如 @param 和 @returns：

```ts
/**
 * Generate a greeting.
 * @param name Name of the person to greet
 * @param title The person's title
 * @returns A greeting formatted for human consumption.
 */
function greetFullTSDoc(name: string, title: string) {
  return `Hello ${title} ${name}`
}
```

这样，编辑器在你编写函数调用时会显示每个参数的相关文档（如图 8-3 所示）。这里仅显示了 name 参数的文档，而不是 title。

![图 8-3. @param 注解让编辑器在你输入参数时显示对应文档。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506221503806.png)

你也可以在类型定义中使用 TSDoc：

```ts
/** A measurement performed at a time and place. */
interface Measurement {
  /** Where was the measurement made? */
  position: Vector3D
  /** When was the measurement made? In seconds since epoch. */
  time: number
  /** Observed momentum */
  momentum: Vector3D
}
```

当你查看 Measurement 对象的各个字段时，会获得上下文相关的文档（见图 8-4）。

![图 8-4. 字段的 TSDoc 会在鼠标悬停时显示。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506221503310.png)

只要类型是"同态"的（参见第 15 项），字段上的文档就会通过映射类型（如 Partial 和 Pick 等辅助类型）被保留下来。

你可以用 @template 标签为泛型类型的类型参数编写文档。第 50 项会详细介绍其用法。

TSDoc 注释支持 Markdown 格式，因此你可以使用粗体、斜体或项目符号列表等格式（见图 8-5）。

![图 8-5. TSDoc 注释可以包含 Markdown 格式。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506221504601.png)

不过，尽量避免在文档中写"长篇大论"。最好的注释应简明扼要、直击要点。

JSDoc 包含一些用于指定类型信息的约定（如 @param {string} name ...），但你应避免这样做，而应优先使用 TypeScript 类型（参见第 31 项）。

最后，你应使用 @deprecated 标签标记已废弃的符号。这不仅能清楚地表明某个函数已废弃，还能启用 TSDoc 最强大的特性之一：被 @deprecated 标记的符号通常会以删除线形式显示。这样你甚至无需查看符号详情就能知道它已废弃，如图 8-6 所示。

![图 8-6. 被 @deprecated 标记的符号会显示删除线。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506221504495.png)

如果你标记了某个方法为废弃，请务必告知用户新的替代方案。至少应在文档中给出相关参考。

## 要点回顾

- 使用 JSDoc/TSDoc 格式的注释来记录导出的函数、类和类型。这有助于编辑器在最相关时为用户提供信息。
- 使用 `@param`、`@returns` 和 Markdown 来进行格式化。
- 避免在文档中包含类型信息（参见第 31 条）。
- 使用 `@deprecated` 标记已废弃的 API。

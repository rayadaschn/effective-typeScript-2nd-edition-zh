# 第 46 条：对于未知类型的值，使用 `unknown` 替代 `any`

## 要点

- `unknown` 类型是 `any` 的类型安全替代品。当你知道有一个值，但不知道或不关心它的类型时，使用 `unknown`。
- 使用 `unknown` 强制用户进行类型断言或其他形式的类型收窄。
- 避免仅返回类型的参数，因为它们可能会带来虚假的安全感。
- 理解 `{}`、`object` 和 `unknown` 之间的区别。

## 正文

假设你想要编写一个 YAML 解析器（YAML 可以表示与 JSON 相同的值集合，但允许 JSON 语法的超集）。你的 `parseYAML` 方法的返回类型应该是什么？很容易想到使用 `any`（就像 `JSON.parse` 一样）：

```ts
function parseYAML(yaml: string): any {
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwIYCcDOBTAmgQQFkAZACgE9UBbAGwC5FMp0YwBzASgdTHMQG8AUIkQB6UYgDCAeUIAFAEoBRAMorhidNigh0SfojDVsDAESmANIlQgoACzjozpxAF8A3BvGIlAOQAigq6CQA)

但这违背了第 43 条建议避免"传染性" `any` 类型的建议，特别是不要从函数中返回它们。（第 71 条将探讨如何"修复" `JSON.parse` 使其不返回 `any`。）

理想情况下，你希望用户立即将结果分配给另一个类型：

```ts
interface Book {
  name: string
  author: string
}
const book: Book = parseYAML(`
  name: Wuthering Heights
  author: Emily Brontë
`)
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwIYCcDOBTAmgQQFkAZACgE9UBbAGwC5FMp0YwBzASgdTHMQG8AUIkQB6UYgDCAeUIAFAEoBRAMorhidNigh0SfojDVsDAESmANIlQgoACzjozpxAF8A3BvGIlAOQAigq6CrFDY6MCoENiIAEJwcADWAhpGVCaMzKxsniI29o4MTCzsnsEQCEyIAEYJiQzxSYgAvCgYOAQkpAAGqcYMAOq2duHZiAAS2DBsdlCYGvkOTj5UMDR8segIUADXgt0cnkA)

但是，如果没有类型注解，`book` 变量会悄悄地获得 `any` 类型，在它被使用的任何地方都会阻止类型检查：

```ts
const book = parseYAML(`
  name: Jane Eyre
  author: Charlotte Brontë
`)
console.log(book.title) // No error, logs "undefined" at runtime
book('read') // No error, throws "book is not a function" at runtime
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwIYCcDOBTAmgQQFkAZACgE9UBbAGwC5FMp0YwBzASgdTHMQG8AUIkQB6UYgDCAeUIAFAEoBRAMorhidNigh0SfojDVsDAESmANIlQgoACzjozpxAF8A3BvGIlAOQAigq6CrFDY6MCoENiIAEJwcADWAhpGVCaMzKxsniI29o4MTCzsnsEQCEyIAEYJyQC8KBg4BCSkAAapxgwAUjwxSuRaGvkOTlJ2GDRwUGFx6AhQANeC7RyeFWCYcDTYAHTTbKS1SXuwULvrIt6+cIjhC+hWh5iIpuAAJtjArNgfLqgoJpwLB0oITolSAByLSoD5Qq5iCS3e7oR5WewLADur1MEMQMFeYBm1kQoEgsAQAKB6BBMDBQA)

一个更安全的替代方案是让 `parseYAML` 返回 `unknown` 类型：

```ts
function safeParseYAML(yaml: string): unknown {
  return parseYAML(yaml)
}
const book = safeParseYAML(`
  name: The Tenant of Wildfell Hall
  author: Anne Brontë
`)
console.log(book.title)
//          ~~~~ 'book' is of type 'unknown'
book('read')
// Error: 'book' is of type 'unknown'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwIYCcDOBTAmgQQFkAZACgE9UBbAGwC5FMp0YwBzASgdTHMQG8AUIkQB6UYgDCAeUIAFAEoBRAMorhidNigh0SfojDVsDAESmANIlQgoACzjozpxAF8A3BvGIlAOQAigq6CrFDY6MCoENiIAEJwcADWAhpGVCaMzKxsniI29o4MTCzsnsGgkLAIjKjA2HIYOAQkFNT0mSWcDOCJYHAA7voaWjp6KI14RGSUtBxlghAITIgARgnJALw1dQ1Yky0ABqnGDAAqdjGn2EZgUIhwwIgA6jA0ACZ1NDSIABKoXxp8g4nIh8GAwDFYugEFAANeCA5zBZLOA0bAAOhocDYpDWSXRsCgaKR3hEZPJAD8qRTEAByPGJWmIGCYe6PKDkZAxWk9PqDWmCBmkUxaVBvUwkiRKdDQkH09ZMllsxAcrl03kDMACoA)

要理解 `unknown` 类型，从可赋值性的角度思考 `any` 是有帮助的。`any` 的力量和危险来自两个属性：

- 所有类型都可以赋值给 `any` 类型。
- `any` 类型可以赋值给所有其他类型。

如果我们"将类型视为值的集合"（第 7 条），第一个属性意味着 `any` 是所有其他类型的超类型，而第二个意味着它是子类型。这很奇怪！这意味着 `any` 不适合类型系统，因为一个集合不能同时是所有其他集合的子集和超集。这是 `any` 力量的来源，但也是它有问题的原因。由于类型检查器是基于集合的，使用 `any` 实际上禁用了它。

`unknown` 类型是适合类型系统的 `any` 替代品。它具有第一个属性（任何类型都可以赋值给 `unknown`），但不具有第二个属性（`unknown` 只能赋值给 `unknown` 和，当然，`any`）。它被称为"顶部"类型，因为它位于类型层次结构的顶部。`never` 类型则相反：它具有第二个属性（可以赋值给任何其他类型），但不具有第一个属性（没有其他类型可以赋值给 `never`）。它被称为"底部"类型。

尝试访问 `unknown` 类型值的属性是错误的。尝试调用它或对其进行算术运算也是错误的。你几乎不能用 `unknown` 做任何事情，这正是重点。关于 `unknown` 类型的错误会鼓励你选择更具体的东西：

```ts
const book = safeParseYAML(`
  name: Villette
  author: Charlotte Brontë
`) as Book
console.log(book.title)
//               ~~~~~ Property 'title' does not exist on type 'Book'
book('read')
// Error: This expression is not callable
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwIYCcDOBTAmgQQFkAZACgE9UBbAGwC5FMp0YwBzASgdTHMQG8AUIkQB6UYgDCAeUIAFAEoBRAMorhidNigh0SfojDVsDAESmANIlQgoACzjozpxAF8A3BvGIlAOQAigq6CrFDY6MCoENiIAEJwcADWAhpGVCaMzKxsniI29o4MTCzsnsGgkLAIjKjA2HIYOAQkFNT0mSWcDOCJYHAA7voaWjp6KI14RGSUtBxlghAITIgARgnJALw1dQ1Yky0ABqnGDABqMDQ02mEa+Q5OUnYYNHBQYXHoCFAA14IHHNZMHF1p5FmBMHArgA6F5sUhrJJQ2BQK5zQTeESYrHYgB+eLxiDkn2Q4SgfAA5MiruTEAATODYIF9KCIbAADxgy2qZJJiHJ8SS5MECMSpHJWlQtPJaO8SnQnweABU7JzWWzkFpMJh4EhVczEBBUJdUCsroIgA)

这些错误更合理。由于 `unknown` 不能赋值给其他类型，你需要类型断言。但这也是合适的：我们确实比 TypeScript 更了解结果对象的类型。

当你知道会有一个值，但你不知道或不关心它的类型时，`unknown` 是合适的。`parseYAML` 的结果就是一个例子，但还有其他例子。例如，在 GeoJSON 规范中，特征的 `properties` 属性是任何可 JSON 序列化内容的集合。所以 `unknown` 是有意义的：

```ts
interface Feature {
  id?: string | number
  geometry: Geometry
  properties: unknown
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwIYCcDOBTAmgQQFkAZACgE9UBbAGwC5FMp0YwBzASgdTHMQG8AUIkQB6UYgDCAeUIAFAEoBRAMorhidNigh0SfojDVsDAESmANIlQgoACzjozpxAF8A3BvGIlAOQAigq6CrFDY6MCoENiIAEJwcADWAhpGVCaMzKxsniI29o4MTCzsnsGgkLAIjKjA2HIYOAQkFNT0mSWcDOCJYHAA7voaWjp6KI14RGSUtBxlIWBhEVExAOLYcOnMfPzBoeGR0YgAYtioozFCIjAAJgD8RVnsiAA+hiBUAEbhuYhsG1t0OQGOtNtogb9kOg4MhwrBsJhumBegMwPMgA)

如果你编写一个函数来检查数组是否少于 10 个元素，你并不特别关心元素的类型。所以 `unknown` 在这里也有意义：

```ts
function isSmallArray(arr: readonly unknown[]): boolean {
  return arr.length < 10
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwIYCcDOBTAmgQQFkAZACgE9UBbAGwC5FMp0YwBzASgdTHMQG8AUIkQB6UYgDCAeUIAFAEoBRAMorhidNigh0SfojDVsDAESmANIlQgoACzjozpxAF8A3BvGIlAOQAigq6CrFDY6MCoENiIAEJwcADWAhpGVCaMzKxsniI29o4MTCzsnsGgkLAIjKjA2HIYOAQkFNT0mSWcDOCJYHAA7voaWjp6KI14RGSUtBxlIWBhEVExAOLYcOnMfPzl4NDwSDCYKlSoNDT46Oio5KQYTprYqAAmCDR8PX2DANoAulxEAAjBI0Z5DEQjXRIB4AOjB7HsiAAPIgAIwABnmQA)

正如你所看到的，你可以使用类型断言从 `unknown` 获得更具体的类型。但这不是唯一的方法。`instanceof` 检查也可以：

```ts
function processValue(value: unknown) {
  if (value instanceof Date) {
    value
    // ^? (parameter) value: Date
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwIYCcDOBTAmgQQFkAZACgE9UBbAGwC5FMp0YwBzASgdTHMQG8AUIkQB6UYgDCAeUIAFAEoBRAMorhidNigh0SfojDVsDAESmANIlQgoACzjozpxAF8A3BvGIlAOQAigq6CrFDY6MCoENiIAEJwcADWAhpGVCaMzKxsniI29o4MTCzsnsGgkLAIjKjA2HIYOAQkFNT0mSWcDOCJYHAA7voaWjp6KI14RGSUtBxlIWBhEVExAOLYcOnMfPzl4NDwSMjocNGYmABqqDQg2KQAbte33WC9A2AcKSIwwIgPTzFWEweNE4L9-Kgwp8hCIRI8btgNCJvAA9AD8fzQ6GMS0+8OeiAhYQ0wWCQA)

你也可以使用用户定义的类型守卫：

```ts
function isBook(value: unknown): value is Book {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'author' in value
  )
}
function processValue(value: unknown) {
  if (isBook(value)) {
    value
    // ^? (parameter) value: Book
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwIYCcDOBTAmgQQFkAZACgE9UBbAGwC5FMp0YwBzASgdTHMQG8AUIkQB6UYgDCAeUIAFAEoBRAMorhidNigh0SfojDVsDAESmANIlQgoACzjozpxAF8A3BvGIlAOQAigq6CrFDY6MCoENiIAEJwcADWAhpGVCaMzKxsniI29o4MTCzsnsGgkLAIjKjA2HIYOAQkFNT0mSWcDOCJYHAA7voaWjp6KI14RGSUtBxlIWBhEVExAOLYcOnMfPzl4NDwSDCY8UmkAG6oNCAZPX2DXIiX1zHHcQnJQiIjukikGiIRFByMgNsALlcbhxEABeOGIADkcAARgArbDQBGIABk2KekJiAEJ4WAQDQaDjsQDAQi0tgsax8S9KYj8g50AykM8bho5kFBBUDtVkOg4NFMJgAGoEiEvbpgXoDMDQr6IGDARCkY6nRKyqEq6nc7C5QHeAB6AH5NWh0MYltCjQwdRpgsEgA)

TypeScript 需要相当多的证明来收窄 `unknown` 类型：为了避免 `in` 检查的错误，你首先必须证明 `val` 是一个对象类型并且它不是 `null`（因为 `typeof null === 'object'`）。与任何用户定义的类型守卫一样，记住它不比类型断言更安全。没有什么检查你是否正确实现了守卫或保持它与你的类型同步。（第 74 条讨论了这个难题的解决方案。）

你有时会看到使用类型参数而不是 `unknown`。你可以这样声明 `safeParseYAML` 函数：

```ts
function safeParseYAML<T>(yaml: string): T {
  return parseYAML(yaml)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwIYCcDOBTAmgQQFkAZACgE9UBbAGwC5FMp0YwBzASgdTHMQG8AUIkQB6UYgDCAeUIAFAEoBRAMorhidNigh0SfojDVsDAESmANIlQgoACzjozpxAF8A3BvGIlAOQAigq6CoJCwCIyowNhyGDgEJAA8ACoAfBTU9IzMrJwMyQIaWjp6KHF4RGSUtBxyewUA)

然而，这在 TypeScript 中通常被认为是糟糕的风格。它看起来与类型断言不同，但它并不更安全，功能上是一样的。最好只是返回 `unknown` 并强制用户使用断言，或收窄到他们想要的类型。这是不必要使用泛型的一个常见例子，这是第 51 条的主题。

`unknown` 也可以在"双重断言"中代替 `any`：

```ts
declare const foo: Foo
let barAny = foo as any as Bar
let barUnk = foo as unknown as Bar
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGIHt3IN7JpgLmQGcwpQBzZAXwChRJZEUAhOKHZAI3aNPJBU6AEwgIANuxQJ0IUnkJpMAblriIYbuwCCIAJ7IAvAqxxiyOPovm2UVes08oAVRABrIyevIAru5DoAO4g3raqQA)

这些在功能上是等价的，但 `unknown` 版本防止了你和你的同事在看到 `as any` 时可能产生的本能反应。

最后，你可能会看到使用 `object` 或 `{}` 的代码，类似于本条目中描述的 `unknown` 的使用方式。它们也是宽泛的类型，但比 `unknown` 稍微窄一些：

- `{}` 类型包含除 `null` 和 `undefined` 之外的所有值。
- `Object` 类型（大写"O"）几乎与 `{}` 相同。字符串、数字、布尔值和其他原始类型可以赋值给 `Object`。
- `object` 类型（小写"o"）包含所有非原始类型。这不包括 `true` 或 `12` 或 `"foo"`，但包括对象、数组和函数。

你很少真的想要允许除 `null` 和 `undefined` 之外的任何值，所以 `unknown` 通常比 `{}` 或 `Object` 更可取。

## 关键点总结

- `unknown` 类型是 `any` 的类型安全替代品。当你知道有一个值，但不知道或不关心它的类型时，使用 `unknown`。
- 使用 `unknown` 强制用户进行类型断言或其他形式的类型收窄。
- 避免仅返回类型的参数，因为它们可能会带来虚假的安全感。
- 理解 `{}`、`object` 和 `unknown` 之间的区别。

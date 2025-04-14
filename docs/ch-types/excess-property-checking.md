# 第 11 条：区分多余属性检查与类型检查

## 要点

- 当你将一个对象字面量赋值给已知类型的变量，或作为参数传给函数时，TypeScript 会进行多余属性检查（excess property checking）。
- 多余属性检查是发现错误的有效手段，但它不同于 TypeScript 通常的结构兼容性检查。如果混淆这两者，会让你更难理解类型赋值的原理。TypeScript 的类型不是“封闭”的。
- 注意它的局限性：只要你引入一个中间变量，这种检查就会被绕过。
- “弱类型”是指所有属性都是可选的对象类型。对于这类类型，在进行可赋值性检查时，**要求值中至少要有一个属性与之匹配**。

## 正文

当你把一个对象字面量赋值给一个已经声明了类型的变量时，TypeScript 会检查这个对象是否**正好**符合该类型：既要有这个类型要求的属性，也不能多出其他属性。

```ts
interface Room {
  numDoors: number
  ceilingHeightFt: number
}
const r: Room = {
  numDoors: 1,
  ceilingHeightFt: 10,
  elephant: 'present',
  // ~~~~~~~ Object literal may only specify known properties,
  //         and 'elephant' does not exist in type 'Room'
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoHt0FtkG8BQyyIArlgCKZQDOAXMWQEbQDchySwANqAOYASEYLwAWYAGJh6pLMyhsAvvgToQ1MMij0M2ZAF487GZXQ16ARgA07TjxAChoiVOTmADNaIQuEAA4i4cHoAcl8oCGoIcGDrAHpY5AA-ZJTE5AB5RgArCAQNHkgoOC5kLDgAT2RVLkrqX1zgGEqAaxB0AHcQZDD0eqgwYAi4hKJR0cCAE2Rg7z8A6OQJ9AjidA0IAA9gdWRQZDBy+umdLGD8BTYgA)

虽然 `elephant` 这个属性看起来挺奇怪的，但从结构类型的角度来看（参考第 4 条），这个错误并不太合理。因为这个常量其实是可以赋值给 `Room` 类型的 —— 你可以通过引入一个中间变量来验证这一点：

```ts
const obj = {
  numDoors: 1,
  ceilingHeightFt: 10,
  elephant: 'present',
}
const r: Room = obj // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoHt0FtkG8BQyyIArlgCKZQDOAXMWQEbQDchySwANqAOYASEYLwAWYAGJh6pLMyhsAvvgToQ1MMnSMAVsgC8edjMroa9AIwAadpx4gBQ0RKnJzABmtEIXCAAcRcOD0AOS+UBDUEODB1gpsKmoaUPQY2PqaOixEAPTZyADyANL4QA)

`obj` 的类型会被推断为：

```ts
{
  numDoors: number
  ceilingHeightFt: number
  elephant: string
}
```

这个类型是 `Room` 类型的一个“子集”，因为它限制了 `elephant` 的类型只能是字符串，而 `Room` 类型允许 `elephant` 是任何类型。所以它是可以赋值给 `Room` 的，代码也能通过类型检查。（如果你对“子集”这个术语不熟，可以参考第 7 条）

那为什么前面那个例子会报错，而这个却没问题呢？这是因为第一个例子触发了一个叫“**多余属性检查**”（excess property checking）的机制。这个机制是为了帮助我们捕捉一些结构类型检查容易漏掉的错误。

不过，多余属性检查是有局限的，如果把它和普通的类型赋值检查混为一谈，就会让你更难理解结构类型系统的直觉。把多余属性检查当作一个独立的过程来看，会更有助于你建立清晰的 TypeScript 类型系统心智模型。

正如第 1 条提到的，TypeScript 不只是找那些运行时会报错的代码，它还会找那些**看起来不会错但实际上跟你想要的不一样**的代码。下面就是一个这样的例子：

```ts
interface Options {
  title: string
  darkMode?: boolean
}
function createWindow(options: Options) {
  if (options.darkMode) {
    setDarkMode()
  }
  // ...
}
createWindow({
  title: 'Spider Solitaire',
  darkmode: true,
  // ~~~~~~~ Object literal may only specify known properties,
  //         but 'darkmode' does not exist in type 'Options'.
  //         Did you mean to write 'darkMode'?
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoHt0FtkG8BQyyIArlgCKZQDOAXMWQEbQDchySwANqAOYASEYLwAWYAGJh6pLMyhsAvvhgkQCMMHQhk1CGHJwoAawCy6ACYQAFAEo8S0JFiIUAeQAOGrdTzsNYLgh6ajAoPjYic0NTCwgAfnpGTEC4EEVlVXVNbQQoCDhIAHVQc3QAdyt0T2y6ZA8vEGo7AiJgGGRK6u8AOijjM0tm9iJdfWiB6xsI5CUiAHo55G7l-CVc-KKS8qsW5H9A+gByAGV3YEsoZGP0HjA4YDzDgBp2PqMsWPpQkgh8BeQAH5A4EAuqMABWEHUyFu0DgXGQWDgAE9kFouKjqO4oW1UUYQOVtO4oFVoBoINQXv8iDSaYwSGBkIc3h9LIdkKUKcR0IyIAAPYAhZCgPbI7FM+o1Q7dP6LWm08jnZDI9AkRH5bRgdDIMphSBMt4TQ5xVZTfBAA)

这段代码在运行时不会抛出任何错误，但它很可能不会达到你预期的效果，正如 TypeScript 提到的：应该是 `darkMode`（大写 M），而不是 `darkmode`。

纯粹的结构类型检查器是无法发现这种错误的，因为 `Options` 类型非常宽泛：它包括所有拥有 `title` 属性且值为字符串的对象，以及任何其他属性，只要这些属性中没有 `darkMode` 被设置为非 `true` 或 `false` 的值。

很容易忘记 TypeScript 的类型有多宽泛。以下是一些也可以赋值给 `Options` 的值：

```ts
const o1: Options = document // OK
const o2: Options = new HTMLAnchorElement() // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoHt0FtkG8BQyyIArlgCKZQDOAXMWQEbQDchySwANqAOYASEYLwAWYAGJh6pLMyhsAvvhgkQCMMHQhk1CGHJwoAawCy6ACYQAFAEo8S0JFiIUAeQAOGrdTzsNYLgh6ajAoPjYic0NTCwgAfnpGTEC4EEV8BG8wZHQARnoPLxAfAF5kc3QEMghwFiIAenrkVwBpDKycgCYCz01i5DKQCAB3ZH4AFRMAGQBBNRF0KABRQKwasFs65EbmtqA)

`document` 和 `HTMLAnchorElement` 的实例都有 `title` 属性，而且这个属性的类型是字符串，因此这两种赋值是允许的。的确，`Options` 是一个非常宽泛的类型！

“多余属性检查”尝试在不妥协类型系统的基本结构性质的情况下，对这些类型进行限制。它通过在上下文中使用声明类型时，禁止在对象字面量中出现未知属性来实现这一点。（因此，它有时被称为“严格对象字面量检查”，或者因为它适用于新创建的对象，也叫“新鲜度检查”）。

这种上下文可以是赋值给一个声明类型的变量、函数参数，或者返回值为声明类型的函数。由于 `document` 和 `HTMLAnchorElement` 不是对象字面量，它们不会触发多余属性检查。但 `{title, darkmode}` 对象是对象字面量，因此会触发多余属性检查。

```ts
const o: Options = { darkmode: true, title: 'Ski Free' }
// ~~~~~~~~ 'darkmode' does not exist in type 'Options'...
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoHt0FtkG8BQyyIArlgCKZQDOAXMWQEbQDchySwANqAOYASEYLwAWYAGJh6pLMyhsAvvhgkQCMMHQhk1CGHJwoAawCy6ACYQAFAEo8S0JFiIUAeQAOGrdTzsNYLgh6ajAoPjYic0NTCwgAfnpGTEC4EEV8BG8wZHR6Dy8QHwBePGQo4yxY+lCSCAAaZH9A+gByAGUjYGRxKAgIFuQFCKIR0bGRgHoJ5AA-Ofm55Bbyo0rLAfN0CB8QdGyIAA9gEORQRoBPdxQW-M1CloA6J-wgA)

这就解释了为什么使用一个没有类型注解的中间变量会让错误消失：

```ts
const intermediate = { darkmode: true, title: 'Ski Free' }
const o: Options = intermediate // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoHt0FtkG8BQyyIArlgCKZQDOAXMWQEbQDchySwANqAOYASEYLwAWYAGJh6pLMyhsAvvhgkQCMMHQhk1CGHJwoAawCy6ACYQAFAEo8S0JFiIUAeQAOGrdTzsNYLgh6ajAoPjYic0NTCwgAfnpGTEC4EEV8BG8wZEdoLAhzYDhIZABePGQo4yxY+lCSCAAaZH9A+gByAGUjYGRxKAgIduQFNkyQEOR0eg8vCbKc8DyCosgWIgB6DeRXAGl8IA)

虽然第一行右边是一个对象字面量，会触发多余属性检查；但第二行右边是一个中间变量（`intermediate`），它本身不是字面量，所以不会触发多余属性检查，错误也就消失了。

同样地，如果你使用类型断言（type assertion），也不会触发多余属性检查：

```ts
const o = { darkmode: true, title: 'MS Hearts' } as Options // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoHt0FtkG8BQyyIArlgCKZQDOAXMWQEbQDchySwANqAOYASEYLwAWYAGJh6pLMyhsAvvhgkQCMMHQhk1CGHJwoAawCy6ACYQAFAEo8S0JFiIUAeQAOGrdTzsNYLgh6ajAoPjYic0NTCwgAfnpGTEC4EEV8BG8wZHRkAF48ZCjjLFj6UJIIABpkf0D6AHITAGVkQUMwagbkBWQ4Hw8vEGoWIgB6MeRXAGl8IA)

这就是为什么更推荐使用类型注解而不是类型断言的一个重要原因（参考第 9 条）。

如果你确实不想进行这种多余属性检查，可以通过添加索引签名的方式，告诉 TypeScript：这个对象可能会有额外的属性：

```ts
interface Options {
  darkMode?: boolean
  [otherOptions: string]: unknown
}
const o: Options = { darkmode: true } // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgPIAczAPYgM7IDeAUMsgCZxQDWAstuRAPwBcyARttgDYRwgBuUsgDa2MAAtoGLLjxs8YKKADmAXTYBXENRDYA7oOIBfYgjlhk2NjJz5kAXiIUq1ALYMIbJZpTGBZAD0gWgA0sRAA)

第 16 条会讲到什么时候使用索引签名来表示数据是合适的，什么时候又不合适。

还有一个相关的检查出现在所谓的“弱类型”中 —— 指的是那些所有属性都是可选的类型：

```ts
interface LineChartOptions {
  logscale?: boolean
  invertedYAxis?: boolean
  areaChart?: boolean
}
function setOptions(options: LineChartOptions) {
  /* ... */
}

const opts = { logScale: true }
setOptions(opts)
//         ~~~~ Type '{ logScale: boolean; }' has no properties in common
//              with type 'LineChartOptions'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgDKggYQBZymAeQAcxgB7EAZ2QG8AoZZAGzIHNKE4mIB+ALmQAjMmW5wQAbgbJQAN2iQAJgE0AggA9glfkJFjJ0vBDg48YHcNHGDAXzowAriASkKyShEIlyVABRlvCkoBdBAsXHxiVyoASlpkAHoAKmQAOnTkJITkOzoEILBkALBqAF54llYAZU5uATAoBxQbKQ8vaMp-EkoYqQTsxkHBgD9R4eQAFQBPIhQAchpmNhquCAFLfQkcueRcahAyZCIoAIVgCGpQZHyAWxuKOn6h5+eAd2AwbGQwGfnQ8LMUR8lDmdCAA)

从结构类型的角度来看，`LineChartOptions` 这样的类型几乎能接受任何对象。

但对于这种“弱类型”（所有属性都是可选的），TypeScript 会额外做一个检查：**赋值的值类型和声明的目标类型之间，至少要有一个属性是匹配的**。

这个检查和“多余属性检查”类似，都是为了防止拼写错误、遗漏等问题，不过它并不完全基于结构类型系统。

不同的是：  
**弱类型检查在所有涉及弱类型的赋值中都会发生**，就算你把对象提取成一个中间变量也不能绕过它。TypeScript 仍然会确保：你传的值至少有一个属性，能和目标类型对得上。

> [!NOTE]
> 在 TypeScript 中，“**弱类型（weak type）**”是一个技术术语，专指**所有属性都是可选的接口类型**。它跟你的类型设计是否优秀没关系，也不是在贬低你的类型。 “弱类型”的对立面也**不是**所谓的“强类型（strong type）”——这个词在 TypeScript 或大多数编程语言里其实并没有明确的定义。

“多余属性检查”是一种有效的手段，用来捕捉拼写错误或属性名写错这类在结构类型系统下本来会被允许的问题。它对包含可选字段的类型（比如 `Options`）特别有用。但它的适用范围很有限 —— **只对对象字面量生效**。

理解它的这个限制，并且把“多余属性检查”和普通的“可赋值性检查”区分开，会帮助你更清晰地建立 TypeScript 类型系统的心智模型。

具体例子可以参考第 61 条，看看“多余属性检查”是如何帮助发现 bug 并启发更好的设计的。

## 关键点总结

- 当你将一个对象字面量赋值给已知类型的变量，或作为参数传给函数时，TypeScript 会进行多余属性检查（excess property checking）。
- 这种检查确实能发现很多错误，但它和普通的结构类型检查是两回事。如果你把这两种机制混为一谈，会很难真正理解类型的可赋值性。TypeScript 的类型系统并不是“封闭”的（见第 4 条）。
- 注意它的局限性：只要你引入一个中间变量，这种检查就会被绕过。
- “弱类型”是指所有属性都是可选的对象类型。对于这类类型，在进行可赋值性检查时，**要求值中至少要有一个属性与之匹配**。

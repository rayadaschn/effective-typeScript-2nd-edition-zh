# 理解 TypeScript 与 JavaScript 的关系

如果你长时间使用 TypeScript，你不可避免地会听到“TypeScript 是 JavaScript 的超集”或“TypeScript 是 JavaScript 的类型化超集”这样的说法。但这到底是什么意思呢？TypeScript 和 JavaScript 之间的关系是什么？由于这两种语言紧密相连，深入理解它们之间的关系是高效使用 TypeScript 的基础。

A 是 B 的“超集”，意味着 B 中的所有内容也包含在 A 中。从语法的角度来看，TypeScript 是 JavaScript 的超集：只要你的 JavaScript 程序没有语法错误，它也是一个 TypeScript 程序。(虽然很可能 TypeScript 的类型检查器也会标记出一些代码问题，但这是另一个问题。) 首先 TypeScript 仍然会解析你的代码并生成 JavaScript。

TypeScript 文件使用 `.ts` 扩展名，而不是 JavaScript 文件的 `.js` 扩展名。这并不意味着 TypeScript 是一门完全不同的语言！由于 TypeScript 是 JavaScript 的超集，你的 `.js` 文件中的代码已经是 TypeScript 代码了。将 `main.js` 重命名为 `main.ts` 并不会改变这一点。

如果你正在将现有的 JavaScript 代码库迁移到 TypeScript。这意味着你完全不需要进行重构，可以直接运行。因为所有的 JavaScript 程序都是 TypeScript 程序，但反之则不成立：有些 TypeScript 程序不是 JavaScript 程序。这是因为 TypeScript 为指定类型添加了额外的语法。(后面章节会介绍到)

举一个例子，这是一个正确的 Typescript 代码：

```ts
function greet(who: string) {
  console.log('Hello', who)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwE4FN1QBQHcAWcAXIgM5SoxjICUiA3gFCKIQKlwA26AdJ3MmwByABLpO-IQBpEBODQDcjAL6MgA)

但是你将其在 js 中运行时，会报错：

```error
function greet(who: string) {
                  ^
SyntaxError: Unexpected token :
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/DYUwLgBAxglmCeEC8EDkA7EB3C8D2ATgNbRzyoDcAUFHugM56gB0weA5gBSwLNh4BVAA5CQBKAEN6ITgEpZ1IA)

这是因为 `: string` 是 TypeScript 语法，JavaScript 不支持。

![所有的 JavaScript 都是 TypeScript，但并非所有 TypeScript 都是 JavaScript](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202503221019504.png)

从图中可以看出，所有的 JavaScript 都是 TypeScript，但并非所有 TypeScript 都是 JavaScript。

但这并不是说 TypeScript 对 JavaScript 程序没有用，它是有用的！例如，以下这个 JavaScript 程序：

```js
let city = 'new york city'
console.log(city.toUppercase())
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/DYUwLgBAxglmCeEC8EDkA7EB3C8D2ATgNbRzyoDcAUFHugM56gB0weA5gBSwLNh4BVAA5CQBKAEN6ITgEpZ1IA)

如果你运行它会抛出这样的一个错误：

```error
TypeError: city.toUppercase is not a function
```

这是因为 JavaScript 中的字符串方法名称是 `toUpperCase`，而不是 `toUppercase`。如果你使用 TypeScript，你可以在编译时捕获这个错误，而不是在运行时：

```ts
let city = 'new york city'
console.log(city.toUppercase())
//               ~~~~~~~~~~~ Property 'toUppercase' does not exist on type
//                           'string'. Did you mean 'toUpperCase'?
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/DYUwLgBAxglmCeEC8EDkA7EB3C8D2ATgNbRzyoDcAUFHugM56gB0weA5gBSwLNh4BVAA5CQBKAEN6ITgEpZ1APSKIqteo0A-bTt2aIABQJ5RBBGn7DTk6aggATPCHoR0eSCAAeMepDoQEUSplDVCw8LRfAhh0dlRmCAARGHtcPABXCABbEAl0C0ERMQBhKRBUAH4qIA)

你并不需要告诉 TypeScript `city` 的类型是 `string`，它会根据初始值自动推断出来。类型推断是 TypeScript 的一个关键特性，第 3 节中会讲到。

TypeScript 类型系统的目标之一，是在**不运行代码的前提下**，检测出那些在运行时可能会抛出异常的代码。当你听到 TypeScript 被称为“静态”类型系统时，说的正是这种能力。类型检查器无法百分之百发现所有会导致异常的代码，但它会尽力去发现。

即使你的代码不会抛出异常，它也可能不会按你期望的方式运行。TypeScript 也会尝试帮你捕捉到这类问题。例如，下面这个 JavaScript 程序：

```js
const states = [
  { name: 'Alabama', capital: 'Montgomery' },
  { name: 'Alaska', capital: 'Juneau' },
  { name: 'Arizona', capital: 'Phoenix' },
  // ...
]
for (const state of states) {
  console.log(state.capitol)
}

// undefined
// undefined
// undefined
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBNCGUCmEYF4YG0BQMYG8x4BbJALhgHIBBAG3gCMT5KAaGYeABwEsp5aFSgFlwUAOYhSAJwCelAL6tcBIqSF14EANYt2HbnwFCAUgFcwSeGcXK8hEuSrVpPAF7g9B3v0FUACgAWIEhgPAAetioA9NEwAHSJ2AC6ANzYAGYg0jAAFKCQsAjIMCAZcPzIEACUBCoFECC0SPG0IOK5xS2cPk3V6QrYQA)

虽然这个程序是合法的 JavaScript（因此也是合法的 TypeScript），并且它运行时没有抛出任何错误。但它显然没有实现你预期的效果。

即使你没有添加任何类型注解，TypeScript 的类型检查器仍然能够发现这个错误，并提供有用的建议。这正是 TypeScript 强大之处之一——它可以在你编译阶段就指出潜在问题，而不必等到运行时才发现。

```ts
for (const state of states) {
  console.log(state.capitol)
  //                ~~~~~~~ Property 'capitol' does not exist on type
  //                        '{ name: string; capital: string; }'.
  //                        Did you mean 'capital'?
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/KYDwDg9gTgLgBAbwL4G4BQBjCA7AzvfAQxmFzgF44BtNORbQgW2AC44ByAQQBtCAjJoXYAaOBkJgAljELc27ALI4YAcwjMoAT3ZJhtek1YcehXAGshosROmz5AKQCu2YIUc69dBA2bzOUSQAvHEtrKRk5DgAFAAsIYGxJEA99AHpUuAA6bLQAXXQAM2g4AAosPAIZEjgIArgiElwASkR9ctwIbmBM7ggVEobu8XDOpvQ6dLop6Zm6AD8Fxbm4KKgIMGBYTQ5h6U72OAATeLJsCHhQSXwa7DgYTQ20jNmX17p2BDgfI3wA7BUUGFbJFfpJ-oCkOxMk83rCZgARSSHOCaCCOODMQi3di7CLsAD8aCQaCAA)

> 实际上，我们确实是想写带有字母 “a” 的 `capital`。州和国家都有首都（capital，带 “a”），而立法机关则在议会大厦（capitol，带 “o”）中召开。

虽然即使你不提供类型注解，TypeScript 也能帮你发现一些错误，但如果你加上类型注解，它能做得更彻底、更精准。这是因为类型注解明确表达了你的**意图**，这样 TypeScript 就可以检查代码行为是否与你的意图不符。

比如说，如果你在之前的例子中反过来，把 `capital` 和 `capitol` 拼写搞错了会怎么样？添加类型注解之后，TypeScript 更容易发现这种问题，并提示你哪里有不一致。

```ts
const states = [
  { name: 'Alabama', capitol: 'Montgomery' },
  { name: 'Alaska', capitol: 'Juneau' },
  { name: 'Arizona', capitol: 'Phoenix' },
  // ...
]
for (const state of states) {
  console.log(state.capital)
  //                ~~~~~~~ Property 'capital' does not exist on type
  //                        '{ name: string; capitol: string; }'.
  //                        Did you mean 'capitol'?
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBNCGUCmEYF4YG0BQMYG8x4BbJALhgHIBBAG3gCMT5KAaGYeABwEsoRaFSgFlwUAOYhSAJwCelAL6tcBIqSF14EANYt2HbnwFCAUgFcwSeGcXK8hEuSrVpPAF7g9B3v0FUACgAWIEhgPAAetioA9NEwAHSJ2AC6ANzYAGYg0jAAFKCQsAjIMCAZcFCIKACUBCoFEAJI8bQg4rnFzZw+8LTV6XixeMMjo3gAfpNT4zD+0iBcSNJQslTdfL2UMAAmIahgILBI4TzQpWAwK4sxcWN393iU+DBqTtCuYOKp3kZ+7zyfb4KSjxG4PcGjAAiPG2MFkIDMMFI8AulHWvkoAH5sApsEA)

之前那个非常有帮助的错误提示，但现在却有问题！它将你的同一个属性拼成了两种不同的写法，而 TypeScript 并不知道哪个是正确的。虽然它会猜测，但这种猜测并不总是准确的。

解决方法是：**通过显式声明 `states` 的类型，明确表达你的意图**，这样 TypeScript 就能准确理解你想要的结构，帮你检测到不一致的地方。

```ts
interface State {
  name: string
  capital: string
}
const states: State[] = [
  { name: 'Alabama', capitol: 'Montgomery' },
  //                ~~~~~~~
  { name: 'Alaska', capitol: 'Juneau' },
  //                ~~~~~~~
  { name: 'Arizona', capitol: 'Phoenix' },
  //                ~~~~~~~ Object literal may only specify known properties,
  //                        but 'capitol' does not exist in type 'State'.
  //                        Did you mean to write 'capital'?
  // ...
]
for (const state of states) {
  console.log(state.capital)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpjpZBvAUM5EOAWwgC5kBnMKUAcwG59kE4AHYDAGwutpEa4AvrgQB7ENSoZIlCukwQA2gF1kAXmRLm2IqQoByAIJc4AIxJwDAGhbtOYnsgMBZCWDpjSUAJ4Gh1swA9EEEYeERBAB+MbFROnrkziZwlADWVrZ2HGCOhgBSAK4gEHCF-oEEIZE1YXGxCSRJxrQAXhKZ2Q5OBgAKABZiECDAAB4VwaG1NfUxyADyZgBWEAhgyFyc0HBcyMRwPsgSXIeUbKvAMIdpIGIA7iDIbFBi51BgwBCUlcjV0--hMyFdYGVg5RwGZAAEyGlEIYnWEFGwCkoGQYB852cCkgBgAdJMAUTkAARYBQ5A+MSFPalR65ZB3WhYUH2bgGAD8hLxPNwKiYMDEUGQAApxJJ1tRFEcYNJFJQAJQ4ZjiyiOCB4rhiOgiqWQPFgzg7BVMERAA)

现在，错误提示准确反映了问题，TypeScript 给出的修复建议也是正确的。通过明确表达你的意图，你不仅解决了当前的问题，也让 TypeScript 能够发现其他潜在的问题。

举个例子：如果你只在数组中的某一项拼错了一次 `capitol`，在没有类型注解的情况下，TypeScript 是无法发现这个错误的。但加上类型注解后，TypeScript 就能立刻提示你这个拼写不一致的问题，避免 bug 的产生。

```ts
interface State {
  name: string
  capital: string
}
const states: State[] = [
  { name: 'Alabama', capitol: 'Montgomery' },
  //                ~~~~~~~
  { name: 'Alaska', capitol: 'Juneau' },
  //                ~~~~~~~
  { name: 'Arizona', capitol: 'Phoenix' },
  //                ~~~~~~~ Object literal may only specify known properties,
  //                        but 'capitol' does not exist in type 'State'.
  //                        Did you mean to write 'capital'?
  // ...
]
for (const state of states) {
  console.log(state.capital)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpjpZBvAUM5EOAWwgC5kBnMKUAcwG59kE4AHYDAGwutpEa4AvrgQB7ENSoZIlCukwQA2gF1kAXmRLm2IqQoByAIJc4AIxJwDAGhbtOYnsgMBZCWDpjSUAJ4Gh1swA9EEEYeERBAB+MbFROnrkziZwlADWVrZ2HGCOhgBSAK4gEHCF-oEEIZE1YXGxCSRJxrQAXhKZ2Q5OBgAKABZiECDAAB4VwaG1NfUxyADyZgBWEAhgyFyc0HBcyMRwPsgSXIeUbKvAMIdpIGIA7iDIbFBi51BgwBCUlcjV0--hMyFdYGVg5RwGZAAEyGlEIYnWEFGwCkoGQYB852cCkgBgAdJMAUTkAARYBQ5A+MSFPalR65ZB3WhYUH2bgGAD8hLxPNwKiYMDEUGQAApxJJ1tRFEcYNJFJQAJQ4ZjiyiOCB4rhiOgiqWQPFgzg7BVMERAA)

现在，错误提示准确地反映了实际问题，TypeScript 给出的修复建议也正确了。通过明确写出你的意图，你还帮助 TypeScript 发现了其他潜在的问题。

比如说，如果你之前只是 **在数组中的某一项** 拼错了一次 `capitol`，在没有类型注解的情况下，TypeScript 并不会报错——因为它无法确定正确的属性结构。但一旦你添加了类型注解，TypeScript 就会立即发现这个拼写错误，因为它已经清楚地知道你期望的属性是什么。

这种显式声明类型的做法，大大增强了代码的可读性和可维护性，也让 TypeScript 的类型系统能够更有效地帮你发现隐藏问题。

```ts
const states: State[] = [
  { name: 'Alabama', capital: 'Montgomery' },
  { name: 'Alaska', capitol: 'Juneau' },
  //                ~~~~~~~ Did you mean to write 'capital'?
  { name: 'Arizona', capital: 'Phoenix' },
  // ...
]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpjpZBvAUM5EOAWwgC5kBnMKUAcwG59kE4AHYDAGwutpEa4AvrgQB7ENSoZIlCukwQA2gF1kAXmRLm2IqQoByAIJc4AIxJwDAGhbtOcHsgMBZCWDpjSUAJ4Gh1jp65M4mcJQA1la2dhxgYk4GAFIAriAQcCn+gQQA9LkEhUXFBAB+5RWlyAAiwAAmyD5iKcikcCDI8cgA7rRYBqxxjgYA-EEkIca0AF4S0bEOiQAKABZiECDAAB7ZzPnIAHRHuCpMQA)

随着你逐渐与 TypeScript 的类型检查器打交道，这种“动态”会变得非常熟悉：**你提供给它的信息越多，它能帮你发现的问题就越多**。

如果用维恩图（Venn Diagram）来表示，可以在“TypeScript 程序”这个集合中，新增一个子集：**通过类型检查器检查的 TypeScript 程序**。

这个子集里的程序，不仅是有效的 TypeScript 程序，同时也满足了类型系统的所有规则和检查条件。换句话说，它们更接近你真实的意图，运行时出错的风险也更低。TypeScript 的强大就在于，你越清晰地声明类型，类型系统就能帮你越多，给你更安全、更健壮的代码。

![所有的 JavaScript 程序都是合法的 TypeScript 程序。但只有一部分 JavaScript（以及 TypeScript）程序能够通过类型检查器的检查。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202503221042095.png)

TypeScript 接受所有 JavaScript 语法，但它额外提供了类型检查机制。并不是所有符合语法的程序都能满足类型系统的要求，只有那些类型正确、符合预期的程序，才能顺利通过类型检查器。这正是 TypeScript 帮助你提前发现潜在错误的核心优势所在。

如果你觉得“TypeScript 是 JavaScript 的超集”这句话听起来不太对劲，可能是因为你在思考维恩图中的**第三个集合** —— 也就是**能够通过类型检查器的 TypeScript 程序**。

实际上，这个集合才是我们日常使用 TypeScript 时最关心的部分。通常情况下，我们在使用 TypeScript 时，都会尽量让自己的代码**通过所有类型检查**，保持类型系统的“满意状态”。

值得注意的是，TypeScript 的类型系统是**对 JavaScript 运行时行为的一种建模**，它并不会改变 JavaScript 的运行机制。这对于来自一些拥有更严格运行时检查机制的语言（比如 Java 或 C#）的开发者来说，可能会带来一些意想不到的“惊喜”。例如：

```ts
const x = 2 + '3' // OK
//    ^? const x: string
const y = '2' + 3 // OK
//    ^? const y: string
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAHjAvDATDA1DA5AZiwbhhgHpiYB5AaQChSiiA9AfhlEljgC4ZoAnASzABzam2gwAnkmwosGGDkIkyVWmXrNW4cRO59BIoA)

这些语句虽然看起来有点可疑，但它们都能通过 TypeScript 的类型检查器。换做许多其他语言，这些写法可能会在运行时抛出错误。但 TypeScript 这样设计，是因为它忠实地**模拟了 JavaScript 的运行时行为** —— 在 JavaScript 中，这两种写法都会被隐式转换为字符串 `"23"`，并正常运行。

不过，TypeScript 并不是对所有 JavaScript 行为都无条件接受。它还是会在一些地方划定界限。即使某些代码在 JavaScript 运行时不会抛出异常，**TypeScript 的类型检查器依然会对它们发出警告**，例如下面这些写法：

```ts
const a = null + 7 // Evaluates to 7 in JS
//        ~~~~ The value 'null' cannot be used here.
const b = [] + 12 // Evaluates to '12' in JS
//        ~~~~~~~ Operator '+' cannot be applied to types ...
alert('Hello', 'TypeScript') // alerts "Hello"
//             ~~~~~~~~~~~~ Expected 0-1 arguments, but got 2
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAhjAvDMBXANumBqGB2AbhhgHoSYBRANznVTigFMIYoR8YBLMGAKQGUAUGWKjRAP0niYAFQAWjGDTqKA5GkyqYwOGDAhYAI0WoIjACYwFAJ0YA6QaEhGkMANoBdHDACMAJiJScmpaeiYWNhhVfy1uPiERMQkpKRgAeQAHRmsGEGso7C0dPQMYY3gMjPROC1Z2KABPLJY7VsFabKgAClUACUZMEFUAGiiZJsZ+YGtODKhVAEpAkQ7rKBYAIn7BjeFyJIOYFOPUigAPLOAmSwAGAFofeGsAc1QAW0YwddHDVFhn0p+QRAA)

TypeScript 类型系统的核心原则是，它应该尽可能模拟 JavaScript 的运行时行为。然而，在上述所有情况下，TypeScript 认为这些不寻常的用法更可能是错误的结果，而不是开发者的意图。因此，TypeScript 不仅仅局限于模拟运行时行为，还会超越这一点，尽力帮助开发者发现潜在的问题。

我们在之前的 `capital` 和 `capitol` 例子中看到过另一个类似的例子。在那个程序中，代码并没有抛出异常（它只是打印了 `undefined`），但类型检查器仍然标记出了错误。这就是 TypeScript 的一个特点：它不仅仅依赖于程序是否会抛出异常来判断是否有问题，还会通过静态分析检查代码中可能的逻辑错误。

TypeScript 如何决定在何时模拟 JavaScript 的运行时行为，何时超越它呢？最终，这取决于个人的偏好。采用 TypeScript 时，你是在信任构建这个语言的团队的判断。如果你喜欢使用 `null` 和 `7` 或 `[]` 和 `12`，或者在函数调用时传递多余的参数，那么 TypeScript 可能不太适合你！

```ts
const names = ['Alice', 'Bob']
console.log(names[2].toUpperCase())
// TypeError: Cannot read properties of undefined (reading 'toUpperCase')
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBGCGBbAphGBeGBtA5AQQBsBLYZHAGhhwCEQAjHAXQG4AoUSEA5AOgJADmACgQoIWAEyMeUEAFUADguQAnAMLwIyIQEodbIA)

TypeScript 假设数组访问会在有效范围内进行，但实际上并没有。这导致了一个异常的发生。

当你使用 `any` 类型时，未捕获的错误也经常会出现，这些异常的根本原因在于，TypeScript 对一个值的类型（静态类型）和其在运行时的实际类型理解发生了偏差。一个能够保证其静态类型准确性的类型系统被称为**健全**的类型系统。而 TypeScript 的类型系统**并不是健全的**，它从未被设计成健全的。

如果类型系统的健全性对你来说很重要，你可能需要考虑其他语言，如 Reason、PureScript 或 Dart。这些语言确实提供了更多的运行时安全保障，但这也有其代价：你需要更多的努力来说服它们的类型检查器，确保你的代码是正确的，而且这些语言都**不是 JavaScript 的超集**，所以从 JavaScript 迁移到这些语言将会更为复杂。

总结来说：

- **类型检查器允许 JavaScript 运行时能正常运行的隐式行为**，如字符串拼接或类型转换。
- 但 **它也会尽可能帮你发现那些虽然运行不报错，但存在潜在 bug 或不符合预期的代码**。这正体现了 TypeScript 设计上的平衡 —— 灵活但不放纵，严格但不死板。

## 总结

- **TypeScript 是 JavaScript 的超集**：所有 JavaScript 程序在语法上都是有效的 TypeScript 程序，但并非所有 TypeScript 程序都是有效的 JavaScript 程序。
- **TypeScript 增加了一个静态类型系统**，它模拟 JavaScript 的运行时行为，并尝试发现那些会在运行时抛出异常的代码。

- **代码可以通过类型检查器，但仍然可能在运行时抛出异常**。

- **TypeScript 禁止一些合法但值得怀疑的 JavaScript 构造**，例如使用错误数量的参数调用函数。

- **类型注解告诉 TypeScript 你的意图**，帮助它区分正确的代码和错误的代码。

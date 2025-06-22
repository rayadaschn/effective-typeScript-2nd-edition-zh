# Item 50: Think of Generics as Functions Between Types

## 要点

- Think of generic types as functions between types.
- Use `extends` to constrain the domain of type parameters, just as you'd use a type annotation to constrain a function parameter.
- Choose type parameter names that increase the legibility of your code, and write TSDoc for them.
- Think of generic functions and classes as conceptually defining generic types that are conducive to type inference.
- 把泛型类型看作是类型之间的函数。
- 使用 `extends` 来约束类型参数的领域，就像你用类型注解来约束函数参数一样。
- 选择能增加代码可读性的类型参数名称，并为它们编写 TSDoc 文档。
- 把泛型函数和类看作是概念上定义了有利于类型推断的泛型类型。

## 正文

Item 15 展示了如何使用类型操作（extends、映射类型、索引、keyof）来减少相关类型之间的重复。在值层面，函数是提取重复代码的关键方式之一。在类型层面，函数的等价物是泛型类型。泛型类型接受一个或多个类型参数，并产生一个具体的、非泛型的类型。你"调用"函数，而"实例化"泛型类型。

内置的 `Partial` 泛型类型使另一个类型的所有属性变为可选。以下是你自己定义它的方式：

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAsiAKBDATsAlogNgHgCoD4oBeKAbwG0BpKNAOygGsIQB7AMylwF0B+ALk5UuAXwDcAKCA)

这里 `T` 是类型参数。你可以看到这与内置的 `Partial` 类型完全一样：

```ts
interface Person {
  name: string
  age: number
}

type MyPartPerson = MyPartial<Person>
//   ^? type MyPartPerson = { name?: string; age?: number; }

type PartPerson = Partial<Person>
//   ^? type PartPerson = { name?: string; age?: number; }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&exactOptionalPropertyTypes=true#code/C4TwDgpgBAsiAKBDATsAlogNgHgCoD4oBeKAbwG0BpKNAOygGsIQB7AMylwF0B+ALk5UuAXwDcAKDrAIyNogDG0eDIDOLeqXFQotRAFsIAlcGR0A5hO2IzhnQFc9AIxkTh48aEiwEKYMuRq9CRwSKgYOP6B+BIA9DHaUAB6PFCe0CG+kerEZDr6EPxQxqa0FlDWBQK0Ds7IolBuHuBKmarZJKHoWNhZtNHicQnJqc1Qnb05pHkGhcXm9RWF1U4uDeJAA)

通过定义这个泛型类型，我们封装了将另一个类型的所有属性变为可选所需的类型级操作。这完全类似于函数如何封装获取一个值并产生另一个值的逻辑。你不需要知道 `Math.cos` 是如何实现的细节，就能知道它计算数字的余弦值。

你可以编写接受多个类型参数的泛型类型。以下是你尝试定义内置 `Pick` 泛型等价物的方式：

```ts
type MyPick<T, K> = {
  [P in K]: T[P]
  //    ~        Type 'K' is not assignable to type 'string | number | symbol'.
  //        ~~~~ Type 'P' cannot be used to index type 'T'.
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAsiAKBLAxgawDwBUA0UDSAfFALxQDeAUFFANrxSIB2+AugFxSZ0tVQD0fatQB+QsZ3DQA5HikMAzlEYB7YFACG8+YgDmjdQCMANtGDKooSFCnzgAJyY6oAHyUBXALYGIdl1HkgXspGUgB0vALiQsIxopiS1vByyOqMKmreUG7yEAAmFuZMuRAAHhYJUphhFAC+ANwUQA)

即使你在类型级别编程，TypeScript 也会应用所有相同的静态分析工具来检查可分配性和代码中的其他错误。这里它发现了两个问题：

- 我们在 `K` 上进行映射，但 TypeScript 没有理由相信它包含可以用作属性键的类型，即 `string`、`number` 或 `symbol`。
- 即使它是有效的属性键，TypeScript 也没有理由相信 `P` 可以用来索引 `T`。`T` 可能不是对象类型，也可能没有那个键。

处理类型级错误的方法有很多，就像处理非泛型代码中的类型错误有很多方法一样。也许最简单的方法是忽略它们。这出人意料地有效！

```ts
// @ts-expect-error (don't do this!)
type MyPick<T, K> = { [P in K]: T[P] }
type AgeOnly = MyPick<Person, 'age'>
//   ^? type AgeOnly = { age: number; }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmA3EcnA1SQK5kBG0LAL4EA9COQABMBgC0EAB4AHCAjByoULFGQAKACY4A5GGQHkYABbAMAQgCUBMAE9lyALJPUwBAGsAPAAqADTIANIAfMgAvPjIANqoyKBhALrUAQkpyIIszq4AghwA8iAANk7R7p7e-uhQ2CAhhuwQhuEsYsTIAHoA-OYuKIUQJeWVeGwc1CA8-FBM2QRAA)

你可以将其视为 TypeScript 在存在类型错误的情况下发出 JavaScript 的类型级等价物（Item 3）。仅仅因为它不喜欢你的泛型类型实现，并不意味着 TypeScript 不会让你使用它。

当然，TypeScript 抱怨是对的。这个版本的 `MyPick` 很容易出错：

```ts
type FirstNameOnly = MyPick<Person, 'firstName'>
//   ^? type FirstNameOnly = { firstName: unknown; }
type Flip = MyPick<'age', Person>
//   ^? type Flip = {}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmA3EcnA1SQK5kBG0LAL4EA9COQABMBgC0EAB4AHCAjByoULFGQAKACY4A5GGQHkYABbAMAQgCUBMAE9lyALJPUwBAGsAPAAqADTIANIAfMgAvPjIANqoyKBhALrUAQkpyIIszq4AghwA8iAANk7R7p7e-uhQ2CAhhuwQhuEsYsTIAHoA-OYuKIUQJeWVeGwc1CA8-FBM2Y6DyABiwPVgAHLkI2UVMR5evn51DU0w67TbFG0d4sR9A65rG9e7YzETF6871FwgPhAWAA7iAFsI8igVqVgIpKocan5mhxDCFTjh2qJ7j1+pDVjC4Z9hEA)

`MyPick` 的错误使用没有产生类型错误，而是返回了错误的类型。这几乎就像在 JavaScript 中编程一样！

另一种让错误消失的方法是添加与 TypeScript 期望的类型相交。以下是这样的：

```ts
type MyPick<T, K> = { [P in K & PropertyKey]: T[P & keyof T] }

type AgeOnly = MyPick<Person, 'age'>
//   ^? type AgeOnly = { age: number; }
type FirstNameOnly = MyPick<Person, 'firstName'>
//   ^? type FirstNameOnly = { firstName: never; }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmA3EcnA1SQK5kBG0LAL4EwATwAOKALKjUwBAGsAPABUANMgDSAPmQBefMgDaqZKC3IAZGihZJUMZoiiAutRUmryBc6wxkKi7IgiwiEigAghwA8iAANqL6yDJyikroUNggGgDk7BA52iwA9MXEyAB6APzIYpLIURCxCUl4bBzUIDz8UEzBYfUAYsCZYABy5E3xiQYp8soZWbkwI7QTFIUlZcTVteHIw6PrUy0GbStHk50QAG4C-UA)

`PropertyKey` 是 `string | number | symbol` 的内置别名。你可以将这种交集视为类型级的 `as any` 等价物。它让实现中的类型错误消失了，并让正确的使用保持不变。错误的使用结果略有不同，这也许是一个改进：`never` 通常表示出现了问题。

但保持类比，`as any` 在值层面很少是正确的选择，这些交集在类型层面通常也不是最佳选择。你经常通过让函数接受更窄的参数类型来解决类型错误，这正是我们在这里想要做的。你可以使用 `extends` 关键字在类型参数上添加约束：

```ts
type MyPick<T extends object, K extends keyof T> = { [P in K]: T[P] }

type AgeOnly = MyPick<Person, 'age'>
//   ^? type AgeOnly = { age: number; }
type FirstNameOnly = MyPick<Person, 'firstName'>
//                                  ~~~~~~~~~~~
//            Type '"firstName"' does not satisfy the constraint 'keyof Person'.
type Flip = MyPick<'age', Person>
//                 ~~~~~ Type 'string' does not satisfy the constraint 'object'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmA3EcnA1SQK5kBG0LAL4EwATwAOKALKjUwBAGsAPABVkEAB6QQAEwzIsvAFYQEYADTIA0uq0Rd+hRFFYYyFQD5kAXnwBtVGRQawBdahUAkMEWEQkUAEEOAHkQABtRH2QZOUUldChsEEsAcnYIYo8WAHoq4mQAPQB+ZDFJZESIFPTMvDYOahAefigmZGFWlAAxYAKwADlyTrSM32z5ZXzCkpgZ2gWKCuraupPTs-OLgD9rm9vLghqLk5U45GKAIh3Z-Yh34uQdFgIPoQFgwDQ4GBgBgYBkwAALFAIHC0KBwUDg4pOFxuTY4YoAOlibUmqWA4kya1ypQ4xUseJAlQexyeZzu7lexVRjH+gOBJDBEKhMLhiOQyJAqPR4DehhMZkJBCAA)

通过将 `T` 约束为对象类型，并将 `K` 约束为 `T` 键的子类型，我们一举解决了两个问题：我们消除了实现中的类型错误，并在 `MyPick` 的无效实例化上产生了类型错误。

当你设置了 `noImplicitAny` 时，TypeScript 要求你为所有函数参数提供类型注解。对于类型参数没有等价物。如果你不指定约束，它默认为 `unknown`，这允许用户传入任何类型。当你定义泛型类型时，考虑是否要给用户少一点自由，多一点安全性。

当你编写函数时，你选择描述性的参数名称并编写 TSDoc 注释（Item 68）。你也应该为泛型类型这样做。有一个使用单字母名称作为类型参数的约定（如本条目所示），但你应该在类型级代码中对这些保持警惕，就像你对单字母变量名称一样。

命名的一般经验法则是，名称的长度应该与其作用域匹配。长期存在的全局变量应该有长而描述性的名称，而像 `i`、`k` 或 `v` 这样的短名称在作用域有限的简洁箭头函数中实际上可以提高可读性。对于像 `MyPick` 这样的短泛型，`T` 和 `K` 是可以的。但对于类型参数具有更广泛作用域的较长定义（比如泛型类），更长、更有意义的名称将提高清晰度。

你可以为泛型类型编写 TSDoc，TypeScript 语言服务会在相关情况下显示它，就像对函数一样。`@param` 的类型级等价物是 `@template`：

```ts
/**
 * Construct a new object type using a subset of the properties of another one
 * (same as the built-in `Pick` type).
 * @template T The original object type
 * @template K The keys to pick, typically a union of string literal types.
 */
type MyPick<T extends object, K extends keyof T> = {
  [P in K]: T[P]
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmA3EcnA1SQK5kBG0LAL4EA9ACoxRMcgDCOWlC4IwbEhADuyLLwBWEZcjABPAA4ouGRqoxdeGCCqwxDACxQmoWM1DDAIGLWc4ECwwNygtEAgpZAAKDHIUOACwlF4uYAAbMABaUGQAA1RgBABrAsNTCABKADoYgAFIMhNMuEhkABUuty16BlA4TK1dfRVjM0bm1vaUAGkelFKIIxSsZBMS0oAaSs2EIcyjVS4QYBxAmjorTOBIKCG9-3rkMRECCZQAWSNisoAeboQAAekBAABMAto9MpdgsQWDIchlkYnF0AHzIAC8+FYAG1UMh8nMALrUToEkkEQQsIA)

如果你在实例化站点检查 `MyPick`，你会得到完整的文档。如果你在定义中将鼠标悬停在 `T` 或 `K` 上，你会看到仅针对该类型参数的文档（图 6-1）。

![图 6-1. @template TSDoc 标签可用于记录类型参数。](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506221433295.png)

TypeScript 类型最好被视为值的集合（Item 7），因此泛型类型本质上操作集合。这与 JavaScript 函数完全不同，在 JavaScript 函数中你知道每次调用函数时每个参数都会有一个单一的值。在实践中，这意味着你总是需要考虑你的泛型类型如何处理联合类型。Item 53 向你展示如何做到这一点。

你为值级代码编写测试，那么类型级代码呢？你绝对应该测试你的类型！这是一个有趣且足够深入的主题，值得有自己的条目。查看 Item 55。

你也可以为一些值级结构（如函数和类）添加类型参数。例如，我们可能用相应的 `pick` 函数来配合我们的 `Pick` 泛型类型：

```ts
function pick<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Pick<T, K> {
  const picked: Partial<Pick<T, K>> = {}
  for (const k of keys) {
    picked[k] = obj[k]
  }
  return picked as Pick<T, K>
}

const p: Person = { name: 'Matilda', age: 5.5 }
const age = pick(p, 'age')
//    ^? const age: Pick<Person, "age">
console.log(age) // logs { age: 5.5 }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmA3EcnA1SQK5kBG0LAL4EYXEAjDAcyAA7AEAawA8AFWQQAHpBAATDMiy8AVhAkAaZAGl1WiLv0KIATywxkKgHwAKVoaPUVCwA6EMcnDGpLAG0AXQIASmpUeWVAqw98VgQcWlkUiB0kuChJOAAbJWTFVQtLDwyAXnxBFmIYLChkL2yQXIUDNzCMeMziYjlFAqiFGOQmv2mY1uRhYigIMC4oXAnHHTZ9KtTajyECAh7cmSTMaSa8EnJOAHIAWThJMp04Z4t2TgArEEASsWJcwGwOHM8oovDILM9-s94iwAPSosbIAB6AH5kODIZwjpVbiALAAif7kjwXHJYMoQIJlLAMLz-FHEdHIZkMfQPf7UIEg4RAA)

只看类型并忽略括号之间的部分，这看起来很像之前 `MyPick` 类型的定义：

```ts
type P = typeof pick
//   ^? type P = <T extends object, K extends keyof T>(
//         obj: T, ...keys: K[]
//      ) => Pick<T, K>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmA3EcnA1SQK5kBG0LAL4EYXEAjDAcyAA7AEAawA8AFWQQAHpBAATDMiy8AVhAkAaZAGl1WiLv0KIATywxkKgHwAKVoaPUVCwA6EMcnDGpLAG0AXQIASmpUeWVAqw98VgQcWlkUiB0kuChJOAAbJWTFVQtLDwyAXnxBFmIYLChkL2yQXIUDNzCMeMziYjlFAqiFGOQmv2mY1uRhYigIMC4oXAnHHTZ9KtTajyECAh7cmSTMaSa8EnJOAHIAWThJMp04Z4t2TgArEEASsWGAnDIUKg5shwZDXHlFCwAPTIsYAPQA-LCIVCYaobNo9AZjKYwLVCXZiWEEZ4fKixoziH4AsFQs4IlZYgQGUyRg0MkcaukCEA)

你可以将泛型函数视为概念上定义相关的泛型类型。然而，泛型函数的美妙之处在于，当函数被调用时，TypeScript 通常可以从值中推断出类型参数。在前面的例子中，我们只是写了 `pick(p, 'age')`。这比显式写出类型要简洁得多（并产生完全相同的结果）：

```ts
const age = pick<Person, 'age'>(p, 'age')
//    ^? const age: Pick<Person, "age">
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmA3EcnA1SQK5kBG0LAL4EYXEAjDAcyAA7AEAawA8AFWQQAHpBAATDMiy8AVhAkAaZAGl1WiLv0KIATywxkKgHwAKVoaPUVCwA6EMcnDGpLAG0AXQIASmpUeWVAqw98VgQcWlkUiB0kuChJOAAbJWTFVQtLDwyAXnxBFmIYLChkL2yQXIUDNzCMeMziYjlFAqiFGOQmv2mY1uRhYigIMC4oXAnHHTZ9KtTajyECAh7cmSTMaSa8EnJOAHIAWThJMp04Z4t2TgArEEASsWJcwGwOHM8tV0FBsCALM9-s9vDIkSj4iwAPTYsbIAB6AH5kODIZwjpVbojkAAif60jwEIA)

另一个优势是你的 `pick` 函数的用户根本不需要知道他们正在使用泛型类型或类型级操作。他们可以只是享受准确、精确的类型。`age` 的类型暗示了类型级编程在工作，但如果你愿意，这也可以被隐藏。Item 56 展示了如何做到这一点。

类也可以接受类型参数，这些也可以从使用中推断出来：

```ts
class Box<T> {
  value: T
  constructor(value: T) {
    this.value = value
  }
}

const dateBox = new Box(new Date())
//    ^? const dateBox: Box<Date>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmA3EcnA1SQK5kBG0LAL4EYXEAjDAcyAA7AEAawA8AFWQQAHpBAATDMiy8AVhAkAaZAGl1WiLv0KIATywxkKgHwAKVoaPUVCwA6EMcnDGpLAG0AXQIASmpUeWVAqw98VgQcWlkUiB0kuChJOAAbJWTFVQtLDwyAXnxBFmIYLChkL2yQXIUDNzCMeMziYjlFAqiFGOQmv2mY1uRhYigIMC4oXAnHHTZ9KtTajyECAh7cmSTMaSa8EnJOAHIAWThJMp04Z4t2TgArEEASsWAgynAMPoAEJYDSqDKEYgAN3KXE4KmWlzoXAkHS8qLK6ICIyRYzAAAtgBggoT0XNkHSIMthMILjkwMhvpBYRoGSAIAB3ZC8rwC4UAEQ+EC88XiLAA9AqxsgAHoAfmQ2K50t51F5SilkA8BCAA)

回想 Item 8，`class` 是 TypeScript 中少数同时引入类型和值的结构之一。对于泛型类，它引入了一个泛型类型，将类型参数（`T`）与该类的属性和方法联系起来。

就像类善于捕获你原本必须自己跟踪的相关状态位一样，泛型类是捕获类型的好方法。泛型类的类型参数在构造时设置，当你调用其方法时不需要传递给它们（尽管其方法可以有自己的类型参数）。Item 28 探讨了如何使用它来获得对类型推断的更细粒度控制。

在值层面，你可以编写像 `map`、`filter` 和 `reduce` 这样的"高阶函数"，它们接受其他函数作为参数。这给了你巨大的灵活性来提取共享行为。这些有类型级等价物吗？

在撰写本文时，答案是否定的。这些将是"类型函数的函数"或通常称为"高阶类型"。它们会让你提取常见操作，比如将泛型类型应用于对象中的值类型：

```ts
type MapValues<T extends object, F> = {
  [K in keyof T]: F<T[K]>
  //              ~~~~~~~ Type 'F' is not generic.
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAsghmAanANgVwgZwDwBUoQAewEAdgCaZQD2ARgFYQDGwANFAGIB8UAvFAG8AUFCgBtANJQAlqSgBrCCGoAzKLgC6ALk55JGrgG4RUAPSnRlq9YB+d+zfXhoAcg4uZVUtWBQA5mQQAE7STAB0QgC+xkA)

好消息是，这并不限制你可以用泛型类型做什么。它只限制你表达自己的方式。在这种情况下，你需要使用映射类型而不是 `MapValues`。同样，也没有匿名泛型类型这样的东西。

泛型类型最好被视为类型之间的函数。当你编写它们时，请记住这一点。你现在在类型级别工作，这令人兴奋且新颖。但你仍在编码，你学到的所有编写值级代码的最佳实践仍然适用。

## 要点回顾

- 把泛型类型看作是类型之间的函数。
- 使用 `extends` 来约束类型参数的领域，就像你用类型注解来约束函数参数一样。
- 选择能增加代码可读性的类型参数名称，并为它们编写 TSDoc 文档。
- 把泛型函数和类看作是概念上定义了有利于类型推断的泛型类型。

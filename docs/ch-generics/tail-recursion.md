# Item 57: Prefer Tail-Recursive Generic Types

## 要点

- Aim to make your recursive generic types tail recursive. They're more efficient and have greater depth limits.
- Recursive type aliases can often be made tail recursive by rewriting them to use an accumulator.
- 旨在使递归泛型类型尾递归。尾递归更加高效，且具有更大的深度限制。
- 通过重写递归类型别名，使其使用累加器，可以将其转换为尾递归形式。

## 正文

计算机历史上充满了"意外"诞生的编程语言。你为某个系统增加了一些可定制性，用户很喜欢并希望有更多功能，于是你又加了一些实用特性。你不断赋予用户更多的控制权。很快，就有人指出：你已经图灵完备了！6 这种动态的著名例子包括 Microsoft Excel、C 预处理器、C++ 模板，以及 TypeScript 的泛型类型。

这些"意外"的编程语言通常是纯函数式的，因为这种范式只需极少的概念就能赋予你极大的控制力。你只需要函数组合和某种分支机制。在 TypeScript 的类型系统中，函数组合意味着实例化一个泛型类型。而分支可以通过查找对象类型的键，或使用条件类型来实现。

纯函数式语言通常通过递归来实现循环。正如我们在第 54 条中看到的，这可以非常有效地处理字符串类型。

但虽然递归在概念上很高效，现实中却有一些缺点，因为每一次递归调用都需要在调用栈上新增一帧。

为了说明这可能带来的问题，让我们写一个 JavaScript 函数来对列表中的所有数字求和。一种方式是递归：

```ts
function sum(nums: readonly number[]): number {
  if (nums.length === 0) {
    return 0
  }
  return nums[0] + sum(nums.slice(1))
}

console.log(sum([0, 1, 2, 3, 4]))
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZxAWwBRncgXIgJwFMBDAEwQBsBPRbNAIyIIG0BdASn3qYMQG8AUIkQxgiLDgB0lImADmUABaIAvOsQAGDgOEjCRKCAJJNAbj0BfPcSMm6OFpraIA1CnSS0yKckowIIgwARg4OC2tBCARkOFkZOHkMVEwnABpEYIyAJgyAZgyAFk5wwSA)

如你所料，这会输出：

10

这并不是对数字列表求和的高效方式。列表中的每个数字都会导致一次递归调用，占用栈空间，最终会导致栈溢出。以我在 Node.js 下的测试为例，当数组长度在 7000 到 8000 之间时就会溢出：

```ts
const arr = Array(7875).fill(1)
console.log(sum(arr))
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZxAWwBRncgXIgJwFMBDAEwQBsBPRbNAIyIIG0BdASn3qYMQG8AUIkQxgiLDgB0lImADmUABaIAvOsQAGDgOEjCRKCAJJNAbj0BfPcSMm6OFpraIA1CnSS0yKckowIIgwARg4OC2sIBGQoRBICPlVEAEEEkmoMAHYADkyAVg4pYBhKShDwwSiwZDhZGTh5DFRMeIIwiyA)

如果用 `for-of` 循环实现 `sum`，就不会有这种限制。那么，循环本质上比递归更好吗？也不尽然！很久以前，函数式程序员就为这个问题想出了巧妙的解决方案。如果一个函数最后一步是递归调用自身并返回其结果，那么它可以释放掉自己的栈空间：它的工作已经完成，不再需要占用栈。这被称为尾调用优化（Tail Call Optimization, TCO），具有这种形式的函数称为尾递归函数。

下面是一个使用累加器的尾递归 `sum` 实现：

```ts
function sum(nums: readonly number[], acc = 0): number {
  if (nums.length === 0) {
    return acc
  }
  return sum(nums.slice(1), nums[0] + acc)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZxAWwBRncgXIgJwFMBDAEwQBsBPRbNAIyIIG0BdAGkRIggF4ADAEp89JgUQBvAFCJEMYIiw4AdJSJgA5lAAWiPgcTCpsuYSJQQBJDwgBuUwF9TxS9ZTplaZCuSUYEEQYAIxCXPTILAJsiADU3LxCDs5AA)

运行这个版本可以快速得到正确结果且不会栈溢出：

```bash
$: bun sum-tail-rec.js
```

同样的问题也适用于递归的 TypeScript 类型别名。TypeScript 限制了类型别名递归实例化的次数，以防止无限循环和类型检查器变慢。但它支持尾调用优化，对尾递归类型别名允许更大的递归深度。因为尾递归更高效、能力更强，所以你应当尽量让递归类型别名变为尾递归。

这对于按字符处理字符串字面量类型的泛型尤其重要。例如，下面是一个将字符串字面量类型转换为其所有字符联合类型的泛型：

```ts
type GetChars<S extends string> =
  S extends `${infer FirstChar}${infer RestOfString}`
    ? FirstChar | GetChars<RestOfString>
    : never

type ABC = GetChars<'abc'>
//   ^? type ABC = "a" | "b" | "c"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBA4hwGEAWBDATgZwDwGUoQA9gIA7AEwyg2DQEsSBzAPigF4AoKLqPQ48ygAMAJAG96AMwhooAMVqZEqNAF8xk6VABKEagHkJOGvQYrBnbgH45C6snRQAPrHj3MWHfsPHGTC1wAuKBIIADdpAG52dlBIKABBACEENhcldGwAIhQAIwBjTKYogHpi7gA9a1joJJTWKGzMpwacpudMgvYgA)

这个类型在递归调用后还要做一次操作（与 FirstChar 联合），因此不是尾递归。对于长度超过 50 个字符的字符串字面量类型，你会遇到递归深度溢出：

```ts
type Long = GetChars<'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX'>
//          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//          Type instantiation is excessively deep and possibly infinite.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBA4hwGEAWBDATgZwDwGUoQA9gIA7AEwyg2DQEsSBzAPigF4AoKLqPQ48ygAMAJAG96AMwhooAMVqZEqNAF8xk6VABKEagHkJOGvQYrBnbgH45C6snRQAPrHj3MWHfsPHGTC1wAuKBIIADdpAG52dlBIKABBACEENhcldGwAIhQAIwBjTKYogHpi7gA9a1joJJTWKGzMpwacpudMgpjwaAAZAHtGVLh092z8sggJBiRaACsAawAbAFsSPrAAR0UAV1CAdwIQAC9agBEAUVkYAAkASQApAGkegFkAOT0ABQBFLRwAFQAqgA1ADqAA1CiUytxYVwAH6IpHIlGotHojGYtHsUpwuH-bpQejUFAkYC0FDkgZEyiEPK6DC0cKLEBQCYQMBQUlkKBgPoYRk5FlEkgSei0YgAOnYQA)

来看一个更实际的例子，看看这会如何带来问题。回顾第 54 条的 objectToCamel，它接收一个带有下划线命名属性（如 {foo_bar: 0}）的对象，返回等价的驼峰命名属性对象（如 {fooBar: 0}）。我们实现了 ToCamel 泛型，将 "foo_bar" 这样的字符串字面量类型转换为 "fooBar"。

现在我们反过来实现 ToSnake。这里没有分隔符（"\_"），所以我们需要逐字符处理字符串类型。

```ts
type ToSnake<T extends string> = string extends T
  ? string // We want ToSnake<string> = string
  : T extends `${infer First}${infer Rest}`
  ? First extends Uppercase<First> // Is First a capital letter?
    ? `_${Lowercase<First>}${ToSnake<Rest>}` // e.g. "B" -> "_b"
    : `${First}${ToSnake<Rest>}`
  : T

type S = ToSnake<'fooBarBaz'>
//   ^? type S = "foo_bar_baz"

type Two = ToSnake<'className' | 'tagName'>
//   ^? type Two = "class_name" | "tag_name"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKg9gZQHYEMDWEA8MoQB7ARIAmAzlKcAE4CWSA5gHxQC8AUFJxdXfbgUTKwOXAPzdaDTgHppUAOrQA7iiTBYiVBkyVJTVhN4jOALlj9CJcgAMAJAG86AMwhUoAMRpVKAXwfPXKAAlCF9rYyhxAApPb3V8SyEAVTBIKgBjFFIsWMpmKFkoAElyXPUUKEywGmAUABsoOohgQipRCM5xawB9BwAZOCVXTOzMMsY-e3hkdCwQvJ9rGTkIADp6VagAIgAhLagAWmYt7oAjLY6oMzt7MsnprTnQ4AnrAEoIsxgAbjY2UEgUAQBges0wAHInHA4DsUFRYQAvcGMX6FTgAPXEAOgwJY2yhcDOcKJCIu-3A0BgSjgIM0YPB6TqWVIADkUABbCDgqAAHyg4Nq9DZnORqLkGKxFNg1IMW0ZzO6qE5+z5W0Fio5EAuQA)

这里有两个递归分支，取决于字符串字面量类型的首字符是否为大写字母。如果是，我们希望用下划线和小写字母替换它并继续递归；否则保持原样继续递归。第二个例子展示了它对联合类型的分布式处理（见第 53 条）。

这个类型别名在每个分支的递归调用后都要做额外操作（字符串拼接、小写转换），因此不是尾递归。正如你现在可能已经预料到的，这很容易导致栈溢出：

```ts
type Long = ToSnake<'reallyDescriptiveNamePropThatsALittleTooLoquacious'>
//          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//          Type instantiation is excessively deep and possibly infinite.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKg9gZQHYEMDWEA8MoQB7ARIAmAzlKcAE4CWSA5gHxQC8AUFJxdXfbgUTKwOXAPzdaDTgHppUAOrQA7iiTBYiVBkyVJTVhN4jOALlj9CJcgAMAJAG86AMwhUoAMRpVKAXwfPXKAAlCF9rYyhxAApPb3V8SyEAVTBIKgBjFFIsWMpmKFkoAElyXPUUKEywGmAUABsoOohgQipRCM5xawB9BwAZOCVXTOzMMsY-e3hkdCwQvJ9rGTkIADp6VagAIgAhLagAWmYt7oAjLY6oMzt7MsnprTnQ4AnrAEoIsxgAbjY2UEgUAQBges0wAHInHA4DsUFRYQAvcGMX6FTgAPXEAOgwJY2yhcDOcKJCIu-3A0BgSjgIM0YPB6TqWVIADkUABbCDgqAAHyg4Nq9DZnORqLkGKxFNg1IMW0ZzO6qE5+z5W0Fio5EAu2KgAykeNB2nBVAg9TqIAAIqF0rQwMAaAA3CDCiAABSocDAMAAFihgKQAIJ9GrAJrwOADACOAFcUOkaHBo6RRWw0Vx01AAH7ZnO5vP5guFovF-Op8UZrgwKV0Siqe1+hNIKA0cj4dKhUiOiDmqDECAQMBQVTEKBgOCkTunHvOOg1NZsIA)

如果你用这个辅助类型对一个很长的属性名做 snake_case 转换，类型就会"爆炸"。虽然 50 个字符看起来已经足够长，但实际上有很多属性名会更长，尤其是在 Java 世界。

我们可以通过将 ToSnake 重构为尾递归，来解除长字符串字面量类型的限制，并加快所有实例化的类型检查速度：

```ts
type ToSnake<T extends string, Acc extends string = ''> = string extends T
  ? string // We want ToSnake<string> = string
  : T extends `${infer First}${infer Rest}`
  ? ToSnake<
      Rest,
      First extends Uppercase<First>
        ? `${Acc}_${Lowercase<First>}`
        : `${Acc}${First}`
    >
  : Acc

type S = ToSnake<'fooBarBaz'>
//   ^? type S = "foo_bar_baz"

type Two = ToSnake<'className' | 'tagName'>
//   ^? type Two = "class_name" | "tag_name"

type Long = ToSnake<'reallyDescriptiveNamePropThatsALittleTooLoquacious'>
//   ^? type Long = "really_descriptive_name_prop_thats_a_little_too_loquacious"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKg9gZQHYEMDWEA8MoQB7ARIAmAzlKcAE4CWSA5gDRQCCAxm7gUWRdXfSgBeKACJRAPmEAoKH1oMuhEuRiyoAfnkC5Ael1QA6tADuKJMFiJUGTJQX0pI+wPUAuWEp7kABgBIAbzoAMwgqKAAxGipKAF9AkLCoACUIOJ91LXhkdCx1OTlUykZ8gqiYy3xlXgBVMEgqNhRSLHLKCVK5LX8A9jZYgH1AgBk4EzCmlsw24AlYjIKCjx6++ICZ+dKOuQ8+gG5paVBIKARhKxzbAHJguDgAIRQqR4AvK4kD-QKAPS1j6DOIlEtzgAwARk9wSgXqJDv9YCY4OdsjYsFc2AAbZqkAByKAAthArlAAD5QK7AFD0PGE96fAxyX5QeEwRHnUSY7EDVCE0SksSU+jcgkQWFHcDQUaKEQo3KYK5UCAoDEYkAAETSbFoYGANAAbhAaRAAApUOBgGAACxQwFILGGNGAwAxEHgcFGAEcAK4oNg0OBe0h06RfRl-CVQKWCIGK5WqgbETXa3UG4WEgZgM1gAbAa22gYoAYYx3OiA5u5FuDe33+wOwoA)

和尾递归版 sum 一样，我们增加了一个累加器来追踪已完成的工作。这让我们可以把递归实例化移到尾部，从而解除递归深度限制。无论你的 Java 同事抛来多长的属性名，你都能顺利 snake_case！

## 要点回顾

- 旨在使递归泛型类型尾递归。尾递归更加高效，且具有更大的深度限制。
- 通过重写递归类型别名，使其使用累加器，可以将其转换为尾递归形式。

# 第 24 条: 理解上下文在类型推断中的作用

## 要点

- 了解上下文如何在类型推断中被使用。
- 如果提取变量时引入了类型错误，可以考虑添加类型注解。
- 如果变量确实是常量，使用 `const` 断言（`as const`）。但要注意，这可能会导致错误在使用时而非定义时出现。
- 在可行的情况下，优先内联值，以减少对类型注解的需求。

## 正文

TypeScript 不只是根据值来推断类型，它还会考虑值所处的**上下文环境**。这种做法大多数时候都很智能，但有时也会带来一些意想不到的问题。理解 TypeScript 如何使用上下文来进行类型推断，可以帮助你在遇到这些“惊喜”时更好地应对。

在 JavaScript 中，只要不改变执行顺序，你完全可以把某个表达式提取出来赋值给常量，而不会影响代码的行为。换句话说，下面这两段代码在逻辑上是一样的：

```js
// Inline form
setLanguage('JavaScript')

// Reference form
let language = 'JavaScript'
setLanguage(language)
```

在 TypeScript 中，这样的重构依然是可行的：

```ts
function setLanguage(language: string) {
  /* ... */
}

setLanguage('JavaScript') // OK

let language = 'JavaScript'
setLanguage(language) // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAZwKZQDIEMwHMRa6oAUANjvoagFwpQBOMeAlIgN6ID0AVIgHQDE3TogC+AKHFpMFAkWIByAFJYAblgDKERgAcoC5gG5EXEQHkA0pNLpE5PHNSIAvImVrN2mHoWGp6bAcqMlkqIxNOcysgA)

但如果你认真采纳了第 35 条建议，用更精确的字符串字面量联合类型来替代普通的 `string` 类型，比如这样：

```ts
type Language = 'JavaScript' | 'TypeScript' | 'Python'
function setLanguage(language: Language) {
  /* ... */
}

setLanguage('JavaScript') // OK

let language = 'JavaScript'
setLanguage(language)
//          ~~~~~~~~ Argument of type 'string' is not assignable
//                   to parameter of type 'Language'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAMghgOwOYFc5OgXigcgFJwBucAygMYBOAlmMDlAD64Aq4E51t9TOACiMAAWAewQ4A3ACgAZigRlgVUVADOEYPGRoMACgA2iVOggAuWIe0QAlFADeUAPQAqKADp3UJw6gBfSZLUNC2MdfCJSSho6K3EoR28AeQBpfz11KAMtYyhsMOIOKIkA9U0jXUyy6ykHbzi6+oA-JuamqABBClQAWwgEYChhaShQSFwVYGpkeioVKARhfrgVFSokBDgAIzTJGvq9-frgYSgwOAo4HuAICgGhkegcUsscSSA)

出了什么问题？在内联形式中，TypeScript 从函数声明中就知道参数应该是 Language 类型。字符串字面量 'JavaScript' 可以赋值给这个类型，所以没问题。但当你把它抽取成变量时，TypeScript 必须在赋值时推断变量的类型。它会用常规算法（见第 20 条）推断出 string 类型，而 string 不能赋值给 Language 类型，因此报错。

> [!NOTE]
> 有些语言可以根据变量的最终用途来推断类型，但这也可能让人困惑。TypeScript 的创造者 Anders Hejlsberg 把这种现象称为“远距离的幽灵行动”。大多数情况下，TypeScript 会在变量第一次出现时确定它的类型。想了解此规则的一个显著例外，请参见第 25 条。

解决这个问题有两种好方法。其中一种是用类型注解来限制 language 变量的可能取值：

```ts
let language: Language = 'JavaScript'
setLanguage(language) // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAMghgOwOYFc5OgXigcgFJwBucAygMYBOAlmMDlAD64Aq4E51t9TOACiMAAWAewQ4A3ACgAZigRlgVUVADOEYPGRoMACgA2iVOggAuWIe0QAlFADeUAPQAqKADp3UJw6gBfSXvUoAy1jM00jDChsfCJSSho6KTUNC2N9VIwrcShHbwB5AGlJIA)

这还有一个好处：如果 language 写错了，比如写成 'Typescript'（应该是大写的“S”），它会报错提醒你。

另一种解决方案是把变量声明为常量：

```ts
const language = 'JavaScript'
//    ^? const language: "JavaScript"
setLanguage(language) // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAMghgOwOYFc5OgXigcgFJwBucAygMYBOAlmMDlAD64Aq4E51t9TOACiMAAWAewQ4A3ACgAZigRlgVUVADOEYPGRoMACgA2iVOggAuWIe0QAlFADeUAPQAqKADp3UJw6gBfSWVEVYCgDLWMobHwiUkoaOikHbyhkgD0AfigAhCCQi2MzACICYg44gsk1DTzdUKMMK3FkxKgAeQBpSSA)

用 const 表示这个变量不会变，所以 TypeScript 能推断出更精确的类型——字符串字面量类型 "JavaScript"。这个类型是可以赋值给 Language 的，所以代码能通过类型检查。当然，如果你需要重新赋值，就必须用类型注解了。

这里的根本问题是，我们把值和它被使用的上下文分开了。有时候这样没问题，但很多时候会出错。接下来会讲几个因失去上下文导致错误的例子，并教你怎么修复。

### 元组类型（Tuple Types）

除了字符串字面量类型，元组类型也会有类似问题。比如你在写一个地图的程序，可以用代码控制地图平移：

```ts
// Parameter is a (latitude, longitude) pair.
function panTo(where: [number, number]) {
  /* ... */
}

panTo([10, 20]) // OK

const loc = [10, 20]
//    ^? const loc: number[]
panTo(loc)
//    ~~~ Argument of type 'number[]' is not assignable to
//        parameter of type '[number, number]'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAMghgOwOYFc5OgXigcgFJwBucAygMYBOAlmMDlAD64Aq4E51t9TOACiMAAWAewQ4A3ACgAZigRlgVUVADOEYPGRoMACgA2iVOggAuWIe0QAlFADeUAPQAqKADp3UJw6gBfSQ+9eOAo4AFt1CAooKhUoOCh9OEVgFAATCAAaKD1RJCoU9JswOCoKVxk5BSUEKGKEZmEdAHdBSNMoAG0EFFCAI0is7r7IgF0be2c3Dy9fSUk6hp0OgEYABiyAJlWx8ShHbwB5AGk5slEVYGzhMihsFfWoLZGpAL29gD0AfigzhAurshmIb9CgdEbzRCLHJkKwvbxvAB+SKgAEEKKhwghLsJpFBQJBcMDImD6DEoAhhJc4CoVFQkAg4L09NBgMJ-PC3m9iiFwsBIlAcXi2Lguj0QYMxaMcJIgA)

和之前一样，你把值和上下文分开了。`[10, 20]` 直接用时符合元组类型 `[number, number]`。但是 `loc` 被推断成了 `number[]`，也就是长度不确定的数字数组，这就不能赋值给严格长度的元组。

怎么解决呢？你已经用了 const，不能再用它了，但可以加类型注解告诉 TypeScript 你具体想要什么：

```ts
const loc: [number, number] = [10, 20]
panTo(loc) // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAMghgOwOYFc5OgXigcgFJwBucAygMYBOAlmMDlAD64Aq4E51t9TOACiMAAWAewQ4A3ACgAZigRlgVUVADOEYPGRoMACgA2iVOggAuWIe0QAlFADeUAPQAqKADp3UJw6gBfSQ+9eOAo4AFt1CAooKhUoOCh9OEVgFAATCAAaKD1RJCoU9JswOCoKVxk5BSUEKGKEZmEdAHdBSNMoAG0EFFCAI0is7r7IgF0be2c3Dy9fSTJRFWBs4TIzLp7+ikGN0ahsDoBGAAYsgCYjkak6hv0Vq3EoR28AeQBpSSA)

另一种方法是用“const 上下文”告诉 TypeScript 你想让这个值是深度不可变的，而不仅仅是浅层 const：

```ts
const loc = [10, 20] as const
//    ^? const loc: readonly [10, 20]
panTo(loc)
//    ~~~ The type 'readonly [10, 20]' is 'readonly'
//        and cannot be assigned to the mutable type '[number, number]'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAMghgOwOYFc5OgXigcgFJwBucAygMYBOAlmMDlAD64Aq4E51t9TOACiMAAWAewQ4A3ACgAZigRlgVUVADOEYPGRoMACgA2iVOggAuWIe0QAlFADeUAPQAqKADp3UJw6gBfSQ+9eOAo4AFt1CAooKhUoOCh9OEVgFAATCAAaKD1RJCoU9JswOCoKVxk5BSUEKGKEZmEdAHdBSNMoAG0EFFCAI0is7r7IgF0be2c3Dy9fSTJRFWBs4TIobA6ARgAGLIAmLZG42PmERakAqEuoAD0AfigTxeWyMwoIOFTRPRBO7b2DyR1Br6FZWc7eK4AP2hUGYrSgoEguDeHy+P02Oyg+xG9BiyPenwQ3xw-ghVyuiFSD0QCGES36RxUVCQCAgVOAwgR8NCKGAcF6emgiOgOC6PX6FEG4tGJKAA)

这时 `loc` 的类型是 `readonly [10, 20]`，比之前更精确了。但这个类型是只读的，而 `panTo` 函数的参数是可变的，所以不能赋值过去。

最好的办法是给 `panTo` 函数加个 `readonly` 注解：

```ts
function panTo(where: readonly [number, number]) {
  /* ... */
}
const loc = [10, 20] as const
panTo(loc) // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwIZgCpwBQHcAWApgE6EBcipqAJggDYCeiA2mCALYBGJANIm1xIBdAJSIA3ogD0AKkQA6RYhlTEAXwBQEBAGcoiOnAiIAvCwCMABj4AmS0MSodibWD0BuDWkw5DEEe6I0qoA8gDSGkA)

如果你没法改 `panTo` 的定义，那就只能用类型注解了。（第 14 条讲了 readonly 和类型安全的更多内容。）

使用 `const` 上下文能解决推断丢失上下文的问题，但有个缺点：如果你定义错了（比如给元组多加了一个元素），错误不会在定义处报，而是在调用处报，可能很难发现：

```ts
const loc = [10, 20, 30] as const // error is really here.
panTo(loc)
//    ~~~ Argument of type 'readonly [10, 20, 30]' is not assignable to
//        parameter of type 'readonly [number, number]'
//          Source has 3 element(s) but target allows only 2.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwIZgCpwBQHcAWApgE6EBcipqAJggDYCeiA2mCALYBGJANIm1xIBdAJSIA3ogD0AKkQA6RYhlTEAXwBQEBAGcoiOnAiIAvCwCMABj4Ama4gDMloYlQ7E2sHoDciaapJiOGJEGHcqOkZEIlJ5DTRMHEMIEW8NKVU-RAA-XMQAQWIAcw5CMH04YEQoBmRCRAByKlowKOYrW3snIQbQ9zA4fTcdGCKwVE46eqg4dMysrLRiVHZCKBJESura+qbCGnomVg5uYj4BU565hZvEAGU4EGIIevw3R0RCKdXy7B0xTggfRQVDFNauSJwXDuQ6IGxxIA)

因此，最好还是用内联形式或者加类型声明。

### 对象类型

把值和上下文分开也会在对象里出错，特别是对象里有字符串字面量或元组时。例如：

```ts
type Language = 'JavaScript' | 'TypeScript' | 'Python'
interface GovernedLanguage {
  language: Language
  organization: string
}

function complain(language: GovernedLanguage) {
  /* ... */
}

complain({ language: 'TypeScript', organization: 'Microsoft' }) // OK

const ts = {
  language: 'TypeScript',
  organization: 'Microsoft',
}
complain(ts)
//       ~~ Argument of type '{ language: string; organization: string; }'
//            is not assignable to parameter of type 'GovernedLanguage'
//          Types of property 'language' are incompatible
//            Type 'string' is not assignable to type 'Language'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAMghgOwOYFc5OgXigcgFJwBucAygMYBOAlmMDlAD64Aq4E51t9TOACiMAAWAewQ4A3ACgqCYBAoAzOGWgBxYYXkIIAE3jI0GKAG9JUKABtEqdBABcsa4YhTzwikkRUAXnGBVRBwBnYGpkKQBfSUkFFAQyf1EoMmEAWzArGQAKKwNbB3VNCm09J1sAShMoAHoAKigAOiaoWuqoKMkU9MyELONLMowHHFZIDho6ABood08EHz8AhGGAWSpKYSDhBTp28vFzaraAeQBpaJSEEKhgIKhsU3NcmyGWNnGuSbMZjy9fROWuDWGy2OxwXwiUi6GTg2Vu+0kR3MyPMAD9UVAAIIeFCpCCyGYKG5sXD9Z7OYKhGRIA6zP6LQJQEJhGntHCItoornmKh3BDCYBQOBBIJUJAIOAAIws0GAwigYDgFDgeLkFEJxMguEKWl0+heEHZSO5yNGEDu2wVFGEkAooFw5Ns9CV0Bk0MW0ogHJNXLNuGZ1PovKg-MFwtF4qlMpu8tAWpw+uc7KAA)

这里 `ts.language` 被推断成了 string 类型，而不是具体的 Language 类型。解决办法同样是加类型注解：

```ts
const ts: GovernedLanguage = {
  language: 'TypeScript',
  organization: 'Microsoft',
}
```

或者用 `as const` 断言，或者用 `satisfies` 操作符（见第 20 条）。

### 回调函数

当你把回调函数作为参数传给别的函数时，TypeScript 会用上下文推断回调的参数类型：

```ts
function callWithRandomNumbers(fn: (n1: number, n2: number) => void) {
  fn(Math.random(), Math.random())
}

callWithRandomNumbers((a, b) => {
  //                   ^? (parameter) a: number
  console.log(a + b)
  //              ^? (parameter) b: number
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABBAhgGzQdRlAFgJRTABM4BbAORDICMBTAJwGcAKYMALkRbAEYuw1egwA0iMACYBQxgEpEAXgB8iAG5wYxeQG8AUIkTsWAWRR4AdAyKkyLWWNMWrJcndkBuXQF9du1Bmw8QhdKGWYWFhQxGnllRD0DAHpEg1S09PSAPQB+bgAHFCsyOig5RBRpWkZ9ZAQmODQ6czQ4AHNIxABqRBjPJJSMwZz8wpRi0oZ5Gkrhbw9dIA)

但如果你把回调单独提出来，失去上下文，TypeScript 就推断不出来，会报 noImplicitAny 错误：

```ts
const fn = (a, b) => {
  //        ~    Parameter 'a' implicitly has an 'any' type
  //           ~ Parameter 'b' implicitly has an 'any' type
  console.log(a + b)
}
callWithRandomNumbers(fn)
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABBAhgGzQdRlAFgJRTABM4BbAORDICMBTAJwGcAKYMALkRbAEYuw1egwA0iMACYBQxgEpEAXgB8iAG5wYxeQG8AUIkTsWAWRR4AdAyKkyLWWNMWrJcndkBuXQF9dEBEyhDJAVuFDEaeWVEPQMAeliDRMSAPySABRQrMjooRkQAchR8xBgyAAc0GAgcNABPRFwUJkQiAqJa4qhasrp9RHikwYNUjKycvPyaYtKKqpr6xubWwrAOxC6evr8wJjg0OnM0OABzFhREAGpECM8fVAxsPEIXShlmNjAPXSA)

解决办法是给参数加类型注解：

```ts
const fn = (a: number, b: number) => {
  console.log(a + b)
}
callWithRandomNumbers(fn)
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABBAhgGzQdRlAFgJRTABM4BbAORDICMBTAJwGcAKYMALkRbAEYuw1egwA0iMACYBQxgEpEAXgB8iAG5wYxeQG8AUIkTsWAWRR4AdAyKkyLWWNMWrJcndkBuXQF9dEBEyhDJAVuFGlaRjEacOF5ZUQ9Az8wJjg0OnM0OABzFhREAGpEGg9vX3QsHAJrcioI5jYwUqA)

或者给整个函数表达式加类型声明（见第 12 条）。如果函数只用一次，推荐用内联写法，省去额外注解。

## 关键点总结

- 了解上下文如何在类型推断中被使用。
- 如果提取变量时引入了类型错误，可以考虑添加类型注解。
- 如果变量确实是常量，使用 `const` 断言（`as const`）。但要注意，这可能会导致错误在使用时而非定义时出现。
- 在可行的情况下，优先内联值，以减少对类型注解的需求。

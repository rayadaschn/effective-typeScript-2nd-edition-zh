# 第 40 条：宁愿类型不够精确，也不要类型不准确

## 要点

- 别掉进“类型安全陷阱”：复杂但不准确的类型，往往比简单但不够精确的类型更麻烦。如果你没法准确描述类型，就别乱写，直接用 `any` 或 `unknown` 表示不确定的部分。
- 细化类型的时候，要注意报错提示和自动补全功能，不只是对错，开发体验也很重要。
- 类型越复杂，测试用例也要跟着增加，才能保证类型没问题。

## 正文

在写类型声明时，你经常会面临一个选择：是写得更“精确”，还是宽松一点。一般来说，类型越精确越好，这样可以帮助使用者发现 bug，同时也能更好地利用 TypeScript 的类型提示和检查能力。

但注意：精确不等于正确。在追求“类型精度”的过程中，很容易犯错。一旦类型声明不准确，它可能比“没有类型”还要糟糕，因为它会让你对代码产生错误的安全感。

举个例子，你正在为 GeoJSON 写类型声明（参考第 33 条）。GeoJSON 是一种地理数据格式，它的几何对象可以有几种不同的类型，每种类型的坐标数组结构也不一样：

```ts
interface Point {
  type: 'Point'
  coordinates: number[]
}
interface LineString {
  type: 'LineString'
  coordinates: number[][]
}
interface Polygon {
  type: 'Polygon'
  coordinates: number[][][]
}
type Geometry = Point | LineString | Polygon // Also several others
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgAoHtRmQbwFDLJgCeADhAFzIDkGW1A3AcguulACahyQDOVIAK4BbAEbQA2gF0mAXzxZo8JMgAyoCAGUwUUAHNczEuSrV1ILTv2NmrdlxA8I-ZELGSp0uQvBLEKDAAbYj10EENCY0oaIJCwm0I7Tm4+ARFxKGksmTx5KOQAcQh0YQgdYmQAXjRMcGQAHzUNbV0QA0bY0JAGQgB6XuQAQUDedGReCAA3aDhA5HQwAAtoXjwgA)

这没问题，但用 `number[]` 表示坐标有点不够精确。其实这表示的是纬度和经度，所以用元组类型可能更合适：

```ts
type GeoPosition = [number, number]
interface Point {
  type: 'Point'
  coordinates: GeoPosition
}
// Etc.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBA4hD2AFeBnAlsN8B2UC8UA2tgK4C2ARhAE4A0UplNAugNwBQa2wNAZgIYBjaMi7AoAb3ZQooSAC4oAclHclHGYPjxqAEy78eKRXCSoMWbBwC+7APR2oAUWCCAdOyA)

你把这些更精确的类型发布到了全世界，等待大家的称赞。不幸的是，有用户抱怨你这些新类型把一切都搞坏了。虽然你一直只用到了纬度和经度，但在 GeoJSON 中，一个位置是可以包含第三个元素的，比如海拔，甚至还有更多。你本来是想让类型声明更精确，结果却过犹不及，反而让类型变得不准确了！

现在，如果用户还想继续使用你写的类型声明，就得用类型断言，或者直接用 `as any` 来让类型检查器闭嘴。也许他们干脆就放弃了，转而自己去写类型声明。

再举个例子，假设你要为一个用 JSON 定义的类 Lisp 语言写类型声明：

```json
12
"red"
["+", 1, 2]            // 结果是 3
["/", 20, 2]           // 结果是 10
["case", [">", 20, 10], "red", "blue"]  // 结果是 "red"
["rgb", 255, 0, 127]   // 结果是 "#FF007F"
```

Mapbox 这个库就用了类似的结构，来决定地图元素在不同设备上的样式。

对于这种结构，你可以选择不同程度的类型精度：

1. 什么都允许。
2. 允许字符串、数字和数组。
3. 只允许以已知函数名开头的数组。
4. 确保每个函数接收正确数量的参数。
5. 确保每个函数接收正确类型的参数。

前两个选项是比较简单的：

```ts
type Expression1 = any
type Expression2 = number | string | any[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAogHmAThAziglgewHYEYoC8UAhtiANwBQoksCyaW2ATIVNgK4C2ARhIlAA+UFMETpsAcyEkyAbQC6VIA)

如果一个类型系统能够允许所有合法的程序，我们就说它是“完备”的。这两种类型能涵盖所有合法的 Mapbox 表达式，不会出现误报错误。

但因为类型定义太简单，也会有很多漏报：那些无效的表达式不会被发现。换句话说，这些类型的精确度不高。

接下来我们试着在不丢失完备性的情况下，提高类型的精确度。为了防止出现回归问题，我们应该准备一套测试用例，包括合法和不合法的表达式。（第 55 条专门讲了类型测试相关内容。）

```ts
const okExpressions: Expression2[] = [
  10,
  'red',
  ['+', 10, 5],
  ['rgb', 255, 128, 64],
  ['case', ['>', 20, 10], 'red', 'blue'],
]
const invalidExpressions: Expression2[] = [
  true,
  // ~~~ Type 'boolean' is not assignable to type 'Expression2'
  ['**', 2, 31], // Should be an error: no "**" function
  ['rgb', 255, 0, 127, 0], // Should be an error: too many values
  ['case', ['>', 20, 10], 'red', 'blue', 'green'], // (Too many values)
]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAogHmAThAziglgewHYEYoC8UAhtiANwBQoksCyaW2ATIVNgK4C2ARhIlAA+UFMETpsAcyEkyAbQC6VAMY5RUTAGt4SVBjUAuOrsY5mitnMpQouAAwAaa1ABEyACYunNuS4DUXraOUACsCt5QvoiSPIHMISEOtswAHEkAbAAs4c6+ysQoEIG+AHxxwfbhrh6BLjwANhxFOUqUqtjqEgBuxPXo7joM+h1Gg3pM5gqWzmJNTgD081AAfqtQACrg0ADkPJiY9RCk21DoKOyYwCSMktjEDdDAmFA0O2OmLNu5LgBUP3FJADMuCqUEWUAAygALTAceruKB8WRQfiITCIIzYZ6-f5QABmHGwymATG+0ViSXiiSgFWYAHYknZQeDobD4YjoKQUYg0RiXvsoFxSCAoD1GqhvvlCsUXGVKRUmUk3BBPEqGk1apJkBBsC5mUsABTrAVCsii3pNFAASkorSAA)

想要提升精确度，可以用字符串字面量类型的联合，作为元组的第一个元素：

```ts
type FnName = '+' | '-' | '*' | '/' | '>' | '<' | 'case' | 'rgb'
type CallExpression = [FnName, ...any[]]
type Expression3 = number | string | CallExpression

const okExpressions: Expression3[] = [
  10,
  'red',
  ['+', 10, 5],
  ['rgb', 255, 128, 64],
  ['case', ['>', 20, 10], 'red', 'blue'],
]
const invalidExpressions: Expression3[] = [
  true,
  // Error: Type 'boolean' is not assignable to type 'Expression3'
  ['**', 2, 31],
  // ~~ Type '"**"' is not assignable to type 'FnName'
  ['rgb', 255, 0, 127, 0], // Should be an error: too many values
  ['case', ['>', 20, 10], 'red', 'blue', 'green'], // (Too many values)
]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAogHmAThAziglgewHYEYoC8UAhtiANwBQoksCyaW2ATIVNgK4C2ARhIlAA+UFMETpsAcyEkyAbQC6VGtABi2AHLEu0IgHIA1Hpl6AtMeF6AVBah6A9Lb0A+JwB4nAY2IoITxJI8esrg0ADCxAA2kfBIqBg4bHLqWjoANFAAdNmkIIpK1KF0cYw4AMxsnLz8MqLiUjIR0bEMCdhUlJ44olCYANYt8UwoAFzFrUxlikmUUFC4AAxps1AARMgAJqvLc3KrBtvzS1AArAo7UHsBPIfMJycZuMwAHBkAbAAs5yt73r6He2ct2Oi3Oa02h1WPEiHAgq2+BS62B6EgAblF0BtBqVkWNsW0pgoZnMxLCLvZ7LBEIhMIgxgAVIp6HiYTCRCCkYzoFDsTDAEiMSTYYjQ6DATBQFR2fGTPQ-VZWKy3DJlXDfOYUqAAPy1UEZtD0CqVXJ52D5AowQpF7MlEqlehS2j88uut3uGRBzAA7B6wVBNQBlAAWmA4kQ2UD4sig-BpdNtEq4uSg6JhqHlfzhGUBwMeCzB6wgWwyULTkMkyAg2HhGX9lIAFPTWVAk2QU1FYSgAJSUApAA)

出现了一个新捕获的错误，但没有引入回归，效果不错！不过有个问题是，类型声明和 Mapbox 版本绑定得更紧密了。如果 Mapbox 新增了函数，类型声明也得跟着更新。这些类型虽然更精确，但维护成本也更高。

如果你想确保每个函数都接收到正确数量的参数，事情就更复杂了。因为类型现在需要递归地检查所有函数调用。TypeScript 支持递归类型，但我们需要小心，确保类型检查器不会认为递归是无限的。有几种方法可以做到这一点，比如用接口（interface）来定义 `CaseCall`（它必须是偶数长度的数组），而不是用类型别名（type）。

虽然有点复杂，但这是可行的：

```ts
type Expression4 = number | string | CallExpression

type CallExpression = MathCall | CaseCall | RGBCall

type MathCall = ['+' | '-' | '/' | '*' | '>' | '<', Expression4, Expression4]

interface CaseCall {
  0: 'case'
  [n: number]: Expression4
  length: 4 | 6 | 8 | 10 | 12 | 14 | 16 // etc.
}

type RGBCall = ['rgb', Expression4, Expression4, Expression4]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAogHmAThAziglgewHYEYoC8UAhtiANwBQoksCyaW2ATIVNgK4C2ARhIlAA+UFMETpsAcyEkyAbQC6VGtHhJUGHABY2nXvxmjxUmQGFiAGwtqGm7FWrho5qzY1M2AWWLAAFi4szYhQIAJkAJQBxACEAhxUobz8wojlKKCgAcgBqTJlMgFo84UyAemKsgCoKzIA+GoAeTIAadLp1Rm1WjLdO7C1WpUpKCWB+ADNiAGNnYNDLQIBvNoAGAC4sqbnMqgy5bA29PkQFDd67LV2oCwgpPw2dYQA2GQAOGVwVj9ZhXEeoXBPchQUqlKAQYBTAB0lAAvsMElFYgs2HJMohJDwWu1bEwBjj3F0CX0tEMgA)

我们来看看效果如何：

```ts
const okExpressions: Expression4[] = [
  10,
  'red',
  ['+', 10, 5],
  ['rgb', 255, 128, 64],
  ['case', ['>', 20, 10], 'red', 'blue'],
]
const invalidExpressions: Expression4[] = [
  true,
  // ~~~ Type 'boolean' is not assignable to type 'Expression4'
  ['**', 2, 31],
  // ~~~~ Type '"**"' is not assignable to type '"+" | "-" | "/" | ...
  ['rgb', 255, 0, 127, 0],
  //                   ~ Type 'number' is not assignable to type 'undefined'.
  ['case', ['>', 20, 10], 'red', 'blue', 'green'],
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Types of property 'length' are incompatible.
  //    Type '5' is not assignable to type '4 | 6 | 8 | 10 | 12 | 14 | 16'.
]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAogHmAThAziglgewHYEYoC8UAhtiANwBQoksCyaW2ATIVNgK4C2ARhIlAA+UFMETpsAcyEkyAbQC6VGtHhJUGHABY2nXvxmjxUmQGFiAGwtqGm7FWrho5qzY1M2AWWLAAFi4szYhQIAJkAJQBxACEAhxUobz8wojlKKCgAcgBqTJlMgFo84UyAemKsgCoKzIA+GoAeTIAadLp1Rm1WjLdO7C1WpUpKCWB+ADNiAGNnYNDLQIBvNoAGAC4sqbnMqgy5bA29PkQFDd67LV2oCwgpPw2dYQA2GQAOGVwVj9ZhXEeoXBPchQUqlKAQYBTAB0lAAvsMElFYgs2HJMohJDwWu1bEwBjj3F0CX0tEMpjhRFBMABrc5MFBneiE-qKVFtT7dKAAImQABMuZy5FzsgKAStmlAAKwKQU8zGi5iSyUS3DMV4Sp6k2VbEKioW1BXisUy7l80VcngWDgQLkyyhkinAKASABulnQvLpFMZHQurNSbTE1taoKgAD8I1AACpOLI8TCYG6kPLoFDsTBO4IYSTYYiW6DATBQBKZL39TJtIWVSoKiUAZlwdtDEcjMdomS51a5KbT2AzJEYObzN2LRZLwq5Mi5BUnwi5pVnUChy8rcp4CqVEqNqoA7Fu7RlQxljyfTyew9HY5kjvwe+nM4Pc-nR8WrxxsLyIOMJBBeZkYXsXI6jaEr6oaKorCaPK-ualrWuakjILctqcs2LboRhmFYdhOFhm0oZtqgVLjFASCYJAiCgFkNx3L4eTEMgzrYOSXBgD46D5gBIJgsehFZJKd59g+2ZPiOhavu2-wvMI7y-F8vw-AC-yAv+9pUEAA)

现在所有无效的表达式都会报错了。有趣的是，你可以用 TypeScript 的接口来表示“偶数长度的数组”这样的结构。但有些错误信息有点让人困惑，特别是关于类型 '5' 的那个。

相比之前不太精确的类型，这算是进步吗？能捕捉到更多错误用法当然是好事，但如果错误提示难以理解，也会让类型使用起来更麻烦。正如第 6 条所说，语言服务（比如错误提示和自动补全）是 TypeScript 体验的重要部分，所以查看类型声明带来的错误信息，并测试自动补全功能，是很有必要的。如果你的新类型虽然更精确，却影响了自动补全体验，那开发起来就不太愉快了。

此外，这种复杂的类型声明也增加了引入 bug 的风险。比如，Expression4 要求所有数学运算符都只能接受两个参数，但 Mapbox 的规范里 + 和 \* 是可以接受多个参数的；还有 - 运算符可以只带一个参数，这时它表示取反。Expression4 会错误地把这些都标记为错误：

```ts
const moreOkExpressions: Expression4[] = [
  ['-', 12],
  // ~~~~~~ Type '["-", number]' is not assignable to type 'MathCall'.
  //          Source has 2 element(s) but target requires 3.
  ['+', 1, 2, 3],
  //          ~ Type 'number' is not assignable to type 'undefined'.
  ['*', 2, 3, 4],
  //          ~ Type 'number' is not assignable to type 'undefined'.
]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAogHmAThAziglgewHYEYoC8UAhtiANwBQoksCyaW2ATIVNgK4C2ARhIlAA+UFMETpsAcyEkyAbQC6VGtHhJUGHABY2nXvxmjxUmQGFiAGwtqGm7FWrho5qzY1M2AWWLAAFi4szYhQIAJkAJQBxACEAhxUobz8wojlKKCgAcgBqTJlMgFo84UyAemKsgCoKzIA+GoAeTIAadLp1Rm1WjLdO7C1WpUpKCWB+ADNiAGNnYNDLQIBvNoAGAC4sqbnMqgy5bA29PkQFDd67LV2oCwgpPw2dYQA2GQAOGVwVj9ZhXEeoXBPchQUqlKAQYBTAB0lAAvsMElFYgs2HJMohJDwWu1bEwBjj3F0CX0tEMpjhRFAuJhkAB5ADW5yYKDO9EJ-UUqLaaKKzQBzAU3RBYIAfmLxVAACpOLJyABEBTlfKO-AUeXQKHYmGAJEYkmwxB4NygwEwJplmSS-gWmRhGVBGUdTqgAGVMBxEDMoL5glBWBAblxbsAABQoACUUB4HB1wGIGIhUGQAEcOOgGFAAMx2qBo3J83B85h8zOCtoO51OkVSi0qxDqzXYbW6jD6w3G03m2iZDjYAAmEHGEggfdt3My1SLJb5pKFFcrGWr0u7dYbWp1wVbBqN0E7CR7-cHw9HMKGQA)

我们在追求更精确时，又一次走得太远，反而变得不准确了。这些不准确是可以修正的，但你需要扩大测试用例，确保没有遗漏其他问题。复杂的代码通常需要更多测试，类型系统也是如此。

在细化类型时，可以用“恐怖谷”这个比喻来理解。当一幅卡通画越来越逼真时，我们会觉得它更接近真实，但只有到某个程度。如果过于追求逼真，反而会让我们更在意剩下的那些细微错误。

同样道理，改进像 `any` 这样非常模糊的类型几乎总是有益的，你和你的同事会觉得类型安全和开发效率得到了提升。但当类型越来越精确时，人们也会期望它们更准确。你会开始信任类型能捕捉大部分错误，这时任何不准确都会变得非常明显。如果你花几个小时追查一个类型错误，最后发现是类型本身不准确，那就会动摇你对类型声明乃至 TypeScript 的信心，甚至影响你的工作效率！

## 关键点总结

- 别掉进“类型安全陷阱”：复杂但不准确的类型，往往比简单但不够精确的类型更麻烦。如果你没法准确描述类型，就别乱写，直接用 `any` 或 `unknown` 表示不确定的部分。
- 细化类型的时候，要注意报错提示和自动补全功能，不只是对错，开发体验也很重要。
- 类型越复杂，测试用例也要跟着增加，才能保证类型没问题。

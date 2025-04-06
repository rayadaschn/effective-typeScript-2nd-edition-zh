# 第 7 条：把类型看作值的集合

## 要点

- 将类型看作值的集合（即类型的范围）。这些集合可以是有限的（例如 `boolean` 或字面量类型），也可以是无限的（例如 `number` |`string`）。
- TypeScript 的类型是相交集合（可以用维恩图表示），而不是严格的层次结构。两个类型可以有重叠部分，但互相并不是子类型。
- 即使一个对象有额外的属性，而这些属性没有在类型声明中提到，它仍然可以属于该类型。
- 类型操作适用于集合的范围。例如，`A | B` 的范围是 `A` 和 `B` 的并集。
- 将 `extends`、"assignable to" 和 "subtype of" 理解为 "子集" 的同义词。

## 正文

在运行时，每个变量都会从 JavaScript 的数值类型中选择一个具体的值。这些可能的值包括：

- `42`
- `null`
- `undefined`
- `'Canada'`
- `{animal: 'Whale', weight_lbs: 40_000}`
- `/regex/`
- `new HTMLButtonElement`
- `(x, y) => x + y`

在代码运行之前，当 TypeScript 在检查错误时，变量只有一个类型。可以将类型理解为一组可能的值，这个集合称为**类型的取值范围（domain）**。例如，`number` 类型可以看作是所有数值的集合，其中 `42` 和 `-37.25` 属于这个集合，而 `'Canada'` 不属于。具体来说，`null` 和 `undefined` 是否属于该集合，取决于 `strictNullChecks` 选项的设置。

> 在 TypeScript 的文档或相关资料中，你不会经常看到“domain”（取值范围）这个术语，甚至在本书的其他部分也很少出现。通常，我们会把类型与其对应的值集合视为同一回事。但在本节中，我们需要一个专门的术语来指代某个类型对应的值集合，而不是类型本身，因此这里会使用“domain”来表示这一概念。

最小的集合是空集，它不包含任何值。在 TypeScript 中，它对应的是 `never` 类型。由于它的“domain”（取值范围）是空的，因此没有任何值可以赋给 `never` 类型的变量：

```ts
const x: never = 12
//    ~ Type 'number' is not assignable to type 'never'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAHgLhmApgNxQJxgXhgRgCYBuAKAHpyZqYA-GAFQE8AHFGAcjAFcBbAIywcYASwjIQsAIYQIIgOZgp-ADbsoIGFFbsu6IQDpSQA)

由于`never`位于类型层级的最底层，它有时被称为"底部类型"。

再往上的最小集合是仅包含单个值的集合，在 TypeScript 中，它们对应于字面量类型。（在其他语言中，这类类型有时被称为“单元类型”（unit types）。）

```ts
type A = 'A'
type B = 'B'
type Twelve = 12
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAglC8UDkMkG4BQpJQEIOV3S3GgBUB3CAGwDdpEBGAJkyA)

要创建具有两个或三个值的类型，可以使用字面量类型联合：

```ts
type AB = 'A' | 'B'
type AB12 = 'A' | 'B' | 12
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAggQlAvFA5DFUA+q4oNwBQokscAjAExKrpY4baWFA)

联合类型的“domain”（取值范围）是其组成类型“domain”（取值范围）的并集，如图所示。这正是"联合类型"中"联合"一词的含义。

![Values and types as sets of values. e boxes are values ("A", "B", 12) and
the rounded shapes are types (A, B, AB, AB12, Twelve), which include a set of values. One
type is assignable to another if it’s entirely contained within it.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202503272316946.png)

“assignable”（可赋值）这个词在 TypeScript 的错误信息中经常出现。在值集合的上下文中，它的含义可以是：

- 对于值和类型的关系，表示“属于”（member of）。
- 对于两个类型的关系，表示“子集”（subset of）。

```ts
const a: AB = 'A' // OK, value 'A' is a member of the set {'A', 'B'}
const c: AB = 'C'
//    ~ Type '"C"' is not assignable to type 'AB'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAggQlAvFA5DFUA+q4oNwBQokscAjAExKrpY4baWEDGA9gHYDOwUAhgFylqafFCgB6cVADyAaQA0UAG68ANgFdoIqAEtOfKAFsIhgEYQATlFYAzKMAAW0ThB4BvEYpS4AvgTZcPMyC8MIAwvgEkmJiAH5QACrgWgBEYSkYelDsrDy8nJw6AObsvKaq0MCs9sk0uARAA)

类型 `"C"` 是一个字面量类型，它的“domain”（取值范围）只包含单个值 `"C"`。这个“domain”（取值范围）并不是类型 `"AB"`（包含 `"A"` 和 `"B"` 这两个值）的子集，所以会报错。归根结底，TypeScript 的类型检查器本质上就是在判断一个集合是否是另一个集合的子集。

```ts
// OK, {"A", "B"} is a subset of {"A", "B"}:
const ab: AB = Math.random() < 0.5 ? 'A' : 'B'
const ab12: AB12 = ab // OK, {"A", "B"} is a subset of {"A", "B", 12}

declare let twelve: AB12
const back: AB = twelve
//    ~~~~ Type 'AB12' is not assignable to type 'AB'
//           Type '12' is not assignable to type 'AB'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAggQlAvFA5DFUA+q4oNwBQokscAjAExKrpY4baWED0zUA8gNIA0UA3gCIYA3gLgCAvlACWAZygBDKLICuAI1kRgUAPYAzfkJFQxkgFwEAxjoB2s7QrVnS1ALILgACwB0AJwU2ACY6ALYAFACUUAA8UAAM3gCsUAD8NBjOKLiE1nYOapTO8JTUjnhQUKwcPIbCouJScorK6pra+rXGpryUEgQEgRCWADYKvtDDWlDAAO4QwwBuEEXkFDm29lBqCpYA1ivUs-NLLGwVUAB+VxdQACrg0GirGE02Og6ystIA5jaOk9MdNMHjRcAQqudIed7iQUJQXvI3h8vr9-tBgEDiI94CgCEA)

这些类型的集合相对容易推理，因为它们是有限的。你可以逐个比较元素。但在实践中使用的大多数类型具有无限“domain”（取值范围）。对它们的推理会更困难。你可以将它们视为通过列出其元素构建的。

```ts
type Int = 1 | 2 | 3 | 4 | 5 // | ...
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAkgdsKBeKBGKAfKAmTUDMeALHgKxQD0FeAdHQFBA)

或者可以通过描述其成员来构建：

```ts
interface Identified {
  id: string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgJIBMLmDYF3IDeAUMssOgFzIDOYUoA5gNzEC+xQA)

可以把这个接口理解为对其类型“domain”（取值范围）的描述：这个值是一个对象吗？它是否有一个 `id` 属性，并且该属性的值可以赋给 `string` 类型？如果是，那它就是 `Identified` 类型。

这就是它的全部含义。正如第 4 条所解释的，TypeScript 采用结构化类型系统，因此这个值还可以包含其他属性，甚至可以是一个可调用的对象！不过，在某些情况下，过多的额外属性检查（见第 11 条）可能会让这一点变得不那么明显。

将类型视为值的集合，有助于你更好地理解它们的操作方式。例如：

```ts
interface Person {
  name: string
}
interface Lifespan {
  birth: Date
  death?: Date
}
type PersonSpan = Person & Lifespan
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgJIBMLmDYF3IDeAUMssOgFzIDOYUoA5gNzEC+xoksiKACtBoB7EEVLIQcALYRqdBiBbtO4aPCTIAMjgg0ADnFEkyAI2BQwAC2oAROJFZlM9ywH5b9iKw5gAnnv5BEQBlA1EAXmQBKGFRADItHX1DViA)

`&` 运算符计算的是两个类型的交集。那么，什么样的值属于 `PersonSpan` 类型呢？乍一看，`Person` 和 `Lifespan` 接口没有共同的属性，因此你可能会认为它是一个空集合（即 `never` 类型）。但实际上，类型操作是作用于值的集合（即类型的“domain”），而不是接口中的属性。而且要记住，具有额外属性的值仍然属于某个类型。因此，一个同时拥有 `Person` 和 `Lifespan` 属性的值将属于交集类型。

```ts
const ps: PersonSpan = {
  name: 'Alan Turing',
  birth: new Date('1912/06/23'),
  death: new Date('1954/06/07'),
} // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgJIBMLmDYF3IDeAUMssOgFzIDOYUoA5gNzEC+xoksiKACtBoB7EEVLIQcALYRqdBiBbtO4aPCTIAMjgg0ADnFEkyAI2BQwAC2oAROJFZlM9ywH5b9iKw5gAnnv5BEQBlA1EAXmQBKGFRADItHX1DVgQROmQ9Gmpo2NDDZEjjCWlZZAByAEEAGwKAFQBXBUZygBpxMwtrCQgAd2Q7SAAKcoBGAE5RgCYAegAGADYZqYBmcoBKdqcIF2oQPoHPEYmAVgAWeaW5gHYN9rZmMhmZ5AB5AGliIA)

当然，一个值可以拥有比这三个属性更多的属性，但仍然属于该类型！一般规则是：交集类型中的值包含其组成部分中所有属性的联合。

关于属性交集的直觉是正确的，但这适用于两个接口的并集（union）而非它们的交集（intersection）。

```ts
type K = keyof (Person | Lifespan)
//   ^? type K = never
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgJIBMLmDYF3IDeAUMssOgFzIDOYUoA5gNzEC+xoksiKACtBoB7EEVLIQcALYRqdBiBbtO4aPCTIAMjgg0ADnFEkyAI2BQwAC2oAROJFZlM9ywH5b9iKw5gAnnv5BEQBlA1EAXmQBKGFRADItHX1DVj8A5ABpZEiAawhfIRhkAApo2OQAH0SYXTCASlYAekayZAA9V2Q0lCzIkAgAN2hiIA)

由于 TypeScript 无法确定联合类型中的值必定存在哪些键，因此该联合类型的 `keyof` 结果必然是空集（即 `never` 类型）。或者更正式地说：

```ts
// Disclaimer: these are relationships, not TypeScript code!
keyof (A&B) = (keyof A) | (keyof B)
keyof (A|B) = (keyof A) & (keyof B)
```

如果你能直观地理解为什么这些方程成立，那说明你对 TypeScript 类型系统的已经非常熟悉了。

当然更符合开发习惯的写法是使用 `extends` 来定义 `PersonSpan` 类型：

```ts
interface Person {
  name: string
}
interface PersonSpan extends Person {
  birth: Date
  death?: Date
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmA3AQL4GiSyIrpTYgAygAc4uCAA9IIACYY0mHPiLIARsChgAFtQAicSC2IyIBrQH49BiC3ZA)

把类型看作是值的集合，那么 `extends` 表示什么呢？就像 “assignable to” 一样，你可以把它理解为 “子集”。每个 `PersonSpan` 类型的值必须有一个 `name` 属性，它的值是一个字符串。同时，每个值还必须有一个 `birth` 属性，所以它是一个真正的子集。

虽然 `extends` 通常用于向接口添加字段，但任何匹配基础类型子集的值也可以。这让你能够建模更细致的类型关系：

```ts
interface NullyStudent {
  name: string
  ageYears: number | null
}
interface Student extends NullyStudent {
  ageYears: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgHIFcA2mCeBlMdAEwnGQG8AoZZEOAWwgC5kBnMKUAcwG5rk4XCAE0IcKKxYh09AEbRkAH1pZMfAL6VQkWIhQFipMMggAPSCCKs0q-IRJkqNQSLESpM+VA2UgA)

并不是每种语言都允许像这样修改 `ageYears` 的类型，但只要它能赋值给基础类型（`NullyStudent`）中的类型，TypeScript 是允许的。当你考虑这两个接口的“domain”时，这就有意义了。如果你试图扩展 `ageYears` 的类型，反而会得到一个错误：

```ts
interface StringyStudent extends NullyStudent {
  //      ~~~~~~~~~~~~~~
  // Interface 'StringyStudent' incorrectly extends interface 'NullyStudent'.
  ageYears: number | string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgHIFcA2mCeBlMdAEwnGQG8AoZZEOAWwgC5kBnMKUAcwG5rk4XCAE0IcKKxYh09AEbRkAH1pZMfAL6VQkWIhQFipMMggAPSCCKs0q-IRJkqNQSLESpM+VA1bw0eEjIBJwgXHaGZGYWVjbY4Q7GTsgA9Mk06cgAftk5ubn8qcgAkn66gQDkwdzxRuXIoAgA9lBQEAhguCbmpDHa-nrI5RhxBgnlAHT8LqLikipyCsrsIbyUmkA)

你可能会听到“子类型”这个术语。这是另一种说法，意味着一个类型的范围是另一个类型范围的子集。可以通过一维、二维和三维向量来理解：

```ts
interface Vector1D {
  x: number
}
interface Vector2D extends Vector1D {
  y: number
}
interface Vector3D extends Vector2D {
  z: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAjAEWQG9kAPALmRAFcBbAI2gG5kBfAKFElkRXUxwAmQhFKQQAEwDOaDNjyESAT0o0GzNp3DR4SWQKgBmEWIiSZ-ecOLIAXqrqMoLDkA)

你可以说 `Vector3D` 是 `Vector2D` 的子类型，而 `Vector2D` 又是 `Vector1D` 的子类型（在类的上下文中，你可以说它是“子类”）。这种关系通常以层级结构表示，但从值的集合角度来看，使用维恩图更合适。

![Two ways of thinking of type relationships: as a hierarchy or as overlapping sets.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202503272329611.png)

通过维恩图可以清楚地看到，即使不使用 `extends` 重写接口，子集/子类型/可赋值性关系依然保持不变。

```ts
interface Vector1D {
  x: number
}
interface Vector2D {
  x: number
  y: number
}
interface Vector3D {
  x: number
  y: number
  z: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAjAEWQG9kAPALmRAFcBbAI2gG5kBfAKFElkRXUxwAmQiQpU6jKCwCelGg2ZtO4aPCRoM2KAGYRZORMWzxCqcgBeB0yw5A)

集合没有改变，所以维恩图也没有改变。

虽然这两种解释对于对象类型都适用，但当你开始考虑字面量类型和联合类型时，集合的解释会变得更直观。

`extends` 关键字也可以出现在泛型类型的约束中，在这种情况下，它也表示“子集”。（第 15 条）

```ts
function getKey<K extends string>(val: any, key: K) {
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQNKoJ4B4OKoAeUqYAJgM6KVQBOMYyAfABQBuAhgDYBcinMNgA0iANY5+GAJSIA3gChEiAPQrEAOi0KAvgqA)

扩展 string 类型"意味着什么？如果你习惯于从对象继承的角度思考，这很难解释。你可以定义对象包装类型 `String` 的子类（参见第 10 条），但这似乎并不可取。

从集合的角度思考，任何“domain”（取值范围）是 string 子集的类型都适用。这包括字符串字面量类型、字符串字面量类型的联合类型、模板字面量类型（第 54 条）以及 string 类型本身：

```ts
getKey({}, 'x') // OK, 'x' extends string
getKey({}, Math.random() < 0.5 ? 'a' : 'b') // OK, 'a'|'b' extends string
getKey({}, document.title) // OK, string extends string
getKey({}, 12)
//         ~~ Type 'number' is not assignable to parameter of type 'string'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQNKoJ4B4OKoAeUqYAJgM6KVQBOMYyAfABQBuAhgDYBcinMNgA0iANY5+GAJSIA3gChEiAPQrEAOi0KAvgrSYcrOTtEByImekBuZWsQB5DOcuESZKjXqNk+9FmxjU0QAWU4oAAsNOkFyOABbVllcRAAGDQBWRAB+RDNOM0R+MwAjK1tVdSdzAoAfUsLiUgpqWgYmP0NAk1E4iBB4sigNWChuVBs7KucvduQ3Zs82n06AoNEARgAmGwV7ZQODgD8jxAAVbAAHVDywAZLUOkKYajA4KAFKShhkME4S8aIKBwRCXTgxQakOiIODAIFXG5mZZMMwKIA)

在上一个错误中，`extends` 变成了“assignable”，但这不会让我们困惑，因为我们知道两者都可以理解为“子集”。

当类型之间的关系不是严格层次化时，集合的解释也更有意义。例如，`string|number` 和 `string|Date` 之间是什么关系？它们的交集是非空的（是 `string`），但它们不是彼此的子类型。尽管这些类型不适合严格的层次结构，它们的范围关系仍然清晰。

![Union types may not t into a hierarchy but can be thought of in terms of sets of values](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202503272334242.png)

将类型视为集合的思考方式也能澄清数组和元组之间的关系。例如：

```ts
const list = [1, 2]
//    ^? const list: number[]
const tuple: [number, number] = list
//    ~~~~~ Type 'number[]' is not assignable to type '[number, number]'
//          Target requires 2 element(s) but source may have fewer
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQNKoJ4B4OKoAeUqYAJgM6KVQBOMYyAfABQBuAhgDYBcinMNgA0iANY5+GAJSIA3gChEiAPQrEAOi0KAvgogJaibjCMBeRAG0AjKIBMAXQDcCtcuUA9APyIDYIya0-GAgALYARqh0lg76hlCIUCAADtyo-JYhEVGiWZF0DogWgVAubu4AflVViAAq2MmoiADkeVExzYimiGBwCZyUlDDIYJzhaYlwiQ1NzZlh+bkLUQ7Nrurum8q1nHRoCXSoAI4gMIfUdoRpoWRQrJSy4SAJlHAgdBBNoZzYiAAWnHYTWAqAA7lEFEA)

是否存在不是数字对的元组？当然！空数组和`[1]`就是例子。因此`number[]`不能赋值给`[number, number]`是合理的，因为它不是后者的子集（反向赋值是可行的）。

三元组能赋值给二元组吗？从结构类型角度思考，你可能会认为可以。一个二元组有 0 和 1 个键，那它是不是也可能有其他键（比如 2）？

```ts
const triple: [number, number, number] = [1, 2, 3]
const double: [number, number] = triple
//    ~~~~~~ '[number, number, number]' is not assignable to '[number, number]'
//           Source has 3 element(s) but target allows only 2.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQNKoJ4B4OKoAeUqYAJgM6KVQBOMYyAfABQBuAhgDYBcinMNgA0iANY5+GAJSIA3gChEiAPQrEAOi0KAvgogJaiejAAO3VPwDaYEAFsARqjqjbj56-tO6AXUQBeRCsARlEAJlEAZh8Abn1DKERyOBAHC2s3b093XwDjBnNUOLVlZQA-CsrEAHIbLw9ETIam32rEGGowOETOSkoYZDBONNRjOBq6nOzvH2qFEtLF0oBlFLoIUYALXsRIwgs7MihWSlkHEESoTjo0Hu5uOAB3agRubEQwjQUgA)

答案是"不能"，这里有个有趣的原因。TypeScript 并非将数字对建模为`{0: number, 1: number}`，而是建模为`{0: number, 1: number, length: 2}`。这很合理：你可以检查元组的长度，这也阻止了此类赋值。

TypeScript 会不断进行可赋值性检查，正如你已经多次看到的那样，这是一种子集/子类型关系。有趣的是，TypeScript 很少检查类型完全相等。这使得为类型编写测试变得具有挑战性，这点将在第 55 条讲到。

如果最好将类型视为值的集合，那么意味着具有相同值集合的两个类型是相同的。事实上，除非两个类型在语义上不同，且恰好具有相同的范围，否则没有理由重复定义相同的类型。

与`never`（空类型）完全相反的是`unknown`。这种类型的“domain”（取值范围）包含 JavaScript 中的所有值。所有类型都可赋值给`unknown`。由于它位于类型层次结构的顶端，被称为"顶层类型"。第 46 条将介绍如何在代码中使用`unknown`类型。

最后值得注意的是，并非所有值集合都对应 TypeScript 类型。TypeScript 没有表示所有整数的类型，也没有表示仅包含 `x` 和 `y` 属性的对象类型。有时可以使用`Exclude`来减少类型，但只有当结果是一个有效的 TypeScript 类型时才可以：

```ts
type T = Exclude<string | Date, string | number>
//   ^? type T = Date
type NonZeroNums = Exclude<number, 0>
//   ^? type NonZeroNums = number
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQNKoJ4B4OKoAeUqYAJgM6KVQBOMYyAfABQBuAhgDYBcinMNgA0iANY5+GAJSIA3gChEiAPQrEAOi0KAvgqjYADqkQAVRAF5EAUSIRuIcqly0GTAD4ARTqVGvGyO5gIAC2AEaodMwA3ApqyogAegD8iAbGZpaI3qT6RiYAcggAWpFwBaHUVrb2js7B4ZGiAAwxcerKKWn5iEVgpXTllVkNEXQKQA)

下面表格总结了 TypeScript 术语与集合论术语之间的对应关系。

| TypeScript 术语       | 集合论术语        |
| --------------------- | ----------------- |
| never                 | ∅（空集合）       |
| 字面量类型            | 单元素集合        |
| 可以赋值给 T 的 Value | Value ∈ T（属于） |
| T1 可以赋值给 T2      | T1 ⊆ T2（子集）   |
| `T1 extends T2`       | T1 ⊆ T2（子集）   |
| `T1\|T2`              | T1 ∪ T2（并集）   |
| `T1 & T2`             | T1 ∩ T2（交集）   |
| unknown               | 全集              |

这种解释有一个重要的注意事项：当你将值视为不可变时效果最佳。例如，以下两种类型有什么区别？

```ts
interface Lockbox {
  code: number
}
interface ReadonlyLockbox {
  readonly code: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQNKoJ4B4OKoAeUqYAJgM6KVQBOMYyAfABQBuAhgDYBcinMNgA0iANY5+GAJSIA3gChEiAPQrEAOi0KAvgsak6wThFSIAMnAhiARnCLyliCHHKp+YEAFsbqOgG5dfTBDY1NEACVUTnIEbmxLazsHRWU6aNiweOdXd0RPHz9AvSA)

这两种类型的取值范围完全相同，但它们在实际使用中是可区分的：

```ts
const box: Lockbox = { code: 4216 }
const robox: ReadonlyLockbox = { code: 3625 }
box.code = 1234 // ok
robox.code = 1234
//    ~~~~ Cannot assign to 'code' because it is a read-only property.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQNKoJ4B4OKoAeUqYAJgM6KVQBOMYyAfABQBuAhgDYBcinMNgA0iANY5+GAJSIA3gChEiAPQrEAOi0KAvgsak6wThFSIAMnAhiARnCLyliCHHKp+YEAFsbqOgG5dfTBDY1NEACVUTnIEbmxLazsHRWU6aNiweOdXd0RPHz9AvRcwWkRk-kTbe0QAXnkct34AFgAmAEYANkQdQNLyujhKyIy4hKsahwa5JryAZi62gFZewOSNFzd6xA62+Zb-ZTVEODEFIY2tswa9g8CT5UQAP1fnxABhQTA4KAFKSgwZBIKBwRAAcmu4IqqAgnBAlDMMD+MGonEQ6RiAFpxogAA5DPF+KDYDQKIA)

因此，你有时也会听到这种观点：“类型是值的集合，以及你可以对它们执行的操作。” 第 14 条会更详细地讨论 `readonly`，但总体而言，当你使用不可变值时，类型检查器会更有效。

## 关键点总结

- 将类型看作值的集合（即类型的范围）。这些集合可以是有限的（例如 `boolean` 或字面量类型），也可以是无限的（例如 `number` 或 `string`）。
- TypeScript 的类型是相交集合（可以用维恩图表示），而不是严格的层次结构。两个类型可以有重叠部分，但互相并不是子类型。
- 即使一个对象有额外的属性，而这些属性没有在类型声明中提到，它仍然可以属于该类型。
- 类型操作适用于集合的范围。例如，`A | B` 的范围是 `A` 和 `B` 的并集。
- 将 `extends`、"assignable to" 和 "subtype of" 理解为 "子集" 的同义词。

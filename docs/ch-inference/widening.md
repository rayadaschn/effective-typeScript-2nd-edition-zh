# 第 20 条: 理解变量如何获得类型

## 要点

- 了解 TypeScript 如何通过宽化推断字面量的类型。
- 熟悉你可以影响这种行为的方式：`const`、类型注解、上下文、辅助函数、`as const` 和 `satisfies`。

## 正文

正如第 7 条说的，运行时每个变量只有一个值；但在静态分析时，TypeScript 看到的却是一组“可能的值”，也就是它的类型。

当你用一个常量初始化变量、但又没写类型时，类型检查器就要做个决定：它得根据你提供的这个具体值，推断出一个“可能的值的集合”。TypeScript 把这个过程叫做 **“扩展”（widening）**。

理解这个机制，有助于你看懂一些报错信息，也能让你更合理地使用类型注解。

假设你在写一个处理向量的库，你定义了一个三维向量的类型，并写了一个函数，可以根据传入的名称拿到对应的分量值：

```ts
interface Vector3 {
  x: number
  y: number
  z: number
}
function getComponent(vector: Vector3, axis: 'x' | 'y' | 'z') {
  return vector[axis]
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAzMgb2QA8AuZEAVwFsAjaAbmQE9yq7HkAvNm+qJgF8AUDEohMwLCGQBzCGADCWagAdpEcAAoAbhmxRy6TDlwAaZHGLAAzuQDkxe8gA+ye82dv7XewEpCYWRkKAVKKBk9EygAbStbAF0GYREgA)

但是当你尝试使用它时，TypeScript 会报错：

```ts
let x = 'x'
let vec = { x: 10, y: 20, z: 30 }
getComponent(vec, x)
//                ~ Argument of type 'string' is not assignable
//                  to parameter of type '"x" | "y" | "z"'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAzMgb2QA8AuZEAVwFsAjaAbmQE9yq7HkAvNm+qJgF8AUDEohMwLCGQBzCGADCWagAdpEcAAoAbhmxRy6TDlwAaZHGLAAzuQDkxe8gA+ye82dv7XewEpCYWRkKAVKKBk9EygAbStbAF0GYREAGwUSZABedydk9LBkKOzCMmQARgAGC1ZkACZq7nJcSsFk+SUVdRBNMF0MC2I-ZIB6EeCJyanggD9kAEEoWRpe5CwYZDBmVRR7GzAoUFlnWwosQrgbG2BZEDhadOEx6Zep7GRVOCg4agVoNY2Wx27gARMQQa5kCDmBC3CCuCD7MIgA)

代码能正常运行，那为什么会报错呢？
问题在于变量 `x` 被推断成了 `string` 类型，而 `getComponent` 函数第二个参数需要一个更具体的类型。这就是“扩展”在起作用，但它导致了类型错误。

“扩展”有点模糊，因为一个值可能对应多种类型。举个例子：

```ts
const mixed = ['x', 1]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAzMgb2QA8AuZEAVwFsAjaAbmQE9yq7HkAvNm+qJgF8AUDEohMwLCGQBzCGADCWagAdpEcAAoAbhmxRy6TDlwAaZHGLAAzuQDkxe8gA+ye82dv7XewEpCYWRkKAVKKBk9EygAbStbAF0GYREEaRswZGpgYggAE2QAXmQYx3sLAEYk4SA)

`mixed` 的类型应该是什么呢？这里有几种可能：

• ('x' | 1)[]
• ['x', 1]
• [string, number]
• readonly [string, number] • (string|number)[]
• readonly (string|number)[] • [any, any]
• any[]

没有更多上下文的话，TypeScript 没法判断哪种类型才是“正确”的，它只能猜你的意图。（这次它猜的是 `(string | number)[]`）。虽然很聪明，但 TypeScript 读不懂你的心思，所以不会百分百猜对。这就导致了刚才看到的那些无意中出现的错误。

在刚才的例子中，`x` 被推断成 `string`，是因为 TypeScript 允许像下面这样的代码：

```ts
let x = 'x'
x = 'a'
x = 'Four score and seven years ago...'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAzMgb2QA8AuZEAVwFsAjaAbmQE9yq7HkAvNm+qJgF8AUDEohMwLCGQBzCGADCWagAdpEcAAoAbhmxRy6TDlwAaZHGLAAzuQDkxe8gA+ye82dv7XewEpCYWRkKAVKKBk9EygAbStbAF0GYREAGwUSZABedydk4mz3OHt8wvsAMSxw5BsEHBQ4EAATGog9GWYIOCgbS1ksADohkuEgA)

但写成下面这样，在 JavaScript 里也是合法的：

```js
let x = 'x'
x = /x|y|z/
x = ['x', 'y', 'z']
```

在把 `x` 推断成 `string` 时，TypeScript 试图在“具体性”和“灵活性”之间找到平衡。变量声明后，类型不会变成完全不同的东西（见第 19 条），所以 `string` 比 `string | RegExp`、`string | string[]` 或 `any` 更合理。

对用 `let` 声明的原始值变量，TypeScript 的一般规则是把它们“扩展”成它们的“基础类型”：比如 `"x"` 会扩展成 `string`，`39` 会扩展成 `number`，`true` 会扩展成 `boolean`。（`null` 和 `undefined` 处理不太一样，详见第 25 条。）

TypeScript 提供了几种控制“扩展”过程的方法，其中一种就是用 `const`。如果用 `const` 声明变量，类型会更具体、更窄。其实，用 `const` 就能解决我们最初例子中的错误：

```ts
const x = 'x'
//    ^? const x: "x"
let vec = { x: 10, y: 20, z: 30 }
getComponent(vec, x) // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAzMgb2QA8AuZEAVwFsAjaAbmQE9yq7HkAvNm+qJgF8AUDEohMwLCGQBzCGADCWagAdpEcAAoAbhmxRy6TDlwAaZHGLAAzuQDkxe8gA+ye82dv7XewEpCYWRkKAVKKBk9EygAbStbAF0GYREEaRswEmQAXncnZIB6AuDggD0AfmQ0kAyScgAiYnrhABsFZCicwjJkAEYABgtWZAAmQe5yXH7BZPklFXUQTTBdDAtiPyZkIuQAeQBpYSA)

因为 `x` 不能重新赋值，TypeScript 就能放心推断出更精确的类型，不用担心后面赋值时会误报错。再加上字符串字面量类型 `"x"` 可以赋值给 `"x" | "y" | "z"`，所以代码能通过类型检查。

不过，`const` 并不是万能的。对于对象和数组，还是会有歧义。`mixed` 这个例子就说明了数组的情况：TypeScript 应该推断成元组类型吗？元素又该是什么类型？

对象也会遇到类似问题。下面这段代码在 JavaScript 里是合法的：

```js
const obj = { x: 1 }
obj.x = 3
obj.x = '3'
obj.y = 4
obj.z = 5
obj.name = 'Pythagoras'
```

`obj` 的类型推断范围可以很宽也可以很窄。最具体的类型是 `{ readonly x: 1 }`，更宽泛的是 `{ x: number }`，再宽泛点可能是 `{ [key: string]: number }`，甚至是 `object`，最宽泛的就是 `any` 或 `unknown`。

TypeScript 在对象类型推断时，会找一个它称作“最佳公共类型”的东西。它把每个属性当成是用 `let` 声明的，所以这里推断出 `obj` 的类型是 `{ x: number }`。这意味着你可以给 `obj.x` 重新赋一个不同的数字，但不能赋字符串，也不能通过直接赋值添加新属性。（这也是为什么最好一次性创建好对象，详见第 21 条。）

所以，下面四条语句都会报错：

```ts
const obj = {
  x: 1,
}
obj.x = 3 // OK
obj.x = '3'
//  ~ Type 'string' is not assignable to type 'number'
obj.y = 4
//  ~ Property 'y' does not exist on type '{ x: number; }'
obj.z = 5
//  ~ Property 'z' does not exist on type '{ x: number; }'
obj.name = 'Pythagoras'
//  ~~~~ Property 'name' does not exist on type '{ x: number; }'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAzMgb2QA8AuZEAVwFsAjaAbmQE9yq7HkAvNm+qJgF8AUDEohMwLCGQBzCGADCWagAdpEcAAoAbhmxRy6TDlwAaZHGLAAzuQDkxe8gA+ye82dv7XewEpCYWRkKAVKKBk9EygAbStbAF0GYREEaRswZCxaACtkAF5A4LJkAEYzFOTsnIA6YgLkXCZkAHoW5AB5AGlharqG+1x7ZLbggD9kABVmVRR7DKhQWWdbCixMuBsbYFkQOFoAGxRsZDAZufZ+e17cmuYGgBYR9uQJgAUoLFmoM-dPZAAJlgIDY1pkINYMlkZGdZu4iCVLpxBNc+lwGgBWZ7jZAfL7QX4+ZxAkFg5AQ2yZaSnc7wki8DgCZAom61PbUFCFexvZhgAAWcFkOE2w2Eo1eY0luM+30J7IgxOBoJA63JkKpMNp9gRDP4QmuQA)

TypeScript 还是在“具体性”和“灵活性”之间找平衡。它要推断出足够具体的类型来帮你发现错误，但又不能太具体，免得报假错。比如属性初始值是 `1`，它就推断类型为 `number`。

如果你有更准确的需求，可以用几种方法覆盖 TypeScript 的默认行为，其中一种就是明确写类型注解：

```ts
const obj: { x: string | number } = { x: 1 }
//    ^? const obj: { x: string | number; }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAzMgb2QA8AuZEAVwFsAjaAbmQE9yq7HkAvNm+qJgF8AUDEohMwLCGQBzCGADCWagAdpEcAAoAbhmxRy6TDlwAaZHGLAAzuQDkxe8gA+ye82dv7XewEpCYWRkKAVKKBk9EygAbStbAF0GYREEaRswZCxaACtyIjJkDKhQWVcKPmhkQWQAXkIScgBGauSAejbg4IA9AH5kNJAMrNz8xqKwEpAyt3Z+IWEgA)

还有一种方法是给类型检查器更多上下文，比如把值当作参数传给函数（见第 24 条）。

第三种方法是使用 **const 断言**。这可不是 `let` 和 `const` 声明变量，它们是值层面的东西，const 断言纯粹是类型层面的。看看下面这些变量推断出的不同类型：

```ts
const obj1 = { x: 1, y: 2 }
//    ^? const obj1: { x: number; y: number; }

const obj2 = { x: 1 as const, y: 2 }
//    ^? const obj2: { x: 1; y: number; }

const obj3 = { x: 1, y: 2 } as const
//    ^? const obj3: { readonly x: 1; readonly y: 2; }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAzMgb2QA8AuZEAVwFsAjaAbmQE9yq7HkAvNm+qJgF8AUDEohMwLCGQBzCGADCWagAdpEcAAoAbhmxRy6TDlwAaZHGLAAzuQDkxe8gA+ye82dv7XewEpCYWRkKAVKKBk9EygAbStbAF0GYREEaRswZCxaACsARmQAXkIScjyLVmQAJmRBZIB6euDggD0AfmQ0kAys3LzyIjIKPk5K9n4hYWEunuycmuLBsssbTvSwCvIauuFG5uR2te7MuaqB0uQ8pjGRgVqpmZPc-EWL8pYt2pWjjIam5sOj16OVw51CcAAJtIADbMN5McFQkCwj7VSZAA)

当你在一个值后面写上 `as const`，TypeScript 会推断出最窄的类型，不会做扩展。对于真正的常量，这通常是你想要的效果。你也可以用 `as const` 来修饰数组，这样它会推断成元组类型：

```ts
const arr1 = [1, 2, 3]
//    ^? const arr1: number[]
const arr2 = [1, 2, 3] as const
//    ^? const arr2: readonly [1, 2, 3]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAzMgb2QA8AuZEAVwFsAjaAbmQE9yq7HkAvNm+qJgF8AUDEohMwLCGQBzCGADCWagAdpEcAAoAbhmxRy6TDlwAaZHGLAAzuQDkxe8gA+ye82dv7XewEpCYWRkKAVKKBk9EygAbStbAF0GYREEaRswSygoAEZkAF5kGJyLACYLXCThAHpq4OCAPQB+ZDSQDKzc3g5YhOE2jrhs0oKikuRy5ErLG1b0sGTa+uRmufbMoahS8lC4ABNpABtmMbKKvqA)

虽然语法很像，但 const 断言和类型断言（`as T`）是不一样的。类型断言最好少用（见第 9 条），而 const 断言不会破坏类型安全，完全没问题。

这里有个小技巧，如果你想让 TypeScript 推断成元组类型，但又想让元组里每个元素的类型能扩展成它们的基础类型或最佳公共类型，可以这样做：

```ts
function tuple<T extends unknown[]>(...elements: T) {
  return elements
}

const arr3 = tuple(1, 2, 3)
//    ^? const arr3: [number, number, number]
const mix = tuple(4, 'five', true)
//    ^? const mix: [number, string, boolean]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAzMgb2QA8AuZEAVwFsAjaAbmQE9yq7HkAvNm+qJgF8AUDEohMwLCGQBzCGADCWagAdpEcAAoAbhmxRy6TDlwAaZHGLAAzuQDkxe8gA+ye82dv7XewEpCYWRkKAVKKBk9EygAbStbAF0GYRExCTApGTBKVQAbCAAeABVkCGJIEAATG2RxAGsQLAB3EBiEgD4tADoeiHzqTTA7ZCKAolDsiNL+wZshYWEEaRswSyg8ZABeZGy8iC0ARgsAJgtcP2SAekvg4IA9AH5kJZAVtbxyGPZ+C2-oX740ASi2Wq2owGIWx2OXyWgALBZ7DBgHp7BYwFBKBALsJrrdkI9nqDkOCyMgvoCoBYVlBQLILLQsFh8nAQMCgA)

这里的 `tuple` 函数在运行时其实没什么用，只是帮助 TypeScript 推断出你想要的类型。另一个能帮推断的函数是 JavaScript 的 `Object.freeze`：

```ts
const frozenArray = Object.freeze([1, 2, 3])
//    ^? const frozenArray: readonly number[]
const frozenObj = Object.freeze({ x: 1, y: 2 })
//    ^? const frozenObj: Readonly<{ x: 1; y: 2; }>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAzMgb2QA8AuZEAVwFsAjaAbmQE9yq7HkAvNm+qJgF8AUDEohMwLCGQBzCGADCWagAdpEcAAoAbhmxRy6TDlwAaZHGLAAzuQDkxe8gA+ye82dv7XewEpCYWRkKAVKKBk9EygAbStbAF0GYREEaRswZBgoLC5NAEEoKDhmZABeZAB5WgArfQA6bIgIPK0YgEYLACYLXAS-ZIB6QeDggD0AfmQ0kAysnLyQQuLWEIg4ABNpABtS9n4YhOEZuezczWqa8qrahqaWiC0CMmROlnIuwQHhYdHkSem6UyZ0Wl3IACV1lsQLsADxEF7tJirLpCAB8wiAA)

和 const 断言类似，`Object.freeze` 会在推断的类型上加上 `readonly` 修饰符（虽然显示方式不同，但 `frozenObj` 的类型和 `obj3` 是完全一样的）。不同的是，`Object.freeze` 会被 JavaScript 运行时真正执行“冻结”操作。但它是浅冻结/浅只读，而 const 断言是深层的。第 14 条讲了 `readonly` 及其如何帮助避免错误。

最后，控制扩展的第四种方法是 `satisfies` 操作符。它确保一个值符合某个类型的要求，同时通过阻止 TypeScript 推断更宽泛的类型来引导推断。用法如下：

```ts
type Point = [number, number]
const capitals1 = { ny: [-73.7562, 42.6526], ca: [-121.4944, 38.5816] }
//    ^? const capitals1: { ny: number[]; ca: number[]; }

const capitals2 = {
  ny: [-73.7562, 42.6526],
  ca: [-121.4944, 38.5816],
} satisfies Record<string, Point>

capitals2
// ^? const capitals2: { ny: [number, number]; ca: [number, number]; }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAzMgb2QA8AuZEAVwFsAjaAbmQE9yq7HkAvNm+qJgF8AUDEohMwLCGQBzCGADCWagAdpEcAAoAbhmxRy6TDlwAaZHGLAAzuQDkxe8gA+ye82dv7XewEpCYWRkKAVKKBk9EygAbStbAF0GYREwZlUUAAUsUDBkAF5kGPZ+CxLoJOEEaRs8hDhVYDA4ABsbAEYCwgpWIoBaAHZcADoBgFYANgAmCwAWKeGJsamJhIt68hi+9qn24dmATlnZi1wADmGxs-bV5EFkgHoH4OCAPQB+ZGqQWq+GptaHXIRBAvXKsSSf14HAhQmEVRqdX+zTaUy6BCCPU2gxG42mcwWSxWayh-R2e0Ox1OFyuNwSKWQNjgYFsMGAEBsyAAShgcAATAA8tSgoFkFmyuQAfMl6o0UTYpsInsgPl9EX85YCpsCsUVwWU+BUmBs9YaoAaYZCREA)

如果不加控制，TypeScript 会从对象字面量里拿到键，然后把值扩展成 `number[]`，就像用 `let` 一样。而加上 `satisfies`，我们就阻止了值被扩展成超出 `Point` 类型的范围。

和用类型注解写出来的效果比一比：

```ts
const capitals3: Record<string, Point> = capitals2
capitals3.pr // undefined at runtime
//        ^? Point
capitals2.pr
//        ~~ Property 'pr' does not exist on type '{ ny: ...; ca: ...; }'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAzMgb2QA8AuZEAVwFsAjaAbmQE9yq7HkAvNm+qJgF8AUDEohMwLCGQBzCGADCWagAdpEcAAoAbhmxRy6TDlwAaZHGLAAzuQDkxe8gA+ye82dv7XewEpCYWRkKAVKKBk9EygAbStbAF0GYREwZlUUAAUsUDBkAF5kGPZ+CxLoJOEEaRs8hDhVYDA4ABsbAEYCwgpWIoBaAHZcADoBgFYANgAmCwAWKeGJsamJhIt68hi+9qn24dmATlnZi1wADmGxs-bV5EFkgHoH4OCAPQB+ZGqQWq+GptaHXIRBAvXKsSSf14HAhQmEVRqdX+zTaUy6BCCPU2gxG42mcwWSxWayh-R2e0Ox1OFyuNwSKWQNjgYFsMGAEBsyAAShgcAATAA8tSgoFkFmyuQAfMl6o0UTYpsInsgPl9EX85YCpsCsUVwWU+BUmBs9YaoAaYZCRN9frKAW1cOQedUoILhaLxTlwJKunb5VMZcjASNVAJgsrxHyIGyQBA+ZY8lBxCzqBAlc8XpnVRLwFUg6jhqHHhnM8EAH5l5CZKBYDJQNLuUPOPlYDkULB5CDWX7SZBpDLuEG9YYj41wcgj4ZCezCIA)

`satisfies` 推断出来的类型有精准的键，这有助于发现错误。

如果对象的某部分不能赋值给指定类型，`satisfies` 操作符会报错：

```ts
const capitalsBad = {
  ny: [-73.7562, 42.6526, 148],
  //  ~~ Type '[number, number, number]' is not assignable to type 'Point'.
  ca: [-121.4944, 38.5816, 26],
  //  ~~ Type '[number, number, number]' is not assignable to type 'Point'.
} satisfies Record<string, Point>
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAzMgb2QA8AuZEAVwFsAjaAbmQE9yq7HkAvNm+qJgF8AUDEohMwLCGQBzCGADCWagAdpEcAAoAbhmxRy6TDlwAaZHGLAAzuQDkxe8gA+ye82dv7XewEpCYWRkKAVKKBk9EygAbStbAF0GYREwZlUUAAUsUDBkAF5kGPZ+CxLoJOEEaRs8hDhVYDA4ABsbAEYCwgpWIoBaAHZcADoBgFYANgAmCwAWKeGJsamJhIt68hi+9qn24dmATlnZi1wADmGxs-bV5EFkgHoH4OCAPQB+ZGqQWq+GptaHXIRBAvXKsSSf14HAhQmEVRqdX+zTaUy6BCCPU2gxG42mcwWSxWayh-R2e0Ox1OFyuNwSKWQNjgYFsMGAEBsyAAShgcAATAA8tSgoFkFmyuQAfMl6o0UTYpsInsgPl9EX85YCpsCsUVwWU+BUmBs9YaoAaYZCRN9frKAW0AEJwPnozHBUHYoajSYzZDzRbLCYWdqzM5rJXPZAAPyjyAAKukUPZimaLaUKGaEs5bBQsHk4DYbMBZCA4LQWihsMg0hl3BLwPZhm7SVtyfsjidkOdLtcg8hiWYI8EY-HE+4UzC09Ap1As8gcyA85ZC8XS+XK1hq2P7PWwI2GUyWTY2RzubyoILhaLxTlwNLhEA)

相比 const 断言，`satisfies` 的优势在于它会在定义对象的地方报错，而不是等到使用时才发现问题。

如果你遇到因为类型扩展（widening）导致的错误，可以考虑把 `let` 改成 `const`，加上明确的类型注解，使用像 `tuple` 或 `Object.freeze` 这样的辅助函数，或者用 const 断言和 `satisfies`。像往常一样，在编辑器里查看类型是理解这些机制的关键（参见第 6 条）。

## 关键点总结

- TypeScript 会根据变量的初始值推断出一个“可能的值的集合”，这个过程叫做 **“扩展”（widening）**。
- 对于用 `let` 声明的原始值变量，TypeScript 的一般规则是把它们“扩展”成它们的“基础类型”。
- TypeScript 提供了几种控制“扩展”过程的方法，包括使用 `const`、类型注解、辅助函数和 `satisfies` 操作符。

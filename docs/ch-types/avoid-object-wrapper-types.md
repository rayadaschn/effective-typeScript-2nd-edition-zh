# 第 10 条: 避免使用对象包装类型（String, Number, Boolean, Symbol, BigInt）

## 要点

- 避免使用 TypeScript 的对象包装类型，优先使用原始类型：用 `string` 代替 `String`，`number` 代替 `Number`，`boolean` 代替 `Boolean`，`symbol` 代替 `Symbol`，`bigint` 代替 `BigInt`。
- 理解对象包装类型的作用是为原始值提供方法，避免直接实例化或使用它们，`Symbol` 和 `BigInt` 是例外。

## 正文

除了对象，JavaScript 还有七种原始类型的值：字符串（string）、数字（number）、布尔值（boolean）、null、undefined、符号（symbol）和大整数（bigint）。前五种类型从 JavaScript 诞生起就存在了，而 symbol 是在 ES2015 中加入的，bigint 则是在 ES2020 中加入的。

原始类型和对象的最大区别在于：它们是**不可变的**，并且**没有方法**。你可能会反驳说，字符串不是有方法吗？

```js
> 'primitive'.charAt(3)
'm'
```

但这里其实有点“魔术”。虽然字符串本身是原始类型、没有方法，但 JavaScript 同时定义了一个 `String` 对象类型，它是有方法的。JavaScript 会在你调用字符串方法时，**自动将原始字符串“包装”成一个临时的 `String` 对象**，调用完方法后再立刻丢弃这个对象。

如果你尝试修改 `String.prototype`（详见第 47 条），你就能观察到这个行为。

```js
// Don't do this!
const originalCharAt = String.prototype.charAt
String.prototype.charAt = function (pos) {
  console.log(this, typeof this, pos)
  return originalCharAt.call(this, pos)
}
console.log('primitive'.charAt(3))
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEBEHsDsHIBdQBNKngCwJYGcCEAoAYxm0UgCdMBzTaAQwBsBhdO8gQUQF5QBleStCoA6AA7lI8SQE9RAU2GFWHeAG58-QSPGSZ8xcs6geAMwCu0QvEwwAFKMjYAlKADe+UKGLRskBgoZIKlsMHAAaNFk5SBM0LGwIh2d1T3I5eDNyaFAKalpGFjZORUYGEPjExyd1AF91b19-YUDg2HFMAFtMawA3OVgDIvhbAGYnavwgA)

上面代码会输出：

```bash
primitive string 3
m
```

方法中的 `this` 实际上是一个 `String` 对象的包装器，而不是原始的字符串。你也可以手动创建一个 `String` 对象，它有时候的表现看起来像原始字符串，但并不完全一样。

比如，一个 `String` 对象只会等于它自己，哪怕内容一样，也不会等于一个普通字符串：

```js
'hello' === new String('hello') // false

new String('hello') === new String('hello') // false
```

这种自动转换为对象包装类型的机制，解释了 JavaScript 中一个奇怪的现象 —— 如果你给一个原始类型赋值一个属性，这个属性会“消失”：

```js
let str = 'hello'
str.customProp = 123
console.log(str.customProp) // undefined
```

这是因为当你给原始类型赋属性时，JavaScript 会临时把它包装成对象，加上属性，然后立刻把这个对象丢掉，所以下次访问时，这个属性就不见了。

除了字符串，其他原始类型也有对应的对象包装类型：`Number` 对应数字，`Boolean` 对应布尔值，`Symbol` 对应符号，`BigInt` 对应大整数（`null` 和 `undefined` 没有对应的包装对象）。

这些包装类型的存在，主要是为了方便——它们提供了方法可以在原始值上调用，也提供了一些静态方法（比如 `String.fromCharCode`）。但一般来说，我们没必要自己去手动创建这些包装对象。

TypeScript 为了区分原始类型和它们的包装对象，分别提供了不同的类型：

- `string` 和 `String`
- `number` 和 `Number`
- `boolean` 和 `Boolean`
- `symbol` 和 `Symbol`
- `bigint` 和 `BigInt`

有时候我们会不小心写成包装类型的形式（尤其是你有 Java 或 C# 的背景时），而且看起来好像也能用，比如 `String`，但其实这样做并不推荐。

```ts
function getStringLen(foo: String) {
  return foo.length
}

getStringLen('hello') // OK
getStringLen(new String('hello')) // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQMpQE4zMgGVTAApg44AuRLXfASkQG8AoRRbdEbJcuAOgA2xZFAAWAbhYBfFizSYceQsRIAiMakGC4a+hPYB6Q4gDyAaXnpayoqTCoA7jSX51m7bvr6jJiyyA)

但当你把一个 `String` 对象传给一个期望接收原始 `string` 的方法时，事情就会出问题了：

```ts
function isGreeting(phrase: String) {
  return ['hello', 'good day'].includes(phrase)
  //                                    ~~~~~~
  // Argument of type 'String' is not assignable to parameter of type 'string'.
  // 'string' is a primitive, but 'String' is a wrapper object.
  // Prefer using 'string' when possible.
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABDAzgcQE4FMuzAcwAoAHACwwEMUsAuRAZSgxgIEpEBvAKEUWyhAYkAbQDkpLABtJcUQBpEo-HDgATRKooBPUQF0AdCwiSQqrChLkqWVgG4eiAPSPert+4+eviAH5--Ds6IAIIY+CAAtlhgUIhwwIhQWsRYiozMBKLIKIhgcLFUKDD4YBQARpKpUHCIxBSUUVBYGHEJSSmKKEws+KL6gS6iXRm92YgUtcwRMLAAblgKZSCxouk9WajjiADulMQpLXBlAFZY0P28QQAK2MDNiCBFBJ3dmTsSSMRwKEUVWP0AXy4QA)

所以，`string` 可以赋值给 `String`，但 `String` 不能赋值给 `string`。是不是有点绕？只要照着 TypeScript 提示的建议来，用 `string` 就好。TypeScript 自带的类型声明和大多数库的类型定义也都是用的 `string`。

还有一种容易误用包装类型的情况是你手动写了大写开头的类型注解，比如：

```ts
const s: String = 'primitive'
const n: Number = 12
const b: Boolean = true
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBBBcMDKUBOBLMBzGBeGARAA4YC26U6AbgKYEDcAUKJLGIgHICupARjajwwAjACYmLaDF6IAQiBAAbGgEMwQtFxpMgA)

这只是改了 TypeScript 的类型标注，**并不会改变运行时的值**（参考第 3 条）。它们依然是原始类型，不是对象。但 TypeScript 允许这样写，因为原始类型是可以赋值给包装对象类型的。不过这些注解既容易误导，也没必要（参考第 18 条），最好还是坚持使用原始类型。

最后补充一点，调用 `BigInt` 和 `Symbol` 时可以不加 `new`，因为它们本身就返回原始类型的值：

```ts
> typeof BigInt(1234)
'bigint'

> typeof Symbol('sym')
'symbol'
```

这里的 `BigInt` 和 `Symbol` 是生成值的函数，返回的是 `bigint` 和 `symbol` 类型的值，而不是 TypeScript 类型（参考第 8 条）。你也可以直接在数字后面加个 `n` 来创建 bigint，比如 `123n`。

如果你的项目用了 `typescript-eslint`，其中的 `ban-types` 规则会禁止使用包装对象类型。这在 `@typescript-eslint/recommended` 配置中是默认启用的。

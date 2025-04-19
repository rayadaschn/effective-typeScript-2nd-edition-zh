# 第 14 条：使用 `readonly` 防止因可变性引发的错误

## 要点

- 如果函数不会修改参数，给数组参数加上 `readonly`，对象参数用 `Readonly`，这样可以让函数的使用约定更清晰，也能避免实现过程中不小心修改参数。
- 理解 `readonly` 和 `Readonly` 只是浅层保护，对象的嵌套属性或方法本身不会受影响。
- 使用 `readonly` 可以防止误操作带来的修改，并帮助你定位代码中发生变更的地方。
- 分清 `const` 和 `readonly`：`const` 阻止变量被重新赋值，`readonly` 阻止对象或数组内部被修改。

## 正文

这里有一些代码用于打印杨辉三角形（例如：1, 1 + 2 = 3, 1 + 2 + 3 = 6 等）：

```ts
function printTriangles(n: number) {
  const nums = []
  for (let i = 0; i < n; i++) {
    nums.push(i)
    console.log(arraySum(nums))
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwE6uQTwMogLYAUaqAXImPgEYCmqA2gLoCUiA3gFCKIA21UiAZ3yIAvIgAMAGnL4A3J0QB3ABYxeiAgQp5RKdADoADnEMEmLAIQix4ACbVgMMNVssOXLkJ0BqMdvlcAL4KqHwgqEhe8sGgkLAIiIaoTlAAKsnIYADmvAJaZNo0qG4KEAgC-NoCuowBiMBwqBq8-DC64rKIbQA85J0w3t4lHjJ4AkYgAsoEMEx1XGVgAnC8+txwWUToWLiEVeZ1wcFAA)

这段代码看起来简单直接（尽管效率不高），它的运算结果为：

```bash
> printTriangles(5);
0
1
2
3
4
```

😰 结果并不是我们想要的，接下来可以看看 arraySum 函数，是否有问题：

```ts
function arraySum(arr: number[]) {
  let sum = 0,
    num
  while ((num = arr.pop()) !== undefined) {
    sum += num
  }
  return sum
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwE6uQTwMogLYAUaqAXImPgEYCmqA2gLoCUiA3gFCKIA21UiAZ3yIAvIgAMAGnL4A3J0QB3ABYxeiAgQp5RKdADoADnEMEmLAIQix4ACbVgMMNVssOXLkJ0BqMdvlcAL4KqHwgqEhe8sFAA)

这个函数确实计算了数组中数字的总和，但它还有一个副作用 ———— 会清空原数组！TypeScript 没有报错，因为 JavaScript 数组本来就是可变的。问题的根源在于 `printTriangles` 对 `arraySum` 做了一个假设：它认为 `arraySum` 不会修改 `nums`。

**可变性（Mutation）是许多难以追踪的 Bug 的根源。** 在 JavaScript 中，可变性是默认行为，但 TypeScript 的 `readonly` 修饰符可以帮助你发现并阻止意外的修改，避免这类隐蔽的 Bug。

JavaScript 的**原始类型（primitives）本身就是不可变的**。`string`、`number` 和 `boolean` 没有任何方法能改变它们的值。（虽然你可以用 `let` 重新赋值，但并不会改变原始值本身。）

而正如 `arraySum` 这个破坏性函数所示，**数组（和对象）是可变的**。这正是 TypeScript 的 `readonly` 修饰符发挥作用的地方。

在对象类型的属性上使用 `readonly` 可以防止对该属性重新赋值：

```ts
interface PartlyMutableName {
  readonly first: string
  last: string
}

const jackie: PartlyMutableName = { first: 'Jacqueline', last: 'Kennedy' }
jackie.last = 'Onassis' // OK
jackie.first = 'Jacky'
//     ~~~~~ Cannot assign to 'first' because it is a read-only property.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgApymANgTwLICuYcARlhAHJwC2KA3gFDLJQRwAmA9iLsjMFADOYAFzJhUUAHMA3E2RY4wsROlyAvgwYJuw5ACtEAa2AQx6TLkLEylGigC8yOnwHLkAcgBSiAI4EILFAIDwAaBSVRTwBpCBAQCHYcD2R1OUMEEwgAOkU9Jw8AeRAlQWBBDxlmAHpq5ELohgys7P4hMGQCn0zkuVrmAYA-YeHkAGE4eM4O0uApEGQwTk824RSSCAQ4AkEUYA7y5DgWNnYAWm5eAAcoTivoMBxshiA)

通常，你会希望阻止对对象所有属性的修改。TypeScript 提供了一个泛型工具类型 `Readonly<T>`，专门用于实现这一点：

```ts
interface FullyMutableName {
  first: string
  last: string
}
type FullyImmutableName = Readonly<FullyMutableName>
//   ^? type FullyImmutableName = {
//        readonly first: string;
//        readonly last: string;
//      }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGIFcA2mCeBZdMOAI0wgDk4BbFAbwChlkZgoBnMALmQ6lAHMA3I2SY4HbrwHCAvvTA4ADigzYcASSpVCJMpRrIAvMgBKEOABMA9iFwAeVbgJFSFahAB8wgPTemyAD0AfmQFZTQsXE1tFz13I2QGX38U5Chza1scZlYJHjA+ECF6ZNSmdMsbXFFxLnzC4tKUuSA)

> 重点关注 `readonly`：此处从 `interface` 改为 `type` 并不重要。

如果函数接收一个对象参数但不会修改它，最好用 `Readonly` 包装该类型，既向调用方明确声明这一点，也在实现中强制约束。

但关于 `readonly` 属性修饰符和 `Readonly<T>`，有两点重要注意事项：

1. **浅层不可变（Shallow Immutability）**  
   和 `const` 声明类似，`readonly` 属性不能被重新赋值，但**其内部仍可能被修改**（如果是可变对象）：

   ```ts
   interface NestedObject {
     readonly arr: number[]
   }

   const obj: NestedObject = { arr: [1, 2, 3] }
   obj.arr = [4, 5] // 编译错误：无法分配到 "arr"
   obj.arr.push(4) // 编译通过！实际修改了数组内容
   ```

2. **它仅影响属性，不会移除对象中的可变方法**。例如：

   ```ts
   const date: Readonly<Date> = new Date()
   date.setFullYear(2037) // OK, but mutates date!
   ```

   [💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgPIFdJWQbwFDLKgjQBcuBhyAHuSOgLYBG0A3JQL55cID2IAZzDJeTAFbkAShDgATfgBsAngB4MWAHzIAvLiIgSUcjhrkADMg4d2osQDpi0HXtrIAjJfYB6L4QB+AQHIAMJwBrzCcAICwADmIMhgvMgA5I5QKcgsCHDoAijAwsACyHDIUDKyALSKSsgADlC89dBgSni2DgbQdtTObqyEPmgA0nh8gsKycJBSlbUqACIzEFq6JADuyMuQABQAlOzTkHb5YABi6AoKAJoyULsATGYAzADsh0O+qCMANFmYZAMTArErHCAAQjwQA)

如果你需要一个类的可变和不可变版本，通常需要自行区分。标准库中的 `Array` 和 `ReadonlyArray` 接口就是典型的例子。以下是 `Array<T>` 的定义（`lib.es5.d.ts`）：

```ts
interface Array<T> {
  length: number
  // (non-mutating methods)
  toString(): string
  join(separator?: string): string
  // ...
  // (mutating methods)
  pop(): T | undefined
  shift(): T | undefined
  // ...
  [n: number]: T
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgPIFdJWQbwFDLKgjQBcuBhyAHuSOgLYBG0A3JQL55cID2IAZzDJeTAFbkAShDgATfgBsAngB4MWAHzIAvLiIgSUcjhrkADMg4d2osQDpi0HXtrIAjJfYB6L4QB+AQHIAMJwBrzCcAICwADmIMhgvMgA5I5QKcgsCHDoAijAwsACyHDIUDKyALSKSsgADlC89dBgSni2DgbQdtTObqyEPmgA0nigWPBIyACCUFBwqgAqWviEChAgsWAAFnSMLFDsQ74AFCD8VQyYcGCgscgMELu8sgIAlJRJAMpgUPend7kIT-LbHZBiXigU75epwBZJKAAfmBf3uQOQIPu4OGdjxlGGp2uYFu90ezx2rw+lHqzUB5CWyAAPsh0CBZBAYKAILJwQIdsAYGB6chGSy2RyuSReQTfHi7JQANogfbMaAAXQZ7C4QA)

下面是与之对应的不可变版本 `ReadonlyArray<T>` 的定义

```ts
interface ReadonlyArray<T> {
  readonly length: number
  // (non-mutating methods)
  toString(): string
  join(separator?: string): string
  // ...
  readonly [n: number]: T
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgPIFdJWQbwFDLKgjQBcuBhyAHuSOgLYBG0A3JQL55cID2IAZzDJeTAFbkAShDgATfgBsAngB4MWAHzIAvLiIgSUcjhrkADMg4d2osQDpi0HXtrIAjJfYB6L4QB+AQHIAMJwBrzCcAICwADmIMhgvMgA5I5QKcgsCHDoAijAwsACyHDIUDKyALSKSsgADlC89dBgSni2DgbQdtTObqyEPmgA0nigWPBIyNJytQCCUFBwqgAqWviEFXMgysgKECCxYAAWdIwsUOxDvgAUIPxVDJhwYKCxyAwQp7yyAgCUlCSAGUwFB3rd-uQhOCjtdkGJeKBbvl6nBlkkoAB+aFg95Q5Aw97w4Z2MmUbbyXZ1ADaIHOzGgAF1yKt2FwgA)

主要的区别在于，可变方法（比如 `pop` 和 `shift`）在 `ReadonlyArray` 上是没有定义的；同时，`length` 属性和索引类型（`[n: number]: T`）都被加上了 `readonly` 修饰符。这意味着你不能改变数组的长度，也不能修改数组里的元素。（用 `number` 作为索引类型在自己的代码里是不推荐的，详见第 17 条。）

因为 `Array<T>` 和 `ReadonlyArray<T>` 用得非常多，所以它们有专门的简写形式：`T[]` 和 `readonly T[]`。由于 `T[]` 的功能比 `readonly T[]` 多，因此 `T[]` 是 `readonly T[]` 的子类型。（这点很容易搞反——记得参考第 7 条！）

所以你可以把一个可变数组赋值给只读数组，但不能反过来。

```ts
const a: number[] = [1, 2, 3]
const b: readonly number[] = a
const c: number[] = b
//    ~ Type 'readonly number[]' is 'readonly' and cannot be
//      assigned to the mutable type 'number[]'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgPIFdJWQbwFDLKgjQBcuBhyAHuSOgLYBG0A3JQL55cID2IAZzDJeTAFbkAShDgATfgBsAngB4MWAHzIAvLiIgSUcjhrkADMg4d2osQDpi0HXtrIAjJfYB6L4QB+AQHIAMJwBrzCcAICwADmIMhgvMgA5I5QKcgsCHDoAijAwsACyHDIUDKyALSKSsgADlC89dBgSni2DgbQdtTObqyEPmgA0nh8gpF0jCxQANoAus5zbgA0yABM6wDMC+wTQlnkFXK1yPTM0IvOcPv8hwjTl-NLukzevlR+yAAqSi2pE7yEDKc4zK4LTLFQGVWqZMKyZA5cLCFh4YZUQhRGLxCCIpKJAAWKAYmDgTAUKDaAJSF1mixSeCAA)

这很好理解：如果你可以轻松绕过 `readonly` 修饰符（甚至都不需要类型断言），那它就没啥用了。

现在我们已经掌握了改进 `printTriangles` 和 `arraySum` 函数所需的工具。如果 `printTriangles` 想防止 `arraySum` 修改 `nums` 数组，它可以传入一个只读参数：

```ts
function printTriangles(n: number) {
  const nums = []
  for (let i = 0; i < n; i++) {
    nums.push(i)
    console.log(arraySum(nums as readonly number[]))
    //                   ~~~~~~~~~~~~~~~~~~~~~~~~~
    // The type 'readonly number[]' is 'readonly' and cannot be
    // assigned to the mutable type 'number[]'.
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgPIFdJWQbwFDLKgjQBcuBhyAHuSOgLYBG0A3JQL55cID2IAZzDJeTAFbkAShDgATfgBsAngB4MWAHzIAvLiIgSUcjhrkADMg4d2osQDpi0HXtrIAjJfYB6L4QB+AQHIAMJwBrzCcAICwADmIMhgvMgA5I5QKcgsCHDoAijAwsACyHDIUDKyALSKSsgADlC89dBgSni2DgbQdtTObqyEPmgA0ngw6CAIYMD8pVBQcEoAyowAFHALdIwsUADaALoAlBSEChDCAozOZgA0yPQM7IQA7gAWwOfIa2uPzptQOz1ZprI4nACE2l0k1kEBgoAgshO+CoyCuDGQAGpdI9npZKBUwOgoAl0ewuBMpjM5o1QGAACpQYBhWLnAS-bbMaDIyh8QTCR4lXSHPEwXjYNbnIo3QbAZAqB6yzGYnmowVAvJvNbAI54wh8gS8c52BS8WIbBZLVYMX6MEpRcqVWoPHbQQ5gvXIYaon2+qiBAOBoPByhDXz0t4oNotVIVOTOx67Q6ZYqxp0gZSZMKyZA5cLCFihr2+KIxeKIxLJMCR5AMTBwJhfaMoFKJt0HFJ2TjcPBAA)

我们不能把 `nums` 声明成 `readonly number[]`，因为我们自己还需要修改它。我们只是想确保 `arraySum` 不去修改它。但由于 `arraySum` 声明的是接收一个可变数组，所以会报类型错误。

你可以通过把参数改成接收一个只读数组来修复这个问题。这样的话，`arraySum` 里对数组的修改操作就会报类型错误。

```ts
function arraySum(arr: readonly number[]) {
  let sum = 0,
    num
  while ((num = arr.pop()) !== undefined) {
    //              ~~~ 'pop' does not exist on type 'readonly number[]'
    sum += num
  }
  return sum
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwE6uQTwMogLYAUaqAXIqgKbIAmCANpomPgEYWoDaAugJSIDeAKESI6FKIgDO+RAF5EABgA0TfAG5hiAO4ALGGMQECzPHJToAdAAc4Vgjz4BCWfPDUKwGGArU+QkSIA9IEBoWEiAH5RiADkNlYxiLQUkkxwEhQAHjCSEgiIUJhWFLGUNPSMJmycXDGaItKmANTyJhoiAL6alFAgqEiNGl1AA)

结合我们之前看到的 `Array` 和 `ReadonlyArray` 接口，这个报错信息就很好理解了：`pop` 是 `Array` 上的方法，但在 `ReadonlyArray` 上是不存在的。

要修复 `arraySum` 中的类型错误，只需要不去修改数组就行了：

```ts
function arraySum(arr: readonly number[]) {
  let sum = 0
  for (const num of arr) {
    sum += num
  }
  return sum
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABABwE4zFAKughmAcwBsBTAZwAowAuRMEAWwCMTUBKRAbwChFEIEZKHUZlEAXkQBtALoBuXomBxUiCqWEwJiAAxzEWgDx19MANRmOPPn3oMyAOmQgyACwow2Cm-0FxSDkRwBBS4qKi4AJ4AyoxUomxeigC+3KmgkLAIiGERMXG5tKgkuAAmCESRIsysslaKGohkjNp6isqqFAJgQtWIcMA54fU+zQyIZpJ23oipfMVQIKhIYwqpQA)

现在再打印三角形数，就正常了。

```bash
> printTriangles(5)
0
1
3
6
10
```

当你给参数加上只读类型（数组用 `readonly`，对象用 `Readonly`）时，会发生以下几件事：

- TypeScript 会检查函数体内有没有修改这个参数；
- 你向调用者明确表明这个函数不会修改传入的参数；
- 调用者可以传入只读数组或只读对象来调用这个函数。

如果你的函数不会修改参数，那就应该把它们声明为只读的。这样做几乎没什么坏处：调用者可以传入更多种类的参数（详见第 30 条），而你也能防止意外地修改它们。

> 注意：你依然可以重新赋值一个只读参数。它更像是用 `let` 声明的变量，而不是 `const`。重新赋值对函数调用者是不可见的，而修改内容是可见的。

有个问题是：你可能会调用一些没把参数标成 `readonly` 的函数。如果这些函数本来也不会修改参数，而且你能修改它们，那就加上 `readonly` 吧！`readonly` 通常是“可继承”的：当你给一个函数加上 `readonly`，你往往也得给它调用的其他函数加上。这其实是件好事，因为它能让你的代码契约更清晰，类型更安全。

不过如果你调用的是第三方库的函数，可能就没办法改它们的类型定义了。这时候你可以用类型断言（比如 `param as number[]`）绕过，或者修改类型定义文件（详见第 71 条）。

在 JavaScript（和 TypeScript）中，人们通常默认函数不会修改传入的参数，除非特别说明。但正如本书多次强调的（尤其是第 31 和 33 条），这种“默认约定”在类型检查时可能带来麻烦。最好的做法是把你的意图写清楚——既给人看，也给编译器看。

## 关键点总结

- 如果函数不会修改参数，给数组参数加上 `readonly`，对象参数用 `Readonly`，这样可以让函数的使用约定更清晰，也能避免实现过程中不小心修改参数。
- 理解 `readonly` 和 `Readonly` 只是浅层保护，对象的嵌套属性或方法本身不会受影响。
- 使用 `readonly` 可以防止误操作带来的修改，并帮助你定位代码中发生变更的地方。
- 分清 `const` 和 `readonly`：`const` 阻止变量被重新赋值，`readonly` 阻止对象或数组内部被修改。

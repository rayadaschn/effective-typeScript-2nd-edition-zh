# Item 14: Use readonly to Avoid Errors Associated with Mutation

## 要点

- 如果函数不会修改参数，给数组参数加上 `readonly`，对象参数用 `Readonly`，这样可以让函数的使用约定更清晰，也能避免实现过程中不小心修改参数。
- 理解 `readonly` 和 `Readonly` 只是浅层保护，对象的嵌套属性或方法本身不会受影响。
- 使用 `readonly` 可以防止误操作带来的修改，并帮助你定位代码中发生变更的地方。
- 分清 `const` 和 `readonly`：`const` 阻止变量被重新赋值，`readonly` 阻止对象或数组内部被修改。

## 正文

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

---

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

---

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

---

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

---

```ts
interface Outer {
  inner: {
    x: number
  }
}
const obj: Readonly<Outer> = { inner: { x: 0 } }
obj.inner = { x: 1 }
//  ~~~~~ Cannot assign to 'inner' because it is a read-only property
obj.inner.x = 1 // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgPIFdJWQbwFDLKgjQBcuBhyAHuSOgLYBG0A3JQL55cID2IAZzDJeTAFbkAShDgATfgBsAngB4MWAHzIAvLiIgSUcjhrkADMg4d2osQDpi0HXtrIAjJfYB6L4QB+AQHIAMJwBrzCcAICwADmIMhgvMgA5I5QKcgsCHDoAijAwsACyHDIUDKyALSKSsgADlC89dBgSni2DgbQdtTObqyEPmgA0nhAA)

---

```ts
type T = Readonly<Outer>
//   ^? type T = {
//        readonly inner: {
//          x: number;
//        };
//      }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgPIFdJWQbwFDLKgjQBcuBhyAHuSOgLYBG0A3JQL55cID2IAZzDJeTAFbkAShDgATfgBsAngB4MWAHzIAvLiIgSUcjhrkADMg4d2osQDpi0HXtrIAjJfYB6L4QB+AQHIAMJwBrzCcAICwADmIMhgvMgA5I5QKcgsCHDoAijAwsACyHDIUDKyALSKSsgADlC89dBgSni2DgbQdtTObqyEPmgA0nhtLcgAKs7ScrVqmNAa3r6EAHoA-IlKkzO6+MNUxxXzIMr6hsZ4R8fHrvTMbDdrd54vb1xAA)

---

```ts
const date: Readonly<Date> = new Date()
date.setFullYear(2037) // OK, but mutates date!
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgPIFdJWQbwFDLKgjQBcuBhyAHuSOgLYBG0A3JQL55cID2IAZzDJeTAFbkAShDgATfgBsAngB4MWAHzIAvLiIgSUcjhrkADMg4d2osQDpi0HXtrIAjJfYB6L4QB+AQHIAMJwBrzCcAICwADmIMhgvMgA5I5QKcgsCHDoAijAwsACyHDIUDKyALSKSsgADlC89dBgSni2DgbQdtTObqyEPmgA0nh8gsKycJBSlbUqACIzEFq6JADuyMuQABQAlOzTkHb5YABi6AoKAJoyULsATGYAzADsh0O+qCMANFmYZAMTArErHCAAQjwQA)

---

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

---

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

---

```ts
const a: number[] = [1, 2, 3]
const b: readonly number[] = a
const c: number[] = b
//    ~ Type 'readonly number[]' is 'readonly' and cannot be
//      assigned to the mutable type 'number[]'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgPIFdJWQbwFDLKgjQBcuBhyAHuSOgLYBG0A3JQL55cID2IAZzDJeTAFbkAShDgATfgBsAngB4MWAHzIAvLiIgSUcjhrkADMg4d2osQDpi0HXtrIAjJfYB6L4QB+AQHIAMJwBrzCcAICwADmIMhgvMgA5I5QKcgsCHDoAijAwsACyHDIUDKyALSKSsgADlC89dBgSni2DgbQdtTObqyEPmgA0nh8gpF0jCxQANoAus5zbgA0yABM6wDMC+wTQlnkFXK1yPTM0IvOcPv8hwjTl-NLukzevlR+yAAqSi2pE7yEDKc4zK4LTLFQGVWqZMKyZA5cLCFh4YZUQhRGLxCCIpKJAAWKAYmDgTAUKDaAJSF1mixSeCAA)

---

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

---

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

---

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

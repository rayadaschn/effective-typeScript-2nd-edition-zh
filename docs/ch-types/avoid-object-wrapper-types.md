# 第 10 条: 避免使用对象包装类型（String, Number, Boolean, Symbol, BigInt）

## 要点

- 避免使用 TypeScript 的对象包装类型，优先使用原始类型：用 `string` 代替 `String`，`number` 代替 `Number`，`boolean` 代替 `Boolean`，`symbol` 代替 `Symbol`，`bigint` 代替 `BigInt`。
- 理解对象包装类型的作用是为原始值提供方法，避免直接实例化或使用它们，`Symbol` 和 `BigInt` 是例外。

## 正文

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

---

```ts
function getStringLen(foo: String) {
  return foo.length
}

getStringLen('hello') // OK
getStringLen(new String('hello')) // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQMpQE4zMgGVTAApg44AuRLXfASkQG8AoRRbdEbJcuAOgA2xZFAAWAbhYBfFizSYceQsRIAiMakGC4a+hPYB6Q4gDyAaXnpayoqTCoA7jSX51m7bvr6jJiyyA)

---

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

---

```ts
const s: String = 'primitive'
const n: Number = 12
const b: Boolean = true
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBBBcMDKUBOBLMBzGBeGARAA4YC26U6AbgKYEDcAUKJLGIgHICupARjajwwAjACYmLaDF6IAQiBAAbGgEMwQtFxpMgA)

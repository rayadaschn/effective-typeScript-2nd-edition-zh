# 第 16 条: 优先使用更精确的索引签名替代方案

## 要点

- 了解索引签名的缺点：它们和 `any` 类似，会削弱类型安全，也降低语言服务的辅助效果。
- 尽量用更精确的类型替代索引签名，比如接口、`Map`、`Record`、映射类型，或者带有限制键类型的索引签名。

## 正文

JavaScript 最棒的特性之一就是它创建对象的便捷语法：

```ts
const rocket = {
  name: 'Falcon 9',
  variant: 'Block 5',
  thrust: '7,607 kN',
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBATiYBrAprAvDA3gKBjMAQwFsUAuGAcgDFCAbUMGATkoBo8YA3QuAS0JgoFSgCE6iJDACs7TlAAWcAK7QRAdjYA2AAzqYSAHJyAvgG4cQA)

JavaScript 中的对象将字符串（或符号）键映射到任何类型的值。TypeScript 允许你通过在类型上指定索引签名来表示这样的灵活映射：

```ts
type Rocket = { [property: string]: string }
const rocket: Rocket = {
  name: 'Falcon 9',
  variant: 'v1.0',
  thrust: '4,940 kN',
} // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBASg9gYwNYWFAvFA3gbTAJzkn1AC4oBnYfASwDsBzAXXKtsYF8BuAKATjpUohZKnLxRaTFh5QodAIYBbCOQDkAMQUAbfnSgBONQBpZUAG4LaCusHXmAjADoADCbPAAFvgCuVdQAsxgYBLlBIAHLu3HIA9LFQAPIA0jxAA)

`[property: string]: string` 是“索引签名”的写法。它包含三个部分：

1. **键的名字**
   这个名字只是为了方便阅读和写文档，对类型检查没有任何影响。

2. **键的类型**
   键的类型必须是 `string`、`number` 或 `symbol` 之一（也就是 `PropertyKey`）。通常我们用 `string` 或某些字符串字面量的联合类型。尽量避免使用 `number` 类型的键，后面第 17 条会讲为什么。`symbol` 类型在实际项目中也很少用。

3. **值的类型**
   值可以是任何类型。

虽然这段代码能通过类型检查，但有几个缺点：

- 它允许出现任意的键，包括拼错的。例如你写成了 `Name` 而不是 `name`，它也不会报错。
- 它不要求一定要有特定的键存在。就算是空对象 `{}`，也能通过检查。
- 它无法为不同的键设定不同的值类型。比如我们想让 `thrust` 是数字类型而不是字符串类型，就做不到。
- TypeScript 的自动补全等功能对这种写法基本帮不上忙。你输入 `name:` 的时候，TS 不知道你要写哪个键，也就没法提供提示。

整体来说，索引签名不够精确，大多数时候都有更好的替代方案。在这个例子里，我们可以用 interface 来定义 `Rocket`。

```ts
interface Rocket {
  name: string
  variant: string
  thrust_kN: number
}
const falconHeavy: Rocket = {
  name: 'Falcon Heavy',
  variant: 'v1',
  thrust_kN: 15200,
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoHsEGsJmQbwChlkQ4BbCALmQGcwpQBzAbmOQDc5G5wb7GIVuzAALKAFd6AfSwA5GiAnkARtDYBfQgnQh6yeABsdIABIQ4HAJ40M2XMgC8BdmUo0A5ADE4x3cnNLKw8AGnYuHj5kDw4ARlCRcSkwWQVkWIBWACYABhywjTYgA)

现在 `thrust_kN` 是一个数字类型了，TypeScript 会检查所有必填字段是否存在。同时，TypeScript 提供的强大功能都能正常使用，比如自动补全、跳转到定义和重命名等。

那索引签名到底该什么时候用呢？

从经验来看，索引签名是描述“真正动态的数据”的最佳方式。比如你从一个 CSV 文件中读取数据，它有表头行（列名），然后你想把每一行数据表示成一个对象，把列名映射到对应的值，这种场景就适合用索引签名。

```ts
function parseCSV(input: string): { [columnName: string]: string }[] {
  const lines = input.split('\n')
  const [headerLine, ...rows] = lines
  const headers = headerLine.split(',')
  return rows.map((rowStr) => {
    const row: { [columnName: string]: string } = {}
    rowStr.split(',').forEach((cell, i) => {
      row[headers[i]] = cell
    })
    return row
  })
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoHsEGsJmQbwChlkQ4BbCALmQGcwpQBzAbmOQDc5G5wb7GIVuzAALKAFd6AfSwA5GiAnkARtDYBfQgnQh6yeABsdIABIQ4HAJ40M2XMgC8BdmUo0A5ADE4x3cnNLKw8AGnYuHj5kDw4ARlCRcSkwWQVkWIBWACYABhywjTYYCRAEMGB-AAduWggAYQBlADUAClBKiTB+BmYAShp8AG0dQ2UQOQpqOh6hAF1uwSYNQdmXEhN9Q1AIWidkds6AOlpKrbAWjwAdEA9etnXdfUHRCwATaAAZbZDkQ7+odAAd1oq2cWxAO3uyA2eBecHeUF2zjhCK+EOOp2A51CtyhUFwEigIGQAOBh3IcEqLVJDQYTgAfGsSNDHnhSQNhuhRuRxpMFsx5tNFho9vhCuwSDSGBizhcQrdDjB0FAAKKIUQtFpIQyGH7AXoMpnMklA55vaC0QbAWag6EQHVQkgaO4SkkEokmwFQ52aQhAA)

在这种通用场景下，我们事先并不知道列名会是什么，所以也没法写出更精确的类型。如果 `parseCSV` 的使用者在某个具体情况下知道列名是什么，他们就可以通过类型断言来指定更具体的类型：

```ts
interface ProductRow {
  productId: string
  name: string
  price: string
}

declare let csvData: string
const products = parseCSV(csvData) as unknown[] as ProductRow[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoHsEGsJmQbwChlkQ4BbCALmQGcwpQBzAbmOQDc5G5wb7GIVuzAALKAFd6AfSwA5GiAnkARtDYBfQgnQh6yeABsdIABIQ4HAJ40M2XMgC8BdmUo0A5ADE4x3cnNLKw8AGnYuHj5kDw4ARlCRcSkwWQVkWIBWACYABhywjTYYCRAEMGB-AAduWggAYQBlADUAClBKiTB+BmYAShp8AG0dQ2UQOQpqOh6hAF1uwSYNQdmXEhN9Q1AIWidkds6AOlpKrbAWjwAdEA9etnXdfUHRCwATaAAZbZDkQ7+odAAd1oq2cWxAO3uyA2eBecHeUF2zjhCK+EOOp2A51CtyhUFwEigIGQAOBh3IcEqLVJDQYTgAfGsSNDHnhSQNhuhRuRxpMFsx5tNFho9vhCuwSDSGBizhcQrdDjB0FAAKKIUQtFpIQyGH7AXoMpnMklA55vaC0QbAWag6EQHVQkgaO4SkkEokmwFQ52aQigSCwRAoAAKANeEjKGEBTMqYYjYAAkq9+UIoW4pgJmFDY8AkCnhFpCO8EIZuChDA4ELQOAAROBgOD5tgw5Cx9DhspI1s1erNLXVusNg1wXYlLAgIEgFbIEfIUPt+NRlZsIA)

当然，运行时的列名是否真的符合你的预期是没有保障的。你可以通过以下方式降低出错风险：

- 把值的类型改成 `string | undefined`，以防某些键不存在；
- 或者开启编译选项 `noUncheckedIndexedAccess`（详见第 48 条），这样 TypeScript 会强制你处理可能为 `undefined` 的情况。

不过，其实有一种更好的方式来表示动态数据，那就是用 `Map` 类型，也叫“关联数组”。下面是一个用 `Map` 实现 `parseCSV` 的示例：

```ts
function parseCSVMap(input: string): Map<string, string>[] {
  const lines = input.split('\n')
  const [headerLine, ...rows] = lines
  const headers = headerLine.split(',')
  return rows.map((rowStr) => {
    const row = new Map<string, string>()
    rowStr.split(',').forEach((cell, i) => {
      row.set(headers[i], cell)
    })
    return row
  })
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoHsEGsJmQbwChlkQ4BbCALmQGcwpQBzAbmOQDc5G5wb7GIVuzAALKAFd6AfSwA5GiAnkARtDYBfQgnQh6yeABsdIABIQ4HAJ40M2XMgC8BdmUo0A5ADE4x3cnNLKw8AGnYuHj5kDw4ARlCRcSkwWQVkWIBWACYABhywjTYYCRAEMGB-AAduWggAYQBlADUAClBKiTB+BmYAShp8AG0dQ2UQOQpqOh6hAF1uwSYNQdmXEhN9Q1AIWidkds6AOlpKrbAWjwAdEA9etnXdfUHRCwATaAAZbZDkQ7+odAAd1oq2cWxAO3uyA2eBecHeUF2zjhCK+EOOp2A51CtyhUFwEigIGQAOBh3IcEqLVJDQYTgAfGsSNDHnhSQNhuhRuRxpMFsx5tNFho9vhCuwSDSGBizhcQrdDjB0FAAKKIUQtFpIQyGH7AXoMpnMklA55vaC0QbAWag6EQHVQkgaO4SkkEokmwFQ52aQigSCwRAoAAKANeEjKGEBTMqYYjYAAkq9+UIoW4pgJmFDY8AkCnhFpCO8EIZuChDA4ELQOAAROBgOD5tgw5Cx9DhspI1s1erNLXVusNg1wXYlLAgIEgFbIEfIUPt+NRlZFEplCrE6qI3tNACylLaIA6XSFfRoe8qAB5M0IftemPTp0QHno8OCdnsDmAZViLtdcewWzNeFPm+X5-iBEE9jfWgoRbFELT2eCoDRCBv2xeUXUld1iVJWhyX3KUoENJ9mRbUk9ghaNzyvGYmFvWj6RaTDmUItC5QVJVVXVTVtV1fYDUcRkSONUljlwFokMta0fl45inTkt0wEJHCgW9F0tCAA)

现在，字段必须通过 `get` 方法来访问，并且返回值始终可能是 `undefined`，这是 `Map` 的特性之一：你不能确定某个键一定存在，所以 TypeScript 会强制你处理这种不确定性。

```ts
const rockets = parseCSVMap(csvData)
const superHeavy = rockets[2]
const thrust_kN = superHeavy.get('thrust_kN') // 74,500
//    ^? const thrust_kN: string | undefined
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoHsEGsJmQbwChlkQ4BbCALmQGcwpQBzAbmOQDc5G5wb7GIVuzAALKAFd6AfSwA5GiAnkARtDYBfQgnQh6yeABsdIABIQ4HAJ40M2XMgC8BdmUo0A5ADE4x3cnNLKw8AGnYuHj5kDw4ARlCRcSkwWQVkWIBWACYABhywjTYYCRAEMGB-AAduWggAYQBlADUAClBKiTB+BmYAShp8AG0dQ2UQOQpqOh6hAF1uwSYNQdmXEhN9Q1AIWidkds6AOlpKrbAWjwAdEA9etnXdfUHRCwATaAAZbZDkQ7+odAAd1oq2cWxAO3uyA2eBecHeUF2zjhCK+EOOp2A51CtyhUFwEigIGQAOBh3IcEqLVJDQYTgAfGsSNDHnhSQNhuhRuRxpMFsx5tNFho9vhCuwSDSGBizhcQrdDjB0FAAKKIUQtFpIQyGH7AXoMpnMklA55vaC0QbAWag6EQHVQkgaO4SkkEokmwFQ52aQigSCwRAoAAKANeEjKGEBTMqYYjYAAkq9+UIoW4pgJmFDY8AkCnhFpCO8EIZuChDA4ELQOAAROBgOD5tgw5Cx9DhspI1s1erNLXVusNg1wXYlLAgIEgFbIEfIUPt+NRlZFEplCrE6qI3tNACylLaIA6XSFfRoe8qAB5M0IftemPTp0QHno8OCdnsDmAZViLtdcewWzNeFPm+X5-iBEE9jfWgoRbFELT2eCoDRCBv2xeUXUld1iVJWhyX3KUoENJ9mRbUk9ghaNzyvGYmFvWj6RaTDmUItC5QVJVVXVTVtV1fYDUcRkSONUljlwFokMta0fl45inTkt0wEJHCgW9F0tDIzAcDALtN1qRpd33Kta3rOAXRbWgJEqaBAmsPYAXsHTBiyWZm1ZZAxEkGR5D2SzrKgWyrEOJhxI8TzklSXESAAemi5AAHYABYQgyPJCFi40AD0AH4WRfDykm8tI72QAAfZASneGBtleQggA)

如果你想从 `Map` 中拿到一个普通的对象类型，你就需要写一些解析代码，把 `Map` 转换成对象：

```ts
function parseRocket(map: Map<string, string>): Rocket {
  const name = map.get('name')
  const variant = map.get('variant')
  const thrust_kN = Number(map.get('thrust_kN'))
  if (!name || !variant || isNaN(thrust_kN)) {
    throw new Error(`Invalid rocket: ${map}`)
  }
  return { name, variant, thrust_kN }
}
const rockets = parseCSVMap(csvData).map(parseRocket)
//    ^? const rockets: Rocket[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoHsEGsJmQbwChlkQ4BbCALmQGcwpQBzAbmOQDc5G5wb7GIVuzAALKAFd6AfSwA5GiAnkARtDYBfQgnQh6yeABsdIABIQ4HAJ40M2XMgC8BdmUo0A5ADE4x3cnNLKw8AGnYuHj5kDw4ARlCRcSkwWQVkWIBWACYABhywjTYYCRAEMGB-AAduWggAYQBlADUAClBKiTB+BmYAShp8AG0dQ2UQOQpqOh6hAF1uwSYNQdmXEhN9Q1AIWidkds6AOlpKrbAWjwAdEA9etnXdfUHRCwATaAAZbZDkQ7+odAAd1oq2cWxAO3uyA2eBecHeUF2zjhCK+EOOp2A51CtyhUFwEigIGQAOBh3IcEqLVJDQYTgAfGsSNDHnhSQNhuhRuRxpMFsx5tNFho9vhCuwSDSGBizhcQrdDjB0FAAKKIUQtFpIQyGH7AXoMpnMklA55vaC0QbAWag6EQHVQkgaO4SkkEokmwFQ52aQigSCwRAoAAKANeEjKGEBTMqYYjYAAkq9+UIoW4pgJmFDY8AkCnhFpCO8EIZuChDA4ELQOAAROBgOD5tgw5Cx9DhspI1s1erNLXVusNg1wXYlLAgIEgFbIEfIUPt+NRlZFEplCrE6qI3tNACylLaIA6XSFfRoe8qAB5M0IftemPTp0QHno8OCdnsDmAZViLtdcewWzNeFPm+X5-iBEE9jfWgoRbFELT2eCoDRCBv2xeUXUld1iVJWhyX3KUoENJ9mRbUk9ghaNzyvGYmFvWj6RaTDmUItC5QVJVVXVTVtV1fYDUcRkSONUljlwFokMta0fl45inTkt0wEJHCgW9F0tGKUpyiqHs7Bwc4KUqM9KRoxZ6MWel+jQTB9KZFt0z2QzDiYcSPHTf9n30CJgF4PBnCclzsW83yPJZF9kDESQZHkPY5GUNQoBaALXMi5JUluZjgBgZAWgAQgcgAfArkFy4LwGQIr9loCY5BaVLorkXoDWEiLxCBUgIGjFUoABRKAAMExALgtleE17GPAASfBDI0PrmK0LClI9fB0x+MqwB+eqUnkcUtDImzcC7TdakaXd9yrWt6zgXp8KpY6ID03AXQAeme40AD0AH4wv0AFxtoWwDrAFZCCAA)

虽然这样做可能显得有点麻烦，但它能确保你的数据结构确实符合预期。如果数据格式有问题，你会在加载数据时就发现错误，而不是等到使用数据时才踩坑。

这种先用宽泛类型（比如 `Map<string, string>`），再通过校验转换成具体类型（比如 `Rocket`）的做法，在 TypeScript 中非常常见。第 74 条会讲更系统的运行时类型校验方法。

除了更好地表达动态数据外，`Map` 还能避开一些跟原型链有关的经典坑。

另外，如果你的类型只可能包含有限的一些字段，就不要用索引签名来描述。比如你知道数据里只会有 `A`、`B`、`C`、`D` 这些键，但不确定具体会有多少个，可以用可选字段或者联合类型来建模：

```ts
interface Row1 {
  [column: string]: number
} // Too broad
interface Row2 {
  a: number
  b?: number
  c?: number
  d?: number
} // Better
type Row3 =
  | { a: number }
  | { a: number; b: number }
  | { a: number; b: number; c: number }
  | { a: number; b: number; c: number; d: number } // Also better
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoHsEGsJmQbwChlkQ4BbCALmQGcwpQBzAbmOQDc5G5wb7GIVuzAALKAFd6AfSwA5GiAnkARtDYBfQgnQh6yeABsdIABIQ4HAJ40M2XMgC8BdmUo0A5ADE4x3cnNLKw8AGnYuHj5kDw4ARlCRcSkwWQVkWIBWACYABhywjTYYCRAEMGB-AAduWggAYQBlADUAClBKiTB+BmYAShp8AG0dQ2UQOQpqOh6hAF1uwSYNQdmXEhN9Q1AIWidkds6AOlpKrbAWjwAdEA9etnXdfUHRCwATaAAZbZDkQ7+odAAd1oq2cWxAO3uyA2eBecHeUF2zjhCK+EOOp2A51CtyhUFwEigIGQAOBh3IcEqLVJDQYTgAfGsSNDHnhSQNhuhRuRxpMFsx5tNFho9vhCuwSDSGBizhcQrdDjB0FAAKKIUQtFpIQyGH7AXoMpnMklA55vaC0QbAWag6EQHVQkgaO4SkkEokmwFQ52aQigSCwRAoAAKANeEjKGEBTMqYYjYAAkq9+UIoW4pgJmFDY8AkCnhFpCO8EIZuChDA4ELQOAAROBgOD5tgw5Cx9DhspI1s1erNLXVusNg1wXYlLAgIEgFbIEfIUPt+NRlZFEplCrE6qI3tNACylLaIA6XSFfRoe8qAB5M0IftemPTp0QHno8OCdnsDmAZViLtdcewWzNeFPm+X5-iBEE9jfWgoRbFELT2eCoDRCBv2xeUXUld1iVJWhyX3KUoENJ9mRbUk9ghaNzyvGYmFvWj6RaTDmUItC5QVJVVXVTVtV1fYDUcRkSONUljlwFokMta0fl45inTkt0wEJHCgW9F0tH9aB4CQNAgViAhkE5bkQHzQUlFUaBkBFZAAHobOQAAVdB0GQFQAXhP1wC0oNdMBLIDMbUhlDUKAWFcgB+RRgvUaFIqCizQuQV44vMkKrJIOzkAAIVwANCDAKxKhQKMAGYnFdAAfAKooSsKtGNKr8BnGqQrClQWpi+rmUa5r4ta1yOsShBBrCqzKuqvqYvayahpGpLBqs0bMoAQUMWgXLUMA8qAA)

最后这种写法是最精确的，但用起来可能没那么方便。关于如何通过类型设计避免无效状态，可以参考第 29 条。

如果你觉得索引签名的问题在于 `string` 太宽泛了，那可以用 `Record` 类型。它是一个泛型工具类型，允许你灵活指定键的范围，特别是可以传入字符串字面量的子集作为键：

```ts
type Vec3D = Record<'x' | 'y' | 'z', number>
//   ^? type Vec3D = {
//        x: number;
//        y: number;
//        z: number;
//      }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoHsEGsJmQbwChlkQ4BbCALmQGcwpQBzAbmOQDc5G5wb7GIVuzAALKAFd6AfSwA5GiAnkARtDYBfQgnQh6yeABsdIABIQ4HAJ40M2XMgC8BdmUo0A5ADE4x3cnNLKw8AGnYuHj5kDw4ARlCRcSkwWQVkWIBWACYABhywjTYYCRAEMGB-AAduWggAYQBlADUAClBKiTB+BmYAShp8AG0dQ2UQOQpqOh6hAF1uwSYNQdmXEhN9Q1AIWidkds6AOlpKrbAWjwAdEA9etnXdfUHRCwATaAAZbZDkQ7+odAAd1oq2cWxAO3uyA2eBecHeUF2zjhCK+EOOp2A51CtyhUFwEigIGQAOBh3IcEqLVJDQYTgAfGsSNDHnhSQNhuhRuRxpMFsx5tNFho9vhCuwSDSGBizhcQrdDjB0FAAKKIUQtFpIQyGH7AXoMpnMklA55vaC0QbAWag6EQHVQkgaO4SkkEokmwFQ52aQigSCwRAoAAKANeEjKGEBTMqYYjYAAkq9+UIoW4pgJmFDY8AkCnhFpCO8EIZuChDA4ELQOAAROBgOD5tgw5Cx9DhspI1s1erNLXVusNg1wXYlLAgIEgFbIEfIUPt+NRlZFEplCrE6qI3tNACylLaIA6XSFfRoe8qAB5M0IftemPTp0QHno8OCdnsDmAZViLtdcewWzNeFPm+X5-iBEE9jfWgoRbFELT2eCoDRCBv2xeUXUld1iVJWhyX3KUoENJ9mRbUk9ghaNzyvGYmFvWj6RaTDmUItC5QVJVVXVTVtV1fYDUcRkSONUljlwFokMta0fl45inTkt0wEJHCgW9F0tDAKxKhQJoIAQABmGs9lQPTlVeC8PAADw8ZAAB9omCOzogAL1CUhlDUKB6TYAB6HzmQAPQAfmQTTtOQXSDKM5wiD841jUsxQPPUQg4vikgbHc1QUrS9LnKS7KoF8-z4q0IA)

`Record` 是对“映射类型”的内置封装（详见第 15 条）。

最后，你还可以用索引签名来**关闭多余属性检查**（详见第 11 条）。比如，你定义了一个 `ButtonProps` 类型，里面有一些已知的属性，但你仍然希望它能接收任意其他属性，就可以这样写：

```ts
declare function renderAButton(props: ButtonProps): void
interface ButtonProps {
  title: string
  onClick: () => void
}

renderAButton({
  title: 'Roll the dice',
  onClick: () => alert(1 + Math.floor(6 * Math.random())),
  theme: 'Solarized',
  // ~~~~ Object literal may only specify known properties…
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXzlVBgEEAhZDDPACgAcYc6BnALngqrwAVGWBKdgDccWYAG4AUFlQYQMRFDAJO1VLybN4Ab0nx42DBBDtmGGDIDmU-XgDCELGADW7Gv3gBeAHzwRYqQBfSUlCYnJKNRpdfUNjdgByACUcCAgDAAsEYCcQBIAaPXh7Rxc3Dx94KGMYDBoARngAangAWSgMDIA6RAgcHBgaADZ4ACo2ju6YKCIcAFt3fn5C2Ky5k3gEgGVU2CwALxBgAskAelP4AD9ry-gAeQAjACtwDHhHOWn0uagAT2LUBB-sw6OAsIh-s5UDgAO74BhMeTYEDMQBkBJJAvwpEA)

加上索引签名后，上述错误就消失了。

```ts
interface ButtonProps {
  title: string
  onClick: () => void
  [otherProps: string]: unknown
}

renderAButton({
  title: 'Roll the dice',
  onClick: () => alert(1 + Math.floor(20 * Math.random())),
  theme: 'Solarized', // ok
})
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXzlVBgEEAhZDDPACgAcYc6BnALngqrwAVGWBKdgDccWYAG4AUFlQYQMRFDAJO1VLybN4Ab0nx42DBBDtmGGDIDmU-XgDCELGADW7Gv3gBeAHzwRYm3gAbRwMAAt5DRZTcysAXXY0Z1QcAHdUKQBfSUlCYnJKNRpdfUNjdgByACUcCAgDCPhgJxAKgBo9eHtHFzcPH3goYxgMGgBGeABqeABZKHCAOkQIHBwYGgAmAAZ4ACpZ+bCFmCgiHABbd35+DtKI85N4CoBlWtgsAC8QYHb9AHo-l1nJJMvwpEA)

关键是，`title` 和 `onClick` 这两个属性的类型依然保持不变。如果你传一个数字给 `title`，依然会报类型错误。

你还可以限制这些额外属性必须符合某种规则。举例来说，有些 Web 组件允许任意属性，但要求属性名必须以 `"data-"` 开头。这时可以用索引签名配合模板字面量类型来实现，第 54 条会详细介绍。

总结来说，给数据类型加索引签名前要三思：

- 有没有更精确的替代方案？
- 能不能用接口而不带索引签名？
- 能不能用 `Map`？
- 能不能用映射类型？
- 如果都不行，至少要限制键的类型范围。

## 关键点总结

- 了解索引签名的缺点：它们和 `any` 类似，会削弱类型安全，也降低语言服务的辅助效果。
- 尽量用更精确的类型替代索引签名，比如接口、`Map`、`Record`、映射类型，或者带有限制键类型的索引签名。

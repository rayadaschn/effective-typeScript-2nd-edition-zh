# Item 54: Use Template Literal Types to Model DSLs and Relationships Between Strings

## 要点

- Use template literal types to model structured subsets of `string` types and domain-specific languages (DSLs).
- Combine template literal types with mapped and conditional types to capture nuanced relationships between types.
- Take care to avoid crossing the line into inaccurate types. Strive for uses of template literal types that improve developer experience without requiring knowledge of fancy language features.
- 使用模板字面量类型来建模 `string` 类型的结构化子集和领域特定语言（DSL）。
- 将模板字面量类型与映射类型和条件类型结合，以捕获类型之间的细微关系。
- 小心避免进入不准确类型的范畴。力求使用模板字面量类型来提升开发者体验，而不需要过多依赖复杂的语言特性。

## 正文

第 35 条建议在你自己的代码中使用更精确的字符串类型替代方案。但世界上有很多字符串，很难完全避免它们。在这些情况下，TypeScript 提供了自己独特的工具来捕获字符串中的模式和关系：模板字面量类型。本条目将探讨这个功能的工作原理，以及如何使用它来为原本无法类型化的代码带来安全性。

像所有编程语言一样，TypeScript 有一个字符串类型，但正如我们在前面的条目中看到的，它也有字符串字面量类型，这些类型的域由单个字符串值组成。这些通常与联合类型结合使用：

```ts
type MedalColor = 'gold' | 'silver' | 'bronze'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAshAmBDANgYQPbPQJygXigHIBzTeQqAHyIGcBLZANwmwusICNt0A7ALwiEA3ACggA)

使用字符串字面量类型的联合，你可以建模有限的字符串集合。使用 `string` 本身，你可以捕获所有可能字符串的无限集合。模板字面量类型让你可以建模介于两者之间的东西，例如，所有以 `pseudo` 开头的字符串集合：

```ts
type PseudoString = `pseudo${string}`
const science: PseudoString = 'pseudoscience' // ok
const alias: PseudoString = 'pseudonym' // ok
const physics: PseudoString = 'physics'
//    ~~~~~~~ Type '"physics"' is not assignable to type '`pseudo${string}`'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBACgzhArgEwPYGVgCcCWA7AcygF4oADMBFVAEgG85t8CBfMgbgCgBjVPRqHG44IebhABcsKmky5CJKAHJKSNEJFiIS9lCgB6fVFQBrHnwEBDADY5LcKfDUYmC0ipl8QAWx17Dxma8-MBQYAAWIHA43A7SznLMiiqR0bE6nAF6UAB+efk5UAAq4NBKAEQRUTFw5UpQOHBQeKih9tEEeJYARtbQwKhQoJDKFJ70jPKsZEoAdJxAA)

使用字符串字面量类型的联合，你可以建模有限的字符串集合。使用 `string` 本身，你可以捕获所有可能字符串的无限集合。模板字面量类型让你可以建模介于两者之间的东西，例如，所有以 `pseudo` 开头的字符串集合：

```ts
type PseudoString = `pseudo${string}`
const science: PseudoString = 'pseudoscience' // ok
const alias: PseudoString = 'pseudonym' // ok
const physics: PseudoString = 'physics'
//    ~~~~~~~ Type '"physics"' is not assignable to type '`pseudo${string}`'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBACgzhArgEwPYGVgCcCWA7AcygF4oADMBFVAEgG85t8CBfMgbgCgBjVPRqHG44IebhABcsKmky5CJKAHJKSNEJFiIS9lCgB6fVFQBrHnwEBDADY5LcKfDUYmC0ipl8QAWx17Dxma8-MBQYAAWIHA43A7SznLMiiqR0bE6nAF6UAB+efk5UAAq4NBKAEQRUTFw5UpQOHBQeKih9tEEeJYARtbQwKhQoJDKFJ70jPKsZEoAdJxAA)

像 `string` 一样，`PseudoString` 类型有一个无限域（第 7 条）。但与 `string` 不同，`PseudoString` 类型中的值具有一些结构：它们都以 `pseudo` 开头。与其他类型级构造一样，模板字面量类型的语法故意让人联想到 JavaScript 的模板字面量。

JavaScript 中充斥着结构化字符串。例如，如果你想要要求一个对象具有一些已知的属性集，但也允许任何以 `data-` 开头的其他属性怎么办？（这种模式在 DOM 中很常见。）

```ts
interface Checkbox {
  id: string
  checked: boolean
  [key: `data-${string}`]: unknown
}

const check1: Checkbox = {
  id: 'subscribe',
  checked: true,
  value: 'yes',
  // ~~~~ Object literal may only specify known properties,
  //        and 'value' does not exist in type 'Checkbox'.
  'data-listIds': 'all-the-lists', // ok
}
const check2: Checkbox = {
  id: 'subscribe',
  checked: true,
  listIds: 'all-the-lists',
  // ~~~~~~ Object literal may only specify known properties,
  //          and 'listIds' does not exist in type 'Checkbox'
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIAsIINYCMD2AHsgN4BQyywAJgFzIDOYUoA5gNwXIKY4R3IC+ADYQ4ITpQDa2CAE96AA2pwwcALQASEkxYhWAX0UBdegFcQ2EPgDuEsgbJkE+EE269sARnoYseImQAXlIuGnoAcgYzXAYEFlwICIAaLh5-fnpmMwhUygA3OGEcyLkIBhSyAHoq5AA-BrrkAHlcACssMGRhYEgoIuQAWzg5ZFdhUYYAByxgGFGrWxBkKah8GagwYHLUmsp9-fFqZAjC4qTkanxy5GsuiEJgd1BkMDkZk78cAkIIgDouBEVGp1D0mABJagVSJFYTqMCYUFPMAVZKUPb4bAOTguNxddI4ABMvk8P2CoUo4RO0Vi8WAiUqlAJsgE2VyXDBYEhDBhwjhCIgSKYqOqtUajRa7U63V60AGw1G40mMwQcwW1jsKzWGy2O1FBwNyCOJ053Iil2uDFu+Huj2eyzeHwiXwCv2xZCAA)

如果我们使用 `string` 作为索引类型，我们会失去对 `check1` 进行多余属性检查的好处（参见 第 11 条），并错误地允许 `check2` 上没有 `data-` 前缀的属性：

```ts
interface Checkbox {
  id: string
  checked: boolean
  [key: string]: unknown
}

const check1: Checkbox = {
  id: 'subscribe',
  checked: true,
  value: 'yes', // permitted
  'data-listIds': 'all-the-lists',
}
const check2: Checkbox = {
  id: 'subscribe',
  checked: true,
  listIds: 'all-the-lists', // also permitted, matches index type
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIAsIINYCMD2AHsgN4BQyywAJgFzIDOYUoA5gNwXIKY4R3IC+ADYQ4ITpQDa2CAE96TFiFYBdegFcQ2EPgDuEsgF8yZBPhBNuvbAEZ6GLHiLIAvKS416AcgYbcDAgsuBDeADRcPE789MwaEBGUAG5wwvE+chAM4ZQA9LnIAA7QALbAYJDUXN7UcGBwALTCwEwAktTZPqnCDWCYTS1g2RFGnOaWYNZOAEwONgTE7uSUXsi+-oHBoYlTfAJxCVzNbR1dwj19EANM2XkFqQz4RaXllWHIJXVRDFQg1BDEMByYrGThAA)

模板字面量类型对于建模字符串的子集很有帮助，但它们的真正力量来自于当我们将它们与泛型和类型推断结合以捕获类型之间的关系时。

考虑 DOM 提供的 `querySelector` 函数。TypeScript 已经足够聪明，如果你查询它，它会给你一个更具体的 `HTMLElement` 子类型：

```ts
const img = document.querySelector('img')
//    ^? const img: HTMLImageElement | null
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAlgWwOYwLwwCYmAVwQUzCgDoBHHfAJwE8BlfAG32ChEoAoByRJTgSgDcAKAD0ImBJgA9APwxQkWDwBcMABIAVALIAZAJIIAhknwBRJgSIwAPjDA4GDIUA)

这允许你访问 `img.src`，例如，这在不太具体的 `Element` 类型上是不被允许的。（第 75 条涵盖了 TypeScript 和 DOM。）

但这种聪明程度并不很深。如果你尝试查询具有特定 ID 的图像，你只会得到一个 `Element`：

```ts
const img = document.querySelector('img#spectacular-sunset')
//    ^? const img: Element | null
img?.src
//   ~~~ Property 'src' does not exist on type 'Element'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAlgWwOYwLwwCYmAVwQUzCgDoBHHfAJwE8BlfAG32ChEoAoByRJAYggAOzKAENcDEZQC0EHJHxROASgDcAKAD0GmDpgA9APwxQkWDwBcMAKJMCRGAB8YYHAwZqeB4hErBN2nQA-YJgABUoQIUooahhOH2BOTBB8CGcQWHwADzhoGHAYGKE4m3w7RWI1IA)

在模板字面量类型的帮助下，我们可以让这个工作。TypeScript 对 DOM 的类型声明（`lib.dom.d.ts`）包括从标签名到类型的映射：

```ts
interface HTMLElementTagNameMap {
  a: HTMLAnchorElement
  abbr: HTMLElement
  address: HTMLElement
  area: HTMLAreaElement
  // ... many more ...
  video: HTMLVideoElement
  wbr: HTMLElement
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgBIBUCyAZAogGwgFsJx04BzAOThMzgAdkBvAKGWQCI5OAuNLNgCCIBAAsA9lALFSYANzsucAEYqofAThklwijtwAmhqBADOZzRm2FdCpd1M9+14U51z9yAPTfkAOkDkIjgQAE9gqRRA-wcAN2BDCAkrQQA1ROSPPQcAd3VUm1kcgF9WIA)

以及一些 `querySelector` 的声明：

```ts
interface ParentNode extends Node {
  // ...
  querySelector<E extends Element = Element>(selectors: string): E | null
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgApyhcA5A9gExQgA9IR8BnZPQ5AbwChlkB6F5AOi6eQEcBXaAE8AyhAA2EBGFxQAPAFFkJMpWQLJAWyxhkAXnVadAPgAUFCVJlQKALmQUwUUAHMAlPaUAfZCH7jxAG4eNk5uAF8GIA)

现在我们可以使用模板字面量类型为 `tag#id` 情况添加一个重载：

```ts
type HTMLTag = keyof HTMLElementTagNameMap
declare global {
  interface ParentNode {
    querySelector<TagName extends HTMLTag>(
      selector: `${TagName}#${string}`
    ): HTMLElementTagNameMap[TagName] | null
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/KYDwDg9gTgLgBAbwL4CgYE8zDgCQCoCyAMngIYDmcAvHANbDoQBmuhRAogDbAC2wAdjDLkAcqT4FSYANwoAJsADGnUlGzlOEAEalOiFHDgBLQcChNSi7AAVVAmCIgL9hwwEcArmfQBlYN0UYaAAeA1dDYTE+OFAYATkAZ1ZiYTDDAD4ACjTXBP8lIKgALjgAAwASBEjxYCQAYkqEmCgTciRSnIBKEvxiLl57aokpAG0h4ABdOAAfOH4PTk5ZQ1RUIA)

之前的例子现在按你希望的方式工作，返回更精确的图像类型并允许访问其 `src` 属性：

```ts
const img = document.querySelector('img#spectacular-sunset')
//    ^? const img: HTMLImageElement | null
img?.src // ok
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/KYDwDg9gTgLgBAbwL4CgYE8zDgCQCoCyAMngIYDmcAvHANbDoQBmuhRAogDbAC2wAdjDLkAcqT4FSYANwoAJsADGnUlGzlOEAEalOiFHDgBLQcChNSi7AAVVAmCIgL9hwwEcArmfQBlYN0UYaAAeA1dDYTE+OFAYATkAZ1ZiYTDDAD4ACjTXBP8lIKgALjgAAwASBEjxYCQAYkqEmCgTciRSnIBKEvxiLl57aokpAG0h4ABdOAAfOH4PTk5ZQ1RURQh+JuMeSho5CEUPPkEAOk9vPwDCzIByIx26hKxAywXVAFoEj03gGBvO2QAekB4QAegB+ODrTbwe7kHpsACSPAowH6x3gs3mixQcPBJwSUEUhmBcAgtBQQA)

这很有帮助，但我们稍微偏离了目标：

```ts
const img = document.querySelector('div#container img')
//    ^? const img: HTMLDivElement | null
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/KYDwDg9gTgLgBAbwL4CgYE8zDgCQCoCyAMngIYDmcAvHANbDoQBmuhRAogDbAC2wAdjDLkAcqT4FSYANwoAJsADGnUlGzlOEAEalOiFHDgBLQcChNSi7AAVVAmCIgL9hwwEcArmfQBlYN0UYaAAeA1dDYTE+OFAYATkAZ1ZiYTDDAD4ACjTXBP8lIKgALjgAAwASBEjxYCQAYkqEmCgTciRSnIBKEvxiLl57aokpAG0h4ABdOAAfOH4PTk5ZQ1RURQh+JuMeSho5CEUPPkEAOk9vPwDCzIByOSMANzr1wVITM23yG87ZAHpf8IAPQA-HAXlsjDsemwACKPfrHeCzeaLFBAA)

CSS 选择器中的空格意味着"后代"。在这种情况下，我们的模板字面量类型 `${TagName}#${string}` 匹配了 `"div"`，然后是 `"#"`，然后是 `"container img"`。在尝试获得更精确的类型时，我们违反了 第 40 条的建议，即宁愿不精确也不要不准确。

虽然可以想象使用模板字面量类型构建整个 CSS 选择器解析器，但处理这个问题的一个不那么雄心勃勃的方法是使用另一个重载来防止 CSS 选择器中具有特殊含义的字符：

```ts
type CSSSpecialChars = ' ' | '>' | '+' | '~' | '||' | ','
type HTMLTag = keyof HTMLElementTagNameMap

declare global {
  interface ParentNode {
    // escape hatch
    querySelector(
      selector: `${HTMLTag}#${string}${CSSSpecialChars}${string}`
    ): Element | null

    // same as before
    querySelector<TagName extends HTMLTag>(
      selector: `${TagName}#${string}`
    ): HTMLElementTagNameMap[TagName] | null
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/KYDwDg9gTgLgBAbwL4CgYE8zDgYQMoFYDGAlgIYA2OAFmVAM5wC8cA5G3AD5sB873rANT82APxGtOnCQBpWAbjSZsACQAqAWQAyasgHNmcANbB0EAGZx12gKIVgAW2AA7GLr0A5Mk41kwilAATYCIKOmw9CggAI0pEFDg4EldgKHMyImwABXDXDwhg+MTEgHoSuGB6Ij9sWhgiagTigEcAV1T0PGB7IhhoAAom4rh6bpC+qAAuOAADABIEax19JABiBfoYKGS9JAX8QhDyKloGPYRN7eddmaG4AEppu0cXeG5nVooKAOGyke9sGRGNFgOZoMA7m0Ol0ehMADx3RLuLxOCogGAuQKMJbuO48QbDRKjWHQabzBDIgFrDZbHZIW7DR5WTRaZ5OVyUnx+ADanOAAF0uHAPl9FIlUKggA)

现在你至少为更复杂的选择器获得了一个不精确的类型，而不是一个不准确的类型：

```ts
const img = document.querySelector('img#spectacular-sunset')
//    ^? const img: HTMLImageElement | null
const img2 = document.querySelector('div#container img')
//    ^? const img2: Element | null
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/KYDwDg9gTgLgBAbwL4CgYE8zDgYQMoFYDGAlgIYA2OAFmVAM5wC8cA5G3AD5sB873rANT82APxGtOnCQBpWAbjSZsACQAqAWQAyasgHNmcANbB0EAGZx12gKIVgAW2AA7GLr0A5Mk41kwilAATYCIKOmw9CggAI0pEFDg4EldgKHMyImwABXDXDwhg+MTEgHoSuGB6Ij9sWhgiagTigEcAV1T0PGB7IhhoAAom4rh6bpC+qAAuOAADABIEax19JABiBfoYKGS9JAX8QhDyKloGPYRN7eddmaG4AEppu0cXeG5nVooKAOGyke9sGRGNFgOZoMA7m0Ol0ehMADx3RLuLxOCogGAuQKMJbuO48QbDRKjWHQabzBDIgFrDZbHZIW7DR5WTRaZ5OVyUnx+ADanOAAF0uHAPl9FIlUKgiBBnJskg4DCxAhAiK12TAAHRQqCdMa9AasEjy1b0YgwDKfOgAWnorRlwBgrHuij+xQAegB+OBSmXwQ16aZLACSDn0wDZryFIooKG9sr9ACZDEqVWrNe1tTDxvrAiQAG6rb1m5KpOV6R3O8puz2x33y+NPexqyOfaNAA)

这将有助于确保安全使用。关于 TypeScript 和 DOM 的更多信息，请参见 第 75 条。

模板字面量类型经常与条件类型结合使用来实现领域特定语言（DSL）的解析器，如 CSS 选择器。为了了解这是如何工作的，让我们尝试为 `objectToCamel` 函数获得精确的类型，该函数将蛇形命名对象的键转换为驼峰命名：

```ts
// e.g. foo_bar -> fooBar
function camelCase(term: string) {
  return term.replace(/_([a-z])/g, (m) => m[1].toUpperCase())
}

// (return type to be filled in shortly)
function objectToCamel<T extends object>(obj: T) {
  const out: any = {}
  for (const [k, v] of Object.entries(obj)) {
    out[camelCase(k)] = v
  }
  return out
}

const snake = { foo_bar: 12 }
//    ^? const snake: { foo_bar: number; }
const camel = objectToCamel(snake)
// camel's value at runtime is {fooBar: 12};
// we'd like the type to be {fooBar: number}
const val = camel.fooBar // we'd like this to have a number type
const val2 = camel.foo_bar // we'd like this to be an error
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEFMDoHNNAzA9og+gIwIYCdQFoB8CyAQtgFDwCuAdgMYAuAlotaLRgLbgA2AwhgGdwACnrgsHAFygB9LI2rQAlKADeZUKCzh6lLKzETI2gA7cMtEcBTCA2hlwAvALpLg0ADSgOoALyEOWwBGZ0h6RABVExNxfiFhJSUAbjIAXzIyEFBhbV19UHoATxiCxFA0cARGbm5wABNQBRkAC0Qsem5CpQoaBmZWRDQAK3AGABVEfi5uAB4xiAAPMWo6gVBBkYZ8YQ3pMZV1TVoWWXXKemkMakK-NVSUzSQcYWPqU9sAay8AN2d1+FAAHlhqN6JBwNQ5IxwAIdsNEmoNJozvRbOxpnERB8lH9fKBvg9QOlNLk9ANzil0mRXqcBNQMB9KnjVEhUJgsNIggAme6ZMDIgB6AH42Cd6DJ6YzpKoiGzsNJqJQOBUsEkidSxWxODxbhtQRMpjxhHSGeBknytdMAORrb4YbiUSoYcVYGhMLiNNYskjy0Dc3lZADu4CtDW4jEZBWalSKJXC5Uq3sQpA5oEVyvE6Rp4rt3Fu6J4kFZKbVoCDIbDEZjzUYa3jzQw3ydaaVKoKxXAGreOftXPz2u4ReQ6GwpfLodA4cj9BrdbKFVAVwgWCwbTIQA)

让我们首先定义一个类型级的 `ToCamelOnce` 辅助函数：

```ts
type ToCamelOnce<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<Tail>}`
  : S

type T = ToCamelOnce<'foo_bar'> // type is "fooBar"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKg9gYQIYFsIBsDyA7AxhAHgGUoIAPYCbAEwGcpbgAnAS2wHMA+KAXgCgogqCXKUa9AAYASAN5sAZhCZQAEhCTUAvgH1ZCpbCQt0miQKEB+KNJlqNm2cjAtgSdCwBehGEfSdT5oIAXMIA3Hx8oJCwvLCIqBg4+AQA5PJwcNoARkhMKZyhggD0RVBR0Cz0AETpcABCuVV8QA)

这里我们在条件类型中使用了 `infer` 关键字来提取下划线前后的字符串部分。当 `S` 是 `"foo_bar"` 时，`Head` 是字符串字面量类型 `"foo"`，`Tail` 是字符串字面量类型 `"bar"`。当我们得到匹配时，我们构造一个没有下划线且尾部首字母大写的新字符串（使用模板字面量类型）（`Capitalize` 是一个内置辅助函数）。

为了让这个在具有多个下划线的字符串（如 `"foo_bar_baz"`）上工作，我们需要让它递归：

```ts
type ToCamel<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<ToCamel<Tail>>}`
  : S
type T0 = ToCamel<'foo'> // type is "foo"
type T1 = ToCamel<'foo_bar'> // type is "fooBar"
type T2 = ToCamel<'foo_bar_baz'> // type is "fooBarBaz"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKg9gYQIYFsIBsA8BlKEAewEAdgCYDOU5wATgJbEDmAfFALwBQU3UuBRZSgAMAJAG8GAMwg0oACQhJSAXwD64qTNhI66ZUK48A-FFFiFS5eORg6wJOjoAvCJnjI0WGDvTNm+w24ALl4Abg5QSFgABnZYRFQMTABySTg4ZOZQ7gB6HKhI6DpKACI0uBKI8GgYAEY490SsVPTVACMkGkzsqDyC6qhiqDL0gCFOysLYACYGhM8U8vbO5adu3PypoZG4cZpxp0qgA)

现在我们可以使用映射类型（第 15 条）给 `objectToCamel` 一个更精确的类型，该类型使用辅助函数重写键：

```ts
type ObjectToCamel<T extends object> = {
  [K in keyof T as ToCamel<K & string>]: T[K]
}

function objectToCamel<T extends object>(obj: T): ObjectToCamel<T> {
  // ... as before ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKg9gYQIYFsIBsA8BlKEAewEAdgCYDOU5wATgJbEDmAfFALwBQU3UuBRZSgAMAJAG8GAMwg0oACQhJSAXwD64qTNhI66ZUK48A-FFFiFS5eORg6wJOjoAvCJnjI0WGDvTNm+w24ALl4Abg5QSFgABnZYRFQMTABySTg4ZOZQ7gB6HKhI6DpKACI0uBKI8GgYAEY490SsVPTVACMkGkzsqDyC6qhiqDL0gCFOysLYACYGhM8U8vbO5adu3PypoZG4cZpxp0mBgHk2gCsIAGNgRoWYPEISCig4c6vgVjYoMUMAbQBpQbEKAAawgIDgklgUCQlFuSUBADIqLQGCwALohGAA9EcZThDiSACuxGudDgwNeF2u8K8DwEzyp72YAAoqViAJQhU7Um7zJIwVg-DZQAB04phlDaEDSNGg4tFhj6cgAkgARACihjlwCJNGBxCJ6HQkphxBA4RFGoAcmq8RwOEA)

现在类型正是我们想要的！

```ts
const snake = { foo_bar: 12 }
//    ^? const snake: { foo_bar: number; }
const camel = objectToCamel(snake)
//    ^? const camel: ObjectToCamel<{ foo_bar: number; }>
//                    (equivalent to { fooBar: number; })
const val = camel.fooBar
//    ^? const val: number
const val2 = camel.foo_bar
//                 ~~~~~~~ Property 'foo_bar' does not exist on type
//                         '{ fooBar: number; }'. Did you mean 'fooBar'?
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAKg9gYQIYFsIBsA8BlKEAewEAdgCYDOU5wATgJbEDmAfFALwBQU3UuBRZSgAMAJAG8GAMwg0oACQhJSAXwD64qTNhI66ZUK48A-FFFiFS5eORg6wJOjoAvCJnjI0WGDvTNm+w24ALl4Abg5QSFgABnZYRFQMTABySTg4ZOZQ7gB6HKhI6DpKACI0uBKI8GgYAEY490SsVPTVACMkGkzsqDyC6qhiqDL0gCFOysLYACYGhM8U8vbO5adu3PypoZG4cZpxp0mBgHk2gCsIAGNgRoWYPEISCig4c6vgVjYoMUMAbQBpQbEKAAawgIDgklgUCQlFuSUBADIqLQGCwALohGAA9EcZThDiSACuxGudDgwNeF2u8K8DwEzyp72YAAoqViAJQhU7Um7zJIwVg-DZQAB04phlDaEDSNGg4tFhj6cgAkgARACihjlwCJNGBxCJ6HQkphxBA4RFGoAcmq8RwOJcKdQqMQkGC4mIlh0aCFatN8Rw+jwAHomJ3EF3kN1gkJiKDezohQ0oaU0bLKR3O4BQS5NOJMmn89As6PuiAc8LB7hh3PZ3NNblvIseJLxxO+qAptMZ5hZyM5gBuDjiec8ovKeyr+VD4frw-QyaJqZk-ZdC9mXzHGAnrR9054h6PR4AfmfzyeoAAFGhwSA0UBQFpwZZdKCkOAQSjEOA5gjFHMKX6SAgxnY9wIg7hknbMYky7ZceygZRklFKA1ToUgoAhIkoDQJBgWfPZkiMKoogAJS-OB0EHVwyKQAB3T4oDo+j6SeSgADESTJICTBYqA4wBIFQXBSFmIYzFxPonFAymbAQGIYAAAtWxNL4KPIKiaMwHl3lpTAYJfH0lxXdMkL8A8axMOSFOU1TPQTWDO27GQMwdIA)

这个新的、更精确的 `objectToCamel` 类型是"花哨"TypeScript 功能被用来造福开发者的一个很好的例子。你不需要了解任何关于模板字面量类型、条件类型或映射类型的知识就可以使用 `objectToCamel`。但你仍然以更精确类型的形式从中受益。你对 TypeScript 的体验是它理解这段代码，即使你不完全理解它是如何做到的。

一个小问题是 `camel` 类型的显示并不理想。第 56 条将解释如何改进它。

## 要点回顾

- 使用模板字面量类型来建模 `string` 类型的结构化子集和领域特定语言（DSL）。
- 将模板字面量类型与映射类型和条件类型结合，以捕获类型之间的细微关系。
- 小心避免进入不准确类型的范畴。力求使用模板字面量类型来提升开发者体验，而不需要过多依赖复杂的语言特性。

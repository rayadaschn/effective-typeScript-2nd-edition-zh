# 限制 any 类型的使用

## 要点

- TypeScript 的 `any` 类型会关闭对某个标识符的大部分类型检查。
- 使用 `any` 会破坏类型安全，打破约定，降低开发体验，让重构容易出错，隐藏类型设计，削弱对类型系统的信任。
- 能不用 `any` 就别用！

## 正文

```ts
let ageInYears: number
ageInYears = '12'
// ~~~~~~~ Type 'string' is not assignable to type 'number'.
ageInYears = '12' as any // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/DYUwLgBAhg5iCSA7AmiKAnAzgLgogrgLYBGI6A3AFCwIppYQC8EA5AIwBMLVA9DxAD8hwgRAAqATwAOIVpjDoAlohgsIizHgD2kKJkyKYiKMVAQwW89NksCJMiwB01OElQZNzdl2iaoiCXIICD4IAHkAaUogA)

---

```ts
ageInYears += 1 // OK; at runtime, ageInYears is now "121"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/DYUwLgBAhg5iCSA7AmiKAnAzgLgogrgLYBGI6A3AFCwIppYQC8EA5AIwBMLVA9DxAD8hwgRAAqATwAOIVpjDoAlohgsIizHgD2kKJkyKYiKMVAQwW89NksCJMiwB01OElQZNzdl2iaoiCXIICD4IAHkAaRdadwYAamY2IJD+SKCoSHR8RDBFQhAAGmhXOg91TUQtAHcIACJONlrKIA)

---

```ts
function calculateAge(birthDate: Date): number {
  // ...
}

let birthDate: any = '1990-01-19'
calculateAge(birthDate) // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/DYUwLgBAhg5iCSA7AmiKAnAzgLgogrgLYBGI6A3AFCwIppYQC8EA5AIwBMLVA9DxAD8hwgRAAqATwAOIVpjDoAlohgsIizHgD2kKJkyKYiKMVAQwW89NksCJMiwB01OElQZNzdl2iaoiCXIICD4IAHkAaUoAM3xEAGMwRS1ECHioYHj8YCgwEABBOAAKYkV0MAALABFckFwavIBKXDtSdAgAb0pg0IBhMIBZAAUAJQBRAGUJ7oh0cHx0VIAGKh7+MYA5KsoAX0pKUEhS8ura3H8JJlY2AE4bpYBaJbYH2+5KdMzs2sKQErLKg0QI0giF+JF9kA)

---

```ts
interface Person {
  first: string
  last: string
}

const formatName = (p: Person) => `${p.first} ${p.last}`
const formatNameAny = (p: any) => `${p.first} ${p.last}`
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAXMhVKAOYDcRyANnBdbQ8wL4EEEOCiSxQAtnDAA5OOJQBeZAAoADtXTkcASmQKAfMgAGAEjyqAdKXJheyM5fYVeR5kJAiYYyTLkQAgiAAnnoq6shwwboGxg5WZM725hZOtq4EQA)

---

```ts
interface Person {
  firstName: string
  last: string
}
const formatName = (p: Person) => `${p.firstName} ${p.last}`
const formatNameAny = (p: any) => `${p.first} ${p.last}`
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAcnALYQBcyFUoA5gNxHIA2cFjzNpwC+BBDgoksUGnCq0UAXmQAKAA6N05HAEpkigHzIABgBI8agHSly8usOTmrvCsOOdxISTGmy7EAEEQAE99VQ1kOBC9QxMnazJXRwtLFzA3TiA)

---

```ts
interface ComponentProps {
  onSelectItem: (item: any) => void
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHsC2AHdILgAKU62AzsgN4BQyyeAyhADYQJgCSkmAXMgBTBufOCACeASmQBeAHzIAbumAATANzUAvtSA)

---

```ts
function renderSelector(props: ComponentProps) {
  /* ... */
}

let selectedId: number = 0
function handleSelectItem(item: any) {
  selectedId = item.id
}

renderSelector({ onSelectItem: handleSelectItem })
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHsC2AHdILgAKU62AzsgN4BQyyeAyhADYQJgCSkmAXMgBTBufOCACeASmQBeAHzIAbumAATANzUAvtRgBXEO2B5kUAiuhNW7dFH7YS5Phhx4CYYqTJTKyAPQAqZAA6EOR-X2RtalYwZDIWNkgVDhU+EF1MACNoGWQABg09AzAjEGQAC1EVVktErghMQWFkUUkqWjiE9ghklVyhBqDVDSjTEHMoWutbSkYuzmbK8Zr5+sxNCQ0gA)

---

```ts
interface ComponentProps {
  onSelectItem: (id: number) => void
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHsC2AHdILgAKU62AzsgN4BQyyeAyhADYQJgCSkmAXMgBTAAJnxABXTACNoASmQBeAHzIAbumEBuagF9qQA)

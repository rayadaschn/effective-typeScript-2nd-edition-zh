# 第 5 条：限制 any 类型的使用

## 要点

- TypeScript 的 `any` 类型会关闭大部分类型检查，让变量变得“随意”。
- 使用 `any` 会导致：失去类型安全、破坏参数约定、影响开发体验、增加重构风险、隐藏类型设计，并削弱对 TypeScript 的信任。
- **尽量避免使用 `any`！**

## 正文

TypeScript 的类型系统是渐进式和可选的：渐进式是因为你可以逐步为代码添加类型（通过 `noImplicitAny`），可选是因为你可以随时禁用类型检查器。这些特性的关键是 `any` 类型：

```ts
let ageInYears: number
ageInYears = '12'
// ~~~~~~~ Type 'string' is not assignable to type 'number'.
ageInYears = '12' as any // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/DYUwLgBAhg5iCSA7AmiKAnAzgLgogrgLYBGI6A3AFCwIppYQC8EA5AIwBMLVA9DxAD8hwgRAAqATwAOIVpjDoAlohgsIizHgD2kKJkyKYiKMVAQwW89NksCJMiwB01OElQZNzdl2iaoiCXIICD4IAHkAaUogA)

类型检查器在这里提示是正确的，但你可以通过将其类型指定为 `any` 来消除这个警告。

在开始使用 TypeScript 时，当你不理解某个错误、认为类型检查器的判断有误，或者只是懒得写类型声明时，很容易会使用 `any` 类型和类型断言（`as any`）。

在某些情况下，这样做是可以接受的，但要注意，使用 `any` 会丧失许多 TypeScript 带来的优势。在使用之前，你至少应当了解它的风险。

### `any` 类型没有类型安全

在前面的例子中，类型声明表明 `ageInYears` 是一个数字。但 `any` 允许你将一个字符串赋值给它。类型检查器会认为它是一个数字（毕竟你声明了它是数字），而这种混乱将无法被捕获：

```ts
ageInYears += 1 // OK; at runtime, ageInYears is now "121"
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/DYUwLgBAhg5iCSA7AmiKAnAzgLgogrgLYBGI6A3AFCwIppYQC8EA5AIwBMLVA9DxAD8hwgRAAqATwAOIVpjDoAlohgsIizHgD2kKJkyKYiKMVAQwW89NksCJMiwB01OElQZNzdl2iaoiCXIICD4IAHkAaRdadwYAamY2IJD+SKCoSHR8RDBFQhAAGmhXOg91TUQtAHcIACJONlrKIA)

### `any` 类型非常宽松

当你写一个函数时，你是在设定规则：如果传入某种类型的输入，就会返回预期的输出。但使用 `any` 类型后，你就能绕过这些规则，随意传入任何类型的值。

```ts
function calculateAge(birthDate: Date): number {
  // ...
}

let birthDate: any = '1990-01-19'
calculateAge(birthDate) // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/DYUwLgBAhg5iCSA7AmiKAnAzgLgogrgLYBGI6A3AFCwIppYQC8EA5AIwBMLVA9DxAD8hwgRAAqATwAOIVpjDoAlohgsIizHgD2kKJkyKYiKMVAQwW89NksCJMiwB01OElQZNzdl2iaoiCXIICD4IAHkAaUoAM3xEAGMwRS1ECHioYHj8YCgwEABBOAAKYkV0MAALABFckFwavIBKXDtSdAgAb0pg0IBhMIBZAAUAJQBRAGUJ7oh0cHx0VIAGKh7+MYA5KsoAX0pKUEhS8ura3H8JJlY2AE4bpYBaJbYH2+5KdMzs2sKQErLKg0QI0giF+JF9kA)

`birthDate` 参数应该是一个 `Date` 类型，而不是一个字符串。`any` 类型让你打破了 `calculateAge` 的规则。这尤其有问题，因为 JavaScript 常常会隐式地在类型之间进行转换。有时字符串可以替代数字正常工作，但在其他情况下却会出错。

### `any` 类型没有智能提示

当一个变量的类型不是 `any` 时，TypeScript 可以提供智能补全和上下文文档提示。

![The TypeScript Language Service is able to provide contextual autocomplete
for symbols with types.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202503262059882.png)

但如果变量的类型是 `any`，那就没有任何提示了。

![There is no autocomplete for properties on symbols with any types.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202503262102260.png)

重命名也是类似的功能之一。如果你有一个 `Person` 类型，以及用于格式化人名的函数：

```ts
interface Person {
  first: string
  last: string
}

const formatName = (p: Person) => `${p.first} ${p.last}`
const formatNameAny = (p: any) => `${p.first} ${p.last}`
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAXMhVKAOYDcRyANnBdbQ8wL4EEEOCiSxQAtnDAA5OOJQBeZAAoADtXTkcASmQKAfMgAGAEjyqAdKXJheyM5fYVeR5kJAiYYyTLkQAgiAAnnoq6shwwboGxg5WZM725hZOtq4EQA)

然后，你可以在编辑器中选中 `first`，选择“重命名符号”，将其改为 `firstName`。

![Renaming a symbol in VS Code.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202503262104886.png)

![Choosing the new name.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202503262104824.png)

这样会修改 `formatName` 函数中的 `first`，但不会影响 `any` 类型的那一版：

```ts
interface Person {
  firstName: string
  last: string
}
const formatName = (p: Person) => `${p.firstName} ${p.last}`
const formatNameAny = (p: any) => `${p.first} ${p.last}`
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyMwUGYAcnALYQBcyFUoA5gNxHIA2cFjzNpwC+BBDgoksUGnCq0UAXmQAKAA6N05HAEpkigHzIABgBI8agHSly8usOTmrvCsOOdxISTGmy7EAEEQAE99VQ1kOBC9QxMnazJXRwtLFzA3TiA)

TypeScript 的标语之一是“能扩展的 JavaScript”。其中“扩展”的关键之一就是语言服务，它是 TypeScript 体验的重要组成部分（详见第 6 条）。如果失去了这些服务，不仅会降低你的开发效率，也会影响与你协作的其他人。

### `any` 类型会在重构时掩盖 bug

假设你正在开发一个 Web 应用，用户可以选择某个项目。其中一个组件可能会有一个 `onSelectItem` 回调函数。给 `item` 定义类型感觉有点麻烦，所以你暂时用 `any` 代替：

```ts
interface ComponentProps {
  onSelectItem: (item: any) => void
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHsC2AHdILgAKU62AzsgN4BQyyeAyhADYQJgCSkmAXMgBTBufOCACeASmQBeAHzIAbumAATANzUAvtSA)

下面是调用该组件的代码：

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

后来，你对选择器进行了改动，使得直接把整个 `item` 对象传递给 `onSelectItem` 变得不太方便。但这没关系，因为你只需要它的 ID。所以，你修改了 `ComponentProps` 中的函数参数类型：

```ts
interface ComponentProps {
  onSelectItem: (id: number) => void
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHsC2AHdILgAKU62AzsgN4BQyyeAyhADYQJgCSkmAXMgBTAAJnxABXTACNoASmQBeAHzIAbumEBuagF9qQA)

你更新了组件，类型检查器也没报错，大功告成！

……但真的吗？`handleSelectItem` 的参数是 `any`，所以无论传进来的是 `item` 还是 `ID`，它都不会报错。结果，代码在运行时抛出了异常，而类型检查器却毫无察觉。

如果你当初使用了更具体的类型，这个问题就能更早被类型检查器发现，从而避免问题产生。

### `any` 让你的类型设计变得隐晦

在应用程序中，某些对象（比如应用状态）可能会非常复杂，包含几十个属性。你可能觉得给这些属性一一定义类型太麻烦，干脆用 `any` 省事。

这样做的问题不仅仅是前面提到的那些，还会让你的状态设计变得隐晦。第四章会讲到，良好的类型设计对编写清晰、正确、易懂的代码至关重要。而 `any` 让你的类型设计变得隐晦，导致代码可读性下降，甚至连你自己都难以判断这个设计是否合理。如果你的同事帮你审核代码，他们需要先搞清楚这个 `any` 到底代表什么，而不是直接看到清晰的类型定义。写明类型，能让大家一目了然。

### `any` 会削弱你对类型系统的信任

每次类型检查器帮你发现一个错误，你都会更信赖 TypeScript。但如果你在运行时碰到类型错误，而 TypeScript 之前毫无察觉，你对它的信任度就会下降。

如果你在团队里推广 TypeScript，而代码里到处都是 `any`，你的同事可能会怀疑 TypeScript 真的值得投入精力吗？许多这种“漏掉的错误”都是 `any` 造成的。

TypeScript 本来是为了让开发更轻松，但如果代码里 `any` 太多，可能会比纯 JavaScript 还难用。因为你不仅要处理类型错误，还要自己记住变量的真实类型。理想情况下，你的类型应该尽可能准确，这样 TypeScript 就能帮你记住这些信息，而不是让你自己去猜。

当然，有时候 `any` 还是不可避免的。不过，使用 `any` 也有更好的方式来降低它的负面影响，具体方法可以参考第五章。

## 关键点总结

- TypeScript 的 `any` 类型会关闭大部分类型检查，让变量变得“随意”。
- 使用 `any` 会导致：失去类型安全、破坏参数约定、影响开发体验、增加重构风险、隐藏类型设计，并削弱对 TypeScript 的信任。
- **尽量避免使用 `any`！**

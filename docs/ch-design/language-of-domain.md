# 第 41 条：使用相关领域语言为类型命名

## 要点

- 尽量复用问题领域的名称，提升代码可读性和抽象层次，确保准确使用领域词汇。
- 不要用不同名字表示同一件事，名字的区分必须有意义。
- 避免用 “Info” 或 “Entity” 这样模糊的名字，给类型命名时按它们的本质来，不要只看它们的结构。

> [!NOTE] Phil Karlton
> 计算机科学中只有两个难题：缓存失效和给东西命名。

## 正文

这本书讲了很多关于类型的结构和它们值域中的值，但对你给类型取什么名字讲得比较少。但这其实是类型设计中很重要的一部分。选对类型、属性和变量名，能让代码意图更清晰，提升代码和类型的抽象层次；选不好则会让代码晦涩难懂，导致错误的理解。

比如你在构建一个动物数据库，你定义了一个接口来表示动物：

```ts
interface Animal {
  name: string
  endangered: boolean
  habitat: string
}

const leopard: Animal = {
  name: 'Snow Leopard',
  endangered: false,
  habitat: 'tundra',
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgIImAWzgG2QbwChlkQ5MIAuZAZzClAHMBuY5CEAEzhEegk7UARgHsROCD1YkAFnCHAwcMNToNerAL6FCCESDrIJIgA5wogtBmx4AvATZkK1AOQBlECIDuyADIRTc04XABo2Dm5efkt4HBoIMNl5RWVXMABXLig4UMJNViA)

这里存在一些问题：

- name 是个非常笼统的词，你到底期待存什么名字？学名？俗名？
- endangered（濒危）是布尔值，也不够明确。比如动物灭绝了怎么办？这里的意思是“濒危及更糟”的状态吗？还是字面上的“濒危”？
- habitat（栖息地）字段也很模糊，不仅因为它是 string 类型过于宽泛（参见第 35 条），还因为“栖息地”具体指什么不清楚。
- 变量名是 leopard，但 name 属性的值是“Snow Leopard”（雪豹），这两个名字的区别有意义吗？

下面是一个更明确的类型声明和对应的值示例：

```ts
interface Animal {
  commonName: string
  genus: string
  species: string
  status: ConservationStatus
  climates: KoppenClimate[]
}
type ConservationStatus = 'EX' | 'EW' | 'CR' | 'EN' | 'VU' | 'NT' | 'LC'
type KoppenClimate =
  | 'Af'
  | 'Am'
  | 'As'
  | 'Aw'
  | 'BSh'
  | 'BSk'
  | 'BWh'
  | 'BWk'
  | 'Cfa'
  | 'Cfb'
  | 'Cfc'
  | 'Csa'
  | 'Csb'
  | 'Csc'
  | 'Cwa'
  | 'Cwb'
  | 'Cwc'
  | 'Dfa'
  | 'Dfb'
  | 'Dfc'
  | 'Dfd'
  | 'Dsa'
  | 'Dsb'
  | 'Dsc'
  | 'Dwa'
  | 'Dwb'
  | 'Dwc'
  | 'Dwd'
  | 'EF'
  | 'ET'
const snowLeopard: Animal = {
  commonName: 'Snow Leopard',
  genus: 'Panthera',
  species: 'Uncia',
  status: 'VU', // vulnerable
  climates: ['ET', 'EF', 'Dfd'], // alpine or subalpine
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgIImAWzgG2QbwChlkEB7TTMkAOTkwgC5kBnMKUAcwG5jlOIIAK4tmbDiB58WABwgJgEUa3ZdeJNnDAjmAYWotoANy3BqAZTBaR60jixalzANJkZckLvvZIAbQC6vAC+hGAAnnLI+iCGUCZgZiCW1izIALzIAOQAogAamcgAPlnZAOoFxZm6AEoVJTR1mQBqAKqNNAAqjQAyupm84ZGu7oJeDpDpRXyZqDCNqJjzLPMA7hXTAELmABaNWwDWe6W7RVkbpYdTJFXwjbowAEZ3MAh3LHBvT6dVLK-fuisPv8Vl9KgC-oVpgARW7fGGgrIwiGImAAE3W1yh70aWIRmSxyPxgJxIJJhKhK3RVxKADFGtkurxyDEwKwQGQVt0IG44FBUcx0A48BkiCRyJRqHQGMxMuZ2StkFyeXzMgAaPgCYTKTIABTg4G20A+6o0cgUTiyLRACmN0is2m1rTVJAA9C7kEYhDgQEaHjgIHwEN5HMpfDkuqrac78WjMv5I8g3chcDJQCgyFBWEIHim04QgrwgA)

这带来了很多改进：

- 把 name 换成了更具体的字段：commonName（通用名）、genus（属名）、species（种名）。
- 把 endangered（濒危）改成了 status（状态），用的是来自 IUCN 的 ConservationStatus 类型，基于标准分类系统。
- 把 habitat（栖息地）改成了 climates（气候类型），使用了另一种标准分类——柯本气候分类法（Köppen climate classification）。

如果你对第一版的字段含义不清楚，只能去找当初写代码的人问，可惜他们很可能已经离职或者不记得了。更糟的是，你可能用 git blame 找写这烂代码的人，结果发现那个人竟然是你自己！

第二版就好多了。如果想了解柯本气候分类法或保护状态的具体含义，网上有大量资源可查。

每个领域都有自己的专业术语。别自己瞎起名字，尽量沿用问题领域的术语。这些词汇往往经过多年甚至几百年磨炼，行业内的人都很熟悉。用它们能帮助你更好地和用户沟通，让类型更清晰。

但要注意准确使用领域词汇：如果你把领域里的词拿来用，却赋予不同含义，比自己发明词还让人困惑。

同样的原则也适用于函数参数名、元组标签、索引类型标签等。

给类型、属性、变量命名时，还要记住这些规则：

- 区分要有意义。写文章说话时反复用同一个词会乏味，于是用同义词来丰富语言。但代码正好相反，如果用不同词，确保它们表示不同概念；否则应该用同一个词。
- 避免用模糊无意义的名字，比如 “data”、“info”、“thing”、“item”、“object” 或流行的 “entity”。如果在你的领域 “Entity” 有明确含义，那没问题。但如果你用它只是因为懒得想更有意义的名字，迟早会出问题：项目里可能出现多个不同的 “Entity”，你能记住哪个是 Item 哪个是 Entity 吗？
- 给东西命名时，按它们的本质命名，而不是它们包含什么或怎么计算。比如用 Directory 比 INodeList 更有意义，因为它让你能把目录当成一个概念来看，而不是实现细节。好名字能提高抽象层次，减少意外冲突风险。

## 关键点总结

- 尽量复用问题领域的名称，提升代码可读性和抽象层次，确保准确使用领域词汇。
- 不要用不同名字表示同一件事，名字的区分必须有意义。
- 避免用 “Info” 或 “Entity” 这样模糊的名字，给类型命名时按它们的本质来，不要只看它们的结构。

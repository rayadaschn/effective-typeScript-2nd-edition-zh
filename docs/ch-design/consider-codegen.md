# 第 42 条：避免基于个人经验设计类型

## 要点

- 不要根据零散数据手动写类型，容易误解结构或漏判空值
- 优先用官方/社区提供的类型，没有就用工具从规范生成。自动生成的类型能精准反映系统复杂性，减少人为失误

## 正文

本章其他条目讨论了良好类型设计的诸多好处，也展示了糟糕设计可能引发的问题。精心设计的类型让 TypeScript 使用体验愉悦，而拙劣的设计则令人痛苦。但这确实给类型设计带来不小压力。

在开发过程中，部分类型可能来自外部：规范文档、文件格式、API 或数据库结构。面对测试数据库中的几行数据或某个 API 端点的响应样本时，人们常倾向于手动编写类型声明。请抵制这种冲动！更好的做法是从权威来源导入类型或根据规范自动生成。

基于个人经验编写类型时，你仅考虑了已见到的示例，可能遗漏导致程序崩溃的关键边界情况。使用更官方的类型时，TypeScript 能帮你规避这类风险。

在第 30 条中，我们使用过计算 GeoJSON 要素边界框的函数。其类型定义可能如下：

```ts
function calculateBoundingBox(f: GeoJSONFeature): BoundingBox | null {
  let box: BoundingBox | null = null

  const helper = (coords: any[]) => {
    // ...
  }

  const { geometry } = f
  if (geometry) {
    helper(geometry.coordinates)
  }

  return box
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEIHsCuIAmoDmGAHsgN4BQyyANnGAFzIDaImAtgEbQA0yrn0ALoBuSjRD5GLdlyi9+skeQC+5MAE8ADigDiEdACkAygHkAcgDEIdTFBQBeZHBDrRG7cj2HTZr2whgUOrIjs6u5DDYCGDA6CDICHDUCJi0kBjYeBLEABQwjF7G5lY2dgCUjBm4BMTIAD58qdRkYtQByBzoRJVY1dld9Y3UzY6sw6JiCHEAzmDIABYQ1NpQIcg5U+hQONOMYUyCZSEAfC1UVAD0F8gAdHdiyhNUUyCzZPj6-oHqymswolRgDB1h90F8gkcKOcFksVjlQeD1DdNttQHQINMygDkKoxHYwLZ4p0iKJVEA)

定义 GeoJSON 要素类型时，不要仅凭代码库中的几个样例就草率定义接口：

```ts
interface GeoJSONFeature {
  type: 'Feature'
  geometry: GeoJSONGeometry | null
  properties: unknown
}
interface GeoJSONGeometry {
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon'
  coordinates: number[] | number[][] | number[][][] | number[][][][]
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgOIQPYCkDKB5AOQDEI4wBXKFAbwChlkwBPABwgC5kByEsyiLgG56yAOaYAthDBQmndNnwEFUmU2QAfZCHIAbXcIYsoGNlDDAIAZ07kQAaxAYA7iGEBfWqEixEKBbiEKtKyyHQMzGycXAAKGN5cmtwAMqAQODKgoolasRi6TKIYIDncALJ6FnEFRSWGyAgYGFAAJqBk1pw6EgBG0ADaALpJ3X1QQ0Mj5L0DgxPDWqOz80MetEA)

虽然这个类型定义能通过检查，但它真的正确吗？类型检查的可靠性完全取决于我们自定义的类型声明。更稳妥的做法是采用 GeoJSON 官方规范。幸运的是，DefinitelyTyped 上已有现成的类型声明，通过以下命令安装：

```bash
$: npm install --save-dev @types/geojson
```

安装官方类型后，TypeScript 会立即暴露出原有定义的问题：

```ts
import { Feature } from 'geojson'

function calculateBoundingBox(f: Feature): BoundingBox | null {
  let box: BoundingBox | null = null

  const helper = (coords: any[]) => {
    // ...
  }

  const { geometry } = f
  if (geometry) {
    helper(geometry.coordinates)
    //              ~~~~~~~~~~~
    //   Property 'coordinates' does not exist on type 'Geometry'
    //     Property 'coordinates' does not exist on type 'GeometryCollection'
  }

  return box
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEIHsCuIAmoDmGAHsgN4BQyyANnGAFzIDaImAtgEbQA0yrn0ALoBuSjRD5GLdlyi9+skeQC+5YGwAO6KGDIAxCHUxQIy5DCjo2yAOT4I6AFYBndCBujyMbAjDA3yAhw1AiYtJAY2HgSxAAUMIwGRiYAlIyRuATEyAA+fGHUZGLUELoc6ETpWJkxFbn51IUAvA3UnlQIbs66ABYQ1BrQyC2xndo4zoxwIACeTIIpwwB8RVRUAPTryAB0u2LK7YFduqT2VqVQM2YtMKJUwDDIsWdsFzOLFGvIfQPQzw6vMCXbZjKDROgQZwpO5rTZfeHwgB+yJRqMRYg2WyoAAVLIMdDNbKDwZBnDZkDh0JC+OhdBAiMBusgAmAZoNbABxAFvGwY5Bwr649D41lE9DjUAQskUqnOGl0hlMllslA2LnnIEzADC6EaEF8-nc+3IYhMYGMIGQ5SIolUQA)

问题在于这段代码假设所有几何体都会有 coordinates 属性。虽然点、线、面等几何类型确实如此，但 GeoJSON 还包含几何集合类型（GeometryCollection）——这种异构集合类型恰恰没有 coordinates 属性。

当你对 `GeometryCollection` 类型的地理要素调用 `calculateBoundingBox` 方法时，会抛出 **"无法读取 undefined 的属性 0"** 的错误。这是个真实存在的 bug！而正是通过使用社区提供的类型定义，我们提前发现了这个问题。

修复这个 bug 的一个方案是：**明确禁止传入 `GeometryCollection` 类型**。

```ts
const { geometry } = f
if (geometry) {
  if (geometry.type === 'GeometryCollection') {
    throw new Error('GeometryCollections are not supported.')
  }
  helper(geometry.coordinates) // OK
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEIHsCuIAmoDmGAHsgN4BQyyANnGAFzIDaImAtgEbQA0yrn0ALoBuSjRD5GLdlyi9+skeQC+5YGwAO6KGDIAxCHUxQIvAOIR0bCGCgBPZchhQryAOT5LAKwDO6EG6iOBAItCY0Nk6MBkYmojDYCGDA-sgAFhDUGtAAFAjo2nggdBA+jHAgdkyCAJRkqvkgPrqknlY29o4AvE6iwDDIOW3WtnZ1FFT9g8MddgB0YHbZyF2r7hbtowDC6NTUIcn+buNiVGBpLgDufBDXAKJQLlA5bhsj9jt7BylNyHDhIHQuh8mA0Wh0EBwc2OoioqioGSyuRmozm+UKoBKPhqwioAHo8cgAPIAaRU5CAA)

TypeScript 能够基于类型检查自动细化 `geometry` 的类型，因此访问 `geometry.coordinates` 是允许的。至少这样能给用户更清晰的错误提示。但更好的解决方案是支持 `GeometryCollections`！可以通过提取辅助函数来实现：

```ts
const geometryHelper = (g: Geometry) => {
  if (g.type === 'GeometryCollection') {
    g.geometries.forEach(geometryHelper)
  } else {
    helper(g.coordinates) // OK
  }
}

const { geometry } = f
if (geometry) {
  geometryHelper(geometry)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEIHsCuIAmoDmGAHsgN4BQyyANnGAFzIDaImAtgEbQA0yrn0ALoBuSjRD5GLdlyi9+skeQC+5YGwAO6KGDIAxCHUxQIvAOIR0bCGCgBPZchhQryAOT5LAKwDO6EG6iOBAItCY0Nk6MBkYmojDYCGDA-sgAFhDUGtAAFAjo2nggdBA+jHAgdkyCAJRkqvkgPrqeVjb2ABKZ2VDIALzIOZLIFm22dnV9AHxkYsAwg-gAdGB22f19A26j1uMAwujU1CHJ-m51FFRUy627UMClSzDaAKKIaUOWd3ZdWdA1oiojkyPhQlyuGT+UCGS3yhVAJR8AKoAHoUcgAPIAaTEqlU5EazTIt3aDn6TlE80WX1JFzEJPGvx6nzG9gBKnIQA)

我们手写的 GeoJSON 类型仅基于自己对格式的有限理解，没有考虑到 `GeometryCollections` 的情况，这导致了对代码正确性的盲目自信。使用基于官方规范的社区类型，能确保代码处理所有可能值，而不仅限于你见过的那些。

API 调用同理：

- 如果 API 有官方 TypeScript 客户端，优先使用
- 即使没有，通常也能从官方规范生成类型

以 GraphQL 为例，其自带的 schema 已完整定义了所有查询、变更和类型。有很多工具可为 GraphQL 查询添加 TypeScript 类型支持，简单搜索就能找到解决方案。

对于 REST API，许多服务会提供 OpenAPI 规范（原 Swagger）。这个 JSON 文件完整描述了所有端点、HTTP 方法（GET/POST 等）以及基于 JSON Schema 的类型定义。例如一个博客评论 API 的 OpenAPI 规范可能如下：

```json
// schema.json
{
  "openapi": "3.0.3",
  "info": { "version": "1.0.0", "title": "Sample API" },
  "paths": {
    "/comment": {
      "post": {
        "requestBody": {
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/Comment" }
            }
          }
        }
      },
      "responses": {
        "200": {
          /* ... */
        }
      }
    }
  },
  "components": {
    "schemas": {
      "CreateCommentRequest": {
        "properties": {
          "body": { "type": "string" },
          "postId": { "type": "string" },
          "title": { "type": "string" }
        },
        "type": "object",
        "required": ["postId", "title", "body"]
      }
    }
  }
}
```

`paths` 部分定义了 API 的接口路径，并将它们与 `components/schemas` 中的数据类型关联起来。我们生成类型所需的所有信息都在这里。

从 OpenAPI 规范提取类型有多种方法，其中一种是把 `schemas` 部分的内容提取出来，然后用 `json-schema-to-typescript` 这样的工具转换成 TypeScript 类型。

```bash
$ jq .components.schemas.CreateCommentRequest schema.json > comment.json
$ npx json-schema-to-typescript comment.json > comment.ts
$ cat comment.ts

// ....
export interface CreateCommentRequest {
 body: string;
 postId: string;
 title: string;
}
```

这样生成的类型定义既清晰又规范，能让你以类型安全的方式调用 API。TypeScript 会自动标出请求体的类型错误，并将正确的响应类型传递到代码各处。关键点在于：这些类型不是你手动写的，而是从可靠的官方规范自动生成的。如果某个字段是可选的或允许为 null，TypeScript 会强制你处理这些可能性。

接下来可以添加运行时验证，并把这些类型直接关联到对应的 API 接口。有很多工具能帮你实现这一点（第 74 条会回到这个例子）。但要注意保持生成的类型与 API 规范同步（第 58 条会讨论同步策略）。

如果没有官方规范怎么办？这时你需要从实际数据生成类型。像 `quicktype` 这类工具能帮忙，但要警惕：这样生成的类型可能遗漏边界情况（除非数据量有限，比如已知的 1000 个 JSON 文件目录，这时可以确保全覆盖）。

其实你已经在享受代码生成的好处了——TypeScript 的浏览器 DOM 类型声明（第 75 条详述）就是从 MDN 的 API 描述自动生成的。这确保了复杂系统的精确建模，帮你的代码规避错误。

## 关键点总结

- 不要根据零散数据手动写类型，容易误解结构或漏判空值
- 优先用官方/社区提供的类型，没有就用工具从规范生成。自动生成的类型能精准反映系统复杂性，减少人为失误

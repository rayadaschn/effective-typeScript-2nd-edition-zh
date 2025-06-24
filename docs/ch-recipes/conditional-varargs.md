# Item 62: 使用剩余参数和元组类型来建模可变参数函数

## 要点

- 使用剩余参数和元组类型来建模函数签名，这些签名依赖于某个参数的类型。
- 使用条件类型来建模一个参数的类型与其余参数的数量和类型之间的关系。
- 记得标记元组类型的元素，以便在调用时获得有意义的参数名称。

## 正文

有时你希望函数根据 TypeScript 类型接受不同数量的参数。

要了解这种情况是如何发生的，想象你有一个接口，描述了 Web 应用中不同路由可以接受的查询参数：

```ts
interface RouteQueryParams {
  '/': null
  '/search': { query: string; language?: string }
  // ...
}
```

这表示根页面（/）不接受任何查询参数，而 /search 页面接受一个查询参数和一个可选的 language 参数。

你可以定义一个函数来为路由构造 URL：

```ts
function buildURL(route: keyof RouteQueryParams, params?: any) {
  return route + (params ? `?${new URLSearchParams(params)}` : '')
}

console.log(buildURL('/search', { query: 'do a barrel roll', language: 'en' }))
console.log(buildURL('/'))
```

这会构造出你期望的 URL：

```
/search?query=do+a+barrel+roll&language=en
/
```

不幸的是，由于第二个参数上的 `any`，它并不是很安全。你可以自由地为任何路由构造 URL，使用任何你喜欢的搜索参数：

```ts
buildURL('/', { query: 'recursion' }) // should be an error (no params for root)
buildURL('/search') // should be an error (missing params)
```

这是一个更安全的版本：

```ts
function buildURL<Path extends keyof RouteQueryParams>(
  route: Path,
  params: RouteQueryParams[Path]
) {
  return route + (params ? `?${new URLSearchParams(params)}` : '')
}
```

我们使函数在路由上泛型化（通常可以推断），并使参数类型依赖于这个路由。

这个新的类型签名对于 /search 路由完美工作：

```ts
buildURL('/search', { query: 'do a barrel roll' })
buildURL('/search', { query: 'do a barrel roll', language: 'en' })
buildURL('/search', {})
//                  ~~ Property 'query' is missing in type '{}'
```

然而，对于根页面，你需要传递一个额外的 null 参数：

```ts
buildURL('/', { query: 'recursion' }) // error, good!
//            ~~~~~~~~~~~~~~~~~~~~ Argument of type '{ query: string; }' is
//                                 not assignable to parameter of type 'null'
buildURL('/', null) // ok
buildURL('/') // we'd like this to be allowed
// ~~~~~ Expected 2 arguments, but got 1.
```

当然，写一个额外的 null 并不是世界末日，但这确实很烦人，而且带有可选参数的旧 API 看起来更漂亮。我们可以用新版本使第二个参数可选，但这应该只在路由不接受任何搜索参数时被允许。换句话说，我们希望函数根据推断的类型接受可变数量的参数。

实现这一点的技巧是使用条件类型（Item 52）和剩余参数：

```ts
function buildURL<Path extends keyof RouteQueryParams>(
  route: Path,
  ...args: RouteQueryParams[Path] extends null
    ? []
    : [params: RouteQueryParams[Path]]
) {
  const params = args ? args[0] : null
  return route + (params ? `?${new URLSearchParams(params)}` : '')
}
```

如果查询参数类型扩展 null，那么这看起来像：`(route: Path, ...args: [])`，这是一个单参数函数。如果不是，那么它看起来像：`(route: Path, ...args: [params: ...])`，这是一个双参数函数。

这完全按照你希望的方式工作：

```ts
buildURL('/search', { query: 'do a barrel roll' })
buildURL('/search', { query: 'do a barrel roll', language: 'en' })
buildURL('/search', {})
//                  ~~ Property 'query' is missing in type '{}' ...

buildURL('/', { query: 'recursion' })
//            ~~~~~~~~~~~~~~~~~~~~ Expected 1 arguments, but got 2.
buildURL('/', null)
//            ~~~~ Expected 1 arguments, but got 2.
buildURL('/') // ok
```

当你检查调用站点时，根据路由的不同，确实看起来像有两个不同的函数。剩余参数是一个对用户隐藏的实现细节。TypeScript 甚至从元组元素的标签中获取了第二个参数的名称（params）：

```ts
buildURL('/')
// ^? function buildURL<"/">(route: "/"): string
buildURL('/search', { query: 'do a barrel roll' })
// ^? function buildURL<"/search">(
//      route: "/search", params: { query: string; language?: string; }
//    ): string
```

如果你没有包含这个标签，你的用户会看到一个更通用的参数名称，比如 `args_0`。

这是建模可变参数函数的最通用技术。你也可以使用重载签名来实现类似的效果，但这会导致代码重复，而且正如 Item 52 所解释的，条件类型比重载更自然地处理联合类型。

有时函数的参数数量或类型取决于 TypeScript 类型。当这种情况发生时，你可以使用带有元组类型的剩余参数来建模它。

## 要点回顾

- 使用剩余参数和元组类型来建模函数签名，这些签名依赖于某个参数的类型。
- 使用条件类型来建模一个参数的类型与其余参数的数量和类型之间的关系。
- 记得标记元组类型的元素，以便在调用时获得有意义的参数名称。

# Item 65: Put TypeScript and @types in devDependencies

Node Package Manager (npm) 在 JavaScript 世界中无处不在。它既提供了 JavaScript 库的仓库（npm 注册表），也提供了一种指定你依赖的版本的方式（package.json）。

npm 区分了几种类型的依赖，每种都放在 package.json 的不同部分：

## dependencies

这些是运行你的 JavaScript 所需的包。如果你在运行时导入 lodash，那么它应该放在 dependencies 中。当你将代码发布到 npm 上，其他用户安装它时，也会安装这些依赖。（这些被称为传递依赖。）

## devDependencies

这些包用于开发和测试你的代码，但在运行时不需要。你的测试框架就是 devDependency 的一个例子。与 dependencies 不同，这些不会随你的包一起传递安装。

## peerDependencies

这些是你在运行时需要但不想负责跟踪的包。例如，如果你发布一个 React 组件，它将与 React 本身的一系列版本兼容。你更希望用户选择一个版本，而不是你为他们选择，这可能导致同一页面上运行多个版本的 React。

其中，dependencies 和 devDependencies 是最常见的。当你使用 TypeScript 时，要注意你添加的是哪种类型的依赖。因为 TypeScript 是一个开发工具，而 TypeScript 类型在运行时不存在（Item 3），所以与 TypeScript 相关的包通常属于 devDependencies。

第一个要考虑的依赖是 TypeScript 本身。虽然你可以全局安装 TypeScript，但这样做有两个主要原因是不好的：

- 无法保证你和你的同事总是安装相同的版本。
- 它会为你的项目设置增加一个步骤。

将 TypeScript 作为 devDependency 替代。这样当你运行 `npm install` 时，你和你的同事总是会得到正确的版本。你更新 TypeScript 的方式与更新任何其他包的方式相同。

你的 IDE 和构建工具会很乐意发现以这种方式安装的 TypeScript 版本。例如，在命令行中，你可以使用 npx 来运行由 npm 安装的 tsc 版本：

```bash
$ npx tsc
```

下一个要考虑的依赖类型是类型依赖或 @types。如果库本身没有附带 TypeScript 类型声明，那么你可能仍然能在 DefinitelyTyped 上找到类型定义，这是一个社区维护的 JavaScript 库类型定义集合。DefinitelyTyped 的类型定义在 npm 注册表的 @types 作用域下发布：@types/jquery 有 jQuery 的类型定义，@types/lodash 有 Lodash 的类型，等等。这些 @types 包只包含类型，不包含实现。

你的 @types 依赖也应该是 devDependencies，即使包本身是直接依赖。例如，要依赖 React 及其类型声明，你可能会运行：

```bash
$ npm install react
$ npm install --save-dev @types/react
```

这将产生一个看起来像这样的 package.json 文件：

```json
{
  "devDependencies": {
    "@types/react": "^18.2.23",
    "typescript": "^5.2.2"
  },
  "dependencies": {
    "react": "^18.2.0"
  }
}
```

这里的想法是你应该发布 JavaScript，而不是 TypeScript，而你的 JavaScript 在运行时不依赖 @types。（TypeScript 用户可能依赖这些 @types，但最好避免传递类型依赖。Item 70 将向你展示如何做。）

如果你正在构建一个 Web 应用，没有打算将其作为库发布到 npm 上呢？你可能会发现建议说在这种情况下不值得分离 devDependencies，你不如把一切都作为生产依赖。然而，即使对于 Web 应用，将 @types 放在 devDependencies 中也有几个优势：

- 如果你的应用有服务器组件，你可以运行 `npm install --production` 来只在生产镜像中安装生产依赖。假设你已经将 TypeScript 编译为 JavaScript，这些将是运行代码所需的唯一依赖。这将产生一个更小的镜像，启动更快。

- 如果你使用自动依赖更新工具（如 Renovate 或 Dependabot），你可以告诉它优先考虑生产依赖。这些更可能有重要的安全更新，可能会影响你代码的最终用户，这些是你应该关注的。

@types 依赖可能会出现一些问题，下一个项目将深入探讨这个主题。

## 要点回顾

- 理解 _package.json_ 中 `dependencies` 和 `devDependencies` 的区别。
- 将 TypeScript 放入项目的 `devDependencies` 中，不要全局安装 TypeScript。
- 将 `@types` 依赖放在 `devDependencies` 中，而不是 `dependencies` 中。

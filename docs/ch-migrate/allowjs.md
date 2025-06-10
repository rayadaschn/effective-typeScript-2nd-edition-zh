# 第 81 条: 使用 `allowJs` 混合使用 TypeScript 和 JavaScript

## 要点

- 使用 `allowJs` 编译选项来支持在过渡项目时混合使用 JavaScript 和 TypeScript。
- 在开始大规模迁移之前，先确保你的测试和构建链与 TypeScript 一起正常工作。

## 正文

对于小项目，你可以一次性从 JavaScript 切换到 TypeScript。但对于大项目，这种"暂停一切"的方式行不通。你需要逐步过渡，这意味着要让 TypeScript 和 JavaScript 共存。

关键就是 `allowJs` 编译器选项。开启后，TS 和 JS 文件可以互相导入。对 JS 文件该模式极其宽松——除非使用`@ts-check`（第 80 条），否则只会报语法错误。这是最浅层的"TS 是 JS 超集"的体现。

虽然 `allowJs` 不太能发现错误，但它让你能在修改代码前先把 TS 引入构建流程。这很有用，因为如第 82 条所述，在转换单个模块为 TS 时你需要能运行测试。

如果你的打包工具支持 TS 或有插件（比如 webpack 安装 `ts-loader`）：

```bash
$: npm install --save-dev ts-loader
```

然后在 webpack.config.js 配置：

```js
module.exports = {
  module: {
    rules: [{ test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ }],
  },
}
```

多数测试工具也有类似方案。比如 Jest 安装 `ts-jest` 后，在 `jest.config.js` 配置：

```js
module.exports = {
  transform: { '^.+\\.tsx?$': 'ts-jest' },
}
```

如果是 Node.js 环境，最简单是用 ts-node：

```bash
$: node -r ts-node/register main.ts
```

自定义构建流程会更复杂，但有备用方案：设置 `outDir` 选项，然后 TS 会生成纯 JS 代码，原有构建流程通常能直接处理。你可能需要调整 `target` 和 `module` 等选项使输出贴近原 JS 代码。

虽然配置构建和测试流程不太有趣，但这是安全迁移代码的基础（下条会详述）。

## 关键点总结

- 使用 `allowJs` 编译选项来支持在过渡项目时混合使用 JavaScript 和 TypeScript。
- 在开始大规模迁移之前，先确保你的测试和构建链与 TypeScript 一起正常工作。

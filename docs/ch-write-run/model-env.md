# Item 76: Create an Accurate Model of Your Environment

## 要点

- Your code runs in a particular environment. TypeScript will do a better job of checking your code if you create an accurate static model of that environment.
- Model global variables and libraries that are loaded onto a web page along with your code.
- Match versions between type declarations and the libraries and runtime environment that you use.
- Use multiple _tsconfig.json_ files and project references to model distinct environments within a single project (for example client and server).

## 正文

正如 Item 3 所解释的，你的 TypeScript 代码最终会被转换为 JavaScript 并执行。更具体地说，它会在特定的运行时（V8、JavaScriptCore、SpiderMonkey）中，在特定的环境（浏览器中的网页、Node.js 中的测试运行器、Deno、Electron 等）中执行。

为了让 TypeScript 静态地建模你的代码的运行时行为，它需要该环境的模型。配置 TypeScript 项目时，你的主要目标之一是确保这个模型尽可能准确。你对运行时环境的建模越准确，TypeScript 在发现代码错误方面就越有效。

例如，你生成的 JavaScript 可能在浏览器中运行，它被包含在 HTML 页面中：

```html
<script src="path/to/bundle.js"></script>
```

TypeScript 为你提供了几种建模方式。一种是通过 `tsconfig.json` 中的 `lib` 设置：

```json
{
  "compilerOptions": {
    "lib": ["dom", "es2021"]
  }
}
```

通过在 `lib` 中包含 `"dom"`，我们告诉 TypeScript 它应该包含浏览器的类型声明。`"es2021"` 表示我们期望浏览器对该年 JavaScript 标准中的所有内容都有内置支持（无论是原生支持还是通过 polyfill）。使用更新版本的功能（例如 `array.toSorted()`）将导致类型错误。你可能不知道每个 ECMAScript 版本中具体有哪些功能，但 TypeScript 知道。通过创建准确的环境模型，它可以帮助你捕获这种特定的错误。

你还可以通过安装 `@types/web` 包来建模 Web 浏览器中可用的类型，这让你对版本控制有更多的控制权。Item 75 对 TypeScript 和 DOM 有更多说明。

你的 `<script>` 标签可能不是页面上唯一的标签。也许你的 HTML 实际上看起来像这样：

```html
<script type="text/javascript">
  window.userInfo = { name: 'Jane Doe', accountId: '123-abc' }
</script>
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script type="text/javascript">
  // ... load Google Analytics ...
</script>
<script src="path/to/bundle.js"></script>
```

每个 `<script>` 标签都以某种方式修改环境，添加对你的代码可用的全局变量。为了确保准确的类型检查，你需要告诉 TypeScript 关于它们的信息。

你可以使用类型声明文件来建模 `userInfo` 全局变量：

```ts
// user-info-global.d.ts
interface UserInfo {
  name: string
  accountId: string
}
declare global {
  interface Window {
    userInfo: UserInfo
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/KYDwDg9gTgLgBAbwL4CgD0a4FcDOwoC0AlgHYBmEBA5gDYQBGAhjQHQAmLMOKpM+ZjAMbA4AVTxQAkuQiIUcOCUYBbYAC44OGFFJUA3PLhDBELCRiS2GrTpL6UqNsEE1GUEbQbM5C3vyEiAOqkbBAA7j4K2BLSFBri+LEQBgqoqEA)

你可以通过安装它们的类型声明来建模库：

```bash
$ npm install --save-dev @types/google.analytics @types/jquery
```

为了获得准确的模型，`@types` 包必须建模你在页面上引用的库版本，这一点至关重要。有关如何匹配这些内容的更多信息，请参阅 Item 66。如果你搞错了，TypeScript 可能会报告虚假错误或遗漏一些真正的错误。

也许你正在使用 webpack 打包代码，它允许你直接从 JavaScript 导入 CSS 和图像文件。这些文件是环境的一部分，但 TypeScript 不知道它们，会报错：

```ts
import sunrisePath from './images/beautiful-sunrise.jpg'
//                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Cannot find module './images/beautiful-sunrise.jpg' or its type declarations.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/KYDwDg9gTgLgBAbwL4CgCWBbSs4GcCuAdlGrsAAoCGMAFnAGZQQZwDkAdAPSaUDmwuTgCNglfDDT18AGwC0BYqWDsAVmF6sA3Ck6c4+g4aPG4AP3MXLV6zcs69AYUqFCEePTSEAJnAwQvMsBsXDz8giJiElJyCiRkquqscNBwaDC4cDAAnmBBXsAAxtKUUNRoEIS47ChAA)

为了让这个工作，你需要建模这些类型的导入：

```ts
// webpack-imports.d.ts
declare module '*.jpg' {
  const src: string
  export default src
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEHcFMCMAcEMDGBrAtASwLawPYCcAXAZwDoATE4gKDMkQBt49JRMcyBXelgcgCoSAK1gBzHqADeVUKEQ4AdkQKgieRAC4VBPOnkiA3NNCQAHrkKhaAM3hdlqxIYC+VIA)

webpack 实际上允许你从 CSS 模块导入特定的 CSS 规则。如果你使用此功能，你需要将其添加到模型中或安装为你执行此操作的 npm 包之一。

你的应用程序的不同部分可能在不同的环境中运行。例如，你的应用可能有在浏览器中运行的客户端代码和在 Node.js 下运行的服务器代码，更不用说在自身环境中运行的测试代码。由于这些是不同的环境，你会想要分别建模它们。通常的方法是使用多个 `tsconfig.json` 文件和项目引用，这在 Item 78 中讨论。

与浏览器一样，确保你准确建模 Node.js 环境。如果你使用 Node.js 版本 20 运行代码，请确保安装该版本的 `@types/node`。这将确保你只使用运行时可用的库功能。

## 要点回顾

- 你的代码在特定环境中运行。如果你创建该环境的准确静态模型，TypeScript 将更好地检查你的代码。
- 建模与你的代码一起加载到网页上的全局变量和库。
- 匹配类型声明与你使用的库和运行时环境之间的版本。
- 使用多个 `tsconfig.json` 文件和项目引用来建模单个项目内的不同环境（例如客户端和服务器）。

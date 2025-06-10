# 第 80 条：使用 `@ts-check` 和 JSDoc 体验 TypeScript

## 要点

- 在 JavaScript 文件顶部添加 "`// @ts-check`" 以启用类型检查，而无需转换为 TypeScript。
- 识别常见错误。了解如何声明全局变量并为第三方库添加类型声明。
- 使用 JSDoc 注释进行类型断言和更好的类型推断。
- 不要花太多时间通过 JSDoc 让代码完美类型化。记住，目标是转换为 _.ts_ 文件！

## 正文

在将 JavaScript 文件正式转换为 TypeScript（第 81 条）之前，你可以先用`@ts-check`指令进行类型检查，提前发现潜在问题。这个指令会让 TypeScript 对单个文件进行宽松的类型分析（比关闭`noImplicitAny`的 TypeScript 更宽松）。

```js
// @ts-check
const person = { first: 'Grace', last: 'Hopper' }
2 * person.first
//  ~~~~~~~~~~~~ The right-hand side of an arithmetic operation must be of type
//               'any', 'number', 'bigint' or an enum type
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&allowJs=true&noEmit=true#code/PTAEAEBcGcFoGMAWBTeBrAUPA9gO2pKAA7IBO0eoAvKAN4BmAluZAFygDkA4qQIbzIOAGlAAbXgXYcAEtiIlSHAL4BuDACZQAKmJkKuAHRMWGEKFAA-K9ZtXQAFRShSjAOaJIsRL1wATUNCMvsig2PSgPhEukIgAtsiQjPChCryJlLEArgSgAEYhYaCQAJ4kpmDmlVXVHD7Fwpy4mbH5iiIcuW6MuJAcoaQRuKDITbFFpcgYQA)

TypeScript 会自动推断 `person.first` 的类型是字符串，所以 `2 * person.first `会报类型错误，不需要手动加类型标注。

虽然它能发现这种明显的类型错误，或者函数调用时参数过多的情况，但实际上 `@ts-check` 通常只会揪出少数特定类型的错误。

### 未声明的全局变量

如果是你自己定义的符号，就用`let`或`const`声明它们。  
如果是"环境"符号（比如定义在 HTML 文件`<script>`标签里的），可以创建类型声明文件来描述它们。例如：

```js
// @ts-check
console.log(user.firstName)
//          ~~~~ Cannot find name 'user'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&allowJs=true&noEmit=true#code/PTAEAEBcGcFoGMAWBTeBrAUPA9gO2tgDbIB0h2A5gBQCu0yATiQGYCWD0kAcgIYC2yAJQBuDCFATJUgH6zpoAMI9cubJFBtcAE1C5+yUAHI6jQxiA)

那么你可以创建一个`types.d.ts`文件：

```ts
interface UserData {
  firstName: string
  lastName: string
}
declare let user: UserData
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&allowJs=true&noEmit=true#code/JYOwLgpgTgZghgYwgAgKoGdoBE5jsgbwChlkZgp0wA5OAWwgC5kqpQBzAbhOQBs4qtBs1YduAXyIATCAn5QUvCGGQBXTFGYZsuONyA)

可能需要调整`tsconfig.json`文件让 TypeScript 识别这个声明文件，这样错误就会消失。  
这个`types.d.ts`文件很有价值，因为它描述了代码运行的环境（见第 76 条），会成为项目类型声明的基础。

### 未知的第三方库

如果你用第三方库（比如 jQuery 操作 HTML 元素），TypeScript 需要知道它的类型。否则开启`@ts-check`后会报错：

```js
// @ts-check
$('#graph').style({ width: '100px', height: '100px' })
// Error: Cannot find name '$'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&allowJs=true&noEmit=true#code/PTAEAEBcGcFoGMAWBTeBrAUAEgBQHIBiAcwCcBDAB0TwEoA6aSATwBtkcBvPAdwEsATSNQBcoPAEYADJIoAPPABoxKXkUSQ8oidLl4AvjQDcGEKACiJEgHsSogMJkAdo6uRQAM16P+oR2QC2yGJYeBhAA)

解决方法是通过 npm 安装 jQuery 的类型声明：

```bash
npm install --save-dev @types/jquery
```

现在错误明确指向 jQuery 了：

```js
// @ts-check
$('#graph').style({ width: '100px', height: '100px' })
//          ~~~~~ Property 'style' does not exist on type 'JQuery<HTMLElement>'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&allowJs=true&noEmit=true#code/PTAEAEBcGcFoGMAWBTeBrAUAEgBQHIBiAcwCcBDAB0TwEoA6aSATwBtkcBvPAdwEsATSNQBcoPAEYADJIoAPPABoxKXkUSQ8oidLl4AvjQDcGEKDPmLAP2vXQABRIB7CshLMxjVsjyh+j5NCgAHaOkKDIsryMoI5BoMwuYgBSAIoArq5MADwAEgAqALIAMgCibAC2yEGQAHx4GEA)

实际上应该用`.css`而不是`.style`。  
`@ts-check`让你无需迁移到 TypeScript 就能享受流行 JS 库的类型声明，这是使用它的最大优势。注意安装的库类型版本要和你实际使用的库版本匹配（第 66 条解释了版本不匹配的问题）。

### DOM 相关问题

假设你写的是浏览器端代码，TypeScript 可能会标记 DOM 操作问题，例如：

```js
// @ts-check
const ageEl = document.getElementById('age')
ageEl.value = '12'
//    ~~~~~ Property 'value' does not exist on type 'HTMLElement'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&strictNullChecks=false&allowJs=true&noEmit=true#code/PTAEAEBcGcFoGMAWBTeBrAUPA9gO2pKAIYDmyAogDagC8oAJtvAK4C2yukAdGZFcu04AhAJ4BJegAoA5KWTSAlAG4McqlwBuRSs2S1Q0gIwAmaSpChLoAH63boAAoAnbAAdkTyCINad8htjI0KC42ITIAB4AlgSgeKBe7gYAEgAqALIAMvyCkNIYQA)

这是因为`getElementById`返回的是通用`HTMLElement`，而只有`HTMLInputElement`才有`value`属性（第 75 条详细说明了 DOM 类型处理）。

如果确定`#age`是输入框，可以用 JSDoc 做类型断言（注意括号不能少）：

```js
// @ts-check
const ageEl = /** @type {HTMLInputElement} */ (document.getElementById('age'))
ageEl.value = '12' // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&strictNullChecks=false&allowJs=true&noEmit=true#code/PTAEAEBcGcFoGMAWBTeBrAUPA9gO2pKAIYDmyAogDagC8owAVAxJAJ4AOyoA3gBIAqAWQAyASVzsArpCrIAtslyQAvqAbAAFABNs8SQqUA6MjMrzFkAEKtRWjQHJSyewEoXAbgxOqhgG5FKSS46ewBGACZ7d1B6MAB5AGkMIA)

此时编辑器会识别`ageEl`为`HTMLInputElement`类型。这引出了`@ts-check`的另一个常见问题：不准确的 JSDoc 注释。

### 不准确的 JSDoc 注释

如果你的项目已存在 JSDoc 风格的注释，开启`@ts-check`后 TypeScript 会开始检查它们。若你曾用 Closure Compiler 这类工具进行过类型检查，问题可能不大。但若之前的注释更像是"理想型 JSDoc"（即注释与实现不符），可能会遇到意外错误：

```js
// @ts-check
/**
 * Gets the size (in pixels) of an element.
 * @param {Node} el The element
 * @return {{w: number, h: number}} The size
 */
function getSize(el) {
  const bounds = el.getBoundingClientRect()
  //                ~~~~~~~~~~~~~~~~~~~~~
  //     Property 'getBoundingClientRect' does not exist on type 'Node'
  return { width: bounds.width, height: bounds.height }
  //      ~~~~~ Type '{ width: any; height: any; }' is not
  //            assignable to type '{ w: number; h: number; }'
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&strictNullChecks=false&allowJs=true&noEmit=true#code/PTAEAEBcGcFoGMAWBTeBrAUMAVNjptQBxZGUSFUaASwC9lQAKagO1AAdqAPZAG2gCUoAPYAzUAEM2fZAFtkLSADp8hcOwkAnCbNABvAHLCAJsgC+oPqAAqlGfMWqIm0gFdNbPXoDuALlAsrrIARsiaADSgiP6BIWFmFrYMNPSqwBiirizwkNTCbADmpADKdMiMfEJ6+KDw+dCQoMHCWcbQoAC8lrxKRZAAQi0sxqwFAMK81AqQAEqokIwCANw1IKDrG5tboAB+e-sHh0erYJsACprC7GGQAJ6gAOR9g62jE1OKczkPoMbCyO0WMJGsguNQGiI2Hdro8jKYHjUXJB3J5vNRjBR-M1WtAlGiMYhIihqAVEJAsUM2kpiaTIGYVus1ltDjZbjCHnpQPjMZIWLcllFkCSyf4pPzQGYfuCAsCTttthJoDQCiwJMFeAxIMJyGyGByuTEgqFNALogEjWEBZKMGYMEA)

第一个问题是误解了 DOM：`getBoundingClientRect()`是定义在 Element 上的，不是 Node。所以应该更新`@param`标签。第二个问题是`@return`标签中指定的属性与实际实现不匹配。推测项目其他部分都使用`width`和`height`属性，因此应该更新`@return`标签。其实这个标签甚至可以去掉，因为 TypeScript 能自动推断返回类型。

你可以用 JSDoc 逐步给项目添加类型标注。TypeScript 语言服务会提供"推断类型标注"的快速修复功能，适用于那些从代码用法就能明确类型的场景。

```ts
function double(val) {
  return 2 * val
}
```

你会在编辑器里看到 `val` 下方出现虚线标注，点击它就能看到如图 10-2 所示的快速修复选项。

![Figure 10-2. The TypeScript Language Services offer a quick fix to infer parameter types from usage.](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506102225524.png)

这会生成正确的 JSDoc 注释：

```js
// @ts-check
/**
 * @param {number} val
 */
function double(val) {
  return 2 * val
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&strictNullChecks=false&allowJs=true&noEmit=true#code/PTAEAEBcGcFoGMAWBTeBrAUMAVNjpsIAHAQwCcSBbUAbwDsBXSgI2TIF9QA3EgG32zAMAMwZ14kAJYB7OqAAm0hs17IAFD14BKWvlBlkkBmTkAmAtz4BuDOwxA)

使用`@ts-check`有助于推动类型在代码中转换。但效果并不总是理想，例如：

```ts
function loadData(data) {
  data.files.forEach(async (file) => {
    // ...
  })
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&strictNullChecks=false&allowJs=true&noEmit=true&noImplicitAny=false#code/GYVwdgxgLglg9mABAGzgQwCYBE1TQCg1zQEpEBvAKEUSLwDpgZkBTAZ0bgCcBRNCABb40bAJ6RETVogC8APgrUaiAPQrE9TUoC+JANyVtlIA)

如果使用快速修复功能来标注 data 类型，最终会得到：

```ts
/**
 * @param {{
 *  files: { forEach: (arg0: (file: any) => Promise<void>) => void; };
 * }} data
 */
function loadData(data) {
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&strictNullChecks=false&allowJs=true&noEmit=true&noImplicitAny=false#code/PQKhCgAIUgBAHAhgJ0QW0gb01GkBmAlgDYCmAzgFxYED2yAoogMYAW1AFCgOYAMnRMtUQA7AJ4BKSAF4AfJAAKyWmkLlSAHgButQgBNZUuZB36A3JAC+Z3FcuQ9iAC6JcwcPgCuI5k8K0RSGJaRD0AEWdEDkcXKRxISGBgSAA6NPBLcCA)

这里出现了结构类型化的误用（第 4 条）。虽然从技术上讲该函数能处理任何具有特定签名的 forEach 方法的对象，但实际意图很可能是要求参数类型为 `{files: string[]}`。

通过 JSDoc 注释和`@ts-check`，你可以在 JavaScript 项目中获得大部分 TypeScript 的体验。这种方式很吸引人，因为它不需要改变你的工具链。但最好不要过度依赖这种方法——注释模板会带来额外的成本：你的业务逻辑很容易淹没在 JSDoc 的海洋里。TypeScript 在`.ts` 文件中才能发挥最佳效果，而不是`.js` 文件。最终目标应该是将项目转换为 TypeScript，而不是停留在带 JSDoc 注释的 JavaScript 阶段。

`@ts-check`的真正价值在于组织层面：在向管理层申请投入数周或数月进行 TypeScript 迁移之前，它可以作为实验类型系统、发现迁移障碍、评估迁移难度的有效工具。

## 关键点总结

- 在 JavaScript 文件顶部添加 "`// @ts-check`" 以启用类型检查，而无需转换为 TypeScript。
- 识别常见错误。了解如何声明全局变量并为第三方库添加类型声明。
- 使用 JSDoc 注释进行类型断言和更好的类型推断。
- 不要花太多时间通过 JSDoc 让代码完美类型化。记住，目标是转换为 _.ts_ 文件！

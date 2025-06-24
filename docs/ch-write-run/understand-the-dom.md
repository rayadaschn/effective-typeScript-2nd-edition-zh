# Item 75: Understand the DOM Hierarchy

## 要点

- The DOM has a type hierarchy that you can usually ignore while writing JavaScript. But these types become more important in TypeScript. Understanding them will help you write TypeScript for the browser.
- Know the differences between `Node`, `Element`, `HTMLElement`, and `EventTarget`, as well as those between `Event` and `MouseEvent`.
- Either use a specific enough type for DOM elements and Events in your code or give TypeScript the context to infer it.

## 正文

本书中的大部分条目对于你在哪里运行 TypeScript 都是无关紧要的：在网页浏览器中、在服务器上，还是在手机上。这一个条目则不同。如果你不是在浏览器中工作，请跳到第 76 条！

当你在网页浏览器中运行 JavaScript 时，DOM 层次结构总是存在的。当你使用 `document.getElementById` 获取元素，或使用 `document.createElement` 创建元素时，它总是特定类型的元素，即使你可能不完全熟悉这个分类体系。你调用你想要的方法并使用你想要的属性，然后希望一切顺利。

在 TypeScript 中，DOM 元素的层次结构变得更加明显。了解你的 `Node`、`Element` 和 `EventTarget` 之间的区别将帮助你调试类型错误并决定何时使用类型断言是合适的。因为如此多的 API 都基于 DOM，所以即使你使用 React 或 D3 这样的框架，这也是相关的。

假设你想跟踪用户在一个 `<div>` 上拖拽鼠标的过程。你写了一些看似无害的 JavaScript：

```ts
function handleDrag(eDown) {
  const targetEl = eDown.currentTarget
  targetEl.classList.add('dragging')
  const dragStart = [eDown.clientX, eDown.clientY]

  const handleUp = (eUp) => {
    targetEl.classList.remove('dragging')
    targetEl.removeEventListener('mouseup', handleUp)
    const dragEnd = [eUp.clientX, eUp.clientY]
    console.log(
      'dx, dy = ',
      [0, 1].map((i) => dragEnd[i] - dragStart[i])
    )
  }
  targetEl.addEventListener('mouseup', handleUp)
}

const surfaceEl = document.getElementById('surface')
surfaceEl.addEventListener('mousedown', handleDrag)
```

当你添加类型注解并运行类型检查器时，它在这 14 行代码中标记了不少于 11 个错误：

```ts
function handleDrag(eDown: Event) {
  const targetEl = eDown.currentTarget
  targetEl.classList.add('dragging')
  // ~~~~~           'targetEl' is possibly 'null'
  //       ~~~~~~~~~ Property 'classList' does not exist on type 'EventTarget'
  const dragStart = [
    eDown.clientX,
    eDown.clientY,
    //    ~~~~~~~        ~~~~~~~ Property '...' does not exist on 'Event'
  ]
  const handleUp = (eUp: Event) => {
    targetEl.classList.remove('dragging')
    // ~~~~~           'targetEl' is possibly 'null'
    //       ~~~~~~~~~ Property 'classList' does not exist on type 'EventTarget'
    targetEl.removeEventListener('mouseup', handleUp)
    // ~~~~~ 'targetEl' is possibly 'null'
    const dragEnd = [
      eUp.clientX,
      eUp.clientY,
      //  ~~~~~~~      ~~~~~~~   Property '...' does not exist on 'Event'
    ]
    console.log(
      'dx, dy = ',
      [0, 1].map((i) => dragEnd[i] - dragStart[i])
    )
  }
  targetEl.addEventListener('mouseup', handleUp)
  // ~~~~~ 'targetEl' is possibly 'null'
}

const surfaceEl = document.getElementById('surface')
surfaceEl.addEventListener('mousedown', handleDrag)
// ~~~~~~ 'surfaceEl' is possibly 'null'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABACwIZgCYBsCmARAJ1QHMAKfOAdzAC5EBRANxzCgEpEBvAKEUQgQBnKIiioCxHFHpZEAXkQVqAOgggCBFlAAq4yVADcvUXqkzVWVIMEAZGMOWoMGUgHIMRYsRhhirtkZ8APRBiAB+ERF80TF8rmISZliuiPaIAA5w1jAARlgAnoiuYCBYycYhsXyRNVEACgRw6TgEUIWuEJbWdsIpGHA4gohgcCI4AB72Igii+c1FTFq6iVCuxgJgwogeJADKCSIKANrG0UpgFjBaABoANIp4VBedV6wAmqfBodG1UVXhv0QDSaLTaRWUEL6AyGIzGky2M1ci1Yaz4AF1AvwhCI0JhcABVdLyRDkQl0ZHseQAPi4nwS+nMnSstimyk0AFs4Mw3DsvD4-AFPpVav8YvFTNJkqkhplsnl2iUyqjopUqr9IkDGs1Wu0md0plDBsNRop4dMkG15kjmKxlvplXx6Uk2ThOcwKT0oCwWm5OSBBDgQOlXPdcdgcITBTFhTUik7JSk0rLBLkCkVFeUYhstrz6JhiScqhH0pcbvdi6X3p8vtVAbF1dFgdqwa4IcpDTCTRMpohERSHYgMZ9s3BcMosHAyO5xvcMIUFCHEEcAAz3ACMaOU7NQ6VIMGp208eYwRxgaMQAFpD3sDqe0Wwo4gAL7GePmJwYD1Tb0EX1wf2BsGoboOGkaYjGGriisMiJjKWQpvK6alOUL7cNmIiCOowCoBAOAyMS-RqOyWjKAyuDEawABC+QAJIuK4mEENhuH+EYjHMXhWCOM4X7CD+f4Af01CLmGuCECQgoQZB7E4ZxsEZPBqYKshaxAA)

出了什么问题？这个 `EventTarget` 是什么？为什么一切都可能是 `null`？

要理解 `EventTarget` 错误，需要深入了解一下 DOM 层次结构。这里有一些 HTML：

```html
<p id="quote">and <i>yet</i> it moves</p>
```

如果你打开浏览器的 JavaScript 控制台并获取对 p 元素的引用，你会看到它是一个 `HTMLParagraphElement`：

```ts
const p = document.getElementsByTagName('p')[0]
p instanceof HTMLParagraphElement
// true
```

`HTMLParagraphElement` 是 `HTMLElement` 的子类型，`HTMLElement` 是 `Element` 的子类型，`Element` 是 `Node` 的子类型，`Node` 是 `EventTarget` 的子类型。注意，这些都是 JavaScript 运行时值，不仅仅是 TypeScript 类型。表 9-1 列出了层次结构中一些类型的例子。

![Table 9-1. Types in the DOM hierarchy](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202506240856604.png)

`EventTarget` 是所有 DOM 类型中最通用的。你只能用它来添加事件监听器、移除它们和分发事件。考虑到这一点，`classList` 错误开始变得更有意义：

```ts
function handleDrag(eDown: Event) {
  const targetEl = eDown.currentTarget
  targetEl.classList.add('dragging')
  // ~~~~~           'targetEl' is possibly 'null'
  //       ~~~~~~~~~ Property 'classList' does not exist on type 'EventTarget'
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABACwIZgCYBsCmARAJ1QHMAKfOAdzAC5EBRANxzCgEpEBvAKEUQgQBnKIiioCxHFHpZEAXkQVqAOgggCBFlAAq4yVADcvUXqkzVWVIMEAZGMOWoMGUgHIMRYsRhhirtkZ8APRBiAB+ERF80TF8rmISZliuiPaIAA5w1jAARlgAnoiuYCBYycYhsXyRNVEACgRw6TgEUIWuEJbWdsIpGHA4gohgcCI4AB72Igii+c1FTFq6iVCuxgJgwogeJADKCSIKANrG0UpgFjBaABoANIp4VBedV6wAmqfBodG1UVXhv0QDSaLTaRWUEL6AyGIzGky2M1ci1Yaz4AF1AvwhCI0JhcABVdLyRDkQl0ZHseQAPi4nwS+nMnSstimyk0AFs4Mw3DsvD4-AFPpVav8YvFTNJkqkhplsnl2iUyqjopUqr9IkDGs1Wu0md0plDBsNRop4dMkG15kjmKxlvplXx6Uk2ThOcwKT0oCwWm5OSBBDgQOlXPdcdgcITBTFhTUik7JSk0rLBLkCkVFeUYhstrz6JhiScqhH0pcbvdi6X3p8vtVAbF1dFgdqwa4IcpDTCTRMpohERSHYgMZ9s3BcMosHAyO5xvcMIUFCHEEcAAz3ACMaOU7NQ6VIMGp208eYwRxgaMQAFpD3sDqe0Wwo4gAL7GePmJwYD1Tb0EX1wf2BsGoboOGkaYjGGriisMiJjKWQpvK6alOUL7cNmIiCOowCoBAOAyMS-RqOyWjKAyuDEawABC+QAJIuK4mEENhuH+EYjHMXhWCOM4X7CD+f4Af01CLmGuCECQgoQZB7E4ZxsEZPBqYKshaxAA)

顾名思义，`Event` 的 `currentTarget` 属性是一个 `EventTarget`。它甚至可能是 `null`。TypeScript 没有理由相信它有 `classList` 属性。虽然 `currentTarget` 在实践中可能是 `HTMLElement`，但从类型系统的角度来看，没有理由它不能是 `window` 或 `XMLHttpRequest`。（`currentTarget` 是你注册监听器的元素，而 `target` 是事件起源的元素，它可能有不同的类型。）

向上移动到层次结构，我们来到 `Node`。不是 `Element` 的 `Node` 包括文本片段和注释。例如，在这个 HTML 中：

```html
<p>
  And <i>yet</i> it moves
  <!-- quote from Galileo -->
</p>
```

最外层的元素是一个 `HTMLParagraphElement`。正如你在这里看到的，它有 `children` 和 `childNodes`：

```ts
> p.children
HTMLCollection [i]
> p.childNodes
NodeList(5) [text, i, text, comment, text]
```

`children` 返回一个 `HTMLCollection`，一个类似数组的结构，只包含子 `Element`（`<i>yet</i>`）。`childNodes` 返回一个 `NodeList`，一个类似数组的 `Node` 集合。这不仅包括 `Element`（`<i>yet</i>`），还包括文本片段（"And," "it moves"）和注释（"quote from Galileo"）。（参见第 17 条了解"类似数组"的含义。）如果你需要一个真正的数组，可以使用数组展开语法（`[...p.childNodes]`）。

`Element` 和 `HTMLElement` 之间有什么区别？有非 HTML 的 `Element`，包括整个 SVG 标签层次结构。这些是 `SVGElement`，它们是另一种类型的 `Element`。`<html>` 或 `<svg>` 标签的类型是什么？它们是 `HTMLHtmlElement` 和 `SVGSVGElement`。如果你不使用 SVG 或 MathML，那么在实践中，你的所有 `Element` 都将是 `HTMLElement`。

有时专门的 `Element` 类会有自己的属性——例如，`HTMLImageElement` 有 `src` 属性，`HTMLInputElement` 有 `value` 属性。如果你想从值中读取这些属性之一，它的类型必须足够具体才能拥有该属性。

TypeScript 对 DOM 的类型声明大量使用字面量类型，试图为你提供最具体的类型。例如：

```ts
const p = document.getElementsByTagName('p')[0]
//    ^? const p: HTMLParagraphElement
const button = document.createElement('button')
//    ^? const button: HTMLButtonElement
const div = document.querySelector('div')
//    ^? const div: HTMLDivElement | null
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBADjAvDAJiYBXAtgUzFAOgHMcoBRAGx13wgCEBPAFQEMiA5F3ACgHI5eASgDaABgC6AbgBQAelkxFMAHoB+GKEiw4ALhgAJJgFkAMgAUWAJzbW4AC0rU8UaZugwARhihRwSVOjYzgTAljgsUDiONFB8Xj7gQjLySirqbrDxvmB6hqZ03tnRzq7g7igAlgBu-miYMQQAjhg4lgwAyjhUwL6WfJVVSXIKSmoaZbADucYmACLVxfgwAD4wYBgUFNJAA)

但这并不总是可能的，特别是对于 `document.getElementById`：

```ts
const div = document.getElementById('my-div')
//    ^? const div: HTMLElement | null
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAJgSwG4wLzxMArgWwKZhQB0A5nlAKIA2e+hAQgJ4CScAFAOQ6MC0iSHAJQBuAFAB6cTGkwAegH4YoSLH4AuGAAkAKgFkAMtVoFYAHxhgsVKqKA)

虽然类型断言通常不被推荐（第 9 条解释了原因），但这是你知道的比 TypeScript 更多的情况，所以它们是合适的。只要你知道 `#my-div` 是一个 div，这个断言就没有问题：

```ts
document.getElementById('my-div') as HTMLDivElement
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYewxgrgtgpgdgFwHQHMYIKIBsa0QIQE8BJYACgHIpCBaYASwDcKBKAAgEMBnNgCQBUAsgBkAIk2y54CANwAoIA)

如果你不知道，运行时检查会起作用：

```ts
const div = document.getElementById('my-div')
if (div instanceof HTMLDivElement) {
  console.log(div)
  //          ^? const div: HTMLDivElement
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAJgSwG4wLzxMArgWwKZhQB0A5nlAKIA2e+hAQgJ4CScAFAOQ6MC0iSHAJQBuAFAIAZjDb8YCSFACGYYHhBSAEgBUAsgBkAIsmq0CUQTADeomDFCQQNIlRAkZyETZgB6b7f8BMAB6APx24NDwyABcMNr6RkgmdFCiAL6iQA)

（第 54 条探索了另一种为 `HTMLElement` 获得更精确类型的方法。）

启用 `strictNullChecks` 后，你需要考虑 `document.getElementById` 返回 `null` 的情况。根据这是否真的会发生，你可以添加 `if` 语句或非空断言（`!`）：

```ts
const div = document.getElementById('my-div')!
//    ^? const div: HTMLElement
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAJgSwG4wLzxMArgWwKZhQB0A5nlAKIA2e+hAQgJ4CScAFAOQ6MC0iSHAJQBCANwAoAPSSYsmAD0A-DFCRY-AFwwAEgBUAsgBlqtAlHFA)

这些类型不是 TypeScript 特有的。相反，它们是从 DOM 的正式规范生成的。这是第 42 条建议在可能时从规范生成类型的一个例子。

关于 DOM 层次结构就说到这里。那么 `clientX` 和 `clientY` 错误呢？

```ts
function handleDrag(eDown: Event) {
  // ...
  const dragStart = [
    eDown.clientX,
    eDown.clientY,
    //    ~~~~~~~        ~~~~~~~ Property '...' does not exist on 'Event'
  ]
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABACwIZgCYBsCmARAJ1QHMAKfOAdzAC5EBRANxzCgEpEBvAKEUQHp+iAHSjeiCAgDOURBiLEAylFQFZAXkQBtcX0QVqwiFhgsoADQA0+vFTBGTZgJq6+gvYgB+3n548ffH0QABQI4AAccNQBPRAByUWE4uTgcKUQwOFkcAA8YGUQEeKYzOPEAXQBucXdE7gBfbiA)

除了 `Node` 和 `Element` 的层次结构外，还有 `Event` 的层次结构。TypeScript 的 `lib.dom.d.ts` 定义了不少于 54 个 `Event` 的子类型！

普通的 `Event` 是最通用的事件类型。更具体的类型包括：

- `UIEvent` - 任何类型的用户界面事件
- `MouseEvent` - 由鼠标触发的事件，如点击
- `TouchEvent` - 移动设备上的触摸事件
- `KeyboardEvent` - 按键事件

`handleDrag` 中的问题是事件被声明为 `Event`，而 `clientX` 和 `clientY` 只存在于更具体的 `MouseEvent` 类型上。

那么你如何修复本条开头的例子呢？第 24 条解释了 TypeScript 如何利用上下文来推断更精确的类型，DOM 声明大量使用了这一点。内联 `mousedown` 处理程序给 TypeScript 更多上下文并移除了大部分错误。你也可以将参数类型声明为 `MouseEvent` 而不是 `Event`。

这是本条开头代码示例的完整版本，通过了类型检查器：

```ts
function addDragHandler(el: HTMLElement) {
  el.addEventListener('mousedown', (eDown) => {
    const dragStart = [eDown.clientX, eDown.clientY]
    const handleUp = (eUp: MouseEvent) => {
      el.classList.remove('dragging')
      el.removeEventListener('mouseup', handleUp)
      const dragEnd = [eUp.clientX, eUp.clientY]
      console.log(
        'dx, dy = ',
        [0, 1].map((i) => dragEnd[i] - dragStart[i])
      )
    }
    el.addEventListener('mouseup', handleUp)
  })
}

const surfaceEl = document.getElementById('surface')
if (surfaceEl) {
  addDragHandler(surfaceEl)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoCICdkHMASyYqANgKZYAUZJAXIvgCoCyAMgKLkC2ZYUAlIgDeAKESIaAOjSp2AN15RWMAM5ReFSgHIucECrKo4AdzBaANBIwmkAXgB8wseMQQEaxKhy4AylGRYUIi2iADaZNamkhAkMIoAGpYRNtGxigCaALoA3M7ibmAeABZEpGQAqgAOwYjUVfTMegbyioIOTi4uUjHIKirKapJYZLoK2l54uDBguFr8uZ3iUsOjZC18A+pgmjpNZCCVFoglxORV83kuBR4TuOzENeFVqXF8iRLPMa9QWQuL13ByJISHBcOMAB6WVAATxqR1CAAZLABGTKSLjISqUGDBRy3e6oUIwTKIAC0nm8fgCUCJmX4F06AF9LlIZOslKotjtdPp9odLCcyuc-oyLsyRNcgioQFhgMgIGsSDUjBAQDw+JJcGQoJwRooAELQgCSqG00tl8rIc1yMGAtXNcoVnEEonEMmweEIp00DstztyzKAA)

最后的 `if` 语句处理了没有 `#surface` 元素的可能性。如果你知道这个元素存在，你可以使用非空断言代替（`surfaceEl!`）。`addDragHandler` 需要一个非空的 `HTMLElement`，遵循第 33 条的建议将空值推到边界。

## 要点回顾

- DOM 有一个类型层次结构，在编写 JavaScript 时你通常可以忽略它。但这些类型在 TypeScript 中变得更加重要。理解它们将帮助你为浏览器编写 TypeScript。
- 了解 `Node`、`Element`、`HTMLElement` 和 `EventTarget` 之间的区别，以及 `Event` 和 `MouseEvent` 之间的区别。
- 要么在代码中为 DOM 元素和事件使用足够具体的类型，要么给 TypeScript 上下文来推断它。

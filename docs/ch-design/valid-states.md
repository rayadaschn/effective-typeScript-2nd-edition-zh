# 第 29 条: 尽量让你的类型只能表示合法的状态

## 要点

- 代表有效和无效状态的类型容易导致混乱和易错的代码。
- 优先使用只代表有效状态的类型。即使它们更长或更难表达，最终会为你节省时间和麻烦！

## 正文

如果你把类型设计得好，写代码就会变得轻松顺畅；但如果类型设计得不好，再聪明的技巧或再详尽的文档也救不了你。代码会变得难懂，容易出错。

高效的类型设计关键在于：**只允许表示“合法状态”的类型设计**。这一节会通过一些例子，说明类型设计可能出错的方式，以及如何修正。

假设你正在开发一个网页应用，功能是让用户选择一个页面，加载该页面的内容，并将其展示出来。你可能会这样写状态对象：

```ts
interface State {
  pageText: string
  isLoading: boolean
  error?: string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpjpZBvAUM5ABzgHMIAVCADzAC5kBnMKUEgbn2WAYBkB7OABNW9AEZ8+AGwhwQHAtCh8oAfnpMWIdrgC+uIA)

当你写代码来渲染页面时，需要考虑所有这些字段：

```ts
function renderPage(state: State) {
  if (state.error) {
    return `Error! Unable to load ${currentPage}: ${state.error}`
  } else if (state.isLoading) {
    return `Loading ${currentPage}...`
  }
  return `<h1>${currentPage}</h1>\n${state.pageText}`
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpjpZBvAUM5ABzgHMIAVCADzAC5kBnMKUEgbn2WAYBkB7OABNW9AEZ8+AGwhwQHAtCh8oAfnpMWIdrgC+uQRASS4UFNLDIEAVyinwABVIR1zVhxhWQCMMD4hkdgZQjmQAFEyYzmgYkACUOJzAMMjhMRAAdIrK8XgEBKZgNv4ABgCitsoAhMgAqiBwotLIYHzIkgKCyAAk2Na2EA5OOvQ9EZCZFVA6xfLIOsgQkgwoSSljGdz8Qqw5nPkQhVAlW8Ja3b02dmAhEDrp9zOcevuHJQA8ABYAjAB8PX1XG46N4Aem+PwAOiBRml0sQyJQaNMOHogA)

不过这样做真的合理吗？如果 `isLoading` 和 `error` 同时为 true，那又意味着什么？该显示加载中的提示，还是错误信息？很难判断！因为没有足够的信息来决定。

再比如你要写一个 `changePage` 函数，该怎么办？来看一个尝试的写法：

```ts
async function changePage(state: State, newPage: string) {
  state.isLoading = true
  try {
    const response = await fetch(getUrlForPage(newPage))
    if (!response.ok) {
      throw new Error(`Unable to load ${newPage}: ${response.statusText}`)
    }
    const text = await response.text()
    state.isLoading = false
    state.pageText = text
  } catch (e) {
    state.error = '' + e
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpjpZBvAUM5ABzgHMIAVCADzAC5kBnMKUEgbn2WAYBkB7OABNW9AEZ8+AGwhwQHAtCh8oAfnpMWIdrgC+uQRASS4UFNLDIEAVyinwABVIR1zVhxhWQCMMD4hkZGAAqlCSAGLKjmQAFIQumiQAlDjIpmA2-gDkmWzIenAMAJ5eyB5ePn6WABayZFEQ0UyYzmgYkAA0yCAQAO718azJeARNkAB03PxCrMgAvMjMVhDyC1CFOJwECH5MqRAMhDso83A9cMAWMBBgCFXRgSHhkU7R3X1OiYkrBMAwyNEAQlMByOYz4AGshpsCAsqkoel1esgAKK2ZTRAAGQRAcFE0gWfGQkgEgmQABJsG96jp6BTgYcQAwIGNRlYGJQaDoMV9oXoYZYdhZIDQ5shTucLPTQcKwNEefzRszJiSZvN4JImd9GG1mcQyByLPMZSsdJZMLd-hAoQqdWNFMpRdlkABqZDLTh6PRAA)

这样写有很多问题！比如：

- 我们忘了在出错的情况下把 `state.isLoading` 设置为 `false`。
- 我们没有清除 `state.error`，所以如果上一次请求失败了，就会一直显示旧的错误信息，而不是加载提示或新页面。
- 如果用户在页面加载过程中又切换了页面，结果就很难预测了。可能会先看到新页面再报错，也可能只看到旧页面，看后台请求返回的顺序而定。

问题在于，当前的状态既包含的信息太少（比如：哪个请求失败了？哪个正在加载？），又包含了太多——`State` 类型允许 `isLoading` 和 `error` 同时存在，但这其实是一个无效状态。

这种状态结构让 `render()` 和 `changePage()` 这类函数很难写得合理。

下面是一个更好的应用状态表示方式：

```ts
interface RequestPending {
  state: 'pending'
}
interface RequestError {
  state: 'error'
  error: string
}
interface RequestSuccess {
  state: 'ok'
  pageText: string
}
type RequestState = RequestPending | RequestError | RequestSuccess

interface State {
  currentPage: string
  requests: { [page: string]: RequestState }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoQI4FcIGcwAKEIAJqAObIDeAUMsvnJAFzIDkADsWSOWwNw0AvjVCRYiFOmx4wAUShQA9lGp0GYJhFZtoyqAPV6VrfFAqCRY6PCRpMOfAGUsCJLlxr6jFuyUBrQ3oOOHIIABUIAA8wUzBzXksaMABPLnsZZ01IZABeDMdCbgpkAB8C2QV9MornV3dcQVFwG0lkJ2yUWnoELEViQlDtDQTyQXooB1lcVioAbRCwuNGAXVZpQo6tISSgA)

这里使用了一个标记联合类型（也叫“可辨识联合类型”）来明确表示网络请求可能处于的不同状态。

这种写法虽然状态定义长了三到四倍，但最大的好处是：**不会出现无效状态**。当前页面和每一个请求的状态都被清晰地建模出来了。

这样一来，`renderPage` 和 `changePage` 函数的实现就变得简单明了。

```ts
function renderPage(state: State) {
  const { currentPage } = state
  const requestState = state.requests[currentPage]
  switch (requestState.state) {
    case 'pending':
      return `Loading ${currentPage}...`
    case 'error':
      return `Error! Unable to load ${currentPage}: ${requestState.error}`
    case 'ok':
      return `<h1>${currentPage}</h1>\n${requestState.pageText}`
  }
}

async function changePage(state: State, newPage: string) {
  state.requests[newPage] = { state: 'pending' }
  state.currentPage = newPage
  try {
    const response = await fetch(getUrlForPage(newPage))
    if (!response.ok) {
      throw new Error(`Unable to load ${newPage}: ${response.statusText}`)
    }
    const pageText = await response.text()
    state.requests[newPage] = { state: 'ok', pageText }
  } catch (e) {
    state.requests[newPage] = { state: 'error', error: '' + e }
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoQI4FcIGcwAKEIAJqAObIDeAUMsvnJAFzIDkADsWSOWwNw0AvjVCRYiFOmx4wAUShQA9lGp0GYJhFZtoyqAPV6VrfFAqCRY6PCRpMOfAGUsCJLlxr6jFuyUBrQ3oOOHIIABUIAA8wUzBzXksaMABPLnsZZ01IZABeDMdCbgpkAB8C2QV9MornV3dcQVFwG0lkJ2yUWnoELEViQlDtDQTyQXooB1lcVioAbRCwuNGAXVZpQo6tISSYLBAEMGAlEGQwsABVKAAbADEVAiGACg5ligBKamRJsD7TtgEyBEewORxO3240EeYSePmGW0gn26yAQJ3w1F6-XA0IgQjyGi04xRaLAEMyYARKHycIAdJNybg5pjJtihisibgAO7AMAIAAWyCe9M2nRpcKR6h6cFwKE4xV4bGYkvoEN+UFOAAMADJKOA8SgAEiozIGOKENItGqJUpl7GMBiVKpVPz+yA1VRUAEJkBcQHAAEbXFBgJTIa66kjII0m1lhISsI3C2SUmn2oRW5UIaWygKK5UTCBqzUAHj5AEYAHzRvoswZx4sAenLFYAOiBE1MsloaYsItEwOmiSIRDRpSkDsgQYdjqd+XBeBAcbDOqxKQAaZAgCCcnFvXgS7yipP4Rlbnds-FUOE6LikChsHbqWkxutUzfbnFE+IpLwq1EgdFJlwDg0TfOBOTgHlJ0LfknnOK47geZ4zxxd53mtZBgBgQVPSAkCAIgGkAgPJ1kDAPllE5d8qI9KAng1X0AyDMjQ3DPUoyoFChnjDi8NAsVsiwXBIhidN0OVEQnX-dFexE0l8nAyDST4giaUgGInnEp1aWPMBTw-C98ivFc-ECDdZP7R96DxLNeQFJ4IBIw9u10-TzzCFZL2vO1FBUNgN3tHQ2GQABqZBcSHYQaCAA)

第一种实现方式中的那些模糊之处已经完全消除了：当前页面是什么一目了然，每个请求也都**明确处于某一种状态**。即使用户在发出请求后又切换了页面，也不会有问题。旧的请求虽然可能仍然完成，但它不会影响 UI。

再来看一个更简单却更严重的例子：2009 年 6 月 1 日，法航 447 航班在大西洋上空失踪。这架空客 A330 是一架“电传操控”飞机，飞行员的操作并不会直接作用于飞机的操纵面，而是先经过一套计算机系统。事故发生后，人们开始质疑：把生死决策交给计算机，真的可靠吗？

两年后，从海底打捞出的黑匣子揭示了导致事故的一系列原因，其中**一个关键原因就是糟糕的状态设计**。

A330 的驾驶舱中，飞行员和副驾驶有各自独立的操控杆（side stick），用于控制飞机的攻角。往后拉表示爬升，往前推表示俯冲。而这架飞机的系统允许两根操控杆**同时独立操作**，这就是所谓的“双输入”模式（dual input）。

可以用 TypeScript 来模拟这个状态，大致如下：

```ts
interface CockpitControls {
  /** Angle of the left side stick in degrees, 0 = neutral, + = forward */
  leftSideStick: number
  /** Angle of the right side stick in degrees, 0 = neutral, + = forward */
  rightSideStick: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoQI4FcIGcwAKEIAJqAObIDeAUMsvnJAFzIDkADsWSOWwNw0AvjVCRYiFOmx4wAUShQA9lGp0GYJhFZtoyqAPV6VrfFAqCRY6PCRpMOfAGUsCJLlxr6jFuyUBrQ3oOOHIIABUIAA8wUzBzXksaMABPLnsZZ01IZABeDMdCbgpkAB8C2QV9MornV3dcQVFwG0lkJ2yUWnoELEViQlDtDQTyQXooB1lcVioAbRCwuNGAXVZpQo6tISSYLBAEMGAlEGQwsABVKAAbADEVAiGACg5ligBKamRJsD7TtgEyCsLQkdgAwkoEP4OMAwBDwMprp5usgAPQAKnRyAAgrxriglDBkGAABYofEwMAMYAkFD4YBQ5CgZC08iTPAAGmQAAY8sgQBAsPE4NcuQBqPkwFQAdzgUBIyHRqPUFLAThpEA6DP8rBAWAAtgAjaDjNGYnF4glE0koczkElU3AajTapmnVns3Bc3n5AVCqAi8WSmVyhVK9R2h3q2laqG6g3GqBJIA)

假设你拿到这个数据结构，并被要求编写一个 `getStickSetting` 函数，用于计算当前的操控杆状态。你会怎么做？

一种方式是假设左边的飞行员（主驾）在控制：

```ts
function getStickSetting(controls: CockpitControls) {
  return controls.leftSideStick
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoQI4FcIGcwAKEIAJqAObIDeAUMsvnJAFzIDkADsWSOWwNw0AvjVCRYiFOmx4wAUShQA9lGp0GYJhFZtoyqAPV6VrfFAqCRY6PCRpMOfAGUsCJLlxr6jFuyUBrQ3oOOHIIABUIAA8wUzBzXksaMABPLnsZZ01IZABeDMdCbgpkAB8C2QV9MornV3dcQVFwG0lkJ2yUWnoELEViQlDtDQTyQXooB1lcVioAbRCwuNGAXVZpQo6tISSYLBAEMGAlEGQwsABVKAAbADEVAiGACg5ligBKamRJsD7TtgEyCsLQkdgAwkoEP4OMAwBDwMprp5usgAPQAKnRyAAgrxriglDBkGAABYofEwMAMYAkFD4YBQ5CgZC08iTPAAGmQAAY8sgQBAsPE4NcuQBqPkwFQAdzgUBIyHRqPUFLAThpEA6DP8rBAWAAtgAjaDjNGYnF4glE0koczkElU3AajTapmnVns3Bc3n5AVCqAi8WSmVyhVK9R2h3q2laqG6g3GqC7faHY6nc6x-xOCBgI68J4IE7xJRI1gQqEwuFFxG4T4on5-ZCFhEl3AAOlV0c1RyhSSAA)

但如果是副驾驶在控制呢？也许你应该取那个偏离 0 值更远的操控杆：

```ts
function getStickSetting(controls: CockpitControls) {
  const { leftSideStick, rightSideStick } = controls
  if (leftSideStick === 0) {
    return rightSideStick
  }
  return leftSideStick
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoQI4FcIGcwAKEIAJqAObIDeAUMsvnJAFzIDkADsWSOWwNw0AvjVCRYiFOmx4wAUShQA9lGp0GYJhFZtoyqAPV6VrfFAqCRY6PCRpMOfAGUsCJLlxr6jFuyUBrQ3oOOHIIABUIAA8wUzBzXksaMABPLnsZZ01IZABeDMdCbgpkAB8C2QV9MornV3dcQVFwG0lkJ2yUWnoELEViQlDtDQTyQXooB1lcVioAbRCwuNGAXVZpQo6tISSYLBAEMGAlEGQwsABVKAAbADEVAiGACg5ligBKamRJsD7TtgEyCsLQkdgAwkoEP4OMAwBDwMprp5usgAPQAKnRyAAgrxriglDBkGAABYofEwMAMYAkFD4YBQ5CgZC08iTPAAGmQAAY8sgQBAsPE4NcuQBqPkwFQAdzgUBIyHRqPUFLAThpEA6DP8rBAWAAtgAjaDjNGYnF4glE0koczkElU3AajTapmnVns3Bc3n5AVCqAi8WSmVyhVK9R2h3q2laqG6g3GqC7faHY6nc6x-xOCBgI68J4IE7xJRI1gQqEwuFFxG4T4owsgfDUVXRzVHKFcyNqjWZoR8hvFpGm4BEp4tnvt-x5XL5bl19QTHN-b7Ae3dmOT00iRe-KCnccb7VJIA)

但这个实现也有问题：只有当右侧操控杆是中立（为 0）时，才能放心地返回左侧的设置。所以你应该加个判断：

```ts
function getStickSetting(controls: CockpitControls) {
  const { leftSideStick, rightSideStick } = controls
  if (leftSideStick === 0) {
    return rightSideStick
  } else if (rightSideStick === 0) {
    return leftSideStick
  }
  // ???
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoQI4FcIGcwAKEIAJqAObIDeAUMsvnJAFzIDkADsWSOWwNw0AvjVCRYiFOmx4wAUShQA9lGp0GYJhFZtoyqAPV6VrfFAqCRY6PCRpMOfAGUsCJLlxr6jFuyUBrQ3oOOHIIABUIAA8wUzBzXksaMABPLnsZZ01IZABeDMdCbgpkAB8C2QV9MornV3dcQVFwG0lkJ2yUWnoELEViQlDtDQTyQXooB1lcVioAbRCwuNGAXVZpQo6tISSYLBAEMGAlEGQwsABVKAAbADEVAiGACg5ligBKamRJsD7TtgEyCsLQkdgAwkoEP4OMAwBDwMprp5usgAPQAKnRyAAgrxriglDBkGAABYofEwMAMYAkFD4YBQ5CgZC08iTPAAGmQAAY8sgQBAsPE4NcuQBqPkwFQAdzgUBIyHRqPUFLAThpEA6DP8rBAWAAtgAjaDjNGYnF4glE0koczkElU3AajTapmnVns3Bc3n5AVCqAi8WSmVyhVK9R2h3q2laqG6g3GqC7faHY6nc6x-xOCBgI68J4IE7xJRI1gQqEwuFFxG4T4owsgfDUVXRzVHKFcyNqjWZoR8hvFpGm4BEp4tnvt-x5XL5bl19QTHN-b7Ae3dmOT019iBIlAj5BPLutzPT2fz+iL35QU7jjfarfqVGo5AAfjfwhoQA)

那如果两边的操控杆都不是 0 呢？希望它们差不多一致，这样你可以简单地取个平均值：

```ts
function getStickSetting(controls: CockpitControls) {
  const { leftSideStick, rightSideStick } = controls
  if (leftSideStick === 0) {
    return rightSideStick
  } else if (rightSideStick === 0) {
    return leftSideStick
  }
  if (Math.abs(leftSideStick - rightSideStick) < 5) {
    return (leftSideStick + rightSideStick) / 2
  }
  // ???
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoQI4FcIGcwAKEIAJqAObIDeAUMsvnJAFzIDkADsWSOWwNw0AvjVCRYiFOmx4wAUShQA9lGp0GYJhFZtoyqAPV6VrfFAqCRY6PCRpMOfAGUsCJLlxr6jFuyUBrQ3oOOHIIABUIAA8wUzBzXksaMABPLnsZZ01IZABeDMdCbgpkAB8C2QV9MornV3dcQVFwG0lkJ2yUWnoELEViQlDtDQTyQXooB1lcVioAbRCwuNGAXVZpQo6tISSYLBAEMGAlEGQwsABVKAAbADEVAiGACg5ligBKamRJsD7TtgEyCsLQkdgAwkoEP4OMAwBDwMprp5usgAPQAKnRyAAgrxriglDBkGAABYofEwMAMYAkFD4YBQ5CgZC08iTPAAGmQAAY8sgQBAsPE4NcuQBqPkwFQAdzgUBIyHRqPUFLAThpEA6DP8rBAWAAtgAjaDjNGYnF4glE0koczkElU3AajTapmnVns3Bc3n5AVCqAi8WSmVyhVK9R2h3q2laqG6g3GqC7faHY6nc6x-xOCBgI68J4IE7xJRI1gQqEwuFFxG4T4owsgfDUVXRzVHKFcyNqjWZoR8hvFpGm4BEp4tnvt-x5XL5bl19QTHN-b7Ae3dmOT019iBIlAj5BPLutzPT2fz+iL35QU7jjfarfqfdPACyTBJADo4IbcGOIJTj5OyAALQrmuAHap8AA8yAAKznhePzLr+-4Tq6EpHqhUKfKiyAAEwPvQqI4QA-KRwg0EAA)

但如果两边的操控杆**方向完全不一致**怎么办？你能抛出错误吗？显然不行——**机翼襟副翼必须要设定一个角度**！

在法航 447 航班上，飞机进入风暴时，副驾驶**悄悄地往后拉了操控杆**，飞机随之爬升，但速度逐渐降低，最终进入失速状态（也就是飞行速度太低，无法维持升力），然后开始下坠。

为了摆脱失速，飞行员受过的训练是：**推杆俯冲，让飞机重新加速**。主驾驶确实也是这么做的。但副驾驶依然在**悄悄地拉杆爬升**。

而空客的控制逻辑，大致等同于下面这个函数：

```ts
function getStickSetting(controls: CockpitControls) {
  return (controls.leftSideStick + controls.rightSideStick) / 2
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgEoQI4FcIGcwAKEIAJqAObIDeAUMsvnJAFzIDkADsWSOWwNw0AvjVCRYiFOmx4wAUShQA9lGp0GYJhFZtoyqAPV6VrfFAqCRY6PCRpMOfAGUsCJLlxr6jFuyUBrQ3oOOHIIABUIAA8wUzBzXksaMABPLnsZZ01IZABeDMdCbgpkAB8C2QV9MornV3dcQVFwG0lkJ2yUWnoELEViQlDtDQTyQXooB1lcVioAbRCwuNGAXVZpQo6tISSYLBAEMGAlEGQwsABVKAAbADEVAiGACg5ligBKamRJsD7TtgEyCsLQkdgAwkoEP4OMAwBDwMprp5usgAPQAKnRyAAgrxriglDBkGAABYofEwMAMYAkFD4YBQ5CgZC08iTPAAGmQAAY8sgQBAsPE4NcuQBqPkwFQAdzgUBIyHRqPUFLAThpEA6DP8rBAWAAtgAjaDjNGYnF4glE0koczkElU3AajTapmnVns3Bc3n5AVCqAi8WSmVyhVK9R2h3q2laqG6g3GqC7faHY6nc6x-xOCBgI68J4IE7xJRI1gQqEwuFFxG4T4on5-ZAF6sl3AAOlV0c1R0ZEsLCNbbcjao1mc+qOQACYkkA)

尽管主驾驶把操控杆**完全向前推**，但最终系统只是**把两边的输入平均了个“零”**。他完全不知道为什么飞机就是不俯冲。等到副驾驶终于说出自己在往后拉时，飞机早已高度不足，最终坠入大海，机上 228 人全部遇难。

这个故事想说明的是：**在这样的输入结构下，根本不可能正确实现 `getStickSetting` 函数**！这个函数从一开始就注定会失败。

在大多数飞机中，两套操控系统是**机械连接**的。如果副驾驶往后拉，主驾驶的杆子也会一起被拉回。这样它们的状态就非常简单清晰，表达起来也容易：

```ts
interface CockpitControls {
  /** Angle of the stick in degrees, 0 = neutral, + = forward */
  stickAngle: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHsEGsAOwwbhToA2AzsgN4BQyyA9AFSPICCIA5iSujMmAAsUZMMGzJQyACYQOUCBDIAaZAAZkAXmQgIAVzBQ4JFQGpNyGOigB3OFCnJG9WshFis7LhABc23QFsAI2gAbmoAX2ogA)

正如本章开头 Fred Brooks 的名言，现在我们的流程图一目了然。根本不需要写什么 `getStickSetting` 函数。

设计类型时，务必仔细考虑哪些值该包含，哪些该排除。如果只允许表示**合法状态**的值，你的代码会更容易写，TypeScript 也更容易帮你检查。这是一个非常通用的原则，本章后面还有多条内容会具体讲解它的不同体现。

## 关键点总结

- 代表有效和无效状态的类型容易导致混乱和易错的代码。
- 优先使用只代表有效状态的类型。即使它们更长或更难表达，最终会为你节省时间和麻烦！

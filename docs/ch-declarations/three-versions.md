# Item 66: Understand the Three Versions Involved in Type Declarations

## 要点

- There are three versions involved in an `@types` dependency: the library version, the `@types` version, and the TypeScript version.
- Recognize the symptoms of different types of version mismatch.
- If you update a library, make sure you update the corresponding `@types`.
- Understand the pros and cons of bundling types versus publishing them on DefinitelyTyped. Prefer bundling types if your library is written in TypeScript, and DefinitelyTyped if it is not.
- 一个 `@types` 依赖涉及三个版本：库版本、`@types` 版本和 TypeScript 版本。
- 识别不同类型版本不匹配的症状。
- 如果更新了库，确保更新相应的 `@types`。
- 理解将类型捆绑与发布到 DefinitelyTyped 的优缺点。如果你的库是用 TypeScript 编写的，优先选择捆绑类型；如果不是，优先选择发布到 DefinitelyTyped。

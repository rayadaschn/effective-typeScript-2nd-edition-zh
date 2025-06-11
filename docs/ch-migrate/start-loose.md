# 第 83 条：迁移完成的标志是启用 `noImplicitAny`

## 要点

- 没有开启 `noImplicitAny`，就不能算是真正完成 TypeScript 的迁移。宽松的类型检查可能会让真实的问题被掩盖。
- 可以循序渐进地修复类型错误，别急着强制要求。让团队有时间适应 TypeScript，再考虑更严格的校验选项。

## 正文

把整个项目转换成 `.ts` 格式当然是一项很大的成就，但这并不代表你的工作已经结束。接下来的目标是启用 `noImplicitAny` 选项。没有启用 `noImplicitAny` 的 TypeScript 代码，其实处于“过渡期”，因为它可能会掩盖你在类型声明中犯下的错误。

比如，你可能用过“添加所有缺失成员”的快捷修复功能，像第 82 条提到的那样给类添加了属性声明，结果自动加上了 `any` 类型，然后你打算手动改成正确的：

```ts
class Chart {
  indices: any

  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=false&strictNullChecks=false#code/MYGwhgzhAEDCAWYBOAXaBvAUNaBLAdgCa7ACmEAXNGPgJ4Dcm20A9C9AHReYC+mQA)

你觉得 `indices` 应该是数字数组，就改成了：

```ts
class Chart {
  indices: number[]

  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=false&strictNullChecks=false#code/MYGwhgzhAEDCAWYBOAXaBvAUNaBLAdgCa7ACmEAXNPgK4C2ARqUgNoC6A3JttAPS-QAdMMwBfTEA)

改完没有报错，于是你就继续开发了。但其实你弄错了类型：`number[]` 并不对。来看一下类中其他地方的代码：

```ts
getRanges() {
  for (const r of this.indices) {
    const low = r[0];
    //    ^? const low: any
    const high = r[1];
    //    ^? const high: any
    // ...
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=false&strictNullChecks=false#code/PTAEAkEkBEFECgDGAbAhgZ3aAwgC1QE4AuoA3vKKAJYB2AJlYgKboBcoNArgLYBGTBANoBdANzwQoWADlo8AOZMiAJVQ1F6ABQBKMhVAAzAPYFQmxEZroSpowdBFcVdADpaDZul3lKlC1ZJkIwB3UABeUCEABjF9SklfAD0AflB-a1Ag4PY1AE84tMsMp3lccMjBAEZY31AEyhTCgNAS3ByafNrJFx79AF94AckoOEGJMBk5IA)

很明显，`indices` 应该是一个二维数组 `number[][]`，或者是形如 `[number, number][]` 的数组才对。你可能会惊讶：为啥访问 `r[0]` 不报错？这正是没开 `noImplicitAny` 时，TypeScript 太宽松的体现。

如果你打开 `noImplicitAny`，这段代码就会报错了：

```ts
getRanges() {
  for (const r of this.indices) {
    const low = r[0];
    //          ~~~~ Element implicitly has an 'any' type because
    //               type 'Number' has no index signature
    const high = r[1];
    //           ~~~~ Element implicitly has an 'any' type because
    //                type 'Number' has no index signature
    // ...
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5&noImplicitAny=true&strictNullChecks=false#code/PTAEAkEkBEFECgDGAbAhgZ3aAwgC1QE4AuoA3vKKAJYB2AJlYgKboBcoNArgLYBGTBANoBdANzwQoWADlo8AOZMiAJVQ1F6ABQBKMhVAAzAPYFQmxEZroSpowdBFcVdADpaDZul3lKlC1ZJkIwB3UABeUCEABjF9SklfRMoAP1TkqWQmbiYaEipuAAdkRioiZABPUHwsNVAAcjVyuodygqZQfkRUTnQmONAEpKHKIlb2uukefgJm6o4janomAA9QdCp5GlQiTgI+xP9rKo3ccMjBAEZYxMHh0DT02Ezs3OpC4sRSiqqMUFqGmhNFptDpMLo9fa+W53RKjEETKYCWa-GgLdwrNYbLY7Pb9SQuAn6AC+8BJkigcFJEjAMjkQA)

**启用 `noImplicitAny` 的好策略** 是先在本地配置里打开它，然后一点点修复这些错误。报错的数量也可以作为你迁移进度的参考。你也可以结合第 49 条的方法，通过类型覆盖率来衡量进展。

每次改动后都运行测试，并频繁提交，因为有些错误你可能要到后面才发现。另外也可以参考第 82 条的建议，沿着调用链“自底向上”地去修复类型。你也可以先修好类型，再等全部搞定后，再把 `tsconfig.json` 里的配置也提交上去。

你还可以有选择地优先修复关键代码中的 `noImplicitAny` 错误，比如先改生产环境代码，再处理测试代码。如果你的项目用到了项目引用（见第 78 条），甚至可以为不同部分配置不同的严格模式。

当然，还有很多其他选项可以进一步提高类型检查的严格性，比如开启 `"strict": true`，但其中最重要的就是 `noImplicitAny`。即使你不启用其他严格设置，仅仅开启 `noImplicitAny`，TypeScript 就已经能带来很大帮助了。建议等团队对 TypeScript 更熟悉后，再逐步开启更严格的校验。

## 关键点总结

- 没有开启 `noImplicitAny`，就不能算是真正完成 TypeScript 的迁移。宽松的类型检查可能会让真实的问题被掩盖。
- 可以循序渐进地修复类型错误，别急着强制要求。让团队有时间适应 TypeScript，再考虑更严格的校验选项。

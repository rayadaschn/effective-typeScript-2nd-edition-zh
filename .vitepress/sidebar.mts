import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Sidebar = [
  {
    text: '目录',
    items: [
      {
        text: '第 1 章：认识 TypeScript',
        items: [
          {
            text: '理解 TypeScript 与 JavaScript 的关系',
            link: '/ch-intro/ts-vs-js.md',
          },
          {
            text: '了解你正在使用哪些 TypeScript 配置项',
            link: '/ch-intro/which-ts.md',
          },
          {
            text: '理解代码生成与类型系统是相互独立的',
            link: '/ch-intro/independent.md',
          },
          {
            text: '熟悉结构化类型',
            link: '/ch-intro/structural.md',
          },
          {
            text: '限制 `any` 类型的使用',
            link: '/ch-intro/any.md',
          },
        ],
      },
      {
        text: '第 2 章：TypeScript 的类型系统',
        items: [
          {
            text: '利用编辑器探索类型系统',
            link: '/ch-types/editor.md',
          },
          {
            text: '把类型看作值的集合',
            link: '/ch-types/types-as-sets.md',
          },
          {
            text: '了解符号处于类型空间还是值空间',
            link: '/ch-types/type-value-space.md',
          },
          {
            text: '优先使用类型注解而非类型断言',
            link: '/ch-types/prefer-declarations-to-assertions.md',
          },
          {
            text: '避免使用对象包装类型（String, Number, Boolean, Symbol, BigInt）',
            link: '/ch-types/avoid-object-wrapper-types.md',
          },
          {
            text: '区分多余属性检查与类型检查',
            link: '/ch-types/excess-property-checking.md',
          },
          {
            text: '尽可能为整个函数表达式应用类型',
            link: '/ch-types/type-entire-functions.md',
          },
          {
            text: '了解 `type` 与 `interface` 的区别',
            link: '/ch-types/type-vs-interface.md',
          },
          {
            text: '使用 `readonly` 防止因可变性引发的错误',
            link: '/ch-types/readonly.md',
          },
          {
            text: '利用类型运算和泛型减少重复',
            link: '/ch-types/map-between-types.md',
          },
          {
            text: '优先使用更精确的索引签名替代方案',
            link: '/ch-types/index-for-dynamic.md',
          },
          {
            text: '避免数字索引签名',
            link: '/ch-types/number-index.md',
          },
        ],
      },
      {
        text: '第 3 章：类型推断与控制流分析',
        items: [
          {
            text: '避免在代码中添加可推断的类型',
            link: '/ch-inference/avoid-inferable.md',
          },
          {
            text: '不同类型使用不同变量',
            link: '/ch-inference/one-var-one-type.md',
          },
          {
            text: '理解变量如何获得类型',
            link: '/ch-inference/widening.md',
          },
          {
            text: '一次性创建对象',
            link: '/ch-inference/all-at-once.md',
          },
          {
            text: '理解类型收窄',
            link: '/ch-inference/narrowing.md',
          },
          {
            text: '保持别名使用的一致性',
            link: '/ch-inference/avoid-aliasing.md',
          },
          {
            text: '理解上下文在类型推断中的作用',
            link: '/ch-inference/context-inference.md',
          },
          {
            text: '理解类型演变',
            link: '/ch-inference/evolving-any.md',
          },
          {
            text: '使用函数式构造和库帮助类型流动',
            link: '/ch-inference/functional-libraries.md',
          },
          {
            text: '使用 async 函数替代回调以改善类型流动',
            link: '/ch-inference/use-async-await.md',
          },
          {
            text: '使用类和柯里化创建新的推断点',
            link: '/ch-inference/inference-sites.md',
          },
        ],
      },
      {
        text: '第 4 章：类型设计',
        items: [
          {
            text: '优先设计始终表示有效状态的类型',
            link: '/ch-design/valid-states.md',
          },
          {
            text: '接受要宽松，输出要严格',
            link: '/ch-design/loose-accept-strict-produce.md',
          },
          {
            text: '不要在文档中重复类型信息',
            link: '/ch-design/jsdoc-repeat.md',
          },
          {
            text: '避免在类型别名中包含 `null` 或 `undefined`',
            link: '/ch-design/null-in-type.md',
          },
          {
            text: '将 null 值推至类型边界',
            link: '/ch-design/null-values-to-perimeter.md',
          },
          {
            text: '优先使用接口的联合而非联合中的接口',
            link: '/ch-design/union-of-interfaces.md',
          },
          {
            text: '使用更精确的替代方案代替字符串类型',
            link: '/ch-design/avoid-strings.md',
          },
          {
            text: '为特殊值使用独立类型',
            link: '/ch-design/in-domain-null.md',
          },
          {
            text: '限制可选属性的使用',
            link: '/ch-design/avoid-optional.md',
          },
          {
            text: '避免重复的同类型参数',
            link: '/ch-design/same-type-params.md',
          },
          {
            text: '优先统一类型，而非建模差异',
            link: '/ch-design/unify.md',
          },
          {
            text: '不精确的类型优于不准确的类型',
            link: '/ch-design/incomplete-over-inaccurate.md',
          },
          {
            text: '使用领域语言为类型命名',
            link: '/ch-design/language-of-domain.md',
          },
          {
            text: '避免基于个人经验数据的类型',
            link: '/ch-design/consider-codegen.md',
          },
        ],
      },
      {
        text: '第 5 章：类型的不安全性与 `any` 类型',
        items: [
          {
            text: '使用最小的作用域来限制 `any` 类型',
            link: '/ch-any/narrowest-any.md',
          },
          {
            text: '优先使用更精确的 `any` 替代方案，而不是简单的 `any`',
            link: '/ch-any/specific-any.md',
          },
          {
            text: '在类型良好的函数中隐藏不安全的类型断言',
            link: '/ch-any/hide-unsafe-casts.md',
          },
          {
            text: '对于未知类型的值，使用 `unknown` 替代 `any`',
            link: '/ch-any/never-unknown.md',
          },
          {
            text: '优先采用类型安全的方法来进行猴子补丁',
            link: '/ch-any/type-safe-monkey.md',
          },
          {
            text: '避免类型安全性陷阱',
            link: '/ch-any/unsoundness.md',
          },
          {
            text: '跟踪类型覆盖率，防止类型安全性回归',
            link: '/ch-any/type-percentage.md',
          },
        ],
      },
      {
        text: '第 6 章：泛型与类型层级编程',
        items: [
          {
            text: '将泛型视为类型之间的函数',
            link: '/ch-generics/functions-on-types.md',
          },
          {
            text: '避免不必要的类型参数',
            link: '/ch-generics/golden-rule.md',
          },
          {
            text: '优先使用条件类型而非重载签名',
            link: '/ch-generics/conditional-overload.md',
          },
          {
            text: '了解如何控制条件类型中的联合分布',
            link: '/ch-generics/control-distribution.md',
          },
          {
            text: '使用模板字面量类型来建模领域特定语言（DSL）及字符串之间的关系',
            link: '/ch-generics/template-dsl.md',
          },
          {
            text: '为你的类型编写测试',
            link: '/ch-generics/test-your-types.md',
          },
          {
            text: '注意类型的显示方式',
            link: '/ch-generics/type-display.md',
          },
          {
            text: '优先使用尾递归泛型类型',
            link: '/ch-generics/tail-recursion.md',
          },
          {
            text: '将代码生成作为复杂类型的替代方案',
            link: '/ch-generics/codegen-alt.md',
          },
        ],
      },
      {
        text: '第 7 章：TypeScript 配方',
        items: [
          {
            text: '使用 `never` 类型进行穷举检查',
            link: '/ch-recipes/exhaustiveness.md',
          },
          {
            text: '了解如何遍历对象',
            link: '/ch-recipes/iterate-objects.md',
          },
          {
            text: '使用 `Record` 类型保持值的同步',
            link: '/ch-recipes/values-in-sync.md',
          },
          {
            text: '使用 Rest 参数和元组类型来建模可变参数函数',
            link: '/ch-recipes/conditional-varargs.md',
          },
          {
            text: '使用可选的 `never` 属性来建模独占或',
            link: '/ch-recipes/optional-never.md',
          },
          {
            text: '考虑使用品牌进行命名类型',
            link: '/ch-recipes/brands.md',
          },
        ],
      },
      {
        text: '第 8 章：类型声明与 @types',
        items: [
          {
            text: '将 TypeScript 和 `@types` 放入 `devDependencies`',
            link: '/ch-declarations/dev-dependencies.md',
          },
          {
            text: '理解类型声明中涉及的三种版本',
            link: '/ch-declarations/three-versions.md',
          },
          {
            text: '导出所有出现在公共 API 中的类型',
            link: '/ch-declarations/export-your-types.md',
          },
          {
            text: '使用 TSDoc 进行 API 注释',
            link: '/ch-declarations/use-tsdoc.md',
          },
          {
            text: '如果回调函数的 API 中包含 `this`，为其提供类型',
            link: '/ch-declarations/this-in-callbacks.md',
          },
          {
            text: '镜像类型以解耦依赖关系',
            link: '/ch-declarations/mirror-types-for-deps.md',
          },
          {
            text: '使用模块增强改善类型',
            link: '/ch-declarations/augment-improve.md',
          },
        ],
      },
      {
        text: '第 9 章：编写与运行代码',
        items: [
          {
            text: '优先使用 ECMAScript 特性而非 TypeScript 特性',
            link: '/ch-write-run/avoid-non-ecma.md',
          },
          {
            text: '使用源映射调试 TypeScript',
            link: '/ch-write-run/source-maps-debug.md',
          },
          {
            text: '了解如何在运行时重构类型',
            link: '/ch-write-run/runtime-types.md',
          },
          {
            text: '理解 DOM 层级结构',
            link: '/ch-write-run/understand-the-dom.md',
          },
          {
            text: '创建准确的环境模型',
            link: '/ch-write-run/model-env.md',
          },
          {
            text: '了解类型检查与单元测试之间的关系',
            link: '/ch-write-run/types-or-tests.md',
          },
          {
            text: '关注编译器性能',
            link: '/ch-write-run/performance.md',
          },
        ],
      },
      {
        text: '第 10 章：现代化与迁移',
        items: [
          {
            text: '编写现代 JavaScript',
            link: '/ch-migrate/write-modern-js.md',
          },
          {
            text: '使用 `@ts-check` 和 JSDoc 体验 TypeScript',
            link: '/ch-migrate/jsdoc-tscheck.md',
          },
          {
            text: '使用 `allowJs` 混合使用 TypeScript 和 JavaScript',
            link: '/ch-migrate/allowjs.md',
          },
          {
            text: '按模块逐步向上转换你的依赖图',
            link: '/ch-migrate/convert-up-the-graph.md',
          },
          {
            text: '在启用 `noImplicitAny` 之前，不要认为迁移完成',
            link: '/ch-migrate/start-loose.md',
          },
        ],
      },
    ],
  },
]

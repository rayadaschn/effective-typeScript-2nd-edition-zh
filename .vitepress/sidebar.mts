import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Sidebar = [
  {
    text: '目录',
    items: [
      {
        text: '第 1 章：认识 TypeScript',
        items: [
          { text: '第 1 条', link: '/ch-intro/ts-vs-js.md' },
          { text: '第 2 条', link: '/ch-intro/which-ts.md' },
          { text: '第 3 条', link: '/ch-intro/independent.md' },
          { text: '第 4 条', link: '/ch-intro/structural.md' },
          { text: '第 5 条', link: '/ch-intro/any.md' },
        ],
      },
      {
        text: '第 2 章：TypeScript 的类型系统',
        items: [
          { text: '第 6 条', link: '/ch-types/editor.md' },
          { text: '第 7 条', link: '/ch-types/types-as-sets.md' },
          { text: '第 8 条', link: '/ch-types/type-value-space.md' },
          {
            text: '第 9 条',
            link: '/ch-types/prefer-declarations-to-assertions.md',
          },
          { text: '第 10 条', link: '/ch-types/avoid-object-wrapper-types.md' },
          { text: '第 11 条', link: '/ch-types/excess-property-checking.md' },
          { text: '第 12 条', link: '/ch-types/type-entire-functions.md' },
          { text: '第 13 条', link: '/ch-types/type-vs-interface.md' },
          { text: '第 14 条', link: '/ch-types/readonly.md' },
          { text: '第 15 条', link: '/ch-types/map-between-types.md' },
          { text: '第 16 条', link: '/ch-types/index-for-dynamic.md' },
          { text: '第 17 条', link: '/ch-types/number-index.md' },
        ],
      },
      {
        text: '第 3 章：类型推断与控制流分析',
        items: [
          { text: '第 18 条', link: '/ch-inference/avoid-inferable.md' },
          { text: '第 19 条', link: '/ch-inference/one-var-one-type.md' },
          { text: '第 20 条', link: '/ch-inference/widening.md' },
          { text: '第 21 条', link: '/ch-inference/all-at-once.md' },
          { text: '第 22 条', link: '/ch-inference/narrowing.md' },
          { text: '第 23 条', link: '/ch-inference/avoid-aliasing.md' },
          { text: '第 24 条', link: '/ch-inference/context-inference.md' },
          { text: '第 25 条', link: '/ch-inference/evolving-any.md' },
          { text: '第 26 条', link: '/ch-inference/functional-libraries.md' },
          { text: '第 27 条', link: '/ch-inference/use-async-await.md' },
          { text: '第 28 条', link: '/ch-inference/inference-sites.md' },
        ],
      },
      {
        text: '第 4 章：类型设计',
        items: [
          { text: '第 29 条', link: '/ch-design/valid-states.md' },
          {
            text: '第 30 条',
            link: '/ch-design/loose-accept-strict-produce.md',
          },
          { text: '第 31 条', link: '/ch-design/jsdoc-repeat.md' },
          { text: '第 32 条', link: '/ch-design/null-in-type.md' },
          { text: '第 33 条', link: '/ch-design/null-values-to-perimeter.md' },
          { text: '第 34 条', link: '/ch-design/union-of-interfaces.md' },
          { text: '第 35 条', link: '/ch-design/avoid-strings.md' },
          { text: '第 36 条', link: '/ch-design/in-domain-null.md' },
          { text: '第 37 条', link: '/ch-design/avoid-optional.md' },
          { text: '第 38 条', link: '/ch-design/same-type-params.md' },
          { text: '第 39 条', link: '/ch-design/unify.md' },
          {
            text: '第 40 条',
            link: '/ch-design/incomplete-over-inaccurate.md',
          },
          { text: '第 41 条', link: '/ch-design/language-of-domain.md' },
          { text: '第 42 条', link: '/ch-design/consider-codegen.md' },
        ],
      },
      {
        text: '第 5 章：类型的不安全性与 `any` 类型',
        items: [
          { text: '第 43 条', link: '/ch-any/narrowest-any.md' },
          { text: '第 44 条', link: '/ch-any/specific-any.md' },
          { text: '第 45 条', link: '/ch-any/hide-unsafe-casts.md' },
          { text: '第 46 条', link: '/ch-any/never-unknown.md' },
          { text: '第 47 条', link: '/ch-any/type-safe-monkey.md' },
          { text: '第 48 条', link: '/ch-any/unsoundness.md' },
          { text: '第 49 条', link: '/ch-any/type-percentage.md' },
        ],
      },
      {
        text: '第 6 章：泛型与类型层级编程',
        items: [
          { text: '第 50 条', link: '/ch-generics/functions-on-types.md' },
          { text: '第 51 条', link: '/ch-generics/golden-rule.md' },
          { text: '第 52 条', link: '/ch-generics/conditional-overload.md' },
          { text: '第 53 条', link: '/ch-generics/control-distribution.md' },
          { text: '第 54 条', link: '/ch-generics/template-dsl.md' },
          { text: '第 55 条', link: '/ch-generics/test-your-types.md' },
          { text: '第 56 条', link: '/ch-generics/type-display.md' },
          { text: '第 57 条', link: '/ch-generics/tail-recursion.md' },
          { text: '第 58 条', link: '/ch-generics/codegen-alt.md' },
        ],
      },
      {
        text: '第 7 章：TypeScript 配方',
        items: [
          { text: '第 59 条', link: '/ch-recipes/exhaustiveness.md' },
          { text: '第 60 条', link: '/ch-recipes/iterate-objects.md' },
          { text: '第 61 条', link: '/ch-recipes/values-in-sync.md' },
          { text: '第 62 条', link: '/ch-recipes/conditional-varargs.md' },
          { text: '第 63 条', link: '/ch-recipes/optional-never.md' },
          { text: '第 64 条', link: '/ch-recipes/brands.md' },
        ],
      },
      {
        text: '第 8 章：类型声明与 @types',
        items: [
          { text: '第 65 条', link: '/ch-declarations/dev-dependencies.md' },
          { text: '第 66 条', link: '/ch-declarations/three-versions.md' },
          { text: '第 67 条', link: '/ch-declarations/export-your-types.md' },
          { text: '第 68 条', link: '/ch-declarations/use-tsdoc.md' },
          { text: '第 69 条', link: '/ch-declarations/this-in-callbacks.md' },
          {
            text: '第 70 条',
            link: '/ch-declarations/mirror-types-for-deps.md',
          },
          { text: '第 71 条', link: '/ch-declarations/augment-improve.md' },
        ],
      },
      {
        text: '第 9 章：编写与运行代码',
        items: [
          { text: '第 72 条', link: '/ch-write-run/avoid-non-ecma.md' },
          { text: '第 73 条', link: '/ch-write-run/source-maps-debug.md' },
          { text: '第 74 条', link: '/ch-write-run/runtime-types.md' },
          { text: '第 75 条', link: '/ch-write-run/understand-the-dom.md' },
          { text: '第 76 条', link: '/ch-write-run/model-env.md' },
          { text: '第 77 条', link: '/ch-write-run/types-or-tests.md' },
          { text: '第 78 条', link: '/ch-write-run/performance.md' },
        ],
      },
      {
        text: '第 10 章：现代化与迁移',
        items: [
          { text: '第 79 条', link: '/ch-migrate/write-modern-js.md' },
          { text: '第 80 条', link: '/ch-migrate/jsdoc-tscheck.md' },
          { text: '第 81 条', link: '/ch-migrate/allowjs.md' },
          { text: '第 82 条', link: '/ch-migrate/convert-up-the-graph.md' },
          { text: '第 83 条', link: '/ch-migrate/start-loose.md' },
        ],
      },
    ],
  },
]

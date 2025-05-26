# 第 31 条：不要在文档中重复类型信息

## 要点

- 避免在注释和变量名里重复写类型信息。最好别和类型声明重复，最差会导致信息冲突。
- 参数声明时用 `readonly`，不要只在注释里说不修改它们。
- 如果类型里单位不明确，考虑把单位写进变量名，比如 `timeMs` 或 `temperatureC`。

## 正文

下面这段代码有什么问题？

```ts
/**
 * Returns a string with the foreground color.
 * Takes zero or one arguments. With no arguments, returns the
 * standard foreground color. With one argument, returns the foreground color
 * for a particular page.
 */
function getForegroundColor(page?: string) {
  return page === 'login' ? { r: 127, g: 127, b: 127 } : { r: 0, g: 0, b: 0 }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PQKhCgAIUglBTALgVwE4DsDOkCGlOKoCW6A5pAO5GIAWkt8kAZgParymovLoAmkAYxYAbNgDooMACo4A1vGwAveF0hs16RjlSlkAW3jpEmMZADq1Ouha4d+w8YA0kdigzYGk-Ihx9t-VnZObj5BEXFzSw0tOwMjZ1c0LHoaRkCOLh5+IVFUL0DcSAAHbUQiAWRhbWKcUngJaGBwJh4BMpZ0SDrEADE2DJDeAGFw1AAKErqAfgAub2IyAEpIAG8oFyQkmrrIAF59yAByUVISQ8gp1dQ5gEYAJgB2Z1Jbx+cAI1eHgF9IOZXrpAAAzPOYgyCfYHfADc4G+4CAA)

代码和注释不一致！没有更多上下文很难判断哪个对，但显然有问题。正如我以前一位教授说的：“代码和注释不一致，那它们俩都错！”

假设代码是期望的行为，注释的问题包括：

- 注释说函数返回的是字符串颜色，但实际上返回的是 `{r, g, b}` 对象。
- 注释说明函数接受 0 或 1 个参数，这其实从类型签名里已经很清楚了。
- 注释太啰嗦了，反而比函数声明和实现还长！

TypeScript 的类型注解系统设计得紧凑、描述性强且易读。它的设计者都是有多年经验的语言专家，类型注解几乎总比注释文字更能准确表达函数的输入输出。

而且类型注解会被编译器检查，永远不会和实现代码脱节。可能以前 `getForegroundColor` 返回的是字符串，后来改成返回对象，改代码的人忘了更新注释。

除非强制保持同步，否则注释很容易过时。类型注解就是这种强制同步的“力量”！把类型信息放到注解里，而不是注释里，能大大提高代码演进时的正确性。

更好的注释写法可能是这样：

```ts
/** 获取应用或指定页面的前景色。 */
function getForegroundColor(page?: string): Color {
  /* ... */
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PTAEAkEkBEFECgAuBPADgU1AYQPYBscAnUAXlAG9RCAuUAOwFcBbAI3UIG5QBzWx19lxZ9mbYgF8O8EKFgA5aNIBUS0AHF0iUIgAWmAGZF03QjgZ0AJqADG+IqEPFdmAIapUeAJbWXiTzjpQexdQAGcMa099b1BUF250ADpQJWB4fXNrPwCeTQAxIxMzS1wCQgAKOISAflpQxEJPOm4ASlpS+3J4UFAZLAB5AFkABQAlWABlCe6qTQZCQKrMEhXQAHICbia10GqKGlAARgAmAHYAGh5aE4vQYSOz8VBacgOABkveUA+72jfJGYyeSKcTweBAA)

如果要说明某个参数，建议用 `@param` 的 JSDoc 注解，详见第 68 条。

关于“无变更”的注释也值得怀疑：

```ts
/** Sort the strings by numeric value (i.e. "2" < "10"). Does not modify nums. */
function sortNumerically(nums: string[]): string[] {
  return nums.sort((a, b) => Number(a) - Number(b))
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PQKhAIGUHsCcBdzwBYFNwGd6wJYDsBzDcAIwE9w8BXAW1VwGNwA3AQwBsr0AKHAOlR9wAIgBMw8AB4RARgAMwgJRCAItFTE80RDWgATHADMK1GhiEhgAKENU8DeDmh5MceADla9HAw7sy3KYYAFyY2PgEANoAuoqhWLiEMeAA3lbg4LCo8FSwLkF8GG7c3KwANKSK4AC8AHzgnjQk9KVVALQNtM2w3CSKigDcVgC+VkA)

注释里说这个函数不会修改参数，但数组的 `sort` 方法是原地排序，实际上是会修改参数的，所以注释说法不靠谱。

如果你把参数声明成 `readonly`（参考第 14 条），就可以让 TypeScript 帮你强制执行这个约定：

```ts
/** Sort the strings by numeric value (i.e. "2" < "10"). */
function sortNumerically(nums: readonly string[]): string[] {
  return nums.sort((a, b) => Number(a) - Number(b))
  //          ~~~~  ~  ~ Property 'sort' does not exist on 'readonly string[]'.
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PQKhAIGUHsCcBdzwBYFNwGd6wJYDsBzDcAIwE9w8BXAW1VwGNwA3AQwBsr0AKHAOlR9wAIgBMw8AB4RARgAMwgJRCQwAFAAzKngbwc0PJjjwAcrXo4GHdmW7UaGAFzhYqVgBMDNzNnwEA2gC6is5YuIRB4ADeauAuqPBUsIb2GHwYxtzcrAA0pIrgALwAfOBmNCT02QUAtGW0lbDcJIqKANyx4MDAcb194AB+QwNxI4PgAAqw0AAO9PAUAOQZCIvgnqjEeNCIqAAeOFjgBuCLrh5eFGF+QYt8agC+akA)

这个函数的正确实现，要么复制一份数组，要么用不可变的 `toSorted` 方法：

```ts
/** Sort the strings by numeric value (i.e. "2" < "10"). */
function sortNumerically(nums: readonly string[]): string[] {
  return nums.toSorted((a, b) => Number(a) - Number(b)) // ok
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/PQKhAIGUHsCcBdzwBYFNwGd6wJYDsBzDcAIwE9w8BXAW1VwGNwA3AQwBsr0AKHAOlR9wAIgBMw8AB4RARgAMwgJRCQwAFAAzKngbwc0PJjjwAcrXo4GHdmW7UaGAFzhYqVgBMDNzNnwEA2gC6is5YuIRB4ADeauAuqPBUsIb2GHzw0DAIqO7c3KwANKSK4AC8AHzgZjQk9PklALRVtLWw3CSKigDcccDA4NAA1moAvmpAA)

注释里的道理，对变量名同样适用。避免在变量名里写类型信息，比如不要叫 `ageNum`，直接叫 `age`，并确保它真的是数字类型。

唯一例外是带单位的数字。如果单位不明显，可以把单位写进变量名。比如 `timeMs` 比单纯的 `time` 更清晰，`temperatureC` 比 `temperature` 更明确。第 64 条介绍了“品牌类型（brands）”，这是建模单位更安全的方式。

## 关键点总结

- 避免在注释和变量名里重复写类型信息。最好别和类型声明重复，最差会导致信息冲突。
- 参数声明时用 `readonly`，不要只在注释里说不修改它们。
- 如果类型里单位不明确，考虑把单位写进变量名，比如 `timeMs` 或 `temperatureC`。

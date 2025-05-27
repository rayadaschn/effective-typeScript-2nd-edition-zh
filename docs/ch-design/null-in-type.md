# 第 32 条：避免在类型别名中包含 `null` 或 `undefined`

## 要点

- 避免定义包含 `null` 或 `undefined` 的类型别名。

## 正文

在这段代码中，问号链`（?.）`是必须的吗？user 有可能是 `null` 吗？

```ts
function getCommentsForUser(comments: readonly Comment[], user: User) {
  return comments.filter((comment) => comment.userId === user?.id)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHsC2mLmQb2QFcBnaASQBMAuZEsKUAcwG5kBfAKFElkRQCqZKAWTAadBszZcYREAjDB0IZEwhgM2XGBIAxdFCHQAFAiw5wJWlAhxKKgDYBPNBZ0BtALoAaYsNpjKABKAk5kZFswIihVc20rADoYYEdeM3c8AF4APmR4yzBE0gpKZCyK-2gAfkTxYJZOLiA)

即使开启了 `strictNullChecks`，没有看到 User 的定义也无法判断。如果 User 是允许 `null` 或 `undefined` 的类型别名，那么可选链`（?.）`是需要的：

```ts
type User = { id: string; name: string } | null
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAqgzhATlAvFA3lAlgEwFxRzCJYB2A5gNxSkCGAthAUSRdQL5QA+NArgDb9KAKCA)

但如果是普通的对象类型，则不需要：

```ts
interface User {
  id: string
  name: string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgKoGdrIN4ChnLAAmAXMumFKAOYDc+yIcAthGRVSHbgL65A)

一般来说，最好避免定义允许 `null` 或 `undefined` 的类型别名。虽然类型检查器不会因为你违反这个规则而报错，但阅读你代码的人会感到困惑。看到 User 这个类型名时，我们默认它代表一个用户，而不是“可能是用户也可能不是”。

如果因为某些原因必须包含 null，最好给类型起一个明确的名字，方便阅读：

```ts
type NullableUser = { id: string; name: string } | null
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAcgrgGwQQwEYIgVQM4QE5QC8UA3lAJYAmAXFNsHuQHYDmA3FE8gLYS32NWHAL5QAPp0QI2AKCA)

但为什么不直接用更简洁且通用的写法 `User | null` 呢？

```ts
function getCommentsForUser(comments: readonly Comment[], user: User | null) {
  return comments.filter((comment) => comment.userId === user?.id)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHsC2mLmQb2QFcBnaASQBMAuZEsKUAcwG5kBfAKFElkRQCqZKAWTAadBszZcYREAjDB0IZEwhgM2XGBIAxdFCHQAFAiw5wJWlAhxKKgDYBPNBZ0BtALoAaYsNpjEQAfZBAiR0cASgJOZGRbMCIoVXNtKwA6GGBHXjN3PABeAD5kNMswDNIKSmRC+v9oAH4M8SiWTi4gA)

这个规则针对的是类型别名的顶层结构，不针对对象中的属性是 `null`、`undefined` 或可选的情况，比如：

```ts
type BirthdayMap = {
  [name: string]: Date | undefined
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHsC2mLmQb2QFcBnaASQBMAuZEsKUAcwG5kBfAKFElkRQCqZKAWTAadBszZcwATwAOKAELAoYABaU4cgLJwFyALwFOyZAG0QcHLXqMQTALq0AInEjIAPsRCUIMKAQlCyc7KFAA)

但不要这样写：

```ts
type BirthdayMap = {
  [name: string]: Date | undefined
} | null
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMIHsC2mLmQb2QFcBnaASQBMAuZEsKUAcwG5kBfAKFElkRQCqZKAWTAadBszZcwATwAOKAELAoYABaU4cgLJwFyALwFOyZAG0QcHLXqMQTALq0AInEjIAPsRCUIMKAQlCyc7N7IIEQANtGhQA)

避免对象类型中出现 `null` 和可选字段也有理由，不过那是后面章节（第 33 和第 37 条）才讲的内容。现在的建议是避免让你的类型别名让代码阅读者困惑，尽量用表示具体东西的类型别名，而不是表示“`something` 或 `null` 或 `undefined`”的类型别名。

## 关键点总结

- 尽量避免定义包含 `null` 或 `undefined` 的类型别名。

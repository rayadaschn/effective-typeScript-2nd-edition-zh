# 第 39 条：优先统一类型，而非细化类型差异

## 要点

- 拥有多个相似类型，会增加理解成本，还需要写很多转换逻辑。
- 如果两个类型只在细节上有区别，尽量去掉差异，统一成一个类型。
- 为了统一类型，可能需要调整一些运行时代码。
- 如果类型不在你掌控之内（比如数据库或 API），那就只能新建类型。
- 但如果两个类型本来就是不同的东西，就不要强行统一。

## 正文

TypeScript 的类型系统非常强大，能帮你在类型之间进行各种转换。第 15 条和第六章讲了很多这方面的技巧。一旦你意识到可以用类型系统来“类型转换”，你可能会产生一种冲动：太有趣了！各种类型玩出花来，感觉代码安全又酷炫！

但比起用类型系统去刻意区分两种类型，**更好的办法是：干脆消除它们的差异**。这样你就不需要写额外的类型转换逻辑，也不用费脑筋记住当前用的是哪个版本的类型。

举个例子，假设你有个接口 `StudentTable`，它是从数据库表生成的，而数据库一般用 `snake_case` 命名：

```ts
interface StudentTable {
  first_name: string
  last_name: string
  birth_date: string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpgK4BMLgCpwBGANigN4BQyyMwUAzmAPohwC2EAXMo1KAOYBuKsmJxGLdlx5g+IISMJ0wACyZY4kbrwHCAvhSA)

而在 TypeScript 代码里，通常我们喜欢用 `camelCase` 命名。于是你可能会定义另一个更“TS 风格”的版本：

```ts
interface Student {
  firstName: string
  lastName: string
  birthDate: string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpgK4BMLgCpwBGANigN4BQyyMwUAzmAPohwC2EAXMo1KAOYBuKsmJxGLdlx5g+IISMJ0wACyZY4kbrwHCAvhVCRYiFOmy4wyStVoMwAOSnbZukWMZOOLuQupKoVQARTWkdeX0KIA)

你甚至可以写个函数把这两个类型之间做转换，甚至还能用模板字面量类型自动生成另一个类型，比如这样：

```ts
type Student = ObjectToCamel<StudentTable>
//   ^? type Student = {
//        firstName: string;
//        lastName: string;
//        birthDate: string;
//      }
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpgK4BMLgCpwBGANigN4BQyyMwUAzmAPohwC2EAXMo1KAOYBuKsmJxGLdlx5g+IISMJ0wACyZY4kbrwHCAvhTABPAA4o8AewDCU4gB5UyCAA9IILPRlz+APmQBeEWpHFzcPZAADABIyUBhoZAAJCDgsPSYYuISCYGI9CKDkAH5ImOTUvRibE2AwOGJgAC8IO0sbDnsc4h8ffMLuVGFjM2QAeUIAKwgEMDbbVqdXXHCLSemwP39kSmoAbQBpZFBkAGsIIwsYZDxkcWvrecOAMi8BHwBdbjwD94o9YRwCDEUBQMAwIBmwAsIGQqymM0sqFYZwAFM5uHAQEYAJQYrFDUwodDYXBgAJjNYIh4dByYHD4IikHzCAD0LOoyAAeiVhkS6aTyZQ2RyRTQ6IwAHJSbSyXQUYWi6hiSXS17yVnsxXIJRQVQAEU00h06vlmpFBiAA)

效果惊艳！类型自动转换，好像很高级。

但很快你就会踩坑：当你把 `Student` 类型的对象传给需要 `StudentTable` 类型的函数时，会报错：

```ts
async function writeStudentToDb(student: Student) {
  await writeRowToDb(db, 'students', student)
  //                                 ~~~~~~~
  // Type 'Student' is not assignable to parameter of type 'StudentTable'.
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpgK4BMLgCpwBGANigN4BQyyMwUAzmAPohwC2EAXMo1KAOYBuKsmJxGLdlx5g+IISMJ0wACyZY4kbrwHCAvhTABPAA4o8AewDCU4gB5UyCAA9IILPRlz+APmQBeEWpHFzcPZAADABIyUBhoZAAJCDgsPSYYuISCYGI9CKDkAH5ImOTUvRibE2AwOGJgAC8IO0sbDnsc4h8ffMLuVGFjM2QAeUIAKwgEMDbbVqdXXHCLSemwP39kSmoAbQBpZFBkAGsIIwsYZDxkcWvrecOAMi8BHwBdbjwD94o9YRwCDEUBQMAwIBmwAsIGQqymM0sqFYZwAFM5uHAQEYAJQYrFDUwodDYXBgAJjNYIh4dByYHD4IikHzCAD0LOoyAAeiVhkS6aTyZQ2RyRTQ6IwAHJSbSyXQUYWi6hiSXS17yVnsxXIJRQVQAEU00h06vlmpFBkBwNB4Mh0OQAHc+JAAEoWe2WPWEFFYQh4owAGmQdRIRtl8kDUDdA35DJDuOQAAVI2xgPQWgA3CzALDMigIaGMZA+8kgDDEYjCcRGCE0G1gKEwx21CDE+mzCyelGMEngaM9sDY7YiOD2uC1B1OiCu90dr0+wMAcm7bfoC8Dy9J2OE1AVWr3+61AD9jyfDyJhXhCcgF63SQujp4QBYyeJ6MB+KwQ0GLMgTHAoFIkBQLCVy8tet6xqQC4AHR-BQQA)

错误提示可能不明显，但实际是你忘了调用那个转换函数了：

```ts
async function writeStudentToDb(student: Student) {
  await writeRowToDb(db, 'students', objectToSnake(student)) // ok
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMpgK4BMLgCpwBGANigN4BQyyMwUAzmAPohwC2EAXMo1KAOYBuKsmJxGLdlx5g+IISMJ0wACyZY4kbrwHCAvhTABPAA4o8AewDCU4gB5UyCAA9IILPRlz+APmQBeEWpHFzcPZAADABIyUBhoZAAJCDgsPSYYuISCYGI9CKDkAH5ImOTUvRibE2AwOGJgAC8IO0sbDnsc4h8ffMLuVGFjM2QAeUIAKwgEMDbbVqdXXHCLSemwP39kSmoAbQBpZFBkAGsIIwsYZDxkcWvrecOAMi8BHwBdbjwD94o9YRwCDEUBQMAwIBmwAsIGQqymM0sqFYZwAFM5uHAQEYAJQYrFDUwodDYXBgAJjNYIh4dByYHD4IikHzCAD0LOoyAAeiVhkS6aTyZQ2RyRTQ6IwAHJSbSyXQUYWi6hiSXS17yVnsxXIJRQVQAEU00h06vlmpFBkBwNB4Mh0OQAHc+JAAEoWe2WPWEFFYQh4owAGmQdRIRtl8kDUDdA35DJDuOQAAVI2xgPQWgA3CzALDMigIaGMZA+8kgDDEYjCcRGCE0G1gKEwx21CDE+mzCyelGMEngaM9sDY7YiOD2uC1B1OiCu90dr0+wMAcm7bfoC8DcPWiOREC7MYH2ME1GFFhOfwoQA)

虽然 TypeScript 能帮你提前发现这个错误，但如果你一开始就只有一个统一的 `Student` 类型，那这些问题根本不会出现。

那么你该保留哪个版本的 `Student` 呢？

- **保留 camelCase 的版本**：你需要做一些适配工作，让数据库返回 camelCase 风格的数据。你用的类型生成工具也得支持这个转换。好处是所有的类型风格一致，看起来更统一。

- **保留 snake_case 的版本**：你啥都不用做，只需接受命名风格略显不统一，但整体类型更加统一。

两种方式都行，但第二种 **更简单直接**。

**总结一句话：与其去区分两个类型的细微差异，不如直接把它们统一成一个类型。**

当然也有一些例外：

- 如果你无法控制数据库或 API 返回的结构，那你只能通过类型转换来新建类型。这样至少能让你在写转换逻辑时更容易发现 bug。

- 千万别把本来就不一样的类型“统一”起来！比如用联合类型（tagged union）表示不同状态的对象时，每个状态都应该有自己独立的结构，不该强行合并。

## 关键点总结

- 拥有多个相似类型，会增加理解成本，还需要写很多转换逻辑。
- 如果两个类型只在细节上有区别，尽量去掉差异，统一成一个类型。
- 为了统一类型，可能需要调整一些运行时代码。
- 如果类型不在你掌控之内（比如数据库或 API），那就只能新建类型。
- 但如果两个类型本来就是不同的东西，就不要强行统一。

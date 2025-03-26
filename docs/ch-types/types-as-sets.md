# 第 7 条：把类型看作值的集合

## 要点

- 将类型视为值的集合（类型的 _领域_）。这些集合可以是有限的（例如 `boolean` 或字面量类型），也可以是无限的（例如 `number` 或 `string`）。
- TypeScript 类型形成交集集合（类似维恩图），而不是严格的层次结构。两个类型可以有重叠部分，而不一定是彼此的子类型。
- 记住，即使一个对象有类型声明中未提到的额外属性，它仍然可以属于该类型。
- 类型操作作用于集合的领域。`A | B` 的领域是 `A` 和 `B` 领域的并集。
- 将“extends”、“可赋值给”和“子类型”视为“子集”的同义词。

## 正文

```ts
const x: never = 12
//    ~ Type 'number' is not assignable to type 'never'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBAHgLhmApgNxQJxgXhgRgCYBuAKAHpyZqYA-GAFQE8AHFGAcjAFcBbAIywcYASwjIQsAIYQIIgOZgp-ADbsoIGFFbsu6IQDpSQA)

---

```ts
type A = 'A'
type B = 'B'
type Twelve = 12
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAglC8UDkMkG4BQpJQEIOV3S3GgBUB3CAGwDdpEBGAJkyA)

---

```ts
type AB = 'A' | 'B'
type AB12 = 'A' | 'B' | 12
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAggQlAvFA5DFUA+q4oNwBQokscAjAExKrpY4baWFA)

---

```ts
const a: AB = 'A' // OK, value 'A' is a member of the set {'A', 'B'}
const c: AB = 'C'
//    ~ Type '"C"' is not assignable to type 'AB'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAggQlAvFA5DFUA+q4oNwBQokscAjAExKrpY4baWEDGA9gHYDOwUAhgFylqafFCgB6cVADyAaQA0UAG68ANgFdoIqAEtOfKAFsIhgEYQATlFYAzKMAAW0ThB4BvEYpS4AvgTZcPMyC8MIAwvgEkmJiAH5QACrgWgBEYSkYelDsrDy8nJw6AObsvKaq0MCs9sk0uARAA)

---

```ts
// OK, {"A", "B"} is a subset of {"A", "B"}:
const ab: AB = Math.random() < 0.5 ? 'A' : 'B'
const ab12: AB12 = ab // OK, {"A", "B"} is a subset of {"A", "B", 12}

declare let twelve: AB12
const back: AB = twelve
//    ~~~~ Type 'AB12' is not assignable to type 'AB'
//           Type '12' is not assignable to type 'AB'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAggQlAvFA5DFUA+q4oNwBQokscAjAExKrpY4baWED0zUA8gNIA0UA3gCIYA3gLgCAvlACWAZygBDKLICuAI1kRgUAPYAzfkJFQxkgFwEAxjoB2s7QrVnS1ALILgACwB0AJwU2ACY6ALYAFACUUAA8UAAM3gCsUAD8NBjOKLiE1nYOapTO8JTUjnhQUKwcPIbCouJScorK6pra+rXGpryUEgQEgRCWADYKvtDDWlDAAO4QwwBuEEXkFDm29lBqCpYA1ivUs-NLLGwVUAB+VxdQACrg0GirGE02Og6ystIA5jaOk9MdNMHjRcAQqudIed7iQUJQXvI3h8vr9-tBgEDiI94CgCEA)

---

```ts
type Int = 1 | 2 | 3 | 4 | 5 // | ...
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/C4TwDgpgBAkgdsKBeKBGKAfKAmTUDMeALHgKxQD0FeAdHQFBA)

---

```ts
interface Identified {
  id: string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgJIBMLmDYF3IDeAUMssOgFzIDOYUoA5gNzEC+xQA)

---

```ts
interface Person {
  name: string
}
interface Lifespan {
  birth: Date
  death?: Date
}
type PersonSpan = Person & Lifespan
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgJIBMLmDYF3IDeAUMssOgFzIDOYUoA5gNzEC+xoksiKACtBoB7EEVLIQcALYRqdBiBbtO4aPCTIAMjgg0ADnFEkyAI2BQwAC2oAROJFZlM9ywH5b9iKw5gAnnv5BEQBlA1EAXmQBKGFRADItHX1DViA)

---

```ts
const ps: PersonSpan = {
  name: 'Alan Turing',
  birth: new Date('1912/06/23'),
  death: new Date('1954/06/07'),
} // OK
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgJIBMLmDYF3IDeAUMssOgFzIDOYUoA5gNzEC+xoksiKACtBoB7EEVLIQcALYRqdBiBbtO4aPCTIAMjgg0ADnFEkyAI2BQwAC2oAROJFZlM9ywH5b9iKw5gAnnv5BEQBlA1EAXmQBKGFRADItHX1DVgQROmQ9Gmpo2NDDZEjjCWlZZAByAEEAGwKAFQBXBUZygBpxMwtrCQgAd2Q7SAAKcoBGAE5RgCYAegAGADYZqYBmcoBKdqcIF2oQPoHPEYmAVgAWeaW5gHYN9rZmMhmZ5AB5AGliIA)

---

```ts
type K = keyof (Person | Lifespan)
//   ^? type K = never
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgJIBMLmDYF3IDeAUMssOgFzIDOYUoA5gNzEC+xoksiKACtBoB7EEVLIQcALYRqdBiBbtO4aPCTIAMjgg0ADnFEkyAI2BQwAC2oAROJFZlM9ywH5b9iKw5gAnnv5BEQBlA1EAXmQBKGFRADItHX1DVj8A5ABpZEiAawhfIRhkAApo2OQAH0SYXTCASlYAekayZAA9V2Q0lCzIkAgAN2hiIA)

---

```ts
interface Person {
  name: string
}
interface PersonSpan extends Person {
  birth: Date
  death?: Date
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmA3AQL4GiSyIrpTYgAygAc4uCAA9IIACYY0mHPiLIARsChgAFtQAicSC2IyIBrQH49BiC3ZA)

---

```ts
interface NullyStudent {
  name: string
  ageYears: number | null
}
interface Student extends NullyStudent {
  ageYears: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgHIFcA2mCeBlMdAEwnGQG8AoZZEOAWwgC5kBnMKUAcwG5rk4XCAE0IcKKxYh09AEbRkAH1pZMfAL6VQkWIhQFipMMggAPSCCKs0q-IRJkqNQSLESpM+VA2UgA)

---

```ts
interface StringyStudent extends NullyStudent {
  //      ~~~~~~~~~~~~~~
  // Interface 'StringyStudent' incorrectly extends interface 'NullyStudent'.
  ageYears: number | string
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgHIFcA2mCeBlMdAEwnGQG8AoZZEOAWwgC5kBnMKUAcwG5rk4XCAE0IcKKxYh09AEbRkAH1pZMfAL6VQkWIhQFipMMggAPSCCKs0q-IRJkqNQSLESpM+VA1bw0eEjIBJwgXHaGZGYWVjbY4Q7GTsgA9Mk06cgAftk5ubn8qcgAkn66gQDkwdzxRuXIoAgA9lBQEAhguCbmpDHa-nrI5RhxBgnlAHT8LqLikipyCsrsIbyUmkA)

---

```ts
interface Vector1D {
  x: number
}
interface Vector2D extends Vector1D {
  y: number
}
interface Vector3D extends Vector2D {
  z: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAjAEWQG9kAPALmRAFcBbAI2gG5kBfAKFElkRXUxwAmQhFKQQAEwDOaDNjyESAT0o0GzNp3DR4SWQKgBmEWIiSZ-ecOLIAXqrqMoLDkA)

---

```ts
interface Vector1D {
  x: number
}
interface Vector2D {
  x: number
  y: number
}
interface Vector3D {
  x: number
  y: number
  z: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgGoQWA9lAjAEWQG9kAPALmRAFcBbAI2gG5kBfAKFElkRXUxwAmQiQpU6jKCwCelGg2ZtO4aPCRoM2KAGYRZORMWzxCqcgBeB0yw5A)

---

```ts
function getKey<K extends string>(val: any, key: K) {
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQNKoJ4B4OKoAeUqYAJgM6KVQBOMYyAfABQBuAhgDYBcinMNgA0iANY5+GAJSIA3gChEiAPQrEAOi0KAvgqA)

---

```ts
getKey({}, 'x') // OK, 'x' extends string
getKey({}, Math.random() < 0.5 ? 'a' : 'b') // OK, 'a'|'b' extends string
getKey({}, document.title) // OK, string extends string
getKey({}, 12)
//         ~~ Type 'number' is not assignable to parameter of type 'string'
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQNKoJ4B4OKoAeUqYAJgM6KVQBOMYyAfABQBuAhgDYBcinMNgA0iANY5+GAJSIA3gChEiAPQrEAOi0KAvgrSYcrOTtEByImekBuZWsQB5DOcuESZKjXqNk+9FmxjU0QAWU4oAAsNOkFyOABbVllcRAAGDQBWRAB+RDNOM0R+MwAjK1tVdSdzAoAfUsLiUgpqWgYmP0NAk1E4iBB4sigNWChuVBs7KucvduQ3Zs82n06AoNEARgAmGwV7ZQODgD8jxAAVbAAHVDywAZLUOkKYajA4KAFKShhkME4S8aIKBwRCXTgxQakOiIODAIFXG5mZZMMwKIA)

---

```ts
const list = [1, 2]
//    ^? const list: number[]
const tuple: [number, number] = list
//    ~~~~~ Type 'number[]' is not assignable to type '[number, number]'
//          Target requires 2 element(s) but source may have fewer
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQNKoJ4B4OKoAeUqYAJgM6KVQBOMYyAfABQBuAhgDYBcinMNgA0iANY5+GAJSIA3gChEiAPQrEAOi0KAvgogJaibjCMBeRAG0AjKIBMAXQDcCtcuUA9APyIDYIya0-GAgALYARqh0lg76hlCIUCAADtyo-JYhEVGiWZF0DogWgVAubu4AflVViAAq2MmoiADkeVExzYimiGBwCZyUlDDIYJzhaYlwiQ1NzZlh+bkLUQ7Nrurum8q1nHRoCXSoAI4gMIfUdoRpoWRQrJSy4SAJlHAgdBBNoZzYiAAWnHYTWAqAA7lEFEA)

---

```ts
const triple: [number, number, number] = [1, 2, 3]
const double: [number, number] = triple
//    ~~~~~~ '[number, number, number]' is not assignable to '[number, number]'
//           Source has 3 element(s) but target allows only 2.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQNKoJ4B4OKoAeUqYAJgM6KVQBOMYyAfABQBuAhgDYBcinMNgA0iANY5+GAJSIA3gChEiAPQrEAOi0KAvgogJaiejAAO3VPwDaYEAFsARqjqjbj56-tO6AXUQBeRCsARlEAJlEAZh8Abn1DKERyOBAHC2s3b093XwDjBnNUOLVlZQA-CsrEAHIbLw9ETIam32rEGGowOETOSkoYZDBONNRjOBq6nOzvH2qFEtLF0oBlFLoIUYALXsRIwgs7MihWSlkHEESoTjo0Hu5uOAB3agRubEQwjQUgA)

---

```ts
type T = Exclude<string | Date, string | number>
//   ^? type T = Date
type NonZeroNums = Exclude<number, 0>
//   ^? type NonZeroNums = number
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQNKoJ4B4OKoAeUqYAJgM6KVQBOMYyAfABQBuAhgDYBcinMNgA0iANY5+GAJSIA3gChEiAPQrEAOi0KAvgqjYADqkQAVRAF5EAUSIRuIcqly0GTAD4ARTqVGvGyO5gIAC2AEaodMwA3ApqyogAegD8iAbGZpaI3qT6RiYAcggAWpFwBaHUVrb2js7B4ZGiAAwxcerKKWn5iEVgpXTllVkNEXQKQA)

---

```ts
interface Lockbox {
  code: number
}
interface ReadonlyLockbox {
  readonly code: number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQNKoJ4B4OKoAeUqYAJgM6KVQBOMYyAfABQBuAhgDYBcinMNgA0iANY5+GAJSIA3gChEiAPQrEAOi0KAvgsak6wThFSIAMnAhiARnCLyliCHHKp+YEAFsbqOgG5dfTBDY1NEACVUTnIEbmxLazsHRWU6aNiweOdXd0RPHz9AvSA)

---

```ts
const box: Lockbox = { code: 4216 }
const robox: ReadonlyLockbox = { code: 3625 }
box.code = 1234 // ok
robox.code = 1234
//    ~~~~ Cannot assign to 'code' because it is a read-only property.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAcwKZQNKoJ4B4OKoAeUqYAJgM6KVQBOMYyAfABQBuAhgDYBcinMNgA0iANY5+GAJSIA3gChEiAPQrEAOi0KAvgsak6wThFSIAMnAhiARnCLyliCHHKp+YEAFsbqOgG5dfTBDY1NEACVUTnIEbmxLazsHRWU6aNiweOdXd0RPHz9AvRcwWkRk-kTbe0QAXnkct34AFgAmAEYANkQdQNLyujhKyIy4hKsahwa5JryAZi62gFZewOSNFzd6xA62+Zb-ZTVEODEFIY2tswa9g8CT5UQAP1fnxABhQTA4KAFKSgwZBIKBwRAAcmu4IqqAgnBAlDMMD+MGonEQ6RiAFpxogAA5DPF+KDYDQKIA)

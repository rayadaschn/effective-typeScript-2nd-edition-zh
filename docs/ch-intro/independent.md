# 理解代码生成与类型系统是相互独立的

## 要点

- 代码生成过程与类型系统无关，这意味着 TypeScript 的类型不会影响代码的运行行为。
- 即使程序中存在类型错误，仍有可能成功编译出代码。
- TypeScript 的类型在运行时是不可用的。如果想在运行时判断类型，需要自己构建办法，通常可以通过标签联合类型或检查属性来实现。
- 有些结构，比如 `class`，会同时产生 TypeScript 的类型和一个运行时可用的值。
- 由于类型在编译时会被移除，TypeScript 类型不会影响代码的运行性能。

## 正文

```ts
interface Square {
  width: number
}
interface Rectangle extends Square {
  height: number
}
type Shape = Square | Rectangle

function calculateArea(shape: Shape) {
  if (shape instanceof Rectangle) {
    //                 ~~~~~~~~~ 'Rectangle' only refers to a type,
    //                           but is being used as a value here
    return shape.height * shape.width
    //           ~~~~~~ Property 'height' does not exist on type 'Shape'
  } else {
    return shape.width * shape.width
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoEcCucooN4BQyyA7sACZgAWAXMiJgLYBG0A3AQL4GiSyIoAShARg4IAOYAbFBAAekEOQDOaLDnxFkVCMAlUwdBi3ZcCYAJ4AHFKipwbyALxrsuZAB9kw0eOkQOAhhMEFFgAHsQZAQ4KQRMKThIAEFcOAAKZXsbOjsHCABKZEJiYBhkTOyUUGUxUIhw8p86-yKS4mQAek6O3r6+gD8h4eHkAHJmvxkx5EipC2RcGGhVMHDkOGRLGwAaLWJu-qPj-uZMMGRgVVZQCWRMZQhyDdVNgDdYzBQdXH3FiDAmCgUSy+QAdDo9AZkAAqZCgmxgsiUKgcXqHE7IEZDZAABSg4RsUEs40h+jAM3I4QgqhA4Qu8iuF0iW2sKDGeRsYy0nGQECkj2Kf1wgOB8KqSIo1Fh4vByOoaOQ3G4QA)

---

```ts
function calculateArea(shape: Shape) {
  if ('height' in shape) {
    return shape.width * shape.height
    //     ^? (parameter) shape: Rectangle
  } else {
    return shape.width * shape.width
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoEcCucooN4BQyyA7sACZgAWAXMiJgLYBG0A3AQL4GiSyIoAShARg4IAOYAbFBAAekEOQDOaLDnxFkVCMAlUwdBi3ZcCYAJ4AHFKipwbyALxrsuZAB9kw0eOkQOGEwQUWAAexBkBDgpBEwpOEgAQVw4AAplexs6OwcIAEpkQmJgGGQ0gHIdPQMK5FBkTLzC4uJkXDBMKEimmwA6MkoqZAAqRqyIPur9MA425AB6BfnkAD0AfnKrHDhGCD5C3og6HzFJGS1OZAgpZU15jq6eiYGKalHxvNehueRubiAA)

---

```ts
interface Square {
  kind: 'square'
  width: number
}
interface Rectangle {
  kind: 'rectangle'
  height: number
  width: number
}
type Shape = Square | Rectangle

function calculateArea(shape: Shape) {
  if (shape.kind === 'rectangle') {
    return shape.width * shape.height
    //     ^? (parameter) shape: Rectangle
  } else {
    return shape.width * shape.width
    //     ^? (parameter) shape: Square
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoEcCucooN4BQyyA1qACYBcyA5AM5Y4Q0DcRyA7sOWABbUhMAWwBG0NgF8CoSLEQoAShARg4IAOYAbfOzIgqtXCrVbmbYrwjB1vMAOFio5ztz73R4glLABPAA4oqLxwAcgAvGiMuMgAPshKxhrabAQwmCAqwAD2IMgIcJoImJpwkACCuHAAFHTBAdRBIRAAlMiExMAwyDV1EAB0euThYRE0RqpJzK3txMi4YJhQubVNfVw8vMgAVMgrAX2W1rbOxAD0p7PEAHoA-N1+OHBCELKtexDUCROm7BLIEJo6DpLvNFstemtXJsdu9IRsTshzpdkLd7o9nq9dr0GlEIL8vAQgA)

---

```ts
class Square {
  width: number
  constructor(width: number) {
    this.width = width
  }
}
class Rectangle extends Square {
  height: number
  constructor(width: number, height: number) {
    super(width)
    this.height = height
  }
}
type Shape = Square | Rectangle

function calculateArea(shape: Shape) {
  if (shape instanceof Rectangle) {
    return shape.width * shape.height
    //     ^? (parameter) shape: Rectangle
  } else {
    return shape.width * shape.width
    //     ^? (parameter) shape: Square
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYGwhgzhAEDKCOBXMAnAptA3gKGtA7gJYAmALgBYBc0AdogLYBGaKA3LtMAPY0SkqJgpLigAURMlVoNmKAJRYOeCoQgA6CRWgBeAiQrs8AX2wnQkGACU0QsDQDmIDGgAepNDWIwEydIrzkaIT25KTUdEwshpw8fAJCIuL6UhGyADTQgcGh4TIsCjh4eBCIAA4sSZJy0crkqmpZIaQ6mUFN0SYmpACe5XDkYH26PqgYAD7Q1rYOTuzYAGaINEKEPJxgIMCI4O4AguhgohAD5dSwJ2gFHITz0EcX0IS8pHbAaFy3Uy8zl-5F6KRECgaNBjoM0BpktAAFSgi4NNqhGrQAD0KKKeAAegB+O6lVBgehodzyOHg6hfOyONAcIzQNAgCAYQr-YlAkFg8qQyQwslczTkZFojHQHF4glEkkKTloM5IUa00zYIA)

---

```ts
function asNumber(val: number | string): number {
  return val as number
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwM4DkQFsBGBTAJwAoA3ZAGwC5Ext8DEAfRVKAmMAcwEprbdCiAN4AoRIgJ4oIAkjLkUqGnUIBuEQF8RQA)

---

```ts
function asNumber(val: number | string): number {
  return Number(val)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwM4DkQFsBGBTAJwAoA3ZAGwC5Ext8DEAfRVKAmMAcwEprbdCiAN4AoRIgJ4oIAkkwDiZctwDcIgL4igA)

---

```ts
function setLightSwitch(value: boolean) {
  switch (value) {
    case true:
      turnLightOn()
      break
    case false:
      turnLightOff()
      break
    default:
      console.log(`I'm afraid I can't do that.`)
  }
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABFEAnMAZGBzAFlAeTAAoBKRAbwF8AoUSWBZNTHfA4YMy2+6eJAGcAplCx4oAZQDuMKBFzEAbgEMANiGEAuRACM4cNcJVhyFGokSDZ83ImXrNZi5cQQVI5Kk1aXr5uji7CSkANx+rrqoxgDW4f7unsDqIr7+liiBbIScZPHpUbH5lgAmwskgalBp6RAIgobCAHRqcNjEAAYAkgDkALaIKsCoKjAliF1uJj1QiCVwyLgqUE0dYS60tEA)

---

```ts
interface LightApiResponse {
  lightSwitchValue: boolean
}
async function setLight() {
  const response = await fetch('/light')
  const result: LightApiResponse = await response.json()
  setLightSwitch(result.lightSwitchValue)
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABFEAnMAZGBzAFlAeTAAoBKRAbwF8AoUSWBZNTHfA4YMy2+6eJAGcAplCx4oAZQDuMKBFzEAbgEMANiGEAuRACM4cNcJVhyFGokSDZ83ImXrNZi5cQQVI5Kk1aXr5uji7CSkANx+rrqoxgDW4f7unsDqIr7+liiBbIScZPHpUbH5lgAmwskgalBp6RAIgobCAHRqcNjEAAYAkgDkALaIKsCoKjAliF1uJj1QiCVwyLgqUE0dYS60tDBgUMKoyRDCiEFQAIIADjAASsKC5-VH5pZq2TJyCgBqjtp6BkYm4VoHgAnpBEHxGEJRCduE83PVZtE7g9EABeQbSUazYCiBTEHoAeheEh660sdTAgkRt0q1WO2Qu11u90pR3RKkxckQSJZIiaACsGiF8iIxK8bHikbSWuL3rgvhphOtaEA)

---

```ts
function add(a: number, b: number) {
  return a + b
}
//       ~~~ Duplicate function implementation
function add(a: string, b: string) {
  return a + b
}
//       ~~~ Duplicate function implementation
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoBTIFyLCAWwCMBTAJwBpEjd9jyBKRAb0TJKhDKWUQGpqAbkQBfAFAB6CYhmzEAP0WIAIiAAOAGxgRkUEolCRYCRDAKaSBEmCi74YMYej2U6LLgDOUMjDABzKhpELx9-JlZ2Tm4UfiFRSWk5GUV5FXUtHT0DcGcTMwsrGzsEMSA)

---

```ts
function add(a: number, b: number): number
function add(a: string, b: string): string

function add(a: any, b: any) {
  return a + b
}

const three = add(1, 2)
//    ^? const three: number
const twelve = add('1', '2')
//    ^? const twelve: string
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAQwCaoBTIFyLCAWwCMBTAJwBpEjd9jyBKWw0sgbgChRJYEV0suAM5QyMMAHMqNRCLGSms0eImcu4aPCRpMOFGACe03MkMNEAbw6JEZElBBltiANTVOAXw4cICEYigACzsSRABefkwARioAJgZOAHpEmxsAPQB+RF8wfyCQ5noyHz8oAIB3EgAbADdQiJ0MAHIopqom2KaEjmTUxEzs0orquuFlSQ4gA)

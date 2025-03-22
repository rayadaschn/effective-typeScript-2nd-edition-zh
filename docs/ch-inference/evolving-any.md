# Item 25: Understand Evolving Types

## 要点

- 虽然 TypeScript 类型通常只是 _细化_，但初始化为 `null`、`undefined` 或 `[]` 的值的类型允许 _演变_。
- 识别并理解这一构造的出现，并利用它减少在代码中对类型注解的需求。
- 为了更好的错误检查，考虑提供显式的类型注解，而不是使用演变类型。

## 正文

```ts
function range(start: number, limit: number) {
  const nums = []
  for (let i = start; i < limit; i++) {
    nums.push(i)
  }
  return nums
  //     ^? const nums: number[]
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAJwIZgOYFMAUBnKVZKALkTBAFsAjLZAGkQBsZKZTyrbkBKRAbwBQiRBAQFOlPIgC8iANoBdANzDEwOMkQ4mWKIhizEBIlGUHEAHmat25mAGoHfISJEUpAOgAOIPAAscGB5VEQBfNWQ9EGQkDzxQxAB6JLcRAD0AflFxfXiyD24lQQigA)

---

```ts
function range(start: number, limit: number) {
  const nums = []
  //    ^? const nums: any[]
  for (let i = start; i < limit; i++) {
    nums.push(i)
    // ^? const nums: any[]
  }
  return nums
  //     ^? const nums: number[]
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAJwIZgOYFMAUBnKVZKALkTBAFsAjLZAGkQBsZKZTyrbkBKRAbwBQiRBAQFOlPIgC8iANoBdANzDEAenUiRAPQD8o8VEl4y6AJ5K1wOMkQ4mWYzFmICRKMsQuAPM1bsXjAA1MF8QtomAHQADiB4ABY4MDyqkZqI+oZgEhRSZmCWimoAvmrITiDISHl4aRpakVliOca1ZHncVmVAA)

---

```ts
const result = []
//    ^? const result: any[]
result.push('a')
result
// ^? const result: string[]
result.push(1)
result
// ^? const result: (string | number)[]
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/MYewdgzgLgBATgUwgVwDawLwwNoF0DcAUAPTEzkwB6A-DKJLIiugFwwCGYAnnoU2lAB0AB2QQAFgAoA5O2kBKIv3QkyNOuGjwkAttDgBLMAHNeyoaImSAjIr46VpKrXpbzbSfqPGYAHxhgyAC2AEYIcPK8QA)

---

```ts
let value
//  ^? let value: any
if (Math.random() < 0.5) {
  value = /hello/
  value
  // ^? let value: RegExp
} else {
  value = 12
  value
  // ^? let value: number
}
value
// ^? let value: number | RegExp
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/DYUwLgBAbghsCuIDcAoA9GiEB6B+CoksCIAXBDAHYCeKAlgGYQAUAsjGABYB0ATlQBMA9gFtmASggAeCAAZuAVkkBvFFmKIIAXghpOIYMCFpU6uIjW7MeAuGjmyEAEogA5gFEAHgAcUAXwgDAGcQCFUzEm0IAEYAJlN7EksMHHxCRMRySngRACMQXn8UDRB0azS7Eqyc-N4IAB9nNy9fIA)

---

```ts
let value = null
//  ^? let value: any
try {
  value = doSomethingRiskyAndReturnANumber()
  value
  // ^? let value: number
} catch (e) {
  console.warn('alas!')
}
value
// ^? let value: number | null
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/CYUwxgNghgTiAEAzArgOzAFwJYHtX2BwGUcBbEDACy1QHMAlLAZwGsBPAQVWHouRlQcAcslIAjEDAAUASgBc8VKIkwA3ACgIFeADcoEZAgC8i5BAgaA9JfjwAegH54WjLv2GFUVG3UYYbeABvdVs9A2MCYjIKajpGVk5uXgx+QRFxSVkNUPcQEPhreycXN3CFJQyYdQBfeDAoDDBKeCkQGSD8sDwmHC0AOgB3WFQpAHJ9KCYAQlGZDWr1MMN1QsdnbSWQcuVJeAAfU3N1IA)

---

```ts
function range(start: number, limit: number) {
  const nums = []
  //    ~~~~ Variable 'nums' implicitly has type 'any[]' in some
  //         locations where its type cannot be determined
  if (start === limit) {
    return nums
    //     ~~~~ Variable 'nums' implicitly has an 'any[]' type
  }
  for (let i = start; i < limit; i++) {
    nums.push(i)
  }
  return nums
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAJwIZgOYFMAUBnKVZKALkTBAFsAjLZAGkQBsZKZTyrbkBKRAbwBQiRBAQFOlPIgC8iANoBdANzDEAenUiRAPz07EANSIxU1JlkQByClKuJWABxYR2TAJ6IAFqmlR3jpZW6O5K9jBIeHCUWGqa2gkiTHAQqLDiiADuXnSW7H4BlqlgYHBQiLSIACZYUHRsYFhVajDAiPiExLIycixsUHxCCci1IMhItniqCfEJ+gbGyKbmQZPhlM4wrlAe3r6I6NYhYYj+gWoAvmrAcMjtFuUwsogERFDKDogAPMys7B8wADUgMGahEkwAdI4QHgvDgYDxpogriIRlAxhMqFNBFcgA)

---

```ts
function makeSquares(start: number, limit: number) {
  const nums = []
  //    ~~~~ Variable 'nums' implicitly has type 'any[]' in some locations
  range(start, limit).forEach((i) => {
    nums.push(i * i)
  })
  return nums
  //     ~~~~ Variable 'nums' implicitly has an 'any[]' type
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAJwIZgOYFMAUBnKVZKALkTBAFsAjLZAGkQBsZKZTyrbkBKRAbwBQiRBAQFOlPIgC8iANoBdANzDEAenUiRAPQD8o8VEl4y6AJ5K1wOMkQ4mWYzFmICRKMsQuAPM1bsXjAA1MF8QtomAHQADiB4ABY4MDyqkZqI+oZgEhRSZmCWimoAvmrITiDISHl4aRpakVliOca1ZHncVmWgkLAIiJSoANZYAMoAjiBEWHj4hMQdXHSMLGwcnXThai25VNJySvUZ2gB+56eIAGpEMKjUjogA5LVP3pQxLBDsTOaICahpFBzDEsM8LEo3jAkHg4JQwUw4BBUP0cuV0Nh5h5VgEoDwojZkABRVAQJIuGQAPgEahEtVi8XJiAAVN5UqV2SIKlAqjV9sdGmcLtdbvdHi99lCPl8fn8AdJ0ODCpDEMDQYIykA)

# Item 67: Export All Types That Appear in Public APIs

## 要点

- Export types that appear in any form in any public method. Your users will be able to extract them anyway, so you may as well make it easy for them.
- 导出在任何公共方法中以任何形式出现的类型。你的用户反正能够提取它们，所以不如直接让他们更容易获取。

## 正文

```ts
interface SecretName {
  first: string
  last: string
}

interface SecretSanta {
  name: SecretName
  gift: string
}

export function getGift(name: SecretName, gift: string): SecretSanta {
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQVCYBycC2KA3gFDLIzBQDOYAXMrVKAOYDcZyANnLQ06w4BfEiVCRYiFOkzZUccHGSlyIAhAYysudR3ItgMeozDMQ7EiJIQAHgAcA9lDAUAriARhgDkMhbYAcUMwAAo1Qk0MbTxCABo-YP5TVgBKSNkweUVlTgB6XOQAYQB5AFkABQAlAFFUVE5tVyhfFXJkcI0ctrbKGmMAcgARBX7Yzm6ePmR+gDURse6hBbaDIwZ+0sQAIQcHAGtkcqgHUc4hPWR85GqcQctRIA)

---

```ts
type MySanta = ReturnType<typeof getGift>
//   ^? type MySanta = SecretSanta
type MyName = Parameters<typeof getGift>[0]
//   ^? type MyName = SecretName
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQVCYBycC2KA3gFDLIzBQDOYAXMrVKAOYDcZyANnLQ06w4BfEiVCRYiFOkzZUccHGSlyIAhAYysudR3ItgMeozDMQ7EiJIQAHgAcA9lDAUAriARhgDkMhbYAcUMwAAo1Qk0MbTxCABo-YP5TVgBKSNkweUVlTgB6XOQAYQB5AFkABQAlAFFUVE5tVyhfFXJkcI0ctrbKGmMAcgARBX7Yzm6ePmR+gDURse6hBbaDIwZ+0sQAIQcHAGtkcqgHUc4hPWR85GqcQctRMABPOxRSx6ywJQBeZErsJpAABVnhAADxPF4OGB+QLBAB8HCu5AAegB+ZAQ17vBSfZA-LRyHFwEiY5BvGIoH7lOBQdQSajgkFQmFgIJGOEAbQADABdREFFHo0nk9R4tBRbAUkhAA)

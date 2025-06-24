# Item 67: Export All Types That Appear in Public APIs

## 要点

- Export types that appear in any form in any public method. Your users will be able to extract them anyway, so you may as well make it easy for them.
- 导出在任何公共方法中以任何形式出现的类型。你的用户反正能够提取它们，所以不如直接让他们更容易获取。

## 正文

使用 TypeScript 足够长时间后，你最终会发现自己想要使用第三方库中的某个类型或接口，结果却发现它没有被导出。这对库的用户来说只是一个麻烦。正如你将看到的，任何作为公共 API 一部分的类型实际上都是被导出的，即使没有明确导出。作为库的作者，这意味着你应该从一开始就导出你的类型，以便为用户提供便利。

假设你想要创建一些私有的、未导出的类型：

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

作为你模块的用户，我无法直接导入 `SecretName` 或 `SecretSanta`，只能导入 `getGift`。但这更像是一种烦恼而不是严格的障碍：因为这些类型出现在导出的函数签名中，我可以提取它们。一种方法是使用 `Parameters` 和 `ReturnType` 泛型类型：

```ts
type MySanta = ReturnType<typeof getGift>
//   ^? type MySanta = SecretSanta
type MyName = Parameters<typeof getGift>[0]
//   ^? type MyName = SecretName
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgMoQVCYBycC2KA3gFDLIzBQDOYAXMrVKAOYDcZyANnLQ06w4BfEiVCRYiFOkzZUccHGSlyIAhAYysudR3ItgMeozDMQ7EiJIQAHgAcA9lDAUAriARhgDkMhbYAcUMwAAo1Qk0MbTxCABo-YP5TVgBKSNkweUVlTgB6XOQAYQB5AFkABQAlAFFUVE5tVyhfFXJkcI0ctrbKGmMAcgARBX7Yzm6ePmR+gDURse6hBbaDIwZ+0sQAIQcHAGtkcqgHUc4hPWR85GqcQctRMABPOxRSx6ywJQBeZErsJpAABVnhAADxPF4OGB+QLBAB8HCu5AAegB+ZAQ17vBSfZA-LRyHFwEiY5BvGIoH7lOBQdQSajgkFQmFgIJGOEAbQADABdREFFHo0nk9R4tBRbAUkhAA)

如果你不导出这些类型的目的是为了保持灵活性，那么游戏结束了！你已经通过将它们放在公共 API 中而承诺了它们。为你的用户做件好事，导出它们吧。

## 要点回顾

- 导出在任何公共方法中以任何形式出现的类型。你的用户反正能够提取它们，所以不如直接让他们更容易获取。

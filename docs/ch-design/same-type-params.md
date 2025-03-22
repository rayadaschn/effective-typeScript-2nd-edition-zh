# Item 38: Avoid Repeated Parameters of the Same Type

## 要点

- Avoid writing functions that take consecutive parameters with the same TypeScript type.
- Refactor functions that take many parameters to take fewer parameters with distinct types, or a single object parameter.

## 正文

```ts
drawRect(25, 50, 75, 100, 1)
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAEwE4EMDuAlAptACgA8AuRMEAWwCNdUAaRATzIprsc1atocQAtu7PnAAO6CDCgtyPOgEpEAbwBQiRAHoNiAHR6VAXxVoseQgCYArI0sAGRgHZriAIy37r+QG4VQA)

---

```ts
function drawRect(x: number, y: number, w: number, h: number, opacity: number) {
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/GYVwdgxgLglg9mABAEwE4EMDuAlAptACgA8AuRMEAWwCNdUAaRATzIprsc1atocQAtu7PnAAO6CDCgtyPOgEpEAbwBQiRAHoNiAHR6VAXxVA)

---

```ts
interface Point {
  x: number
  y: number
}
interface Dimension {
  width: number
  height: number
}
function drawRect(topLeft: Point, size: Dimension, opacity: number) {
  // ...
}
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgAoHtRmQbwFDLIAeAXMiAK4C2ARtANwHICeZltDeAvnltPEmQARYFQggAzsHQhcTAO7AAJmAAWbanSiNCqiMADmqsBo7bueGBRAIw02Uqhx5AJQi2AFGHQAHADIQMCZomOAANMhSAF4QZCJikvYRvojAYKzkmtAAlHKEAPT5yAB0pRZAA)

---

```ts
drawRect({ x: 25, y: 50 }, { x: 75, y: 100 }, 1.0)
//                        ~
// Argument ... is not assignable to parameter of type 'Dimension'.
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgAoHtRmQbwFDLIAeAXMiAK4C2ARtANwHICeZltDeAvnltPEmQARYFQggAzsHQhcTAO7AAJmAAWbanSiNCqiMADmqsBo7bueGBRAIw02Uqhx5AJQi2AFGHQAHADIQMCZomOAANMhSAF4QZCJikvYRvojAYKzkmtAAlHKEAPT5yAB0pRaOzm6eOKTIAEwArBEZDQAMXBE1ZADsTSxkAIyt7REDxa3ZjIWEM7Nz87MAfnjTAIJQBtTi2KXFyMAS5OjYcBJSBiBwNAA2KN7IPnBOYpBQyOgwyOk+KADk8eIpDJfsU8EA)

---

```ts
interface DrawRectParams extends Point, Dimension {
  opacity: number
}
function drawRect(params: DrawRectParams) {
  /* ... */
}

drawRect({ x: 25, y: 50, width: 75, height: 100, opacity: 1.0 })
```

[💻 playground](https://www.typescriptlang.org/play/?ts=5.4.5#code/JYOwLgpgTgZghgYwgAgAoHtRmQbwFDLIAeAXMiAK4C2ARtANwHICeZltDeAvnltPEmQARYFQggAzsHQhcTAO7AAJmAAWbanSiNCqiMADmqsBo7buvcP0QohUOPIBKEBGFRx7VCcghFIIJW8MLAAaYVFxKRk5QnQAB0RgMFZyTU4eGAoQV2lZJXsnFzAACgTPCTI7B2dXd3KASlxkAHoAKmQAOi7kVubkHjx86qLinFJkACYAVjCUqYAGMMUVdWQAdhnkPUNjMgBGecXkeMTk-Y75rnrGIA)

# cute
A Typescript tool library to stringify and output values to the console.

It can be used as an alternative to Node's `util.inspect` or `JSON.stringify`.

This library is quite similar to stringify-object but it also handles:

- big integers,
- console colors.

It has no dependencies and can work in any environment.

## Stringify API

```ts
export function stringify(
  value: unknown,
  options?: Partial<StringifyOptions>
): string

export type StringifyOptions = {
  // allowed characters before line break
  maxCharacters: number = 24
  // indentation characters
  indent: string = '  '
  // start level of indentation
  level: number = 0
  // whether to use ASCII colors or not
  colors: boolean = false
  // allow to customize the color theme
  theme: Record<ThemeToken, string>
}
```

### Usage

```ts
import { stringify } from "@digitak/cute"

console.log(stringify({ foo: 12, bar: "12" }))

console.log(stringify({ foo: 12, bar: "12" }, {
  indentation: '\t',
  colors: true,
}))
```

## Colors API

This library also export ASCII colors.

You can import them separately or under a namespace.

```ts
import { red, blue, brightCyan } from "@digitak/cute/colors"
// or
import * as colors from "@digitak/cute/colors"
```


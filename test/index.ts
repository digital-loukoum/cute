import { stringify } from "../source/index.js"
import start from "fartest"

type Sample = {
	name: string
	value: unknown
	expected: string
}

start("Stringify", async ({ stage, same }) => {
	const samples: Array<Sample> = [
		{
			name: "Number",
			value: 12,
			expected: "12",
		},
		{
			name: "Boolean",
			value: true,
			expected: "true",
		},
		{
			name: "Big integer",
			value: 12n,
			expected: "12n",
		},
		{
			name: "String",
			value: "foo",
			expected: '"foo"',
		},
		{
			name: "Symbol",
			value: Symbol("foo"),
			expected: "Symbol(foo)",
		},
		{
			name: "Null",
			value: null,
			expected: "null",
		},
		{
			name: "Undefined",
			value: undefined,
			expected: "undefined",
		},
		{
			name: "Empty object",
			value: {},
			expected: "{}",
		},
		{
			name: "Empty array",
			value: [],
			expected: "[]",
		},
		{
			name: "Array",
			value: [1, 2, 3],
			expected: "[ 1, 2, 3 ]",
		},
		{
			name: "Object",
			value: { a: 1, b: 2, c: 3 },
			expected: "{ a: 1, b: 2, c: 3 }",
		},
		{
			name: "Set",
			value: new Set([1, 2, 3]),
			expected: "Set [ 1, 2, 3 ]",
		},
		{
			name: "ArrayBuffer",
			value: Uint8Array.of(1, 2, 3).buffer,
			expected: "ArrayBuffer [ 1, 2, 3 ]",
		},
		{
			name: "Map",
			value: new Map([
				[1, 2],
				[3, 4],
			]),
			expected: "Map { 1 => 2, 3 => 4 }",
		},
		{
			name: "Big nested object",
			value: {
				a: {
					foo: "This is a long string",
				},
				b: {
					bar: "This is another long string",
				},
			},
			expected: `{
  a: {
    foo: "This is a long string"
  },
  b: {
    bar: "This is another long string"
  }
}`,
		},
	]

	samples.forEach(({ name, value, expected }) => {
		stage(name)
		same(stringify(value), expected)
		// console.log(name, stringify(value), expected)
	})
})

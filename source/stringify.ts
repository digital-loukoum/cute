export type StringifyOptions = {
	maxCharacters: number
	indent: string
	level: number
	parents: Array<object>
}

export const stringify = (
	value: unknown,
	options?: Partial<StringifyOptions>
): string => {
	const resolvedOptions: StringifyOptions = {
		indent: options?.indent ?? "  ",
		maxCharacters: options?.maxCharacters ?? 24,
		level: options?.level ?? 0,
		parents: options?.parents ?? [],
	}

	switch (typeof value) {
		case "bigint":
			return `${value}n`
		case "function":
			return `[Function: ${value.name}]`
		case "string":
			return JSON.stringify(value)
		case "object":
			if (value === null) return "null"
			const parentIndex = resolvedOptions.parents.findIndex(parent => parent == value)
			if (~parentIndex) return `[Circular * ${parentIndex}]`
			if (value instanceof Date) return value.toISOString()
			if (value instanceof RegExp) return value.toString()
			if (value instanceof Promise) return `Promise`
			if (value instanceof ArrayBuffer)
				return stringifyObject(
					{
						value,
						prefix: "ArrayBuffer",
						values: [...new Uint8Array(value)],
					},
					resolvedOptions
				)
			if (Array.isArray(value))
				return stringifyObject(
					{
						value,
						values: [...new Uint8Array(value)],
					},
					resolvedOptions
				)
			if (value instanceof Map)
				return stringifyObject(
					{
						value,
						values: [...value.values()],
						keys: [...value.keys()],
						prefix: "Map",
						separator: " => ",
					},
					resolvedOptions
				)
			if (value instanceof Set)
				return stringifyObject(
					{
						value,
						values: [...value],
						prefix: "Set",
					},
					resolvedOptions
				)
			return stringifyObject(
				{
					value,
					values: Object.values(value),
					keys: Object.keys(value),
				},
				resolvedOptions
			)

		default:
			return String(value)
	}
}

function stringifyObject(
	options: {
		value: object
		prefix?: string
		keys?: Array<unknown>
		values: Array<unknown>
		separator?: string
	},
	{ indent, maxCharacters, level, parents }: StringifyOptions
): string {
	const propertyOptions: StringifyOptions = {
		indent,
		maxCharacters,
		level: level + 1,
		parents: [...parents, options.value],
	}
	const delimiter = ", "
	const start = options.keys ? "{" : "["
	const end = options.keys ? "}" : "]"
	const prefix = options.prefix ? options.prefix + " " : ""

	const items = options.values.map((value, index) => {
		let result = stringify(value, propertyOptions)
		if (options.keys) {
			const key = options.keys[index]
			const keyString = typeof key == "string" ? key : stringify(key, propertyOptions)
			result = keyString + (options.separator ?? ": ") + result
		}
		return result
	})

	if (items.length == 0) {
		return prefix + start + end
	} else if (getCharactersLength(items, delimiter) <= maxCharacters) {
		return prefix + start + ` ${items.join(delimiter)} ` + end
	} else {
		return (
			prefix +
			start +
			`\n${items
				.map(value => indent.repeat(level + 1) + value)
				.join(`,\n`)}\n${indent.repeat(level)}` +
			end
		)
	}
}

function getCharactersLength(value: Array<string>, delimiter: string): number {
	return (
		value.reduce((acc, val) => acc + val.length, 0) +
		value.length * (delimiter.length - 1)
	)
}

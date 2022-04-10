import * as colors from "./colors.js"

export type ThemeToken =
	| "key"
	| "string"
	| "number"
	| "boolean"
	| "regularExpression"
	| "date"
	| "other"
	| "punctuation"
	| "null"

export type StringifyOptions = {
	maxCharacters: number
	indent: string
	level: number
	parents: Array<object>
	colors: boolean
	theme: Record<ThemeToken, string>
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
		colors: options?.colors ?? false,
		theme: {
			key: colors.initial,
			string: colors.green,
			number: colors.yellow,
			boolean: colors.brightBlue,
			regularExpression: colors.red,
			punctuation: colors.initial,
			date: colors.magenta,
			other: colors.cyan,
			null: colors.magenta,
		},
	}

	switch (typeof value) {
		case "bigint":
			return colorize(`${value}n`, "number", resolvedOptions)
		case "number":
			return colorize(String(value), "number", resolvedOptions)
		case "function":
			return colorize(
				value.name ? `[Function: ${value.name}]` : `[Function]`,
				"other",
				resolvedOptions
			)
		case "string":
			return colorize(JSON.stringify(value), "string", resolvedOptions)
		case "object":
			if (value === null) return colorize("null", "null", resolvedOptions)
			const parentIndex = resolvedOptions.parents.findIndex(parent => parent == value)
			if (~parentIndex)
				return colorize(
					`[Circular * ${resolvedOptions.parents.length - parentIndex}]`,
					"other",
					resolvedOptions
				)
			if (value instanceof Date)
				return colorize(value.toISOString(), "date", resolvedOptions)
			if (value instanceof RegExp)
				return colorize(value.toString(), "regularExpression", resolvedOptions)
			if (value instanceof Promise) return colorize(`[Promise]`, "other", resolvedOptions)
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
	{
		value,
		prefix,
		keys,
		values,
		separator,
	}: {
		value: object
		prefix?: string
		keys?: Array<unknown>
		values: Array<unknown>
		separator?: string
	},
	options: StringifyOptions
): string {
	const propertyOptions: StringifyOptions = {
		...options,
		level: options.level + 1,
		parents: [...options.parents, value],
	}
	const delimiter = ", "
	const start = colorize(keys ? "{" : "[", "punctuation", options)
	const end = colorize(keys ? "}" : "]", "punctuation", options)
	separator = colorize(separator ?? ": ", "punctuation", options)
	prefix = prefix ? prefix + " " : ""

	const items = values.map((value, index) => {
		let result = stringify(value, propertyOptions)
		if (keys) {
			const key = keys[index]
			const keyString =
				typeof key == "string"
					? colorize(key, "key", propertyOptions)
					: stringify(key, propertyOptions)
			result = keyString + separator + result
		}
		return result
	})

	if (items.length == 0) {
		return prefix + start + end
	} else if (
		getCharactersLength(items, delimiter, options.colors) <= options.maxCharacters
	) {
		return prefix + start + ` ${items.join(delimiter)} ` + end
	} else {
		return (
			prefix +
			start +
			`\n${items
				.map(value => options.indent.repeat(options.level + 1) + value)
				.join(`,\n`)}\n${options.indent.repeat(options.level)}` +
			end
		)
	}
}

function getCharactersLength(
	value: Array<string>,
	delimiter: string,
	colors: boolean
): number {
	const stripColors = (value: string) =>
		colors ? value.replace(/\u001b\[\d+m/g, "") : value
	return (
		value.reduce((result, value) => result + stripColors(value).length, 0) +
		value.length * (stripColors(delimiter).length - 1)
	)
}

function colorize(value: string, type: ThemeToken, options: StringifyOptions): string {
	if (!options.colors) return value
	return colors.reset + options.theme[type] + value + colors.reset
}

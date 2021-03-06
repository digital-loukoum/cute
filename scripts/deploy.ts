import { execSync } from "child_process"
import { bumpVersion } from "./utilities/bumpVersion"

console.log("Bumping version...")
const version = bumpVersion()

execSync(`git add .`)
execSync(`git commit -m "š Version ${version}"`)
execSync(`git push`)

import "./build"

console.log(`Starting deploy...`)

try {
	execSync(`npm publish`, { cwd: "./package" })
} catch (error) {
	console.error(`āļø ļ¼ļ¼ļ¼ An error occured during deploy ļ¼ļ¼ļ¼`)
	console.log(error, "\n")
	process.exit(1)
}

console.log(`\nš Deploy done š\n`)

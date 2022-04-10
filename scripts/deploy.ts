import { execSync } from "child_process"
import { bumpVersion } from "./utilities/bumpVersion"

console.log("Bumping version...")
const version = bumpVersion()

execSync(`git add .`)
execSync(`git commit -m "📌 Version ${version}"`)
execSync(`git push`)

import "./build"

console.log(`Starting deploy...`)

try {
	execSync(`npm publish`, { cwd: "./package" })
} catch (error) {
	console.error(`⛔️ －－－ An error occured during deploy －－－`)
	console.log(error, "\n")
	process.exit(1)
}

console.log(`\n🎉 Deploy done 🎉\n`)

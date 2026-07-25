import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const src = resolve(root, 'dist/index.html')
const destDir = resolve(root, 'share')
const dest = resolve(destDir, 'bps-catalog-admin-v0.1.html')

mkdirSync(destDir, { recursive: true })
copyFileSync(src, dest)
console.log(`Share file ready: ${dest}`)

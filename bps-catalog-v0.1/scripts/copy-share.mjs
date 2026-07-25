import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')
const shareDir = join(process.cwd(), 'share')
mkdirSync(shareDir, { recursive: true })

const html = readdirSync(dist).find((f) => f.endsWith('.html'))
if (!html) {
  console.error('No HTML found in dist/. Did the share build succeed?')
  process.exit(1)
}

const target = join(shareDir, 'bps-catalog-v0.1.html')
copyFileSync(join(dist, html), target)
console.log(`Share file ready: ${target}`)
if (existsSync(join(dist, 'favicon.svg'))) {
  copyFileSync(join(dist, 'favicon.svg'), join(shareDir, 'favicon.svg'))
}

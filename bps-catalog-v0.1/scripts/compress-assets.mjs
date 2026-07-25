/**
 * Compress all src/assets images → WebP (smallest practical).
 * Usage: node scripts/compress-assets.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const assetsRoot = path.join(root, 'src', 'assets')
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp'])

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) out.push(full)
  }
  return out
}

function mb(n) {
  return (n / 1024 / 1024).toFixed(2)
}

function limitsFor(file) {
  if (file.includes(`${path.sep}banners${path.sep}`)) {
    return { maxW: 1100, maxH: 520, quality: 58 }
  }
  if (file.includes(`${path.sep}logistics${path.sep}`)) {
    return { maxW: 640, maxH: 320, quality: 52 }
  }
  // products / misc
  return { maxW: 420, maxH: 420, quality: 52 }
}

async function compressToWebp(file) {
  const before = fs.statSync(file).size
  const ext = path.extname(file).toLowerCase()
  const webpPath = ext === '.webp' ? file : `${file.slice(0, -ext.length)}.webp`
  const tmp = `${webpPath}.tmp.webp`
  const { maxW, maxH, quality } = limitsFor(file)

  await sharp(file, { failOn: 'none' })
    .rotate()
    .resize({
      width: maxW,
      height: maxH,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toFile(tmp)

  const after = fs.statSync(tmp).size

  // Only keep result if smaller, or if converting format for consistency
  if (after < before || webpPath !== file) {
    if (fs.existsSync(webpPath) && webpPath !== file) fs.unlinkSync(webpPath)
    fs.renameSync(tmp, webpPath)
    if (webpPath !== file && fs.existsSync(file)) fs.unlinkSync(file)
    return { before, after: fs.statSync(webpPath).size, out: webpPath }
  }

  // already-webp and not smaller — discard tmp
  fs.unlinkSync(tmp)
  return { before, after: before, out: file, skipped: true }
}

function rewriteImports() {
  const indexFiles = [
    path.join(assetsRoot, 'products', 'index.ts'),
    path.join(assetsRoot, 'banners', 'index.ts'),
    path.join(assetsRoot, 'logistics', 'index.ts'),
  ]
  for (const f of indexFiles) {
    if (!fs.existsSync(f)) continue
    const src = fs.readFileSync(f, 'utf8')
    const next = src
      .replace(/\.png(['"])/g, '.webp$1')
      .replace(/\.jpe?g(['"])/g, '.webp$1')
    if (next !== src) {
      fs.writeFileSync(f, next)
      console.log('updated imports:', path.relative(root, f))
    }
  }
}

const files = walk(assetsRoot)
console.log(`found ${files.length} images`)

let beforeSum = 0
for (const file of files) {
  beforeSum += fs.statSync(file).size
  try {
    const r = await compressToWebp(file)
    const pct = r.skipped ? 'skip' : `${(((r.before - r.after) / r.before) * 100).toFixed(0)}%↓`
    console.log(`${mb(r.before)} → ${mb(r.after)} MB (${pct})  ${path.relative(root, r.out)}`)
  } catch (err) {
    console.error('FAIL', path.relative(root, file), err.message)
  }
}

rewriteImports()

const remaining = walk(assetsRoot)
const remainSum = remaining.reduce((s, f) => s + fs.statSync(f).size, 0)
console.log('---')
console.log(`before: ${mb(beforeSum)} MB`)
console.log(`after:  ${mb(remainSum)} MB (${remaining.length} files)`)
console.log(`saved:  ${mb(beforeSum - remainSum)} MB`)

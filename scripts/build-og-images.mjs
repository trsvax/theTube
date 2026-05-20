/**
 * build-og-images.mjs
 * Generates per-post og:image PNGs from the business card SVG template.
 * Text rendered as SVG paths via opentype.js (no font needed at render time).
 * PNG rendered via @resvg/resvg-wasm.
 * https://github.com/thx/resvg-js
 * https://github.com/opentypejs/opentype.js
 * Run after next build: node scripts/build-og-images.mjs
 * Outputs to out/og/{slug}.png
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { initWasm, Resvg } from '@resvg/resvg-wasm'
import opentype from 'opentype.js'

// Init WASM module
const wasmPath = join(process.cwd(), 'node_modules/@resvg/resvg-wasm/index_bg.wasm')
await initWasm(readFileSync(wasmPath))

// Load font for text-to-path conversion
const FONT_FILE = join(process.cwd(), 'assets/fonts/Georgia.ttf')
const fontBuffer = readFileSync(FONT_FILE)
const font = opentype.parse(fontBuffer.buffer)

const TEMPLATE = readFileSync(join(process.cwd(), 'public/images/business-card.svg'), 'utf-8')
const CONTENT_DIR_PRIMARY = join(process.cwd(), 'content/posts')
const CONTENT_DIR_SIBLING = join(process.cwd(), '../theTube-content/content/posts')
const CONTENT_DIR = existsSync(CONTENT_DIR_PRIMARY) ? CONTENT_DIR_PRIMARY : CONTENT_DIR_SIBLING
const OUT_DIR = join(process.cwd(), 'out/og')

mkdirSync(OUT_DIR, { recursive: true })

const posts = readdirSync(CONTENT_DIR)
  .filter(f => f.endsWith('.md'))
  .map(f => f.replace('.md', ''))

function parseFrontmatter(filepath) {
  const raw = readFileSync(filepath, 'utf-8')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const meta = {}
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim()
  }
  return meta
}

function textToPath(text, fontSize, x, y) {
  // opentype.js path commands use font coordinates (Y-up)
  // We need to flip Y to SVG coordinates (Y-down)
  // Strategy: get path, manually negate Y values, then translate to position
  const measurePath = font.getPath(text, 0, 0, fontSize)
  const bbox = measurePath.getBoundingBox()
  const textWidth = bbox.x2 - bbox.x1
  const startX = x - textWidth / 2

  const path = font.getPath(text, startX, 0, fontSize)
  
  // Flip Y in all path commands
  const flipped = path.commands.map(cmd => {
    const c = { ...cmd }
    if ('y' in c) c.y = -c.y
    if ('y1' in c) c.y1 = -c.y1
    if ('y2' in c) c.y2 = -c.y2
    return c
  })

  // Get new bbox after flip
  let minY = Infinity, maxY = -Infinity
  for (const cmd of flipped) {
    if ('y' in cmd) { minY = Math.min(minY, cmd.y); maxY = Math.max(maxY, cmd.y) }
    if ('y1' in cmd) { minY = Math.min(minY, cmd.y1); maxY = Math.max(maxY, cmd.y1) }
    if ('y2' in cmd) { minY = Math.min(minY, cmd.y2); maxY = Math.max(maxY, cmd.y2) }
  }
  const textH = maxY - minY
  // Shift so baseline aligns with target y
  const offsetY = y - maxY

  // Build path data string
  let d = ''
  for (const cmd of flipped) {
    switch (cmd.type) {
      case 'M': d += `M${cmd.x.toFixed(2)} ${(cmd.y + offsetY).toFixed(2)}`; break
      case 'L': d += `L${cmd.x.toFixed(2)} ${(cmd.y + offsetY).toFixed(2)}`; break
      case 'Q': d += `Q${cmd.x1.toFixed(2)} ${(cmd.y1 + offsetY).toFixed(2)} ${cmd.x.toFixed(2)} ${(cmd.y + offsetY).toFixed(2)}`; break
      case 'C': d += `C${cmd.x1.toFixed(2)} ${(cmd.y1 + offsetY).toFixed(2)} ${cmd.x2.toFixed(2)} ${(cmd.y2 + offsetY).toFixed(2)} ${cmd.x.toFixed(2)} ${(cmd.y + offsetY).toFixed(2)}`; break
      case 'Z': d += 'Z'; break
    }
  }

  return `<path d="${d}"/>`
}

function buildSvg(url) {
  // Replace the <text> element with a <path> element
  const pathD = textToPath(url, 16, 420, 170)
  const svg = TEMPLATE.replace(
    /<text class="url-text"[^>]*>.*?<\/text>/,
    `<g fill="#48597a">${pathD}</g>`
  )
  return svg
}

function renderPng(svg) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  })
  const rendered = resvg.render()
  return rendered.asPng()
}

for (const slug of posts) {
  const meta = parseFrontmatter(join(CONTENT_DIR, `${slug}.md`))
  const url = meta.shortSlug
    ? `tt.tube/${meta.shortSlug}`
    : `thetube.today/posts/${slug}`
  const svg = buildSvg(url)
  const png = renderPng(svg)
  writeFileSync(join(OUT_DIR, `${slug}.png`), png)
}

// Default site-level og image
const defaultSvg = buildSvg('theTube.today')
const defaultPng = renderPng(defaultSvg)
writeFileSync(join(OUT_DIR, 'default.png'), defaultPng)

console.log(`Generated ${posts.length + 1} og:image PNGs in out/og/`)

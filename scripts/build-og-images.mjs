/**
 * build-og-images.mjs
 * Generates per-post og:image PNGs from the business card SVG template.
 * Uses @resvg/resvg-wasm — Rust SVG renderer compiled to WASM. No native deps.
 * https://github.com/thx/resvg-js
 * Run after next build: node scripts/build-og-images.mjs
 * Outputs to out/og/{slug}.png
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { initWasm, Resvg } from '@resvg/resvg-wasm'

// Init WASM module
const wasmPath = join(process.cwd(), 'node_modules/@resvg/resvg-wasm/index_bg.wasm')
await initWasm(readFileSync(wasmPath))

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

// Find a serif font — macOS or Linux
const FONT_PATHS = [
  '/System/Library/Fonts/Supplemental/Georgia.ttf',           // macOS
  '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',         // Ubuntu/Debian
  '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf', // Ubuntu alt
]
const fontFile = FONT_PATHS.find(p => existsSync(p))
if (!fontFile) {
  console.warn('Warning: no serif font found, URL text may not render')
}

function renderPng(svg) {
  const opts = {
    fitTo: { mode: 'width', value: 1200 },
  }
  if (fontFile) {
    opts.font = {
      fontFiles: [fontFile],
      defaultFontFamily: 'serif',
    }
  }
  const resvg = new Resvg(svg, opts)
  const rendered = resvg.render()
  return rendered.asPng()
}

for (const slug of posts) {
  const meta = parseFrontmatter(join(CONTENT_DIR, `${slug}.md`))
  const url = meta.shortSlug
    ? `tt.tube/${meta.shortSlug}`
    : `thetube.today/posts/${slug}`
  const svg = TEMPLATE.replace(
    /<text class="url-text"[^>]*>.*?<\/text>/,
    `<text class="url-text" x="420" y="170" text-anchor="middle">${url}</text>`
  )
  const png = renderPng(svg)
  writeFileSync(join(OUT_DIR, `${slug}.png`), png)
}

// Default site-level og image
const defaultPng = renderPng(TEMPLATE)
writeFileSync(join(OUT_DIR, 'default.png'), defaultPng)

console.log(`Generated ${posts.length + 1} og:image PNGs in out/og/`)

/**
 * build-og-images.mjs
 * Generates per-post og:image SVGs from the business card template.
 * Run after next build: node scripts/build-og-images.mjs
 * Outputs to out/og/{slug}.svg
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join, basename } from 'path'

const TEMPLATE = readFileSync(join(import.meta.dirname, '../public/images/business-card.svg'), 'utf-8')
const CONTENT_DIR = join(import.meta.dirname, '../../theTube-content/content/posts')
const OUT_DIR = join(import.meta.dirname, '../out/og')

// Ensure output dir exists
mkdirSync(OUT_DIR, { recursive: true })

// Get all post slugs
const posts = readdirSync(CONTENT_DIR)
  .filter(f => f.endsWith('.md'))
  .map(f => f.replace('.md', ''))

for (const slug of posts) {
  const url = `thetube.today/posts/${slug}`
  const svg = TEMPLATE.replace(
    /<text class="url-text"[^>]*>.*?<\/text>/,
    `<text class="url-text" x="420" y="170" text-anchor="middle">${url}</text>`
  )
  writeFileSync(join(OUT_DIR, `${slug}.svg`), svg)
}

// Also generate the default site-level og image
const defaultSvg = TEMPLATE.replace(
  /<text class="url-text"[^>]*>.*?<\/text>/,
  `<text class="url-text" x="420" y="170" text-anchor="middle">theTube.today</text>`
)
writeFileSync(join(OUT_DIR, 'default.svg'), defaultSvg)

console.log(`Generated ${posts.length} og:image SVGs in out/og/`)

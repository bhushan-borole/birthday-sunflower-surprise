import { mkdir, writeFile } from 'node:fs/promises'

const commit = '345fc7886294d05fcaf08e3b3f95b9c198eab54e'
const base = `https://raw.githubusercontent.com/gmpsankalpa/Flower-animation/${commit}`
const root = new URL('../', import.meta.url)

async function download(path) {
  const response = await fetch(`${base}/${path}`)
  if (!response.ok) throw new Error(`Flower source ${path}: HTTP ${response.status}`)
  return response.text()
}

const [source, license] = await Promise.all([download('css/main.css'), download('LICENSE')])
const start = source.indexOf('.flowers {')
const end = source.indexOf('.container *')
if (start < 0 || end <= start) throw new Error('Pinned flower stylesheet structure changed')

// Scope the upstream choreography and size it to the stage, not the browser viewport.
const css = source.slice(start, end)
  .replace(/^(\.[^{]+)\{/gm, (_, selectors) => (
    `${selectors.trim().split(',').map((selector) => `.bloom-garden ${selector.trim()}`).join(', ')} {`
  ))
  .replace(/(-?\d*\.?\d+)vmin/g, 'calc($1 * var(--garden-unit))')
  .replace('left: vmin;', 'left: 0;')
  .replaceAll('#1aaa15', 'var(--stem-light)')
  .replaceAll('#00b815', 'var(--stem-mid)')
  .replaceAll('#064600', 'var(--stem-dark)')
  .replaceAll('#fce700', 'var(--petal)')
  .replaceAll('rgb(255, 251, 0)', 'var(--pollen)')
  .replaceAll('rgb(190, 133, 0)', 'var(--pollen)')
  .replaceAll('rgba(20, 122, 20, 0.4)', 'var(--stem-translucent)')
  .replaceAll('hsla(184deg, 97%, 58%, 0.2)', 'var(--leaf-sheen)')

await mkdir(new URL('src/styles/', root), { recursive: true })
await mkdir(new URL('public/licenses/', root), { recursive: true })
await writeFile(new URL('src/styles/flowers.css', root),
  `/* Adapted from GMP Sankalpa's Flower-animation (MIT), ${commit}.\n` +
  ' * Copyright (c) 2024 GMP Sankalpa. See public/licenses/Flower-animation.txt.\n' +
  ' * Changes: local scoping, container-relative units, botanical palette; no audio or scripts.\n */\n' + css)
await writeFile(new URL('public/licenses/Flower-animation.txt', root), license)
console.log(`Vendored MIT flower choreography from ${commit}; no music or upstream scripts.`)

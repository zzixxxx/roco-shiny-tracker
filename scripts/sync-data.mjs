// 把 data-source/aoe-top/public/data/ 下的 JSON 配置表镜像到 public/data/
// 由 predev / prebuild 钩子触发；若 submodule 未初始化则跳过并报警
import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs'
import { join, relative, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'data-source/aoe-top/public/data')
const DST = join(ROOT, 'public/data')

if (!existsSync(SRC)) {
  console.warn('[sync-data] submodule 未初始化，跳过同步')
  console.warn('[sync-data] 首次使用请执行：git submodule update --init --recursive')
  process.exit(0)
}

let copied = 0
let skipped = 0
let bytes = 0

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name.toLowerCase() === 'readme.md') continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      walk(full)
      continue
    }
    if (extname(name).toLowerCase() !== '.json') continue
    const rel = relative(SRC, full)
    const out = join(DST, rel)
    if (existsSync(out) && statSync(out).size === st.size) {
      skipped++
      continue
    }
    mkdirSync(dirname(out), { recursive: true })
    copyFileSync(full, out)
    copied++
    bytes += st.size
  }
}

walk(SRC)
console.log(`[sync-data] copied=${copied}, skipped=${skipped}, ${(bytes/1024/1024).toFixed(1)} MB`)

// 同步精灵异色立绘：friends/JL_<py>_yise.webp → public/shiny-pets/<py>.webp
const SHINY_SRC = join(ROOT, 'data-source/aoe-top/public/assets/webp/friends')
const SHINY_DST = join(ROOT, 'public/shiny-pets')
if (existsSync(SHINY_SRC)) {
  let sc = 0, ss = 0, sb = 0
  mkdirSync(SHINY_DST, { recursive: true })
  for (const name of readdirSync(SHINY_SRC)) {
    const m = name.match(/^JL_(.+)_yise\.webp$/)
    if (!m) continue
    const py = m[1]
    const src = join(SHINY_SRC, name)
    const dst = join(SHINY_DST, py + '.webp')
    const st = statSync(src)
    if (existsSync(dst) && statSync(dst).size === st.size) { ss++; continue }
    copyFileSync(src, dst)
    sc++
    sb += st.size
  }
  console.log(`[sync-shiny] copied=${sc}, skipped=${ss}, ${(sb/1024/1024).toFixed(1)} MB`)
}

// 全量镜像 aoe-top webp 资源到 public/icons/<subdir>/
// items (2083) → public/icons/items/
// friends (547) → public/icons/friends/
function mirrorWebp(srcDir, dstDir, label) {
  if (!existsSync(srcDir)) return
  let c = 0, s = 0, b = 0
  mkdirSync(dstDir, { recursive: true })
  for (const name of readdirSync(srcDir)) {
    if (!name.endsWith('.webp')) continue
    const src = join(srcDir, name)
    const dst = join(dstDir, name)
    const st = statSync(src)
    if (existsSync(dst) && statSync(dst).size === st.size) { s++; continue }
    copyFileSync(src, dst)
    c++
    b += st.size
  }
  console.log(`[${label}] copied=${c}, skipped=${s}, ${(b/1024/1024).toFixed(1)} MB`)
}
const WEBP_ROOT = join(ROOT, 'data-source/aoe-top/public/assets/webp')
mirrorWebp(join(WEBP_ROOT, 'items'), join(ROOT, 'public/icons/items'), 'sync-icons-items')
mirrorWebp(join(WEBP_ROOT, 'friends'), join(ROOT, 'public/icons/friends'), 'sync-icons-friends')

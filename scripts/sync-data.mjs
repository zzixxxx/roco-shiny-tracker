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

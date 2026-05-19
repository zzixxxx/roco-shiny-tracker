// 从 PETBASE_CONF.json 提取蛋组查询数据 → src/data/breedingPets.js
// 只保留：能在家园生蛋（pet_egg 有值）+ 主属性最低进化级（stage===1）的精灵
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = JSON.parse(readFileSync(join(ROOT, 'public/data/tables/PETBASE_CONF.json'), 'utf8'))
const pets = Object.values(src.RocoDataRows)

// PETBASE_CONF.unit_type 的 ID 映射(交叉验证 wiki + 解包样本得出,ID 1/7 未使用)
const ELEMENT_MAP = {
  2: 'normal',     // 普通
  3: 'grass',      // 草
  4: 'fire',       // 火
  5: 'water',      // 水
  6: 'light',      // 光
  8: 'ground',     // 地
  9: 'ice',        // 冰
  10: 'dragon',    // 龙
  11: 'electric',  // 电
  12: 'poison',    // 毒
  13: 'bug',       // 虫
  14: 'fighting',  // 武
  15: 'flying',    // 翼
  16: 'cute',      // 萌
  17: 'ghost',     // 幽
  18: 'evil',      // 恶
  19: 'mechanical',// 机械
  20: 'psychic',   // 幻
}

// 扫 aoe-top friends 目录找出所有有异色立绘的 py
const friendsDir = join(ROOT, 'data-source/aoe-top/public/assets/webp/friends')
const yisePySet = new Set()
if (existsSync(friendsDir)) {
  for (const f of readdirSync(friendsDir)) {
    const m = f.match(/^JL_(.+)_yise\.webp$/)
    if (m) yisePySet.add(m[1])
  }
}

// 已知错配：PETBASE_CONF.JL_res 给的 py 跟 aoe-top _yise 文件名不一致的精灵
// 这里手动列出（key = 普通 py，value = 异色 py）
const SHINY_PY_MANUAL = {
  zhiyuhuowa: 'zhiyuru',  // 治愈兔
}

const out = []
for (const p of pets) {
  if (!p.egg_group || p.pet_egg === undefined) continue
  if (p.stage !== 1) continue
  const m = (p.JL_res || '').match(/JL_([a-zA-Z0-9_]+?)\.JL_/)
  const py = m ? m[1] : null
  // 异色立绘 py：先查手动映射，再查 aoe-top yise 集合；都没有则 null
  let shinyPy = null
  if (py) {
    if (SHINY_PY_MANUAL[py] && yisePySet.has(SHINY_PY_MANUAL[py])) shinyPy = SHINY_PY_MANUAL[py]
    else if (yisePySet.has(py)) shinyPy = py
  }
  out.push({
    id: p.id,
    name: p.name,
    py,
    shinyPy,
    element: Array.isArray(p.unit_type) ? p.unit_type.map(e => ELEMENT_MAP[e] || null).filter(Boolean) : [],
    eggGroup: p.egg_group,
  })
}

out.sort((a, b) => a.id - b.id)

// 蛋组中文名（用户提供，按 PETBASE_CONF.egg_group ID）
// ID 1 = 无法孵蛋（验证：该组 23 只精灵全部 pet_egg 缺失）
// ID 2~15 按精灵特征匹配到用户提供的 14 个组名
const GROUP_LABELS = {
  1: '无法孵蛋',
  2: '巨灵组',
  3: '两栖组',
  4: '昆虫组',
  5: '天空组',
  6: '动物组',
  7: '妖精组',
  8: '植物组',
  9: '拟人组',
  10: '软体组',
  11: '大地组',
  12: '魔力组',
  13: '海洋组',
  14: '龙组',
  15: '机械组',
}

// S1 异色精灵 stage 1 的蛋组归属（用于生蛋规划自动初始化）
// 从 src/data/pets.js 的 SHINY_PETS 取名字，反查 PETBASE_CONF 拿 egg_group
const { SHINY_PETS } = await import(pathToFileURL(join(ROOT, 'src/data/pets.js')).href)
const shinyStage1Names = new Set(SHINY_PETS.map(p => p.evolutionLine?.[0] || p.name))
const shinyByGroup = {}
for (const p of pets) {
  if (p.stage !== 1 || !shinyStage1Names.has(p.name) || !p.egg_group) continue
  for (const g of p.egg_group) {
    shinyByGroup[g] = shinyByGroup[g] || []
    if (!shinyByGroup[g].includes(p.name)) shinyByGroup[g].push(p.name)
  }
}
const s1DefaultGroups = []
for (const gid of Object.keys(GROUP_LABELS).map(Number).sort((a, b) => a - b)) {
  s1DefaultGroups.push({
    id: gid,
    name: GROUP_LABELS[gid],
    pets: shinyByGroup[gid] || [],
  })
}

const file = `// 自动生成 by scripts/gen-breeding-data.mjs - 勿手改
// 数据源：public/data/tables/PETBASE_CONF.json
// 仅含：可在家园生蛋（pet_egg 有值）且为进化链 stage 1 的精灵

export const EGG_GROUP_LABELS = ${JSON.stringify(GROUP_LABELS, null, 2)}

export const BREEDING_PETS = ${JSON.stringify(out, null, 2)}

// S1 异色精灵按蛋组分布（用于生蛋规划自动初始化）
export const S1_DEFAULT_GROUPS = ${JSON.stringify(s1DefaultGroups, null, 2)}
`
writeFileSync(join(ROOT, 'src/data/breedingPets.js'), file)
console.log(`[gen-breeding] ${out.length} pets + ${s1DefaultGroups.length} groups written`)

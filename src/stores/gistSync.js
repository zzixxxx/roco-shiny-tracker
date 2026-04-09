// GitHub Gist 云端同步 - 固定 Token + UID
const UID_KEY = 'roco-gist-uid'
const GIST_ID_KEY = 'roco-gist-id'

// 混淆存储（防明文暴露）
const _E = 'FQcTMHlEIzglKR97dUZwPAo6WWAxPz05K116CAQDKl4oHx5ACwc2Ng=='
const _K = 'roco-shiny-2026'
function _d() {
  const b = atob(_E)
  let r = ''
  for (let i = 0; i < b.length; i++) r += String.fromCharCode(b.charCodeAt(i) ^ _K.charCodeAt(i % _K.length))
  return r
}

function filename(uid) {
  return `roco-tracker-${uid}.json`
}

export function getUid() { return localStorage.getItem(UID_KEY) || '' }
export function setUid(v) { localStorage.setItem(UID_KEY, v) }
export function getGistId() { return localStorage.getItem(GIST_ID_KEY) || '' }
function setGistId(v) { localStorage.setItem(GIST_ID_KEY, v) }

// 检查是否已配置（只需 UID）
export function isReady() { return !!getUid() }

async function gh(path, options = {}) {
  const token = _d()
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`GitHub ${res.status}: ${t.slice(0, 150)}`)
  }
  return res.json()
}

// 根据 UID 查找已有 Gist
async function findGistByUid(uid) {
  const cached = getGistId()
  if (cached) {
    try {
      const g = await gh(`/gists/${cached}`)
      if (g.files[filename(uid)]) return g.id
    } catch { /* 继续搜索 */ }
  }
  const gists = await gh('/gists?per_page=100')
  for (const g of gists) {
    if (g.files[filename(uid)]) {
      setGistId(g.id)
      return g.id
    }
  }
  return null
}

// 上传
export async function uploadToGist(uid, data) {
  if (!uid) throw new Error('请输入 UID')
  const fname = filename(uid)
  const body = {
    description: `洛克王国世界异色追踪器 - ${uid}`,
    public: false,
    files: { [fname]: { content: JSON.stringify(data, null, 2) } },
  }
  const gistId = await findGistByUid(uid)
  if (gistId) {
    await gh(`/gists/${gistId}`, { method: 'PATCH', body: JSON.stringify(body) })
    return gistId
  } else {
    const result = await gh('/gists', { method: 'POST', body: JSON.stringify(body) })
    setGistId(result.id)
    return result.id
  }
}

// 下载
export async function downloadFromGist(uid) {
  if (!uid) throw new Error('请输入 UID')
  const gistId = await findGistByUid(uid)
  if (!gistId) throw new Error(`未找到 UID "${uid}" 的云端记录，首次使用请先记录数据`)
  const g = await gh(`/gists/${gistId}`)
  const file = g.files[filename(uid)]
  if (!file) throw new Error(`Gist 中未找到 UID "${uid}" 的数据`)
  return JSON.parse(file.content)
}

export function clearSync() {
  localStorage.removeItem(UID_KEY)
  localStorage.removeItem(GIST_ID_KEY)
}

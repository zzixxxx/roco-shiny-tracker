// GitHub Gist 云端同步 - 基于 UID
const TOKEN_KEY = 'roco-gist-token'
const UID_KEY = 'roco-gist-uid'
const GIST_ID_KEY = 'roco-gist-id'

function filename(uid) {
  return `roco-tracker-${uid}.json`
}

export function getToken() { return localStorage.getItem(TOKEN_KEY) || '' }
export function setToken(v) { localStorage.setItem(TOKEN_KEY, v) }
export function getUid() { return localStorage.getItem(UID_KEY) || '' }
export function setUid(v) { localStorage.setItem(UID_KEY, v) }
export function getGistId() { return localStorage.getItem(GIST_ID_KEY) || '' }
function setGistId(v) { localStorage.setItem(GIST_ID_KEY, v) }

async function gh(path, options = {}) {
  const token = getToken()
  if (!token) throw new Error('请先设置 GitHub Token')
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
  // 先用缓存的 gistId 尝试
  const cached = getGistId()
  if (cached) {
    try {
      const g = await gh(`/gists/${cached}`)
      if (g.files[filename(uid)]) return g.id
    } catch { /* gist 不存在，继续搜索 */ }
  }
  // 搜索用户所有 gist
  const gists = await gh('/gists?per_page=100')
  for (const g of gists) {
    if (g.files[filename(uid)]) {
      setGistId(g.id)
      return g.id
    }
  }
  return null
}

// 上传：绑定 UID
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

// 下载：根据 UID 查找并读取
export async function downloadFromGist(uid) {
  if (!uid) throw new Error('请输入 UID')
  const gistId = await findGistByUid(uid)
  if (!gistId) throw new Error(`未找到 UID "${uid}" 的云端记录`)
  const g = await gh(`/gists/${gistId}`)
  const file = g.files[filename(uid)]
  if (!file) throw new Error(`Gist 中未找到 UID "${uid}" 的数据`)
  return JSON.parse(file.content)
}

export function clearSync() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(UID_KEY)
  localStorage.removeItem(GIST_ID_KEY)
}

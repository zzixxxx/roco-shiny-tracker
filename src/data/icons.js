// 全局统一风格 icon - 渐变填充 SVG
function e(svg) { return `data:image/svg+xml,${encodeURIComponent(svg)}` }

// ===== 褪色结果 =====
export const ICON_SHINY = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FFA500"/></linearGradient></defs><path d="M24 2L28 18L44 22L28 26L24 42L20 26L4 22L20 18Z" fill="url(#a)"/><circle cx="38" cy="8" r="2.5" fill="#FFD700"/><circle cx="10" cy="38" r="2" fill="#FFD700"/><circle cx="40" cy="36" r="1.5" fill="#FFA500"/></svg>`)

export const ICON_POLLUTED = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#9B59B6"/><stop offset="100%" stop-color="#6C3483"/></linearGradient><radialGradient id="b" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#BF7FDB" stop-opacity=".6"/><stop offset="100%" stop-color="#6C3483" stop-opacity="0"/></radialGradient></defs><circle cx="24" cy="24" r="20" fill="url(#b)"/><path d="M24 6C32 6 38 12 38 20C38 26 34 30 28 30C24 30 22 28 22 24C22 21 24 19 27 19C29 19 30 20 30 22" stroke="url(#a)" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="16" cy="34" r="3" fill="#9B59B6" opacity=".7"/><circle cx="32" cy="38" r="2.5" fill="#8E44AD" opacity=".6"/><circle cx="12" cy="18" r="2" fill="#9B59B6" opacity=".5"/></svg>`)

export const ICON_NORMAL = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" stroke="#BBB" stroke-width="3" fill="none"/><line x1="18" y1="24" x2="30" y2="24" stroke="#CCC" stroke-width="2.5" stroke-linecap="round"/></svg>`)

// ===== 卡池 =====
// 家族池 - 小房子/巢穴
export const ICON_FAMILY = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#43e97b"/><stop offset="100%" stop-color="#38f9d7"/></linearGradient></defs><path d="M8 24L24 10l16 14" stroke="url(#a)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 22v16h24V22" stroke="url(#a)" stroke-width="2.5" fill="none"/><path d="M20 38v-10h8v10" stroke="url(#a)" stroke-width="2" fill="none"/><circle cx="24" cy="8" r="2" fill="url(#a)"/></svg>`)

// 属性池 - 菱形宝石
export const ICON_ELEMENT_POOL = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#667eea"/><stop offset="100%" stop-color="#764ba2"/></linearGradient></defs><path d="M24 4L40 20L24 44L8 20Z" fill="none" stroke="url(#a)" stroke-width="2.5" stroke-linejoin="round"/><path d="M8 20h32M24 4L16 20l8 24M24 4l8 16-8 24" stroke="url(#a)" stroke-width="1.5" fill="none" opacity=".6"/><circle cx="24" cy="20" r="3" fill="url(#a)" opacity=".5"/></svg>`)

// ===== 功能 icon =====
// 连续捕捉 - 连环/锁链
export const ICON_CHAIN = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f6d365"/><stop offset="100%" stop-color="#fda085"/></linearGradient></defs><ellipse cx="18" cy="20" rx="10" ry="7" stroke="url(#a)" stroke-width="2.5" fill="none" transform="rotate(-30 18 20)"/><ellipse cx="30" cy="28" rx="10" ry="7" stroke="url(#a)" stroke-width="2.5" fill="none" transform="rotate(-30 30 28)"/></svg>`)

// 褪色结果 - 水滴褪色
export const ICON_FADE = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#a18cd1"/><stop offset="100%" stop-color="#fbc2eb"/></linearGradient></defs><path d="M24 6c0 0-14 14-14 24a14 14 0 0028 0c0-10-14-24-14-24z" fill="none" stroke="url(#a)" stroke-width="2.5" stroke-linejoin="round"/><path d="M18 28c0-4 6-10 6-10" stroke="url(#a)" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/></svg>`)

// 道具消耗 - 背包
export const ICON_BAG = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f093fb"/><stop offset="100%" stop-color="#f5576c"/></linearGradient></defs><path d="M16 16V12a8 8 0 0116 0v4" stroke="url(#a)" stroke-width="2.5" fill="none"/><rect x="10" y="16" width="28" height="24" rx="4" stroke="url(#a)" stroke-width="2.5" fill="none"/><line x1="10" y1="24" x2="38" y2="24" stroke="url(#a)" stroke-width="2" opacity=".5"/><rect x="20" y="22" width="8" height="4" rx="1" fill="url(#a)" opacity=".4"/></svg>`)

// 刷取记录/日志 - 卷轴
export const ICON_SCROLL = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fa709a"/><stop offset="100%" stop-color="#fee140"/></linearGradient></defs><path d="M12 8h24a4 4 0 010 8H12" stroke="url(#a)" stroke-width="2.5" fill="none"/><rect x="8" y="12" width="28" height="28" rx="2" stroke="url(#a)" stroke-width="2.5" fill="none"/><path d="M36 40h4a4 4 0 000-8h-4" stroke="url(#a)" stroke-width="2.5" fill="none"/><line x1="14" y1="22" x2="30" y2="22" stroke="url(#a)" stroke-width="2" stroke-linecap="round" opacity=".5"/><line x1="14" y1="28" x2="26" y2="28" stroke="url(#a)" stroke-width="2" stroke-linecap="round" opacity=".5"/><line x1="14" y1="34" x2="28" y2="34" stroke="url(#a)" stroke-width="2" stroke-linecap="round" opacity=".5"/></svg>`)

// 异色图鉴 - 星星书
export const ICON_BOOK = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FFA500"/></linearGradient></defs><path d="M8 8c6-2 12 0 16 4c4-4 10-6 16-4v30c-6-2-12 0-16 4c-4-4-10-6-16-4z" stroke="url(#a)" stroke-width="2.5" fill="none" stroke-linejoin="round"/><line x1="24" y1="12" x2="24" y2="38" stroke="url(#a)" stroke-width="1.5" opacity=".4"/><path d="M24 18l1.8 3.6 4 .6-2.9 2.7.7 3.9L24 26.8l-3.6 2 .7-3.9-2.9-2.7 4-.6z" fill="url(#a)" opacity=".7"/></svg>`)

// 数据管理 - 齿轮
export const ICON_GEAR = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4facfe"/><stop offset="100%" stop-color="#00f2fe"/></linearGradient></defs><circle cx="24" cy="24" r="8" stroke="url(#a)" stroke-width="2.5" fill="none"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4.2 4.2M33.8 33.8l4.2 4.2M38 10l-4.2 4.2M14.2 33.8L10 38" stroke="url(#a)" stroke-width="2.5" stroke-linecap="round"/></svg>`)

// 统计图表
export const ICON_CHART = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#43e97b"/><stop offset="100%" stop-color="#38f9d7"/></linearGradient></defs><rect x="8" y="28" width="8" height="14" rx="1.5" fill="url(#a)" opacity=".7"/><rect x="20" y="16" width="8" height="26" rx="1.5" fill="url(#a)" opacity=".85"/><rect x="32" y="8" width="8" height="34" rx="1.5" fill="url(#a)"/></svg>`)

// 孵蛋
export const ICON_EGG = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffecd2"/><stop offset="100%" stop-color="#fcb69f"/></linearGradient></defs><path d="M24 6c-10 0-16 12-16 22 0 8 7 14 16 14s16-6 16-14C40 18 34 6 24 6z" fill="url(#a)" stroke="#e8a87c" stroke-width="2"/><path d="M16 28c2-4 6-6 8-3s4 2 8 0" stroke="#e8a87c" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`)

// 云端
export const ICON_CLOUD = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#667eea"/><stop offset="100%" stop-color="#764ba2"/></linearGradient></defs><path d="M14 34h22c5 0 8-3 8-7s-3-7-7-7h-1c-1-6-6-10-12-10-5 0-9 3-11 7-4 1-7 4-7 8 0 5 3 9 8 9z" stroke="url(#a)" stroke-width="2.5" fill="none" stroke-linejoin="round"/></svg>`)

// 保存/磁盘
export const ICON_SAVE = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4facfe"/><stop offset="100%" stop-color="#00f2fe"/></linearGradient></defs><rect x="8" y="6" width="32" height="36" rx="3" stroke="url(#a)" stroke-width="2.5" fill="none"/><rect x="14" y="6" width="20" height="14" rx="1" stroke="url(#a)" stroke-width="2" fill="none"/><rect x="14" y="30" width="20" height="10" rx="1" stroke="url(#a)" stroke-width="2" fill="none"/><line x1="28" y1="10" x2="28" y2="16" stroke="url(#a)" stroke-width="2"/></svg>`)

// 目标
export const ICON_TARGET = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff6b6b"/><stop offset="100%" stop-color="#ee5a24"/></linearGradient></defs><circle cx="24" cy="24" r="18" stroke="url(#a)" stroke-width="2.5" fill="none"/><circle cx="24" cy="24" r="10" stroke="url(#a)" stroke-width="2" fill="none"/><circle cx="24" cy="24" r="3" fill="url(#a)"/></svg>`)

// 闪电/快捷
export const ICON_BOLT = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f6d365"/><stop offset="100%" stop-color="#fda085"/></linearGradient></defs><path d="M28 4L14 26h8l-4 18L34 22h-8z" fill="url(#a)"/></svg>`)

// 刷新
export const ICON_REFRESH = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#667eea"/><stop offset="100%" stop-color="#764ba2"/></linearGradient></defs><path d="M38 24c0 7.7-6.3 14-14 14s-14-6.3-14-14 6.3-14 14-14c5 0 9.4 2.6 11.9 6.5" stroke="url(#a)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M36 6v12h-12" stroke="url(#a)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

// 噩梦骷髅
export const ICON_SKULL = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#845ef7"/><stop offset="100%" stop-color="#5f3dc4"/></linearGradient></defs><circle cx="24" cy="20" r="16" stroke="url(#a)" stroke-width="2.5" fill="none"/><circle cx="18" cy="18" r="3.5" fill="url(#a)"/><circle cx="30" cy="18" r="3.5" fill="url(#a)"/><path d="M19 28h10" stroke="url(#a)" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="26" x2="22" y2="30" stroke="url(#a)" stroke-width="1.5"/><line x1="26" y1="26" x2="26" y2="30" stroke="url(#a)" stroke-width="1.5"/><path d="M18 36v4M24 36v4M30 36v4" stroke="url(#a)" stroke-width="2.5" stroke-linecap="round"/></svg>`)

// 汇总
export const ICON_SUM = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#43e97b"/><stop offset="100%" stop-color="#38f9d7"/></linearGradient></defs><rect x="6" y="6" width="36" height="36" rx="4" stroke="url(#a)" stroke-width="2.5" fill="none"/><path d="M14 14h10l-8 10 8 10H14" stroke="url(#a)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="28" y1="18" x2="34" y2="18" stroke="url(#a)" stroke-width="2" stroke-linecap="round"/><line x1="28" y1="24" x2="34" y2="24" stroke="url(#a)" stroke-width="2" stroke-linecap="round"/><line x1="28" y1="30" x2="34" y2="30" stroke="url(#a)" stroke-width="2" stroke-linecap="round"/></svg>`)

// 批量
export const ICON_BATCH = e(
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#a18cd1"/><stop offset="100%" stop-color="#fbc2eb"/></linearGradient></defs><rect x="6" y="10" width="28" height="28" rx="3" stroke="url(#a)" stroke-width="2.5" fill="none"/><rect x="14" y="6" width="28" height="28" rx="3" stroke="url(#a)" stroke-width="2" fill="none" opacity=".4"/><path d="M14 22h12M14 28h8" stroke="url(#a)" stroke-width="2" stroke-linecap="round" opacity=".7"/></svg>`)

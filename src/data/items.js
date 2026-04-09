// 道具数据 - 来源: wiki.biligame.com/rocom/道具图鉴
// 图片URL来自Wiki

const W = 'https://patchwiki.biligame.com/images/rocom/thumb'

// 捕捉球类道具（含图片）
export const CAPTURE_BALLS = [
  { id: 'normal_ball',   name: '普通咕噜球', desc: '基础捕捉球',                     types: [],                      img: `${W}/e/e1/suveiyd5wk5jgw2njxhbk01oar04bf4.png/100px-100002.png` },
  { id: 'advanced_ball', name: '高级咕噜球', desc: '增强捕捉效果，虚弱时加成',         types: [],                      img: `${W}/3/31/g8gdf44egqs1iohc6hf7lyaeprqyezx.png/100px-100003.png` },
  { id: 'king_ball',     name: '国王球',     desc: '高捕获率+天分提升(资质≥7)',        types: [],                      img: `${W}/2/2e/jygbfxpdbup5weqy4zaqnyaw2fcfyrq.png/100px-100255.png` },
  { id: 'catch_light',   name: '捕光球',     desc: 'S1赛季纪念球，高捕获率',          types: [],                      img: `${W}/3/3b/ifv37q0ul8zw20zwq95hbl15x79scc4.png/100px-100792.png` },
  { id: 'beauty_ball',   name: '美妙球',     desc: '萌系/普通系捕获率↑',              types: ['cute', 'normal'],      img: `${W}/b/b0/6ywvdkywqprqvws7m4ogeldp9y19swt.png/100px-Img_haihaiqiu.png` },
  { id: 'battle_ball',   name: '好战球',     desc: '武系/龙系捕获率↑',                types: ['fighting', 'dragon'],  img: `${W}/7/79/kdfs6bmfy54gk7ak70arjxug91zv1z5.png/100px-Img_lumangqiu.png` },
  { id: 'photo_ball',    name: '光合球',     desc: '草系/光系捕获率↑',                types: ['grass', 'light'],      img: `${W}/d/d5/i0k2vx3nsjzsbbpfzfbwf3dlin3ixn0.png/100px-Img_guangheqiu.png` },
  { id: 'net_ball',      name: '网兜球',     desc: '水系/翼系捕获率↑',                types: ['water', 'flying'],     img: `${W}/4/4b/60uvwzet0brdqlhtoa89domccpbo4hr.png/100px-Img_wangdiuqiu.png` },
  { id: 'dark_ball',     name: '暗星球',     desc: '幽系/恶系捕获率↑',                types: ['ghost', 'evil'],       img: `${W}/5/5a/hif6470l7ojdexwm72t9brp0f0x3h4x.png/100px-Img_daodanqiu.png` },
  { id: 'temp_ball',     name: '调温球',     desc: '火系/冰系捕获率↑',                types: ['fire', 'ice'],         img: `${W}/0/0d/2fx8i8qxb62s1sj8dn08h9vhsnsim1t.png/100px-Img_tiaowenqiu.png` },
  { id: 'insulate_ball', name: '绝缘球',     desc: '电系/毒系捕获率↑',                types: ['electric', 'poison'],  img: `${W}/0/0d/k1hb59umk1sisjh8cev5bvyzvavezvb.png/100px-Img_jueyuanqiu.png` },
  { id: 'sand_ball',     name: '淘沙球',     desc: '地系/虫系捕获率↑',                types: ['ground', 'bug'],       img: `${W}/8/81/7pzswfbn9l7hip6ptdg7f2mo341ztui.png/100px-Img_shaliqiu.png` },
  { id: 'morph_ball',    name: '变幻球',     desc: '幻系/机械系捕获率↑',              types: ['psychic', 'mechanical'], img: `${W}/9/97/t58zrpfzxopvj3ke3oi3v57mf6k05s0.png/100px-Img_miwuqiu.png` },
  { id: 'prism_ball',    name: '棱镜球',     desc: '100%捕获+炫彩+资质满',            types: [],                      img: `${W}/9/9b/kkwd244su5nzzg5pj99volbt84ohied.png/100px-100795.png` },
  { id: 'dream_prism',   name: '织梦棱镜球', desc: '棱镜球+暗夜拾光限定外观',          types: [],                      img: `${W}/c/c6/d2v5g81ljadb8ettmn7mq4xujmbeyba.png/100px-100876.png` },
]

// 道具消耗追踪配置 - 用于计数器页面
// 已去掉恢复瓶，属性球用暗星球图代表
export const TRACKABLE_ITEMS = [
  { key: 'normal_ball',   name: '普通咕噜球', img: `${W}/e/e1/suveiyd5wk5jgw2njxhbk01oar04bf4.png/100px-100002.png` },
  { key: 'advanced_ball', name: '高级咕噜球', img: `${W}/3/31/g8gdf44egqs1iohc6hf7lyaeprqyezx.png/100px-100003.png` },
  { key: 'king_ball',     name: '国王球',     img: `${W}/2/2e/jygbfxpdbup5weqy4zaqnyaw2fcfyrq.png/100px-100255.png` },
  { key: 'type_ball',     name: '属性球',     img: `${W}/5/5a/hif6470l7ojdexwm72t9brp0f0x3h4x.png/100px-Img_daodanqiu.png` },
  { key: 'catch_light',   name: '捕光球',     img: `${W}/3/3b/ifv37q0ul8zw20zwq95hbl15x79scc4.png/100px-100792.png` },
  { key: 'prism_ball',    name: '棱镜球',     img: `${W}/9/9b/kkwd244su5nzzg5pj99volbt84ohied.png/100px-100795.png` },
]

// 获取道具信息
export function getItemByKey(key) {
  return TRACKABLE_ITEMS.find(i => i.key === key) || CAPTURE_BALLS.find(b => b.id === key)
}

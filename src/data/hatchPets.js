// 孵蛋时间数据 - 来源：rocom.aoe.top 解包数据（PET_EGG_CONF.hatch_data）
// 仅包含进化链最低级 + 已实装 + 可在家园生蛋（PETBASE_CONF.pet_egg 字段存在）

// 孵蛋时间档位（秒）→ 中文标签
export const HATCH_TIERS = [
  { sec: 300,   label: "5 分钟" },
  { sec: 28800, label: "8 小时" },
  { sec: 43200, label: "12 小时" },
  { sec: 57600, label: "16 小时" },
  { sec: 72000, label: "20 小时" },
]

// 加速倍率
export const ACCEL = {
  WIND: 6,      // 风场加速
  WEEKEND: 2,   // 周末活动
}

export const HATCH_PETS = [
  {
    "id": 3001,
    "py": "miaomiao",
    "name": "喵喵",
    "baseName": "喵喵",
    "hatch": 43200,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3002,
    "py": "shuilanlan",
    "name": "水蓝蓝",
    "baseName": "水蓝蓝",
    "hatch": 43200,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3003,
    "py": "huohua",
    "name": "火花",
    "baseName": "火花",
    "hatch": 43200,
    "element": "fire",
    "hasImg": true
  },
  {
    "id": 3008,
    "py": "caotouya",
    "name": "草头鸭",
    "baseName": "草头鸭",
    "hatch": 28800,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3010,
    "py": "emoding",
    "name": "恶魔叮",
    "baseName": "恶魔叮",
    "hatch": 43200,
    "element": "flying",
    "hasImg": true
  },
  {
    "id": 3011,
    "py": "emolang",
    "name": "恶魔狼",
    "baseName": "恶魔狼",
    "hatch": 72000,
    "element": "evil",
    "hasImg": true
  },
  {
    "id": 3012,
    "py": "yajiji",
    "name": "鸭吉吉",
    "baseName": "鸭吉吉",
    "hatch": 57600,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3014,
    "py": "amiyate",
    "name": "阿米亚特",
    "baseName": "阿米亚特",
    "hatch": 57600,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3017,
    "py": "bengbengzhongzi",
    "name": "蹦蹦种子",
    "baseName": "蹦蹦种子",
    "hatch": 28800,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3020,
    "py": "dishu",
    "name": "地鼠",
    "baseName": "地鼠",
    "hatch": 28800,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3026,
    "py": "lvcaojingling",
    "name": "绿草精灵",
    "baseName": "绿草精灵",
    "hatch": 43200,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3029,
    "py": "qilicao",
    "name": "奇丽草",
    "baseName": "奇丽草",
    "hatch": 28800,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3034,
    "py": "pugongying",
    "name": "蒲公英",
    "baseName": "蒲公英",
    "hatch": 28800,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3036,
    "py": "yaji",
    "name": "鸭吉吉（鸭吉）",
    "baseName": "鸭吉吉",
    "hatch": 57600,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3038,
    "py": "xiaojiachong",
    "name": "小甲虫",
    "baseName": "小甲虫",
    "hatch": 57600,
    "element": "bug",
    "hasImg": true
  },
  {
    "id": 3040,
    "py": "diudiu",
    "name": "丢丢",
    "baseName": "丢丢",
    "hatch": 28800,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3043,
    "py": "yibeier",
    "name": "伊贝儿",
    "baseName": "伊贝儿",
    "hatch": 28800,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3045,
    "py": "youlingyang",
    "name": "锥尾羊",
    "baseName": "锥尾羊",
    "hatch": 43200,
    "element": "ghost",
    "hasImg": true
  },
  {
    "id": 3049,
    "py": "baifalanren",
    "name": "白发懒人",
    "baseName": "白发懒人",
    "hatch": 57600,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3050,
    "py": "jiyishi",
    "name": "记忆石",
    "baseName": "记忆石",
    "hatch": 72000,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3055,
    "py": "banbanke",
    "name": "板板壳",
    "baseName": "板板壳",
    "hatch": 43200,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3058,
    "py": "xiaomifeng",
    "name": "一窝蜂",
    "baseName": "一窝蜂",
    "hatch": 28800,
    "element": "bug",
    "hasImg": true
  },
  {
    "id": 3060,
    "py": "xiaoyoulinglian",
    "name": "小灵面",
    "baseName": "小灵面",
    "hatch": 28800,
    "element": "ghost",
    "hasImg": true
  },
  {
    "id": 3062,
    "py": "xiaodujiaoshou",
    "name": "小独角兽",
    "baseName": "小独角兽",
    "hatch": 57600,
    "element": "light",
    "hasImg": true
  },
  {
    "id": 3064,
    "py": "youlingshu",
    "name": "幽影树",
    "baseName": "幽影树",
    "hatch": 43200,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3065,
    "py": "huyouli",
    "name": "忽幽狸",
    "baseName": "忽幽狸",
    "hatch": 43200,
    "element": "poison",
    "hasImg": true
  },
  {
    "id": 3069,
    "py": "chuitouguan",
    "name": "锤头鹳",
    "baseName": "锤头鹳",
    "hatch": 72000,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3070,
    "py": "huzhuquan",
    "name": "护主犬",
    "baseName": "护主犬",
    "hatch": 28800,
    "element": "fire",
    "hasImg": true
  },
  {
    "id": 3072,
    "py": "gelanzhongzi",
    "name": "格兰种子",
    "baseName": "格兰种子",
    "hatch": 28800,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3075,
    "py": "linghu",
    "name": "灵狐",
    "baseName": "灵狐",
    "hatch": 57600,
    "element": "fire",
    "hasImg": true
  },
  {
    "id": 3078,
    "py": "liezuanniao",
    "name": "烈钻鸟",
    "baseName": "烈钻鸟",
    "hatch": 43200,
    "element": "fire",
    "hasImg": true
  },
  {
    "id": 3081,
    "py": "zhiyuhuowa",
    "name": "治愈兔",
    "baseName": "治愈兔",
    "hatch": 43200,
    "element": "fire",
    "hasImg": true
  },
  {
    "id": 3083,
    "py": "keaiyuan",
    "name": "可爱猿",
    "baseName": "可爱猿",
    "hatch": 57600,
    "element": "fire",
    "hasImg": true
  },
  {
    "id": 3086,
    "py": "keliji",
    "name": "可立鸡",
    "baseName": "可立鸡",
    "hatch": 43200,
    "element": "fire",
    "hasImg": true
  },
  {
    "id": 3090,
    "py": "huoweiwate",
    "name": "火尾瓦特",
    "baseName": "火尾瓦特",
    "hatch": 57600,
    "element": "fire",
    "hasImg": true
  },
  {
    "id": 3093,
    "py": "daixiaolu",
    "name": "呆小路",
    "baseName": "呆小路",
    "hatch": 57600,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3098,
    "py": "lversongshu",
    "name": "绿耳松鼠",
    "baseName": "绿耳松鼠",
    "hatch": 28800,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3103,
    "py": "xiaobushi",
    "name": "布是石",
    "baseName": "布是石",
    "hatch": 57600,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3106,
    "py": "huociyanxiyi",
    "name": "石肤蜥（火刺岩蜥）",
    "baseName": "石肤蜥",
    "hatch": 57600,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3109,
    "py": "maya",
    "name": "仪使者",
    "baseName": "仪使者",
    "hatch": 72000,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3112,
    "py": "xiaotiantian",
    "name": "甜田螺",
    "baseName": "甜田螺",
    "hatch": 28800,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3115,
    "py": "fuzhousha",
    "name": "风铃鲨",
    "baseName": "风铃鲨",
    "hatch": 43200,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3118,
    "py": "guodong",
    "name": "果冻",
    "baseName": "果冻",
    "hatch": 28800,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3119,
    "py": "feicuishuimu",
    "name": "翡翠水母",
    "baseName": "翡翠水母",
    "hatch": 28800,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3121,
    "py": "daermaodou",
    "name": "大耳帽兜",
    "baseName": "大耳帽兜",
    "hatch": 28800,
    "element": "ice",
    "hasImg": true
  },
  {
    "id": 3124,
    "py": "dingding",
    "name": "脆筒甜甜",
    "baseName": "脆筒甜甜",
    "hatch": 28800,
    "element": "ice",
    "hasImg": true
  },
  {
    "id": 3127,
    "py": "xiaoshijiu",
    "name": "小狮鹫",
    "baseName": "小狮鹫",
    "hatch": 43200,
    "element": "flying",
    "hasImg": true
  },
  {
    "id": 3130,
    "py": "yuanyanzhizhu",
    "name": "圆眼蜘蛛",
    "baseName": "圆眼蜘蛛",
    "hatch": 28800,
    "element": "bug",
    "hasImg": true
  },
  {
    "id": 3136,
    "py": "maomao",
    "name": "毛毛",
    "baseName": "毛毛",
    "hatch": 28800,
    "element": "bug",
    "hasImg": true
  },
  {
    "id": 3139,
    "py": "xiaocaochong",
    "name": "小草虫",
    "baseName": "小草虫",
    "hatch": 28800,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3142,
    "py": "xiaoye",
    "name": "小夜",
    "baseName": "小夜",
    "hatch": 57600,
    "element": "evil",
    "hasImg": true
  },
  {
    "id": 3145,
    "py": "xiaolinggu",
    "name": "小灵菇",
    "baseName": "小灵菇",
    "hatch": 28800,
    "element": "ghost",
    "hasImg": true
  },
  {
    "id": 3148,
    "py": "anyekulou",
    "name": "空空颅",
    "baseName": "空空颅",
    "hatch": 43200,
    "element": "ghost",
    "hasImg": true
  },
  {
    "id": 3151,
    "py": "duoduo",
    "name": "多多",
    "baseName": "多多",
    "hatch": 43200,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3154,
    "py": "qiuluo",
    "name": "裘洛",
    "baseName": "裘洛",
    "hatch": 43200,
    "element": "poison",
    "hasImg": true
  },
  {
    "id": 3161,
    "py": "xiaoxiaoyutu",
    "name": "春团",
    "baseName": "春团",
    "hatch": 28800,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3165,
    "py": "fudishou",
    "name": "伏地兽",
    "baseName": "伏地兽",
    "hatch": 57600,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3170,
    "py": "xiaoshitou",
    "name": "石石",
    "baseName": "石石",
    "hatch": 72000,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3172,
    "py": "xuedouding",
    "name": "雪豆丁",
    "baseName": "雪豆丁",
    "hatch": 57600,
    "element": "ice",
    "hasImg": true
  },
  {
    "id": 3175,
    "py": "kakayumao",
    "name": "咔咔羽毛",
    "baseName": "咔咔羽毛",
    "hatch": 28800,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3178,
    "py": "judulangzhu",
    "name": "矮脚爬爬",
    "baseName": "矮脚爬爬",
    "hatch": 28800,
    "element": "bug",
    "hasImg": true
  },
  {
    "id": 3183,
    "py": "guiyankungchong",
    "name": "瑰眼仔",
    "baseName": "瑰眼仔",
    "hatch": 28800,
    "element": "bug",
    "hasImg": false
  },
  {
    "id": 3188,
    "py": "late",
    "name": "拉特",
    "baseName": "拉特",
    "hatch": 28800,
    "element": "electric",
    "hasImg": true
  },
  {
    "id": 3190,
    "py": "dianmiemie",
    "name": "电咩咩",
    "baseName": "电咩咩",
    "hatch": 72000,
    "element": "electric",
    "hasImg": true
  },
  {
    "id": 3193,
    "py": "xiaoxingguang",
    "name": "小星光",
    "baseName": "小星光",
    "hatch": 57600,
    "element": "electric",
    "hasImg": true
  },
  {
    "id": 3195,
    "py": "shandianhuan",
    "name": "闪电环",
    "baseName": "闪电环",
    "hatch": 28800,
    "element": "electric",
    "hasImg": true
  },
  {
    "id": 3198,
    "py": "fenfenxing",
    "name": "粉粉星",
    "baseName": "粉粉星",
    "hatch": 28800,
    "element": "electric",
    "hasImg": true
  },
  {
    "id": 3200,
    "py": "jixiefangfang",
    "name": "机械方方",
    "baseName": "机械方方",
    "hatch": 43200,
    "element": "mechanical",
    "hasImg": true
  },
  {
    "id": 3203,
    "py": "beise",
    "name": "贝瑟",
    "baseName": "贝瑟",
    "hatch": 57600,
    "element": "fire",
    "hasImg": true
  },
  {
    "id": 3206,
    "py": "duoxi",
    "name": "多西",
    "baseName": "多西",
    "hatch": 28800,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3209,
    "py": "xiaoyilong",
    "name": "小翼龙",
    "baseName": "小翼龙",
    "hatch": 72000,
    "element": "dragon",
    "hasImg": true
  },
  {
    "id": 3211,
    "py": "yileilong",
    "name": "伊雷龙",
    "baseName": "伊雷龙",
    "hatch": 72000,
    "element": "dragon",
    "hasImg": true
  },
  {
    "id": 3215,
    "py": "haibaozhanshi",
    "name": "海豹战士",
    "baseName": "海豹战士",
    "hatch": 72000,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3217,
    "py": "jianfeimao",
    "name": "呼拉猫",
    "baseName": "呼拉猫",
    "hatch": 72000,
    "element": "fighting",
    "hasImg": true
  },
  {
    "id": 3225,
    "py": "guzhongshe",
    "name": "古钟蛇",
    "baseName": "古钟蛇",
    "hatch": 43200,
    "element": "poison",
    "hasImg": true
  },
  {
    "id": 3227,
    "py": "juhuali",
    "name": "菊花梨",
    "baseName": "菊花梨",
    "hatch": 28800,
    "element": "cute",
    "hasImg": true
  },
  {
    "id": 3234,
    "py": "qianxianmuou",
    "name": "牵线木偶",
    "baseName": "牵线木偶",
    "hatch": 28800,
    "element": "psychic",
    "hasImg": false
  },
  {
    "id": 3236,
    "py": "chaonengqiuqiu",
    "name": "超能球球",
    "baseName": "超能球球",
    "hatch": 57600,
    "element": "cute",
    "hasImg": false
  },
  {
    "id": 3237,
    "py": "xiaosongmao",
    "name": "小怂猫",
    "baseName": "小怂猫",
    "hatch": 43200,
    "element": "fighting",
    "hasImg": true
  },
  {
    "id": 3239,
    "py": "kukugu",
    "name": "哭哭菇",
    "baseName": "哭哭菇",
    "hatch": 28800,
    "element": "psychic",
    "hasImg": true
  },
  {
    "id": 3250,
    "py": "xiaoyu",
    "name": "小鹬",
    "baseName": "小鹬",
    "hatch": 28800,
    "element": "flying",
    "hasImg": true
  },
  {
    "id": 3255,
    "py": "benboshu",
    "name": "奔波鼠",
    "baseName": "奔波鼠",
    "hatch": 57600,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3257,
    "py": "bulusi",
    "name": "布鲁斯",
    "baseName": "布鲁斯",
    "hatch": 43200,
    "element": "ice",
    "hasImg": true
  },
  {
    "id": 3262,
    "py": "huhuzhu",
    "name": "呼呼猪",
    "baseName": "呼呼猪",
    "hatch": 57600,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3264,
    "py": "xieefangchui",
    "name": "卡波",
    "baseName": "卡波",
    "hatch": 28800,
    "element": "evil",
    "hasImg": false
  },
  {
    "id": 3266,
    "py": "danxiaomanyu",
    "name": "胆小鳗鱼",
    "baseName": "胆小鳗鱼",
    "hatch": 57600,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3268,
    "py": "datougulong",
    "name": "大头骨龙",
    "baseName": "大头骨龙",
    "hatch": 72000,
    "element": "dragon",
    "hasImg": true
  },
  {
    "id": 3276,
    "py": "lvyiniao",
    "name": "绿翼鸟",
    "baseName": "绿翼鸟",
    "hatch": 28800,
    "element": "flying",
    "hasImg": true
  },
  {
    "id": 3279,
    "py": "xuerongniao_chun",
    "name": "雪绒鸟（春）",
    "baseName": "雪绒鸟",
    "hatch": 28800,
    "element": "flying",
    "hasImg": true
  },
  {
    "id": 3280,
    "py": "xuerongniao_xia",
    "name": "雪绒鸟（夏）",
    "baseName": "雪绒鸟",
    "hatch": 28800,
    "element": "flying",
    "hasImg": true
  },
  {
    "id": 3281,
    "py": "xuerongniao_qiu",
    "name": "雪绒鸟（秋）",
    "baseName": "雪绒鸟",
    "hatch": 28800,
    "element": "flying",
    "hasImg": true
  },
  {
    "id": 3289,
    "py": "diudiu_shamo",
    "name": "丢丢（沙漠）",
    "baseName": "丢丢",
    "hatch": 28800,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3290,
    "py": "diudiu_xueshan",
    "name": "丢丢（雪山）",
    "baseName": "丢丢",
    "hatch": 28800,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3297,
    "py": "bengbengzhongzi_caiyuqiu",
    "name": "蹦蹦种子（彩雨球）",
    "baseName": "蹦蹦种子",
    "hatch": 43200,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3298,
    "py": "bengbengzhongzi_duanmaoqiu",
    "name": "蹦蹦种子（短毛球）",
    "baseName": "蹦蹦种子",
    "hatch": 43200,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3299,
    "py": "bengbengzhongzi_xiangyaqiu",
    "name": "蹦蹦种子（象牙球）",
    "baseName": "蹦蹦种子",
    "hatch": 43200,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3307,
    "py": "kuangjingchong",
    "name": "矿晶虫",
    "baseName": "矿晶虫",
    "hatch": 43200,
    "element": "light",
    "hasImg": true
  },
  {
    "id": 3315,
    "py": "xiaoshulan",
    "name": "小鼠獭",
    "baseName": "小鼠獭",
    "hatch": 57600,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3319,
    "py": "fenxingzai",
    "name": "粉星仔",
    "baseName": "粉星仔",
    "hatch": 57600,
    "element": "psychic",
    "hasImg": true
  },
  {
    "id": 3330,
    "py": "haikuichong",
    "name": "海盔虫",
    "baseName": "海盔虫",
    "hatch": 57600,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3333,
    "py": "xuewawa",
    "name": "雪娃娃",
    "baseName": "雪娃娃",
    "hatch": 43200,
    "element": "ice",
    "hasImg": true
  },
  {
    "id": 3344,
    "py": "huaguitianer",
    "name": "乖乖鹄",
    "baseName": "乖乖鹄",
    "hatch": 43200,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3357,
    "py": "diandongchangjinglu",
    "name": "电动长颈鹿",
    "baseName": "电动长颈鹿",
    "hatch": 57600,
    "element": "electric",
    "hasImg": true
  },
  {
    "id": 3367,
    "py": "duudbao",
    "name": "嘟嘟煲",
    "baseName": "嘟嘟煲",
    "hatch": 72000,
    "element": "poison",
    "hasImg": true
  },
  {
    "id": 3369,
    "py": "youxingguang",
    "name": "幽星光",
    "baseName": "幽星光",
    "hatch": 28800,
    "element": "psychic",
    "hasImg": true
  },
  {
    "id": 3373,
    "py": "doudou",
    "name": "逗逗",
    "baseName": "逗逗",
    "hatch": 57600,
    "element": "cute",
    "hasImg": true
  },
  {
    "id": 3376,
    "py": "xuanyanchong",
    "name": "旋叶虫",
    "baseName": "旋叶虫",
    "hatch": 28800,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3378,
    "py": "guguding",
    "name": "菇菇丁",
    "baseName": "菇菇丁",
    "hatch": 57600,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3381,
    "py": "shenlanjing",
    "name": "深蓝鲸",
    "baseName": "深蓝鲸",
    "hatch": 72000,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3382,
    "py": "shungdengyu",
    "name": "双灯鱼",
    "baseName": "双灯鱼",
    "hatch": 57600,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3384,
    "py": "doudingyu",
    "name": "豆丁鱼",
    "baseName": "豆丁鱼",
    "hatch": 28800,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3398,
    "py": "xingchenchong",
    "name": "星尘虫",
    "baseName": "星尘虫",
    "hatch": 28800,
    "element": "bug",
    "hasImg": true
  },
  {
    "id": 3406,
    "py": "tita",
    "name": "缇塔",
    "baseName": "缇塔",
    "hatch": 57600,
    "element": "mechanical",
    "hasImg": true
  },
  {
    "id": 3408,
    "py": "chilunxiaozi",
    "name": "齿轮小子",
    "baseName": "齿轮小子",
    "hatch": 57600,
    "element": "mechanical",
    "hasImg": false
  },
  {
    "id": 3410,
    "py": "quanzhagn1",
    "name": "权杖-Ⅱ",
    "baseName": "权杖-Ⅱ",
    "hatch": 57600,
    "element": "mechanical",
    "hasImg": true
  },
  {
    "id": 3416,
    "py": "gedouxiaowu",
    "name": "格斗小五",
    "baseName": "格斗小五",
    "hatch": 72000,
    "element": "fighting",
    "hasImg": false
  },
  {
    "id": 3417,
    "py": "gedouxiaoliu",
    "name": "格斗小六",
    "baseName": "格斗小六",
    "hatch": 72000,
    "element": "fighting",
    "hasImg": true
  },
  {
    "id": 3418,
    "py": "gedouxiaoba",
    "name": "格斗小八",
    "baseName": "格斗小八",
    "hatch": 72000,
    "element": "fighting",
    "hasImg": true
  },
  {
    "id": 3419,
    "py": "lihaixiaoluo",
    "name": "厉毒小萝",
    "baseName": "厉毒小萝",
    "hatch": 43200,
    "element": "poison",
    "hasImg": true
  },
  {
    "id": 3430,
    "py": "haizhizhi_bilanshanhu",
    "name": "海枝枝（碧蓝珊瑚）",
    "baseName": "海枝枝",
    "hatch": 43200,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3431,
    "py": "haizhizhi_xinghuangbaihe",
    "name": "海枝枝（杏黄百合）",
    "baseName": "海枝枝",
    "hatch": 43200,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3432,
    "py": "haizhizhi_yanghongshading",
    "name": "海枝枝（洋红沙丁）",
    "baseName": "海枝枝",
    "hatch": 43200,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3433,
    "py": "haizhizhi_cuilvlunbu",
    "name": "海枝枝（翠绿轮布）",
    "baseName": "海枝枝",
    "hatch": 43200,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3434,
    "py": "xiaodianqie",
    "name": "小电企鹅",
    "baseName": "小电企鹅",
    "hatch": 57600,
    "element": "ice",
    "hasImg": true
  },
  {
    "id": 3436,
    "py": "chaizhachong",
    "name": "柴渣虫",
    "baseName": "柴渣虫",
    "hatch": 28800,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3438,
    "py": "menhyou",
    "name": "梦游",
    "baseName": "梦游",
    "hatch": 28800,
    "element": "ghost",
    "hasImg": true
  },
  {
    "id": 3440,
    "py": "mengyou_pink",
    "name": "梦游（粉色睡衣）",
    "baseName": "梦游",
    "hatch": 28800,
    "element": "light",
    "hasImg": false
  },
  {
    "id": 3442,
    "py": "xiaoxingguang_yueguang",
    "name": "小星光（月光）",
    "baseName": "小星光",
    "hatch": 57600,
    "element": "light",
    "hasImg": true
  },
  {
    "id": 3444,
    "py": "pipaniao",
    "name": "噼啪鸟",
    "baseName": "噼啪鸟",
    "hatch": 72000,
    "element": "electric",
    "hasImg": true
  },
  {
    "id": 3452,
    "py": "yajiji_jijiya",
    "name": "鸭吉吉（急急鸭）",
    "baseName": "鸭吉吉",
    "hatch": 57600,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3453,
    "py": "dengyidengya",
    "name": "鸭吉吉（等一等鸭）",
    "baseName": "鸭吉吉",
    "hatch": 57600,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3454,
    "py": "dishu_xushui",
    "name": "地鼠（蓄水）",
    "baseName": "地鼠",
    "hatch": 28800,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3457,
    "py": "yueyaxuexiong",
    "name": "月牙雪熊",
    "baseName": "月牙雪熊",
    "hatch": 72000,
    "element": "ice",
    "hasImg": true
  },
  {
    "id": 3466,
    "py": "xingyunlvzhe",
    "name": "星云旅者",
    "baseName": "星云旅者",
    "hatch": 72000,
    "element": "flying",
    "hasImg": false
  },
  {
    "id": 3467,
    "py": "xiaoshijiu_gaoshan",
    "name": "小狮鹫（高山）",
    "baseName": "小狮鹫",
    "hatch": 43200,
    "element": "flying",
    "hasImg": true
  },
  {
    "id": 3473,
    "py": "buguake",
    "name": "布瓜蝌",
    "baseName": "布瓜蝌",
    "hatch": 28800,
    "element": "psychic",
    "hasImg": true
  },
  {
    "id": 3484,
    "py": "luoxuanpapa",
    "name": "螺旋帕帕",
    "baseName": "螺旋帕帕",
    "hatch": 28800,
    "element": "flying",
    "hasImg": true
  },
  {
    "id": 3490,
    "py": "xiniou",
    "name": "吸泥鸥",
    "baseName": "吸泥鸥",
    "hatch": 43200,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3492,
    "py": "shouhualei",
    "name": "兽花蕾",
    "baseName": "兽花蕾",
    "hatch": 43200,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3495,
    "py": "yajiji_ranleya",
    "name": "鸭吉吉（燃了鸭）",
    "baseName": "鸭吉吉",
    "hatch": 57600,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3496,
    "py": "xuanyechong_yidi",
    "name": "旋叶虫（异地）",
    "baseName": "旋叶虫",
    "hatch": 28800,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3499,
    "py": "gongpingge",
    "name": "公平鸽",
    "baseName": "公平鸽",
    "hatch": 43200,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3500,
    "py": "shifuxi_yidi",
    "name": "石肤蜥",
    "baseName": "石肤蜥",
    "hatch": 300,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3506,
    "py": "huayuanman",
    "name": "花怨鳗",
    "baseName": "花怨鳗",
    "hatch": 28800,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3508,
    "py": "boboluo",
    "name": "波波螺",
    "baseName": "波波螺",
    "hatch": 57600,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3511,
    "py": "boboluo_yidi",
    "name": "波波螺（异地）",
    "baseName": "波波螺",
    "hatch": 57600,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3521,
    "py": "lilayao",
    "name": "里拉鳐",
    "baseName": "里拉鳐",
    "hatch": 72000,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3529,
    "py": "haoeryu",
    "name": "号儿鱼",
    "baseName": "号儿鱼",
    "hatch": 43200,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3533,
    "py": "xuerongniao_dong",
    "name": "雪绒鸟（冬）",
    "baseName": "雪绒鸟",
    "hatch": 28800,
    "element": "flying",
    "hasImg": true
  },
  {
    "id": 3534,
    "py": "banban",
    "name": "斑斑",
    "baseName": "斑斑",
    "hatch": 28800,
    "element": "flying",
    "hasImg": true
  },
  {
    "id": 3536,
    "py": "wuda",
    "name": "乌达",
    "baseName": "乌达",
    "hatch": 43200,
    "element": "fire",
    "hasImg": true
  },
  {
    "id": 3539,
    "py": "wuda_yidi",
    "name": "乌达（异地）",
    "baseName": "乌达",
    "hatch": 43200,
    "element": "ice",
    "hasImg": true
  },
  {
    "id": 3543,
    "py": "duoling",
    "name": "多灵",
    "baseName": "多灵",
    "hatch": 57600,
    "element": "ghost",
    "hasImg": false
  },
  {
    "id": 3545,
    "py": "shengjianshicong",
    "name": "圣剑侍从",
    "baseName": "圣剑侍从",
    "hatch": 72000,
    "element": "mechanical",
    "hasImg": true
  },
  {
    "id": 3550,
    "py": "qiqi",
    "name": "棋棋",
    "baseName": "棋棋",
    "hatch": 43200,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3555,
    "py": "qiqi_yidi",
    "name": "棋棋（异地）",
    "baseName": "棋棋",
    "hatch": 43200,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3565,
    "py": "lishu",
    "name": "栗鼠",
    "baseName": "栗鼠",
    "hatch": 28800,
    "element": "poison",
    "hasImg": false
  },
  {
    "id": 3568,
    "py": "xiaoheimao",
    "name": "小黑猫",
    "baseName": "小黑猫",
    "hatch": 28800,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3577,
    "py": "moyoushi",
    "name": "墨鱿士",
    "baseName": "墨鱿士",
    "hatch": 28800,
    "element": "ghost",
    "hasImg": true
  },
  {
    "id": 3582,
    "py": "ciluntuo_yidi",
    "name": "刺轮砣（异地）",
    "baseName": "刺轮砣",
    "hatch": 28800,
    "element": "poison",
    "hasImg": true
  },
  {
    "id": 3584,
    "py": "ciluntuo",
    "name": "刺轮砣",
    "baseName": "刺轮砣",
    "hatch": 28800,
    "element": "poison",
    "hasImg": true
  },
  {
    "id": 3594,
    "py": "songzai",
    "name": "松仔",
    "baseName": "松仔",
    "hatch": 43200,
    "element": "grass",
    "hasImg": true
  },
  {
    "id": 3597,
    "py": "shuidishe",
    "name": "水滴蛇",
    "baseName": "水滴蛇",
    "hatch": 43200,
    "element": "water",
    "hasImg": true
  },
  {
    "id": 3600,
    "py": "xiaoyongshi",
    "name": "小勇狮",
    "baseName": "小勇狮",
    "hatch": 43200,
    "element": "fire",
    "hasImg": true
  },
  {
    "id": 3603,
    "py": "maotouxiaozhu",
    "name": "毛头小蛛",
    "baseName": "毛头小蛛",
    "hatch": 28800,
    "element": "ground",
    "hasImg": true
  },
  {
    "id": 3606,
    "py": "huajingling",
    "name": "画精灵",
    "baseName": "画精灵",
    "hatch": 28800,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3610,
    "py": "shumochong",
    "name": "书魔虫",
    "baseName": "书魔虫",
    "hatch": 28800,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3614,
    "py": "shiguangwengweng",
    "name": "嗜光嗡嗡",
    "baseName": "嗜光嗡嗡",
    "hatch": 28800,
    "element": "light",
    "hasImg": true
  },
  {
    "id": 3616,
    "py": "buguzhong",
    "name": "不咕钟",
    "baseName": "不咕钟",
    "hatch": 28800,
    "element": "mechanical",
    "hasImg": true
  },
  {
    "id": 3618,
    "py": "xiaoxiangguai",
    "name": "小箱怪",
    "baseName": "小箱怪",
    "hatch": 43200,
    "element": "mechanical",
    "hasImg": true
  },
  {
    "id": 3621,
    "py": "guzhongshe_yidi",
    "name": "古钟蛇（异地）",
    "baseName": "古钟蛇",
    "hatch": 43200,
    "element": "poison",
    "hasImg": true
  },
  {
    "id": 3704,
    "py": "youyou",
    "name": "优优",
    "baseName": "优优",
    "hatch": 28800,
    "element": "light",
    "hasImg": true
  },
  {
    "id": 3742,
    "py": "yajiji_qilaiya",
    "name": "鸭吉吉（起来鸭）",
    "baseName": "鸭吉吉",
    "hatch": 57600,
    "element": "normal",
    "hasImg": true
  },
  {
    "id": 3744,
    "py": "huohongwei",
    "name": "火红尾",
    "baseName": "火红尾",
    "hatch": 57600,
    "element": "fire",
    "hasImg": true
  }
]

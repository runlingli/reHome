import type { Category, Condition, Item, User, Conversation } from './types'

export const CATEGORIES: Category[] = [
  { id: 'all',       en: 'All',        cn: '全部', glyph: '✦' },
  { id: 'furniture', en: 'Furniture',  cn: '家具', glyph: '▦' },
  { id: 'kitchen',   en: 'Kitchen',    cn: '厨房', glyph: '◍' },
  { id: 'appliance', en: 'Appliances', cn: '家电', glyph: '◉' },
  { id: 'bike',      en: 'Bikes',      cn: '出行', glyph: '◷' },
  { id: 'clothing',  en: 'Clothing',   cn: '衣物', glyph: '◇' },
  { id: 'household', en: 'Household',  cn: '日杂', glyph: '○' },
]

export const CONDITIONS: Record<string, Condition> = {
  new:       { en: 'Like new',  cn: '近全新',   factor: 0.78 },
  excellent: { en: 'Excellent', cn: '九成新',   factor: 0.62 },
  good:      { en: 'Good',      cn: '七八成新', factor: 0.45 },
  fair:      { en: 'Used',      cn: '使用过',   factor: 0.28 },
}

const UNS = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`

export const ITEMS: Item[] = [
  {
    id: 'i1', title: 'IKEA Malm desk · white', titleCn: 'IKEA Malm 书桌',
    cat: 'furniture', condition: 'excellent', est: 149, age: '14 mo', pickup: 'Mid-June',
    desc: 'Compact desk, fits a 27" monitor. Two screw holes near the back from a monitor mount. Pickup only — 4th-floor walk-up.',
    descCn: '紧凑书桌，可放下 27" 显示器。后部有两个显示器挂架的螺丝孔。需自取。',
    seller: 'u_emma', location: 'Davis, CA',
    photoColors: ['#F4EFE6', '#D9CFB8'], photoLabel: 'desk · white', saved: 18, posted: '2d',
    imageUrl: UNS('1554078140-01f553ad4d40'),
  },
  {
    id: 'i2', title: 'Cuisinart 4-cup coffee maker', titleCn: '美膳雅 4 杯咖啡机',
    cat: 'appliance', condition: 'good', est: 38, age: '2 yr', pickup: 'June 18 – 22',
    desc: 'Works perfectly, just descaled. Comes with a permanent gold filter, no paper needed.',
    descCn: '功能完好，刚刚除过水垢。附赠永久金色滤网。',
    seller: 'u_jin', location: 'Berkeley, CA',
    photoColors: ['#E8DFD0', '#B8A687'], photoLabel: 'coffee maker', saved: 7, posted: '5h',
    imageUrl: UNS('1608354580875-30bd4168b351'),
  },
  {
    id: 'i3', title: 'Trek FX 2 hybrid bike', titleCn: 'Trek FX 2 城市自行车',
    cat: 'bike', condition: 'good', est: 420, age: '3 yr', pickup: 'After June 20',
    desc: 'Size M. Recently tuned at Davis Bike Church. Includes lock and front light. One small scratch on the top tube.',
    descCn: '中码。刚刚在 Davis Bike Church 调试过。含锁与前灯。上管有一处小划痕。',
    seller: 'u_dani', location: 'Sacramento, CA',
    photoColors: ['#EDE4D2', '#90785A'], photoLabel: 'hybrid bike', saved: 41, posted: '1d',
    imageUrl: UNS('1759047990878-b5a1e95f81fd'),
  },
  {
    id: 'i4', title: 'Twin XL mattress + frame', titleCn: 'Twin XL 床垫+床架',
    cat: 'furniture', condition: 'good', est: 220, age: '10 mo', pickup: 'June 25 – 30',
    desc: 'Memory-foam, used with mattress protector since day one. Frame is metal, easy to disassemble.',
    descCn: '记忆棉床垫，全程套保护套使用。金属床架，易拆装。',
    seller: 'u_emma', location: 'Davis, CA',
    photoColors: ['#F1E9DC', '#C9B89A'], photoLabel: 'mattress', saved: 12, posted: '3d',
    imageUrl: UNS('1647376036543-f9f543601a1d'),
  },
  {
    id: 'i5', title: 'Dyson V8 vacuum', titleCn: '戴森 V8 吸尘器',
    cat: 'appliance', condition: 'excellent', est: 280, age: '1 yr', pickup: 'Flexible',
    desc: 'Two attachments included. Battery still holds full charge — about 35 min of runtime.',
    descCn: '附两个吸头。电池续航良好，约 35 分钟。',
    seller: 'u_jin', location: 'Berkeley, CA',
    photoColors: ['#E5E1D7', '#A09583'], photoLabel: 'vacuum', saved: 24, posted: '6h',
    imageUrl: UNS('1708529589690-00e2bbb7f327'),
  },
  {
    id: 'i6', title: 'Lodge cast-iron skillet · 10"', titleCn: 'Lodge 铸铁锅 10"',
    cat: 'kitchen', condition: 'good', est: 30, age: '2 yr', pickup: 'Mid-June',
    desc: 'Well-seasoned. Becomes nonstick with a thin coat of oil.',
    descCn: '已养锅。薄油即不粘。',
    seller: 'u_lucas', location: 'Woodland, CA',
    photoColors: ['#E2DBCB', '#5A4A38'], photoLabel: 'skillet', saved: 5, posted: '4d',
    imageUrl: UNS('1603038124597-2c5c207edf47'),
  },
  {
    id: 'i7', title: 'Uniqlo down jacket · M', titleCn: '优衣库羽绒服 · 中码',
    cat: 'clothing', condition: 'excellent', est: 70, age: '8 mo', pickup: 'Mid-June',
    desc: 'Black, ultra-light. Worn one season. No stains.',
    descCn: '黑色轻型款。穿过一个冬天。无污渍。',
    seller: 'u_dani', location: 'Sacramento, CA',
    photoColors: ['#EDE4D2', '#3A3530'], photoLabel: 'down jacket', saved: 9, posted: '7h',
    imageUrl: UNS('1706765779494-2705542ebe74'),
  },
  {
    id: 'i8', title: 'Air fryer · Cosori 5.8 qt', titleCn: '空气炸锅 · Cosori 5.8 qt',
    cat: 'appliance', condition: 'excellent', est: 90, age: '1 yr', pickup: 'June 20 – 25',
    desc: 'Cleaned thoroughly. Comes with original manual.',
    descCn: '已彻底清洁。附原说明书。',
    seller: 'u_lucas', location: 'Woodland, CA',
    photoColors: ['#E8E2D2', '#444036'], photoLabel: 'air fryer', saved: 31, posted: '11h',
    imageUrl: UNS('1695089028114-ce28248f0ab9'),
  },
  {
    id: 'i9', title: 'Bookshelf, 3-tier · oak', titleCn: '三层书架 · 橡木',
    cat: 'furniture', condition: 'fair', est: 80, age: '4 yr', pickup: 'Before June 25',
    desc: 'Solid. Some water rings on the top shelf — not visible when loaded.',
    descCn: '结实。顶层有水印，放书后看不见。',
    seller: 'u_emma', location: 'Davis, CA',
    photoColors: ['#E9DFC9', '#8A6A45'], photoLabel: 'bookshelf', saved: 4, posted: '6d',
    imageUrl: UNS('1593430980369-68efc5a5eb34'),
  },
  {
    id: 'i10', title: 'Ceramic dinner set · 4 pcs', titleCn: '陶瓷餐具四件套',
    cat: 'kitchen', condition: 'excellent', est: 45, age: '1 yr', pickup: 'Mid-June',
    desc: "Crate & Barrel. Plates, bowls, and mugs — service for two.",
    descCn: 'Crate & Barrel 出品。盘碗杯各两件，二人份。',
    seller: 'u_jin', location: 'Berkeley, CA',
    photoColors: ['#F4EDDD', '#A89876'], photoLabel: 'dinnerware', saved: 11, posted: '2d',
    imageUrl: UNS('1610128361323-6e941c97f023'),
  },
  {
    id: 'i11', title: 'Standing lamp · brass', titleCn: '黄铜落地灯',
    cat: 'household', condition: 'good', est: 55, age: '2 yr', pickup: 'Flexible',
    desc: 'Warm 3000K bulb included.',
    descCn: '附赠 3000K 暖光灯泡。',
    seller: 'u_dani', location: 'Sacramento, CA',
    photoColors: ['#EFE7D6', '#9A7D4A'], photoLabel: 'lamp', saved: 6, posted: '8h',
    imageUrl: UNS('1673939859210-23d8444237ff'),
  },
  {
    id: 'i12', title: 'Office chair · Steelcase Series 1', titleCn: 'Steelcase 办公椅',
    cat: 'furniture', condition: 'excellent', est: 380, age: '18 mo', pickup: 'Late June',
    desc: 'Adjustable arms, lumbar, headrest. Smoke-free apartment.',
    descCn: '可调扶手、腰托、头枕。无烟环境。',
    seller: 'u_lucas', location: 'Woodland, CA',
    photoColors: ['#E5DECC', '#383330'], photoLabel: 'office chair', saved: 47, posted: '12h',
    imageUrl: UNS('1688578735427-994ecdea3ea4'),
  },
  {
    id: 'i13', title: 'Flexispot E2 standing desk', titleCn: 'Flexispot E2 电动升降桌',
    cat: 'furniture', condition: 'excellent', est: 360, age: '2 yr', pickup: 'June 18 – 22',
    desc: 'Electric height-adjustable, 48"×24". Two memory presets. Minor cable-management marks on the desktop.',
    descCn: '电动升降，48"×24"。双记忆预设。桌面有轻微走线痕。',
    seller: 'u_jin', location: 'Berkeley, CA',
    photoColors: ['#EAE4D8', '#7A6854'], photoLabel: 'standing desk', saved: 22, posted: '1d',
    imageUrl: UNS('1622131278701-eb225474ffd2'),
  },
  {
    id: 'i14', title: 'Zojirushi rice cooker · 5.5 cup', titleCn: '象印电饭煲 5.5 杯',
    cat: 'appliance', condition: 'excellent', est: 160, age: '1 yr', pickup: 'Mid-June',
    desc: 'Fuzzy-logic model with timer and keep-warm. Comes with spatula and measuring cup.',
    descCn: '模糊逻辑款，带定时和保温功能。附饭勺和量杯。',
    seller: 'u_emma', location: 'Davis, CA',
    photoColors: ['#F0EAE0', '#B09070'], photoLabel: 'rice cooker', saved: 33, posted: '4h',
    imageUrl: UNS('1536304993881-ff6e9eefa2a6'),
  },
  {
    id: 'i15', title: 'Area rug · 5×8 ft, beige-grey', titleCn: '地毯 5×8 ft 米灰色',
    cat: 'household', condition: 'good', est: 90, age: '2 yr', pickup: 'June 25 – 30',
    desc: 'Low pile, vacuumed and spot-cleaned. Pet-free, smoke-free home.',
    descCn: '低绒毛地毯，已吸尘去污。无宠物、无烟环境。',
    seller: 'u_dani', location: 'Sacramento, CA',
    photoColors: ['#EDE5D5', '#BFB09A'], photoLabel: 'area rug', saved: 14, posted: '3d',
    imageUrl: UNS('1534889156217-d643df14f14a'),
  },
  {
    id: 'i16', title: 'Canada Goose parka · W-M, black', titleCn: '加拿大鹅 女M 黑色羽绒服',
    cat: 'clothing', condition: 'excellent', est: 650, age: '3 yr', pickup: 'Flexible',
    desc: "Kensington style. Still very warm — no thinning. Dry-cleaned last season.",
    descCn: 'Kensington 款。保暖如初，上个冬天干洗过。',
    seller: 'u_lucas', location: 'Woodland, CA',
    photoColors: ['#E5E0D8', '#1F1F1F'], photoLabel: 'parka', saved: 19, posted: '10h',
    imageUrl: UNS('1612096536102-93f503aa2419'),
  },
]

export const USERS: Record<string, User> = {
  u_emma: {
    name: 'Emma L.', handle: '@emma.l', school: 'UC Davis', schoolCn: '加州大学戴维斯分校',
    eduVerified: true, rating: 4.9, deals: 12,
    bio: 'Graduating in June. Moving back to Singapore — everything in my apartment must go.',
    bioCn: '六月毕业，搬回新加坡，整间公寓都要清掉。',
    avatarColor: '#C8553D', avatarInitials: 'EL',
  },
  u_jin: {
    name: 'Jin C.', handle: '@jin.chen', school: 'UC Berkeley', schoolCn: '加州大学伯克利分校',
    eduVerified: true, rating: 5.0, deals: 7,
    bio: 'PhD wrap-up. Apartment cleanout — items barely used.',
    bioCn: '博士收尾，清空公寓，物品使用极少。',
    avatarColor: '#5C7A5E', avatarInitials: 'JC',
  },
  u_dani: {
    name: 'Dani O.', handle: '@dani.o', school: 'Sacramento State', schoolCn: '萨克拉门托州立大学',
    eduVerified: true, rating: 4.8, deals: 19,
    bio: 'Lab moving to SF. Take it all please.',
    bioCn: '实验室搬到旧金山，全要清掉。',
    avatarColor: '#4F46E5', avatarInitials: 'DO',
  },
  u_lucas: {
    name: 'Lucas M.', handle: '@lucasm', school: 'UC Santa Cruz', schoolCn: '加州大学圣克鲁兹分校',
    eduVerified: true, rating: 4.7, deals: 5,
    bio: 'Co-op finishing. Moving to SF mid-June.',
    bioCn: '合作项目结束，六月中搬去旧金山。',
    avatarColor: '#1F1F1F', avatarInitials: 'LM',
  },
  me_student: {
    name: 'You', handle: '@you.edu', school: 'UC Davis', schoolCn: '加州大学戴维斯分校',
    eduVerified: true, localVerified: false, rating: 5.0, deals: 3,
    bio: "Class of '26. Hand-me-downs from my last sublet.",
    bioCn: '26 届，正在清掉上一段租房遗留的物品。',
    avatarColor: '#C8553D', avatarInitials: 'Yo',
  },
  me_local: {
    name: 'You', handle: '@you.local', school: '—', schoolCn: '—',
    eduVerified: false, localVerified: true, rating: 4.9, deals: 14,
    bio: 'Davis resident, picking up the basics for my new apt.',
    bioCn: '住在 Davis，正给新公寓配齐家居基础。',
    avatarColor: '#2A6FDB', avatarInitials: 'Yo',
  },
}

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', with: 'u_emma', item: 'i1', unread: 2,
    last: 'I can swing by Saturday at 2?', lastCn: '我周六两点过来取行吗？', time: '11:42',
    messages: [
      { from: 'them', text: 'Hey! The desk still available?', cn: '你好！桌子还在吗？', time: 'Mon 10:21' },
      { from: 'me',   text: 'Yes — pickup window is June 18 to 22.', cn: '在的，6/18 至 6/22 之间可来取。', time: 'Mon 10:34' },
      { from: 'them', text: 'I can swing by Saturday at 2?', cn: '我周六两点过来取行吗？', time: 'Mon 11:42' },
    ],
  },
  {
    id: 'c2', with: 'u_dani', item: 'i3', unread: 0,
    last: 'Cool — see you Sunday.', lastCn: '好的，周日见。', time: 'Yesterday',
    messages: [
      { from: 'me',   text: 'Bike still around?', cn: '自行车还在吗？', time: 'Sun 14:02' },
      { from: 'them', text: 'Yep. After June 20 works for pickup.', cn: '在。6/20 后可取。', time: 'Sun 14:18' },
      { from: 'me',   text: 'Sunday the 25th, around noon?', cn: '25 号周日中午行吗？', time: 'Sun 14:40' },
      { from: 'them', text: 'Cool — see you Sunday.', cn: '好的，周日见。', time: 'Sun 14:41' },
    ],
  },
  {
    id: 'c3', with: 'u_jin', item: 'i5', unread: 0,
    last: 'Sent the address — 4-min walk from downtown Davis.', lastCn: '地址发你了，距 Davis 市中心步行 4 分钟。', time: 'Tue',
    messages: [
      { from: 'them', text: 'Sent the address — 4-min walk from downtown Davis.', cn: '地址发你了，距 Davis 市中心步行 4 分钟。', time: 'Tue 18:50' },
    ],
  },
  {
    id: 'c4', with: 'u_lucas', item: 'i12', unread: 1,
    last: 'I can split it into two trips if needed.', lastCn: '需要的话我可以分两次搬。', time: 'Tue',
    messages: [
      { from: 'them', text: 'I can split it into two trips if needed.', cn: '需要的话我可以分两次搬。', time: 'Tue 09:00' },
    ],
  },
  {
    id: 'c5', with: 'u_dani', item: 'i7', unread: 0, completed: true,
    last: 'Handoff complete!', lastCn: '交接完成！', time: 'Mon',
    messages: [
      { from: 'me',   text: 'Just grabbed it — thanks so much!', cn: '拿到了，太感谢！', time: 'Mon 14:10' },
      { from: 'them', text: 'Enjoy! Hope it keeps you warm next season.', cn: '好好用！希望下个冬天还能派上用场。', time: 'Mon 14:12' },
    ],
  },
]

export const LOCATIONS = ['Davis, CA', 'Berkeley, CA', 'Sacramento, CA', 'Woodland, CA']
export const WHEN_OPTIONS = ['Mid-June', 'June 18 – 22', 'June 20 – 25', 'June 25 – 30', 'Late June', 'Flexible']

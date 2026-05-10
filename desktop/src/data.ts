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
    cat: 'furniture', condition: 'excellent', est: 149, age: '14 mo', pickup: 'Mid-May',
    desc: 'Compact desk, fits a 27" monitor. Two screw holes near the back from a monitor mount. Pickup only — 4th-floor walk-up.',
    descCn: '紧凑书桌，可放下 27" 显示器。后部有两个显示器挂架的螺丝孔。需自取。',
    seller: 'u_emma', location: 'Allston, MA',
    photoColors: ['#F4EFE6', '#D9CFB8'], photoLabel: 'desk · white', saved: 18, posted: '2d',
    imageUrl: UNS('1518455027359-f3f8164ba6bd'),
  },
  {
    id: 'i2', title: 'Cuisinart 4-cup coffee maker', titleCn: '美膳雅 4 杯咖啡机',
    cat: 'appliance', condition: 'good', est: 38, age: '2 yr', pickup: 'May 18 – 22',
    desc: 'Works perfectly, just descaled. Comes with a permanent gold filter, no paper needed.',
    descCn: '功能完好，刚刚除过水垢。附赠永久金色滤网。',
    seller: 'u_jin', location: 'Cambridge, MA',
    photoColors: ['#E8DFD0', '#B8A687'], photoLabel: 'coffee maker', saved: 7, posted: '5h',
    imageUrl: UNS('1495474472287-4d71bcdd2085'),
  },
  {
    id: 'i3', title: 'Trek FX 2 hybrid bike', titleCn: 'Trek FX 2 城市自行车',
    cat: 'bike', condition: 'good', est: 420, age: '3 yr', pickup: 'After May 20',
    desc: 'Size M. Recently tuned at Cambridge Bicycle. Includes lock and front light. One small scratch on the top tube.',
    descCn: '中码。刚刚在 Cambridge Bicycle 调试过。含锁与前灯。上管有一处小划痕。',
    seller: 'u_dani', location: 'Somerville, MA',
    photoColors: ['#EDE4D2', '#90785A'], photoLabel: 'hybrid bike', saved: 41, posted: '1d',
    imageUrl: UNS('1558618666-fcd25c85cd64'),
  },
  {
    id: 'i4', title: 'Twin XL mattress + frame', titleCn: 'Twin XL 床垫+床架',
    cat: 'furniture', condition: 'good', est: 220, age: '10 mo', pickup: 'May 25 – 30',
    desc: 'Memory-foam, used with mattress protector since day one. Frame is metal, easy to disassemble.',
    descCn: '记忆棉床垫，全程套保护套使用。金属床架，易拆装。',
    seller: 'u_emma', location: 'Allston, MA',
    photoColors: ['#F1E9DC', '#C9B89A'], photoLabel: 'mattress', saved: 12, posted: '3d',
    imageUrl: UNS('1631049307264-da0ec9d70304'),
  },
  {
    id: 'i5', title: 'Dyson V8 vacuum', titleCn: '戴森 V8 吸尘器',
    cat: 'appliance', condition: 'excellent', est: 280, age: '1 yr', pickup: 'Flexible',
    desc: 'Two attachments included. Battery still holds full charge — about 35 min of runtime.',
    descCn: '附两个吸头。电池续航良好，约 35 分钟。',
    seller: 'u_jin', location: 'Cambridge, MA',
    photoColors: ['#E5E1D7', '#A09583'], photoLabel: 'vacuum', saved: 24, posted: '6h',
    imageUrl: UNS('1558317374-067fb5f30001'),
  },
  {
    id: 'i6', title: 'Lodge cast-iron skillet · 10"', titleCn: 'Lodge 铸铁锅 10"',
    cat: 'kitchen', condition: 'good', est: 30, age: '2 yr', pickup: 'Mid-May',
    desc: 'Well-seasoned. Becomes nonstick with a thin coat of oil.',
    descCn: '已养锅。薄油即不粘。',
    seller: 'u_lucas', location: 'Brookline, MA',
    photoColors: ['#E2DBCB', '#5A4A38'], photoLabel: 'skillet', saved: 5, posted: '4d',
    imageUrl: UNS('1574071318508-1cdbab80d002'),
  },
  {
    id: 'i7', title: 'Uniqlo down jacket · M', titleCn: '优衣库羽绒服 · 中码',
    cat: 'clothing', condition: 'excellent', est: 70, age: '8 mo', pickup: 'Mid-May',
    desc: 'Black, ultra-light. Worn one Boston winter. No stains.',
    descCn: '黑色轻型款。穿过一个波士顿冬天。无污渍。',
    seller: 'u_dani', location: 'Somerville, MA',
    photoColors: ['#EDE4D2', '#3A3530'], photoLabel: 'down jacket', saved: 9, posted: '7h',
    imageUrl: UNS('1551698618-1dfe5d97d256'),
  },
  {
    id: 'i8', title: 'Air fryer · Cosori 5.8 qt', titleCn: '空气炸锅 · Cosori 5.8 qt',
    cat: 'appliance', condition: 'excellent', est: 90, age: '1 yr', pickup: 'May 20 – 25',
    desc: 'Cleaned thoroughly. Comes with original manual.',
    descCn: '已彻底清洁。附原说明书。',
    seller: 'u_lucas', location: 'Brookline, MA',
    photoColors: ['#E8E2D2', '#444036'], photoLabel: 'air fryer', saved: 31, posted: '11h',
    imageUrl: UNS('1617791160536-598cf32026fb'),
  },
  {
    id: 'i9', title: 'Bookshelf, 3-tier · oak', titleCn: '三层书架 · 橡木',
    cat: 'furniture', condition: 'fair', est: 80, age: '4 yr', pickup: 'Before May 25',
    desc: 'Solid. Some water rings on the top shelf — not visible when loaded.',
    descCn: '结实。顶层有水印，放书后看不见。',
    seller: 'u_emma', location: 'Allston, MA',
    photoColors: ['#E9DFC9', '#8A6A45'], photoLabel: 'bookshelf', saved: 4, posted: '6d',
    imageUrl: UNS('1481627834876-b7833e8f5570'),
  },
  {
    id: 'i10', title: 'Ceramic dinner set · 4 pcs', titleCn: '陶瓷餐具四件套',
    cat: 'kitchen', condition: 'excellent', est: 45, age: '1 yr', pickup: 'Mid-May',
    desc: "Crate & Barrel. Plates, bowls, and mugs — service for two.",
    descCn: 'Crate & Barrel 出品。盘碗杯各两件，二人份。',
    seller: 'u_jin', location: 'Cambridge, MA',
    photoColors: ['#F4EDDD', '#A89876'], photoLabel: 'dinnerware', saved: 11, posted: '2d',
    imageUrl: UNS('1565193566173-7a0ee3dbe261'),
  },
  {
    id: 'i11', title: 'Standing lamp · brass', titleCn: '黄铜落地灯',
    cat: 'household', condition: 'good', est: 55, age: '2 yr', pickup: 'Flexible',
    desc: 'Warm 3000K bulb included.',
    descCn: '附赠 3000K 暖光灯泡。',
    seller: 'u_dani', location: 'Somerville, MA',
    photoColors: ['#EFE7D6', '#9A7D4A'], photoLabel: 'lamp', saved: 6, posted: '8h',
    imageUrl: UNS('1540932239986-30128078f3c5'),
  },
  {
    id: 'i12', title: 'Office chair · Steelcase Series 1', titleCn: 'Steelcase 办公椅',
    cat: 'furniture', condition: 'excellent', est: 380, age: '18 mo', pickup: 'Late May',
    desc: 'Adjustable arms, lumbar, headrest. Smoke-free apartment.',
    descCn: '可调扶手、腰托、头枕。无烟环境。',
    seller: 'u_lucas', location: 'Brookline, MA',
    photoColors: ['#E5DECC', '#383330'], photoLabel: 'office chair', saved: 47, posted: '12h',
    imageUrl: UNS('1541558088-fbbf7b5eba35'),
  },
]

export const USERS: Record<string, User> = {
  u_emma: {
    name: 'Emma L.', handle: '@emma.l', school: 'Boston University', schoolCn: '波士顿大学',
    eduVerified: true, rating: 4.9, deals: 12,
    bio: 'Graduating in May. Moving back to Singapore — everything in my apartment must go.',
    bioCn: '五月毕业，搬回新加坡，整间公寓都要清掉。',
    avatarColor: '#C8553D', avatarInitials: 'EL',
  },
  u_jin: {
    name: 'Jin C.', handle: '@jin.chen', school: 'Harvard University', schoolCn: '哈佛大学',
    eduVerified: true, rating: 5.0, deals: 7,
    bio: 'PhD wrap-up. Apartment cleanout — items barely used.',
    bioCn: '博士收尾，清空公寓，物品使用极少。',
    avatarColor: '#5C7A5E', avatarInitials: 'JC',
  },
  u_dani: {
    name: 'Dani O.', handle: '@dani.o', school: 'MIT', schoolCn: '麻省理工',
    eduVerified: true, rating: 4.8, deals: 19,
    bio: 'Lab moving to SF. Take it all please.',
    bioCn: '实验室搬到旧金山，全要清掉。',
    avatarColor: '#4F46E5', avatarInitials: 'DO',
  },
  u_lucas: {
    name: 'Lucas M.', handle: '@lucasm', school: 'Northeastern', schoolCn: '东北大学',
    eduVerified: true, rating: 4.7, deals: 5,
    bio: 'Co-op finishing. Moving to NYC mid-June.',
    bioCn: '合作项目结束，六月中搬去纽约。',
    avatarColor: '#1F1F1F', avatarInitials: 'LM',
  },
  me_student: {
    name: 'You', handle: '@you.edu', school: 'Boston University', schoolCn: '波士顿大学',
    eduVerified: true, localVerified: false, rating: 5.0, deals: 3,
    bio: "Class of '26. Hand-me-downs from my last sublet.",
    bioCn: '26 届，正在清掉上一段租房遗留的物品。',
    avatarColor: '#C8553D', avatarInitials: 'Yo',
  },
  me_local: {
    name: 'You', handle: '@you.local', school: '—', schoolCn: '—',
    eduVerified: false, localVerified: true, rating: 4.9, deals: 14,
    bio: 'Allston resident, picking up the basics for my new apt.',
    bioCn: '住在 Allston，正给新公寓配齐家居基础。',
    avatarColor: '#2A6FDB', avatarInitials: 'Yo',
  },
}

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', with: 'u_emma', item: 'i1', unread: 2,
    last: 'I can swing by Saturday at 2?', lastCn: '我周六两点过来取行吗？', time: '11:42',
    messages: [
      { from: 'them', text: 'Hey! The desk still available?', cn: '你好！桌子还在吗？', time: 'Mon 10:21' },
      { from: 'me',   text: 'Yes — pickup window is May 18 to 22.', cn: '在的，5/18 至 5/22 之间可来取。', time: 'Mon 10:34' },
      { from: 'them', text: 'I can swing by Saturday at 2?', cn: '我周六两点过来取行吗？', time: 'Mon 11:42' },
    ],
  },
  {
    id: 'c2', with: 'u_dani', item: 'i3', unread: 0,
    last: 'Cool — see you Sunday.', lastCn: '好的，周日见。', time: 'Yesterday',
    messages: [
      { from: 'me',   text: 'Bike still around?', cn: '自行车还在吗？', time: 'Sun 14:02' },
      { from: 'them', text: 'Yep. After May 20 works for pickup.', cn: '在。5/20 后可取。', time: 'Sun 14:18' },
      { from: 'me',   text: 'Sunday the 25th, around noon?', cn: '25 号周日中午行吗？', time: 'Sun 14:40' },
      { from: 'them', text: 'Cool — see you Sunday.', cn: '好的，周日见。', time: 'Sun 14:41' },
    ],
  },
  {
    id: 'c3', with: 'u_jin', item: 'i5', unread: 0,
    last: 'Sent the address — 4-min walk from Harvard Sq.', lastCn: '地址发你了，距哈佛广场步行 4 分钟。', time: 'Tue',
    messages: [
      { from: 'them', text: 'Sent the address — 4-min walk from Harvard Sq.', cn: '地址发你了，距哈佛广场步行 4 分钟。', time: 'Tue 18:50' },
    ],
  },
  {
    id: 'c4', with: 'u_lucas', item: 'i12', unread: 1,
    last: 'I can split it into two trips if needed.', lastCn: '需要的话我可以分两次搬。', time: 'Tue',
    messages: [
      { from: 'them', text: 'I can split it into two trips if needed.', cn: '需要的话我可以分两次搬。', time: 'Tue 09:00' },
    ],
  },
]

export const LOCATIONS = ['Allston, MA', 'Cambridge, MA', 'Somerville, MA', 'Brookline, MA']
export const WHEN_OPTIONS = ['Mid-May', 'May 18 – 22', 'May 20 – 25', 'May 25 – 30', 'Late May', 'Flexible']

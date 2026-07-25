// ===== Types =====
export type ProductStatus = 'draft' | 'listed' | 'unlisted'

export interface SpecRow {
  key: string
  color: string
  size: string
  sku: string
  priceUsd: number
  inventory: number
  image: string
}

export interface CatalogProduct {
  id: string
  itemId: string
  spu: string
  // 展示字段（运营编辑，与产品库分离）
  title: string
  description: string
  material: string // 材质（前台详情展示）
  mainImage: string
  gallery: string[]
  tags: ('Best Seller' | 'New')[]
  detailCopy: string
  // 展示价 / 展示库存（商品级，供卡片与列表展示；可与 spec 汇总并存）
  displayPriceUsd?: number
  displayInventory?: number
  // 同步自产品库（只读，规格可删不可增）
  categoryPath: [string, string, string]
  shipFrom: string
  priceUsd: number
  inventory: number
  specs: SpecRow[]
  shipping: ShipRow[] // 各目的国运费与时效（运营可调）
  status: ProductStatus
  syncedAt: string
  listedAt?: string // 上架时间，供前端 Newest 排序
}

export interface ShipRow {
  country: string
  cost: number
  method: string
  processing: string
  delivery: string
  note: string
}

export type SlotType = 'banner' | 'feed'
export type SlotStatus = 'active' | 'inactive'
/** feed 资源位 item = product；banner 轮播项 = banner_slide */
export type SlotItemType = 'product' | 'banner_slide'
/** Banner 每张图下方的内容形态：纯图 / 图+链接 / feed 流 */
export type BannerContentType = 'image' | 'image_link' | 'product_feed'

export interface SlotItem {
  key: string
  type: SlotItemType
  // feed：单个商品
  productId?: string
  // banner：每张轮播图必有图
  adImage?: string
  // banner：该图下方内容形态
  bannerContent?: BannerContentType
  // image_link：跳转链接
  adLink?: string
  // product_feed：该图下挂的商品流
  productIds?: string[]
  // product_feed：集合页配置（独立于资源位 ID，用于曝光归因）
  collectionKey?: string
  collectionTitle?: string
  collectionSubtitle?: string
  collectionHeaderImage?: string
  sort: number
}

export interface ResourceSlot {
  id: string
  name: string // 内部展示名称
  type: SlotType
  // feed 流面向客户的展示字段
  title?: string
  description?: string
  // feed 资源位也可配置落地集合页（「更多」进入）
  collectionKey?: string
  collectionTitle?: string
  collectionSubtitle?: string
  collectionHeaderImage?: string
  status: SlotStatus
  position: string
  homeOrder?: number // 首页排序权重，数值越小越靠前；仅生效中的资源位参与首页编排
  items: SlotItem[]
  createdAt: string
  updatedAt?: string
  operator?: string
}

let collectionKeySeq = 1
export function genCollectionKey() {
  return `col_${String(collectionKeySeq++).padStart(4, '0')}`
}

export interface CategoryNode {
  id: string
  nameCn: string
  nameEn: string
  icon?: string // L1 分类图标（图片 URL / DataURL；历史数据可能仍为图标名）
  children?: CategoryNode[]
}

// ===== Mock Products =====
const SPEC_COLORS = ['Ivory', 'Ink', 'Coral', 'Sage', 'Navy', 'Rose']
const SPEC_SIZES = ['XS', 'S', 'M', 'L', 'XL']
const SHIP_FROM = ['US', 'CN', 'UK', 'DE', 'CA', 'FR', 'AU']
const CAT_PATHS: [string, string, string][] = [
  ['Apparel & Accessories', "Women's Clothing", 'Dresses'],
  ['Apparel & Accessories', "Men's Clothing", 'Shirts'],
  ['Consumer Electronics', 'Audio', 'Headphones'],
  ['Home & Garden', 'Kitchen', 'Cookware'],
  ['Beauty & Personal Care', 'Skincare', 'Serums'],
  ['Sports & Outdoors', 'Fitness', 'Yoga'],
  ['Pet Supplies', 'Dogs', 'Toys'],
  ['Apparel & Accessories', 'Accessories', 'Bags'],
]

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f2f5"/><text x="100" y="105" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#bfbfbf">商品图</text></svg>'
)

function buildSpecs(seed: number): SpecRow[] {
  const out: SpecRow[] = []
  let n = 0
  for (const color of SPEC_COLORS.slice(0, 3 + (seed % 3))) {
    for (const size of SPEC_SIZES.slice(0, 3 + (seed % 2))) {
      n++
      out.push({
        key: `spec-${seed}-${n}`,
        color,
        size,
        sku: `SKU-BPS-${String(seed).padStart(3, '0')}-${String(n).padStart(2, '0')}`,
        priceUsd: Number((10 + ((seed * 7 + n * 3) % 60)).toFixed(2)),
        inventory: 200 + ((seed * 31 + n * 17) % 3000),
        image: PLACEHOLDER,
      })
    }
  }
  return out
}

const SHIP_COUNTRIES = ['US', 'CN', 'UK', 'DE', 'CA', 'FR', 'AU']
const SHIP_METHODS = ['Standard', 'Express', 'Economy', 'Standard', 'Express', 'Standard', 'Economy']

function buildShipping(seed: number): ShipRow[] {
  return SHIP_COUNTRIES.map((c, i) => ({
    country: c,
    cost: Number((2 + (i + seed) * 1.3).toFixed(2)),
    method: SHIP_METHODS[i],
    processing: `${1 + (i % 3)}-${2 + (i % 3)} business days`,
    delivery: `${5 + (i % 4)}-${9 + (i % 4)} business days`,
    note: i % 2 === 0 ? 'Tax included' : 'Remote areas may incur surcharge',
  }))
}

export const PRODUCTS: CatalogProduct[] = Array.from({ length: 28 }, (_, i) => {
  const seed = i + 1
  const cat = CAT_PATHS[i % CAT_PATHS.length]
  const isDraft = i % 5 === 0
  const isUnlisted = i % 7 === 0
  return {
    id: `P${String(seed).padStart(3, '0')}`,
    itemId: `ITEM${String(10000 + seed)}`,
    spu: `SPU-BPS-${String(seed).padStart(5, '0')}`,
    title: isDraft ? `（待编辑）产品 ${seed}` : `Catalog 商品 ${seed} · ${cat[2]}`,
    description: isDraft
      ? '请编辑面向客户的展示描述。'
      : '面向客户展示的商品描述，由运营在商品库中独立编辑，与产品库字段互不覆盖。',
    material: ['Cotton', 'Polyester', 'ABS Plastic', 'Stainless Steel', 'Bamboo', 'Silicone'][seed % 6],
    mainImage: PLACEHOLDER,
    gallery: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    tags: i % 4 === 0 ? ['Best Seller'] : i % 5 === 1 ? ['New'] : [],
    detailCopy:
      '<p>富文本详情示例。运营在此编辑面向客户的图文内容。</p><p>支持段落、图片、列表等。</p>',
    displayPriceUsd: Number((9.9 + (seed * 2.3) % 60).toFixed(2)),
    displayInventory: 500 + (seed * 137) % 4000,
    categoryPath: cat,
    shipFrom: SHIP_FROM[i % SHIP_FROM.length],
    priceUsd: Number((9.9 + (seed * 2.3) % 60).toFixed(2)),
    inventory: 500 + (seed * 137) % 4000,
    specs: buildSpecs(seed),
    shipping: buildShipping(seed),
    status: isDraft ? 'draft' : isUnlisted ? 'unlisted' : 'listed',
    syncedAt: `2026-07-${String(10 + (seed % 12)).padStart(2, '0')} 10:30`,
    listedAt: isDraft ? undefined : `2026-07-${String(12 + (seed % 10)).padStart(2, '0')} 14:00`,
  }
})

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id)
}

// ===== Mock Resource Slots =====
export const SLOTS: ResourceSlot[] = [
  {
    id: 'S001',
    name: '首页轮播 Banner',
    type: 'banner',
    status: 'active',
    position: '首页 · 顶部 Banner 区',
    homeOrder: 1,
    items: [
      {
        key: 'i1',
        type: 'banner_slide',
        adImage: PLACEHOLDER,
        bannerContent: 'image_link',
        adLink: '/products',
        sort: 0,
      },
      {
        key: 'i2',
        type: 'banner_slide',
        adImage: PLACEHOLDER,
        bannerContent: 'product_feed',
        productIds: PRODUCTS.slice(0, 6).map((p) => p.id),
        collectionKey: 'col_0001',
        collectionTitle: '夏季上新全球热卖',
        collectionSubtitle: '精选当季爆款，限时直降',
        collectionHeaderImage: PLACEHOLDER,
        sort: 1,
      },
      {
        key: 'i3',
        type: 'banner_slide',
        adImage: PLACEHOLDER,
        bannerContent: 'image',
        sort: 2,
      },
    ],
    createdAt: '2026-07-15 09:00',
    updatedAt: '2026-07-19 16:20',
    operator: '张运营',
  },
  {
    id: 'S002',
    name: 'Trending Now',
    type: 'feed',
    title: 'Trending Now',
    description: '本周热搜好物，运营精选的高转化商品',
    collectionKey: 'col_0002',
    collectionTitle: 'Trending Now',
    collectionSubtitle: '本周热搜好物合集',
    collectionHeaderImage: PLACEHOLDER,
    status: 'active',
    position: '首页 · Feed 区',
    homeOrder: 2,
    items: PRODUCTS.slice(0, 10).map((p, i) => ({
      key: `i${i}`,
      type: 'product' as const,
      productId: p.id,
      sort: i,
    })),
    createdAt: '2026-07-15 09:10',
    updatedAt: '2026-07-20 10:05',
    operator: '李配置',
  },
  {
    id: 'S003',
    name: 'New Arrivals',
    type: 'feed',
    title: 'New Arrivals',
    description: '最新上架商品，抢先体验当季新品',
    collectionKey: 'col_0003',
    collectionTitle: 'New Arrivals',
    collectionSubtitle: '最新上架商品合集',
    collectionHeaderImage: PLACEHOLDER,
    status: 'active',
    position: '首页 · Feed 区',
    homeOrder: 3,
    items: PRODUCTS.slice(10, 20).map((p, i) => ({
      key: `i${i}`,
      type: 'product' as const,
      productId: p.id,
      sort: i,
    })),
    createdAt: '2026-07-16 14:00',
    updatedAt: '2026-07-21 09:30',
    operator: '张运营',
  },
  {
    id: 'S004',
    name: 'Deals',
    type: 'feed',
    title: 'Deals',
    description: '限时特价专场，手慢无',
    collectionKey: 'col_0004',
    collectionTitle: 'Deals',
    collectionSubtitle: '限时特价专场',
    collectionHeaderImage: PLACEHOLDER,
    status: 'inactive',
    position: '首页 · Feed 区',
    homeOrder: 4,
    items: [],
    createdAt: '2026-07-17 11:00',
    updatedAt: '2026-07-18 15:00',
    operator: '王业务',
  },
]

export function getSlot(id: string) {
  return SLOTS.find((s) => s.id === id)
}

// mock 已占用 col_0001 ~ col_0004
collectionKeySeq = 5

export function updateSlotStatus(id: string, status: SlotStatus, operator = '当前运营') {
  const slot = SLOTS.find((s) => s.id === id)
  if (!slot) return
  slot.status = status
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  slot.updatedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  slot.operator = operator
}

let slotSeq = SLOTS.length + 1

export function insertSlot(name: string): ResourceSlot {
  const id = `S${String(slotSeq++).padStart(3, '0')}`
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const createdAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  const slot: ResourceSlot = {
    id,
    name,
    type: 'feed',
    title: '',
    description: '',
    collectionKey: genCollectionKey(),
    collectionTitle: '',
    collectionSubtitle: '',
    collectionHeaderImage: '',
    status: 'active',
    position: '',
    items: [],
    createdAt,
  }
  SLOTS.push(slot)
  return slot
}

// ===== Mock Categories =====
export const CATEGORY_TREE: CategoryNode[] = [
  {
    id: 'apparel',
    nameCn: '服饰与配饰',
    nameEn: 'Apparel & Accessories',
    icon: 'ShopOutlined',
    children: [
      {
        id: 'womens',
        nameCn: '女装',
        nameEn: "Women's Clothing",
        children: [
          { id: 'dresses', nameCn: '连衣裙', nameEn: 'Dresses' },
          { id: 'tops', nameCn: '上装', nameEn: 'Tops' },
          { id: 'bottoms', nameCn: '下装', nameEn: 'Bottoms' },
        ],
      },
      {
        id: 'mens',
        nameCn: '男装',
        nameEn: "Men's Clothing",
        children: [
          { id: 'shirts', nameCn: '衬衫', nameEn: 'Shirts' },
          { id: 'pants', nameCn: '裤装', nameEn: 'Pants' },
        ],
      },
      {
        id: 'accessories',
        nameCn: '配饰',
        nameEn: 'Accessories',
        children: [
          { id: 'bags', nameCn: '箱包', nameEn: 'Bags' },
          { id: 'hats', nameCn: '帽子', nameEn: 'Hats' },
        ],
      },
    ],
  },
  {
    id: 'electronics',
    nameCn: '消费电子',
    nameEn: 'Consumer Electronics',
    icon: 'LaptopOutlined',
    children: [
      {
        id: 'audio',
        nameCn: '音频',
        nameEn: 'Audio',
        children: [
          { id: 'headphones', nameCn: '耳机', nameEn: 'Headphones' },
          { id: 'speakers', nameCn: '音箱', nameEn: 'Speakers' },
        ],
      },
      {
        id: 'computers',
        nameCn: '电脑',
        nameEn: 'Computers',
        children: [
          { id: 'laptops', nameCn: '笔记本', nameEn: 'Laptops' },
          { id: 'accessories2', nameCn: '配件', nameEn: 'Accessories' },
        ],
      },
    ],
  },
  {
    id: 'home',
    nameCn: '家居与园艺',
    nameEn: 'Home & Garden',
    icon: 'HomeOutlined',
    children: [
      {
        id: 'kitchen',
        nameCn: '厨房用品',
        nameEn: 'Kitchen',
        children: [
          { id: 'cookware', nameCn: '炊具', nameEn: 'Cookware' },
          { id: 'tools', nameCn: '工具', nameEn: 'Tools' },
        ],
      },
    ],
  },
  {
    id: 'beauty',
    nameCn: '美妆个护',
    nameEn: 'Beauty & Personal Care',
    icon: 'SkinOutlined',
    children: [
      {
        id: 'skincare',
        nameCn: '护肤',
        nameEn: 'Skincare',
        children: [
          { id: 'serums', nameCn: '精华', nameEn: 'Serums' },
          { id: 'cleansers', nameCn: '洁面', nameEn: 'Cleansers' },
        ],
      },
    ],
  },
  {
    id: 'sports',
    nameCn: '运动户外',
    nameEn: 'Sports & Outdoors',
    icon: 'TrophyOutlined',
    children: [
      {
        id: 'fitness',
        nameCn: '健身',
        nameEn: 'Fitness',
        children: [{ id: 'yoga', nameCn: '瑜伽', nameEn: 'Yoga' }],
      },
    ],
  },
  {
    id: 'pets',
    nameCn: '宠物用品',
    nameEn: 'Pet Supplies',
    icon: 'GithubOutlined',
    children: [
      {
        id: 'dogs',
        nameCn: '犬类',
        nameEn: 'Dogs',
        children: [{ id: 'dog-toys', nameCn: '玩具', nameEn: 'Toys' }],
      },
    ],
  },
]


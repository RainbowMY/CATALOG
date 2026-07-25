import type { BannerItem, Product, ResourceSlot, ShippingQuote } from '../types'
import { flattenCategories } from './categories'
import { PRODUCT_IMAGES, assignProductImages, pickProductImage } from '../assets/products'
import { BANNER_IMAGES } from '../assets/banners'

const ADJECTIVES = [
  'Luxe', 'Minimal', 'Urban', 'Soft', 'Bold', 'Daily', 'Prime', 'Nordic',
  'Cloud', 'Aura', 'Nova', 'Pulse', 'Craft', 'Velvet', 'Orbit', 'Ridge',
  'Swift', 'Calm', 'Bright', 'Harbor', 'Summit', 'Cedar', 'Pixel', 'Glide',
]

const NOUNS = [
  'Tee', 'Jacket', 'Sneaker', 'Bottle', 'Lamp', 'Serum', 'Watch', 'Bag',
  'Mug', 'Case', 'Mat', 'Speaker', 'Dress', 'Boot', 'Band', 'Light',
  'Hoodie', 'Pan', 'Toy', 'Cap', 'Chair', 'Brush', 'Kit', 'Tray',
]

const MATERIALS = [
  'Organic cotton blend',
  'Recycled polyester',
  'Aerospace aluminum',
  'Ceramic glaze finish',
  'Medical-grade silicone',
  'Tempered glass + ABS',
  'Breathable mesh fabric',
  'Plant-based leather',
]

function buildDetailHtml(seed: number, image: string, gallery: string[]): string {
  const imgA = gallery[0] ?? image
  const imgB = gallery[1] ?? image
  const imgC = gallery[2] ?? image
  const stories = [
    {
      lead: 'Crafted for everyday performance, this product balances clean aesthetics with practical durability. Merchants can list it quickly with ready-to-use media and clear variant pricing.',
      mid: 'This rich-text block simulates content uploaded from the admin CMS editor. Product storytelling, care instructions, and packaging notes can sit together in one flowing article.',
      end: 'Longer editor content remains readable inside a fixed viewport with vertical scrolling, without pushing the rest of the product workspace off-screen.',
    },
    {
      lead: 'A conversion-focused catalog item with premium presentation. Soft packaging, stable margins, and flexible ship-from options make it easy to scale across stores.',
      mid: 'Merchants often paste multi-paragraph brand stories and FAQ blocks into this field. Inline images from the same catalog media set appear naturally inside the article flow.',
      end: 'Continue scrolling to review the full narrative while Add to Store stays accessible in the right panel.',
    },
  ]
  const s = stories[seed % stories.length]
  return `
<p>${s.lead}</p>
<img src="${imgA}" alt="Product detail inline media" />
<p><strong>Story</strong><br/>${s.mid}</p>
<img src="${imgB}" alt="Product lifestyle inline media" />
<p><strong>Key selling points</strong></p>
<ul>
  <li>Merchant-ready imagery and concise English copy for faster store listing</li>
  <li>Transparent inventory snapshot to support sourcing decisions</li>
  <li>Variant pricing stays aligned with selected color and size combinations</li>
  <li>Soft packaging options and flexible ship-from hubs for multi-market campaigns</li>
</ul>
<img src="${imgC}" alt="Product packaging inline media" />
<p><strong>Care &amp; handling</strong><br/>Wipe gently with a soft cloth. Avoid prolonged exposure to direct sunlight. Keep away from open flame and corrosive liquids.</p>
<p><strong>Package contents</strong><br/>1 × Main product unit, 1 × Quick start card, optional accessory kit depending on production batch.</p>
<p>${s.end}</p>
`.trim()
}

const SHIP_FROM = ['US', 'CN', 'UK', 'DE', 'CA', 'FR', 'AU'] as const
const COLORS = ['Ivory', 'Ink', 'Coral', 'Sage', 'Sand', 'Navy', 'Rose', 'Olive'] as const
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] as const

/** Detail page option chips (demo · long lists for scroll) */
export const DETAIL_COLORS = Array.from({ length: 30 }, (_, i) => `Color ${String(i + 1).padStart(2, '0')}`)
export const DETAIL_SIZES = Array.from({ length: 30 }, (_, i) => {
  if (i < 7) return (['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] as const)[i]
  return `SZ-${String(i + 1).padStart(2, '0')}`
})

const categoryRows = flattenCategories()

function seeded(n: number) {
  const x = Math.sin(n * 999) * 10000
  return x - Math.floor(x)
}

function buildProducts(count = 120): Product[] {
  const mainImages = assignProductImages(count)
  // Ensure every local image appears at least once as a primary image
  void PRODUCT_IMAGES

  const list: Product[] = []
  for (let i = 1; i <= count; i++) {
    const cat = categoryRows[(i - 1) % categoryRows.length]
    const adj = ADJECTIVES[i % ADJECTIVES.length]
    const noun = NOUNS[(i * 3) % NOUNS.length]
    const shortTitle = `${adj} ${noun} ${String(i).padStart(3, '0')}`
    const longTitle = `${shortTitle} Premium Catalog Ready Listing for Global Dropshipping Merchants`
    const title = i % 3 === 0 ? longTitle : shortTitle
    const priceUsd = Number((3 + seeded(i) * 68).toFixed(2))
    const inventory = Math.floor(20 + seeded(i + 3) * 4200)
    const shipFrom = SHIP_FROM[i % SHIP_FROM.length]
    const image = mainImages[i - 1]
    const gallery = [
      image,
      pickProductImage(i + 3),
      pickProductImage(i + 7),
      pickProductImage(i + 11),
    ]
    const isBestSeller = i % 3 === 0
    const isNew = !isBestSeller && i % 4 === 0
    const shortDesc = `A clean, conversion-ready ${noun.toLowerCase()} for dropshipping catalogs.`
    const longDesc = `A clean, conversion-ready ${noun.toLowerCase()} designed for dropshipping catalogs with merchant-ready imagery, clear variant pricing, and sourcing-friendly inventory notes for store listing reviews.`
    const description = i % 2 === 0 ? longDesc : shortDesc
    const day = ((i * 3) % 28) + 1
    const month = ((i * 2) % 12) + 1
    const listedAt = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T10:00:00Z`

    const colorCount = 5 + (i % 4) // 5–8 colors (list cards)
    const sizeCount = 5 + (i % 3) // 5–7 sizes
    const colors = COLORS.slice(0, colorCount)
    const sizes = SIZES.slice(0, sizeCount)

    const variants = colors.flatMap((color, ci) =>
      sizes.map((size, si) => {
        const vid = `${i}-${ci}-${si}`
        return {
          id: `var-${vid}`,
          label: `${color} / ${size}`,
          color,
          size,
          sku: `BPS-${String(i).padStart(4, '0')}-${color.slice(0, 3).toUpperCase()}-${size}`,
          priceUsd: Number((priceUsd + ci * 1.2 + si * 0.55).toFixed(2)),
          inventory: Math.max(0, inventory - ci * 40 - si * 15),
          image: pickProductImage(i + ci * 2 + si),
        }
      }),
    )

    const resourceTags: string[] = []
    if (i % 5 === 1) resourceTags.push('trending-now')
    if (i % 5 === 2) resourceTags.push('new-arrivals')
    if (i % 5 === 3) resourceTags.push('flash-deals')
    if (i % 5 === 4) resourceTags.push('global-hits')
    if (i % 5 === 0) resourceTags.push('sport-specials')
    if (i % 11 === 0) resourceTags.push('trending-now')
    if (i % 13 === 0) resourceTags.push('new-arrivals')

    const collectionIds: string[] = []
    if (i % 6 === 0) collectionIds.push('banner-summer')
    if (i % 7 === 0) collectionIds.push('banner-home')
    if (i % 8 === 0) collectionIds.push('banner-tech')
    if (i % 9 === 0) collectionIds.push('banner-beauty')

    list.push({
      id: `p-${i}`,
      title,
      spu: `SPU-BPS-${String(i).padStart(5, '0')}`,
      description,
      material: MATERIALS[i % MATERIALS.length],
      isNew,
      isBestSeller,
      categoryPath: cat.path,
      shipFrom,
      priceUsd,
      inventory,
      listedAt,
      image,
      gallery,
      variants,
      resourceTags,
      collectionIds,
      detailCopy: buildDetailHtml(i, image, gallery),
    })
  }
  return list
}

export const products: Product[] = buildProducts(120)

export const banners: BannerItem[] = [
  {
    id: 'b1',
    title: 'Summer Essentials',
    subtitle: 'Curated bestsellers ready to list this week',
    cta: 'Shop Collection',
    collectionId: 'banner-summer',
    image: BANNER_IMAGES[0],
    tone: 'crimson',
  },
  {
    id: 'b2',
    title: 'Home Refresh',
    subtitle: 'Decor and kitchen picks with clean margins',
    cta: 'Explore Picks',
    collectionId: 'banner-home',
    image: BANNER_IMAGES[1],
    tone: 'ink',
  },
  {
    id: 'b3',
    title: 'Tech Everyday',
    subtitle: 'Gadgets merchants keep reordering',
    cta: 'View Products',
    collectionId: 'banner-tech',
    image: BANNER_IMAGES[2],
    tone: 'slate',
  },
  {
    id: 'b4',
    title: 'Beauty Edit',
    subtitle: 'Skincare and tools with strong list rates',
    cta: 'Open Edit',
    collectionId: 'banner-beauty',
    image: BANNER_IMAGES[3],
    tone: 'rose',
  },
]

export const resourceSlots: ResourceSlot[] = [
  {
    id: 'trending-now',
    title: 'Trending Now',
    subtitle: 'What merchants are browsing most',
    productIds: products.filter((p) => p.resourceTags.includes('trending-now')).slice(0, 10).map((p) => p.id),
  },
  {
    id: 'new-arrivals',
    title: 'New Arrivals',
    subtitle: 'Fresh listings from the latest uploads',
    productIds: products.filter((p) => p.resourceTags.includes('new-arrivals')).slice(0, 10).map((p) => p.id),
  },
  {
    id: 'flash-deals',
    title: 'Flash Deals',
    subtitle: 'Limited-time value for quick wins',
    productIds: products.filter((p) => p.resourceTags.includes('flash-deals')).slice(0, 10).map((p) => p.id),
  },
  {
    id: 'global-hits',
    title: 'Global Hits',
    subtitle: 'Cross-border favorites by ship-from hubs',
    productIds: products.filter((p) => p.resourceTags.includes('global-hits')).slice(0, 10).map((p) => p.id),
  },
  {
    id: 'sport-specials',
    title: 'Sport Specials',
    subtitle: 'Active lifestyle products in focus',
    productIds: products.filter((p) => p.resourceTags.includes('sport-specials')).slice(0, 10).map((p) => p.id),
  },
]

export const collectionMeta: Record<string, { title: string; subtitle: string }> = {
  'banner-summer': {
    title: 'Summer Essentials',
    subtitle: 'Banner landing · curated summer-ready catalog set',
  },
  'banner-home': {
    title: 'Home Refresh',
    subtitle: 'Banner landing · home and kitchen assortment',
  },
  'banner-tech': {
    title: 'Tech Everyday',
    subtitle: 'Banner landing · electronics and accessories',
  },
  'banner-beauty': {
    title: 'Beauty Edit',
    subtitle: 'Banner landing · beauty and personal care',
  },
  'trending-now': { title: 'Trending Now', subtitle: 'Resource slot landing' },
  'new-arrivals': { title: 'New Arrivals', subtitle: 'Resource slot landing' },
  'flash-deals': { title: 'Flash Deals', subtitle: 'Resource slot landing' },
  'global-hits': { title: 'Global Hits', subtitle: 'Resource slot landing' },
  'sport-specials': { title: 'Sport Specials', subtitle: 'Resource slot landing' },
}

export function getShippingQuote(productId: string, shipTo: string): ShippingQuote {
  const n = Number(productId.replace(/\D/g, '')) || 1
  const costUsd = Number((3.5 + (n % 9) * 0.85 + (shipTo === 'US' ? 0 : 1.2)).toFixed(2))
  return {
    method: n % 2 === 0 ? 'Standard Express' : 'Economy Air',
    processing: '1–3 business days',
    delivery: shipTo === 'US' ? '5–10 business days' : '7–14 business days',
    costUsd,
    note: 'Shipping estimate is demo placeholder data · logic pending confirmation',
  }
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id)
}

export function getProductsByIds(ids: string[]) {
  const map = new Map(products.map((p) => [p.id, p]))
  return ids.map((id) => map.get(id)).filter(Boolean) as Product[]
}

export function getCollectionProducts(collectionId: string) {
  if (resourceSlots.some((s) => s.id === collectionId)) {
    const slot = resourceSlots.find((s) => s.id === collectionId)!
    return getProductsByIds(slot.productIds)
  }
  return products.filter((p) => p.collectionIds.includes(collectionId))
}

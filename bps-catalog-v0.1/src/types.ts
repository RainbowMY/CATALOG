export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY'

export type ShipCountry = 'All' | 'US' | 'CN' | 'UK' | 'DE' | 'CA' | 'FR' | 'AU'

export type ViewMode = 'grid' | 'list'

export type SortKey = 'newest' | 'priceAsc' | 'priceDesc' | 'inventory'

export interface CategoryNode {
  id: string
  name: string
  children?: CategoryNode[]
}

export interface ProductVariant {
  id: string
  label: string
  color: string
  size: string
  sku: string
  priceUsd: number
  inventory: number
  image: string
}

export interface Product {
  id: string
  title: string
  spu: string
  description: string
  material: string
  isNew: boolean
  isBestSeller: boolean
  categoryPath: [string, string, string]
  shipFrom: Exclude<ShipCountry, 'All'>
  priceUsd: number
  inventory: number
  listedAt: string
  image: string
  gallery: string[]
  variants: ProductVariant[]
  resourceTags: string[]
  collectionIds: string[]
  detailCopy: string
}

export interface BannerItem {
  id: string
  title: string
  subtitle: string
  cta: string
  collectionId: string
  image: string
  tone: 'crimson' | 'ink' | 'rose' | 'slate'
}

export interface ResourceSlot {
  id: string
  title: string
  subtitle: string
  productIds: string[]
}

export interface ShippingQuote {
  method: string
  processing: string
  delivery: string
  costUsd: number
  note: string
}

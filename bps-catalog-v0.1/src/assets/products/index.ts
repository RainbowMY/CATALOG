import img01 from './4351b84e6375debaa47cd752f1ff99f8.webp'
import img02 from './6ca7da13816c6027cdde24b7b9e13090.webp'
import img03 from './ScreenShot_2026-07-22_145426_732.webp'
import img04 from './ScreenShot_2026-07-22_145632_311.webp'
import img05 from './ScreenShot_2026-07-22_145650_306.webp'
import img06 from './ScreenShot_2026-07-22_145717_237.webp'
import img07 from './ScreenShot_2026-07-22_145807_729.webp'
import img08 from './ScreenShot_2026-07-22_145902_884.webp'
import img09 from './ScreenShot_2026-07-22_145921_785.webp'
import img10 from './ScreenShot_2026-07-22_145946_485.webp'
import img11 from './ScreenShot_2026-07-22_150005_514.webp'

/** 商品图假数据填充 · 全部本地图（须全部用上） */
export const PRODUCT_IMAGES: string[] = [
  img01,
  img02,
  img03,
  img04,
  img05,
  img06,
  img07,
  img08,
  img09,
  img10,
  img11,
]

export function pickProductImage(index: number): string {
  return PRODUCT_IMAGES[index % PRODUCT_IMAGES.length]
}

/** 保证前 N 个商品覆盖全部图片至少一次后再循环 */
export function assignProductImages(count: number): string[] {
  const pool = [...PRODUCT_IMAGES]
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    out.push(pool[i % pool.length])
  }
  return out
}

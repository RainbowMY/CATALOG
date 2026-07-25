import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { ResourceSlot } from '../../types'
import { getProductsByIds } from '../../data/catalog'
import { ProductCard } from './ProductCard'

export function ResourceSection({ slot }: { slot: ResourceSlot }) {
  // 每行 5 个 × 2 行
  const items = getProductsByIds(slot.productIds).slice(0, 10)

  return (
    <section className="fade-up rounded-lg border border-line bg-panel p-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight">{slot.title}</h3>
          <p className="mt-0.5 text-xs text-muted">{slot.subtitle}</p>
        </div>
        <Link
          to={`/collection/${slot.id}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-3 text-xs font-bold !text-white shadow-sm hover:bg-brand-dark"
        >
          View more
          <ArrowRight size={13} className="!text-white" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}

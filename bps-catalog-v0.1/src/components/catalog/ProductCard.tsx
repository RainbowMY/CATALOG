import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { formatMoney } from '../../utils/currency'
import { useCatalogUi } from '../../context/CatalogUiContext'

export function ProductCard({ product }: { product: Product }) {
  const { currency } = useCatalogUi()

  return (
    <Link
      to={`/product/${product.id}`}
      className="product-card group relative flex flex-col overflow-hidden rounded-md border border-line bg-panel"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
        {product.isBestSeller ? (
          <span className="absolute left-2 top-2 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
            Best Seller
          </span>
        ) : product.isNew ? (
          <span className="absolute left-2 top-2 rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            New
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 px-2.5 pb-2.5 pt-1.5">
        <div className="line-clamp-2 min-h-[2.5em] text-[13px] font-medium leading-snug text-ink">
          {product.title}
        </div>
        <div className="line-clamp-2 min-h-[2.4em] text-[11px] leading-snug text-muted">
          {product.description}
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="text-[15px] font-bold text-brand">
            {formatMoney(product.priceUsd, currency)}
          </div>
          <div className="text-[10px] text-muted">inventory {product.inventory.toLocaleString()}</div>
        </div>
      </div>
    </Link>
  )
}

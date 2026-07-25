import { Link, useParams } from 'react-router-dom'
import { collectionMeta, getCollectionProducts } from '../data/catalog'
import { ProductCard } from '../components/catalog/ProductCard'
import { PageContainer } from '../components/layout/PageContainer'

export function CollectionPage() {
  const { id = '' } = useParams()
  const meta = collectionMeta[id] ?? {
    title: 'Collection',
    subtitle: 'Product set landing',
  }
  const items = getCollectionProducts(id)

  return (
    <PageContainer className="space-y-4">
      <div className="overflow-hidden rounded-lg bg-gradient-to-br from-brand via-[#ef4452] to-[#fca5a5] p-6 text-white md:p-7">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">
          <Link to="/" className="hover:underline">
            Catalog
          </Link>{' '}
          / Collection
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">{meta.title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-white/85">{meta.subtitle}</p>
        <div className="mt-4 inline-flex rounded-md bg-white/15 px-2.5 py-1 text-xs font-semibold">
          {items.length} products in this set
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-panel px-6 py-14 text-center">
          <div className="text-lg font-bold">No products in this collection</div>
          <Link to="/products" className="mt-2 inline-block text-sm font-semibold text-brand">
            Browse all products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </PageContainer>
  )
}

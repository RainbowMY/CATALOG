import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { products } from '../data/catalog'
import { ProductCard } from '../components/catalog/ProductCard'
import { CategoryMegaMenu } from '../components/catalog/CategoryMegaMenu'
import { PageContainer } from '../components/layout/PageContainer'
import type { ShipCountry, SortKey } from '../types'

const COUNTRIES: ShipCountry[] = ['All', 'US', 'CN', 'UK', 'DE', 'CA', 'FR', 'AU']
const PAGE_SIZE_OPTIONS = [20, 50, 100] as const

type StockPreset = 'none' | '50' | '1000' | '2000' | 'custom'
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

export function AllProductsPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const l1 = params.get('l1') ?? ''
  const l2 = params.get('l2') ?? ''
  const l3 = params.get('l3') ?? ''

  const [shipFrom, setShipFrom] = useState<ShipCountry>('All')
  const [sortKey, setSortKey] = useState<SortKey>('newest')
  const [stockPreset, setStockPreset] = useState<StockPreset>('none')
  const [customMin, setCustomMin] = useState('')
  const [customMax, setCustomMax] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(50)

  const clearCategory = () => {
    const next = new URLSearchParams(params)
    next.delete('l1')
    next.delete('l2')
    next.delete('l3')
    setParams(next)
    setPage(1)
  }

  const filtered = useMemo(() => {
    let rows = [...products]
    if (q.trim()) {
      const key = q.trim().toLowerCase()
      rows = rows.filter(
        (p) =>
          p.title.toLowerCase().includes(key) ||
          p.spu.toLowerCase().includes(key) ||
          p.description.toLowerCase().includes(key),
      )
    }
    if (l1) rows = rows.filter((p) => p.categoryPath[0] === l1)
    if (l2) rows = rows.filter((p) => p.categoryPath[1] === l2)
    if (l3) rows = rows.filter((p) => p.categoryPath[2] === l3)
    if (shipFrom !== 'All') rows = rows.filter((p) => p.shipFrom === shipFrom)

    const pMin = priceMin ? Number(priceMin) : null
    const pMax = priceMax ? Number(priceMax) : null
    if (pMin != null && !Number.isNaN(pMin)) rows = rows.filter((p) => p.priceUsd >= pMin)
    if (pMax != null && !Number.isNaN(pMax)) rows = rows.filter((p) => p.priceUsd <= pMax)

    if (stockPreset === '50') rows = rows.filter((p) => p.inventory >= 50)
    if (stockPreset === '1000') rows = rows.filter((p) => p.inventory >= 1000)
    if (stockPreset === '2000') rows = rows.filter((p) => p.inventory >= 2000)
    if (stockPreset === 'custom') {
      const sMin = customMin ? Number(customMin) : null
      const sMax = customMax ? Number(customMax) : null
      if (sMin != null && !Number.isNaN(sMin)) rows = rows.filter((p) => p.inventory >= sMin)
      if (sMax != null && !Number.isNaN(sMax)) rows = rows.filter((p) => p.inventory <= sMax)
    }

    rows.sort((a, b) => {
      if (sortKey === 'newest') return +new Date(b.listedAt) - +new Date(a.listedAt)
      if (sortKey === 'priceAsc') return a.priceUsd - b.priceUsd
      if (sortKey === 'priceDesc') return b.priceUsd - a.priceUsd
      return b.inventory - a.inventory
    })
    return rows
  }, [q, l1, l2, l3, shipFrom, sortKey, stockPreset, customMin, customMax, priceMin, priceMax])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, filtered.length)

  return (
    <PageContainer className="space-y-4">
      <div>
        <div className="text-xs text-muted">
          <Link to="/" className="hover:text-brand">
            Catalog
          </Link>{' '}
          / All Products
        </div>
        <h1 className="mt-0.5 text-xl font-bold tracking-tight">All Products</h1>
        <p className="mt-0.5 text-xs text-muted">
          {filtered.length} products · {pageSize} per page
        </p>
      </div>

      <section className="rounded-lg border border-line bg-panel p-3.5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal size={16} className="text-brand" />
          Filters
        </div>

        <div className="space-y-3.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
            <div className="w-28 shrink-0 pt-1.5 text-xs font-semibold uppercase tracking-wide text-ink">
              Category
            </div>
            <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2">
              <CategoryMegaMenu align="left" onPick={() => setPage(1)} />
              {l3 ? (
                <div className="inline-flex items-center gap-2 rounded-md border border-brand/30 bg-brand-soft px-3 py-1.5 text-sm">
                  <span className="text-muted">Selected:</span>
                  <span className="font-semibold text-brand">{l3}</span>
                  <span className="hidden text-xs text-muted sm:inline">
                    ({[l1, l2].filter(Boolean).join(' / ')})
                  </span>
                  <button
                    type="button"
                    onClick={clearCategory}
                    className="ml-1 text-xs font-semibold text-muted underline hover:text-brand"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <span className="text-xs text-muted">Hover Categories to pick a level-3 filter</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
            <div className="w-28 shrink-0 pt-1.5 text-xs font-semibold uppercase tracking-wide text-ink">
              Ship From
            </div>
            <div className="min-w-0 flex-1 flex flex-wrap gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setShipFrom(c)
                    setPage(1)
                  }}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    shipFrom === c
                      ? 'border-brand bg-brand text-white'
                      : 'border-line bg-canvas hover:border-brand/40'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
            <div className="w-28 shrink-0 pt-1.5 text-xs font-semibold uppercase tracking-wide text-ink">
              Inventory
            </div>
            <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2">
              {(
                [
                  ['none', 'No filter'],
                  ['50', '≥ 50'],
                  ['1000', '≥ 1000'],
                  ['2000', '≥ 2000'],
                  ['custom', 'Custom'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setStockPreset(key)
                    setPage(1)
                  }}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    stockPreset === key
                      ? 'border-brand bg-brand-soft text-brand'
                      : 'border-line hover:border-brand/40'
                  }`}
                >
                  {label}
                </button>
              ))}
              {stockPreset === 'custom' ? (
                <div className="flex items-center gap-2">
                  <input
                    value={customMin}
                    onChange={(e) => {
                      setCustomMin(e.target.value)
                      setPage(1)
                    }}
                    placeholder="Min"
                    className="h-9 w-24 rounded-md border border-line px-3 text-sm"
                  />
                  <span className="text-muted">–</span>
                  <input
                    value={customMax}
                    onChange={(e) => {
                      setCustomMax(e.target.value)
                      setPage(1)
                    }}
                    placeholder="Max"
                    className="h-9 w-24 rounded-md border border-line px-3 text-sm"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
            <div className="w-28 shrink-0 pt-1.5 text-xs font-semibold uppercase tracking-wide text-ink">
              Price (USD)
            </div>
            <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2">
              <input
                value={priceMin}
                onChange={(e) => {
                  setPriceMin(e.target.value)
                  setPage(1)
                }}
                placeholder="Min"
                className="h-9 w-28 rounded-md border border-line px-3 text-sm"
              />
              <span className="text-muted">–</span>
              <input
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(e.target.value)
                  setPage(1)
                }}
                placeholder="Max"
                className="h-9 w-28 rounded-md border border-line px-3 text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['newest', 'Newest'],
            ['priceAsc', 'Price ↑'],
            ['priceDesc', 'Price ↓'],
            ['inventory', 'Inventory'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSortKey(key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              sortKey === key ? 'bg-ink text-white' : 'bg-panel text-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {pageRows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-panel px-6 py-14 text-center">
          <div className="text-lg font-bold">No products matched</div>
          <p className="mt-1 text-sm text-muted">Try clearing filters or searching another keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
          {pageRows.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">Per page</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value) as PageSize)
              setPage(1)
            }}
            className="h-9 rounded-md border border-line bg-panel px-2.5 text-sm font-medium"
            aria-label="Items per page"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-line bg-panel px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Prev
          </button>
          <span className="rounded-md bg-canvas px-3 py-1.5 text-sm text-muted">
            Page {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-md border border-line bg-panel px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>

        <span className="text-xs text-muted">
          Showing {rangeStart}–{rangeEnd} of {filtered.length}
        </span>
      </div>
    </PageContainer>
  )
}

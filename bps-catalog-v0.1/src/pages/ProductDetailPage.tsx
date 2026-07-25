import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Store, Truck } from 'lucide-react'
import { DETAIL_COLORS, DETAIL_SIZES, getProduct, getShippingQuote } from '../data/catalog'
import { PRODUCT_IMAGES, pickProductImage } from '../assets/products'
import { formatMoney } from '../utils/currency'
import { useCatalogUi } from '../context/CatalogUiContext'
import { PageContainer } from '../components/layout/PageContainer'
import type { ShipCountry } from '../types'

const SHIP_TO_OPTIONS: Exclude<ShipCountry, 'All'>[] = ['US', 'CN', 'UK', 'DE', 'CA', 'FR', 'AU']
/** 详情主图至少展示张数（需超过 9） */
const MIN_GALLERY_COUNT = 12

type LeftTab = 'images' | 'details'

export function ProductDetailPage() {
  const { id = '' } = useParams()
  const product = getProduct(id)
  const { currency } = useCatalogUi()
  const [activeImage, setActiveImage] = useState(0)
  const [leftTab, setLeftTab] = useState<LeftTab>('images')
  const [color, setColor] = useState(DETAIL_COLORS[0])
  const [size, setSize] = useState(DETAIL_SIZES[0])
  const [shipTo, setShipTo] = useState<Exclude<ShipCountry, 'All'>>('US')
  const thumbStripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!product) return
    setColor(DETAIL_COLORS[0])
    setSize(DETAIL_SIZES[0])
    setActiveImage(0)
    setLeftTab('images')
  }, [product])

  const colorOptions = useMemo(
    () =>
      DETAIL_COLORS.map((name, i) => ({
        name,
        image: pickProductImage((Number(product?.id.replace(/\D/g, '') || 1) + i) % 100),
      })),
    [product],
  )

  const shipping = useMemo(
    () => (product ? getShippingQuote(product.id, shipTo) : null),
    [product, shipTo],
  )

  const gallery = useMemo(() => {
    if (!product) return [] as string[]
    const seed = Number(product.id.replace(/\D/g, '') || 1)
    const base = [product.image, ...product.gallery, ...product.variants.map((v) => v.image)]
    const unique = [...new Set(base)]
    let i = 0
    while (unique.length < MIN_GALLERY_COUNT) {
      unique.push(PRODUCT_IMAGES[(seed + i) % PRODUCT_IMAGES.length])
      i++
    }
    return unique
  }, [product])

  // 主图切换时，缩略图条滚到当前选中项
  useEffect(() => {
    const strip = thumbStripRef.current
    if (!strip) return
    const thumb = strip.children[activeImage] as HTMLElement | undefined
    thumb?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
  }, [activeImage, leftTab])

  const goPrevImage = () => {
    setActiveImage((i) => (i <= 0 ? gallery.length - 1 : i - 1))
  }
  const goNextImage = () => {
    setActiveImage((i) => (i >= gallery.length - 1 ? 0 : i + 1))
  }

  const colorIndex = DETAIL_COLORS.indexOf(color)
  const sizeIndex = DETAIL_SIZES.indexOf(size)
  const price = product
    ? Number((product.priceUsd + Math.max(0, colorIndex) * 0.45 + Math.max(0, sizeIndex) * 0.35).toFixed(2))
    : 0
  const stock = product
    ? Math.max(0, product.inventory - Math.max(0, colorIndex) * 12 - Math.max(0, sizeIndex) * 7)
    : 0

  if (!product) {
    return (
      <PageContainer>
        <div className="rounded-lg border border-dashed border-line bg-panel px-6 py-14 text-center">
          <div className="text-lg font-bold">Product not found</div>
          <Link to="/products" className="mt-2 inline-block text-sm font-semibold text-brand">
            Back to All Products
          </Link>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="space-y-3">
      <div className="text-xs text-muted">
        <Link to="/" className="hover:text-brand">
          Catalog
        </Link>
        {' / '}
        <Link to="/products" className="hover:text-brand">
          All Products
        </Link>
        {' / '}
        <span className="text-ink">{product.title}</span>
      </div>

      <div className="grid items-stretch gap-4 lg:h-[calc(100vh-120px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="flex min-h-0 flex-col gap-3">
          <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-line bg-panel p-3">
            <div className="mb-3 flex shrink-0 gap-1 rounded-md bg-canvas p-1">
              <button
                type="button"
                onClick={() => setLeftTab('images')}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  leftTab === 'images'
                    ? 'bg-brand !text-white shadow-sm'
                    : 'text-ink/70 hover:bg-white'
                }`}
              >
                Product Images
              </button>
              <button
                type="button"
                onClick={() => setLeftTab('details')}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  leftTab === 'details'
                    ? 'bg-brand !text-white shadow-sm'
                    : 'text-ink/70 hover:bg-white'
                }`}
              >
                Product Details
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              {leftTab === 'images' ? (
                <div className="flex h-full flex-col">
                  <div className="relative min-h-0 flex-1 overflow-hidden rounded-md bg-white">
                    <img
                      src={gallery[activeImage] ?? product.image}
                      alt={product.title}
                      className="h-full w-full object-contain p-3"
                    />
                    {gallery.length > 1 ? (
                      <>
                        <button
                          type="button"
                          aria-label="Previous image"
                          onClick={goPrevImage}
                          className="absolute left-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/70"
                        >
                          <ChevronLeft size={22} strokeWidth={2.25} className="text-white" />
                        </button>
                        <button
                          type="button"
                          aria-label="Next image"
                          onClick={goNextImage}
                          className="absolute right-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/70"
                        >
                          <ChevronRight size={22} strokeWidth={2.25} className="text-white" />
                        </button>
                        <div className="pointer-events-none absolute bottom-2.5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-medium text-white">
                          {activeImage + 1} / {gallery.length}
                        </div>
                      </>
                    ) : null}
                  </div>
                  <div
                    ref={thumbStripRef}
                    className="mt-2 flex shrink-0 gap-2 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {gallery.map((src, i) => (
                      <button
                        key={`${src}-${i}`}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        className={`h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-white ${
                          activeImage === i ? 'border-brand' : 'border-line'
                        }`}
                      >
                        <img src={src} alt="" className="h-full w-full object-contain p-1" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className="rich-detail h-full overflow-y-auto rounded-md border border-line bg-white p-3 text-sm leading-relaxed text-ink/90 [&_img]:my-3 [&_img]:block [&_img]:max-h-[200px] [&_img]:w-full [&_img]:rounded-md [&_img]:object-contain [&_li]:my-1 [&_p]:mb-3 [&_strong]:text-ink [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: product.detailCopy }}
                />
              )}
            </div>
          </section>

          <section className="shrink-0 rounded-lg border border-line bg-panel p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Truck size={15} className="text-brand" />
              Shipping Estimate
            </div>
            <div className="mb-2">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                Ship to
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SHIP_TO_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setShipTo(c)}
                    className={`rounded-md border px-2.5 py-1 text-sm ${
                      shipTo === c
                        ? 'border-brand bg-brand !text-white'
                        : 'border-line hover:border-brand/40'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            {shipping ? (
              <div className="space-y-1.5 rounded-md bg-canvas p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-muted">Method</span>
                  <span className="font-semibold">{shipping.method}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted">Processing</span>
                  <span className="font-semibold">{shipping.processing}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted">Delivery</span>
                  <span className="font-semibold">{shipping.delivery}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted">Shipping cost</span>
                  <span className="font-semibold text-brand">
                    {formatMoney(shipping.costUsd, currency)}
                  </span>
                </div>
                <div className="pt-1 text-xs text-amber-700">{shipping.note}</div>
              </div>
            ) : null}
          </section>
        </div>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-line bg-panel">
          <div className="shrink-0 border-b border-line p-4 md:px-5 md:pb-3 md:pt-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              {product.categoryPath.join(' · ')}
            </div>
            <h1 className="mt-1.5 text-xl font-extrabold tracking-tight md:text-2xl">{product.title}</h1>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{product.description}</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 md:px-5">
            <div className="mb-2 text-sm font-semibold">Material Information</div>
            <div className="overflow-hidden rounded-md border border-line">
              <table className="w-full text-left text-sm">
                <tbody>
                  <tr className="border-b border-line">
                    <th className="w-[38%] bg-canvas px-3 py-2 font-medium text-muted">Material</th>
                    <td className="px-3 py-2 text-ink">{product.material}</td>
                  </tr>
                  <tr className="border-b border-line">
                    <th className="bg-canvas px-3 py-2 font-medium text-muted">Category</th>
                    <td className="px-3 py-2 text-ink">{product.categoryPath[2]}</td>
                  </tr>
                  <tr className="border-b border-line">
                    <th className="bg-canvas px-3 py-2 font-medium text-muted">Ship From</th>
                    <td className="px-3 py-2 text-ink">{product.shipFrom}</td>
                  </tr>
                  <tr>
                    <th className="bg-canvas px-3 py-2 font-medium text-muted">SPU</th>
                    <td className="px-3 py-2 text-ink">{product.spu}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <div className="mb-2 text-sm font-semibold">Color:</div>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    title={c.name}
                    onClick={() => {
                      setColor(c.name)
                      const idx = gallery.findIndex((g) => g === c.image)
                      if (idx >= 0) setActiveImage(idx)
                    }}
                    className={`h-11 w-11 overflow-hidden rounded-md border-2 bg-white ${
                      color === c.name ? 'border-brand' : 'border-line hover:border-brand/40'
                    }`}
                  >
                    <img src={c.image} alt={c.name} className="h-full w-full object-contain p-0.5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 pb-2">
              <div className="mb-2 text-sm font-semibold">Size:</div>
              <div className="flex flex-wrap gap-2">
                {DETAIL_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`min-w-11 rounded-md border px-3 py-1.5 text-sm font-semibold ${
                      size === s
                        ? 'border-brand bg-brand-soft text-brand'
                        : 'border-line hover:border-brand/40'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-line bg-panel px-4 py-3 md:px-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-2xl font-extrabold text-brand">{formatMoney(price, currency)}</div>
                <div className="text-[11px] text-muted">inventory {stock.toLocaleString()}</div>
              </div>
              <button
                type="button"
                onClick={() =>
                  alert('Add to Store uses the existing BPS flow · not simulated in this prototype.')
                }
                className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-md bg-brand px-4 text-sm font-bold !text-white shadow-sm hover:bg-brand-dark"
              >
                <Store size={15} className="!text-white" />
                Add to Store
              </button>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  )
}

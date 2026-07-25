import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { HomeCategoryPanel } from '../components/catalog/CategoryMegaMenu'
import { BannerCarousel } from '../components/catalog/BannerCarousel'
import { ResourceSection } from '../components/catalog/ResourceSection'
import { LogisticsPromo } from '../components/catalog/LogisticsPromo'
import { PageContainer } from '../components/layout/PageContainer'
import { resourceSlots } from '../data/catalog'
import { useCatalogUi } from '../context/CatalogUiContext'
import { LayoutGrid } from 'lucide-react'

export function HomePage() {
  const { setStickyBrowse, setStickyCategories } = useCatalogUi()
  const browseRef = useRef<HTMLAnchorElement>(null)
  const categoryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = document.querySelector('[data-catalog-scroll]') as HTMLElement | null
    const browseEl = browseRef.current
    const categoryEl = categoryRef.current
    if (!root || !browseEl || !categoryEl) return

    const observe = (el: Element, onChange: (visible: boolean) => void) => {
      const io = new IntersectionObserver(
        ([entry]) => {
          onChange(entry.isIntersecting && entry.intersectionRatio > 0)
        },
        { root, threshold: 0 },
      )
      io.observe(el)
      return io
    }

    const browseIo = observe(browseEl, (visible) => setStickyBrowse(!visible))
    const categoryIo = observe(categoryEl, (visible) => setStickyCategories(!visible))

    return () => {
      browseIo.disconnect()
      categoryIo.disconnect()
      setStickyBrowse(false)
      setStickyCategories(false)
    }
  }, [setStickyBrowse, setStickyCategories])

  return (
    <PageContainer className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Products / Catalog
          </div>
          <h1 className="mt-0.5 whitespace-nowrap text-sm font-normal text-muted">
            BestFulFill is designed for delivery and has become a powerful partner for your
            business growth
          </h1>
        </div>
        <Link
          ref={browseRef}
          to="/products"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-panel px-3 text-xs font-semibold hover:border-brand/40 hover:text-brand"
        >
          <LayoutGrid size={14} />
          Browse All Products
        </Link>
      </div>

      <div className="relative z-10 flex gap-3 overflow-visible">
        <HomeCategoryPanel ref={categoryRef} />
        <BannerCarousel />
      </div>

      <div className="space-y-4">
        {resourceSlots.map((slot) => (
          <ResourceSection key={slot.id} slot={slot} />
        ))}
      </div>

      <LogisticsPromo />
    </PageContainer>
  )
}

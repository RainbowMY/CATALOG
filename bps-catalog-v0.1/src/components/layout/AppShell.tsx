import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Home,
  LayoutGrid,
  Package,
  CreditCard,
  Sparkles,
  Settings2,
  Search,
} from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useCatalogUi } from '../../context/CatalogUiContext'
import { CategoryMegaMenu } from '../catalog/CategoryMegaMenu'
import type { CurrencyCode } from '../../types'

const nav = [
  { label: 'Home', icon: Home, hint: true },
  { label: 'Orders', icon: Package, badge: '0', hint: true },
  {
    label: 'Products',
    icon: LayoutGrid,
    children: [
      { label: 'Catalog', to: '/' },
      { label: 'My Products', hint: true },
    ],
  },
  { label: 'Payment', icon: CreditCard, hint: true },
]

export function AppShell() {
  const {
    currency,
    setCurrency,
    keyword,
    setKeyword,
    stickyBrowse,
    stickyCategories,
  } = useCatalogUi()
  const navigate = useNavigate()
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const [showBackTop, setShowBackTop] = useState(false)

  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    const onScroll = () => {
      setShowBackTop(el.scrollTop >= el.clientHeight)
    }

    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [location.pathname])

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
    setShowBackTop(false)
  }, [location.pathname])

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    navigate(`/products?q=${encodeURIComponent(keyword.trim())}`)
  }

  const scrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas text-ink">
      <header className="z-40 shrink-0 border-b border-line bg-panel">
        <div className="grid h-12 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4">
          <div className="flex items-center gap-2 justify-self-start text-[15px] font-extrabold tracking-tight">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand text-xs font-bold text-white">
              BF
            </span>
            <span>
              BEST<span className="text-brand">FULFILL</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {stickyCategories ? <CategoryMegaMenu variant="icon" align="left" /> : null}
            <form onSubmit={onSearch} className="hidden w-[min(576px,45vw)] md:block">
              <div className="flex h-9 w-full overflow-hidden rounded-md border border-line bg-canvas focus-within:border-brand">
                <div className="flex items-center pl-3 text-muted">
                  <Search size={15} />
                </div>
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search for the product you need immediately"
                  className="w-full bg-transparent px-2.5 text-sm outline-none placeholder:text-muted/80"
                />
                <button
                  type="submit"
                  className="bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="flex items-center justify-end gap-1.5 justify-self-end">
            {stickyBrowse ? (
              <Link
                to="/products"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-panel px-3 text-xs font-semibold hover:border-brand/40 hover:text-brand"
              >
                <LayoutGrid size={14} />
                Browse All Products
              </Link>
            ) : null}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="h-8 rounded-md border border-line bg-panel px-2 text-xs font-semibold"
              aria-label="Currency"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
            </select>
            <button className="rounded-md p-1.5 text-muted hover:bg-canvas" title="Notifications (shell)">
              <Bell size={15} />
            </button>
            <button className="rounded-md p-1.5 text-muted hover:bg-canvas" title="Bookmarks (shell)">
              <Bookmark size={15} />
            </button>
            <button className="flex h-8 items-center gap-1.5 rounded-md border border-line px-2 text-xs">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[9px] text-white">
                00
              </span>
              0001-9646
              <ChevronDown size={13} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[200px] shrink-0 overflow-y-auto border-r border-line bg-sidebar lg:flex lg:flex-col">
          <nav className="flex-1 space-y-0.5 p-2.5">
            {nav.map((item) => {
              const Icon = item.icon
              if (item.children) {
                return (
                  <div key={item.label} className="space-y-0.5">
                    <div className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-ink">
                      <Icon size={15} className="text-muted" />
                      {item.label}
                    </div>
                    <div className="ml-3 space-y-0.5 border-l border-line pl-2.5">
                      {item.children.map((child) =>
                        child.to ? (
                          <NavLink
                            key={child.label}
                            to={child.to}
                            end={child.to === '/'}
                            className={({ isActive }) => {
                              const inCatalog =
                                child.to === '/' &&
                                (location.pathname === '/' ||
                                  location.pathname.startsWith('/product') ||
                                  location.pathname.startsWith('/products') ||
                                  location.pathname.startsWith('/collection'))
                              return `block rounded-md px-2.5 py-1.5 text-sm ${
                                isActive || inCatalog
                                  ? 'bg-brand font-semibold text-white'
                                  : 'text-ink/80 hover:bg-canvas'
                              }`
                            }}
                          >
                            {child.label}
                          </NavLink>
                        ) : (
                          <button
                            key={child.label}
                            type="button"
                            onClick={() => alert('Shell preview only · not in this prototype scope')}
                            className="block w-full rounded-md px-2.5 py-1.5 text-left text-sm text-ink/80 hover:bg-canvas"
                          >
                            {child.label}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )
              }
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => alert('Shell preview only · not in this prototype scope')}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink/80 hover:bg-canvas"
                >
                  <Icon size={15} className="text-muted" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {'badge' in item && item.badge ? (
                    <span className="rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-ink">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              )
            })}

            <div className="pt-3">
              <div className="px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                Apps
              </div>
              {['Bestrack Parcel AI', 'Marketing Metrics', 'Spy Tool', 'My Inventory'].map((app) => (
                <button
                  key={app}
                  type="button"
                  onClick={() => alert('Shell preview only · not in this prototype scope')}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink/80 hover:bg-canvas"
                >
                  <Sparkles size={14} className="text-muted" />
                  {app}
                </button>
              ))}
            </div>
          </nav>
          <button
            type="button"
            onClick={() => alert('Shell preview only · not in this prototype scope')}
            className="m-2.5 flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink/80 hover:bg-canvas"
          >
            <Settings2 size={15} className="text-muted" />
            Cost Settings
          </button>
        </aside>

        <main ref={mainRef} data-catalog-scroll className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-canvas">
          <Outlet />
        </main>
      </div>

      {showBackTop ? (
        <button
          type="button"
          aria-label="Back to Top"
          onClick={scrollToTop}
          className="fixed bottom-10 right-10 z-50 flex h-12 w-12 flex-col items-center justify-center rounded-full bg-brand text-[10px] font-bold leading-none !text-white shadow-md transition hover:bg-brand-dark"
        >
          <ChevronUp size={14} strokeWidth={2.5} className="!text-white" />
          <span className="mt-0.5">TOP</span>
        </button>
      ) : null}
    </div>
  )
}

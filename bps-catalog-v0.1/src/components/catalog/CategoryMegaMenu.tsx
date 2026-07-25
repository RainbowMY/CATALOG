import { forwardRef, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  Menu,
  Shirt,
  Smartphone,
  Home,
  Sparkles,
  Dumbbell,
  PawPrint,
  type LucideIcon,
} from 'lucide-react'
import { categories } from '../../data/categories'

const L1_ICONS: Record<string, LucideIcon> = {
  apparel: Shirt,
  electronics: Smartphone,
  home: Home,
  beauty: Sparkles,
  sports: Dumbbell,
  pets: PawPrint,
}

export function CategoryMegaMenu({
  onPick,
  align = 'left',
  variant = 'button',
}: {
  onPick?: (path: string[]) => void
  /** All Products 页按钮在右上角时用 right，避免菜单被裁切 */
  align?: 'left' | 'right'
  /** Header sticky: icon-only trigger */
  variant?: 'button' | 'icon'
}) {
  const [open, setOpen] = useState(false)
  const [l1Index, setL1Index] = useState(0)
  const [l2Index, setL2Index] = useState(0)

  const l1 = categories[l1Index]
  const l2 = l1?.children?.[l2Index]
  const panel = useMemo(() => l2?.children ?? [], [l2])

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {variant === 'icon' ? (
        <button
          type="button"
          aria-label="Categories"
          title="Categories"
          className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition ${
            open
              ? 'border-brand bg-brand !text-white'
              : 'border-line bg-canvas text-ink hover:border-brand/40 hover:text-brand'
          }`}
        >
          <Menu size={16} className={open ? '!text-white' : undefined} />
        </button>
      ) : (
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-md bg-brand px-3.5 text-sm font-semibold text-white"
        >
          Categories
          <ChevronRight size={14} className={`transition ${open ? 'rotate-90' : ''}`} />
        </button>
      )}

      {open ? (
        <div
          className={`absolute top-[calc(100%+6px)] z-50 flex w-[min(720px,calc(100vw-48px))] overflow-hidden rounded-lg border border-line bg-panel shadow-xl ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="w-[220px] shrink-0 border-r border-line bg-[#fafafa] p-1.5">
            {categories.map((c, i) => {
              const Icon = L1_ICONS[c.id] ?? Shirt
              return (
                <button
                  key={c.id}
                  type="button"
                  onMouseEnter={() => {
                    setL1Index(i)
                    setL2Index(0)
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm ${
                    i === l1Index ? 'bg-brand text-white' : 'hover:bg-white'
                  }`}
                >
                  <Icon size={16} className={i === l1Index ? 'text-white' : 'text-brand'} />
                  <span className="min-w-0 flex-1 truncate font-medium">{c.name}</span>
                  <ChevronRight size={13} className="shrink-0" />
                </button>
              )
            })}
          </div>
          <div className="w-[180px] shrink-0 border-r border-line p-1.5">
            {(l1?.children ?? []).map((c, i) => (
              <button
                key={c.id}
                type="button"
                onMouseEnter={() => setL2Index(i)}
                className={`flex w-full items-center justify-between gap-1 rounded-md px-2.5 py-2 text-left text-sm ${
                  i === l2Index ? 'bg-brand-soft font-semibold text-brand' : 'hover:bg-canvas'
                }`}
              >
                <span className="truncate">{c.name}</span>
                <ChevronRight size={13} className="shrink-0" />
              </button>
            ))}
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-2 content-start gap-0.5 p-2">
            {panel.map((c) => (
              <Link
                key={c.id}
                to={`/products?l1=${encodeURIComponent(l1.name)}&l2=${encodeURIComponent(l2?.name ?? '')}&l3=${encodeURIComponent(c.name)}`}
                onClick={() => {
                  onPick?.([l1.name, l2?.name ?? '', c.name])
                  setOpen(false)
                }}
                className="rounded-md px-2.5 py-1.5 text-sm text-ink/85 hover:bg-brand-soft hover:text-brand"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/** Homepage left category rail — CJ-style L1 with icons, hover reveals L2/L3 */
export const HomeCategoryPanel = forwardRef<HTMLDivElement>(function HomeCategoryPanel(_, ref) {
  const [l1Index, setL1Index] = useState(0)
  const [l2Index, setL2Index] = useState(0)
  const [open, setOpen] = useState(false)

  const l1 = categories[l1Index]
  const l2 = l1?.children?.[l2Index]
  const l3 = l2?.children ?? []

  return (
    <div
      ref={ref}
      className="relative z-20 h-full min-h-[280px] w-[220px] shrink-0 rounded-lg border border-line bg-panel"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="border-b border-line px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-muted">
        Categories
      </div>
      <div className="p-1.5">
        {categories.map((c, i) => {
          const Icon = L1_ICONS[c.id] ?? Shirt
          return (
            <button
              key={c.id}
              type="button"
              onMouseEnter={() => {
                setL1Index(i)
                setL2Index(0)
                setOpen(true)
              }}
              className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm ${
                open && i === l1Index ? 'bg-brand-soft font-semibold text-brand' : 'hover:bg-canvas'
              }`}
            >
              <Icon size={16} className="text-brand" />
              <span className="flex-1 truncate">{c.name}</span>
              <ChevronRight size={13} className="text-muted" />
            </button>
          )
        })}
      </div>

      {open ? (
        <div className="absolute left-[calc(100%-1px)] top-0 z-30 flex min-h-full rounded-r-lg border border-line bg-panel shadow-xl">
          <div className="w-[170px] border-r border-line p-1.5">
            {(l1?.children ?? []).map((c, i) => (
              <button
                key={c.id}
                type="button"
                onMouseEnter={() => setL2Index(i)}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm ${
                  i === l2Index ? 'bg-brand-soft font-semibold text-brand' : 'hover:bg-canvas'
                }`}
              >
                <span className="truncate">{c.name}</span>
                <ChevronRight size={13} />
              </button>
            ))}
          </div>
          <div className="grid w-[280px] grid-cols-1 content-start gap-0.5 p-2">
            {l3.map((c) => (
              <Link
                key={c.id}
                to={`/products?l1=${encodeURIComponent(l1.name)}&l2=${encodeURIComponent(l2?.name ?? '')}&l3=${encodeURIComponent(c.name)}`}
                className="rounded-md px-2.5 py-1.5 text-sm text-ink/85 hover:bg-brand-soft hover:text-brand"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
})

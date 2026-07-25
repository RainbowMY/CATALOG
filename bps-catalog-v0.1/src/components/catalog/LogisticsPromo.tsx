import { LOGISTICS_IMAGES } from '../../assets/logistics'

const STATS = [
  { value: '10+', label: 'dropshipping experience' },
  { value: '60,000M²+', label: 'Intelligent domestic warehousing space' },
  { value: '10+', label: 'Global Warehouses' },
  { value: '10M+', label: 'Loyal Sellers' },
] as const

const ROW_A = LOGISTICS_IMAGES.slice(0, 8)
const ROW_B = LOGISTICS_IMAGES.slice(8, 16)

function MarqueeRow({
  images,
  direction,
  duration = 42,
}: {
  images: string[]
  direction: 'left' | 'right'
  duration?: number
}) {
  const track = [...images, ...images]

  return (
    <div className="overflow-hidden">
      <div
        className={`flex w-max gap-3 ${direction === 'left' ? 'marquee-left' : 'marquee-right'}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {track.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            className="h-[168px] w-auto shrink-0 rounded-lg object-contain"
            loading="lazy"
            draggable={false}
          />
        ))}
      </div>
    </div>
  )
}

export function LogisticsPromo() {
  return (
    <section className="fade-up rounded-lg border border-line bg-panel px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-ink md:text-[28px]">
          You focus on sales.
          <br />
          We solve the problems.
        </h2>
        <p className="mt-2 text-sm text-muted">Logistics Solutions to Help Businesses</p>
      </div>

      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4 md:gap-4">
        {STATS.map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-2xl font-extrabold tracking-tight text-brand md:text-[28px]">
              {item.value}
            </div>
            <div className="mt-1 text-xs leading-snug text-muted md:text-[13px]">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        <MarqueeRow images={ROW_A} direction="left" duration={48} />
        <MarqueeRow images={ROW_B} direction="right" duration={52} />
      </div>
    </section>
  )
}

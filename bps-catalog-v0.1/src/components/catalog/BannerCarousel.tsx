import { useEffect, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { banners } from '../../data/catalog'
import { ChevronRight } from 'lucide-react'

export function BannerCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = window.setInterval(() => {
      setIndex((v) => (v + 1) % banners.length)
    }, 4200)
    return () => window.clearInterval(t)
  }, [])

  const banner = banners[index]
  const goNext = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIndex((v) => (v + 1) % banners.length)
  }

  return (
    <div className="relative h-full min-h-[280px] flex-1 overflow-hidden rounded-lg bg-canvas">
      <Link
        key={banner.id}
        to={`/collection/${banner.collectionId}`}
        className="banner-slide relative block h-full min-h-[280px]"
        aria-label={`${banner.title} · open collection`}
      >
        <img
          src={banner.image}
          alt={banner.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </Link>

      <button
        type="button"
        aria-label="Next banner"
        onClick={goNext}
        className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/5 bg-white/95 text-ink shadow-md transition hover:bg-white"
      >
        <ChevronRight size={22} strokeWidth={2.25} />
      </button>

      <div className="absolute bottom-4 left-7 z-10 flex gap-1.5">
        {banners.map((b, i) => (
          <button
            key={b.id}
            type="button"
            aria-label={`Go to banner ${i + 1}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIndex(i)
            }}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-brand' : 'w-1.5 bg-black/25 hover:bg-black/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

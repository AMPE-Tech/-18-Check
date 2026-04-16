import { useState, useEffect } from 'react'
import { AlertTriangle, ExternalLink, Eye, Shield } from 'lucide-react'

interface CarouselCase {
  id: number
  slug: string
  category: string
  name: string
  alias?: string | null
  nationality: string
  crime: string
  description: string
  amount_display: string
  platform: string[]
  status: string
  sentence: string
  year: number
  source: string
  source_url: string
}

export default function ProfileCarousel() {
  const [cases, setCases] = useState<CarouselCase[]>([])
  const [current, setCurrent] = useState(0)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    fetch('/data/carousel-cases.json')
      .then((r) => r.json())
      .then((d) => setCases(d.carousel?.cases || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (cases.length === 0) return
    const interval = setInterval(() => {
      setShowDetail(true)
      setTimeout(() => {
        setShowDetail(false)
        setCurrent((prev) => (prev + 1) % cases.length)
      }, 2000)
    }, 4000)
    return () => clearInterval(interval)
  }, [cases])

  if (cases.length === 0) return null

  const c = cases[current]
  const isRomance = c.category === 'romance_scam'

  return (
    <div className="w-full">
      <div className="relative bg-surface/80 backdrop-blur-sm border border-surface-border rounded-2xl overflow-hidden">
        {/* Category tag */}
        <div className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-center ${
          isRomance ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
        }`}>
          {isRomance ? '⚠ Romance Scam' : '⚠ Sextorsão'}
        </div>

        <div className="p-4">
          {/* Photo + info row */}
          <div className="flex items-start gap-3 mb-3">
            {/* Photo */}
            <div className="relative shrink-0">
              <img
                src={`/assets/profiles/${c.slug}.jpg`}
                alt=""
                className={`w-16 h-16 rounded-xl object-cover border-2 transition-all duration-500 ${
                  showDetail ? 'border-red-500 grayscale' : 'border-surface-border'
                }`}
                onError={(e) => {
                  const el = e.currentTarget
                  const src = el.src
                  if (src.endsWith('.jpg')) {
                    el.src = `/assets/profiles/${c.slug}.png`
                  } else if (src.endsWith('.png')) {
                    el.src = `/assets/profiles/${c.slug}.svg`
                  } else {
                    el.style.display = 'none'
                    if (el.nextElementSibling) (el.nextElementSibling as HTMLElement).style.display = 'flex'
                  }
                }}
              />
              <div className="hidden w-16 h-16 rounded-xl bg-red-500/10 border-2 border-red-500/30 items-center justify-center" style={{ display: 'none' }}>
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              {showDetail && (
                <div className="absolute -bottom-1 -right-1 bg-red-500 text-[7px] text-white font-bold px-1.5 py-0.5 rounded-full animate-[fadeIn_200ms_ease-out]">
                  FICHADO
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-white font-display font-bold text-sm leading-tight">{c.name}</p>
                  {c.alias && <p className="text-[9px] text-gray-500">aka "{c.alias}"</p>}
                </div>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                  showDetail ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-surface-light text-gray-500'
                }`}>
                  {c.status.split('—')[0].trim()}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">{c.nationality} · {c.year}</p>
              <p className="text-[10px] text-red-400 font-medium mt-1">{c.crime}</p>
            </div>
          </div>

          {/* Description */}
          <p className={`text-[10px] leading-relaxed mb-3 transition-all duration-500 ${
            showDetail ? 'text-gray-300' : 'text-gray-500'
          }`}>
            {c.description}
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-between text-[9px] text-gray-500 mb-2">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3 text-gold" />
              <span className="text-gold font-bold">{c.amount_display}</span>
            </div>
            <div className="flex items-center gap-1">
              {c.platform.slice(0, 2).map((p) => (
                <span key={p} className="bg-surface-light px-1.5 py-0.5 rounded text-[8px]">{p}</span>
              ))}
            </div>
          </div>

          {/* Sentence */}
          {showDetail && (
            <div className="bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2 mb-2 animate-[fadeIn_300ms_ease-out]">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-red-400" />
                <p className="text-[9px] text-red-400 font-medium">{c.sentence}</p>
              </div>
            </div>
          )}

          {/* Source + dots */}
          <div className="flex items-center justify-between">
            <a
              href={c.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[9px] text-gray-600 hover:text-gold transition-colors"
            >
              {c.source} <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <div className="flex items-center gap-0.5">
              {cases.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === current ? 'w-3 bg-gold' : 'w-1 bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

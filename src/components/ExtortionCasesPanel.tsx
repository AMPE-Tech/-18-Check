import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink, RefreshCw, AlertTriangle, MapPin } from 'lucide-react'
import FadeInView from './effects/FadeInView'

interface ExtortionCase {
  id: string
  title: string
  location: string
  amount: string
  status: string
  statusColor: string
  year: number
  month: string
  crime: string
  source: string
  sourceLabel: string
}

interface ExtortionData {
  lastUpdated: string
  nextUpdate: string
  stats: {
    totalCases: number
    totalExtorted: string
    totalArrests: string
    states: number
  }
  cases: ExtortionCase[]
}

const CACHE_KEY = '18check_extortion_cases'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000

function getCachedData(): ExtortionData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCachedData(data: ExtortionData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {}
}

export default function ExtortionCasesPanel() {
  const { t } = useTranslation()
  const [data, setData] = useState<ExtortionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const cached = getCachedData()
    if (cached) {
      setData(cached)
      setLoading(false)
      return
    }

    fetch('/data/extortion-cases.json')
      .then((r) => r.json())
      .then((d: ExtortionData) => {
        setData(d)
        setCachedData(d)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/data/extortion-cases.json')
        .then((r) => r.json())
        .then((d: ExtortionData) => {
          setData(d)
          setCachedData(d)
        })
        .catch(() => {})
    }, CACHE_TTL)
    return () => clearInterval(interval)
  }, [])

  if (loading || !data) return null

  const visibleCases = expanded ? data.cases : data.cases.slice(0, 3)

  return (
    <section className="px-5 py-6 border-t border-surface-border">
      <FadeInView delay={0.1}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">
              {t('extortion_panel.title', { defaultValue: 'Extorsão com vídeos íntimos' })}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-gray-600">
            <RefreshCw className="h-2.5 w-2.5" />
            <span>{t('extortion_panel.updated', { defaultValue: 'Atualizado' })} {data.lastUpdated}</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between bg-orange-500/5 border border-orange-500/15 rounded-lg px-3 py-2 mb-3">
          <div className="text-center">
            <p className="text-orange-400 font-display font-bold text-sm">{data.stats.totalCases}</p>
            <p className="text-[8px] text-gray-500">{t('extortion_panel.cases', { defaultValue: 'casos' })}</p>
          </div>
          <div className="w-px h-6 bg-orange-500/15" />
          <div className="text-center">
            <p className="text-orange-400 font-display font-bold text-sm">{data.stats.totalExtorted}</p>
            <p className="text-[8px] text-gray-500">{t('extortion_panel.extorted', { defaultValue: 'extorquidos' })}</p>
          </div>
          <div className="w-px h-6 bg-orange-500/15" />
          <div className="text-center">
            <p className="text-orange-400 font-display font-bold text-sm">{data.stats.totalArrests}</p>
            <p className="text-[8px] text-gray-500">{t('extortion_panel.arrests', { defaultValue: 'presos' })}</p>
          </div>
          <div className="w-px h-6 bg-orange-500/15" />
          <div className="text-center">
            <p className="text-orange-400 font-display font-bold text-sm">{data.stats.states}</p>
            <p className="text-[8px] text-gray-500">{t('extortion_panel.states', { defaultValue: 'estados' })}</p>
          </div>
        </div>
      </FadeInView>

      {/* Cases list */}
      <div className="space-y-2">
        {visibleCases.map((c, i) => (
          <FadeInView key={c.id} delay={0.15 + i * 0.05}>
            <a
              href={c.source}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-surface rounded-xl border border-surface-border p-3 hover:border-orange-500/30 transition-colors group"
            >
              <div className="flex items-start gap-3">
                {/* Location icon */}
                <div className="h-9 w-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-orange-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white text-xs font-semibold truncate">{c.title}</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-red-500/15 text-red-400 border border-red-500/30">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{c.crime}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gold font-semibold">{c.amount}</span>
                      <span className="text-[9px] text-gray-600">{c.location} · {c.month}</span>
                    </div>
                    <span className="text-[9px] text-gray-600 flex items-center gap-1 group-hover:text-gold transition-colors">
                      {c.sourceLabel} <ExternalLink className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            </a>
          </FadeInView>
        ))}
      </div>

      {/* Show more / less */}
      {data.cases.length > 3 && (
        <FadeInView delay={0.3}>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-3 py-2 text-[10px] text-gold font-medium border border-gold/20 rounded-lg hover:bg-gold/5 transition-colors cursor-pointer"
          >
            {expanded
              ? t('extortion_panel.show_less', { defaultValue: 'Ver menos' })
              : t('extortion_panel.show_more', { defaultValue: `Ver todos os ${data.cases.length} casos` })}
          </button>
        </FadeInView>
      )}

      {/* Disclaimer */}
      <FadeInView delay={0.35}>
        <p className="text-[8px] text-gray-600 text-center mt-3 leading-relaxed">
          {t('extortion_panel.disclaimer', { defaultValue: 'Dados de fontes públicas (Polícia Civil, Metrópoles, GCMAIS). Atualizado semanalmente.' })}
        </p>
      </FadeInView>
    </section>
  )
}

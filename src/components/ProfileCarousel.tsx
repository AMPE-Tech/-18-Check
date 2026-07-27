import { useState, useEffect } from 'react'
import { AlertTriangle, ExternalLink, HeartCrack, Eye } from 'lucide-react'

/**
 * Carrossel de casos reais no topo da Landing.
 *
 * Lê de scam-cases.json e extortion-cases.json — as mesmas bases dos painéis
 * mais abaixo na página, todas com link para a fonte original (DOJ, FBI, ICE,
 * CNN Brasil e imprensa regional).
 *
 * Antes existia um carousel-cases.json próprio, preenchido com personagens de
 * ficção — Tony Montana, Rambo, James Bond — apresentados como fichas
 * criminais, com delegacias inventadas e etiqueta "Vida real". Era dado de
 * teste que nunca foi trocado. Foi removido: num produto que fala com vítimas
 * de golpe, inventar processo criminal destrói a credibilidade de tudo mais
 * que a página afirma.
 *
 * Também não exibimos foto. Os casos reais não trazem imagem, e publicar
 * retrato de pessoa condenada, extraído de notícia, é risco sem retorno.
 */

type Category = 'romance_scam' | 'sextortion'

interface CarouselCase {
  id: string
  category: Category
  title: string
  subtitle: string
  crime: string
  excerpt?: string
  amount: string
  status: string
  year: number
  source: string
  sourceLabel: string
}

interface RawScamCase {
  id: string
  name: string
  flag?: string
  country?: string
  crime: string
  excerpt?: string
  amount: string
  status: string
  year: number
  source: string
  sourceLabel: string
}

interface RawExtortionCase {
  id: string
  title: string
  location: string
  month?: string
  crime: string
  amount: string
  status: string
  year: number
  source: string
  sourceLabel: string
}

/** Intercala as duas categorias para não exibir cinco do mesmo tipo seguidos. */
function interleave(a: CarouselCase[], b: CarouselCase[]): CarouselCase[] {
  const out: CarouselCase[] = []
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i])
    if (b[i]) out.push(b[i])
  }
  return out
}

export default function ProfileCarousel() {
  const [cases, setCases] = useState<CarouselCase[]>([])
  const [current, setCurrent] = useState(0)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [scamRes, extRes] = await Promise.all([
          fetch('/data/scam-cases.json'),
          fetch('/data/extortion-cases.json'),
        ])
        const scam = await scamRes.json()
        const ext = await extRes.json()
        if (!active) return

        const scamCases: CarouselCase[] = (scam.cases || []).map((c: RawScamCase) => ({
          id: c.id,
          category: 'romance_scam' as const,
          title: c.name,
          subtitle: [c.flag, c.country].filter(Boolean).join(' '),
          crime: c.crime,
          excerpt: c.excerpt,
          amount: c.amount,
          status: c.status,
          year: c.year,
          source: c.source,
          sourceLabel: c.sourceLabel,
        }))

        const extCases: CarouselCase[] = (ext.cases || []).map((c: RawExtortionCase) => ({
          id: c.id,
          category: 'sextortion' as const,
          title: c.title,
          subtitle: c.location,
          crime: c.crime,
          amount: c.amount,
          status: c.status,
          year: c.year,
          source: c.source,
          sourceLabel: c.sourceLabel,
        }))

        setCases(interleave(scamCases, extCases))
      } catch {
        /* sem dados, o carrossel simplesmente não aparece */
      }
    }

    void load()
    return () => {
      active = false
    }
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
  const Icon = isRomance ? HeartCrack : AlertTriangle

  return (
    <div className="w-full">
      <div className="relative bg-surface/80 backdrop-blur-sm border border-surface-border rounded-2xl overflow-hidden">
        {/* Categoria */}
        <div
          className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-center ${
            isRomance ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
          }`}
        >
          {isRomance ? '⚠ Golpe romântico' : '⚠ Sextorsão'}
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div
              className={`h-12 w-12 rounded-xl border flex items-center justify-center shrink-0 transition-colors duration-500 ${
                isRomance
                  ? 'bg-red-500/10 border-red-500/25'
                  : 'bg-orange-500/10 border-orange-500/25'
              }`}
            >
              <Icon className={`h-5 w-5 ${isRomance ? 'text-red-400' : 'text-orange-400'}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-white font-display font-bold text-sm leading-tight">
                  {c.title}
                </p>
                <span
                  className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 transition-colors duration-500 ${
                    showDetail
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                      : 'bg-surface-light text-gray-500'
                  }`}
                >
                  {c.status.split('—')[0].trim()}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {c.subtitle} · {c.year}
              </p>
            </div>
          </div>

          <p
            className={`text-[10px] leading-relaxed mb-3 transition-colors duration-500 ${
              showDetail ? 'text-gray-300' : 'text-gray-500'
            }`}
          >
            {c.excerpt || c.crime}
          </p>

          <div className="flex items-center justify-between text-[9px] text-gray-500 mb-2">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3 text-gold" />
              <span className="text-gold font-bold">{c.amount}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <a
              href={c.source}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[9px] text-gray-600 hover:text-gold transition-colors"
            >
              {c.sourceLabel} <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <div className="flex items-center gap-0.5">
              {cases.map((item, i) => (
                <div
                  key={item.id}
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

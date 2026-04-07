import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  Camera,
  Check,
  ChevronDown,
  Clock,
  Eye,
  Globe,
  Heart,
  Lock,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Star,
  Users,
} from 'lucide-react'
import ShimmerButton from '../components/effects/ShimmerButton'
import FadeInView from '../components/effects/FadeInView'
import LanguageSelector from '../components/LanguageSelector'
import ScamCasesPanel from '../components/ScamCasesPanel'

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const scoreColors: Record<string, string> = {
  HIGH: 'bg-red-500/15 text-red-400 border-red-500/30',
  MODERATE: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  LOW: 'bg-green-500/15 text-green-400 border-green-500/30',
  NONE: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
}

/* ------------------------------------------------------------------ */
/*  FAQ Accordion Item                                                 */
/* ------------------------------------------------------------------ */

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-surface-border last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
      >
        <span className="text-white text-sm font-medium pr-4 group-hover:text-gold transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180 text-gold' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-60 pb-4' : 'max-h-0'
        }`}
      >
        <p className="text-gray-400 text-xs leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Landing() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const exampleResults = [
    {
      initials: 'MS',
      name: 'Maria S.',
      score: t('results.score_high'),
      scoreKey: 'HIGH',
      desc: t('results.found_in', { count: 3 }),
      platforms: ['OnlyFans', 'Privacy', 'Instagram'],
      bgColor: 'bg-pink-500/15',
      textColor: 'text-pink-300',
    },
    {
      initials: 'CR',
      name: 'Carlos R.',
      score: t('results.score_none'),
      scoreKey: 'NONE',
      desc: t('results.none_found'),
      platforms: [],
      bgColor: 'bg-blue-500/15',
      textColor: 'text-blue-300',
    },
    {
      initials: 'AP',
      name: 'Ana P.',
      score: t('results.score_moderate'),
      scoreKey: 'MODERATE',
      desc: t('results.suspect', { count: 1 }),
      platforms: ['Fansly'],
      bgColor: 'bg-purple-500/15',
      textColor: 'text-purple-300',
    },
  ]

  const personas = [
    { key: 'partners', icon: Heart },
    { key: 'dating', icon: Smartphone },
    { key: 'business', icon: Users },
  ]

  const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6']

  const trustBadges = [
    { icon: Lock, key: 'encryption' },
    { icon: Shield, key: 'compliance' },
    { icon: Eye, key: 'discreet' },
    { icon: Globe, key: 'global' },
  ]

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* ===== PHONE FRAME WRAPPER (desktop) ===== */}
      <div className="w-full lg:flex lg:items-center lg:justify-center lg:min-h-screen lg:py-8">
        <div className="w-full max-w-[480px] mx-auto lg:border lg:border-surface-border lg:rounded-[2.5rem] lg:shadow-2xl lg:shadow-black/50 lg:overflow-hidden lg:max-h-[90vh] lg:overflow-y-auto lg:relative scrollbar-phone">
          {/* Phone notch (desktop only) */}
          <div className="hidden lg:flex justify-center pt-2 pb-0 bg-bg sticky top-0 z-50">
            <div className="w-28 h-6 bg-surface rounded-full" />
          </div>

          {/* ===== TOP BAR ===== */}
          <header className="sticky top-0 lg:top-8 z-40 bg-bg/90 backdrop-blur-md border-b border-surface-border">
            <div className="px-5 h-14 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-gold" />
                <span className="font-display font-bold text-base text-white">
                  <span className="text-gold">[18+]</span>Check
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <LanguageSelector />
                <ShimmerButton href="/register" className="!px-4 !py-2 !text-xs !rounded-md">
                  {t('nav.investigate')}
                </ShimmerButton>
              </div>
            </div>
          </header>

          {/* ===== MAIN CONTENT ===== */}
          <main className="pb-20">
            {/* --- HERO (emocional) --- */}
            <section className="px-5 pt-8 pb-2 relative overflow-hidden">
              <div className="absolute inset-x-0 top-14 h-48 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />

              {/* --- PLATFORM LOGOS BANNER (blurred background) --- */}
              <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-[0.06]">
                  <div className="flex items-center gap-4 whitespace-nowrap animate-[scroll-left_25s_linear_infinite]">
                    {['Tinder', 'OnlyFans', 'Pornhub', 'Bumble', 'Fansly', 'Grindr', 'Hinge', 'Badoo', 'Tinder', 'OnlyFans', 'Pornhub', 'Bumble'].map((name, i) => (
                      <span key={`r1-${i}`} className="text-white font-display font-bold text-2xl blur-[1.5px]">{name}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 whitespace-nowrap animate-[scroll-right_30s_linear_infinite]">
                    {['XVideos', 'Chaturbate', 'Ashley Madison', 'Stripchat', 'ManyVids', 'Happn', 'XVideos', 'Chaturbate', 'Ashley Madison', 'Stripchat'].map((name, i) => (
                      <span key={`r2-${i}`} className="text-white font-display font-bold text-xl blur-[1.5px]">{name}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 whitespace-nowrap animate-[scroll-left_20s_linear_infinite]">
                    {['LiveJasmin', 'Seeking', 'AdultFriendFinder', 'Cam4', 'Privacy', 'Fetlife', 'LiveJasmin', 'Seeking', 'AdultFriendFinder', 'Cam4'].map((name, i) => (
                      <span key={`r3-${i}`} className="text-white font-display font-bold text-lg blur-[1.5px]">{name}</span>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-bg/80 via-transparent to-bg/80" />
              </div>

              <FadeInView delay={0}>
                <h1 className="text-center font-display font-bold text-[1.6rem] leading-tight text-white mb-2">
                  {t('hero.headline')}{' '}
                  <span className="text-gold">{t('hero.headline_highlight')}</span>?
                </h1>
              </FadeInView>

              <FadeInView delay={0.05}>
                <p
                  className="text-center text-gray-400 text-sm mb-1 font-body leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: t('hero.subtitle') + '<br/>' + t('hero.subtitle2'),
                  }}
                />
              </FadeInView>

              <FadeInView delay={0.1}>
                <div className="flex justify-center mt-2 mb-4">
                  <span className="text-[10px] bg-gold/10 text-gold border border-gold/20 rounded-full px-3 py-1 font-medium">
                    {t('hero.badge')}
                  </span>
                </div>
              </FadeInView>
            </section>

            {/* --- SEARCH BAR --- */}
            <section className="px-5 pb-4">
              <FadeInView delay={0.15}>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => navigate('/register')}
                >
                  <div className="flex-1 bg-surface rounded-xl border border-surface-border px-4 py-3 flex items-center gap-3 hover:border-gold/30 transition-colors">
                    <Search className="h-4 w-4 text-gray-500 shrink-0" />
                    <span className="text-sm text-gray-500 font-body">{t('hero.search_placeholder')}</span>
                  </div>
                  <button className="bg-gold text-black font-semibold px-4 py-3 rounded-xl text-sm shrink-0 hover:bg-gold-light transition-colors">
                    {t('hero.search_button')}
                  </button>
                </div>
              </FadeInView>
            </section>

            {/* --- GLOBAL NUMBERS --- */}
            <section className="px-5 py-5 border-t border-surface-border">
              <FadeInView delay={0.2}>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-surface rounded-xl border border-surface-border p-3">
                    <Globe className="h-4 w-4 text-gold mx-auto mb-1" />
                    <p className="text-gold font-display font-bold text-sm leading-tight">{t('stats.visits_number', { defaultValue: '20 billion+' })}</p>
                    <p className="text-[9px] text-gray-500 mt-1">{t('stats.visits')}</p>
                  </div>
                  <div className="bg-surface rounded-xl border border-surface-border p-3">
                    <Users className="h-4 w-4 text-gold mx-auto mb-1" />
                    <p className="text-gold font-display font-bold text-sm leading-tight">{t('stats.creators_number', { defaultValue: '6 million+' })}</p>
                    <p className="text-[9px] text-gray-500 mt-1">{t('stats.creators')}</p>
                  </div>
                  <div className="bg-surface rounded-xl border border-surface-border p-3">
                    <Eye className="h-4 w-4 text-gold mx-auto mb-1" />
                    <p className="text-gold font-display font-bold text-sm leading-tight">{t('stats.platforms_number', { defaultValue: '50+' })}</p>
                    <p className="text-[9px] text-gray-500 mt-1">{t('stats.platforms')}</p>
                  </div>
                </div>
              </FadeInView>
            </section>

            {/* --- AWARENESS BANNER --- */}
            <section className="px-5 pb-4">
              <FadeInView delay={0.25}>
                <div className="bg-gold/5 border border-gold/15 rounded-xl p-3.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                    <p
                      className="text-[11px] text-white font-medium leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: t('awareness.text').replace(/<gold>/g, '<span class="text-gold">').replace(/<\/gold>/g, '</span>'),
                      }}
                    />
                  </div>
                </div>
              </FadeInView>
            </section>

            {/* --- EXAMPLE RESULTS --- */}
            <section className="px-5 pb-6">
              <FadeInView delay={0.25}>
                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-3">
                  {t('results.title')}
                </p>
              </FadeInView>

              <div className="space-y-3">
                {exampleResults.map((r, i) => (
                  <FadeInView key={r.name} delay={0.3 + i * 0.08}>
                    <div className="bg-surface rounded-xl border border-surface-border p-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-11 w-11 rounded-full ${r.bgColor} flex items-center justify-center shrink-0`}>
                          <span className={`text-sm font-bold ${r.textColor}`}>{r.initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-white font-semibold text-sm">{r.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scoreColors[r.scoreKey]}`}>
                              {r.score}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                        </div>
                      </div>
                      {r.platforms.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pl-14">
                          {r.platforms.map((p) => (
                            <span key={p} className="text-[10px] text-gold/80 bg-gold/8 border border-gold/15 rounded-md px-2 py-0.5 font-medium">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </FadeInView>
                ))}
              </div>
            </section>

            {/* --- PARA QUEM --- */}
            <section className="px-5 py-6 border-t border-surface-border">
              <FadeInView delay={0.1}>
                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-4 text-center">
                  {t('personas.title')}
                </p>
              </FadeInView>

              <div className="space-y-3">
                {personas.map((p, i) => {
                  const Icon = p.icon
                  return (
                    <FadeInView key={p.key} delay={0.15 + i * 0.08}>
                      <div className="flex items-start gap-3 bg-surface rounded-xl border border-surface-border p-3.5">
                        <div className="h-9 w-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-gold" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{t(`personas.${p.key}_title`)}</p>
                          <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{t(`personas.${p.key}_desc`)}</p>
                        </div>
                      </div>
                    </FadeInView>
                  )
                })}
              </div>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section className="px-5 py-6 border-t border-surface-border">
              <FadeInView delay={0.1}>
                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-4 text-center">
                  {t('how_it_works.title')}
                </p>
                <div className="flex items-start justify-between gap-2">
                  {[
                    { icon: Camera, key: 'step1', step: '1' },
                    { icon: Search, key: 'step2', step: '2' },
                    { icon: Check, key: 'step3', step: '3' },
                  ].map((s) => (
                    <div key={s.key} className="flex flex-col items-center gap-2 flex-1">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                          <s.icon className="h-4 w-4 text-gold" />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 bg-gold text-black text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                          {s.step}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-300 text-center font-medium">
                        {t(`how_it_works.${s.key}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </FadeInView>
            </section>

            {/* --- PRICING --- */}
            <section className="px-5 py-6 border-t border-surface-border">
              <FadeInView delay={0.1}>
                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-1 text-center">
                  {t('pricing.title')}
                </p>
                <p className="text-[10px] text-gold/70 text-center mb-4">
                  {t('pricing.subtitle')}
                </p>
              </FadeInView>

              {/* Single Investigation */}
              <FadeInView delay={0.15}>
                <div className="relative rounded-xl border border-gold/40 shadow-md shadow-gold/5 bg-bg p-4 mb-3">
                  <div className="absolute -top-2.5 left-4 bg-gold text-black text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 z-10">
                    <Star className="h-2.5 w-2.5" /> {t('pricing.popular')}
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-bold text-sm text-white">{t('pricing.single_name')}</h3>
                      <div className="mt-1">
                        <span className="font-display font-extrabold text-2xl text-white">{t('pricing.single_price', { defaultValue: 'R$ 129' })}</span>
                      </div>
                      <p className="text-[10px] text-gold font-medium mt-0.5">{t('pricing.single_credits')}</p>
                    </div>
                    <Link to="/register" className="text-center text-[11px] font-semibold px-3 py-2 rounded-lg bg-gold text-black hover:bg-gold-light transition-colors shrink-0 mt-1">
                      {t('pricing.single_cta')}
                    </Link>
                  </div>
                  <ul className="mt-3 grid grid-cols-1 gap-1.5">
                    {['single_f1', 'single_f2', 'single_f3', 'single_f4', 'single_f5'].map((k) => (
                      <li key={k} className="flex items-start gap-1.5 text-[10px] text-gray-400">
                        <Check className="h-3 w-3 text-gold shrink-0 mt-0.5" />
                        <span>{t(`pricing.${k}`)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[9px] text-gray-600 line-through text-center">{t('pricing.single_compare')}</p>
                </div>
              </FadeInView>

              {/* Pro Monitoring */}
              <FadeInView delay={0.2}>
                <div className="rounded-xl border border-surface-border bg-bg p-4 mb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-bold text-sm text-white">{t('pricing.pro_name')}</h3>
                      <div className="mt-1">
                        <span className="font-display font-extrabold text-2xl text-white">{t('pricing.pro_price', { defaultValue: 'R$ 479' })}</span>
                        <span className="text-gray-500 text-[10px] ml-0.5">{t('pricing.pro_period', { defaultValue: '/mês' })}</span>
                      </div>
                      <p className="text-[10px] text-gold font-medium mt-0.5">{t('pricing.pro_credits')}</p>
                    </div>
                    <Link to="/register" className="text-center text-[11px] font-semibold px-3 py-2 rounded-lg border border-gold/40 text-gold hover:bg-gold/10 transition-colors shrink-0 mt-1">
                      {t('pricing.pro_cta')}
                    </Link>
                  </div>
                  <ul className="mt-3 grid grid-cols-1 gap-1.5">
                    {['pro_f1', 'pro_f2', 'pro_f3', 'pro_f4', 'pro_f5', 'pro_f6'].map((k) => (
                      <li key={k} className="flex items-start gap-1.5 text-[10px] text-gray-400">
                        <Check className="h-3 w-3 text-gold shrink-0 mt-0.5" />
                        <span>{t(`pricing.${k}`)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[9px] text-gray-600 line-through text-center">{t('pricing.pro_compare')}</p>
                </div>
              </FadeInView>

              {/* Extra credits */}
              <FadeInView delay={0.3}>
                <div className="rounded-xl border border-surface-border bg-surface p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-white font-medium">{t('pricing.extra_title')}</p>
                    <p className="text-[10px] text-gray-400">
                      <span className="text-gold font-bold">{t('pricing.extra_price')}</span> {t('pricing.extra_desc')}
                    </p>
                  </div>
                  <Link to="/register" className="text-[10px] text-gold border border-gold/30 px-3 py-1.5 rounded-lg font-semibold hover:bg-gold/10 transition-colors shrink-0">
                    {t('pricing.extra_cta')}
                  </Link>
                </div>
              </FadeInView>
            </section>

            {/* --- FAQ --- */}
            <section className="px-5 py-6 border-t border-surface-border">
              <FadeInView delay={0.1}>
                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-4 text-center">
                  {t('faq.title')}
                </p>
              </FadeInView>

              <FadeInView delay={0.15}>
                <div className="rounded-xl border border-surface-border bg-surface px-4">
                  {faqKeys.map((key) => (
                    <FAQItem key={key} q={t(`faq.${key}`)} a={t(`faq.a${key.slice(1)}`)} />
                  ))}
                </div>
              </FadeInView>
            </section>

            {/* --- SCAM CASES PANEL --- */}
            <ScamCasesPanel />

            {/* --- TRUST BADGES --- */}
            <section className="px-5 py-4 border-t border-surface-border">
              <FadeInView delay={0.1}>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {trustBadges.map((badge) => (
                    <div key={badge.key} className="flex items-center gap-1.5 bg-surface rounded-lg border border-surface-border px-2.5 py-1.5">
                      <badge.icon className="h-3 w-3 text-gold/60" />
                      <span className="text-[9px] text-gray-400 font-medium">{t(`trust.${badge.key}`)}</span>
                    </div>
                  ))}
                </div>
              </FadeInView>
            </section>

            {/* --- FINAL CTA --- */}
            <section className="px-5 py-8 border-t border-surface-border text-center">
              <FadeInView delay={0.1}>
                <p className="text-white font-display font-bold text-lg mb-1">
                  {t('cta.headline')}
                </p>
                <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">
                  {t('cta.subtext')}
                  <br />
                  <span dangerouslySetInnerHTML={{
                    __html: t('cta.scams').replace(/<gold>/g, '<span class="text-gold font-semibold">').replace(/<\/gold>/g, '</span>'),
                  }} />
                  <br />
                  {t('cta.deserve')}
                </p>
                <p className="text-[10px] text-gray-500 mb-5">
                  {t('cta.global_note')}
                </p>
                <ShimmerButton href="/register">
                  {t('cta.button')}
                </ShimmerButton>
              </FadeInView>
            </section>
          </main>

          {/* ===== BOTTOM NAV BAR ===== */}
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-surface-border lg:sticky lg:bottom-0">
            <div className="max-w-[480px] mx-auto flex items-center justify-around h-14">
              <Link to="/register" className="flex flex-col items-center gap-0.5 text-gold">
                <Search className="h-5 w-5" />
                <span className="text-[10px] font-medium">{t('nav.search')}</span>
              </Link>
              <Link to="/login" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-gray-300 transition-colors">
                <Clock className="h-5 w-5" />
                <span className="text-[10px] font-medium">{t('nav.history')}</span>
              </Link>
              <Link to="/login" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-gray-300 transition-colors">
                <Settings className="h-5 w-5" />
                <span className="text-[10px] font-medium">{t('nav.account')}</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}

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
import ExtortionCasesPanel from '../components/ExtortionCasesPanel'
import ProfileCarousel from '../components/ProfileCarousel'

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

  const personas = [
    { key: 'partners', icon: Heart },
    { key: 'dating', icon: Smartphone },
    { key: 'business', icon: Users },
    { key: 'hr', icon: Settings },
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
      <div className="w-full">
        <div className="w-full max-w-[720px] mx-auto">

          {/* ===== TOP BAR ===== */}
          <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-surface-border">
            <div className="px-5 md:px-8md:px-8 h-14 flex items-center justify-between">
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
            {/* --- HERO SLOGAN --- */}
            <section className="px-5 md:px-8pt-8 pb-3 text-center">
              <FadeInView delay={0}>
                <h1 className="font-display font-bold text-xl md:text-3xl leading-tight text-white mb-2 md:mb-3">
                  Você conhece mesmo quem<br />
                  <span className="text-gold">dorme ao seu lado?</span>
                </h1>
                <p className="text-[12px] md:text-sm text-gray-400 font-body leading-relaxed max-w-[320px] md:max-w-[460px] mx-auto">
                  Investigamos 50+ plataformas adultas e de encontros.<br />
                  <span className="text-gray-300 font-medium">Discreto. Rápido. Definitivo.</span>
                </p>
              </FadeInView>
            </section>

            {/* --- HERO: PROFILE CAROUSEL --- */}
            <section className="px-5 md:px-8pt-2 pb-2">
              <FadeInView delay={0.1}>
                <ProfileCarousel />
              </FadeInView>
            </section>

            {/* --- CTA BUTTON --- */}
            <section className="px-5 md:px-8pb-4">
              <FadeInView delay={0.2}>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-gold text-black font-display font-bold py-3.5 rounded-xl text-sm hover:bg-gold-light transition-colors"
                >
                  Será que é do Job? Descubra agora
                </button>
                <div
                  className="flex items-center gap-2 cursor-pointer mt-3"
                  onClick={() => navigate('/register')}
                >
                  <div className="flex-1 bg-surface rounded-xl border border-surface-border px-4 py-3 flex items-center gap-3 hover:border-gold/30 transition-colors">
                    <Search className="h-4 w-4 text-gray-500 shrink-0" />
                    <span className="text-sm text-gray-500 font-body">{t('hero.search_placeholder')}</span>
                  </div>
                </div>
              </FadeInView>
            </section>

            {/* --- PLATFORM SCREENSHOTS BANNER --- */}
            <section className="py-2 overflow-hidden" aria-hidden="true">
              <div className="flex items-center gap-2 animate-[scroll-left_50s_linear_infinite] w-max">
                {[
                  { src: '/platforms/tinder.jpg', adult: false },
                  { src: '/platforms/xvideos.jpg', adult: true },
                  { src: '/platforms/dating.jpg', adult: false },
                  { src: '/platforms/pornhub.jpg', adult: true },
                  { src: '/platforms/xhamster.jpg', adult: true },
                  { src: '/platforms/xnxx.jpg', adult: true },
                  { src: '/platforms/tinder.jpg', adult: false },
                  { src: '/platforms/xvideos.jpg', adult: true },
                  { src: '/platforms/dating.jpg', adult: false },
                  { src: '/platforms/pornhub.jpg', adult: true },
                  { src: '/platforms/xhamster.jpg', adult: true },
                  { src: '/platforms/xnxx.jpg', adult: true },
                ].map((img, i) => (
                  <img
                    key={i}
                    src={img.src}
                    alt=""
                    className={`h-16 w-28 object-cover rounded-md shrink-0 ${img.adult ? 'blur-[0.6px]' : ''}`}
                    loading="lazy"
                  />
                ))}
              </div>
            </section>

            {/* --- GLOBAL NUMBERS --- */}
            <section className="px-5 md:px-8py-5 border-t border-surface-border">
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
            <section className="px-5 md:px-8pb-4">
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

            {/* --- TESTIMONIALS --- */}
            <section className="px-5 md:px-8pb-6">
              <FadeInView delay={0.25}>
                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-1 text-center">
                  Veja o que nossos usuários descobriram
                </p>
                <p className="text-[10px] text-gold/60 text-center mb-4">
                  Histórias reais de quem teve coragem de saber a verdade
                </p>
              </FadeInView>

              <div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
                {[
                  {
                    slug: 'user-01', flag: '🇺🇸', name: 'Sarah M.', location: 'Texas, EUA',
                    score: 'ALTO', scoreKey: 'HIGH',
                    text: 'Estávamos juntos há 2 anos. O [18+]Check encontrou 3 perfis ativos no OnlyFans que ele escondia. Eu merecia saber.',
                    platforms: ['OnlyFans', 'Fansly'],
                  },
                  {
                    slug: 'user-02', flag: '🇧🇷', name: 'Rafael T.', location: 'São Paulo, Brasil',
                    score: 'ALTO', scoreKey: 'HIGH',
                    text: 'Minha noiva tinha perfil ativo em 2 plataformas adultas. Descobri a 3 meses do casamento. Melhor saber antes do que depois.',
                    platforms: ['Privacy', 'XVideos'],
                  },
                  {
                    slug: 'user-03', flag: '🇬🇧', name: 'Emma L.', location: 'Londres, UK',
                    score: 'ALTO', scoreKey: 'HIGH',
                    text: 'He told me he was a consultant. The facial scan matched him to 5 escort profiles across Europe. Absolutely shocking.',
                    platforms: ['EscortDirectory', 'AdultWork'],
                  },
                  {
                    slug: 'user-04', flag: '🇩🇪', name: 'Thomas K.', location: 'Berlim, Alemanha',
                    score: 'NENHUM', scoreKey: 'NONE',
                    text: 'Ich hatte Zweifel, aber der Bericht war eindeutig: nichts gefunden. Jetzt habe ich Sicherheit und Vertrauen zurück.',
                    platforms: [],
                  },
                  {
                    slug: 'user-05', flag: '🇲🇽', name: 'Carolina V.', location: 'Cidade do México',
                    score: 'ALTO', scoreKey: 'HIGH',
                    text: 'Mi esposo viajaba mucho "por trabajo". El escaneo facial lo encontró en apps de citas en 3 países diferentes. Le confronté con las pruebas.',
                    platforms: ['Tinder', 'Bumble', 'Ashley Madison'],
                  },
                  {
                    slug: 'user-06', flag: '🇫🇷', name: 'Marie D.', location: 'Paris, França',
                    score: 'MODERADO', scoreKey: 'MODERATE',
                    text: "J'ai trouvé son profil sur un site de rencontres alors qu'on était ensemble depuis 4 ans. Le rapport m'a ouvert les yeux.",
                    platforms: ['Gleeden'],
                  },
                  {
                    slug: 'user-07', flag: '🇯🇵', name: 'Yuki S.', location: 'Tóquio, Japão',
                    score: 'ALTO', scoreKey: 'HIGH',
                    text: '3年間信じていた彼が、別の名前でアダルトサイトにプロフィールを持っていました。このサービスがなかったら、一生知らなかったかもしれません。',
                    platforms: ['FC2', 'DXLive'],
                  },
                  {
                    slug: 'user-08', flag: '🇦🇺', name: 'James W.', location: 'Sydney, Austrália',
                    score: 'ALTO', scoreKey: 'HIGH',
                    text: 'My girlfriend of 18 months had an active adult profile with 200+ posts. The facial recognition matched her instantly. I needed to know.',
                    platforms: ['OnlyFans', 'ManyVids'],
                  },
                  {
                    slug: 'user-09', flag: '🇮🇹', name: 'Giulia R.', location: 'Milão, Itália',
                    score: 'NENHUM', scoreKey: 'NONE',
                    text: 'Avevo dei sospetti dopo che ha cambiato la password del telefono. Il rapporto è tornato pulito. Ora posso fidarmi di nuovo.',
                    platforms: [],
                  },
                  {
                    slug: 'user-10', flag: '🇰🇷', name: 'Min-ji P.', location: 'Seul, Coreia do Sul',
                    score: 'ALTO', scoreKey: 'HIGH',
                    text: '소개팅 앱에서 만난 남자가 다른 이름으로 성인 사이트에 활동하고 있었어요. 첫 데이트 전에 확인해서 다행이에요.',
                    platforms: ['AfreecaTV'],
                  },
                ].map((t, i) => (
                  <FadeInView key={t.name} delay={0.3 + i * 0.06}>
                    <div className="bg-surface rounded-xl border border-surface-border p-4">
                      <div className="flex items-start gap-3">
                        <img
                          src={`/assets/profiles/${t.slug}.jpg`}
                          alt=""
                          className="h-11 w-11 rounded-full object-cover shrink-0 border border-surface-border blur-[1.5px]"
                          onError={(e) => {
                            const el = e.currentTarget
                            if (el.src.endsWith('.jpg')) el.src = `/assets/profiles/${t.slug}.svg`
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-white font-semibold text-sm">{t.flag} {t.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scoreColors[t.scoreKey]}`}>
                              {t.score}
                            </span>
                          </div>
                          <p className="text-[9px] text-gray-500">{t.location}</p>
                          <p className="text-[11px] text-gray-300 mt-1.5 leading-relaxed italic">"{t.text}"</p>
                        </div>
                      </div>
                      {t.platforms.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pl-14">
                          {t.platforms.map((p) => (
                            <span key={p} className="text-[10px] text-red-400/80 bg-red-500/8 border border-red-500/15 rounded-md px-2 py-0.5 font-medium">
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
            <section className="px-5 md:px-8py-6 border-t border-surface-border">
              <FadeInView delay={0.1}>
                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-4 text-center">
                  {t('personas.title')}
                </p>
              </FadeInView>

              <div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
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

              {/* --- ALERTA: GOLPE DE VÍDEOS ÍNTIMOS --- */}
              <FadeInView delay={0.4}>
                <div className="mt-5 bg-red-500/5 border border-red-500/20 rounded-xl p-4 md:p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
                      <Camera className="h-4 w-4 text-red-400" />
                    </div>
                    <div>
                      <p className="text-red-400 text-sm font-display font-bold mb-1.5">
                        Você tem certeza que seus vídeos íntimos não estão sendo vendidos?
                      </p>
                      <p className="text-gray-300 text-xs leading-relaxed mb-2">
                        Um golpe crescente no mundo todo: parceiros gravam vídeos íntimos — às vezes com seu consentimento, às vezes escondido — e depois vendem em plataformas adultas internacionais, fora do seu país de origem, onde você jamais descobriria sozinha.
                      </p>
                      <p className="text-gray-300 text-xs leading-relaxed mb-2">
                        Eles dizem que filmam "por prazer", "para nós dois". Mas o destino real são sites como OnlyFans, XVideos, Pornhub e dezenas de plataformas menores. Milhares de vítimas só descobrem quando já é tarde demais.
                      </p>
                      <p className="text-white text-xs font-semibold leading-relaxed">
                        O [18+]Check usa reconhecimento facial para varrer 50+ plataformas e descobrir se sua imagem aparece em algum lugar que você não autorizou. Proteja sua dignidade.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInView>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section className="px-5 md:px-8py-6 border-t border-surface-border">
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

            {/* --- PROMO FLASH BANNER --- */}
            <section className="px-5 md:px-8pt-6 pb-2 border-t border-surface-border">
              <FadeInView delay={0.1}>
                <div className="relative bg-gradient-to-r from-red-600/20 via-red-500/10 to-red-600/20 border border-red-500/40 rounded-xl p-4 text-center overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
                  <p className="text-[10px] text-red-400 uppercase tracking-[3px] font-bold mb-1">Promoção Relâmpago</p>
                  <p className="font-display font-extrabold text-lg text-white leading-tight">
                    Até <span className="text-red-400">75% OFF</span> em todos os planos
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">Oferta por tempo limitado — vagas preenchendo rápido</p>
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <div className="text-center">
                      <p className="text-[8px] text-gray-500 uppercase">Única</p>
                      <p className="font-display font-bold text-sm text-gold">R$ 51</p>
                      <p className="text-[8px] text-red-400 font-bold">60% OFF</p>
                    </div>
                    <div className="w-px h-8 bg-red-500/30" />
                    <div className="text-center">
                      <p className="text-[8px] text-gray-500 uppercase">Pro/mês</p>
                      <p className="font-display font-bold text-sm text-gold">R$ 119</p>
                      <p className="text-[8px] text-red-400 font-bold">75% OFF</p>
                    </div>
                  </div>
                </div>
              </FadeInView>
            </section>

            {/* --- PRICING --- */}
            <section className="px-5 md:px-8py-4">
              <FadeInView delay={0.15}>
                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-1 text-center">
                  {t('pricing.title')}
                </p>
                <p className="text-[10px] text-gold/70 text-center mb-4">
                  {t('pricing.subtitle')}
                </p>
              </FadeInView>

              <div className="md:grid md:grid-cols-2 md:gap-4">
              {/* Single Investigation — 60% OFF */}
              <FadeInView delay={0.18}>
                <div className="relative rounded-xl border-2 border-gold/50 shadow-lg shadow-gold/10 bg-bg p-4 mb-3">
                  <div className="absolute -top-2.5 left-4 bg-red-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 z-10 animate-pulse">
                    60% OFF
                  </div>
                  <div className="absolute -top-2.5 right-4 bg-gold text-black text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 z-10">
                    <Star className="h-2.5 w-2.5" /> {t('pricing.popular')}
                  </div>
                  <div className="flex items-start justify-between mt-1">
                    <div>
                      <h3 className="font-display font-bold text-sm text-white">{t('pricing.single_name')}</h3>
                      <p className="text-[10px] text-gold font-medium">{t('pricing.single_credits')}</p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-gray-500 line-through text-sm">R$ 129</span>
                        <span className="font-display font-extrabold text-2xl text-gold">R$ 51</span>
                      </div>
                      <p className="text-[9px] text-red-400 font-semibold mt-0.5">Economia de R$ 78</p>
                    </div>
                    <Link to="/register" className="text-center text-[11px] font-bold px-3 py-2.5 rounded-lg bg-gold text-black hover:bg-gold-light transition-colors shrink-0 mt-2">
                      Quero 60% OFF
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

              {/* Pro Monitoring — 75% OFF */}
              <FadeInView delay={0.22}>
                <div className="relative rounded-xl border-2 border-red-500/50 shadow-lg shadow-red-500/10 bg-bg p-4 mb-3">
                  <div className="absolute -top-2.5 left-4 bg-red-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 z-10 animate-pulse">
                    75% OFF
                  </div>
                  <div className="flex items-start justify-between mt-1">
                    <div>
                      <h3 className="font-display font-bold text-sm text-white">{t('pricing.pro_name')}</h3>
                      <p className="text-[10px] text-gold font-medium">{t('pricing.pro_credits')}</p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-gray-500 line-through text-sm">R$ 479/mês</span>
                        <span className="font-display font-extrabold text-2xl text-gold">R$ 119</span>
                        <span className="text-gold/70 text-[10px]">/mês</span>
                      </div>
                      <p className="text-[9px] text-red-400 font-semibold mt-0.5">Economia de R$ 360/mês</p>
                    </div>
                    <Link to="/register" className="text-center text-[11px] font-bold px-3 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-400 transition-colors shrink-0 mt-2">
                      Quero 75% OFF
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
              </div>

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

            {/* --- LEGAL SUPPORT --- */}
            <section className="px-5 md:px-8py-6 border-t border-surface-border">
              <FadeInView delay={0.1}>
                <div className="bg-gold/5 border border-gold/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-5 w-5 text-gold" />
                    <p className="text-[11px] text-gold uppercase tracking-widest font-semibold">
                      {t('legal_support.title')}
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-4">{t('legal_support.subtitle')}</p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                        <span className="text-gold font-bold text-xs">1</span>
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold">{t('legal_support.service1_title')}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{t('legal_support.service1_desc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                        <span className="text-gold font-bold text-xs">2</span>
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold">{t('legal_support.service2_title')}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{t('legal_support.service2_desc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                        <span className="text-gold font-bold text-xs">3</span>
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold">{t('legal_support.service3_title')}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{t('legal_support.service3_desc')}</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/register"
                    className="flex items-center justify-center w-full mt-4 py-2.5 rounded-xl bg-gold text-black text-xs font-semibold hover:bg-gold-light transition-colors"
                  >
                    {t('legal_support.cta')}
                  </Link>
                </div>
              </FadeInView>
            </section>

            {/* --- FAQ --- */}
            <section className="px-5 md:px-8py-6 border-t border-surface-border">
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

            {/* --- EXTORTION CASES PANEL --- */}
            <ExtortionCasesPanel />

            {/* --- TRUST BADGES --- */}
            <section className="px-5 md:px-8py-4 border-t border-surface-border">
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
            <section className="px-5 md:px-8py-8 border-t border-surface-border text-center">
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

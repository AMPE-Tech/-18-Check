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
import GoldText from '../components/GoldText'

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const scoreColors: Record<string, string> = {
  HIGH: 'bg-red-500/15 text-red-400 border-red-500/30',
  MODERATE: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  LOW: 'bg-green-500/15 text-green-400 border-green-500/30',
  NONE: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
}

/* Gradient divider component */
function Divider() {
  return <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
}

/* ------------------------------------------------------------------ */
/*  Contact Form                                                       */
/* ------------------------------------------------------------------ */

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)

    const to = atob('MThjaGVjay5vbmxpbmVAZ21haWwuY29t')
    const subject = encodeURIComponent(`[18+]Check — Contato de ${form.name}`)
    const body = encodeURIComponent(
      `Nome: ${form.name}\nEmail: ${form.email}\nTelefone: ${form.phone}\nPaís: ${form.country}\n\nRelato:\n${form.message}`
    )

    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`

    setTimeout(() => {
      setSent(true)
      setSending(false)
    }, 1000)
  }

  if (sent) {
    return (
      <div className="bg-surface/50 rounded-2xl border border-gold/20 p-8 text-center max-w-[500px] mx-auto">
        <div className="h-14 w-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
          <Check className="h-6 w-6 text-gold" />
        </div>
        <p className="font-display font-bold text-lg text-white mb-2">Mensagem preparada</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Seu aplicativo de email foi aberto com os dados preenchidos. Envie a mensagem para concluir. Respondemos em até 24h com total sigilo.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface/50 rounded-2xl border border-white/5 p-6 md:p-8 max-w-[500px] mx-auto space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5 block">Nome</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Seu nome"
            className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-gold/40 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5 block">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="seu@email.com"
            className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-gold/40 focus:outline-none transition-colors"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5 block">Telefone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+55 (11) 99999-9999"
            className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-gold/40 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5 block">País</label>
          <input
            type="text"
            required
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            placeholder="Brasil"
            className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-gold/40 focus:outline-none transition-colors"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5 block">Relate seu caso</label>
        <textarea
          required
          rows={5}
          maxLength={500}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Descreva brevemente o que aconteceu. Suas informações são 100% sigilosas."
          className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-gold/40 focus:outline-none transition-colors resize-none"
        />
        <p className="text-[9px] text-gray-600 mt-1 text-right">{form.message.length}/500</p>
      </div>
      <button
        type="submit"
        disabled={sending}
        className="w-full bg-gold text-black font-body font-bold py-3.5 rounded-xl text-sm hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50"
      >
        {sending ? 'Preparando...' : 'Enviar com sigilo'}
      </button>
      <p className="text-[9px] text-gray-600 text-center">
        Suas informações são protegidas por criptografia. Nunca compartilhamos dados com terceiros.
      </p>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/*  FAQ Accordion Item                                                 */
/* ------------------------------------------------------------------ */

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-surface-border/50 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
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
          open ? 'max-h-60 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-gray-400 text-xs leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Testimonials data                                                  */
/* ------------------------------------------------------------------ */

const testimonials = [
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
]

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
        <div className="w-full max-w-[820px] mx-auto">

          {/* ===== TOP BAR ===== */}
          <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-xl border-b border-white/5">
            <div className="px-6 md:px-10 h-20 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-gold" />
                <span className="font-display font-bold text-lg text-white">
                  <span className="text-gold">[18+]</span>Check
                </span>
              </Link>

              {/* Center nav — discreet section links (desktop only) */}
              <nav className="hidden md:flex items-center gap-6">
                <a href="#golpistas" className="text-[11px] font-light text-gray-500 hover:text-white tracking-wide transition-colors">Golpistas</a>
                <a href="#quem-precisa" className="text-[11px] font-light text-gray-500 hover:text-white tracking-wide transition-colors">Quem Precisa</a>
                <a href="#lgpd-gdpr" className="text-[11px] font-light text-gray-500 hover:text-white tracking-wide transition-colors">Vítimas LGPD &amp; GDPR</a>
                <a href="#faq" className="text-[11px] font-light text-gray-500 hover:text-white tracking-wide transition-colors">Dúvidas</a>
              </nav>

              <div className="flex items-center gap-3">
                <LanguageSelector />
                <ShimmerButton href="/register" className="!px-5 !py-2.5 !text-xs !rounded-lg">
                  {t('nav.investigate')}
                </ShimmerButton>
              </div>
            </div>
          </header>

          {/* ===== MAIN CONTENT ===== */}
          <main className="pb-24">

            {/* ============================================================ */}
            {/*  HERO — Cinematográfico                                      */}
            {/* ============================================================ */}
            <section className="relative px-6 md:px-10 pt-16 md:pt-24 pb-14 md:pb-20 text-center overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-red-500/4 rounded-full blur-[120px] pointer-events-none" />

              {/* Layer 1 — Headline (max impact, minimal words) */}
              <FadeInView delay={0}>
                <h1 className="relative font-display font-bold text-[2rem] md:text-[3.5rem] leading-[1.1] tracking-tight text-white">
                  Seus vídeos <span className="italic text-red-400">vazaram?</span>
                </h1>
                <p className="relative font-display italic text-lg md:text-2xl text-gray-300 mt-3 md:mt-4">
                  Seu parceiro é do Job?
                </p>
              </FadeInView>

              {/* Layer 2 — Subheadline (one line, data-driven) */}
              <FadeInView delay={0.1}>
                <p className="relative text-sm md:text-lg text-gray-400 font-body mt-4 md:mt-6">
                  Varredura facial em <span className="text-gold">+50 plataformas</span> adultas. <span className="text-gold">396 milhões</span> de perfis.
                </p>
              </FadeInView>

              {/* Layer 2.5 — Platform screenshots scrolling banner */}
              <FadeInView delay={0.15}>
                <div className="relative mt-6 md:mt-8 -mx-6 md:-mx-10 overflow-hidden" aria-hidden="true">
                  <div className="flex items-center gap-3 animate-[scroll-left_50s_linear_infinite] w-max">
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
                        className={`h-20 w-36 object-cover rounded-lg shrink-0 ${img.adult ? 'blur-[0.6px] opacity-80' : 'opacity-90'}`}
                        loading="lazy"
                      />
                    ))}
                  </div>
                </div>
              </FadeInView>

              {/* Layer 3 — CTA */}
              <FadeInView delay={0.2}>
                <div className="relative mt-8 md:mt-10 max-w-[380px] mx-auto">
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full bg-gold text-black font-body font-bold py-4 rounded-xl text-sm md:text-base tracking-wide hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20"
                  >
                    Descubra agora — 25% OFF
                  </button>
                  <p className="text-[11px] text-gray-600 mt-3">Sigiloso. Resultado em minutos.</p>
                </div>
              </FadeInView>
            </section>

            {/* --- CAROUSEL --- */}
            <section className="px-6 md:px-10 pb-6">
              <FadeInView delay={0.2}>
                <ProfileCarousel />
              </FadeInView>
            </section>

            <Divider />

            {/* ============================================================ */}
            {/*  GOLPISTAS — casos reais (DOJ/FBI/Polícia Civil)             */}
            {/* ============================================================ */}
            <section id="golpistas" className="px-6 md:px-10 pt-12 md:pt-16 pb-4 scroll-mt-20">
              <FadeInView delay={0.1}>
                <div className="text-center mb-10">
                  <p className="text-[9px] text-red-400 uppercase tracking-[3px] font-bold mb-2">⚠️ Golpistas identificados</p>
                  <h2 className="font-display font-bold text-xl md:text-3xl text-white">
                    Não é teoria. <span className="italic text-red-400">Casos reais.</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-3 max-w-2xl mx-auto">
                    Casos investigados e documentados pelo DOJ, FBI e Polícia Civil. Fontes públicas oficiais — atualizado semanalmente.
                  </p>
                </div>
              </FadeInView>

              <ScamCasesPanel />
              <ExtortionCasesPanel />
            </section>

            <Divider />

            {/* ============================================================ */}
            {/*  GLOBAL NUMBERS                                              */}
            {/* ============================================================ */}
            <section className="px-6 md:px-10 py-12 md:py-16">
              <FadeInView delay={0.1}>
                <div className="grid grid-cols-3 gap-3 md:gap-5 text-center">
                  <div className="bg-surface/60 rounded-2xl border border-white/5 p-4 md:p-6">
                    <Globe className="h-5 w-5 text-gold mx-auto mb-2" />
                    <p className="text-gold font-display font-bold text-base md:text-xl leading-tight">{t('stats.visits_number', { defaultValue: '20 billion+' })}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1.5">{t('stats.visits')}</p>
                  </div>
                  <div className="bg-surface/60 rounded-2xl border border-white/5 p-4 md:p-6">
                    <Users className="h-5 w-5 text-gold mx-auto mb-2" />
                    <p className="text-gold font-display font-bold text-base md:text-xl leading-tight">{t('stats.creators_number', { defaultValue: '6 million+' })}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1.5">{t('stats.creators')}</p>
                  </div>
                  <div className="bg-surface/60 rounded-2xl border border-white/5 p-4 md:p-6">
                    <Eye className="h-5 w-5 text-gold mx-auto mb-2" />
                    <p className="text-gold font-display font-bold text-base md:text-xl leading-tight">{t('stats.platforms_number', { defaultValue: '50+' })}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1.5">{t('stats.platforms')}</p>
                  </div>
                </div>
              </FadeInView>
            </section>

            {/* --- AWARENESS BANNER --- */}
            <section className="px-6 md:px-10 pb-12">
              <FadeInView delay={0.15}>
                <div className="bg-gold/5 border border-gold/15 rounded-2xl p-5 md:p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                    <p className="text-xs md:text-sm text-white font-medium leading-relaxed">
                      <GoldText text={t('awareness.text')} />
                    </p>
                  </div>
                </div>
              </FadeInView>
            </section>

            <Divider />

            {/* ============================================================ */}
            {/*  TESTIMONIALS                                                */}
            {/* ============================================================ */}
            <section className="px-6 md:px-10 py-12 md:py-16">
              <FadeInView delay={0.1}>
                <p className="text-xs text-gray-500 uppercase tracking-[3px] font-semibold mb-2 text-center">
                  Veja o que nossos usuários descobriram
                </p>
                <p className="text-sm text-gold/50 text-center mb-8 md:mb-10 font-body">
                  Histórias reais de quem teve coragem de saber a verdade
                </p>
              </FadeInView>

              <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                {testimonials.map((tm, i) => (
                  <FadeInView key={tm.name} delay={0.15 + i * 0.05}>
                    <div className="bg-surface/50 rounded-2xl border border-white/5 p-5 hover:border-gold/10 transition-colors">
                      <div className="flex items-start gap-3.5">
                        <div className="relative shrink-0">
                          <img
                            src={`/assets/profiles/${tm.slug}.jpg`}
                            alt=""
                            className="h-14 w-14 rounded-full object-cover border-2 border-gold/20 blur-[1.5px]"
                            onError={(e) => {
                              const el = e.currentTarget
                              if (el.src.endsWith('.jpg')) el.src = `/assets/profiles/${tm.slug}.svg`
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-white font-semibold text-sm">{tm.flag} {tm.name}</span>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${scoreColors[tm.scoreKey]}`}>
                              {tm.score}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">{tm.location}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 mt-4 leading-relaxed italic pl-1 border-l-2 border-gold/20 ml-1">
                        "{tm.text}"
                      </p>
                      {tm.platforms.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {tm.platforms.map((p) => (
                            <span key={p} className="text-[10px] text-red-400/80 bg-red-500/8 border border-red-500/15 rounded-md px-2.5 py-1 font-medium">
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

            <Divider />

            {/* ============================================================ */}
            {/*  PARA QUEM (Quem Precisa)                                    */}
            {/* ============================================================ */}
            <section id="quem-precisa" className="px-6 md:px-10 py-12 md:py-16 scroll-mt-20">
              <FadeInView delay={0.1}>
                <p className="text-xs text-gray-500 uppercase tracking-[3px] font-semibold mb-8 md:mb-10 text-center">
                  {t('personas.title')}
                </p>
              </FadeInView>

              <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                {personas.map((p, i) => {
                  const Icon = p.icon
                  return (
                    <FadeInView key={p.key} delay={0.15 + i * 0.08}>
                      <div className="flex items-start gap-4 bg-surface/50 rounded-2xl border border-white/5 p-5 hover:border-gold/10 transition-colors">
                        <div className="h-11 w-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-gold" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{t(`personas.${p.key}_title`)}</p>
                          <p className="text-gray-400 text-xs mt-1 leading-relaxed">{t(`personas.${p.key}_desc`)}</p>
                        </div>
                      </div>
                    </FadeInView>
                  )
                })}
              </div>

              {/* --- ALERTA: GOLPE DE VÍDEOS ÍNTIMOS --- */}
              <FadeInView delay={0.4}>
                <div className="mt-10 relative overflow-hidden rounded-2xl border border-red-500/20">
                  {/* Red gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-red-950/15 to-bg pointer-events-none" />
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500/60" />

                  <div className="relative p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <Camera className="h-5 w-5 text-red-400" />
                      <p className="text-[10px] text-red-400 uppercase tracking-[3px] font-bold">Alerta de segurança</p>
                    </div>

                    <p className="font-display font-bold text-lg md:text-xl text-white leading-snug mb-5">
                      Seus vídeos "a dois" podem estar<br />
                      <span className="text-red-400 italic">sendo vendidos agora.</span>
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3">
                        <span className="text-red-400 text-sm mt-0.5">01</span>
                        <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                          Parceiros gravam vídeos — com ou sem consentimento — e vendem em plataformas adultas <span className="text-white font-medium">fora do seu país</span>, onde você jamais descobriria.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-red-400 text-sm mt-0.5">02</span>
                        <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                          Dizem que filmam <span className="text-white font-medium">"por prazer"</span>. Destino real: OnlyFans, XVideos, Pornhub e dezenas de plataformas menores.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-red-400 text-sm mt-0.5">03</span>
                        <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                          Nosso <span className="text-gold font-semibold">reconhecimento facial</span> varre 50+ plataformas e identifica se sua imagem aparece sem autorização.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/register')}
                      className="bg-red-500/15 border border-red-500/30 text-red-400 font-body font-bold text-xs px-5 py-3 rounded-xl hover:bg-red-500/25 transition-colors"
                    >
                      Verificar minha imagem agora
                    </button>
                  </div>
                </div>
              </FadeInView>
            </section>

            <Divider />

            {/* ============================================================ */}
            {/*  HOW IT WORKS                                                */}
            {/* ============================================================ */}
            <section className="px-6 md:px-10 py-12 md:py-16">
              <FadeInView delay={0.1}>
                <p className="text-xs text-gray-500 uppercase tracking-[3px] font-semibold mb-8 md:mb-10 text-center">
                  {t('how_it_works.title')}
                </p>
                <div className="flex items-start justify-between gap-4 md:gap-8 max-w-[500px] mx-auto">
                  {[
                    { icon: Camera, key: 'step1', step: '1' },
                    { icon: Search, key: 'step2', step: '2' },
                    { icon: Check, key: 'step3', step: '3' },
                  ].map((s) => (
                    <div key={s.key} className="flex flex-col items-center gap-3 flex-1">
                      <div className="relative">
                        <div className="h-14 w-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                          <s.icon className="h-5 w-5 text-gold" />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 bg-gold text-black text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                          {s.step}
                        </span>
                      </div>
                      <span className="text-xs text-gray-300 text-center font-medium leading-snug">
                        {t(`how_it_works.${s.key}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </FadeInView>
            </section>

            <Divider />

            {/* ============================================================ */}
            {/*  PRICING                                                     */}
            {/* ============================================================ */}
            <section className="px-6 md:px-10 py-12 md:py-16">
              {/* Promo header */}
              <FadeInView delay={0.1}>
                <div className="relative text-center mb-10 md:mb-12">
                  <div className="inline-block bg-red-500/15 border border-red-500/30 rounded-full px-4 py-1.5 mb-4">
                    <span className="text-[10px] text-red-400 uppercase tracking-[3px] font-bold animate-pulse">Promoção Relâmpago</span>
                  </div>
                  <p className="font-display font-bold text-xl md:text-2xl text-white leading-tight">
                    <span className="text-red-400 italic">25% OFF</span> na Investigação Única
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Oferta por tempo limitado</p>
                </div>
              </FadeInView>

              <div className="md:grid md:grid-cols-2 md:gap-5 items-start">
                {/* Single Investigation — 25% OFF */}
                <FadeInView delay={0.15}>
                  <div className="relative rounded-2xl border-2 border-gold/40 shadow-lg shadow-gold/5 bg-surface/30 p-6 mb-4 md:mb-0">
                    <div className="absolute -top-3 left-5 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse">
                      25% OFF
                    </div>
                    <div className="absolute -top-3 right-5 bg-gold text-black text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3" /> {t('pricing.popular')}
                    </div>
                    <div className="mt-3">
                      <h3 className="font-display font-bold text-base text-white">{t('pricing.single_name')}</h3>
                      <p className="text-xs text-gold font-medium mt-1">{t('pricing.single_credits')}</p>
                      <div className="mt-3 flex items-baseline gap-3">
                        <span className="text-gray-500 line-through text-base">R$ 67</span>
                        <span className="font-display font-extrabold text-3xl text-gold">R$ 49,90</span>
                      </div>
                      <p className="text-[10px] text-red-400 font-semibold mt-1">Economize R$ 17,10</p>
                    </div>

                    {/* 3 cenários — você escolhe 1 */}
                    <div className="mt-5 p-3 rounded-lg bg-gold/[0.06] border border-gold/20">
                      <p className="text-[10px] text-gold font-bold uppercase tracking-[2px] mb-2.5">Você escolhe 1 dos 3 cenários*</p>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2 text-xs text-white">
                          <span className="text-base leading-none">🛡️</span>
                          <span><strong>Romance Scam</strong> — criminoso de app de relacionamento</span>
                        </li>
                        <li className="flex items-start gap-2 text-xs text-white">
                          <span className="text-base leading-none">💔</span>
                          <span><strong>Parceiro "do Job"</strong> — perfis ocultos em plataformas adultas</span>
                        </li>
                        <li className="flex items-start gap-2 text-xs text-white">
                          <span className="text-base leading-none">📹</span>
                          <span><strong>Vídeos íntimos vazados</strong> — sextorsão e exposição</span>
                        </li>
                      </ul>
                      <p className="text-[9px] text-gray-500 mt-2.5 italic">*Em breve: seleção de cenário no app</p>
                    </div>

                    <ul className="mt-4 grid grid-cols-1 gap-2">
                      {['single_f1', 'single_f2', 'single_f3', 'single_f4', 'single_f5'].map((k) => (
                        <li key={k} className="flex items-start gap-2 text-xs text-gray-400">
                          <Check className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                          <span>{t(`pricing.${k}`)}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/register" className="flex items-center justify-center w-full mt-5 py-3.5 rounded-xl bg-gold text-black text-sm font-bold hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20">
                      Quero 25% OFF
                    </Link>
                    <p className="mt-3 text-[10px] text-gray-600 line-through text-center">{t('pricing.single_compare')}</p>
                  </div>
                </FadeInView>

                {/* Suporte Jurídico Especializado — Sob consulta */}
                <FadeInView delay={0.2}>
                  <div className="relative rounded-2xl bg-gold/5 border border-gold/15 p-6 mb-4 md:mb-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <Shield className="h-6 w-6 text-gold" />
                      <p className="text-xs text-gold uppercase tracking-[3px] font-semibold">
                        Suporte Jurídico Especializado
                      </p>
                    </div>
                    <p className="text-sm text-gray-300 mb-6">Protegemos sua dignidade com ações concretas.</p>

                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                          <span className="text-gold font-bold text-sm">1</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">Limpeza de Imagem</p>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                            Exigimos a exclusão imediata do seu conteúdo em todas as plataformas onde foi publicado sem autorização.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                          <span className="text-gold font-bold text-sm">2</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">Medidas Protetivas</p>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                            Orientação jurídica para obter medidas protetivas contra o agressor através dos mecanismos legais disponíveis.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                          <span className="text-gold font-bold text-sm">3</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">Processo por Danos</p>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                            Assessoria para ação judicial por danos morais e falsidade ideológica contra o parceiro abusador e criminoso.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-black/30 border border-gold/15 text-center">
                      <p className="text-[10px] text-gold uppercase tracking-[2px] font-semibold mb-1">Valor</p>
                      <p className="text-white font-display font-bold text-lg">Sob consulta</p>
                      <p className="text-[11px] text-gray-500 mt-1">Avaliamos seu caso individualmente</p>
                    </div>

                    <a
                      href="#contact-form"
                      className="flex items-center justify-center w-full mt-4 py-3.5 rounded-xl bg-gold text-black text-sm font-bold hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20"
                    >
                      Solicitar orçamento
                    </a>
                  </div>
                </FadeInView>
              </div>
            </section>

            <Divider />

            {/* ============================================================ */}
            {/*  LGPD & GDPR                                                 */}
            {/* ============================================================ */}
            <section id="lgpd-gdpr" className="px-6 md:px-10 py-12 md:py-16 scroll-mt-20">
              <FadeInView delay={0.1}>
                <div className="max-w-3xl mx-auto bg-gold/5 border border-gold/15 rounded-2xl p-6 md:p-8">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Shield className="h-5 w-5 text-gold" />
                    <p className="text-[10px] text-gold uppercase tracking-[3px] font-semibold">
                      Vítimas LGPD &amp; GDPR
                    </p>
                  </div>
                  <h3 className="font-display font-bold text-lg md:text-xl text-white mb-3 leading-tight">
                    Seus dados expostos sem consentimento têm proteção legal.
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed mb-6">
                    A <strong className="text-white">LGPD</strong> (Brasil — Lei 13.709/2018) e o <strong className="text-white">GDPR</strong> (Europa — Regulamento UE 2016/679) garantem direitos a quem tem dados pessoais ou imagens íntimas expostas indevidamente. O [18+]Check ajuda a localizar onde seu conteúdo está publicado para que você exerça esses direitos.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <Check className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                      <p className="text-[11px] text-gray-300"><strong className="text-white">Direito ao esquecimento</strong> — exigir a remoção de conteúdo pessoal não autorizado</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                      <p className="text-[11px] text-gray-300"><strong className="text-white">Direito de acesso</strong> — saber onde e como seus dados estão sendo tratados</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                      <p className="text-[11px] text-gray-300"><strong className="text-white">Direito à reparação</strong> — buscar indenização por danos morais e materiais</p>
                    </div>
                  </div>
                  <a
                    href="#contact-form"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gold text-black text-xs font-bold hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20"
                  >
                    Solicitar relatório de exposição
                  </a>
                </div>
              </FadeInView>
            </section>

            <Divider />

            {/* ============================================================ */}
            {/*  FAQ                                                         */}
            {/* ============================================================ */}
            <section id="faq" className="px-6 md:px-10 py-12 md:py-16 scroll-mt-20">
              <FadeInView delay={0.1}>
                <p className="text-xs text-gray-500 uppercase tracking-[3px] font-semibold mb-8 md:mb-10 text-center">
                  {t('faq.title')}
                </p>
              </FadeInView>

              <FadeInView delay={0.15}>
                <div className="rounded-2xl border border-white/5 bg-surface/40 px-6 md:max-w-[600px] md:mx-auto">
                  {faqKeys.map((key) => (
                    <FAQItem key={key} q={t(`faq.${key}`)} a={t(`faq.a${key.slice(1)}`)} />
                  ))}
                </div>
              </FadeInView>
            </section>

            <Divider />

            {/* ============================================================ */}
            {/*  TRUST + FINAL CTA                                           */}
            {/* ============================================================ */}
            <section className="px-6 md:px-10 py-12 md:py-16">
              {/* Trust badges */}
              <FadeInView delay={0.1}>
                <div className="flex items-center justify-center gap-3 flex-wrap mb-10 md:mb-14">
                  {trustBadges.map((badge) => (
                    <div key={badge.key} className="flex items-center gap-2 bg-surface/40 rounded-xl border border-white/5 px-4 py-2.5">
                      <badge.icon className="h-3.5 w-3.5 text-gold/60" />
                      <span className="text-[10px] md:text-xs text-gray-400 font-medium">{t(`trust.${badge.key}`)}</span>
                    </div>
                  ))}
                </div>
              </FadeInView>

              {/* Final CTA */}
              <FadeInView delay={0.15}>
                <div className="text-center max-w-[500px] mx-auto">
                  <p className="text-white font-display font-bold text-xl md:text-2xl mb-3">
                    {t('cta.headline')}
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 mb-2 leading-relaxed">
                    {t('cta.subtext')}
                    <br />
                    <GoldText text={t('cta.scams')} boldGold />
                    <br />
                    {t('cta.deserve')}
                  </p>
                  <p className="text-[11px] text-gray-500 mb-6">
                    {t('cta.global_note')}
                  </p>
                  <ShimmerButton href="/register">
                    {t('cta.button')}
                  </ShimmerButton>
                </div>
              </FadeInView>
            </section>

            {/* ============================================================ */}
            {/*  CONTACT FORM                                                */}
            {/* ============================================================ */}
            <section id="contact-form" className="px-6 md:px-10 py-12 md:py-16 scroll-mt-6">
              <FadeInView delay={0.1}>
                <p className="text-xs text-gray-500 uppercase tracking-[3px] font-semibold mb-2 text-center">
                  Precisa de ajuda?
                </p>
                <p className="text-sm text-gold/50 text-center mb-8 md:mb-10 font-body">
                  Relate seu caso com sigilo total. Nossa equipe responde em até 24h.
                </p>
              </FadeInView>

              <FadeInView delay={0.15}>
                <ContactForm />
              </FadeInView>
            </section>

            <Divider />

            {/* --- FOOTER --- */}
            <footer className="px-6 md:px-10 py-8 border-t border-white/5">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-gold/50" />
                  <span className="text-xs text-gray-600 font-display">
                    <span className="text-gold/50">[18+]</span>Check
                  </span>
                </div>
                <p className="text-[10px] text-gray-600">
                  AuraTECH — Trust Infrastructure Platform
                </p>
              </div>
            </footer>
          </main>

          {/* ===== BOTTOM NAV BAR ===== */}
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-white/5">
            <div className="max-w-[820px] mx-auto flex items-center justify-around h-16">
              <Link to="/register" className="flex flex-col items-center gap-1 text-gold">
                <Search className="h-5 w-5" />
                <span className="text-[10px] font-medium">{t('nav.search')}</span>
              </Link>
              <Link to="/login" className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
                <Clock className="h-5 w-5" />
                <span className="text-[10px] font-medium">{t('nav.history')}</span>
              </Link>
              <Link to="/login" className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
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

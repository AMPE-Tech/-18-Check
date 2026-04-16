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
            <div className="px-6 md:px-10 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-gold" />
                <span className="font-display font-bold text-base text-white">
                  <span className="text-gold">[18+]</span>Check
                </span>
              </Link>
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
              </FadeInView>

              {/* Layer 2 — Subheadline (one line, data-driven) */}
              <FadeInView delay={0.1}>
                <p className="relative text-sm md:text-lg text-gray-400 font-body mt-4 md:mt-6">
                  Varredura facial em <span className="text-gold">+50 plataformas</span> adultas. <span className="text-gold">396 milhões</span> de perfis.
                </p>
              </FadeInView>

              {/* Layer 3 — CTA */}
              <FadeInView delay={0.2}>
                <div className="relative mt-8 md:mt-10 max-w-[380px] mx-auto">
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full bg-gold text-black font-body font-bold py-4 rounded-xl text-sm md:text-base tracking-wide hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20"
                  >
                    Descubra agora — 75% OFF
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

            {/* --- PLATFORM SCREENSHOTS BANNER --- */}
            <section className="py-4 overflow-hidden" aria-hidden="true">
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
                    <p
                      className="text-xs md:text-sm text-white font-medium leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: t('awareness.text').replace(/<gold>/g, '<span class="text-gold">').replace(/<\/gold>/g, '</span>'),
                      }}
                    />
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
            {/*  PARA QUEM                                                   */}
            {/* ============================================================ */}
            <section className="px-6 md:px-10 py-12 md:py-16">
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
                <div className="mt-8 bg-gradient-to-br from-red-950/30 via-red-900/10 to-bg rounded-2xl border-l-4 border-red-500/60 p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
                      <Camera className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-red-400 text-base md:text-lg font-display font-bold mb-3">
                        Você tem certeza que seus vídeos íntimos não estão sendo vendidos?
                      </p>
                      <p className="text-gray-300 text-xs md:text-sm leading-relaxed mb-3">
                        Um golpe crescente no mundo todo: parceiros gravam vídeos íntimos — às vezes com seu consentimento, às vezes escondido — e depois vendem em plataformas adultas internacionais, fora do seu país de origem, onde você jamais descobriria sozinha.
                      </p>
                      <p className="text-gray-300 text-xs md:text-sm leading-relaxed mb-3">
                        Eles dizem que filmam "por prazer", "para nós dois". Mas o destino real são sites como OnlyFans, XVideos, Pornhub e dezenas de plataformas menores. Milhares de vítimas só descobrem quando já é tarde demais.
                      </p>
                      <p className="text-white text-sm font-semibold leading-relaxed">
                        O [18+]Check usa reconhecimento facial para varrer 50+ plataformas e descobrir se sua imagem aparece em algum lugar que você não autorizou. <span className="text-gold">Proteja sua dignidade.</span>
                      </p>
                    </div>
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
            {/*  PROMO FLASH BANNER                                          */}
            {/* ============================================================ */}
            <section className="px-6 md:px-10 py-12 md:py-16">
              <FadeInView delay={0.1}>
                <div className="relative bg-gradient-to-br from-red-950/40 via-red-900/15 to-bg border border-red-500/30 rounded-2xl p-6 md:p-8 text-center overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
                  <p className="text-[11px] text-red-400 uppercase tracking-[4px] font-bold mb-2">Promoção Relâmpago</p>
                  <p className="font-display font-extrabold text-xl md:text-2xl text-white leading-tight">
                    Até <span className="text-red-400">75% OFF</span> em todos os planos
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Oferta por tempo limitado — vagas preenchendo rápido</p>
                  <div className="flex items-center justify-center gap-6 md:gap-10 mt-5">
                    <div className="text-center">
                      <p className="text-[9px] text-gray-500 uppercase tracking-wide">Investigação Única</p>
                      <p className="font-display font-bold text-lg text-gold mt-1">R$ 51</p>
                      <p className="text-[10px] text-red-400 font-bold">60% OFF</p>
                    </div>
                    <div className="w-px h-12 bg-red-500/20" />
                    <div className="text-center">
                      <p className="text-[9px] text-gray-500 uppercase tracking-wide">Pro / mês</p>
                      <p className="font-display font-bold text-lg text-gold mt-1">R$ 119</p>
                      <p className="text-[10px] text-red-400 font-bold">75% OFF</p>
                    </div>
                  </div>
                </div>
              </FadeInView>
            </section>

            {/* ============================================================ */}
            {/*  PRICING                                                     */}
            {/* ============================================================ */}
            <section className="px-6 md:px-10 pb-12 md:pb-16">
              <FadeInView delay={0.1}>
                <p className="text-xs text-gray-500 uppercase tracking-[3px] font-semibold mb-2 text-center">
                  {t('pricing.title')}
                </p>
                <p className="text-sm text-gold/50 text-center mb-8 md:mb-10">
                  {t('pricing.subtitle')}
                </p>
              </FadeInView>

              <div className="md:grid md:grid-cols-2 md:gap-5">
                {/* Single Investigation — 60% OFF */}
                <FadeInView delay={0.15}>
                  <div className="relative rounded-2xl border-2 border-gold/40 shadow-lg shadow-gold/5 bg-surface/30 p-6 mb-4 md:mb-0">
                    <div className="absolute -top-3 left-5 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse">
                      60% OFF
                    </div>
                    <div className="absolute -top-3 right-5 bg-gold text-black text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3" /> {t('pricing.popular')}
                    </div>
                    <div className="mt-3">
                      <h3 className="font-display font-bold text-base text-white">{t('pricing.single_name')}</h3>
                      <p className="text-xs text-gold font-medium mt-1">{t('pricing.single_credits')}</p>
                      <div className="mt-3 flex items-baseline gap-3">
                        <span className="text-gray-500 line-through text-base">R$ 129</span>
                        <span className="font-display font-extrabold text-3xl text-gold">R$ 51</span>
                      </div>
                      <p className="text-[10px] text-red-400 font-semibold mt-1">Economia de R$ 78</p>
                    </div>
                    <ul className="mt-5 grid grid-cols-1 gap-2">
                      {['single_f1', 'single_f2', 'single_f3', 'single_f4', 'single_f5'].map((k) => (
                        <li key={k} className="flex items-start gap-2 text-xs text-gray-400">
                          <Check className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                          <span>{t(`pricing.${k}`)}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/register" className="flex items-center justify-center w-full mt-5 py-3.5 rounded-xl bg-gold text-black text-sm font-bold hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20">
                      Quero 60% OFF
                    </Link>
                    <p className="mt-3 text-[10px] text-gray-600 line-through text-center">{t('pricing.single_compare')}</p>
                  </div>
                </FadeInView>

                {/* Pro Monitoring — 75% OFF */}
                <FadeInView delay={0.2}>
                  <div className="relative rounded-2xl border-2 border-red-500/40 shadow-lg shadow-red-500/5 bg-surface/30 p-6 mb-4 md:mb-0">
                    <div className="absolute -top-3 left-5 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse">
                      75% OFF
                    </div>
                    <div className="mt-3">
                      <h3 className="font-display font-bold text-base text-white">{t('pricing.pro_name')}</h3>
                      <p className="text-xs text-gold font-medium mt-1">{t('pricing.pro_credits')}</p>
                      <div className="mt-3 flex items-baseline gap-3">
                        <span className="text-gray-500 line-through text-base">R$ 479/mês</span>
                        <span className="font-display font-extrabold text-3xl text-gold">R$ 119</span>
                        <span className="text-gold/60 text-sm">/mês</span>
                      </div>
                      <p className="text-[10px] text-red-400 font-semibold mt-1">Economia de R$ 360/mês</p>
                    </div>
                    <ul className="mt-5 grid grid-cols-1 gap-2">
                      {['pro_f1', 'pro_f2', 'pro_f3', 'pro_f4', 'pro_f5', 'pro_f6'].map((k) => (
                        <li key={k} className="flex items-start gap-2 text-xs text-gray-400">
                          <Check className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                          <span>{t(`pricing.${k}`)}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/register" className="flex items-center justify-center w-full mt-5 py-3.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-400 transition-all hover:shadow-lg hover:shadow-red-500/20">
                      Quero 75% OFF
                    </Link>
                    <p className="mt-3 text-[10px] text-gray-600 line-through text-center">{t('pricing.pro_compare')}</p>
                  </div>
                </FadeInView>
              </div>

              {/* Extra credits */}
              <FadeInView delay={0.25}>
                <div className="rounded-2xl border border-white/5 bg-surface/40 p-4 md:p-5 flex items-center justify-between gap-4 mt-5">
                  <div>
                    <p className="text-sm text-white font-medium">{t('pricing.extra_title')}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <span className="text-gold font-bold">{t('pricing.extra_price')}</span> {t('pricing.extra_desc')}
                    </p>
                  </div>
                  <Link to="/register" className="text-xs text-gold border border-gold/30 px-4 py-2 rounded-lg font-semibold hover:bg-gold/10 transition-colors shrink-0">
                    {t('pricing.extra_cta')}
                  </Link>
                </div>
              </FadeInView>
            </section>

            <Divider />

            {/* ============================================================ */}
            {/*  LEGAL SUPPORT                                               */}
            {/* ============================================================ */}
            <section className="px-6 md:px-10 py-12 md:py-16">
              <FadeInView delay={0.1}>
                <div className="bg-gold/5 border border-gold/15 rounded-2xl p-6 md:p-8">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Shield className="h-6 w-6 text-gold" />
                    <p className="text-xs text-gold uppercase tracking-[3px] font-semibold">
                      {t('legal_support.title')}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mb-6">{t('legal_support.subtitle')}</p>

                  <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                          <span className="text-gold font-bold text-sm">{n}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{t(`legal_support.service${n}_title`)}</p>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{t(`legal_support.service${n}_desc`)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/register"
                    className="flex items-center justify-center w-full mt-6 py-3.5 rounded-xl bg-gold text-black text-sm font-bold hover:bg-gold-light transition-all"
                  >
                    {t('legal_support.cta')}
                  </Link>
                </div>
              </FadeInView>
            </section>

            <Divider />

            {/* ============================================================ */}
            {/*  FAQ                                                         */}
            {/* ============================================================ */}
            <section className="px-6 md:px-10 py-12 md:py-16">
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

            {/* --- SCAM + EXTORTION CASES --- */}
            <div className="py-8">
              <ScamCasesPanel />
              <ExtortionCasesPanel />
            </div>

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
                    <span dangerouslySetInnerHTML={{
                      __html: t('cta.scams').replace(/<gold>/g, '<span class="text-gold font-semibold">').replace(/<\/gold>/g, '</span>'),
                    }} />
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
            <section className="px-6 md:px-10 py-12 md:py-16">
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

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  AtSign,
  Camera,
  Check,
  ExternalLink,
  Image as ImageIcon,
  Info,
  MessageCircle,
  RefreshCw,
  ScanSearch,
  ShieldAlert,
  Trash2,
  Upload,
} from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../lib/auth'

/* ------------------------------------------------------------------ */
/*  Checagem de contato suspeito                                       */
/*                                                                     */
/*  Responde "esta foto é reaproveitada?" e "este perfil já foi         */
/*  denunciado?" — NUNCA "quem é esta pessoa".                          */
/*                                                                     */
/*  A foto enviada normalmente é de uma vítima cujo rosto foi roubado   */
/*  para montar o perfil falso; identificá-la seria expor um inocente.  */
/*  Por isso o resultado só mostra sinais de reúso e de denúncia, e     */
/*  nenhum campo de identidade.                                         */
/*                                                                     */
/*  O @ e o telefone são consultados em bases de denúncia — o perfil    */
/*  NÃO é aberto nem raspado. Além de violar os termos das redes, ler   */
/*  um perfil alheio para extrair rostos recairia no mesmo problema     */
/*  que a busca de terceiros que este produto deixou de fazer.          */
/* ------------------------------------------------------------------ */

type Step = 'form' | 'scanning' | 'result'

type Verdict = 'reported' | 'reused' | 'stock' | 'clean' | 'inconclusive'

interface Appearance {
  platform: string
  /* Nome sob o qual a foto é usada — apelido do golpista, não da pessoa retratada. */
  alias?: string
  url?: string
  firstSeen?: string
}

interface HandleReport {
  source: string
  reference?: string
  date?: string
}

interface SuspectScan {
  status: 'processing' | 'done' | 'failed'
  verdict?: Verdict
  profileCount?: number
  aliasCount?: number
  appearances?: Appearance[]
  stockSource?: string
  reportCount?: number
  /* Denúncias ligadas ao @ / telefone informado, não à foto. */
  handleReportCount?: number
  handleReports?: HandleReport[]
  scannedAt?: string
  reason?: string
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 10 * 1024 * 1024

/* Onde o contato costuma começar, na ordem em que aparece nos casos. */
const PLATFORMS = [
  'Tinder',
  'Instagram',
  'Facebook',
  'TikTok',
  'LinkedIn',
  'Telegram',
  'Badoo',
  'Outro',
]

/* O backend responde { success, data }. Mesmo desembrulho já usado em auth.tsx. */
function unwrap<T>(body: unknown): T {
  const envelope = body as { data?: T }
  return (envelope?.data ?? body) as T
}

function readError(err: unknown, fallback: string) {
  const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
  return msg || fallback
}

function formatDate(iso?: string) {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('pt-BR')
}

/* ------------------------------------------------------------------ */
/*  Leitura do veredito                                                */
/* ------------------------------------------------------------------ */

const verdicts: Record<
  Verdict,
  { label: string; tone: string; icon: typeof ShieldAlert; headline: string; body: string }
> = {
  reported: {
    label: 'Já denunciado',
    tone: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: ShieldAlert,
    headline: 'Esta foto já foi denunciada em golpes.',
    body: 'A imagem consta em bases de denúncia de fraude. Trate qualquer pedido de dinheiro, investimento ou conteúdo íntimo como golpe e não envie nada.',
  },
  reused: {
    label: 'Foto reaproveitada',
    tone: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: AlertTriangle,
    headline: 'Esta foto aparece em vários perfis, com nomes diferentes.',
    body: 'Uma mesma imagem usada sob nomes distintos é o padrão mais comum de perfil falso. A pessoa que te mandou esta foto provavelmente não é a pessoa retratada nela.',
  },
  stock: {
    label: 'Banco de imagens',
    tone: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    icon: AlertTriangle,
    headline: 'Esta foto é de banco de imagens.',
    body: 'A imagem é vendida ou distribuída como foto de modelo. Não é uma foto pessoal de quem te enviou.',
  },
  clean: {
    label: 'Sem reaproveitamento',
    tone: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
    icon: Info,
    headline: 'Não encontramos esta foto sendo reaproveitada.',
    body: 'Isso NÃO confirma que a pessoa é quem diz ser — significa apenas que esta imagem específica não apareceu nas bases que consultamos. Golpistas também usam fotos próprias e fotos novas. Continue atento a pedido de dinheiro, pressa e recusa em fazer chamada de vídeo.',
  },
  inconclusive: {
    label: 'Inconclusivo',
    tone: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
    icon: Info,
    headline: 'Não foi possível concluir a checagem.',
    body: 'A qualidade, o corte ou o tamanho da foto podem ter impedido a comparação. Tente com uma imagem mais nítida, de rosto visível e sem recorte agressivo.',
  },
}

export default function PhotoCheck() {
  const { user, refreshUser } = useAuth()

  const [step, setStep] = useState<Step>('form')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [dragging, setDragging] = useState(false)

  const [platform, setPlatform] = useState('')
  const [handle, setHandle] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  /* Sair do app para o WhatsApp cedo é o passo mais repetido do golpe. Vale
     como sinal por si só, mesmo quando a foto volta limpa. */
  const [movedOut, setMovedOut] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scan, setScan] = useState<SuspectScan | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  /* A URL do preview é um objeto em memória — sem revogar, cada troca de
     arquivo deixa o anterior pendurado. */
  useEffect(() => {
    if (!file) {
      setPreview('')
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const noCredits = (user?.credits ?? 0) <= 0
  /* Foto OU perfil já basta — quem só tem o @ também precisa conseguir checar. */
  const hasInput = Boolean(file || handle.trim() || phone.trim() || name.trim())

  function pick(selected: File | undefined) {
    setError('')
    if (!selected) return
    if (!ACCEPTED.includes(selected.type)) {
      setError('Formato não aceito. Envie a imagem em JPG, PNG ou WEBP.')
      return
    }
    if (selected.size > MAX_BYTES) {
      setError('A imagem passa de 10 MB. Envie uma versão menor.')
      return
    }
    setFile(selected)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    pick(e.dataTransfer.files?.[0])
  }

  async function submit() {
    if (!hasInput || noCredits) return
    setLoading(true)
    setError('')
    setStep('scanning')
    try {
      const body = new FormData()
      if (file) body.append('photo', file)
      if (platform) body.append('platform', platform)
      if (handle.trim()) body.append('handle', handle.trim())
      if (name.trim()) body.append('name', name.trim())
      if (phone.trim()) body.append('phone', phone.trim())
      if (movedOut) body.append('movedOut', 'true')

      const { data } = await api.post('/scan/suspect', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await poll(unwrap<{ scanId: string }>(data).scanId)
      await refreshUser()
    } catch (err) {
      setError(readError(err, 'Não foi possível enviar a checagem. Tente novamente.'))
      setStep('form')
    } finally {
      setLoading(false)
    }
  }

  async function poll(scanId: string) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const { data } = await api.get(`/scan/suspect/${scanId}`)
      const result = unwrap<SuspectScan>(data)
      if (result.status !== 'processing') {
        setScan(result)
        setStep('result')
        return
      }
      await new Promise((resolve) => window.setTimeout(resolve, 3000))
    }
    setError('A checagem está demorando mais que o normal. Consulte o histórico em instantes.')
    setStep('result')
  }

  function reset() {
    setStep('form')
    setFile(null)
    setPlatform('')
    setHandle('')
    setName('')
    setPhone('')
    setMovedOut(false)
    setScan(null)
    setError('')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Checar um contato suspeito</h1>
        <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
          Conheceu alguém online? Verificamos se a foto que te mandaram é reaproveitada — em
          quantos perfis aparece e sob quantos nomes — e se o perfil já foi denunciado.
        </p>
      </div>

      {/* O limite do produto, dito antes de a pessoa enviar qualquer coisa. */}
      <div className="flex items-start gap-3 rounded-2xl border border-gold/15 bg-gold/5 p-4">
        <Info className="h-4 w-4 text-gold shrink-0 mt-0.5" />
        <p className="text-xs text-gray-300 leading-relaxed">
          A resposta é <strong className="text-white">sobre a foto e o perfil serem falsos</strong>,
          não sobre quem é a pessoa. Não identificamos o rosto retratado — em golpe romântico ele
          quase sempre é de uma vítima que também teve a imagem roubada.
        </p>
      </div>

      {noCredits && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-surface/50 p-4">
          <p className="text-xs text-gray-400">Você não tem checagens disponíveis.</p>
          <Link
            to="/app/plans"
            className="shrink-0 rounded-xl bg-gold px-4 py-2 text-xs font-bold text-black transition-colors hover:bg-gold-light"
          >
            Ver planos
          </Link>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-xs text-red-300 leading-relaxed">{error}</p>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/*  Formulário                                                      */}
      {/* ---------------------------------------------------------------- */}
      {step === 'form' && (
        <div className="space-y-5">
          {/* --- a foto --- */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[3px] text-gray-500">
              A foto que te mandaram
            </p>

            {!file ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={[
                  'flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-10 transition-colors',
                  dragging
                    ? 'border-gold/50 bg-gold/5'
                    : 'border-white/10 bg-surface/40 hover:border-gold/30 hover:bg-surface/60',
                ].join(' ')}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                  <Upload className="h-5 w-5 text-gold" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">
                    Arraste a foto aqui ou clique para escolher
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">JPG, PNG ou WEBP — até 10 MB</p>
                </div>
              </button>
            ) : (
              <div className="rounded-2xl border border-white/5 bg-surface/50 p-4">
                <div className="flex items-start gap-4">
                  {preview && (
                    <img
                      src={preview}
                      alt="Foto selecionada para checagem"
                      className="h-24 w-24 shrink-0 rounded-xl border border-white/10 object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-semibold text-white">
                      <ImageIcon className="h-4 w-4 shrink-0 text-gold" />
                      <span className="truncate">{file.name}</span>
                    </p>
                    <p className="mt-1 text-[11px] text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-gray-400 transition-colors hover:text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                      Trocar imagem
                    </button>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED.join(',')}
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0])}
            />
          </div>

          {/* --- 1. onde o contato começou --- */}
          <div className="space-y-3 rounded-2xl border border-white/5 bg-surface/50 p-5">
            <div className="flex items-center gap-2">
              <AtSign className="h-3.5 w-3.5 text-gold" />
              <p className="text-[10px] font-semibold uppercase tracking-[3px] text-gray-500">
                Onde o contato começou
              </p>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-500">
              Consultamos o @, o nome e o telefone em bases de denúncia. Não abrimos nem lemos o
              perfil.
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label
                  htmlFor="platform"
                  className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500"
                >
                  Rede
                </label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-bg px-4 py-3 text-sm text-white transition-colors focus:border-gold/40 focus:outline-none"
                >
                  <option value="">Selecione</option>
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="handle"
                  className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500"
                >
                  @ ou link do perfil
                </label>
                <input
                  id="handle"
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@perfil ou instagram.com/perfil"
                  className="w-full rounded-xl border border-white/10 bg-bg px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors focus:border-gold/40 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500"
              >
                Nome que a pessoa usa
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como ela se apresentou"
                className="w-full rounded-xl border border-white/10 bg-bg px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors focus:border-gold/40 focus:outline-none"
              />
              <p className="mt-1.5 text-[10px] text-gray-600">
                Na maioria dos casos o nome é falso — serve para cruzar com os nomes sob os quais
                a foto já circula.
              </p>
            </div>
          </div>

          {/* --- 2. para onde levaram a conversa --- */}
          <div className="space-y-3 rounded-2xl border border-white/5 bg-surface/50 p-5">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-3.5 w-3.5 text-gold" />
              <p className="text-[10px] font-semibold uppercase tracking-[3px] text-gray-500">
                Para onde levaram a conversa
              </p>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500"
              >
                WhatsApp ou telefone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 (11) 99999-9999"
                className="w-full rounded-xl border border-white/10 bg-bg px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors focus:border-gold/40 focus:outline-none"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 pt-1">
              <input
                type="checkbox"
                checked={movedOut}
                onChange={(e) => setMovedOut(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#D4AF5F]"
              />
              <span className="text-xs leading-relaxed text-gray-300">
                Pediu para sair do app e continuar no WhatsApp
              </span>
            </label>
          </div>

          <button
            type="button"
            disabled={!hasInput || loading || noCredits}
            onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3.5 text-sm font-bold text-black transition-all hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ScanSearch className="h-4 w-4" />
            Checar este contato
          </button>

          {!hasInput && (
            <p className="text-center text-[11px] text-gray-600">
              Envie a foto, o @ ou o telefone — qualquer um já serve para começar.
            </p>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/*  Processando                                                     */}
      {/* ---------------------------------------------------------------- */}
      {step === 'scanning' && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-surface/50 p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Comparando…</p>
            <p className="mt-1 text-[11px] text-gray-500">
              Procurando a mesma foto em perfis e bancos de imagem, e o contato em bases de
              denúncia.
            </p>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/*  Resultado                                                       */}
      {/* ---------------------------------------------------------------- */}
      {step === 'result' && scan && <Result scan={scan} movedOut={movedOut} onReset={reset} />}

      {step === 'result' && !scan && (
        <div className="rounded-2xl border border-white/5 bg-surface/50 p-8 text-center">
          <p className="text-sm text-gray-400">{error || 'Checagem não concluída.'}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:border-gold/30"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar de novo
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Resultado                                                          */
/* ------------------------------------------------------------------ */

function Result({
  scan,
  movedOut,
  onReset,
}: {
  scan: SuspectScan
  movedOut: boolean
  onReset: () => void
}) {
  if (scan.status === 'failed') {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface/50 p-8 text-center">
        <p className="text-sm text-gray-300">
          {scan.reason || 'A checagem falhou. Tente novamente.'}
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:border-gold/30"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Checar outro contato
        </button>
      </div>
    )
  }

  const verdict = verdicts[scan.verdict ?? 'inconclusive']
  const VerdictIcon = verdict.icon
  const appearances = scan.appearances ?? []
  const handleReports = scan.handleReports ?? []

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/5 bg-surface/50 p-6">
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[2px] ${verdict.tone}`}
        >
          <VerdictIcon className="h-3.5 w-3.5" />
          {verdict.label}
        </div>

        <h2 className="font-display mt-4 text-lg font-bold leading-tight text-white md:text-xl">
          {verdict.headline}
        </h2>
        <p className="mt-2.5 text-xs leading-relaxed text-gray-300">{verdict.body}</p>

        {(scan.profileCount || scan.aliasCount || scan.reportCount) && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat value={scan.profileCount} label="perfis" />
            <Stat value={scan.aliasCount} label="nomes diferentes" />
            <Stat value={scan.reportCount} label="denúncias" />
          </div>
        )}

        {scan.stockSource && (
          <p className="mt-4 text-[11px] text-gray-400">
            Banco de imagens: <strong className="text-white">{scan.stockSource}</strong>
          </p>
        )}

        {scan.scannedAt && (
          <p className="mt-4 text-[10px] text-gray-600">Checado em {formatDate(scan.scannedAt)}</p>
        )}
      </div>

      {/* --- denúncias ligadas ao @ / telefone --- */}
      {handleReports.length > 0 && (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-6">
          <div className="mb-1.5 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <p className="text-[10px] font-semibold uppercase tracking-[3px] text-red-400">
              O contato informado já foi denunciado
            </p>
          </div>
          <p className="mb-4 text-xs leading-relaxed text-gray-300">
            {scan.handleReportCount ?? handleReports.length} registro
            {(scan.handleReportCount ?? handleReports.length) === 1 ? '' : 's'} em bases de
            denúncia. Encerre o contato e não faça nenhuma transferência.
          </p>
          <div className="space-y-2.5">
            {handleReports.map((r, i) => (
              <div
                key={`${r.source}-${i}`}
                className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-2.5 last:border-0 last:pb-0"
              >
                <p className="text-xs text-white">{r.source}</p>
                <p className="shrink-0 text-[10px] text-gray-500">
                  {r.reference}
                  {r.reference && r.date ? ' · ' : ''}
                  {formatDate(r.date)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {appearances.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-surface/50 p-6">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[3px] text-gray-500">
            Onde esta foto aparece
          </p>
          <div className="space-y-3">
            {appearances.map((a, i) => (
              <div
                key={`${a.platform}-${i}`}
                className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{a.platform}</p>
                  {a.alias && (
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      usada sob o nome <strong className="text-gray-200">{a.alias}</strong>
                    </p>
                  )}
                  {a.firstSeen && (
                    <p className="mt-0.5 text-[10px] text-gray-600">
                      visto desde {formatDate(a.firstSeen)}
                    </p>
                  )}
                </div>
                {a.url && (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex shrink-0 items-center gap-1 text-[11px] text-gold transition-colors hover:text-gold-light"
                  >
                    abrir
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* A prova tem prazo. O perfil, as fotos e o número ficam no ar só até o
          golpe se completar — depois é tudo apagado e recriado do zero. Quem
          está checando agora está dentro da janela em que a prova existe. */}
      {(scan.verdict !== 'clean' || handleReports.length > 0 || movedOut) && (
        <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5">
          <div className="mb-2 flex items-center gap-2">
            <Camera className="h-4 w-4 shrink-0 text-gold" />
            <p className="text-[10px] font-semibold uppercase tracking-[3px] text-gold">
              Guarde as provas agora
            </p>
          </div>
          <p className="mb-4 text-xs leading-relaxed text-gray-300">
            O perfil, as fotos e o número ficam no ar só até o golpe se completar. Depois é
            tudo apagado e recriado do zero — e a prova some junto. O que você registrar hoje
            ainda vai existir amanhã; o perfil talvez não.
          </p>
          <div className="space-y-2.5">
            <Evidence text="Print da conversa inteira, sem cortar — inclusive o começo" />
            <Evidence text="Print do perfil com o @ visível, e das fotos que te mandaram" />
            <Evidence text="O número de WhatsApp, mesmo que ele pare de funcionar depois" />
            <Evidence text="Comprovantes, se já houve qualquer transferência" />
          </div>
          <p className="mt-4 border-t border-white/5 pt-3 text-[11px] leading-relaxed text-gray-400">
            Esta checagem já é um registro datado
            {scan.scannedAt ? ` (${formatDate(scan.scannedAt)})` : ''} e fica no seu histórico.
            Ela serve como anexo em boletim de ocorrência, contestação junto ao banco e
            denúncia à plataforma.
          </p>
        </div>
      )}

      {/* Sinal de comportamento: independe do que a imagem devolveu, e é o que
          sobra quando a checagem técnica não acha nada. */}
      {movedOut && (
        <div className="flex items-start gap-3 rounded-2xl border border-yellow-500/25 bg-yellow-500/5 p-4">
          <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
          <div>
            <p className="text-xs font-semibold text-yellow-300">
              Tirar a conversa do app é o passo mais repetido do golpe.
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-300">
              Fora do Tinder ou do Instagram não há denúncia, bloqueio nem histórico — e a
              conversa deixa de ser rastreável pela plataforma. Se veio junto com pedido de
              dinheiro, investimento ou conteúdo íntimo, o padrão está completo.
            </p>
          </div>
        </div>
      )}

      {/* Um resultado limpo é o mais perigoso de ler errado — reforça o limite. */}
      {scan.verdict === 'clean' && handleReports.length === 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-gold/15 bg-gold/5 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <p className="text-xs leading-relaxed text-gray-300">
            Não encontrar nada não é atestado de idoneidade. Se houver pedido de dinheiro,
            investimento em cripto, ajuda com alfândega ou pressão por conteúdo íntimo, o padrão
            é de golpe mesmo com a checagem limpa.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:border-gold/30"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Checar outro contato
        </button>
        <Link
          to="/app/history"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-gray-300 transition-colors hover:border-gold/30 hover:text-white"
        >
          <Check className="h-3.5 w-3.5" />
          Ver histórico
        </Link>
      </div>
    </div>
  )
}

function Evidence({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
      <p className="text-[11px] leading-relaxed text-gray-300">{text}</p>
    </div>
  )
}

function Stat({ value, label }: { value?: number; label: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-bg/60 p-3 text-center">
      <p className="font-display text-xl font-bold text-white">{value ?? '—'}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
    </div>
  )
}

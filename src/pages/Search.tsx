import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaceLivenessDetectorCore } from '@aws-amplify/ui-react-liveness'
import type { AwsCredentialProvider } from '@aws-amplify/ui-react-liveness'
import { ThemeProvider as AmplifyThemeProvider } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { useAuth } from '../lib/auth'
import api from '../lib/api'
import { readApiError } from '../lib/apiError'
import { amplifyLivenessTheme } from '../lib/amplifyTheme'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { cn } from '../lib/utils'
import {
  AlertTriangle,
  Camera,
  Check,
  FileCheck,
  IdCard,
  Loader2,
  RefreshCw,
  ScanFace,
  ShieldCheck,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types — espelham o contrato de /identity/* e /scan/self            */
/* ------------------------------------------------------------------ */

type Step = 'consent' | 'liveness' | 'document' | 'scanning' | 'result'

interface IdentitySession {
  sessionId: string
  /* id da sessão de vivacidade na AWS — o navegador fala direto com ela */
  providerSessionId: string
  region: string
  expiresAt: string
}

interface LivenessCredentials {
  accessKeyId: string
  secretAccessKey: string
  sessionToken: string
  expiration: string
  region: string
}

interface SelfMatch {
  platform: string
  url: string
  confidence: number
  detectedAt: string
}

interface SelfScan {
  status: 'processing' | 'done' | 'failed'
  matches?: SelfMatch[]
  takedownAvailable?: boolean
}

const STEP_ORDER: Step[] = ['consent', 'liveness', 'document', 'scanning', 'result']

/* O backend responde { success, data }. Mesmo desembrulho já usado em auth.tsx. */
function unwrap<T>(body: unknown): T {
  const envelope = body as { data?: T }
  return (envelope?.data ?? body) as T
}

/* ------------------------------------------------------------------ */
/*  Stepper                                                            */
/* ------------------------------------------------------------------ */

function Stepper({ current }: { current: Step }) {
  const steps = [
    { key: 'consent', label: 'Consentimento', icon: ShieldCheck },
    { key: 'liveness', label: 'Captura ao vivo', icon: ScanFace },
    { key: 'document', label: 'CPF', icon: IdCard },
    { key: 'result', label: 'Resultado', icon: FileCheck },
  ] as const

  const currentIndex = STEP_ORDER.indexOf(current)

  return (
    <div className="flex items-center justify-between gap-2 mb-8">
      {steps.map((s, i) => {
        const stepIndex = STEP_ORDER.indexOf(s.key as Step)
        const done = currentIndex > stepIndex
        const active = current === s.key || (s.key === 'result' && current === 'scanning')
        return (
          <div key={s.key} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'h-10 w-10 rounded-xl border flex items-center justify-center transition-colors',
                  done
                    ? 'bg-gold/15 border-gold/40 text-gold'
                    : active
                      ? 'bg-gold/10 border-gold/30 text-gold'
                      : 'bg-surface border-surface-border text-gray-600'
                )}
              >
                {done ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              <span
                className={cn(
                  'text-[10px] text-center leading-tight',
                  active || done ? 'text-gray-300' : 'text-gray-600'
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'h-px flex-1 mb-5',
                  done ? 'bg-gold/30' : 'bg-surface-border'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Página                                                             */
/* ------------------------------------------------------------------ */

export default function SearchPage() {
  const { user, refreshUser } = useAuth()
  const { t } = useTranslation()

  const [step, setStep] = useState<Step>('consent')
  const [session, setSession] = useState<IdentitySession | null>(null)
  const [consented, setConsented] = useState(false)
  const [retentionConsent, setRetentionConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [livenessDone, setLivenessDone] = useState(false)
  const [cpf, setCpf] = useState('')

  const [scan, setScan] = useState<SelfScan | null>(null)

  /* --- 1. consentimento + abertura de sessão --- */
  async function startSession() {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/identity/session', { retentionConsent })
      setSession(unwrap<IdentitySession>(data))
      setStep('liveness')
    } catch (err) {
      setError(readError(err, 'Não foi possível iniciar a verificação. Tente novamente.'))
    } finally {
      setLoading(false)
    }
  }

  /* --- 2. prova de vida ---
     O vídeo vai do navegador direto para a AWS. Nada de captura passa por
     aqui — só pedimos o veredito ao nosso backend quando ela termina. */

  /* Credenciais curtas emitidas pelo nosso backend via STS, escopadas só a
     iniciar a checagem de vivacidade. O formato é o que a Amplify espera. */
  const fetchLivenessCredentials: AwsCredentialProvider = async () => {
    const { data } = await api.get('/identity/liveness-credentials')
    const creds = unwrap<LivenessCredentials>(data)
    return {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      sessionToken: creds.sessionToken,
      expiration: creds.expiration ? new Date(creds.expiration) : undefined,
    }
  }

  async function confirmLiveness() {
    if (!session) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/identity/liveness', {
        sessionId: session.sessionId,
      })
      const result = unwrap<{ status: string; reason?: string }>(data)

      if (result.status !== 'passed') {
        setError(result.reason || 'Não conseguimos confirmar a captura ao vivo. Tente de novo.')
        return
      }

      setLivenessDone(true)
      setStep('document')
    } catch (err) {
      setError(readError(err, 'Falha ao confirmar a captura. Tente novamente.'))
    } finally {
      setLoading(false)
    }
  }

  /* --- 3. identidade (CPF contra base oficial) --- */
  const cpfDigits = cpf.replace(/\D/g, '')

  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11)
    const masked = digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
    setCpf(masked)
  }

  async function submitIdentity() {
    if (!session || cpfDigits.length !== 11) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/identity/identity', {
        sessionId: session.sessionId,
        cpf: cpfDigits,
      })
      const result = unwrap<{ status: string; confidence: number; reason?: string }>(data)

      if (result.status !== 'matched') {
        setError(
          result.reason ||
            'O rosto capturado não confere com o registro oficial deste CPF. A verificação só libera a busca da sua própria imagem.'
        )
        return
      }

      await startScan()
    } catch (err) {
      setError(readError(err, 'Falha ao validar a identidade. Tente novamente.'))
    } finally {
      setLoading(false)
    }
  }

  /* --- 4. varredura (sem foto no payload) --- */
  async function startScan() {
    if (!session) return
    setStep('scanning')
    try {
      const { data } = await api.post('/scan/self', { sessionId: session.sessionId })
      await pollScan(unwrap<{ scanId: string }>(data).scanId)
      await refreshUser()
    } catch (err) {
      setError(readError(err, 'Falha ao iniciar a varredura.'))
      setStep('document')
    }
  }

  async function pollScan(scanId: string) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const { data } = await api.get(`/scan/self/${scanId}`)
      const result = unwrap<SelfScan>(data)
      if (result.status !== 'processing') {
        setScan(result)
        setStep('result')
        return
      }
      await new Promise((resolve) => window.setTimeout(resolve, 3000))
    }
    setError('A varredura está demorando mais que o normal. Consulte o histórico em instantes.')
    setStep('result')
  }

  function reset() {
    setStep('consent')
    setSession(null)
    setConsented(false)
    setRetentionConsent(false)
    setLivenessDone(false)
    setCpf('')
    setScan(null)
    setError('')
  }

  const noCredits = (user?.credits ?? 0) <= 0

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">
          Verificar minha imagem
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Varredura da <span className="text-gray-300">sua própria imagem</span> em plataformas
          de conteúdo adulto. A verificação de identidade é obrigatória.
        </p>
      </div>

      <Card>
        <Stepper current={step} />

        {/* ---------- 1. CONSENTIMENTO ---------- */}
        {step === 'consent' && (
          <div>
            <CardHeader>
              <CardTitle>Antes de começar</CardTitle>
            </CardHeader>

            <div className="space-y-3 mb-6">
              {[
                {
                  icon: ScanFace,
                  text: 'Você centraliza o rosto no oval e segue as instruções na tela. Isso confirma que há uma pessoa presente, e não uma foto ou gravação.',
                },
                {
                  icon: IdCard,
                  text: 'Informa seu CPF. Comparamos o rosto capturado com o registro oficial — sem precisar fotografar documento.',
                },
                {
                  icon: ShieldCheck,
                  text: 'Só então a varredura roda — usando o rosto da captura ao vivo, nunca uma foto enviada por upload.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-lg bg-bg border border-surface-border"
                >
                  <item.icon className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-400 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-gold/5 border border-gold/15 p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <p className="text-xs text-gray-300 leading-relaxed">
                  Este serviço verifica <span className="text-white font-medium">apenas a sua
                  própria imagem</span>. Não é possível pesquisar outra pessoa — nem com foto, nem
                  por nome, telefone ou documento de terceiro.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-surface-border bg-bg accent-gold cursor-pointer"
              />
              <span className="text-xs text-gray-400 leading-relaxed">
                Declaro que sou a pessoa retratada e autorizo o uso da captura ao vivo e do meu
                CPF exclusivamente para esta verificação. São descartados após a conferência.
              </span>
            </label>

            {/* Consentimento separado, e opcional de propósito: aceitar ser
                verificado agora não é aceitar ter a biometria arquivada. */}
            <div className="rounded-lg border border-surface-border bg-bg/60 p-4 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={retentionConsent}
                  onChange={(e) => setRetentionConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-surface-border bg-bg accent-gold cursor-pointer"
                />
                <span className="text-xs text-gray-400 leading-relaxed">
                  <span className="text-gray-300 font-medium">Opcional — monitoramento contínuo.</span>{' '}
                  Autorizo guardar minha referência facial para avisar se o conteúdo reaparecer
                  depois da remoção. Sem isso, ela é apagada ao fim desta varredura e cada nova
                  verificação recomeça do zero.
                </span>
              </label>
              <p className="text-[11px] text-gray-600 mt-2.5 pl-7">
                Pode ser revogado a qualquer momento na sua conta — a revogação apaga a
                referência, não apenas desativa.
              </p>
            </div>

            {noCredits && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {t('search.no_credits')}
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={startSession} loading={loading} disabled={!consented || noCredits}>
                <ShieldCheck className="h-4 w-4" />
                Iniciar verificação
              </Button>
            </div>
          </div>
        )}

        {/* ---------- 2. CAPTURA AO VIVO ---------- */}
        {step === 'liveness' && session && (
          <div>
            <CardHeader>
              <CardTitle>Captura ao vivo</CardTitle>
            </CardHeader>

            <div className="flex items-start gap-3 rounded-lg bg-bg border border-surface-border p-4 mb-5">
              <Camera className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400 leading-relaxed">
                Centralize o rosto no oval e siga as instruções na tela. A captura é
                transmitida direto ao serviço de verificação —{' '}
                <span className="text-gray-300">o vídeo não passa pelos nossos servidores</span>.
              </p>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <Loader2 className="h-8 w-8 text-gold animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-500">Conferindo a captura...</p>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden border border-surface-border">
                <AmplifyThemeProvider theme={amplifyLivenessTheme} colorMode="dark">
                  <FaceLivenessDetectorCore
                    sessionId={session.providerSessionId}
                    region={session.region}
                    config={{ credentialProvider: fetchLivenessCredentials }}
                    onAnalysisComplete={confirmLiveness}
                    onError={(err) => {
                      setError(
                        err?.state === 'CAMERA_ACCESS_ERROR'
                          ? 'Não conseguimos acessar sua câmera. Autorize o acesso para continuar.'
                          : 'A verificação ao vivo falhou. Tente de novo, em local bem iluminado.'
                      )
                    }}
                    disableStartScreen
                  />
                </AmplifyThemeProvider>
              </div>
            )}

            {error && <ErrorBox message={error} />}

            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={reset}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* ---------- 3. DOCUMENTO ---------- */}
        {step === 'document' && (
          <div>
            <CardHeader>
              <CardTitle>Confirmação de identidade</CardTitle>
            </CardHeader>

            {livenessDone && (
              <div className="flex items-center gap-2 text-xs text-gold mb-5">
                <Check className="h-3.5 w-3.5" />
                Captura ao vivo confirmada
              </div>
            )}

            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Informe seu CPF. Comparamos o rosto da captura que você acabou de fazer
              com o registro oficial — <span className="text-gray-300">não é preciso
              fotografar documento</span>.
            </p>

            <div>
              <label
                htmlFor="cpf"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                CPF
              </label>
              <input
                id="cpf"
                inputMode="numeric"
                autoComplete="off"
                value={cpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                className="w-full bg-bg border border-surface-border rounded-lg px-4 py-3 text-white placeholder-gray-600 font-mono tracking-wide focus:border-gold/40 focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-600 mt-2">
                Usado apenas nesta conferência. Não fica guardado.
              </p>
            </div>

            {error && <ErrorBox message={error} />}

            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={reset}>
                Cancelar
              </Button>
              <Button
                onClick={submitIdentity}
                loading={loading}
                disabled={cpfDigits.length !== 11}
              >
                <IdCard className="h-4 w-4" />
                Confirmar identidade
              </Button>
            </div>
          </div>
        )}

        {/* ---------- 4. VARREDURA ---------- */}
        {step === 'scanning' && (
          <div className="py-12 text-center">
            <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto mb-5" />
            <p className="font-display font-bold text-lg text-white">
              Varrendo plataformas
            </p>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
              Comparando o rosto da sua captura ao vivo. Isso leva alguns minutos — pode deixar
              esta aba aberta.
            </p>
          </div>
        )}

        {/* ---------- 5. RESULTADO ---------- */}
        {step === 'result' && (
          <div>
            <CardHeader>
              <CardTitle>Resultado da varredura</CardTitle>
            </CardHeader>

            {error && <ErrorBox message={error} />}

            {scan && scan.matches && scan.matches.length > 0 ? (
              <>
                <div className="flex items-center gap-4 p-5 rounded-lg bg-red-500/5 border border-red-500/20 mb-5">
                  <AlertTriangle className="h-8 w-8 text-red-400 shrink-0" />
                  <div>
                    <p className="font-display font-bold text-white">
                      Sua imagem foi encontrada em {scan.matches.length}{' '}
                      {scan.matches.length === 1 ? 'plataforma' : 'plataformas'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Você pode solicitar a remoção de cada ocorrência.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {scan.matches.map((match) => (
                    <div
                      key={match.url}
                      className="flex items-center justify-between gap-4 p-4 rounded-lg bg-bg border border-surface-border"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-gray-200 font-medium">{match.platform}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Detectado em {formatDate(match.detectedAt)} · confiança{' '}
                          {Math.round(match.confidence * 100)}%
                        </p>
                      </div>
                      <span className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-2.5 py-1 font-medium shrink-0">
                        MATCH
                      </span>
                    </div>
                  ))}
                </div>

                {scan.takedownAvailable && (
                  <Button className="w-full">
                    <FileCheck className="h-4 w-4" />
                    Solicitar remoção
                  </Button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-4 p-5 rounded-lg bg-green-500/5 border border-green-500/20">
                <ShieldCheck className="h-8 w-8 text-green-400 shrink-0" />
                <div>
                  <p className="font-display font-bold text-white">
                    Nenhuma ocorrência encontrada
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Sua imagem não foi localizada nas plataformas monitoradas.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button variant="ghost" onClick={reset}>
                <RefreshCw className="h-4 w-4" />
                Nova verificação
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
      {message}
    </div>
  )
}

function readError(err: unknown, fallback: string) {
  return readApiError(err, fallback)
}



function formatDate(iso: string) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('pt-BR')
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../lib/auth'
import api from '../lib/api'
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
  Upload,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types — espelham o contrato de /identity/* e /scan/self            */
/* ------------------------------------------------------------------ */

type Step = 'consent' | 'liveness' | 'document' | 'scanning' | 'result'

interface IdentitySession {
  sessionId: string
  challenge: string[]
  expiresAt: string
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

/* ------------------------------------------------------------------ */
/*  Stepper                                                            */
/* ------------------------------------------------------------------ */

function Stepper({ current }: { current: Step }) {
  const steps = [
    { key: 'consent', label: 'Consentimento', icon: ShieldCheck },
    { key: 'liveness', label: 'Captura ao vivo', icon: ScanFace },
    { key: 'document', label: 'Documento', icon: IdCard },
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [cameraOn, setCameraOn] = useState(false)
  const [recording, setRecording] = useState(false)
  const [livenessDone, setLivenessDone] = useState(false)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentPreview, setDocumentPreview] = useState<string | null>(null)

  const [scan, setScan] = useState<SelfScan | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  /* --- limpeza da câmera --- */
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
  }, [])

  useEffect(() => stopCamera, [stopCamera])

  /* --- 1. consentimento + abertura de sessão --- */
  async function startSession() {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post<IdentitySession>('/identity/session')
      setSession(data)
      setStep('liveness')
    } catch (err) {
      setError(readError(err, 'Não foi possível iniciar a verificação. Tente novamente.'))
    } finally {
      setLoading(false)
    }
  }

  /* --- 2. captura ao vivo --- */
  async function startCamera() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraOn(true)
    } catch {
      setError('Não conseguimos acessar sua câmera. Autorize o acesso para continuar.')
    }
  }

  function recordLiveness() {
    const stream = streamRef.current
    if (!stream || !session) return

    chunksRef.current = []
    const recorder = new MediaRecorder(stream, { mimeType: pickMimeType() })
    recorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      void submitLiveness(new Blob(chunksRef.current, { type: recorder.mimeType }))
    }

    recorder.start()
    setRecording(true)

    // janela fixa de captura — tempo suficiente para os gestos do desafio
    window.setTimeout(() => {
      if (recorder.state !== 'inactive') recorder.stop()
      setRecording(false)
    }, 6000)
  }

  async function submitLiveness(blob: Blob) {
    if (!session) return
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('sessionId', session.sessionId)
      form.append('capture', blob, 'liveness.webm')

      const { data } = await api.post<{ status: string; reason?: string }>(
        '/identity/liveness',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      if (data.status !== 'passed') {
        setError(data.reason || 'Não conseguimos confirmar a captura ao vivo. Tente de novo.')
        return
      }

      stopCamera()
      setLivenessDone(true)
      setStep('document')
    } catch (err) {
      setError(readError(err, 'Falha ao enviar a captura. Tente novamente.'))
    } finally {
      setLoading(false)
    }
  }

  /* --- 3. documento --- */
  function handleDocumentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setDocumentFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setDocumentPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function submitDocument() {
    if (!session || !documentFile) return
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('sessionId', session.sessionId)
      form.append('document', documentFile)

      const { data } = await api.post<{ status: string; confidence: number }>(
        '/identity/document',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      if (data.status !== 'matched') {
        setError(
          'O rosto do documento não confere com a captura ao vivo. A verificação só libera a busca da sua própria imagem.'
        )
        return
      }

      await startScan()
    } catch (err) {
      setError(readError(err, 'Falha ao validar o documento. Tente novamente.'))
    } finally {
      setLoading(false)
    }
  }

  /* --- 4. varredura (sem foto no payload) --- */
  async function startScan() {
    if (!session) return
    setStep('scanning')
    try {
      const { data } = await api.post<{ scanId: string }>('/scan/self', {
        sessionId: session.sessionId,
      })
      await pollScan(data.scanId)
      await refreshUser()
    } catch (err) {
      setError(readError(err, 'Falha ao iniciar a varredura.'))
      setStep('document')
    }
  }

  async function pollScan(scanId: string) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const { data } = await api.get<SelfScan>(`/scan/self/${scanId}`)
      if (data.status !== 'processing') {
        setScan(data)
        setStep('result')
        return
      }
      await new Promise((resolve) => window.setTimeout(resolve, 3000))
    }
    setError('A varredura está demorando mais que o normal. Consulte o histórico em instantes.')
    setStep('result')
  }

  function reset() {
    stopCamera()
    setStep('consent')
    setSession(null)
    setConsented(false)
    setRecording(false)
    setLivenessDone(false)
    setDocumentFile(null)
    setDocumentPreview(null)
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
                  text: 'Você faz uma captura ao vivo pela câmera, seguindo gestos que o sistema pede na hora.',
                },
                {
                  icon: IdCard,
                  text: 'Envia um documento com foto. Comparamos com a captura para confirmar que é você.',
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

            <label className="flex items-start gap-3 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-surface-border bg-bg accent-gold cursor-pointer"
              />
              <span className="text-xs text-gray-400 leading-relaxed">
                Declaro que sou a pessoa retratada e autorizo o uso da captura e do documento
                exclusivamente para esta verificação. Ambos são descartados após a conferência.
              </span>
            </label>

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

            <div className="rounded-lg bg-bg border border-surface-border p-4 mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
                Faça estes gestos, nesta ordem
              </p>
              <div className="flex flex-wrap gap-2">
                {session.challenge.map((gesture, i) => (
                  <span
                    key={gesture}
                    className="inline-flex items-center gap-2 bg-gold/10 text-gold text-xs px-3 py-1.5 rounded-full border border-gold/20"
                  >
                    <span className="font-bold">{i + 1}</span>
                    {humanizeGesture(gesture)}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden bg-bg border border-surface-border aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              {!cameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Camera className="h-8 w-8 text-gray-600" />
                  <Button variant="outline" size="sm" onClick={startCamera}>
                    Ativar câmera
                  </Button>
                </div>
              )}
              {recording && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  GRAVANDO
                </div>
              )}
            </div>

            {error && <ErrorBox message={error} />}

            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={reset}>
                Cancelar
              </Button>
              <Button
                onClick={recordLiveness}
                loading={loading}
                disabled={!cameraOn || recording}
              >
                <ScanFace className="h-4 w-4" />
                {recording ? 'Gravando...' : 'Gravar captura'}
              </Button>
            </div>
          </div>
        )}

        {/* ---------- 3. DOCUMENTO ---------- */}
        {step === 'document' && (
          <div>
            <CardHeader>
              <CardTitle>Documento com foto</CardTitle>
            </CardHeader>

            {livenessDone && (
              <div className="flex items-center gap-2 text-xs text-gold mb-4">
                <Check className="h-3.5 w-3.5" />
                Captura ao vivo confirmada
              </div>
            )}

            <label
              className={cn(
                'flex flex-col items-center justify-center w-full h-56 rounded-lg border-2 border-dashed cursor-pointer transition-colors',
                documentPreview
                  ? 'border-gold/30 bg-gold/5'
                  : 'border-surface-border bg-surface hover:border-gold/20'
              )}
            >
              {documentPreview ? (
                <img src={documentPreview} alt="" className="h-full object-contain rounded p-2" />
              ) : (
                <div className="text-center px-6">
                  <Upload className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">RG, CNH ou passaporte</p>
                  <p className="text-xs text-gray-600 mt-1">
                    A foto do documento precisa estar legível
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleDocumentChange}
              />
            </label>

            {documentFile && (
              <p className="text-xs text-gray-500 mt-2">{documentFile.name}</p>
            )}

            {error && <ErrorBox message={error} />}

            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={reset}>
                Cancelar
              </Button>
              <Button onClick={submitDocument} loading={loading} disabled={!documentFile}>
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
  const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
  return msg || fallback
}

function humanizeGesture(gesture: string) {
  const map: Record<string, string> = {
    virar_esquerda: 'Vire o rosto à esquerda',
    virar_direita: 'Vire o rosto à direita',
    piscar: 'Pisque devagar',
    sorrir: 'Sorria',
    aproximar: 'Aproxime-se da câmera',
  }
  return map[gesture] || gesture
}

function pickMimeType() {
  const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4']
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || ''
}

function formatDate(iso: string) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('pt-BR')
}

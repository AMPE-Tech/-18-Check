import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../lib/auth'
import api from '../lib/api'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { cn, riskColor } from '../lib/utils'
import {
  User,
  Phone,
  AtSign,
  Camera,
  Search as SearchIcon,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Upload,
} from 'lucide-react'

interface Finding {
  category: string
  detail: string
  severity: string
  url?: string
  platform?: string
  score?: number
  confidence?: number
  signals?: string[]
}

interface AliasExtracted {
  alias: string
  count: number
}

interface SearchResult {
  id: string
  riskLevel: string
  riskScore: number
  findings: Finding[]
  summary: string
  overallConfidence?: number
  aliasesExtracted?: AliasExtracted[]
  pipelineStoppedAt?: number
  etapa1Positive?: boolean
  etapa2Positive?: boolean
  totalMatches?: number
  adultMatches?: number
  elapsedMs?: number
}

export default function SearchPage() {
  const { user, refreshUser } = useAuth()
  const { t } = useTranslation()

  const tabs = [
    { key: 'name', label: t('search.tab_name'), icon: User },
    { key: 'phone', label: t('search.tab_phone'), icon: Phone },
    { key: 'social', label: t('search.tab_social'), icon: AtSign },
    { key: 'photo', label: t('search.tab_photo'), icon: Camera },
  ] as const
  const [activeTab, setActiveTab] = useState<string>('name')
  const [scenarioType, setScenarioType] = useState<string>('romance_scam')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [social, setSocial] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  async function handleSearch() {
    if ((user?.credits ?? 0) <= 0) {
      setError(t('search.no_credits'))
      return
    }

    setError('')
    setResult(null)
    setLoading(true)

    try {
      const payload: Record<string, string> = {}
      payload.scenarioType = scenarioType
      if (name.trim()) payload.name = name.trim()
      if (phone.trim()) payload.phone = phone.trim()
      if (social.trim()) payload.social = social.trim()
      if (imageFile) {
        // For now, send image as base64 in imagePath
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(imageFile)
        })
        payload.imagePath = base64
      }

      const hasSearchData = name.trim() || phone.trim() || social.trim() || imageFile
      if (!hasSearchData) {
        setError(t('search.subtitle'))
        setLoading(false)
        return
      }

      const { data } = await api.post('/search/full', payload)
      setResult(data.data)
      await refreshUser()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Erro ao realizar pesquisa. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function riskIcon(level: string) {
    switch (level) {
      case 'HIGH': return <XCircle className="h-8 w-8 text-red-400" />
      case 'MEDIUM': return <AlertTriangle className="h-8 w-8 text-yellow-400" />
      case 'LOW': return <CheckCircle2 className="h-8 w-8 text-green-400" />
      default: return <CheckCircle2 className="h-8 w-8 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">{t('search.title')}</h1>
        <p className="text-gray-500 mt-1">
          {t('search.subtitle')}
        </p>
      </div>

      {/* Seletor de Cenários */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-300">Tipo de Investigação</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Romance Scam */}
          <button
            onClick={() => setScenarioType('romance_scam')}
            className={cn(
              'p-4 rounded-lg border transition-all cursor-pointer text-left',
              scenarioType === 'romance_scam'
                ? 'border-gold bg-gold/10 ring-2 ring-gold/20'
                : 'border-surface-border hover:border-gold/30 bg-surface'
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">🛡️</span>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">Romance Scam</p>
                <p className="text-xs text-gray-500 mt-0.5">Criminoso de app de relacionamento</p>
                <p className="text-xs text-gold font-medium mt-2">R$ 49,90 · 1 crédito</p>
              </div>
            </div>
          </button>

          {/* Parceiro do Job */}
          <button
            onClick={() => setScenarioType('job_partner')}
            className={cn(
              'p-4 rounded-lg border transition-all cursor-pointer text-left',
              scenarioType === 'job_partner'
                ? 'border-gold bg-gold/10 ring-2 ring-gold/20'
                : 'border-surface-border hover:border-gold/30 bg-surface'
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">💔</span>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">Parceiro do Job</p>
                <p className="text-xs text-gray-500 mt-0.5">Perfis ocultos em plataformas adultas</p>
                <p className="text-xs text-gold font-medium mt-2">R$ 49,90 · 1 crédito</p>
              </div>
            </div>
          </button>

          {/* Vídeos Íntimos */}
          <button
            onClick={() => setScenarioType('intimate_video')}
            className={cn(
              'p-4 rounded-lg border transition-all cursor-pointer text-left',
              scenarioType === 'intimate_video'
                ? 'border-gold bg-gold/10 ring-2 ring-gold/20'
                : 'border-surface-border hover:border-gold/30 bg-surface'
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">📹</span>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">Vídeos Íntimos</p>
                <p className="text-xs text-gray-500 mt-0.5">Sextorsão e exposição</p>
                <p className="text-xs text-gold font-medium mt-2">R$ 49,90 · 1 crédito</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados para Verificação</CardTitle>
        </CardHeader>

        {/* Tabs */}
        <div className="flex gap-1 bg-bg rounded-lg p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer',
                activeTab === tab.key
                  ? 'bg-surface-light text-gold border border-gold/20'
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {activeTab === 'name' && (
            <Input
              id="name"
              label={t('search.tab_name')}
              placeholder={t('search.name_placeholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          {activeTab === 'phone' && (
            <Input
              id="phone"
              label={t('search.tab_phone')}
              placeholder={t('search.phone_placeholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          )}
          {activeTab === 'social' && (
            <Input
              id="social"
              label={t('search.tab_social')}
              placeholder={t('search.social_placeholder')}
              value={social}
              onChange={(e) => setSocial(e.target.value)}
            />
          )}
          {activeTab === 'photo' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Foto biométrica facial
              </label>

              {/* UX biométrica — Marcos 29/04/2026 */}
              <div className="mb-3 p-3 rounded-lg bg-gold/5 border border-gold/20 text-xs text-gray-400 leading-relaxed">
                <p className="text-gold font-medium mb-1.5">📸 Não use foto de Instagram com filtro</p>
                <p className="mb-2">
                  Usamos biometria facial real (não reconhecimento por contexto). Pra funcionar, a foto precisa de:
                </p>
                <ul className="space-y-0.5 ml-3 list-disc text-gray-500">
                  <li>Rosto de frente (não perfil, não de costas)</li>
                  <li>Bem iluminado, sem filtros do Instagram/Snapchat</li>
                  <li>Sem óculos escuros, máscara ou cabelo cobrindo</li>
                  <li>Pessoa sozinha no frame</li>
                  <li>Resolução mínima 640×640, formato JPG/PNG</li>
                </ul>
              </div>

              <label
                className={cn(
                  'flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed cursor-pointer transition-colors',
                  imagePreview
                    ? 'border-gold/30 bg-gold/5'
                    : 'border-surface-border bg-surface hover:border-gold/20'
                )}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full object-contain rounded" />
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Enviar foto biométrica</p>
                    <p className="text-xs text-gray-600 mt-1">JPG ou PNG · ≥ 640×640 · sem filtros</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {imageFile && (
                <p className="text-xs text-gray-500 mt-2">{imageFile.name}</p>
              )}
            </div>
          )}

          {/* Summary of filled fields */}
          <div className="flex flex-wrap gap-2 pt-2">
            {name && (
              <span className="inline-flex items-center gap-1.5 bg-gold/10 text-gold text-xs px-2.5 py-1 rounded-full">
                <User className="h-3 w-3" /> {name}
              </span>
            )}
            {phone && (
              <span className="inline-flex items-center gap-1.5 bg-gold/10 text-gold text-xs px-2.5 py-1 rounded-full">
                <Phone className="h-3 w-3" /> {phone}
              </span>
            )}
            {social && (
              <span className="inline-flex items-center gap-1.5 bg-gold/10 text-gold text-xs px-2.5 py-1 rounded-full">
                <AtSign className="h-3 w-3" /> {social}
              </span>
            )}
            {imageFile && (
              <span className="inline-flex items-center gap-1.5 bg-gold/10 text-gold text-xs px-2.5 py-1 rounded-full">
                <Camera className="h-3 w-3" /> {t('search.tab_photo')}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSearch} loading={loading}>
            <SearchIcon className="h-4 w-4" />
            {t('search.investigate_button')} ({user?.credits ?? 0})
          </Button>
        </div>
      </Card>

      {/* Results */}
      {result && (
        <Card className="overflow-hidden">
          <div className={cn(
            'flex items-center gap-4 p-6 -m-6 mb-6 border-b',
            result.riskLevel === 'HIGH' ? 'bg-red-500/5 border-red-500/20' :
            result.riskLevel === 'MEDIUM' ? 'bg-yellow-500/5 border-yellow-500/20' :
            result.riskLevel === 'LOW' ? 'bg-green-500/5 border-green-500/20' :
            'bg-gray-500/5 border-gray-500/20'
          )}>
            {riskIcon(result.riskLevel)}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="font-display font-bold text-xl text-white">{t('search.result_title')}</h2>
                <Badge level={result.riskLevel} />
              </div>
              {result.riskScore !== undefined && (
                <p className="text-sm text-gray-400 mt-1">
                  {t('search.risk_score')}: <span className={cn('font-mono font-bold', riskColor(result.riskLevel).split(' ')[0])}>{result.riskScore}/100</span>
                </p>
              )}
            </div>
            <ShieldAlert className={cn(
              'h-12 w-12 opacity-20',
              result.riskLevel === 'HIGH' ? 'text-red-400' :
              result.riskLevel === 'MEDIUM' ? 'text-yellow-400' :
              'text-green-400'
            )} />
          </div>

          {result.summary && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">{t('search.result_title')}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{result.summary}</p>
            </div>
          )}

          {/* V6 — Confidence overall + status do pipeline */}
          {result.overallConfidence !== undefined && result.overallConfidence > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-gold/5 border border-gold/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Confiança da identificação</p>
                  <p className="text-2xl font-display font-bold text-gold mt-0.5">
                    {result.overallConfidence}%
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500 leading-relaxed">
                  {result.pipelineStoppedAt === 2 ? (
                    <>
                      <p className="text-gold font-medium">Validação cruzada cedo</p>
                      <p>Foto + telefone confirmaram em 2 etapas.</p>
                    </>
                  ) : result.pipelineStoppedAt === 5 ? (
                    <>
                      <p className="text-gold font-medium">Pipeline completo</p>
                      <p>5 etapas executadas, incluindo descoberta de pseudônimos.</p>
                    </>
                  ) : (
                    <p className="text-gray-500">Pipeline executado.</p>
                  )}
                  {result.elapsedMs !== undefined && (
                    <p className="text-gray-600 mt-1">{(result.elapsedMs / 1000).toFixed(1)}s</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* V6 — Pseudônimos descobertos (etapa 3) */}
          {result.aliasesExtracted && result.aliasesExtracted.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Pseudônimos descobertos
                <span className="ml-2 text-xs font-normal text-gray-500">
                  (extraídos automaticamente das URLs encontradas)
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.aliasesExtracted.map((a, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 bg-gold/10 text-gold text-xs px-2.5 py-1 rounded-full border border-gold/20"
                  >
                    <AtSign className="h-3 w-3" />
                    {a.alias}
                    <span className="text-gray-500 font-mono">×{a.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.findings && result.findings.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">{t('search.findings')}</h3>
              <div className="space-y-2">
                {result.findings.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-bg border border-surface-border"
                  >
                    <div className={cn(
                      'mt-1 h-2 w-2 rounded-full shrink-0',
                      f.severity === 'high' ? 'bg-red-400' :
                      f.severity === 'medium' ? 'bg-yellow-400' :
                      'bg-green-400'
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {f.category === 'adult_content' ? 'Plataforma adulta' : f.category === 'social_presence' ? 'Rede social' : f.category}
                        </p>
                        {f.confidence !== undefined && f.confidence > 0 && (
                          <span className={cn(
                            'text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0',
                            f.confidence >= 95 ? 'bg-red-500/15 text-red-300 border border-red-500/30' :
                            f.confidence >= 85 ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30' :
                            f.confidence >= 50 ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30' :
                            'bg-gray-500/15 text-gray-400 border border-gray-500/30'
                          )}>
                            {f.confidence}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300">{f.detail}</p>
                      {f.url && (
                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold/70 hover:text-gold mt-1 truncate block">
                          {f.url}
                        </a>
                      )}
                      {f.signals && f.signals.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {f.signals.map((s, j) => (
                            <span key={j} className="text-[10px] text-gray-500 bg-surface-border/50 px-1.5 py-0.5 rounded font-mono">
                              {s === 'phone' ? '📞 telefone' :
                                s === 'photo' ? '📸 foto' :
                                  s === 'alias' ? '🎭 pseudo' :
                                    s === 'name' ? '👤 nome' : s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

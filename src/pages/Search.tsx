import { useState, useEffect } from 'react'
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
  Trash2,
  RefreshCw,
  X,
} from 'lucide-react'

interface RawResult {
  title?: string
  url?: string
  snippet?: string
  platform?: string
  isAdult?: boolean
  score?: number
  signals?: string[]
}

interface SectionStat {
  total: number
  adultos: number
  input: string | null
}

interface SearchResult {
  id: string
  riskLevel: string
  riskScore: number
  summary: string
  sections?: {
    por_telefone: RawResult[]
    por_nome: RawResult[]
    por_social: RawResult[]
    por_foto: RawResult[]
  }
  sectionStats?: {
    telefone: SectionStat
    nome: SectionStat
    social: SectionStat
    foto: SectionStat
  }
  totalMatches?: number
  adultMatches?: number
  elapsedMs?: number
}

export default function SearchPage() {
  const { user, refreshUser } = useAuth()
  const { t } = useTranslation()

  const scenarios = [
    { id: 'romance_scam', icon: '🛡️', title: 'Romance Scam', desc: 'Criminoso de app de relacionamento', price: 'R$ 49,90 · 1 crédito' },
    { id: 'job_partner', icon: '💔', title: 'Parceiro do Job', desc: 'Perfis ocultos em plataformas adultas', price: 'R$ 49,90 · 1 crédito' },
    { id: 'intimate_video', icon: '📹', title: 'Vídeos Íntimos', desc: 'Sextorsão e exposição', price: 'R$ 49,90 · 1 crédito' },
  ]

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
  const [imageMeta, setImageMeta] = useState<{ w: number; h: number; sizeKB: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)

  // Limpeza de memória do Object URL para evitar memory leak
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      if (imagePreview) URL.revokeObjectURL(imagePreview)
      const url = URL.createObjectURL(file)
      setImagePreview(url)
      // Captura dimensões reais pra mostrar no card compacto
      const img = new Image()
      img.onload = () => {
        setImageMeta({
          w: img.naturalWidth,
          h: img.naturalHeight,
          sizeKB: Math.round(file.size / 1024),
        })
      }
      img.src = url
    }
  }

  function handleRemoveImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
    setImageMeta(null)
  }

  async function handleDeleteSearch() {
    if (!result?.id) return
    if (!confirm('Apagar esta pesquisa imediatamente? Esta ação não pode ser desfeita.')) return
    setDeleting(true)
    try {
      await api.delete(`/search/${result.id}`)
      setDeleted(true)
      setTimeout(() => {
        setResult(null)
        setDeleted(false)
      }, 1500)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao apagar pesquisa')
    } finally {
      setDeleting(false)
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
      // INVESTIGAÇÃO GLOBAL — manda TODOS os campos preenchidos (Marcos 30/04/2026)
      // 1 crédito = 1 relatório com até 4 seções (telefone/nome/social/foto)
      const payload: Record<string, string> = {}
      payload.scenarioType = scenarioType

      let hasSearchData = false
      if (name.trim()) { payload.name = name.trim(); hasSearchData = true }
      if (phone.trim()) { payload.phone = phone.trim(); hasSearchData = true }
      if (social.trim()) { payload.social = social.trim(); hasSearchData = true }
      if (imageFile) {
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(imageFile)
        })
        payload.imagePath = base64
        hasSearchData = true
      }

      if (!hasSearchData) {
        setError('Preencha pelo menos um campo (nome, telefone, social ou foto) antes de investigar.')
        setLoading(false)
        return
      }

      const { data } = await api.post('/search/full', payload)
      setResult(data.data)
      await refreshUser()
    } catch (err: any) {
      const msg = err?.response?.data?.message
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
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setScenarioType(scenario.id)}
              className={cn(
                'p-4 rounded-lg border transition-all cursor-pointer text-left',
                scenarioType === scenario.id
                  ? 'border-gold bg-gold/10 ring-2 ring-gold/20'
                  : 'border-surface-border hover:border-gold/30 bg-surface'
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{scenario.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{scenario.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{scenario.desc}</p>
                  <p className="text-xs text-gold font-medium mt-2">{scenario.price}</p>
                </div>
              </div>
            </button>
          ))}
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

              {/* UX biométrica */}
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

              {imagePreview ? (
                // Estado COM foto: card compacto horizontal
                <div className="flex items-center gap-4 p-4 rounded-lg bg-surface border border-gold/30">
                  <img
                    src={imagePreview}
                    alt="Preview biométrico"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gold/40 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                      <p className="text-sm font-medium text-gold truncate">{imageFile?.name || 'Foto'}</p>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      {imageMeta ? `${imageMeta.w}×${imageMeta.h} · ${imageMeta.sizeKB} KB` : 'Carregando metadados...'}
                    </p>
                    <p className="text-xs text-green-400/80 mb-3">Foto biométrica pronta pra investigação</p>
                    <div className="flex gap-2">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs px-3 py-1.5 rounded-md bg-gold/10 text-gold hover:bg-gold/20 border border-gold/30 transition-colors">
                        <RefreshCw className="h-3 w-3" />
                        Trocar
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                      >
                        <X className="h-3 w-3" />
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Estado SEM foto: dropzone original
                <label
                  className={cn(
                    'flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed cursor-pointer transition-colors',
                    'border-surface-border bg-surface hover:border-gold/20'
                  )}
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Enviar foto biométrica</p>
                    <p className="text-xs text-gray-600 mt-1">JPG ou PNG · ≥ 640×640 · sem filtros</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          )}

          {/* Summary of filled fields - Mostrado opcionalmente para dar contexto */}
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
          <Button 
            onClick={handleSearch} 
            loading={loading}
            disabled={(user?.credits ?? 0) <= 0}
          >
            <SearchIcon className="h-4 w-4" />
            {t('search.investigate_button')} ({user?.credits ?? 0})
          </Button>
        </div>
      </Card>

      {/* V7 — Banner privacidade + botão apagar imediatamente (Marcos 30/04/2026) */}
      {result && !deleted && (
        <Card className="border-gold/20 bg-gold/5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="h-4 w-4 text-gold shrink-0" />
                <p className="text-sm font-medium text-gold">Sua privacidade está protegida</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Esta pesquisa será apagada automaticamente em <span className="text-gold font-medium">7 dias</span>.
                Se preferir, você pode apagar agora pra não deixar nada gravado.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDeleteSearch}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-md bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/30 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? 'Apagando...' : 'Apagar imediatamente'}
            </button>
          </div>
        </Card>
      )}

      {/* Confirmação de exclusão */}
      {deleted && (
        <Card className="border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <p className="text-sm text-green-300">Pesquisa apagada. Nada ficou gravado.</p>
          </div>
        </Card>
      )}

      {/* Results */}
      {result && !deleted && (
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

          {/* V8 — INVESTIGAÇÃO GLOBAL · 4 seções segmentadas (Marcos 30/04/2026) */}
          {result.sections && result.sectionStats && (
            <div className="space-y-6">
              {result.elapsedMs !== undefined && (
                <p className="text-xs text-gray-600">Investigação global concluída em {(result.elapsedMs / 1000).toFixed(1)}s</p>
              )}

              {/* TELEFONE */}
              {result.sectionStats.telefone.input && (
                <SectionCard
                  icon="📞"
                  label="Telefone"
                  inputValue={result.sectionStats.telefone.input}
                  total={result.sectionStats.telefone.total}
                  adultos={result.sectionStats.telefone.adultos}
                  results={result.sections.por_telefone}
                />
              )}

              {/* NOME */}
              {result.sectionStats.nome.input && (
                <SectionCard
                  icon="👤"
                  label="Nome"
                  inputValue={result.sectionStats.nome.input}
                  total={result.sectionStats.nome.total}
                  adultos={result.sectionStats.nome.adultos}
                  results={result.sections.por_nome}
                />
              )}

              {/* REDES SOCIAIS */}
              {result.sectionStats.social.input && (
                <SectionCard
                  icon="@"
                  label="Rede social"
                  inputValue={result.sectionStats.social.input}
                  total={result.sectionStats.social.total}
                  adultos={result.sectionStats.social.adultos}
                  results={result.sections.por_social}
                />
              )}

              {/* FOTO */}
              {result.sectionStats.foto.input && (
                <SectionCard
                  icon="📸"
                  label="Foto biométrica"
                  inputValue="imagem enviada"
                  total={result.sectionStats.foto.total}
                  adultos={result.sectionStats.foto.adultos}
                  results={result.sections.por_foto}
                />
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

// V8 — Card de seção da investigação global (Marcos 30/04/2026)
function SectionCard({
  icon,
  label,
  inputValue,
  total,
  adultos,
  results,
}: {
  icon: string
  label: string
  inputValue: string
  total: number
  adultos: number
  results: RawResult[]
}) {
  const empty = total === 0
  return (
    <div className={cn(
      'rounded-lg border p-4',
      empty ? 'border-surface-border bg-surface/50' : 'border-gold/20 bg-gold/5'
    )}>
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-0.5">{label}</p>
          <p className="text-sm font-medium text-white truncate">
            <span className="mr-2">{icon}</span>{inputValue}
          </p>
        </div>
        <div className="text-right">
          {empty ? (
            <span className="text-xs text-gray-500">Nenhum resultado</span>
          ) : (
            <>
              <p className="text-2xl font-display font-bold text-gold leading-none">{total}</p>
              <p className="text-[10px] text-red-300 mt-1">{adultos} em sites adultos</p>
            </>
          )}
        </div>
      </div>

      {!empty && (
        <div className="space-y-1.5 mt-3">
          {results.slice(0, 10).map((r, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded bg-bg/50 border border-surface-border/50">
              <div className={cn(
                'mt-1 h-1.5 w-1.5 rounded-full shrink-0',
                r.isAdult ? 'bg-red-400' : 'bg-gray-500'
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono text-gold/70 uppercase">{r.platform || 'outro'}</span>
                  {r.isAdult && (
                    <span className="text-[10px] text-red-300 bg-red-500/10 border border-red-500/30 px-1.5 rounded">
                      🔞 adulto
                    </span>
                  )}
                </div>
                {r.title && (
                  <p className="text-xs text-gray-300 truncate">{r.title}</p>
                )}
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-gold/70 hover:text-gold mt-0.5 truncate block"
                  >
                    {r.url}
                  </a>
                )}
              </div>
            </div>
          ))}
          {results.length > 10 && (
            <p className="text-[10px] text-gray-600 text-center pt-2">
              + {results.length - 10} resultados adicionais (gravados no histórico)
            </p>
          )}
        </div>
      )}
    </div>
  )
}

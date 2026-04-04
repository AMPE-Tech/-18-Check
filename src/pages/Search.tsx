import { useState } from 'react'
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

interface SearchResult {
  id: string
  riskLevel: string
  riskScore: number
  findings: {
    category: string
    detail: string
    severity: string
  }[]
  summary: string
}

const tabs = [
  { key: 'name', label: 'Nome', icon: User },
  { key: 'phone', label: 'Telefone', icon: Phone },
  { key: 'social', label: 'Rede Social', icon: AtSign },
  { key: 'photo', label: 'Foto', icon: Camera },
] as const

export default function SearchPage() {
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<string>('name')
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
      setError('Sem créditos. Faça upgrade do seu plano para continuar.')
      return
    }

    setError('')
    setResult(null)
    setLoading(true)

    try {
      const payload: Record<string, string> = {}
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

      if (Object.keys(payload).length === 0) {
        setError('Preencha ao menos um campo para pesquisar.')
        setLoading(false)
        return
      }

      const { data } = await api.post('/search/full', payload)
      setResult(data)
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
        <h1 className="font-display font-bold text-2xl text-white">Nova Pesquisa</h1>
        <p className="text-gray-500 mt-1">
          Preencha os dados disponíveis. Quanto mais informações, mais precisa a análise.
        </p>
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
              label="Nome completo"
              placeholder="Ex: João da Silva Santos"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          {activeTab === 'phone' && (
            <Input
              id="phone"
              label="Telefone"
              placeholder="Ex: (11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          )}
          {activeTab === 'social' && (
            <Input
              id="social"
              label="Perfil de rede social"
              placeholder="Ex: @usuario ou URL do perfil"
              value={social}
              onChange={(e) => setSocial(e.target.value)}
            />
          )}
          {activeTab === 'photo' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Foto para análise facial
              </label>
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
                    <p className="text-sm text-gray-500">Clique para enviar uma foto</p>
                    <p className="text-xs text-gray-600 mt-1">JPG, PNG até 10MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
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
                <Camera className="h-3 w-3" /> Foto anexada
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
            Pesquisar ({user?.credits ?? 0} créditos)
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
                <h2 className="font-display font-bold text-xl text-white">Resultado da Análise</h2>
                <Badge level={result.riskLevel} />
              </div>
              {result.riskScore !== undefined && (
                <p className="text-sm text-gray-400 mt-1">
                  Score de risco: <span className={cn('font-mono font-bold', riskColor(result.riskLevel).split(' ')[0])}>{result.riskScore}/100</span>
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
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Resumo</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{result.summary}</p>
            </div>
          )}

          {result.findings && result.findings.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Descobertas</h3>
              <div className="space-y-2">
                {result.findings.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-bg border border-surface-border"
                  >
                    <div className={cn(
                      'mt-0.5 h-2 w-2 rounded-full shrink-0',
                      f.severity === 'high' ? 'bg-red-400' :
                      f.severity === 'medium' ? 'bg-yellow-400' :
                      'bg-green-400'
                    )} />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{f.category}</p>
                      <p className="text-sm text-gray-300">{f.detail}</p>
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

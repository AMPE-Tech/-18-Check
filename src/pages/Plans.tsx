import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useTranslation } from 'react-i18next'
import api from '../lib/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Check, Star, Zap, Crown } from 'lucide-react'
import { cn } from '../lib/utils'

const plans = [
  {
    key: 'single',
    name: 'Investigação Única',
    icon: Zap,
    price: 'R$ 129',
    period: 'por investigação',
    credits: '1 investigação completa',
    features: [
      'Pesquisa textual',
      'Varredura social',
      'Análise facial',
      'Score de risco detalhado',
      'Relatório completo em PDF',
    ],
    notIncluded: [
      'Monitoramento contínuo',
      'Acesso via API',
      'Suporte prioritário',
    ],
    highlight: true,
  },
  {
    key: 'pro',
    name: 'Monitoramento Pro',
    icon: Crown,
    price: 'R$ 479',
    period: '/mês',
    credits: 'Investigações ilimitadas',
    features: [
      'Pesquisa textual',
      'Varredura social',
      'Análise facial',
      'Score de risco detalhado',
      'Relatório completo em PDF',
      'Monitoramento contínuo',
      'Alertas em tempo real',
      'Acesso via API',
      'Suporte prioritário',
      'Dashboard avançado',
    ],
    notIncluded: [],
  },
]

const creditPacks = [
  { amount: 2, price: 'R$ 248', perUnit: 'R$ 124/investigação', planType: 'pack2' },
  { amount: 3, price: 'R$ 340', perUnit: 'R$ 113/investigação', planType: 'pack3' },
  { amount: 4, price: 'R$ 443', perUnit: 'R$ 110/investigação', planType: 'pack4' },
  { amount: 5, price: 'R$ 541', perUnit: 'R$ 108/investigação', planType: 'pack5' },
  { amount: 10, price: 'R$ 1.057', perUnit: 'R$ 105/investigação', planType: 'pack10' },
]

export default function PlansPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  async function handleCheckout(planType: string) {
    setLoadingPlan(planType)
    try {
      const { data } = await api.post('/billing/checkout', { planType })
      const result = data.data || data
      if (result.url) {
        window.location.href = result.url
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg || 'Erro ao iniciar pagamento. Tente novamente.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="space-y-10 max-w-6xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">{t('plans.title')}</h1>
        <p className="text-gray-500 mt-1">
          {t('plans.current_plan')}: <span className="text-gold font-medium capitalize">{user?.plan || t('plans.no_plan')}</span>
          {' '}&middot;{' '}
          {t('plans.credits_label')}: <span className="text-gold font-mono">{user?.credits ?? 0}</span>
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
        {plans.map((plan) => {
          const isCurrent = (user?.plan || 'free').toLowerCase() === plan.key
          return (
            <Card
              key={plan.key}
              className={cn(
                'flex flex-col relative',
                plan.highlight && 'border-gold/40 bg-gold/[0.03]'
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" /> {t('plans.most_sold')}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center',
                  plan.highlight ? 'bg-gold/20' : 'bg-surface-light'
                )}>
                  <plan.icon className={cn('h-5 w-5', plan.highlight ? 'text-gold' : 'text-gray-400')} />
                </div>
                <h2 className="font-display font-bold text-xl text-white">{plan.name}</h2>
              </div>

              <div className="mb-1">
                <span className="font-display font-extrabold text-4xl text-white">{plan.price}</span>
                <span className="text-gray-500 text-sm ml-1">{plan.period}</span>
              </div>
              <p className="text-sm text-gold font-medium mb-6">{plan.credits}</p>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Check className="h-4 w-4 text-gold shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.notIncluded?.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600 line-through">
                    <Check className="h-4 w-4 text-gray-700 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Button variant="secondary" disabled className="w-full">
                  {t('plans.current')}
                </Button>
              ) : (
                <Button
                  variant={plan.highlight ? 'primary' : 'outline'}
                  className="w-full"
                  loading={loadingPlan === plan.key}
                  onClick={() => handleCheckout(plan.key)}
                >
                  {plan.key === 'single' ? t('plans.investigate_now') : t('plans.subscribe', { name: plan.name })}
                </Button>
              )}
            </Card>
          )
        })}
      </div>

      {/* Credit Packs */}
      <div>
        <h2 className="font-display font-bold text-xl text-white mb-2">{t('plans.packs_title')}</h2>
        <p className="text-sm text-gray-500 mb-6">{t('plans.packs_desc')}</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {creditPacks.map((pack) => (
            <Card key={pack.amount} className="text-center hover:border-gold/20 transition-colors">
              <p className="font-display font-bold text-3xl text-white">{pack.amount}</p>
              <p className="text-sm text-gray-500 mb-1">{t('plans.investigations')}</p>
              <p className="font-display font-bold text-xl text-gold mb-1">{pack.price}</p>
              <p className="text-xs text-gray-600 mb-4">{pack.perUnit}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                loading={loadingPlan === pack.planType}
                onClick={() => handleCheckout(pack.planType)}
              >
                {t('plans.buy')}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

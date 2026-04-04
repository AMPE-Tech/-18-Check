import { useAuth } from '../lib/auth'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Check, Star, Zap, Crown } from 'lucide-react'
import { cn } from '../lib/utils'

const plans = [
  {
    key: 'free',
    name: 'Free',
    icon: Zap,
    price: 'R$ 0',
    period: 'para sempre',
    credits: '3 pesquisas totais',
    features: [
      'Pesquisa textual',
      'Varredura social',
      'Score de risco',
    ],
    notIncluded: [
      'Análise facial',
      'Histórico completo',
      'Exportar PDF',
      'Acesso via API',
    ],
  },
  {
    key: 'basic',
    name: 'Basic',
    icon: Star,
    price: 'R$ 29',
    period: '/mês',
    credits: '30 pesquisas/mês',
    features: [
      'Pesquisa textual',
      'Varredura social',
      'Score de risco',
      'Análise facial',
      'Histórico completo',
      'Exportar PDF',
    ],
    notIncluded: [
      'Acesso via API',
      'Suporte prioritário',
    ],
    highlight: true,
  },
  {
    key: 'pro',
    name: 'Pro',
    icon: Crown,
    price: 'R$ 79',
    period: '/mês',
    credits: 'Pesquisas ilimitadas',
    features: [
      'Pesquisa textual',
      'Varredura social',
      'Score de risco',
      'Análise facial',
      'Histórico completo',
      'Exportar PDF',
      'Acesso via API',
      'Suporte prioritário',
      'Dashboard avançado',
    ],
    notIncluded: [],
  },
]

const creditPacks = [
  { amount: 10, price: 'R$ 15', perUnit: 'R$ 1,50/pesquisa' },
  { amount: 50, price: 'R$ 59', perUnit: 'R$ 1,18/pesquisa' },
  { amount: 100, price: 'R$ 99', perUnit: 'R$ 0,99/pesquisa' },
]

export default function PlansPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-10 max-w-6xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Planos e Preços</h1>
        <p className="text-gray-500 mt-1">
          Plano atual: <span className="text-gold font-medium capitalize">{user?.plan || 'Free'}</span>
          {' '}&middot;{' '}
          Créditos: <span className="text-gold font-mono">{user?.credits ?? 0}</span>
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6">
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
                  <Star className="h-3 w-3" /> Mais Popular
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
                  Plano Atual
                </Button>
              ) : (
                <Button
                  variant={plan.highlight ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => {
                    // TODO: integrate with payment API
                    alert(`Upgrade para ${plan.name} será implementado em breve.`)
                  }}
                >
                  {plan.key === 'free' ? 'Plano Atual' : `Assinar ${plan.name}`}
                </Button>
              )}
            </Card>
          )
        })}
      </div>

      {/* Credit Packs */}
      <div>
        <h2 className="font-display font-bold text-xl text-white mb-2">Pacotes de Créditos Avulsos</h2>
        <p className="text-sm text-gray-500 mb-6">Precisa de mais pesquisas sem trocar de plano? Compre créditos avulsos.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {creditPacks.map((pack) => (
            <Card key={pack.amount} className="text-center hover:border-gold/20 transition-colors">
              <p className="font-display font-bold text-3xl text-white">{pack.amount}</p>
              <p className="text-sm text-gray-500 mb-1">pesquisas</p>
              <p className="font-display font-bold text-xl text-gold mb-1">{pack.price}</p>
              <p className="text-xs text-gray-600 mb-4">{pack.perUnit}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => alert('Compra de créditos será implementada em breve.')}
              >
                Comprar
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

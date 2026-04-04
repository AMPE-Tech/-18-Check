import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  UserSearch,
  Camera,
  Globe,
  Zap,
  Lock,
  FileText,
  ArrowRight,
  Check,
  Star,
} from 'lucide-react'
import Button from '../components/ui/Button'

const features = [
  {
    icon: UserSearch,
    title: 'Verificação por Nome',
    desc: 'Consulta em bases públicas e registros para confirmar identidade e maioridade do indivíduo.',
  },
  {
    icon: Camera,
    title: 'Análise Facial',
    desc: 'Upload de foto para estimativa de idade e detecção de documentos adulterados via IA.',
  },
  {
    icon: Globe,
    title: 'Varredura Social',
    desc: 'Análise de perfis em redes sociais para cruzamento de dados e avaliação de risco.',
  },
  {
    icon: Zap,
    title: 'Score de Risco',
    desc: 'Classificação automatizada em 4 níveis: Sem Risco, Baixo, Moderado e Alto Risco.',
  },
  {
    icon: Lock,
    title: 'Dados Criptografados',
    desc: 'Todas as consultas são protegidas com criptografia AES-256. Seus dados nunca são compartilhados.',
  },
  {
    icon: FileText,
    title: 'Relatório PDF',
    desc: 'Exporte relatórios completos para auditoria interna ou compliance regulatório.',
  },
]

const plans = [
  {
    name: 'Free',
    price: 'R$ 0',
    period: 'para sempre',
    credits: '3 pesquisas totais',
    features: ['Pesquisa textual', 'Varredura social', 'Score de risco'],
    cta: 'Começar Grátis',
    highlight: false,
  },
  {
    name: 'Basic',
    price: 'R$ 29',
    period: '/mês',
    credits: '30 pesquisas/mês',
    features: [
      'Tudo do Free',
      'Análise facial',
      'Histórico completo',
      'Exportar PDF',
    ],
    cta: 'Assinar Basic',
    highlight: true,
  },
  {
    name: 'Pro',
    price: 'R$ 79',
    period: '/mês',
    credits: 'Pesquisas ilimitadas',
    features: [
      'Tudo do Basic',
      'Acesso via API',
      'Suporte prioritário',
      'Dashboard avançado',
    ],
    cta: 'Assinar Pro',
    highlight: false,
  },
]

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,95,0.08),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-8">
              <ShieldCheck className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium text-gold">Verificação de Identidade para Conteúdo Adulto</span>
            </div>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl text-white leading-tight mb-6">
              Proteja sua plataforma.{' '}
              <span className="text-gold">Verifique maioridade</span>{' '}
              com inteligência artificial.
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              O [18+]Check cruza dados textuais, perfis sociais e análise facial para gerar
              um score de risco confiável. Compliance automatizado para plataformas de conteúdo adulto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Criar Conta Grátis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Ver Planos
                </Button>
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-600">
              3 pesquisas gratuitas. Sem cartão de crédito.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: '99.2%', label: 'Precisão da IA' },
              { value: '<3s', label: 'Tempo de resposta' },
              { value: 'AES-256', label: 'Criptografia' },
              { value: '24/7', label: 'Disponibilidade' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display font-bold text-2xl text-gold">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              Verificação completa em uma pesquisa
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Combine múltiplas fontes de dados para uma análise de risco precisa e confiável.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-xl border border-surface-border bg-surface hover:border-gold/20 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <f.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-surface-border bg-surface/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              Como funciona
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Insira os dados', desc: 'Nome, telefone, rede social ou foto do indivíduo a ser verificado.' },
              { step: '02', title: 'IA processa', desc: 'Nosso motor de IA cruza bases de dados, analisa imagens e perfis em segundos.' },
              { step: '03', title: 'Receba o score', desc: 'Relatório completo com classificação de risco e dados encontrados.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full border-2 border-gold/30 text-gold font-display font-bold text-lg mb-4">
                  {s.step}
                </div>
                <h3 className="font-display font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              Planos e Preços
            </h2>
            <p className="text-gray-400">
              Comece grátis. Escale conforme sua necessidade.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-8 flex flex-col ${
                  plan.highlight
                    ? 'border-gold/40 bg-gold/5 relative'
                    : 'border-surface-border bg-surface'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3" /> Popular
                  </div>
                )}
                <h3 className="font-display font-bold text-xl text-white">{plan.name}</h3>
                <div className="mt-4 mb-2">
                  <span className="font-display font-extrabold text-4xl text-white">{plan.price}</span>
                  <span className="text-gray-500 text-sm ml-1">{plan.period}</span>
                </div>
                <p className="text-sm text-gold font-medium mb-6">{plan.credits}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="h-4 w-4 text-gold shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button
                    variant={plan.highlight ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-surface-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-4">
            Pronto para proteger sua plataforma?
          </h2>
          <p className="text-gray-400 mb-8">
            Crie sua conta agora e faça sua primeira verificação em menos de 1 minuto.
          </p>
          <Link to="/register">
            <Button size="lg">
              Começar Agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

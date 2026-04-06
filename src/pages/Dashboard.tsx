import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../lib/auth'
import api from '../lib/api'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { formatDate } from '../lib/utils'
import { Search, CreditCard, History, ArrowRight, AlertTriangle } from 'lucide-react'

interface SearchItem {
  id: string
  name?: string
  phone?: string
  social?: string
  riskLevel: string
  createdAt: string
  status: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [recent, setRecent] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/search/history?limit=5')
      .then(({ data: res }) => {
        const payload = res.data || res
        const items = Array.isArray(payload) ? payload : payload.items || payload.searches || []
        setRecent(items)
      })
      .catch(() => setRecent([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome */}
      <div>
        <h1 className="font-display font-bold text-2xl text-white">
          {t('dashboard.welcome', { name: user?.name?.split(' ')[0] })}
        </h1>
        <p className="text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-gold/10 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-gold" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('dashboard.credits')}</p>
            <p className="font-display font-bold text-2xl text-white">{user?.credits ?? 0}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-gold/10 flex items-center justify-center">
            <Search className="h-6 w-6 text-gold" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('dashboard.plan')}</p>
            <p className="font-display font-bold text-lg text-white capitalize">{user?.plan || t('dashboard.no_plan')}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-gold/10 flex items-center justify-center">
            <History className="h-6 w-6 text-gold" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('dashboard.recent_count')}</p>
            <p className="font-display font-bold text-2xl text-white">{recent.length}</p>
          </div>
        </Card>
      </div>

      {/* Low credits warning */}
      {(user?.credits ?? 0) <= 1 && (
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />
          <p className="text-sm text-yellow-300">
            {t('dashboard.low_credits')}{' '}
            <Link to="/app/plans" className="text-gold font-medium underline">
              {t('dashboard.upgrade')}
            </Link>
          </p>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/app/search">
          <Card className="hover:border-gold/30 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-white mb-1">{t('dashboard.new_search')}</h3>
                <p className="text-sm text-gray-500">{t('dashboard.new_search_desc')}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-gold transition-colors" />
            </div>
          </Card>
        </Link>
        <Link to="/app/history">
          <Card className="hover:border-gold/30 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-white mb-1">{t('dashboard.view_history')}</h3>
                <p className="text-sm text-gray-500">{t('dashboard.view_history_desc')}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-gold transition-colors" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent searches */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('dashboard.recent_searches')}</CardTitle>
            <Link to="/app/history">
              <Button variant="ghost" size="sm">{t('dashboard.view_all')}</Button>
            </Link>
          </div>
        </CardHeader>
        {loading ? (
          <div className="text-center py-8 text-gray-500">{t('dashboard.loading')}</div>
        ) : recent.length === 0 ? (
          <div className="text-center py-8">
            <Search className="h-10 w-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">{t('dashboard.no_searches')}</p>
            <Link to="/app/search">
              <Button variant="outline" size="sm" className="mt-4">
                {t('dashboard.first_search')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((s) => (
              <Link
                key={s.id}
                to={`/app/history/${s.id}`}
                className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {s.name || s.phone || s.social || t('dashboard.search_label')}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(s.createdAt)}</p>
                </div>
                <Badge level={s.riskLevel} />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

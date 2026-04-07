import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../lib/auth'
import api from '../lib/api'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { formatDate } from '../lib/utils'
import { Search, CreditCard, History, ArrowRight, AlertTriangle, Shield } from 'lucide-react'

interface SearchItem {
  id: string
  name?: string
  phone?: string
  social?: string
  riskLevel: string
  createdAt: string
  status: string
}

function SkeletonCard() {
  return (
    <Card className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-lg bg-surface-light animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 bg-surface-light rounded animate-pulse" />
        <div className="h-6 w-16 bg-surface-light rounded animate-pulse" />
      </div>
    </Card>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-3 px-3">
      <div className="space-y-2">
        <div className="h-4 w-32 bg-surface-light rounded animate-pulse" />
        <div className="h-3 w-20 bg-surface-light rounded animate-pulse" />
      </div>
      <div className="h-5 w-16 bg-surface-light rounded-full animate-pulse" />
    </div>
  )
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
      <div className="animate-fade-in">
        <h1 className="font-display font-bold text-2xl text-white">
          {t('dashboard.welcome', { name: user?.name?.split(' ')[0] })}
        </h1>
        <p className="text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card className="flex items-center gap-4 animate-fade-in-1 hover:border-gold/20 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('dashboard.credits')}</p>
                <p className="font-display font-bold text-2xl text-white">{user?.credits ?? 0}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 animate-fade-in-2 hover:border-gold/20 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('dashboard.plan')}</p>
                <p className="font-display font-bold text-lg text-white capitalize">{user?.plan || t('dashboard.no_plan')}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 animate-fade-in-3 hover:border-gold/20 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <History className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('dashboard.recent_count')}</p>
                <p className="font-display font-bold text-2xl text-white">{recent.length}</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Low credits warning */}
      {(user?.credits ?? 0) <= 1 && (
        <div className="flex items-center gap-3 bg-warning/10 border border-warning/30 rounded-xl px-4 py-3 animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <p className="text-sm text-warning">
            {t('dashboard.low_credits')}{' '}
            <Link to="/app/plans" className="text-gold font-semibold underline underline-offset-2">
              {t('dashboard.upgrade')}
            </Link>
          </p>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Link to="/app/search" className="animate-fade-in-3">
          <Card className="hover:border-gold/30 hover:bg-gold/[0.02] transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-white mb-1 group-hover:text-gold transition-colors">{t('dashboard.new_search')}</h3>
                <p className="text-sm text-gray-500">{t('dashboard.new_search_desc')}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </Card>
        </Link>
        <Link to="/app/history" className="animate-fade-in-4">
          <Card className="hover:border-gold/30 hover:bg-gold/[0.02] transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-white mb-1 group-hover:text-gold transition-colors">{t('dashboard.view_history')}</h3>
                <p className="text-sm text-gray-500">{t('dashboard.view_history_desc')}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent searches */}
      <Card className="animate-fade-in-5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('dashboard.recent_searches')}</CardTitle>
            <Link to="/app/history">
              <Button variant="ghost" size="sm">{t('dashboard.view_all')}</Button>
            </Link>
          </div>
        </CardHeader>
        {loading ? (
          <div className="space-y-1">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-10">
            <div className="h-14 w-14 rounded-2xl bg-surface-light flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-gray-500 mb-1">{t('dashboard.no_searches')}</p>
            <Link to="/app/search">
              <Button variant="outline" size="sm" className="mt-4">
                {t('dashboard.first_search')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {recent.map((s) => (
              <Link
                key={s.id}
                to={`/app/history/${s.id}`}
                className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gold/[0.03] transition-all duration-200 group"
              >
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-gold transition-colors">
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

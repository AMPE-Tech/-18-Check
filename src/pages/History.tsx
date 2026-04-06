import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../lib/api'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { formatDate } from '../lib/utils'
import { History as HistoryIcon, Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

interface SearchItem {
  id: string
  name?: string
  phone?: string
  social?: string
  riskLevel: string
  riskScore?: number
  createdAt: string
  status: string
}

export default function HistoryPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/search/history?page=${page}&limit=10`)
      .then(({ data }) => {
        const list = data.items || data || []
        setItems(list)
        setHasMore(data.hasMore ?? list.length === 10)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">{t('history.title')}</h1>
          <p className="text-gray-500 mt-1">{t('history.title')}</p>
        </div>
        <Link to="/app/search">
          <Button size="sm">
            <Search className="h-4 w-4" />
            {t('search.new_search')}
          </Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        <CardHeader className="p-6 pb-0">
          <CardTitle>Resultados</CardTitle>
        </CardHeader>

        {loading ? (
          <div className="text-center py-12 text-gray-500">{t('dashboard.loading')}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <HistoryIcon className="h-10 w-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">{t('history.no_results')}</p>
            <Link to="/app/search">
              <Button variant="outline" size="sm" className="mt-4">
                {t('dashboard.first_search')}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-surface-border">
              <div className="col-span-4">{t('history.query')}</div>
              <div className="col-span-2">{t('history.type')}</div>
              <div className="col-span-2">{t('history.score')}</div>
              <div className="col-span-2">{t('history.risk')}</div>
              <div className="col-span-2">{t('history.date')}</div>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-surface-border">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={`/app/history/${item.id}`}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="col-span-4 flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">
                      {item.name || item.phone || item.social || 'Pesquisa'}
                    </p>
                    <ExternalLink className="h-3.5 w-3.5 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-xs text-gray-500">
                      {item.name ? 'Nome' : item.phone ? 'Telefone' : item.social ? 'Social' : 'Multi'}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm font-mono text-gray-400">
                      {item.riskScore !== undefined ? `${item.riskScore}/100` : '---'}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <Badge level={item.riskLevel} />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {items.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border">
            <p className="text-sm text-gray-500">{t('history.page', { current: page, total: '...' })}</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                {t('history.previous')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasMore}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('history.next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

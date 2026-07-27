import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import api from '../lib/api'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { AlertTriangle, Check, ScanFace, ShieldCheck, Trash2 } from 'lucide-react'

/* O backend responde { success, data }. */
function unwrap<T>(body: unknown): T {
  const envelope = body as { data?: T }
  return (envelope?.data ?? body) as T
}

interface RetentionStatus {
  stored: number
  active: boolean
}

export default function Account() {
  const { user } = useAuth()
  const { t } = useTranslation()

  const [retention, setRetention] = useState<RetentionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/identity/retention')
      setRetention(unwrap<RetentionStatus>(data))
    } catch {
      setError('Não foi possível consultar o status da sua referência facial.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function revoke() {
    setRevoking(true)
    setError('')
    try {
      const { data } = await api.delete('/identity/retention')
      const result = unwrap<{ deleted: number }>(data)
      setDone(
        result.deleted > 0
          ? `Referência facial apagada. ${result.deleted} registro${result.deleted > 1 ? 's' : ''} removido${result.deleted > 1 ? 's' : ''}.`
          : 'Nada havia guardado.'
      )
      setConfirming(false)
      await load()
    } catch {
      setError('Não foi possível apagar agora. Tente novamente em instantes.')
    } finally {
      setRevoking(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">{t('account.title')}</h1>
        <p className="text-gray-500 mt-1 text-sm">{t('account.subtitle')}</p>
      </div>

      {/* --- Dados da conta --- */}
      <Card>
        <CardHeader>
          <CardTitle>{t('account.data_title')}</CardTitle>
        </CardHeader>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">{t('auth.name')}</dt>
            <dd className="text-gray-200">{user?.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">{t('auth.email')}</dt>
            <dd className="text-gray-200">{user?.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">{t('dashboard.plan')}</dt>
            <dd className="text-gray-200 capitalize">{user?.plan || t('dashboard.no_plan')}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">{t('dashboard.credits')}</dt>
            <dd className="text-gray-200">{user?.credits ?? 0}</dd>
          </div>
        </dl>
      </Card>

      {/* --- Referência facial ---
          A política de privacidade promete revogação a qualquer momento.
          É esta tela que cumpre a promessa. */}
      <Card>
        <CardHeader>
          <CardTitle>{t('account.biometric_title')}</CardTitle>
        </CardHeader>

        {loading ? (
          <div className="h-16 rounded-lg bg-surface-light animate-pulse" />
        ) : retention?.active ? (
          <>
            <div className="flex items-start gap-4 p-5 rounded-lg bg-gold/5 border border-gold/20 mb-5">
              <ScanFace className="h-6 w-6 text-gold shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">
                  {t('account.biometric_stored')}
                </p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {t('account.biometric_stored_desc')}
                </p>
              </div>
            </div>

            {confirming ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-5">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {t('account.biometric_confirm')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="danger" onClick={revoke} loading={revoking}>
                    <Trash2 className="h-4 w-4" />
                    {t('account.biometric_confirm_button')}
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirming(false)} disabled={revoking}>
                    {t('search.cancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="danger" onClick={() => setConfirming(true)}>
                <Trash2 className="h-4 w-4" />
                {t('account.biometric_revoke')}
              </Button>
            )}
          </>
        ) : (
          <div className="flex items-start gap-4 p-5 rounded-lg bg-surface border border-surface-border">
            <ShieldCheck className="h-6 w-6 text-gray-500 shrink-0" />
            <div>
              <p className="text-sm text-gray-300 font-medium">
                {t('account.biometric_none')}
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {t('account.biometric_none_desc')}
              </p>
            </div>
          </div>
        )}

        {done && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/25 px-4 py-3 text-sm text-green-400">
            <Check className="h-4 w-4 shrink-0" />
            {done}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
      </Card>

      <p className="text-xs text-gray-600">
        {t('account.privacy_note')}{' '}
        <Link to="/privacidade" className="text-gold hover:underline">
          {t('footer.privacy')}
        </Link>
      </p>
    </div>
  )
}

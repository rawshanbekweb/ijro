import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'
import { useDelegation } from '../../delegation/hooks/queries/useDelegation'
import { useAuthStore } from '../../../store/auth.store'
import Skeleton from '../components/Skeleton'

export default function DelegationSummaryCard() {
  const { t } = useTranslation()
  const userId = useAuthStore((state) => state.user?.id)
  const { data: delegation, isLoading, isError } = useDelegation(userId)

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck size={22} className="text-purple" />
        <h2 className="text-base font-semibold text-ink">
          {t('nazorat.delegationSummary.title')}
        </h2>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      )}

      {!isLoading && (isError || !delegation) && (
        <p className="py-2 text-base text-muted">{t('nazorat.delegationSummary.empty')}</p>
      )}

      {!isLoading && delegation && (
        <dl className="space-y-2.5 text-base">
          <div className="flex items-center justify-between">
            <dt className="text-muted">{t('nazorat.delegationSummary.sohalar')}</dt>
            <dd className="font-semibold text-ink">
              {t('nazorat.delegationSummary.sohaCount', {
                count: delegation.ruxsatEtilganSohalar.length,
              })}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted">{t('nazorat.delegationSummary.maxMuhimlik')}</dt>
            <dd className="font-semibold text-ink">
              {t(`delegation.form.muhimlik.${delegation.maksimalMuhimlik}`)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted">{t('nazorat.delegationSummary.maxMuddat')}</dt>
            <dd className="font-semibold text-ink">
              {t('nazorat.delegationSummary.maxMuddatValue', {
                count: delegation.maksimalMuddatKun,
              })}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted">{t('nazorat.delegationSummary.obyektRuxsat')}</dt>
            <dd className="font-semibold text-ink">
              {delegation.obyektTopshiriqRuxsat
                ? t('nazorat.delegationSummary.obyektRuxsatBor')
                : t('nazorat.delegationSummary.obyektRuxsatYoq')}
            </dd>
          </div>
        </dl>
      )}
    </div>
  )
}

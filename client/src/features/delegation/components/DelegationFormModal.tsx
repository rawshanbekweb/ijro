import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import Modal from '../../dashboard/components/Modal'
import { useSohalar } from '../../sohalar/hooks/queries/useSohalar'
import { useDelegation } from '../hooks/queries/useDelegation'
import { useCreateDelegation } from '../hooks/useCreateDelegation'
import { useAuthStore } from '../../../store/auth.store'
import { getApiErrorMessage } from '../../sohalar/apiError'
import type { User } from '../../sohalar/types'
import type { DelegationMuhimlik } from '../types'

interface DelegationFormModalProps {
  nazoratUser: User
  onClose: () => void
}

const MUHIMLIK_OPTIONS: DelegationMuhimlik[] = ['ODDIY', 'MUHIM']

export default function DelegationFormModal({ nazoratUser, onClose }: DelegationFormModalProps) {
  const { t } = useTranslation()
  const beruvchiId = useAuthStore((state) => state.user?.id)
  const { data: sohalar, isLoading: sohalarLoading } = useSohalar()
  const { data: existingDelegation } = useDelegation(nazoratUser.id)
  const createDelegation = useCreateDelegation()

  const [search, setSearch] = useState('')
  const [selectedSohaIds, setSelectedSohaIds] = useState<string[]>(
    existingDelegation?.ruxsatEtilganSohalar ?? [],
  )
  const [muhimlik, setMuhimlik] = useState<DelegationMuhimlik>(
    existingDelegation?.maksimalMuhimlik ?? 'ODDIY',
  )
  const [muddatKun, setMuddatKun] = useState<number>(existingDelegation?.maksimalMuddatKun ?? 7)
  const [obyektRuxsat, setObyektRuxsat] = useState<boolean>(
    existingDelegation?.obyektTopshiriqRuxsat ?? false,
  )
  const [touched, setTouched] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const filteredSohalar = useMemo(() => {
    const list = sohalar ?? []
    const query = search.trim().toLowerCase()
    if (!query) {
      return list
    }
    return list.filter(
      (soha) => soha.nomi.toLowerCase().includes(query) || soha.kodi.toLowerCase().includes(query),
    )
  }, [sohalar, search])

  const toggleSoha = (sohaId: string) => {
    setSelectedSohaIds((prev) =>
      prev.includes(sohaId) ? prev.filter((id) => id !== sohaId) : [...prev, sohaId],
    )
  }

  const hasSohaError = touched && selectedSohaIds.length === 0

  const handleSubmit = () => {
    setTouched(true)
    setFormError(null)

    if (selectedSohaIds.length === 0 || !beruvchiId || muddatKun < 1) {
      return
    }

    createDelegation.mutate(
      {
        nazoratId: nazoratUser.id,
        beruvchiId,
        ruxsatEtilganSohalar: selectedSohaIds,
        maksimalMuhimlik: muhimlik,
        maksimalMuddatKun: muddatKun,
        obyektTopshiriqRuxsat: obyektRuxsat,
      },
      {
        onSuccess: onClose,
        onError: (error) => {
          setFormError(getApiErrorMessage(error, t('delegation.form.error')))
        },
      },
    )
  }

  return (
    <Modal
      title={`${t('delegation.form.titleCreate')} — ${nazoratUser.ismFamiliya}`}
      onClose={onClose}
    >
      <div className="space-y-4">
        {formError && (
          <div className="rounded-lg bg-red/10 px-3 py-2.5 text-sm text-red">{formError}</div>
        )}

        <div>
          <span className="mb-1.5 block text-base font-medium text-ink">
            {t('delegation.form.sohalarLabel')}
          </span>

          <div className="relative mb-2">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('delegation.form.sohaSearchPlaceholder')}
              className="w-full rounded-lg border border-muted/30 py-2.5 pl-10 pr-3 text-base text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            />
          </div>

          <div className="max-h-56 overflow-y-auto rounded-lg border border-muted/20 p-2">
            {sohalarLoading && <p className="p-2 text-sm text-muted">{t('common.loading')}</p>}

            {!sohalarLoading &&
              filteredSohalar.map((soha) => (
                <label
                  key={soha.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-base text-ink hover:bg-ink/5"
                >
                  <input
                    type="checkbox"
                    checked={selectedSohaIds.includes(soha.id)}
                    onChange={() => toggleSoha(soha.id)}
                    className="h-5 w-5 rounded border-muted/40 text-blue focus:ring-blue"
                  />
                  {soha.nomi}
                  <span className="text-sm text-muted">{soha.kodi}</span>
                </label>
              ))}
          </div>
          {hasSohaError && (
            <p className="mt-1 text-sm text-red">{t('delegation.form.sohalarRequired')}</p>
          )}
        </div>

        <div>
          <span className="mb-1.5 block text-base font-medium text-ink">
            {t('delegation.form.muhimlikLabel')}
          </span>
          <div className="flex gap-2">
            {MUHIMLIK_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMuhimlik(option)}
                className={
                  muhimlik === option
                    ? 'flex-1 rounded-lg bg-blue px-4 py-2.5 text-base font-semibold text-white'
                    : 'flex-1 rounded-lg border border-muted/30 px-4 py-2.5 text-base font-medium text-muted hover:bg-ink/5'
                }
              >
                {t(`delegation.form.muhimlik.${option}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="muddatKun" className="mb-1.5 block text-base font-medium text-ink">
            {t('delegation.form.muddatLabel')}
          </label>
          <input
            id="muddatKun"
            type="number"
            min={1}
            value={muddatKun}
            onChange={(e) => setMuddatKun(Number(e.target.value))}
            className="w-full rounded-lg border border-muted/30 px-3 py-2.5 text-base text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-base text-ink">
          <input
            type="checkbox"
            checked={obyektRuxsat}
            onChange={(e) => setObyektRuxsat(e.target.checked)}
            className="h-5 w-5 rounded border-muted/40 text-blue focus:ring-blue"
          />
          {t('delegation.form.obyektRuxsatLabel')}
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-5 py-2.5 text-base font-medium text-muted hover:bg-ink/5"
          >
            {t('delegation.form.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createDelegation.isPending}
            className="rounded-lg bg-blue px-5 py-2.5 text-base font-semibold text-white hover:bg-blue-deep disabled:cursor-not-allowed disabled:opacity-70"
          >
            {createDelegation.isPending ? t('delegation.form.saving') : t('delegation.form.save')}
          </button>
        </div>
      </div>
    </Modal>
  )
}

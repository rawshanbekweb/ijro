import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShieldPlus } from 'lucide-react'
import { useUsers } from '../../sohalar/hooks/queries/useUsers'
import { useDelegation } from '../hooks/queries/useDelegation'
import Skeleton from '../../dashboard/components/Skeleton'
import DelegationFormModal from '../components/DelegationFormModal'
import type { User } from '../../sohalar/types'

interface DelegationRowProps {
  user: User
  onEdit: (user: User) => void
}

function DelegationRow({ user, onEdit }: DelegationRowProps) {
  const { t } = useTranslation()
  const { data: delegation, isLoading } = useDelegation(user.id)

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <div className="truncate text-base font-medium text-ink">{user.ismFamiliya}</div>
        <div className="mt-0.5 truncate text-sm text-muted">{user.lavozim ?? '—'}</div>

        {isLoading && <Skeleton className="mt-2 h-4 w-48" />}

        {!isLoading && !delegation && (
          <p className="mt-1 text-sm text-muted">{t('delegation.page.noDelegation')}</p>
        )}

        {!isLoading && delegation && (
          <p className="mt-1 text-sm text-ink/70">
            {t('delegation.page.sohaCount', { count: delegation.ruxsatEtilganSohalar.length })}
            {' · '}
            {t('delegation.page.maxMuhimlik')}:{' '}
            {t(`delegation.form.muhimlik.${delegation.maksimalMuhimlik}`)}
            {' · '}
            {t('delegation.page.maxMuddat', { count: delegation.maksimalMuddatKun })}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onEdit(user)}
        className="shrink-0 rounded-lg border border-blue px-4 py-2 text-sm font-semibold text-blue hover:bg-blue/5"
      >
        {t('delegation.page.edit')}
      </button>
    </li>
  )
}

export default function DelegationPage() {
  const { t } = useTranslation()
  const { data: users, isLoading, isError } = useUsers({ rol: 'NAZORAT' })
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const nazoratUsers = users ?? []

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold text-ink">
          <ShieldPlus size={24} className="text-purple" />
          {t('delegation.page.title')}
        </h1>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {!isLoading && isError && (
          <p className="py-4 text-center text-base text-red">{t('delegation.page.loadError')}</p>
        )}

        {!isLoading && !isError && nazoratUsers.length === 0 && (
          <p className="py-4 text-center text-base text-muted">{t('delegation.page.empty')}</p>
        )}

        {!isLoading && !isError && nazoratUsers.length > 0 && (
          <ul className="divide-y divide-ink/10">
            {nazoratUsers.map((user) => (
              <DelegationRow key={user.id} user={user} onEdit={setEditingUser} />
            ))}
          </ul>
        )}
      </div>

      {editingUser && (
        <DelegationFormModal nazoratUser={editingUser} onClose={() => setEditingUser(null)} />
      )}
    </div>
  )
}

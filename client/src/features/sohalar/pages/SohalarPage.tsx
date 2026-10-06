import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SohaGrid from '../components/SohaGrid'
import SohaDetailPanel from '../components/SohaDetailPanel'
import SohaFormModal from '../components/SohaFormModal'
import UserFormModal from '../components/UserFormModal'
import { useSohalar } from '../hooks/queries/useSohalar'
import { useUsers } from '../hooks/queries/useUsers'
import type { Soha, User } from '../types'

type SohaModalState = { open: false } | { open: true; soha?: Soha }
type UserModalState = { open: false } | { open: true; user?: User }

export default function SohalarPage() {
  const { t } = useTranslation()
  const {
    data: sohalar,
    isLoading: sohalarLoading,
    isError: sohalarError,
  } = useSohalar()

  // One unfiltered `GET /users` call powers both the per-card employee counts
  // and the detail table: `GET /sohalar` does not embed `xodimlar`, and firing
  // a query per card would be far more expensive.
  const { data: users, isLoading: usersLoading, isError: usersError } = useUsers()

  const [selectedSohaId, setSelectedSohaId] = useState<string | null>(null)
  const [sohaModal, setSohaModal] = useState<SohaModalState>({ open: false })
  const [userModal, setUserModal] = useState<UserModalState>({ open: false })

  const sohaList = useMemo(() => sohalar ?? [], [sohalar])
  const userList = useMemo(() => users ?? [], [users])

  const xodimSoniBySohaId = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const user of userList) {
      if (user.sohaId) {
        counts[user.sohaId] = (counts[user.sohaId] ?? 0) + 1
      }
    }
    return counts
  }, [userList])

  const selectedSoha = sohaList.find((soha) => soha.id === selectedSohaId) ?? null

  const selectedSohaXodimlari = useMemo(
    () => (selectedSohaId ? userList.filter((user) => user.sohaId === selectedSohaId) : []),
    [userList, selectedSohaId],
  )

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink">{t('sohalar.page.title')}</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSohaModal({ open: true })}
            className="flex items-center gap-1.5 rounded-lg border border-blue px-4 py-2 text-sm font-semibold text-blue hover:bg-blue/5"
          >
            <Plus size={16} />
            {t('sohalar.page.newSoha')}
          </button>
          <button
            type="button"
            onClick={() => setUserModal({ open: true })}
            className="flex items-center gap-1.5 rounded-lg bg-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-deep"
          >
            <Plus size={16} />
            {t('sohalar.page.newXodim')}
          </button>
        </div>
      </div>

      {(sohalarError || usersError) && (
        <div className="mb-6 rounded-lg bg-red/10 px-4 py-3 text-sm text-red">
          {t('common.loadError')}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SohaGrid
            sohalar={sohaList}
            xodimSoniBySohaId={xodimSoniBySohaId}
            selectedSohaId={selectedSohaId}
            onSelect={setSelectedSohaId}
            isLoading={sohalarLoading || usersLoading}
          />
        </div>
        <div className="lg:col-span-1">
          <SohaDetailPanel
            soha={selectedSoha}
            xodimlar={selectedSohaXodimlari}
            isLoading={usersLoading}
            onEditSoha={(soha) => setSohaModal({ open: true, soha })}
            onEditUser={(user) => setUserModal({ open: true, user })}
            onSohaDeleted={() => setSelectedSohaId(null)}
          />
        </div>
      </div>

      {sohaModal.open && (
        <SohaFormModal soha={sohaModal.soha} onClose={() => setSohaModal({ open: false })} />
      )}

      {userModal.open && (
        <UserFormModal
          user={userModal.user}
          defaultSohaId={userModal.user ? null : selectedSohaId}
          onClose={() => setUserModal({ open: false })}
        />
      )}
    </div>
  )
}

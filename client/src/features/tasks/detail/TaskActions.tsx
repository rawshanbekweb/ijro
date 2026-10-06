import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import RejectTaskModal from '../../dashboard/components/RejectTaskModal'
import { useApproveTask } from '../../dashboard/hooks/useApproveTask'
import { useAuthStore } from '../../../store/auth.store'
import { useMarkDone } from '../hooks/useMarkDone'
import ExtendDeadlineModal from './ExtendDeadlineModal'
import EskalatsiyaModal from './EskalatsiyaModal'
import { TERMINAL_STATUSES } from '../../dashboard/stats'
import type { Task } from '../types'

interface TaskActionsProps {
  task: Task
}

export default function TaskActions({ task }: TaskActionsProps) {
  const { t } = useTranslation()
  const currentUser = useAuthStore((state) => state.user)
  const markDone = useMarkDone(task.id)
  const approveTask = useApproveTask()
  const [showReject, setShowReject] = useState(false)
  const [showExtend, setShowExtend] = useState(false)
  const [showEskalatsiya, setShowEskalatsiya] = useState(false)

  const isBajaruvchi = currentUser?.rol === 'BAJARUVCHI'
  const isSuperadmin = currentUser?.rol === 'SUPERADMIN'
  const isNazorat = currentUser?.rol === 'NAZORAT'
  const isOwnTask = currentUser != null && task.yaratuvchiId === currentUser.id
  const canMarkDone = isBajaruvchi && task.status === 'JARAYONDA'
  // NAZORAT reviews tasks they created themself the same way SUPERADMIN does,
  // and can escalate any still-active task in their scope to the superadmin.
  const canReview = (isSuperadmin || (isNazorat && isOwnTask)) && task.status === 'TASDIQ_KUTILMOQDA'
  const canEscalate = isNazorat && !TERMINAL_STATUSES.has(task.status)

  const hasActions = isBajaruvchi || canReview || canEscalate

  if (!hasActions) {
    return null
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 text-sm font-semibold text-ink">{t('tasks.actions.title')}</h2>

      <div className="flex flex-col gap-2">
        {canMarkDone && (
          <button
            type="button"
            onClick={() => markDone.mutate()}
            disabled={markDone.isPending}
            className="w-full rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {markDone.isPending ? t('common.sending') : t('tasks.actions.markDone')}
          </button>
        )}

        {isBajaruvchi && (
          <button
            type="button"
            onClick={() => setShowExtend(true)}
            className="w-full rounded-lg border border-blue px-4 py-2 text-sm font-semibold text-blue hover:bg-blue/10"
          >
            {t('tasks.actions.extend')}
          </button>
        )}

        {canReview && (
          <>
            <button
              type="button"
              onClick={() => approveTask.mutate(task.id)}
              disabled={approveTask.isPending}
              className="w-full rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {approveTask.isPending ? t('common.sending') : t('tasks.actions.approve')}
            </button>
            <button
              type="button"
              onClick={() => setShowReject(true)}
              className="w-full rounded-lg border border-red px-4 py-2 text-sm font-semibold text-red hover:bg-red/10"
            >
              {t('tasks.actions.reject')}
            </button>
          </>
        )}

        {canEscalate && (
          <button
            type="button"
            onClick={() => setShowEskalatsiya(true)}
            className="w-full rounded-lg bg-purple px-4 py-2 text-sm font-semibold text-white hover:bg-purple/90"
          >
            {t('nazorat.taskActions.escalate')}
          </button>
        )}
      </div>

      {markDone.isError && (
        <p className="mt-2 text-xs text-red">{t('common.actionError')}</p>
      )}
      {approveTask.isError && (
        <p className="mt-2 text-xs text-red">{t('common.actionError')}</p>
      )}

      {showReject && <RejectTaskModal taskId={task.id} onClose={() => setShowReject(false)} />}
      {showExtend && <ExtendDeadlineModal onClose={() => setShowExtend(false)} />}
      {showEskalatsiya && (
        <EskalatsiyaModal taskId={task.id} onClose={() => setShowEskalatsiya(false)} />
      )}
    </div>
  )
}

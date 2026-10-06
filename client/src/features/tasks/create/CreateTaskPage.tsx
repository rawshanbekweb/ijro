import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import CreateTaskForm from './CreateTaskForm'

export default function CreateTaskPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-ink/5"
        >
          <ArrowLeft size={18} />
          {t('common.back')}
        </button>
        <h1 className="text-xl font-semibold text-ink">{t('layout.nav.newTask')}</h1>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <CreateTaskForm />
      </div>
    </div>
  )
}

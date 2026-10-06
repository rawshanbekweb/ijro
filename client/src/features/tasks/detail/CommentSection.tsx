import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Skeleton from '../../dashboard/components/Skeleton'
import { useTaskComments } from '../hooks/queries/useTaskComments'
import { useAddComment } from '../hooks/useAddComment'
import { formatDateTime, getInitials, getUserDisplayName } from '../format'

const commentSchema = z.object({
  matn: z.string().trim().min(1, 'tasks.comments.required'),
})

type CommentFormValues = z.infer<typeof commentSchema>

interface CommentSectionProps {
  taskId: string
}

export default function CommentSection({ taskId }: CommentSectionProps) {
  const { t } = useTranslation()
  const { data: comments, isLoading, isError } = useTaskComments(taskId)
  const addComment = useAddComment(taskId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { matn: '' },
  })

  const onSubmit = (values: CommentFormValues) => {
    addComment.mutate(values.matn.trim(), {
      onSuccess: () => reset({ matn: '' }),
    })
  }

  const list = comments ?? []

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-sm font-semibold text-ink">{t('tasks.comments.title')}</h2>

      {isLoading && (
        <div className="mt-4 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {isError && <p className="mt-4 text-sm text-red">{t('tasks.comments.loadError')}</p>}

      {!isLoading && !isError && list.length === 0 && (
        <p className="py-4 text-center text-sm text-muted">{t('tasks.comments.empty')}</p>
      )}

      {!isLoading && !isError && list.length > 0 && (
        <ul className="mt-4 space-y-4">
          {list.map((comment) => {
            const name = getUserDisplayName(comment.user, comment.userId)

            return (
              <li key={comment.id} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue/10 text-xs font-semibold text-blue">
                  {getInitials(name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="truncate text-sm font-medium text-ink">{name}</span>
                    <span className="text-xs text-muted">
                      {formatDateTime(comment.createdAt) ?? ''}
                    </span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-line text-sm text-ink/80">{comment.matn}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate className="mt-5">
        <label htmlFor="matn" className="mb-1.5 block text-sm font-medium text-ink">
          {t('tasks.comments.label')}
        </label>
        <textarea
          id="matn"
          rows={3}
          placeholder={t('tasks.comments.placeholder')}
          className="w-full rounded-lg border border-muted/30 px-3 py-2.5 text-sm text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          {...register('matn')}
        />
        {errors.matn && <p className="mt-1 text-xs text-red">{t(errors.matn.message ?? '')}</p>}
        {addComment.isError && (
          <p className="mt-1 text-xs text-red">{t('tasks.comments.sendError')}</p>
        )}

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={addComment.isPending}
            className="rounded-lg bg-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-deep disabled:cursor-not-allowed disabled:opacity-70"
          >
            {addComment.isPending ? t('common.sending') : t('common.send')}
          </button>
        </div>
      </form>
    </div>
  )
}

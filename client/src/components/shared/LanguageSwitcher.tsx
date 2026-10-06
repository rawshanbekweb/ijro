import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LOCALE_LABELS, type Locale } from '../../i18n'
import { useLocaleStore } from '../../store/locale.store'

const locales = Object.keys(LOCALE_LABELS) as Locale[]

export default function LanguageSwitcher() {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)

  return (
    <div className="relative flex items-center gap-2">
      <Languages size={20} className="hidden shrink-0 text-muted sm:block" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={t('layout.languageSwitcher')}
        className="max-w-36 rounded-lg border border-muted/30 bg-transparent px-2 py-2.5 sm:max-w-none sm:px-3 text-sm font-medium text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
      >
        {locales.map((value) => (
          <option key={value} value={value}>
            {LOCALE_LABELS[value]}
          </option>
        ))}
      </select>
    </div>
  )
}

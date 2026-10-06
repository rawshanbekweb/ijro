import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import qqLatn from './locales/qq-latn.json'
import qqCyrl from './locales/qq-cyrl.json'
import uzCyrl from './locales/uz-cyrl.json'

export type Locale = 'uz-cyrl' | 'qq-latn' | 'qq-cyrl'

export const defaultLocale: Locale = 'uz-cyrl'

export const LOCALE_LABELS: Record<Locale, string> = {
  'uz-cyrl': 'Ўзбекча',
  'qq-latn': 'Qaraqalpaqsha',
  'qq-cyrl': 'Қарақалпақша',
}

void i18next.use(initReactI18next).init({
  resources: {
    'qq-latn': { translation: qqLatn },
    'qq-cyrl': { translation: qqCyrl },
    'uz-cyrl': { translation: uzCyrl },
  },
  lng: defaultLocale,
  fallbackLng: defaultLocale,
  lowerCaseLng: true,
  interpolation: {
    escapeValue: false,
  },
})

export default i18next

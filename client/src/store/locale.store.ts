import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n, { defaultLocale, type Locale } from '../i18n'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      setLocale: (locale) => {
        void i18n.changeLanguage(locale)
        set({ locale })
      },
    }),
    {
      name: 'locale-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          void i18n.changeLanguage(state.locale)
        }
      },
    },
  ),
)

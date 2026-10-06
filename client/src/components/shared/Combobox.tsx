import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

export interface ComboboxOption {
  value: string
  label: string
  /** Extra text rendered to the right of the label inside the dropdown. */
  hint?: ReactNode
  /** Additional text taken into account when filtering (e.g. a soha code). */
  keywords?: string
}

interface ComboboxProps {
  id: string
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  emptyText?: string
  hasError?: boolean
}

/**
 * Minimal searchable select: a text input that filters an absolutely
 * positioned dropdown list client-side. Built by hand on purpose — the project
 * has no combobox library (and no `cmdk`), so this stays dependency-free.
 */
export default function Combobox({
  id,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  isLoading = false,
  emptyText,
  hasError = false,
}: ComboboxProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) {
      return
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return options
    }
    return options.filter((option) =>
      `${option.label} ${option.keywords ?? ''}`.toLowerCase().includes(needle),
    )
  }, [options, query])

  const select = (option: ComboboxOption) => {
    onChange(option.value)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={open ? query : (selected?.label ?? '')}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false)
            setQuery('')
          }
          if (e.key === 'Enter' && open) {
            e.preventDefault()
            if (filtered.length > 0) {
              select(filtered[0])
            }
          }
        }}
        className={`w-full rounded-lg border px-3 py-2.5 pr-9 text-sm text-ink outline-none focus:ring-2 focus:ring-blue/20 disabled:cursor-not-allowed disabled:bg-ink/5 ${
          hasError ? 'border-red' : 'border-muted/30 focus:border-blue'
        }`}
      />
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      />

      {open && !disabled && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-muted/30 bg-white py-1 shadow-lg"
        >
          {isLoading && <li className="px-3 py-2 text-sm text-muted">{t('common.loading')}</li>}

          {!isLoading && filtered.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted">{emptyText ?? t('common.noResults')}</li>
          )}

          {!isLoading &&
            filtered.map((option) => (
              <li key={option.value} role="option" aria-selected={option.value === value}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => select(option)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-blue/5 ${
                    option.value === value ? 'bg-blue/10 font-medium text-blue' : 'text-ink'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {option.hint}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}

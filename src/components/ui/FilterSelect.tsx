'use client'

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'

export const FilterSelect = <T extends string | number>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Все',
  disabled = false,
}: {
  label: string
  value: T | 'all'
  options: Array<{ value: T | 'all'; label: string }>
  onChange: (value: T | 'all') => void
  placeholder?: string
  disabled?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLabel = options.find((opt) => opt.value === value)?.label || placeholder

  return (
    <div ref={menuRef} className={clsx('relative', disabled && 'opacity-50 pointer-events-none')}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-xl border border-border/60 bg-secondary/70 px-4 py-3 text-left transition-colors duration-200 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-widest text-foreground/50">{label}</p>
            <p className="font-semibold text-foreground truncate">{currentLabel}</p>
          </div>
          <ChevronDown
            className={clsx(
              'h-4 w-4 text-primary transition-transform duration-200 flex-shrink-0',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      <div
        className={clsx(
          'absolute right-0 mt-2 w-full rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/20 transition-all duration-200 origin-top z-40 max-h-64 overflow-hidden',
          isOpen ? 'visible scale-100 opacity-100' : 'pointer-events-none invisible scale-95 opacity-0'
        )}
      >
        <ul className="py-2 overflow-y-auto overflow-x-hidden max-h-64">
          {options.map((option) => (
            <li key={String(option.value)}>
              <button
                type="button"
                className={clsx(
                  'w-full px-4 py-3 text-sm text-left transition-all duration-200 hover:translate-x-1 hover:bg-primary/10',
                  value === option.value ? 'bg-primary/15 text-primary font-semibold' : 'text-foreground/80'
                )}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

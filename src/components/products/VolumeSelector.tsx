'use client'

import { clsx } from 'clsx'
import { formatPrice, formatVolume, formatWeight } from '@/lib/api'
import type { VolumeOption, WeightOption } from '@/types/api'

interface VolumeSelectorProps {
    options: VolumeOption[]
    selectedId?: number
    onSelect: (option: VolumeOption) => void
    className?: string
}

interface WeightSelectorProps {
    options: WeightOption[]
    selectedId?: number
    onSelect: (option: WeightOption) => void
    className?: string
}

export function VolumeSelector({
    options,
    selectedId,
    onSelect,
    className,
}: VolumeSelectorProps) {
    if (!options || options.length === 0) return null

    // Sort by volume ascending
    const sortedOptions = [...options].sort((a, b) => a.volume_ml - b.volume_ml)
    const selected = selectedId
        ? options.find((o) => o.id === selectedId)
        : options.find((o) => o.is_default) || sortedOptions[0]

    return (
        <div className={clsx('space-y-3', className)}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground/70">Выберите объем:</span>
                {selected && (
                    <span className="text-sm font-bold text-primary">
                        {formatPrice(selected.final_price)}
                    </span>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {sortedOptions.map((option) => {
                    const isSelected = selected?.id === option.id
                    const isAvailable = option.in_stock && option.stock_quantity > 0

                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => onSelect(option)}
                            disabled={!isAvailable}
                            className={clsx(
                                'relative min-w-[70px] px-4 py-2.5 rounded-xl border-2 transition-all duration-200',
                                'text-sm font-semibold',
                                isSelected
                                    ? 'border-primary bg-primary/10 text-primary shadow-md'
                                    : isAvailable
                                        ? 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5'
                                        : 'border-border/50 bg-muted text-muted-foreground cursor-not-allowed opacity-50',
                            )}
                        >
                            <span className="block">{formatVolume(option.volume_ml)}</span>
                            {option.is_on_sale && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export function WeightSelector({
    options,
    selectedId,
    onSelect,
    className,
}: WeightSelectorProps) {
    if (!options || options.length === 0) return null

    // Sort by weight ascending
    const sortedOptions = [...options].sort((a, b) => a.weight_gr - b.weight_gr)
    const selected = selectedId
        ? options.find((o) => o.id === selectedId)
        : options.find((o) => o.is_default) || sortedOptions[0]

    return (
        <div className={clsx('space-y-3', className)}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground/70">Выберите вес:</span>
                {selected && (
                    <span className="text-sm font-bold text-primary">
                        {formatPrice(selected.final_price)}
                    </span>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {sortedOptions.map((option) => {
                    const isSelected = selected?.id === option.id
                    const isAvailable = option.in_stock && option.stock_quantity > 0

                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => onSelect(option)}
                            disabled={!isAvailable}
                            className={clsx(
                                'relative min-w-[70px] px-4 py-2.5 rounded-xl border-2 transition-all duration-200',
                                'text-sm font-semibold',
                                isSelected
                                    ? 'border-primary bg-primary/10 text-primary shadow-md'
                                    : isAvailable
                                        ? 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5'
                                        : 'border-border/50 bg-muted text-muted-foreground cursor-not-allowed opacity-50',
                            )}
                        >
                            <span className="block">{formatWeight(option.weight_gr)}</span>
                            {option.is_on_sale && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

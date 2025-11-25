import React from 'react'
import { Range } from 'react-range'
import { clsx } from 'clsx'

interface DualRangeSliderProps {
  min: number
  max: number
  step?: number
  value: { min: number; max: number }
  onChange: (value: { min: number; max: number }) => void
  onFinalChange?: (value: { min: number; max: number }) => void
  disabled?: boolean
  className?: string
  valueFormatter?: (value: number) => string
  ariaLabels?: [string, string]
  testId?: string
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  onFinalChange,
  disabled = false,
  className,
  valueFormatter,
  ariaLabels = ['Минимальная цена', 'Максимальная цена'],
  testId,
}) => {
  const clampedMin = Math.min(Math.max(value.min, min), max)
  const clampedMax = Math.max(Math.min(value.max, max), min)
  const sliderValues = [Math.min(clampedMin, clampedMax), Math.max(clampedMin, clampedMax)]

  const formatValue = (amount: number) => {
    if (valueFormatter) return valueFormatter(amount)
    return new Intl.NumberFormat('ru-RU').format(amount)
  }

  return (
    <div
      className={clsx('w-full pt-8 pb-4 px-1', className, disabled && 'pointer-events-none opacity-50')}
      data-testid={testId}
    >
      <Range
        step={step}
        min={min}
        max={max}
        values={sliderValues}
        onChange={(next) =>
          onChange({
            min: Math.min(...next),
            max: Math.max(...next),
          })
        }
        onFinalChange={(next) =>
          onFinalChange?.({
            min: Math.min(...next),
            max: Math.max(...next),
          })
        }
        disabled={disabled}
        renderTrack={({ props, children }) => (
          <div
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            className="group/track h-6 w-full flex items-center cursor-pointer"
          >
            <div
              ref={props.ref}
              className="relative h-1.5 w-full rounded-full bg-secondary/60 transition-colors duration-200 group-hover/track:bg-secondary/80"
            >
              <div
                className="absolute top-0 bottom-0 rounded-full bg-primary shadow-sm"
                style={{
                  left: `${((sliderValues[0] - min) / (max - min)) * 100}%`,
                  width: `${((sliderValues[1] - sliderValues[0]) / (max - min)) * 100}%`,
                }}
              />
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props, value: thumbValue, isDragged }) => {
          const { key, ...restProps } = props
          return (
            <div
              key={key}
              {...restProps}
              className="group flex flex-col items-center justify-center outline-none z-10"
            >
              {/* Permanent Value Bubble */}
              <div
                className={clsx(
                  'absolute -top-8 flex flex-col items-center transition-all duration-200 select-none',
                  isDragged ? 'scale-110 z-30' : 'scale-100 z-20'
                )}
              >
                <span className={clsx(
                  "whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold shadow-sm transition-colors",
                  isDragged ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border/50"
                )}>
                  {formatValue(thumbValue)}
                </span>
                <div className={clsx(
                  "h-1.5 w-1.5 rotate-45 -mt-0.5 transition-colors",
                  isDragged ? "bg-primary" : "bg-card border-r border-b border-border/50"
                )} />
              </div>

              {/* Thumb */}
              <div
                className={clsx(
                  'h-4 w-4 rounded-full border-2 border-background bg-primary shadow-md transition-all duration-150 ring-1 ring-black/5',
                  isDragged ? 'scale-125 shadow-lg ring-primary/30' : 'scale-100 hover:scale-110'
                )}
              />
            </div>
          )
        }}
      />
    </div>
  )
}

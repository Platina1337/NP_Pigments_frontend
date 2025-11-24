import React from 'react'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/api'
import { Truck, Package } from 'lucide-react'

interface DeliveryOption {
  provider: string
  provider_name: string
  service: string
  cost: number
  period_min: number
  period_max: number
}

interface DeliveryMethodSelectorProps {
  options: DeliveryOption[]
  onSelect: (option: DeliveryOption) => void
  onBack: () => void
}

export const DeliveryMethodSelector: React.FC<DeliveryMethodSelectorProps> = ({
  options,
  onSelect,
  onBack,
}) => {
  const [selected, setSelected] = React.useState<DeliveryOption | null>(null)

  const handleSelect = (option: DeliveryOption) => {
    setSelected(option)
  }

  const handleContinue = () => {
    if (selected) {
      onSelect(selected)
    }
  }

  const getIcon = (provider: string) => {
    if (provider === 'cdek') return <Truck className="w-6 h-6" />
    if (provider === 'russian_post') return <Package className="w-6 h-6" />
    return <Truck className="w-6 h-6" />
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Выберите способ доставки</h2>

      {options.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Нет доступных вариантов доставки</p>
        </div>
      ) : (
        <div className="space-y-4">
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelect(option)}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selected === option
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div
                    className={`p-2 rounded-lg ${
                      selected === option ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {getIcon(option.provider)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{option.provider_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{option.service}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Срок доставки: {option.period_min}–{option.period_max} дней
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatPrice(option.cost)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4 mt-6">
        <Button onClick={onBack} variant="secondary" className="flex-1">
          Назад
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selected}
          className="flex-1"
        >
          Продолжить
        </Button>
      </div>
    </div>
  )
}


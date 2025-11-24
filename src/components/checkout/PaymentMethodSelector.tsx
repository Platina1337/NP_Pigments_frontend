import React from 'react'
import { Button } from '@/components/ui/Button'
import { CreditCard, Wallet } from 'lucide-react'

interface PaymentMethodSelectorProps {
  selected: string
  onSelect: (method: string) => void
  onBack: () => void
}

const paymentMethods = [
  {
    id: 'yookassa',
    name: 'ЮKassa',
    description: 'Оплата картой через ЮKassa',
    icon: <CreditCard className="w-6 h-6" />,
  },
  {
    id: 'tinkoff',
    name: 'Тинькофф',
    description: 'Оплата через Тинькофф',
    icon: <Wallet className="w-6 h-6" />,
  },
  {
    id: 'cash',
    name: 'Наличными при получении',
    description: 'Оплатите заказ при получении',
    icon: <Wallet className="w-6 h-6" />,
  },
]

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selected,
  onSelect,
  onBack,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Способ оплаты</h2>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selected === method.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`p-2 rounded-lg ${
                  selected === method.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {method.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{method.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{method.description}</p>
              </div>
              <div>
                <input
                  type="radio"
                  checked={selected === method.id}
                  onChange={() => onSelect(method.id)}
                  className="w-5 h-5 text-primary focus:ring-primary"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button onClick={onBack} variant="secondary" className="w-full">
          Назад
        </Button>
      </div>
    </div>
  )
}


import React from 'react'
import { formatPrice } from '@/lib/api'
import { CartItem } from '@/types'

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
  deliveryCost: number
  deliveryMethod?: string
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  deliveryCost,
  deliveryMethod,
}) => {
  const total = subtotal + deliveryCost

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Ваш заказ</h2>

      {/* Список товаров */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex-1">
              <p className="text-gray-900 font-medium">{item.perfume.name}</p>
              <p className="text-gray-500">
                {item.perfume.brand.name} × {item.quantity}
              </p>
            </div>
            <div className="text-gray-900 font-medium">
              {formatPrice(parseFloat(item.perfume.price) * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Товары ({items.length})</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        {/* Delivery */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Доставка{deliveryMethod && ` (${deliveryMethod})`}
          </span>
          <span className="font-medium">
            {deliveryCost > 0 ? formatPrice(deliveryCost) : 'Бесплатно'}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="border-t mt-4 pt-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Итого</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}


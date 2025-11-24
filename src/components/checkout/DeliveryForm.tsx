import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface DeliveryFormProps {
  onSubmit: (data: DeliveryData) => void
  initialData?: DeliveryData
}

interface DeliveryData {
  city: string
  address: string
  postal_code: string
  phone: string
  notes?: string
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<DeliveryData>(
    initialData || {
      city: '',
      address: '',
      postal_code: '',
      phone: '',
      notes: '',
    }
  )

  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryData, string>>>({})

  const validate = () => {
    const newErrors: Partial<Record<keyof DeliveryData, string>> = {}

    if (!formData.city.trim()) {
      newErrors.city = 'Укажите город'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Укажите адрес'
    }
    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'Укажите почтовый индекс'
    } else if (!/^\d{6}$/.test(formData.postal_code)) {
      newErrors.postal_code = 'Индекс должен состоять из 6 цифр'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Укажите телефон'
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/[\s()-]/g, ''))) {
      newErrors.phone = 'Неверный формат телефона'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  const handleChange = (field: keyof DeliveryData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Адрес доставки</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            Город *
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Москва"
          />
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Адрес *
          </label>
          <input
            type="text"
            id="address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Улица, дом, квартира"
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>

        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
            Почтовый индекс *
          </label>
          <input
            type="text"
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => handleChange('postal_code', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.postal_code ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="123456"
            maxLength={6}
          />
          {errors.postal_code && <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Телефон *
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+7 (999) 123-45-67"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Комментарий к заказу (необязательно)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Дополнительная информация для доставки"
          />
        </div>

        <Button type="submit" className="w-full" size="lg">
          Продолжить
        </Button>
      </form>
    </div>
  )
}


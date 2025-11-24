'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { DeliveryForm } from '@/components/checkout/DeliveryForm'
import { DeliveryMethodSelector } from '@/components/checkout/DeliveryMethodSelector'
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

interface DeliveryData {
  city: string
  address: string
  postal_code: string
  phone: string
  notes?: string
}

interface DeliveryOption {
  provider: string
  provider_name: string
  service: string
  cost: number
  period_min: number
  period_max: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { state: cartState } = useCart()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null)
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('yookassa')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Проверка авторизации
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout')
    }
  }, [user, authLoading, router])

  // Проверка пустой корзины
  useEffect(() => {
    if (cartState.items.length === 0) {
      router.push('/cart')
    }
  }, [cartState.items.length, router])

  // Расчет доставки при изменении адреса
  const handleDeliverySubmit = async (data: DeliveryData) => {
    setDeliveryData(data)
    setError(null)
    
    try {
      const response = await api.delivery.calculate({
        city: data.city,
        postal_code: data.postal_code
      })
      
      if (response.data && typeof response.data === 'object' && 'options' in response.data) {
        setDeliveryOptions((response.data as {options: DeliveryOption[]}).options || [])
        setCurrentStep(2)
      }
    } catch (err) {
      setError('Ошибка расчета доставки')
    }
  }

  // Выбор способа доставки
  const handleDeliverySelect = (option: DeliveryOption) => {
    setSelectedDelivery(option)
    setCurrentStep(3)
  }

  // Создание заказа
  const handleCreateOrder = async () => {
    if (!deliveryData || !selectedDelivery) return
    
    setIsProcessing(true)
    setError(null)

    try {
      // Создаем заказ
      const orderResponse = await api.orders.create({
        delivery_address: deliveryData.address,
        delivery_city: deliveryData.city,
        delivery_postal_code: deliveryData.postal_code,
        delivery_phone: deliveryData.phone,
        delivery_method: selectedDelivery.provider,
        delivery_cost: selectedDelivery.cost,
        customer_notes: deliveryData.notes || '',
        payment_method: paymentMethod,
      })

      if (orderResponse.error || !orderResponse.data) {
        throw new Error(orderResponse.error || 'Ошибка создания заказа')
      }

      const orderId = (orderResponse.data as {id: number}).id

      // Создаем платеж
      let paymentResponse
      if (paymentMethod === 'yookassa') {
        paymentResponse = await api.payments.createYooKassaPayment(orderId)
      } else if (paymentMethod === 'tinkoff') {
        paymentResponse = await api.payments.createTinkoffPayment(orderId)
      } else {
        // Для других методов перенаправляем на страницу успеха
        router.push(`/payment/success?order_id=${orderId}`)
        return
      }

      if (paymentResponse?.data) {
        // Перенаправляем на страницу оплаты
        const paymentUrl = (paymentResponse.data as {confirmation_url?: string; payment_url?: string}).confirmation_url || (paymentResponse.data as {confirmation_url?: string; payment_url?: string}).payment_url
        if (paymentUrl) {
          window.location.href = paymentUrl
        }
      } else {
        throw new Error('Ошибка создания платежа')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка оформления заказа')
      setIsProcessing(false)
    }
  }

  if (authLoading || cartState.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/80">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Навигация */}
      <div className="mb-6">
        <Link href="/cart" className="inline-flex items-center text-primary hover:text-primary-dark">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Вернуться в корзину
        </Link>
      </div>

      {/* Заголовок */}
      <h1 className="text-3xl font-bold text-foreground mb-8">Оформление заказа</h1>

      {/* Индикатор шагов */}
      <CheckoutSteps currentStep={currentStep} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Основное содержимое */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          {/* Шаг 1: Данные доставки */}
          {currentStep === 1 && (
            <DeliveryForm
              onSubmit={handleDeliverySubmit}
              initialData={deliveryData || undefined}
            />
          )}

          {/* Шаг 2: Выбор доставки */}
          {currentStep === 2 && (
            <DeliveryMethodSelector
              options={deliveryOptions}
              onSelect={handleDeliverySelect}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {/* Шаг 3: Способ оплаты */}
          {currentStep === 3 && (
            <PaymentMethodSelector
              selected={paymentMethod}
              onSelect={setPaymentMethod}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </div>

        {/* Сайдбар с итогами */}
        <div className="lg:col-span-1">
          <OrderSummary
            items={cartState.items}
            subtotal={cartState.total}
            deliveryCost={selectedDelivery?.cost || 0}
            deliveryMethod={selectedDelivery?.service}
          />

          {currentStep === 3 && (
            <Button
              className="w-full mt-4"
              size="lg"
              onClick={handleCreateOrder}
              disabled={isProcessing}
            >
              {isProcessing ? 'Обработка...' : 'Оформить заказ'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}


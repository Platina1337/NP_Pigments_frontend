'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard, AlertCircle, CheckCircle, Truck, XCircle, Package, Clock } from 'lucide-react'
import { api, formatPrice } from '@/lib/api'
import { Order, PaymentResponse } from '@/types/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const loadOrder = async () => {
    try {
      console.log('Loading order with ID:', orderId)
      const response = await api.orders.getById(parseInt(orderId))
      console.log('Order response:', response)
      console.log('Response data:', response.data)
      console.log('Response error:', response.error)
      if (response.data) {
        console.log('Setting order data:', response.data)
        setOrder(response.data as Order)
      } else {
        console.error('No data in response:', response)
        console.error('Response error:', response.error)
      }
    } catch (error) {
      console.error('Failed to load order:', error)
      router.push('/profile?tab=orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async (order: Order) => {
    if (order.status === 'paid') {
      setPaymentError('Этот заказ уже оплачен')
      return
    }

    if (order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
      setPaymentError('Этот заказ уже находится в обработке и не требует дополнительной оплаты')
      return
    }

    if (order.status === 'cancelled') {
      setPaymentError('Этот заказ отменен и не может быть оплачен')
      return
    }

    if (order.status !== 'pending') {
      setPaymentError('Невозможно оплатить заказ с текущим статусом')
      return
    }

    setIsPaymentProcessing(true)
    setPaymentError(null)

    try {
      const paymentResponse = await api.payments.createYooKassaPayment(order.id)

      if (paymentResponse.error) {
        setPaymentError(paymentResponse.error)
        return
      }

      if (!paymentResponse.data) {
        setPaymentError('Не удалось получить данные платежа')
        return
      }

      const paymentData = paymentResponse.data as PaymentResponse
      const paymentUrl = paymentData.confirmation_url
      const paymentId = paymentData.payment_id

      if (!paymentUrl) {
        setPaymentError('Не удалось получить ссылку на оплату')
        return
      }

      if (paymentId) {
        localStorage.setItem(
          'last_payment',
          JSON.stringify({
            orderId: order.id,
            paymentId,
            method: 'yookassa',
            createdAt: Date.now(),
          })
        )
      }

      window.location.href = paymentUrl
    } catch (error) {
      console.error('Payment creation error:', error)
      setPaymentError('Произошла ошибка при создании платежа. Попробуйте еще раз.')
    } finally {
      setIsPaymentProcessing(false)
    }
  }

  const statusConfig = {
    pending: {
      label: 'Ожидает оплаты',
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-100',
    },
    paid: {
      label: 'Оплачен',
      icon: CheckCircle,
      color: 'text-blue-600 bg-blue-100',
    },
    processing: {
      label: 'В обработке',
      icon: Package,
      color: 'text-purple-600 bg-purple-100',
    },
    shipped: {
      label: 'Отправлен',
      icon: Truck,
      color: 'text-orange-600 bg-orange-100',
    },
    delivered: {
      label: 'Доставлен',
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100',
    },
    cancelled: {
      label: 'Отменен',
      icon: XCircle,
      color: 'text-red-600 bg-red-100',
    },
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/80">Загрузка заказа...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-foreground/80 mb-4">Заказ не найден</p>
          <Link href="/profile?tab=orders">
            <Button>Вернуться к заказам</Button>
          </Link>
        </div>
      </div>
    )
  }

  const status = statusConfig[order.status]
  const StatusIcon = status.icon

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link
          href="/profile?tab=orders"
          className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Назад к заказам
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Заказ #{order.id}
            </h1>
            <p className="text-sm sm:text-base text-foreground/70">
              {new Date(order.created_at).toLocaleDateString('ru-RU')} в {new Date(order.created_at).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}
            </p>
          </div>

          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${status.color}`}>
            <StatusIcon size={16} />
            <span>{status.label}</span>
          </div>
        </div>

        {/* Payment Section */}
        {order.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={20} className="text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800">Требуется оплата</h3>
                <p className="text-sm text-yellow-700">Заказ ожидает оплаты для дальнейшей обработки</p>
              </div>
            </div>

            {paymentError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{paymentError}</p>
              </div>
            )}

            <Button
              onClick={() => handlePayment(order)}
              disabled={isPaymentProcessing}
              size="lg"
              className="w-full sm:w-auto"
            >
              <CreditCard size={16} className="mr-2" />
              {isPaymentProcessing ? 'Создание платежа...' : `Оплатить ${formatPrice(order.total)}`}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6">Состав заказа</h2>
            <div className="space-y-3 sm:space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border/50">
                  {item.product_image && (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm sm:text-base truncate">
                      {item.product_name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        {formatPrice(item.unit_price)} × {item.quantity}
                      </p>
                      <p className="font-semibold text-foreground text-sm sm:text-base ml-2">
                        {formatPrice(item.total_price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Order Timeline */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6">Статус заказа</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-green-800">Заказ создан</p>
                  <p className="text-sm text-green-600">
                    {new Date(order.created_at).toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>

              {order.paid_at && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <CheckCircle size={20} className="text-blue-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-blue-800">Заказ оплачен</p>
                    <p className="text-sm text-blue-600">
                      {new Date(order.paid_at).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              )}

              {order.shipped_at && (
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <Truck size={20} className="text-orange-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-orange-800">Заказ отправлен</p>
                    <p className="text-sm text-orange-600">
                      {new Date(order.shipped_at).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              )}

              {order.delivered_at && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-green-800">Заказ доставлен</p>
                    <p className="text-sm text-green-600">
                      {new Date(order.delivered_at).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Customer Notes */}
          {order.customer_notes && (
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Комментарий к заказу</h2>
              <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-sm text-foreground/80">{order.customer_notes}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6">Итого</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/70">Сумма товаров:</span>
                <span className="text-foreground font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/70">Доставка:</span>
                <span className="text-foreground font-medium">{formatPrice(order.delivery_cost)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                <span className="text-foreground">К оплате:</span>
                <span className="text-foreground">{formatPrice(order.total)}</span>
              </div>
            </div>
          </Card>

          {/* Delivery Info */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6">Информация о доставке</h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-foreground/70 block mb-1">Адрес:</span>
                <span className="text-foreground font-medium break-words">{order.delivery_address}</span>
              </div>
              <div>
                <span className="text-foreground/70 block mb-1">Город:</span>
                <span className="text-foreground font-medium">{order.delivery_city}</span>
              </div>
              <div>
                <span className="text-foreground/70 block mb-1">Индекс:</span>
                <span className="text-foreground font-medium">{order.delivery_postal_code}</span>
              </div>
              <div>
                <span className="text-foreground/70 block mb-1">Телефон:</span>
                <span className="text-foreground font-medium">{order.delivery_phone}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


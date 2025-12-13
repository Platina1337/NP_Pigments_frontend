'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { api } from '@/lib/api'

type PaymentStatus = 'checking' | 'success' | 'failed' | 'unknown'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderIdFromQuery = searchParams.get('order_id')

  const [status, setStatus] = useState<PaymentStatus>('checking')
  const [orderId, setOrderId] = useState<string | null>(orderIdFromQuery)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('last_payment') : null
      const storedData = stored ? (() => { try { return JSON.parse(stored) as { orderId?: number; paymentId?: string; method?: string } } catch { return null } })() : null

      let paymentId = searchParams.get('payment_id') || storedData?.paymentId || null
      let method = storedData?.method || 'yookassa'
      let effectiveOrderId = orderIdFromQuery || (storedData?.orderId ? String(storedData.orderId) : null)

      if (effectiveOrderId) {
        setOrderId(effectiveOrderId)
      }

      if (!paymentId) {
        setStatus('unknown')
        setInfo('Не удалось проверить статус платежа. Проверьте историю заказов.')
        return
      }

      setStatus('checking')
      try {
        let response
        if (method === 'tinkoff') {
          response = await api.payments.checkTinkoffStatus(paymentId)
        } else {
          response = await api.payments.checkYooKassaStatus(paymentId)
        }

        if (response.status === 401) {
          setStatus('unknown')
          setInfo('Нужно авторизоваться, чтобы проверить статус оплаты.')
          return
        }

        if (response.data && typeof response.data === 'object') {
          const data = response.data as { status?: string; paid?: boolean }
          const normalizedStatus = (data.status || '').toLowerCase()
          const paid = data.paid === true || normalizedStatus === 'succeeded' || normalizedStatus === 'confirmed'

          if (paid || normalizedStatus === 'succeeded' || normalizedStatus === 'confirmed') {
            setStatus('success')
            return
          }
        }

        setStatus('failed')
      } catch (error) {
        console.error('Payment status check failed', error)
        setStatus('unknown')
        setInfo('Не удалось проверить статус платежа. Попробуйте позже или проверьте в профиле.')
      }
    }

    void verifyPayment()
  }, [orderIdFromQuery, searchParams])

  useEffect(() => {
    if (status === 'failed') {
      const suffix = orderId ? `?order_id=${orderId}` : ''
      router.replace(`/payment/failed${suffix}`)
    }
  }, [status, orderId, router])

  const isChecking = status === 'checking'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        {isChecking ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
            <p className="text-lg text-gray-700">Проверяем статус оплаты...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Оплата успешно завершена!
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              Спасибо за ваш заказ{orderId && ` #${orderId}`}. Мы отправили подтверждение на вашу электронную почту.
            </p>

            {info && (
              <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg p-4 mb-6">
                {info}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <p className="text-sm text-gray-600 mb-2">
                Ваш заказ находится в обработке. Как только он будет отправлен, вы получите трекинг-номер для отслеживания.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profile">
                <Button size="lg">
                  Мои заказы
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="secondary">
                  На главную
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


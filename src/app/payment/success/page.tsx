'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
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
      </div>
    </div>
  )
}


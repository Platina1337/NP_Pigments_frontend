'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function PaymentFailedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-4">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Ошибка оплаты
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          К сожалению, оплата не прошла{orderId && ` для заказа #${orderId}`}. Пожалуйста, попробуйте еще раз.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-2">Возможные причины:</h3>
          <ul className="text-sm text-gray-600 text-left list-disc list-inside space-y-1">
            <li>Недостаточно средств на карте</li>
            <li>Превышен лимит операций</li>
            <li>Неверные данные карты</li>
            <li>Технические проблемы банка</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/checkout">
            <Button size="lg">
              Попробовать снова
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


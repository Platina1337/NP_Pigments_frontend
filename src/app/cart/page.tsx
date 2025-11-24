'use client'

import React, { useState } from 'react'

export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { CartItemComponent } from '@/components/cart/CartItem'
import { formatPrice } from '@/lib/api'
import { Button } from '@/components/ui/Button'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)

  const { state, removeItem, updateQuantity, clearCart } = useCart()
  const { items, total, itemCount } = state

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/80">Загрузка корзины...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-foreground/50" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Корзина пуста</h1>
          <p className="text-foreground/80 mb-8">Добавьте товары в корзину, чтобы оформить заказ</p>
          <Link href="/products">
            <Button>
              Перейти к товарам
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Навигация */}
      <div className="mb-6">
        <Link href="/products" className="inline-flex items-center text-primary hover:text-primary-dark">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Продолжить покупки
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Список товаров */}
        <div className="lg:col-span-2 space-y-4">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            Корзина ({itemCount} {itemCount === 1 ? 'товар' : itemCount < 5 ? 'товара' : 'товаров'})
          </h1>

          {items.map((item) => (
            <CartItemComponent
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}

          <div className="flex justify-between items-center pt-4 border-t">
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Очистить корзину
            </button>
          </div>
        </div>

        {/* Итого */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg shadow-sm p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">Итого</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-foreground/80">Товары ({itemCount})</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/80">Доставка</span>
                <span className="font-medium">Бесплатно</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Итого</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>

              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg">
                  Оформить заказ
                </Button>
              </Link>
            </div>

            <div className="mt-4 text-xs text-foreground/60 text-center">
              Нажимая &ldquo;Оформить заказ&rdquo;, вы соглашаетесь с условиями доставки и оплаты
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
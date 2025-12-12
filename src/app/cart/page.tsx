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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-emerald-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
                Корзина
              </h1>
              <p className="text-foreground/70">
                {itemCount} {itemCount === 1 ? 'товар' : itemCount < 5 ? 'товара' : 'товаров'} в корзине
              </p>
            </div>
            <Link href="/products" className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-border rounded-xl hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="font-medium">Продолжить покупки</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Список товаров */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="animate-in slide-in-from-left-4 duration-500 ease-out"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CartItemComponent
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              </div>
            ))}

            <div className="flex justify-center pt-6">
              <button
                onClick={clearCart}
                className="px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Очистить корзину
              </button>
            </div>
          </div>

          {/* Итого */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 sticky top-4">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Итого</h2>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-foreground/80">Товары ({itemCount})</span>
                  <span className="font-semibold text-foreground">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-foreground/80">Доставка</span>
                  <span className="font-semibold text-emerald-600">Бесплатно</span>
                </div>
              </div>

              <div className="border-t border-border/50 pt-6">
                <div className="flex justify-between items-center text-2xl font-bold mb-6">
                  <span className="text-foreground">Итого</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>

                <Link href="/checkout" className="block">
                <Button className="w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200" size="lg">
                  Оформить заказ
                </Button>
                </Link>
              </div>

              <div className="mt-4 text-xs text-foreground/60 text-center bg-foreground/5 rounded-lg p-3">
                Нажимая "Оформить заказ", вы соглашаетесь с условиями доставки и оплаты
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
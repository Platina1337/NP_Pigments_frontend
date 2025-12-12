'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/api';

export const MiniCart: React.FC = () => {
  const { state, updateQuantity, removeItem } = useCart();
  const { items, total, itemCount } = state;

  if (itemCount === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <ShoppingBag className="w-10 h-10 text-foreground/30 mx-auto mb-4" />
          <p className="text-foreground/60 text-sm mb-4">Ваша корзина пуста</p>
          <Link href="/products">
            <span className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200">
              Перейти к товарам →
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-hidden">
      {/* Заголовок */}
      <div className="px-4 py-3 bg-primary/5 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Корзина ({itemCount})
            </h3>
          </div>
        </div>
      </div>

      {/* Содержимое корзины */}
      <div className="max-h-64 overflow-y-auto">
        <div className="divide-y divide-border">
          {items.map((item) => {
            const unitPrice = item.perfume.final_price ?? parseFloat(item.perfume.price);
            const originalPrice = parseFloat(item.perfume.price);
            const hasDiscount = unitPrice < originalPrice;
            return (
              <div key={item.id} className="px-4 py-3 hover:bg-primary/5 transition-colors duration-150">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-4 h-4 text-primary/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.perfume.name}
                    </p>
                    <p className="text-xs text-foreground/60 flex items-center gap-1">
                      {formatPrice(unitPrice)}
                      {hasDiscount && (
                        <span className="ml-1.5 line-through text-foreground/40">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        aria-label="Уменьшить количество"
                        className="h-7 w-7 rounded-md border border-border flex items-center justify-center hover:bg-primary/10 transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[28px] text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        aria-label="Увеличить количество"
                        className="h-7 w-7 rounded-md border border-border flex items-center justify-center hover:bg-primary/10 transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        aria-label="Удалить товар"
                        className="ml-2 h-7 w-7 rounded-md border border-border flex items-center justify-center hover:bg-red-50 text-red-500 transition-colors"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {formatPrice(unitPrice * item.quantity)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Итого и действия */}
      <div className="px-4 py-3 bg-primary/5 border-t border-border">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-foreground">
            Итого: {formatPrice(total)}
          </span>
        </div>

        <div className="space-y-2">
          <Link href="/cart" className="block">
            <button className="w-full bg-background border border-border text-foreground py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary/5 hover:border-primary/30 transition-all duration-200">
              Просмотреть корзину
            </button>
          </Link>
          <Link href="/checkout" className="block">
            <button className="w-full bg-primary text-primary-foreground py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md">
              Оформить заказ
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

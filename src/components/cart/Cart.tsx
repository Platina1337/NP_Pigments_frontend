import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CartItemComponent } from './CartItem';
import { formatPrice } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface CartProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen = true, onClose }) => {
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const { items, total, itemCount } = state;

  if (!isOpen) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Заголовок корзины */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Корзина ({itemCount})
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl sm:text-base"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Содержимое корзины */}
      <div className="max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-4 sm:px-6 py-6 sm:py-8 text-center">
            <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4 text-sm sm:text-base">Ваша корзина пуста</p>
            <Link href="/products">
              <Button variant="secondary" className="w-full sm:w-auto">
                Перейти к товарам
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <CartItemComponent
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Итого и действия */}
      {items.length > 0 && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
            <span className="text-base sm:text-lg font-semibold text-gray-900">
              Итого: {formatPrice(total)}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 self-start sm:self-auto"
            >
              Очистить корзину
            </Button>
          </div>

          <div className="space-y-2">
            <Link href="/cart" className="block">
              <Button variant="secondary" className="w-full text-sm sm:text-base">
                Просмотреть корзину
              </Button>
            </Link>
            <Link href="/checkout" className="block">
              <Button className="w-full text-sm sm:text-base">
                Оформить заказ
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

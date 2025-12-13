import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { formatPrice, getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export const CartItemComponent: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const { perfume, quantity } = item;
  const originalPrice = parseFloat(perfume.price);
  const finalPrice = perfume.final_price !== undefined && perfume.final_price !== null
    ? Number(perfume.final_price)
    : originalPrice;
  const hasDiscount = finalPrice < originalPrice;
  const itemTotal = finalPrice * quantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemove(item.id);
    } else {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      {/* Верхняя часть для мобильных - изображение и основная информация */}
      <div className="flex items-center space-x-4 flex-1 mb-4">
        {/* Изображение товара */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-emerald-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <img
            src={getImageUrl(perfume.image || '')}
            alt={perfume.name}
            className="relative w-full h-full object-cover rounded-xl shadow-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-perfume.jpg';
            }}
          />
        </div>

        {/* Информация о товаре */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
              {perfume.brand.name} - {perfume.name}
            </h3>
            {hasDiscount && (
              <span className="text-xs font-semibold text-red-600 bg-red-100/80 px-2 py-0.5 rounded-md">
                Скидка
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/60 mb-2">
            {perfume.category.name} • {perfume.volume_ml} мл
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-sm font-semibold text-primary">
              {formatPrice(finalPrice)} за шт.
            </p>
            {hasDiscount && (
              <p className="text-xs text-foreground/50 line-through">
                {formatPrice(originalPrice)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Нижняя часть для мобильных - управление и сумма */}
      <div className="flex items-center justify-between">
        {/* Управление количеством */}
        <div className="flex items-center space-x-3 bg-foreground/5 rounded-xl p-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleQuantityChange(quantity - 1)}
            className="h-8 w-8 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200 !p-0"
          >
            <div className="flex items-center justify-center w-full h-full">
              <Minus className="w-4 h-4" />
            </div>
          </Button>

          <span className="w-10 text-center text-base font-semibold text-foreground">
            {quantity}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= perfume.stock_quantity}
            className="h-8 w-8 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200 !p-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center w-full h-full">
              <Plus className="w-4 h-4" />
            </div>
          </Button>
        </div>

        {/* Сумма и удаление */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs text-foreground/60">Сумма</p>
            <span className="text-lg font-bold text-foreground">
              {formatPrice(itemTotal)}
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="h-10 w-10 rounded-xl text-red-500 hover:text-white hover:bg-red-500 transition-all duration-200 shadow-sm hover:shadow-md !p-0"
          >
            <div className="flex items-center justify-center w-full h-full">
              <Trash2 className="w-5 h-5" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

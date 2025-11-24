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
  const itemTotal = parseFloat(perfume.price) * quantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemove(item.id);
    } else {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-white rounded-lg shadow-sm border">
      {/* Верхняя часть для мобильных - изображение и основная информация */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
        {/* Изображение товара */}
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
          <img
            src={getImageUrl(perfume.image || '')}
            alt={perfume.name}
            className="w-full h-full object-cover rounded-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-perfume.jpg';
            }}
          />
        </div>

        {/* Информация о товаре */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate">
            {perfume.brand.name} - {perfume.name}
          </h3>
          <p className="text-xs sm:text-sm text-foreground/60">
            {perfume.category.name} • {perfume.volume_ml} мл
          </p>
          <p className="text-xs sm:text-sm font-medium text-primary">
            {formatPrice(parseFloat(perfume.price))} за шт.
          </p>
        </div>
      </div>

      {/* Нижняя часть для мобильных - управление и сумма */}
      <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
        {/* Управление количеством */}
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleQuantityChange(quantity - 1)}
            className="p-1 h-7 w-7 sm:h-8 sm:w-8"
          >
            <Minus className="w-3 h-3" />
          </Button>

          <span className="w-6 sm:w-8 text-center text-sm font-medium">
            {quantity}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleQuantityChange(quantity + 1)}
            className="p-1 h-7 w-7 sm:h-8 sm:w-8"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        {/* Сумма и удаление */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <span className="text-sm font-medium text-foreground w-16 sm:w-20 text-right">
            {formatPrice(itemTotal)}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="p-1 h-7 w-7 sm:h-8 sm:w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

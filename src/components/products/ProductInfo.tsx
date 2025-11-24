'use client';

import React, { useState } from 'react';
import { Star, ShoppingCart, Heart, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import { Perfume, Pigment } from '@/types/api';
import { formatPrice, formatVolume, formatGender } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';

type Product = Perfume | Pigment;

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const isPerfume = 'gender' in product && 'volume_ml' in product;
  const isPigment = 'color_type' in product && 'weight_gr' in product;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock_quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Add the item multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
  };

  const averageRating = 4.8; // Mock rating - in real app this would come from API
  const reviewCount = 124; // Mock review count

  return (
    <div className="space-y-6">
      {/* Brand and Title */}
      <div>
        <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">
          {product.brand.name}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {product.name}
        </h1>

        {/* Category and Type Tags */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-sm text-gray-600">{product.category.name}</span>
          <span className="text-sm text-gray-400">•</span>
          {isPerfume ? (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              product.gender === 'M' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
              product.gender === 'F' ? 'bg-pink-50 text-pink-700 border border-pink-200' :
              'bg-gray-50 text-gray-700 border border-gray-200'
            }`}>
              {formatGender(product.gender)}
            </span>
          ) : isPigment ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200">
              {product.color_type === 'powder' ? 'Порошок' :
               product.color_type === 'liquid' ? 'Жидкий' :
               product.color_type === 'paste' ? 'Паста' : product.color_type}
            </span>
          ) : null}
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(averageRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-lg font-semibold text-gray-900">
            {averageRating}
          </span>
        </div>
        <span className="text-sm text-gray-600">
          ({reviewCount} отзывов)
        </span>
      </div>

      {/* Price and Specs */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <span className="text-4xl font-bold text-primary">
              {formatPrice(typeof product.price === 'string' ? parseFloat(product.price) : product.price)}
            </span>
            <p className="text-sm text-gray-600 mt-1">
              {isPerfume ? `Объем: ${formatVolume(product.volume_ml)}` :
               isPigment ? `Вес: ${product.weight_gr} г` :
               'Спецификация недоступна'}
            </p>
          </div>

          {product.in_stock && (
            <div className="text-right">
              <div className="flex items-center text-green-600 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">В наличии</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {product.stock_quantity} шт.
              </p>
            </div>
          )}
        </div>

        {/* Quantity Selector */}
        {product.in_stock && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-900">Количество:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-center min-w-12 font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock_quantity}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Итого: {formatPrice(parseFloat(product.price) * quantity)}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleAddToCart}
          disabled={!product.in_stock}
          className="w-full"
          size="lg"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {product.in_stock ? `Добавить в корзину (${quantity})` : 'Нет в наличии'}
        </Button>

        <Button
          variant="secondary"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="w-full"
          size="lg"
        >
          <Heart className={`w-5 h-5 mr-2 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
          {isWishlisted ? 'В избранном' : 'Добавить в избранное'}
        </Button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Truck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Быстрая доставка</p>
            <p className="text-xs text-gray-600">В день заказа</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Гарантия качества</p>
            <p className="text-xs text-gray-600">Оригинальная продукция</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Возврат 30 дней</p>
            <p className="text-xs text-gray-600">Без лишних вопросов</p>
          </div>
        </div>
      </div>

      {/* Scent Notes Preview (only for perfumes) */}
      {isPerfume && (product.top_notes || product.heart_notes || product.base_notes) && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ноты аромата</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {product.top_notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  Верхние ноты
                </h4>
                <p className="text-sm text-gray-700">{product.top_notes}</p>
              </div>
            )}

            {product.heart_notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mr-2"></div>
                  Ноты сердца
                </h4>
                <p className="text-sm text-gray-700">{product.heart_notes}</p>
              </div>
            )}

            {product.base_notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                  Базовые ноты
                </h4>
                <p className="text-sm text-gray-700">{product.base_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

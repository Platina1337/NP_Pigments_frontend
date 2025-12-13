'use client';

import React, { useState, useMemo } from 'react';
import { Star, ShoppingCart, Heart, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import { Perfume, Pigment, VolumeOption, WeightOption } from '@/types/api';
import { formatPrice, formatVolume, formatGender, formatWeight } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { normalizeProductForCart } from '@/lib/cart-normalizer';
import { getPriceInfo } from '@/lib/product-pricing';
import { VolumeSelector, WeightSelector } from './VolumeSelector';

type Product = Perfume | Pigment;

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Volume/Weight selection state
  const [selectedVolumeOptionId, setSelectedVolumeOptionId] = useState<number | undefined>(undefined);
  const [selectedWeightOptionId, setSelectedWeightOptionId] = useState<number | undefined>(undefined);

  const isPerfume = 'gender' in product && 'volume_ml' in product;
  const isPigment = 'color_type' in product && 'weight_gr' in product;

  // Get selected option for pricing
  const selectedVolumeOption = useMemo(() => {
    if (!isPerfume || !product.volume_options || product.volume_options.length === 0) return null;
    return product.volume_options.find(o => o.id === selectedVolumeOptionId)
      || product.volume_options.find(o => o.is_default)
      || product.volume_options[0];
  }, [isPerfume, product, selectedVolumeOptionId]);

  const selectedWeightOption = useMemo(() => {
    if (!isPigment || !('weight_options' in product) || !product.weight_options || product.weight_options.length === 0) return null;
    return product.weight_options.find(o => o.id === selectedWeightOptionId)
      || product.weight_options.find(o => o.is_default)
      || product.weight_options[0];
  }, [isPigment, product, selectedWeightOptionId]);

  // Use selected option's price if available, otherwise fall back to product price
  const { currentPrice, originalPrice, hasDiscount } = useMemo(() => {
    if (selectedVolumeOption) {
      return {
        currentPrice: selectedVolumeOption.final_price,
        originalPrice: selectedVolumeOption.is_on_sale ? selectedVolumeOption.price : selectedVolumeOption.final_price,
        hasDiscount: selectedVolumeOption.is_on_sale || false,
      };
    }
    if (selectedWeightOption) {
      return {
        currentPrice: selectedWeightOption.final_price,
        originalPrice: selectedWeightOption.is_on_sale ? selectedWeightOption.price : selectedWeightOption.final_price,
        hasDiscount: selectedWeightOption.is_on_sale || false,
      };
    }
    return getPriceInfo(product);
  }, [product, selectedVolumeOption, selectedWeightOption]);

  // Stock quantity based on selected option
  const stockQuantity = selectedVolumeOption?.stock_quantity
    ?? selectedWeightOption?.stock_quantity
    ?? product.stock_quantity;
  const inStock = selectedVolumeOption?.in_stock
    ?? selectedWeightOption?.in_stock
    ?? product.in_stock;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    const normalized = normalizeProductForCart(product);
    const productType: 'perfume' | 'pigment' = isPerfume ? 'perfume' : 'pigment';
    // TODO: Pass selectedVolumeOptionId/selectedWeightOptionId to cart when cart is updated to support it
    addItem(normalized, productType, selectedVolumeOptionId, selectedWeightOptionId, quantity);
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
        {(product as any).sku && (
          <p className="text-sm text-gray-500 mb-2">Артикул: {(product as any).sku}</p>
        )}

        {/* Category and Type Tags */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-sm text-gray-600">{product.category.name}</span>
          <span className="text-sm text-gray-400">•</span>
          {isPerfume ? (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${product.gender === 'M' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
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
                className={`w-5 h-5 ${i < Math.floor(averageRating)
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
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-primary">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-lg line-through text-gray-400">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isPerfume
                ? (selectedVolumeOption
                  ? `Выбран объем: ${formatVolume(selectedVolumeOption.volume_ml)}`
                  : `Объем: ${formatVolume(product.volume_ml)}`)
                : isPigment
                  ? (selectedWeightOption
                    ? `Выбран вес: ${formatWeight(selectedWeightOption.weight_gr)}`
                    : `Вес: ${product.weight_gr} г`)
                  : 'Спецификация недоступна'}
            </p>
          </div>

          {inStock && (
            <div className="text-right">
              <div className="flex items-center text-green-600 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">В наличии</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {stockQuantity} шт.
              </p>
            </div>
          )}
        </div>

        {/* Volume/Weight Selector */}
        {isPerfume && product.volume_options && product.volume_options.length > 1 && (
          <VolumeSelector
            options={product.volume_options}
            selectedId={selectedVolumeOptionId ?? selectedVolumeOption?.id}
            onSelect={(option) => setSelectedVolumeOptionId(option.id)}
            className="mb-4"
          />
        )}

        {isPigment && 'weight_options' in product && product.weight_options && product.weight_options.length > 1 && (
          <WeightSelector
            options={product.weight_options}
            selectedId={selectedWeightOptionId ?? selectedWeightOption?.id}
            onSelect={(option) => setSelectedWeightOptionId(option.id)}
            className="mb-4"
          />
        )}

        {/* Quantity Selector */}
        {inStock && (
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
                  disabled={quantity >= stockQuantity}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Итого: {formatPrice(currentPrice * quantity)}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="w-full"
          size="lg"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {inStock ? `Добавить в корзину (${quantity})` : 'Нет в наличии'}
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

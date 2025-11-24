import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { PerfumeListItem, ProductListItem, Perfume, Pigment } from '@/types';
import { formatPrice, formatVolume, formatGender, getImageUrl, perfumesApi } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { saveBreadcrumbPath } from '@/lib/swr-hooks';
import { Button, Card, Icon } from '@/components/ui';

interface ProductCardProps {
  product: ProductListItem;
  breadcrumbPath?: Array<{ label: string; href: string }>;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, breadcrumbPath }) => {
  const { addItem } = useCart();

  const handleProductClick = () => {
    // Сохраняем breadcrumb путь перед переходом
    if (breadcrumbPath) {
      saveBreadcrumbPath(breadcrumbPath);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Получаем полную информацию о товаре для корзины
      if (product.product_type === 'perfume') {
        const response = await perfumesApi.getById(product.original_id);
        if (response.data) {
          addItem(response.data as Perfume);
        }
      } else {
        // Для пигментов используем pigmentsApi
        const response = await (await import('@/lib/api')).pigmentsApi.getById(product.original_id);
        if (response.data) {
          addItem(response.data as Pigment);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Определяем плейсхолдер в зависимости от типа продукта
  const placeholderImage = product.product_type === 'perfume' ? '/placeholder-perfume.svg' : '/placeholder-perfume.svg'; // Можно добавить placeholder для пигментов

  return (
    <Link href={`/products/${product.id}`} className="group block" onClick={handleProductClick}>
      <Card className="overflow-hidden h-full">
        <div className="relative overflow-hidden aspect-square">
          <img
            src={getImageUrl(product.image || '')}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = placeholderImage;
            }}
          />

          {/* Статус наличия */}
          <div className="absolute top-4 left-4">
            {product.in_stock ? (
              <span className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-full font-medium">
                В наличии
              </span>
            ) : (
              <span className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-full font-medium">
                Нет в наличии
              </span>
            )}
          </div>
        </div>

        <div className="p-6 flex flex-col h-full">
          <div className="flex-1">
            <div className="mb-3">
              <p className="text-sm text-foreground/70 font-light mb-1">{product.brand_name}</p>
              <h3 className="text-lg font-serif font-semibold text-foreground line-clamp-2 leading-tight card-hover-title">
                {product.name}
              </h3>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-serif font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-foreground/70 font-light">
                {product.product_type === 'perfume'
                  ? formatVolume(product.volume_ml || 0)
                  : `${product.weight_gr} г`
                }
              </span>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-foreground/70 font-light">{product.category_name}</span>
              {product.product_type === 'perfume' ? (
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                  product.gender === 'Мужской' ? 'bg-blue-500/10 text-blue-600' :
                  product.gender === 'Женский' ? 'bg-pink-500/10 text-pink-600' :
                  'bg-secondary text-foreground/70'
                }`}>
                  {product.gender}
                </span>
              ) : (
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                  product.color_type === 'Порошок' ? 'bg-gray-500/10 text-gray-600' :
                  product.color_type === 'Жидкий' ? 'bg-blue-500/10 text-blue-600' :
                  'bg-green-500/10 text-green-600'
                }`}>
                  {product.color_type}
                </span>
              )}
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className="w-full mt-auto"
            size="md"
          >
            <Icon icon={ShoppingCart} size={18} className="mr-2" />
            {product.in_stock ? 'В корзину' : 'Нет в наличии'}
          </Button>
        </div>
      </Card>
    </Link>
  );
};

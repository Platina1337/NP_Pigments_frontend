import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { PerfumeListItem, Perfume } from '@/types';
import { formatPrice, formatVolume, formatGender, getImageUrl, perfumesApi } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { saveBreadcrumbPath } from '@/lib/swr-hooks';
import { Button, Card, Icon } from '@/components/ui';

interface ProductCardProps {
  perfume: PerfumeListItem;
  breadcrumbPath?: Array<{ label: string; href: string }>;
}

export const ProductCard: React.FC<ProductCardProps> = ({ perfume, breadcrumbPath }) => {
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
      const response = await perfumesApi.getById(perfume.id);
      if (response.data) {
        addItem(response.data as Perfume);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <Link href={`/products/${perfume.id}`} className="group block" onClick={handleProductClick}>
      <Card className="overflow-hidden h-full">
        <div className="relative overflow-hidden aspect-square">
          <img
            src={getImageUrl(perfume.image || '')}
            alt={perfume.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-perfume.svg';
            }}
          />

          {/* Статус наличия */}
          <div className="absolute top-4 left-4">
            {perfume.in_stock ? (
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
              <p className="text-sm text-foreground/70 font-light mb-1">{perfume.brand_name}</p>
              <h3 className="text-lg font-serif font-semibold text-foreground line-clamp-2 leading-tight card-hover-title">
                {perfume.name}
              </h3>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-serif font-bold text-primary">
                {formatPrice(typeof perfume.price === 'string' ? parseFloat(perfume.price) : perfume.price)}
              </span>
              <span className="text-sm text-foreground/70 font-light">
                {formatVolume(typeof perfume.volume_ml === 'string' ? parseInt(perfume.volume_ml) : perfume.volume_ml)}
              </span>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-foreground/70 font-light">{perfume.category_name}</span>
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                perfume.gender === 'M' ? 'bg-blue-500/10 text-blue-600' :
                perfume.gender === 'F' ? 'bg-pink-500/10 text-pink-600' :
                'bg-secondary text-foreground/70'
              }`}>
                {formatGender(perfume.gender)}
              </span>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!perfume.in_stock}
            className="w-full mt-auto"
            size="md"
          >
            <Icon icon={ShoppingCart} size={18} className="mr-2" />
            {perfume.in_stock ? 'В корзину' : 'Нет в наличии'}
          </Button>
        </div>
      </Card>
    </Link>
  );
};

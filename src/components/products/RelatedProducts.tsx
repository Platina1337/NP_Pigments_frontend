'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { usePerfumes, usePigments } from '@/lib/swr-hooks';
import { PerfumeListItem } from '@/types';
import { formatPrice, formatVolume, formatWeight, formatGender, getImageUrl } from '@/lib/api';
import { Button, Card } from '@/components/ui';

interface RelatedProductsProps {
  categoryId: number;
  brandId: number;
  currentProductId: number;
  productType: 'perfume' | 'pigment';
}

interface UniversalProductItem extends PerfumeListItem {
  productType: 'perfume' | 'pigment';
}

const ProductCard: React.FC<{ product: UniversalProductItem }> = ({ product }) => {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative overflow-hidden aspect-square">
          <img
            src={getImageUrl(product.image || '')}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-perfume.svg';
            }}
          />

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            {product.in_stock ? (
              <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full font-medium">
                В наличии
              </span>
            ) : (
              <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full font-medium">
                Нет
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2">
            <p className="text-xs text-primary font-medium uppercase tracking-wide mb-1">
              {product.brand_name}
            </p>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-primary">
              {formatPrice(typeof product.price === 'string' ? parseFloat(product.price) : product.price)}
            </span>
            <span className="text-xs text-gray-600">
              {product.productType === 'perfume'
                ? formatVolume(typeof product.volume_ml === 'string' ? parseInt(product.volume_ml) : product.volume_ml)
                : formatWeight(typeof product.volume_ml === 'string' ? parseInt(product.volume_ml) : product.volume_ml)
              }
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{product.category_name}</span>
            {product.productType === 'perfume' ? (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                product.gender === 'M' ? 'bg-blue-50 text-blue-700' :
                product.gender === 'F' ? 'bg-pink-50 text-pink-700' :
                'bg-gray-50 text-gray-700'
              }`}>
                {formatGender(product.gender)}
              </span>
            ) : (
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-50 text-purple-700">
                Пигмент
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  categoryId,
  brandId,
  currentProductId,
  productType
}) => {
  // Fetch related products from same category and brand based on product type
  const { perfumes: categoryPerfumes, isLoading: categoryPerfumesLoading } = usePerfumes(
    productType === 'perfume' ? { category: categoryId.toString(), limit: '8' } : undefined
  );

  const { perfumes: brandPerfumes, isLoading: brandPerfumesLoading } = usePerfumes(
    productType === 'perfume' ? { brand: brandId.toString(), limit: '8' } : undefined
  );

  const { pigments: categoryPigments, isLoading: categoryPigmentsLoading } = usePigments(
    productType === 'pigment' ? { category: categoryId.toString(), limit: '8' } : undefined
  );

  const { pigments: brandPigments, isLoading: brandPigmentsLoading } = usePigments(
    productType === 'pigment' ? { brand: brandId.toString(), limit: '8' } : undefined
  );

  const isLoading = productType === 'perfume'
    ? (categoryPerfumesLoading || brandPerfumesLoading)
    : (categoryPigmentsLoading || brandPigmentsLoading);

  // Combine and deduplicate products, excluding current product
  const allRelatedProducts = React.useMemo(() => {
    const products = new Map<number, UniversalProductItem>();

    if (productType === 'perfume') {
      // Add category perfumes
      if (categoryPerfumes) {
        categoryPerfumes
          .filter((p: PerfumeListItem) => p.id !== currentProductId)
          .forEach((p: PerfumeListItem) => products.set(p.id, { ...p, productType: 'perfume' }));
      }

      // Add brand perfumes (if not already added)
      if (brandPerfumes) {
        brandPerfumes
          .filter((p: PerfumeListItem) => p.id !== currentProductId && !products.has(p.id))
          .forEach((p: PerfumeListItem) => products.set(p.id, { ...p, productType: 'perfume' }));
      }
    } else if (productType === 'pigment') {
      // For pigments, convert them to UniversalProductItem format
      if (categoryPigments) {
        categoryPigments
          .filter((p: any) => p.id !== currentProductId)
          .forEach((p: any) => {
            const productItem: UniversalProductItem = {
              id: p.id,
              name: p.name,
              brand_name: p.brand_name || p.brand?.name || 'Unknown Brand',
              category_name: p.category_name || p.category?.name || 'Unknown Category',
              price: p.price.toString(),
              volume_ml: p.weight_gr, // Using weight as volume for display
              gender: 'U', // Pigments don't have gender
              in_stock: p.in_stock,
              image: p.image,
              productType: 'pigment'
            };
            products.set(p.id, productItem);
          });
      }

      if (brandPigments) {
        brandPigments
          .filter((p: any) => p.id !== currentProductId && !products.has(p.id))
          .forEach((p: any) => {
            const productItem: UniversalProductItem = {
              id: p.id,
              name: p.name,
              brand_name: p.brand_name || p.brand?.name || 'Unknown Brand',
              category_name: p.category_name || p.category?.name || 'Unknown Category',
              price: p.price.toString(),
              volume_ml: p.weight_gr,
              gender: 'U',
              in_stock: p.in_stock,
              image: p.image,
              productType: 'pigment'
            };
            products.set(p.id, productItem);
          });
      }
    }

    return Array.from(products.values()).slice(0, 6); // Limit to 6 products
  }, [categoryPerfumes, brandPerfumes, categoryPigments, brandPigments, currentProductId, productType]);

  if (isLoading && allRelatedProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (allRelatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Похожие товары
            </h2>
            <p className="text-gray-600">
              Другие ароматы, которые могут вам понравиться
            </p>
          </div>

          <Link href={`/products?category=${categoryId}`}>
            <Button variant="secondary" size="sm">
              Смотреть все
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {allRelatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link href={`/products?category=${categoryId}`}>
            <Button variant="secondary">
              Посмотреть все товары категории
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

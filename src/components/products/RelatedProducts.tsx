'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/free-mode';
import { usePerfumes, usePigments } from '@/lib/swr-hooks';
import { PerfumeListItem } from '@/types';
import { formatPrice, formatVolume, formatWeight, formatGender, getImageUrl } from '@/lib/api';
import { getPriceInfo } from '@/lib/product-pricing';
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
  const { currentPrice, originalPrice, hasDiscount } = getPriceInfo(product as any);
  const formattedCurrentPrice = formatPrice(currentPrice);
  const formattedOriginalPrice = formatPrice(originalPrice);
  const discountPercent =
    hasDiscount && originalPrice > 0
      ? Math.max(1, Math.round((1 - currentPrice / originalPrice) * 100))
      : null;

  return (
    <Link href={`/products/${product.id}`} className="h-full flex">
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full w-full">
        <div className="relative overflow-hidden aspect-square flex-shrink-0">
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
          <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
            {hasDiscount && (
              <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full font-semibold shadow-md">
                {discountPercent ? `-${discountPercent}%` : 'Скидка'}
              </span>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="mb-2 flex-shrink-0">
            <p className="text-xs text-primary font-medium uppercase tracking-wide mb-1 truncate">
              {product.brand_name}
            </p>
            <h3 className="product-card-title text-sm font-semibold text-gray-900 line-clamp-1 truncate leading-tight group-hover:text-primary transition-colors" title={product.name}>
              {product.name}
            </h3>
          </div>

          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">
                {formattedCurrentPrice}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-500 line-through">
                  {formattedOriginalPrice}
                </span>
              )}
            </div>
            <span className="product-card-volume text-xs text-gray-600">
              {product.productType === 'perfume'
                ? formatVolume(typeof product.volume_ml === 'string' ? parseInt(product.volume_ml) : product.volume_ml)
                : formatWeight(typeof product.volume_ml === 'string' ? parseInt(product.volume_ml) : product.volume_ml)
              }
            </span>
          </div>

          <div className="flex items-center justify-between mt-auto flex-shrink-0">
            <span className="product-card-category text-xs text-gray-600">{product.category_name}</span>
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
    productType === 'perfume' ? { category: categoryId.toString(), limit: '12' } : undefined
  );

  const { perfumes: brandPerfumes, isLoading: brandPerfumesLoading } = usePerfumes(
    productType === 'perfume' ? { brand: brandId.toString(), limit: '12' } : undefined
  );

  const { pigments: categoryPigments, isLoading: categoryPigmentsLoading } = usePigments(
    productType === 'pigment' ? { category: categoryId.toString(), limit: '12' } : undefined
  );

  const { pigments: brandPigments, isLoading: brandPigmentsLoading } = usePigments(
    productType === 'pigment' ? { brand: brandId.toString(), limit: '12' } : undefined
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

    return Array.from(products.values());
  }, [categoryPerfumes, brandPerfumes, categoryPigments, brandPigments, currentProductId, productType]);

  if (isLoading && allRelatedProducts.length === 0) {
    return (
      <div className="overflow-hidden">
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
    <div className="overflow-hidden">
      <div>
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
            <button className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 rounded-xl text-blue-700 hover:text-blue-800 transition-all duration-300 hover:shadow-md">
              <span className="text-sm font-medium">Смотреть все</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </Link>
        </div>

        <div className="-mx-4 px-4 sm:px-0 sm:mx-0">
          <Swiper
            modules={[Autoplay, FreeMode]}
            spaceBetween={16}
            slidesPerView={1.4}
            loop={allRelatedProducts.length > 4}
            speed={2000}
            freeMode={{
              enabled: false,
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
              stopOnLastSlide: false,
              waitForTransition: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2.5,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 5,
                spaceBetween: 24,
              },
            }}
            className="!pb-4"
          >
            {allRelatedProducts.map((product) => (
              <SwiperSlide key={product.id} className="!h-auto">
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link href={`/products?category=${categoryId}`}>
            <button className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 rounded-2xl text-blue-700 hover:text-blue-800 transition-all duration-300 hover:shadow-lg font-semibold">
              <span>Посмотреть все товары категории</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import {
  perfumesApi,
  pigmentsApi,
  formatPrice,
  formatVolume,
  formatGender,
  formatWeight,
} from '@/lib/api';
import { Perfume, Pigment } from '@/types/api';
import { ProductExperience } from '@/components/products/ProductExperience';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { ProductInfo } from '@/components/products/ProductInfo';
import { ProductReviews } from '@/components/products/ProductReviews';
import { RelatedProducts } from '@/components/products/RelatedProducts';
import { ProductAdditionalInfo } from '@/components/products/ProductAdditionalInfo';
import { DynamicBreadcrumb } from '@/components/ui/DynamicBreadcrumb';
import Loading from '@/components/Loading';


// Общий тип продукта
type Product = Perfume | Pigment;

// Вспомогательные функции для работы с продуктами
function isPerfume(product: Product): product is Perfume {
  return 'gender' in product && 'volume_ml' in product;
}

function isPigment(product: Product): product is Pigment {
  return 'color_type' in product && 'weight_gr' in product;
}

function getProductType(product: Product): 'perfume' | 'pigment' {
  return isPerfume(product) ? 'perfume' : 'pigment';
}

function getProductDisplayName(product: Product): string {
  return `${product.brand.name} - ${product.name}`;
}

// Это серверный компонент для получения данных
async function getProduct(idOrSlug: string): Promise<Product | null> {
  try {
    const parsedId = parseInt(idOrSlug, 10);
    const maybeSlug = Number.isNaN(parsedId);

    if (!maybeSlug) {
      const perfumeResponse = await perfumesApi.getById(parsedId);
      if (perfumeResponse.data && !perfumeResponse.error) {
        return perfumeResponse.data as Perfume;
      }
      const pigmentResponse = await pigmentsApi.getById(parsedId);
      if (pigmentResponse.data && !pigmentResponse.error) {
        return pigmentResponse.data as Pigment;
      }
    } else {
      const perfumeResponse = await perfumesApi.getBySlug(idOrSlug);
      if (perfumeResponse.data && !perfumeResponse.error) {
        return perfumeResponse.data as Perfume;
      }
      const pigmentResponse = await pigmentsApi.getBySlug(idOrSlug);
      if (pigmentResponse.data && !pigmentResponse.error) {
        return pigmentResponse.data as Pigment;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return {
      title: 'Товар не найден',
      description: 'Товар не найден',
    };
  }

  const productType = getProductType(product);
  const title = `${product.brand.name} — ${product.name}`;
  const description = product.description?.slice(0, 160) || `Товар ${title}`;
  const image = product.image || (product.images && product.images[0]?.image);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website', // Next metadata OG type union: use website for совместимости
      images: image ? [{ url: image, alt: title }] : [],
    },
    alternates: {
      canonical: `/products/${product.slug || id}`,
    },
  };
}

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  // Для отладки: показываем информацию о запросе
  console.log('ProductPage rendered with params:', params);
  console.log('Product result:', product);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Продукт не найден</h1>
          <p className="text-gray-600 mb-2">Продукт с ID "{resolvedParams.id}" не найден.</p>
          <p className="text-sm text-gray-500 mb-4">Проверьте консоль браузера для отладочной информации.</p>
          <a href="/products" className="text-primary hover:underline">
            Вернуться к каталогу
          </a>
        </div>
      </div>
    );
  }

  const productType = getProductType(product);

  return (
    <div className="min-h-screen bg-[var(--brand-background)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: `${product.brand.name} ${product.name}`,
            image: product.image || (product.images && product.images[0]?.image) || undefined,
            description: product.description,
            sku: (product as any).sku || undefined,
            brand: {
              '@type': 'Brand',
              name: product.brand.name,
            },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'RUB',
              price: product.final_price || product.price,
              availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
          }),
        }}
      />
      <div className="mx-auto max-w-7xl px-0 py-8 sm:px-5 sm:py-10 lg:px-8">
        <div className="mb-8 sm:mb-10">
          <DynamicBreadcrumb product={product} />
        </div>

        <ProductExperience product={product} productType={productType} />

        <ProductAdditionalInfo product={product} productType={productType} />

        <section className="mt-10 sm:mt-14">
          <div className="rounded-[24px] sm:rounded-[32px] border-0 bg-transparent p-0 shadow-none sm:border sm:border-slate-200 sm:bg-white/85 sm:p-8 sm:shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-transparent sm:dark:bg-slate-900/70">
            <Suspense fallback={<Loading />}>
              <RelatedProducts
                categoryId={product.category.id}
                brandId={product.brand.id}
                currentProductId={product.id}
                productType={productType}
              />
            </Suspense>
          </div>
        </section>

        <section id="reviews" className="mt-10 sm:mt-14">
          <Suspense fallback={<Loading />}>
            <ProductReviews productId={product.id} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

/**
 * Легаси-версия страницы. Оставлена по просьбе заказчика для обратной совместимости.
 * Используйте LegacyProductPageView(product) при необходимости откатиться к предыдущему UI.
 */
function LegacyProductPageView({ product }: { product: Product }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <DynamicBreadcrumb product={product} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <ProductImageGallery product={product} />
          </div>
          <div className="space-y-8">
            <ProductInfo product={product} />
          </div>
        </div>

        <div className="mb-16">
          <LegacyProductDetailsTabs product={product} />
        </div>

        <div className="mb-16">
          <Suspense fallback={<Loading />}>
            <ProductReviews productId={product.id} />
          </Suspense>
        </div>

        <div className="mb-16">
          <Suspense fallback={<Loading />}>
            <RelatedProducts
              categoryId={product.category.id}
              brandId={product.brand.id}
              currentProductId={product.id}
              productType={getProductType(product)}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function LegacyProductDetailsTabs({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button className="px-8 py-4 text-sm font-medium border-b-2 border-primary text-primary">
            Описание
          </button>
        </nav>
      </div>

      <div className="p-8">{product.description}</div>
    </div>
  );
}

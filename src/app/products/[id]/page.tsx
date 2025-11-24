import React from 'react';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { perfumesApi, pigmentsApi, formatPrice, formatVolume, formatGender, getImageUrl } from '@/lib/api';
import { Perfume, Pigment } from '@/types/api';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { ProductInfo } from '@/components/products/ProductInfo';
import { ProductReviews } from '@/components/products/ProductReviews';
import { RelatedProducts } from '@/components/products/RelatedProducts';
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
async function getProduct(id: string): Promise<Product | null> {
  try {
    console.log('Getting product with id:', id);
    const parsedId = parseInt(id);
    console.log('Parsed id:', parsedId);

    if (isNaN(parsedId)) {
      console.error('Invalid ID:', id);
      return null;
    }

    // Сначала пытаемся найти среди парфюмов
    console.log('Trying to find perfume...');
    const perfumeResponse = await perfumesApi.getById(parsedId);
    console.log('Perfume API response:', perfumeResponse);

    if (perfumeResponse.data && !perfumeResponse.error) {
      console.log('Found perfume:', perfumeResponse.data);
      return perfumeResponse.data as Perfume;
    }

    // Если парфюм не найден, ищем среди пигментов
    console.log('Perfume not found, trying pigments...');
    const pigmentResponse = await pigmentsApi.getById(parsedId);
    console.log('Pigment API response:', pigmentResponse);

    if (pigmentResponse.data && !pigmentResponse.error) {
      console.log('Found pigment:', pigmentResponse.data);
      return pigmentResponse.data as Pigment;
    }

    // Если ничего не найдено
    console.error('Product not found in both perfumes and pigments');
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
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


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <DynamicBreadcrumb product={product} />
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <ProductImageGallery product={product} />
          </div>

          {/* Product Information */}
          <div className="space-y-8">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-16">
          <ProductDetailsTabs product={product} />
        </div>

        {/* Reviews Section */}
        <div className="mb-16">
          <Suspense fallback={<Loading />}>
            <ProductReviews productId={product.id} />
          </Suspense>
        </div>

        {/* Related Products */}
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

// Product Details Tabs Component
function ProductDetailsTabs({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button className="px-8 py-4 text-sm font-medium border-b-2 border-primary text-primary">
            Описание
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {product.description}
      </div>
    </div>
  );
}

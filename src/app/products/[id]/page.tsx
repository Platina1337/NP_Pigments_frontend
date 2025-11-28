import React from 'react';
import { Suspense } from 'react';

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

  const productType = getProductType(product);

  return (
    <div className="min-h-screen bg-[var(--brand-background)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <DynamicBreadcrumb product={product} />
        </div>

        <ProductExperience product={product} productType={productType} />

        <div className="mt-12 space-y-10">
          <ProductNarrative product={product} productType={productType} />
          <ProductSignatureSpecs product={product} productType={productType} />
        </div>

        <section id="reviews" className="mt-14">
          <div className="rounded-[32px] border border-slate-200 dark:border-white/60 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70">
            <Suspense fallback={<Loading />}>
              <ProductReviews productId={product.id} />
            </Suspense>
          </div>
        </section>

        <section className="mt-14">
          <div className="rounded-[32px] border border-slate-200 dark:border-white/60 bg-white/90 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70">
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
      </div>
    </div>
  );
}

function ProductNarrative({
  product,
  productType,
}: {
  product: Product;
  productType: 'perfume' | 'pigment';
}) {
  const storyParagraphs =
    product.description?.split(/\n+/).filter(Boolean) ?? [];
  const heroText =
    storyParagraphs[0] ||
    'Коллекция NP Academy создается вручную небольшими партиями, чтобы каждая нота звучала индивидуально.';
  const supportingText =
    storyParagraphs[1] ||
    'Мы уделяем внимание каждой детали — от композиции до упаковки — чтобы вы чувствовали заботу уже с первого прикосновения.';

  const insightCards = [
    { label: 'Категория', value: product.category.name },
    {
      label: 'Происхождение',
      value: product.brand.country || 'Европа',
    },
    {
      label: 'Статус',
      value: product.in_stock ? 'В наличии' : 'Доступен под заказ',
    },
  ];

  const services = [
    {
      title: 'Консьерж сервис',
      text: 'Персональный подбор аромата или оттенка по вашим предпочтениям.',
    },
    {
      title: 'Поддержка 24/7',
      text: 'Всегда на связи в мессенджерах и соцсетях — отвечаем в течение 10 минут.',
    },
    {
      title: 'Подарочное оформление',
      text: 'По запросу упакуем заказ в премиальную коробку и добавим персональную открытку.',
    },
  ];

  return (
    <section className="rounded-[32px] border border-slate-200 dark:border-white/60 bg-white/85 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            История
          </p>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
            {productType === 'perfume'
              ? 'Ритуал раскрытия аромата'
              : 'Философия цвета и текстуры'}
          </h2>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {heroText}
          </p>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {supportingText}
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {insightCards.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-emerald-50/80 to-white p-6 dark:border-white/10 dark:from-emerald-400/10 dark:to-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-200">
            Сервис NP
          </p>
          <div className="space-y-4">
            {services.map(({ title, text }) => (
              <div key={title}>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {title}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductSignatureSpecs({
  product,
  productType,
}: {
  product: Product;
  productType: 'perfume' | 'pigment';
}) {
  const specs = isPerfume(product)
    ? [
        { label: 'Гендер', value: formatGender(product.gender) },
        { label: 'Объем', value: formatVolume(product.volume_ml) },
        { label: 'Концентрация', value: product.concentration },
        {
          label: 'Ноты',
          value: [
            product.top_notes,
            product.heart_notes,
            product.base_notes,
          ]
            .filter(Boolean)
            .join(' · ') || 'Авторская композиция',
        },
      ]
    : [
        {
          label: 'Текстура',
          value: formatPigmentTexture(product as Pigment),
        },
        {
          label: 'Назначение',
          value: formatPigmentApplication(product as Pigment),
        },
        {
          label: 'Вес',
          value: formatWeight((product as Pigment).weight_gr),
        },
        {
          label: 'Категория',
          value: product.category.name,
        },
      ];

  const logistics = [
    {
      label: 'Доставка по России',
      value: '1‑3 дня. Передаем трек сразу после отправки.',
    },
    {
      label: 'Оплата',
      value: 'Банковские карты, рассрочка, счет для юрлиц.',
    },
    {
      label: 'Гарантии',
      value: 'Только оригинальная продукция. Возврат/обмен 30 дней.',
    },
    {
      label: 'Средний чек заказа',
      value: formatPrice(
        typeof product.price === 'number'
          ? product.price
          : parseFloat(product.price as unknown as string),
      ),
    },
  ];

  return (
    <section className="rounded-[32px] border border-slate-200 dark:border-white/60 bg-white/85 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Технический профиль
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {productType === 'perfume'
              ? 'Что важно знать про аромат'
              : 'Что важно знать о пигменте'}
          </h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {specs.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            С заботой о клиенте
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            Организуем всё за вас
          </h3>
          <div className="mt-6 space-y-4">
            {logistics.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {label}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function formatPigmentTexture(product: Pigment): string {
  const map: Record<Pigment['color_type'], string> = {
    powder: 'Порошок',
    liquid: 'Жидкий',
    paste: 'Паста',
  };
  return map[product.color_type] ?? product.color_type;
}

function formatPigmentApplication(product: Pigment): string {
  const map: Record<Pigment['application_type'], string> = {
    cosmetics: 'Косметика',
    art: 'Художественные проекты',
    industrial: 'Индустриальные задачи',
    food: 'Пищевые продукты',
  };
  return map[product.application_type] ?? product.application_type;
}

/**
 * Легаси-версия страницы. Оставлена по просьбе заказчика для обратной совместимости.
 * Используйте LegacyProductPageView(product) при необходимости откатиться к предыдущему UI.
 */
export function LegacyProductPageView({ product }: { product: Product }) {
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

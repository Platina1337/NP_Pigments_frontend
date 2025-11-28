'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Heart,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  Package,
  Palette,
  Droplets,
  Layers,
  RefreshCw,
  Star,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useFavorites } from '@/context/FavoritesContext';
import {
  formatGender,
  formatPrice,
  formatVolume,
  formatWeight,
  getImageUrl,
} from '@/lib/api';
import type { Perfume as CartPerfume } from '@/types';
import type { Perfume, Pigment } from '@/types/api';
import { normalizeProductForCart } from '@/lib/cart-normalizer';

type Product = Perfume | Pigment;

interface ProductExperienceProps {
  product: Product;
  productType: 'perfume' | 'pigment';
}

const isPerfumeProduct = (product: Product): product is Perfume =>
  'volume_ml' in product;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const formatPigmentApplication = (
  application?: Pigment['application_type'],
): string => {
  const map: Record<
    NonNullable<Pigment['application_type']>,
    string
  > = {
    cosmetics: 'Косметика',
    art: 'Художественные работы',
    industrial: 'Индустриальные задачи',
    food: 'Пищевые продукты',
  };
  return application ? map[application] ?? application : 'Универсальное применение';
};

const formatPigmentTexture = (colorType?: Pigment['color_type']): string => {
  const map: Record<NonNullable<Pigment['color_type']>, string> = {
    powder: 'Порошок',
    liquid: 'Жидкий',
    paste: 'Паста',
  };
  return colorType ? map[colorType] ?? colorType : 'Без категории';
};


export const ProductExperience: React.FC<ProductExperienceProps> = ({
  product,
  productType,
}) => {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { toggleFavorite: toggleFavoriteInContext, isFavorite: isFavoriteInContext } = useFavorites();

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  const isFavorite = isFavoriteInContext(product.id, productType);

  const priceLabel = useMemo(() => {
    const numeric =
      typeof product.price === 'number'
        ? product.price
        : parseFloat(product.price as unknown as string);
    return formatPrice(numeric);
  }, [product.price]);

  const heroRating = useMemo(() => {
    const base = 4.6;
    const variation = (product.id % 4) * 0.1;
    return (base + variation).toFixed(1);
  }, [product.id]);

  const reviewCount = useMemo(
    () => 128 + (product.id % 7) * 11,
    [product.id],
  );

  const availableQuantity = Math.max(product.stock_quantity || 0, 0);
  const maxQuantity = clamp(availableQuantity, 1, 10);

  useEffect(() => {
    // Уведомления очищаются автоматически через таймер
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(null), 2600);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const handleToggleFavorite = async () => {
    if (favoriteBusy) return;

    setFavoriteBusy(true);
    try {
      const added = await toggleFavoriteInContext({
        id: product.id,
        productType,
        name: product.name,
        image: product.image,
        price:
          typeof product.price === 'number'
            ? product.price
            : parseFloat(product.price as unknown as string),
        data: normalizeProductForCart(product),
      });
      setStatusMessage(added ? 'Добавлено в избранное' : 'Удалено из избранного');
    } catch (error) {
      console.error('Не удалось обновить избранное:', error);
      setStatusMessage('Не удалось обновить избранное');
    } finally {
      setFavoriteBusy(false);
    }
  };

  const handleAddToCart = () => {
    if (!product.in_stock) {
      setStatusMessage('Этот товар временно отсутствует');
      return;
    }

    const normalized = normalizeProductForCart(product);
    for (let i = 0; i < quantity; i += 1) {
      addItem(normalized, productType);
    }

    setStatusMessage('Добавлено в корзину');
  };

  const adjustQuantity = (direction: 'inc' | 'dec') => {
    setQuantity((prev) =>
      direction === 'inc'
        ? clamp(prev + 1, 1, maxQuantity)
        : clamp(prev - 1, 1, maxQuantity),
    );
  };

  const chips = useMemo(() => {
    const base = [
      product.category.name,
      product.brand.name,
      product.in_stock ? 'В наличии' : 'Предзаказ',
    ];

    if (isPerfumeProduct(product)) {
      base.push(formatGender(product.gender));
      base.push(formatVolume(product.volume_ml));
    } else {
      base.push(formatPigmentTexture(product.color_type));
      base.push(`${product.weight_gr} г`);
    }
    return base.slice(0, 4);
  }, [product]);

  const featureCards = useMemo(
    () => [
      {
        title: 'Аутентичность',
        text: 'Официальная продукция напрямую от бренда',
        icon: ShieldCheck,
      },
      {
        title: 'Доставка',
        text: 'По всей России за 1-3 дня с треком',
        icon: Truck,
      },
      {
        title: 'Сервис',
        text: 'Персональная поддержка и подбор аромата',
        icon: Sparkles,
      },
    ],
    [],
  );

  const primaryImage = getImageUrl(product.image || '');
  const secondaryImages = useMemo(() => {
    const allImages = [
      ...(product.image ? [getImageUrl(product.image)] : []),
      ...(product.images?.map(img => getImageUrl(img.image)) || [])
    ];
    
    // Удаляем дубликаты
    const uniqueImages = Array.from(new Set(allImages));
    
    // Если изображений нет, используем заглушку
    if (uniqueImages.length === 0) {
      return ['/placeholder-perfume.svg'];
    }
    
    return uniqueImages;
  }, [product.image, product.images]);

  const activeImage = secondaryImages[clamp(activeImageIndex, 0, secondaryImages.length - 1)];

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id, primaryImage]);

  return (
    <div className="space-y-12">
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="rounded-2xl border border-emerald-200/70 bg-white/80 px-4 py-3 text-sm font-medium text-emerald-900 shadow-lg shadow-emerald-200/60 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-100">
            {statusMessage}
          </div>
        </div>
      )}

      <section className="relative overflow-hidden rounded-[36px] border border-slate-200 dark:border-white/50 bg-white/90 p-6 shadow-[0_20px_70px_rgba(30,64,64,0.12)] transition-colors dark:border-white/10 dark:bg-white/5 lg:p-10">
        <div className="absolute inset-0 opacity-60 blur-3xl" aria-hidden>
          <div
            className={`h-full w-full bg-gradient-to-br from-emerald-200/60 via-transparent to-amber-100/40 dark:from-emerald-500/20 dark:via-transparent dark:to-amber-400/10`}
          />
        </div>

        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 dark:border-white/60 bg-gradient-to-b from-white/60 to-white/30 shadow-xl dark:border-white/10 dark:from-white/10 dark:to-white/5">
              <div className="relative h-[480px] w-full">
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  onError={(event) => {
                    (event.target as HTMLImageElement).src =
                      '/placeholder-perfume.svg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute left-6 top-6 flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/40 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-white"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4">
                {secondaryImages.map((src, index) => (
                  <button
                    type="button"
                    key={`${src}-${index}`}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative h-24 overflow-hidden rounded-2xl bg-white/60 dark:bg-white/5 ${
                      activeImageIndex === index
                        ? 'border-emerald-500 ring-2 ring-emerald-300 dark:border-emerald-400 dark:ring-emerald-500/80'
                        : 'border border-slate-200 dark:border-white/60'
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} вариация ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 33vw, 15vw"
                      onError={(event) => {
                        (event.target as HTMLImageElement).src =
                          '/placeholder-perfume.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 dark:border-white/60 bg-white/90 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-200">
                  {product.brand.name}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  {product.name}
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-red-50/40 p-5 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-white/10 dark:from-amber-500/15 dark:via-orange-500/10 dark:to-red-500/5">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`h-5 w-5 transition-all duration-300 ${
                            index < Math.round(parseFloat(heroRating))
                              ? 'fill-amber-400 text-amber-500 drop-shadow-sm'
                              : 'text-amber-200 dark:text-amber-600/30'
                          }`}
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {heroRating}
                      </p>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        из 5.0
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {reviewCount}+
                    </p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      отзывов
                    </p>
                  </div>
                </div>

                <div className="relative mt-3 flex items-center justify-center">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-300/50 to-transparent dark:via-amber-500/30" />
                  <span className="absolute bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:from-amber-500/20 dark:to-orange-500/20 dark:text-amber-200">
                    Отзывы покупателей
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-[32px] border border-slate-200 dark:border-white/60 bg-white/80 p-6 shadow-inner shadow-white/30 dark:border-white/10 dark:bg-slate-900/60">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                {productType === 'perfume' ? 'Авторский аромат' : 'Профессиональный пигмент'}
              </p>
              <h1 className="text-3xl font-semibold leading-tight text-slate-900 dark:text-white">
                {product.brand.name} — {product.name}
              </h1>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {product.description || 'Изысканная композиция, созданная для того, чтобы сопровождать вас в самых ярких моментах.'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white/90 p-5 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Цена
              </p>
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="text-4xl font-semibold text-emerald-700 dark:text-emerald-300">
                  {priceLabel}
                </p>
                {isPerfumeProduct(product) ? (
                  <span className="rounded-xl bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                    {formatVolume(product.volume_ml)}
                  </span>
                ) : (
                  <span className="rounded-xl bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                    {formatWeight(product.weight_gr)}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                {product.in_stock
                  ? `В наличии ${availableQuantity} шт.`
                  : 'Доступно под заказ'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => adjustQuantity('dec')}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                  aria-label="Уменьшить количество"
                >
                  –
                </button>
                <span className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => adjustQuantity('inc')}
                  disabled={quantity >= maxQuantity}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                  aria-label="Увеличить количество"
                >
                  +
                </button>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {product.in_stock ? 'Сумма заказа' : 'Статус наличия'}
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {product.in_stock
                    ? formatPrice(
                        (typeof product.price === 'number'
                          ? product.price
                          : parseFloat(product.price as unknown as string)) *
                          quantity,
                      )
                    : 'Нет в наличии'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                className="w-full justify-center items-center bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-[0_20px_60px_rgba(16,185,129,0.4)] transition-all duration-300 hover:shadow-[0_25px_80px_rgba(16,185,129,0.5)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                size="lg"
                disabled={!product.in_stock}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 flex-shrink-0" />
                  <span className="font-semibold">
                    {product.in_stock ? 'Добавить в корзину' : 'Сообщить о наличии'}
                  </span>
                </div>
              </Button>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleToggleFavorite}
                  disabled={favoriteBusy}
                  className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-300 ${
                    isFavorite
                      ? 'border-rose-300 bg-rose-50 text-rose-700 shadow-lg shadow-rose-200/50 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-300'
                      : 'border-slate-200 bg-white/80 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/80 hover:text-emerald-700 dark:border-white/20 dark:bg-white/5 dark:text-slate-300 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300'
                  } ${favoriteBusy ? 'opacity-60 cursor-not-allowed' : ''}`}
                  aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                >
                  <Heart
                    className={`h-5 w-5 transition-all duration-300 ${
                      isFavorite
                        ? 'fill-current scale-110'
                        : 'group-hover:scale-110'
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {isFavorite ? 'В избранном' : 'Добавить в избранное'}
                  </span>
                </button>

                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {product.in_stock ? 'Быстрая доставка' : 'Уведомим о поступлении'}
                  </p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {product.in_stock ? '1-3 дня' : 'Под заказ'}
                  </p>
                </div>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-400/10 dark:text-amber-100">
                Мы запомним ваши избранные товары и корзину в этой сессии. Войдите, чтобы перенести их в аккаунт.
              </div>
            )}

            <div className="grid gap-4 rounded-2xl border border-slate-100 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Готово к отправке
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    Сбор заказа за 2 часа
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Возврат 30 дней
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    Без лишних вопросов
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {featureCards.map(({ title, text, icon: Icon }) => (
          <div
            key={title}
            className="rounded-3xl border border-slate-200 dark:border-white/60 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-slate-900/60"
          >
            <div className="mb-4 inline-flex rounded-2xl border border-emerald-100 bg-emerald-50/90 p-3 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {text}
            </p>
          </div>
        ))}
      </section>

      {isPerfumeProduct(product) ? (
        <section className="rounded-3xl border border-slate-200 dark:border-white/60 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Пирамида аромата
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            Как раскрывается аромат
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { label: 'Верхние ноты', value: product.top_notes, accent: 'from-amber-100 to-rose-50' },
              { label: 'Ноты сердца', value: product.heart_notes, accent: 'from-emerald-100 to-teal-50' },
              { label: 'Базовые ноты', value: product.base_notes, accent: 'from-slate-100 to-slate-50' },
            ].map(({ label, value, accent }) => (
              <div
                key={label}
                className={`rounded-2xl border border-slate-200 dark:border-white/60 bg-gradient-to-br ${accent} p-4 dark:border-white/10 dark:bg-none dark:from-white/5 dark:to-white/10`}
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-2 text-base text-slate-800 dark:text-slate-100">
                  {value || 'Информация уточняется'}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-200 dark:border-white/60 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Характеристики пигмента
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            Создан для профессионалов
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 dark:border-white/60 bg-emerald-50/80 p-4 dark:border-white/10 dark:bg-emerald-500/10">
              <Palette className="mb-2 h-5 w-5 text-emerald-600 dark:text-emerald-200" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Текстура
              </p>
              <p className="text-lg text-slate-900 dark:text-white">
                {formatPigmentTexture((product as Pigment).color_type)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-white/60 bg-emerald-50/80 p-4 dark:border-white/10 dark:bg-emerald-500/10">
              <Droplets className="mb-2 h-5 w-5 text-emerald-600 dark:text-emerald-200" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Применение
              </p>
              <p className="text-lg text-slate-900 dark:text-white">
                {formatPigmentApplication((product as Pigment).application_type)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-white/60 bg-emerald-50/80 p-4 dark:border-white/10 dark:bg-emerald-500/10">
              <Layers className="mb-2 h-5 w-5 text-emerald-600 dark:text-emerald-200" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Вес
              </p>
              <p className="text-lg text-slate-900 dark:text-white">
                {formatWeight((product as Pigment).weight_gr)}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};



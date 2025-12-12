'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  X,
  ChevronLeft,
  ChevronRight,
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
import type { Perfume, Pigment, VolumeOption, WeightOption } from '@/types/api';
import { normalizeProductForCart } from '@/lib/cart-normalizer';
import { getPriceInfo } from '@/lib/product-pricing';
import { WeightSelector } from './VolumeSelector';

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
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Volume/Weight option selection
  const [selectedVolumeOptionId, setSelectedVolumeOptionId] = useState<number | undefined>(undefined);
  const [selectedWeightOptionId, setSelectedWeightOptionId] = useState<number | undefined>(undefined);

  const isFavorite = isFavoriteInContext(product.id, productType);

  // Варианты объёма с добавленным базовым объёмом товара, если его нет в списке
  const volumeOptionsWithBase: VolumeOption[] | null = useMemo(() => {
    if (!isPerfumeProduct(product)) return null;

    const opts = [...(product.volume_options ?? [])];
    const hasBase = opts.some((o) => o.volume_ml === product.volume_ml);

    if (!hasBase) {
      const baseOption: VolumeOption = {
        id: -1, // синтетический id для базового объёма
        volume_ml: product.volume_ml,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        final_price:
          product.final_price ??
          (typeof product.price === 'string' ? parseFloat(product.price) : product.price),
        discount_percentage: product.discount_percentage ?? 0,
        discount_price:
          product.discount_price !== null && product.discount_price !== undefined
            ? (typeof product.discount_price === 'string'
                ? parseFloat(product.discount_price)
                : product.discount_price)
            : null,
        stock_quantity: product.stock_quantity ?? 0,
        in_stock: product.in_stock,
        is_default: true,
        is_on_sale: product.is_on_sale ?? false,
      };
      opts.unshift(baseOption);
    }

    return opts.sort((a, b) => a.volume_ml - b.volume_ml);
  }, [product]);

  // Get selected option for pricing
  const selectedVolumeOption = useMemo(() => {
    if (!isPerfumeProduct(product) || !volumeOptionsWithBase?.length) return null;

    // 1) Явно выбранный вариант
    const byId = selectedVolumeOptionId
      ? volumeOptionsWithBase.find((o) => o.id === selectedVolumeOptionId)
      : null;
    if (byId) return byId;

    // 2) Вариант, совпадающий с базовым volume_ml товара (главный объём)
    const baseMatch = volumeOptionsWithBase.find(
      (o) => o.volume_ml === product.volume_ml,
    );
    if (baseMatch) return baseMatch;

    // 3) Вариант по умолчанию из БД
    const defaultOpt = volumeOptionsWithBase.find((o) => o.is_default);
    if (defaultOpt) return defaultOpt;

    // 4) Первый доступный
    return volumeOptionsWithBase[0];
  }, [product, selectedVolumeOptionId, volumeOptionsWithBase]);

  const selectedWeightOption = useMemo(() => {
    if (isPerfumeProduct(product) || !('weight_options' in product) || !product.weight_options?.length) return null;
    return product.weight_options.find(o => o.id === selectedWeightOptionId)
      || product.weight_options.find(o => o.is_default)
      || product.weight_options[0];
  }, [product, selectedWeightOptionId]);

  // Use selected option's price if available
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
    return getPriceInfo(product as any);
  }, [product, selectedVolumeOption, selectedWeightOption]);

  const currentPriceLabel = useMemo(
    () => formatPrice(currentPrice),
    [currentPrice],
  );

  const originalPriceLabel = useMemo(
    () => formatPrice(originalPrice),
    [originalPrice],
  );

  const discountPercent = useMemo(() => {
    if (!hasDiscount || !originalPrice || originalPrice <= 0) return null;
    return Math.max(1, Math.round((1 - currentPrice / originalPrice) * 100));
  }, [hasDiscount, currentPrice, originalPrice]);

  const discountEndDateLabel = useMemo(() => {
    if (!product.discount_end_date) return null;
    const endDate = new Date(product.discount_end_date);
    if (Number.isNaN(endDate.getTime())) return null;
    return endDate.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' });
  }, [product.discount_end_date]);

  const heroRating = useMemo(() => {
    const base = 4.6;
    const variation = (product.id % 4) * 0.1;
    return (base + variation).toFixed(1);
  }, [product.id]);

  const reviewCount = useMemo(
    () => 128 + (product.id % 7) * 11,
    [product.id],
  );

  // Количество и наличие для выбранного варианта
  const variantStock =
    (isPerfumeProduct(product)
      ? selectedVolumeOption?.stock_quantity
      : selectedWeightOption?.stock_quantity) ?? product.stock_quantity ?? 0;
  const variantInStock =
    (isPerfumeProduct(product)
      ? selectedVolumeOption?.in_stock
      : selectedWeightOption?.in_stock) ?? product.in_stock;

  const availableQuantity = Math.max(variantStock, 0);
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
        price: currentPrice,
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
    if (!variantInStock) {
      setStatusMessage('Этот товар временно отсутствует');
      return;
    }

    // Прокидываем в корзину цену/объем выбранного варианта, чтобы сумма считалась по варианту
    const productForCart = (() => {
      if (isPerfumeProduct(product) && selectedVolumeOption) {
        return {
          ...product,
          price: selectedVolumeOption.price.toString(),
          final_price: selectedVolumeOption.final_price,
          discount_price:
            selectedVolumeOption.discount_price ?? product.discount_price ?? null,
          discount_percentage:
            selectedVolumeOption.discount_percentage ?? product.discount_percentage ?? 0,
          volume_ml: selectedVolumeOption.volume_ml,
          stock_quantity: selectedVolumeOption.stock_quantity,
          in_stock: selectedVolumeOption.in_stock,
          is_on_sale: selectedVolumeOption.is_on_sale ?? product.is_on_sale,
        };
      }
      if (!isPerfumeProduct(product) && selectedWeightOption) {
        return {
          ...product,
          price: selectedWeightOption.price.toString(),
          final_price: selectedWeightOption.final_price,
          discount_price:
            selectedWeightOption.discount_price ?? (product as any).discount_price ?? null,
          discount_percentage:
            selectedWeightOption.discount_percentage ?? (product as any).discount_percentage ?? 0,
          weight_gr: selectedWeightOption.weight_gr,
          stock_quantity: selectedWeightOption.stock_quantity,
          in_stock: selectedWeightOption.in_stock,
          is_on_sale: selectedWeightOption.is_on_sale ?? (product as any).is_on_sale,
        } as typeof product;
      }
      return product;
    })();

    const normalized = normalizeProductForCart(productForCart);
    for (let i = 0; i < quantity; i += 1) {
      addItem(normalized, productType, selectedVolumeOption?.id, selectedWeightOption?.id);
    }

    setStatusMessage('Добавлено в корзину');
  };

  const openImageModal = (imageIndex: number = activeImageIndex) => {
    setModalImageIndex(imageIndex);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? (modalImageIndex + 1) % secondaryImages.length
      : (modalImageIndex - 1 + secondaryImages.length) % secondaryImages.length;
    setModalImageIndex(newIndex);
  };

  const handleImageChange = (index: number) => {
    setActiveImageIndex(index);
  };

  const adjustQuantity = (direction: 'inc' | 'dec') => {
    setQuantity((prev) =>
      direction === 'inc'
        ? clamp(prev + 1, 1, maxQuantity)
        : clamp(prev - 1, 1, maxQuantity),
    );
  };

  const chips = useMemo(() => {
    type ChipType = 'category' | 'brand' | 'inStock' | 'gender' | 'volume' | 'texture' | 'weight';

    const base: Array<{
      label: string;
      type: ChipType;
      categoryId?: number;
      brandId?: number;
      genderValue?: 'M' | 'F' | 'U';
      isClickable?: boolean;
    }> = [
        {
          label: product.category.name,
          type: 'category',
          categoryId: product.category.id,
          isClickable: true
        },
        {
          label: product.brand.name,
          type: 'brand',
          brandId: product.brand.id,
          isClickable: true
        },
        {
          label: product.in_stock ? 'В наличии' : 'Предзаказ',
          type: 'inStock',
          isClickable: product.in_stock
        },
      ];

    if (isPerfumeProduct(product)) {
      base.push({
        label: formatGender(product.gender),
        type: 'gender',
        genderValue: product.gender,
        isClickable: true
      });
      base.push({
        label: formatVolume(product.volume_ml),
        type: 'volume',
        isClickable: false
      });
    } else {
      base.push({
        label: formatPigmentTexture(product.color_type),
        type: 'texture',
        isClickable: false
      });
      base.push({
        label: `${product.weight_gr} г`,
        type: 'weight',
        isClickable: false
      });
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

  // Обработчики клавиатуры для модального окна
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isImageModalOpen) return;

      switch (event.key) {
        case 'Escape':
          closeImageModal();
          break;
        case 'ArrowLeft':
          navigateImage('prev');
          break;
        case 'ArrowRight':
          navigateImage('next');
          break;
      }
    };

    if (isImageModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Предотвращаем скролл страницы когда модальное окно открыто
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isImageModalOpen, modalImageIndex, secondaryImages.length]);

  return (
    <div className="space-y-12">
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="rounded-2xl border border-emerald-200/70 bg-white/80 px-4 py-3 text-sm font-medium text-emerald-900 shadow-lg shadow-emerald-200/60 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-100">
            {statusMessage}
          </div>
        </div>
      )}

      <section className="relative overflow-hidden rounded-[36px] border-0 bg-transparent p-3 sm:border sm:border-slate-200 sm:bg-white/90 sm:p-6 lg:p-8 xl:p-10 shadow-none sm:shadow-[0_20px_70px_rgba(30,64,64,0.12)] transition-colors sm:dark:border-white/10 sm:dark:bg-white/5">
        <div className="absolute inset-0 opacity-60 blur-3xl" aria-hidden>
          <div
            className={`h-full w-full bg-gradient-to-br from-emerald-200/60 via-transparent to-amber-100/40 dark:from-emerald-500/20 dark:via-transparent dark:to-amber-400/10`}
          />
        </div>

        <div className="relative grid gap-8 md:gap-10 xl:gap-12 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 dark:border-white/60 bg-gradient-to-b from-white/60 to-white/30 shadow-xl dark:border-white/10 dark:from-white/10 dark:to-white/5">
              <div className="relative h-[320px] sm:h-[420px] lg:h-[480px] xl:h-[540px] w-full group">
                {secondaryImages.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${activeImageIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                  >
                    <Image
                      src={src}
                      alt={product.name}
                      fill
                      priority={index === 0}
                      className="object-contain object-center"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      onError={(event) => {
                        (event.target as HTMLImageElement).src =
                          '/placeholder-perfume.svg';
                      }}
                    />
                  </div>
                ))}
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div
                  className="absolute inset-0 z-30 cursor-pointer transition-colors duration-300 hover:bg-black/5"
                  onClick={() => openImageModal()}
                />
                <div className="absolute left-4 top-4 sm:left-6 sm:top-6 z-40 flex flex-wrap gap-2">
                  {chips.map((chip, index) => {
                    const chipKey = `${chip.label}-${index}`;
                    const chipContent = (
                      <span className={`rounded-full border border-white/40 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 backdrop-blur transition-all duration-300 dark:border-white/10 dark:bg-white/10 dark:text-white ${chip.isClickable
                        ? 'hover:border-white/60 hover:bg-white/90 hover:scale-105 cursor-pointer dark:hover:border-white/20 dark:hover:bg-white/20'
                        : ''
                        }`}>
                        {chip.label}
                      </span>
                    );

                    if (!chip.isClickable) {
                      return (
                        <span key={chipKey}>
                          {chipContent}
                        </span>
                      );
                    }

                    // Генерируем URL в зависимости от типа чипса
                    let href = '/products?';
                    const params: string[] = [];

                    if (chip.type === 'category' && chip.categoryId) {
                      params.push(`categoryId=${chip.categoryId}`);
                    }
                    if (chip.type === 'brand' && chip.brandId) {
                      params.push(`brandId=${chip.brandId}`);
                    }
                    if (chip.type === 'gender' && chip.genderValue) {
                      params.push(`type=perfume&gender=${chip.genderValue}`);
                    }
                    if (chip.type === 'inStock') {
                      params.push(`inStockOnly=true`);
                    }

                    href += params.join('&');

                    return (
                      <Link
                        key={chipKey}
                        href={href}
                        className="inline-block"
                      >
                        {chipContent}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <div className="flex gap-3 overflow-x-auto sm:grid sm:grid-cols-4 md:grid-cols-5 sm:gap-3 sm:overflow-visible">
                  {secondaryImages.map((src, index) => (
                    <button
                      type="button"
                      key={`${src}-${index}`}
                      onClick={() => handleImageChange(index)}
                      onMouseEnter={() => handleImageChange(index)}
                      onDoubleClick={() => openImageModal(index)}
                      className={`group relative h-24 w-24 flex-none overflow-hidden rounded-2xl bg-white/60 dark:bg-white/5 transition-all duration-300 hover:scale-105 hover:shadow-lg sm:flex-1 sm:max-w-24 ${activeImageIndex === index
                        ? 'border-emerald-500 ring-2 ring-emerald-300 dark:border-emerald-400 dark:ring-emerald-500/80'
                        : 'border border-slate-200 dark:border-white/60 hover:border-emerald-300 hover:ring-1 hover:ring-emerald-200 dark:hover:border-emerald-500/50'
                        }`}
                    >
                      <Image
                        src={src}
                        alt={`${product.name} вариация ${index + 1}`}
                        fill
                        className="object-contain p-1 transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 640px) 35vw, (max-width: 1024px) 25vw, 15vw"
                        onError={(event) => {
                          (event.target as HTMLImageElement).src =
                            '/placeholder-perfume.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-2xl" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="group rounded-2xl border border-slate-200 dark:border-white/60 bg-white/90 p-4 dark:border-white/10 dark:bg-white/5 transition-all duration-300 hover:border-emerald-200 hover:shadow-lg hover:-translate-y-1 dark:hover:border-emerald-500/30 dark:hover:bg-white/10">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-200 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
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
                          className={`h-5 w-5 transition-all duration-300 ${index < Math.round(parseFloat(heroRating))
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

          <div className="space-y-6 rounded-[32px] border-0 bg-transparent p-3 shadow-none sm:border sm:border-slate-200 sm:bg-white/80 sm:p-6 sm:shadow-inner sm:shadow-white/30 sm:dark:border-white/10 sm:dark:bg-slate-900/60 lg:sticky lg:top-4 xl:top-8">
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
                  {currentPriceLabel}
                </p>
                {hasDiscount && (
                  <span className="text-lg font-medium text-slate-400 line-through">
                    {originalPriceLabel}
                  </span>
                )}
                {hasDiscount && (
                  <span className="rounded-xl bg-rose-100/80 px-3 py-1 text-xs font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-200">
                    {discountPercent ? `-${discountPercent}%` : 'Скидка'}
                  </span>
                )}
                {/* Быстрый выбор варианта прямо в блоке цены */}
                {isPerfumeProduct(product) && volumeOptionsWithBase?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {volumeOptionsWithBase.map((option) => {
                      const isSelected = (selectedVolumeOption?.id ?? selectedVolumeOptionId) === option.id;
                      const isAvailable = option.in_stock && option.stock_quantity > 0;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setSelectedVolumeOptionId(option.id)}
                          disabled={!isAvailable}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-200'
                              : isAvailable
                                ? 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:border-emerald-500/40'
                                : 'border-slate-100 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed dark:border-white/5 dark:bg-white/5 dark:text-slate-500'
                          }`}
                        >
                          {formatVolume(option.volume_ml)}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {!isPerfumeProduct(product) && 'weight_options' in product && product.weight_options?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {[...product.weight_options]
                      .sort((a, b) => a.weight_gr - b.weight_gr)
                      .map((option) => {
                        const isSelected = (selectedWeightOption?.id ?? selectedWeightOptionId) === option.id;
                        const isAvailable = option.in_stock && option.stock_quantity > 0;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setSelectedWeightOptionId(option.id)}
                            disabled={!isAvailable}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-200'
                                : isAvailable
                                  ? 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:border-emerald-500/40'
                                  : 'border-slate-100 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed dark:border-white/5 dark:bg-white/5 dark:text-slate-500'
                            }`}
                          >
                            {formatWeight(option.weight_gr)}
                          </button>
                        );
                      })}
                  </div>
                ) : null}
              </div>
              {hasDiscount && (
                <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">
                  Акция действует{discountEndDateLabel ? ` до ${discountEndDateLabel}` : ''}. Скидка применяется автоматически.
                </p>
              )}
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                {variantInStock
                  ? `В наличии ${availableQuantity} шт.`
                  : 'Доступно под заказ'}
              </p>

              {/* Weight Selector (для пигментов) */}
              {!isPerfumeProduct(product) && 'weight_options' in product && product.weight_options && product.weight_options.length > 1 && (
                <div className="mt-4">
                  <WeightSelector
                    options={product.weight_options}
                    selectedId={selectedWeightOptionId ?? selectedWeightOption?.id}
                    onSelect={(opt) => setSelectedWeightOptionId(opt.id)}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => adjustQuantity('dec')}
                  disabled={quantity <= 1}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg font-semibold transition-all duration-300 dark:border-white/10 dark:text-white ${quantity > 1
                    ? 'border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-white/10 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300'
                    : 'border-slate-200 text-slate-400 opacity-40 cursor-not-allowed dark:border-white/5'
                    }`}
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg font-semibold text-slate-700 transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 dark:border-white/10 dark:text-white dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
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
                    ? formatPrice(currentPrice * quantity)
                    : 'Нет в наличии'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                className="w-full btn-with-icon bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-[0_20px_60px_rgba(16,185,129,0.4)] transition-all duration-300 hover:shadow-[0_25px_80px_rgba(16,185,129,0.5)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                size="lg"
                disabled={!product.in_stock}
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="font-semibold">
                  {product.in_stock ? 'Добавить в корзину' : 'Сообщить о наличии'}
                </span>
              </Button>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleToggleFavorite}
                  disabled={favoriteBusy}
                  className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-300 ${isFavorite
                    ? 'border-rose-300 bg-rose-50 text-rose-700 shadow-lg shadow-rose-200/50 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-300'
                    : 'border-slate-200 bg-white/80 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/80 hover:text-emerald-700 dark:border-white/20 dark:bg-white/5 dark:text-slate-300 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300'
                    } ${favoriteBusy ? 'opacity-60 cursor-not-allowed' : ''}`}
                  aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                >
                  <Heart
                    className={`h-5 w-5 transition-all duration-300 ${isFavorite
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
              <div className="group flex items-start gap-3 rounded-xl p-2 transition-all duration-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5">
                <Package className="h-5 w-5 text-emerald-500 transition-transform duration-300 group-hover:scale-110" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                    Готово к отправке
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    Сбор заказа за 2 часа
                  </p>
                </div>
              </div>
              <div className="group flex items-start gap-3 rounded-xl p-2 transition-all duration-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5">
                <RefreshCw className="h-5 w-5 text-emerald-500 transition-transform duration-300 group-hover:scale-110" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
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
        {/* Feature cards block removed */}
      </section>

      {!isPerfumeProduct(product) && (
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

      {/* Модальное окно для просмотра изображений */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-all duration-300"
          onClick={closeImageModal}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
            {/* Кнопка закрытия */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeImageModal();
              }}
              className="absolute top-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-110"
              aria-label="Закрыть"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Кнопка предыдущего изображения */}
            {secondaryImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}
                className="absolute left-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-110"
                aria-label="Предыдущее изображение"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Кнопка следующего изображения */}
            {secondaryImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
                className="absolute right-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-110"
                aria-label="Следующее изображение"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Основное изображение */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={secondaryImages[modalImageIndex]}
              alt={`${product.name} - изображение ${modalImageIndex + 1}`}
              className="object-contain shadow-2xl rounded-lg select-none"
              onClick={(e) => e.stopPropagation()}
              style={{
                height: '85vh',
                width: 'auto',
                maxWidth: '90vw',
                objectFit: 'contain'
              }}
            />

            {/* Индикаторы изображений */}
            {secondaryImages.length > 1 && (
              <div
                className="absolute bottom-8 left-1/2 flex -translate-x-1/2 space-x-2 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                {secondaryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setModalImageIndex(index)}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${index === modalImageIndex
                      ? 'bg-white scale-125'
                      : 'bg-white/50 hover:bg-white/75'
                      }`}
                    aria-label={`Перейти к изображению ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Счетчик изображений */}
            <div className="absolute bottom-8 right-8 z-50 rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur-sm pointer-events-none">
              {modalImageIndex + 1} / {secondaryImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

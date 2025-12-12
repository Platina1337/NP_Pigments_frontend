'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Perfume, Pigment } from '@/types/api';
import { formatPrice, formatVolume, formatWeight, formatGender } from '@/lib/api';

type Product = Perfume | Pigment;

interface ProductAdditionalInfoProps {
  product: Product;
  productType: 'perfume' | 'pigment';
}

function isPerfume(product: Product): product is Perfume {
  return 'gender' in product && 'volume_ml' in product;
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

export const ProductAdditionalInfo: React.FC<ProductAdditionalInfoProps> = ({
  product,
  productType,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-12">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between group py-4 text-left transition-all"
      >
        <div className="flex items-center gap-3">
          <div className={`h-px w-8 bg-slate-300 transition-all group-hover:w-12 group-hover:bg-emerald-500 dark:bg-slate-600 dark:group-hover:bg-emerald-400 ${isOpen ? 'w-12 bg-emerald-500 dark:bg-emerald-400' : ''}`} />
          <span className="text-lg font-semibold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-emerald-700 dark:text-slate-400 dark:group-hover:text-emerald-300">
            Подробная информация
          </span>
        </div>
        <div className={`rounded-full border border-slate-200 p-2 transition-all group-hover:border-emerald-200 group-hover:bg-emerald-50 dark:border-white/10 dark:group-hover:border-emerald-500/30 dark:group-hover:bg-emerald-500/10 ${isOpen ? 'rotate-180 bg-slate-50 dark:bg-white/5' : ''}`}>
          <ChevronDown className={`h-5 w-5 text-slate-400 transition-colors group-hover:text-emerald-600 dark:text-slate-500 dark:group-hover:text-emerald-400 ${isOpen ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
        </div>
      </button>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'opacity-100 max-h-[2000px] mt-6' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          <ProductNarrative product={product} productType={productType} />
          <ProductSignatureSpecs product={product} productType={productType} />
        </div>
      </div>
    </div>
  );
};

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
    <section className="rounded-[32px] border-0 bg-transparent p-0 shadow-none sm:border sm:border-slate-200 sm:bg-white/85 sm:p-8 sm:shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:dark:border-white/10 sm:dark:bg-slate-900/70 h-full">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            История
          </p>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white mt-2">
            {productType === 'perfume'
              ? 'Ритуал раскрытия аромата'
              : 'Философия цвета и текстуры'}
          </h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {heroText}
          </p>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {supportingText}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {insightCards.map(({ label, value }) => (
            <div
              key={label}
              className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5 transition-all duration-300 hover:border-emerald-200 hover:shadow-lg hover:-translate-y-1 dark:hover:border-emerald-500/30 dark:hover:bg-white/10"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                {label}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                {value}
              </p>
            </div>
          ))}
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
        {
          label: 'Объем',
          value: (() => {
            const opts = [...(product.volume_options ?? [])];
            const hasBase = opts.some((o) => o.volume_ml === product.volume_ml);
            if (!hasBase) {
              opts.unshift({
                id: -1,
                volume_ml: product.volume_ml,
                price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                final_price:
                  product.final_price ??
                  (typeof product.price === 'string' ? parseFloat(product.price) : product.price),
                discount_percentage: product.discount_percentage ?? 0,
                discount_price: product.discount_price ?? null,
                stock_quantity: product.stock_quantity ?? 0,
                in_stock: product.in_stock,
                is_default: true,
                is_on_sale: product.is_on_sale ?? false,
              });
            }
            return opts
              .sort((a, b) => a.volume_ml - b.volume_ml)
              .map((opt) => formatVolume(opt.volume_ml))
              .join(' · ');
          })(),
        },
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
    <section className="rounded-[32px] border-0 bg-transparent p-0 shadow-none sm:border sm:border-slate-200 sm:bg-white/85 sm:p-8 sm:shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:dark:border-white/10 sm:dark:bg-slate-900/70 h-full">
      <div className="grid gap-8">
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
                className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5 transition-all duration-300 hover:border-emerald-200 hover:shadow-lg hover:-translate-y-1 dark:hover:border-emerald-500/30 dark:hover:bg-white/10"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
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
                className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5 transition-all duration-300 hover:border-emerald-200 hover:shadow-lg hover:-translate-y-1 dark:hover:border-emerald-500/30 dark:hover:bg-white/10"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
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


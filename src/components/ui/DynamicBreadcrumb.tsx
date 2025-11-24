'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Perfume, Pigment } from '@/types/api';
import { Breadcrumb } from './Breadcrumb';

type Product = Perfume | Pigment;

interface DynamicBreadcrumbProps {
  product: Product;
}

export function DynamicBreadcrumb({ product }: DynamicBreadcrumbProps) {
  const [breadcrumbItems, setBreadcrumbItems] = React.useState<Array<{ label: string; href: string }>>([
    { label: 'Главная', href: '/' },
    { label: product.name, href: `/products/${product.id}` },
  ]);

  React.useEffect(() => {
    console.log('DynamicBreadcrumb: component mounted for perfume:', product.name);

    const items = [];

    // Всегда начинаем с Главной
    items.push({ label: 'Главная', href: '/' });

    // Проверяем сохраненный путь в sessionStorage
    const savedPath = sessionStorage.getItem('breadcrumbPath');
    console.log('DynamicBreadcrumb: savedPath:', savedPath);

    let usedSavedPath = false;

    if (savedPath) {
      try {
        const pathData = JSON.parse(savedPath);
        console.log('DynamicBreadcrumb: parsed pathData:', pathData);

        // Проверяем timestamp (если прошло больше 5 минут, игнорируем)
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5 минут
        if (pathData.timestamp && (now - pathData.timestamp) > maxAge) {
          console.log('DynamicBreadcrumb: saved path is too old, ignoring');
          sessionStorage.removeItem('breadcrumbPath');
        } else {
          // Добавляем шаги из сохраненного пути
          if (pathData.steps && pathData.steps.length > 0) {
            pathData.steps.forEach((step: { label: string; href: string }) => {
              items.push(step);
            });
          }
          // НЕ очищаем сохраненный путь - пусть живет в sessionStorage
          console.log('DynamicBreadcrumb: using saved breadcrumb path');
          usedSavedPath = true;
        }
      } catch (error) {
        console.error('Error parsing breadcrumb path:', error);
        sessionStorage.removeItem('breadcrumbPath');
      }
    }

    // Если нет сохраненного пути или он был очищен, используем fallback логику
    // Но только если мы действительно не нашли сохраненный путь
    if (items.length === 1 && !usedSavedPath) { // Только "Главная" и не использовали сохраненный путь
      const referrer = document.referrer;
      const currentUrl = window.location.href;

      console.log('DynamicBreadcrumb: using fallback logic');
      console.log('DynamicBreadcrumb: referrer:', referrer);
      console.log('DynamicBreadcrumb: currentUrl:', currentUrl);

      if (referrer && referrer !== currentUrl) {
        // Определяем тип страницы по referrer
        if (referrer.includes('/products') && !referrer.includes('/products/')) {
          // Пришли со страницы каталога товаров
          console.log('DynamicBreadcrumb: detected products page');
          items.push({ label: 'Каталог', href: '/products' });
        } else if (referrer.includes('/search')) {
          // Пришли со страницы поиска
          console.log('DynamicBreadcrumb: detected search page');
          items.push({ label: 'Поиск', href: '/search' });
        } else if (referrer.includes('/products?')) {
          // Пришли с фильтрованной страницы продуктов
          console.log('DynamicBreadcrumb: detected filtered products page');
          items.push({ label: 'Каталог', href: '/products' });
        } else if (referrer === window.location.origin + '/' || referrer === window.location.origin || referrer.includes(window.location.origin + '/?') || referrer === '') {
          // Пришли с главной страницы - не добавляем промежуточные шаги
          console.log('DynamicBreadcrumb: detected home page - no intermediate steps');
        } else {
          console.log('DynamicBreadcrumb: referrer not recognized:', referrer);
        }
      } else {
        console.log('DynamicBreadcrumb: no referrer or same as current URL');
        // Если нет referrer или referrer совпадает с текущим URL, это может быть прямой переход или обновление страницы
        // В этом случае очищаем breadcrumb путь, чтобы использовать дефолтную логику
        sessionStorage.removeItem('breadcrumbPath');
      }
    }

    // Добавляем текущий товар
    items.push({ label: product.name, href: `/products/${product.id}` });

    console.log('DynamicBreadcrumb: final breadcrumb items:', items);
    console.log('DynamicBreadcrumb: setting breadcrumb items');
    setBreadcrumbItems(items);
  }, [product]);

  return <Breadcrumb items={breadcrumbItems} />;
}

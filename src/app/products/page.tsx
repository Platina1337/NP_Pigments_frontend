'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Filter, SlidersHorizontal, Loader2, AlertCircle, ArrowUp } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductSort, SortOption } from '@/components/products/ProductSort';
import { ProductsPerPage } from '@/components/products/ProductsPerPage';
import { Button } from '@/components/ui/Button';
import { useProducts, useProductFilters } from '@/lib/useProducts';
import { saveBreadcrumbPath } from '@/lib/swr-hooks';
import { PerfumeFilters } from '@/types';

export const dynamic = 'force-dynamic';

const SORT_OPTIONS: SortOption[] = [
  { value: '-created_at', label: 'Новинки' },
  { value: 'price', label: 'Цена: по возрастанию' },
  { value: '-price', label: 'Цена: по убыванию' },
  { value: 'name', label: 'Название: А-Я' },
  { value: '-name', label: 'Название: Я-А' },
];

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];

export default function ProductsPage() {
  const [filters, setFilters] = useState<PerfumeFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState('-created_at');
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Предотвращаем прокрутку основной страницы когда открыты мобильные фильтры
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showFilters]);

  // Загрузка фильтров (категории и бренды)
  const { categories, brands, isLoading: filtersLoading, error: filtersError } = useProductFilters();

  // Функция для создания breadcrumb пути
  const getBreadcrumbPath = useCallback(() => {
    const path = [{ label: 'Каталог', href: '/products' }];

    // Добавляем активные фильтры в breadcrumb
    const activeFilters = [];

    if (filters.category) {
      const category = categories.find(c => c.id.toString() === filters.category!.toString());
      if (category) {
        activeFilters.push({ label: category.name, href: `/products?category=${filters.category}` });
      }
    }

    if (filters.brand) {
      const brand = brands.find(b => b.id.toString() === filters.brand!.toString());
      if (brand) {
        activeFilters.push({ label: brand.name, href: `/products?brand=${filters.brand}` });
      }
    }

    // Добавляем активные фильтры в путь
    path.push(...activeFilters);

    return path;
  }, [filters.category, filters.brand, categories, brands]);

  // Загрузка продуктов с бесконечной прокруткой
  const {
    products,
    totalCount,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    resetSize,
    error: productsError,
    mutate,
  } = useProducts({
    filters,
    pageSize: itemsPerPage,
    sort,
  });

  // Обработка скролла для показа кнопки "вверх"
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Бесконечная прокрутка
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // Проверяем, что мы не в мобильных фильтрах
      if (showFilters) return;

      // Очищаем предыдущий таймаут
      clearTimeout(scrollTimeout);

      // Ждем 100мс после остановки скролла перед загрузкой
      scrollTimeout = setTimeout(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.offsetHeight;

        // Увеличиваем порог до 1500px от низа страницы
        if (
          scrollTop + windowHeight >= documentHeight - 1500 &&
          hasMore &&
          !isLoadingMore
        ) {
          loadMore();
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [hasMore, isLoadingMore, loadMore, showFilters]);

  // Обработчик изменения фильтров
  const handleFiltersChange = useCallback((newFilters: PerfumeFilters) => {
    const hasSignificantChanges = (
      filters.category !== newFilters.category ||
      filters.brand !== newFilters.brand ||
      filters.gender !== newFilters.gender ||
      filters.in_stock !== newFilters.in_stock
    );

    const hasPriceChanges = (
      filters.min_price !== newFilters.min_price ||
      filters.max_price !== newFilters.max_price
    );

    setFilters(newFilters);

    // Сбрасываем пагинацию и скролл только при значительных изменениях
    if (hasSignificantChanges) {
      resetSize();
      window.scrollTo(0, 0);
    } else if (hasPriceChanges) {
      // При изменении цены сбрасываем пагинацию но сохраняем позицию скролла
      resetSize();
    }
    // При поиске не сбрасываем пагинацию и не скроллим вверх
  }, [filters, resetSize]);

  // Обработчик изменения сортировки
  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
    resetSize(); // Сбрасываем пагинацию при изменении сортировки
    window.scrollTo(0, 0);
  }, [resetSize]);

  // Обработчик изменения количества товаров на странице
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    resetSize(); // Сбрасываем пагинацию при изменении количества товаров на странице
    window.scrollTo(0, 0);
  }, [resetSize]);

  // Прокрутка вверх
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({});
    setShowFilters(false);
  };

  const hasActiveFilters = !!(
    filters.category ||
    filters.brand ||
    filters.gender ||
    filters.in_stock !== undefined ||
    filters.min_price ||
    filters.max_price ||
    filters.search
  );

  // Отображение ошибок
  if (filtersError || productsError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 bg-secondary rounded-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Ошибка загрузки данных
          </h3>
          <p className="text-muted-foreground mb-6">
            {filtersError?.message || productsError?.message || 'Произошла неизвестная ошибка'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Каталог парфюмерии
        </h1>
        <p className="text-muted-foreground">
          {isLoading ? 'Загрузка...' : `${totalCount} товаров найдено`}
        </p>
      </div>

      {/* Панель управления */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Фильтры для мобильных */}
          <div className="md:hidden">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Фильтры
            </Button>
          </div>

          {/* Сортировка */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Сортировка:</span>
            <ProductSort
              value={sort}
              onChange={handleSortChange}
              options={SORT_OPTIONS}
            />
          </div>

          {/* Количество товаров на странице */}
          <ProductsPerPage
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            options={ITEMS_PER_PAGE_OPTIONS}
          />

          {/* Сброс фильтров */}
          {hasActiveFilters && (
            <Button
              variant="secondary"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Сбросить фильтры
            </Button>
          )}
        </div>

        {/* Счетчик товаров */}
        <div className="text-sm text-muted-foreground">
          Показано {products.length} из {totalCount}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Боковая панель фильтров */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          {filtersLoading ? (
            <div className="bg-secondary p-6 rounded-lg animate-pulse">
              <div className="h-4 bg-muted rounded mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
              brands={brands}
            />
          )}
        </aside>

        {/* Список товаров */}
        <main className="flex-1">
          {/* Loading state для первой загрузки */}
          {isLoading && products.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(itemsPerPage > 12 ? 12 : itemsPerPage)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-secondary aspect-square rounded-lg mb-4"></div>
                  <div className="bg-secondary h-4 rounded mb-2"></div>
                  <div className="bg-secondary h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-secondary h-8 rounded"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-secondary rounded-lg">
              <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Товары не найдены
              </h3>
              <p className="text-muted-foreground mb-6">
                Попробуйте изменить параметры поиска или сбросить фильтры
              </p>
              <Button onClick={clearFilters}>
                Сбросить фильтры
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    breadcrumbPath={getBreadcrumbPath()}
                  />
                ))}
              </div>

              {/* Индикатор загрузки при подгрузке следующих страниц */}
              {isLoadingMore && (
                <div className="flex justify-center py-8">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Загрузка ещё товаров...
                  </div>
                </div>
              )}

              {/* Сообщение о конце списка */}
              {!hasMore && products.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Вы просмотрели все доступные товары
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Мобильные фильтры */}
      {showFilters && (
        <ProductFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          categories={categories}
          brands={brands}
          isMobile
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Кнопка прокрутки вверх */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 rounded-full w-12 h-12 p-0 shadow-lg"
          size="sm"
          style={{ touchAction: 'manipulation' }}
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

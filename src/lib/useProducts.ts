import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import { PerfumeListItem, PerfumeFilters, Category, Brand } from '@/types';
import { api } from '@/lib/api';

export interface ProductsResponse {
  results: PerfumeListItem[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface UseProductsOptions {
  filters?: PerfumeFilters;
  pageSize?: number;
  sort?: string;
}

export const useProducts = ({ filters, pageSize = 20, sort }: UseProductsOptions = {}) => {
  // Создаем стабильный ключ для SWR на основе фильтров и сортировки
  const getKey = (pageIndex: number, previousPageData: ProductsResponse | null) => {
    if (previousPageData && !previousPageData.next) return null; // достигнут конец

    const params: Record<string, string> = {
      page: (pageIndex + 1).toString(),
      page_size: pageSize.toString(),
    };

    // Добавляем фильтры
    if (filters?.brand) params.brand = filters.brand.toString();
    if (filters?.category) params.category = filters.category.toString();
    if (filters?.gender) params.gender = filters.gender;
    if (filters?.in_stock !== undefined) params.in_stock = filters.in_stock.toString();
    if (filters?.min_price) params.min_price = filters.min_price.toString();
    if (filters?.max_price) params.max_price = filters.max_price.toString();
    if (filters?.search) params.search = filters.search;

    // Добавляем сортировку
    if (sort) params.ordering = sort;

    // Создаем стабильный ключ на основе всех параметров
    const keyParts = [
      'products',
      pageIndex,
      pageSize,
      sort || '',
      filters?.brand || '',
      filters?.category || '',
      filters?.gender || '',
      filters?.in_stock?.toString() || '',
      filters?.min_price || '',
      filters?.max_price || '',
      filters?.search || '',
    ];

    return keyParts.join('|');
  };

  const { data, error, size, setSize, isLoading, isValidating, mutate } = useSWRInfinite<ProductsResponse>(
    getKey,
    async (key) => {
      // Парсим ключ обратно в параметры
      const keyParts = key.split('|');
      const params: Record<string, string> = {
        page: (parseInt(keyParts[1]) + 1).toString(),
        page_size: keyParts[2],
      };

      // Добавляем остальные параметры если они есть
      if (keyParts[3]) params.ordering = keyParts[3];
      if (keyParts[4]) params.brand = keyParts[4];
      if (keyParts[5]) params.category = keyParts[5];
      if (keyParts[6]) params.gender = keyParts[6];
      if (keyParts[7]) params.in_stock = keyParts[7];
      if (keyParts[8]) params.min_price = keyParts[8];
      if (keyParts[9]) params.max_price = keyParts[9];
      if (keyParts[10]) params.search = keyParts[10];

      // Используем новый endpoint /products/ для всех товаров
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/products/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false, // Отключаем перезагрузку при reconnect
      dedupingInterval: 2000, // Уменьшаем интервал дедупликации
      initialSize: 1,
      keepPreviousData: true, // Сохраняем предыдущие данные
    }
  );

  // Объединяем все страницы в один массив
  const products = data ? data.flatMap(page => page.results) : [];
  const totalCount = data?.[0]?.count || 0;
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.results.length === 0;
  const isReachingEnd = data && data[data.length - 1]?.next === null;
  const hasMore = !isReachingEnd && !isEmpty;

  const loadMore = () => {
    if (hasMore && !isLoadingMore) {
      setSize(size + 1);
    }
  };

  const resetSize = () => {
    setSize(1); // Сбрасываем к первой странице
  };

  return {
    products,
    totalCount,
    isLoading,
    isLoadingMore,
    isValidating,
    isEmpty,
    hasMore,
    loadMore,
    mutate,
    resetSize,
    error,
  };
};

// Хук для загрузки категорий и брендов
export const useProductFilters = () => {
  const { data: categoriesData, error: categoriesError, isLoading: categoriesLoading } = useSWR(
    'categories',
    async () => {
      // Загружаем все категории без фильтрации по типу
      const response = await api.categories.getAll({});
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data as { results: Category[] };
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  const { data: brandsData, error: brandsError, isLoading: brandsLoading } = useSWR(
    'brands',
    async () => {
      // Загружаем все бренды без фильтрации по типу
      const response = await api.brands.getAll({});
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data as { results: Brand[] };
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    categories: categoriesData?.results || [],
    brands: brandsData?.results || [],
    isLoading: categoriesLoading || brandsLoading,
    error: categoriesError || brandsError,
  };
};

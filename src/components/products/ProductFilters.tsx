import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductSearch } from './ProductSearch';
import { PerfumeFilters, Category, Brand } from '@/types';

interface ProductFiltersProps {
  filters: PerfumeFilters;
  onFiltersChange: (filters: PerfumeFilters) => void;
  categories: Category[];
  brands: Brand[];
  isMobile?: boolean;
  onClose?: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  brands,
  isMobile = false,
  onClose,
}) => {
  const [localFilters, setLocalFilters] = useState<PerfumeFilters>(filters);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [priceRange, setPriceRange] = useState({
    min: filters.min_price || '',
    max: filters.max_price || '',
  });

  // Синхронизация локальных фильтров с внешними
  useEffect(() => {
    setLocalFilters(filters);
    setSearchQuery(filters.search || '');
    setPriceRange({
      min: filters.min_price?.toString() || '',
      max: filters.max_price?.toString() || '',
    });
  }, [filters]);

  // Обновление фильтров с дебаунсом
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const updatedFilters = {
        ...localFilters,
        search: searchQuery || undefined,
        min_price: priceRange.min ? parseFloat(priceRange.min.toString()) : undefined,
        max_price: priceRange.max ? parseFloat(priceRange.max.toString()) : undefined,
      };

      // Проверяем, действительно ли фильтры изменились
      const filtersChanged = JSON.stringify(updatedFilters) !== JSON.stringify(filters);

      if (filtersChanged) {
        onFiltersChange(updatedFilters);
      }
    }, 500); // Увеличиваем дебаунс до 500мс

    return () => clearTimeout(timeoutId);
  }, [localFilters, searchQuery, priceRange, onFiltersChange, filters]);

  const handleCategoryChange = (categoryId: number | undefined) => {
    setLocalFilters(prev => ({ ...prev, category: categoryId }));
  };

  const handleBrandChange = (brandId: number | undefined) => {
    setLocalFilters(prev => ({ ...prev, brand: brandId }));
  };

  const handleGenderChange = (gender: 'M' | 'F' | 'U' | undefined) => {
    setLocalFilters(prev => ({ ...prev, gender }));
  };

  const handleStockChange = (inStock: boolean | undefined) => {
    setLocalFilters(prev => ({ ...prev, in_stock: inStock }));
  };

  const handlePriceChange = (field: 'min' | 'max', value: string) => {
    setPriceRange(prev => ({ ...prev, [field]: value }));
  };

  const clearAllFilters = () => {
    const emptyFilters: PerfumeFilters = {};
    setLocalFilters(emptyFilters);
    setSearchQuery('');
    setPriceRange({ min: '', max: '' });
    onFiltersChange(emptyFilters);
    // Закрываем мобильные фильтры при очистке
    if (isMobile && onClose) {
      onClose();
    }
  };

  const hasActiveFilters = !!(
    localFilters.category ||
    localFilters.brand ||
    localFilters.gender ||
    localFilters.in_stock !== undefined ||
    localFilters.min_price ||
    localFilters.max_price ||
    localFilters.search
  );

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Заголовок для мобильной версии */}
      {isMobile && (
        <div className="flex items-center justify-between pb-4 border-b">
          <h3 className="text-lg font-semibold">Фильтры</h3>
          <Button variant="secondary" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Поиск */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Поиск
        </label>
        <ProductSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Название, бренд или описание..."
        />
      </div>

      {/* Категории */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Категории
        </label>
        <div className="space-y-2">
          <button
            onClick={() => handleCategoryChange(undefined)}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              !localFilters.category
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-background'
            }`}
          >
            Все категории
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                localFilters.category === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-background'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Бренды */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Бренды
        </label>
        <div className="space-y-2">
          <button
            onClick={() => handleBrandChange(undefined)}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              !localFilters.brand
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-background'
            }`}
          >
            Все бренды
          </button>
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => handleBrandChange(brand.id)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                localFilters.brand === brand.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-background'
              }`}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </div>

      {/* Пол */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Для кого
        </label>
        <div className="space-y-2">
          {[
            { value: undefined, label: 'Все' },
            { value: 'F' as const, label: 'Женские' },
            { value: 'M' as const, label: 'Мужские' },
            { value: 'U' as const, label: 'Унисекс' },
          ].map((option) => (
            <button
              key={option.value || 'all'}
              onClick={() => handleGenderChange(option.value)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                localFilters.gender === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-background'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Наличие */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Наличие
        </label>
        <div className="space-y-2">
          <button
            onClick={() => handleStockChange(undefined)}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              localFilters.in_stock === undefined
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-background'
            }`}
          >
            Все товары
          </button>
          <button
            onClick={() => handleStockChange(true)}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              localFilters.in_stock === true
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-background'
            }`}
          >
            В наличии
          </button>
          <button
            onClick={() => handleStockChange(false)}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              localFilters.in_stock === false
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-background'
            }`}
          >
            Нет в наличии
          </button>
        </div>
      </div>

      {/* Ценовой диапазон */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Цена
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="number"
              placeholder="От"
              value={priceRange.min}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              min="0"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="До"
              value={priceRange.max}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="pt-4 border-t space-y-3">
        {/* Кнопка применения для мобильной версии */}
        {isMobile && (
          <Button
            onClick={() => onClose && onClose()}
            className="w-full"
          >
            Применить фильтры
          </Button>
        )}

        {/* Очистить фильтры */}
        {hasActiveFilters && (
          <Button
            variant="secondary"
            onClick={clearAllFilters}
            className="w-full"
          >
            Очистить все фильтры
          </Button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-background z-50 p-6 overflow-y-auto" style={{ maxHeight: '100vh' }}>
        <FilterContent />
      </div>
    );
  }

  return (
    <div className="bg-secondary p-6 rounded-lg">
      <FilterContent />
    </div>
  );
};

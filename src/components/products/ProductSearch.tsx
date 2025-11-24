import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { PerfumeListItem } from '@/types';

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (product: PerfumeListItem) => void;
  placeholder?: string;
  className?: string;
}

interface SearchResult {
  results: PerfumeListItem[];
  count: number;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = "Поиск товаров...",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Поиск товаров
  const { data: searchData, isLoading } = useSWR<SearchResult>(
    value.length >= 2 ? ['search', value] : null,
    async ([, query]) => {
      const response = await api.perfumes.getAll({ search: query as string, page_size: '5' });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data as SearchResult;
    },
    {
      dedupingInterval: 300,
      revalidateOnFocus: false,
    }
  );

  const results = searchData?.results || [];

  // Обработка кликов вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Обработка клавиш
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (product: PerfumeListItem) => {
    onChange(product.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect?.(product);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(newValue.length >= 2);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (value.length >= 2) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {value && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Выпадающий список результатов */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                Поиск...
              </div>
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className={`w-full text-left px-4 py-3 hover:bg-secondary transition-colors ${
                    index === selectedIndex ? 'bg-secondary' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={product.image || '/placeholder-perfume.svg'}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-perfume.svg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {product.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {product.brand_name} • {product.category_name}
                      </div>
                      <div className="text-sm font-medium text-primary">
                        {product.price} ₽
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {searchData && searchData.count > 5 && (
                <div className="px-4 py-2 text-sm text-muted-foreground border-t">
                  И ещё {searchData.count - 5} товаров...
                </div>
              )}
            </>
          ) : value.length >= 2 ? (
            <div className="p-4 text-center text-muted-foreground">
              Ничего не найдено
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

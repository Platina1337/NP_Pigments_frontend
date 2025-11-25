'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, X, ArrowLeft } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { saveBreadcrumbPath } from '@/lib/swr-hooks'

interface SearchResult {
  id: number
  name: string
  brand: string
  price: number
  image: string
  type: 'perfume' | 'brand' | 'category'
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Chanel №5',
    'Dior Sauvage',
    'Gucci Bloom'
  ])

  // Популярные категории для быстрого поиска
  const popularCategories = [
    { name: 'Парфюмы', icon: '💧', href: '/perfumes' },
    { name: 'Бренды', icon: '🏷️', href: '/brands' },
    { name: 'Акции', icon: '🔥', href: '/products?sale=true' },
    { name: 'Новинки', icon: '✨', href: '/products?new=true' }
  ]

  // Моковые результаты поиска
  const mockResults: SearchResult[] = [
    {
      id: 1,
      name: 'Chanel №5',
      brand: 'Chanel',
      price: 8500,
      image: '/placeholder-perfume.svg',
      type: 'perfume'
    },
    {
      id: 2,
      name: 'Dior Sauvage',
      brand: 'Dior',
      price: 7200,
      image: '/placeholder-perfume.svg',
      type: 'perfume'
    },
    {
      id: 3,
      name: 'Gucci Bloom',
      brand: 'Gucci',
      price: 6500,
      image: '/placeholder-perfume.svg',
      type: 'perfume'
    }
  ]

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)

    // Имитация задержки поиска
    setTimeout(() => {
      const filteredResults = mockResults.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setResults(filteredResults)
      setIsLoading(false)
    }, 300)
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  const clearSearch = () => {
    setQuery('')
    setResults([])
  }

  const removeRecentSearch = (search: string) => {
    setRecentSearches(prev => prev.filter(s => s !== search))
  }

  const handleProductClick = (result: SearchResult) => {
    // Сохраняем breadcrumb путь для страницы поиска: Главная > Поиск > Товар
    const breadcrumbPath = [
      { label: 'Поиск', href: '/search' }
    ];
    saveBreadcrumbPath(breadcrumbPath);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Заголовок с навигацией */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <Link href="/" className="p-2 -m-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>

            <div className="flex-1 relative">
              <div className="relative">
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск парфюма, бренда..."
                  style={{ paddingLeft: '72px' }}
                  className="w-full pr-10 py-3 text-base bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white dark:focus:bg-gray-600"
                  autoFocus
                />
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner shadow-primary/10 z-10">
                  <Search className="w-5 h-5" />
                </span>
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-md mx-auto px-4 py-6">
        {!query && results.length === 0 && (
          <>
            {/* Популярные категории */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Популярные категории
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {popularCategories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-violet-300 dark:hover:border-violet-600 transition-all group"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {category.name}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Недавние поиски */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Недавние поиски
                  </h3>
                  <button
                    onClick={() => setRecentSearches([])}
                    className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                  >
                    Очистить
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search) => (
                    <div
                      key={search}
                      className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group cursor-pointer"
                      onClick={() => setQuery(search)}
                    >
                      <div className="flex items-center space-x-3">
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          {search}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeRecentSearch(search)
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Результаты поиска */}
        {query && (
          <div>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Поиск...</p>
              </div>
            ) : results.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Результаты ({results.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      href={`/products/${result.id}`}
                      onClick={() => handleProductClick(result)}
                      className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-violet-300 dark:hover:border-violet-600 transition-all group"
                    >
                      <img
                        src={result.image}
                        alt={result.name}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                          {result.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {result.brand}
                        </p>
                        <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
                          {result.price.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : query ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Ничего не найдено
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Попробуйте изменить запрос или выберите категорию
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {popularCategories.slice(0, 3).map((category) => (
                    <Link key={category.name} href={category.href}>
                      <Button variant="secondary" size="sm">
                        {category.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

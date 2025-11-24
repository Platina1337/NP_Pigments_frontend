'use client'

import { useState, useEffect, useCallback } from 'react'

export const dynamic = 'force-dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'
import { saveBreadcrumbPath } from '@/lib/swr-hooks'
import Loading from '@/components/Loading'
import Error from '@/components/Error'

interface PigmentListItem {
  id: number
  name: string
  brand_name: string
  category_name: string
  price: number
  weight_gr: number
  color_type: 'powder' | 'liquid' | 'paste'
  application_type: 'cosmetics' | 'art' | 'industrial' | 'food'
  in_stock: boolean
  image?: string
}

export default function PigmentsPage() {
  const [pigments, setPigments] = useState<PigmentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedColorType, setSelectedColorType] = useState('')
  const [selectedApplicationType, setSelectedApplicationType] = useState('')

  const handleProductClick = useCallback((pigment: PigmentListItem) => {
    // Сохраняем breadcrumb путь для страницы pigments: Главная > Пигменты > Товар
    const breadcrumbPath = [
      { label: 'Пигменты', href: '/pigments' }
    ];
    saveBreadcrumbPath(breadcrumbPath);
  }, [])
  const [brands, setBrands] = useState<{id: number, name: string}[]>([])
  const [categories, setCategories] = useState<{id: number, name: string}[]>([])

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [brandsResponse, categoriesResponse] = await Promise.all([
        api.brands.getAll({ product_type: 'pigment' }),
        api.categories.getAll({ category_type: 'pigment' })
      ])

      if (brandsResponse.data) {
        const brandData = (brandsResponse.data as { results?: unknown[] }).results || brandsResponse.data
        setBrands(Array.isArray(brandData) ? brandData : [])
      }

      if (categoriesResponse.data) {
        const categoryData = (categoriesResponse.data as { results?: unknown[] }).results || categoriesResponse.data
        setCategories(Array.isArray(categoryData) ? categoryData : [])
      }
    } catch (err) {
      console.error('Error loading initial data:', err)
    }
  }

  const loadPigments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params: Record<string, string> = {}

      if (searchTerm) {
        params.search = searchTerm
      }

      if (selectedBrand) {
        params.brand = selectedBrand
      }

      if (selectedCategory) {
        params.category = selectedCategory
      }

      if (selectedColorType) {
        params.color_type = selectedColorType
      }

      if (selectedApplicationType) {
        params.application_type = selectedApplicationType
      }

      const response = await api.pigments.getAll(params)

      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        const pigmentData = (response.data as { results?: PigmentListItem[] }).results || response.data
        setPigments(Array.isArray(pigmentData) ? pigmentData : [])
      }
    } catch (err) {
      setError('Ошибка загрузки данных')
      console.error('Error loading pigments:', err)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedBrand, selectedCategory, selectedColorType, selectedApplicationType])

  useEffect(() => {
    loadPigments()
  }, [searchTerm, selectedBrand, selectedCategory, selectedColorType, selectedApplicationType, loadPigments])

  const getColorTypeLabel = (colorType: string) => {
    switch (colorType) {
      case 'powder': return 'Порошок'
      case 'liquid': return 'Жидкий'
      case 'paste': return 'Паста'
      default: return colorType
    }
  }

  const getColorTypeColor = (colorType: string) => {
    switch (colorType) {
      case 'powder': return 'bg-gray-100 text-gray-800'
      case 'liquid': return 'bg-blue-100 text-blue-800'
      case 'paste': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getApplicationTypeLabel = (applicationType: string) => {
    switch (applicationType) {
      case 'cosmetics': return 'Косметика'
      case 'art': return 'Искусство'
      case 'industrial': return 'Промышленность'
      case 'food': return 'Пищевая'
      default: return applicationType
    }
  }

  if (loading && pigments.length === 0) {
    return <Loading />
  }

  if (error && pigments.length === 0) {
    return <Error message={error} />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Пигменты</h1>
        <p className="text-foreground/80">Откройте мир бесконечных возможностей цвета</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg shadow-sm p-6 mb-8 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Поиск
            </label>
            <input
              type="text"
              placeholder="Название пигмента..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
            />
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Бренд
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
            >
              <option value="">Все бренды</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Категория
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
            >
              <option value="">Все категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Color Type Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Тип
            </label>
            <select
              value={selectedColorType}
              onChange={(e) => setSelectedColorType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
            >
              <option value="">Все типы</option>
              <option value="powder">Порошок</option>
              <option value="liquid">Жидкий</option>
              <option value="paste">Паста</option>
            </select>
          </div>

          {/* Application Type Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Применение
            </label>
            <select
              value={selectedApplicationType}
              onChange={(e) => setSelectedApplicationType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
            >
              <option value="">Все</option>
              <option value="cosmetics">Косметика</option>
              <option value="art">Искусство</option>
              <option value="industrial">Промышленность</option>
              <option value="food">Пищевая</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Pigments Grid */}
      {!loading && pigments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pigments.map((pigment) => (
            <Link
              key={pigment.id}
              href={`/products/${pigment.id}`}
              onClick={() => handleProductClick(pigment)}
              className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border block"
            >
              {/* Image */}
              <div className="aspect-square bg-secondary relative">
                {pigment.image ? (
                  <Image
                    src={pigment.image}
                    alt={pigment.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-2xl text-foreground/40">🎨</span>
                    </div>
                  </div>
                )}

                {/* Stock Status */}
                {!pigment.in_stock && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Нет в наличии
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getColorTypeColor(pigment.color_type)}`}>
                    {getColorTypeLabel(pigment.color_type)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {pigment.name}
                </h3>

                <p className="text-sm text-foreground/60 mb-2">
                  {pigment.brand_name} • {pigment.category_name}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-primary">
                    {pigment.price.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-sm text-foreground/60">
                    {pigment.weight_gr} г
                  </div>
                </div>

                <button
                  className={`w-full mt-3 px-4 py-2 ${
                    pigment.in_stock
                      ? 'btn-primary'
                      : 'btn-secondary opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!pigment.in_stock}
                >
                  {pigment.in_stock ? 'В корзину' : 'Нет в наличии'}
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && pigments.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-foreground/40">🎨</span>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Пигменты не найдены
          </h3>
          <p className="text-foreground/60">
            Попробуйте изменить параметры поиска или фильтры
          </p>
        </div>
      )}
    </div>
  )
}

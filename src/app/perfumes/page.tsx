'use client'

import { useState, useEffect, useCallback } from 'react'

export const dynamic = 'force-dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'
import { saveBreadcrumbPath } from '@/lib/swr-hooks'
import Loading from '@/components/Loading'
import Error from '@/components/Error'

interface PerfumeListItem {
  id: number
  name: string
  brand_name: string
  category_name: string
  price: number
  volume_ml: number
  gender: 'M' | 'F' | 'U'
  in_stock: boolean
  image?: string
}

export default function PerfumesPage() {
  const [perfumes, setPerfumes] = useState<PerfumeListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedGender, setSelectedGender] = useState('')

  const handleProductClick = useCallback((perfume: PerfumeListItem) => {
    // Сохраняем breadcrumb путь для страницы perfumes: Главная > Парфюмы > Товар
    const breadcrumbPath = [
      { label: 'Парфюмы', href: '/perfumes' }
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
        api.brands.getAll({ product_type: 'perfume' }),
        api.categories.getAll({ category_type: 'perfume' })
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

  const loadPerfumes = useCallback(async () => {
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

      if (selectedGender) {
        params.gender = selectedGender
      }

      const response = await api.perfumes.getAll(params)

      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        const perfumeData = (response.data as { results?: PerfumeListItem[] }).results || response.data
        setPerfumes(Array.isArray(perfumeData) ? perfumeData : [])
      }
    } catch (err) {
      setError('Ошибка загрузки данных')
      console.error('Error loading perfumes:', err)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedBrand, selectedCategory, selectedGender])

  useEffect(() => {
    loadPerfumes()
  }, [searchTerm, selectedBrand, selectedCategory, selectedGender, loadPerfumes])

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'M': return 'Мужской'
      case 'F': return 'Женский'
      case 'U': return 'Унисекс'
      default: return gender
    }
  }

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'M': return 'bg-blue-100 text-blue-800'
      case 'F': return 'bg-pink-100 text-pink-800'
      case 'U': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && perfumes.length === 0) {
    return <Loading />
  }

  if (error && perfumes.length === 0) {
    return <Error message={error} />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Парфюмы</h1>
        <p className="text-foreground/80">Откройте для себя нашу коллекцию элитных ароматов</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg shadow-sm p-6 mb-8 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Поиск
            </label>
            <input
              type="text"
              placeholder="Название аромата..."
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

          {/* Gender Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Пол
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
            >
              <option value="">Все</option>
              <option value="M">Мужской</option>
              <option value="F">Женский</option>
              <option value="U">Унисекс</option>
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

      {/* Perfumes Grid */}
      {!loading && perfumes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {perfumes.map((perfume) => (
            <Link
              key={perfume.id}
              href={`/products/${perfume.id}`}
              onClick={() => handleProductClick(perfume)}
              className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border block"
            >
              {/* Image */}
              <div className="aspect-square bg-secondary relative">
                {perfume.image ? (
                  <Image
                    src={perfume.image}
                    alt={perfume.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-2xl text-foreground/40">💧</span>
                    </div>
                  </div>
                )}

                {/* Stock Status */}
                {!perfume.in_stock && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Нет в наличии
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getGenderColor(perfume.gender)}`}>
                    {getGenderLabel(perfume.gender)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {perfume.name}
                </h3>

                <p className="text-sm text-foreground/60 mb-2">
                  {perfume.brand_name} • {perfume.category_name}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-primary">
                    {perfume.price.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-sm text-foreground/60">
                    {perfume.volume_ml} мл
                  </div>
                </div>

                <button
                  className={`w-full mt-3 px-4 py-2 ${
                    perfume.in_stock
                      ? 'btn-primary'
                      : 'btn-secondary opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!perfume.in_stock}
                >
                  {perfume.in_stock ? 'В корзину' : 'Нет в наличии'}
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && perfumes.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-foreground/40">🔍</span>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Ничего не найдено
          </h3>
          <p className="text-foreground/60">
            Попробуйте изменить параметры поиска или фильтры
          </p>
        </div>
      )}
    </div>
  )
}
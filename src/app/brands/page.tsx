'use client'

import { useState, useEffect, useCallback } from 'react'

export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { api } from '@/lib/api'
import Loading from '@/components/Loading'
import Error from '@/components/Error'

interface Brand {
  id: number
  name: string
  description: string
  country?: string
  created_at: string
}

interface PerfumeCount {
  [brandId: number]: number
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [perfumeCounts, setPerfumeCounts] = useState<PerfumeCount>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.brands.getAll()

      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        // Handle both paginated and non-paginated responses
        const brandData = (response.data as { results?: Brand[] }).results || response.data
        setBrands(Array.isArray(brandData) ? brandData : [])
      }
    } catch (err) {
      setError('Ошибка загрузки брендов')
      console.error('Error loading brands:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadPerfumeCounts = useCallback(async () => {
    if (brands.length === 0) return

    try {
      const counts: PerfumeCount = {}

      // Load perfume counts for each brand
      await Promise.all(
        brands.map(async (brand) => {
          try {
            const response = await api.perfumes.getAll({ brand: brand.id.toString() })
            if (response.data) {
              const data = response.data as { count?: number; results?: unknown[] }
              if (data.count !== undefined) {
                counts[brand.id] = data.count
              } else if (data.results) {
                counts[brand.id] = data.results.length
              } else if (Array.isArray(data)) {
                counts[brand.id] = data.length
              }
            }
          } catch (err) {
            console.error(`Error loading perfume count for brand ${brand.id}:`, err)
            counts[brand.id] = 0
          }
        })
      )

      setPerfumeCounts(counts)
    } catch (err) {
      console.error('Error loading perfume counts:', err)
    }
  }, [brands])

  useEffect(() => {
    loadPerfumeCounts()
  }, [brands, loadPerfumeCounts])

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (brand.country && brand.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getBrandLogo = (brandName: string) => {
    const logos: { [key: string]: string } = {
      'Chanel': 'C',
      'Dior': 'D',
      'Gucci': 'G',
      'Louis Vuitton': 'LV',
      'Yves Saint Laurent': 'YSL',
      'Versace': 'V'
    }

    return logos[brandName] || brandName.charAt(0).toUpperCase()
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <Error message={error} />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Бренды</h1>
        <p className="text-foreground/80">
          Откройте для себя коллекции от ведущих мировых брендов парфюмерии
        </p>
      </div>

      {/* Search */}
      <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-foreground/90 mb-2">
            Поиск брендов
          </label>
          <input
            type="text"
            placeholder="Название бренда, страна..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          />
        </div>
      </div>

      {/* Brands Grid */}
      {filteredBrands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <div
              key={brand.id}
              className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Brand Header */}
              <div className="bg-gradient-to-r from-primary to-primary-light p-6 text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                    {getBrandLogo(brand.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{brand.name}</h3>
                    {brand.country && (
                      <p className="text-purple-100 text-sm">{brand.country}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Brand Content */}
              <div className="p-6">
                <p className="text-foreground/80 mb-4 line-clamp-3">
                  {brand.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-foreground/60">
                    Ароматов: {perfumeCounts[brand.id] || 0}
                  </div>
                </div>

                <Link
                  href={`/perfumes?brand=${brand.id}`}
                  className="btn-primary w-full px-4 py-2 text-center block"
                >
                  Смотреть коллекцию
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* No Results */
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-foreground/50">🏷️</span>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Бренды не найдены
          </h3>
          <p className="text-foreground/80">
            Попробуйте изменить поисковый запрос
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-12 bg-card rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Статистика</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {brands.length}
            </div>
            <div className="text-foreground/80">Всего брендов</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {Object.values(perfumeCounts).reduce((sum, count) => sum + count, 0)}
            </div>
            <div className="text-foreground/80">Всего ароматов</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {new Set(brands.map(b => b.country).filter(Boolean)).size}
            </div>
            <div className="text-foreground/80">Стран происхождения</div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { clsx } from 'clsx'
import { Filter, Search, SlidersHorizontal, Sparkles, RefreshCw, X, PackageOpen, Stars, ChevronDown, Check, ArrowUp, Info } from 'lucide-react'
import { Button } from '@/components/ui'
import { DualRangeSlider } from '@/components/ui/DualRangeSlider'
import { FilterSelect } from '@/components/ui/FilterSelect'

import Loading from '@/components/Loading'
import { ProductCard } from '@/components/products/ProductCard'
import {
  api,
  formatGender,
  formatPrice,
  formatVolume,
  formatWeight,
  getImageUrl,
} from '@/lib/api'
import type { Brand, Category, Perfume, Pigment } from '@/types/api'
import { useFavorites } from '@/context/FavoritesContext'
import { useTheme } from '@/context/ThemeContext'

export const dynamic = 'force-dynamic'

type ProductType = 'perfume' | 'pigment'
type ApplicationType = Pigment['application_type']

type CatalogProduct = (Perfume & { productType: 'perfume' }) | (Pigment & { productType: 'pigment' })

type CatalogFilters = {
  search: string
  type: 'all' | ProductType
  brandId: number | 'all'
  categoryId: number | 'all'
  gender: 'all' | 'M' | 'F' | 'U'
  applicationType: 'all' | ApplicationType
  inStockOnly: boolean
  onSaleOnly: boolean
  featuredOnly: boolean
  favoritesOnly: boolean
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'newest'
}

type BudgetShortcut = {
  id: string
  label: string
  description: string
  range: { min: number; max: number }
}

const defaultFilters: CatalogFilters = {
  search: '',
  type: 'all',
  brandId: 'all',
  categoryId: 'all',
  gender: 'all',
  applicationType: 'all',
  inStockOnly: false,
  onSaleOnly: false,
  featuredOnly: false,
  favoritesOnly: false,
  sortBy: 'featured',
}

const APPLICATION_LABELS: Record<ApplicationType, string> = {
  cosmetics: 'Косметика',
  art: 'Арт-проекты',
  industrial: 'Индустрия',
  food: 'Пищевой стандарт',
}

const TYPE_LABELS: Record<ProductType, string> = {
  perfume: 'Парфюмы',
  pigment: 'Пигменты',
}

const SORT_OPTIONS: Array<{ value: CatalogFilters['sortBy']; label: string }> = [
  { value: 'featured', label: 'Кураторский выбор' },
  { value: 'newest', label: 'Сначала новинки' },
  { value: 'price_asc', label: 'По возрастанию цены' },
  { value: 'price_desc', label: 'По убыванию цены' },
]

const unwrapList = <T,>(payload: unknown): T[] => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (typeof payload === 'object') {
    const data = payload as Record<string, unknown>
    if (Array.isArray(data.results)) return data.results as T[]
    if (Array.isArray(data.data)) return data.data as T[]
  }
  return []
}

function toCatalogProducts(items: Perfume[], type: 'perfume'): (Perfume & { productType: 'perfume' })[]
function toCatalogProducts(items: Pigment[], type: 'pigment'): (Pigment & { productType: 'pigment' })[]
function toCatalogProducts(items: Perfume[] | Pigment[], type: ProductType): CatalogProduct[] {
  if (type === 'perfume') {
    return (items as Perfume[]).map((item) => ({
      ...item,
      productType: 'perfume' as const,
    }))
  }

  return (items as Pigment[]).map((item) => ({
    ...item,
    productType: 'pigment' as const,
  }))
}

const isRecentProduct = (product: CatalogProduct, days = 45) => {
  const created = new Date(product.created_at).getTime()
  if (Number.isNaN(created)) return false
  const diffDays = (Date.now() - created) / (1000 * 60 * 60 * 24)
  return diffDays <= days
}

interface FiltersPanelProps {
  filters: CatalogFilters
  setFilters: React.Dispatch<React.SetStateAction<CatalogFilters>>
  priceLimits: { min: number; max: number }
  selectedPrice: { min: number; max: number }
  setSelectedPrice: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>
  appliedPrice: { min: number; max: number }
  setAppliedPrice: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>
  brands: Brand[]
  categories: Category[]
  activeFiltersCount: number
  resetFilters: () => void
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  filters,
  setFilters,
  priceLimits,
  selectedPrice,
  setSelectedPrice,
  appliedPrice,
  setAppliedPrice,
  brands,
  categories,
  activeFiltersCount,
  resetFilters,
}) => {
  const isPriceRangeAvailable = priceLimits.max > priceLimits.min

  const sliderStep = useMemo(() => {
    if (!isPriceRangeAvailable) return 100
    const span = priceLimits.max - priceLimits.min
    if (span <= 200) return Math.max(1, Math.round(span / 10))
    if (span <= 800) return 20
    if (span <= 2000) return 50
    return 100
  }, [isPriceRangeAvailable, priceLimits])

  const chunkStep = useMemo(() => {
    if (!isPriceRangeAvailable) return sliderStep
    const span = priceLimits.max - priceLimits.min
    return Math.max(sliderStep, Math.round(span / 6))
  }, [sliderStep, isPriceRangeAvailable, priceLimits])

  const budgetShortcuts = useMemo<BudgetShortcut[]>(() => {
    if (!isPriceRangeAvailable) return []

    const span = priceLimits.max - priceLimits.min
    const chunk = Math.max(sliderStep * 10, Math.round(span / 3), chunkStep)
    const calmCap = Math.min(priceLimits.max, priceLimits.min + chunk)
    const balanceCap = Math.min(priceLimits.max, priceLimits.min + chunk * 2)

    const shortcuts: BudgetShortcut[] = []

    if (calmCap > priceLimits.min) {
      shortcuts.push({
        id: 'calm',
        label: 'Спокойные покупки',
        description: `до ${formatPrice(calmCap)}`,
        range: {
          min: priceLimits.min,
          max: calmCap,
        },
      })
    }

    if (balanceCap > calmCap) {
      shortcuts.push({
        id: 'balance',
        label: 'Баланс цены',
        description: `${formatPrice(calmCap)} — ${formatPrice(balanceCap)}`,
        range: {
          min: calmCap,
          max: balanceCap,
        },
      })
    }

    if (priceLimits.max > balanceCap) {
      shortcuts.push({
        id: 'premium',
        label: 'Премиум-витрина',
        description: `от ${formatPrice(balanceCap)}`,
        range: {
          min: balanceCap,
          max: priceLimits.max,
        },
      })
    }

    return shortcuts
  }, [isPriceRangeAvailable, priceLimits, chunkStep, sliderStep])

  const activeShortcutId = useMemo(() => {
    const shortcut = budgetShortcuts.find(
      (item) => item.range.min === appliedPrice.min && item.range.max === appliedPrice.max
    )
    return shortcut?.id ?? null
  }, [budgetShortcuts, appliedPrice])

  const isBudgetNarrowed =
    isPriceRangeAvailable && (selectedPrice.min > priceLimits.min || selectedPrice.max < priceLimits.max)

  const applyShortcut = (range: BudgetShortcut['range']) => {
    const newPrice = {
      min: Math.max(priceLimits.min, Math.min(range.min, priceLimits.max)),
      max: Math.min(priceLimits.max, Math.max(range.max, priceLimits.min)),
    }
    setSelectedPrice(newPrice)
    setAppliedPrice(newPrice)
  }

  const handlePriceChange = (field: 'min' | 'max', value: number) => {
    if (priceLimits.max === priceLimits.min) return

    const clamped = Math.min(Math.max(value, priceLimits.min), priceLimits.max)
    let nextPrice = { ...selectedPrice }

    if (field === 'min') {
      nextPrice = {
        min: Math.min(clamped, selectedPrice.max),
        max: selectedPrice.max,
      }
    } else {
      nextPrice = {
        min: selectedPrice.min,
        max: Math.max(clamped, selectedPrice.min),
      }
    }

    setSelectedPrice(nextPrice)
    setAppliedPrice(nextPrice)
  }

  const nudgePrice = (field: 'min' | 'max', direction: 'inc' | 'dec') => {
    if (!isPriceRangeAvailable) return
    const currentValue = field === 'min' ? selectedPrice.min : selectedPrice.max
    const delta = direction === 'inc' ? sliderStep : -sliderStep
    handlePriceChange(field, currentValue + delta)
  }

  return (
    <div className="bg-card border border-border/40 rounded-2xl p-4 sm:p-6 shadow-lg shadow-black/10 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-foreground/60">Фильтр-бар</p>
          <h3 className="text-xl font-semibold text-foreground mt-1">Точная настройка</h3>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 disabled:bg-foreground/10 disabled:text-foreground/40 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
          disabled={!activeFiltersCount}
        >
          Сбросить
        </button>
      </div>

      <section className="space-y-3">
        <FilterSelect
          label="Тип продукта"
          value={filters.type}
          options={[
            { value: 'all', label: 'Все позиции' },
            ...(['perfume', 'pigment'] as ProductType[]).map((t) => ({ value: t, label: TYPE_LABELS[t] })),
          ]}
          onChange={(val) => setFilters((prev) => ({ ...prev, type: val }))}
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <FilterSelect
          label="Бренд"
          value={filters.brandId}
          options={[
            { value: 'all', label: 'Все бренды' },
            ...brands.map((b) => ({ value: b.id, label: b.name })),
          ]}
          onChange={(val) => setFilters((prev) => ({ ...prev, brandId: val }))}
        />

        <FilterSelect
          label="Категория"
          value={filters.categoryId}
          options={[
            { value: 'all', label: 'Все категории' },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
          onChange={(val) => setFilters((prev) => ({ ...prev, categoryId: val }))}
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <FilterSelect
          label="Гендер"
          value={filters.gender}
          disabled={filters.type === 'pigment'}
          options={[
            { value: 'all', label: 'Любой' },
            ...(['M', 'F', 'U'] as const).map((g) => ({ value: g, label: formatGender(g) })),
          ]}
          onChange={(val) => setFilters((prev) => ({ ...prev, gender: val }))}
        />

        <FilterSelect
          label="Назначение"
          value={filters.applicationType}
          disabled={filters.type === 'perfume'}
          options={[
            { value: 'all', label: 'Любое' },
            ...Object.entries(APPLICATION_LABELS).map(([k, v]) => ({ value: k as ApplicationType, label: v })),
          ]}
          onChange={(val) => setFilters((prev) => ({ ...prev, applicationType: val }))}
        />
      </section>

      <section className="space-y-5 rounded-3xl border border-border/50 bg-card/80 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.35em] text-foreground/50">финансовый фокус</p>
            <p className="text-lg font-semibold text-foreground">Гибкий коридор цен</p>
            <p className="text-xs text-foreground/60">Двигайте ползунки или выбирайте карточки, чтобы сузить выбор.</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs uppercase tracking-wide text-foreground/50">Выбрано сейчас</p>
            <p className="text-base font-bold text-primary">
              {isPriceRangeAvailable ? `${formatPrice(selectedPrice.min)} — ${formatPrice(selectedPrice.max)}` : 'Недоступно'}
            </p>
            {isBudgetNarrowed && (
              <button
                type="button"
                onClick={() => {
                  const full = { min: priceLimits.min, max: priceLimits.max }
                  setSelectedPrice(full)
                  setAppliedPrice(full)
                }}
                className="text-xs font-medium text-primary px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all active:scale-95"
              >
                Полный диапазон
              </button>
            )}
          </div>
        </div>

        {isPriceRangeAvailable ? (
          <>
            <div className="space-y-3 rounded-2xl border border-border/40 bg-secondary/30 p-3 sm:p-4">

              <DualRangeSlider
                min={priceLimits.min}
                max={priceLimits.max}
                step={sliderStep}
                value={selectedPrice}
                onChange={setSelectedPrice}
                onFinalChange={setAppliedPrice}
                valueFormatter={formatPrice}
                ariaLabels={['Минимальная цена', 'Максимальная цена']}
                testId="price-range-slider"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2 rounded-2xl border border-border/40 bg-card/80 p-3 sm:p-4 shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-wide text-foreground/50">
                    <span>Старт</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        aria-label="Уменьшить минимальную цену"
                        onClick={() => nudgePrice('min', 'dec')}
                        disabled={selectedPrice.min <= priceLimits.min}
                        className={clsx(
                          'h-6 w-6 rounded-full border border-border/60 text-xs font-semibold text-foreground/70 transition-colors',
                          selectedPrice.min > priceLimits.min
                            ? 'hover:border-primary hover:text-primary'
                            : 'cursor-not-allowed opacity-40'
                        )}
                      >
                        -
                      </button>
                      <button
                        type="button"
                        aria-label="Увеличить минимальную цену"
                        onClick={() => nudgePrice('min', 'inc')}
                        disabled={selectedPrice.min >= selectedPrice.max}
                        className={clsx(
                          'h-6 w-6 rounded-full border border-border/60 text-xs font-semibold text-foreground/70 transition-colors',
                          selectedPrice.min < selectedPrice.max
                            ? 'hover:border-primary hover:text-primary'
                            : 'cursor-not-allowed opacity-40'
                        )}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs text-foreground/50">от</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      step={sliderStep}
                      min={priceLimits.min}
                      max={selectedPrice.max}
                      value={selectedPrice.min}
                      onChange={(event) => handlePriceChange('min', Number(event.target.value))}
                      className="w-full bg-transparent text-lg font-semibold text-foreground placeholder:text-foreground/40 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2 rounded-2xl border border-border/40 bg-card/80 p-3 sm:p-4 shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-wide text-foreground/50">
                    <span>Потолок</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        aria-label="Уменьшить максимальную цену"
                        onClick={() => nudgePrice('max', 'dec')}
                        disabled={selectedPrice.max <= selectedPrice.min}
                        className={clsx(
                          'h-6 w-6 rounded-full border border-border/60 text-xs font-semibold text-foreground/70 transition-colors',
                          selectedPrice.max > selectedPrice.min
                            ? 'hover:border-primary hover:text-primary'
                            : 'cursor-not-allowed opacity-40'
                        )}
                      >
                        -
                      </button>
                      <button
                        type="button"
                        aria-label="Увеличить максимальную цену"
                        onClick={() => nudgePrice('max', 'inc')}
                        disabled={selectedPrice.max >= priceLimits.max}
                        className={clsx(
                          'h-6 w-6 rounded-full border border-border/60 text-xs font-semibold text-foreground/70 transition-colors',
                          selectedPrice.max < priceLimits.max
                            ? 'hover:border-primary hover:text-primary'
                            : 'cursor-not-allowed opacity-40'
                        )}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs text-foreground/50">до</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      step={sliderStep}
                      min={selectedPrice.min}
                      max={priceLimits.max}
                      value={selectedPrice.max}
                      onChange={(event) => handlePriceChange('max', Number(event.target.value))}
                      className="w-full bg-transparent text-lg font-semibold text-foreground placeholder:text-foreground/40 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {!!budgetShortcuts.length && (
              <div className="grid gap-3 sm:grid-cols-3">
                {budgetShortcuts.map((shortcut) => (
                  <button
                    key={shortcut.id}
                    type="button"
                    onClick={() => applyShortcut(shortcut.range)}
                    className={clsx(
                      'rounded-2xl border border-border/40 bg-secondary/20 p-4 text-left transition-all duration-200 hover:border-primary/50 hover:bg-primary/5',
                      activeShortcutId === shortcut.id && 'border-primary bg-primary/10 shadow-md'
                    )}
                  >
                    <p className="text-sm font-semibold text-foreground">{shortcut.label}</p>
                    <p className="text-xs text-foreground/60">{shortcut.description}</p>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/50 bg-secondary/30 p-4 text-sm text-foreground/60">
            Как только появятся товары с ценой, здесь разблокируется гибкий фильтр бюджета.
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <label className="relative flex flex-col justify-between gap-2 rounded-xl border border-border/50 bg-secondary/40 p-3 cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/10">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground leading-tight">В наличии</p>
              <p className="text-[10px] text-foreground/60 leading-tight">Мгновенная доставка</p>
            </div>
            <div className={clsx(
              "w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-200",
              filters.inStockOnly ? "bg-primary border-primary" : "border-foreground/30 bg-transparent"
            )}>
              {filters.inStockOnly && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={filters.inStockOnly}
            onChange={(event) => setFilters((prev) => ({ ...prev, inStockOnly: event.target.checked }))}
          />
        </label>

        <label className="relative flex flex-col justify-between gap-2 rounded-xl border border-border/50 bg-secondary/40 p-3 cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/10">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground leading-tight">Избранное</p>
              <p className="text-[10px] text-foreground/60 leading-tight">Мои избранные товары</p>
            </div>
            <div className={clsx(
              "w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-200",
              filters.favoritesOnly ? "bg-primary border-primary" : "border-foreground/30 bg-transparent"
            )}>
              {filters.favoritesOnly && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={filters.favoritesOnly}
            onChange={(event) => setFilters((prev) => ({ ...prev, favoritesOnly: event.target.checked }))}
          />
        </label>
      </section>
    </div>
  )
}

export default function ProductsPage() {
  const { isFavorite } = useFavorites()
  const { theme } = useTheme()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  // Инициализируем фильтры из URL параметров
  const initialFilters = useMemo(() => {
    const urlSearch = searchParams.get('search')
    const urlType = searchParams.get('type')
    const urlGender = searchParams.get('gender')
    const urlBrandId = searchParams.get('brandId')
    const urlCategoryId = searchParams.get('categoryId')
    const urlInStockOnly = searchParams.get('inStockOnly')
    const urlOnSaleOnly = searchParams.get('onSaleOnly')
    
    return {
      ...defaultFilters,
      search: urlSearch || defaultFilters.search,
      type: (urlType === 'perfume' || urlType === 'pigment') ? urlType : defaultFilters.type,
      gender: (urlGender === 'M' || urlGender === 'F' || urlGender === 'U') ? urlGender : defaultFilters.gender,
      brandId: urlBrandId ? (isNaN(Number(urlBrandId)) ? 'all' : Number(urlBrandId)) : defaultFilters.brandId,
      categoryId: urlCategoryId ? (isNaN(Number(urlCategoryId)) ? 'all' : Number(urlCategoryId)) : defaultFilters.categoryId,
      inStockOnly: urlInStockOnly === 'true' ? true : defaultFilters.inStockOnly,
      onSaleOnly: urlOnSaleOnly === 'true' ? true : defaultFilters.onSaleOnly,
    }
  }, [searchParams])
  
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters)
  const [priceLimits, setPriceLimits] = useState({ min: 0, max: 0 })
  const [selectedPrice, setSelectedPrice] = useState({ min: 0, max: 0 })
  const [appliedPrice, setAppliedPrice] = useState({ min: 0, max: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefetching, setIsRefetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFiltersExpanded, setFiltersExpanded] = useState(false)
  const [isSortMenuOpen, setSortMenuOpen] = useState(false)
  const [isBrandMenuOpen, setBrandMenuOpen] = useState(false)
  const [isCategoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const searchPanelRef = useRef<HTMLDivElement | null>(null)
  const sortMenuRef = useRef<HTMLDivElement | null>(null)
  const brandMenuRef = useRef<HTMLDivElement | null>(null)
  const categoryMenuRef = useRef<HTMLDivElement | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Infinite scroll state
  const [displayedCount, setDisplayedCount] = useState(12)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const PAGE_SIZE = 12
  const ITEMS_PER_PAGE = PAGE_SIZE
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{ total: number; next: string | null; previous: string | null }>({
    total: 0,
    next: null,
    previous: null,
  })

  // Scroll to top button state
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    if (searchPanelRef.current) {
      searchPanelRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Info blocks visibility
  const [isInfoVisible, setInfoVisible] = useState(false)

  const sortToOrdering: Record<CatalogFilters['sortBy'], string> = {
    featured: '-created_at',
    newest: '-created_at',
    price_asc: 'price',
    price_desc: '-price',
  }

  const buildQueryParams = useCallback((type: 'perfume' | 'pigment'): Record<string, string> => {
    const params: Record<string, string> = {
      page: page.toString(),
      page_size: PAGE_SIZE.toString(),
      ordering: sortToOrdering[filters.sortBy],
    }
    if (filters.search.trim()) params.search = filters.search.trim()
    if (filters.brandId !== 'all') params.brand = String(filters.brandId)
    if (filters.categoryId !== 'all') params.category = String(filters.categoryId)
    if (filters.inStockOnly) params.in_stock = 'true'
    if (filters.onSaleOnly) params.on_sale = 'true'
    if (filters.featuredOnly) params.featured = 'true'
    if (appliedPrice.min > 0) params.min_price = String(appliedPrice.min)
    if (appliedPrice.max > 0) params.max_price = String(appliedPrice.max)

    if (type === 'perfume' && filters.gender !== 'all') {
      params.gender = filters.gender
    }
    if (type === 'pigment' && filters.applicationType !== 'all') {
      params.application_type = filters.applicationType
    }
    return params
  }, [PAGE_SIZE, appliedPrice.max, appliedPrice.min, filters.applicationType, filters.brandId, filters.categoryId, filters.featuredOnly, filters.gender, filters.inStockOnly, filters.onSaleOnly, filters.search, filters.sortBy, page])

  const isServerPaginated = filters.type !== 'all'

  const loadCatalog = useCallback(async (options: { silent?: boolean } = {}) => {
    setError(null)
    if (options.silent) {
      setIsRefetching(true)
    } else {
      setIsLoading(true)
    }

    try {
      const shouldLoadPerfumes = filters.type === 'all' || filters.type === 'perfume'
      const shouldLoadPigments = filters.type === 'all' || filters.type === 'pigment'

      const [perfumesResponse, pigmentsResponse, brandsResponse, categoriesResponse] = await Promise.all([
        shouldLoadPerfumes ? api.perfumes.getAll(buildQueryParams('perfume')) : Promise.resolve({ data: [] }),
        shouldLoadPigments ? api.pigments.getAll(buildQueryParams('pigment')) : Promise.resolve({ data: [] }),
        api.brands.getAll(),
        api.categories.getAll(),
      ])

      const perfumesPayload = perfumesResponse?.data as any
      const pigmentsPayload = pigmentsResponse?.data as any

      const perfumes = shouldLoadPerfumes ? toCatalogProducts(unwrapList<Perfume>(perfumesPayload), 'perfume') : []
      const pigments = shouldLoadPigments ? toCatalogProducts(unwrapList<Pigment>(pigmentsPayload), 'pigment') : []
      const combined = [...perfumes, ...pigments].sort((a, b) => Number(b.featured) - Number(a.featured))

      if (filters.type === 'perfume') {
        setPagination({
          total: perfumesPayload?.count ?? perfumes.length,
          next: perfumesPayload?.next ?? null,
          previous: perfumesPayload?.previous ?? null,
        })
      } else if (filters.type === 'pigment') {
        setPagination({
          total: pigmentsPayload?.count ?? pigments.length,
          next: pigmentsPayload?.next ?? null,
          previous: pigmentsPayload?.previous ?? null,
        })
      } else {
        setPagination({
          total: combined.length,
          next: null,
          previous: null,
        })
      }

      setProducts(combined)
      setBrands(unwrapList<Brand>(brandsResponse.data))
      setCategories(unwrapList<Category>(categoriesResponse.data))

      const priceValues = combined.map((product) => product.price)
      const minPrice = priceValues.length ? Math.min(...priceValues) : 0
      const maxPrice = priceValues.length ? Math.max(...priceValues) : 0

      const limitsChanged = priceLimits.min !== minPrice || priceLimits.max !== maxPrice
      if (limitsChanged) {
        setPriceLimits({ min: minPrice, max: maxPrice })
      }

      const clampValue = (val: number, minV: number, maxV: number) => Math.min(Math.max(val, minV), maxV)

      const initialMin = Math.max(minPrice, priceLimits.min || minPrice)
      const initialMax = Math.min(maxPrice, priceLimits.max || maxPrice)

      // Если фильтр цены ещё не выбран (по умолчанию 0/0), ставим крайние значения из БД
      const nextSelected = {
        min: selectedPrice.min === 0 && selectedPrice.max === 0 ? initialMin : clampValue(selectedPrice.min, minPrice, maxPrice),
        max: selectedPrice.min === 0 && selectedPrice.max === 0 ? initialMax : clampValue(selectedPrice.max, minPrice, maxPrice),
      }
      if (nextSelected.min !== selectedPrice.min || nextSelected.max !== selectedPrice.max) {
        setSelectedPrice(nextSelected)
      }

      const nextApplied = {
        min: appliedPrice.min === 0 && appliedPrice.max === 0 ? initialMin : clampValue(appliedPrice.min, minPrice, maxPrice),
        max: appliedPrice.min === 0 && appliedPrice.max === 0 ? initialMax : clampValue(appliedPrice.max, minPrice, maxPrice),
      }
      if (nextApplied.min !== appliedPrice.min || nextApplied.max !== appliedPrice.max) {
        setAppliedPrice(nextApplied)
      }
      setLastUpdated(new Date().toISOString())
    } catch (err) {
      console.error('Ошибка загрузки каталога', err)
      setError('Не удалось загрузить продукты. Попробуйте обновить страницу.')
    } finally {
      if (options.silent) {
        setIsRefetching(false)
      } else {
        setIsLoading(false)
      }
    }
  }, [filters, appliedPrice, PAGE_SIZE, page, buildQueryParams, setPagination])

  const firstLoadRef = useRef(true)
  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false
      loadCatalog()
    } else {
      loadCatalog({ silent: true })
    }
  }, [loadCatalog])

  useEffect(() => {
    setPage(1)
  }, [
    filters.type,
    filters.brandId,
    filters.categoryId,
    filters.gender,
    filters.applicationType,
    filters.inStockOnly,
    filters.onSaleOnly,
    filters.featuredOnly,
    filters.search,
    appliedPrice.min,
    appliedPrice.max,
  ])

  // Синхронизируем фильтры с URL параметрами при изменении URL
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    const urlType = searchParams.get('type')
    const urlGender = searchParams.get('gender')
    const urlBrandId = searchParams.get('brandId')
    const urlCategoryId = searchParams.get('categoryId')
    const urlInStockOnly = searchParams.get('inStockOnly')
    const urlOnSaleOnly = searchParams.get('onSaleOnly')
    
    setFilters(prev => ({
      ...prev,
      search: urlSearch || prev.search,
      type: (urlType === 'perfume' || urlType === 'pigment') ? urlType : prev.type,
      gender: (urlGender === 'M' || urlGender === 'F' || urlGender === 'U') ? urlGender : prev.gender,
      brandId: urlBrandId ? (isNaN(Number(urlBrandId)) ? 'all' : Number(urlBrandId)) : prev.brandId,
      categoryId: urlCategoryId ? (isNaN(Number(urlCategoryId)) ? 'all' : Number(urlCategoryId)) : prev.categoryId,
      inStockOnly: urlInStockOnly === 'true' ? true : (urlInStockOnly === null ? prev.inStockOnly : false),
      onSaleOnly: urlOnSaleOnly === 'true' ? true : (urlOnSaleOnly === null ? prev.onSaleOnly : false),
    }))
  }, [searchParams])

  useEffect(() => {
    if (isFiltersExpanded && searchPanelRef.current) {
      searchPanelRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [isFiltersExpanded])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setSortMenuOpen(false)
      }
      if (brandMenuRef.current && !brandMenuRef.current.contains(event.target as Node)) {
        setBrandMenuOpen(false)
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setCategoryMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Reset displayed count when filters change
  useEffect(() => {
    if (isServerPaginated) {
      setDisplayedCount(products.length)
      return
    }
    setDisplayedCount(ITEMS_PER_PAGE)
  }, [filters, appliedPrice, ITEMS_PER_PAGE, isServerPaginated, products.length])

  const brandMap = useMemo(() => new Map(brands.map((brand) => [brand.id, brand.name])), [brands])
  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories])

  const filteredProducts = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase()
    const priceGuard = priceLimits.max > priceLimits.min

    const filtered = products.filter((product) => {
      if (filters.type !== 'all' && product.productType !== filters.type) return false

      if (filters.brandId !== 'all') {
        const productBrandId = product.brand?.id
        if (!productBrandId || productBrandId !== filters.brandId) return false
      }

      if (filters.categoryId !== 'all' && product.category.id !== filters.categoryId) return false

      if (filters.gender !== 'all') {
        if (product.productType !== 'perfume') return false
        if (product.gender !== filters.gender) return false
      }

      if (filters.applicationType !== 'all') {
        if (product.productType !== 'pigment') return false
        if (product.application_type !== filters.applicationType) return false
      }

      if (filters.inStockOnly && !product.in_stock) return false
      if (filters.onSaleOnly && !product.is_on_sale) return false
      if (filters.featuredOnly && !product.featured) return false
      
      if (filters.favoritesOnly && !isFavorite(product.id, product.productType)) return false

      if (searchTerm) {
        const haystack = [
          product.name,
          product.brand?.name,
          product.category?.name,
          product.description,
          'gender' in product ? formatGender(product.gender) : '',
          'application_type' in product ? APPLICATION_LABELS[product.application_type as ApplicationType] : '',
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        if (!haystack.includes(searchTerm)) return false
      }

      if (priceGuard) {
        if (product.price < appliedPrice.min || product.price > appliedPrice.max) return false
      }

      return true
    })

    const priceValue = (p: CatalogProduct) =>
      (typeof p.final_price === 'number' ? p.final_price : undefined) ??
      (typeof p.discount_price === 'number' ? p.discount_price : undefined) ??
      p.price

    const sorters: Record<CatalogFilters['sortBy'], (a: CatalogProduct, b: CatalogProduct) => number> = {
      featured: (a, b) => Number(b.featured) - Number(a.featured),
      newest: (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      price_asc: (a, b) => priceValue(a) - priceValue(b),
      price_desc: (a, b) => priceValue(b) - priceValue(a),
    }

    return filtered.sort(sorters[filters.sortBy])
  }, [products, filters, appliedPrice, priceLimits, isFavorite])

  const totalPages = Math.max(1, Math.ceil((pagination.total || filteredProducts.length || 1) / PAGE_SIZE))

  // Intersection Observer for infinite scroll - must be after filteredProducts is computed
  useEffect(() => {
    if (isServerPaginated) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    // Don't observe if all items are already displayed
    if (displayedCount >= filteredProducts.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !isLoadingMore && displayedCount < filteredProducts.length) {
          setIsLoadingMore(true)
          // Simulate loading delay for smooth UX
          setTimeout(() => {
            setDisplayedCount((prev) => prev + ITEMS_PER_PAGE)
            setIsLoadingMore(false)
          }, 300)
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    )

    observer.observe(sentinel)

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel)
      }
    }
  }, [isLoadingMore, ITEMS_PER_PAGE, filteredProducts.length, displayedCount, isServerPaginated])

  const heroHighlights = useMemo(() => {
    const perfumesCount = products.filter((product) => product.productType === 'perfume').length
    const pigmentsCount = products.filter((product) => product.productType === 'pigment').length
    const recentCount = products.filter((product) => isRecentProduct(product)).length
    const curatedCount = products.filter((product) => product.featured).length
    const stockedCount = products.filter((product) => product.in_stock).length
    const brandCount = new Set(
      products
        .map((product) => product.brand?.id)
        .filter((brandId): brandId is number => typeof brandId === 'number')
    ).size

    return [
      { label: 'Парфюмы', value: perfumesCount },
      { label: 'Пигменты', value: pigmentsCount },
      { label: 'Новинки', value: recentCount },
      { label: 'В наличии', value: stockedCount },
      { label: 'Избранное', value: curatedCount },
      { label: 'Бренды', value: brandCount },
    ]
  }, [products])

  const currentSortLabel = useMemo(() => {
    return SORT_OPTIONS.find((option) => option.value === filters.sortBy)?.label || SORT_OPTIONS[0].label
  }, [filters.sortBy])

  const currentBrandLabel = useMemo(() => {
    if (filters.brandId === 'all') return 'Все бренды'
    return brandMap.get(filters.brandId) || 'Все бренды'
  }, [filters.brandId, brandMap])

  const currentCategoryLabel = useMemo(() => {
    if (filters.categoryId === 'all') return 'Все категории'
    return categoryMap.get(filters.categoryId) || 'Все категории'
  }, [filters.categoryId, categoryMap])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search.trim()) count += 1
    if (filters.type !== 'all') count += 1
    if (filters.brandId !== 'all') count += 1
    if (filters.categoryId !== 'all') count += 1
    if (filters.gender !== 'all') count += 1
    if (filters.applicationType !== 'all') count += 1
    if (filters.inStockOnly) count += 1
  if (filters.onSaleOnly) count += 1
    if (filters.featuredOnly) count += 1
    if (filters.favoritesOnly) count += 1

    if (priceLimits.max > priceLimits.min) {
      if (appliedPrice.min > priceLimits.min || appliedPrice.max < priceLimits.max) {
        count += 1
      }
    }

    return count
  }, [filters, appliedPrice, priceLimits])

  const resetFilters = () => {
    setFilters(defaultFilters)
    setSelectedPrice({
      min: priceLimits.min,
      max: priceLimits.max,
    })
    setAppliedPrice({
      min: priceLimits.min,
      max: priceLimits.max,
    })
  }

  const filterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onClear: () => void }> = []

    if (filters.brandId !== 'all') {
      chips.push({
        key: 'brand',
        label: `Бренд: ${brandMap.get(filters.brandId) ?? filters.brandId}`,
        onClear: () => setFilters((prev) => ({ ...prev, brandId: 'all' })),
      })
    }

    if (filters.categoryId !== 'all') {
      chips.push({
        key: 'category',
        label: `Категория: ${categoryMap.get(filters.categoryId) ?? filters.categoryId}`,
        onClear: () => setFilters((prev) => ({ ...prev, categoryId: 'all' })),
      })
    }

    if (filters.gender !== 'all') {
      chips.push({
        key: 'gender',
        label: `Гендер: ${formatGender(filters.gender)}`,
        onClear: () => setFilters((prev) => ({ ...prev, gender: 'all' })),
      })
    }

    if (filters.applicationType !== 'all') {
      chips.push({
        key: 'application',
        label: `Назначение: ${APPLICATION_LABELS[filters.applicationType]}`,
        onClear: () => setFilters((prev) => ({ ...prev, applicationType: 'all' })),
      })
    }

    if (filters.inStockOnly) {
      chips.push({
        key: 'stock',
        label: 'Только в наличии',
        onClear: () => setFilters((prev) => ({ ...prev, inStockOnly: false })),
      })
    }

    if (filters.onSaleOnly) {
      chips.push({
        key: 'sale',
        label: 'Со скидкой',
        onClear: () => setFilters((prev) => ({ ...prev, onSaleOnly: false })),
      })
    }

    if (filters.featuredOnly) {
      chips.push({
        key: 'featured',
        label: 'Избранная коллекция',
        onClear: () => setFilters((prev) => ({ ...prev, featuredOnly: false })),
      })
    }

    if (filters.favoritesOnly) {
      chips.push({
        key: 'favorites',
        label: 'Мои избранные',
        onClear: () => setFilters((prev) => ({ ...prev, favoritesOnly: false })),
      })
    }

    if (filters.type !== 'all') {
      chips.push({
        key: 'type',
        label: TYPE_LABELS[filters.type],
        onClear: () => setFilters((prev) => ({ ...prev, type: 'all' })),
      })
    }

    if (filters.search.trim()) {
      chips.push({
        key: 'search',
        label: `Поиск: “${filters.search.trim()}”`,
        onClear: () => setFilters((prev) => ({ ...prev, search: '' })),
      })
    }

    if (priceLimits.max > priceLimits.min) {
      if (appliedPrice.min > priceLimits.min || appliedPrice.max < priceLimits.max) {
        chips.push({
          key: 'price',
          label: `Цена: ${formatPrice(appliedPrice.min)} — ${formatPrice(appliedPrice.max)}`,
          onClear: () => {
            const fullRange = { min: priceLimits.min, max: priceLimits.max }
            setSelectedPrice(fullRange)
            setAppliedPrice(fullRange)
          },
        })
      }
    }

    return chips
  }, [filters, appliedPrice, priceLimits, brandMap, categoryMap])

  const quickFilters = [
    {
      id: 'new',
      label: 'Новинки',
      description: 'Последние поступления',
      active: filters.sortBy === 'newest',
      onToggle: () =>
        setFilters((prev) => ({
          ...prev,
          sortBy: prev.sortBy === 'newest' ? 'featured' : 'newest',
        })),
    },
    {
      id: 'featured',
      label: 'Избранные ноты',
      description: 'Кураторские подборки',
      active: filters.featuredOnly,
      onToggle: () =>
        setFilters((prev) => ({
          ...prev,
          featuredOnly: !prev.featuredOnly,
        })),
    },
    {
      id: 'stock',
      label: 'Быстрая доставка',
      description: 'Только в наличии',
      active: filters.inStockOnly,
      onToggle: () =>
        setFilters((prev) => ({
          ...prev,
          inStockOnly: !prev.inStockOnly,
        })),
    },
    {
      id: 'sale',
      label: 'Акции',
      description: 'Товары со скидкой',
      active: filters.onSaleOnly,
      onToggle: () =>
        setFilters((prev) => ({
          ...prev,
          onSaleOnly: !prev.onSaleOnly,
        })),
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Собираем вашу витрину..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-6 px-4">
        <div className="w-20 h-20 rounded-full border border-dashed border-primary/50 flex items-center justify-center">
          <PackageOpen className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold mb-2">Что-то пошло не так</h1>
          <p className="text-foreground/70">{error}</p>
        </div>
        <Button onClick={() => loadCatalog()} isLoading={isRefetching}>
          Попробовать снова
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <button
            type="button"
            onClick={() => setInfoVisible(!isInfoVisible)}
            className="flex w-full items-center justify-between group py-4 text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={clsx(
                'h-px w-8 bg-slate-300 transition-all group-hover:w-12 group-hover:bg-emerald-500 dark:bg-slate-600 dark:group-hover:bg-emerald-400',
                isInfoVisible ? 'w-12 bg-emerald-500 dark:bg-emerald-400' : ''
              )} />
              <span className="text-lg font-semibold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-emerald-700 dark:text-slate-400 dark:group-hover:text-emerald-300">
                О проекте и рекомендации
              </span>
            </div>
            <div className={clsx(
              'rounded-full border border-slate-200 p-2 transition-all group-hover:border-emerald-200 group-hover:bg-emerald-50 dark:border-white/10 dark:group-hover:border-emerald-500/30 dark:group-hover:bg-emerald-500/10',
              isInfoVisible ? 'rotate-180 bg-slate-50 dark:bg-white/5' : ''
            )}>
              <ChevronDown className={clsx(
                'h-5 w-5 text-slate-400 transition-colors group-hover:text-emerald-600 dark:text-slate-500 dark:group-hover:text-emerald-400',
                isInfoVisible ? 'text-emerald-600 dark:text-emerald-400' : ''
              )} />
            </div>
          </button>

          <div
            className={clsx(
              'transition-all duration-500 ease-in-out overflow-hidden',
              isInfoVisible ? 'opacity-100 max-h-[2000px] mt-6' : 'max-h-0 opacity-0'
            )}
          >
            <section className="grid gap-4 md:grid-cols-2">
            <div className="bg-card/80 border border-border/60 dark:border-border/30 rounded-2xl p-5 relative overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
              <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-br from-primary/20 to-transparent blur-3xl pointer-events-none" />
              <p className="text-xs uppercase tracking-widest text-foreground/60">Витрина NP Academy</p>
              <h1 className="text-xl font-semibold text-foreground mt-2 mb-2 leading-tight">
                Все продукты в одном месте
              </h1>
              <p className="text-sm text-foreground/70 max-w-xl">
                Подберите коллекцию по бренду, настроению, бюджету или наличию.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {quickFilters.map((quickFilter) => (
                  <button
                    key={quickFilter.id}
                    type="button"
                    onClick={quickFilter.onToggle}
                    className={clsx(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                      quickFilter.active
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                        : 'border-border/60 text-foreground/80 hover:border-primary/70'
                    )}
                  >
                    <span className="block font-semibold">{quickFilter.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {heroHighlights.map((highlight) => (
                  <div key={highlight.label} className="rounded-xl bg-secondary/40 border border-border/40 p-2 text-center">
                    <p className="text-lg font-semibold text-primary">{highlight.value}</p>
                    <p className="text-[10px] text-foreground/70">{highlight.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-5 flex flex-col justify-between animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
              <div>
                <div className={clsx(
                  'inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs',
                  theme === 'dark' 
                    ? 'bg-white/10 text-white' 
                    : 'bg-primary/10 text-primary'
                )}>
                  <Sparkles className={clsx('w-3 h-3', theme === 'dark' ? 'text-white' : 'text-primary')} />
                  Режим подбора
                </div>
                <h3 className="text-lg font-semibold text-foreground mt-3">
                  Нужна персональная рекомендация?
                </h3>
                <p className="text-sm text-foreground/70 mt-2">
                  Сохраните понравившиеся позиции или переходите на страницу продукта за подробностями.
                </p>
              </div>
              <div className="mt-4 space-y-2 text-xs text-foreground/70">
                <div className="flex items-center gap-2">
                  <Stars className={clsx('w-3 h-3', theme === 'dark' ? 'text-white' : 'text-primary')} />
                  Курируем новое поступление каждую неделю
                </div>
                <div className="flex items-center gap-2">
                  <Filter className={clsx('w-3 h-3', theme === 'dark' ? 'text-white' : 'text-primary')} />
                  Фильтры работают без перезагрузки страницы
                </div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className={clsx('w-3 h-3', theme === 'dark' ? 'text-white' : 'text-primary')} />
                  Сохраняем выбранные параметры
                </div>
                {lastUpdated && (
                  <p className="text-[10px] text-foreground/60 mt-2">
                    Обновлено {new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(lastUpdated))}
                  </p>
                )}
              </div>
            </div>
          </section>
          </div>
        </div>

        <section className="space-y-6">
          <div
            ref={searchPanelRef}
            className="bg-card/80 border border-border/80 rounded-2xl p-4 md:p-6 shadow-lg shadow-black/10 space-y-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner shadow-primary/10 z-10">
                  <Search className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  placeholder="Название, бренд, ноты..."
                  value={filters.search}
                  onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                  style={{ paddingLeft: '72px' }}
                  className="w-full rounded-2xl border border-border/60 bg-secondary/60 pr-12 py-3 text-base transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-foreground/50"
                />
                {filters.search && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                    onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                    aria-label="Очистить поиск"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:flex-none">
                <div ref={sortMenuRef} className="relative w-full sm:w-64">
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isSortMenuOpen}
                    onClick={() => setSortMenuOpen((prev) => !prev)}
                    className="w-full rounded-2xl border border-border/60 bg-secondary/70 px-4 py-3 text-left transition-colors duration-200 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-foreground/50">Сортировка</p>
                        <p className="font-semibold text-foreground">{currentSortLabel}</p>
                      </div>
                      <ChevronDown
                        className={clsx(
                          'h-4 w-4 text-primary transition-transform duration-200',
                          isSortMenuOpen && 'rotate-180'
                        )}
                      />
                    </div>
                  </button>
                  <div
                    className={clsx(
                      'absolute right-0 mt-2 w-full rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/20 transition-all duration-200 origin-top z-40',
                      isSortMenuOpen
                        ? 'visible scale-100 opacity-100'
                        : 'pointer-events-none invisible scale-95 opacity-0'
                    )}
                  >
                    <ul className="py-2 overflow-x-hidden" role="listbox">
                      {SORT_OPTIONS.map((option) => (
                        <li key={option.value}>
                          <button
                            type="button"
                            className={clsx(
                              'w-full px-4 py-3 text-sm text-left transition-all duration-200 hover:translate-x-1 hover:bg-primary/10',
                              filters.sortBy === option.value
                                ? 'bg-primary/15 text-primary font-semibold'
                                : 'text-foreground/80'
                            )}
                            onClick={() => {
                              setFilters((prev) => ({ ...prev, sortBy: option.value }))
                              setSortMenuOpen(false)
                            }}
                          >
                            {option.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  className="group w-full sm:w-auto flex-nowrap gap-2 shadow-lg shadow-primary/30 hover:-translate-y-0.5 focus-visible:ring-primary rounded-2xl"
                  onClick={() => loadCatalog({ silent: true })}
                >
                  <span className="flex items-center gap-2 leading-none">
                    <RefreshCw
                      className={clsx(
                        'h-5 w-5 transition-transform duration-500 group-hover:rotate-180 group-active:rotate-360',
                        isRefetching && 'animate-spin'
                      )}
                    />
                    <span className="font-semibold">Обновить витрину</span>
                  </span>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-between">
              <p className="text-sm text-foreground/60">
                Найдено {isServerPaginated ? pagination.total : filteredProducts.length}{' '}
                {isServerPaginated ? `(страница ${page} из ${totalPages})` : `из ${products.length}`}
              </p>
            </div>

            {filterChips.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {filterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onClear}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-foreground hover:border-primary hover:bg-primary/20 transition-colors"
                  >
                    {chip.label}
                    <X className="w-3 h-3" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-sm font-medium text-primary underline underline-offset-4"
                >
                  Сбросить все
                </button>
              </div>
            )}
          </div>

          <div className="md:sticky md:top-[120px] z-30">
            <div className="rounded-2xl border border-primary/60 bg-[rgba(59,113,113,0.9)] shadow-lg shadow-primary/40 text-white">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-left gap-4"
                onClick={() => setFiltersExpanded((prev) => !prev)}
                aria-expanded={isFiltersExpanded}
              >
                <div>
                  <p className="text-sm font-semibold text-white">Расширенные фильтры</p>
                  <p className="text-xs text-white/80">
                    Настройте подбор по типу продукта, бренду, цене и наличию
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {activeFiltersCount > 0 && (
                    <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-primary text-xs text-white px-2">
                      {activeFiltersCount}
                    </span>
                  )}
                  <SlidersHorizontal
                    className={clsx(
                      'w-5 h-5 text-white transition-transform duration-300',
                      isFiltersExpanded && 'rotate-90'
                    )}
                  />
                </div>
              </button>
            </div>
          </div>

          {isFiltersExpanded && (
            <>
              <FiltersPanel
                filters={filters}
                setFilters={setFilters}
                priceLimits={priceLimits}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
                appliedPrice={appliedPrice}
                setAppliedPrice={setAppliedPrice}
                brands={brands}
                categories={categories}
                activeFiltersCount={activeFiltersCount}
                resetFilters={resetFilters}
              />
              <div className="flex flex-wrap justify-end gap-3 mt-4">
                <Button
                  type="button"
                  variant="glass"
                  onClick={() => setFiltersExpanded(false)}
                  className="w-full sm:w-auto"
                >
                  Скрыть
                </Button>
              </div>
            </>
          )}

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border/50 rounded-3xl bg-card/60">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-border/40 flex items-center justify-center">
                <Filter className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Ничего не найдено</h3>
              <p className="text-foreground/70 max-w-2xl mx-auto">
                Попробуйте изменить фильтры или расширить диапазон цены. Мы постоянно пополняем каталог и
                наверняка сможем вас удивить.
              </p>
              <Button type="button" className="mt-6" onClick={resetFilters}>
                Сбросить фильтры
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.slice(0, displayedCount).map((product) => (
                  <ProductCard
                    key={`${product.productType}-${product.id}`}
                    product={product}
                    isRecent={isRecentProduct(product)}
                  />
                ))}
              </div>

              {isServerPaginated && totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
                  <p className="text-sm text-foreground/60">
                    Показано {filteredProducts.length} из {pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="glass"
                      disabled={page <= 1 || !pagination.previous}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    >
                      Назад
                    </Button>
                    <span className="text-sm text-foreground/70">
                      {page} / {totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="primary"
                      disabled={!pagination.next && page >= totalPages}
                      onClick={() => setPage((prev) => prev + 1)}
                    >
                      Далее
                    </Button>
                  </div>
                </div>
              )}

              {/* Sentinel element for infinite scroll */}
              {!isServerPaginated && displayedCount < filteredProducts.length && (
                <div ref={sentinelRef} className="py-8 flex justify-center">
                  {isLoadingMore && (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <p className="text-sm text-foreground/60">Загружаем ещё товары...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Show completion message when all products are displayed */}
              {!isServerPaginated &&
                displayedCount >= filteredProducts.length &&
                filteredProducts.length > ITEMS_PER_PAGE && (
                <div className="py-8 text-center">
                  <p className="text-sm text-foreground/60">
                    Показаны все {filteredProducts.length} товаров
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Вернуться к началу списка"
          className="fixed bottom-25 right-4 md:bottom-8 md:right-8 z-50 inline-flex items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 w-11 h-11 md:w-12 md:h-12 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

import useSWR from 'swr'
import { Perfume, Pigment } from '@/types/api'

// Утилита для сохранения breadcrumb пути
export function saveBreadcrumbPath(steps: Array<{ label: string; href: string }>) {
  if (typeof window !== 'undefined') {
    // Очищаем старый путь перед сохранением нового
    sessionStorage.removeItem('breadcrumbPath');

    const data = { steps, timestamp: Date.now() };
    console.log('saveBreadcrumbPath: saving data:', data);
    sessionStorage.setItem('breadcrumbPath', JSON.stringify(data));
  }
}

interface FeaturedProduct extends Perfume {
  type: 'perfume'
}

interface FeaturedPigment extends Pigment {
  type: 'pigment'
}

export type FeaturedItem = FeaturedProduct | FeaturedPigment

// SWR fetcher function
const fetcher = async (url: string) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
  // URL should not include /api/ prefix since API_BASE_URL already has it
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  console.log('SWR Fetcher: Making request to:', fullUrl)
  const response = await fetch(fullUrl, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    console.error('SWR Fetcher: Request failed:', response.status, response.statusText)
    throw new Error(`An error occurred while fetching the data: ${response.status} ${response.statusText}`)
  }
  const data = await response.json()
  console.log('SWR Fetcher: Received data:', data)
  return data
}

// Custom hooks for API data with SWR caching
export function usePerfumes(params?: Record<string, string>) {
  const queryString = params ? new URLSearchParams(params).toString() : ''
  const url = `/perfumes/${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000, // 5 seconds
  })

  return {
    perfumes: data?.results || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function usePigments(params?: Record<string, string>) {
  const queryString = params ? new URLSearchParams(params).toString() : ''
  const url = `/pigments/${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  })

  return {
    pigments: data?.results || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useFeaturedProducts() {
  const { data: perfumesData, error: perfumesError, isLoading: perfumesLoading } = useSWR(
    '/perfumes/featured/',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds for featured products
    }
  )

  const { data: pigmentsData, error: pigmentsError, isLoading: pigmentsLoading } = useSWR(
    '/pigments/featured/',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  )

  const featuredItems: FeaturedItem[] = []
  const isLoading = perfumesLoading || pigmentsLoading
  const isError = perfumesError || pigmentsError

  if (perfumesData && Array.isArray(perfumesData)) {
    featuredItems.push(
      ...perfumesData.slice(0, 3).map((item) => ({
        ...item,
        type: 'perfume' as const
      }))
    )
  }

  if (pigmentsData && Array.isArray(pigmentsData)) {
    featuredItems.push(
      ...pigmentsData.slice(0, 3).map((item) => ({
        ...item,
        type: 'pigment' as const
      }))
    )
  }

  return {
    featuredProducts: featuredItems,
    isLoading,
    isError,
  }
}

export function useBrands() {
  const { data, error, isLoading } = useSWR('/brands/', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // 30 seconds for brands (rarely change)
  })

  return {
    brands: data?.results || [],
    isLoading,
    isError: error,
  }
}

export function useCategories(params?: Record<string, string>) {
  const queryString = params ? new URLSearchParams(params).toString() : ''
  const url = `/categories/${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // 30 seconds for categories
  })

  return {
    categories: data?.results || [],
    isLoading,
    isError: error,
  }
}

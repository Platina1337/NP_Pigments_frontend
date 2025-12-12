import { Buffer } from 'buffer'
import type { AuthTokens } from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

type JwtPayload = { exp?: number; [key: string]: unknown }

const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded =
      typeof window === 'undefined'
        ? Buffer.from(normalized, 'base64').toString('binary')
        : atob(normalized)
    return JSON.parse(decoded) as JwtPayload
  } catch {
    return null
  }
}

const isTokenExpired = (token: string | null, skewSeconds = 30): boolean => {
  if (!token) return true
  const payload = decodeJwt(token)
  if (!payload?.exp) return false
  const nowSeconds = Date.now() / 1000
  return payload.exp - skewSeconds <= nowSeconds
}

interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  status?: number
  rawError?: unknown
}

class ApiClient {
  private baseURL: string
  private isRefreshing = false
  private pendingRefresh: Promise<AuthTokens | null> | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private persistTokens(tokens: AuthTokens) {
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    localStorage.setItem('token_timestamp', Date.now().toString())
  }

  private clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_timestamp')
  }

  private async refreshTokens(): Promise<AuthTokens | null> {
    if (this.isRefreshing && this.pendingRefresh) {
      return this.pendingRefresh
    }

    const refresh = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null
    if (!refresh || isTokenExpired(refresh)) {
      this.clearTokens()
      return null
    }

    this.isRefreshing = true
    this.pendingRefresh = (async () => {
      try {
        const resp = await fetch(`${this.baseURL}/auth/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        })

        const text = await resp.text()
        const maybeJson = text ? (() => { try { return JSON.parse(text) } catch { return null } })() : null
        if (!resp.ok || !maybeJson) {
          this.clearTokens()
          return null
        }
        const access = (maybeJson as any).access
        const newRefresh = (maybeJson as any).refresh || refresh
        if (access) {
          const tokens = { access, refresh: newRefresh } as AuthTokens
          this.persistTokens(tokens)
          return tokens
        }
        this.clearTokens()
        return null
      } catch {
        this.clearTokens()
        return null
      } finally {
        this.isRefreshing = false
        this.pendingRefresh = null
      }
    })()

    return this.pendingRefresh
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const extractErrorMessage = (body: unknown): { message: string; raw?: unknown } => {
      if (!body) {
        return { message: 'Неизвестная ошибка' }
      }
      if (typeof body === 'string') {
        return { message: body, raw: body }
      }
      if (typeof body === 'object') {
        const maybeDetail = (body as Record<string, unknown>).detail
        if (typeof maybeDetail === 'string') {
          return { message: maybeDetail, raw: body }
        }
        if (typeof maybeDetail === 'object' && maybeDetail !== null) {
          const first = Object.values(maybeDetail)[0]
          if (typeof first === 'string') {
            return { message: first, raw: body }
          }
        }
        // DRF serializer errors: {field: ['msg']}
        for (const value of Object.values(body as Record<string, unknown>)) {
          if (Array.isArray(value) && value.length > 0) {
            const first = value[0]
            if (typeof first === 'string') {
              return { message: first, raw: body }
            }
          } else if (typeof value === 'string') {
            return { message: value, raw: body }
          }
        }
        return { message: 'Произошла ошибка', raw: body }
      }
      return { message: 'Произошла ошибка', raw: body }
    }

    const isAuthEndpoint = endpoint.includes('/auth/')

    try {
      const url = `${this.baseURL}${endpoint}`

      // Добавляем токен авторизации если он есть (кроме Google OAuth и публичных эндпоинтов)
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      const refresh = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null

      let authToken = token
      if (!isAuthEndpoint && isTokenExpired(token) && refresh) {
        const refreshed = await this.refreshTokens()
        authToken = refreshed?.access || null
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      }

      // Список публичных эндпоинтов, которые не требуют аутентификации
      const publicEndpoints = [
        '/brands/',
        '/categories/',
        '/perfumes/',
        '/pigments/',
        '/theme/public/',
        '/theme/',
        '/auth/register/',
        '/auth/login/',
        '/auth/refresh/',
        '/auth/otp/send/',
        '/auth/otp/verify/',
        '/auth/magic-link/verify/',
        '/auth/google/login/',
        '/auth/google/register/',
      ]

      // Не отправляем токен авторизации для Google OAuth запросов и публичных эндпоинтов
      if (authToken && !endpoint.includes('/auth/google/') && !publicEndpoints.some(publicEndpoint => endpoint.includes(publicEndpoint))) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch(url, {
        headers,
        ...options,
      })

      const text = await response.text()
      const maybeJson = text ? (() => { try { return JSON.parse(text) } catch { return null } })() : null

      if (response.status === 401 && !isAuthEndpoint) {
        // Пытаемся рефрешнуть и повторить запрос один раз
        const refreshed = await this.refreshTokens()
        if (refreshed?.access) {
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${refreshed.access}`,
          }
          const retryResponse = await fetch(url, {
            headers: retryHeaders,
            ...options,
          })
          const retryText = await retryResponse.text()
          const retryJson = retryText ? (() => { try { return JSON.parse(retryText) } catch { return null } })() : null
          if (!retryResponse.ok) {
            const { message, raw } = extractErrorMessage(retryJson ?? retryText)
            return { error: message, rawError: raw ?? retryJson ?? retryText, status: retryResponse.status }
          }
          return { data: (retryJson ?? (retryText as unknown)) as T, status: retryResponse.status }
        }
        this.clearTokens()
      }

      if (!response.ok) {
        const { message, raw } = extractErrorMessage(maybeJson ?? text)
        return { error: message, rawError: raw ?? maybeJson ?? text, status: response.status }
      }

      return { data: (maybeJson ?? (text as unknown)) as T, status: response.status }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value)
      })
      const paramString = searchParams.toString()
      if (paramString) {
        url += (endpoint.includes('?') ? '&' : '?') + paramString
      }
    }
    return this.request<T>(url, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// API endpoints for store
export const api = {
  // Authentication
  auth: {
    register: (data: { username: string; email: string; password: string; password2: string; first_name?: string; last_name?: string }) =>
      apiClient.post('/auth/register/', data),
    login: (data: { username: string; password: string }) =>
      apiClient.post('/auth/login/', data),
    refresh: (data: { refresh: string }) =>
      apiClient.post('/auth/refresh/', data),
    profile: () => apiClient.get('/auth/profile/'),
    updateProfile: (data: Record<string, unknown>) =>
      apiClient.put('/auth/profile/', data),
    settings: () => apiClient.get('/auth/settings/'),
    updateSettings: (data: Record<string, unknown>) =>
      apiClient.patch('/auth/settings/', data),
    // Email OTP
    sendOTP: (data: { email: string; purpose: 'login' | 'register' }) =>
      apiClient.post('/auth/otp/send/', data),
    verifyOTP: (data: { email: string; otp_code: string; purpose: 'login' | 'register' }) =>
      apiClient.post('/auth/otp/verify/', data),
    // Magic Link
    verifyMagicLink: (data: { token: string; purpose: 'login' | 'register'; username?: string; password?: string; first_name?: string; last_name?: string }) =>
      apiClient.post('/auth/magic-link/verify/', data),
    // Google OAuth
    googleLogin: (requestData: { google_token?: string; email: string; name?: string }) => {
      return apiClient.post('/auth/google/login/', requestData);
    },
    googleRegister: (requestData: { google_token?: string; email: string; name?: string }) => {
      return apiClient.post('/auth/google/register/', requestData);
    },
  },

  // Theme
  theme: {
    get: () => apiClient.get('/theme/'),
    update: (theme: string) => apiClient.post('/theme/', { theme }),
    getPublic: () => apiClient.get('/theme/public/'),
  },

  // Cart
  cart: {
    get: () => apiClient.get('/cart/'),
    addItem: (data: { product_type: string; product_id: number; quantity?: number }) =>
      apiClient.post('/cart-items/add_product/', data),
    updateItem: (id: number, quantity: number) =>
      apiClient.post(`/cart-items/${id}/update_quantity/`, { quantity }),
    removeItem: (id: number) => apiClient.delete(`/cart-items/${id}/`),
    sync: (items: Array<{ product_type: string; product_id: number; quantity: number }>) =>
      apiClient.post('/cart/sync/', { items }),
  },
  products: {
    getBatchDetails: (data: { perfumes: number[], pigments: number[] }) =>
      apiClient.post('/sync/prices/', data),
  },
  wishlist: {
    get: () => apiClient.get('/wishlist/'),
    list: () => apiClient.get('/wishlist-items/'),
    addItem: (data: { product_type: 'perfume' | 'pigment'; product_id: number }) =>
      apiClient.post('/wishlist-items/', data),
    removeItem: (id: number) => apiClient.delete(`/wishlist-items/${id}/`),
    removeByProduct: (product_type: 'perfume' | 'pigment', product_id: number) =>
      apiClient.delete(`/wishlist-items/by-product/?product_type=${product_type}&product_id=${product_id}`),
    status: (product_type: 'perfume' | 'pigment', product_id: number) =>
      apiClient.get('/wishlist-items/status/', { product_type, product_id: String(product_id) }),
    bulkAdd: (items: Array<{ product_type: 'perfume' | 'pigment'; product_id: number }>) =>
      apiClient.post('/wishlist-items/bulk-add/', { items }),
  },

  // Orders
  orders: {
    getAll: (params?: Record<string, string>) => apiClient.get('/orders/', params),
    getById: (id: number) => apiClient.get(`/orders/${id}/`),
    create: (data: Record<string, unknown>) => apiClient.post('/orders/', data),
    history: (params?: Record<string, string>) => apiClient.get('/orders/history/', params),
  },

  // Loyalty
  loyalty: {
    account: () => apiClient.get('/loyalty/account/'),
    transactions: () => apiClient.get('/loyalty/transactions/'),
  },

  // Perfumes
  perfumes: {
    getAll: (params?: Record<string, string>) => apiClient.get('/perfumes/', params),
    getById: (id: number) => apiClient.get(`/perfumes/${id}/`),
    getBySlug: (slug: string) => apiClient.get(`/perfumes/by-slug/${slug}/`),
    getFeatured: () => apiClient.get('/perfumes/featured/'),
    getInStock: () => apiClient.get('/perfumes/in_stock/'),
    create: (data: Record<string, unknown>) => apiClient.post('/perfumes/', data),
    update: (id: number, data: Record<string, unknown>) => apiClient.put(`/perfumes/${id}/`, data),
    delete: (id: number) => apiClient.delete(`/perfumes/${id}/`),
  },

  // Pigments
  pigments: {
    getAll: (params?: Record<string, string>) => apiClient.get('/pigments/', params),
    getById: (id: number) => apiClient.get(`/pigments/${id}/`),
    getBySlug: (slug: string) => apiClient.get(`/pigments/by-slug/${slug}/`),
    getFeatured: () => apiClient.get('/pigments/featured/'),
    getInStock: () => apiClient.get('/pigments/in_stock/'),
    create: (data: Record<string, unknown>) => apiClient.post('/pigments/', data),
    update: (id: number, data: Record<string, unknown>) => apiClient.put(`/pigments/${id}/`, data),
    delete: (id: number) => apiClient.delete(`/pigments/${id}/`),
  },

  // Categories
  categories: {
    getAll: (params?: Record<string, string>) => apiClient.get('/categories/', params),
    getById: (id: number) => apiClient.get(`/categories/${id}/`),
  },

  // Brands
  brands: {
    getAll: (params?: Record<string, string>) => apiClient.get('/brands/', params),
    getById: (id: number) => apiClient.get(`/brands/${id}/`),
  },

  // Payments
  payments: {
    // ЮKassa
    createYooKassaPayment: (orderId: number) =>
      apiClient.post('/payments/yookassa/create/', { order_id: orderId }),
    checkYooKassaStatus: (paymentId: string) =>
      apiClient.get(`/payments/yookassa/status/${paymentId}/`),
    
    // Tinkoff
    createTinkoffPayment: (orderId: number) =>
      apiClient.post('/payments/tinkoff/create/', { order_id: orderId }),
    checkTinkoffStatus: (paymentId: string) =>
      apiClient.get(`/payments/tinkoff/status/${paymentId}/`),
  },

  // Delivery
  delivery: {
    calculate: (data: { city: string; postal_code: string; cart_id?: number }) =>
      apiClient.post('/delivery/calculate/', data),
    createOrder: (data: { order_id: number; provider: string }) =>
      apiClient.post('/delivery/create/', data),
    getTracking: (trackingNumber: string, provider: string) =>
      apiClient.get(`/delivery/tracking/${trackingNumber}/`, { provider }),
  },
}

// Legacy exports for backward compatibility
export const perfumesApi = api.perfumes
export const pigmentsApi = api.pigments
export const categoriesApi = api.categories
export const brandsApi = api.brands

// Utility functions
export const formatPrice = (price: number | string | null | undefined): string => {
  if (price === null || price === undefined || price === '') return '—'
  const numeric = typeof price === 'string' ? parseFloat(price) : price
  if (Number.isNaN(numeric)) return '—'
  return `${numeric.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₽`
}

export const formatVolume = (volume: number): string => {
  return `${volume} мл`
}

export const formatWeight = (weight: number): string => {
  return `${weight} г`
}

export const formatGender = (gender: string): string => {
  const genderMap: Record<string, string> = {
    'M': 'Мужской',
    'F': 'Женский',
    'U': 'Унисекс'
  }
  return genderMap[gender] || gender
}

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/placeholder-perfume.svg'
  if (imagePath.startsWith('http')) return imagePath
  return `${API_BASE_URL.replace('/api', '')}${imagePath}`
}
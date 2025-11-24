const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`

      // Добавляем токен авторизации если он есть (кроме Google OAuth и публичных эндпоинтов)
      // Проверяем, что мы на клиенте, так как localStorage недоступен на сервере
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
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
      ]

      // Не отправляем токен авторизации для Google OAuth запросов и публичных эндпоинтов
      if (token && !endpoint.includes('/auth/google/') && !publicEndpoints.some(publicEndpoint => endpoint.includes(publicEndpoint))) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        headers,
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data }
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
    console.log(`POST ${endpoint} with data:`, data); // Логирование
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
    // Google OAuth
    googleLogin: (requestData: { google_token?: string; email: string; name?: string }) => {
      console.log('API googleLogin called with:', requestData); // Логирование
      return apiClient.post('/auth/google/login/', requestData);
    },
    googleRegister: (requestData: { google_token?: string; email: string; name?: string }) => {
      console.log('API googleRegister called with:', requestData); // Логирование
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

  // Orders
  orders: {
    getAll: (params?: Record<string, string>) => apiClient.get('/orders/', params),
    getById: (id: number) => apiClient.get(`/orders/${id}/`),
    create: (data: Record<string, unknown>) => apiClient.post('/orders/', data),
    history: (params?: Record<string, string>) => apiClient.get('/orders/history/', params),
  },

  // Perfumes
  perfumes: {
    getAll: (params?: Record<string, string>) => apiClient.get('/perfumes/', params),
    getById: (id: number) => apiClient.get(`/perfumes/${id}/`),
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
export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('ru-RU')} ₽`
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
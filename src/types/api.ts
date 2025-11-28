export interface Perfume {
  id: number
  name: string
  brand: Brand
  category: Category
  description: string
  price: number
  volume_ml: number
  concentration: string
  gender: 'M' | 'F' | 'U'
  top_notes?: string
  heart_notes?: string
  base_notes?: string
  image?: string
  images: ProductImage[]
  in_stock: boolean
  featured: boolean
  stock_quantity: number
  created_at: string
  updated_at: string
}

export interface Pigment {
  id: number
  name: string
  brand: Brand
  category: Category
  description: string
  color_code?: string
  color_type: 'powder' | 'liquid' | 'paste'
  application_type: 'cosmetics' | 'art' | 'industrial' | 'food'
  price: number
  weight_gr: number
  image?: string
  images: ProductImage[]
  in_stock: boolean
  featured: boolean
  stock_quantity: number
  created_at: string
  updated_at: string
}

export interface Brand {
  id: number
  name: string
  description?: string
  country?: string
  logo?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  description?: string
  category_type: 'perfume' | 'pigment'
  icon?: string
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  count?: number
  next?: string | null
  previous?: string | null
  results?: T[]
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
}

export interface PerfumeFilters extends PaginationParams {
  brand?: number
  category?: number
  gender?: 'M' | 'F' | 'U'
  min_price?: number
  max_price?: number
  in_stock?: boolean
}

// Authentication types
export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  date_joined: string
  profile: UserProfile
  settings: UserSettings
}

export interface UserProfile {
  first_name: string
  last_name: string
  phone: string
  avatar?: string
  date_of_birth?: string
  created_at: string
  updated_at: string
}

export interface UserSettings {
  theme: 'light' | 'dark'
  notifications_enabled: boolean
  email_newsletter: boolean
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
  settings?: UserSettings
}

export interface RegisterData {
  username: string
  email: string
  password: string
  password2: string
  first_name?: string
  last_name?: string
}

// Theme types
export interface ThemeResponse {
  theme: 'light' | 'dark'
  source: 'database' | 'default' | 'localStorage'
}

// Cart types
export interface CartItem {
  id: number
  perfume?: Perfume
  pigment?: Pigment
  quantity: number
  product_name: string
  product_image?: string
  product_type: 'perfume' | 'pigment'
  unit_price: number
  total_price: number
  added_at: string
}

export interface Cart {
  id: number
  items: CartItem[]
  total_items: number
  total_price: number
  created_at: string
  updated_at: string
}

// Order types
export interface OrderItem {
  id: number
  perfume?: Perfume
  pigment?: Pigment
  product_name: string
  product_sku?: string
  quantity: number
  unit_price: number
  total_price: number
  product_image?: string
  product_type: 'perfume' | 'pigment'
}

export interface Order {
  id: number
  user: string
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_method: 'card' | 'cash' | 'transfer'
  delivery_address: string
  delivery_city: string
  delivery_postal_code: string
  delivery_phone: string
  subtotal: number
  delivery_cost: number
  total: number
  items: OrderItem[]
  created_at: string
  updated_at: string
  paid_at?: string
  shipped_at?: string
  delivered_at?: string
  customer_notes?: string
  admin_notes?: string
}

export interface OrderCreateData {
  payment_method: 'card' | 'cash' | 'transfer'
  delivery_address: string
  delivery_city: string
  delivery_postal_code: string
  delivery_phone: string
  customer_notes?: string
  items: Array<{
    cart_item_id: number
    quantity: number
  }>
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text?: string;
}
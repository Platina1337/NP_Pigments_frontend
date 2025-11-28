// Типы данных для магазина духов

export interface Brand {
  id: number;
  name: string;
  description: string;
  country: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Perfume {
  id: number;
  name: string;
  brand: Brand;
  category: Category;
  brand_id?: number;
  category_id?: number;
  description: string;
  gender: 'M' | 'F' | 'U';
  price: string; // Django DecimalField возвращается как string
  volume_ml: number;
  concentration: string;
  top_notes: string;
  heart_notes: string;
  base_notes: string;
  image: string | null;
  in_stock: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

// Упрощенный тип для списка парфюмов
export interface PerfumeListItem {
  id: number;
  name: string;
  brand_name: string;
  category_name: string;
  price: string;
  volume_ml: number;
  gender: 'M' | 'F' | 'U';
  in_stock: boolean;
  image: string | null;
}

// Упрощенный тип для списка пигментов
export interface PigmentListItem {
  id: number;
  name: string;
  brand_name: string;
  category_name: string;
  price: string;
  weight_gr: number;
  color_type: 'powder' | 'liquid' | 'paste';
  application_type: 'cosmetics' | 'art' | 'industrial' | 'food';
  in_stock: boolean;
  image: string | null;
}

// Универсальный тип для объединенного списка продуктов
export interface ProductListItem {
  id: string; // Уникальный id с префиксом (perfume_123, pigment_456)
  original_id: number; // Оригинальный id для API запросов
  name: string;
  brand_name: string;
  category_name: string;
  price: number;
  in_stock: boolean;
  image?: string;
  product_type: 'perfume' | 'pigment';
  // Поля для парфюмов
  gender?: string;
  volume_ml?: number;
  // Поля для пигментов
  color_type?: string;
  weight_gr?: number;
  application_type?: string;
}

// Типы для корзины
export interface CartItem {
  id: string; // уникальный ID для корзины
  perfume: Perfume;
  quantity: number;
  productType: 'perfume' | 'pigment';
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isHydrated?: boolean;
}

export interface WishlistItem {
  id: string;
  productType: 'perfume' | 'pigment';
  productId: number;
  productName: string;
  productImage?: string | null;
  productPrice?: string;
  productData?: Perfume;
  addedAt?: string;
  serverId?: number;
}

// Типы для фильтров
export interface PerfumeFilters {
  brand?: number;
  category?: number;
  gender?: 'M' | 'F' | 'U';
  in_stock?: boolean;
  min_price?: number;
  max_price?: number;
  search?: string;
}

// Типы для API ответов
export interface ApiResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  data?: T;
}

// Типы для форм
export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface CheckoutForm extends ContactForm {
  address: string;
  city: string;
  postal_code: string;
  payment_method: 'card' | 'cash';
}

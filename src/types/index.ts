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
  price: string; // исходная цена (string от DRF)
  final_price?: number | string; // цена с учетом скидки
  discount_percentage?: number;
  discount_price?: string | null;
  discount_start_date?: string | null;
  discount_end_date?: string | null;
  is_on_sale?: boolean;
  discount_percent_display?: number;
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
  final_price?: number | string;
  discount_percentage?: number;
  discount_price?: string | null;
  discount_start_date?: string | null;
  discount_end_date?: string | null;
  is_on_sale?: boolean;
  discount_percent_display?: number;
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
  final_price?: number | string;
  discount_percentage?: number;
  discount_price?: string | null;
  discount_start_date?: string | null;
  discount_end_date?: string | null;
  is_on_sale?: boolean;
  discount_percent_display?: number;
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
  final_price?: number | string;
  discount_percentage?: number;
  discount_price?: string | null;
  discount_start_date?: string | null;
  discount_end_date?: string | null;
  is_on_sale?: boolean;
  discount_percent_display?: number;
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
  volumeOptionId?: number;  // Selected volume option for perfumes
  weightOptionId?: number;  // Selected weight option for pigments
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

// Лояльность
export interface LoyaltyAccount {
  balance: number;
  lifetime_earned: number;
  lifetime_redeemed: number;
  tier: 'bronze' | 'silver' | 'gold';
  max_redeem_per_order: number;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: number;
  transaction_type: 'earn' | 'redeem' | 'refund' | 'adjust';
  points: number;
  description: string;
  balance_after: number;
  order_id?: number;
  created_at: string;
}
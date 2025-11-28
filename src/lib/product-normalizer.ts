import { Perfume } from '@/types';

export const normalizeProductPayload = (payload: any): Perfume | null => {
  if (!payload) return null;
  return {
    id: payload.id,
    name: payload.name,
    description: payload.description || '',
    brand: {
      id: payload.brand?.id ?? 0,
      name: payload.brand?.name ?? '',
      description: payload.brand?.description ?? '',
      country: payload.brand?.country ?? '',
      created_at: payload.brand?.created_at ?? '',
    },
    category: {
      id: payload.category?.id ?? 0,
      name: payload.category?.name ?? '',
      description: payload.category?.description ?? '',
      created_at: payload.category?.created_at ?? '',
    },
    gender: payload.gender || 'U',
    price: payload.price?.toString() ?? '0',
    volume_ml: payload.volume_ml ?? 0,
    concentration: payload.concentration || '',
    top_notes: payload.top_notes || '',
    heart_notes: payload.heart_notes || '',
    base_notes: payload.base_notes || '',
    image: payload.image || null,
    in_stock: payload.in_stock ?? true,
    stock_quantity: payload.stock_quantity ?? 0,
    created_at: payload.created_at || '',
    updated_at: payload.updated_at || '',
  };
};


import type { Perfume as CartPerfume } from '@/types';
import type { Perfume, Pigment } from '@/types/api';

type Product = Perfume | Pigment;

export const normalizeProductForCart = (product: Product): CartPerfume => {
  const basePrice =
    typeof product.price === 'number'
      ? product.price
      : parseFloat(product.price as unknown as string);

  const base: Omit<
    CartPerfume,
    'gender' | 'volume_ml' | 'concentration' | 'top_notes' | 'heart_notes' | 'base_notes'
  > = {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    brand_id: product.brand.id,
    category_id: product.category.id,
    description: product.description,
    price: basePrice.toString(),
    image: product.image ?? null,
    in_stock: product.in_stock,
    stock_quantity: product.stock_quantity,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };

  if ('volume_ml' in product) {
    return {
      ...base,
      gender: product.gender,
      volume_ml: product.volume_ml,
      concentration: product.concentration,
      top_notes: product.top_notes ?? '',
      heart_notes: product.heart_notes ?? '',
      base_notes: product.base_notes ?? '',
    };
  }

  return {
    ...base,
    gender: 'U',
    volume_ml: product.weight_gr,
    concentration: product.color_type ?? '',
    top_notes: '',
    heart_notes: '',
    base_notes: '',
  };
};


'use client';

import React, { useState } from 'react';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { formatPrice, getImageUrl } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { WishlistItem } from '@/types';
import { Button } from '@/components/ui/Button';

const resolvePriceLabel = (item: WishlistItem) => {
  if (item.productPrice) {
    const numeric = parseFloat(item.productPrice);
    if (!Number.isNaN(numeric)) {
      return formatPrice(numeric);
    }
  }

  if (item.productData?.price) {
    const rawPrice =
      typeof item.productData.price === 'number'
        ? item.productData.price
        : parseFloat(item.productData.price as unknown as string);
    if (!Number.isNaN(rawPrice)) {
      return formatPrice(rawPrice);
    }
  }

  return null;
};

export const FavoriteProducts: React.FC = () => {
  const { addItem } = useCart();
  const { state, loading, removeFavorite } = useFavorites();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const items = state.items;

  const handleRemove = async (item: WishlistItem) => {
    setPendingId(item.id);
    setError(null);
    try {
      await removeFavorite(item.productId, item.productType);
    } catch (err) {
      console.error(err);
      setError('Не удалось удалить товар из избранного');
    } finally {
      setPendingId(null);
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    if (!item.productData) {
      setError('Нет данных о товаре для добавления в корзину');
      return;
    }
    setError(null);
    addItem(item.productData, item.productType);
  };

  if (loading && !state.isHydrated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-foreground/70">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-b-transparent border-foreground/40" />
        <p className="mt-4 text-sm">Загружаем избранные товары...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/60 p-6 text-red-700">
        {error}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-dashed border-foreground/20 p-10 text-center text-foreground/60">
        <Heart className="h-10 w-10 text-foreground/40" />
        <div>
          <p className="text-lg font-semibold text-foreground">Избранное пусто</p>
          <p className="text-sm">Добавляйте ароматы и пигменты, чтобы вернуться к ним позже.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const priceLabel = resolvePriceLabel(item);
        return (
          <div
            key={item.id}
            className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-2xl bg-muted">
                {item.productImage ? (
                  <img
                    src={getImageUrl(item.productImage)}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-foreground/30">
                    <Heart />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{item.productName}</p>
                <p className="text-xs uppercase tracking-wide text-foreground/60">
                  {item.productType === 'perfume' ? 'Парфюм' : 'Пигмент'}
                </p>
                {priceLabel && <p className="text-sm font-medium text-primary">{priceLabel}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleRemove(item)}
                disabled={pendingId === item.id}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Удалить
              </Button>
              <Button
                size="sm"
                disabled={!item.productData}
                onClick={() => handleAddToCart(item)}
                className="flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                В корзину
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};


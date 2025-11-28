'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  ReactNode,
} from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { normalizeProductPayload } from '@/lib/product-normalizer';
import type { WishlistItem } from '@/types';

type FavoriteProductType = 'perfume' | 'pigment';

export interface FavoriteProductPayload {
  id: number;
  productType: FavoriteProductType;
  name: string;
  image?: string | null;
  price?: string | number;
  data?: any;
}

interface FavoritesState {
  items: WishlistItem[];
  isHydrated: boolean;
}

type FavoritesAction =
  | { type: 'LOAD'; payload: WishlistItem[]; hydrated: boolean }
  | { type: 'UPSERT'; payload: WishlistItem }
  | { type: 'REMOVE'; key: string }
  | { type: 'RESET' };

interface FavoritesContextType {
  state: FavoritesState;
  loading: boolean;
  isFavorite: (productId: number, productType: FavoriteProductType) => boolean;
  addFavorite: (payload: FavoriteProductPayload) => Promise<void>;
  removeFavorite: (productId: number, productType: FavoriteProductType) => Promise<void>;
  toggleFavorite: (payload: FavoriteProductPayload) => Promise<boolean>;
}

const FAVORITES_STORAGE_KEY = 'perfume-favorites';

const initialState: FavoritesState = {
  items: [],
  isHydrated: false,
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const makeFavoriteKey = (productType: FavoriteProductType, productId: number) =>
  `${productType}-${productId}`;

const getInitialFavoritesState = (): FavoritesState => {
  if (typeof window === 'undefined') {
    return initialState;
  }
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as WishlistItem[];
      return {
        items: parsed,
        isHydrated: true,
      };
    }
  } catch (error) {
    console.warn('Не удалось загрузить избранное из localStorage:', error);
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
  }
  return initialState;
};

const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  switch (action.type) {
    case 'LOAD':
      return {
        items: action.payload,
        isHydrated: action.hydrated,
      };
    case 'UPSERT': {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index >= 0) {
        const next = [...state.items];
        next[index] = action.payload;
        return { ...state, items: next };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.key),
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const mapServerFavorites = (data: unknown): WishlistItem[] => {
  const source = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.results)
      ? (data as any).results
      : [];

  return (source as any[]).map((item) => {
    const productType: FavoriteProductType = item.product_type ?? item.productType ?? 'perfume';
    const productId: number = item.perfume ?? item.pigment ?? item.product_id ?? item.productId;
    const normalized = normalizeProductPayload(item.product_data) ?? item.product_data ?? null;
    const key = makeFavoriteKey(productType, productId);

    return {
      id: key,
      productId,
      productType,
      productName: item.product_name ?? normalized?.name ?? 'Неизвестный товар',
      productImage: item.product_image ?? normalized?.image ?? null,
      productPrice:
        typeof item.product_price === 'string'
          ? item.product_price
          : normalized?.price
            ? String(normalized.price)
            : undefined,
      productData: normalized ?? undefined,
      serverId: typeof item.id === 'number' ? item.id : undefined,
      addedAt: item.added_at ?? item.addedAt,
    } as WishlistItem;
  });
};

const mergeFavorites = (serverItems: WishlistItem[], localItems: WishlistItem[]): WishlistItem[] => {
  const map = new Map<string, WishlistItem>();
  serverItems.forEach((item) => map.set(item.id, item));
  localItems.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
};

const sanitizeFavoritePayload = (payload: FavoriteProductPayload): WishlistItem => {
  const { id, productType, name, image, price, data } = payload;
  const key = makeFavoriteKey(productType, id);
  return {
    id: key,
    productId: id,
    productType,
    productName: name,
    productImage: image ?? null,
    productPrice: typeof price === 'number' ? price.toString() : price,
    productData: data,
  };
};

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const initialFromStorage = useMemo(
    () => (typeof window === 'undefined' ? initialState : getInitialFavoritesState()),
    [],
  );

  const [state, dispatch] = useReducer(favoritesReducer, initialFromStorage);
  const [loading, setLoading] = useState(!initialFromStorage.isHydrated);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let isActive = true;
    setLoading(true);

    const loadFavorites = async () => {
      try {
        const response = await api.wishlist.list();
        if (!isActive) return;
        const serverItems = mapServerFavorites(response.data);

        let localItems: WishlistItem[] = [];
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
            if (raw) {
              localItems = (JSON.parse(raw) as WishlistItem[]).map((item) => ({
                ...item,
                id: item.id ?? makeFavoriteKey(item.productType, item.productId),
              }));
            }
          } catch (error) {
            console.warn('Не удалось прочитать избранное гостя при входе:', error);
            localStorage.removeItem(FAVORITES_STORAGE_KEY);
          }
        }

        const serverKeys = new Set(serverItems.map((item) => item.id));
        const localOnly = localItems.filter((item) => !serverKeys.has(item.id));
        const merged = mergeFavorites(serverItems, localItems);

        dispatch({ type: 'LOAD', payload: merged, hydrated: true });

        if (localOnly.length) {
          try {
            await api.wishlist.bulkAdd(
              localOnly.map((item) => ({
                product_type: item.productType,
                product_id: item.productId,
              })),
            );
            const refreshed = await api.wishlist.list();
            if (!isActive) return;
            dispatch({
              type: 'LOAD',
              payload: mapServerFavorites(refreshed.data),
              hydrated: true,
            });
          } catch (error) {
            console.error('Не удалось синхронизировать избранное гостя:', error);
          } finally {
            localStorage.removeItem(FAVORITES_STORAGE_KEY);
          }
        } else {
          localStorage.removeItem(FAVORITES_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Не удалось загрузить избранное пользователя:', error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadFavorites();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isAuthenticated) return;
    if (!state.items) return;
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.warn('Не удалось сохранить избранное гостя:', error);
    }
  }, [state.items, isAuthenticated]);

  const isFavorite = useCallback(
    (productId: number, productType: FavoriteProductType) => {
      const key = makeFavoriteKey(productType, productId);
      return state.items.some((item) => item.id === key);
    },
    [state.items],
  );

  const addFavorite = useCallback(
    async (payload: FavoriteProductPayload) => {
      const normalized = sanitizeFavoritePayload(payload);

      if (!isAuthenticated) {
        dispatch({ type: 'UPSERT', payload: normalized });
        return;
      }

      try {
        const response = await api.wishlist.addItem({
          product_type: payload.productType,
          product_id: payload.id,
        });
        const [created] = mapServerFavorites([response.data]);
        dispatch({ type: 'UPSERT', payload: created ?? normalized });
      } catch (error) {
        console.error('Не удалось добавить товар в избранное:', error);
        throw error;
      }
    },
    [isAuthenticated],
  );

  const removeFavorite = useCallback(
    async (productId: number, productType: FavoriteProductType) => {
      const key = makeFavoriteKey(productType, productId);

      if (isAuthenticated) {
        try {
          await api.wishlist.removeByProduct(productType, productId);
        } catch (error) {
          console.error('Не удалось удалить товар из избранного:', error);
          throw error;
        }
      }

      dispatch({ type: 'REMOVE', key });
    },
    [isAuthenticated],
  );

  const toggleFavorite = useCallback(
    async (payload: FavoriteProductPayload) => {
      const exists = isFavorite(payload.id, payload.productType);
      if (exists) {
        await removeFavorite(payload.id, payload.productType);
        return false;
      }
      await addFavorite(payload);
      return true;
    },
    [addFavorite, isFavorite, removeFavorite],
  );

  const value = useMemo<FavoritesContextType>(
    () => ({
      state,
      loading,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
    }),
    [state, loading, isFavorite, addFavorite, removeFavorite, toggleFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};


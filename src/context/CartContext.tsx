'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useRef } from 'react';
import { CartItem, CartState, Perfume } from '@/types';
import { api } from '@/lib/api';
import { normalizeProductPayload } from '@/lib/product-normalizer';
import { useAuth } from '@/context/AuthContext';
import { getPriceInfo } from '@/lib/product-pricing';

// Действия для reducer
type CartAction =
  | { type: 'ADD_ITEM'; payload: Perfume; volumeOptionId?: number; weightOptionId?: number; serverItemId?: number; quantity?: number }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SYNC_PRICES'; payload: CartItem[] }
  | { type: 'SET_HYDRATED'; payload: boolean };

const CART_STORAGE_KEY = 'perfume-cart';

// Начальное состояние корзины
const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isHydrated: false,
};

// Reducer для управления состоянием корзины
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const payloadType = (action.payload as any)?.product_type || 'perfume';
      const volumeOptionId = action.volumeOptionId;
      const weightOptionId = action.weightOptionId;
      const serverItemId = action.serverItemId;

      // Create unique key that includes variant to allow same product with different volumes
      const variantKey = volumeOptionId ? `-vol${volumeOptionId}` : (weightOptionId ? `-wt${weightOptionId}` : '');
      const existingItem = state.items.find(
        item => item.perfume.id === action.payload.id &&
          item.productType === payloadType &&
          item.volumeOptionId === volumeOptionId &&
          item.weightOptionId === weightOptionId
      );

      let newItems: CartItem[];

      if (existingItem) {
        // Увеличиваем количество существующего товара
        newItems = state.items.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + (action.quantity || 1) }
            : item
        );
      } else {
        // Добавляем новый товар

        // Safety check: Check if an item with this serverItemId already exists
        // This prevents duplicate key errors if 'find' failed to match the product (e.g. due to type mismatch)
        // but the server returned an existing ID.
        let existingServerItem: CartItem | undefined;
        if (serverItemId) {
          existingServerItem = state.items.find(item => item.id === `srv-${serverItemId}`);
        }

        if (existingServerItem) {
          console.log('Found existing item by server ID, updating quantity instead of adding duplicate:', serverItemId);
          newItems = state.items.map(item =>
            item.id === existingServerItem!.id
              ? { ...item, quantity: item.quantity + (action.quantity || 1) }
              : item
          );
        } else {
          // Если есть serverItemId, используем его формат, иначе генерируем временный
          const itemId = serverItemId ? `srv-${serverItemId}` : `${action.payload.id}${variantKey}-${Date.now()}`;

          const newItem: CartItem = {
            id: itemId,
            perfume: action.payload,
            quantity: action.quantity || 1,
            productType: payloadType,
            volumeOptionId,
            weightOptionId,
          };
          newItems = [...state.items, newItem];
        }
      }

      const total = calculateTotal(newItems);
      const itemCount = calculateItemCount(newItems);

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const total = calculateTotal(newItems);
      const itemCount = calculateItemCount(newItems);

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0); // Удаляем товары с количеством 0

      const total = calculateTotal(newItems);
      const itemCount = calculateItemCount(newItems);

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'CLEAR_CART':
      return initialState;

    case 'LOAD_CART': {
      const total = calculateTotal(action.payload);
      const itemCount = calculateItemCount(action.payload);

      return {
        ...state,
        items: action.payload,
        total,
        itemCount,
        isHydrated: true,
      };
    }

    case 'SET_HYDRATED':
      return {
        ...state,
        isHydrated: action.payload,
      };

    case 'SYNC_PRICES': {
      const newItems = action.payload;
      const total = calculateTotal(newItems);
      const itemCount = calculateItemCount(newItems);

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }

    default:
      return state;
  }
};

// Вспомогательные функции
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const { currentPrice } = getPriceInfo(item.perfume as any);
    return total + currentPrice * item.quantity;
  }, 0);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

const normalizeCartItems = (items: CartItem[]): CartItem[] => {
  return items.map(item => ({
    ...item,
    productType: item.productType || (item as any)?.product_type || 'perfume',
  }));
};

// Функция для получения начального состояния корзины из localStorage
const getInitialCartState = (): CartState => {
  if (typeof window === 'undefined') {
    return initialState;
  }
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      let cartItems: CartItem[] = normalizeCartItems(JSON.parse(savedCart));

      // Фильтруем товары, которых нет в наличии
      cartItems = cartItems.filter(item => {
        if (!item.perfume.in_stock) {
          console.log('Filtering out unavailable product from local cart:', item.perfume.name);
          return false;
        }
        return true;
      });

      console.log('Initial load from localStorage:', cartItems.length, 'items (after filtering unavailable)');
      return {
        items: cartItems,
        total: calculateTotal(cartItems),
        itemCount: calculateItemCount(cartItems),
        isHydrated: true,
      };
    }
  } catch (error) {
    console.error('Error loading initial cart from localStorage:', error);
    localStorage.removeItem(CART_STORAGE_KEY);
  }
  return initialState;
};

const mapServerCartItems = (items: any[]): CartItem[] => {
  return items
    .map(item => {
      const productData = normalizeProductPayload(item.product_data);
      if (!productData) return null;

      if (!productData.in_stock) {
        console.log('Filtering out unavailable product from cart:', productData.name);
        return null;
      }

      return {
        id: `srv-${item.id}`,
        perfume: productData,
        quantity: item.quantity,
        productType: item.product_data?.product_type || 'perfume',
        volumeOptionId: item.volume_option,
        weightOptionId: item.weight_option,
      } as CartItem;
    })
    .filter(Boolean) as CartItem[];
};

const mergeCartCollections = (serverItems: CartItem[], localItems: CartItem[]): CartItem[] => {
  const merged = new Map<string, CartItem>();

  const addItem = (item: CartItem, preserveId = false) => {
    // Create a unique key that includes variants
    const variantKey = item.volumeOptionId
      ? `-vol${item.volumeOptionId}`
      : (item.weightOptionId ? `-wt${item.weightOptionId}` : '');
    const key = `${item.productType}-${item.perfume.id}${variantKey}`;

    if (merged.has(key)) {
      const existing = merged.get(key)!;
      // If we have a server item (usually processed first) and a local item,
      // we might want to prioritize the server one or sum them.
      // Current logic: sum quantities.
      // Note: If serverItems are processed first, 'existing' is likely the server item.
      merged.set(key, { ...existing, quantity: existing.quantity + item.quantity });
    } else {
      merged.set(key, preserveId ? item : { ...item, id: `${key}-${Date.now()}` });
    }
  };

  serverItems.forEach(item => addItem(item, true));
  localItems.forEach(item => addItem(item, true));

  return Array.from(merged.values());
};

// Контекст
interface CartContextType {
  state: CartState;
  addItem: (perfume: Perfume, productType?: 'perfume' | 'pigment', volumeOptionId?: number, weightOptionId?: number, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Провайдер контекста
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, getInitialCartState());
  const { isAuthenticated } = useAuth();
  const skipNextSyncRef = useRef(false);
  const latestItemsRef = useRef<CartItem[]>([]);
  const prevIsAuthenticatedRef = useRef(isAuthenticated);

  useEffect(() => {
    latestItemsRef.current = state.items;
  }, [state.items]);

  // Эффект для синхронизации цен при загрузке
  useEffect(() => {
    const verifyCartPrices = async () => {
      if (!state.isHydrated || state.items.length === 0) {
        return;
      }

      console.log('Verifying cart prices against server...');

      const perfumeIds = state.items
        .filter(item => item.productType === 'perfume')
        .map(item => item.perfume.id);

      const pigmentIds = state.items
        .filter(item => item.productType === 'pigment')
        .map(item => item.perfume.id);

      if (perfumeIds.length === 0 && pigmentIds.length === 0) {
        return;
      }

      try {
        const response = await api.products.getBatchDetails({
          perfumes: perfumeIds,
          pigments: pigmentIds,
        });

        if (!response || !response.data) {
          console.error('Failed to get batch details from server', response?.error);
          return;
        }

        const serverPerfumes = (response.data as any)?.perfumes || [];
        const serverPigments = (response.data as any)?.pigments || [];

        const priceMap = new Map<string, any>();
        serverPerfumes.forEach((p: any) => priceMap.set(`perfume-${p.id}`, p));
        serverPigments.forEach((p: any) => priceMap.set(`pigment-${p.id}`, p));

        let hasPriceChanged = false;

        const updatedItems = state.items.map(item => {
          const key = `${item.productType}-${item.perfume.id}`;
          const serverProduct = priceMap.get(key);

          if (serverProduct) {
            if (item.perfume.final_price !== serverProduct.final_price) {
              console.log(`Price for ${item.perfume.name} changed. Old: ${item.perfume.final_price}, New: ${serverProduct.final_price}`);
              hasPriceChanged = true;
              return {
                ...item,
                perfume: normalizeProductPayload(serverProduct),
              };
            }
          } else {
            console.warn(`Product ${key} not found on server during price sync.`);
          }
          return item;
        });

        const sanitizedItems = updatedItems.filter(item => item.perfume) as CartItem[];

        if (hasPriceChanged) {
          console.log('Cart prices have changed, dispatching SYNC_PRICES.');
          dispatch({ type: 'SYNC_PRICES', payload: sanitizedItems });
        } else {
          console.log('All cart prices are up-to-date.');
        }

      } catch (error) {
        console.error('Error verifying cart prices:', error);
      }
    };

    verifyCartPrices();
  }, [state.isHydrated]);

  // Загрузка корзины из localStorage при монтировании
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isAuthenticated && prevIsAuthenticatedRef.current && state.isHydrated) {
      console.log('User logged out, resetting hydration state');
      dispatch({ type: 'SET_HYDRATED', payload: false });
    }

    if (!isAuthenticated && !state.isHydrated) {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          let cartItems: CartItem[] = normalizeCartItems(JSON.parse(savedCart));
          cartItems = cartItems.filter(item => {
            if (!item.perfume.in_stock) {
              console.log('Filtering out unavailable product from guest cart:', item.perfume.name);
              return false;
            }
            return true;
          });

          dispatch({ type: 'LOAD_CART', payload: cartItems });
        } catch (error) {
          console.error('Error loading guest cart from localStorage (secondary attempt):', error);
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      }
    }

    prevIsAuthenticatedRef.current = isAuthenticated;

  }, [isAuthenticated, state.isHydrated]);

  // Сохранение корзины в localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isAuthenticated) {
      console.log('Saving guest cart to localStorage:', state.items.length, 'items');
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } else {
      console.log('Skipping localStorage save - user is authenticated.');
    }
  }, [state.items, isAuthenticated]);

  // Загрузка корзины авторизованного пользователя
  useEffect(() => {
    if (!isAuthenticated) {
      if (state.isHydrated) {
        console.log('User logged out, clearing server-hydrated cart from localStorage.');
        localStorage.removeItem(CART_STORAGE_KEY);
      }
      dispatch({ type: 'SET_HYDRATED', payload: false });
      return;
    }

    let isActive = true;

    const loadUserCart = async () => {
      try {
        console.log('Loading user cart from server on mount');
        const response = await api.cart.get();
        const serverItemsRaw = (response.data as any)?.items ?? [];
        const serverItems = mapServerCartItems(serverItemsRaw);

        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        let localItems: CartItem[] = [];
        if (savedCart) {
          try {
            localItems = normalizeCartItems(JSON.parse(savedCart));
            console.log('Local guest cart items:', localItems.length, localItems);
          } catch (error) {
            console.error('Error parsing local cart:', error);
            localStorage.removeItem(CART_STORAGE_KEY);
          }
        }

        if (!isActive) return;

        let finalItems: CartItem[] = [];

        if (serverItems.length === 0 && localItems.length === 0) {
          console.log('No cart items found');
        } else if (serverItems.length === 0 && localItems.length > 0) {
          console.log('Only local cart found, syncing to server');
          finalItems = localItems;
        } else if (serverItems.length > 0 && localItems.length === 0) {
          console.log('Only server cart found');
          finalItems = serverItems;
        } else {
          console.log('Merging server and local carts');
          finalItems = mergeCartCollections(serverItems, localItems);
        }

        skipNextSyncRef.current = true;
        dispatch({ type: 'LOAD_CART', payload: finalItems });

        if (finalItems.length > serverItems.length) {
          console.log('Syncing merged cart to server');
          const payload = finalItems.map(item => ({
            product_type: item.productType,
            product_id: item.perfume.id,
            quantity: item.quantity,
            volume_option_id: item.volumeOptionId ?? null,
            weight_option_id: item.weightOptionId ?? null,
          }));
          console.log('Payload for merged cart sync (with variants):', payload);
          await api.cart.sync(payload);
          console.log('Merged cart synced to server');
        }

        console.log('Clearing guest cart from localStorage after successful server sync for authenticated user.');
        localStorage.removeItem(CART_STORAGE_KEY);

        console.log('User cart loaded and merged successfully');
      } catch (error) {
        console.error('Не удалось загрузить корзину пользователя:', error);
        console.log('Fallback for authenticated user: clearing cart and resetting hydration state due to server error.');
        dispatch({ type: 'LOAD_CART', payload: [] });
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    };

    loadUserCart();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated]);

  // Синхронизация корзины с сервером при изменениях
  const syncInProgressRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated) return;
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }

    if (!state.isHydrated) {
      console.log('Skipping sync - cart not yet hydrated from server (isAuthenticated)');
      return;
    }

    if (syncInProgressRef.current) {
      console.log('Skipping sync - another sync is already in progress');
      return;
    }

    const syncCart = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      syncInProgressRef.current = true;
      try {
        const payload = state.items.map(item => ({
          product_type: item.productType,
          product_id: item.perfume.id,
          quantity: item.quantity,
          volume_option_id: item.volumeOptionId ?? null,
          weight_option_id: item.weightOptionId ?? null,
        }));

        console.log('Syncing cart changes payload with variants:', payload);

        if (payload.length === 0 && state.isHydrated) {
          console.log('Skipping empty cart sync - cart was loaded from server');
          return;
        }

        console.log('Syncing cart changes:', payload);
        await api.cart.sync(payload);
        console.log('Cart changes synced successfully');
      } catch (error) {
        console.error('Ошибка синхронизации корзины с сервером:', error);
      } finally {
        syncInProgressRef.current = false;
      }
    };

    syncCart();
  }, [isAuthenticated, state.items, state.isHydrated]);

  const addItem = async (perfume: Perfume, productType: 'perfume' | 'pigment' = 'perfume', volumeOptionId?: number, weightOptionId?: number, quantity: number = 1) => {
    console.log('Adding item to cart:', perfume.id, perfume.name, productType, 'volumeOptionId:', volumeOptionId, 'quantity:', quantity, 'caller:', new Error().stack?.split('\n')[2]?.trim());

    // Removed blocking check for existing item to allow quantity updates

    try {
      let serverItemId: number | undefined;
      const volumeOptionForServer = volumeOptionId && volumeOptionId > 0 ? volumeOptionId : undefined;
      const weightOptionForServer = weightOptionId && weightOptionId > 0 ? weightOptionId : undefined;

      if (isAuthenticated) {
        const serverPayload = {
          product_type: productType,
          product_id: perfume.id,
          quantity: quantity,
          volume_option_id: volumeOptionForServer ?? null,
          weight_option_id: weightOptionForServer ?? null
        };
        console.log('Sending addItem payload to server:', serverPayload);
        const response = await api.cart.addItem({
          product_type: productType,
          product_id: perfume.id,
          quantity: quantity,
          volume_option_id: volumeOptionForServer ?? undefined,
          weight_option_id: weightOptionForServer ?? undefined
        });

        if (response.data && (response.data as any).id) {
          serverItemId = (response.data as any).id;
          console.log('Item added to server cart, received ID:', serverItemId);
        }
      }

      const payload = { ...perfume, product_type: productType } as Perfume;
      const clientVolumeOptionId = volumeOptionForServer ?? undefined;
      const clientWeightOptionId = weightOptionForServer ?? undefined;
      dispatch({ type: 'ADD_ITEM', payload, volumeOptionId: clientVolumeOptionId, weightOptionId: clientWeightOptionId, serverItemId, quantity });
    } catch (error: any) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  };

  const removeItem = async (id: string) => {
    if (id.startsWith('srv-')) {
      const serverId = id.replace('srv-', '');
      try {
        console.log('Removing item from server:', serverId);
        await api.cart.removeItem(parseInt(serverId));
        console.log('Item removed from server successfully');
      } catch (error) {
        console.error('Error removing item from server:', error);
      }
    }

    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CART_STORAGE_KEY);
      if (!isAuthenticated) {
        dispatch({ type: 'SET_HYDRATED', payload: false });
      }
    }
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

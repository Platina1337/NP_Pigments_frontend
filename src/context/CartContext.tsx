'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useRef } from 'react';
import { CartItem, CartState, Perfume } from '@/types';
import { api } from '@/lib/api';
import { normalizeProductPayload } from '@/lib/product-normalizer';
import { useAuth } from '@/context/AuthContext';

// Действия для reducer
type CartAction =
  | { type: 'ADD_ITEM'; payload: Perfume }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SET_HYDRATED'; payload: boolean }; // Новое действие
const CART_STORAGE_KEY = 'perfume-cart';
// Удаляем CART_HYDRATED_KEY, так как будем использовать состояние внутри редьюсера

// Начальное состояние корзины
const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isHydrated: false, // Изначально не гидратировано
};

// Reducer для управления состоянием корзины
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const payloadType = (action.payload as any)?.product_type || 'perfume';
      const existingItem = state.items.find(
        item => item.perfume.id === action.payload.id && item.productType === payloadType
      );

      let newItems: CartItem[];

      if (existingItem) {
        // Увеличиваем количество существующего товара
        newItems = state.items.map(item =>
          item.perfume.id === action.payload.id && item.productType === payloadType
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Добавляем новый товар
        const newItem: CartItem = {
          id: `${action.payload.id}-${Date.now()}`, // Уникальный ID для корзины
          perfume: action.payload,
          quantity: 1,
          productType: payloadType,
        };
        newItems = [...state.items, newItem];
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
        isHydrated: true, // После загрузки корзины устанавливаем флаг
      };
    }

    case 'SET_HYDRATED':
      return {
        ...state,
        isHydrated: action.payload,
      };

    default:
      return state;
  }
};

// Вспомогательные функции
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + (parseFloat(item.perfume.price) * item.quantity);
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
      const cartItems: CartItem[] = normalizeCartItems(JSON.parse(savedCart));
      console.log('Initial load from localStorage:', cartItems.length, 'items');
      return {
        items: cartItems,
        total: calculateTotal(cartItems),
        itemCount: calculateItemCount(cartItems),
        isHydrated: true, // Указываем, что корзина уже гидратирована
      };
    }
  } catch (error) {
    console.error('Error loading initial cart from localStorage:', error);
    // Если произошла ошибка, возвращаем пустое начальное состояние
    localStorage.removeItem(CART_STORAGE_KEY); // Очищаем некорректные данные
  }
  return initialState;
};

const mapServerCartItems = (items: any[]): CartItem[] => {
  return items
    .map(item => {
      const productData = normalizeProductPayload(item.product_data);
      if (!productData) return null;
      return {
        id: `srv-${item.id}`,
        perfume: productData,
        quantity: item.quantity,
        productType: item.product_data?.product_type || 'perfume',
      } as CartItem;
    })
    .filter(Boolean) as CartItem[];
};

const mergeCartCollections = (serverItems: CartItem[], localItems: CartItem[]): CartItem[] => {
  const merged = new Map<string, CartItem>();

  const addItem = (item: CartItem, preserveId = false) => {
    const key = `${item.productType}-${item.perfume.id}`;
    if (merged.has(key)) {
      const existing = merged.get(key)!;
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
  addItem: (perfume: Perfume, productType?: 'perfume' | 'pigment') => void;
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
  // Инициализируем состояние с помощью функции getInitialCartState
  const [state, dispatch] = useReducer(cartReducer, getInitialCartState());
  const { isAuthenticated } = useAuth();
  const skipNextSyncRef = useRef(false);
  const latestItemsRef = useRef<CartItem[]>([]);
  const prevIsAuthenticatedRef = useRef(isAuthenticated); // Добавляем useRef для отслеживания предыдущего значения

  useEffect(() => {
    latestItemsRef.current = state.items;
  }, [state.items]);

  // Загрузка корзины из localStorage при монтировании (теперь только для гостей, если она еще не гидратирована)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Если пользователь был авторизован, а теперь вышел, сбрасываем флаг гидратации
    // Эта логика перенесена сюда и улучшена для предотвращения бесконечного цикла
    if (!isAuthenticated && prevIsAuthenticatedRef.current && state.isHydrated) {
      console.log('User logged out, resetting hydration state');
      dispatch({ type: 'SET_HYDRATED', payload: false });
    }

    // Для гостей, если корзина не гидратирована, но есть в localStorage, загружаем
    // Также загружаем, если пользователь вышел и корзина еще не гидратирована (prevIsAuthenticatedRef.current)
    if (!isAuthenticated && !state.isHydrated) {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          const cartItems: CartItem[] = normalizeCartItems(JSON.parse(savedCart));
          dispatch({ type: 'LOAD_CART', payload: cartItems });
        } catch (error) {
          console.error('Error loading guest cart from localStorage (secondary attempt):', error);
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      }
    }

    // Обновляем prevIsAuthenticatedRef для следующего рендера
    prevIsAuthenticatedRef.current = isAuthenticated;

  }, [isAuthenticated, state.isHydrated]); // Удаляем state.isHydrated из зависимостей, так как оно меняется внутри этого useEffect

  // Сохранение корзины в localStorage при изменении (только если не авторизована)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Сохраняем только если пользователь не авторизован
    if (!isAuthenticated) {
      console.log('Saving guest cart to localStorage:', state.items.length, 'items');
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } else {
      console.log('Skipping localStorage save - user is authenticated.');
    }
  }, [state.items, isAuthenticated]); // Убрали state.isHydrated из зависимостей, так как оно не нужно для логики сохранения гостевой корзины

  // Загрузка корзины авторизованного пользователя с сервера при каждом монтировании
  useEffect(() => {
    if (!isAuthenticated) {
      // При выходе из системы, если корзина была гидратирована с сервера, мы очищаем локальное хранилище, чтобы оно не мешало гостевой корзине.
      // Если же корзина была гостевой, то она будет сохранена, как обычно.
      if (state.isHydrated) { // Только если корзина была гидратирована сервером (т.е. пользователь был авторизован)
        console.log('User logged out, clearing server-hydrated cart from localStorage.');
        localStorage.removeItem(CART_STORAGE_KEY);
      }
      dispatch({ type: 'SET_HYDRATED', payload: false }); // Сбрасываем флаг при выходе
      return;
    }

    let isActive = true;

    const loadUserCart = async () => {
      try {
        console.log('Loading user cart from server on mount');
        const response = await api.cart.get();
        const serverItemsRaw = (response.data as any)?.items ?? [];
        const serverItems = mapServerCartItems(serverItemsRaw);

        // Получаем локальную корзину гостя из localStorage
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
        dispatch({ type: 'LOAD_CART', payload: finalItems }); // LOAD_CART теперь устанавливает isHydrated в true

        if (finalItems.length > serverItems.length) {
          console.log('Syncing merged cart to server');
          const payload = finalItems.map(item => ({
            product_type: item.productType,
            product_id: item.perfume.id,
            quantity: item.quantity,
          }));
          await api.cart.sync(payload);
          console.log('Merged cart synced to server');
        }

        // Очищаем localStorage от корзины гостя, так как теперь она синхронизирована и больше не нужна
        console.log('Clearing guest cart from localStorage after successful server sync for authenticated user.');
        localStorage.removeItem(CART_STORAGE_KEY);

        console.log('User cart loaded and merged successfully');
      } catch (error) {
        console.error('Не удалось загрузить корзину пользователя:', error);
        // В случае ошибки пробуем загрузить из localStorage как fallback
        // Но в данном случае, если это авторизованный пользователь, мы не должны полагаться на localStorage
        // Вместо этого, можно просто загрузить пустую корзину или показать ошибку
        console.log('Fallback for authenticated user: clearing cart and resetting hydration state due to server error.');
        dispatch({ type: 'LOAD_CART', payload: [] }); // Загружаем пустую корзину
        localStorage.removeItem(CART_STORAGE_KEY); // Убедимся, что localStorage чист
      }
    };

    loadUserCart();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated]);

  // Синхронизация корзины с сервером при изменениях
  useEffect(() => {
    if (!isAuthenticated) return;
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }

    // Теперь используем state.isHydrated
    if (!state.isHydrated) {
      console.log('Skipping sync - cart not yet hydrated from server (isAuthenticated)');
      return;
    }

    const syncCart = async () => {
      try {
        const payload = state.items.map(item => ({
          product_type: item.productType,
          product_id: item.perfume.id,
          quantity: item.quantity,
        }));

        // Не отправляем пустой массив, если корзина была загружена с сервера
        // Это предотвращает очистку корзины при обновлении страницы
        if (payload.length === 0 && state.isHydrated) { // Используем state.isHydrated
          console.log('Skipping empty cart sync - cart was loaded from server');
          return;
        }

        console.log('Syncing cart changes:', payload);
        await api.cart.sync(payload);
        console.log('Cart changes synced successfully');
      } catch (error) {
        console.error('Ошибка синхронизации корзины с сервером:', error);
      }
    };

    syncCart();
  }, [isAuthenticated, state.items, state.isHydrated]); // Добавляем state.isHydrated в зависимости

  const addItem = (perfume: Perfume, productType: 'perfume' | 'pigment' = 'perfume') => {
    console.log('Adding item to cart:', perfume.id, productType);
    const payload = { ...perfume, product_type: productType } as Perfume;
    dispatch({ type: 'ADD_ITEM', payload });
  };

  const removeItem = async (id: string) => {
    // Если ID начинается с 'srv-', это серверный элемент, нужно удалить через API
    if (id.startsWith('srv-')) {
      const serverId = id.replace('srv-', '');
      try {
        console.log('Removing item from server:', serverId);
        await api.cart.removeItem(parseInt(serverId));
        console.log('Item removed from server successfully');
      } catch (error) {
        console.error('Error removing item from server:', error);
        // Даже если API вызов не удался, удаляем из локального состояния
      }
    }

    // Всегда удаляем из локального состояния
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    // При очистке корзины также очищаем localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CART_STORAGE_KEY);
      // Если пользователь не авторизован, сбрасываем флаг гидратации, так как корзина пуста
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

// Хук для использования контекста корзины
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

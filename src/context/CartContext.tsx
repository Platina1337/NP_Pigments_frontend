'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem, CartState, Perfume } from '@/types';

// Действия для reducer
type CartAction =
  | { type: 'ADD_ITEM'; payload: Perfume }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

// Начальное состояние корзины
const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

// Reducer для управления состоянием корзины
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        item => item.perfume.id === action.payload.id
      );

      let newItems: CartItem[];

      if (existingItem) {
        // Увеличиваем количество существующего товара
        newItems = state.items.map(item =>
          item.perfume.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Добавляем новый товар
        const newItem: CartItem = {
          id: `${action.payload.id}-${Date.now()}`, // Уникальный ID для корзины
          perfume: action.payload,
          quantity: 1,
        };
        newItems = [...state.items, newItem];
      }

      const total = calculateTotal(newItems);
      const itemCount = calculateItemCount(newItems);

      return {
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
        items: action.payload,
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
    return total + (parseFloat(item.perfume.price) * item.quantity);
  }, 0);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

// Контекст
interface CartContextType {
  state: CartState;
  addItem: (perfume: Perfume) => void;
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
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Загрузка корзины из localStorage при монтировании
  useEffect(() => {
    const savedCart = localStorage.getItem('perfume-cart');
    if (savedCart) {
      try {
        const cartItems: CartItem[] = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Сохранение корзины в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('perfume-cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (perfume: Perfume) => {
    dispatch({ type: 'ADD_ITEM', payload: perfume });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
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

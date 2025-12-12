'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  ShoppingCart,
  User,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  active?: boolean;
  badge?: number;
  isSpecial?: boolean;
}

export const MobileBottomNavbar: React.FC = () => {
  const { state } = useCart();
  const pathname = usePathname();

  // Оптимизированные элементы навигации - только самые важные
  const navItems: NavItem[] = [
    {
      href: '/',
      label: 'Главная',
      icon: Home,
      active: pathname === '/'
    },
    {
      href: '/products',
      label: 'Каталог',
      icon: Package,
      active: pathname === '/products' || pathname.startsWith('/products/')
    },
    {
      href: '/cart',
      label: 'Корзина',
      icon: ShoppingCart,
      badge: state.itemCount,
      active: pathname === '/cart',
      isSpecial: state.itemCount > 0
    },
    {
      href: '/profile',
      label: 'Профиль',
      icon: User,
      active: pathname === '/profile'
    }
  ];

  return (
    <>
      {/* Современный нижний навбар NP Academy - показывается ТОЛЬКО на мобильных */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-background/95 backdrop-blur-xl border-t border-border shadow-lg safe-area-inset-bottom">
          <div className="px-2 py-3">
            <div className="flex items-center justify-around max-w-md mx-auto">
              {navItems.map((item) => (
                <NavItemComponent key={item.href} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Отступ для навбара на мобильных */}
      <div className="h-16 md:h-0" />
    </>
  );
};

// Компонент отдельного элемента навигации с улучшенным дизайном
const NavItemComponent: React.FC<{ item: NavItem }> = ({ item }) => {
  const IconComponent = item.icon;

  return (
    <Link
      href={item.href}
      className={`
        relative flex flex-col items-center justify-center space-y-1 p-3 rounded-2xl transition-all duration-300 group
        min-w-[60px] h-14
        ${item.active
          ? 'bg-primary/10 text-primary shadow-md'
          : item.isSpecial
            ? 'bg-accent/10 text-accent'
            : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
        }
      `}
    >
      {/* Иконка с улучшенной анимацией */}
      <div className="relative">
        <IconComponent
          size={22}
          className={`
            transition-all duration-300
            ${item.active
              ? 'scale-110 drop-shadow-sm'
              : item.isSpecial
                ? 'scale-105'
                : 'group-hover:scale-105'
            }
          `}
        />

        {/* Бейдж для уведомлений (корзина) */}
        {item.badge && item.badge > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
            {item.badge > 99 ? '99+' : item.badge}
          </div>
        )}
      </div>

      {/* Текст с лучшей читаемостью */}
      <span className={`
        text-[10px] font-medium leading-tight text-center transition-all duration-300
        ${item.active
          ? 'text-primary'
          : item.isSpecial
            ? 'text-accent'
            : 'text-muted-foreground group-hover:text-primary'
        }
      `}>
        {item.label}
      </span>

      {/* Активный индикатор под элементом - фирменный бирюзовый */}
      {item.active && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-primary rounded-full"></div>
      )}
    </Link>
  );
};

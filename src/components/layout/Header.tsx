'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  LogIn,
  UserPlus,
  Heart,
  Bell,
  Settings,
  LogOut,
  Package,
  TrendingUp
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { MiniCart } from '@/components/cart/MiniCart';
import { Button, Icon, Input, ThemeToggle } from '@/components/ui';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { state } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme } = useTheme();
  const searchRef = useRef<HTMLInputElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const cartDropdownRef = useRef<HTMLDivElement>(null);

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (isCartDropdownOpen && !target.closest('.cart-dropdown-container')) {
        setIsCartDropdownOpen(false);
      }

      if (isUserDropdownOpen && !target.closest('.user-dropdown-container')) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCartDropdownOpen, isUserDropdownOpen]);

  // Handle user dropdown hover with improved timing
  const userDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleUserMouseEnter = () => {
    if (userDropdownTimeoutRef.current) {
      clearTimeout(userDropdownTimeoutRef.current);
      userDropdownTimeoutRef.current = null;
    }
    setIsUserDropdownOpen(true);
  };

  const handleUserMouseLeave = () => {
    userDropdownTimeoutRef.current = setTimeout(() => {
      if (!userDropdownRef.current?.matches(':hover')) {
        setIsUserDropdownOpen(false);
      }
    }, 300);
  };

  const handleUserClick = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  // Handle cart dropdown hover with improved timing
  const cartDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCartMouseEnter = () => {
    if (cartDropdownTimeoutRef.current) {
      clearTimeout(cartDropdownTimeoutRef.current);
      cartDropdownTimeoutRef.current = null;
    }
    setIsCartDropdownOpen(true);
  };

  const handleCartMouseLeave = () => {
    cartDropdownTimeoutRef.current = setTimeout(() => {
      if (!cartDropdownRef.current?.matches(':hover')) {
        setIsCartDropdownOpen(false);
      }
    }, 300);
  };

  // Handle search focus
  useEffect(() => {
    if (isSearchFocused && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearchFocused]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };


  return (
    <>
      <header className={`transition-all duration-300 fixed top-0 left-0 right-0 z-[100] bg-white/80 dark:bg-primary/90 backdrop-blur-sm border-b border-gray-200 dark:border-white/10 ${isScrolled
        ? 'shadow-lg shadow-black/5 dark:shadow-black/20'
        : 'shadow-sm'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Логотип */}
            <Link href="/" className="flex items-center group">
              <div className="w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 active:scale-95">
                <img
                  src={theme === 'dark' ? "/navbar-logo.svg" : "/navbar-logo-black.png"}
                  alt="NP Perfumes"
                  className="w-full h-full object-contain transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg"
                />
              </div>
            </Link>

            {/* Навигация для десктопа */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/products"
                className="relative px-4 py-2 text-foreground/70 dark:text-white/80 transition-all duration-300 font-medium rounded-lg hover:scale-105 active:scale-95 group light:hover:text-primary light:hover:bg-primary/5 light:hover:shadow-primary/10 dark:hover:text-black dark:hover:bg-black/10 dark:hover:shadow-black/20"
              >
                <span className="transition-all duration-300 group-hover:font-semibold">Каталог</span>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 transition-all duration-300 group-hover:w-full group-hover:shadow-sm light:group-hover:shadow-primary/20 dark:group-hover:shadow-black/30 light:bg-gradient-to-r light:from-primary light:to-primary/80 dark:bg-gradient-to-r dark:from-black dark:to-black/80"></div>
              </Link>

              <Link
                href="/brands"
                className="relative px-4 py-2 text-foreground/70 dark:text-white/80 transition-all duration-300 font-medium rounded-lg hover:scale-105 active:scale-95 group light:hover:text-primary light:hover:bg-primary/5 light:hover:shadow-primary/10 dark:hover:text-black dark:hover:bg-black/10 dark:hover:shadow-black/20"
              >
                <span className="transition-all duration-300 group-hover:font-semibold">Бренды</span>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 transition-all duration-300 group-hover:w-full group-hover:shadow-sm light:group-hover:shadow-primary/20 dark:group-hover:shadow-black/30 light:bg-gradient-to-r light:from-primary light:to-primary/80 dark:bg-gradient-to-r dark:from-black dark:to-black/80"></div>
              </Link>
            </nav>

            {/* Поиск */}
            <div className="hidden sm:flex items-center flex-1 max-w-lg mx-3 sm:mx-6">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <div className="relative">
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Поиск парфюма, бренда..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    style={{ paddingLeft: '72px' }}
                    className={`w-full pr-12 py-2.5 rounded-full border-2 transition-all duration-300 bg-background/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] focus:scale-100 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-muted-foreground ${isSearchFocused
                      ? 'border-primary shadow-xl shadow-primary/20 scale-100'
                      : 'border-border/50 hover:border-primary/30'
                      }`}
                  />
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner shadow-primary/10 z-10">
                    <Search className="h-5 w-5" />
                  </span>
                  {searchQuery && (
                    <button
                      type="submit"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-110 active:scale-95 group"
                    >
                      <Icon icon={Search} size={16} className="text-primary transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 group-hover:drop-shadow-sm" />
                    </button>
                  )}
                </div>

                {/* Быстрые фильтры */}
                {isSearchFocused && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg p-4 z-50">
                    <div className="flex items-center space-x-2 mb-3">
                      <Icon icon={TrendingUp} size={16} className="text-primary" />
                      <span className="text-sm font-medium text-foreground">Популярные запросы</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Chanel', 'Dior', 'Tom Ford', 'Yves Saint Laurent', 'Hermès'].map((brand) => (
                        <button
                          key={brand}
                          onClick={() => setSearchQuery(brand)}
                          className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors duration-200"
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Действия пользователя */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Уведомления */}
              <Button
                variant="glass"
                size="sm"
                className="rounded-full p-2 sm:p-2.5 hover:bg-primary/10 hover:text-white transition-all duration-300 relative group hover:shadow-lg hover:shadow-primary/20 hover:scale-110 active:scale-95"
              >
                <Icon icon={Bell} size={16} className="sm:w-[18px] sm:h-[18px] group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 group-hover:drop-shadow-sm group-hover:filter group-hover:brightness-110" />
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full min-w-[14px] h-[14px] sm:min-w-[16px] sm:h-[16px] flex items-center justify-center font-semibold animate-pulse shadow-lg group-hover:animate-bounce group-hover:bg-orange-400 transition-colors duration-300">
                  2
                </div>
              </Button>

              {/* Профиль пользователя с dropdown */}
              <div
                ref={userDropdownRef}
                className="relative user-dropdown-container"
                onMouseEnter={handleUserMouseEnter}
                onMouseLeave={handleUserMouseLeave}
              >
                <Button
                  variant="glass"
                  size="sm"
                  className="rounded-full p-2 sm:p-2.5 hover:bg-primary/10 hover:text-white transition-all duration-300 relative group hover:shadow-lg hover:shadow-primary/20 hover:scale-110 active:scale-95"
                  onClick={handleUserClick}
                >
                  <Icon icon={User} size={16} className="sm:w-[18px] sm:h-[18px] group-hover:scale-125 transition-all duration-300 group-hover:rotate-6 group-hover:drop-shadow-sm group-hover:filter group-hover:brightness-110" />
                  {/* Индикатор для неавторизованных пользователей */}
                  {!isAuthenticated && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-500 rounded-full animate-pulse group-hover:animate-bounce group-hover:bg-orange-400 transition-all duration-300"></div>
                  )}
                </Button>

                {/* Dropdown меню */}
                {isUserDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-background border border-border rounded-xl shadow-xl z-50 backdrop-blur-sm animate-in slide-in-from-top-2 duration-200"
                    onMouseEnter={handleUserMouseEnter}
                    onMouseLeave={handleUserMouseLeave}
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="p-4 border-b border-border">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                              <Icon icon={User} size={20} className="text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{user?.first_name || user?.username}</p>
                              <p className="text-sm text-foreground/70">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-2">
                          <Link href="/profile" className="flex items-center space-x-3 px-3 py-2.5 text-foreground/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group">
                            <Icon icon={User} size={16} className="group-hover:scale-110 transition-transform duration-200" />
                            <span>Профиль</span>
                          </Link>
                          <Link href="/orders" className="flex items-center space-x-3 px-3 py-2.5 text-foreground/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group">
                            <Icon icon={Package} size={16} className="group-hover:scale-110 transition-transform duration-200" />
                            <span>Мои заказы</span>
                          </Link>
                          <Link href="/favorites" className="flex items-center space-x-3 px-3 py-2.5 text-foreground/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group">
                            <Icon icon={Heart} size={16} className="group-hover:scale-110 transition-transform duration-200" />
                            <span>Избранное</span>
                          </Link>
                          <Link href="/settings" className="flex items-center space-x-3 px-3 py-2.5 text-foreground/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group">
                            <Icon icon={Settings} size={16} className="group-hover:scale-110 transition-transform duration-200" />
                            <span>Настройки</span>
                          </Link>
                          <div className="border-t border-border my-2"></div>
                          <button
                            onClick={() => {
                              logout();
                              setIsUserDropdownOpen(false);
                            }}
                            className="flex items-center space-x-3 px-3 py-2.5 text-foreground/70 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 w-full group"
                          >
                            <Icon icon={LogOut} size={16} className="group-hover:scale-110 transition-transform duration-200" />
                            <span>Выйти</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-5">
                        <div className="text-center mb-5">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon icon={User} size={28} className="text-primary" />
                          </div>
                          <h3 className="font-bold text-lg text-foreground mb-2">Добро пожаловать!</h3>
                          <p className="text-sm text-foreground/70">Войдите в аккаунт или создайте новый для доступа ко всем функциям</p>
                        </div>

                        <div className="space-y-3">
                          <Link href="/login" className="block">
                            <Button variant="secondary" className="w-full justify-center px-4 py-3 border-2 hover:bg-primary hover:text-white-foreground hover:border-primary transition-all duration-300 font-medium">
                              <Icon icon={LogIn} size={18} className="mr-3" />
                              Войти в аккаунт
                            </Button>
                          </Link>
                          <Link href="/register" className="block">
                            <Button variant="primary" className="w-full justify-center px-4 py-3 bg-primary hover:bg-primary/90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
                              <Icon icon={UserPlus} size={18} className="mr-3" />
                              Создать аккаунт
                            </Button>
                          </Link>
                        </div>

                        <div className="border-t border-border mt-5 pt-4">
                          <p className="text-xs text-foreground/60 text-center mb-3 font-medium">Быстрый вход через</p>
                          <div className="flex space-x-2">
                            <Button variant="secondary" size="sm" className="flex-1 text-xs py-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200">
                              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                              </svg>
                              Google
                            </Button>
                            <Button variant="secondary" size="sm" className="flex-1 text-xs py-2 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600 transition-all duration-200">
                              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.352-2.376-2.156-.172-3.589 1.26-4.597 1.26z" />
                              </svg>
                              Apple
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Переключатель темы */}
              <div className="hidden md:block">
                <ThemeToggle />
              </div>

              {/* Корзина */}
              <div
                ref={cartDropdownRef}
                className="relative cart-dropdown-container"
                onMouseEnter={handleCartMouseEnter}
                onMouseLeave={handleCartMouseLeave}
              >
                <Link href="/cart">
                  <Button
                    variant="glass"
                    size="sm"
                    className="rounded-full p-2 sm:p-2.5 relative hover:bg-primary/10 hover:text-white transition-all duration-300 group hover:shadow-lg hover:shadow-primary/20 hover:scale-110 active:scale-95"
                  >
                    <Icon icon={ShoppingCart} size={18} className="sm:w-5 sm:h-5 group-hover:scale-125 group-hover:-rotate-6 transition-all duration-300 group-hover:drop-shadow-sm group-hover:filter group-hover:brightness-110" />
                    {state.itemCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] flex items-center justify-center font-semibold shadow-lg animate-bounce group-hover:animate-pulse group-hover:bg-primary/90 transition-all duration-300">
                        {state.itemCount > 99 ? '99+' : state.itemCount}
                      </div>
                    )}
                  </Button>
                </Link>

                {/* Мини-корзина dropdown */}
                {isCartDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 z-50 animate-in slide-in-from-top-2 duration-200"
                    onMouseEnter={handleCartMouseEnter}
                    onMouseLeave={handleCartMouseLeave}
                  >
                    <div className="bg-background border border-border rounded-xl shadow-xl backdrop-blur-sm">
                      <MiniCart />
                    </div>
                  </div>
                )}
              </div>

              {/* Мобильное меню */}
              <Button
                variant="secondary"
                size="sm"
                className="p-2.5 sm:p-3 md:hidden rounded-xl hover:bg-primary/10 hover:text-white transition-all duration-300 group hover:shadow-lg hover:shadow-primary/20 hover:scale-110 active:scale-95"
                onClick={toggleMenu}
              >
                <Icon icon={isMenuOpen ? X : Menu} size={16} className="sm:w-[18px] sm:h-[18px] group-hover:scale-125 transition-all duration-300 group-hover:rotate-90 group-hover:drop-shadow-sm group-hover:filter group-hover:brightness-110" />
              </Button>
            </div>
          </div>


          {/* Мобильная навигация */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border py-6 animate-in slide-in-from-top-2 duration-300">
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/"
                  className="text-foreground/70 hover:text-white hover:bg-white/10 transition-all duration-300 px-4 py-3 font-medium rounded-lg mx-2 hover:shadow-lg hover:shadow-primary/10 hover:scale-105 active:scale-95 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="transition-all duration-300 group-hover:font-semibold">Главная</span>
                </Link>
                <Link
                  href="/products"
                  className="text-foreground/70 hover:text-white hover:bg-white/10 transition-all duration-300 px-4 py-3 font-medium rounded-lg mx-2 hover:shadow-lg hover:shadow-primary/10 hover:scale-105 active:scale-95 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="transition-all duration-300 group-hover:font-semibold">Каталог</span>
                </Link>
                <Link
                  href="/brands"
                  className="text-foreground/70 hover:text-white hover:bg-white/10 transition-all duration-300 px-4 py-3 font-medium rounded-lg mx-2 hover:shadow-lg hover:shadow-primary/10 hover:scale-105 active:scale-95 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="transition-all duration-300 group-hover:font-semibold">Бренды</span>
                </Link>

                {/* Аутентификация для мобильных */}
                <div className="px-4 py-3 space-y-3">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="text-center py-3 border-b border-border bg-primary/5 rounded-lg mx-2">
                        <p className="text-sm font-semibold text-foreground">
                          {user?.first_name || user?.username}
                        </p>
                        <p className="text-xs text-foreground/70">{user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 w-full px-4 py-3 text-foreground/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 group hover:shadow-lg hover:shadow-primary/10 hover:scale-105 active:scale-95"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon icon={User} size={18} className="group-hover:scale-125 group-hover:rotate-6 transition-all duration-300 group-hover:drop-shadow-sm group-hover:filter group-hover:brightness-110" />
                        <span className="transition-all duration-300 group-hover:font-semibold">Профиль</span>
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center space-x-3 w-full px-4 py-3 text-foreground/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 group hover:shadow-lg hover:shadow-primary/10 hover:scale-105 active:scale-95"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon icon={Package} size={18} className="group-hover:scale-125 group-hover:-rotate-6 transition-all duration-300 group-hover:drop-shadow-sm group-hover:filter group-hover:brightness-110" />
                        <span className="transition-all duration-300 group-hover:font-semibold">Мои заказы</span>
                      </Link>
                      <Link
                        href="/favorites"
                        className="flex items-center space-x-3 w-full px-4 py-3 text-foreground/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 group hover:shadow-lg hover:shadow-primary/10 hover:scale-105 active:scale-95"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon icon={Heart} size={18} className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 group-hover:drop-shadow-sm group-hover:filter group-hover:brightness-110" />
                        <span className="transition-all duration-300 group-hover:font-semibold">Избранное</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-foreground/70 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 group hover:shadow-lg hover:shadow-red-500/10 hover:scale-105 active:scale-95"
                      >
                        <Icon icon={LogOut} size={18} className="group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300 group-hover:drop-shadow-sm group-hover:filter group-hover:brightness-110" />
                        <span className="transition-all duration-300 group-hover:font-semibold">Выйти</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center py-3 bg-primary/5 rounded-lg mx-2">
                        <p className="text-sm font-medium text-foreground mb-2">Добро пожаловать!</p>
                        <p className="text-xs text-foreground/70">Войдите в аккаунт для доступа ко всем функциям</p>
                      </div>
                      <Link
                        href="/login"
                        className="flex items-center space-x-3 w-full px-4 py-3 text-foreground/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 group hover:shadow-lg hover:shadow-primary/10 hover:scale-105 active:scale-95"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon icon={LogIn} size={18} className="group-hover:scale-125 group-hover:rotate-6 transition-all duration-300 group-hover:drop-shadow-sm group-hover:filter group-hover:brightness-110" />
                        <span className="transition-all duration-300 group-hover:font-semibold">Войти</span>
                      </Link>
                      <Link
                        href="/register"
                        className="flex items-center space-x-3 w-full px-4 py-3 text-primary hover:text-white-foreground hover:bg-primary rounded-lg transition-all duration-300 group font-medium hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon icon={UserPlus} size={18} className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 group-hover:drop-shadow-sm group-hover:filter group-hover:brightness-110" />
                        <span className="transition-all duration-300 group-hover:font-semibold">Регистрация</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Переключатель темы для мобильных */}
                <div className="px-4 py-2">
                  <ThemeToggle />
                </div>

                {/* Поиск для мобильных */}
                <div className="px-4 py-3">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="text"
                      placeholder="Поиск парфюма..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 py-3 text-base rounded-xl border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-300 bg-secondary border-border placeholder:text-muted-foreground"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Icon icon={Search} size={18} className="text-foreground/50" />
                    </div>
                    {searchQuery && (
                      <button
                        type="submit"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-primary/10 transition-colors duration-200"
                      >
                        <Icon icon={Search} size={16} className="text-primary" />
                      </button>
                    )}
                  </form>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

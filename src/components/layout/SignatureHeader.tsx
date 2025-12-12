'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Heart,
  Package,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { MiniCart } from '@/components/cart/MiniCart';
import { ThemeToggle } from '@/components/ui';
import { api } from '@/lib/api';

const navLinks = [
  { label: 'Главная', href: '/' },
  { label: 'Каталог', href: '/products', accent: 'новинки' },
  { label: 'Бренды', href: '/brands' },
  { label: 'Академия', href: '/profile' },
];

const defaultQuickSearches = [
  'ароматы дня',
  'унисекс',
  'travel-наборы',
  'подарочные сертификаты',
];

const userShortcuts = [
  { label: 'Избранное', href: '/profile?tab=favorites', icon: Heart },
  { label: 'Мои заказы', href: '/orders', icon: Package },
];

export const SignatureHeader: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartMenuOpen, setCartMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>(defaultQuickSearches);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const [cartMenuVisible, setCartMenuVisible] = useState(false);

  const { state } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // Получаем рекомендуемые товары (featured)
        const [perfumesRes, pigmentsRes] = await Promise.all([
          api.perfumes.getFeatured(),
          api.pigments.getFeatured(),
        ]);

        // Извлекаем данные
        const perfumes = Array.isArray(perfumesRes.data) ? perfumesRes.data : [];
        const pigments = Array.isArray(pigmentsRes.data) ? pigmentsRes.data : [];

        // Собираем список товаров
        let items = [...perfumes, ...pigments];

        // Если мало рекомендуемых, загружаем обычные (limit=5)
        if (items.length < 4) {
          const [allPerfumesRes, allPigmentsRes] = await Promise.all([
            api.perfumes.getAll({ page_size: '5' }),
            api.pigments.getAll({ page_size: '5' }),
          ]);
          
          // Обработка ответов с пагинацией
          const morePerfumes = allPerfumesRes.data && typeof allPerfumesRes.data === 'object' && 'results' in (allPerfumesRes.data as any)
            ? (allPerfumesRes.data as any).results 
            : (Array.isArray(allPerfumesRes.data) ? allPerfumesRes.data : []);
            
          const morePigments = allPigmentsRes.data && typeof allPigmentsRes.data === 'object' && 'results' in (allPigmentsRes.data as any)
            ? (allPigmentsRes.data as any).results
            : (Array.isArray(allPigmentsRes.data) ? allPigmentsRes.data : []);

          items = [...items, ...morePerfumes, ...morePigments];
        }

        // Извлекаем уникальные названия, перемешиваем и берем первые 5
        const names = Array.from(new Set(items.map((item: any) => item.name)))
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);

        if (names.length > 0) {
          setSuggestions(names);
        }
      } catch (error) {
        console.error('Failed to fetch search suggestions:', error);
        // Fallback to default searches is already set in state initialization
      }
    };

    fetchSuggestions();
  }, []);

  const baseRowRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const cartMenuRef = useRef<HTMLDivElement>(null);
  const panelSearchRef = useRef<HTMLInputElement>(null);
  const overlaySearchRef = useRef<HTMLInputElement>(null);

  const palette = useMemo(() => {
    if (theme === 'dark') {
      return {
        surface: 'bg-emerald-950/85 border-emerald-700/40 text-emerald-50 shadow-black/30',
        panel: 'bg-emerald-950/95 border-emerald-700/40 shadow-emerald-950/50 text-emerald-50',
        pill: 'bg-emerald-900/30 border-emerald-800/40 text-emerald-100',
        hover: 'hover:bg-emerald-500/15 hover:text-white',
        iconBtn: 'border-white/15 bg-white/5',
        menuItem: 'border-white/10 hover:bg-white/5',
      } as const;
    }
    return {
      surface: 'bg-white/90 border-gray-200 text-gray-900 shadow-black/5',
      panel: 'bg-white border-gray-200 shadow-2xl text-gray-900',
      pill: 'bg-slate-100 border-slate-200 text-slate-700',
      hover: 'hover:bg-gray-900/5 hover:text-gray-900',
      iconBtn: 'border-gray-200 bg-white/70',
      menuItem: 'border-gray-200 hover:bg-gray-50',
    } as const;
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 24;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (isExpanded) {
        const insideBase = baseRowRef.current?.contains(target);
        const insidePanel = menuPanelRef.current?.contains(target);
        if (!insideBase && !insidePanel) {
          setIsExpanded(false);
        }
      }

      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (cartMenuOpen && cartMenuRef.current && !cartMenuRef.current.contains(target)) {
        setCartMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, userMenuOpen, cartMenuOpen]);

  useEffect(() => {
    if (isExpanded) {
      setMenuVisible(true);
      const timeout = setTimeout(() => panelSearchRef.current?.focus(), 150);
      return () => clearTimeout(timeout);
    } else {
      // Запускаем анимацию закрытия
      const timeout = setTimeout(() => setMenuVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (isSearchOverlayOpen) {
      const timeout = setTimeout(() => overlaySearchRef.current?.focus(), 120);
      return () => clearTimeout(timeout);
    }
  }, [isSearchOverlayOpen]);

  useEffect(() => {
    if (userMenuOpen) {
      setUserMenuVisible(true);
    } else {
      const timeout = setTimeout(() => setUserMenuVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [userMenuOpen]);

  useEffect(() => {
    if (cartMenuOpen) {
      setCartMenuVisible(true);
    } else {
      const timeout = setTimeout(() => setCartMenuVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [cartMenuOpen]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
        setIsSearchOverlayOpen(false);
        setUserMenuOpen(false);
        setCartMenuOpen(false);
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOverlayOpen(true);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchValue.trim();
    if (!trimmed) return;
    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    setIsExpanded(false);
    setIsSearchOverlayOpen(false);
  };

  const userInitials = (user?.profile?.first_name || user?.username || 'NP')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed inset-x-0 top-0 z-[120] !bg-transparent !border-none !backdrop-blur-none">
      <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-2">
        <div
          ref={baseRowRef}
          className={`flex items-center justify-between gap-3 rounded-3xl border px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-xl transition-all duration-500 ${palette.surface} ${isScrolled ? 'shadow-2xl ring-1 ring-black/5' : 'shadow-lg/20'}`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsExpanded((prev) => !prev);
                // Закрываем другие меню при открытии главного
                if (!isExpanded) {
                  setUserMenuOpen(false);
                  setCartMenuOpen(false);
                  setIsSearchOverlayOpen(false);
                }
              }}
              aria-label="Переключить меню"
              className={`p-3 rounded-2xl transition-colors ${palette.iconBtn}`}
            >
              {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-12 w-12 sm:h-14 sm:w-14">
                <div className="absolute inset-0 rounded-2xl blur-xl bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors"></div>
                <div className="relative h-full w-full rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center p-2">
                  <img
                    src={theme === 'dark' ? '/navbar-logo.svg' : '/navbar-logo-black.png'}
                    alt="NP Academy"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="uppercase tracking-[0.35em] text-[11px] font-semibold">NP Academy</p>
                <p className="text-xs text-foreground/60">Имидж-академия</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setIsSearchOverlayOpen(true);
                setIsExpanded(false); // Закрываем главное меню при открытии поиска
              }}
              aria-label="Поиск"
              className={`p-3 rounded-2xl transition-colors ${palette.iconBtn}`}
            >
              <Search className="h-5 w-5" />
            </button>

            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <div ref={userMenuRef} className="relative">
            <button
              onClick={() => {
                setUserMenuOpen((prev) => !prev);
                setIsExpanded(false); // Закрываем главное меню при открытии профиля
              }}
              aria-label="Профиль"
              className={`p-3 rounded-2xl flex items-center justify-center min-w-[48px] transition-colors ${palette.iconBtn}`}
            >
                {isAuthenticated ? (
                  <span className="text-sm font-semibold">{userInitials}</span>
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>

              {userMenuVisible && (
                <div className={`absolute right-0 mt-3 w-72 rounded-3xl border p-4 z-[200] transition-all duration-300 ease-out ${
                  userMenuOpen
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 -translate-y-2'
                } ${palette.panel}`}>
                  {isAuthenticated ? (
                    <>
                      <Link href="/profile" className={`mb-4 block p-3 rounded-xl border transition-all duration-200 cursor-pointer group ${palette.menuItem} hover:scale-[1.02] hover:shadow-sm`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] opacity-60">Академик</p>
                            <p className="text-lg font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{user?.profile?.first_name || user?.username}</p>
                            <p className="text-sm opacity-70">{user?.email}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all duration-200" />
                        </div>
                      </Link>
                      <div className="space-y-1">
                        {userShortcuts.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all duration-200 ${palette.menuItem} hover:scale-[1.01] hover:shadow-sm`}
                          >
                            <item.icon className="h-4 w-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                            <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{item.label}</span>
                          </Link>
                        ))}
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl border border-red-200/50 bg-red-50/50 dark:border-red-800/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:border-red-300/50 dark:hover:border-red-700/50 transition-all duration-200 w-full hover:scale-[1.01]"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Выйти</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm opacity-70">
                        Авторизуйтесь, чтобы сохранять подборки и управлять заказами.
                      </p>
                      <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 py-2 font-semibold hover:bg-emerald-500/30 transition-colors"
                      >
                        <LogIn className="h-4 w-4" />
                        Войти
                      </Link>
                      <Link
                        href="/register"
                        className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 py-2 font-semibold hover:bg-white/10 transition-colors"
                      >
                        <UserPlus className="h-4 w-4" />
                        Регистрация
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div ref={cartMenuRef} className="relative">
              <button
                onClick={() => {
                  setCartMenuOpen((prev) => !prev);
                  setIsExpanded(false); // Закрываем главное меню при открытии корзины
                }}
                aria-label="Корзина"
                className={`p-3 rounded-2xl relative transition-colors ${palette.iconBtn}`}
              >
                <ShoppingBag className="h-5 w-5" />
                {state.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-[11px] font-bold bg-emerald-500 text-emerald-950 rounded-full px-1.5">
                    {state.itemCount > 99 ? '99+' : state.itemCount}
                  </span>
                )}
              </button>

              {cartMenuVisible && (
                <div className={`absolute right-0 mt-3 w-[360px] rounded-3xl border overflow-hidden z-[200] transition-all duration-300 ease-out ${
                  cartMenuOpen
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 -translate-y-2'
                } ${palette.panel}`}>
                  <MiniCart />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {menuVisible && (
        <div className="px-4 sm:px-6 lg:px-8">
          <div
            ref={menuPanelRef}
            className={`mt-3 rounded-3xl border p-4 sm:p-5 backdrop-blur-2xl z-[130] transition-all duration-300 ease-out ${
              isExpanded
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 -translate-y-2'
            } ${palette.panel}`}
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <section className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] opacity-60">Навигация</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsExpanded(false)}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors ${palette.menuItem}`}
                    >
                      <div>
                        <p>{link.label}</p>
                        {link.accent && (
                          <span className="text-[10px] uppercase tracking-widest opacity-60">{link.accent}</span>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-60" />
                    </Link>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] opacity-60">Поиск</p>
                <form onSubmit={handleSearchSubmit}>
                  <div
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${palette.pill} focus-within:ring-2 focus-within:ring-emerald-400/40`}
                  >
                    <Search className="h-4 w-4 opacity-70" />
                    <input
                      ref={panelSearchRef}
                      type="text"
                      placeholder="Поиск аромата, бренда или настроения"
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      className="bg-transparent flex-1 outline-none placeholder:text-current/60"
                    />
                    <kbd className="text-[10px] uppercase tracking-wide border border-current/20 rounded-md px-2 py-0.5 opacity-70">
                      Ctrl K
                    </kbd>
                  </div>
                </form>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSearchValue(item);
                        // Если кликаем по тегу, сразу переходим к поиску
                        router.push(`/products?search=${encodeURIComponent(item)}`);
                        setIsExpanded(false);
                        setIsSearchOverlayOpen(false);
                      }}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${palette.menuItem}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] opacity-60">Сервис</p>
                <div className={`rounded-2xl border p-4 flex items-center gap-4 ${palette.menuItem}`}>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] opacity-70">Консьерж</p>
                    <a href="tel:+74951984509" className="text-lg font-semibold hover:opacity-80 transition-opacity">
                      +7 (495) 198-45-09
                    </a>
                    <p className="text-sm opacity-70">Доставка по всей России за 48 часов</p>
                  </div>
                  <Sparkles className="h-10 w-10 opacity-40 hidden xl:block" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {userShortcuts.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsExpanded(false)}
                      className={`flex items-center justify-center gap-3 rounded-2xl border px-4 py-2.5 text-sm transition-colors ${palette.menuItem}`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {isSearchOverlayOpen && (
        <div className="fixed inset-0 z-[130] px-4 sm:px-0 flex items-start justify-center pt-32">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsSearchOverlayOpen(false)} />
          <div className="relative w-full max-w-xl rounded-3xl border p-6 backdrop-blur-2xl bg-background/95">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Поиск</p>
              <button onClick={() => setIsSearchOverlayOpen(false)} aria-label="Закрыть поиск">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 bg-background/80">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  ref={overlaySearchRef}
                  type="text"
                  placeholder="Найти аромат..."
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  className="flex-1 bg-transparent outline-none"
                />
              </div>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSearchValue(item);
                    router.push(`/products?search=${encodeURIComponent(item)}`);
                    setIsExpanded(false);
                    setIsSearchOverlayOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-full bg-secondary text-xs"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

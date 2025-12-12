'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Input, Textarea, Icon } from '@/components/ui';
import { User, Settings, ShoppingBag, LogOut, Save, Edit2, X, Heart, BadgePercent } from 'lucide-react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { SettingsForm } from '@/components/profile/SettingsForm';
import { OrderHistory } from '@/components/profile/OrderHistory';
import { FavoriteProducts } from '@/components/profile/FavoriteProducts';
import { LoyaltyOverview } from '@/components/profile/LoyaltyOverview';
import Loading from '@/components/Loading';

type TabType = 'profile' | 'settings' | 'orders' | 'favorites' | 'loyalty';

const isValidTab = (tab: string | null): tab is TabType => {
  return tab === 'profile' || tab === 'settings' || tab === 'orders' || tab === 'favorites' || tab === 'loyalty';
};

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Получаем вкладку из URL параметров или используем 'profile' по умолчанию
  const tabFromUrl = searchParams.get('tab');
  const initialTab: TabType = isValidTab(tabFromUrl) ? tabFromUrl : 'profile';
  
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [profileKey, setProfileKey] = useState(0); // Для принудительного обновления

  // Синхронизируем активную вкладку с URL параметрами при изменении URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (isValidTab(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Обработчик изменения вкладки - обновляем URL
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.push(`/profile?tab=${tab}`, { scroll: false });
  };

  // Обновляем ключ профиля при изменении пользователя для принудительной перерисовки
  useEffect(() => {
    if (user) {
      setProfileKey(prev => prev + 1);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  const tabs = [
    {
      id: 'profile' as TabType,
      label: 'Профиль',
      icon: User,
    },
    {
      id: 'settings' as TabType,
      label: 'Настройки',
      icon: Settings,
    },
    {
      id: 'orders' as TabType,
      label: 'Заказы',
      icon: ShoppingBag,
    },
    {
      id: 'favorites' as TabType,
      label: 'Избранное',
      icon: Heart,
    },
    {
      id: 'loyalty' as TabType,
      label: 'Бонусы',
      icon: BadgePercent,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-16">
        <div className="text-center">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight drop-shadow-lg">
              NP Perfumes
            </h1>
          </Link>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
            Личный кабинет
          </h2>
          <p className="text-foreground/70">
            Добро пожаловать, {user.profile?.first_name || user.username}!
          </p>
        </div>

        {/* User Info Card */}
        <Card key={`user-info-${profileKey}`} className="p-6 mb-6 relative">
          <div className="absolute top-4 right-4">
            <Button
              variant="secondary"
              onClick={logout}
              className="btn-with-icon"
              size="sm"
            >
              <Icon icon={LogOut} size={14} className="flex-shrink-0" />
              <span>Выйти</span>
            </Button>
          </div>
          <div className="flex items-center space-x-4 pr-24">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              {user.profile?.avatar ? (
                <img
                  src={user.profile?.avatar}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-primary-foreground font-serif font-bold text-xl">
                  {user.profile?.first_name?.[0] || user.username[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {user.profile?.first_name || ''} {user.profile?.last_name || ''}
                {(!user.profile?.first_name && !user.profile?.last_name) && user.username}
              </h2>
              <p className="text-foreground/70">{user.email}</p>
              <p className="text-sm text-foreground/50">
                Дата регистрации: {new Date(user.date_joined).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-border">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-foreground/70 hover:text-foreground hover:border-foreground/30'
                  }`}
                >
                  <IconComponent size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'profile' && <ProfileForm />}
        {activeTab === 'settings' && <SettingsForm />}
        {activeTab === 'orders' && <OrderHistory />}
        {activeTab === 'favorites' && <FavoriteProducts />}
        {activeTab === 'loyalty' && <LoyaltyOverview />}
      </div>
    </div>
  );
}

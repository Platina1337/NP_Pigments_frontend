'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Input, Textarea, Icon } from '@/components/ui';
import { User, Settings, ShoppingBag, LogOut, Save, Edit2, X } from 'lucide-react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { SettingsForm } from '@/components/profile/SettingsForm';
import { OrderHistory } from '@/components/profile/OrderHistory';
import Loading from '@/components/Loading';

type TabType = 'profile' | 'settings' | 'orders';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profileKey, setProfileKey] = useState(0); // Для принудительного обновления

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

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
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Личный кабинет
            </h1>
            <p className="text-foreground/70">
              Добро пожаловать, {user.first_name || user.username}!
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={logout}
            className="flex items-center space-x-2"
          >
            <Icon icon={LogOut} size={16} />
            <span>Выйти</span>
          </Button>
        </div>

        {/* User Info Card */}
        <Card key={`user-info-${profileKey}`} className="p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              {user.profile.avatar ? (
                <img
                  src={user.profile.avatar}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-primary-foreground font-serif font-bold text-xl">
                  {user.first_name?.[0] || user.username[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {user.first_name} {user.last_name}
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
                  onClick={() => setActiveTab(tab.id)}
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
      </div>
    </div>
  );
}

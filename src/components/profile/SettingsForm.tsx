'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Card, Button, Icon } from '@/components/ui';
import { Save, Settings, Bell, Mail, Moon, Sun } from 'lucide-react';

export const SettingsForm: React.FC = () => {
  const { user, updateSettings } = useAuth();
  const { theme: globalTheme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    theme: user?.settings.theme || globalTheme,
    notifications_enabled: user?.settings.notifications_enabled ?? true,
    email_newsletter: user?.settings.email_newsletter ?? false,
  });

  // Синхронизируем тему из настроек с глобальной темой
  useEffect(() => {
    if (settings.theme !== globalTheme) {
      // Если тема в настройках отличается от глобальной, применяем глобальную
      setSettings(prev => ({ ...prev, theme: globalTheme }));
    }
  }, [globalTheme, settings.theme]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Сохраняем только другие настройки (тема уже сохранена при выборе)
      const { theme, ...otherSettings } = settings;
      if (Object.keys(otherSettings).length > 0) {
        await updateSettings(otherSettings);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    // Применяем тему сразу через ThemeContext
    await setTheme(newTheme); // Это установит конкретную тему и сохранит в БД

    // Обновляем локальное состояние
    setSettings(prev => ({ ...prev, theme: newTheme }));
  };

  const handleSettingChange = (key: string, value: boolean | string) => {
    if (key === 'theme') {
      // Для темы используем специальный обработчик
      handleThemeChange(value as 'light' | 'dark');
    } else {
      // Для других настроек - просто обновляем локальное состояние
      setSettings(prev => ({ ...prev, [key]: value }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon icon={Settings} size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-foreground">
              Настройки интерфейса
            </h2>
            <p className="text-sm text-foreground/70">
              Настройте внешний вид приложения
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Тема оформления
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSettingChange('theme', 'light')}
                className={`flex items-center space-x-3 p-4 border-2 rounded-lg transition-all ${
                  settings.theme === 'light'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon icon={Sun} size={20} className={settings.theme === 'light' ? 'text-primary' : 'text-foreground/70'} />
                <div className="text-left">
                  <p className={`font-medium ${settings.theme === 'light' ? 'text-primary' : 'text-foreground'}`}>
                    Светлая
                  </p>
                  <p className="text-sm text-foreground/70">Для дневного использования</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSettingChange('theme', 'dark')}
                className={`flex items-center space-x-3 p-4 border-2 rounded-lg transition-all ${
                  settings.theme === 'dark'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon icon={Moon} size={20} className={settings.theme === 'dark' ? 'text-primary' : 'text-foreground/70'} />
                <div className="text-left">
                  <p className={`font-medium ${settings.theme === 'dark' ? 'text-primary' : 'text-foreground'}`}>
                    Темная
                  </p>
                  <p className="text-sm text-foreground/70">Для ночного использования</p>
                </div>
              </button>
            </div>
          </div>
        </form>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon icon={Bell} size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-foreground">
              Уведомления
            </h2>
            <p className="text-sm text-foreground/70">
              Управляйте настройками уведомлений
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon icon={Bell} size={20} className="text-foreground/70" />
              <div>
                <p className="font-medium text-foreground">Push-уведомления</p>
                <p className="text-sm text-foreground/70">
                  Получайте уведомления о заказах и акциях
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.notifications_enabled}
                onChange={(e) => handleSettingChange('notifications_enabled', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Email Newsletter */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon icon={Mail} size={20} className="text-foreground/70" />
              <div>
                <p className="font-medium text-foreground">Email рассылка</p>
                <p className="text-sm text-foreground/70">
                  Получайте новости и специальные предложения
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.email_newsletter}
                onChange={(e) => handleSettingChange('email_newsletter', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <Icon icon={Save} size={16} />
          <span>{isLoading ? 'Сохранение...' : 'Сохранить настройки'}</span>
        </Button>
      </div>
    </div>
  );
};

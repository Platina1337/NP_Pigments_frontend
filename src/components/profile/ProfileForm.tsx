'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Input, Textarea, Icon } from '@/components/ui';
import { Save, Edit2, X, User, Phone, Calendar, Camera } from 'lucide-react';
import { getImageUrl } from '@/lib/api';

export const ProfileForm: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // Состояние обновления данных
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [refreshKey, setRefreshKey] = useState(0); // Для принудительного обновления
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0); // Время последнего обновления
  const [formData, setFormData] = useState({
    first_name: user?.profile?.first_name || '',
    last_name: user?.profile?.last_name || '',
    phone: user?.profile?.phone || '',
    date_of_birth: user?.profile?.date_of_birth || '',
  });

  // Обновляем formData при изменении user
  React.useEffect(() => {
    console.log('ProfileForm: User changed, updating formData:', user); // Логирование
    console.log('ProfileForm: User profile data:', user?.profile); // Логирование
    setFormData({
      first_name: user?.profile?.first_name || '',
      last_name: user?.profile?.last_name || '',
      phone: user?.profile?.phone || '',
      date_of_birth: user?.profile?.date_of_birth || '',
    });
  }, [user]);

  // Дополнительный useEffect для отслеживания изменений в режиме просмотра
  React.useEffect(() => {
    if (!isEditing) {
      console.log('ProfileForm: Switched to view mode, current user data:', user?.profile); // Логирование
      // Принудительная перерисовка при переключении в режим просмотра
      setRefreshKey(prev => prev + 1);
    }
  }, [isEditing, user]);

  // useEffect для обработки обновлений профиля и принудительной перерисовки
  React.useEffect(() => {
    if (lastUpdateTime > 0) {
      console.log('ProfileForm: Profile updated at', lastUpdateTime, 'forcing re-render'); // Логирование
      // Принудительная перерисовка после обновления профиля
      setRefreshKey(prev => prev + 1);
    }
  }, [lastUpdateTime]);

  // Валидация имени (только буквы, пробелы, дефисы, апострофы)
  const validateName = (name: string): string => {
    if (!name.trim()) return '';
    if (name.length < 2) return 'Имя должно содержать минимум 2 символа';
    if (name.length > 50) return 'Имя не может быть длиннее 50 символов';
    if (!/^[а-яА-ЯёЁa-zA-Z\s\-']+$/u.test(name)) {
      return 'Имя может содержать только буквы, пробелы, дефисы и апострофы';
    }
    return '';
  };

  // Валидация телефона (российский формат)
  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return '';
    // Убираем все нецифровые символы для проверки
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return 'Номер телефона должен содержать минимум 10 цифр';
    if (cleanPhone.length > 11) return 'Номер телефона не может быть длиннее 11 цифр';
    if (!/^7|8/.test(cleanPhone)) return 'Номер должен начинаться с 7 или 8';
    return '';
  };

  // Валидация даты рождения
  const validateDateOfBirth = (date: string): string => {
    if (!date.trim()) return '';
    const selectedDate = new Date(date);
    const today = new Date();
    const minAge = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    const maxAge = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());

    if (selectedDate > today) return 'Дата рождения не может быть в будущем';
    if (selectedDate < minAge) return 'Возраст не может быть больше 120 лет';
    if (selectedDate > maxAge) return 'Возраст должен быть минимум 13 лет';

    return '';
  };

  // Форматирование телефона
  const formatPhone = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);

    if (!match) return value;

    let formatted = '';
    if (match[1]) formatted += `+${match[1]}`;
    if (match[2]) formatted += ` (${match[2]}`;
    if (match[3]) formatted += `) ${match[3]}`;
    if (match[4]) formatted += `-${match[4]}`;
    if (match[5]) formatted += `-${match[5]}`;

    return formatted;
  };

  if (!user) return null;

  console.log('ProfileForm: Rendering with user:', user); // Логирование
  console.log('ProfileForm: User profile:', user.profile); // Логирование

  // Обработчик изменения полей с валидацией
  const handleFieldChange = (field: string, value: string) => {
    let processedValue = value;
    let error = '';

    // Применяем специфическую обработку для каждого поля
    switch (field) {
      case 'first_name':
      case 'last_name':
        // Убираем лишние пробелы и капитализируем первую букву
        processedValue = value.trim().replace(/\s+/g, ' ');
        if (processedValue) {
          processedValue = processedValue.charAt(0).toUpperCase() + processedValue.slice(1).toLowerCase();
        }
        error = validateName(processedValue);
        break;
      case 'phone':
        // Форматируем телефон
        processedValue = formatPhone(value);
        error = validatePhone(processedValue);
        break;
      case 'date_of_birth':
        error = validateDateOfBirth(value);
        break;
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверяем все поля на ошибки
    const newErrors = {
      first_name: validateName(formData.first_name),
      last_name: validateName(formData.last_name),
      phone: validatePhone(formData.phone),
      date_of_birth: validateDateOfBirth(formData.date_of_birth),
    };

    setErrors(newErrors);

    // Если есть ошибки, не отправляем форму
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }

    setIsLoading(true);
    setIsUpdating(true);

    try {
      // Подготавливаем данные для отправки (убираем пустые значения)
      const submitData: any = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
      };

      // Добавляем опциональные поля только если они заполнены
      if (formData.phone.trim()) {
        submitData.phone = formData.phone.trim();
      }

      if (formData.date_of_birth.trim()) {
        submitData.date_of_birth = formData.date_of_birth.trim();
      }

      // Отправляем данные в правильном формате для UserSerializer
      console.log('ProfileForm: Calling updateProfile with:', { profile: submitData }); // Логирование
      await updateProfile({
        profile: submitData
      });
      console.log('ProfileForm: Profile updated successfully, exiting edit mode'); // Логирование

      // Небольшая задержка для обеспечения обновления контекста
      await new Promise(resolve => setTimeout(resolve, 200));

      // Обновляем время последнего обновления для принудительной перерисовки
      setLastUpdateTime(Date.now());

      // Дополнительная принудительная перерисовка через небольшой таймаут
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
        setLastUpdateTime(Date.now());
      }, 100);

      setIsEditing(false);
      setErrors({});
      // Принудительная перерисовка для обновления отображаемых данных
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    // Используем актуальные данные из user (которые обновляются через useEffect)
    setFormData({
      first_name: user?.profile?.first_name || '',
      last_name: user?.profile?.last_name || '',
      phone: user?.profile?.phone || '',
      date_of_birth: user?.profile?.date_of_birth || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <Card key={`profile-${user?.id}-${refreshKey}-${lastUpdateTime}`} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-serif font-bold text-foreground">
            Личная информация
          </h2>
          {isUpdating && (
            <span className="text-sm text-primary animate-pulse">
              Обновление...
            </span>
          )}
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="secondary"
            className="btn-with-icon"
            disabled={isUpdating}
          >
            <Icon icon={Edit2} size={16} className="flex-shrink-0" />
            <span>{isUpdating ? 'Обновление...' : 'Редактировать'}</span>
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center overflow-hidden">
              {user.profile?.avatar ? (
                <img
                  src={getImageUrl(user.profile?.avatar)}
                  alt="Avatar"
                  className="w-24 h-24 object-cover"
                />
              ) : (
                <span className="text-primary-foreground font-serif font-bold text-2xl">
                  {user.profile?.first_name?.[0] || user.username[0].toUpperCase()}
                </span>
              )}
            </div>
            {isEditing && (
              <button
                type="button"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
              >
                <Icon icon={Camera} size={16} />
              </button>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {user.profile?.first_name || ''} {user.profile?.last_name || ''}
              {(!user.profile?.first_name && !user.profile?.last_name) && user.username}
            </h3>
            <p className="text-foreground/70">{user.username}</p>
            <p className="text-sm text-foreground/50">
              {user.email}
            </p>
          </div>
        </div>

        {/* Profile Information Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500 ease-out ${
          isEditing ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'
        }`}>
          {/* Name & Surname Card */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Icon icon={User} size={16} className="text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Личные данные</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">Имя</p>
                {isEditing ? (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300 ease-out">
                    <Input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleFieldChange('first_name', e.target.value)}
                      className={`h-9 transition-all duration-300 ease-out ${errors.first_name ? 'border-red-500' : ''}`}
                      placeholder="Введите имя"
                      maxLength={50}
                    />
                    {errors.first_name && (
                      <p className="text-xs text-red-500 animate-in slide-in-from-top-1 duration-200 ease-out">{errors.first_name}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-foreground transition-all duration-300 ease-out">
                    {(() => {
                      const displayName = user?.profile?.first_name || 'Не указано';
                      return displayName;
                    })()}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">Фамилия</p>
                {isEditing ? (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300 ease-out delay-75">
                    <Input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleFieldChange('last_name', e.target.value)}
                      className={`h-9 transition-all duration-300 ease-out ${errors.last_name ? 'border-red-500' : ''}`}
                      placeholder="Введите фамилию"
                      maxLength={50}
                    />
                    {errors.last_name && (
                      <p className="text-xs text-red-500 animate-in slide-in-from-top-1 duration-200 ease-out">{errors.last_name}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-foreground transition-all duration-300 ease-out">
                    {user.profile?.last_name || 'Не указано'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact & Birthday Card */}
          <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Icon icon={Phone} size={16} className="text-emerald-600" />
              </div>
              <h3 className="font-semibold text-foreground">Контакты</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">Телефон</p>
                {isEditing ? (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300 ease-out delay-150">
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className={`h-9 transition-all duration-300 ease-out ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="+7 (999) 123-45-67"
                      maxLength={18}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 animate-in slide-in-from-top-1 duration-200 ease-out">{errors.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-foreground transition-all duration-300 ease-out">
                    {user.profile?.phone || 'Не указано'}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">Дата рождения</p>
                {isEditing ? (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300 ease-out delay-225">
                    <Input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleFieldChange('date_of_birth', e.target.value)}
                      className={`h-9 transition-all duration-300 ease-out ${errors.date_of_birth ? 'border-red-500' : ''}`}
                      max={new Date(Date.now() - 13 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      min={new Date(Date.now() - 120 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    />
                    {errors.date_of_birth && (
                      <p className="text-xs text-red-500 animate-in slide-in-from-top-1 duration-200 ease-out">{errors.date_of_birth}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-foreground transition-all duration-300 ease-out">
                    {user.profile?.date_of_birth
                      ? new Date(user.profile?.date_of_birth).toLocaleDateString('ru-RU')
                      : 'Не указано'
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center space-x-4 pt-6 border-t border-border animate-in slide-in-from-bottom-4 duration-500 ease-out">
            <Button
              type="submit"
              disabled={isLoading}
              className="btn-with-icon"
            >
              <Icon icon={Save} size={16} className="flex-shrink-0" />
              <span>{isLoading ? 'Сохранение...' : 'Сохранить'}</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isLoading}
              className="btn-with-icon"
            >
              <Icon icon={X} size={16} className="flex-shrink-0" />
              <span>Отмена</span>
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
};

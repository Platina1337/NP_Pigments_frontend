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
    first_name: user?.profile.first_name || '',
    last_name: user?.profile.last_name || '',
    phone: user?.profile.phone || '',
    date_of_birth: user?.profile.date_of_birth || '',
  });

  // Обновляем formData при изменении user
  React.useEffect(() => {
    console.log('ProfileForm: User changed, updating formData:', user); // Логирование
    console.log('ProfileForm: User profile data:', user?.profile); // Логирование
    setFormData({
      first_name: user?.profile.first_name || '',
      last_name: user?.profile.last_name || '',
      phone: user?.profile.phone || '',
      date_of_birth: user?.profile.date_of_birth || '',
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
      first_name: user?.profile.first_name || '',
      last_name: user?.profile.last_name || '',
      phone: user?.profile.phone || '',
      date_of_birth: user?.profile.date_of_birth || '',
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
            className="flex items-center space-x-2"
            disabled={isUpdating}
          >
            <Icon icon={Edit2} size={16} />
            <span>{isUpdating ? 'Обновление...' : 'Редактировать'}</span>
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center overflow-hidden">
              {user.profile.avatar ? (
                <img
                  src={getImageUrl(user.profile.avatar)}
                  alt="Avatar"
                  className="w-24 h-24 object-cover"
                />
              ) : (
                <span className="text-primary-foreground font-serif font-bold text-2xl">
                  {user.first_name?.[0] || user.username[0].toUpperCase()}
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
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-foreground/70">{user.username}</p>
            <p className="text-sm text-foreground/50">
              {user.email}
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Имя
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <div className="relative">
                  <Icon icon={User} size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                  <Input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleFieldChange('first_name', e.target.value)}
                    className={`pl-10 ${errors.first_name ? 'border-red-500' : ''}`}
                    placeholder="Введите имя"
                    maxLength={50}
                  />
                </div>
                {errors.first_name && (
                  <p className="text-sm text-red-500">{errors.first_name}</p>
                )}
              </div>
            ) : (
              <p className="text-foreground py-2 px-3 bg-muted rounded-md">
                {(() => {
                  const displayName = user?.profile?.first_name || 'Не указано';
                  console.log('ProfileForm: Displaying first_name:', displayName, 'from user:', user?.profile?.first_name);
                  return displayName;
                })()}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Фамилия
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <div className="relative">
                  <Icon icon={User} size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                  <Input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleFieldChange('last_name', e.target.value)}
                    className={`pl-10 ${errors.last_name ? 'border-red-500' : ''}`}
                    placeholder="Введите фамилию"
                    maxLength={50}
                  />
                </div>
                {errors.last_name && (
                  <p className="text-sm text-red-500">{errors.last_name}</p>
                )}
              </div>
            ) : (
              <p className="text-foreground py-2 px-3 bg-muted rounded-md">
                {user.profile.last_name || 'Не указано'}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Телефон
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <div className="relative">
                  <Icon icon={Phone} size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="+7 (999) 123-45-67"
                    maxLength={18}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-foreground py-2 px-3 bg-muted rounded-md">
                {user.profile.phone || 'Не указано'}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Дата рождения
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <div className="relative">
                  <Icon icon={Calendar} size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleFieldChange('date_of_birth', e.target.value)}
                    className={`pl-10 ${errors.date_of_birth ? 'border-red-500' : ''}`}
                    max={new Date(Date.now() - 13 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    min={new Date(Date.now() - 120 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                </div>
                {errors.date_of_birth && (
                  <p className="text-sm text-red-500">{errors.date_of_birth}</p>
                )}
              </div>
            ) : (
              <p className="text-foreground py-2 px-3 bg-muted rounded-md">
                {user.profile.date_of_birth
                  ? new Date(user.profile.date_of_birth).toLocaleDateString('ru-RU')
                  : 'Не указано'
                }
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center space-x-4 pt-6 border-t border-border">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Icon icon={Save} size={16} />
              <span>{isLoading ? 'Сохранение...' : 'Сохранить'}</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Icon icon={X} size={16} />
              <span>Отмена</span>
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
};

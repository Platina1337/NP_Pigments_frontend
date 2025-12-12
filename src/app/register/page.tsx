'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Input, Icon } from '@/components/ui';
import { UserPlus, MessageSquare, Key, Shield, Zap } from 'lucide-react';
import { RegisterData } from '@/types/api';
import { GoogleLogin } from '@/components/auth/GoogleLogin';
import { useTheme } from '@/context/ThemeContext';

type RegisterMethod = 'password' | 'email' | 'google';

export default function RegisterPage() {
  const { sendOTP, isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  });
  const [registerMethod, setRegisterMethod] = useState<RegisterMethod>('password');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/profile');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Basic validation
    if (formData.password !== formData.password2) {
      setError('Пароли не совпадают');
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      setIsSubmitting(false);
      return;
    }

    try {
        // Сохраняем данные формы для использования на странице подтверждения (fallback)
        localStorage.setItem('registerFormData', JSON.stringify(formData));
        
        // Отправляем OTP код с данными регистрации
        await sendOTP(formData.email, 'register', formData);
        
        // Перенаправляем на страницу подтверждения
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}&purpose=register`);
        
      } catch (error: any) {
        if (error.message) {
          setError(error.message);
        } else {
          setError('Не удалось отправить код подтверждения. Попробуйте еще раз.');
        }
      } finally {
        setIsSubmitting(false);
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center space-y-4">
            <div className="relative">
              <Image
                src={theme === 'dark' ? '/np-logo-light.png' : '/np-logo-dark.png'}
                alt="NP Perfumes Logo"
                width={192}
                height={192}
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-lg"
                priority
              />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight drop-shadow-2xl">
              NP Perfumes
            </h1>
          </Link>
        </div>

        {/* Register Form */}
        <Card className="p-8 border border-gray-200 dark:border-border/40 shadow-xl bg-card/50 backdrop-blur-sm hover:border-gray-300 dark:hover:border-border/60">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
              Создать аккаунт
            </h1>
            <p className="text-foreground/70">
              Выберите способ регистрации
            </p>
          </div>

          {/* Method Selection */}
          <div className="flex justify-center mb-8">
            <div className="method-switcher relative rounded-2xl p-1 flex min-w-[320px] max-w-md">
              <div
                className={`method-switcher-indicator ${
                  registerMethod === 'password' ? 'left-1 right-1/2' : 'left-1/2 right-1'
                }`}
              />

              <button
                onClick={() => setRegisterMethod('password')}
                className={`method-switcher-button relative z-10 flex-1 px-4 py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 ${
                  registerMethod === 'password' ? 'active' : ''
                }`}
                title="Полная регистрация с паролем и личными данными"
              >
                <Icon icon={Key} size={16} className="flex-shrink-0" />
                <span>Классика</span>
              </button>

              <button
                onClick={() => setRegisterMethod('google')}
                className={`method-switcher-button relative z-10 flex-1 px-4 py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 ${
                  registerMethod === 'google' ? 'active' : ''
                }`}
                title="Регистрация через Google аккаунт"
              >
                <Icon icon={MessageSquare} size={16} className="flex-shrink-0" />
                <span>Google</span>
              </button>
            </div>
          </div>

          {/* Register Content */}
          {registerMethod === 'password' && (
            <>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
                <Input
                  label="Имя пользователя *"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
            </div>

            {/* Email */}
            <div>
                <Input
                  label="Email *"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                  <Input
                    label="Имя"
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
              </div>
              <div>
                  <Input
                    label="Фамилия"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
              </div>
            </div>

            {/* Password */}
            <div>
                <Input
                  label="Пароль *"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
            </div>

            {/* Confirm Password */}
            <div>
                <Input
                  label="Подтверждение пароля *"
                  type="password"
                  name="password2"
                  value={formData.password2}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full btn-with-icon"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              ) : (
                <Icon icon={UserPlus} size={16} />
              )}
              <span>
                {isSubmitting ? 'Обработка...' : 'Зарегистрироваться'}
              </span>
            </Button>
          </form>

              {/* Links */}
              <div className="mt-6 text-center">
                <p className="text-sm text-foreground/70">
                  Уже есть аккаунт?{' '}
                  <Link
                    href="/login"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Войти
                  </Link>
                </p>
              </div>
            </>
          )}


          {registerMethod === 'google' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium mb-2">
                  <Icon icon={MessageSquare} size={14} />
                  <span>Через Google</span>
                </div>
                <div className="flex justify-center gap-3 mt-3">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border/60 bg-secondary/40 hover:bg-secondary/60 hover:border-primary/30 transition-all duration-200 cursor-default">
                    <Icon icon={Shield} size={12} />
                    Безопасно
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border/60 bg-secondary/40 hover:bg-secondary/60 hover:border-primary/30 transition-all duration-200 cursor-default">
                    <Icon icon={Zap} size={12} />
                    5 секунд
                  </span>
                </div>
              </div>

              <GoogleLogin
                purpose="register"
                onSuccess={() => router.push('/profile')}
                onError={(error) => setError(error)}
              />

              <div className="text-center">
                <button
                  onClick={() => setRegisterMethod('password')}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Или зарегистрироваться другим способом
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-foreground/70 hover:text-primary transition-colors"
          >
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}

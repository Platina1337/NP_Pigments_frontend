'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Input, Icon } from '@/components/ui';
import { UserPlus, Mail, Lock, Eye, EyeOff, User, Check, MessageSquare } from 'lucide-react';
import { RegisterData } from '@/types/api';
import { EmailOTPLogin } from '@/components/auth/EmailOTPLogin';
import { GoogleLogin } from '@/components/auth/GoogleLogin';

type RegisterMethod = 'password' | 'email' | 'google';

export default function RegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      await register(formData);
      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (error: any) {
      if (error.message) {
        setError(error.message);
      } else {
        setError('Произошла ошибка при регистрации. Попробуйте еще раз.');
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon={Check} size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
            Регистрация успешна!
          </h1>
          <p className="text-foreground/70 mb-6">
            Ваш аккаунт создан. Перенаправляем в личный кабинет...
          </p>
          <Button onClick={() => router.push('/profile')}>
            Перейти в профиль
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-serif font-bold text-xl">NP</span>
            </div>
            <span className="text-2xl font-serif font-bold text-foreground">
              NP Perfumes
            </span>
          </Link>
        </div>

        {/* Register Form */}
        <Card className="p-8">
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
            <div className="bg-muted rounded-lg p-1 flex">
              <button
                onClick={() => setRegisterMethod('password')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  registerMethod === 'password'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                С паролем
              </button>
              <button
                onClick={() => setRegisterMethod('email')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  registerMethod === 'email'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                Email код
              </button>
              <button
                onClick={() => setRegisterMethod('google')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  registerMethod === 'google'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                Google
              </button>
            </div>
          </div>

          {/* Register Content */}
          {registerMethod === 'password' && (
            <>
              <div className="text-center mb-6">
                <p className="text-foreground/70">
                  Заполните форму для регистрации
                </p>
              </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Имя пользователя *
              </label>
              <div className="relative">
                <Icon icon={User} size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Придумайте имя пользователя"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email *
              </label>
              <div className="relative">
                <Icon icon={Mail} size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="your@email.com"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Имя
                </label>
                <Input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Ваше имя"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Фамилия
                </label>
                <Input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Ваша фамилия"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Пароль *
              </label>
              <div className="relative">
                <Icon icon={Lock} size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  placeholder="Минимум 8 символов"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                  disabled={isSubmitting}
                >
                  <Icon icon={showPassword ? EyeOff : Eye} size={16} />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Подтверждение пароля *
              </label>
              <div className="relative">
                <Icon icon={Lock} size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="password2"
                  value={formData.password2}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  placeholder="Повторите пароль"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                  disabled={isSubmitting}
                >
                  <Icon icon={showConfirmPassword ? EyeOff : Eye} size={16} />
                </button>
              </div>
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
              className="w-full flex items-center justify-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              ) : (
                <Icon icon={UserPlus} size={16} />
              )}
              <span>{isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}</span>
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

          {registerMethod === 'email' && (
            <EmailOTPLogin
              purpose="register"
              onBack={() => setRegisterMethod('password')}
              onSuccess={() => router.push('/profile')}
            />
          )}

          {registerMethod === 'google' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-foreground/70">
                  Регистрация через аккаунт Google
                </p>
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

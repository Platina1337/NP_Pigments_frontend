'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Input, Icon } from '@/components/ui';
import { LogIn, Mail, Lock, Eye, EyeOff, UserPlus, MessageSquare } from 'lucide-react';
import { EmailOTPLogin } from '@/components/auth/EmailOTPLogin';
import { GoogleLogin } from '@/components/auth/GoogleLogin';

type LoginMethod = 'password' | 'email' | 'google';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = searchParams.get('redirect') || '/profile';

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

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

    try {
      await login(formData.username, formData.password);
      router.push(redirectTo);
    } catch (error) {
      setError('Неверное имя пользователя или пароль');
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

        {/* Login Form */}
        <Card className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
              Войти в аккаунт
            </h1>
            <p className="text-foreground/70">
              Выберите способ входа
            </p>
          </div>

          {/* Method Selection */}
          <div className="flex justify-center mb-8">
            <div className="bg-muted rounded-lg p-1 flex">
              <button
                onClick={() => setLoginMethod('password')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'password'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                Пароль
              </button>
              <button
                onClick={() => setLoginMethod('email')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'email'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                Email код
              </button>
              <button
                onClick={() => setLoginMethod('google')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'google'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                Google
              </button>
            </div>
          </div>

          {/* Login Content */}
          {loginMethod === 'password' && (
            <>
              <div className="text-center mb-6">
                <p className="text-foreground/70">
                  Введите свои данные для входа
                </p>
              </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Имя пользователя или Email
              </label>
              <div className="relative">
                <Icon icon={Mail} size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Введите имя пользователя или email"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Пароль
              </label>
              <div className="relative">
                <Icon icon={Lock} size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  placeholder="Введите пароль"
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

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
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
                <Icon icon={LogIn} size={16} />
              )}
              <span>{isSubmitting ? 'Вход...' : 'Войти'}</span>
            </Button>
          </form>

              {/* Links */}
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-foreground/70">
                  Нет аккаунта?{' '}
                  <Link
                    href="/register"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Зарегистрироваться
                  </Link>
                </p>
                <p className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    Забыли пароль?
                  </Link>
                </p>
              </div>
            </>
          )}

          {loginMethod === 'email' && (
            <EmailOTPLogin
              purpose="login"
              onBack={() => setLoginMethod('password')}
              onSuccess={() => router.push(redirectTo)}
            />
          )}

          {loginMethod === 'google' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-foreground/70">
                  Вход через аккаунт Google
                </p>
              </div>

              <GoogleLogin
                purpose="login"
                onSuccess={() => router.push(redirectTo)}
                onError={(error) => setError(error)}
              />

              <div className="text-center">
                <button
                  onClick={() => setLoginMethod('password')}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Или войти другим способом
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

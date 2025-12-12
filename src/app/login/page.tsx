'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Input, Icon } from '@/components/ui';
import { LogIn, Key, Mail, MessageSquare } from 'lucide-react';
import { EmailOTPLogin } from '@/components/auth/EmailOTPLogin';
import { GoogleLogin } from '@/components/auth/GoogleLogin';
import { useTheme } from '@/context/ThemeContext';

type LoginMethod = 'password' | 'email' | 'google';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [persistentError, setPersistentError] = useState<string>(''); // Ошибка, которая сохраняется при переключении методов

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
    } catch (err: any) {
      // Унифицируем структуру ошибки
      const authError = (err ?? {}) as {
        code?: string;
        use_google_login?: boolean;
        email?: string;
        message?: string;
      };

      // Проверяем, нет ли пароля (аккаунт создан через Google)
      if (authError.code === 'no_password' || authError.use_google_login) {
        const errorMessage = 'Для этого аккаунта не установлен пароль. Пожалуйста, используйте вход через Google.';
        setError(errorMessage);
        setPersistentError(errorMessage); // Сохраняем ошибку для отображения на всех вкладках
        setLoginMethod('google');
        return;
      }

      // Проверяем, требуется ли подтверждение email
      if (authError.code === 'email_not_verified' || authError.message?.includes('не активирована')) {
        const email = authError.email || (formData.username.includes('@') ? formData.username : null);
        if (email) {
          router.push(`/verify-email?email=${encodeURIComponent(email)}&purpose=login&from=login`);
          return;
        }
      }

      setError(authError.message || 'Неверное имя пользователя или пароль');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку только если это не постоянная ошибка
    if (error && !persistentError) {
      setError('');
    }
  };

  const handleMethodChange = (method: LoginMethod) => {
    setLoginMethod(method);
    // Очищаем обычную ошибку при переключении, но сохраняем постоянную
    if (error && !persistentError) {
      setError('');
    }
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

        {/* Login Form */}
        <Card className="p-8 border border-gray-200 dark:border-border/40 shadow-xl bg-card/50 backdrop-blur-sm hover:border-gray-300 dark:hover:border-border/60">
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
            <div className="method-switcher relative rounded-2xl p-1 flex min-w-[320px] max-w-md">
              <div
                className={`method-switcher-indicator ${
                  loginMethod === 'password' 
                    ? 'left-1 right-2/3' 
                    : loginMethod === 'email'
                    ? 'left-1/3 right-1/3'
                    : 'left-2/3 right-1'
                }`}
              />

              <button
                onClick={() => handleMethodChange('password')}
                className={`method-switcher-button relative z-10 flex-1 px-4 py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 ${
                  loginMethod === 'password' ? 'active' : ''
                }`}
                title="Вход с паролем"
              >
                <Icon icon={Key} size={16} className="flex-shrink-0" />
                <span>Пароль</span>
              </button>

              <button
                onClick={() => handleMethodChange('email')}
                className={`method-switcher-button relative z-10 flex-1 px-4 py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 ${
                  loginMethod === 'email' ? 'active' : ''
                }`}
                title="Вход через Email код"
              >
                <Icon icon={Mail} size={16} className="flex-shrink-0" />
                <span>Email код</span>
              </button>

              <button
                onClick={() => handleMethodChange('google')}
                className={`method-switcher-button relative z-10 flex-1 px-4 py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 ${
                  loginMethod === 'google' ? 'active' : ''
                }`}
                title="Вход через Google аккаунт"
              >
                <Icon icon={MessageSquare} size={16} className="flex-shrink-0" />
                <span>Google</span>
              </button>
            </div>
          </div>

          {/* Login Content */}
          {loginMethod === 'password' && (
            <>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
                <Input
                  label="Имя пользователя или Email"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
            </div>

            {/* Password */}
            <div>
                <Input
                  label="Пароль"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
            </div>

            {/* Error Message - отображаем постоянную ошибку или обычную */}
            {(persistentError || error) && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-400">{persistentError || error}</p>
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
            <>
              {/* Error Message - отображаем постоянную ошибку */}
              {persistentError && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-6">
                  <p className="text-sm text-red-400">{persistentError}</p>
                </div>
              )}
              <EmailOTPLogin
                purpose="login"
                onBack={() => handleMethodChange('password')}
                onSuccess={() => {
                  setPersistentError(''); // Очищаем постоянную ошибку при успешном входе
                  router.push(redirectTo);
                }}
              />
            </>
          )}

          {loginMethod === 'google' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-foreground/70">
                  Вход через аккаунт Google
                </p>
              </div>

              {/* Error Message - отображаем постоянную ошибку или обычную */}
              {(persistentError || error) && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-400">{persistentError || error}</p>
                </div>
              )}

              <GoogleLogin
                purpose="login"
                onSuccess={() => {
                  setPersistentError(''); // Очищаем постоянную ошибку при успешном входе
                  router.push(redirectTo);
                }}
                onError={(error) => {
                  setError(error);
                  setPersistentError(''); // Очищаем постоянную ошибку при новой ошибке
                }}
              />

              <div className="text-center">
                <button
                  onClick={() => handleMethodChange('password')}
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

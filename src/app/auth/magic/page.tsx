'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, Icon } from '@/components/ui';
import { CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

function MagicLinkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setTokens } = useAuth();
  
  const token = searchParams.get('token') || '';
  const purpose = (searchParams.get('purpose') as 'login' | 'register') || 'login';
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const isVerifying = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Недействительная ссылка');
      return;
    }

    // Предотвращаем повторные запросы
    if (isVerifying.current) {
      return;
    }

    isVerifying.current = true;

    const verifyToken = async () => {
      // Анимация прогресса
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 100);

      try {
        // Получаем данные регистрации из sessionStorage если это регистрация
        let registerData: { username?: string; password?: string; first_name?: string; last_name?: string } = {};
        if (purpose === 'register') {
          const storedData = localStorage.getItem('registerFormData');
          console.log('Stored data from localStorage on magic link page:', storedData);
          if (storedData) {
            registerData = JSON.parse(storedData);
            console.log('Parsed register data:', registerData);
          }
        }

        const response = await api.auth.verifyMagicLink({
          token,
          purpose,
          ...registerData,
        });

        clearInterval(progressInterval);
        setProgress(100);

        if (response.error) {
          setStatus('error');
          setError(response.error);
          return;
        }

        const data = response.data as {
          user: any;
          tokens: { access: string; refresh: string };
        };

        // Сохраняем токены и данные пользователя
        if (data.tokens) {
          localStorage.setItem('access_token', data.tokens.access);
          localStorage.setItem('refresh_token', data.tokens.refresh);
          setTokens(data.tokens.access, data.tokens.refresh);
        }

        if (data.user) {
          setUser(data.user);
        }

        // Очищаем данные регистрации
        localStorage.removeItem('registerFormData');

        setStatus('success');

        // Перенаправляем на профиль через 2.5 секунды
        setTimeout(() => {
          router.push('/profile');
        }, 2500);

      } catch (err: any) {
        clearInterval(progressInterval);
        setStatus('error');
        setError(err.message || 'Произошла ошибка при верификации');
        isVerifying.current = false;
      }
    };

    verifyToken();
    
    // Очистка при размонтировании компонента
    return () => {
      isVerifying.current = false;
    };
  }, [token, purpose]); // Убрали setUser, setTokens, router из зависимостей

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
        <Card className="p-10 text-center max-w-md w-full border-none shadow-2xl bg-card/50 backdrop-blur-sm">
          {/* Animated loader */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto relative">
              {/* Outer ring */}
              <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 2.83} 283`}
                  className="transition-all duration-300"
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-serif font-bold text-foreground mb-3">
            Волшебная авторизация ✨
          </h1>
          <p className="text-foreground/70 mb-6">
            Проверяем вашу ссылку...
          </p>
          
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-foreground/50 mt-2">{Math.round(progress)}%</p>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background overflow-hidden">
        <Card className="p-10 text-center max-w-md w-full border-none shadow-2xl bg-card/50 backdrop-blur-sm relative">
          {/* Celebration particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'][i % 5],
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            ))}
          </div>

          {/* Success icon with animation */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500 shadow-lg shadow-green-500/30">
              <CheckCircle className="w-12 h-12 text-white animate-in fade-in duration-300 delay-300" />
            </div>
            
            {/* Ripple effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-green-500/30 animate-ping" />
            </div>
          </div>

          <h1 className="text-3xl font-serif font-bold text-foreground mb-3 animate-in slide-in-from-bottom duration-500 delay-200">
            Добро пожаловать! 🎉
          </h1>
          <p className="text-foreground/70 text-lg mb-6 animate-in slide-in-from-bottom duration-500 delay-300">
            {purpose === 'register' ? 'Регистрация завершена успешно!' : 'Вы успешно вошли в аккаунт!'}
          </p>
          
          {/* Loading indicator for redirect */}
          <div className="flex items-center justify-center gap-2 text-sm text-foreground/50 animate-in fade-in duration-500 delay-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Перенаправляем в профиль...
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <Card className="p-10 text-center max-w-md w-full border-none shadow-2xl bg-card/50 backdrop-blur-sm">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-2xl font-serif font-bold text-foreground mb-3">
          Ошибка верификации
        </h1>
        <p className="text-foreground/70 mb-6">
          {error || 'Ссылка недействительна или срок её действия истёк'}
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Войти другим способом
          </Link>
          <Link
            href="/"
            className="text-sm text-foreground/50 hover:text-foreground transition-colors"
          >
            Вернуться на главную
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <MagicLinkContent />
    </Suspense>
  );
}


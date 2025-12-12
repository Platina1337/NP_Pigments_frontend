'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, OtpInput, Icon } from '@/components/ui';
import { Mail, ArrowLeft, CheckCircle, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOTP, sendOTP, register } = useAuth();
  
  const email = searchParams.get('email') || '';
  const purpose = searchParams.get('purpose') as 'login' | 'register' || 'register';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
    
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [email, router]);

  const handleComplete = async (code: string) => {
    setIsLoading(true);
    setError('');

    try {
      let registerData = undefined;
      if (purpose === 'register') {
        const storedData = localStorage.getItem('registerFormData');
        if (storedData) {
            registerData = JSON.parse(storedData);
        }
      }

      await verifyOTP(email, code, purpose, registerData);
      
      setSuccess(true);
      localStorage.removeItem('registerFormData');
      
      setTimeout(() => {
        router.push('/profile');
      }, 2500);
    } catch (error: any) {
      setError(error.message || 'Неверный код подтверждения');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await sendOTP(email, purpose);
      setResendTimer(30);
    } catch (error: any) {
      setError(error.message || 'Не удалось отправить код повторно');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
            
            {/* Sparkle effects */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-yellow-400 animate-pulse delay-150" />
            
            {/* Ripple effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-green-500/30 animate-ping" />
            </div>
          </div>

          <h1 className="text-3xl font-serif font-bold text-foreground mb-3 animate-in slide-in-from-bottom duration-500 delay-200">
            {purpose === 'register' ? 'Добро пожаловать! 🎉' : 'Вход выполнен! 🎉'}
          </h1>
          <p className="text-foreground/70 text-lg mb-6 animate-in slide-in-from-bottom duration-500 delay-300">
            {purpose === 'register' ? 'Ваш аккаунт успешно создан!' : 'Вы успешно вошли в аккаунт!'}
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
         <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold text-foreground">
              NP Perfumes
            </span>
          </Link>
        </div>

        <Card className="p-8 border-none shadow-xl bg-card/50 backdrop-blur-sm">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
               <Icon icon={Mail} size={32} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Подтвердите Email
            </h2>
            <p className="text-foreground/70">
              Мы отправили 6-значный код на <br/>
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex justify-center">
               <OtpInput 
                 length={6} 
                 onComplete={handleComplete} 
                 disabled={isLoading}
               />
            </div>

            {error && (
              <div className="text-center p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">
                <Button
                  variant="secondary"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || isLoading}
                  className="w-full"
                >
                  {resendTimer > 0 ? (
                    <span className="text-foreground/50">Отправить повторно через {resendTimer}с</span>
                  ) : (
                    <span className="flex items-center gap-2">
                        <Icon icon={RefreshCw} size={16} />
                        Отправить код повторно
                    </span>
                  )}
                </Button>
                
                <Button
                    variant="secondary"
                    onClick={() => router.back()}
                    className="text-foreground/70 hover:text-foreground bg-transparent border-0 shadow-none"
                >
                    <Icon icon={ArrowLeft} size={16} className="mr-2" />
                    Вернуться назад
                </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}


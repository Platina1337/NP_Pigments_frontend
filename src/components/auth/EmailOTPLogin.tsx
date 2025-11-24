'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Input, Icon } from '@/components/ui';
import { Mail, ArrowLeft, Key, Send, CheckCircle } from 'lucide-react';

interface EmailOTPLoginProps {
  onBack: () => void;
  purpose: 'login' | 'register';
  onSuccess?: () => void;
}

export const EmailOTPLogin: React.FC<EmailOTPLoginProps> = ({ onBack, purpose, onSuccess }) => {
  const { sendOTP, verifyOTP } = useAuth();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpCodeFromServer, setOtpCodeFromServer] = useState<string>('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await sendOTP(email, purpose);
      setStep('otp');
      // Для тестирования сохраняем код (в продакшене убрать!)
      if (response.otp_code) {
        setOtpCodeFromServer(response.otp_code);
      }
    } catch (error: any) {
      setError(error.message || 'Не удалось отправить код');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await verifyOTP(email, otpCode, purpose);
      onSuccess?.();
    } catch (error: any) {
      setError(error.message || 'Неверный код подтверждения');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await sendOTP(email, purpose);
      // Для тестирования сохраняем код (в продакшене убрать!)
      if (response.otp_code) {
        setOtpCodeFromServer(response.otp_code);
      }
    } catch (error: any) {
      setError(error.message || 'Не удалось отправить код');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="secondary"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <Icon icon={ArrowLeft} size={16} />
          <span>Назад</span>
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-foreground">
            {purpose === 'login' ? 'Вход по email' : 'Регистрация по email'}
          </h2>
        </div>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {step === 'email' ? (
        <form onSubmit={handleSendOTP} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email адрес
            </label>
            <div className="relative">
              <Icon icon={Mail} size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                placeholder="your@email.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full flex items-center justify-center space-x-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
            ) : (
              <Icon icon={Send} size={16} />
            )}
            <span>{isLoading ? 'Отправка...' : 'Отправить код'}</span>
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="text-center mb-6">
            <Icon icon={CheckCircle} size={48} className="text-green-500 mx-auto mb-4" />
            <p className="text-foreground/70">
              Код подтверждения отправлен на <strong>{email}</strong>
            </p>
            {process.env.NODE_ENV === 'development' && otpCodeFromServer && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Тестовый код:</strong> {otpCodeFromServer}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Код подтверждения
            </label>
            <div className="relative">
              <Icon icon={Key} size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
              <Input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="pl-10 text-center text-2xl font-mono tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              ) : (
                <Icon icon={CheckCircle} size={16} />
              )}
              <span>{isLoading ? 'Проверка...' : purpose === 'login' ? 'Войти' : 'Зарегистрироваться'}</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleResendOTP}
              className="w-full"
              disabled={isLoading}
            >
              Отправить код повторно
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep('email')}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Изменить email
            </button>
          </div>
        </form>
      )}
    </Card>
  );
};

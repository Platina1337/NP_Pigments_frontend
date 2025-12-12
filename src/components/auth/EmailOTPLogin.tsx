'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Input, Icon, OtpInput } from '@/components/ui';
import { Mail, ArrowLeft, Send, CheckCircle, RefreshCw } from 'lucide-react';

interface EmailOTPLoginProps {
  onBack: () => void;
  purpose: 'login' | 'register';
  onSuccess?: () => void;
}

export const EmailOTPLogin: React.FC<EmailOTPLoginProps> = ({ onBack, purpose, onSuccess }) => {
  const { sendOTP, verifyOTP } = useAuth();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
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

  const handleVerifyOTP = async (code: string) => {
    setIsLoading(true);
    setError('');

    try {
      await verifyOTP(email, code, purpose);
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
    <div className="p-0"> 
      {/* Убрал Card padding, так как он уже есть снаружи в LoginPage */}
      
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center space-x-2 px-0 hover:bg-transparent hover:text-primary"
        >
          <Icon icon={ArrowLeft} size={16} />
          <span>Назад</span>
        </Button>
        <div className="text-center flex-1 pr-16">
           {/* Spacer compensated centering */}
          <h2 className="text-xl font-serif font-bold text-foreground">
            {purpose === 'login' ? 'Вход по email' : 'Регистрация по email'}
          </h2>
        </div>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleSendOTP} className="space-y-6">
          <div>
              <Input
                label="Email адрес"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full btn-with-icon"
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
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon={Mail} size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <p className="text-foreground/70">
              Код подтверждения отправлен на <br/>
              <strong>{email}</strong>
            </p>
            {process.env.NODE_ENV === 'development' && otpCodeFromServer && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Тестовый код:</strong> {otpCodeFromServer}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center py-4">
            <OtpInput 
                length={6} 
                onComplete={handleVerifyOTP} 
                disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-center p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendOTP}
              className="w-full"
              disabled={isLoading}
            >
               <Icon icon={RefreshCw} size={16} className="mr-2" />
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
        </div>
      )}
    </div>
  );
};

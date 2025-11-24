'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, Icon } from '@/components/ui';

interface GoogleLoginProps {
  purpose: 'login' | 'register';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export const GoogleLogin: React.FC<GoogleLoginProps> = ({ purpose, onSuccess, onError }) => {
  const { googleLogin, googleRegister } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    // Загружаем Google Identity Services API
    const loadGoogleAPI = () => {
      if (window.google) {
        setIsGoogleLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleLoaded(true);
      };
      document.head.appendChild(script);
    };

    loadGoogleAPI();
  }, []);

  const handleGoogleAuth = async (response: any) => {
    setIsLoading(true);

    try {
      // Функция для декодирования base64url (используется в JWT)
      const base64UrlDecode = (str: string) => {
        // Заменяем символы base64url на обычные base64
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        // Добавляем padding если нужно
        while (base64.length % 4) {
          base64 += '=';
        }
        return atob(base64);
      };

      // Декодируем JWT payload (вторая часть токена)
      const payload = response.credential.split('.')[1];
      const decodedToken = JSON.parse(base64UrlDecode(payload));

      const email = decodedToken.email;
      const name = decodedToken.name || `${decodedToken.given_name || ''} ${decodedToken.family_name || ''}`.trim();
      const googleToken = response.credential;

      console.log('GoogleLogin: Extracted data:', { email, name, googleToken }); // Логирование

      if (purpose === 'login') {
        console.log('GoogleLogin: Calling googleLogin with:', email, name, googleToken); // Логирование
        await googleLogin(email, name, googleToken);
      } else {
        console.log('GoogleLogin: Calling googleRegister with:', email, name, googleToken); // Логирование
        await googleRegister(email, name, googleToken);
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('Google auth error:', error);
      onError?.(error.message || 'Ошибка авторизации через Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialResponse = (response: any) => {
    handleGoogleAuth(response);
  };

  const initializeGoogleSignIn = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: handleCredentialResponse,
        context: purpose === 'register' ? 'signup' : 'signin',
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          text: purpose === 'register' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        }
      );
    }
  };

  useEffect(() => {
    if (isGoogleLoaded) {
      initializeGoogleSignIn();
    }
  }, [isGoogleLoaded, purpose]);

  return (
    <div className="w-full">
      {isLoading ? (
        <Button
          type="button"
          variant="secondary"
          disabled={true}
          className="w-full flex items-center justify-center space-x-3 py-3 border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          <span className="text-gray-700 dark:text-gray-300">Подключение...</span>
        </Button>
      ) : (
        <div
          id="google-signin-button"
          className="w-full flex items-center justify-center"
        />
      )}
    </div>
  );
};

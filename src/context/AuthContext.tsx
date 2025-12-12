'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Buffer } from 'buffer';
import { User, AuthTokens, LoginResponse, RegisterData } from '@/types/api';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { profile: Partial<User['profile']> }) => Promise<void>;
  updateSettings: (data: Partial<User['settings']>) => Promise<void>;
  refreshUser: () => Promise<void>;
  // Email OTP
  sendOTP: (email: string, purpose: 'login' | 'register', registerData?: RegisterData) => Promise<{ otp_code?: string }>;
  verifyOTP: (email: string, otpCode: string, purpose: 'login' | 'register', registerData?: any) => Promise<void>;
  // Google OAuth
  googleLogin: (email: string, name?: string, googleToken?: string) => Promise<void>;
  googleRegister: (email: string, name?: string, googleToken?: string) => Promise<void>;
  // Direct state setters for magic link
  setUser: (user: User | null) => void;
  setTokens: (access: string, refresh: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const decodeJwtExp = (token: string | null): number | null => {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded =
        typeof window === 'undefined'
          ? Buffer.from(normalized, 'base64').toString('binary')
          : atob(normalized);
      const data = JSON.parse(decoded) as { exp?: number };
      return typeof data.exp === 'number' ? data.exp : null;
    } catch {
      return null;
    }
  };

  const isExpired = (token: string | null, skewSeconds = 30) => {
    const exp = decodeJwtExp(token);
    if (!exp) return false;
    const now = Date.now() / 1000;
    return exp - skewSeconds <= now;
  };

  // Check for existing tokens on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      // If no tokens, skip initialization
      if (!accessToken || !refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        if (isExpired(refreshToken)) {
          logout();
          setIsLoading(false);
          return;
        }

        if (isExpired(accessToken)) {
          const refreshResponse = await api.auth.refresh({ refresh: refreshToken });
          if (refreshResponse.data) {
            const { access, refresh } = refreshResponse.data as AuthTokens;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh || refreshToken);
            localStorage.setItem('token_timestamp', Date.now().toString());
          } else {
            logout();
            setIsLoading(false);
            return;
          }
        }

        // Try to get user profile with current token
        const response = await api.auth.profile();
        if (response.data) {
          setUser(response.data as User);
        }
      } catch (error: any) {
        // If token is invalid (401), try to refresh
        if (error.message?.includes('401')) {
          try {
            const refreshResponse = await api.auth.refresh({ refresh: refreshToken });
            if (refreshResponse.data) {
              const { access, refresh: newRefresh } = refreshResponse.data as AuthTokens;
              localStorage.setItem('access_token', access);
              localStorage.setItem('refresh_token', newRefresh);
              localStorage.setItem('token_timestamp', Date.now().toString());

              // Retry getting profile
              const profileResponse = await api.auth.profile();
              if (profileResponse.data) {
                setUser(profileResponse.data as User);
              }
            }
          } catch (refreshError) {
            // Both tokens are invalid, clear them
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        } else {
          // Other error, clear tokens to be safe
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.auth.login({ username, password });
      if (!response.data) {
        // Проверяем различные типы ошибок
        const errorData = response.rawError as any;
        
        // Ошибка: нет пароля (аккаунт создан через Google)
        if (errorData?.code === 'no_password' || errorData?.use_google_login) {
          const noPasswordError = new Error(errorData?.detail || 'Для этого аккаунта не установлен пароль. Используйте вход через Google.');
          (noPasswordError as any).code = 'no_password';
          (noPasswordError as any).use_google_login = true;
          throw noPasswordError;
        }
        
        // Ошибка: требуется подтверждение email
        if (errorData?.code === 'email_not_verified' || errorData?.requires_verification) {
          const emailVerificationError = new Error(errorData?.detail || 'Требуется подтверждение email');
          (emailVerificationError as any).code = 'email_not_verified';
          (emailVerificationError as any).email = errorData?.email || (username.includes('@') ? username : null);
          throw emailVerificationError;
        }
        
        throw new Error(response.error || 'Ошибка авторизации');
      }

      const payload = response.data as Record<string, any>;
      const accessToken: string | undefined =
        payload.tokens?.access ?? payload.access;
      const refreshToken: string | undefined =
        payload.tokens?.refresh ?? payload.refresh;

      if (!accessToken || !refreshToken) {
        throw new Error('Сервер не вернул токены авторизации');
      }

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('token_timestamp', Date.now().toString());

      let userData = payload.user as User | undefined;
      if (!userData) {
        const profileResponse = await api.auth.profile();
        if (profileResponse.data) {
          userData = profileResponse.data as User;
        }
      }

      if (!userData) {
        throw new Error('Не удалось получить данные пользователя');
      }

      if (payload.settings) {
        userData = {
          ...userData,
          settings: { ...(userData.settings || {}), ...payload.settings },
        };
      }

      setUser(userData);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ошибка авторизации');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.auth.register(data);
      if (response.data) {
        const registerData = response.data as LoginResponse;
        const { user: userData, tokens } = registerData;

        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        localStorage.setItem('token_timestamp', Date.now().toString());
        setUser(userData);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_timestamp');
    localStorage.removeItem('perfume-cart-hydrated'); // Очищаем флаг гидратации корзины
    setUser(null);
  };

  const updateProfile = async (data: { profile: Partial<User['profile']> }) => {
    try {
      const response = await api.auth.updateProfile(data);
      if (response.data) {
        const updatedUser = response.data as User;

        // Принудительно обновляем состояние пользователя
        setUser(prevUser => {
          if (!prevUser) return updatedUser;

          // Создаем новый объект пользователя с обновленным профилем
          const newUser: User = {
            ...prevUser,
            ...updatedUser,
            profile: {
              ...prevUser.profile,
              ...updatedUser.profile
            }
          };
          return newUser;
        });
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      throw error;
    }
  };

  const updateSettings = async (data: Partial<User['settings']>) => {
    try {
      const response = await api.auth.updateSettings(data);
      if (response.data) {
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            settings: { ...prevUser.settings, ...(response.data as object) }
          };
        });

        // Если в данных была тема, применяем её глобально
        if (data.theme) {
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(data.theme);
          console.log('Theme applied globally from settings:', data.theme);
        }
      } else {
        throw new Error(response.error || 'Failed to update settings');
      }
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.auth.profile();
      if (response.data) {
        setUser(response.data as User);
      }
    } catch (error) {
      // If profile fetch fails, user might be logged out
      logout();
    }
  };

  // Email OTP methods
  const sendOTP = async (email: string, purpose: 'login' | 'register', registerData?: RegisterData) => {
    try {
      const data: any = { email, purpose };
      // Добавляем данные регистрации если они переданы
      if (purpose === 'register' && registerData) {
        data.username = registerData.username;
        data.password = registerData.password;
        data.first_name = registerData.first_name;
        data.last_name = registerData.last_name;
      }
      const response = await api.auth.sendOTP(data);
      if (response.error) {
        throw new Error(response.error);
      }
      if (response.data) {
        return response.data as { otp_code?: string };
      }
      throw new Error('Не удалось отправить код подтверждения');
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (email: string, otpCode: string, purpose: 'login' | 'register', registerData?: any) => {
    try {
      const requestData: any = { email, otp_code: otpCode, purpose };

      // Добавляем данные регистрации если они переданы
      if (purpose === 'register' && registerData) {
        requestData.username = registerData.username;
        requestData.password = registerData.password;
        requestData.first_name = registerData.first_name;
        requestData.last_name = registerData.last_name;
      }

      const response = await api.auth.verifyOTP(requestData);
      if (response.data) {
        const loginData = response.data as LoginResponse;
        const { user: userData, tokens } = loginData;

        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        localStorage.setItem('token_timestamp', Date.now().toString());
        setUser(userData);
      } else {
        throw new Error(response.error || 'OTP verification failed');
      }
    } catch (error) {
      throw error;
    }
  };

  // Google OAuth methods
  const googleLogin = async (email: string, name?: string, googleToken?: string) => {
    try {
      const requestData = { google_token: googleToken, email, name };
      const response = await api.auth.googleLogin(requestData);
      if (response.data) {
        const loginData = response.data as LoginResponse;
        const { user: userData, tokens } = loginData;

        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        localStorage.setItem('token_timestamp', Date.now().toString());
        setUser(userData);
      } else {
        throw new Error(response.error || 'Google login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const googleRegister = async (email: string, name?: string, googleToken?: string) => {
    try {
      const response = await api.auth.googleRegister({ google_token: googleToken, email, name });
      if (response.data) {
        const loginData = response.data as LoginResponse;
        const { user: userData, tokens } = loginData;

        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        localStorage.setItem('token_timestamp', Date.now().toString());
        setUser(userData);
      } else {
        throw new Error(response.error || 'Google register failed');
      }
    } catch (error) {
      throw error;
    }
  };

  // Direct setters for magic link authentication
  const setTokens = (access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('token_timestamp', Date.now().toString());
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    updateSettings,
    refreshUser,
    sendOTP,
    verifyOTP,
    googleLogin,
    googleRegister,
    setUser,
    setTokens,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

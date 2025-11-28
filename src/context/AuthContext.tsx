'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  sendOTP: (email: string, purpose: 'login' | 'register') => Promise<{ otp_code?: string }>;
  verifyOTP: (email: string, otpCode: string, purpose: 'login' | 'register') => Promise<void>;
  // Google OAuth
  googleLogin: (email: string, name?: string, googleToken?: string) => Promise<void>;
  googleRegister: (email: string, name?: string, googleToken?: string) => Promise<void>;
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

      // Check if tokens are likely expired (simple check - if stored more than 1 hour ago)
      const tokenTimestamp = localStorage.getItem('token_timestamp');
      if (tokenTimestamp) {
        const tokenAge = Date.now() - parseInt(tokenTimestamp);
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        if (tokenAge > oneHour) {
          // Tokens are old, clear them
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('token_timestamp');
          setIsLoading(false);
          return;
        }
      }

      try {
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
      console.log('Update profile called with:', data); // Логирование
      const response = await api.auth.updateProfile(data);
      console.log('Update profile response:', response); // Логирование
      if (response.data) {
        const updatedUser = response.data as User;
        console.log('AuthContext: Setting updated user:', updatedUser); // Логирование
        console.log('AuthContext: Updated user profile:', updatedUser.profile); // Логирование

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

          console.log('AuthContext: Merged user state:', newUser); // Логирование
          return newUser;
        });

        console.log('AuthContext: User state updated successfully'); // Логирование
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error); // Логирование
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
  const sendOTP = async (email: string, purpose: 'login' | 'register') => {
    try {
      const response = await api.auth.sendOTP({ email, purpose });
      if (response.data) {
        return response.data as { otp_code?: string };
      }
      throw new Error('Failed to send OTP');
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (email: string, otpCode: string, purpose: 'login' | 'register') => {
    try {
      const response = await api.auth.verifyOTP({ email, otp_code: otpCode, purpose });
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
      console.log('Google login called with:', { email, name, googleToken }); // Логирование
      const requestData = { google_token: googleToken, email, name };
      console.log('Sending request data:', requestData); // Логирование
      const response = await api.auth.googleLogin(requestData);
      console.log('Response:', response); // Логирование
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

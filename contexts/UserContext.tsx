'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { cachedFetch, cache } from '@/lib/cache';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Добавляем таймаут для запроса
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд таймаут
      
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Включаем cookies
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Отключаем кеширование
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        setError('Ошибка авторизации');
        setUser(null);
        return;
      }

      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Ошибка загрузки пользователя');
        setUser(null);
        return;
      }

      const realUser = data.user;

      // Разрешаем временное переключение роли только супер-администратору
      const tempUserRaw = typeof window !== 'undefined' ? sessionStorage.getItem('tempUser') : null;
      if (tempUserRaw && realUser?.role === 'SUPER_ADMIN') {
        try {
          const parsedUser = JSON.parse(tempUserRaw);
          setUser(parsedUser);
        } catch (e) {
          sessionStorage.removeItem('tempUser');
          setUser(realUser);
        }
      } else {
        if (tempUserRaw) sessionStorage.removeItem('tempUser');
        setUser(realUser);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setError('Превышено время ожидания. Проверьте подключение к интернету.');
      } else {
        setError('Ошибка загрузки пользователя');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    cache.clear(); // Clear all cached data
  };

  useEffect(() => {
    // Принудительно очищаем кеш браузера при загрузке
    if (typeof window !== 'undefined') {
      // Очищаем sessionStorage
      sessionStorage.removeItem('tempUser');
      
      // Очищаем localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('auth-token');
      
      // Очищаем кеш для /api/auth/me
      const cacheKey = `/api/auth/me`;
      if ((window as any).__cache) {
        delete (window as any).__cache[cacheKey];
      }

      // Добавляем слушатель для обновления при изменении авторизации
      const handleAuthChange = () => {
        fetchUser();
      };

      window.addEventListener('auth-change', handleAuthChange);
      
      return () => {
        window.removeEventListener('auth-change', handleAuthChange);
      };
    }
    
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, error, refetch: fetchUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

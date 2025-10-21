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
      
      // Получаем sessionId из localStorage
      const sessionId = typeof window !== 'undefined' ? localStorage.getItem('session-id') : null;
      
      if (!sessionId) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Таймаут для запроса
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд таймаут
      
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Отправляем cookies
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}` // Отправляем sessionId в заголовке
        },
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        setError('Ошибка авторизации');
        setUser(null);
        // Очищаем sessionId если он невалидный
        if (typeof window !== 'undefined') {
          localStorage.removeItem('session-id');
        }
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
        } catch {
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('session-id');
    }
    cache.clear();
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Добавляем слушатель для обновления при изменении авторизации
      const handleAuthChange = () => {
        fetchUser();
      };

      window.addEventListener('auth-change', handleAuthChange);
      
      fetchUser();
      
      return () => {
        window.removeEventListener('auth-change', handleAuthChange);
      };
    }
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

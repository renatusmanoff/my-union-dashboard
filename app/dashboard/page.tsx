'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@prisma/client';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardPage() {
  const { user, isLoading, error } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Пользователь не авторизован, перенаправляем на страницу входа
        router.push('/login');
        return;
      }

      if (user.role) {
        const roleRoutes: Partial<Record<UserRole, string>> = {
          'SUPER_ADMIN': '/dashboard/super-admin',
          'FEDERAL_CHAIRMAN': '/dashboard/federal-admin',
          'REGIONAL_CHAIRMAN': '/dashboard/regional-admin',
          'LOCAL_CHAIRMAN': '/dashboard/local-admin',
          'PRIMARY_CHAIRMAN': '/dashboard/primary-admin',
          'PRIMARY_MEMBER': '/dashboard/member'
        };

        const targetRoute = roleRoutes[user.role];
        if (targetRoute) {
          router.push(targetRoute);
        }
      }
    }
  }, [user, isLoading, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-400">Загрузка дашборда...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-400">Перенаправление...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
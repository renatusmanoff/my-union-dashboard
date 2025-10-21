'use client';

import { useUser } from '@/contexts/UserContext';
import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';

export default function FederalAdminDashboard() {
  const { user, isLoading } = useUser();
  const [statistics] = useState({
    members: 0,
    applications: 0,
    tasks: 0,
    documents: 0
  });

  useEffect(() => {
    // Можно загрузить статистику по организации
    // Пока просто показываем базовый дашборд
  }, [user]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-400">Загрузка дашборда...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Дашборд администратора</h1>
            <p className="text-gray-400">Организация: {user?.organizationName || 'Не указана'}</p>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Членов организации</p>
                  <p className="text-3xl font-bold text-white mt-1">{statistics.members}</p>
                </div>
                <div className="text-4xl text-blue-500">👥</div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Заявок на членство</p>
                  <p className="text-3xl font-bold text-white mt-1">{statistics.applications}</p>
                </div>
                <div className="text-4xl text-green-500">📋</div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Активные задачи</p>
                  <p className="text-3xl font-bold text-white mt-1">{statistics.tasks}</p>
                </div>
                <div className="text-4xl text-yellow-500">✅</div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Документы</p>
                  <p className="text-3xl font-bold text-white mt-1">{statistics.documents}</p>
                </div>
                <div className="text-4xl text-purple-500">📄</div>
              </div>
            </div>
          </div>

          {/* Быстрые действия */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Быстрые действия</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a href="/dashboard/membership-validation" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition">
                ✓ Валидация членства
              </a>
              <a href="/dashboard/documents" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition">
                📄 Документы
              </a>
              <a href="/dashboard/tasks" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition">
                ✅ Задачи
              </a>
              <a href="/dashboard/news" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition">
                📰 Новости
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

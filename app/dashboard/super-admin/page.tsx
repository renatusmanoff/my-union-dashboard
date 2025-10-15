'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalAdmins: 0,
    totalMembers: 0,
    pendingValidations: 0
  });

  const [recentActivity, setRecentActivity] = useState<{ id: number; type: string; message: string; time: string }[]>([]);

  useEffect(() => {
    // Загружаем статистику
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      // Здесь будут реальные API запросы
      setStats({
        totalOrganizations: 14,
        totalAdmins: 3,
        totalMembers: 28500000,
        pendingValidations: 156
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Здесь будут реальные API запросы
      setRecentActivity([
        { id: 1, type: 'admin_created', message: 'Создан новый администратор для организации "ФНПР"', time: '2 часа назад' },
        { id: 2, type: 'member_validated', message: 'Валидировано членство для 25 новых членов профсоюза образования', time: '4 часа назад' },
        { id: 3, type: 'organization_created', message: 'Создана новая организация "Профсоюз работников здравоохранения РФ"', time: '1 день назад' },
        { id: 4, type: 'member_validated', message: 'Валидировано членство для 150 новых членов ПАО "Газпром"', time: '2 дня назад' },
        { id: 5, type: 'admin_created', message: 'Создан новый администратор для Московской федерации профсоюзов', time: '3 дня назад' }
      ]);
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  return (
    <DashboardLayout userRole="SUPER_ADMIN">
      <div className="p-6" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Панель управления системой</h1>
          <p className="text-gray-400">Управление организациями, администраторами и валидация членства</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Организации</p>
                <p className="text-2xl font-bold">{stats.totalOrganizations}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Администраторы</p>
                <p className="text-2xl font-bold">{stats.totalAdmins}</p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Члены профсоюза</p>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Ожидают валидации</p>
                <p className="text-2xl font-bold text-orange-500">{stats.pendingValidations}</p>
              </div>
              <div className="p-3 bg-orange-500 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Быстрые действия</h3>
            <div className="space-y-3">
              <button 
                className="w-full text-left p-3 rounded-lg hover:bg-gray-700 transition-colors"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Создать администратора</span>
                </div>
              </button>
              <button 
                className="w-full text-left p-3 rounded-lg hover:bg-gray-700 transition-colors"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Создать организацию</span>
                </div>
              </button>
              <button 
                className="w-full text-left p-3 rounded-lg hover:bg-gray-700 transition-colors"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Валидировать членство</span>
                </div>
              </button>
            </div>
          </div>

          <div className="card p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Последняя активность</h3>
            <div className="space-y-3">
              {recentActivity.map((activity: { id: number; type: string; message: string; time: string }) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Системная информация */}
        <div className="card p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Системная информация</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400">Версия системы</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Последнее обновление</p>
              <p className="font-medium">Сегодня</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Статус системы</p>
              <p className="font-medium text-green-500">Работает</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

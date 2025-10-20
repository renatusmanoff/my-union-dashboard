'use client';

import { useUser } from '@/contexts/UserContext';
import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';

interface MembershipStatus {
  status: 'DRAFT' | 'PENDING_VALIDATION' | 'APPROVED' | 'REJECTED';
  documentsVerified: boolean;
  feesStatus: 'PAID' | 'NOT_PAID';
}

export default function MemberDashboard() {
  const { user, isLoading } = useUser();
  const [memberStatus, setMemberStatus] = useState<MembershipStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    const fetchMembershipStatus = async () => {
      try {
        setStatusLoading(true);
        const response = await fetch('/api/membership/application');
        if (response.ok) {
          const data = await response.json();
          const application = data.applications?.[0];
          if (application) {
            setMemberStatus({
              status: application.status,
              documentsVerified: application.status === 'APPROVED',
              feesStatus: application.feesStatus || 'NOT_PAID'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching membership status:', error);
      } finally {
        setStatusLoading(false);
      }
    };

    if (!isLoading && user) {
      fetchMembershipStatus();
    }
  }, [user, isLoading]);

  const getStatusDisplay = () => {
    if (!memberStatus) return { label: 'Ожидание данных', color: 'bg-gray-500' };
    
    switch (memberStatus.status) {
      case 'APPROVED':
        return { label: '✓ Активный член', color: 'bg-green-500' };
      case 'PENDING_VALIDATION':
        return { label: '⏳ На рассмотрении', color: 'bg-yellow-500' };
      case 'REJECTED':
        return { label: '✗ Отклонено', color: 'bg-red-500' };
      case 'DRAFT':
        return { label: '📝 Заполнение формы', color: 'bg-blue-500' };
      default:
        return { label: 'Неизвестный статус', color: 'bg-gray-500' };
    }
  };

  const statusDisplay = getStatusDisplay();

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
            <h1 className="text-3xl font-bold text-white mb-2">Добро пожаловать, {user?.firstName}!</h1>
            <p className="text-gray-400">Организация: {user?.organization?.name || 'Не указана'}</p>
          </div>

          {/* Карточка профиля */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <h2 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
                  <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
                  <p className="text-gray-400 text-sm mt-1">{user?.phone}</p>
                </div>
              </div>
            </div>

            {/* Информация о членстве */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Статус членства</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Статус:</span>
                    <span className={`${statusDisplay.color} text-white px-3 py-1 rounded-full text-sm`}>{statusDisplay.label}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Членские взносы:</span>
                    <span className={`${memberStatus?.feesStatus === 'PAID' ? 'text-green-400' : 'text-red-400'}`}>
                      {memberStatus?.feesStatus === 'PAID' ? '✓ Оплачены' : '✗ Не оплачены'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Контактная информация:</span>
                    <span className="text-white">Подтверждена</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Быстрые действия */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Быстрые действия</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a href="/dashboard/profile" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition">
                👤 Мой профиль
              </a>
              <a href="/dashboard/member-documents" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition">
                📄 Мои документы
              </a>
              <a href="/dashboard/benefits" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition">
                🎁 Льготы и скидки
              </a>
              <a href="/dashboard/news" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition">
                📰 Новости
              </a>
            </div>
          </div>

          {/* Информационные блоки */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-3">📋 Доступные документы</h3>
              <p className="text-gray-400 text-sm mb-4">Управляйте своими документами членства и другими важными файлами.</p>
              <a href="/dashboard/member-documents" className="text-blue-400 hover:text-blue-300">
                Перейти к документам →
              </a>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-3">🎁 Специальные предложения</h3>
              <p className="text-gray-400 text-sm mb-4">Воспользуйтесь скидками от партнеров профсоюза.</p>
              <a href="/dashboard/benefits" className="text-blue-400 hover:text-blue-300">
                Посмотреть льготы →
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

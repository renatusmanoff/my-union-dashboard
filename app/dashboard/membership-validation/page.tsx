'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import type { MembershipValidation } from '@/types';

export default function MembershipValidationPage() {
  const [validations, setValidations] = useState<MembershipValidation[]>([]);
  // const [isLoading, setIsLoading] = useState(true); // TODO: Использовать для загрузки
  const [selectedValidation, setSelectedValidation] = useState<MembershipValidation | null>(null);
  const [validationNotes, setValidationNotes] = useState('');

  useEffect(() => {
    fetchValidations();
  }, []);

  const fetchValidations = async () => {
    try {
      // setIsLoading(true);
      const response = await fetch('/api/membership/validation');
      const data = await response.json();

      if (response.ok) {
        setValidations(data.validations);
      } else {
        console.error('Error fetching validations:', data.error);
      }
    } catch (error) {
      console.error('Error fetching validations:', error);
    } finally {
      // setIsLoading(false);
    }
  };

  const handleValidation = async (validationId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch('/api/membership/validation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          validationId,
          status,
          notes: validationNotes
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setValidations(validations.map(v => 
          v.id === validationId ? data.validation : v
        ));
        setSelectedValidation(null);
        setValidationNotes('');
        if (data.emailSent) {
          alert(`Членство ${status === 'APPROVED' ? 'одобрено' : 'отклонено'} и уведомление отправлено!`);
        } else {
          alert(`Членство ${status === 'APPROVED' ? 'одобрено' : 'отклонено'}, но не удалось отправить уведомление`);
        }
      } else {
        alert(data.error || 'Ошибка при валидации');
      }
    } catch (error) {
      console.error('Error validating membership:', error);
      alert('Ошибка при валидации');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Ожидает';
      case 'APPROVED':
        return 'Одобрено';
      case 'REJECTED':
        return 'Отклонено';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <DashboardLayout userRole="SUPER_ADMIN">
      <div className="p-6" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Валидация членства</h1>
          <p className="text-gray-400">Проверка и подтверждение членства в профсоюзе</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Ожидают валидации</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {validations.filter(v => v.status === 'PENDING').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-500 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Одобрено</p>
                <p className="text-2xl font-bold text-green-500">
                  {validations.filter(v => v.status === 'APPROVED').length}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Отклонено</p>
                <p className="text-2xl font-bold text-red-500">
                  {validations.filter(v => v.status === 'REJECTED').length}
                </p>
              </div>
              <div className="p-3 bg-red-500 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Список валидаций */}
        <div className="card rounded-lg overflow-hidden">
          <div className="p-6 border-b" style={{ borderColor: 'var(--card-border)' }}>
            <h3 className="text-lg font-semibold">Заявки на членство</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Пользователь</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Организация</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Дата заявки</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
                {validations.map((validation) => (
                  <tr key={validation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium">Пользователь #{validation.userId}</div>
                        <div className="text-sm text-gray-400">{validation.notes}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      Организация #{validation.organizationId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(validation.requestedAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(validation.status)}`}>
                        {getStatusText(validation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {validation.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedValidation(validation)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                          >
                            Рассмотреть
                          </button>
                        </div>
                      )}
                      {validation.status !== 'PENDING' && (
                        <span className="text-xs text-gray-400">
                          {validation.validatedAt && new Date(validation.validatedAt).toLocaleDateString('ru-RU')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Модальное окно для валидации */}
        {selectedValidation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="card p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Валидация членства</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Пользователь:</p>
                <p className="font-medium">Пользователь #{selectedValidation.userId}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Организация:</p>
                <p className="font-medium">Организация #{selectedValidation.organizationId}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Примечания:</p>
                <textarea
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  placeholder="Добавьте примечания..."
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleValidation(selectedValidation.id, 'APPROVED')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Одобрить
                </button>
                <button
                  onClick={() => handleValidation(selectedValidation.id, 'REJECTED')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Отклонить
                </button>
                <button
                  onClick={() => {
                    setSelectedValidation(null);
                    setValidationNotes('');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

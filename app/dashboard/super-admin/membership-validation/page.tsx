'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUser } from '@/contexts/UserContext';
import { ApplicationStatus } from '@prisma/client';

interface MembershipApplication {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  address: string;
  status: ApplicationStatus;
  createdAt: string;
  organization: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    email: string;
  };
  documents: Array<{
    id: string;
    type: string;
    fileName: string;
    signedAt: string | null;
  }>;
}

export default function MembershipValidationPage() {
  const { user } = useUser();
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<MembershipApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/membership/validation');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, status: ApplicationStatus, rejectionReason?: string) => {
    try {
      const response = await fetch(`/api/membership/validation/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, rejectionReason }),
      });

      if (response.ok) {
        await fetchApplications();
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      `${app.firstName} ${app.lastName} ${app.middleName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.includes(searchTerm) ||
      app.organization.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-900/20 text-yellow-400';
      case 'APPROVED':
        return 'bg-green-900/20 text-green-400';
      case 'REJECTED':
        return 'bg-red-900/20 text-red-400';
      default:
        return 'bg-gray-900/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING':
        return 'На рассмотрении';
      case 'APPROVED':
        return 'Одобрено';
      case 'REJECTED':
        return 'Отклонено';
      default:
        return status;
    }
  };

  const getDocumentTypeText = (type: string) => {
    switch (type) {
      case 'MEMBERSHIP_APPLICATION':
        return 'Заявление на вступление в профсоюз';
      case 'CONSENT_PERSONAL_DATA':
        return 'Согласие на обработку персональных данных';
      case 'PAYMENT_DEDUCTION':
        return 'Заявление на удержание взносов';
      default:
        return type;
    }
  };

  if (!user || !['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN'].includes(user.role)) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Доступ запрещен</h1>
            <p className="text-gray-400">Только председатели организаций могут получить доступ к валидации</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-400">Загрузка заявлений...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Валидация членов профсоюза</h1>
              <p className="text-gray-400 mt-2">Проверка и одобрение заявлений на вступление в профсоюз</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium">Всего заявлений: {applications.length}</span>
              </div>
              <div className="bg-yellow-600/20 text-yellow-400 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium">Ожидают: {applications.filter(app => app.status === 'PENDING').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">На рассмотрении</p>
                <p className="text-2xl font-semibold text-white">
                  {applications.filter(app => app.status === 'PENDING').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-900/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Одобрено</p>
                <p className="text-2xl font-semibold text-white">
                  {applications.filter(app => app.status === 'APPROVED').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-900/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Отклонено</p>
                <p className="text-2xl font-semibold text-white">
                  {applications.filter(app => app.status === 'REJECTED').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-900/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Поиск
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск по имени, телефону или организации..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Статус
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ApplicationStatus | 'ALL')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Все статусы</option>
                <option value="PENDING">На рассмотрении</option>
                <option value="APPROVED">Одобрено</option>
                <option value="REJECTED">Отклонено</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">
              Заявления на вступление в профсоюз
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700 border-b border-gray-600">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Заявитель
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Организация
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Дата подачи
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-base font-medium text-white">
                          {application.firstName} {application.lastName} {application.middleName}
                        </div>
                        <div className="text-sm text-gray-400">{application.phone}</div>
                        {application.user?.email && (
                          <div className="text-sm text-gray-400">{application.user.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base text-white">{application.organization.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                        {getStatusLabel(application.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-white">
                      {new Date(application.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Открыть карточку"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Application Details Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Карточка заявителя
                </h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Личные данные</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">ФИО</label>
                      <p className="text-white">
                        {selectedApplication.lastName} {selectedApplication.firstName} {selectedApplication.middleName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Телефон</label>
                      <p className="text-white">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <p className="text-white">{selectedApplication.user?.email || 'Не указан'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Адрес</label>
                      <p className="text-white">{(() => {
                        try {
                          const address = JSON.parse(selectedApplication.address);
                          return `${address.city}, ${address.street}`;
                        } catch {
                          return selectedApplication.address;
                        }
                      })()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Организация</label>
                      <p className="text-white">{selectedApplication.organization.name}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Документы заявления</h4>
                  <div className="space-y-3">
                    {selectedApplication.documents.map((doc) => (
                      <div key={doc.id} className="flex items-start justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${doc.signedAt ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span className="text-white leading-relaxed">{getDocumentTypeText(doc.type)}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-3 ${doc.signedAt ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
                          {doc.signedAt ? 'Подписан' : 'Не подписан'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedApplication.status === 'PENDING' && (
                <div className="mt-8 flex space-x-4">
                  <button
                    onClick={() => handleStatusChange(selectedApplication.id, 'APPROVED')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Одобрить
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Укажите причину отклонения:');
                      if (reason) {
                        handleStatusChange(selectedApplication.id, 'REJECTED', reason);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Отклонить
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
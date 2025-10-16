'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { MembershipApplication } from '@/types';

// Расширенный интерфейс для заявлений с документами
interface ExtendedMembershipApplication extends Omit<MembershipApplication, 'applicationDate'> {
  documents?: Array<{
    id: string;
    type: string;
    fileName: string;
    filePath: string;
    status: string;
    signedAt?: string;
    sentToUnion: boolean;
    sentAt?: string;
  }>;
  organization?: {
    id: string;
    name: string;
    type: string;
    address: string;
  };
  signLater?: boolean;
  applicationDate: string;
}
import { 
  EyeIcon, 
  DocumentArrowDownIcon, 
  CheckIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { cachedFetch } from '@/lib/cache';

export default function MembershipValidationPage() {
  const [applications, setApplications] = useState<ExtendedMembershipApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ExtendedMembershipApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }

      const response = await cachedFetch(`/api/membership/application?${params}`, undefined, 30 * 1000); // 30 seconds cache
      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications);
      } else {
        console.error('Error fetching applications:', data.error);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationStatus = async (applicationId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/membership/application/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          rejectionReason: status === 'REJECTED' ? rejectionReason : undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setSelectedApplication(null);
        setRejectionReason('');
        fetchApplications();
      } else {
        alert(data.error || 'Ошибка при обработке заявления');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Ошибка при обработке заявления');
    }
  };

  const handleGeneratePDF = async (applicationId: string) => {
    try {
      setGeneratingPDF(applicationId);
      const response = await fetch(`/api/membership/application/${applicationId}/pdf`);
      const data = await response.json();

      if (response.ok) {
        // Открываем PDF в новой вкладке
        window.open(data.pdfUrl, '_blank');
        alert('PDF заявления успешно сгенерирован');
      } else {
        alert(data.error || 'Ошибка при генерации PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Ошибка при генерации PDF');
    } finally {
      setGeneratingPDF(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-500 text-white';
      case 'APPROVED':
        return 'bg-green-500 text-white';
      case 'REJECTED':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
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

  return (
    <DashboardLayout userRole="SUPER_ADMIN">
      <div className="p-6" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Валидация заявлений</h1>
              <p className="text-gray-400">Рассмотрение заявлений на вступление в профсоюз</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL')}
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
              >
                <option value="ALL">Все заявления</option>
                <option value="PENDING">На рассмотрении</option>
                <option value="APPROVED">Одобренные</option>
                <option value="REJECTED">Отклоненные</option>
              </select>
            </div>
          </div>

          {/* Applications List */}
          <div className="card rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-400">Загрузка заявлений...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Заявитель
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Организация
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Дата подачи
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Документы
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
                    {applications?.map((application) => (
                      <tr key={application.id}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium">
                              {application.lastName} {application.firstName} {application.middleName}
                            </div>
                            <div className="text-sm text-gray-400">{application.email}</div>
                            <div className="text-sm text-gray-400">{application.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {application.organizationName}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(application.applicationDate).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {application.documents && application.documents.length > 0 ? (
                              application.documents.map((doc: { id: string; type: string; status: string }, index: number) => (
                                <span
                                  key={doc.id || index}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    doc.status === 'NOT_SIGNED' ? 'bg-orange-100 text-orange-600' :
                                    doc.status === 'SIGNED' ? 'bg-green-100 text-green-600' :
                                    'bg-red-100 text-red-600'
                                  }`}
                                  title={`${doc.type === 'MEMBERSHIP_APPLICATION' ? 'Заявление' :
                                          doc.type === 'CONSENT_PERSONAL_DATA' ? 'Согласие' :
                                          doc.type === 'PAYMENT_DEDUCTION' ? 'Удержание' : doc.type} - ${
                                          doc.status === 'NOT_SIGNED' ? 'Не подписано' :
                                          doc.status === 'SIGNED' ? 'Подписано' : 'Отклонено'
                                        }`}
                                >
                                  {doc.type === 'MEMBERSHIP_APPLICATION' ? 'З' :
                                   doc.type === 'CONSENT_PERSONAL_DATA' ? 'С' :
                                   doc.type === 'PAYMENT_DEDUCTION' ? 'У' : 'Д'}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">Нет документов</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                            {getStatusLabel(application.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedApplication(application)}
                              className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Просмотр"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleGeneratePDF(application.id)}
                              disabled={generatingPDF === application.id}
                              className="p-2 text-purple-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title="PDF"
                            >
                              <DocumentArrowDownIcon className="w-5 h-5" />
                            </button>
                            {application.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApplicationStatus(application.id, 'APPROVED')}
                                  className="p-2 text-green-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                  title="Одобрить"
                                >
                                  <CheckIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => setSelectedApplication(application)}
                                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Отклонить"
                                >
                                  <XMarkIcon className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Application Details Modal */}
          {selectedApplication && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Заявление на вступление в профсоюз
                  </h3>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Личные данные */}
                  <div>
                    <h4 className="font-medium mb-3">Личные данные</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">ФИО:</span> {selectedApplication.lastName} {selectedApplication.firstName} {selectedApplication.middleName}</p>
                      <p><span className="font-medium">Дата рождения:</span> {new Date(selectedApplication.dateOfBirth).toLocaleDateString('ru-RU')}</p>
                      <p><span className="font-medium">Пол:</span> {selectedApplication.gender === 'MALE' ? 'Мужской' : 'Женский'}</p>
                      <p><span className="font-medium">Email:</span> {selectedApplication.email}</p>
                      <p><span className="font-medium">Телефон:</span> {selectedApplication.phone}</p>
                      {selectedApplication.additionalPhone && (
                        <p><span className="font-medium">Доп. телефон:</span> {selectedApplication.additionalPhone}</p>
                      )}
                    </div>
                  </div>

                  {/* Адрес */}
                  <div>
                    <h4 className="font-medium mb-3">Адрес проживания</h4>
                    <div className="text-sm">
                      {(() => {
                        try {
                          const address = typeof selectedApplication.address === 'string' 
                            ? JSON.parse(selectedApplication.address) 
                            : selectedApplication.address;
                          return (
                            <>
                              <p>{address.index}, {address.region}</p>
                              <p>{address.locality}</p>
                              <p>{address.street}, д. {address.house}</p>
                              {address.apartment && (
                                <p>кв. {address.apartment}</p>
                              )}
                            </>
                          );
                        } catch {
                          return <p>Адрес не указан</p>;
                        }
                      })()}
                    </div>
                  </div>

                  {/* Организация */}
                  <div>
                    <h4 className="font-medium mb-3">Организация</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Название:</span> {selectedApplication.organization?.name || 'Не указано'}</p>
                      <p><span className="font-medium">Тип:</span> {selectedApplication.organization?.type || 'Не указан'}</p>
                      <p><span className="font-medium">Адрес:</span> {selectedApplication.organization?.address || 'Не указан'}</p>
                    </div>
                  </div>

                  {/* Статус заявления */}
                  <div>
                    <h4 className="font-medium mb-3">Статус заявления</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Статус:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          selectedApplication.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          selectedApplication.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedApplication.status === 'PENDING' ? 'На рассмотрении' :
                           selectedApplication.status === 'APPROVED' ? 'Одобрено' : 'Отклонено'}
                        </span>
                      </p>
                      <p><span className="font-medium">Дата подачи:</span> {new Date(selectedApplication.createdAt).toLocaleDateString('ru-RU')}</p>
                      {selectedApplication.signLater && (
                        <p><span className="font-medium">Подписание:</span> <span className="text-yellow-600">Отложено</span></p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Документы заявления */}
                {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Документы заявления</h4>
                    <div className="space-y-3">
                      {selectedApplication.documents.map((doc: { id: string; type: string; fileName: string; filePath: string; status: string }) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {doc.type === 'MEMBERSHIP_APPLICATION' ? 'Заявление на вступление в профсоюз' :
                                 doc.type === 'CONSENT_PERSONAL_DATA' ? 'Согласие на обработку персональных данных' :
                                 doc.type === 'PAYMENT_DEDUCTION' ? 'Заявление на удержание взносов' : doc.type}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {doc.fileName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              doc.status === 'NOT_SIGNED' ? 'bg-orange-100 text-orange-600' :
                              doc.status === 'SIGNED' ? 'bg-green-100 text-green-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {doc.status === 'NOT_SIGNED' ? 'Не подписано' :
                               doc.status === 'SIGNED' ? 'Подписано' : 'Отклонено'}
                            </span>
                            <a
                              href={doc.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              Скачать
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Действия */}
                {selectedApplication.status === 'PENDING' && (
                  <div className="mt-6 border-t pt-4">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleApplicationStatus(selectedApplication.id, 'APPROVED')}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Одобрить заявление
                      </button>
                      <div className="flex-1">
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Причина отклонения..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          rows={3}
                        />
                        <button
                          onClick={() => handleApplicationStatus(selectedApplication.id, 'REJECTED')}
                          disabled={!rejectionReason.trim()}
                          className="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Отклонить заявление
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedApplication.status === 'REJECTED' && selectedApplication.rejectionReason && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="font-medium mb-2">Причина отклонения:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedApplication.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
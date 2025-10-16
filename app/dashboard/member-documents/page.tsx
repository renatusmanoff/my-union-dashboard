'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import DashboardLayout from '@/components/DashboardLayout';

interface Document {
  id: string;
  type: string;
  fileName: string;
  filePath: string;
  status: string;
  signedAt: string | null;
  sentToUnion: boolean;
  sentAt: string | null;
  createdAt: string;
}

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  status: string;
  signLater: boolean;
  documents: Document[];
  organization: {
    name: string;
  };
  createdAt: string;
}

export default function MemberDocumentsPage() {
  const { user: _user } = useUser();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/membership/application');
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке заявлений');
      }
      
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getDocumentTypeLabel = (type: string) => {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'NOT_SIGNED':
        return 'Не подписано';
      case 'SIGNED':
        return 'Подписано';
      case 'REJECTED':
        return 'Отклонено';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_SIGNED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'SIGNED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getApplicationStatusLabel = (status: string) => {
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

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleSignDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/membership/documents/${documentId}/sign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при подписании документа');
      }

      // Обновляем список заявлений
      await fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при подписании');
    }
  };

  const handleSendToUnion = async (documentId: string) => {
    try {
      const response = await fetch(`/api/membership/documents/${documentId}/send`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при отправке документа');
      }

      // Обновляем список заявлений
      await fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при отправке');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Мои документы
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Управление документами заявлений на вступление в профсоюз
          </p>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Заявления на вступление в профсоюз
          </h2>
        </div>

        {applications.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Нет заявлений
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              У вас пока нет заявлений на вступление в профсоюз.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {applications.map((application) => (
              <div key={application.id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {application.lastName} {application.firstName} {application.middleName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Организация: {application.organization.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Дата подачи: {new Date(application.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getApplicationStatusColor(application.status)}`}>
                      {getApplicationStatusLabel(application.status)}
                    </span>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Документы:
                  </h4>
                  {application.documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {getDocumentTypeLabel(document.type)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {document.fileName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                          {getStatusLabel(document.status)}
                        </span>
                        <div className="flex space-x-2">
                          <a
                            href={document.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            Скачать
                          </a>
                          {document.status === 'NOT_SIGNED' && (
                            <button
                              onClick={() => handleSignDocument(document.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700"
                            >
                              Подписать
                            </button>
                          )}
                          {document.status === 'SIGNED' && !document.sentToUnion && (
                            <button
                              onClick={() => handleSendToUnion(document.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                            >
                              Отправить в профсоюз
                            </button>
                          )}
                          {document.sentToUnion && (
                            <span className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                              Отправлено
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
    </DashboardLayout>
  );
}
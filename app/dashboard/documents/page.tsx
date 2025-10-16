'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import DashboardLayout from '@/components/DashboardLayout';

interface MembershipDocument {
  id: string;
  type: 'MEMBERSHIP_APPLICATION' | 'CONSENT_PERSONAL_DATA' | 'PAYMENT_DEDUCTION';
  fileName: string;
  filePath: string;
  status: 'NOT_SIGNED' | 'SIGNED' | 'REJECTED';
  signedAt?: string;
  sentToUnion: boolean;
  sentAt?: string;
  application: {
    id: string;
    lastName: string;
    firstName: string;
    middleName?: string;
    email: string;
    phone: string;
    organization: {
      id: string;
      name: string;
      type: string;
    };
  };
}

export default function DocumentsPage() {
  const { user } = useUser();
  const [documents, setDocuments] = useState<MembershipDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<MembershipDocument | null>(null);
  const [filters, setFilters] = useState({
    organization: '',
    status: '',
    type: '',
    search: ''
  });

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'MEMBERSHIP_APPLICATION':
        return 'Заявление на вступление';
      case 'CONSENT_PERSONAL_DATA':
        return 'Согласие на обработку данных';
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
        return 'bg-orange-100 text-orange-600';
      case 'SIGNED':
        return 'bg-green-100 text-green-600';
      case 'REJECTED':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesOrganization = !filters.organization || doc.application.organization.name.toLowerCase().includes(filters.organization.toLowerCase());
    const matchesStatus = !filters.status || doc.status === filters.status;
    const matchesType = !filters.type || doc.type === filters.type;
    const matchesSearch = !filters.search || 
      `${doc.application.lastName} ${doc.application.firstName} ${doc.application.middleName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
      doc.application.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      doc.application.phone.includes(filters.search);
    
    return matchesOrganization && matchesStatus && matchesType && matchesSearch;
  });

  const organizations = [...new Set(documents.map(doc => doc.application.organization.name))].sort();

  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Доступ запрещен</h1>
            <p className="text-gray-600 dark:text-gray-400">Только супер-администраторы могут просматривать документооборот</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Документооборот
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Полный обзор всех документов от всех организаций и членов профсоюза
          </p>
        </div>

        {/* Filters */}
        <div className="card rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Поиск по ФИО/Email/Телефону
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Введите данные для поиска..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Организация
              </label>
              <select
                value={filters.organization}
                onChange={(e) => setFilters(prev => ({ ...prev, organization: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Все организации</option>
                {organizations.map(org => (
                  <option key={org} value={org}>{org}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Тип документа
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Все типы</option>
                <option value="MEMBERSHIP_APPLICATION">Заявление на вступление</option>
                <option value="CONSENT_PERSONAL_DATA">Согласие на обработку данных</option>
                <option value="PAYMENT_DEDUCTION">Заявление на удержание взносов</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Статус
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Все статусы</option>
                <option value="NOT_SIGNED">Не подписано</option>
                <option value="SIGNED">Подписано</option>
                <option value="REJECTED">Отклонено</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="card rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-400">Загрузка документов...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Член профсоюза
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Организация
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Тип документа
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Статус подписания
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Отправка в профсоюз
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
                  {filteredDocuments.map((document) => (
                    <tr key={document.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium">
                            {document.application.lastName} {document.application.firstName} {document.application.middleName}
                          </div>
                          <div className="text-sm text-gray-400">{document.application.email}</div>
                          <div className="text-sm text-gray-400">{document.application.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <div className="font-medium">{document.application.organization.name}</div>
                          <div className="text-gray-400">{document.application.organization.type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getDocumentTypeLabel(document.type)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                          {getStatusLabel(document.status)}
                        </span>
                        {document.signedAt && (
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(document.signedAt).toLocaleDateString('ru-RU')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          document.sentToUnion 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {document.sentToUnion ? 'Отправлено' : 'Не отправлено'}
                        </span>
                        {document.sentAt && (
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(document.sentAt).toLocaleDateString('ru-RU')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedDocument(document)}
                            className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Просмотр"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <a
                            href={document.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-green-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Скачать"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredDocuments.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-gray-400">Документы не найдены</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Document Details Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Детали документа
                </h3>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Информация о документе */}
                <div>
                  <h4 className="font-medium mb-3">Информация о документе</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Тип:</span> {getDocumentTypeLabel(selectedDocument.type)}</p>
                    <p><span className="font-medium">Файл:</span> {selectedDocument.fileName}</p>
                    <p><span className="font-medium">Статус:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedDocument.status)}`}>
                        {getStatusLabel(selectedDocument.status)}
                      </span>
                    </p>
                    {selectedDocument.signedAt && (
                      <p><span className="font-medium">Дата подписания:</span> {new Date(selectedDocument.signedAt).toLocaleDateString('ru-RU')}</p>
                    )}
                    <p><span className="font-medium">Отправлено в профсоюз:</span> {selectedDocument.sentToUnion ? 'Да' : 'Нет'}</p>
                    {selectedDocument.sentAt && (
                      <p><span className="font-medium">Дата отправки:</span> {new Date(selectedDocument.sentAt).toLocaleDateString('ru-RU')}</p>
                    )}
                  </div>
                </div>

                {/* Информация о заявителе */}
                <div>
                  <h4 className="font-medium mb-3">Информация о заявителе</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">ФИО:</span> {selectedDocument.application.lastName} {selectedDocument.application.firstName} {selectedDocument.application.middleName}</p>
                    <p><span className="font-medium">Email:</span> {selectedDocument.application.email}</p>
                    <p><span className="font-medium">Телефон:</span> {selectedDocument.application.phone}</p>
                    <p><span className="font-medium">Организация:</span> {selectedDocument.application.organization.name}</p>
                    <p><span className="font-medium">Тип организации:</span> {selectedDocument.application.organization.type}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <a
                  href={selectedDocument.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Скачать документ
                </a>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
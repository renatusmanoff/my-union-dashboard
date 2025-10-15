'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  DocumentArrowDownIcon, 
  EyeIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { cachedFetch } from '@/lib/cache';

interface MemberDocument {
  id: string;
  type: 'MEMBERSHIP_APPLICATION' | 'CERTIFICATE' | 'CONTRACT' | 'OTHER';
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SIGNED';
  createdAt: string;
  updatedAt: string;
  pdfUrl?: string;
  notes?: string;
}

const documentTypeLabels = {
  MEMBERSHIP_APPLICATION: 'Заявление о вступлении в профсоюз',
  CERTIFICATE: 'Справка о членстве',
  CONTRACT: 'Договор',
  OTHER: 'Другой документ'
};

const statusLabels = {
  PENDING: 'На рассмотрении',
  APPROVED: 'Одобрено',
  REJECTED: 'Отклонено',
  SIGNED: 'Подписано'
};

const statusColors = {
  PENDING: 'bg-orange-500 text-white',
  APPROVED: 'bg-blue-500 text-white',
  REJECTED: 'bg-red-500 text-white',
  SIGNED: 'bg-green-500 text-white'
};

const statusIcons = {
  PENDING: ClockIcon,
  APPROVED: CheckCircleIcon,
  REJECTED: XCircleIcon,
  SIGNED: CheckCircleIcon
};

export default function MemberDocumentsPage() {
  const [documents, setDocuments] = useState<MemberDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<MemberDocument | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await cachedFetch('/api/member/documents', undefined, 30 * 1000); // 30 seconds cache
      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents || []);
      } else {
        console.error('Error fetching documents:', data.error);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDocument = (document: MemberDocument) => {
    setSelectedDocument(document);
  };

  const handleDownloadDocument = (document: MemberDocument) => {
    if (document.pdfUrl) {
      window.open(document.pdfUrl, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Документооборот
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Список ваших документов и заявлений
            </p>
          </div>
        </div>

        {/* Documents List */}
        <div 
          className="rounded-lg shadow-sm"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Загрузка документов...</div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Документы не найдены
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  У вас пока нет документов в системе
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((document) => {
                  const StatusIcon = statusIcons[document.status];
                  
                  return (
                    <div
                      key={document.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                      style={{ 
                        backgroundColor: 'var(--background)', 
                        borderColor: 'var(--card-border)' 
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <DocumentArrowDownIcon 
                            className="h-8 w-8"
                            style={{ color: 'var(--text-secondary)' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="text-sm font-medium truncate"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {documentTypeLabels[document.type]}
                          </h3>
                          <p 
                            className="text-sm truncate"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {document.description}
                          </p>
                          <p 
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Создано: {formatDate(document.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {/* Status Badge */}
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="h-4 w-4" />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[document.status]}`}>
                            {statusLabels[document.status]}
                          </span>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDocument(document)}
                            className="p-2 rounded-lg transition-colors hover:opacity-70"
                            style={{ 
                              backgroundColor: 'var(--card-bg)', 
                              color: 'var(--text-secondary)' 
                            }}
                            title="Просмотр"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          
                          {document.pdfUrl && (
                            <button
                              onClick={() => handleDownloadDocument(document)}
                              className="p-2 rounded-lg transition-colors hover:opacity-70"
                              style={{ 
                                backgroundColor: 'var(--card-bg)', 
                                color: 'var(--text-secondary)' 
                              }}
                              title="Скачать PDF"
                            >
                              <DocumentArrowDownIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Document Details Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div 
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 
                    className="text-xl font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {documentTypeLabels[selectedDocument.type]}
                  </h2>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="p-2 rounded-lg transition-colors hover:opacity-70"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Описание
                    </label>
                    <p style={{ color: 'var(--text-primary)' }}>
                      {selectedDocument.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Статус
                      </label>
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const StatusIcon = statusIcons[selectedDocument.status];
                          return <StatusIcon className="h-4 w-4" />;
                        })()}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedDocument.status]}`}>
                          {statusLabels[selectedDocument.status]}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Дата создания
                      </label>
                      <p style={{ color: 'var(--text-primary)' }}>
                        {formatDate(selectedDocument.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {selectedDocument.updatedAt !== selectedDocument.createdAt && (
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Последнее обновление
                      </label>
                      <p style={{ color: 'var(--text-primary)' }}>
                        {formatDate(selectedDocument.updatedAt)}
                      </p>
                    </div>
                  )}
                  
                  {selectedDocument.notes && (
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Комментарии
                      </label>
                      <p style={{ color: 'var(--text-primary)' }}>
                        {selectedDocument.notes}
                      </p>
                    </div>
                  )}
                  
                  {selectedDocument.pdfUrl && (
                    <div className="pt-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
                      <button
                        onClick={() => handleDownloadDocument(selectedDocument)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4" />
                        <span>Скачать PDF</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

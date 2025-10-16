'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Document {
  id: string;
  type: 'MEMBERSHIP_APPLICATION' | 'CONSENT_PERSONAL_DATA' | 'PAYMENT_DEDUCTION';
  fileName: string;
  filePath: string;
  status: 'NOT_SIGNED' | 'SIGNED' | 'REJECTED';
}

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  organization: {
    name: string;
    type: string;
  };
  documents: Document[];
}

export default function RegistrationDocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('id');
  
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSigningLater, setIsSigningLater] = useState(false);

  useEffect(() => {
    if (!applicationId) {
      setError('ID заявления не найден');
      setIsLoading(false);
      return;
    }

    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/membership/application/${applicationId}`);
      if (response.ok) {
        const data = await response.json();
        setApplication(data.application);
      } else {
        setError('Заявление не найдено');
      }
    } catch (err) {
      setError('Ошибка при загрузке заявления');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignLater = async () => {
    setIsSigningLater(true);
    try {
      const response = await fetch(`/api/membership/application/${applicationId}/sign-later`, {
        method: 'POST'
      });
      
      if (response.ok) {
        router.push('/login?message=registration-complete');
      } else {
        setError('Ошибка при сохранении');
      }
    } catch (err) {
      setError('Ошибка при сохранении');
    } finally {
      setIsSigningLater(false);
    }
  };

  const handleDownloadDocument = (document: Document) => {
    // Открываем PDF в новой вкладке
    window.open(document.filePath, '_blank');
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'MEMBERSHIP_APPLICATION':
        return 'Заявление на вступление в профсоюз';
      case 'CONSENT_PERSONAL_DATA':
        return 'Согласие на обработку персональных данных';
      case 'PAYMENT_DEDUCTION':
        return 'Заявление на удержание профсоюзных взносов';
      default:
        return type;
    }
  };

  const getDocumentTypeDescription = (type: string) => {
    switch (type) {
      case 'MEMBERSHIP_APPLICATION':
        return 'Основное заявление на вступление в профсоюзную организацию';
      case 'CONSENT_PERSONAL_DATA':
        return 'Согласие на обработку и хранение ваших персональных данных';
      case 'PAYMENT_DEDUCTION':
        return 'Заявление на удержание профсоюзных взносов из заработной платы';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Ошибка</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
            <div className="mt-6">
              <Link
                href="/register"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Вернуться к регистрации
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Заявление не найдено</h2>
          <Link
            href="/register"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Вернуться к регистрации
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Документы для подписания
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Ваше заявление успешно создано! Теперь вы можете скачать и подписать документы.
          </p>
        </div>

        {/* Application Info */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Информация о заявлении
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">ФИО</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {application.lastName} {application.firstName} {application.middleName || ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Организация</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {application.organization.name}
              </p>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Документы для подписания
          </h2>
          
          <div className="space-y-6">
            {application.documents.map((document) => (
              <div key={document.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {getDocumentTypeLabel(document.type)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {getDocumentTypeDescription(document.type)}
                    </p>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleDownloadDocument(document)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Скачать PDF
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(document)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Открыть для просмотра
                      </button>
                    </div>
                  </div>
                  <div className="ml-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      Не подписано
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Инструкции по подписанию документов
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Скачайте каждый документ, нажав кнопку "Скачать PDF"</li>
                  <li>Распечатайте документы на принтере</li>
                  <li>Подпишите документы собственноручно</li>
                  <li>Отсканируйте или сфотографируйте подписанные документы</li>
                  <li>Загрузите подписанные документы в личном кабинете</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleSignLater}
            disabled={isSigningLater}
            className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 shadow-sm text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningLater ? 'Сохранение...' : 'Подписать позже'}
          </button>
          <Link
            href="/login?message=registration-complete"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Перейти в личный кабинет
          </Link>
        </div>
      </div>
    </div>
  );
}

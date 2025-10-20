'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useUser } from '@/contexts/UserContext';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Participant {
  id: string;
  userId: string;
  user: User;
  status: 'PENDING' | 'SIGNED' | 'REJECTED';
}

interface Document {
  id: string;
  title: string;
  type: string;
  status: string;
  meetingDate?: string;
  meetingLocation?: string;
  documentDate?: string;
  uploadedFilePath?: string;
  createdAt: string;
  creator: User;
  participants: Participant[];
}

const documentTypeNames: Record<string, string> = {
  AGENDA: 'Повестка дня',
  PROTOCOL_MEETING: 'Протокол заседания',
  EXTRACT_FROM_PROTOCOL: 'Выписка из протокола',
  RESOLUTION: 'Постановление'
};

export default function DocumentSigningPage() {
  const params = useParams();
  const documentId = params.id as string;
  const { user, isLoading } = useUser();

  const [document, setDocument] = useState<Document | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [error, setError] = useState('');
  const [signing, setSigning] = useState(false);
  const [currentUserParticipant, setCurrentUserParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    async function loadDocument() {
      try {
        const response = await fetch(`/api/documents/${documentId}`);
        if (response.ok) {
          const data = await response.json();
          setDocument(data.document);

          // Найти текущего пользователя в участниках
          const userParticipant = data.document.participants.find(
            (p: Participant) => p.userId === user?.id
          );
          setCurrentUserParticipant(userParticipant || null);

          if (!userParticipant) {
            setError('Вы не являетесь участником этого документа');
          }
        } else {
          setError('Документ не найден');
        }
      } catch (error) {
        console.error('Error loading document:', error);
        setError('Ошибка при загрузке документа');
      } finally {
        setLoadingDoc(false);
      }
    }

    if (!isLoading && user) {
      loadDocument();
    }
  }, [documentId, user, isLoading]);

  const handleSign = async () => {
    if (!currentUserParticipant || currentUserParticipant.status !== 'PENDING') {
      setError('Вы уже подписали этот документ или он недоступен для подписи');
      return;
    }

    try {
      setSigning(true);
      const response = await fetch(`/api/documents/${documentId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true })
      });

      if (response.ok) {
        const data = await response.json();
        setDocument(data.document);
        
        // Обновить текущего пользователя в участниках
        const updatedParticipant = data.document.participants.find(
          (p: Participant) => p.userId === user?.id
        );
        setCurrentUserParticipant(updatedParticipant || null);

        alert('✅ Документ успешно подписан!');
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при подписании');
      }
    } catch (error) {
      console.error('Error signing document:', error);
      setError('Ошибка при подписании документа');
    } finally {
      setSigning(false);
    }
  };

  const handleReject = async () => {
    if (!currentUserParticipant || currentUserParticipant.status !== 'PENDING') {
      setError('Вы уже подписали этот документ или он недоступен для отклонения');
      return;
    }

    const reason = prompt('Укажите причину отклонения документа:');
    if (!reason) return;

    try {
      setSigning(true);
      const response = await fetch(`/api/documents/${documentId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false, rejectionReason: reason })
      });

      if (response.ok) {
        const data = await response.json();
        setDocument(data.document);
        
        // Обновить текущего пользователя в участниках
        const updatedParticipant = data.document.participants.find(
          (p: Participant) => p.userId === user?.id
        );
        setCurrentUserParticipant(updatedParticipant || null);

        alert('✅ Документ отклонен');
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при отклонении');
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
      setError('Ошибка при отклонении документа');
    } finally {
      setSigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SIGNED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SIGNED': return '✓ Подписано';
      case 'REJECTED': return '✗ Отклонено';
      case 'PENDING': return '⏳ Ожидаю действия';
      default: return status;
    }
  };

  if (isLoading || loadingDoc) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Загрузка...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!document) {
    return (
      <DashboardLayout>
        <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-red-200">
          <h2 className="text-xl font-bold mb-2">Ошибка</h2>
          <p>{error || 'Документ не найден'}</p>
        </div>
      </DashboardLayout>
    );
  }

  const canSign = currentUserParticipant?.status === 'PENDING';
  const hasSigned = currentUserParticipant?.status === 'SIGNED';
  const hasRejected = currentUserParticipant?.status === 'REJECTED';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Информация о документе */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{document.title}</h1>
              <p className="text-gray-400">
                {documentTypeNames[document.type]} • Создан {new Date(document.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
            <div className={`${getStatusColor(currentUserParticipant?.status || 'PENDING')} px-4 py-2 rounded-lg font-semibold`}>
              {getStatusLabel(currentUserParticipant?.status || 'PENDING')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Создатель:</span>
              <p className="text-white">{document.creator.firstName} {document.creator.lastName}</p>
            </div>
            {document.meetingLocation && (
              <div>
                <span className="text-gray-400">Место проведения:</span>
                <p className="text-white">📍 {document.meetingLocation}</p>
              </div>
            )}
            {document.meetingDate && (
              <div>
                <span className="text-gray-400">Дата заседания:</span>
                <p className="text-white">📅 {new Date(document.meetingDate).toLocaleDateString('ru-RU')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Предпросмотр документа */}
        {document.uploadedFilePath && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Предпросмотр документа</h2>
            <div className="bg-gray-900 rounded-lg p-4">
              <iframe
                src={document.uploadedFilePath}
                title="Document Preview"
                className="w-full h-96 rounded-lg border border-gray-700"
              />
            </div>
            <div className="mt-4 text-center">
              <a
                href={document.uploadedFilePath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Скачать документ
              </a>
            </div>
          </div>
        )}

        {/* Участники и их статусы */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Участники и статусы подписей</h2>
          <div className="space-y-3">
            {document.participants.map(participant => (
              <div
                key={participant.id}
                className="flex justify-between items-center bg-gray-700 rounded-lg p-4"
              >
                <div>
                  <p className="text-white font-semibold">
                    {participant.user.firstName} {participant.user.lastName}
                  </p>
                  <p className="text-gray-400 text-sm">{participant.user.email}</p>
                </div>
                <span className={`${getStatusColor(participant.status)} px-3 py-1 rounded-full text-sm font-medium`}>
                  {getStatusLabel(participant.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Действия */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-200">
            {error}
          </div>
        )}

        {canSign && (
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Ваша подпись требуется</h3>
            <p className="text-blue-200">
              Документ готов к подписанию. Нажмите одну из кнопок ниже для завершения.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleSign}
                disabled={signing}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                {signing ? '⏳ Подписание...' : '✓ Подписать документ'}
              </button>
              <button
                onClick={handleReject}
                disabled={signing}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                {signing ? '⏳ Обработка...' : '✗ Отклонить'}
              </button>
            </div>
          </div>
        )}

        {hasSigned && (
          <div className="bg-green-900 border border-green-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white">✓ Документ подписан</h3>
            <p className="text-green-200 mt-2">
              Вы успешно подписали этот документ. Спасибо за ваше внимание!
            </p>
          </div>
        )}

        {hasRejected && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white">✗ Документ отклонен</h3>
            <p className="text-red-200 mt-2">
              Вы отклонили этот документ.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

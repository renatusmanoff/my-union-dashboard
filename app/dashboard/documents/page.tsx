'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
  role: string;
  phone?: string;
}

interface Participant {
  id: string;
  userId: string;
  user: User;
  status: 'PENDING' | 'SIGNED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

interface DocumentType {
      id: string;
  title: string;
  type: 'AGENDA' | 'PROTOCOL_MEETING' | 'EXTRACT_FROM_PROTOCOL' | 'RESOLUTION';
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  meetingDate?: string;
  meetingLocation?: string;
  documentDate?: string;
  createdAt: string;
  updatedAt: string;
  creator: User;
  participants: Participant[];
}

const documentTypeNames: Record<string, string> = {
  AGENDA: 'Повестка дня',
  PROTOCOL_MEETING: 'Протокол заседания',
  EXTRACT_FROM_PROTOCOL: 'Выписка из протокола',
  RESOLUTION: 'Постановление'
};

export default function DocumentsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>('AGENDA');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [searchMember, setSearchMember] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<User[]>([]);

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    meetingDate: new Date().toISOString().split('T')[0],
    meetingLocation: '',
    documentDate: new Date().toISOString().split('T')[0]
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Проверка доступа
  if (!isLoading && user && !['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN', 'SUPER_ADMIN'].includes(user.role)) {
    router.push('/dashboard');
    return null;
  }

  // Загружаем документы
  useEffect(() => {
    async function loadDocuments() {
      try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
        console.error('Error loading documents:', error);
    } finally {
        setLoadingDocs(false);
      }
    }

    if (!isLoading && user) {
      loadDocuments();
    }
  }, [user, isLoading]);

  // Загружаем членов организации
  useEffect(() => {
    async function loadMembers() {
      try {
        const response = await fetch('/api/organization-members');
        if (response.ok) {
          const data = await response.json();
          setMembers(data.members || []);
        }
      } catch (error) {
        console.error('Error loading members:', error);
      }
    }

    if (!isLoading && user) {
      loadMembers();
    }
  }, [user, isLoading]);

  // Фильтруем членов по поиску
  useEffect(() => {
    if (searchMember.trim()) {
      const filtered = members.filter(m => 
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchMember.toLowerCase()) ||
        m.email.toLowerCase().includes(searchMember.toLowerCase())
      );
      setFilteredMembers(filtered.slice(0, 10));
    } else {
      setFilteredMembers([]);
    }
  }, [searchMember, members]);

  const handleAddParticipant = (participantId: string) => {
    if (!selectedParticipants.includes(participantId)) {
      setSelectedParticipants([...selectedParticipants, participantId]);
      setSearchMember('');
      setFilteredMembers([]);
    }
  };

  const handleRemoveParticipant = (participantId: string) => {
    setSelectedParticipants(selectedParticipants.filter(id => id !== participantId));
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const formDataForUpload = new FormData();
      formDataForUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataForUpload
      });

      if (response.ok) {
        const data = await response.json();
        return data.filePath;
      }
      return null;
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!formData.title || selectedParticipants.length === 0) {
      alert('Пожалуйста заполните все поля и выберите участников');
      return;
    }

    try {
      let uploadedFilePath = null;
      
      // Загружаем файл если он был выбран
      if (uploadedFile) {
        uploadedFilePath = await handleFileUpload(uploadedFile);
        if (!uploadedFilePath) {
          alert('Ошибка при загрузке файла');
          return;
        }
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          type: selectedDocType,
          meetingDate: formData.meetingDate,
          meetingLocation: formData.meetingLocation,
          documentDate: formData.documentDate,
          participantIds: selectedParticipants,
          uploadedFilePath
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments([data.document, ...documents]);
        setShowCreateForm(false);
        setFormData({
          title: '',
          meetingDate: new Date().toISOString().split('T')[0],
          meetingLocation: '',
          documentDate: new Date().toISOString().split('T')[0]
        });
        setUploadedFile(null);
        setSelectedParticipants([]);
        alert('Документ создан успешно');
      }
    } catch (error) {
      console.error('Error creating document:', error);
      alert('Ошибка при создании документа');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-500';
      case 'PENDING_APPROVAL': return 'bg-yellow-500';
      case 'APPROVED': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Черновик';
      case 'PENDING_APPROVAL': return 'На согласовании';
      case 'APPROVED': return 'Одобрен';
      case 'COMPLETED': return 'Завершен';
      case 'REJECTED': return 'Отклонен';
      default: return status;
    }
  };

  const getParticipantStatusColor = (status: string) => {
    switch (status) {
      case 'SIGNED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getParticipantStatusLabel = (status: string) => {
    switch (status) {
      case 'SIGNED': return '✓ Подписано';
      case 'REJECTED': return '✗ Отклонено';
      case 'PENDING': return '⏳ Ожидаем подписи';
      default: return status;
    }
  };

  if (isLoading || loadingDocs) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Загрузка...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Заголовок и кнопка */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Электронный документооборот</h1>
                          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                          >
            + Создать документ
                          </button>
        </div>

        {/* Модальное окно создания документа */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gray-800 rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Создать документ</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Верхний ряд: Тип и Название */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Тип документа */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Тип документа *</label>
                    <select
                      value={selectedDocType}
                      onChange={(e) => setSelectedDocType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                    >
                      {Object.entries(documentTypeNames).map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Название документа */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Название *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Введите название документа"
                      className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                    />
                  </div>
                </div>

                {/* Второй ряд: Дата заседания и Место проведения */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Дата заседания */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Дата заседания</label>
                    <input
                      type="date"
                      value={formData.meetingDate}
                      onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                    />
                  </div>

                  {/* Место проведения */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Место проведения</label>
                    <input
                      type="text"
                      value={formData.meetingLocation}
                      onChange={(e) => setFormData({ ...formData, meetingLocation: e.target.value })}
                      placeholder="Введите место проведения"
                      className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                    />
                  </div>
                </div>

                {/* Дата документа - одна колонна */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Дата документа</label>
                  <input
                    type="date"
                    value={formData.documentDate}
                    onChange={(e) => setFormData({ ...formData, documentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                  />
                </div>

                {/* Выбор участников */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Участники *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchMember}
                      onChange={(e) => setSearchMember(e.target.value)}
                      placeholder="Поиск по имени или почте..."
                      className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                    />
                    {filteredMembers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto z-10">
                        {filteredMembers.map(member => (
                          <button
                            key={member.id}
                            onClick={() => handleAddParticipant(member.id)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-600 text-white transition"
                          >
                            {member.firstName} {member.lastName} ({member.email})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Выбранные участники */}
                  {selectedParticipants.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedParticipants.map(participantId => {
                        const participant = members.find(m => m.id === participantId);
                        if (!participant) return null;
                        return (
                          <div
                            key={participantId}
                            className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            {participant.firstName} {participant.lastName}
                            <button
                              onClick={() => handleRemoveParticipant(participantId)}
                              className="hover:text-gray-300"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Загрузка документа */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Загрузить документ (опционально)</label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadedFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {uploadedFile ? (
                        <div className="text-green-400">
                          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="font-semibold">Файл выбран: {uploadedFile.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{(uploadedFile.size / 1024 / 1024).toFixed(2)} МБ</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setUploadedFile(null);
                            }}
                            className="text-red-400 text-sm mt-2 hover:text-red-300"
                          >
                            Удалить файл
                          </button>
                        </div>
                      ) : (
                        <div>
                          <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-gray-300">Перетащите файл или нажмите для выбора</p>
                          <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLS до 50 МБ</p>
                        </div>
                      )}
                    </label>
                </div>
              </div>

                {/* Кнопки действия */}
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-500 text-gray-300 rounded-lg hover:bg-gray-700 transition"
                  >
                    Отмена
                  </button>
                <button
                    onClick={handleCreateDocument}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                    Создать
                </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Список документов */}
        <div className="space-y-4">
          {documents.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
              Документов нет. Создайте первый документ!
            </div>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="bg-gray-800 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{doc.title}</h3>
                    <p className="text-sm text-gray-400">
                      {documentTypeNames[doc.type]} • {new Date(doc.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                    <p className="text-sm text-gray-400">Создатель: {doc.creator.firstName} {doc.creator.lastName}</p>
                  </div>
                  <span className={`${getStatusColor(doc.status)} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                    {getStatusLabel(doc.status)}
                  </span>
                </div>

                {doc.meetingLocation && (
                  <p className="text-sm text-gray-300">📍 {doc.meetingLocation}</p>
                )}
                {doc.meetingDate && (
                  <p className="text-sm text-gray-300">📅 {new Date(doc.meetingDate).toLocaleDateString('ru-RU')}</p>
                )}

                {/* Участники и статусы подписей */}
                {doc.participants.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Статусы подписей:</h4>
                    <div className="flex flex-wrap gap-2">
                      {doc.participants.map(participant => (
                        <div
                          key={participant.id}
                          className={`${getParticipantStatusColor(participant.status)} px-3 py-1 rounded-full text-xs font-medium`}
                        >
                          {participant.user.firstName} {participant.user.lastName}: {getParticipantStatusLabel(participant.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
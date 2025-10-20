'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import DashboardLayout from '@/components/DashboardLayout';

interface Member {
  id: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  email: string;
  phone: string;
  role: string;
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    type: string;
  };
  membershipApplications: Array<{
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
  }>;
}

export default function MembersPage() {
  const { user } = useUser();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [filters, setFilters] = useState({
    organization: '',
    search: ''
  });

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/members/all');
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого члена профсоюза?')) {
      return;
    }

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchMembers();
        setSelectedMember(null);
        alert('Член профсоюза успешно удален');
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при удалении члена');
      }
    } catch (error) {
      console.error('Delete member error:', error);
      alert('Ошибка при удалении члена');
    }
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setSelectedMember(null);
  };

  const handleUpdateMember = async (updatedData: Partial<Member>) => {
    if (!editingMember) return;

    try {
      const response = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        await fetchMembers();
        setEditingMember(null);
        alert('Данные члена профсоюза обновлены');
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при обновлении данных');
      }
    } catch (error) {
      console.error('Update member error:', error);
      alert('Ошибка при обновлении данных');
    }
  };

  // Убираем функции для работы со статусами, так как теперь все члены уже одобрены

  const filteredMembers = members.filter(member => {
    const matchesOrganization = !filters.organization || 
      (member.organization && member.organization.name.toLowerCase().includes(filters.organization.toLowerCase()));
    const matchesSearch = !filters.search || 
      `${member.lastName} ${member.firstName} ${member.middleName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
      member.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      member.phone.includes(filters.search);
    
    return matchesOrganization && matchesSearch;
  });

  const organizations = [...new Set(members.map(member => member.organization?.name).filter(Boolean))].sort();

  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Доступ запрещен</h1>
            <p className="text-gray-600 dark:text-gray-400">Только супер-администраторы могут просматривать всех членов</p>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Члены профсоюза
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Полный список всех членов профсоюза с их статусами и организациями
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Всего членов</p>
                <p className="text-2xl font-semibold text-white">{members.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-900/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Организаций</p>
                <p className="text-2xl font-semibold text-white">{organizations.length}</p>
              </div>
              <div className="w-10 h-10 bg-green-900/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Активных</p>
                <p className="text-2xl font-semibold text-white">{members.length}</p>
              </div>
              <div className="w-10 h-10 bg-green-900/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-sm border border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* Members List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-700">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-400">Загрузка членов...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                <thead>
                  <tr className="bg-gray-700 border-b border-gray-600">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Член профсоюза
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Организация
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Роль
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Дата вступления
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {filteredMembers.map((member) => {
                    const approvedApplication = member.membershipApplications
                      .find(app => app.status === 'APPROVED');
                    
                    return (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="max-w-[300px]">
                            <div className="text-base font-medium text-white truncate" title={`${member.lastName} ${member.firstName} ${member.middleName}`}>
                              {member.lastName} {member.firstName} {member.middleName}
                            </div>
                            <div className="text-sm text-gray-400 truncate" title={member.email}>{member.email}</div>
                            <div className="text-sm text-gray-400">{member.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {member.organization ? (
                            <div className="max-w-[250px]">
                              <div className="text-base font-medium text-white truncate" title={member.organization.name}>{member.organization.name}</div>
                              <div className="text-sm text-gray-400">{member.organization.type}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Неопределено</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900/20 text-blue-400">
                            {member.role === 'PRIMARY_MEMBER' ? 'Член профсоюза' : member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {approvedApplication ? (
                            <div className="max-w-[180px]">
                              <div className="text-base text-white">{new Date(approvedApplication.createdAt).toLocaleDateString('ru-RU')}</div>
                              <div className="text-sm text-gray-400 truncate" title={approvedApplication.id}>ID: {approvedApplication.id.slice(-8)}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Не указана</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setSelectedMember(member)}
                              className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Просмотр карточки"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            {/* Кнопки для редактирования и удаления */}
                            {user?.role === 'SUPER_ADMIN' && (
                              <button
                                onClick={() => handleEditMember(member)}
                                className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 rounded-lg transition-colors"
                                title="Редактировать"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            {(user?.role === 'SUPER_ADMIN' || 
                              (user?.role && (user.role as string).includes('CHAIRMAN') && member.organizationId === user.organizationId)) && (
                              <button
                                onClick={() => handleDeleteMember(member.id)}
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Удалить"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden">
                {filteredMembers.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-400">Члены не найдены</p>
                  </div>
                ) : (
                  <div className="space-y-4 p-4">
                    {filteredMembers.map((member) => {
                      const approvedApplication = member.membershipApplications
                        .find(app => app.status === 'APPROVED');
                      
                      return (
                        <div key={member.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-white">
                                {member.lastName} {member.firstName} {member.middleName}
                              </h3>
                              <p className="text-xs text-gray-400">{member.email}</p>
                              <p className="text-xs text-gray-400">{member.phone}</p>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => setSelectedMember(member)}
                                className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Просмотр карточки"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              {user?.role === 'SUPER_ADMIN' && (
                                <button
                                  onClick={() => handleEditMember(member)}
                                  className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 rounded-lg transition-colors"
                                  title="Редактировать"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              )}
                              {(user?.role === 'SUPER_ADMIN' || 
                                (user?.role && (user.role as string).includes('CHAIRMAN') && member.organizationId === user.organizationId)) && (
                                <button
                                  onClick={() => handleDeleteMember(member.id)}
                                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Удалить"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-400">Организация:</span>
                              <div className="text-white">
                                {member.organization ? member.organization.name : 'Неопределено'}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-400">Роль:</span>
                              <div>
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900/20 text-blue-400">
                                  {member.role === 'PRIMARY_MEMBER' ? 'Член профсоюза' : member.role}
                                </span>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-400">Дата вступления:</span>
                              <div className="text-white">
                                {approvedApplication ? new Date(approvedApplication.createdAt).toLocaleDateString('ru-RU') : 'Не указана'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Member Details Modal */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Карточка члена профсоюза
                </h3>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Личная информация */}
                <div>
                  <h4 className="font-medium mb-3 text-white">Личная информация</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><span className="font-medium text-white">ФИО:</span> {selectedMember.lastName} {selectedMember.firstName} {selectedMember.middleName}</p>
                    <p><span className="font-medium text-white">Email:</span> {selectedMember.email}</p>
                    <p><span className="font-medium text-white">Телефон:</span> {selectedMember.phone}</p>
                    <p><span className="font-medium text-white">Роль:</span> {selectedMember.role === 'PRIMARY_MEMBER' ? 'Член профсоюза' : selectedMember.role}</p>
                  </div>
                </div>

                {/* Организация */}
                <div>
                  <h4 className="font-medium mb-3 text-white">Организация</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    {selectedMember.organization ? (
                      <>
                        <p><span className="font-medium text-white">Название:</span> {selectedMember.organization.name}</p>
                        <p><span className="font-medium text-white">Тип:</span> {selectedMember.organization.type}</p>
                      </>
                    ) : (
                      <p className="text-gray-400">Организация не указана</p>
                    )}
                  </div>
                </div>

                {/* Дата вступления */}
                <div>
                  <h4 className="font-medium mb-3 text-white">Дата вступления в профсоюз</h4>
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const approvedApplication = selectedMember.membershipApplications
                        .find(app => app.status === 'APPROVED');
                      return approvedApplication ? (
                        <div>
                          <p className="text-white">{new Date(approvedApplication.createdAt).toLocaleDateString('ru-RU')}</p>
                          <p className="text-xs text-gray-400">ID заявления: {approvedApplication.id.slice(-8)}</p>
                        </div>
                      ) : (
                        <p className="text-gray-400">Не указана</p>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                {user?.role === 'SUPER_ADMIN' && (
                  <button
                    onClick={() => handleEditMember(selectedMember)}
                    className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Редактировать
                  </button>
                )}
                {(user?.role === 'SUPER_ADMIN' || 
                  (user?.role && (user.role as string).includes('CHAIRMAN') && selectedMember.organizationId === user.organizationId)) && (
                  <button
                    onClick={() => handleDeleteMember(selectedMember.id)}
                    className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Удалить
                  </button>
                )}
                <button
                  onClick={() => setSelectedMember(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Member Modal */}
        {editingMember && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Редактирование члена профсоюза
                </h3>
                <button
                  onClick={() => setEditingMember(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <EditMemberForm 
                member={editingMember} 
                onSave={handleUpdateMember}
                onCancel={() => setEditingMember(null)}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Компонент формы редактирования члена
function EditMemberForm({ 
  member, 
  onSave, 
  onCancel 
}: { 
  member: Member; 
  onSave: (data: Partial<Member>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    firstName: member.firstName,
    lastName: member.lastName,
    middleName: member.middleName || '',
    phone: member.phone,
    email: member.email,
    organizationId: member.organizationId || ''
  });
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        setLoadingOrgs(true);
        const response = await fetch('/api/organizations/list');
        const data = await response.json();
        if (data.success) {
          setOrganizations(data.organizations);
        }
      } catch (error) {
        console.error('Error loading organizations:', error);
      } finally {
        setLoadingOrgs(false);
      }
    }
    fetchOrganizations();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Фамилия *
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Имя *
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Отчество
          </label>
          <input
            type="text"
            value={formData.middleName}
            onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Телефон *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Организация
          </label>
          <select
            value={formData.organizationId}
            onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
            disabled={loadingOrgs}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white disabled:opacity-50"
          >
            <option value="">
              {loadingOrgs ? 'Загрузка организаций...' : 'Выберите организацию'}
            </option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Отмена
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Сохранить
        </button>
      </div>
    </form>
  );
}
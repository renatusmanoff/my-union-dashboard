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
  const [filters, setFilters] = useState({
    organization: '',
    status: '',
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'На рассмотрении';
      case 'APPROVED':
        return 'Принят';
      case 'REJECTED':
        return 'Отклонен';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-100 text-orange-600';
      case 'APPROVED':
        return 'bg-green-100 text-green-600';
      case 'REJECTED':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getMemberStatus = (member: Member) => {
    const latestApplication = member.membershipApplications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    if (!latestApplication) {
      return { status: 'NO_APPLICATION', label: 'Нет заявления', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' };
    }
    
    return {
      status: latestApplication.status,
      label: getStatusLabel(latestApplication.status),
      color: getStatusColor(latestApplication.status)
    };
  };

  const filteredMembers = members.filter(member => {
    const matchesOrganization = !filters.organization || 
      (member.organization && member.organization.name.toLowerCase().includes(filters.organization.toLowerCase()));
    const matchesStatus = !filters.status || getMemberStatus(member).status === filters.status;
    const matchesSearch = !filters.search || 
      `${member.lastName} ${member.firstName} ${member.middleName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
      member.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      member.phone.includes(filters.search);
    
    return matchesOrganization && matchesStatus && matchesSearch;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего членов</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{members.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Принято</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {members.filter(member => getMemberStatus(member).status === 'APPROVED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">На рассмотрении</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {members.filter(member => getMemberStatus(member).status === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Отклонено</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {members.filter(member => getMemberStatus(member).status === 'REJECTED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Статус
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Все статусы</option>
                <option value="APPROVED">Принят</option>
                <option value="PENDING">На рассмотрении</option>
                <option value="REJECTED">Отклонен</option>
                <option value="NO_APPLICATION">Нет заявления</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-400">Загрузка членов...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Член профсоюза
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Организация
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Роль
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Последнее заявление
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMembers.map((member) => {
                    const memberStatus = getMemberStatus(member);
                    const latestApplication = member.membershipApplications
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                    
                    return (
                      <tr key={member.id}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium">
                              {member.lastName} {member.firstName} {member.middleName}
                            </div>
                            <div className="text-sm text-gray-400">{member.email}</div>
                            <div className="text-sm text-gray-400">{member.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {member.organization ? (
                            <div>
                              <div className="font-medium">{member.organization.name}</div>
                              <div className="text-gray-400">{member.organization.type}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Не указана</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
                            {member.role === 'PRIMARY_MEMBER' ? 'Член профсоюза' : member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${memberStatus.color}`}>
                            {memberStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {latestApplication ? (
                            <div>
                              <div>{new Date(latestApplication.createdAt).toLocaleDateString('ru-RU')}</div>
                              <div className="text-xs text-gray-400">ID: {latestApplication.id}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Нет заявлений</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedMember(member)}
                              className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Просмотр карточки"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            {member.membershipApplications.length > 0 && (
                              <button
                                onClick={() => window.open(`/dashboard/membership-validation?member=${member.id}`, '_blank')}
                                className="p-2 text-green-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Заявления"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
              
              {filteredMembers.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-gray-400">Члены не найдены</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Member Details Modal */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
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
                  <h4 className="font-medium mb-3">Личная информация</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">ФИО:</span> {selectedMember.lastName} {selectedMember.firstName} {selectedMember.middleName}</p>
                    <p><span className="font-medium">Email:</span> {selectedMember.email}</p>
                    <p><span className="font-medium">Телефон:</span> {selectedMember.phone}</p>
                    <p><span className="font-medium">Роль:</span> {selectedMember.role === 'PRIMARY_MEMBER' ? 'Член профсоюза' : selectedMember.role}</p>
                  </div>
                </div>

                {/* Организация */}
                <div>
                  <h4 className="font-medium mb-3">Организация</h4>
                  <div className="space-y-2 text-sm">
                    {selectedMember.organization ? (
                      <>
                        <p><span className="font-medium">Название:</span> {selectedMember.organization.name}</p>
                        <p><span className="font-medium">Тип:</span> {selectedMember.organization.type}</p>
                      </>
                    ) : (
                      <p className="text-gray-400">Организация не указана</p>
                    )}
                  </div>
                </div>

                {/* Статус */}
                <div>
                  <h4 className="font-medium mb-3">Текущий статус</h4>
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const status = getMemberStatus(selectedMember);
                      return (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Заявления */}
                <div>
                  <h4 className="font-medium mb-3">Заявления на вступление</h4>
                  <div className="space-y-2 text-sm">
                    {selectedMember.membershipApplications.length > 0 ? (
                      selectedMember.membershipApplications
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((app, index) => (
                          <div key={app.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <div>
                              <p className="font-medium">Заявление #{index + 1}</p>
                              <p className="text-xs text-gray-400">{new Date(app.createdAt).toLocaleDateString('ru-RU')}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                              {getStatusLabel(app.status)}
                            </span>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-400">Нет заявлений</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                {selectedMember.membershipApplications.length > 0 && (
                  <button
                    onClick={() => {
                      window.open(`/dashboard/membership-validation?member=${selectedMember.id}`, '_blank');
                      setSelectedMember(null);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Просмотр заявлений
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
      </div>
    </DashboardLayout>
  );
}
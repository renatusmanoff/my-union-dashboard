'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Organization, OrganizationType, AdminUser, UserRole, UnionIndustry } from '@/types';
import { getRolesByOrganizationType } from '@/lib/role-config';
import { getRoleLabel } from '@/lib/role-labels';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CreateOrganizationForm {
  name: string;
  industry: UnionIndustry;
  type: OrganizationType;
  parentId: string;
  address: string;
  phone: string;
  email: string;
  chairmanName: string;
  inn: string;
}

const typeLabels = {
  FEDERAL: 'Федеральный',
  REGIONAL: 'Региональная',
  LOCAL: 'Местная',
  PRIMARY: 'Первичная'
};

const typeColors = {
  FEDERAL: 'bg-purple-500 text-white',
  REGIONAL: 'bg-blue-500 text-white',
  LOCAL: 'bg-green-500 text-white',
  PRIMARY: 'bg-orange-500 text-white'
};

const industryLabels = {
  EDUCATION: 'Образование и наука',
  HEALTHCARE: 'Здравоохранение',
  OIL_GAS: 'Нефтяная и газовая промышленность',
  METALLURGY: 'Металлургия',
  TRANSPORT: 'Транспорт',
  CONSTRUCTION: 'Строительство',
  COMMUNICATIONS: 'Связь',
  ENERGY: 'Энергетика',
  AGRICULTURE: 'Сельское хозяйство',
  TRADE: 'Торговля',
  CULTURE: 'Культура',
  SPORT: 'Спорт',
  DEFENSE: 'Оборонная промышленность',
  CHEMICAL: 'Химическая промышленность',
  TEXTILE: 'Легкая промышленность',
  FOOD: 'Пищевая промышленность',
  FORESTRY: 'Лесная промышленность',
  MINING: 'Горнодобывающая промышленность',
  MACHINE_BUILDING: 'Машиностроение',
  FINANCE: 'Финансы и банковское дело',
  PUBLIC_SERVICE: 'Государственная служба'
};

export default function OrganizationsPage() {
  const [activeTab, setActiveTab] = useState<'organizations' | 'admins'>('organizations');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [showEditAdminForm, setShowEditAdminForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<OrganizationType | ''>('');
  
  const [formData, setFormData] = useState<CreateOrganizationForm>({
    name: '',
    industry: 'EDUCATION',
    type: 'FEDERAL',
    parentId: '',
    address: '',
    phone: '',
    email: '',
    chairmanName: '',
    inn: ''
  });
  
  const [chairmanData, setChairmanData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    role: 'FEDERAL_CHAIRMAN' as UserRole
  });
  
  const [editAdminData, setEditAdminData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    role: 'FEDERAL_CHAIRMAN' as UserRole,
    organizationId: '',
    generateNewPassword: false
  });

  // Загрузка данных
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Загружаем организации
      const orgResponse = await fetch('/api/organizations');
      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        setOrganizations(orgData.organizations || []);
      }
      
      // Загружаем администраторов
      const adminResponse = await fetch('/api/admin');
      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        setAdmins(adminData.admins || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчики для организаций
  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, chairmanData })
      });

      if (response.ok) {
        alert('Организация создана успешно!');
        setShowCreateForm(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при создании организации');
    }
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;

    try {
      const response = await fetch('/api/organizations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingOrg.id, ...formData })
      });

      if (response.ok) {
        alert('Организация обновлена успешно!');
        setShowCreateForm(false);
        setEditingOrg(null);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при обновлении организации');
    }
  };

  const handleDeleteOrganization = async (org: Organization) => {
    const confirmed = window.confirm(`Вы уверены, что хотите удалить организацию "${org.name}"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/organizations?id=${org.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Организация удалена успешно!');
        fetchData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при удалении организации');
    }
  };

  // Обработчики для администраторов
  const handleEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditAdminData({
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      middleName: admin.middleName || '',
      phone: admin.phone,
      role: admin.role,
      organizationId: admin.organizationId,
      generateNewPassword: false
    });
    setShowEditAdminForm(true);
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    const confirmed = window.confirm(`Вы уверены, что хотите удалить администратора "${admin.firstName} ${admin.lastName}"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin?id=${admin.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Администратор удален успешно!');
        fetchData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при удалении администратора');
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingAdmin.id, ...editAdminData })
      });

      if (response.ok) {
        alert('Администратор обновлен успешно!');
        setShowEditAdminForm(false);
        setEditingAdmin(null);
        fetchData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при обновлении администратора');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      industry: 'EDUCATION',
      type: 'FEDERAL',
      parentId: '',
      address: '',
      phone: '',
      email: '',
      chairmanName: '',
      inn: ''
    });
    setChairmanData({
      email: '',
      firstName: '',
      lastName: '',
      middleName: '',
      phone: '',
      role: 'FEDERAL_CHAIRMAN'
    });
  };

  const cancelEdit = () => {
    setShowCreateForm(false);
    setEditingOrg(null);
    resetForm();
  };

  const cancelEditAdmin = () => {
    setShowEditAdminForm(false);
    setEditingAdmin(null);
  };

  // Фильтрация данных
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || org.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const filteredAdmins = admins.filter(admin => {
    const fullName = `${admin.firstName} ${admin.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) ||
           admin.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Загрузка...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Организации и Администраторы</h1>
            <p className="text-gray-400">Управление профсоюзными организациями и их руководителями</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Создать организацию</span>
          </button>
        </div>

        {/* Модальное окно создания/редактирования организации */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {editingOrg ? 'Редактировать организацию' : 'Создать новую организацию'}
                </h3>
                <button
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={editingOrg ? handleUpdateOrganization : handleCreateOrganization} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Название организации *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">ИНН организации</label>
                    <input
                      type="text"
                      value={formData.inn}
                      onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Тип организации *</label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as OrganizationType })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(typeLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Отрасль *</label>
                    <select
                      required
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value as UnionIndustry })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(industryLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Адрес *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Телефон</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingOrg ? 'Сохранить изменения' : 'Создать организацию'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно редактирования администратора */}
        {showEditAdminForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Редактировать администратора
                </h3>
                <button
                  onClick={cancelEditAdmin}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleUpdateAdmin} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={editAdminData.email}
                      onChange={(e) => setEditAdminData({ ...editAdminData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Телефон *</label>
                    <input
                      type="tel"
                      required
                      value={editAdminData.phone}
                      onChange={(e) => setEditAdminData({ ...editAdminData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Имя *</label>
                    <input
                      type="text"
                      required
                      value={editAdminData.firstName}
                      onChange={(e) => setEditAdminData({ ...editAdminData, firstName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Фамилия *</label>
                    <input
                      type="text"
                      required
                      value={editAdminData.lastName}
                      onChange={(e) => setEditAdminData({ ...editAdminData, lastName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Отчество</label>
                    <input
                      type="text"
                      value={editAdminData.middleName}
                      onChange={(e) => setEditAdminData({ ...editAdminData, middleName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Роль *</label>
                    <select
                      required
                      value={editAdminData.role}
                      onChange={(e) => setEditAdminData({ ...editAdminData, role: e.target.value as UserRole })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {editingAdmin && (() => {
                        const org = organizations.find(o => o.id === editingAdmin.organizationId);
                        return getRolesByOrganizationType(org?.type || 'FEDERAL').map(roleConfig => (
                          <option key={roleConfig.role} value={roleConfig.role}>
                            {roleConfig.label}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Организация *</label>
                    <select
                      required
                      value={editAdminData.organizationId}
                      onChange={(e) => setEditAdminData({ ...editAdminData, organizationId: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="generateNewPassword"
                    checked={editAdminData.generateNewPassword}
                    onChange={(e) => setEditAdminData({ ...editAdminData, generateNewPassword: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                  />
                  <label htmlFor="generateNewPassword" className="ml-2 block text-sm text-gray-300">
                    Сгенерировать новый пароль и отправить на email
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={cancelEditAdmin}
                    className="px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Сохранить изменения
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Вкладки */}
        <div className="border-b border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('organizations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'organizations'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Организации ({organizations.length})
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'admins'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Администраторы ({admins.length})
            </button>
          </nav>
        </div>

        {/* Поиск и фильтры */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder={activeTab === 'organizations' ? 'Поиск по организациям...' : 'Поиск по администраторам...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {activeTab === 'organizations' && (
            <div className="sm:w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as OrganizationType | '')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все типы</option>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Контент в зависимости от активной вкладки */}
        {activeTab === 'organizations' ? (
          /* Таблица организаций */
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Организация</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Тип</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Руководитель</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Членов</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredOrganizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <div className="font-medium text-white">{org.name}</div>
                        <div className="text-gray-400">{org.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeColors[org.type]}`}>
                        {typeLabels[org.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {admins.find(admin => admin.organizationId === org.id) ? 'Назначен' : 'Не назначен'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      0
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingOrg(org);
                            setFormData({
                              name: org.name,
                              industry: org.industry,
                              type: org.type,
                              parentId: org.parentId || '',
                              address: org.address,
                              phone: org.phone || '',
                              email: org.email || '',
                              chairmanName: '',
                              inn: org.inn || ''
                            });
                            setShowCreateForm(true);
                          }}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrganization(org)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Таблица администраторов */
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Администратор</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Роль</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Организация</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <div className="font-medium text-white">{admin.firstName} {admin.lastName}</div>
                        <div className="text-gray-400">{admin.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {getRoleLabel(admin.role)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {organizations.find(org => org.id === admin.organizationId)?.name || 'Не назначена'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {admin.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditAdmin(admin)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
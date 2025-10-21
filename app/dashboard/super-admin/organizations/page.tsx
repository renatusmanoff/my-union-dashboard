'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Organization, OrganizationType, AdminUser, UserRole, UnionIndustry } from '@/types';
import { getRolesByOrganizationType } from '@/lib/role-config';
import { getRoleLabel } from '@/lib/role-labels';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { cachedFetch, cache } from '@/lib/cache';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading] = useState(true);
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
  const [searchingINN, setSearchingINN] = useState(false);

  // Функция поиска организации по ИНН
  const searchOrganizationByINN = async (inn: string) => {
    try {
      setSearchingINN(true);
      const response = await fetch(`/api/organizations/search-inn?inn=${inn}`);
      const data = await response.json();

      if (data.success && data.organization) {
        const foundOrg = data.organization;
        setFormData(prev => ({
          ...prev,
          name: foundOrg.name,
          address: foundOrg.address
        }));
        return foundOrg;
      } else {
        return null;
      }
    } catch {
      return null;
    } finally {
      setSearchingINN(false);
    }
  };

  const fetchOrganizations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter) params.append('type', typeFilter);

      const response = await cachedFetch(`/api/organizations?${params}`, undefined, 1 * 60 * 1000); // 1 minute cache
      const data = await response.json();

      if (data.success) {
        setOrganizations(data.organizations);
      } else {
      }
    } catch {
    }
  }, [searchTerm, typeFilter]);

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetch('/api/admin', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data.success) {
        setAdmins(data.admins);
      } else {
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
    fetchAdmins();
  }, []);

  // Обновляем роль по умолчанию при изменении типа организации
  useEffect(() => {
    const defaultRole = getRolesByOrganizationType(formData.type)[0]?.role;
    if (defaultRole) {
      setChairmanData(prev => ({ ...prev, role: defaultRole }));
    }
  }, [formData.type]);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('1️⃣ Creating organization with data:', formData);
      // Сначала создаем организацию
      const orgResponse = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const orgData = await orgResponse.json();
      console.log('2️⃣ Organization created:', orgData);

      if (orgData.success) {
        console.log('3️⃣ Creating admin with data:', {
          email: chairmanData.email,
          firstName: chairmanData.firstName,
          lastName: chairmanData.lastName,
          organizationId: orgData.organization.id,
          organizationType: formData.type,
          roles: [chairmanData.role]
        });
        
        // Затем создаем администратора для этой организации
        const adminResponse = await fetch('/api/admin/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: chairmanData.email,
            firstName: chairmanData.firstName,
            lastName: chairmanData.lastName,
            middleName: chairmanData.middleName || null,
            phone: chairmanData.phone,
            organizationId: orgData.organization.id,
            organizationType: formData.type,
            organizationName: formData.name,
            roles: [chairmanData.role]
          }),
        });

        const adminData = await adminResponse.json();
        console.log('4️⃣ Admin response status:', adminResponse.status);
        console.log('5️⃣ Admin data:', adminData);

        if (adminResponse.ok || adminResponse.status === 200) {
          console.log('6️⃣ Admin created successfully');
          // Обновляем организацию с данными председателя
          const updatedOrg = {
            ...orgData.organization,
            chairmanId: adminData.admin?.id,
            chairmanName: `${chairmanData.firstName} ${chairmanData.lastName}${chairmanData.middleName ? ' ' + chairmanData.middleName : ''}`
          };
          
          console.log('7️⃣ Updated org:', updatedOrg);
          
          // Очищаем кеш организаций
          cache.clear();
          setOrganizations([...organizations, updatedOrg]);
          setAdmins([...admins, adminData.admin]);
          setShowCreateForm(false);
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
          console.log('Организация и администратор успешно созданы!');
        } else {
          console.error('8️⃣ Admin creation failed:', adminData);
          console.log(`Организация создана, но не удалось создать администратора: ${adminData.error}`);
        }
      } else {
        console.error('Organization creation failed:', orgData);
        console.log(orgData.error || 'Ошибка при создании организации');
      }
    } catch {
      console.log('Ошибка при создании организации или администратора');
    }
  };

  const handleINNSearch = async () => {
    if (formData.inn.length === 10 || formData.inn.length === 12) {
      const foundOrg = await searchOrganizationByINN(formData.inn);
      if (foundOrg) {
        // Данные автоматически заполняются в searchOrganizationByINN
        // Показываем уведомление об успешном поиске
        console.log(`Организация найдена: ${foundOrg.name}`);
      } else {
        console.log('Организация с таким ИНН не найдена. Заполните данные вручную.');
      }
    } else {
      console.log('ИНН должен содержать 10 или 12 цифр');
    }
  };

  const handleEditOrganization = (organization: Organization) => {
    setEditingOrg(organization);
    setShowCreateForm(true);
    setFormData({
      name: organization.name,
      industry: organization.industry,
      type: organization.type,
      parentId: organization.parentId || '',
      address: organization.address,
      phone: organization.phone,
      email: organization.email,
      chairmanName: organization.chairmanName || '',
      inn: ''
    });
  };

  const handleDeleteOrganization = async (organization: Organization) => {
    if (!confirm(`Вы уверены, что хотите удалить организацию "${organization.name}"?`)) {
      return;
    }

    try {
      console.log('🗑️ Deleting organization:', organization.id);
      
      // Сначала удаляем администратора/председателя если он существует
      if (organization.chairmanId) {
        console.log('  Removing admin first:', organization.chairmanId);
        await fetch(`/api/admin?id=${organization.chairmanId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      // Теперь удаляем организацию
      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Organization deleted successfully');
        console.log('Организация успешно удалена');
        // Очищаем кеш организаций перед обновлением
        cache.clear();
        setOrganizations(organizations.filter(org => org.id !== organization.id));
      } else {
        console.log(data.error || 'Ошибка при удалении организации');
      }
    } catch {
      console.log('Ошибка при удалении организации');
    }
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;

    try {
      const response = await fetch(`/api/organizations/${editingOrg.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Организация успешно обновлена');
        setEditingOrg(null);
        setShowCreateForm(false);
        // Очищаем кеш организаций перед обновлением
        cache.clear();
        fetchOrganizations(); // Обновляем список
      } else {
        console.log(data.error || 'Ошибка при обновлении организации');
      }
    } catch {
      console.log('Ошибка при обновлении организации');
    }
  };

  const cancelEdit = () => {
    setEditingOrg(null);
    setShowCreateForm(false);
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

  // Функции для работы с администраторами
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
    if (!confirmed) {
      return;
    }

    try {
      console.log('🗑️ Deleting admin:', admin.id);
      const response = await fetch(`/api/admin?id=${admin.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Admin deleted');
        // Удаляем администратора из локального состояния
        setAdmins(admins.filter(a => a.id !== admin.id));
        
        // Обновляем организацию, если этот админ был назначен
        if (admin.organizationId) {
          console.log('  Updating organization to remove chairman');
          setOrganizations(organizations.map(org => 
            org.id === admin.organizationId 
              ? { ...org, chairmanName: undefined, chairmanId: undefined }
              : org
          ));
        }
        
        console.log('Администратор успешно удален');
        cache.clear();
      } else {
        console.error('❌ Error deleting admin:', data.error);
        alert(`Ошибка при удалении администратора: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Error deleting admin:', error);
      alert('Произошла ошибка при удалении администратора');
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    try {
      console.log('✏️ Updating admin:', editingAdmin.id);
      console.log('   Data:', editAdminData);
      
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingAdmin.id,
          ...editAdminData
        }),
      });

      const data = await response.json();
      console.log('   Response status:', response.status);
      console.log('   Response data:', data);

      if (response.ok) {
        console.log('✅ Admin updated');
        // Обновляем администратора в локальном состоянии
        setAdmins(admins.map(a => 
          a.id === editingAdmin.id 
            ? {
                ...a,
                ...editAdminData,
                role: editAdminData.role
              }
            : a
        ));
        
        setEditingAdmin(null);
        setShowEditAdminForm(false);
        console.log(data.message || 'Администратор успешно обновлен');
        cache.clear();
      } else {
        console.error('❌ Error updating admin:', data.error);
        alert(`Ошибка при обновлении администратора: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Error updating admin:', error);
      alert('Произошла ошибка при обновлении администратора');
    }
  };

  const cancelEditAdmin = () => {
    setEditingAdmin(null);
    setShowEditAdminForm(false);
    setEditAdminData({
      email: '',
      firstName: '',
      lastName: '',
      middleName: '',
      phone: '',
      role: 'FEDERAL_CHAIRMAN',
      organizationId: '',
      generateNewPassword: false
    });
  };

  // Фильтрация организаций для выбора родительской
  const getParentOptions = () => {
    if (formData.type === 'FEDERAL') return [];
    if (formData.type === 'REGIONAL') {
      return organizations.filter(org => org.type === 'FEDERAL');
    }
    if (formData.type === 'LOCAL') {
      return organizations.filter(org => org.type === 'REGIONAL');
    }
    if (formData.type === 'PRIMARY') {
      return organizations.filter(org => org.type === 'LOCAL');
    }
    return [];
  };

  return (
    <DashboardLayout userRole="SUPER_ADMIN">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Организации и Администраторы</h1>
              <p className="text-gray-400 mt-2">Управление профсоюзными организациями и их администраторами</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Создать организацию
              </button>
            </div>
          </div>

        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('organizations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'organizations'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              Организации ({organizations.length})
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'admins'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              Администраторы ({admins.length})
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={activeTab === 'organizations' ? "Поиск по организациям..." : "Поиск по администраторам..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {activeTab === 'organizations' && (
              <div className="sm:w-48">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as OrganizationType | '')}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Все типы</option>
                  <option value="FEDERAL">Федеральный</option>
                  <option value="REGIONAL">Региональная</option>
                  <option value="LOCAL">Местная</option>
                  <option value="PRIMARY">Первичная</option>
                </select>
              </div>
            )}
          </div>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingOrg ? 'Редактировать организацию' : 'Создать новую организацию'}
              </h3>
              <form onSubmit={editingOrg ? handleUpdateOrganization : handleCreateOrganization} className="space-y-6">
                {/* Organization Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">ИНН организации</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.inn}
                        onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                        placeholder="Введите ИНН (10 или 12 цифр)"
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleINNSearch}
                        disabled={searchingINN}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {searchingINN ? 'Поиск...' : 'Найти'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Отрасль профсоюза *</label>
                    <select
                      required
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value as UnionIndustry })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(industryLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Тип организации *</label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as OrganizationType })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="FEDERAL">Федеральный уровень</option>
                      <option value="REGIONAL">Региональный уровень</option>
                      <option value="LOCAL">Местный уровень</option>
                      <option value="PRIMARY">Первичная организация</option>
                    </select>
                  </div>
                  {formData.type !== 'FEDERAL' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Родительская организация</label>
                      <select
                        value={formData.parentId}
                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Выберите родительскую организацию</option>
                        {getParentOptions().map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Телефон *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Chairman Data - Only for creating new organization */}
                {!editingOrg && (
                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold mb-4">Данные администратора организации</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email администратора *</label>
                      <input
                        type="email"
                        required
                        value={chairmanData.email}
                        onChange={(e) => setChairmanData({ ...chairmanData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Телефон администратора *</label>
                      <input
                        type="tel"
                        required
                        value={chairmanData.phone}
                        onChange={(e) => setChairmanData({ ...chairmanData, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Имя *</label>
                      <input
                        type="text"
                        required
                        value={chairmanData.firstName}
                        onChange={(e) => setChairmanData({ ...chairmanData, firstName: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Фамилия *</label>
                      <input
                        type="text"
                        required
                        value={chairmanData.lastName}
                        onChange={(e) => setChairmanData({ ...chairmanData, lastName: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Отчество</label>
                      <input
                        type="text"
                        value={chairmanData.middleName}
                        onChange={(e) => setChairmanData({ ...chairmanData, middleName: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Роль *</label>
                      <select
                        required
                        value={chairmanData.role}
                        onChange={(e) => setChairmanData({ ...chairmanData, role: e.target.value as UserRole })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {getRolesByOrganizationType(formData.type).map((roleConfig) => (
                          <option key={roleConfig.role} value={roleConfig.role}>
                            {roleConfig.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingOrg ? 'Сохранить изменения' : 'Создать организацию'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Форма редактирования администратора */}
          {showEditAdminForm && (
            <div className="card p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                Редактировать администратора
              </h3>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Роль *</label>
                    <select
                      required
                      value={editAdminData.role}
                      onChange={(e) => setEditAdminData({ ...editAdminData, role: e.target.value as UserRole })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="FEDERAL_CHAIRMAN">{getRoleLabel('FEDERAL_CHAIRMAN')}</option>
                      <option value="REGIONAL_CHAIRMAN">{getRoleLabel('REGIONAL_CHAIRMAN')}</option>
                      <option value="LOCAL_CHAIRMAN">{getRoleLabel('LOCAL_CHAIRMAN')}</option>
                      <option value="PRIMARY_CHAIRMAN">{getRoleLabel('PRIMARY_CHAIRMAN')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Организация *</label>
                    <select
                      required
                      value={editAdminData.organizationId}
                      onChange={(e) => setEditAdminData({ ...editAdminData, organizationId: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editAdminData.generateNewPassword}
                        onChange={(e) => setEditAdminData({ ...editAdminData, generateNewPassword: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Сгенерировать новый пароль и отправить на email</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Сохранить изменения
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditAdmin}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Content based on active tab */}
          {activeTab === 'organizations' ? (
            /* Organizations Table */
            <div className="overflow-x-auto">
                <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Организация</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Тип</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Администратор</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Членов</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                    {organizations.map((org) => (
                      <tr key={org.id} className="hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{org.name}</div>
                            <div className="text-sm text-gray-400">{org.address}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[org.type]}`}>
                            {typeLabels[org.type]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {org.chairmanName || 'Не назначен'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {org.membersCount?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditOrganization(org)}
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
            </div>
          ) : (
            /* Admins Table */
            <div className="overflow-x-auto">
                <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
                  <table className="w-full">
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
                    {admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{admin.firstName} {admin.lastName}</div>
                            <div className="text-sm text-gray-400">{admin.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-600 text-white">
                            {getRoleLabel(admin.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {admin.organizationName}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            admin.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {admin.isActive ? 'Активен' : 'Неактивен'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Edit button clicked for admin:', admin.id);
                                handleEditAdmin(admin);
                              }}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded-lg transition-colors"
                              title="Редактировать"
                              type="button"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Delete button clicked for admin:', admin.id);
                                handleDeleteAdmin(admin);
                              }}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors"
                              title="Удалить"
                              type="button"
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
            </div>
          )}
      </div>
    </DashboardLayout>
  );
}

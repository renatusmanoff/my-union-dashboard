'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Organization, OrganizationType, AdminUser, UserRole } from '@/types';
import { getRolesByOrganizationType } from '@/lib/role-config';

interface CreateOrganizationForm {
  name: string;
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
  FEDERAL: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  REGIONAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  LOCAL: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  PRIMARY: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
};

export default function OrganizationsPage() {
  const [activeTab, setActiveTab] = useState<'organizations' | 'admins'>('organizations');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<OrganizationType | ''>('');
  const [formData, setFormData] = useState<CreateOrganizationForm>({
    name: '',
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

  // Функция поиска организации по ИНН
  const searchOrganizationByINN = async (inn: string) => {
    try {
      // Здесь будет реальный API запрос к сервису поиска организаций
      // Пока используем моковые данные
      const mockOrganizations = [
        {
          name: 'ПАО "Газпром"',
          inn: '7736050003',
          address: 'г. Москва, ул. Наметкина, д. 16',
          ogrn: '1027700070518'
        },
        {
          name: 'ПАО "Роснефть"',
          inn: '7706107510',
          address: 'г. Москва, ул. Софийская набережная, д. 26/1',
          ogrn: '1027739850962'
        },
        {
          name: 'ПАО "Сбербанк"',
          inn: '7707083893',
          address: 'г. Москва, ул. Вавилова, д. 19',
          ogrn: '1027700132195'
        },
        {
          name: 'ПАО "Лукойл"',
          inn: '7708004767',
          address: 'г. Москва, ул. Сретенка, д. 11',
          ogrn: '1027700035769'
        }
      ];

      const foundOrg = mockOrganizations.find(org => org.inn === inn);
      if (foundOrg) {
        setFormData(prev => ({
          ...prev,
          name: foundOrg.name,
          address: foundOrg.address
        }));
        return foundOrg;
      }
      return null;
    } catch (error) {
      console.error('Error searching organization by INN:', error);
      return null;
    }
  };

  const fetchOrganizations = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter) params.append('type', typeFilter);

      const response = await fetch(`/api/organizations?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrganizations(data.organizations);
      } else {
        console.error('Error fetching organizations:', data.error);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, typeFilter]);

  const fetchAdmins = useCallback(async () => {
    try {
      // Здесь будут реальные API запросы
      const mockAdmins: AdminUser[] = [
        {
          id: 'admin-1',
          email: 'chairman@fnpr.ru',
          firstName: 'Михаил',
          lastName: 'Шмаков',
          middleName: 'Викторович',
          phone: '+7 (495) 623-45-67',
          role: 'FEDERAL_CHAIRMAN',
          organizationId: 'org-federal-1',
          organizationName: 'Федерация независимых профсоюзов России (ФНПР)',
          isActive: true,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'admin-2',
          email: 'chairman@education-union.ru',
          firstName: 'Галина',
          lastName: 'Меркулова',
          middleName: 'Ивановна',
          phone: '+7 (495) 234-56-78',
          role: 'FEDERAL_CHAIRMAN',
          organizationId: 'org-federal-2',
          organizationName: 'Профсоюз работников образования и науки РФ',
          isActive: true,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setAdmins(mockAdmins);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
    fetchAdmins();
  }, [fetchOrganizations, fetchAdmins]);

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
      // Сначала создаем организацию
      const orgResponse = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const orgData = await orgResponse.json();

      if (orgData.success) {
        // Затем создаем администратора для этой организации
        const adminResponse = await fetch('/api/admin/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...chairmanData,
            organizationId: orgData.organization.id,
            organizationType: formData.type,
            organizationName: formData.name,
            roles: [chairmanData.role]
          }),
        });

        const adminData = await adminResponse.json();

        if (adminResponse.ok) {
          setOrganizations([...organizations, orgData.organization]);
          setAdmins([...admins, adminData.admin]);
          setShowCreateForm(false);
          setFormData({
            name: '',
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
          alert('Организация и администратор успешно созданы!');
        } else {
          alert(`Организация создана, но не удалось создать администратора: ${adminData.error}`);
        }
      } else {
        alert(orgData.error || 'Ошибка при создании организации');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('Ошибка при создании организации');
    }
  };

  const handleINNSearch = async () => {
    if (formData.inn.length === 10 || formData.inn.length === 12) {
      const foundOrg = await searchOrganizationByINN(formData.inn);
      if (foundOrg) {
        alert(`Организация найдена: ${foundOrg.name}`);
      } else {
        alert('Организация с таким ИНН не найдена. Заполните данные вручную.');
      }
    } else {
      alert('ИНН должен содержать 10 или 12 цифр');
    }
  };

  const cancelEdit = () => {
    setEditingOrg(null);
    setShowCreateForm(false);
    setFormData({
      name: '',
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
      <div className="p-6" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Организации и Администраторы</h1>
              <p className="text-gray-400">Управление профсоюзными организациями и их руководителями</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Создать организацию
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('organizations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'organizations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Организации ({organizations.length})
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'admins'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Администраторы ({admins.length})
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="card p-6 rounded-lg">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder={activeTab === 'organizations' ? "Поиск по организациям..." : "Поиск по администраторам..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                />
              </div>
              {activeTab === 'organizations' && (
                <div className="min-w-48">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as OrganizationType | '')}
                    className="w-full px-4 py-2 rounded-lg"
                    style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
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
            <div className="card p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {editingOrg ? 'Редактировать организацию' : 'Создать новую организацию'}
              </h3>
              <form onSubmit={handleCreateOrganization} className="space-y-6">
                {/* Organization Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ИНН организации</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.inn}
                        onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                        placeholder="Введите ИНН (10 или 12 цифр)"
                        className="flex-1 px-3 py-2 rounded-lg"
                        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                      />
                      <button
                        type="button"
                        onClick={handleINNSearch}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Найти
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Название организации *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Тип организации *</label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as OrganizationType })}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                    >
                      <option value="FEDERAL">Федеральный уровень</option>
                      <option value="REGIONAL">Региональный уровень</option>
                      <option value="LOCAL">Местный уровень</option>
                      <option value="PRIMARY">Первичная организация</option>
                    </select>
                  </div>
                  {formData.type !== 'FEDERAL' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Родительская организация</label>
                      <select
                        value={formData.parentId}
                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg"
                        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
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
                    <label className="block text-sm font-medium mb-2">Адрес *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Телефон *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>

                {/* Chairman Data */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold mb-4">Данные руководителя организации</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email руководителя *</label>
                      <input
                        type="email"
                        required
                        value={chairmanData.email}
                        onChange={(e) => setChairmanData({ ...chairmanData, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg"
                        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Телефон руководителя *</label>
                      <input
                        type="tel"
                        required
                        value={chairmanData.phone}
                        onChange={(e) => setChairmanData({ ...chairmanData, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg"
                        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Имя *</label>
                      <input
                        type="text"
                        required
                        value={chairmanData.firstName}
                        onChange={(e) => setChairmanData({ ...chairmanData, firstName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg"
                        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Фамилия *</label>
                      <input
                        type="text"
                        required
                        value={chairmanData.lastName}
                        onChange={(e) => setChairmanData({ ...chairmanData, lastName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg"
                        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Отчество</label>
                      <input
                        type="text"
                        value={chairmanData.middleName}
                        onChange={(e) => setChairmanData({ ...chairmanData, middleName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg"
                        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Роль *</label>
                      <select
                        required
                        value={chairmanData.role}
                        onChange={(e) => setChairmanData({ ...chairmanData, role: e.target.value as UserRole })}
                        className="w-full px-3 py-2 rounded-lg"
                        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
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

          {/* Content based on active tab */}
          {activeTab === 'organizations' ? (
            /* Organizations Table */
            <div className="card rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Организация</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Тип</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Руководитель</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Членов</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
                    {organizations.map((org) => (
                      <tr key={org.id}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium">{org.name}</div>
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
                            <button className="text-blue-400 hover:text-blue-600">Редактировать</button>
                            <button className="text-red-400 hover:text-red-600">Удалить</button>
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
            <div className="card rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Администратор</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Роль</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Организация</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Статус</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
                    {admins.map((admin) => (
                      <tr key={admin.id}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium">{admin.firstName} {admin.lastName}</div>
                            <div className="text-sm text-gray-400">{admin.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {admin.organizationName}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {admin.isActive ? 'Активен' : 'Неактивен'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <button className="text-blue-400 hover:text-blue-600">Редактировать</button>
                            <button className="text-red-400 hover:text-red-600">Деактивировать</button>
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
      </div>
    </DashboardLayout>
  );
}

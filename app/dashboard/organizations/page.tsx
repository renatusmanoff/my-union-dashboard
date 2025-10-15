'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Organization, OrganizationType } from '@/types';

interface CreateOrganizationForm {
  name: string;
  type: OrganizationType;
  parentId: string;
  address: string;
  phone: string;
  email: string;
  chairmanName: string;
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
  const [organizations, setOrganizations] = useState<Organization[]>([]);
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
    chairmanName: ''
  });

  useEffect(() => {
    fetchOrganizations();
  }, [searchTerm, typeFilter]);

  const fetchOrganizations = async () => {
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
        alert(data.error || 'Ошибка при загрузке организаций');
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      alert('Ошибка при загрузке организаций');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Организация успешно создана!');
        setShowCreateForm(false);
        setFormData({
          name: '',
          type: 'FEDERAL',
          parentId: '',
          address: '',
          phone: '',
          email: '',
          chairmanName: ''
        });
        fetchOrganizations();
      } else {
        alert(data.error || 'Ошибка при создании организации');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('Ошибка при создании организации');
    }
  };

  const handleEditOrganization = async (e: React.FormEvent) => {
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

      if (data.success) {
        alert('Организация успешно обновлена!');
        setEditingOrg(null);
        setFormData({
          name: '',
          type: 'FEDERAL',
          parentId: '',
          address: '',
          phone: '',
          email: '',
          chairmanName: ''
        });
        fetchOrganizations();
      } else {
        alert(data.error || 'Ошибка при обновлении организации');
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      alert('Ошибка при обновлении организации');
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту организацию?')) {
      return;
    }

    try {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Организация успешно удалена!');
        fetchOrganizations();
      } else {
        alert(data.error || 'Ошибка при удалении организации');
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      alert('Ошибка при удалении организации');
    }
  };

  const startEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      type: org.type,
      parentId: org.parentId || '',
      address: org.address,
      phone: org.phone,
      email: org.email,
      chairmanName: org.chairmanName || ''
    });
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
      chairmanName: ''
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
              <h1 className="text-2xl font-bold mb-2">Организации</h1>
              <p className="text-gray-400">Управление профсоюзными организациями</p>
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

          {/* Filters */}
          <div className="card p-6 rounded-lg">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="Поиск по организациям..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchOrganizations()}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                />
              </div>
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as OrganizationType | '')}
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
              >
                <option value="">Все типы</option>
                <option value="FEDERAL">Федеральный</option>
                <option value="REGIONAL">Региональная</option>
                <option value="LOCAL">Местная</option>
                <option value="PRIMARY">Первичная</option>
              </select>
              <button
                onClick={fetchOrganizations}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Поиск
              </button>
            </div>
          </div>

          {/* Create/Edit Form */}
          {(showCreateForm || editingOrg) && (
            <div className="card p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {editingOrg ? 'Редактировать организацию' : 'Создать новую организацию'}
              </h3>
              <form onSubmit={editingOrg ? handleEditOrganization : handleCreateOrganization} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Название организации *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Тип организации *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as OrganizationType, parentId: '' })}
                      required
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                    >
                      <option value="FEDERAL">Федеральный</option>
                      <option value="REGIONAL">Региональная</option>
                      <option value="LOCAL">Местная</option>
                      <option value="PRIMARY">Первичная</option>
                    </select>
                  </div>
                  {getParentOptions().length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Родительская организация</label>
                      <select
                        value={formData.parentId}
                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg"
                        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                      >
                        <option value="">Выберите родительскую организацию</option>
                        {getParentOptions().map(org => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-2">Председатель</label>
                    <input
                      type="text"
                      value={formData.chairmanName}
                      onChange={(e) => setFormData({ ...formData, chairmanName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Адрес *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Телефон *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
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

          {/* Organizations Table */}
          <div className="card overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-400">Загрузка организаций...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Организация
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Тип
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Руководитель
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Члены
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Контакты
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {organizations.map((org) => (
                      <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {org.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {org.address}
                            </div>
                            {org.parentName && (
                              <div className="text-xs text-gray-400">
                                Родительская: {org.parentName}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeColors[org.type]}`}>
                            {typeLabels[org.type]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {org.chairmanName || 'Не назначен'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {org.membersCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            <div>{org.phone}</div>
                            <div className="text-gray-500 dark:text-gray-400">{org.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => startEdit(org)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Редактировать"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button 
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Просмотр"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteOrganization(org.id)}
                              className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
                              title="Удалить"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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

          {/* Pagination */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Показано {organizations.length} организаций
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={fetchOrganizations}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Обновить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { AdminUser, OrganizationType, UserRole } from '@/types';
import { getRolesByOrganizationType } from '@/lib/role-config';

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    role: 'FEDERAL_CHAIRMAN' as UserRole,
    organizationId: 'org-1',
    organizationType: 'FEDERAL' as OrganizationType
  });
  const [availableOrganizations, setAvailableOrganizations] = useState<Array<{id: string, name: string, type: OrganizationType}>>([]);
  const [testEmail, setTestEmail] = useState('');
  const [isTestingSMTP, setIsTestingSMTP] = useState(false);

  useEffect(() => {
    fetchAdmins();
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      // Моковые организации для выбора
      const mockOrgs = [
        { id: 'org-1', name: 'Центральный комитет профсоюза', type: 'FEDERAL' as OrganizationType },
        { id: 'org-2', name: 'Московская региональная организация', type: 'REGIONAL' as OrganizationType },
        { id: 'org-3', name: 'Санкт-Петербургская региональная организация', type: 'REGIONAL' as OrganizationType },
        { id: 'org-4', name: 'Местная организация г. Москвы', type: 'LOCAL' as OrganizationType },
        { id: 'org-5', name: 'Первичная организация ООО "Рога и копыта"', type: 'PRIMARY' as OrganizationType }
      ];
      setAvailableOrganizations(mockOrgs);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      // Здесь будут реальные API запросы
      const mockAdmins: AdminUser[] = [
        {
          id: 'admin-1',
          email: 'federal@example.com',
          firstName: 'Иван',
          lastName: 'Иванов',
          middleName: 'Петрович',
          phone: '+7 (495) 123-45-67',
          role: 'FEDERAL_CHAIRMAN',
          organizationId: 'org-1',
          organizationName: 'Федеральная организация',
          isActive: true,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'admin-2',
          email: 'regional@example.com',
          firstName: 'Мария',
          lastName: 'Петрова',
          middleName: 'Ивановна',
          phone: '+7 (495) 234-56-78',
          role: 'REGIONAL_CHAIRMAN',
          organizationId: 'org-2',
          organizationName: 'Региональная организация Москвы',
          isActive: true,
          emailVerified: false,
          temporaryPassword: 'TempPass123!',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setAdmins(mockAdmins);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setAdmins([...admins, data.admin]);
        setShowCreateForm(false);
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          middleName: '',
          phone: '',
          role: 'FEDERAL_CHAIRMAN',
          organizationId: 'org-1',
          organizationType: 'FEDERAL'
        });
        if (data.emailSent) {
          alert('Администратор создан и учетные данные отправлены на email!');
        } else {
          alert(`Администратор создан, но не удалось отправить email. Временный пароль: ${data.temporaryPassword}`);
        }
      } else {
        alert(data.error || 'Ошибка при создании администратора');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Ошибка при создании администратора');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminStatus = async (adminId: string, isActive: boolean) => {
    try {
      // Здесь будет API запрос для изменения статуса
      setAdmins(admins.map(admin => 
        admin.id === adminId ? { ...admin, isActive: !isActive } : admin
      ));
    } catch (error) {
      console.error('Error updating admin status:', error);
    }
  };

  const testSMTP = async () => {
    if (!testEmail) {
      alert('Введите email для тестирования');
      return;
    }

    setIsTestingSMTP(true);
    try {
      const response = await fetch('/api/admin/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
      } else {
        alert(data.error || 'Ошибка при тестировании SMTP');
      }
    } catch (error) {
      console.error('Error testing SMTP:', error);
      alert('Ошибка при тестировании SMTP');
    } finally {
      setIsTestingSMTP(false);
    }
  };

  return (
    <DashboardLayout userRole="SUPER_ADMIN">
      <div className="p-6" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Управление администраторами</h1>
            <p className="text-gray-400">Создание и управление администраторами организаций</p>
          </div>
          <div className="flex space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="email"
                placeholder="Email для тестирования SMTP"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
              />
              <button
                onClick={testSMTP}
                disabled={isTestingSMTP}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
              >
                {isTestingSMTP ? 'Тестирование...' : 'Тест SMTP'}
              </button>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Создать администратора
            </button>
          </div>
        </div>

        {/* Форма создания администратора */}
        {showCreateForm && (
          <div className="card p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-4">Создать нового администратора</h3>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium mb-2">Имя *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Фамилия *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Отчество</label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Организация *</label>
                  <select
                    required
                    value={formData.organizationId}
                    onChange={(e) => {
                      const selectedOrg = availableOrganizations.find(org => org.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        organizationId: e.target.value,
                        organizationType: selectedOrg?.type || 'FEDERAL',
                        role: getRolesByOrganizationType(selectedOrg?.type || 'FEDERAL')[0]?.role || 'FEDERAL_CHAIRMAN'
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                  >
                    <option value="">Выберите организацию</option>
                    {availableOrganizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Роль *</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                  >
                    {getRolesByOrganizationType(formData.organizationType).map((roleConfig) => (
                      <option key={roleConfig.role} value={roleConfig.role}>
                        {roleConfig.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Создание...' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Список администраторов */}
        <div className="card rounded-lg overflow-hidden">
          <div className="p-6 border-b" style={{ borderColor: 'var(--card-border)' }}>
            <h3 className="text-lg font-semibold">Список администраторов</h3>
          </div>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium">{admin.firstName} {admin.lastName}</div>
                        <div className="text-sm text-gray-400">{admin.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {admin.organizationName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleAdminStatus(admin.id, admin.isActive)}
                        className={`px-3 py-1 text-xs rounded ${
                          admin.isActive 
                            ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {admin.isActive ? 'Деактивировать' : 'Активировать'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

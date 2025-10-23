'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DatePicker from '@/components/DatePicker';
import { Organization, OrganizationType, AdminUser, UserRole } from '@/types';
import { getRolesByOrganizationType } from '@/lib/role-config';
import { getRoleLabel } from '@/lib/role-labels';
import { PencilIcon, TrashIcon, PlusIcon, ChevronRightIcon, ChevronDownIcon, BuildingOfficeIcon, UserGroupIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import PermissionGate from '@/components/PermissionGate';

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

interface AdminFormData {
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  phone: string;
  birthDate: string; // Дата рождения в формате YYYY-MM-DD
  role: UserRole;
  organizationId: string;
  generateNewPassword: boolean;
}

const typeLabels = {
  REGIONAL: 'Региональная',
  LOCAL: 'Местная',
  PRIMARY: 'Первичная'
};

const typeColors = {
  REGIONAL: 'bg-blue-600 text-white',
  LOCAL: 'bg-green-600 text-white',
  PRIMARY: 'bg-orange-600 text-white'
};

// Компонент для отображения иерархии организаций
function OrganizationTree({ 
  organizations, 
  onEdit, 
  onDelete, 
  level = 0,
  parentId = null
}: { 
  organizations: Organization[], 
  onEdit: (org: Organization) => void, 
  onDelete: (org: Organization) => void,
  level?: number,
  parentId?: string | null
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpanded = (orgId: string) => {
    setExpanded(prev => ({ ...prev, [orgId]: !prev[orgId] }));
  };

  const filteredOrgs = organizations.filter(org => org.parentId === parentId);

  if (filteredOrgs.length === 0) return null;

  return (
    <div className="space-y-2">
      {filteredOrgs.map((org) => {
        const children = organizations.filter(o => o.parentId === org.id);
        const hasChildren = children.length > 0;
        const isExpanded = expanded[org.id];
        
        return (
          <div key={org.id} className={`${level > 0 ? 'ml-8' : ''}`}>
            <div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors">
              <div className="flex items-center space-x-4 flex-1">
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpanded(org.id)}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="w-5 h-5" />
                    ) : (
                      <ChevronRightIcon className="w-5 h-5" />
                    )}
                  </button>
                ) : (
                  <div className="w-7" />
                )}
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${typeColors[org.type]}`}>
                      {typeLabels[org.type]}
                    </span>
                    {org.isMain && (
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-600 text-white">
                        Главная
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-medium text-lg mb-1">{org.name}</h3>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>📍 {org.address}</p>
                    <p>📧 {org.email} • 📞 {org.phone}</p>
                    {org.inn && <p>🏢 ИНН: {org.inn}</p>}
                    {org.chairmanName && <p>👤 Председатель: {org.chairmanName}</p>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(org)}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Редактировать"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                {!org.isMain && (
                  <button
                    onClick={() => onDelete(org)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Удалить"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            
            {hasChildren && isExpanded && (
              <OrganizationTree
                organizations={organizations}
                onEdit={onEdit}
                onDelete={onDelete}
                level={level + 1}
                parentId={org.id}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrganizationsPage() {
  const [activeTab, setActiveTab] = useState<'organizations' | 'admins' | 'employees' | 'roles'>('organizations');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<OrganizationType | ''>('');
  
  const [formData, setFormData] = useState<CreateOrganizationForm>({
    name: '',
    type: 'REGIONAL',
    parentId: '',
    address: '',
    phone: '',
    email: '',
    chairmanName: '',
    inn: ''
  });
  
  const [adminFormData, setAdminFormData] = useState<AdminFormData>({
    email: '',
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    role: 'REGIONAL_CHAIRMAN',
    organizationId: '',
    generateNewPassword: false
  });

  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const [employeeFormData, setEmployeeFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    birthDate: '', // Дата рождения в формате YYYY-MM-DD
    roleId: '', // Теперь используем ID роли
    organizationId: '',
    isActive: true
  });

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [orgResponse, adminResponse, rolesResponse, permissionsResponse, employeesResponse] = await Promise.all([
        fetch('/api/organizations'),
        fetch('/api/admin'),
        fetch('/api/roles'),
        fetch('/api/permissions'),
        fetch('/api/employees')
      ]);

      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        setOrganizations(orgData.organizations || []);
      }

      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        setAdmins(adminData.admins || []);
      }

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setRoles(rolesData.roles || []);
      }

      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        setPermissions(permissionsData.permissions || []);
      }

      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData.employees || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Создание организации
  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Организация создана успешно!');
        setShowCreateOrgModal(false);
        resetOrgForm();
        loadData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при создании организации');
    }
  };

  // Редактирование организации
  const handleEditOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;

    try {
      const response = await fetch(`/api/organizations/${editingOrg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Организация обновлена успешно!');
        setEditingOrg(null);
        resetOrgForm();
        loadData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при обновлении организации');
    }
  };

  // Удаление организации
  const handleDeleteOrganization = async (org: Organization) => {
    if (org.isMain) {
      alert('Главную организацию нельзя удалить!');
      return;
    }

    if (!window.confirm(`Удалить организацию "${org.name}"?`)) return;

    try {
      const response = await fetch(`/api/organizations/${org.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Организация удалена успешно!');
        loadData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при удалении организации');
    }
  };

  // Создание администратора
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminFormData)
      });

      if (response.ok) {
        alert('Администратор создан успешно!');
        setShowCreateAdminModal(false);
        resetAdminForm();
        loadData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при создании администратора');
    }
  };

  // Редактирование администратора
  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    try {
      const response = await fetch(`/api/admin/${editingAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminFormData)
      });

      if (response.ok) {
        alert('Администратор обновлен успешно!');
        setEditingAdmin(null);
        resetAdminForm();
        loadData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при обновлении администратора');
    }
  };

  // Удаление администратора
  const handleDeleteAdmin = async (admin: AdminUser) => {
    if (!window.confirm(`Удалить администратора "${admin.firstName} ${admin.lastName}"?`)) return;

    try {
      const response = await fetch(`/api/admin/${admin.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Администратор удален успешно!');
        loadData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при удалении администратора');
    }
  };

  // Сброс форм
  const resetOrgForm = () => {
    setFormData({
      name: '',
      type: 'REGIONAL',
      parentId: '',
      address: '',
      phone: '',
      email: '',
      chairmanName: '',
      inn: ''
    });
  };

  const resetAdminForm = () => {
    setAdminFormData({
      email: '',
      firstName: '',
      lastName: '',
      middleName: '',
      phone: '',
      birthDate: '',
      role: 'REGIONAL_CHAIRMAN',
      organizationId: '',
      generateNewPassword: false
    });
  };

  const resetRoleForm = () => {
    setRoleFormData({
      name: '',
      description: '',
      permissions: []
    });
    setEditingRole(null);
    setShowCreateRoleModal(false);
  };

  const resetEmployeeForm = () => {
    setEmployeeFormData({
      email: '',
      firstName: '',
      lastName: '',
      middleName: '',
      phone: '',
      birthDate: '',
      roleId: '',
      organizationId: '',
      isActive: true
    });
    setEditingEmployee(null);
    setShowCreateEmployeeModal(false);
  };

  // Начало редактирования
  const startEditOrg = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      type: org.type,
      parentId: org.parentId || '',
      address: org.address,
      phone: org.phone,
      email: org.email,
      chairmanName: org.chairmanName || '',
      inn: org.inn || ''
    });
  };

  const startEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setAdminFormData({
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      middleName: admin.middleName || '',
      phone: admin.phone,
      birthDate: admin.birthDate ? new Date(admin.birthDate).toISOString().split('T')[0] : '',
      role: admin.role,
      organizationId: admin.organizationId || '',
      generateNewPassword: false
    });
  };

  // Создание роли
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleFormData)
      });

      if (response.ok) {
        alert('Роль создана успешно!');
        resetRoleForm();
        loadData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при создании роли');
    }
  };

  // Редактирование роли
  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    try {
      const response = await fetch(`/api/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleFormData)
      });

      if (response.ok) {
        alert('Роль обновлена успешно!');
        resetRoleForm();
        loadData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при обновлении роли');
    }
  };

  // Удаление роли
  const handleDeleteRole = async (role: any) => {
    if (!window.confirm(`Удалить роль "${role.name}"?`)) return;

    try {
      const response = await fetch(`/api/roles/${role.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Роль удалена успешно!');
        loadData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при удалении роли');
    }
  };

  // Начало редактирования роли
  const startEditRole = (role: any) => {
    setEditingRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description || '',
      permissions: Array.isArray(role.permissions) ? role.permissions : []
    });
    setShowCreateRoleModal(true);
  };

  // Создание сотрудника
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeFormData)
      });

      if (response.ok) {
        const data = await response.json();
        alert('Сотрудник создан успешно!');
        if (data.password) {
          alert(`Временный пароль: ${data.password}`);
        }
        resetEmployeeForm();
        loadData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при создании сотрудника');
    }
  };

  // Редактирование сотрудника
  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    try {
      const response = await fetch(`/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeFormData)
      });

      if (response.ok) {
        alert('Сотрудник обновлен успешно!');
        resetEmployeeForm();
        loadData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при обновлении сотрудника');
    }
  };

  // Удаление сотрудника
  const handleDeleteEmployee = async (employee: any) => {
    if (!window.confirm(`Удалить сотрудника "${employee.firstName} ${employee.lastName}"?`)) return;

    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Сотрудник удален успешно!');
        loadData();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при удалении сотрудника');
    }
  };

  // Начало редактирования сотрудника
  const startEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    setEmployeeFormData({
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName || '',
      phone: employee.phone,
      birthDate: employee.birthDate ? new Date(employee.birthDate).toISOString().split('T')[0] : '',
      roleId: employee.roleId || '',
      organizationId: employee.organizationId || '',
      isActive: employee.isActive
    });
    setShowCreateEmployeeModal(true);
  };

  // Фильтрация
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || org.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
            <h1 className="text-2xl font-bold text-white">Управление структурой</h1>
            <p className="text-gray-400">Организации, руководители, сотрудники и роли профсоюза</p>
          </div>
          <PermissionGate permission="org_create">
            <button
              onClick={() => {
                if (activeTab === 'organizations') {
                  setShowCreateOrgModal(true);
                } else if (activeTab === 'admins') {
                  setShowCreateAdminModal(true);
                } else if (activeTab === 'employees') {
                  setShowCreateEmployeeModal(true);
                } else if (activeTab === 'roles') {
                  setShowCreateRoleModal(true);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              <span>{
                activeTab === 'organizations' ? 'Создать организацию' :
                activeTab === 'admins' ? 'Создать руководителя' :
                activeTab === 'employees' ? 'Добавить сотрудника' :
                'Создать роль'
              }</span>
            </button>
          </PermissionGate>
        </div>

        {/* Табы */}
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('organizations')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'organizations'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <BuildingOfficeIcon className="w-5 h-5" />
              <span>Организации ({organizations.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'admins'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <UserGroupIcon className="w-5 h-5" />
              <span>Руководители ({admins.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'employees'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span>Сотрудники</span>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <ShieldCheckIcon className="w-5 h-5" />
              <span>Роли</span>
            </button>
          </nav>
        </div>

        {/* Поиск и фильтры */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={
                activeTab === 'organizations' ? 'Поиск по организациям...' :
                activeTab === 'admins' ? 'Поиск по руководителям...' :
                activeTab === 'employees' ? 'Поиск по сотрудникам...' :
                'Поиск по ролям...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {activeTab === 'organizations' && (
            <div className="sm:w-56">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as OrganizationType | '')}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все типы</option>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Контент */}
        {activeTab === 'organizations' && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <OrganizationTree
              organizations={filteredOrganizations}
              onEdit={startEditOrg}
              onDelete={handleDeleteOrganization}
              parentId={null}
            />
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-750">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      ФИО
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Телефон
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Роль
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Организация
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {admin.lastName} {admin.firstName} {admin.middleName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {admin.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900 text-blue-200">
                          {getRoleLabel(admin.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {admin.organizationName || 'Не указана'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => startEditAdmin(admin)}
                          className="text-blue-400 hover:text-blue-300 mr-4 inline-flex items-center"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin)}
                          className="text-red-400 hover:text-red-300 inline-flex items-center"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-750">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      ФИО
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Телефон
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Роль
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Организация
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Статус
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {employee.lastName} {employee.firstName} {employee.middleName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {employee.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900 text-blue-200">
                          {getRoleLabel(employee.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {employee.organization?.name || 'Не указана'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.isActive 
                            ? 'bg-green-900 text-green-200' 
                            : 'bg-red-900 text-red-200'
                        }`}>
                          {employee.isActive ? 'Активен' : 'Заблокирован'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => startEditEmployee(employee)}
                          className="text-blue-400 hover:text-blue-300 mr-4 inline-flex items-center"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee)}
                          className="text-red-400 hover:text-red-300 inline-flex items-center"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-750">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Название
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Описание
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Тип
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Права доступа
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {role.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {role.description || 'Нет описания'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          role.isSystem 
                            ? 'bg-red-900 text-red-200' 
                            : 'bg-green-900 text-green-200'
                        }`}>
                          {role.isSystem ? 'Системная' : 'Пользовательская'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {Array.isArray(role.permissions) ? role.permissions.length : 0} прав
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => startEditRole(role)}
                          className="text-blue-400 hover:text-blue-300 mr-4 inline-flex items-center"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        {!role.isSystem && (
                          <button
                            onClick={() => handleDeleteRole(role)}
                            className="text-red-400 hover:text-red-300 inline-flex items-center"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Модальное окно создания/редактирования организации */}
        {(showCreateOrgModal || editingOrg) && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 rounded-t-xl">
                <h2 className="text-2xl font-bold text-white">
                  {editingOrg ? 'Редактировать организацию' : 'Создать организацию'}
                </h2>
              </div>
              
              <form onSubmit={editingOrg ? handleEditOrganization : handleCreateOrganization} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Название организации *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="Введите название организации"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Тип организации *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as OrganizationType})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={editingOrg?.isMain}
                    >
                      {Object.entries(typeLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Родительская организация
                    </label>
                    <select
                      value={formData.parentId}
                      onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={editingOrg?.isMain}
                    >
                      <option value="">Без родительской организации</option>
                      {organizations
                        .filter(org => org.id !== editingOrg?.id)
                        .map(org => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Адрес *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="Введите адрес организации"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Телефон *
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="+7 (xxx) xxx-xx-xx"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ИНН
                    </label>
                    <input
                      type="text"
                      value={formData.inn}
                      onChange={(e) => setFormData({...formData, inn: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234567890"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Председатель
                    </label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={formData.chairmanName}
                        onChange={(e) => setFormData({...formData, chairmanName: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Фамилия Имя Отчество"
                      />
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          value={formData.chairmanName}
                          onChange={(e) => setFormData({...formData, chairmanName: e.target.value})}
                          className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Выберите существующего руководителя</option>
                          {admins.map(admin => (
                            <option key={admin.id} value={`${admin.lastName} ${admin.firstName} ${admin.middleName || ''}`.trim()}>
                              {admin.lastName} {admin.firstName} {admin.middleName} ({admin.email})
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowCreateOrgModal(false);
                              setEditingOrg(null);
                              setShowCreateAdminModal(true);
                            }}
                            className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap"
                          >
                            <PlusIcon className="w-4 h-4" />
                            <span>Создать</span>
                          </button>
                          {formData.chairmanName && (
                            <button
                              type="button"
                              onClick={() => {
                                const chairman = admins.find(admin => 
                                  `${admin.lastName} ${admin.firstName} ${admin.middleName || ''}`.trim() === formData.chairmanName
                                );
                                if (chairman) {
                                  setShowCreateOrgModal(false);
                                  setEditingOrg(null);
                                  startEditAdmin(chairman);
                                }
                              }}
                              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap"
                            >
                              <PencilIcon className="w-4 h-4" />
                              <span>Редактировать</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateOrgModal(false);
                      setEditingOrg(null);
                      resetOrgForm();
                    }}
                    className="px-6 py-3 text-gray-300 hover:text-white transition-colors font-medium rounded-lg hover:bg-gray-700"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    {editingOrg ? 'Сохранить изменения' : 'Создать организацию'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно создания/редактирования администратора */}
        {(showCreateAdminModal || editingAdmin) && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 rounded-t-xl">
                <h2 className="text-2xl font-bold text-white">
                  {editingAdmin ? 'Редактировать руководителя' : 'Создать руководителя'}
                </h2>
              </div>
              
              <form onSubmit={editingAdmin ? handleEditAdmin : handleCreateAdmin} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Фамилия *
                    </label>
                    <input
                      type="text"
                      value={adminFormData.lastName}
                      onChange={(e) => setAdminFormData({...adminFormData, lastName: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="Иванов"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Имя *
                    </label>
                    <input
                      type="text"
                      value={adminFormData.firstName}
                      onChange={(e) => setAdminFormData({...adminFormData, firstName: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="Иван"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Отчество
                    </label>
                    <input
                      type="text"
                      value={adminFormData.middleName}
                      onChange={(e) => setAdminFormData({...adminFormData, middleName: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Иванович"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Дата рождения
                    </label>
                    <DatePicker
                      value={adminFormData.birthDate}
                      onChange={(value) => setAdminFormData({...adminFormData, birthDate: value})}
                      placeholder="Выберите дату рождения"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={adminFormData.email}
                      onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="email@example.com"
                      disabled={!!editingAdmin}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Телефон *
                    </label>
                    <input
                      type="text"
                      value={adminFormData.phone}
                      onChange={(e) => setAdminFormData({...adminFormData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="+7 (xxx) xxx-xx-xx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Роль *
                    </label>
                    <select
                      value={adminFormData.role}
                      onChange={(e) => setAdminFormData({...adminFormData, role: e.target.value as UserRole})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {adminFormData.organizationId && organizations.find(o => o.id === adminFormData.organizationId) && (
                        Array.from(new Set(getRolesByOrganizationType(organizations.find(o => o.id === adminFormData.organizationId)!.type))).map((role, index) => (
                          <option key={`${role.role}-${index}`} value={role.role}>{role.label}</option>
                        ))
                      )}
                      {!adminFormData.organizationId && (
                        <>
                          <option value="REGIONAL_CHAIRMAN">Председатель регионального отделения</option>
                          <option value="LOCAL_CHAIRMAN">Председатель местного отделения</option>
                          <option value="PRIMARY_CHAIRMAN">Председатель первичной организации</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Организация *
                    </label>
                    <select
                      value={adminFormData.organizationId}
                      onChange={(e) => setAdminFormData({...adminFormData, organizationId: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Выберите организацию</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>

                  {editingAdmin && (
                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={adminFormData.generateNewPassword}
                          onChange={(e) => setAdminFormData({...adminFormData, generateNewPassword: e.target.checked})}
                          className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300">
                          Сгенерировать новый пароль и отправить на email
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateAdminModal(false);
                      setEditingAdmin(null);
                      resetAdminForm();
                    }}
                    className="px-6 py-3 text-gray-300 hover:text-white transition-colors font-medium rounded-lg hover:bg-gray-700"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    {editingAdmin ? 'Сохранить изменения' : 'Создать руководителя'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно создания/редактирования сотрудника */}
        {(showCreateEmployeeModal || editingEmployee) && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 rounded-t-xl">
                <h2 className="text-2xl font-bold text-white">
                  {editingEmployee ? 'Редактировать сотрудника' : 'Создать сотрудника'}
                </h2>
              </div>
              
              <form onSubmit={editingEmployee ? handleEditEmployee : handleCreateEmployee} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Фамилия *
                    </label>
                    <input
                      type="text"
                      value={employeeFormData.lastName}
                      onChange={(e) => setEmployeeFormData({...employeeFormData, lastName: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Имя *
                    </label>
                    <input
                      type="text"
                      value={employeeFormData.firstName}
                      onChange={(e) => setEmployeeFormData({...employeeFormData, firstName: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Отчество
                    </label>
                    <input
                      type="text"
                      value={employeeFormData.middleName}
                      onChange={(e) => setEmployeeFormData({...employeeFormData, middleName: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={employeeFormData.email}
                      onChange={(e) => setEmployeeFormData({...employeeFormData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      value={employeeFormData.phone}
                      onChange={(e) => setEmployeeFormData({...employeeFormData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Роль *
                    </label>
                    <select
                      value={employeeFormData.roleId}
                      onChange={(e) => setEmployeeFormData({...employeeFormData, roleId: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Выберите роль</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Организация *
                    </label>
                    <select
                      value={employeeFormData.organizationId}
                      onChange={(e) => setEmployeeFormData({...employeeFormData, organizationId: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Выберите организацию</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Дата рождения
                    </label>
                    <DatePicker
                      value={employeeFormData.birthDate}
                      onChange={(value) => setEmployeeFormData({...employeeFormData, birthDate: value})}
                      placeholder="Выберите дату рождения"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={employeeFormData.isActive}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, isActive: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="isActive" className="text-sm text-gray-300">
                        Активный пользователь
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700 mt-8">
                  <button
                    type="button"
                    onClick={resetEmployeeForm}
                    className="px-6 py-3 text-gray-300 hover:text-white transition-colors font-medium rounded-lg hover:bg-gray-700"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    {editingEmployee ? 'Сохранить изменения' : 'Создать сотрудника'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно создания/редактирования роли */}
        {(showCreateRoleModal || editingRole) && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 rounded-t-xl">
                <h2 className="text-2xl font-bold text-white">
                  {editingRole ? 'Редактировать роль' : 'Создать роль'}
                </h2>
              </div>
              
              <form onSubmit={editingRole ? handleEditRole : handleCreateRole} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Название роли *
                    </label>
                    <input
                      type="text"
                      value={roleFormData.name}
                      onChange={(e) => setRoleFormData({...roleFormData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Например, Менеджер по продажам"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Описание роли
                    </label>
                    <textarea
                      value={roleFormData.description}
                      onChange={(e) => setRoleFormData({...roleFormData, description: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Описание роли и её обязанностей"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Права доступа */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Права доступа</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={permission.id}
                          checked={roleFormData.permissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRoleFormData({
                                ...roleFormData,
                                permissions: [...roleFormData.permissions, permission.id]
                              });
                            } else {
                              setRoleFormData({
                                ...roleFormData,
                                permissions: roleFormData.permissions.filter(p => p !== permission.id)
                              });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label htmlFor={permission.id} className="text-sm text-gray-300">
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-gray-400 text-xs">{permission.description}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700 mt-8">
                  <button
                    type="button"
                    onClick={resetRoleForm}
                    className="px-6 py-3 text-gray-300 hover:text-white transition-colors font-medium rounded-lg hover:bg-gray-700"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    {editingRole ? 'Сохранить изменения' : 'Создать роль'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
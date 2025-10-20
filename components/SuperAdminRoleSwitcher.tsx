'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@prisma/client';

interface RoleOption {
  role: UserRole;
  label: string;
  description: string;
  route: string;
}

const roleOptions: RoleOption[] = [
  {
    role: 'FEDERAL_CHAIRMAN',
    label: 'Федеральный председатель',
    description: 'Управление федеральными организациями',
    route: '/dashboard/federal-admin'
  },
  {
    role: 'REGIONAL_CHAIRMAN',
    label: 'Региональный председатель',
    description: 'Управление региональными организациями',
    route: '/dashboard/regional-admin'
  },
  {
    role: 'LOCAL_CHAIRMAN',
    label: 'Местный председатель',
    description: 'Управление местными организациями',
    route: '/dashboard/local-admin'
  },
  {
    role: 'PRIMARY_CHAIRMAN',
    label: 'Первичный председатель',
    description: 'Управление первичной организацией',
    route: '/dashboard/primary-admin'
  },
  {
    role: 'PRIMARY_MEMBER',
    label: 'Член профсоюза',
    description: 'Личный кабинет члена профсоюза',
    route: '/dashboard/member'
  }
];

export default function SuperAdminRoleSwitcher() {
  const { user } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [originalRole, setOriginalRole] = useState<UserRole | null>(null);

  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    return null;
  }

  const switchToRole = (targetRole: UserRole) => {
    // Сохраняем оригинальную роль если еще не сохранена
    if (!originalRole) {
      setOriginalRole(user.role);
    }

    // Создаем временного пользователя с новой ролью
    const tempUser = { ...user, role: targetRole };
    
    // Сохраняем в sessionStorage для восстановления
    sessionStorage.setItem('tempUser', JSON.stringify(tempUser));
    sessionStorage.setItem('originalRole', user.role);
    
    // Переходим к соответствующему дашборду
    const targetRoute = roleOptions.find(option => option.role === targetRole)?.route;
    if (targetRoute) {
      router.push(targetRoute);
    }
  };

  const returnToSuperAdmin = () => {
    // Восстанавливаем оригинальную роль
    if (originalRole) {
      const originalUser = { ...user, role: originalRole };
      sessionStorage.setItem('tempUser', JSON.stringify(originalUser));
      sessionStorage.removeItem('originalRole');
      setOriginalRole(null);
      router.push('/dashboard/super-admin');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <span className="text-sm text-white">Переключить роль</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white">Переключение роли</h3>
              {originalRole && (
                <button
                  onClick={returnToSuperAdmin}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Вернуться к супер-админу
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {roleOptions.map((option) => (
                <button
                  key={option.role}
                  onClick={() => switchToRole(option.role)}
                  className="w-full text-left p-3 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="text-sm font-medium text-white">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                💡 Переключение роли позволяет тестировать интерфейс с точки зрения разных пользователей
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

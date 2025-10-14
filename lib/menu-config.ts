import { MenuItem, UserRole } from '@/types';

// Конфигурация меню для разных ролей
export const menuConfig: MenuItem[] = [
  {
    id: 'news',
    label: 'Новости',
    href: '/dashboard/news',
    icon: 'newspaper',
    roles: ['ADMIN', 'CENTRAL_COMMITTEE', 'REGIONAL', 'LOCAL', 'PRIMARY']
  },
  {
    id: 'tasks',
    label: 'Задачи',
    href: '/dashboard/tasks',
    icon: 'checklist',
    roles: ['ADMIN', 'CENTRAL_COMMITTEE', 'REGIONAL', 'LOCAL', 'PRIMARY']
  },
  {
    id: 'documents',
    label: 'Электронный документооборот',
    href: '/dashboard/documents',
    icon: 'document-text',
    roles: ['ADMIN', 'CENTRAL_COMMITTEE', 'REGIONAL', 'LOCAL', 'PRIMARY']
  },
  {
    id: 'organizations',
    label: 'Организации',
    href: '/dashboard/organizations',
    icon: 'building-office',
    roles: ['ADMIN', 'CENTRAL_COMMITTEE', 'REGIONAL', 'LOCAL', 'PRIMARY'],
    children: [
      {
        id: 'organizations-list',
        label: 'Список организаций',
        href: '/dashboard/organizations',
        icon: 'list-bullet',
        roles: ['ADMIN', 'CENTRAL_COMMITTEE', 'REGIONAL', 'LOCAL', 'PRIMARY']
      },
      {
        id: 'organizations-create',
        label: 'Создать организацию',
        href: '/dashboard/organizations/create',
        icon: 'plus',
        roles: ['ADMIN']
      }
    ]
  },
  {
    id: 'messages',
    label: 'Сообщения',
    href: '/dashboard/messages',
    icon: 'chat-bubble-left-right',
    roles: ['ADMIN', 'CENTRAL_COMMITTEE', 'REGIONAL', 'LOCAL', 'PRIMARY']
  },
  {
    id: 'projects',
    label: 'Проекты',
    href: '/dashboard/projects',
    icon: 'folder',
    roles: ['ADMIN', 'CENTRAL_COMMITTEE', 'REGIONAL', 'LOCAL', 'PRIMARY']
  },
  {
    id: 'calendar',
    label: 'Календарь',
    href: '/dashboard/calendar',
    icon: 'calendar',
    roles: ['ADMIN', 'CENTRAL_COMMITTEE', 'REGIONAL', 'LOCAL', 'PRIMARY']
  },
  {
    id: 'knowledge',
    label: 'База знаний',
    href: '/dashboard/knowledge',
    icon: 'book-open',
    roles: ['ADMIN', 'CENTRAL_COMMITTEE', 'REGIONAL', 'LOCAL', 'PRIMARY']
  },
  {
    id: 'employees',
    label: 'Сотрудники',
    href: '/dashboard/employees',
    icon: 'users',
    roles: ['ADMIN', 'CENTRAL_COMMITTEE', 'REGIONAL', 'LOCAL', 'PRIMARY']
  },
  {
    id: 'members',
    label: 'Члены профсоюза',
    href: '/dashboard/members',
    icon: 'user-group',
    roles: ['ADMIN', 'CENTRAL_COMMITTEE', 'REGIONAL', 'LOCAL', 'PRIMARY']
  },
  {
    id: 'reports',
    label: 'Отчетность',
    href: '/dashboard/reports',
    icon: 'chart-bar',
    roles: ['ADMIN', 'CENTRAL_COMMITTEE', 'REGIONAL', 'LOCAL', 'PRIMARY']
  },
  {
    id: 'profile',
    label: 'Профиль',
    href: '/dashboard/profile',
    icon: 'user',
    roles: ['ADMIN', 'CENTRAL_COMMITTEE', 'REGIONAL', 'LOCAL', 'PRIMARY']
  },
  {
    id: 'discounts',
    label: 'Скидки и льготы',
    href: '/dashboard/discounts',
    icon: 'gift',
    roles: ['ADMIN', 'CENTRAL_COMMITTEE', 'REGIONAL', 'LOCAL', 'PRIMARY']
  },
  {
    id: 'partners',
    label: 'Партнеры',
    href: '/dashboard/partners',
    icon: 'handshake',
    roles: ['ADMIN']
  }
];

// Функция для получения меню по роли пользователя
export function getMenuByRole(userRole: UserRole): MenuItem[] {
  return menuConfig.filter(item => 
    item.roles.includes(userRole)
  ).map(item => ({
    ...item,
    children: item.children ? item.children.filter(child => 
      child.roles.includes(userRole)
    ) : undefined
  }));
}

// Функция для проверки доступа к странице
export function hasAccessToPage(userRole: UserRole, path: string): boolean {
  const allMenuItems = menuConfig.flatMap(item => 
    [item, ...(item.children || [])]
  );
  
  const menuItem = allMenuItems.find(item => item.href === path);
  return menuItem ? menuItem.roles.includes(userRole) : false;
}

// Роли и их описания
export const roleDescriptions: Record<UserRole, string> = {
  ADMIN: 'Администратор системы',
  CENTRAL_COMMITTEE: 'Центральный комитет',
  REGIONAL: 'Региональная организация',
  LOCAL: 'Местная организация',
  PRIMARY: 'Первичная организация'
};

// Иконки для ролей
export const roleIcons: Record<UserRole, string> = {
  ADMIN: 'shield-check',
  CENTRAL_COMMITTEE: 'building-library',
  REGIONAL: 'map',
  LOCAL: 'building-office-2',
  PRIMARY: 'home'
};

import { MenuItem, UserRole } from '@/types';

// Конфигурация меню для разных ролей
export const menuConfig: MenuItem[] = [
  // Специальные пункты для супер-администратора
  {
    id: 'super-admin-dashboard',
    label: 'Панель управления',
    href: '/dashboard/super-admin',
    icon: 'home',
    roles: ['SUPER_ADMIN']
  },
  {
    id: 'membership-validation',
    label: 'Валидация членства',
    href: '/dashboard/membership-validation',
    icon: 'shield-check',
    roles: ['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
  },
  {
    id: 'news',
    label: 'Новости',
    href: '/dashboard/news',
    icon: 'newspaper',
    roles: ['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
  },
  {
    id: 'tasks',
    label: 'Задачи',
    href: '/dashboard/tasks',
    icon: 'checklist',
    roles: ['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
  },
  {
    id: 'documents',
    label: 'Электронный документооборот',
    href: '/dashboard/documents',
    icon: 'document-text',
    roles: ['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
  },
  {
    id: 'organizations',
    label: 'Организации',
    href: '/dashboard/organizations',
    icon: 'building-office',
    roles: ['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
  },
  {
    id: 'messages',
    label: 'Сообщения',
    href: '/dashboard/messages',
    icon: 'chat-bubble-left-right',
    roles: ['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
  },
  {
    id: 'projects',
    label: 'Проекты',
    href: '/dashboard/projects',
    icon: 'folder',
    roles: ['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
  },
  {
    id: 'calendar',
    label: 'Календарь',
    href: '/dashboard/calendar',
    icon: 'calendar',
    roles: ['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
  },
  {
    id: 'knowledge',
    label: 'База знаний',
    href: '/dashboard/knowledge',
    icon: 'book-open',
    roles: ['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
  },
  {
    id: 'employees',
    label: 'Сотрудники',
    href: '/dashboard/employees',
    icon: 'users',
    roles: ['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
  },
  {
    id: 'members',
    label: 'Члены профсоюза',
    href: '/dashboard/members',
    icon: 'user-group',
    roles: ['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
  },
  {
    id: 'reports',
    label: 'Отчетность',
    href: '/dashboard/reports',
    icon: 'chart-bar',
    roles: ['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
  },
  {
    id: 'profile',
    label: 'Профиль',
    href: '/dashboard/profile',
    icon: 'user',
    roles: ['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
  },
  {
    id: 'discounts',
    label: 'Скидки и льготы',
    href: '/dashboard/discounts',
    icon: 'credit-card',
    roles: ['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
  },
  {
    id: 'partners',
    label: 'Партнеры',
    href: '/dashboard/partners',
    icon: 'handshake',
    roles: ['SUPER_ADMIN']
  },
  // Пункты меню для членов профсоюза
  {
    id: 'member-dashboard',
    label: 'Панель управления',
    href: '/dashboard',
    icon: 'home',
    roles: ['PRIMARY_MEMBER']
  },
  {
    id: 'member-documents',
    label: 'Документооборот',
    href: '/dashboard/member-documents',
    icon: 'document-text',
    roles: ['PRIMARY_MEMBER']
  },
  {
    id: 'member-profile',
    label: 'Мой профиль',
    href: '/dashboard/profile',
    icon: 'user',
    roles: ['PRIMARY_MEMBER']
  },
  {
    id: 'member-benefits',
    label: 'Льготы и скидки',
    href: '/dashboard/benefits',
    icon: 'gift',
    roles: ['PRIMARY_MEMBER']
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

// Роли и их описания (только основные роли для отображения)
export const roleDescriptions: Record<string, string> = {
  SUPER_ADMIN: 'Супер-администратор системы',
  FEDERAL_CHAIRMAN: 'Председатель федеральной организации',
  REGIONAL_CHAIRMAN: 'Председатель региональной организации',
  LOCAL_CHAIRMAN: 'Председатель местной организации',
  PRIMARY_CHAIRMAN: 'Председатель первичной организации',
  MEMBER: 'Член профсоюза'
};

// Иконки для ролей
export const roleIcons: Record<string, string> = {
  SUPER_ADMIN: 'shield-check',
  FEDERAL_CHAIRMAN: 'building-library',
  REGIONAL_CHAIRMAN: 'map',
  LOCAL_CHAIRMAN: 'building-office-2',
  PRIMARY_CHAIRMAN: 'home',
  MEMBER: 'user'
};

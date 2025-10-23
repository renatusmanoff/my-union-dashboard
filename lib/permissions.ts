import { prisma } from './database';
import { UserRole } from '@prisma/client';

// Типы для проверки прав доступа
export interface PermissionCheck {
  userId: string;
  permission: string;
  organizationId?: string;
}

// Права доступа по ролям (хардкод для быстрой проверки)
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: [
    'org_view', 'org_create', 'org_edit', 'org_delete', 'org_manage_hierarchy',
    'user_view', 'user_create', 'user_edit', 'user_delete', 'user_manage_roles', 'user_validate_membership', 'user_manage_admins',
    'news_view', 'news_create', 'news_edit', 'news_delete',
    'doc_view', 'doc_create', 'doc_edit', 'doc_delete', 'doc_sign', 'doc_manage_workflow',
    'msg_view', 'msg_send', 'msg_create_chat', 'msg_view_all',
    'discount_view', 'discount_manage',
    'profile_view', 'profile_edit_own',
    'report_view', 'report_create',
    'settings_manage',
    'admin_full_access'
  ],
  REGIONAL_CHAIRMAN: [
    'org_view', 'org_edit', 'org_manage_hierarchy',
    'user_view', 'user_create', 'user_edit', 'user_delete', 'user_manage_roles', 'user_validate_membership', 'user_manage_admins',
    'news_view', 'news_create', 'news_edit', 'news_delete',
    'doc_view', 'doc_create', 'doc_edit', 'doc_sign', 'doc_manage_workflow',
    'msg_view', 'msg_send', 'msg_create_chat', 'msg_view_all',
    'discount_view', 'discount_manage',
    'profile_view', 'profile_edit_own',
    'report_view', 'report_create',
    'settings_manage'
  ],
  LOCAL_CHAIRMAN: [
    'org_view', 'org_edit',
    'user_view', 'user_create', 'user_edit', 'user_delete', 'user_manage_roles', 'user_validate_membership',
    'news_view', 'news_create', 'news_edit', 'news_delete',
    'doc_view', 'doc_create', 'doc_edit', 'doc_sign', 'doc_manage_workflow',
    'msg_view', 'msg_send', 'msg_create_chat', 'msg_view_all',
    'discount_view', 'discount_manage',
    'profile_view', 'profile_edit_own',
    'report_view', 'report_create'
  ],
  PRIMARY_CHAIRMAN: [
    'org_view',
    'user_view', 'user_create', 'user_edit', 'user_delete', 'user_validate_membership',
    'news_view', 'news_create', 'news_edit', 'news_delete',
    'doc_view', 'doc_create', 'doc_edit', 'doc_sign', 'doc_manage_workflow',
    'msg_view', 'msg_send', 'msg_create_chat', 'msg_view_all',
    'discount_view', 'discount_manage',
    'profile_view', 'profile_edit_own',
    'report_view', 'report_create'
  ],
  PRIMARY_MEMBER: [
    'news_view',
    'doc_view', 'doc_create', 'doc_sign',
    'msg_view', 'msg_send', 'msg_create_chat',
    'discount_view',
    'profile_view', 'profile_edit_own'
  ]
};

// Функция для проверки прав доступа пользователя
export async function hasPermission(
  userId: string, 
  permission: string, 
  organizationId?: string
): Promise<boolean> {
  try {
    // Получаем пользователя с его ролью
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customRole: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (!user) {
      return false;
    }

    // Если у пользователя есть кастомная роль, проверяем её права
    if (user.customRole) {
      const customPermissions = user.customRole.permissions.map(p => p.id);
      return customPermissions.includes(permission);
    }

    // Проверяем права по системной роли
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

// Функция для проверки множественных прав
export async function hasAnyPermission(
  userId: string, 
  permissions: string[], 
  organizationId?: string
): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(userId, permission, organizationId)) {
      return true;
    }
  }
  return false;
}

// Функция для проверки всех прав
export async function hasAllPermissions(
  userId: string, 
  permissions: string[], 
  organizationId?: string
): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(userId, permission, organizationId))) {
      return false;
    }
  }
  return true;
}

// Функция для получения всех прав пользователя
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customRole: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (!user) {
      return [];
    }

    // Если у пользователя есть кастомная роль
    if (user.customRole) {
      return user.customRole.permissions.map(p => p.id);
    }

    // Возвращаем права по системной роли
    return ROLE_PERMISSIONS[user.role] || [];
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

// Функция для проверки доступа к организации
export async function canAccessOrganization(
  userId: string, 
  organizationId: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true
      }
    });

    if (!user) {
      return false;
    }

    // Супер-администратор может получить доступ ко всем организациям
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Пользователь может получить доступ к своей организации и подчиненным
    if (user.organizationId === organizationId) {
      return true;
    }

    // TODO: Добавить проверку иерархии организаций
    return false;
  } catch (error) {
    console.error('Error checking organization access:', error);
    return false;
  }
}

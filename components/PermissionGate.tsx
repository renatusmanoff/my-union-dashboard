'use client';

import { useUser } from '@/contexts/UserContext';
import { ReactNode } from 'react';

interface PermissionGateProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
  organizationId?: string;
}

export default function PermissionGate({ 
  permission, 
  children, 
  fallback = null,
  organizationId 
}: PermissionGateProps) {
  const { user } = useUser();

  // Если пользователь не загружен, не показываем контент
  if (!user) {
    return <>{fallback}</>;
  }

  // Простая проверка прав на основе роли пользователя
  const hasPermission = checkUserPermission(user.role, permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Функция для проверки прав пользователя
function checkUserPermission(userRole: string, permission: string): boolean {
  const rolePermissions: Record<string, string[]> = {
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
      'admin_full_access', 'admin_roles'
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

  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);
}

// Хук для проверки прав
export function usePermission(permission: string, organizationId?: string): boolean {
  const { user } = useUser();
  
  if (!user) {
    return false;
  }

  return checkUserPermission(user.role, permission);
}

// Хук для проверки множественных прав
export function useAnyPermission(permissions: string[], organizationId?: string): boolean {
  const { user } = useUser();
  
  if (!user) {
    return false;
  }

  return permissions.some(permission => checkUserPermission(user.role, permission));
}

// Хук для проверки всех прав
export function useAllPermissions(permissions: string[], organizationId?: string): boolean {
  const { user } = useUser();
  
  if (!user) {
    return false;
  }

  return permissions.every(permission => checkUserPermission(user.role, permission));
}

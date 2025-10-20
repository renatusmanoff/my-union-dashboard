import { UserRole } from '@/types';
import { getRoleConfig } from '@/lib/role-config';

// Функция для получения перевода роли на русский язык
export function getRoleLabel(role: UserRole): string {
  const config = getRoleConfig(role);
  return config ? config.label : role;
}

// Функция для получения описания роли
export function getRoleDescription(role: UserRole): string {
  const config = getRoleConfig(role);
  return config ? config.description : '';
}

// Функция для получения всех переводов ролей
export function getAllRoleLabels(): Record<UserRole, string> {
  const labels: Record<string, string> = {};
  
  // Добавляем основные роли
  const roles = [
    'SUPER_ADMIN',
    'FEDERAL_CHAIRMAN', 'FEDERAL_VICE_CHAIRMAN', 'FEDERAL_CHIEF_ACCOUNTANT', 'FEDERAL_ACCOUNTANT',
    'FEDERAL_DEPARTMENT_HEAD', 'FEDERAL_OFFICE_HEAD', 'FEDERAL_SPECIALIST',
    'FEDERAL_PRESIDIUM_MEMBER', 'FEDERAL_PLENUM_MEMBER',
    'FEDERAL_YOUTH_CHAIRMAN', 'FEDERAL_YOUTH_VICE_CHAIRMAN', 'FEDERAL_YOUTH_MEMBER',
    'FEDERAL_AUDIT_CHAIRMAN', 'FEDERAL_AUDIT_MEMBER',
    'REGIONAL_CHAIRMAN', 'REGIONAL_VICE_CHAIRMAN', 'REGIONAL_CHIEF_ACCOUNTANT',
    'REGIONAL_PRESIDIUM_MEMBER', 'REGIONAL_COMMITTEE_MEMBER', 'REGIONAL_ACCOUNTANT',
    'REGIONAL_DEPARTMENT_HEAD', 'REGIONAL_CHIEF_SPECIALIST', 'REGIONAL_SPECIALIST',
    'REGIONAL_YOUTH_CHAIRMAN', 'REGIONAL_YOUTH_VICE_CHAIRMAN', 'REGIONAL_YOUTH_MEMBER',
    'REGIONAL_AUDIT_CHAIRMAN', 'REGIONAL_AUDIT_MEMBER',
    'LOCAL_CHAIRMAN', 'LOCAL_VICE_CHAIRMAN', 'LOCAL_PRESIDIUM_MEMBER', 'LOCAL_PLENUM_MEMBER',
    'LOCAL_ACCOUNTANT', 'LOCAL_SPECIALIST',
    'LOCAL_AUDIT_CHAIRMAN', 'LOCAL_AUDIT_MEMBER',
    'LOCAL_YOUTH_CHAIRMAN', 'LOCAL_YOUTH_VICE_CHAIRMAN', 'LOCAL_YOUTH_MEMBER',
    'PRIMARY_CHAIRMAN', 'PRIMARY_VICE_CHAIRMAN', 'PRIMARY_ACCOUNTANT', 'PRIMARY_COMMITTEE_MEMBER',
    'PRIMARY_AUDIT_CHAIRMAN', 'PRIMARY_AUDIT_MEMBER',
    'PRIMARY_YOUTH_CHAIRMAN', 'PRIMARY_YOUTH_VICE_CHAIRMAN', 'PRIMARY_YOUTH_MEMBER',
    'PRIMARY_MEMBER',
    'PROF_BUREAU_CHAIRMAN', 'PROF_BUREAU_VICE_CHAIRMAN', 'PROF_BUREAU_MEMBER',
    'PROF_GROUP_ORGANIZER', 'PROF_GROUP_VICE_ORGANIZER', 'PROF_GROUP_MEMBER'
  ];
  
  roles.forEach(role => {
    labels[role] = getRoleLabel(role as UserRole);
  });
  
  return labels as Record<UserRole, string>;
}

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRole, OrganizationType } from '@prisma/client';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Интерфейс для JWT payload
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
  iat?: number;
  exp?: number;
}

// Функция для создания JWT токена
export function createToken(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  organizationType: OrganizationType;
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  membershipValidated: boolean;
}): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Функция для верификации JWT токена
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Функция для проверки роли пользователя
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

// Функция для проверки прав администратора
export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'SUPER_ADMIN' || 
         userRole.startsWith('FEDERAL_') || 
         userRole.startsWith('REGIONAL_') || 
         userRole.startsWith('LOCAL_') || 
         userRole.startsWith('PRIMARY_') ||
         userRole.startsWith('PROF_');
}

// Функция для проверки, является ли пользователь супер-администратором
export function isSuperAdmin(userRole: UserRole): boolean {
  return userRole === 'SUPER_ADMIN';
}

// Функция для проверки прав на создание организаций
export function canCreateOrganizations(userRole: UserRole): boolean {
  return userRole === 'SUPER_ADMIN' || userRole.startsWith('FEDERAL_');
}

// Функция для проверки прав на управление партнерами
export function canManagePartners(userRole: UserRole): boolean {
  return userRole === 'SUPER_ADMIN' || userRole.startsWith('FEDERAL_');
}

// Функция для проверки, может ли пользователь создавать администраторов
export function canCreateAdmins(userRole: UserRole): boolean {
  return userRole === 'SUPER_ADMIN';
}

// Функция для проверки, может ли пользователь валидировать членство
export function canValidateMembership(userRole: UserRole): boolean {
  // Председатели и их заместители могут валидировать членство
  const validationRoles = [
    'SUPER_ADMIN',
    'FEDERAL_CHAIRMAN', 'FEDERAL_VICE_CHAIRMAN', 'FEDERAL_PRESIDIUM_MEMBER',
    'REGIONAL_CHAIRMAN', 'REGIONAL_VICE_CHAIRMAN', 'REGIONAL_PRESIDIUM_MEMBER',
    'LOCAL_CHAIRMAN', 'LOCAL_VICE_CHAIRMAN', 'LOCAL_PRESIDIUM_MEMBER',
    'PRIMARY_CHAIRMAN', 'PRIMARY_VICE_CHAIRMAN', 'PRIMARY_COMMITTEE_MEMBER'
  ];
  return validationRoles.includes(userRole);
}

// Функция для проверки, может ли пользователь создавать подорганизации
export function canCreateSubOrganizations(userRole: UserRole): boolean {
  // Только председатели и их заместители могут создавать подорганизации
  const createRoles = [
    'SUPER_ADMIN',
    'FEDERAL_CHAIRMAN', 'FEDERAL_VICE_CHAIRMAN',
    'REGIONAL_CHAIRMAN', 'REGIONAL_VICE_CHAIRMAN',
    'LOCAL_CHAIRMAN', 'LOCAL_VICE_CHAIRMAN',
    'PRIMARY_CHAIRMAN', 'PRIMARY_VICE_CHAIRMAN'
  ];
  return createRoles.includes(userRole);
}

// Функция для проверки, может ли пользователь управлять членами
export function canManageMembers(userRole: UserRole): boolean {
  // Все административные роли могут управлять членами
  return userRole === 'SUPER_ADMIN' || 
         userRole.startsWith('FEDERAL_') || 
         userRole.startsWith('REGIONAL_') || 
         userRole.startsWith('LOCAL_') || 
         userRole.startsWith('PRIMARY_') ||
         userRole.startsWith('PROF_');
}

// Функция для получения иерархии ролей
export function getRoleHierarchy(userRole: UserRole): UserRole[] {
  const hierarchy: Record<string, UserRole[]> = {
    SUPER_ADMIN: ['SUPER_ADMIN'],
    
    // Федеральный уровень
    FEDERAL_CHAIRMAN: ['FEDERAL_CHAIRMAN', 'FEDERAL_VICE_CHAIRMAN', 'FEDERAL_CHIEF_ACCOUNTANT', 'FEDERAL_ACCOUNTANT', 'FEDERAL_DEPARTMENT_HEAD', 'FEDERAL_OFFICE_HEAD', 'FEDERAL_SPECIALIST', 'FEDERAL_PRESIDIUM_MEMBER', 'FEDERAL_PLENUM_MEMBER', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN', 'PRIMARY_MEMBER'] as UserRole[],
    FEDERAL_VICE_CHAIRMAN: ['FEDERAL_VICE_CHAIRMAN', 'FEDERAL_CHIEF_ACCOUNTANT', 'FEDERAL_ACCOUNTANT', 'FEDERAL_DEPARTMENT_HEAD', 'FEDERAL_OFFICE_HEAD', 'FEDERAL_SPECIALIST', 'FEDERAL_PRESIDIUM_MEMBER', 'FEDERAL_PLENUM_MEMBER', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN', 'PRIMARY_MEMBER'] as UserRole[],
    
    // Региональный уровень
    REGIONAL_CHAIRMAN: ['REGIONAL_CHAIRMAN', 'REGIONAL_VICE_CHAIRMAN', 'REGIONAL_CHIEF_ACCOUNTANT', 'REGIONAL_PRESIDIUM_MEMBER', 'REGIONAL_COMMITTEE_MEMBER', 'REGIONAL_ACCOUNTANT', 'REGIONAL_DEPARTMENT_HEAD', 'REGIONAL_CHIEF_SPECIALIST', 'REGIONAL_SPECIALIST', 'REGIONAL_YOUTH_CHAIRMAN', 'REGIONAL_YOUTH_VICE_CHAIRMAN', 'REGIONAL_YOUTH_MEMBER', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN', 'PRIMARY_MEMBER'] as UserRole[],
    REGIONAL_VICE_CHAIRMAN: ['REGIONAL_VICE_CHAIRMAN', 'REGIONAL_CHIEF_ACCOUNTANT', 'REGIONAL_PRESIDIUM_MEMBER', 'REGIONAL_COMMITTEE_MEMBER', 'REGIONAL_ACCOUNTANT', 'REGIONAL_DEPARTMENT_HEAD', 'REGIONAL_CHIEF_SPECIALIST', 'REGIONAL_SPECIALIST', 'REGIONAL_YOUTH_CHAIRMAN', 'REGIONAL_YOUTH_VICE_CHAIRMAN', 'REGIONAL_YOUTH_MEMBER', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN', 'PRIMARY_MEMBER'] as UserRole[],
    
    // Местный уровень
    LOCAL_CHAIRMAN: ['LOCAL_CHAIRMAN', 'LOCAL_VICE_CHAIRMAN', 'LOCAL_PRESIDIUM_MEMBER', 'LOCAL_PLENUM_MEMBER', 'LOCAL_ACCOUNTANT', 'LOCAL_SPECIALIST', 'PRIMARY_CHAIRMAN', 'PRIMARY_MEMBER'] as UserRole[],
    LOCAL_VICE_CHAIRMAN: ['LOCAL_VICE_CHAIRMAN', 'LOCAL_PRESIDIUM_MEMBER', 'LOCAL_PLENUM_MEMBER', 'LOCAL_ACCOUNTANT', 'LOCAL_SPECIALIST', 'PRIMARY_CHAIRMAN', 'PRIMARY_MEMBER'] as UserRole[],
    
    // Первичный уровень
    PRIMARY_CHAIRMAN: ['PRIMARY_CHAIRMAN', 'PRIMARY_VICE_CHAIRMAN', 'PRIMARY_ACCOUNTANT', 'PRIMARY_COMMITTEE_MEMBER', 'PRIMARY_AUDIT_CHAIRMAN', 'PRIMARY_AUDIT_MEMBER', 'PRIMARY_YOUTH_CHAIRMAN', 'PRIMARY_YOUTH_VICE_CHAIRMAN', 'PRIMARY_YOUTH_MEMBER', 'PROF_BUREAU_CHAIRMAN', 'PROF_GROUP_ORGANIZER', 'PRIMARY_MEMBER'] as UserRole[],
    PRIMARY_VICE_CHAIRMAN: ['PRIMARY_VICE_CHAIRMAN', 'PRIMARY_ACCOUNTANT', 'PRIMARY_COMMITTEE_MEMBER', 'PRIMARY_AUDIT_CHAIRMAN', 'PRIMARY_AUDIT_MEMBER', 'PRIMARY_YOUTH_CHAIRMAN', 'PRIMARY_YOUTH_VICE_CHAIRMAN', 'PRIMARY_YOUTH_MEMBER', 'PROF_BUREAU_CHAIRMAN', 'PROF_GROUP_ORGANIZER', 'PRIMARY_MEMBER'] as UserRole[],
    
    // Структурные подразделения
    PROF_BUREAU_CHAIRMAN: ['PROF_BUREAU_CHAIRMAN', 'PROF_BUREAU_VICE_CHAIRMAN', 'PROF_BUREAU_MEMBER', 'PROF_GROUP_ORGANIZER', 'PRIMARY_MEMBER'] as UserRole[],
    PROF_GROUP_ORGANIZER: ['PROF_GROUP_ORGANIZER', 'PROF_GROUP_VICE_ORGANIZER', 'PROF_GROUP_MEMBER', 'PRIMARY_MEMBER'] as UserRole[],
    
    PRIMARY_MEMBER: ['PRIMARY_MEMBER'] as UserRole[]
  };

  return hierarchy[userRole] || [];
}

// Функция для проверки доступа к организации
export function canAccessOrganization(
  userRole: UserRole,
  userOrganizationId: string,
  targetOrganizationId: string
): boolean {
  // Супер-администратор имеет доступ ко всем организациям
  if (userRole === 'SUPER_ADMIN') {
    return true;
  }

  // Пользователь может видеть только свою организацию и подчиненные
  return userOrganizationId === targetOrganizationId;
}

// Функция для установки токена в cookie
export function setAuthToken(): void {
  // В Next.js App Router используем cookies() для установки cookie
  // Это должно быть вызвано в Server Action или Route Handler
}

// Функция для удаления токена из cookie
export function removeAuthToken(): void {
  // В Next.js App Router используем cookies() для удаления cookie
  // Это должно быть вызвано в Server Action или Route Handler
}

// Функция для хеширования пароля
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Функция для проверки пароля
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Функция для получения пользователя из сессии (для серверных компонентов)
export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  role: UserRole;
  organizationId: string | null;
  isActive: boolean;
} | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session-id')?.value;

    if (!sessionId) {
      return null;
    }

    // Получаем данные сессии из базы данных
    const { prisma } = await import('@/lib/database');
    const session = await prisma.session.findUnique({
      where: { token: sessionId },
      include: {
        user: true
      }
    });

    if (!session) {
      return null;
    }

    // Проверяем, не истекла ли сессия
    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    const user = session.user;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName || undefined,
      phone: user.phone,
      role: user.role as UserRole,
      organizationId: user.organizationId,
      isActive: user.isActive
    };
  } catch {
    return null;
  }
}

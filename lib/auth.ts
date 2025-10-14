import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { User, UserRole } from '@/types';

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
export function createToken(user: Omit<User, 'createdAt' | 'updatedAt'>): string {
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

// Функция для получения пользователя из токена
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // Здесь должен быть запрос к API для получения данных пользователя
    // Пока возвращаем моковые данные
    return {
      id: payload.userId,
      email: payload.email,
      firstName: 'Иван',
      lastName: 'Иванов',
      middleName: 'Иванович',
      phone: '+7 (999) 123-45-67',
      role: payload.role,
      organizationId: payload.organizationId,
      organizationName: 'Центральный комитет профсоюза',
      avatar: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
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
  return userRole === 'ADMIN';
}

// Функция для проверки прав на создание организаций
export function canCreateOrganizations(userRole: UserRole): boolean {
  return userRole === 'ADMIN';
}

// Функция для проверки прав на управление партнерами
export function canManagePartners(userRole: UserRole): boolean {
  return userRole === 'ADMIN';
}

// Функция для получения иерархии ролей
export function getRoleHierarchy(userRole: UserRole): UserRole[] {
  const hierarchy: Record<UserRole, UserRole[]> = {
    ADMIN: ['ADMIN', 'CENTRAL_COMMITTEE', 'REGIONAL', 'LOCAL', 'PRIMARY'],
    CENTRAL_COMMITTEE: ['CENTRAL_COMMITTEE', 'REGIONAL', 'LOCAL', 'PRIMARY'],
    REGIONAL: ['REGIONAL', 'LOCAL', 'PRIMARY'],
    LOCAL: ['LOCAL', 'PRIMARY'],
    PRIMARY: ['PRIMARY']
  };

  return hierarchy[userRole] || [];
}

// Функция для проверки доступа к организации
export function canAccessOrganization(
  userRole: UserRole,
  userOrganizationId: string,
  targetOrganizationId: string
): boolean {
  // Администратор имеет доступ ко всем организациям
  if (userRole === 'ADMIN') {
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

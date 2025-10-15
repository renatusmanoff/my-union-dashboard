import { prisma } from './prisma';
import { hashPassword, verifyPassword } from './auth';
import { UserRole } from '@prisma/client';

// Интерфейс для создания пользователя
export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  role?: UserRole;
  organizationId?: string;
}

// Интерфейс для обновления пользователя
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  organizationId?: string;
}

// Функция для поиска пользователя по email
export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      organization: true
    }
  });
}

// Функция для поиска пользователя по ID
export async function findUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      organization: true
    }
  });
}

// Функция для создания пользователя
export async function createUser(userData: CreateUserData) {
  try {
    // Хешируем пароль
    const hashedPassword = await hashPassword(userData.password);
    
    // Если organizationId не указан, создаем пользователя без организации
    // или находим подходящую организацию по умолчанию
    let organizationId = userData.organizationId;
    
    if (!organizationId) {
      // Ищем первичную организацию по умолчанию
      const defaultOrg = await prisma.organization.findFirst({
        where: { type: 'PRIMARY' }
      });
      
      if (defaultOrg) {
        organizationId = defaultOrg.id;
      } else {
        // Если нет первичной организации, создаем пользователя без организации
        organizationId = null;
      }
    }
    
    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName,
        phone: userData.phone,
        role: userData.role || 'PRIMARY_MEMBER',
        organizationId: organizationId,
        isActive: true,
        emailVerified: false,
        membershipValidated: false
      },
      include: {
        organization: true
      }
    });
    
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Функция для обновления пользователя
export async function updateUser(id: string, userData: UpdateUserData) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: userData,
      include: {
        organization: true
      }
    });
    
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Функция для проверки пароля
export async function verifyUserPassword(email: string, password: string) {
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    
    // Обновляем время последнего входа
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
    
    return user;
  } catch (error) {
    console.error('Error verifying user password:', error);
    return null;
  }
}

// Функция для создания организации
export async function createOrganization(data: {
  name: string;
  type: string;
  parentId?: string;
  address: string;
  phone: string;
  email: string;
  director: string;
}) {
  try {
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        type: data.type as 'FEDERAL' | 'REGIONAL' | 'LOCAL' | 'PRIMARY',
        parentId: data.parentId,
        address: data.address,
        phone: data.phone,
        email: data.email,
        director: data.director,
        membersCount: 0,
        isActive: true
      }
    });
    
    return organization;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
}

// Функция для поиска организаций
export async function findOrganizations() {
  try {
    return await prisma.organization.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error('Error finding organizations:', error);
    return [];
  }
}

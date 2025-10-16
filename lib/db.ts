import { PrismaClient } from '@prisma/client';
import { hashPassword } from './auth';

const prisma = new PrismaClient();

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
export async function createUser(userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  role: string;
  organizationId?: string;
}) {
  try {
    // Хешируем пароль
    const hashedPassword = await hashPassword(userData.password);
    
    // Создаем пользователя
    const baseUserData = {
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      middleName: userData.middleName,
      phone: userData.phone,
      role: (userData.role || 'PRIMARY_MEMBER') as 'PRIMARY_MEMBER',
      isActive: true,
      emailVerified: false,
      membershipValidated: false
    };

    // Добавляем organizationId только если он определен
    const userDataToCreate = userData.organizationId 
      ? { ...baseUserData, organizationId: userData.organizationId }
      : baseUserData;

    const user = await prisma.user.create({
      data: userDataToCreate,
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

// Функция для проверки пароля пользователя
export async function verifyUserPassword(email: string, password: string) {
  try {
    const user = await findUserByEmail(email);
    
    if (!user) {
      return null;
    }

    const { verifyPassword } = await import('./auth');
    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
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
  chairmanName?: string;
  industry?: string;
}) {
  try {
    const organizationDataToCreate: Record<string, unknown> = {
      name: data.name,
      type: data.type as 'FEDERAL' | 'REGIONAL' | 'LOCAL' | 'PRIMARY',
      industry: data.industry || 'EDUCATION',
      address: data.address,
      phone: data.phone,
      email: data.email,
      isActive: true
    };

    if (data.parentId) {
      organizationDataToCreate.parentId = data.parentId;
    }

    const organization = await prisma.organization.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: organizationDataToCreate as any
    });
    
    return organization;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
}

export { prisma };
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isSuperAdmin } from '@/lib/auth';
import { AdminUser } from '@/types';
import { getRolesByOrganizationType } from '@/lib/role-config';
import { sendAdminCredentials, sendOrganizationCreatedNotification } from '@/lib/email';
import { prisma } from '@/lib/database';
import { hashPassword } from '@/lib/auth';

// Функция для генерации временного пароля
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    // Проверяем права супер-администратора
    if (!isSuperAdmin(currentUser.role)) {
      return NextResponse.json(
        { error: 'Недостаточно прав для создания администраторов' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, firstName, lastName, middleName, phone, roles, organizationId, organizationType, organizationName } = body;

    // Валидация
    if (!email || !firstName || !lastName || !phone || !roles || !Array.isArray(roles) || roles.length === 0 || !organizationId || !organizationType) {
      return NextResponse.json(
        { error: 'Все поля обязательны и должны быть заполнены корректно' },
        { status: 400 }
      );
    }

    // Проверяем, что все роли корректные для данного типа организации
    const availableRoles = getRolesByOrganizationType(organizationType);
    const validRoles = availableRoles.map(r => r.role);
    
    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      return NextResponse.json(
        { error: `Некорректные роли для данного типа организации: ${invalidRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Генерируем временный пароль
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(temporaryPassword);
    
    // Создаем пользователя в базе данных
    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        middleName: middleName || null,
        phone,
        role: roles[0], // Основная роль - первая из выбранных
        organizationId,
        password: hashedPassword,
        isActive: true,
        emailVerified: false,
        membershipValidated: false
      }
    });

    // Обновляем организацию с данными председателя
    const chairmanFullName = `${firstName} ${lastName}${middleName ? ' ' + middleName : ''}`;
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        chairmanId: newUser.id,
        chairmanName: chairmanFullName
      }
    });

    // Создаем объект администратора для ответа
    const newAdmin: AdminUser = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      middleName: newUser.middleName,
      phone: newUser.phone,
      role: newUser.role,
      organizationId: newUser.organizationId!,
      organizationName: organizationName || `Организация ${organizationType}`,
      isActive: newUser.isActive,
      emailVerified: newUser.emailVerified,
      temporaryPassword,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    // Отправляем email с учетными данными
    const emailSent = await sendAdminCredentials({
      email: newAdmin.email,
      firstName: newAdmin.firstName,
      lastName: newAdmin.lastName,
      temporaryPassword,
      role: roles.join(', '), // Все роли через запятую
      organizationName: newAdmin.organizationName
    });

    // Отправляем уведомление о создании организации на support@myunion.pro
    const notificationSent = await sendOrganizationCreatedNotification(
      organizationName,
      organizationType,
      chairmanFullName,
      email
    );

    if (!emailSent) {
      console.warn('Failed to send admin credentials email, but admin was created');
    }
    if (!notificationSent) {
      console.warn('Failed to send organization created notification');
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        middleName: newAdmin.middleName,
        phone: newAdmin.phone,
        role: newAdmin.role,
        organizationId: newAdmin.organizationId,
        organizationName: newAdmin.organizationName,
        isActive: newAdmin.isActive,
        emailVerified: newAdmin.emailVerified,
        createdAt: newAdmin.createdAt
      },
      emailSent,
      notificationSent,
      temporaryPassword: emailSent ? undefined : temporaryPassword,
      message: emailSent 
        ? 'Администратор создан и учетные данные отправлены на email'
        : 'Администратор создан, но не удалось отправить email с учетными данными'
    });

  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

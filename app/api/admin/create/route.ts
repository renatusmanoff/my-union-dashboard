import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isSuperAdmin } from '@/lib/auth';
import { AdminUser } from '@/types';
import { getRolesByOrganizationType } from '@/lib/role-config';
import { sendAdminCredentials } from '@/lib/email';

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
    // const hashedPassword = await hashPassword(temporaryPassword); // TODO: Сохранить в БД

    // Здесь должен быть запрос к базе данных
    // Пока создаем мокового администратора
    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      email,
      firstName,
      lastName,
      middleName,
      phone,
      role: roles[0], // Основная роль - первая из выбранных
      organizationId,
      organizationName: organizationName || `Организация ${organizationType}`, // Должно быть получено из БД
      isActive: true,
      emailVerified: false,
      temporaryPassword,
      createdAt: new Date(),
      updatedAt: new Date()
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

    if (!emailSent) {
      console.warn('Failed to send admin credentials email, but admin was created');
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

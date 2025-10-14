import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isSuperAdmin } from '@/lib/auth';
import { AdminUser } from '@/types';
import { getRolesByOrganizationType } from '@/lib/role-config';
import { sendAdminCredentials } from '@/lib/email';

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
    const { email, firstName, lastName, middleName, phone, role, organizationId, organizationType } = body;

    // Валидация
    if (!email || !firstName || !lastName || !phone || !role || !organizationId || !organizationType) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    // Проверяем, что роль корректная для данного типа организации
    const availableRoles = getRolesByOrganizationType(organizationType);
    const validRoles = availableRoles.map(r => r.role);
    
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Некорректная роль для данного типа организации' },
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
      role,
      organizationId,
      organizationName: `Организация ${organizationType}`, // Должно быть получено из БД
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
      role: newAdmin.role,
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

// Функция для генерации временного пароля
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Добавляем обязательные символы
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Заглавная буква
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Строчная буква
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Цифра
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Специальный символ
  
  // Добавляем случайные символы до длины 12
  for (let i = 4; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Перемешиваем символы
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

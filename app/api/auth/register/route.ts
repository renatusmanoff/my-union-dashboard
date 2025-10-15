import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';
import { createUser, findUserByEmail } from '@/lib/db';
import { canSelfRegister } from '@/lib/role-config';
import { cookies } from 'next/headers';
import { OrganizationType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, middleName, phone, organizationId, role } = await request.json();

    // Валидация
    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Некорректный формат email' },
        { status: 400 }
      );
    }

    // Проверка пароля
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }

    // Проверяем, может ли пользователь с указанной ролью регистрироваться самостоятельно
    if (role && !canSelfRegister(role)) {
      return NextResponse.json(
        { error: 'Регистрация с данной ролью недоступна. Обратитесь к администратору организации.' },
        { status: 403 }
      );
    }

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Для ролей, которые могут регистрироваться самостоятельно, 
    // но требуют указания организации
    const finalOrganizationId = organizationId;
    
    if (role === 'PRIMARY_MEMBER' && !organizationId) {
      return NextResponse.json(
        { error: 'Для регистрации члена профсоюза необходимо указать организацию' },
        { status: 400 }
      );
    }

    // Создаем пользователя в базе данных
    const newUser = await createUser({
      email,
      password,
      firstName,
      lastName,
      middleName: middleName || undefined,
      phone,
      role: role || 'PRIMARY_MEMBER', // По умолчанию - член профсоюза
      organizationId: finalOrganizationId
    });

    // Генерируем JWT токен
    const token = createToken({
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      middleName: newUser.middleName || undefined,
      phone: newUser.phone,
      role: newUser.role,
      organizationId: newUser.organizationId,
      organizationName: 'Первичная организация',
      organizationType: 'PRIMARY' as OrganizationType,
      avatar: newUser.avatar || undefined,
      isActive: newUser.isActive,
      emailVerified: newUser.emailVerified,
      membershipValidated: newUser.membershipValidated
    });

    // Устанавливаем cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 дней
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        middleName: newUser.middleName || undefined,
        phone: newUser.phone,
        role: newUser.role,
        organizationId: newUser.organizationId
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    
    // Логируем детали ошибки только в development
    if (process.env.NODE_ENV === 'development') {
      console.error('Register error details:', error);
    }
    
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { firstName, lastName, phone } = await request.json();

    // Валидация
    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    // Здесь должен быть запрос к базе данных для обновления пользователя
    // Пока возвращаем успешный ответ

    return NextResponse.json({
      success: true,
      message: 'Регистрация завершена успешно'
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    // Логируем детали ошибки только в development
    if (process.env.NODE_ENV === 'development') {
      console.error('Update user error details:', error);
    }
    
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

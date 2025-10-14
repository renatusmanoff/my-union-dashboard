import { NextRequest, NextResponse } from 'next/server';
import { createToken, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, middleName, phone, organizationId } = await request.json();

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

    // Здесь должен быть запрос к базе данных для проверки существующего пользователя
    // Пока используем моковую проверку
    if (email === 'admin@example.com') {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Хешируем пароль (пока не используем, но будет нужно для базы данных)
    await hashPassword(password);

    // Создаем пользователя (здесь должен быть запрос к базе данных)
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      firstName,
      lastName,
      middleName: middleName || null,
      phone,
      role: 'MEMBER' as const,
      organizationId: organizationId || 'org-default',
      isActive: true,
      emailVerified: false
    };

    // Генерируем JWT токен
    const token = createToken({
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      middleName: newUser.middleName,
      phone: newUser.phone,
      role: newUser.role,
      organizationId: newUser.organizationId,
      organizationName: 'Первичная организация',
      organizationType: 'PRIMARY',
      avatar: undefined,
      isActive: newUser.isActive,
      emailVerified: newUser.emailVerified,
      membershipValidated: false
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
        middleName: newUser.middleName,
        phone: newUser.phone,
        role: newUser.role,
        organizationId: newUser.organizationId
      }
    });

  } catch (error) {
    console.error('Register error:', error);
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
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

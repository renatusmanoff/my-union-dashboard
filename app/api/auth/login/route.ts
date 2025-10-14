import { NextRequest, NextResponse } from 'next/server';
import { createToken, verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Здесь должен быть запрос к базе данных
    // Пока используем моковые данные
    const mockUser = {
      id: 'user-1',
      email: 'admin@example.com',
      hashedPassword: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      firstName: 'Иван',
      lastName: 'Иванов',
      middleName: 'Петрович',
      phone: '+7 (495) 123-45-67',
      role: 'ADMIN' as const,
      organizationId: 'org-1',
      isActive: true,
      emailVerified: true
    };

    // Проверяем пользователя
    if (email !== mockUser.email) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    const isPasswordValid = await verifyPassword(password, mockUser.hashedPassword);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Генерируем JWT токен
    const token = createToken({
      id: mockUser.id,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      middleName: mockUser.middleName,
      phone: mockUser.phone,
      role: mockUser.role,
      organizationId: mockUser.organizationId,
      organizationName: 'Центральный комитет профсоюза',
      avatar: undefined
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
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        middleName: mockUser.middleName,
        phone: mockUser.phone,
        role: mockUser.role,
        organizationId: mockUser.organizationId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

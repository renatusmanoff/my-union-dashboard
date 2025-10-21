import { NextRequest, NextResponse } from 'next/server';
import { createToken, verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { UserRole } from '@prisma/client';
import { OrganizationType } from '@/types';
import { prisma } from '@/lib/database';

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

    // Проверяем пользователя и пароль в базе данных
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Проверяем, активен ли пользователь
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Аккаунт заблокирован' },
        { status: 403 }
      );
    }

    // Генерируем JWT токен
    const token = createToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName || undefined,
      phone: user.phone,
      role: user.role as UserRole,
      organizationId: user.organizationId || '',
      organizationName: user.organization?.name || 'Неизвестная организация',
      organizationType: user.organization?.type as OrganizationType || 'PRIMARY',
      avatar: user.avatar || undefined,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      membershipValidated: user.membershipValidated
    });

    // Устанавливаем cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: true, // Enable secure for HTTPS
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 дней
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        phone: user.phone,
        role: user.role,
        organizationId: user.organizationId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Логируем детали ошибки только в development
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error details:', error);
    }
    
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
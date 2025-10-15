import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { findUserById } from '@/lib/db';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    // Получаем актуальные данные пользователя из базы данных
    const user = await findUserById(currentUser.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

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
        organizationId: user.organizationId,
        organizationName: user.organization?.name,
        organizationType: user.organization?.type,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        membershipValidated: user.membershipValidated
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    
    // Логируем детали ошибки только в development
    if (process.env.NODE_ENV === 'development') {
      console.error('Get user error details:', error);
    }
    
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

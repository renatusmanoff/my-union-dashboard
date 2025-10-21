import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/database';

export async function GET() {
  const start = Date.now();
  
  try {
    console.log('🔍 [DEBUG] Starting /api/auth/me request');
    
    const currentUser = await getCurrentUser();
    console.log('🔍 [DEBUG] getCurrentUser result:', currentUser ? 'User found' : 'No user');

    if (!currentUser) {
      console.log('🔍 [DEBUG] No current user, returning 401');
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    console.log('🔍 [DEBUG] Fetching user from database...');
    // Получаем актуальные данные пользователя из базы данных
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
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
    
    console.log('🔍 [DEBUG] Database query completed, user found:', !!user);
    
    if (!user) {
      console.log('🔍 [DEBUG] User not found in database, returning 404');
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const duration = Date.now() - start;
    console.log(`🔍 [DEBUG] Request completed in ${duration}ms`);

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
      },
      debug: {
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
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

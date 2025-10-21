import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/database';

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
        organizationName: user.organization?.name || null,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
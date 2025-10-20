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

    // Только супер-администраторы могут видеть всех членов
    if (currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Получаем только тех пользователей с ролью PRIMARY_MEMBER, 
    // у которых есть одобренное заявление на вступление в профсоюз
    const members = await prisma.user.findMany({
      where: {
        role: 'PRIMARY_MEMBER',
        membershipApplications: {
          some: {
            status: 'APPROVED'
          }
        }
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        membershipApplications: {
          select: {
            id: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        lastName: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      members
    });

  } catch (error) {
    console.error('Get all members error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Получаем новости из базы данных
    const news = await prisma.news.findMany({
      where: {
        isPublished: true
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    const total = await prisma.news.count({
      where: {
        isPublished: true
      }
    });

    return NextResponse.json({
      success: true,
      news,
      total,
      limit,
      offset
    });

  } catch (error) {
    console.error('Get news error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

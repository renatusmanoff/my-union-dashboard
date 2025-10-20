import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

// GET - получение списка пользователей для админки
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    // Проверяем права доступа
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
    const isChairman = ['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN'].includes(currentUser.role);

    if (!isSuperAdmin && !isChairman) {
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра списка пользователей' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const organizationId = searchParams.get('organizationId');

    const skip = (page - 1) * limit;

    // Формируем условия поиска
    const where: any = {};
    
    // Если не супер-админ, показываем только пользователей своей организации
    if (!isSuperAdmin) {
      where.organizationId = currentUser.organizationId;
    } else if (organizationId) {
      // Супер-админ может фильтровать по организации
      where.organizationId = organizationId;
    }

    // Поиск по имени, фамилии, email
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Получаем пользователей
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          _count: {
            select: {
              membershipApplications: true,
              createdNews: true,
              createdTasks: true,
              createdDocuments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    // Получаем список организаций для фильтра (только для супер-админа)
    let organizations: Array<{id: string, name: string, type: string}> = [];
    if (isSuperAdmin) {
      organizations = await prisma.organization.findMany({
        select: {
          id: true,
          name: true,
          type: true
        },
        orderBy: { name: 'asc' }
      });
    }

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      organizations,
      canDelete: isSuperAdmin || isChairman
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при получении списка пользователей',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

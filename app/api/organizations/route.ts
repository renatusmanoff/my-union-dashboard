import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, canCreateOrganizations } from '@/lib/auth';
    id: '2',
import { prisma } from '@/lib/database';

// GET - получение списка организаций
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
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // Строим фильтры для запроса
    const where: any = {
      isActive: true
    };

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { chairmanName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const organizations = await prisma.organization.findMany({
      where,
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      organizations
    });

  } catch (error) {
    console.error('Get organizations error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST - создание новой организации
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    if (!canCreateOrganizations(currentUser.role)) {
      return NextResponse.json(
        { error: 'Недостаточно прав для создания организаций' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, industry, type, parentId, address, phone, email, chairmanName, inn } = body;

    // Валидация
    if (!name || !industry || !type || !address || !phone || !email) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    // Проверяем, что тип организации валидный
    const validTypes = ['FEDERAL', 'REGIONAL', 'LOCAL', 'PRIMARY'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Некорректный тип организации' },
        { status: 400 }
      );
    }

    // Создаем новую организацию
    const newOrganization = await prisma.organization.create({
      data: {
        name,
        industry,
        type,
        parentId: parentId || null,
        address,
        phone,
        email,
        chairmanName: chairmanName || null,
        chairmanId: chairmanName ? `chairman-${Date.now()}` : null,
        inn: inn || null
      },
      include: {
        parent: true,
        children: true
      }
    });

    return NextResponse.json({
      success: true,
      organization: newOrganization,
      message: 'Организация успешно создана'
    });

  } catch (error) {
    console.error('Create organization error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
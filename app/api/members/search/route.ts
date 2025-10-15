import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/database';

// POST - поиск членов профсоюза
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { organizationId, searchTerm, searchType } = body;

    if (!organizationId || !searchTerm) {
      return NextResponse.json(
        { error: 'Необходимо указать организацию и поисковый запрос' },
        { status: 400 }
      );
    }

    // Строим фильтры для поиска
    const where: any = {
      organizationId,
      isActive: true
    };

    if (searchType === 'name') {
      // Поиск по ФИО
      const searchLower = searchTerm.toLowerCase();
      where.OR = [
        { firstName: { contains: searchLower, mode: 'insensitive' } },
        { lastName: { contains: searchLower, mode: 'insensitive' } },
        { middleName: { contains: searchLower, mode: 'insensitive' } }
      ];
    } else if (searchType === 'email') {
      // Поиск по email
      where.email = { contains: searchTerm, mode: 'insensitive' };
    } else if (searchType === 'phone') {
      // Поиск по телефону
      const cleanSearchTerm = searchTerm.replace(/\D/g, ''); // Убираем все не-цифры
      where.phone = { contains: cleanSearchTerm };
    }

    const members = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        email: true,
        phone: true,
        role: true,
        organizationId: true,
        isActive: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      members,
      count: members.length
    });

  } catch (error) {
    console.error('Search members error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// GET - получение всех членов организации (для администраторов)
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
    const organizationId = searchParams.get('organizationId');

    // Строим фильтры для запроса
    const where: any = {};

    if (organizationId) {
      where.organizationId = organizationId;
    } else if (currentUser.organizationId && currentUser.role !== 'SUPER_ADMIN') {
      // Если не супер-админ, показываем только членов своей организации
      where.organizationId = currentUser.organizationId;
    }

    const members = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        email: true,
        phone: true,
        role: true,
        organizationId: true,
        isActive: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      members,
      count: members.length
    });

  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
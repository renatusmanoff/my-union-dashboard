import { NextRequest, NextResponse } from 'next/server';
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

    // Получаем организации из базы данных
    const organizations = await prisma.organization.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        parentId: true,
        address: true,
        phone: true,
        email: true,
        chairmanId: true,
        chairmanName: true,
        inn: true,
        membersCount: true,
        isActive: true,
        isMain: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { name: 'asc' }
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
    const { name, type, address, phone, email, parentId, chairmanName, inn } = body;

    if (!name || !type || !address || !phone || !email) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        type,
        address,
        phone,
        email,
        parentId: parentId || null,
        chairmanName: chairmanName || null,
        inn: inn || null,
        isActive: true,
        isMain: false
      }
    });

    return NextResponse.json({
      success: true,
      organization
    });

  } catch (error) {
    console.error('Create organization error:', error);
    
    // Проверяем наличие ошибки unique constraint
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json(
        { error: 'Организация с таким email уже существует' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Ошибка при создании организации' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    // Проверяем права доступа
    if (currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Недостаточно прав для удаления организации' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('id');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'ID организации не указан' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли организация
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        users: true,
        children: true
      }
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Организация не найдена' },
        { status: 404 }
      );
    }

    // Нельзя удалить главную организацию
    if (organization.isMain) {
      return NextResponse.json(
        { error: 'Главную организацию нельзя удалить' },
        { status: 400 }
      );
    }

    // Проверяем, есть ли дочерние организации
    if (organization.children.length > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить организацию, у которой есть дочерние организации' },
        { status: 400 }
      );
    }

    // Удаляем организацию (каскадное удаление пользователей произойдет автоматически)
    await prisma.organization.delete({
      where: { id: organizationId }
    });

    return NextResponse.json({
      success: true,
      message: 'Организация успешно удалена'
    });

  } catch (error) {
    console.error('Delete organization error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
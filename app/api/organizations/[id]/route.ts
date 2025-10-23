import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Проверяем, существует ли организация
    const existingOrg = await prisma.organization.findUnique({
      where: { id: params.id }
    });

    if (!existingOrg) {
      return NextResponse.json(
        { error: 'Организация не найдена' },
        { status: 404 }
      );
    }

    // Нельзя изменить тип главной организации
    if (existingOrg.isMain && type !== existingOrg.type) {
      return NextResponse.json(
        { error: 'Нельзя изменить тип главной организации' },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.update({
      where: { id: params.id },
      data: {
        name,
        type,
        address,
        phone,
        email,
        parentId: parentId || null,
        chairmanName: chairmanName || null,
        inn: inn || null
      }
    });

    return NextResponse.json({
      success: true,
      organization
    });

  } catch (error) {
    console.error('Update organization error:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json(
        { error: 'Организация с таким email уже существует' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Ошибка при обновлении организации' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Проверяем, существует ли организация
    const organization = await prisma.organization.findUnique({
      where: { id: params.id },
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

    // Проверяем, есть ли пользователи в организации
    if (organization.users.length > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить организацию, в которой есть пользователи' },
        { status: 400 }
      );
    }

    await prisma.organization.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Организация удалена успешно'
    });

  } catch (error) {
    console.error('Delete organization error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении организации' },
      { status: 500 }
    );
  }
}
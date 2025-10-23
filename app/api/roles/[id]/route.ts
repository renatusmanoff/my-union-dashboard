import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/roles/[id] - Получить роль по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const role = await prisma.role.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Роль не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({ role });
  } catch (error) {
    console.error('Ошибка получения роли:', error);
    return NextResponse.json(
      { error: 'Ошибка получения роли' },
      { status: 500 }
    );
  }
}

// PUT /api/roles/[id] - Обновить роль
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, permissions } = body;

    const existingRole = await prisma.role.findUnique({
      where: { id: params.id }
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: 'Роль не найдена' },
        { status: 404 }
      );
    }

    if (existingRole.isSystem) {
      return NextResponse.json(
        { error: 'Системные роли нельзя редактировать' },
        { status: 400 }
      );
    }

    const role = await prisma.role.update({
      where: { id: params.id },
      data: {
        name,
        description,
        permissions
      }
    });

    return NextResponse.json({ role });
  } catch (error) {
    console.error('Ошибка обновления роли:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления роли' },
      { status: 500 }
    );
  }
}

// DELETE /api/roles/[id] - Удалить роль
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingRole = await prisma.role.findUnique({
      where: { id: params.id },
      include: {
        users: true
      }
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: 'Роль не найдена' },
        { status: 404 }
      );
    }

    if (existingRole.isSystem) {
      return NextResponse.json(
        { error: 'Системные роли нельзя удалять' },
        { status: 400 }
      );
    }

    if (existingRole.users.length > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить роль, которая назначена пользователям' },
        { status: 400 }
      );
    }

    await prisma.role.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Роль удалена успешно' });
  } catch (error) {
    console.error('Ошибка удаления роли:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления роли' },
      { status: 500 }
    );
  }
}

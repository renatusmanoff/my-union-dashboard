import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/roles - Получить все роли
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ roles });
  } catch (error) {
    console.error('Ошибка получения ролей:', error);
    return NextResponse.json(
      { error: 'Ошибка получения ролей' },
      { status: 500 }
    );
  }
}

// POST /api/roles - Создать новую роль
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, permissions } = body;

    if (!name || !permissions) {
      return NextResponse.json(
        { error: 'Название и права доступа обязательны' },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions,
        isSystem: false
      }
    });

    return NextResponse.json({ role });
  } catch (error) {
    console.error('Ошибка создания роли:', error);
    return NextResponse.json(
      { error: 'Ошибка создания роли' },
      { status: 500 }
    );
  }
}

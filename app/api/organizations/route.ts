import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createOrganization } from '@/lib/db';
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
        address: true,
        phone: true,
        email: true,
        isActive: true,
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
    const { name, type, address, phone, email, parentId, industry } = body;

    if (!name || !type || !address || !phone || !email) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    const organization = await createOrganization({
      name,
      type,
      address,
      phone,
      email,
      parentId,
      industry: industry || 'EDUCATION'
    });

    return NextResponse.json({
      success: true,
      organization
    });

  } catch (error) {
    console.error('Create organization error:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании организации' },
      { status: 500 }
    );
  }
}
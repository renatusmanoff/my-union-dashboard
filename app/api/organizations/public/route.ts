import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

// GET - получение публичного списка организаций (без авторизации)
export async function GET() {
  try {
    // Возвращаем только активные организации
    const organizations = await prisma.organization.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        address: true,
        phone: true,
        email: true,
        chairmanName: true,
        inn: true,
        membersCount: true,
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
    console.error('Get public organizations error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
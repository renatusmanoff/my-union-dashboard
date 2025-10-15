import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Получаем все активные организации
    const organizations = await prisma.organization.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        type: true,
        address: true,
        phone: true,
        email: true,
        membersCount: true
      },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      organizations
    });

  } catch (error) {
    console.error('Error fetching organizations:', error);
    
    return NextResponse.json(
      { 
        error: 'Ошибка получения списка организаций',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

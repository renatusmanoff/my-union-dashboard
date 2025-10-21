import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    const userId = verified.payload.userId as string;

    // Получаем пользователя и его организацию
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization' }, { status: 400 });
    }

    // Получаем всех членов организации
    const members = await prisma.user.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        email: true,
        role: true,
        phone: true
      },
      orderBy: [
        { role: 'asc' },
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      members
    });
  } catch (error) {
    console.error('Get organization members error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

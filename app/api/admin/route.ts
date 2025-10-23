import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    // Получаем только руководителей (председатели и их заместители)
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: [
            'SUPER_ADMIN',
            'REGIONAL_CHAIRMAN',
            'REGIONAL_VICE_CHAIRMAN',
            'LOCAL_CHAIRMAN',
            'LOCAL_VICE_CHAIRMAN',
            'PRIMARY_CHAIRMAN',
            'PRIMARY_VICE_CHAIRMAN'
          ]
        },
        isActive: true
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      admins: admins.map(admin => ({
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        middleName: admin.middleName,
        phone: admin.phone,
        role: admin.role,
        organizationId: admin.organizationId,
        organizationName: admin.organization?.name,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }))
    });

  } catch (error) {
    console.error('Get admins error:', error);
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
    const { email, firstName, lastName, middleName, phone, birthDate, role, organizationId, generateNewPassword } = body;

    if (!email || !firstName || !lastName || !phone || !role || !organizationId) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли организация
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Организация не найдена' },
        { status: 404 }
      );
    }

    // Генерируем пароль
    const password = generateNewPassword ? Math.random().toString(36).substring(2, 15) : '123321ZxQ@*';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        middleName: middleName || null,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        role,
        organizationId,
        isActive: true,
        emailVerified: true,
        membershipValidated: true
      }
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        middleName: admin.middleName,
        phone: admin.phone,
        role: admin.role,
        organizationId: admin.organizationId,
        isActive: admin.isActive
      },
      password: generateNewPassword ? password : null
    });

  } catch (error) {
    console.error('Create admin error:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Ошибка при создании администратора' },
      { status: 500 }
    );
  }
}
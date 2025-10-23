import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/employees - Получить всех сотрудников
export async function GET() {
  try {
    const employees = await prisma.user.findMany({
      where: {
        role: {
          notIn: [
            'SUPER_ADMIN',
            'REGIONAL_CHAIRMAN',
            'REGIONAL_VICE_CHAIRMAN',
            'LOCAL_CHAIRMAN',
            'LOCAL_VICE_CHAIRMAN',
            'PRIMARY_CHAIRMAN',
            'PRIMARY_VICE_CHAIRMAN'
          ]
        }
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

    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Ошибка получения сотрудников:', error);
    return NextResponse.json(
      { error: 'Ошибка получения сотрудников' },
      { status: 500 }
    );
  }
}

// POST /api/employees - Создать нового сотрудника
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      firstName, 
      lastName, 
      middleName, 
      phone, 
      birthDate,
      roleId, 
      organizationId,
      generateNewPassword = true 
    } = body;

    if (!email || !firstName || !lastName || !phone || !roleId || !organizationId) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Генерируем пароль
    const bcrypt = await import('bcryptjs');
    const password = generateNewPassword ? Math.random().toString(36).slice(-8) : 'temp123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        middleName,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        role: 'PRIMARY_MEMBER', // Базовая роль
        customRoleId: roleId, // Кастомная роль
        organizationId,
        password: hashedPassword,
        isActive: true,
        emailVerified: true,
        membershipValidated: true
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    // TODO: Отправить email с паролем пользователю
    // if (generateNewPassword) {
    //   await sendPasswordEmail(email, password);
    // }

    return NextResponse.json({ 
      user,
      password: generateNewPassword ? password : undefined
    });
  } catch (error) {
    console.error('Ошибка создания сотрудника:', error);
    return NextResponse.json(
      { error: 'Ошибка создания сотрудника' },
      { status: 500 }
    );
  }
}
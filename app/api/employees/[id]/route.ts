import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/employees/[id] - Получить сотрудника по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await prisma.user.findUnique({
      where: { id: params.id },
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

    if (!employee) {
      return NextResponse.json(
        { error: 'Сотрудник не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ employee });
  } catch (error) {
    console.error('Ошибка получения сотрудника:', error);
    return NextResponse.json(
      { error: 'Ошибка получения сотрудника' },
      { status: 500 }
    );
  }
}

// PUT /api/employees/[id] - Обновить сотрудника
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      email, 
      firstName, 
      lastName, 
      middleName, 
      phone, 
      birthDate,
      role, 
      organizationId,
      isActive 
    } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Сотрудник не найден' },
        { status: 404 }
      );
    }

    // Проверяем, не занят ли email другим пользователем
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Пользователь с таким email уже существует' },
          { status: 400 }
        );
      }
    }

    const employee = await prisma.user.update({
      where: { id: params.id },
      data: {
        email,
        firstName,
        lastName,
        middleName,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        role,
        organizationId,
        isActive
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

    return NextResponse.json({ employee });
  } catch (error) {
    console.error('Ошибка обновления сотрудника:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления сотрудника' },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id] - Удалить сотрудника
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Сотрудник не найден' },
        { status: 404 }
      );
    }

    // Нельзя удалить супер-администратора
    if (existingUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Нельзя удалить супер-администратора' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Сотрудник удален успешно' });
  } catch (error) {
    console.error('Ошибка удаления сотрудника:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления сотрудника' },
      { status: 500 }
    );
  }
}

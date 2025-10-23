import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/database';
import bcrypt from 'bcryptjs';

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
    const { firstName, lastName, middleName, phone, role, organizationId, generateNewPassword } = body;

    if (!firstName || !lastName || !phone || !role || !organizationId) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли администратор
    const existingAdmin = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { error: 'Администратор не найден' },
        { status: 404 }
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

    const updateData: any = {
      firstName,
      lastName,
      middleName: middleName || null,
      phone,
      role,
      organizationId
    };

    // Если нужно сгенерировать новый пароль
    if (generateNewPassword) {
      const newPassword = Math.random().toString(36).substring(2, 15);
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const admin = await prisma.user.update({
      where: { id: params.id },
      data: updateData
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
      }
    });

  } catch (error) {
    console.error('Update admin error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении администратора' },
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
        { error: 'Недостаточно прав для удаления администратора' },
        { status: 403 }
      );
    }

    // Проверяем, существует ли администратор
    const admin = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Администратор не найден' },
        { status: 404 }
      );
    }

    // Нельзя удалить супер-администратора
    if (admin.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Нельзя удалить супер-администратора' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Администратор удален успешно'
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении администратора' },
      { status: 500 }
    );
  }
}

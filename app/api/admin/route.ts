import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isSuperAdmin } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { hashPassword } from '@/lib/auth';
import { sendAdminCredentials } from '@/lib/email';

// Функция для генерации временного пароля
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// GET - получение списка администраторов
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    if (!isSuperAdmin(currentUser.role)) {
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра администраторов' },
        { status: 403 }
      );
    }

    // Получаем всех пользователей с ролями администраторов
    const admins = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'FEDERAL_CHAIRMAN' },
          { role: 'REGIONAL_CHAIRMAN' },
          { role: 'LOCAL_CHAIRMAN' },
          { role: 'PRIMARY_CHAIRMAN' }
        ]
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
        { organization: { name: 'asc' } },
        { lastName: 'asc' }
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
        organizationName: admin.organization?.name || 'Неизвестная организация',
        organizationType: admin.organization?.type || 'UNKNOWN',
        isActive: admin.isActive,
        emailVerified: admin.emailVerified,
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

// PUT - обновление администратора
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    if (!isSuperAdmin(currentUser.role)) {
      return NextResponse.json(
        { error: 'Недостаточно прав для редактирования администраторов' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, email, firstName, lastName, middleName, phone, role, organizationId, generateNewPassword } = body;

    // Валидация
    if (!id || !email || !firstName || !lastName || !phone || !role || !organizationId) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли администратор
    const existingAdmin = await prisma.user.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            name: true,
            type: true
          }
        }
      }
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { error: 'Администратор не найден' },
        { status: 404 }
      );
    }

    // Проверяем, что email уникален (если изменился)
    if (email !== existingAdmin.email) {
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

    // Подготавливаем данные для обновления
    const updateData: Record<string, unknown> = {
      email,
      firstName,
      lastName,
      middleName: middleName || null,
      phone,
      role,
      organizationId
    };

    // Если нужно сгенерировать новый пароль
    let newPassword = null;
    if (generateNewPassword) {
      newPassword = generateTemporaryPassword();
      updateData.password = await hashPassword(newPassword);
    }

    // Обновляем администратора
    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        organization: {
          select: {
            name: true,
            type: true
          }
        }
      }
    });

    // Обновляем данные председателя в организации (если это председатель)
    if (['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN'].includes(role)) {
      const chairmanFullName = `${firstName} ${lastName}${middleName ? ' ' + middleName : ''}`;
      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          chairmanId: id,
          chairmanName: chairmanFullName
        }
      });
    }

    // Отправляем email с новыми данными (если сгенерирован новый пароль)
    let emailSent = false;
    if (generateNewPassword && newPassword) {
      emailSent = await sendAdminCredentials({
        email: updatedAdmin.email,
        firstName: updatedAdmin.firstName,
        lastName: updatedAdmin.lastName,
        temporaryPassword: newPassword,
        role: updatedAdmin.role,
        organizationName: updatedAdmin.organization?.name || 'Неизвестная организация'
      });
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        firstName: updatedAdmin.firstName,
        lastName: updatedAdmin.lastName,
        middleName: updatedAdmin.middleName,
        phone: updatedAdmin.phone,
        role: updatedAdmin.role,
        organizationId: updatedAdmin.organizationId,
        organizationName: updatedAdmin.organization?.name || 'Неизвестная организация',
        isActive: updatedAdmin.isActive,
        emailVerified: updatedAdmin.emailVerified,
        createdAt: updatedAdmin.createdAt,
        updatedAt: updatedAdmin.updatedAt
      },
      emailSent,
      newPassword: generateNewPassword ? newPassword : undefined,
      message: generateNewPassword 
        ? (emailSent ? 'Администратор обновлен и новый пароль отправлен на email' : 'Администратор обновлен, но не удалось отправить email с новым паролем')
        : 'Администратор успешно обновлен'
    });

  } catch (error) {
    console.error('Update admin error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - удаление администратора
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    if (!isSuperAdmin(currentUser.role)) {
      return NextResponse.json(
        { error: 'Недостаточно прав для удаления администраторов' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID администратора обязателен' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли администратор
    const existingAdmin = await prisma.user.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { error: 'Администратор не найден' },
        { status: 404 }
      );
    }

    // Нельзя удалить самого себя
    if (id === currentUser.id) {
      return NextResponse.json(
        { error: 'Нельзя удалить самого себя' },
        { status: 400 }
      );
    }

    // Если это председатель, очищаем данные председателя в организации
    if (['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN'].includes(existingAdmin.role)) {
      await prisma.organization.update({
        where: { id: existingAdmin.organizationId! },
        data: {
          chairmanId: null,
          chairmanName: null
        }
      });
    }

    // Удаляем администратора
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Администратор успешно удален'
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

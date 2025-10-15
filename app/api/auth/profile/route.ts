import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, verifyPassword, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/database';

// PUT - обновление профиля пользователя
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      middleName, 
      phone, 
      currentPassword, 
      newPassword 
    } = body;

    // Валидация обязательных полей
    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'Имя, фамилия и телефон обязательны для заполнения' },
        { status: 400 }
      );
    }

    // Если пользователь хочет изменить пароль
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Для изменения пароля необходимо указать текущий пароль' },
          { status: 400 }
        );
      }

      // Проверяем текущий пароль
      const user = await prisma.user.findUnique({
        where: { id: currentUser.id }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Пользователь не найден' },
          { status: 404 }
        );
      }

      const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Неверный текущий пароль' },
          { status: 400 }
        );
      }

      // Хешируем новый пароль
      const hashedNewPassword = await hashPassword(newPassword);

      // Обновляем пользователя с новым паролем
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          firstName,
          lastName,
          middleName: middleName || null,
          phone,
          password: hashedNewPassword
        }
      });
    } else {
      // Обновляем только личные данные без изменения пароля
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          firstName,
          lastName,
          middleName: middleName || null,
          phone
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Профиль успешно обновлен'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, canValidateMembership } from '@/lib/auth';
import { MembershipValidation } from '@/types';
import { sendMembershipValidationEmail } from '@/lib/email';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    // Проверяем авторизацию
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    // Проверяем права на валидацию
    if (!canValidateMembership(currentUser.role)) {
      return NextResponse.json(
        { error: 'Недостаточно прав для валидации членства' },
        { status: 403 }
      );
    }

    // Получаем заявления на членство из базы данных
    const where: any = {};
    
    // Если пользователь не супер-администратор, показываем только заявления его организации
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.organizationId) {
      where.organizationId = currentUser.organizationId;
    }

    const applications = await prisma.membershipApplication.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Преобразуем заявления в формат валидации
    const validations = applications.map(app => ({
      id: app.id,
      userId: app.email, // Используем email как идентификатор пользователя
      organizationId: app.organizationId,
      status: app.status,
      requestedAt: app.createdAt,
      notes: app.notes || `Заявление от ${app.firstName} ${app.lastName}`,
      application: app
    }));

    return NextResponse.json({
      success: true,
      validations
    });

  } catch (error) {
    console.error('Get validations error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    // Проверяем права на валидацию
    if (!canValidateMembership(currentUser.role)) {
      return NextResponse.json(
        { error: 'Недостаточно прав для валидации членства' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { validationId, status, notes } = body;

    // Валидация
    if (!validationId || !status) {
      return NextResponse.json(
        { error: 'ID валидации и статус обязательны' },
        { status: 400 }
      );
    }

    const validStatuses = ['APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Некорректный статус' },
        { status: 400 }
      );
    }

    // Здесь должен быть запрос к базе данных для обновления статуса
    // Пока возвращаем успешный ответ
    const updatedValidation: MembershipValidation = {
      id: validationId,
      userId: 'member-1',
      organizationId: currentUser.organizationId,
      status: status as 'APPROVED' | 'REJECTED',
      requestedAt: new Date(Date.now() - 86400000),
      validatedAt: new Date(),
      validatedBy: currentUser.id,
      notes
    };

    // Отправляем email уведомление (моковые данные пользователя)
    const emailSent = await sendMembershipValidationEmail(
      'member@example.com', // В реальности получаем из БД
      'Иван', // В реальности получаем из БД
      'Петров', // В реальности получаем из БД
      status as 'APPROVED' | 'REJECTED',
      currentUser.organizationName
    );

    if (!emailSent) {
      console.warn('Failed to send membership validation email');
    }

    return NextResponse.json({
      success: true,
      validation: updatedValidation,
      emailSent,
      message: emailSent 
        ? `Членство ${status === 'APPROVED' ? 'одобрено' : 'отклонено'} и уведомление отправлено`
        : `Членство ${status === 'APPROVED' ? 'одобрено' : 'отклонено'}, но не удалось отправить уведомление`
    });

  } catch (error) {
    console.error('Update validation error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

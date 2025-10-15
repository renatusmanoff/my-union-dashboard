import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, canValidateMembership } from '@/lib/auth';
import { prisma } from '@/lib/database';

// GET - получение заявления по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const application = await prisma.membershipApplication.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
            industry: true
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Заявление не найдено' },
        { status: 404 }
      );
    }

    // Проверяем права доступа
    if (currentUser.role !== 'SUPER_ADMIN' && 
        currentUser.organizationId !== application.organizationId) {
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра этого заявления' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      application
    });

  } catch (error) {
    console.error('Get application error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT - обновление статуса заявления (одобрение/отклонение)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    if (!canValidateMembership(currentUser.role)) {
      return NextResponse.json(
        { error: 'Недостаточно прав для обработки заявлений' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, rejectionReason } = body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Некорректный статус' },
        { status: 400 }
      );
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return NextResponse.json(
        { error: 'При отклонении необходимо указать причину' },
        { status: 400 }
      );
    }

    const application = await prisma.membershipApplication.findUnique({
      where: { id }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Заявление не найдено' },
        { status: 404 }
      );
    }

    // Проверяем права доступа
    if (currentUser.role !== 'SUPER_ADMIN' && 
        currentUser.organizationId !== application.organizationId) {
      return NextResponse.json(
        { error: 'Недостаточно прав для обработки этого заявления' },
        { status: 403 }
      );
    }

    // Обновляем заявление
    const updatedApplication = await prisma.membershipApplication.update({
      where: { id },
      data: {
        status,
        reviewedBy: currentUser.id,
        reviewedAt: new Date(),
        rejectionReason: status === 'REJECTED' ? rejectionReason : null
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
            industry: true
          }
        }
      }
    });

    // Если заявление одобрено, создаем нового члена профсоюза
    if (status === 'APPROVED') {
      try {
        await prisma.user.create({
          data: {
            email: application.email,
            password: await import('@/lib/auth').then(m => m.hashPassword('TempPassword123!')), // Временный пароль
            firstName: application.firstName,
            lastName: application.lastName,
            middleName: application.middleName,
            phone: application.phone,
            role: 'PRIMARY_MEMBER',
            organizationId: application.organizationId,
            isActive: true,
            emailVerified: false,
            membershipValidated: true
          }
        });
        console.log('✅ New union member created:', application.email);
      } catch (error) {
        console.error('❌ Error creating union member:', error);
        // Продолжаем выполнение, так как заявление уже обновлено
      }
    }

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      message: status === 'APPROVED' ? 'Заявление одобрено' : 'Заявление отклонено'
    });

  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - удаление заявления
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    if (!canValidateMembership(currentUser.role)) {
      return NextResponse.json(
        { error: 'Недостаточно прав для удаления заявлений' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const application = await prisma.membershipApplication.findUnique({
      where: { id }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Заявление не найдено' },
        { status: 404 }
      );
    }

    // Проверяем права доступа
    if (currentUser.role !== 'SUPER_ADMIN' && 
        currentUser.organizationId !== application.organizationId) {
      return NextResponse.json(
        { error: 'Недостаточно прав для удаления этого заявления' },
        { status: 403 }
      );
    }

    // Удаляем заявление
    const deletedApplication = await prisma.membershipApplication.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Заявление удалено',
      application: deletedApplication
    });

  } catch (error) {
    console.error('Delete application error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
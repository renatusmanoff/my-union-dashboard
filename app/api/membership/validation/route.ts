import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    // Проверяем, что пользователь является председателем или супер-администратором
    const isChairman = ['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN'].includes(currentUser.role);
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
    
    if (!isChairman && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра заявлений' },
        { status: 403 }
      );
    }

    // Определяем, какие заявления показывать
    let whereClause = {};
    
    if (isSuperAdmin) {
      // Супер-администратор видит все заявления
      whereClause = {};
    } else {
      // Председатели видят заявления своей организации
      whereClause = { organizationId: currentUser.organizationId };
    }

    // Получаем заявления
    const applications = await prisma.membershipApplication.findMany({
      where: whereClause,
      include: {
        organization: true,
        documents: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            middleName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      applications
    });

  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    // Проверяем, что пользователь является председателем или супер-администратором
    const isChairman = ['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN'].includes(currentUser.role);
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
    
    if (!isChairman && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Недостаточно прав для изменения заявлений' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { applicationId, status, rejectionReason } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'ID заявления и статус обязательны' },
        { status: 400 }
      );
    }

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Некорректный статус' },
        { status: 400 }
      );
    }

    // Обновляем заявление
    const updatedApplication = await prisma.membershipApplication.update({
      where: { id: applicationId },
      data: {
        status,
        reviewedBy: currentUser.id,
        reviewedAt: new Date(),
        rejectionReason: status === 'REJECTED' ? rejectionReason : null
      },
      include: {
        organization: true,
        documents: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            middleName: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      message: `Заявление ${status === 'APPROVED' ? 'одобрено' : status === 'REJECTED' ? 'отклонено' : 'обновлено'}`
    });

  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
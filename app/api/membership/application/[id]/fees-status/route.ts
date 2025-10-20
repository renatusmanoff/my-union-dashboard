import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/database';

export async function PATCH(
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
    const { feesStatus } = await request.json();

    if (!['PAID', 'NOT_PAID'].includes(feesStatus)) {
      return NextResponse.json(
        { error: 'Неверный статус взносов' },
        { status: 400 }
      );
    }

    // Получаем заявку
    const application = await prisma.membershipApplication.findUnique({
      where: { id },
      include: {
        organization: {
          include: {
            users: {
              where: {
                role: {
                  in: ['PRIMARY_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'FEDERAL_CHAIRMAN']
                }
              }
            }
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

    // Проверяем, что пользователь - председатель этой организации
    const isChairman = application.organization.users.some(u => u.id === currentUser.id);
    if (!isChairman && currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    // Обновляем статус взносов
    const updatedApplication = await prisma.membershipApplication.update({
      where: { id },
      data: {
        feesStatus
      }
    });

    return NextResponse.json({
      success: true,
      application: updatedApplication
    });

  } catch (error) {
    console.error('Error updating fees status:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

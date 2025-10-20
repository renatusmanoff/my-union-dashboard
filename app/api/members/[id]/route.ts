import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/database';

export async function DELETE(
  request: Request,
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

    const memberId = params.id;

    // Получаем информацию о члене
    const member = await prisma.user.findUnique({
      where: { id: memberId },
      include: {
        organization: true,
        membershipApplications: true
      }
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Член профсоюза не найден' },
        { status: 404 }
      );
    }

    // Проверяем права доступа
    const canDelete = 
      currentUser.role === 'SUPER_ADMIN' || // Супер-администратор может удалять любого
      (currentUser.role.includes('CHAIRMAN') && 
       member.organizationId === currentUser.organizationId); // Председатель может удалять только из своей организации

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Недостаточно прав для удаления члена' },
        { status: 403 }
      );
    }

    // Удаляем члена профсоюза
    await prisma.user.delete({
      where: { id: memberId }
    });

    return NextResponse.json({
      success: true,
      message: 'Член профсоюза успешно удален'
    });

  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
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

    const memberId = params.id;
    const body = await request.json();

    // Получаем информацию о члене
    const member = await prisma.user.findUnique({
      where: { id: memberId },
      include: {
        organization: true
      }
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Член профсоюза не найден' },
        { status: 404 }
      );
    }

    // Только супер-администратор может редактировать членов
    if (currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Только супер-администратор может редактировать членов' },
        { status: 403 }
      );
    }

    // Обновляем данные члена
    const updatedMember = await prisma.user.update({
      where: { id: memberId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        middleName: body.middleName,
        phone: body.phone,
        email: body.email,
        organizationId: body.organizationId
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        membershipApplications: {
          select: {
            id: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      member: updatedMember,
      message: 'Данные члена профсоюза обновлены'
    });

  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

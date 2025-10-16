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

    // Получаем документ
    const document = await prisma.membershipDocument.findUnique({
      where: { id },
      include: {
        application: true
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      );
    }

    // Проверяем, что документ принадлежит пользователю или пользователь является председателем
    const isOwner = document.application.userId === currentUser.id;
    const isChairman = ['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN'].includes(currentUser.role) &&
                      document.application.organizationId === currentUser.organizationId;

    if (!isOwner && !isChairman) {
      return NextResponse.json(
        { error: 'Недостаточно прав для подписания документа' },
        { status: 403 }
      );
    }

    // Обновляем статус документа
    const updatedDocument = await prisma.membershipDocument.update({
      where: { id },
      data: {
        status: 'SIGNED',
        signedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      document: updatedDocument,
      message: 'Документ успешно подписан'
    });

  } catch (error) {
    console.error('Sign document error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

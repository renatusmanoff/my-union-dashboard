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

    // Проверяем, что документ принадлежит пользователю
    const isOwner = document.application.userId === currentUser.id;

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Недостаточно прав для отправки документа' },
        { status: 403 }
      );
    }

    // Проверяем, что документ подписан
    if (document.status !== 'SIGNED') {
      return NextResponse.json(
        { error: 'Документ должен быть подписан перед отправкой' },
        { status: 400 }
      );
    }

    // Обновляем статус документа
    const updatedDocument = await prisma.membershipDocument.update({
      where: { id },
      data: {
        sentToUnion: true,
        sentAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      document: updatedDocument,
      message: 'Документ успешно отправлен в профсоюз'
    });

  } catch (error) {
    console.error('Send document error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Получаем заявление
    const application = await prisma.membershipApplication.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Заявление не найдено' },
        { status: 404 }
      );
    }

    // Обновляем статус заявления на "подписать позже"
    await prisma.membershipApplication.update({
      where: { id },
      data: {
        signLater: true
      }
    });

    // Обновляем статус всех документов на "не подписано"
    await prisma.membershipDocument.updateMany({
      where: {
        applicationId: id
      },
      data: {
        status: 'NOT_SIGNED',
        signedAt: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Заявление сохранено для подписания позже',
      userId: application.userId,
      redirectUrl: application.userId ? '/dashboard/member-documents' : '/login'
    });

  } catch (error) {
    console.error('Sign later error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

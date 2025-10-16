import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Обновляем статус заявления на "подписать позже"
    const application = await prisma.membershipApplication.update({
      where: { id },
      data: {
        signLater: true
      },
      include: {
        documents: true
      }
    });

    // Обновляем статус всех документов на "не подписано"
    await prisma.membershipDocument.updateMany({
      where: {
        applicationId: id
      },
      data: {
        status: 'NOT_SIGNED'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Заявление сохранено для подписания позже'
    });

  } catch (error) {
    console.error('Sign later error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

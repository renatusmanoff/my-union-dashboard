import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, canValidateMembership } from '@/lib/auth';
import { generateApplicationPDF } from '@/lib/pdf-generator';
import { prisma } from '@/lib/database';

// GET - генерация PDF заявления
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

    // Генерируем PDF
    const pdfUrl = await generateApplicationPDF(application);

    // Обновляем заявление с PDF URL
    await prisma.membershipApplication.update({
      where: { id },
      data: { pdfUrl }
    });

    return NextResponse.json({
      success: true,
      pdfUrl,
      message: 'PDF заявления успешно сгенерирован'
    });

  } catch (error) {
    console.error('Generate PDF error:', error);
    return NextResponse.json(
      { error: 'Ошибка при генерации PDF' },
      { status: 500 }
    );
  }
}
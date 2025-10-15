import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    // Проверяем, что пользователь является членом профсоюза
    if (user.role !== 'PRIMARY_MEMBER') {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Получаем заявления о вступлении в профсоюз для данного пользователя
    const applications = await prisma.membershipApplication.findMany({
      where: {
        email: user.email
      },
      include: {
        organization: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Преобразуем заявления в формат документов
    const documents = applications.map(application => ({
      id: application.id,
      type: 'MEMBERSHIP_APPLICATION' as const,
      title: 'Заявление о вступлении в профсоюз',
      description: `Заявление в организацию: ${application.organization?.name || 'Неизвестная организация'}`,
      status: application.status === 'APPROVED' ? 'SIGNED' as const : 
              application.status === 'REJECTED' ? 'REJECTED' as const : 'PENDING' as const,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
      pdfUrl: application.pdfUrl || undefined,
      notes: application.notes || undefined
    }));

    // В будущем здесь можно добавить другие типы документов:
    // - Справки о членстве
    // - Договоры
    // - Другие документы

    return NextResponse.json({
      success: true,
      documents
    });

  } catch (error) {
    console.error('Error fetching member documents:', error);
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

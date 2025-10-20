import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { generateMembershipDocuments } from "@/lib/pdf-generator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Пользователь не авторизован" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Получаем заявление
    const application = await prisma.membershipApplication.findUnique({
      where: { id },
      include: {
        organization: true,
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

    if (!application) {
      return NextResponse.json(
        { error: "Заявление не найдено" },
        { status: 404 }
      );
    }

    // Проверяем права доступа
    if (currentUser.role === 'PRIMARY_MEMBER' && application.userId !== currentUser.id) {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    if (['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN'].includes(currentUser.role)) {
      if (application.organizationId !== currentUser.organizationId) {
        return NextResponse.json(
          { error: "Доступ запрещен" },
          { status: 403 }
        );
      }
    }

    // Получаем председателя организации
    const chairman = await prisma.user.findFirst({
      where: {
        organizationId: application.organizationId,
        role: {
          in: ['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
        }
      }
    });

    // Генерируем PDF документы
    const documents = await generateMembershipDocuments({
      application: {
        ...application,
        middleName: application.middleName || undefined
      },
      organization: application.organization,
      chairman
    });

    // Возвращаем URL первого документа
    const firstDocument = documents[0];
    if (!firstDocument) {
      return NextResponse.json(
        { error: "Не удалось сгенерировать документы" },
        { status: 500 }
      );
    }

    const pdfUrl = `/documents/${firstDocument.fileName}`;

    return NextResponse.json({
      success: true,
      pdfUrl,
      message: "PDF документ успешно сгенерирован"
    });

  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Ошибка при генерации PDF" },
      { status: 500 }
    );
  }
}

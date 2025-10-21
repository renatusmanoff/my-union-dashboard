import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { WorkflowDocumentType, WorkflowDocumentStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Пользователь не авторизован" },
        { status: 401 }
      );
    }

    // Проверяем права доступа
    if (!['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: "Доступ запрещен. Только председатели могут просматривать документы" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const query = searchParams.get('query') || '';
    const statusFilter = searchParams.get('status') as WorkflowDocumentStatus | 'ALL' || 'ALL';

    // Получаем документы в зависимости от роли
    const whereClause: Record<string, unknown> = {};

    if (currentUser.role === 'PRIMARY_CHAIRMAN') {
      whereClause.organizationId = currentUser.organizationId;
    } else if (currentUser.role === 'LOCAL_CHAIRMAN') {
      const localOrg = await prisma.organization.findUnique({
        where: { id: currentUser.organizationId },
        include: { children: true }
      });
      const childOrgIds = localOrg?.children.map(child => child.id) || [];
      whereClause.organizationId = {
        in: [currentUser.organizationId, ...childOrgIds]
      };
    } else if (currentUser.role === 'REGIONAL_CHAIRMAN') {
      const regionalOrg = await prisma.organization.findUnique({
        where: { id: currentUser.organizationId },
        include: { 
          children: {
            include: { children: true }
          }
        }
      });
      const allChildIds = regionalOrg?.children.flatMap(child => [
        child.id,
        ...child.children.map(grandChild => grandChild.id)
      ]) || [];
      whereClause.organizationId = {
        in: [currentUser.organizationId, ...allChildIds]
      };
    }
    // SUPER_ADMIN и FEDERAL_CHAIRMAN видят все документы

    // Добавляем фильтры
    if (query) {
      whereClause.title = {
        contains: query,
        mode: 'insensitive'
      };
    }

    if (statusFilter !== 'ALL') {
      whereClause.status = statusFilter;
    }

    const [documents, totalDocuments] = await prisma.$transaction([
      prisma.workflowDocument.findMany({
        where: whereClause,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              middleName: true
            }
          },
          organization: {
            select: {
              id: true,
              name: true
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  middleName: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.workflowDocument.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      documents,
      totalDocuments,
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit)
    });

  } catch (error) {
    console.error("Error fetching workflow documents:", error);
    return NextResponse.json(
      { error: "Ошибка при получении документов" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Пользователь не авторизован" },
        { status: 401 }
      );
    }

    // Проверяем права доступа
    if (!['SUPER_ADMIN', 'FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: "Доступ запрещен. Только председатели могут создавать документы" },
        { status: 403 }
      );
    }

    const { title, type, content, participantIds } = await request.json();

    if (!title || !type) {
      return NextResponse.json(
        { error: "Название и тип документа обязательны" },
        { status: 400 }
      );
    }

    // Создаем документ
    const document = await prisma.workflowDocument.create({
      data: {
        title,
        type: type as WorkflowDocumentType,
        content: content || null,
        status: 'DRAFT',
        creatorId: currentUser.id,
        organizationId: currentUser.organizationId
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Добавляем участников, если они указаны
    if (participantIds && participantIds.length > 0) {
      await prisma.documentParticipant.createMany({
        data: participantIds.map((participantId: string) => ({
          userId: participantId,
          documentId: document.id,
          status: 'PENDING'
        }))
      });
    }

    return NextResponse.json({
      success: true,
      document,
      message: "Документ создан успешно"
    });

  } catch (error) {
    console.error("Error creating workflow document:", error);
    return NextResponse.json(
      { error: "Ошибка при создании документа" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { WorkflowDocumentStatus, DocumentParticipantStatus } from "@prisma/client";

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

    const document = await prisma.workflowDocument.findUnique({
      where: { id },
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
        },
        signatures: {
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
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: "Документ не найден" },
        { status: 404 }
      );
    }

    // Проверяем права доступа
    let hasPermission = false;

    if (currentUser.role === 'SUPER_ADMIN') {
      hasPermission = true;
    } else if (currentUser.role === 'FEDERAL_CHAIRMAN') {
      hasPermission = true;
    } else if (currentUser.role === 'PRIMARY_CHAIRMAN') {
      hasPermission = document.organizationId === currentUser.organizationId;
    } else if (currentUser.role === 'LOCAL_CHAIRMAN') {
      const localOrg = await prisma.organization.findUnique({
        where: { id: currentUser.organizationId },
        include: { children: true }
      });
      hasPermission = localOrg?.children.some(child => child.id === document.organizationId) || false;
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
      hasPermission = allChildIds.includes(document.organizationId);
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Нет прав для просмотра этого документа" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      document
    });

  } catch (error) {
    console.error("Error fetching workflow document:", error);
    return NextResponse.json(
      { error: "Ошибка при получении документа" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { status, participantId, participantStatus } = await request.json();

    const document = await prisma.workflowDocument.findUnique({
      where: { id },
      include: {
        participants: true
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: "Документ не найден" },
        { status: 404 }
      );
    }

    // Проверяем права на изменение документа
    let hasPermission = false;

    if (currentUser.role === 'SUPER_ADMIN') {
      hasPermission = true;
    } else if (currentUser.role === 'FEDERAL_CHAIRMAN') {
      hasPermission = true;
    } else if (currentUser.role === 'PRIMARY_CHAIRMAN') {
      hasPermission = document.organizationId === currentUser.organizationId;
    } else if (currentUser.role === 'LOCAL_CHAIRMAN') {
      const localOrg = await prisma.organization.findUnique({
        where: { id: currentUser.organizationId },
        include: { children: true }
      });
      hasPermission = localOrg?.children.some(child => child.id === document.organizationId) || false;
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
      hasPermission = allChildIds.includes(document.organizationId);
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Нет прав для изменения этого документа" },
        { status: 403 }
      );
    }

    let updatedDocument;

    if (status) {
      // Обновляем статус документа
      updatedDocument = await prisma.workflowDocument.update({
        where: { id },
        data: {
          status: status as WorkflowDocumentStatus
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
        }
      });
    } else if (participantId && participantStatus) {
      // Обновляем статус участника
      await prisma.documentParticipant.update({
        where: {
          userId_documentId: {
            userId: participantId,
            documentId: id
          }
        },
        data: {
          status: participantStatus as DocumentParticipantStatus
        }
      });

      // Если участник подписал документ, создаем запись о подписи
      if (participantStatus === 'SIGNED') {
        await prisma.documentSignature.upsert({
          where: {
            userId_documentId: {
              userId: participantId,
              documentId: id
            }
          },
          update: {
            signedAt: new Date()
          },
          create: {
            userId: participantId,
            documentId: id,
            signedAt: new Date()
          }
        });
      }

      // Получаем обновленный документ
      updatedDocument = await prisma.workflowDocument.findUnique({
        where: { id },
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
        }
      });
    }

    return NextResponse.json({
      success: true,
      document: updatedDocument,
      message: "Документ обновлен успешно"
    });

  } catch (error) {
    console.error("Error updating workflow document:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении документа" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const document = await prisma.workflowDocument.findUnique({
      where: { id }
    });

    if (!document) {
      return NextResponse.json(
        { error: "Документ не найден" },
        { status: 404 }
      );
    }

    // Проверяем права на удаление документа
    let hasPermission = false;

    if (currentUser.role === 'SUPER_ADMIN') {
      hasPermission = true;
    } else if (currentUser.role === 'FEDERAL_CHAIRMAN') {
      hasPermission = true;
    } else if (currentUser.role === 'PRIMARY_CHAIRMAN') {
      hasPermission = document.organizationId === currentUser.organizationId && document.creatorId === currentUser.id;
    } else if (currentUser.role === 'LOCAL_CHAIRMAN') {
      const localOrg = await prisma.organization.findUnique({
        where: { id: currentUser.organizationId },
        include: { children: true }
      });
      hasPermission = (localOrg?.children.some(child => child.id === document.organizationId) || false) && document.creatorId === currentUser.id;
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
      hasPermission = allChildIds.includes(document.organizationId) && document.creatorId === currentUser.id;
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Нет прав для удаления этого документа" },
        { status: 403 }
      );
    }

    // Удаляем документ (каскадное удаление удалит связанные записи)
    await prisma.workflowDocument.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Документ удален успешно"
    });

  } catch (error) {
    console.error("Error deleting workflow document:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении документа" },
      { status: 500 }
    );
  }
}

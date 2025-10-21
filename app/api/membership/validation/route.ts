import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/database";

export async function GET(_request: NextRequest) {
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
        { error: "Доступ запрещен. Только председатели могут просматривать заявления" },
        { status: 403 }
      );
    }

    // Получаем заявления в зависимости от роли
    const whereClause: Record<string, unknown> = {};

    if (currentUser.role === 'PRIMARY_CHAIRMAN') {
      // Первичный председатель видит только заявления своей организации
      whereClause.organizationId = currentUser.organizationId;
    } else if (currentUser.role === 'LOCAL_CHAIRMAN') {
      // Местный председатель видит заявления всех первичных организаций под своим управлением
      const localOrg = await prisma.organization.findUnique({
        where: { id: currentUser.organizationId },
        include: { children: true }
      });
      
      if (localOrg?.children) {
        whereClause.organizationId = {
          in: localOrg.children.map(child => child.id)
        };
      }
    } else if (currentUser.role === 'REGIONAL_CHAIRMAN') {
      // Региональный председатель видит заявления всех организаций в регионе
      const regionalOrg = await prisma.organization.findUnique({
        where: { id: currentUser.organizationId },
        include: { 
          children: {
            include: { children: true }
          }
        }
      });
      
      if (regionalOrg?.children) {
        const allChildIds = regionalOrg.children.flatMap(child => [
          child.id,
          ...child.children.map(grandChild => grandChild.id)
        ]);
        
        whereClause.organizationId = {
          in: allChildIds
        };
      }
    } else if (currentUser.role === 'FEDERAL_CHAIRMAN') {
      // Федеральный председатель видит все заявления
      // whereClause остается пустым
    }

    const applications = await prisma.membershipApplication.findMany({
      where: whereClause,
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            email: true
          }
        },
        documents: {
          select: {
            id: true,
            type: true,
            fileName: true,
            signedAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      applications
    });

  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Ошибка при получении заявлений" },
      { status: 500 }
    );
  }
}
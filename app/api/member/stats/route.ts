import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { UserRole } from "@prisma/client";

export async function GET(_request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "Пользователь не авторизован" },
        { status: 401 }
      );
    }

    if (currentUser.role !== UserRole.PRIMARY_MEMBER) {
      return NextResponse.json(
        { error: "Доступ запрещен. Только члены профсоюза могут получить свою статистику" },
        { status: 403 }
      );
    }

    // Получаем статистику для конкретного члена профсоюза
    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalDocuments
    ] = await Promise.all([
      prisma.membershipApplication.count({
        where: { userId: currentUser.id }
      }),
      prisma.membershipApplication.count({
        where: { 
          userId: currentUser.id,
          status: 'PENDING'
        }
      }),
      prisma.membershipApplication.count({
        where: { 
          userId: currentUser.id,
          status: 'APPROVED'
        }
      }),
      prisma.membershipApplication.count({
        where: { 
          userId: currentUser.id,
          status: 'REJECTED'
        }
      }),
      prisma.membershipDocument.count({
        where: { 
          application: {
            userId: currentUser.id
          }
        }
      })
    ]);

    const stats = {
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalDocuments
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error("Error fetching member stats:", error);
    return NextResponse.json(
      { error: "Ошибка при получении статистики члена профсоюза" },
      { status: 500 }
    );
  }
}

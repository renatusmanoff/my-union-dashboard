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

    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "Доступ запрещен. Только супер-администраторы могут получить системную статистику" },
        { status: 403 }
      );
    }

    // Получаем общую статистику
    const [
      totalOrganizations,
      totalUsers,
      totalMembers,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.user.count({
        where: { role: UserRole.PRIMARY_MEMBER }
      }),
      prisma.membershipApplication.count(),
      prisma.membershipApplication.count({
        where: { status: 'PENDING' }
      }),
      prisma.membershipApplication.count({
        where: { status: 'APPROVED' }
      }),
      prisma.membershipApplication.count({
        where: { status: 'REJECTED' }
      })
    ]);

    const stats = {
      totalOrganizations,
      totalUsers,
      totalMembers,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error("Error fetching system stats:", error);
    return NextResponse.json(
      { error: "Ошибка при получении системной статистики" },
      { status: 500 }
    );
  }
}

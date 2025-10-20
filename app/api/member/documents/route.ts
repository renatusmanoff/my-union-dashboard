import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/database";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Пользователь не авторизован" },
        { status: 401 }
      );
    }

    // Получаем заявления пользователя с документами
    // Ищем заявления по userId или по email (для случаев когда регистрация была без авторизации)
    const applications = await prisma.membershipApplication.findMany({
      where: {
        OR: [
          { userId: currentUser.id },
          { 
            AND: [
              { userId: null },
              { 
                user: {
                  email: currentUser.email
                }
              }
            ]
          }
        ]
      },
      include: {
        documents: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            type: true
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
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

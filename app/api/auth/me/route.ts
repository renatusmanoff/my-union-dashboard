import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    let sessionId: string | undefined;

    // 1. Пытаемся получить session из cookie
    const cookieStore = await cookies();
    const cookieSessionId = cookieStore.get('session-id')?.value;
    if (cookieSessionId) {
      sessionId = cookieSessionId;
    }

    // 2. Если не в cookie, пытаемся из заголовка Authorization (фронт отправляет из localStorage)
    if (!sessionId) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionId = authHeader.substring(7);
      }
    }

    // 3. Если нет session ID, отправляем 401
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    // 4. Проверяем session в БД
    const session = await prisma.session.findUnique({
      where: { token: sessionId },
      include: {
        user: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Сессия не найдена' },
        { status: 401 }
      );
    }

    // 5. Проверяем, не истекла ли сессия
    if (new Date() > session.expiresAt) {
      // Удаляем истекшую сессию
      await prisma.session.delete({ where: { id: session.id } });
      return NextResponse.json(
        { error: 'Сессия истекла' },
        { status: 401 }
      );
    }

    const user = session.user;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        phone: user.phone,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization?.name || null,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
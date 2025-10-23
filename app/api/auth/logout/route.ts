import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Получаем sessionId из cookie или заголовка
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('session-id')?.value;

    if (!sessionId) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionId = authHeader.substring(7);
      }
    }

    // Если есть sessionId, удаляем сессию из БД
    if (sessionId) {
      await prisma.session.deleteMany({
        where: { token: sessionId }
      });
    }

    // Удаляем cookie
    const updatedCookieStore = await cookies();
    updatedCookieStore.delete('session-id');
    updatedCookieStore.delete('user-role');

    return NextResponse.json({
      success: true,
      message: 'Вы вышли из системы'
    });
  } catch {
    return NextResponse.json(
      { error: 'Ошибка при выходе' },
      { status: 500 }
    );
  }
}

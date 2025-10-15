import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    // TODO: Реализовать получение базы знаний из базы данных
    const knowledge: unknown[] = [];

    return NextResponse.json({
      success: true,
      knowledge
    });

  } catch (error) {
    console.error('Get knowledge error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

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

    // TODO: Реализовать получение сотрудников из базы данных
    const employees: unknown[] = [];

    return NextResponse.json({
      success: true,
      employees
    });

  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

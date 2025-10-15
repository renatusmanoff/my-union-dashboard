import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Удаляем cookie
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');

    return NextResponse.json({
      success: true,
      message: 'Выход выполнен успешно'
    });

  } catch (error) {
    console.error('Logout error:', error);
    
    // Логируем детали ошибки только в development
    if (process.env.NODE_ENV === 'development') {
      console.error('Logout error details:', error);
    }
    
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isSuperAdmin } from '@/lib/auth';
import { verifySMTPConnection, sendTestEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    // Проверяем права супер-администратора
    if (!isSuperAdmin(currentUser.role)) {
      return NextResponse.json(
        { error: 'Недостаточно прав для тестирования SMTP' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Email для тестирования обязателен' },
        { status: 400 }
      );
    }

    // Проверяем подключение к SMTP
    const smtpConnected = await verifySMTPConnection();
    
    if (!smtpConnected) {
      return NextResponse.json({
        success: false,
        smtpConnected: false,
        message: 'Не удалось подключиться к SMTP серверу'
      });
    }

    // Отправляем тестовое письмо
    const testEmailSent = await sendTestEmail(testEmail);

    return NextResponse.json({
      success: true,
      smtpConnected: true,
      testEmailSent,
      message: testEmailSent 
        ? 'SMTP подключение работает. Тестовое письмо отправлено.'
        : 'SMTP подключение работает, но не удалось отправить тестовое письмо.'
    });

  } catch (error) {
    console.error('Test SMTP error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

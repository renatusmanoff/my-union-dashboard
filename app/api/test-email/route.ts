import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, text } = await request.json();

    // Создаем транспортер для SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true для 465, false для других портов
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Проверяем подключение
    await transporter.verify();

    // Отправляем письмо
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: to,
      subject: subject || 'Тестовое письмо от MyUnion Dashboard',
      text: text || 'Это тестовое письмо для проверки работы SMTP сервера.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">MyUnion Dashboard</h2>
          <p>Это тестовое письмо для проверки работы SMTP сервера.</p>
          <p>Если вы получили это письмо, значит настройка SMTP работает корректно.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            Отправлено: ${new Date().toLocaleString('ru-RU')}
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Письмо отправлено успешно',
      messageId: info.messageId,
    });

  } catch (error) {
    console.error('SMTP Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Ошибка отправки письма',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

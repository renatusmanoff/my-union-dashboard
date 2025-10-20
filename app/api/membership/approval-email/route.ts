import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import nodemailer from 'nodemailer';

// Конфигурация SMTP
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.mail.ru',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'support@myunion.pro',
    pass: process.env.SMTP_PASSWORD || 'MyUnion2024!'
  }
};

const transporter = nodemailer.createTransport(smtpConfig);

export async function POST(request: NextRequest) {
  try {
    const { applicationId, applicantEmail, applicantName, organizationName } = await request.json();

    const mailOptions = {
      from: 'support@myunion.pro',
      to: applicantEmail,
      subject: 'Поздравляем! Ваше членство в профсоюзе одобрено',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
          <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Поздравляем!</h1>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #1e293b; margin-bottom: 20px;">
              Уважаемый(ая) <strong>${applicantName}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #1e293b; margin-bottom: 15px;">
              Ваше заявление на вступление в профсоюз <strong>${organizationName}</strong> было рассмотрено и <span style="color: #22c55e; font-weight: bold;">одобрено</span>! 
            </p>
            
            <p style="font-size: 16px; color: #1e293b; margin-bottom: 20px;">
              Вы теперь являетесь полноправным членом профсоюза и можете пользоваться всеми предоставляемыми членам льготами и преимуществами.
            </p>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #15803d; font-weight: bold;">✓ Члены профсоюза имеют доступ к:</p>
              <ul style="color: #15803d; margin: 10px 0 0 20px; padding-left: 0;">
                <li>Скидкам и льготам от партнёров</li>
                <li>Правовой защите</li>
                <li>Участию в профсоюзных мероприятиях</li>
                <li>Социальной поддержке</li>
              </ul>
            </div>
            
            <p style="font-size: 16px; color: #1e293b; margin-bottom: 15px;">
              С вопросами и предложениями обращайтесь в <strong>организацию профсоюза</strong> или на адрес электронной почты support@myunion.pro
            </p>
            
            <p style="font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 20px;">
              С уважением,<br>
              <strong>Команда профсоюза</strong><br>
              <a href="${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}" style="color: #2563eb; text-decoration: none;">MyUnion.pro</a>
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Письмо об одобрении успешно отправлено'
    });

  } catch (error) {
    console.error('Error sending approval email:', error);
    return NextResponse.json(
      { error: 'Ошибка при отправке письма' },
      { status: 500 }
    );
  }
}

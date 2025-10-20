import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Получаем документ с полной информацией
    const document = await prisma.membershipDocument.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            organization: {
              include: {
                users: {
                  where: {
                    role: {
                      in: ['PRIMARY_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'FEDERAL_CHAIRMAN']
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      );
    }

    // Проверяем, что документ принадлежит пользователю
    const isOwner = document.application.userId === currentUser.id;

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Недостаточно прав для отправки документа' },
        { status: 403 }
      );
    }

    // Проверяем, что документ подписан
    if (document.status !== 'SIGNED') {
      return NextResponse.json(
        { error: 'Документ должен быть подписан перед отправкой' },
        { status: 400 }
      );
    }

    // Обновляем статус документа
    const updatedDocument = await prisma.membershipDocument.update({
      where: { id },
      data: {
        sentToUnion: true,
        sentAt: new Date()
      }
    });

    // Проверяем, отправлены ли все документы для этого заявления
    const allDocuments = await prisma.membershipDocument.findMany({
      where: { applicationId: document.applicationId }
    });

    const allDocumentsSent = allDocuments.every(doc => doc.sentToUnion);

    // Если все документы отправлены, меняем статус заявления на PENDING_VALIDATION
    if (allDocumentsSent) {
      await prisma.membershipApplication.update({
        where: { id: document.applicationId },
        data: { status: 'PENDING_VALIDATION' }
      });
    }

    // Отправляем уведомление председателю организации
    const chairman = document.application.organization.users[0];
    if (chairman) {
      const memberName = `${document.application.lastName} ${document.application.firstName} ${document.application.middleName || ''}`.trim();
      const organizationName = document.application.organization.name;
      const documentType = document.type === 'MEMBERSHIP_APPLICATION' ? 'Заявление на вступление в профсоюз' :
                          document.type === 'CONSENT_PERSONAL_DATA' ? 'Согласие на обработку персональных данных' :
                          document.type === 'PAYMENT_DEDUCTION' ? 'Заявление на удержание взносов' : 'Документ';

      const validationUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/dashboard/membership-validation`;

      try {
        await transporter.sendMail({
          from: 'support@myunion.pro',
          to: chairman.email,
          subject: `Новое заявление на вступление в профсоюз от ${memberName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
              <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h2 style="margin: 0; font-size: 24px;">📋 Новое заявление</h2>
              </div>
              
              <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; color: #1e293b; margin-bottom: 20px;">
                  Уважаемый(ая) <strong>${chairman.firstName} ${chairman.lastName}</strong>!
                </p>
                
                <p style="font-size: 16px; color: #1e293b; margin-bottom: 20px;">
                  Поступило новое заявление на вступление в профсоюз:
                </p>
                
                <div style="background-color: #f0f4f8; border-left: 4px solid #2563eb; padding: 20px; border-radius: 4px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #1e293b;">Информация о заявителе:</h3>
                  <p style="margin: 8px 0;"><strong>ФИО:</strong> ${memberName}</p>
                  <p style="margin: 8px 0;"><strong>Организация:</strong> ${organizationName}</p>
                  <p style="margin: 8px 0;"><strong>Документ:</strong> ${documentType}</p>
                  <p style="margin: 8px 0;"><strong>Дата подачи:</strong> ${new Date(document.application.createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
                
                <p style="font-size: 16px; color: #1e293b; margin-bottom: 15px; font-weight: bold;">
                  Требуется рассмотрение заявления
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${validationUrl}" 
                     style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
                    ✓ Перейти к рассмотрению заявления
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #64748b; background-color: #f8fafc; padding: 15px; border-radius: 4px; margin: 20px 0;">
                  <strong>Важно:</strong> Если вы не авторизованы в системе, вы будете перенаправлены на страницу входа. После авторизации вы сразу перейдете на страницу валидации заявлений.
                </p>
                
                <p style="font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 20px;">
                  С уважением,<br>
                  <strong>Система управления профсоюзом</strong><br>
                  MyUnion.pro
                </p>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Не прерываем выполнение, если не удалось отправить email
      }
    }

    return NextResponse.json({
      success: true,
      document: updatedDocument,
      message: 'Документ успешно отправлен в профсоюз. Председатель организации получил уведомление.'
    });

  } catch (error) {
    console.error('Send document error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

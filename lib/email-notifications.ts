import nodemailer from 'nodemailer';
import { NotificationType } from '@prisma/client';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface NotificationData {
  type: NotificationType;
  recipientName: string;
  recipientEmail: string;
  organizationName?: string;
  memberName?: string;
  rejectionReason?: string;
  documentTitle?: string;
  documentType?: string;
}

class EmailNotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private getEmailTemplate(data: NotificationData): EmailTemplate {
    const { type, recipientName, organizationName, memberName, rejectionReason, documentTitle, documentType } = data;

    switch (type) {
      case 'NEW_MEMBER_REGISTRATION':
        return {
          subject: `Новый член профсоюза в организации "${organizationName}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Новый член профсоюза</h2>
              <p>Уважаемый ${recipientName}!</p>
              <p>В вашу организацию <strong>"${organizationName}"</strong> вступил новый член профсоюза:</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Имя:</strong> ${memberName}</p>
                <p><strong>Дата вступления:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
              </div>
              <p>Вы можете просмотреть подробную информацию в личном кабинете.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                С уважением,<br>
                Система MyUnion Dashboard
              </p>
            </div>
          `,
          text: `Новый член профсоюза в организации "${organizationName}". Имя: ${memberName}. Дата вступления: ${new Date().toLocaleDateString('ru-RU')}.`
        };

      case 'MEMBERSHIP_APPROVED':
        return {
          subject: 'Ваше заявление на вступление в профсоюз одобрено',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">Заявление одобрено!</h2>
              <p>Уважаемый ${recipientName}!</p>
              <p>Поздравляем! Ваше заявление на вступление в профсоюз организации <strong>"${organizationName}"</strong> было одобрено.</p>
              <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
                <p><strong>Статус:</strong> Одобрено</p>
                <p><strong>Дата рассмотрения:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
                <p><strong>Организация:</strong> ${organizationName}</p>
              </div>
              <p>Теперь вы являетесь полноправным членом профсоюза и можете пользоваться всеми льготами и услугами.</p>
              <p>Войдите в личный кабинет для получения дополнительной информации.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                С уважением,<br>
                Система MyUnion Dashboard
              </p>
            </div>
          `,
          text: `Ваше заявление на вступление в профсоюз организации "${organizationName}" было одобрено. Дата рассмотрения: ${new Date().toLocaleDateString('ru-RU')}.`
        };

      case 'MEMBERSHIP_REJECTED':
        return {
          subject: 'Заявление на вступление в профсоюз отклонено',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Заявление отклонено</h2>
              <p>Уважаемый ${recipientName}!</p>
              <p>К сожалению, ваше заявление на вступление в профсоюз организации <strong>"${organizationName}"</strong> было отклонено.</p>
              <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p><strong>Статус:</strong> Отклонено</p>
                <p><strong>Дата рассмотрения:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
                <p><strong>Организация:</strong> ${organizationName}</p>
                ${rejectionReason ? `<p><strong>Причина:</strong> ${rejectionReason}</p>` : ''}
              </div>
              <p>Если у вас есть вопросы по поводу решения, обратитесь к председателю организации.</p>
              <p>Вы можете подать новое заявление после устранения указанных причин.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                С уважением,<br>
                Система MyUnion Dashboard
              </p>
            </div>
          `,
          text: `Ваше заявление на вступление в профсоюз организации "${organizationName}" было отклонено.${rejectionReason ? ` Причина: ${rejectionReason}` : ''} Дата рассмотрения: ${new Date().toLocaleDateString('ru-RU')}.`
        };

      case 'DOCUMENT_CREATED':
        return {
          subject: `Новый документ для подписания: "${documentTitle}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Новый документ для подписания</h2>
              <p>Уважаемый ${recipientName}!</p>
              <p>Вам направлен новый документ для подписания:</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Название:</strong> ${documentTitle}</p>
                <p><strong>Тип:</strong> ${documentType}</p>
                <p><strong>Дата создания:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
                <p><strong>Организация:</strong> ${organizationName}</p>
              </div>
              <p>Пожалуйста, войдите в личный кабинет для просмотра и подписания документа.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                С уважением,<br>
                Система MyUnion Dashboard
              </p>
            </div>
          `,
          text: `Новый документ для подписания: "${documentTitle}" (${documentType}). Организация: ${organizationName}. Дата создания: ${new Date().toLocaleDateString('ru-RU')}.`
        };

      case 'DOCUMENT_SIGNED':
        return {
          subject: `Документ подписан: "${documentTitle}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">Документ подписан</h2>
              <p>Уважаемый ${recipientName}!</p>
              <p>Документ <strong>"${documentTitle}"</strong> был подписан участником.</p>
              <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
                <p><strong>Документ:</strong> ${documentTitle}</p>
                <p><strong>Тип:</strong> ${documentType}</p>
                <p><strong>Дата подписания:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
                <p><strong>Организация:</strong> ${organizationName}</p>
              </div>
              <p>Вы можете просмотреть обновленный статус документа в личном кабинете.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                С уважением,<br>
                Система MyUnion Dashboard
              </p>
            </div>
          `,
          text: `Документ "${documentTitle}" (${documentType}) был подписан. Организация: ${organizationName}. Дата подписания: ${new Date().toLocaleDateString('ru-RU')}.`
        };

      case 'DOCUMENT_REJECTED':
        return {
          subject: `Документ отклонен: "${documentTitle}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Документ отклонен</h2>
              <p>Уважаемый ${recipientName}!</p>
              <p>Документ <strong>"${documentTitle}"</strong> был отклонен участником.</p>
              <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p><strong>Документ:</strong> ${documentTitle}</p>
                <p><strong>Тип:</strong> ${documentType}</p>
                <p><strong>Дата отклонения:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
                <p><strong>Организация:</strong> ${organizationName}</p>
              </div>
              <p>Вы можете просмотреть обновленный статус документа в личном кабинете.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                С уважением,<br>
                Система MyUnion Dashboard
              </p>
            </div>
          `,
          text: `Документ "${documentTitle}" (${documentType}) был отклонен. Организация: ${organizationName}. Дата отклонения: ${new Date().toLocaleDateString('ru-RU')}.`
        };

      case 'DOCUMENT_APPROVED':
        return {
          subject: `Документ одобрен: "${documentTitle}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">Документ одобрен</h2>
              <p>Уважаемый ${recipientName}!</p>
              <p>Документ <strong>"${documentTitle}"</strong> был одобрен и переведен в статус "На согласовании".</p>
              <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
                <p><strong>Документ:</strong> ${documentTitle}</p>
                <p><strong>Тип:</strong> ${documentType}</p>
                <p><strong>Дата одобрения:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
                <p><strong>Организация:</strong> ${organizationName}</p>
              </div>
              <p>Вы можете просмотреть обновленный статус документа в личном кабинете.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                С уважением,<br>
                Система MyUnion Dashboard
              </p>
            </div>
          `,
          text: `Документ "${documentTitle}" (${documentType}) был одобрен. Организация: ${organizationName}. Дата одобрения: ${new Date().toLocaleDateString('ru-RU')}.`
        };

      default:
        return {
          subject: 'Уведомление от MyUnion Dashboard',
          html: `<p>Уважаемый ${recipientName}!</p><p>Вы получили новое уведомление в системе MyUnion Dashboard.</p>`,
          text: `Уважаемый ${recipientName}! Вы получили новое уведомление в системе MyUnion Dashboard.`
        };
    }
  }

  async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      const template = this.getEmailTemplate(data);
      
      const mailOptions = {
        from: `"MyUnion Dashboard" <${process.env.SMTP_USER}>`,
        to: data.recipientEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${data.recipientEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendBulkNotifications(notifications: NotificationData[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const notification of notifications) {
      const result = await this.sendNotification(notification);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }
}

export const emailNotificationService = new EmailNotificationService();

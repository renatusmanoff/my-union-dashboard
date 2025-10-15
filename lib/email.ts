import nodemailer from 'nodemailer';

// Конфигурация SMTP
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.mail.ru',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true для 465, false для других портов
  auth: {
    user: process.env.SMTP_USER || 'support@myunion.pro',
    pass: process.env.SMTP_PASS || '8uld1thwBBN1XVNbmW9p'
  }
};

// Создаем транспортер
const transporter = nodemailer.createTransport(smtpConfig);

// Проверяем подключение к SMTP
export async function verifySMTPConnection(): Promise<boolean> {
  try {
    // В локальной среде всегда возвращаем true
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] SMTP connection simulated as successful');
      return true;
    }

    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error);
    return false;
  }
}

// Интерфейс для данных администратора
interface AdminCredentials {
  email: string;
  firstName: string;
  lastName: string;
  temporaryPassword: string;
  role: string;
  organizationName: string;
}

// Отправка учетных данных администратору
export async function sendAdminCredentials(adminData: AdminCredentials): Promise<boolean> {
  try {
    // В локальной среде просто логируем отправку
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
      console.log('📧 [DEV] Email would be sent to:', adminData.email);
      console.log('📧 [DEV] Subject: Учетные данные для входа в систему MyUnion');
      console.log('📧 [DEV] Temporary password:', adminData.temporaryPassword);
      console.log('📧 [DEV] Roles:', adminData.role);
      return true;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'support@myunion.pro',
      to: adminData.email,
      subject: 'Учетные данные для входа в систему MyUnion',
      html: generateAdminCredentialsEmail(adminData)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin credentials email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send admin credentials email:', error);
    return false;
  }
}

// Отправка тестового email
export async function sendTestEmail(testEmail: string): Promise<boolean> {
  try {
    // В локальной среде просто логируем отправку
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Test email would be sent to:', testEmail);
      console.log('📧 [DEV] Subject: Тестовое письмо от MyUnion');
      return true;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'support@myunion.pro',
      to: testEmail,
      subject: 'Тестовое письмо от MyUnion',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Тестовое письмо</h2>
          <p>Это тестовое письмо для проверки работы SMTP сервера.</p>
          <p>Если вы получили это письмо, значит SMTP настроен правильно.</p>
          <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
            © 2024 MyUnion - Система управления профсоюзными организациями
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send test email:', error);
    return false;
  }
}

// Генерация HTML письма с учетными данными
function generateAdminCredentialsEmail(adminData: AdminCredentials): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Учетные данные MyUnion</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #007bff;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }
            .credentials-box {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 5px;
                padding: 20px;
                margin: 20px 0;
            }
            .credential-item {
                margin: 10px 0;
                padding: 10px;
                background-color: #ffffff;
                border-left: 4px solid #007bff;
                border-radius: 3px;
            }
            .label {
                font-weight: bold;
                color: #495057;
            }
            .value {
                font-family: 'Courier New', monospace;
                background-color: #e9ecef;
                padding: 5px 10px;
                border-radius: 3px;
                display: inline-block;
                margin-top: 5px;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">MyUnion</div>
                <h1>Добро пожаловать в систему!</h1>
            </div>
            
            <p>Здравствуйте, <strong>${adminData.firstName} ${adminData.lastName}</strong>!</p>
            
            <p>Вы были назначены администратором в системе MyUnion. Ниже представлены ваши учетные данные для входа:</p>
            
            <div class="credentials-box">
                <div class="credential-item">
                    <div class="label">Email:</div>
                    <div class="value">${adminData.email}</div>
                </div>
                <div class="credential-item">
                    <div class="label">Временный пароль:</div>
                    <div class="value">${adminData.temporaryPassword}</div>
                </div>
                <div class="credential-item">
                    <div class="label">Роли:</div>
                    <div class="value">${adminData.role}</div>
                </div>
                <div class="credential-item">
                    <div class="label">Организация:</div>
                    <div class="value">${adminData.organizationName}</div>
                </div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Важно:</strong> После первого входа в систему обязательно смените временный пароль на постоянный в разделе "Профиль".
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="button">
                    Войти в систему
                </a>
            </div>
            
            <p>Если у вас возникнут вопросы, обратитесь к системному администратору.</p>
            
            <div class="footer">
                <p>Это автоматическое сообщение, пожалуйста, не отвечайте на него.</p>
                <p>© 2024 MyUnion - Система управления профсоюзными организациями</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Отправка уведомления о валидации членства
export async function sendMembershipValidationEmail(
  email: string,
  firstName: string,
  lastName: string,
  status: 'APPROVED' | 'REJECTED',
  organizationName: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'support@myunion.pro',
      to: email,
      subject: status === 'APPROVED' 
        ? 'Ваше членство в профсоюзе подтверждено' 
        : 'Решение по вашему заявлению на членство в профсоюзе',
      html: generateMembershipValidationEmail(firstName, lastName, status, organizationName)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Membership validation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send membership validation email:', error);
    return false;
  }
}

// Генерация HTML письма о валидации членства
function generateMembershipValidationEmail(
  firstName: string,
  lastName: string,
  status: 'APPROVED' | 'REJECTED',
  organizationName: string
): string {
  const isApproved = status === 'APPROVED';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isApproved ? 'Членство подтверждено' : 'Решение по заявлению'}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid ${isApproved ? '#28a745' : '#dc3545'};
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }
            .status-box {
                background-color: ${isApproved ? '#d4edda' : '#f8d7da'};
                border: 1px solid ${isApproved ? '#c3e6cb' : '#f5c6cb'};
                color: ${isApproved ? '#155724' : '#721c24'};
                padding: 20px;
                border-radius: 5px;
                margin: 20px 0;
                text-align: center;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">MyUnion</div>
                <h1>${isApproved ? 'Членство подтверждено' : 'Решение по заявлению'}</h1>
            </div>
            
            <p>Здравствуйте, <strong>${firstName} ${lastName}</strong>!</p>
            
            <div class="status-box">
                <h2>${isApproved ? '✅ Поздравляем!' : '❌ К сожалению'}</h2>
                <p>
                    ${isApproved 
                      ? `Ваше заявление на членство в профсоюзе "${organizationName}" было одобрено. Добро пожаловать в нашу организацию!`
                      : `Ваше заявление на членство в профсоюзе "${organizationName}" было отклонено.`
                    }
                </p>
            </div>
            
            ${isApproved ? `
                <p>Теперь вы можете:</p>
                <ul>
                    <li>Войти в личный кабинет</li>
                    <li>Просматривать новости и объявления</li>
                    <li>Пользоваться льготами и скидками</li>
                    <li>Участвовать в мероприятиях профсоюза</li>
                </ul>
                
                <div style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="button">
                        Войти в личный кабинет
                    </a>
                </div>
            ` : `
                <p>Если у вас есть вопросы по поводу решения, обратитесь к администратору организации.</p>
            `}
            
            <div class="footer">
                <p>Это автоматическое сообщение, пожалуйста, не отвечайте на него.</p>
                <p>© 2024 MyUnion - Система управления профсоюзными организациями</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Отправка письма для сброса пароля
export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  lastName: string,
  resetToken: string
): Promise<boolean> {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'support@myunion.pro',
      to: email,
      subject: 'Сброс пароля в системе MyUnion',
      html: generatePasswordResetEmail(firstName, lastName, resetUrl)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

// Генерация HTML письма для сброса пароля
function generatePasswordResetEmail(
  firstName: string,
  lastName: string,
  resetUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Сброс пароля</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #007bff;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }
            .button {
                display: inline-block;
                background-color: #007bff;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">MyUnion</div>
                <h1>Сброс пароля</h1>
            </div>
            
            <p>Здравствуйте, <strong>${firstName} ${lastName}</strong>!</p>
            
            <p>Мы получили запрос на сброс пароля для вашего аккаунта в системе MyUnion.</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">
                    Сбросить пароль
                </a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Важно:</strong> Ссылка действительна в течение 1 часа. Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
            </div>
            
            <p>Если кнопка не работает, скопируйте и вставьте следующую ссылку в браузер:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 3px;">${resetUrl}</p>
            
            <div class="footer">
                <p>Это автоматическое сообщение, пожалуйста, не отвечайте на него.</p>
                <p>© 2024 MyUnion - Система управления профсоюзными организациями</p>
            </div>
        </div>
    </body>
    </html>
  `;
}
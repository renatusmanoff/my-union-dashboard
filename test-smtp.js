const nodemailer = require('nodemailer');

const smtpConfig = {
  host: 'smtp.beget.com',
  port: 465,
  secure: true,
  auth: {
    user: 'support@myunion.pro',
    pass: '8uld1thwBBN1XVNbmW9p'
  }
};

const transporter = nodemailer.createTransport(smtpConfig);

(async () => {
  try {
    console.log('🔄 Проверяем подключение к SMTP...');
    await transporter.verify();
    console.log('✅ SMTP подключение успешно!');
    
    console.log('\n📧 Отправляем тестовое письмо...');
    const info = await transporter.sendMail({
      from: '"My Union" <support@myunion.pro>',
      to: '9061109990@mail.ru',
      subject: 'Тест - Учетные данные MyUnion',
      html: '<h1>Привет!</h1><p>Временный пароль: <strong>t3VjCW7NgNmg</strong></p>'
    });
    
    console.log('✅ Письмо отправлено!');
    console.log('   Message ID:', info.messageId);
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
  }
})();

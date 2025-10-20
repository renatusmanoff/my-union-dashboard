const nodemailer = require('nodemailer');

// Попробуем разные варианты
const configs = [
  {
    name: 'SMTP 465 SSL',
    host: 'smtp.beget.com',
    port: 465,
    secure: true,
    auth: { user: 'support@myunion.pro', pass: '8uld1thwBBN1XVNbmW9p' }
  },
  {
    name: 'SMTP 587 TLS',
    host: 'smtp.beget.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user: 'support@myunion.pro', pass: '8uld1thwBBN1XVNbmW9p' }
  },
  {
    name: 'SMTP 25',
    host: 'smtp.beget.com',
    port: 25,
    secure: false,
    auth: { user: 'support@myunion.pro', pass: '8uld1thwBBN1XVNbmW9p' }
  }
];

(async () => {
  for (const config of configs) {
    console.log(`\n🔍 Пытаемся подключиться: ${config.name}`);
    const transporter = nodemailer.createTransport(config);
    try {
      await transporter.verify();
      console.log(`✅ ${config.name} - УСПЕШНО!`);
      return;
    } catch (error) {
      console.log(`❌ ${config.name} - ${error.message.split('\n')[0]}`);
    }
  }
  console.log('\n❌ Ни один способ не сработал');
})();

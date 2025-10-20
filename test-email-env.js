console.log('Current SMTP Configuration:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***' : 'NOT SET');
console.log('SMTP_FROM:', process.env.SMTP_FROM);
console.log('NODE_ENV:', process.env.NODE_ENV);

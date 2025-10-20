const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    // Проверяем, существует ли уже супер-админ
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'support@myunion.pro' }
    });

    if (existingAdmin) {
      console.log('✅ Супер-администратор уже существует:', existingAdmin.email);
      return existingAdmin;
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('123321ZxQ@*', 10);
    
    // Создаем супер-администратора
    const superAdmin = await prisma.user.create({
      data: {
        email: 'support@myunion.pro',
        password: hashedPassword,
        firstName: 'Супер',
        lastName: 'Администратор',
        phone: '+7 (495) 123-45-67',
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true
      }
    });

    console.log('✅ Супер-администратор создан успешно!');
    console.log('📧 Email:', superAdmin.email);
    console.log('🔑 Пароль: 123321ZxQ@*');
    console.log('👤 Роль:', superAdmin.role);

    return superAdmin;

  } catch (error) {
    console.error('❌ Ошибка при создании супер-администратора:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт
createSuperAdmin()
  .then(() => {
    console.log('🎉 Скрипт завершен успешно!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Ошибка:', error);
    process.exit(1);
  });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateSupportAdmin() {
  try {
    console.log('🔄 Обновляем поддержку администратора...');

    // Проверяем существующего пользователя
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'support@myunion.pro' }
    });

    if (!existingAdmin) {
      console.log('❌ Пользователь support@myunion.pro не найден');
      return;
    }

    console.log('📧 Найден пользователь:', existingAdmin.email);
    console.log('👤 Текущая роль:', existingAdmin.role);
    console.log('✅ Активен:', existingAdmin.isActive);

    // Обновляем пользователя
    const updatedAdmin = await prisma.user.update({
      where: { email: 'support@myunion.pro' },
      data: {
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true,
        membershipValidated: true,
        password: await bcrypt.hash('123321ZxQ@*', 10) // Обновляем пароль
      }
    });

    console.log('✅ Пользователь обновлен:');
    console.log('📧 Email:', updatedAdmin.email);
    console.log('👤 Роль:', updatedAdmin.role);
    console.log('✅ Активен:', updatedAdmin.isActive);
    console.log('🔑 Пароль: 123321ZxQ@*');
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении администратора:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateSupportAdmin()
  .then(() => {
    console.log('🎉 Скрипт завершен успешно!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Скрипт завершился с ошибкой:', error);
    process.exit(1);
  });

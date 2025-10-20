#!/usr/bin/env node

// Скрипт для очистки тестовых данных из базы данных
const { PrismaClient } = require('@prisma/client');

async function cleanupDatabase() {
  console.log('🧹 Очистка тестовых данных из базы данных...');
  
  const prisma = new PrismaClient();
  
  try {
    // Получаем всех пользователей
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });
    
    console.log('📋 Текущие пользователи:');
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`);
    });
    
    // Определяем пользователей для удаления (все кроме супер-администратора)
    const usersToDelete = allUsers.filter(user => user.email !== 'support@myunion.pro');
    
    if (usersToDelete.length === 0) {
      console.log('✅ Нет тестовых пользователей для удаления');
      return;
    }
    
    console.log(`\n🗑️  Удаляем ${usersToDelete.length} тестовых пользователей:`);
    
    for (const user of usersToDelete) {
      console.log(`  - Удаляем: ${user.email} (${user.firstName} ${user.lastName})`);
      
      // Удаляем связанные данные
      await prisma.membershipApplication.deleteMany({
        where: { userId: user.id }
      });
      
      // Удаляем пользователя
      await prisma.user.delete({
        where: { id: user.id }
      });
    }
    
    // Очищаем тестовые организации (кроме тех, что нужны для работы)
    console.log('\n🏢 Очистка тестовых организаций...');
    const organizations = await prisma.organization.findMany();
    console.log(`📋 Текущие организации: ${organizations.length}`);
    
    // Оставляем только организации, которые нужны для работы системы
    // Можно удалить все, если они не нужны для демонстрации
    
    // Очищаем тестовые новости
    console.log('\n📰 Очистка тестовых новостей...');
    const newsCount = await prisma.news.count();
    if (newsCount > 0) {
      await prisma.news.deleteMany({});
      console.log(`  - Удалено ${newsCount} новостей`);
    }
    
    // Очищаем тестовые заявления на членство
    console.log('\n📝 Очистка тестовых заявлений на членство...');
    const applicationsCount = await prisma.membershipApplication.count();
    if (applicationsCount > 0) {
      await prisma.membershipApplication.deleteMany({});
      console.log(`  - Удалено ${applicationsCount} заявлений`);
    }
    
    // Проверяем результат
    const remainingUsers = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });
    
    console.log('\n✅ Очистка завершена!');
    console.log('📋 Оставшиеся пользователи:');
    remainingUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка при очистке базы данных:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDatabase();

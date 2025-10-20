#!/usr/bin/env node

// Скрипт для проверки состояния базы данных после очистки
const { PrismaClient } = require('@prisma/client');

async function checkDatabaseState() {
  console.log('🔍 Проверка состояния базы данных...');
  
  const prisma = new PrismaClient();
  
  try {
    // Проверяем пользователей
    const users = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log(`\n👥 Пользователи (${users.length}):`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`);
    });
    
    // Проверяем организации
    const organizations = await prisma.organization.findMany({
      select: {
        name: true,
        type: true,
        email: true,
        createdAt: true
      }
    });
    
    console.log(`\n🏢 Организации (${organizations.length}):`);
    organizations.forEach(org => {
      console.log(`  - ${org.name} (${org.type}) - ${org.email}`);
    });
    
    // Проверяем заявления на членство
    const applications = await prisma.membershipApplication.count();
    console.log(`\n📝 Заявления на членство: ${applications}`);
    
    // Проверяем новости
    const news = await prisma.news.count();
    console.log(`📰 Новости: ${news}`);
    
    // Проверяем задачи
    const tasks = await prisma.task.count();
    console.log(`📋 Задачи: ${tasks}`);
    
    // Проверяем документы
    const documents = await prisma.document.count();
    console.log(`📄 Документы: ${documents}`);
    
    // Проверяем проекты
    const projects = await prisma.project.count();
    console.log(`🚀 Проекты: ${projects}`);
    
    // Проверяем отчеты
    const reports = await prisma.report.count();
    console.log(`📊 Отчеты: ${reports}`);
    
    console.log('\n✅ База данных готова для работы с живыми данными!');
    
  } catch (error) {
    console.error('❌ Ошибка при проверке базы данных:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState();

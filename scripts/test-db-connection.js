#!/usr/bin/env node

// Простой тест подключения к базе данных
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Тестирование подключения к базе данных...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "postgresql://gen_user:%3C!zq%3F)gO4K8lvh@194.31.173.95:5432/postgres?schema=public&sslmode=require"
      }
    }
  });
  
  try {
    // Простой запрос для проверки подключения
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Подключение успешно!', result);
    
    // Проверяем, есть ли пользователи
    const userCount = await prisma.user.count();
    console.log('👥 Количество пользователей:', userCount);
    
    // Проверяем супер-администратора
    const superAdmin = await prisma.user.findUnique({
      where: { email: 'support@myunion.pro' },
      select: { email: true, firstName: true, lastName: true, role: true }
    });
    console.log('🔑 Супер-администратор:', superAdmin);
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    console.error('Детали:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

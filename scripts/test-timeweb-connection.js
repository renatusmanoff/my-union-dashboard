#!/usr/bin/env node

// Тест подключения к Timeweb Cloud PostgreSQL
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🌐 Тестирование подключения к Timeweb Cloud PostgreSQL...');
  
  const prisma = new PrismaClient();
  
  try {
    // Тест подключения
    await prisma.$connect();
    console.log('✅ Подключение к Timeweb Cloud успешно!');
    
    // Тест простого запроса
    const result = await prisma.$queryRaw`SELECT version() as version`;
    console.log('📊 Версия PostgreSQL:', result[0].version);
    
    // Проверка существующих таблиц
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📋 Существующие таблицы:', tables.length);
    if (tables.length > 0) {
      console.log('   Таблицы:', tables.map(t => t.table_name).join(', '));
    }
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

#!/usr/bin/env node

// Скрипт для обновления пароля супер-администратора
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function updateSuperAdminPassword() {
  console.log('🔐 Обновление пароля супер-администратора...');
  
  const prisma = new PrismaClient();
  
  try {
    // Хешируем пароль "password"
    const hashedPassword = await bcrypt.hash('password', 10);
    console.log('🔑 Хешированный пароль:', hashedPassword);
    
    // Обновляем пароль супер-администратора
    const updatedUser = await prisma.user.update({
      where: { email: 'support@myunion.pro' },
      data: { password: hashedPassword },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });
    
    console.log('✅ Пароль обновлен для пользователя:', updatedUser);
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении пароля:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateSuperAdminPassword();

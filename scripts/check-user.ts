import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({ 
    where: { email: 'support@myunion.pro' } 
  });
  
  if (user) {
    console.log('=== Текущий пользователь ===');
    console.log('Email:', user.email);
    console.log('Роль:', user.role);
    console.log('Имя:', user.firstName, user.lastName);
  } else {
    console.log('Пользователь support@myunion.pro не найден');
  }

  // Проверим нового супер-администратора
  const superAdmin = await prisma.user.findUnique({
    where: { email: 'suslonova@myunion.pro' }
  });
  
  if (superAdmin) {
    console.log('\n=== Супер-администратор ===');
    console.log('Email:', superAdmin.email);
    console.log('Роль:', superAdmin.role);
    console.log('Имя:', superAdmin.firstName, superAdmin.lastName);
  }
  
  await prisma.$disconnect();
}

checkUser();

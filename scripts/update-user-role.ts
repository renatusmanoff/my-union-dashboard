import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserRole() {
  // Проверим текущего пользователя
  const currentUser = await prisma.user.findUnique({ 
    where: { email: 'support@myunion.pro' } 
  });
  
  if (currentUser) {
    console.log('=== Текущий пользователь support@myunion.pro ===');
    console.log('Email:', currentUser.email);
    console.log('Текущая роль:', currentUser.role);
    console.log('Имя:', currentUser.firstName, currentUser.lastName);
    
    // Обновим роль на SUPER_ADMIN
    const updated = await prisma.user.update({
      where: { email: 'support@myunion.pro' },
      data: { role: 'SUPER_ADMIN' }
    });
    
    console.log('\n✅ Роль обновлена на:', updated.role);
  } else {
    console.log('❌ Пользователь support@myunion.pro не найден');
  }

  // Проверим супер-администратора Суслонову
  const superAdmin = await prisma.user.findUnique({
    where: { email: 'suslonova@myunion.pro' }
  });
  
  if (superAdmin) {
    console.log('\n=== Супер-администратор Суслонова Н.В. ===');
    console.log('Email:', superAdmin.email);
    console.log('Роль:', superAdmin.role);
    console.log('Имя:', superAdmin.firstName, superAdmin.lastName);
    console.log('Пароль для входа: 123321ZxQ@*');
  } else {
    console.log('\n❌ Супер-администратор Суслонова не найден');
  }
  
  // Покажем всех супер-админов
  const allSuperAdmins = await prisma.user.findMany({
    where: { role: 'SUPER_ADMIN' },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      role: true
    }
  });
  
  console.log('\n=== Все супер-администраторы в системе ===');
  allSuperAdmins.forEach((admin, index) => {
    console.log(`${index + 1}. ${admin.firstName} ${admin.lastName} (${admin.email})`);
  });
  
  await prisma.$disconnect();
}

updateUserRole();

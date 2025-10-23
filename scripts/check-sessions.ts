import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurrentSessions() {
  // Получим все активные сессии
  const sessions = await prisma.session.findMany({
    where: {
      expiresAt: {
        gte: new Date()
      }
    },
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          role: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log('=== Активные сессии ===');
  sessions.forEach((session, index) => {
    console.log(`\n${index + 1}. Пользователь: ${session.user.firstName} ${session.user.lastName}`);
    console.log(`   Email: ${session.user.email}`);
    console.log(`   Роль: ${session.user.role}`);
    console.log(`   Token: ${session.token.substring(0, 20)}...`);
    console.log(`   Истекает: ${session.expiresAt}`);
  });

  // Обновим роль для support@myunion.pro на SUPER_ADMIN
  const updatedUser = await prisma.user.update({
    where: { email: 'support@myunion.pro' },
    data: { role: 'SUPER_ADMIN' }
  });

  console.log('\n=== Роль обновлена ===');
  console.log(`${updatedUser.firstName} ${updatedUser.lastName}: ${updatedUser.role}`);
  
  console.log('\n✅ Теперь выйдите и войдите заново, чтобы увидеть меню "Организации"');
  
  await prisma.$disconnect();
}

checkCurrentSessions();

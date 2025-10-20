require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: '9061109990@mail.ru' },
      include: { organization: true }
    });

    if (user) {
      console.log('✅ Пользователь найден:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.firstName, user.lastName);
      console.log('   Role:', user.role);
      console.log('   Organization:', user.organization?.name);
      console.log('   Active:', user.isActive);
    } else {
      console.log('❌ Пользователь не найден!');
    }

    // Проверяем всех администраторов
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
        }
      },
      include: { organization: true }
    });

    console.log('\n📋 Все администраторы в системе:');
    admins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.role}) in ${admin.organization?.name}`);
    });

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();

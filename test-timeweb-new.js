const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://gen_user:%3C!zq%3F)gO4K8lvh@194.31.173.95:5432/myunion_db"
    }
  }
});

async function test() {
  try {
    console.log('🔄 Попытка подключения к Timeweb Cloud (новый IP)...');
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('✅ Успешно подключено! Время на сервере:', result);
    
    // Проверяем пользователя
    const user = await prisma.user.findUnique({
      where: { email: 'support@myunion.pro' }
    });
    console.log('✅ Пользователь найден:', user?.email, user?.role);
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    if (error.code) console.error('Код ошибки:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

test();

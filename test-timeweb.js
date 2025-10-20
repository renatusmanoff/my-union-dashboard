const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://gen_user:y4Uy3P9yS0@185.220.101.39:5432/myunion_db"
    }
  }
});

async function test() {
  try {
    console.log('Попытка подключения к Timeweb Cloud...');
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('✅ Успешно подключено! Время на сервере:', result);
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    if (error.code) console.error('Код ошибки:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

test();

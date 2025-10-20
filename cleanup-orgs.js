const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://gen_user:%3C!zq%3F)gO4K8lvh@194.31.173.95:5432/myunion_db"
    }
  }
});

async function cleanup() {
  try {
    console.log('🗑️ Очистка тестовых организаций...');
    
    // Находим все организации
    const orgs = await prisma.organization.findMany({});
    console.log(`Найдено ${orgs.length} организаций`);
    
    // Удаляем пользователей, связанных с этими организациями
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN'] }
      }
    });
    console.log(`Найдено ${admins.length} администраторов`);
    
    for (const admin of admins) {
      try {
        await prisma.user.delete({ where: { id: admin.id } });
        console.log(`✓ Удален администратор: ${admin.email}`);
      } catch (err) {
        console.log(`⊘ Не удалось удалить администратора ${admin.email}`);
      }
    }
    
    // Удаляем организации (кроме главной)
    for (const org of orgs) {
      if (org.name !== 'MyUnion Main Organization') {
        try {
          await prisma.organization.delete({ where: { id: org.id } });
          console.log(`✓ Удалена организация: ${org.name}`);
        } catch (err) {
          console.log(`⊘ Не удалось удалить организацию ${org.name}: ${err.message}`);
        }
      }
    }
    
    console.log('\n✅ Очистка завершена');
  } catch (error) {
    console.error('❌ Ошибка при очистке:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();

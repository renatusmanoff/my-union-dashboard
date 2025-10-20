const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://gen_user:%3C!zq%3F)gO4K8lvh@194.31.173.95:5432/myunion_db"
    }
  }
});

async function check() {
  try {
    const orgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        type: true
      }
    });
    console.log('\n📋 Существующие организации:');
    orgs.forEach(org => {
      console.log(`  - ${org.name} (${org.email}) - Тип: ${org.type}`);
    });
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();

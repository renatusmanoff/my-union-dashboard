#!/usr/bin/env node

// Скрипт для очистки тестовых организаций
const { PrismaClient } = require('@prisma/client');

async function cleanupOrganizations() {
  console.log('🏢 Очистка тестовых организаций...');
  
  const prisma = new PrismaClient();
  
  try {
    // Получаем все организации
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        email: true
      }
    });
    
    console.log('📋 Текущие организации:');
    organizations.forEach(org => {
      console.log(`  - ${org.name} (${org.type}) - ${org.email}`);
    });
    
    if (organizations.length === 0) {
      console.log('✅ Нет организаций для удаления');
      return;
    }
    
    console.log(`\n🗑️  Удаляем ${organizations.length} тестовых организаций:`);
    
    for (const org of organizations) {
      console.log(`  - Удаляем: ${org.name}`);
      
      // Удаляем организацию (связанные данные удалятся автоматически)
      await prisma.organization.delete({
        where: { id: org.id }
      });
    }
    
    console.log('\n✅ Очистка организаций завершена!');
    
  } catch (error) {
    console.error('❌ Ошибка при очистке организаций:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrganizations();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestOrganization() {
  try {
    // Создаем тестовую организацию
    const organization = await prisma.organization.create({
      data: {
        name: 'Первичная профсоюзная организация МГУ',
        type: 'PRIMARY',
        industry: 'EDUCATION',
        address: 'Москва, Ленинские горы, 1',
        phone: '+7 (495) 939-1000',
        email: 'profkom@msu.ru',
        chairmanName: 'Иванов Иван Иванович',
        membersCount: 0,
        isActive: true
      }
    });

    console.log('✅ Тестовая организация создана:', organization);

    // Создаем тестового председателя
    const chairman = await prisma.user.create({
      data: {
        email: 'chairman@msu.ru',
        password: '$2b$10$example.hash.here', // В реальности должен быть хешированный пароль
        firstName: 'Иван',
        lastName: 'Иванов',
        middleName: 'Иванович',
        phone: '+7 (495) 939-1001',
        role: 'PRIMARY_CHAIRMAN',
        organizationId: organization.id,
        isActive: true,
        emailVerified: true
      }
    });

    console.log('✅ Тестовый председатель создан:', chairman);

    return { organization, chairman };

  } catch (error) {
    console.error('❌ Ошибка при создании тестовых данных:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт
createTestOrganization()
  .then(() => {
    console.log('🎉 Тестовые данные успешно созданы!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Ошибка:', error);
    process.exit(1);
  });

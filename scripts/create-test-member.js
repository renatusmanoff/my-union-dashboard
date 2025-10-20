const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestMember() {
  try {
    // Получаем организацию МГУ
    const organization = await prisma.organization.findFirst({
      where: { name: 'Первичная профсоюзная организация МГУ' }
    });

    if (!organization) {
      console.log('❌ Организация МГУ не найдена');
      return;
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Создаем тестового члена профсоюза
    const member = await prisma.user.create({
      data: {
        email: 'member@msu.ru',
        password: hashedPassword,
        firstName: 'Петр',
        lastName: 'Петров',
        middleName: 'Петрович',
        phone: '+7 (495) 123-45-68',
        role: 'PRIMARY_MEMBER',
        organizationId: organization.id,
        isActive: true,
        emailVerified: true
      }
    });

    console.log('✅ Тестовый член профсоюза создан:', member);

    // Создаем заявление на вступление для этого члена
    const application = await prisma.membershipApplication.create({
      data: {
        firstName: member.firstName,
        lastName: member.lastName,
        middleName: member.middleName,
        gender: 'MALE',
        dateOfBirth: new Date('1985-03-15'),
        phone: member.phone,
        address: JSON.stringify({
          city: 'Москва',
          street: 'Ленинские горы, 1'
        }),
        organizationId: organization.id,
        status: 'APPROVED', // Одобренное заявление
        userId: member.id
      }
    });

    console.log('✅ Заявление на вступление создано:', application);

    return { member, application };

  } catch (error) {
    console.error('❌ Ошибка при создании тестового члена:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт
createTestMember()
  .then(() => {
    console.log('🎉 Тестовый член профсоюза создан успешно!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Ошибка:', error);
    process.exit(1);
  });

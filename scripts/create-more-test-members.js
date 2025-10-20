const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createMoreTestMembers() {
  try {
    // Получаем организацию МГУ
    const organization = await prisma.organization.findFirst({
      where: { name: 'Первичная профсоюзная организация МГУ' }
    });

    if (!organization) {
      console.log('❌ Организация МГУ не найдена');
      return;
    }

    const testMembers = [
      {
        email: 'ivanova@msu.ru',
        firstName: 'Анна',
        lastName: 'Иванова',
        middleName: 'Сергеевна',
        phone: '+7 (495) 123-45-69',
        status: 'PENDING'
      },
      {
        email: 'sidorov@msu.ru',
        firstName: 'Михаил',
        lastName: 'Сидоров',
        middleName: 'Александрович',
        phone: '+7 (495) 123-45-70',
        status: 'REJECTED'
      },
      {
        email: 'kozlov@msu.ru',
        firstName: 'Дмитрий',
        lastName: 'Козлов',
        middleName: 'Владимирович',
        phone: '+7 (495) 123-45-71',
        status: 'APPROVED'
      }
    ];

    for (const memberData of testMembers) {
      // Хешируем пароль
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      // Создаем члена профсоюза
      const member = await prisma.user.create({
        data: {
          email: memberData.email,
          password: hashedPassword,
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          middleName: memberData.middleName,
          phone: memberData.phone,
          role: 'PRIMARY_MEMBER',
          organizationId: organization.id,
          isActive: true,
          emailVerified: true
        }
      });

      // Создаем заявление на вступление
      await prisma.membershipApplication.create({
        data: {
          firstName: member.firstName,
          lastName: member.lastName,
          middleName: member.middleName,
          gender: 'FEMALE',
          dateOfBirth: new Date('1990-06-20'),
          phone: member.phone,
          address: JSON.stringify({
            city: 'Москва',
            street: 'Ленинские горы, 1'
          }),
          organizationId: organization.id,
          status: memberData.status,
          userId: member.id
        }
      });

      console.log(`✅ Создан член: ${member.firstName} ${member.lastName} (${memberData.status})`);
    }

    console.log('🎉 Все тестовые члены созданы!');

  } catch (error) {
    console.error('❌ Ошибка при создании тестовых членов:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт
createMoreTestMembers()
  .then(() => {
    console.log('🎉 Скрипт завершен успешно!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Ошибка:', error);
    process.exit(1);
  });

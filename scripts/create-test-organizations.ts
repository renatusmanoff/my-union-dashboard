import { prisma } from '../lib/database';
import bcrypt from 'bcryptjs';

async function createTestOrganizations() {
  console.log('🔄 Создаем тестовые организации с председателями и членами профсоюза...');

  try {
    // Создаем федеральную организацию
    const federalOrg = await prisma.organization.create({
      data: {
        name: 'Федерация профсоюзов России',
        type: 'FEDERAL',
        industry: 'EDUCATION',
        address: 'Москва, Красная площадь, 1',
        phone: '+7 (495) 123-45-67',
        email: 'federal@union.ru',
        inn: '1234567890'
      }
    });

    console.log('✅ Федеральная организация создана:', federalOrg.name);

    // Создаем федерального председателя
    const federalChairman = await prisma.user.create({
      data: {
        email: 'federal.chairman@union.ru',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Иван',
        lastName: 'Федералов',
        middleName: 'Петрович',
        phone: '+7 (495) 111-11-11',
        role: 'FEDERAL_CHAIRMAN',
        organizationId: federalOrg.id,
        isActive: true,
        emailVerified: true
      }
    });

    console.log('✅ Федеральный председатель создан:', federalChairman.email);

    // Создаем региональную организацию
    const regionalOrg = await prisma.organization.create({
      data: {
        name: 'Московская областная организация профсоюза',
        type: 'REGIONAL',
        industry: 'EDUCATION',
        address: 'Москва, ул. Тверская, 10',
        phone: '+7 (495) 222-22-22',
        email: 'regional@union.ru',
        inn: '2345678901',
        parentId: federalOrg.id
      }
    });

    console.log('✅ Региональная организация создана:', regionalOrg.name);

    // Создаем регионального председателя
    const regionalChairman = await prisma.user.create({
      data: {
        email: 'regional.chairman@union.ru',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Петр',
        lastName: 'Регионов',
        middleName: 'Иванович',
        phone: '+7 (495) 333-33-33',
        role: 'REGIONAL_CHAIRMAN',
        organizationId: regionalOrg.id,
        isActive: true,
        emailVerified: true
      }
    });

    console.log('✅ Региональный председатель создан:', regionalChairman.email);

    // Создаем местную организацию
    const localOrg = await prisma.organization.create({
      data: {
        name: 'Профсоюз работников образования г. Москвы',
        type: 'LOCAL',
        industry: 'EDUCATION',
        address: 'Москва, ул. Арбат, 20',
        phone: '+7 (495) 444-44-44',
        email: 'local@union.ru',
        inn: '3456789012',
        parentId: regionalOrg.id
      }
    });

    console.log('✅ Местная организация создана:', localOrg.name);

    // Создаем местного председателя
    const localChairman = await prisma.user.create({
      data: {
        email: 'local.chairman@union.ru',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Сергей',
        lastName: 'Местный',
        middleName: 'Александрович',
        phone: '+7 (495) 555-55-55',
        role: 'LOCAL_CHAIRMAN',
        organizationId: localOrg.id,
        isActive: true,
        emailVerified: true
      }
    });

    console.log('✅ Местный председатель создан:', localChairman.email);

    // Создаем первичную организацию
    const primaryOrg = await prisma.organization.create({
      data: {
        name: 'Профсоюзная организация школы №123',
        type: 'PRIMARY',
        industry: 'EDUCATION',
        address: 'Москва, ул. Школьная, 5',
        phone: '+7 (495) 666-66-66',
        email: 'primary@union.ru',
        inn: '4567890123',
        parentId: localOrg.id
      }
    });

    console.log('✅ Первичная организация создана:', primaryOrg.name);

    // Создаем председателя первичной организации
    const primaryChairman = await prisma.user.create({
      data: {
        email: 'primary.chairman@union.ru',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Анна',
        lastName: 'Первичная',
        middleName: 'Владимировна',
        phone: '+7 (495) 777-77-77',
        role: 'PRIMARY_CHAIRMAN',
        organizationId: primaryOrg.id,
        isActive: true,
        emailVerified: true
      }
    });

    console.log('✅ Председатель первичной организации создан:', primaryChairman.email);

    // Создаем несколько членов профсоюза
    const members = [
      {
        firstName: 'Мария',
        lastName: 'Учитель',
        middleName: 'Ивановна',
        email: 'teacher1@school.ru',
        phone: '+7 (495) 888-88-88'
      },
      {
        firstName: 'Алексей',
        lastName: 'Преподаватель',
        middleName: 'Петрович',
        email: 'teacher2@school.ru',
        phone: '+7 (495) 999-99-99'
      },
      {
        firstName: 'Елена',
        lastName: 'Воспитатель',
        middleName: 'Сергеевна',
        email: 'teacher3@school.ru',
        phone: '+7 (495) 000-00-00'
      }
    ];

    for (const memberData of members) {
      const member = await prisma.user.create({
        data: {
          ...memberData,
          password: await bcrypt.hash('password123', 10),
          role: 'PRIMARY_MEMBER',
          organizationId: primaryOrg.id,
          isActive: true,
          emailVerified: true,
          membershipValidated: true
        }
      });

      console.log('✅ Член профсоюза создан:', member.email);
    }

    // Создаем несколько заявлений на вступление
    const applications = [
      {
        firstName: 'Новый',
        lastName: 'Участник',
        middleName: 'Тестович',
        phone: '+7 (495) 111-11-11',
        dateOfBirth: new Date('1985-05-15'),
        address: JSON.stringify({
          city: 'Москва',
          street: 'ул. Новая, д. 1'
        })
      },
      {
        firstName: 'Еще',
        lastName: 'Один',
        middleName: 'Кандидат',
        phone: '+7 (495) 222-22-22',
        dateOfBirth: new Date('1990-08-20'),
        address: JSON.stringify({
          city: 'Москва',
          street: 'ул. Кандидатская, д. 2'
        })
      }
    ];

    for (const appData of applications) {
      const application = await prisma.membershipApplication.create({
        data: {
          ...appData,
          organizationId: primaryOrg.id,
          status: 'PENDING'
        }
      });

      console.log('✅ Заявление на вступление создано:', application.id);
    }

    console.log('🎉 Тестовые организации и пользователи созданы успешно!');
    console.log('\n📋 Созданные учетные записи:');
    console.log('Федеральный председатель: federal.chairman@union.ru / password123');
    console.log('Региональный председатель: regional.chairman@union.ru / password123');
    console.log('Местный председатель: local.chairman@union.ru / password123');
    console.log('Председатель первичной организации: primary.chairman@union.ru / password123');
    console.log('Члены профсоюза: teacher1@school.ru, teacher2@school.ru, teacher3@school.ru / password123');

  } catch (error) {
    console.error('❌ Ошибка при создании тестовых организаций:', error);
  }
}

createTestOrganizations()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

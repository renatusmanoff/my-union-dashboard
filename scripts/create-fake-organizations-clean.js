const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function clearExistingData() {
  try {
    console.log('🧹 Очищаем существующие данные...');
    
    // Удаляем в правильном порядке из-за foreign key constraints
    await prisma.membershipDocument.deleteMany();
    await prisma.membershipApplication.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
    
    console.log('✅ Данные очищены');
  } catch (error) {
    console.error('❌ Ошибка при очистке данных:', error);
    throw error;
  }
}

async function createFakeOrganizations() {
  try {
    console.log('🏢 Создаем фейковые организации с председателями и членами...\n');

    // 1. Федеральная организация
    const federalOrg = await prisma.organization.create({
      data: {
        name: 'Федерация профсоюзов России',
        type: 'FEDERAL',
        industry: 'EDUCATION',
        address: 'Москва, ул. Тверская, 15',
        phone: '+7 (495) 123-45-67',
        email: 'federation@profsoyuz.ru',
        chairmanName: 'Петров Петр Петрович',
        membersCount: 0,
        isActive: true
      }
    });

    // Федеральный председатель
    const federalChairman = await prisma.user.create({
      data: {
        email: 'federal@profsoyuz.ru',
        password: await bcrypt.hash('123456', 10),
        firstName: 'Петр',
        lastName: 'Петров',
        middleName: 'Петрович',
        phone: '+7 (495) 123-45-68',
        role: 'FEDERAL_CHAIRMAN',
        organizationId: federalOrg.id,
        isActive: true,
        emailVerified: true
      }
    });

    console.log('✅ Федеральная организация создана:', federalOrg.name);
    console.log('✅ Федеральный председатель:', federalChairman.email);

    // 2. Региональная организация (Московская область)
    const regionalOrg1 = await prisma.organization.create({
      data: {
        name: 'Московская областная организация профсоюзов',
        type: 'REGIONAL',
        industry: 'EDUCATION',
        address: 'Московская область, г. Подольск, ул. Ленина, 1',
        phone: '+7 (496) 123-45-67',
        email: 'moscow-region@profsoyuz.ru',
        chairmanName: 'Иванова Анна Сергеевна',
        membersCount: 0,
        isActive: true
      }
    });

    const regionalChairman1 = await prisma.user.create({
      data: {
        email: 'regional1@profsoyuz.ru',
        password: await bcrypt.hash('123456', 10),
        firstName: 'Анна',
        lastName: 'Иванова',
        middleName: 'Сергеевна',
        phone: '+7 (496) 123-45-68',
        role: 'REGIONAL_CHAIRMAN',
        organizationId: regionalOrg1.id,
        isActive: true,
        emailVerified: true
      }
    });

    console.log('✅ Региональная организация 1 создана:', regionalOrg1.name);
    console.log('✅ Региональный председатель 1:', regionalChairman1.email);

    // 3. Региональная организация (Санкт-Петербург)
    const regionalOrg2 = await prisma.organization.create({
      data: {
        name: 'Санкт-Петербургская городская организация профсоюзов',
        type: 'REGIONAL',
        industry: 'EDUCATION',
        address: 'Санкт-Петербург, Невский проспект, 1',
        phone: '+7 (812) 123-45-67',
        email: 'spb@profsoyuz.ru',
        chairmanName: 'Сидоров Михаил Александрович',
        membersCount: 0,
        isActive: true
      }
    });

    const regionalChairman2 = await prisma.user.create({
      data: {
        email: 'regional2@profsoyuz.ru',
        password: await bcrypt.hash('123456', 10),
        firstName: 'Михаил',
        lastName: 'Сидоров',
        middleName: 'Александрович',
        phone: '+7 (812) 123-45-68',
        role: 'REGIONAL_CHAIRMAN',
        organizationId: regionalOrg2.id,
        isActive: true,
        emailVerified: true
      }
    });

    console.log('✅ Региональная организация 2 создана:', regionalOrg2.name);
    console.log('✅ Региональный председатель 2:', regionalChairman2.email);

    // 4. Местная организация (Подольск)
    const localOrg1 = await prisma.organization.create({
      data: {
        name: 'Подольская городская организация профсоюзов',
        type: 'LOCAL',
        industry: 'EDUCATION',
        address: 'Подольск, ул. Кирова, 10',
        phone: '+7 (496) 234-56-78',
        email: 'podolsk@profsoyuz.ru',
        chairmanName: 'Козлова Елена Владимировна',
        membersCount: 0,
        isActive: true
      }
    });

    const localChairman1 = await prisma.user.create({
      data: {
        email: 'local1@profsoyuz.ru',
        password: await bcrypt.hash('123456', 10),
        firstName: 'Елена',
        lastName: 'Козлова',
        middleName: 'Владимировна',
        phone: '+7 (496) 234-56-79',
        role: 'LOCAL_CHAIRMAN',
        organizationId: localOrg1.id,
        isActive: true,
        emailVerified: true
      }
    });

    console.log('✅ Местная организация 1 создана:', localOrg1.name);
    console.log('✅ Местный председатель 1:', localChairman1.email);

    // 5. Местная организация (Петергоф)
    const localOrg2 = await prisma.organization.create({
      data: {
        name: 'Петергофская городская организация профсоюзов',
        type: 'LOCAL',
        industry: 'EDUCATION',
        address: 'Петергоф, ул. Разводная, 2',
        phone: '+7 (812) 234-56-78',
        email: 'peterhof@profsoyuz.ru',
        chairmanName: 'Морозов Дмитрий Игоревич',
        membersCount: 0,
        isActive: true
      }
    });

    const localChairman2 = await prisma.user.create({
      data: {
        email: 'local2@profsoyuz.ru',
        password: await bcrypt.hash('123456', 10),
        firstName: 'Дмитрий',
        lastName: 'Морозов',
        middleName: 'Игоревич',
        phone: '+7 (812) 234-56-79',
        role: 'LOCAL_CHAIRMAN',
        organizationId: localOrg2.id,
        isActive: true,
        emailVerified: true
      }
    });

    console.log('✅ Местная организация 2 создана:', localOrg2.name);
    console.log('✅ Местный председатель 2:', localChairman2.email);

    // 6. Первичные организации
    const primaryOrgs = [
      {
        name: 'Первичная профсоюзная организация МГУ',
        type: 'PRIMARY',
        industry: 'EDUCATION',
        address: 'Москва, Ленинские горы, 1',
        phone: '+7 (495) 939-1000',
        email: 'profkom@msu.ru',
        chairmanName: 'Иванов Иван Иванович'
      },
      {
        name: 'Первичная профсоюзная организация МГТУ им. Баумана',
        type: 'PRIMARY',
        industry: 'EDUCATION',
        address: 'Москва, 2-я Бауманская ул., 5',
        phone: '+7 (495) 263-60-00',
        email: 'profkom@bmstu.ru',
        chairmanName: 'Смирнова Ольга Петровна'
      },
      {
        name: 'Первичная профсоюзная организация СПбГУ',
        type: 'PRIMARY',
        industry: 'EDUCATION',
        address: 'Санкт-Петербург, Университетская наб., 7-9',
        phone: '+7 (812) 328-20-00',
        email: 'profkom@spbu.ru',
        chairmanName: 'Волков Алексей Николаевич'
      },
      {
        name: 'Первичная профсоюзная организация Газпром',
        type: 'PRIMARY',
        industry: 'ENERGY',
        address: 'Москва, ул. Наметкина, 16',
        phone: '+7 (495) 719-30-00',
        email: 'profkom@gazprom.ru',
        chairmanName: 'Новиков Сергей Михайлович'
      },
      {
        name: 'Первичная профсоюзная организация Сбербанк',
        type: 'PRIMARY',
        industry: 'FINANCE',
        address: 'Москва, ул. Вавилова, 19',
        phone: '+7 (495) 500-55-50',
        email: 'profkom@sberbank.ru',
        chairmanName: 'Федорова Мария Александровна'
      }
    ];

    const primaryChairmen = [
      { firstName: 'Иван', lastName: 'Иванов', middleName: 'Иванович', email: 'chairman@msu.ru' },
      { firstName: 'Ольга', lastName: 'Смирнова', middleName: 'Петровна', email: 'chairman@bmstu.ru' },
      { firstName: 'Алексей', lastName: 'Волков', middleName: 'Николаевич', email: 'chairman@spbu.ru' },
      { firstName: 'Сергей', lastName: 'Новиков', middleName: 'Михайлович', email: 'chairman@gazprom.ru' },
      { firstName: 'Мария', lastName: 'Федорова', middleName: 'Александровна', email: 'chairman@sberbank.ru' }
    ];

    for (let i = 0; i < primaryOrgs.length; i++) {
      const org = primaryOrgs[i];
      const chairman = primaryChairmen[i];

      const primaryOrg = await prisma.organization.create({
        data: {
          name: org.name,
          type: org.type,
          industry: org.industry,
          address: org.address,
          phone: org.phone,
          email: org.email,
          chairmanName: org.chairmanName,
          membersCount: 0,
          isActive: true
        }
      });

      const primaryChairman = await prisma.user.create({
        data: {
          email: chairman.email,
          password: await bcrypt.hash('123456', 10),
          firstName: chairman.firstName,
          lastName: chairman.lastName,
          middleName: chairman.middleName,
          phone: `+7 (495) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90) + 10}`,
          role: 'PRIMARY_CHAIRMAN',
          organizationId: primaryOrg.id,
          isActive: true,
          emailVerified: true
        }
      });

      console.log(`✅ Первичная организация ${i + 1} создана:`, primaryOrg.name);
      console.log(`✅ Первичный председатель ${i + 1}:`, primaryChairman.email);

      // Создаем членов профсоюза для каждой первичной организации
      await createMembersForOrganization(primaryOrg.id, primaryOrg.name);
    }

    console.log('\n🎉 Все организации и председатели созданы успешно!');

  } catch (error) {
    console.error('❌ Ошибка при создании организаций:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function createMembersForOrganization(organizationId, organizationName) {
  const memberNames = [
    { firstName: 'Александр', lastName: 'Петров', middleName: 'Сергеевич' },
    { firstName: 'Елена', lastName: 'Сидорова', middleName: 'Александровна' },
    { firstName: 'Михаил', lastName: 'Козлов', middleName: 'Владимирович' },
    { firstName: 'Анна', lastName: 'Морозова', middleName: 'Игоревна' },
    { firstName: 'Дмитрий', lastName: 'Волков', middleName: 'Николаевич' },
    { firstName: 'Ольга', lastName: 'Новикова', middleName: 'Михайловна' },
    { firstName: 'Сергей', lastName: 'Федоров', middleName: 'Александрович' },
    { firstName: 'Мария', lastName: 'Смирнова', middleName: 'Петровна' }
  ];

  for (let i = 0; i < memberNames.length; i++) {
    const member = memberNames[i];
    const orgDomain = organizationName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace('первичнаяпрофсоюзнаяорганизация', '')
      .substring(0, 10);
    const email = `member${i + 1}@${orgDomain}.ru`;
    
    try {
      const user = await prisma.user.create({
        data: {
          email: email,
          password: await bcrypt.hash('123456', 10),
          firstName: member.firstName,
          lastName: member.lastName,
          middleName: member.middleName,
          phone: `+7 (495) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90) + 10}`,
          role: 'PRIMARY_MEMBER',
          organizationId: organizationId,
          isActive: true,
          emailVerified: true
        }
      });

      // Создаем заявление на вступление
      const statuses = ['APPROVED', 'PENDING', 'REJECTED'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      await prisma.membershipApplication.create({
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName,
          gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
          dateOfBirth: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          phone: user.phone,
          address: JSON.stringify({
            city: 'Москва',
            street: `ул. Примерная, ${Math.floor(Math.random() * 100) + 1}`
          }),
          organizationId: organizationId,
          status: randomStatus,
          userId: user.id
        }
      });

      console.log(`  ✅ Член создан: ${user.firstName} ${user.lastName} (${email}) - ${randomStatus}`);
    } catch (error) {
      console.log(`  ⚠️ Ошибка создания члена ${i + 1}:`, error.message);
    }
  }
}

// Запускаем скрипт
async function main() {
  await clearExistingData();
  await createFakeOrganizations();
}

main()
  .then(() => {
    console.log('\n🎉 Скрипт завершен успешно!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Ошибка:', error);
    process.exit(1);
  });

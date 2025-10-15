import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Создаем организации
  const systemOrg = await prisma.organization.upsert({
    where: { id: 'org-system' },
    update: {},
    create: {
      id: 'org-system',
      name: 'Система MyUnion',
      type: 'FEDERAL',
      address: 'Москва, ул. Тверская, 1',
      phone: '+7 (495) 000-00-00',
      email: 'system@myunion.pro',
      director: 'Системный администратор',
      membersCount: 1,
      isActive: true
    }
  });

  const federalOrg = await prisma.organization.upsert({
    where: { id: 'org-federal' },
    update: {},
    create: {
      id: 'org-federal',
      name: 'Центральный комитет профсоюза',
      type: 'FEDERAL',
      address: 'Москва, ул. Тверская, 10',
      phone: '+7 (495) 123-45-67',
      email: 'info@federal-union.ru',
      director: 'Иван Петрович Сидоров',
      membersCount: 5,
      isActive: true
    }
  });

  // МООП РЗ РФ - Региональная организация
  const moopOrg = await prisma.organization.upsert({
    where: { id: 'org-moop-rz-rf' },
    update: {},
    create: {
      id: 'org-moop-rz-rf',
      name: 'Московская областная организация профсоюза работников здравоохранения РФ',
      type: 'REGIONAL',
      parentId: federalOrg.id,
      address: 'Москва, ул. Тверская, 15, стр. 1',
      phone: '+7 (495) 123-45-67',
      email: 'info@moop-rz-rf.ru',
      director: 'Председатель МООП РЗ РФ',
      membersCount: 25,
      isActive: true
    }
  });

  const regionalOrg = await prisma.organization.upsert({
    where: { id: 'org-regional' },
    update: {},
    create: {
      id: 'org-regional',
      name: 'Региональная организация Москвы',
      type: 'REGIONAL',
      parentId: federalOrg.id,
      address: 'Москва, ул. Арбат, 20',
      phone: '+7 (495) 234-56-78',
      email: 'info@regional-union.ru',
      director: 'Петр Иванович Козлов',
      membersCount: 3,
      isActive: true
    }
  });

  const localOrg = await prisma.organization.upsert({
    where: { id: 'org-local' },
    update: {},
    create: {
      id: 'org-local',
      name: 'Местная организация Центрального округа',
      type: 'LOCAL',
      parentId: regionalOrg.id,
      address: 'Москва, ул. Пушкинская, 15',
      phone: '+7 (495) 345-67-89',
      email: 'info@local-union.ru',
      director: 'Сергей Александрович Волков',
      membersCount: 2,
      isActive: true
    }
  });

  const primaryOrg = await prisma.organization.upsert({
    where: { id: 'org-primary' },
    update: {},
    create: {
      id: 'org-primary',
      name: 'Первичная организация завода "Москва"',
      type: 'PRIMARY',
      parentId: localOrg.id,
      address: 'Москва, ул. Заводская, 5',
      phone: '+7 (495) 456-78-90',
      email: 'info@primary-union.ru',
      director: 'Алексей Викторович Морозов',
      membersCount: 10,
      isActive: true
    }
  });

  // Создаем пользователей
  const superAdminPassword = await hashPassword('123321ZxQ@*');
  const adminPassword = await hashPassword('password');
  const userPassword = await hashPassword('userpass123');
  const moopPassword = await hashPassword('123456'); // Пароль для МООП РЗ РФ

  // Супер администратор
  await prisma.user.upsert({
    where: { email: 'support@myunion.pro' },
    update: {},
    create: {
      id: 'super-admin-1',
      email: 'support@myunion.pro',
      password: superAdminPassword,
      firstName: 'Супер',
      lastName: 'Администратор',
      middleName: 'Системы',
      phone: '+7 (495) 000-00-00',
      role: 'SUPER_ADMIN',
      organizationId: systemOrg.id,
      isActive: true,
      emailVerified: true,
      membershipValidated: true
    }
  });

  // Федеральный председатель
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      id: 'admin-1',
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Иван',
      lastName: 'Иванов',
      middleName: 'Петрович',
      phone: '+7 (495) 123-45-67',
      role: 'FEDERAL_CHAIRMAN',
      organizationId: federalOrg.id,
      isActive: true,
      emailVerified: true,
      membershipValidated: true
    }
  });

  // Федеральный заместитель председателя
  await prisma.user.upsert({
    where: { email: 'federal-vice@example.com' },
    update: {},
    create: {
      id: 'federal-vice-1',
      email: 'federal-vice@example.com',
      password: adminPassword,
      firstName: 'Петр',
      lastName: 'Петров',
      middleName: 'Иванович',
      phone: '+7 (495) 123-45-68',
      role: 'FEDERAL_VICE_CHAIRMAN',
      organizationId: federalOrg.id,
      isActive: true,
      emailVerified: true,
      membershipValidated: true
    }
  });

  // Региональный председатель
  await prisma.user.upsert({
    where: { email: 'regional@example.com' },
    update: {},
    create: {
      id: 'regional-1',
      email: 'regional@example.com',
      password: adminPassword,
      firstName: 'Петр',
      lastName: 'Петров',
      middleName: 'Иванович',
      phone: '+7 (495) 234-56-78',
      role: 'REGIONAL_CHAIRMAN',
      organizationId: regionalOrg.id,
      isActive: true,
      emailVerified: true,
      membershipValidated: true
    }
  });

  // Местный председатель
  await prisma.user.upsert({
    where: { email: 'local@example.com' },
    update: {},
    create: {
      id: 'local-1',
      email: 'local@example.com',
      password: adminPassword,
      firstName: 'Сергей',
      lastName: 'Сергеев',
      middleName: 'Александрович',
      phone: '+7 (495) 345-67-89',
      role: 'LOCAL_CHAIRMAN',
      organizationId: localOrg.id,
      isActive: true,
      emailVerified: true,
      membershipValidated: true
    }
  });

  // Первичный председатель
  await prisma.user.upsert({
    where: { email: 'primary@example.com' },
    update: {},
    create: {
      id: 'primary-1',
      email: 'primary@example.com',
      password: adminPassword,
      firstName: 'Алексей',
      lastName: 'Алексеев',
      middleName: 'Викторович',
      phone: '+7 (495) 456-78-90',
      role: 'PRIMARY_CHAIRMAN',
      organizationId: primaryOrg.id,
      isActive: true,
      emailVerified: true,
      membershipValidated: true
    }
  });

  // Член профсоюза (может регистрироваться самостоятельно)
  await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      id: 'member-1',
      email: 'member@example.com',
      password: userPassword,
      firstName: 'Член',
      lastName: 'Профсоюза',
      middleName: 'Тестовый',
      phone: '+7 (495) 567-89-01',
      role: 'PRIMARY_MEMBER',
      organizationId: primaryOrg.id,
      isActive: true,
      emailVerified: false,
      membershipValidated: false
    }
  });

  // Профгруппорг (может регистрироваться самостоятельно)
  await prisma.user.upsert({
    where: { email: 'profgroup@example.com' },
    update: {},
    create: {
      id: 'profgroup-1',
      email: 'profgroup@example.com',
      password: userPassword,
      firstName: 'Профгруппорг',
      lastName: 'Тестовый',
      middleName: 'Системный',
      phone: '+7 (495) 567-89-02',
      role: 'PROF_GROUP_ORGANIZER',
      organizationId: primaryOrg.id,
      isActive: true,
      emailVerified: false,
      membershipValidated: false
    }
  });

  // === МООП РЗ РФ - Пользователи ===

  // Председатель МООП РЗ РФ
  await prisma.user.upsert({
    where: { email: 'chairman@moop-rz-rf.ru' },
    update: {},
    create: {
      id: 'moop-chairman-1',
      email: 'chairman@moop-rz-rf.ru',
      password: moopPassword,
      firstName: 'Александр',
      lastName: 'Петров',
      middleName: 'Иванович',
      phone: '+7 (495) 123-45-67',
      role: 'REGIONAL_CHAIRMAN',
      organizationId: moopOrg.id,
      isActive: true,
      emailVerified: true,
      membershipValidated: true
    }
  });

  // Заместитель председателя МООП РЗ РФ
  await prisma.user.upsert({
    where: { email: 'vice-chairman@moop-rz-rf.ru' },
    update: {},
    create: {
      id: 'moop-vice-chairman-1',
      email: 'vice-chairman@moop-rz-rf.ru',
      password: moopPassword,
      firstName: 'Елена',
      lastName: 'Сидорова',
      middleName: 'Александровна',
      phone: '+7 (495) 123-45-68',
      role: 'REGIONAL_VICE_CHAIRMAN',
      organizationId: moopOrg.id,
      isActive: true,
      emailVerified: true,
      membershipValidated: true
    }
  });

  // Главный специалист МООП РЗ РФ (выполняет функции секретаря)
  await prisma.user.upsert({
    where: { email: 'secretary@moop-rz-rf.ru' },
    update: {},
    create: {
      id: 'moop-secretary-1',
      email: 'secretary@moop-rz-rf.ru',
      password: moopPassword,
      firstName: 'Мария',
      lastName: 'Козлова',
      middleName: 'Петровна',
      phone: '+7 (495) 123-45-69',
      role: 'REGIONAL_CHIEF_SPECIALIST',
      organizationId: moopOrg.id,
      isActive: true,
      emailVerified: true,
      membershipValidated: true
    }
  });

  // Председатель контрольно-ревизионной комиссии МООП РЗ РФ
  await prisma.user.upsert({
    where: { email: 'audit-chairman@moop-rz-rf.ru' },
    update: {},
    create: {
      id: 'moop-audit-chairman-1',
      email: 'audit-chairman@moop-rz-rf.ru',
      password: moopPassword,
      firstName: 'Владимир',
      lastName: 'Морозов',
      middleName: 'Сергеевич',
      phone: '+7 (495) 123-45-70',
      role: 'REGIONAL_AUDIT_CHAIRMAN',
      organizationId: moopOrg.id,
      isActive: true,
      emailVerified: true,
      membershipValidated: true
    }
  });

  // Председатель молодежного совета МООП РЗ РФ
  await prisma.user.upsert({
    where: { email: 'youth-chairman@moop-rz-rf.ru' },
    update: {},
    create: {
      id: 'moop-youth-chairman-1',
      email: 'youth-chairman@moop-rz-rf.ru',
      password: moopPassword,
      firstName: 'Анна',
      lastName: 'Волкова',
      middleName: 'Дмитриевна',
      phone: '+7 (495) 123-45-71',
      role: 'REGIONAL_YOUTH_CHAIRMAN',
      organizationId: moopOrg.id,
      isActive: true,
      emailVerified: true,
      membershipValidated: true
    }
  });

  // Член президиума МООП РЗ РФ
  await prisma.user.upsert({
    where: { email: 'presidium@moop-rz-rf.ru' },
    update: {},
    create: {
      id: 'moop-presidium-1',
      email: 'presidium@moop-rz-rf.ru',
      password: moopPassword,
      firstName: 'Сергей',
      lastName: 'Новиков',
      middleName: 'Андреевич',
      phone: '+7 (495) 123-45-72',
      role: 'REGIONAL_PRESIDIUM_MEMBER',
      organizationId: moopOrg.id,
      isActive: true,
      emailVerified: true,
      membershipValidated: true
    }
  });

  // Член профсоюза МООП РЗ РФ (может регистрироваться самостоятельно)
  await prisma.user.upsert({
    where: { email: 'member@moop-rz-rf.ru' },
    update: {},
    create: {
      id: 'moop-member-1',
      email: 'member@moop-rz-rf.ru',
      password: moopPassword,
      firstName: 'Ольга',
      lastName: 'Федорова',
      middleName: 'Михайловна',
      phone: '+7 (495) 123-45-73',
      role: 'PRIMARY_MEMBER',
      organizationId: moopOrg.id,
      isActive: true,
      emailVerified: false,
      membershipValidated: false
    }
  });

  console.log('✅ База данных успешно заполнена!');
  console.log('\n📋 Созданные пользователи:');
  console.log('🔑 Супер администратор: support@myunion.pro / 123321ZxQ@*');
  console.log('👤 Федеральный председатель: admin@example.com / password');
  console.log('👥 Федеральный заместитель: federal-vice@example.com / password');
  console.log('🏢 Региональный председатель: regional@example.com / password');
  console.log('🏛️ Местный председатель: local@example.com / password');
  console.log('🏭 Первичный председатель: primary@example.com / password');
  console.log('👤 Член профсоюза: member@example.com / userpass123');
  console.log('👥 Профгруппорг: profgroup@example.com / userpass123');
  
  console.log('\n🏥 МООП РЗ РФ - Московская областная организация профсоюза работников здравоохранения РФ:');
  console.log('👨‍💼 Председатель: chairman@moop-rz-rf.ru / 123456');
  console.log('👩‍💼 Заместитель председателя: vice-chairman@moop-rz-rf.ru / 123456');
  console.log('📝 Секретарь: secretary@moop-rz-rf.ru / 123456');
  console.log('🔍 Председатель КРК: audit-chairman@moop-rz-rf.ru / 123456');
  console.log('👨‍🎓 Председатель молодежного совета: youth-chairman@moop-rz-rf.ru / 123456');
  console.log('👨‍💻 Член президиума: presidium@moop-rz-rf.ru / 123456');
  console.log('👩‍⚕️ Член профсоюза: member@moop-rz-rf.ru / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

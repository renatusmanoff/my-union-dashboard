import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Создаем супер-администратора
  const superAdmin = await prisma.user.upsert({
    where: { email: 'support@myunion.pro' },
    update: {},
    create: {
      email: 'support@myunion.pro',
      password: await hashPassword('123321ZxQ@*'),
      firstName: 'Супер',
      lastName: 'Администратор',
      phone: '+7 (495) 000-00-00',
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true
    }
  });

  // Создаем организации
  const organizations = [
    {
      name: 'Федерация независимых профсоюзов России (ФНПР)',
      type: 'FEDERAL' as const,
      industry: 'PUBLIC_SERVICE' as const,
      address: 'г. Москва, ул. Ленинская Слобода, д. 19',
      phone: '+7 (495) 623-45-67',
      email: 'info@fnpr.ru',
      chairmanName: 'Михаил Викторович Шмаков',
      chairmanId: 'chairman-1',
      inn: '7702071077',
      membersCount: 20000000
    },
    {
      name: 'Профсоюз работников образования и науки РФ',
      type: 'FEDERAL' as const,
      industry: 'EDUCATION' as const,
      address: 'г. Москва, ул. Щепкина, д. 38',
      phone: '+7 (495) 234-56-78',
      email: 'info@education-union.ru',
      chairmanName: 'Галина Ивановна Меркулова',
      chairmanId: 'chairman-2',
      inn: '7702071078',
      membersCount: 5000000
    },
    {
      name: 'Профсоюз работников здравоохранения РФ',
      type: 'FEDERAL' as const,
      industry: 'HEALTHCARE' as const,
      address: 'г. Москва, ул. Тверская, д. 14',
      phone: '+7 (495) 345-67-89',
      email: 'info@health-union.ru',
      chairmanName: 'Валерий Николаевич Егоров',
      chairmanId: 'chairman-3',
      inn: '7702071079',
      membersCount: 3000000
    },
    {
      name: 'Московская федерация профсоюзов',
      type: 'REGIONAL' as const,
      industry: 'PUBLIC_SERVICE' as const,
      parentId: null, // Будет установлен после создания родительской организации
      address: 'г. Москва, ул. Тверская, д. 22',
      phone: '+7 (495) 678-90-12',
      email: 'info@moscow-union.ru',
      chairmanName: 'Александр Петрович Семенов',
      chairmanId: 'chairman-4',
      inn: '7702071082',
      membersCount: 2500000
    },
    {
      name: 'Первичная профсоюзная организация ПАО "Газпром"',
      type: 'PRIMARY' as const,
      industry: 'OIL_GAS' as const,
      parentId: null, // Будет установлен после создания родительской организации
      address: 'г. Москва, ул. Наметкина, д. 16',
      phone: '+7 (495) 890-12-34',
      email: 'union@gazprom.ru',
      chairmanName: 'Сергей Владимирович Петров',
      chairmanId: 'chairman-5',
      inn: '7736050003',
      membersCount: 50000
    },
    {
      name: 'Первичная профсоюзная организация МГУ им. М.В. Ломоносова',
      type: 'PRIMARY' as const,
      industry: 'EDUCATION' as const,
      parentId: null, // Будет установлен после создания родительской организации
      address: 'г. Москва, Ленинские горы, д. 1',
      phone: '+7 (495) 901-23-45',
      email: 'union@msu.ru',
      chairmanName: 'Анна Михайловна Соколова',
      chairmanId: 'chairman-6',
      inn: '7702071087',
      membersCount: 8000
    }
  ];

  const createdOrganizations = [];
  for (const orgData of organizations) {
    const org = await prisma.organization.upsert({
      where: { email: orgData.email },
      update: {},
      create: orgData
    });
    createdOrganizations.push(org);
  }

  // Устанавливаем связи между организациями
  const fnpr = createdOrganizations.find(org => org.name.includes('ФНПР'));
  const moscowFed = createdOrganizations.find(org => org.name.includes('Московская федерация'));
  
  if (fnpr && moscowFed) {
    await prisma.organization.update({
      where: { id: moscowFed.id },
      data: { parentId: fnpr.id }
    });
  }

  // Создаем тестовых членов профсоюза
  const testMembers = [
    {
      email: 'mikhail.shмаков@fnpr.ru',
      firstName: 'Михаил',
      lastName: 'Шмаков',
      middleName: 'Викторович',
      phone: '+7 (495) 623-45-67',
      role: 'FEDERAL_CHAIRMAN',
      organizationId: createdOrganizations.find(org => org.name.includes('ФНПР'))?.id,
      isActive: true,
      emailVerified: true
    },
    {
      email: 'galina.меркулова@education-union.ru',
      firstName: 'Галина',
      lastName: 'Меркулова',
      middleName: 'Ивановна',
      phone: '+7 (495) 234-56-78',
      role: 'FEDERAL_CHAIRMAN',
      organizationId: createdOrganizations.find(org => org.name.includes('образования'))?.id,
      isActive: true,
      emailVerified: true
    },
    {
      email: 'valery.егоров@health-union.ru',
      firstName: 'Валерий',
      lastName: 'Егоров',
      middleName: 'Николаевич',
      phone: '+7 (495) 345-67-89',
      role: 'FEDERAL_CHAIRMAN',
      organizationId: createdOrganizations.find(org => org.name.includes('здравоохранения'))?.id,
      isActive: true,
      emailVerified: true
    },
    {
      email: 'alexander.семенов@moscow-union.ru',
      firstName: 'Александр',
      lastName: 'Семенов',
      middleName: 'Петрович',
      phone: '+7 (495) 678-90-12',
      role: 'REGIONAL_CHAIRMAN',
      organizationId: createdOrganizations.find(org => org.name.includes('Московская'))?.id,
      isActive: true,
      emailVerified: true
    },
    {
      email: 'sergey.петров@gazprom.ru',
      firstName: 'Сергей',
      lastName: 'Петров',
      middleName: 'Владимирович',
      phone: '+7 (495) 890-12-34',
      role: 'PRIMARY_CHAIRMAN',
      organizationId: createdOrganizations.find(org => org.name.includes('Газпром'))?.id,
      isActive: true,
      emailVerified: true
    },
    {
      email: 'anna.соколова@msu.ru',
      firstName: 'Анна',
      lastName: 'Соколова',
      middleName: 'Михайловна',
      phone: '+7 (495) 901-23-45',
      role: 'PRIMARY_CHAIRMAN',
      organizationId: createdOrganizations.find(org => org.name.includes('МГУ'))?.id,
      isActive: true,
      emailVerified: true
    },
    {
      email: 'renat@reallaw.ai',
      firstName: 'Михаил',
      lastName: 'Петров',
      middleName: 'Александрович',
      phone: '+7 (495) 123-45-67',
      role: 'PRIMARY_MEMBER',
      organizationId: createdOrganizations.find(org => org.name.includes('Газпром'))?.id,
      isActive: true,
      emailVerified: true,
      password: await hashPassword('123321ZxQ@*')
    }
  ];

  for (const memberData of testMembers) {
    if (memberData.organizationId) {
      await prisma.user.upsert({
        where: { email: memberData.email },
        update: {},
        create: {
          ...memberData,
          password: memberData.password || await hashPassword('TempPassword123!')
        }
      });
    }
  }

  // Создаем заявления для всех членов профсоюза
  const membershipApplications = [
    {
      firstName: 'Иван',
      lastName: 'Иванов',
      middleName: 'Петрович',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'MALE' as const,
      education: 'Высшее',
      specialties: ['Инженер-программист'],
      positions: ['Ведущий разработчик'],
      addressIndex: '123456',
      addressRegion: 'Московская область',
      addressMunicipality: 'г. Москва',
      addressLocality: 'г. Москва',
      addressStreet: 'ул. Ленина',
      addressHouse: '10',
      addressApartment: '25',
      phone: '+7 (999) 123-45-67',
      additionalPhone: '+7 (999) 987-65-43',
      email: 'ivan.ivanov@example.com',
      children: [{ name: 'Анна Иванова', dateOfBirth: new Date('2015-03-20') }],
      hobbies: ['Программирование', 'Спорт'],
      organizationId: createdOrganizations.find(org => org.name.includes('Газпром'))?.id || createdOrganizations[0].id,
      applicationDate: new Date(),
      status: 'APPROVED' as const
    },
    {
      firstName: 'Михаил',
      lastName: 'Петров',
      middleName: 'Александрович',
      dateOfBirth: new Date('1985-08-20'),
      gender: 'MALE' as const,
      education: 'Высшее',
      specialties: ['Юрист'],
      positions: ['Старший юрисконсульт'],
      addressIndex: '119435',
      addressRegion: 'г. Москва',
      addressMunicipality: 'г. Москва',
      addressLocality: 'г. Москва',
      addressStreet: 'ул. Арбат',
      addressHouse: '15',
      addressApartment: '42',
      phone: '+7 (495) 123-45-67',
      additionalPhone: '+7 (916) 987-65-43',
      email: 'renat@reallaw.ai',
      children: [],
      hobbies: ['Юриспруденция', 'Чтение'],
      organizationId: createdOrganizations.find(org => org.name.includes('Газпром'))?.id || createdOrganizations[0].id,
      applicationDate: new Date('2024-01-15'),
      status: 'APPROVED' as const
    }
  ];

  for (const applicationData of membershipApplications) {
    // Проверяем, существует ли уже заявление для этого email
    const existingApplication = await prisma.membershipApplication.findFirst({
      where: { email: applicationData.email }
    });

    if (!existingApplication) {
      await prisma.membershipApplication.create({
        data: applicationData
      });
    }
  }

  // Создаем тестовые новости
  const testNews = [
    {
      title: 'Общее собрание профсоюза',
      content: 'Уважаемые коллеги! Приглашаем вас на общее собрание профсоюза, которое состоится 25 октября 2024 года в 15:00 в актовом зале.',
      excerpt: 'Приглашаем на общее собрание профсоюза 25 октября в 15:00',
      isPublished: true,
      organizationId: createdOrganizations[0].id,
      authorId: superAdmin.id
    },
    {
      title: 'Новые льготы для членов профсоюза',
      content: 'С 1 ноября 2024 года вступают в силу новые льготы для членов профсоюза. Подробности в приложенном документе.',
      excerpt: 'С 1 ноября вступают в силу новые льготы для членов профсоюза',
      isPublished: true,
      organizationId: createdOrganizations[0].id,
      authorId: superAdmin.id
    },
    {
      title: 'Результаты переговоров с руководством',
      content: 'Профсоюз успешно провел переговоры с руководством компании по вопросам повышения заработной платы.',
      excerpt: 'Профсоюз успешно провел переговоры по повышению зарплаты',
      isPublished: true,
      organizationId: createdOrganizations[0].id,
      authorId: superAdmin.id
    }
  ];

  for (const newsData of testNews) {
    const existingNews = await prisma.news.findFirst({
      where: { 
        title: newsData.title,
        organizationId: newsData.organizationId
      }
    });

    if (!existingNews) {
      await prisma.news.create({
        data: newsData
      });
    }
  }

  // Создаем тестовые задачи
  const testTasks = [
    {
      title: 'Подготовка к общему собранию',
      description: 'Подготовить материалы и презентацию для общего собрания профсоюза',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2024-10-25'),
      organizationId: createdOrganizations[0].id,
      assigneeId: superAdmin.id,
      creatorId: superAdmin.id
    },
    {
      title: 'Обработка заявлений на членство',
      description: 'Рассмотреть и обработать новые заявления на вступление в профсоюз',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: new Date('2024-10-30'),
      organizationId: createdOrganizations[0].id,
      assigneeId: superAdmin.id,
      creatorId: superAdmin.id
    },
    {
      title: 'Встреча с руководством',
      description: 'Провести встречу с руководством компании по вопросам условий труда',
      status: 'COMPLETED',
      priority: 'HIGH',
      dueDate: new Date('2024-10-20'),
      organizationId: createdOrganizations[0].id,
      assigneeId: superAdmin.id,
      creatorId: superAdmin.id
    }
  ];

  for (const taskData of testTasks) {
    const existingTask = await prisma.task.findFirst({
      where: { 
        title: taskData.title,
        organizationId: taskData.organizationId
      }
    });

    if (!existingTask) {
      await prisma.task.create({
        data: taskData
      });
    }
  }

  // Создаем тестовые документы
  const testDocuments = [
    {
      title: 'Устав профсоюза',
      type: 'INTERNAL',
      status: 'APPROVED',
      fileUrl: '/documents/charter.pdf',
      fileName: 'charter.pdf',
      fileSize: 1024000,
      organizationId: createdOrganizations[0].id,
      authorId: superAdmin.id
    },
    {
      title: 'Коллективный договор',
      type: 'EXTERNAL',
      status: 'APPROVED',
      fileUrl: '/documents/collective-agreement.pdf',
      fileName: 'collective-agreement.pdf',
      fileSize: 2048000,
      organizationId: createdOrganizations[0].id,
      authorId: superAdmin.id
    },
    {
      title: 'Правила внутреннего трудового распорядка',
      type: 'REGULATORY',
      status: 'APPROVED',
      fileUrl: '/documents/work-rules.pdf',
      fileName: 'work-rules.pdf',
      fileSize: 1536000,
      organizationId: createdOrganizations[0].id,
      authorId: superAdmin.id
    }
  ];

  for (const docData of testDocuments) {
    const existingDoc = await prisma.document.findFirst({
      where: { 
        title: docData.title,
        organizationId: docData.organizationId
      }
    });

    if (!existingDoc) {
      await prisma.document.create({
        data: docData
      });
    }
  }

  // Создаем тестовые проекты
  const testProjects = [
    {
      name: 'Улучшение условий труда',
      description: 'Проект по улучшению условий труда сотрудников организации',
      status: 'ACTIVE',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-12-31'),
      organizationId: createdOrganizations[0].id,
      managerId: superAdmin.id
    },
    {
      name: 'Программа обучения',
      description: 'Организация программы повышения квалификации для членов профсоюза',
      status: 'PLANNING',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-03-31'),
      organizationId: createdOrganizations[0].id,
      managerId: superAdmin.id
    }
  ];

  for (const projectData of testProjects) {
    const existingProject = await prisma.project.findFirst({
      where: { 
        name: projectData.name,
        organizationId: projectData.organizationId
      }
    });

    if (!existingProject) {
      await prisma.project.create({
        data: projectData
      });
    }
  }

  // Создаем тестовые события календаря
  const testEvents = [
    {
      title: 'Общее собрание профсоюза',
      description: 'Ежемесячное общее собрание членов профсоюза',
      startDate: new Date('2024-10-25T15:00:00'),
      endDate: new Date('2024-10-25T17:00:00'),
      location: 'Актовый зал',
      eventType: 'MEETING',
      organizationId: createdOrganizations[0].id,
      organizerId: superAdmin.id
    },
    {
      title: 'Встреча с руководством',
      description: 'Переговоры по вопросам заработной платы',
      startDate: new Date('2024-10-28T10:00:00'),
      endDate: new Date('2024-10-28T12:00:00'),
      location: 'Переговорная комната',
      eventType: 'NEGOTIATION',
      organizationId: createdOrganizations[0].id,
      organizerId: superAdmin.id
    }
  ];

  for (const eventData of testEvents) {
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: { 
        title: eventData.title,
        organizationId: eventData.organizationId,
        startDate: eventData.startDate
      }
    });

    if (!existingEvent) {
      await prisma.calendarEvent.create({
        data: eventData
      });
    }
  }

  // Создаем тестовые статьи базы знаний
  const testKnowledge = [
    {
      title: 'Как вступить в профсоюз',
      content: 'Подробная инструкция по вступлению в профсоюзную организацию',
      category: 'MEMBERSHIP',
      tags: ['вступление', 'профсоюз', 'инструкция'],
      isPublished: true,
      organizationId: createdOrganizations[0].id,
      authorId: superAdmin.id
    },
    {
      title: 'Права и обязанности членов профсоюза',
      content: 'Информация о правах и обязанностях членов профсоюзной организации',
      category: 'RIGHTS',
      tags: ['права', 'обязанности', 'члены'],
      isPublished: true,
      organizationId: createdOrganizations[0].id,
      authorId: superAdmin.id
    }
  ];

  for (const knowledgeData of testKnowledge) {
    const existingKnowledge = await prisma.knowledgeBaseItem.findFirst({
      where: { 
        title: knowledgeData.title,
        organizationId: knowledgeData.organizationId
      }
    });

    if (!existingKnowledge) {
      await prisma.knowledgeBaseItem.create({
        data: knowledgeData
      });
    }
  }

  // Создаем тестовые отчеты
  const testReports = [
    {
      title: 'Отчет о деятельности профсоюза за 2024 год',
      content: 'Подробный отчет о деятельности профсоюзной организации за текущий год',
      type: 'ANNUAL',
      status: 'DRAFT',
      organizationId: createdOrganizations[0].id,
      authorId: superAdmin.id
    },
    {
      title: 'Финансовый отчет за III квартал',
      content: 'Отчет о финансовой деятельности профсоюза за третий квартал 2024 года',
      type: 'FINANCIAL',
      status: 'PUBLISHED',
      organizationId: createdOrganizations[0].id,
      authorId: superAdmin.id
    }
  ];

  for (const reportData of testReports) {
    const existingReport = await prisma.report.findFirst({
      where: { 
        title: reportData.title,
        organizationId: reportData.organizationId
      }
    });

    if (!existingReport) {
      await prisma.report.create({
        data: reportData
      });
    }
  }

  console.log('✅ Database seeded successfully');
  console.log(`Created ${createdOrganizations.length} organizations`);
  console.log(`Created ${testMembers.length} test members`);
  console.log(`Created ${membershipApplications.length} membership applications`);
  console.log(`Created ${testNews.length} news articles`);
  console.log(`Created ${testTasks.length} tasks`);
  console.log(`Created ${testDocuments.length} documents`);
  console.log(`Created ${testProjects.length} projects`);
  console.log(`Created ${testEvents.length} calendar events`);
  console.log(`Created ${testKnowledge.length} knowledge base items`);
  console.log(`Created ${testReports.length} reports`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

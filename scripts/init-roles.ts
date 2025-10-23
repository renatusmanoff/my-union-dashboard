import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Определяем все права доступа
const permissions = [
  // Организации
  { id: 'org_view', name: 'Просмотр организаций', description: 'Просмотр списка организаций', category: 'organizations' },
  { id: 'org_create', name: 'Создание организаций', description: 'Создание новых организаций', category: 'organizations' },
  { id: 'org_edit', name: 'Редактирование организаций', description: 'Редактирование организаций', category: 'organizations' },
  { id: 'org_delete', name: 'Удаление организаций', description: 'Удаление организаций', category: 'organizations' },
  
  // Пользователи
  { id: 'user_view', name: 'Просмотр пользователей', description: 'Просмотр списка пользователей', category: 'users' },
  { id: 'user_create', name: 'Создание пользователей', description: 'Создание новых пользователей', category: 'users' },
  { id: 'user_edit', name: 'Редактирование пользователей', description: 'Редактирование пользователей', category: 'users' },
  { id: 'user_delete', name: 'Удаление пользователей', description: 'Удаление пользователей', category: 'users' },
  
  // Новости
  { id: 'news_view', name: 'Просмотр новостей', description: 'Просмотр новостей своей организации', category: 'news' },
  { id: 'news_create', name: 'Создание новостей', description: 'Создание новостей', category: 'news' },
  { id: 'news_edit', name: 'Редактирование новостей', description: 'Редактирование новостей', category: 'news' },
  { id: 'news_delete', name: 'Удаление новостей', description: 'Удаление новостей', category: 'news' },
  
  // Документы
  { id: 'doc_view', name: 'Просмотр документов', description: 'Просмотр документов', category: 'documents' },
  { id: 'doc_create', name: 'Создание документов', description: 'Создание документов', category: 'documents' },
  { id: 'doc_edit', name: 'Редактирование документов', description: 'Редактирование документов', category: 'documents' },
  { id: 'doc_delete', name: 'Удаление документов', description: 'Удаление документов', category: 'documents' },
  { id: 'doc_sign', name: 'Подписание документов', description: 'Подписание документов', category: 'documents' },
  
  // Сообщения
  { id: 'msg_view', name: 'Просмотр сообщений', description: 'Просмотр сообщений', category: 'messages' },
  { id: 'msg_send', name: 'Отправка сообщений', description: 'Отправка сообщений', category: 'messages' },
  { id: 'msg_create_chat', name: 'Создание чатов', description: 'Создание групповых чатов', category: 'messages' },
  
  // Скидки
  { id: 'discount_view', name: 'Просмотр скидок', description: 'Просмотр доступных скидок', category: 'discounts' },
  { id: 'discount_manage', name: 'Управление скидками', description: 'Управление скидками партнеров', category: 'discounts' },
  
  // Профиль
  { id: 'profile_view', name: 'Просмотр профиля', description: 'Просмотр собственного профиля', category: 'profile' },
  { id: 'profile_edit', name: 'Редактирование профиля', description: 'Редактирование собственного профиля', category: 'profile' },
  
  // Отчеты
  { id: 'report_view', name: 'Просмотр отчетов', description: 'Просмотр отчетов', category: 'reports' },
  { id: 'report_create', name: 'Создание отчетов', description: 'Создание отчетов', category: 'reports' },
  
  // Настройки
  { id: 'settings_view', name: 'Просмотр настроек', description: 'Просмотр настроек системы', category: 'settings' },
  { id: 'settings_edit', name: 'Редактирование настроек', description: 'Редактирование настроек системы', category: 'settings' },
  
  // Администрирование
  { id: 'admin_view', name: 'Админ панель', description: 'Доступ к админ панели', category: 'admin' },
  { id: 'admin_roles', name: 'Управление ролями', description: 'Управление ролями и правами', category: 'admin' },
];

// Определяем предустановленные роли для должностей в профсоюзе
const roles = [
  // Руководители
  {
    name: 'Председатель',
    description: 'Полный доступ ко всем функциям системы',
    isSystem: true,
    permissions: permissions.map(p => p.id) // Все права
  },
  {
    name: 'Заместитель председателя',
    description: 'Почти полный доступ, кроме создания организаций и руководителей',
    isSystem: true,
    permissions: permissions.filter(p => 
      !['org_create', 'user_create'].includes(p.id)
    ).map(p => p.id)
  },
  
  // Бухгалтеры
  {
    name: 'Главный бухгалтер',
    description: 'Доступ к финансовым функциям и отчетам',
    isSystem: true,
    permissions: [
      'org_view', 'user_view', 'news_view', 'news_create', 'news_edit',
      'doc_view', 'doc_create', 'doc_edit', 'doc_sign',
      'msg_view', 'msg_send', 'msg_create_chat',
      'discount_view', 'profile_view', 'profile_edit',
      'report_view', 'report_create', 'settings_view'
    ]
  },
  {
    name: 'Бухгалтер',
    description: 'Доступ к финансовым функциям',
    isSystem: true,
    permissions: [
      'org_view', 'user_view', 'news_view',
      'doc_view', 'doc_create', 'doc_edit', 'doc_sign',
      'msg_view', 'msg_send',
      'discount_view', 'profile_view', 'profile_edit',
      'report_view', 'report_create'
    ]
  },
  
  // Специалисты
  {
    name: 'Специалист',
    description: 'Доступ к основным функциям',
    isSystem: true,
    permissions: [
      'org_view', 'user_view', 'news_view', 'news_create', 'news_edit',
      'doc_view', 'doc_create', 'doc_edit', 'doc_sign',
      'msg_view', 'msg_send', 'msg_create_chat',
      'discount_view', 'profile_view', 'profile_edit',
      'report_view'
    ]
  },
  {
    name: 'Главный специалист',
    description: 'Расширенный доступ к функциям',
    isSystem: true,
    permissions: [
      'org_view', 'user_view', 'news_view', 'news_create', 'news_edit', 'news_delete',
      'doc_view', 'doc_create', 'doc_edit', 'doc_delete', 'doc_sign',
      'msg_view', 'msg_send', 'msg_create_chat',
      'discount_view', 'profile_view', 'profile_edit',
      'report_view', 'report_create'
    ]
  },
  
  // Молодежные советы
  {
    name: 'Председатель Молодежного совета',
    description: 'Управление молодежными программами',
    isSystem: true,
    permissions: [
      'org_view', 'user_view', 'news_view', 'news_create', 'news_edit',
      'doc_view', 'doc_create', 'doc_edit', 'doc_sign',
      'msg_view', 'msg_send', 'msg_create_chat',
      'discount_view', 'profile_view', 'profile_edit',
      'report_view', 'report_create'
    ]
  },
  {
    name: 'Член Молодежного совета',
    description: 'Участие в молодежных программах',
    isSystem: true,
    permissions: [
      'org_view', 'news_view',
      'doc_view', 'doc_create', 'doc_sign',
      'msg_view', 'msg_send', 'msg_create_chat',
      'discount_view', 'profile_view', 'profile_edit'
    ]
  },
  
  // Контрольно-ревизионные комиссии
  {
    name: 'Председатель КРК',
    description: 'Контроль финансовой деятельности',
    isSystem: true,
    permissions: [
      'org_view', 'user_view', 'news_view',
      'doc_view', 'doc_create', 'doc_edit', 'doc_sign',
      'msg_view', 'msg_send',
      'discount_view', 'profile_view', 'profile_edit',
      'report_view', 'report_create'
    ]
  },
  {
    name: 'Член КРК',
    description: 'Участие в контрольно-ревизионной деятельности',
    isSystem: true,
    permissions: [
      'org_view', 'news_view',
      'doc_view', 'doc_create', 'doc_sign',
      'msg_view', 'msg_send',
      'discount_view', 'profile_view', 'profile_edit',
      'report_view'
    ]
  },
  
  // ПрофБюро
  {
    name: 'Председатель ПрофБюро',
    description: 'Руководство профсоюзным бюро',
    isSystem: true,
    permissions: [
      'org_view', 'user_view', 'news_view', 'news_create', 'news_edit',
      'doc_view', 'doc_create', 'doc_edit', 'doc_sign',
      'msg_view', 'msg_send', 'msg_create_chat',
      'discount_view', 'profile_view', 'profile_edit',
      'report_view', 'report_create'
    ]
  },
  {
    name: 'Член ПрофБюро',
    description: 'Участие в работе профсоюзного бюро',
    isSystem: true,
    permissions: [
      'org_view', 'news_view',
      'doc_view', 'doc_create', 'doc_sign',
      'msg_view', 'msg_send', 'msg_create_chat',
      'discount_view', 'profile_view', 'profile_edit'
    ]
  },
  
  // Профгруппы
  {
    name: 'Профгруппорг',
    description: 'Руководство профсоюзной группой',
    isSystem: true,
    permissions: [
      'org_view', 'news_view', 'news_create',
      'doc_view', 'doc_create', 'doc_sign',
      'msg_view', 'msg_send', 'msg_create_chat',
      'discount_view', 'profile_view', 'profile_edit'
    ]
  },
  {
    name: 'Член профгруппы',
    description: 'Участие в профсоюзной группе',
    isSystem: true,
    permissions: [
      'org_view', 'news_view',
      'doc_view', 'doc_create', 'doc_sign',
      'msg_view', 'msg_send',
      'discount_view', 'profile_view', 'profile_edit'
    ]
  },
  
  // Члены профсоюза
  {
    name: 'Член профсоюза',
    description: 'Базовый доступ к функциям профсоюза',
    isSystem: true,
    permissions: [
      'news_view',
      'doc_view', 'doc_create', 'doc_sign',
      'msg_view', 'msg_send', 'msg_create_chat',
      'discount_view', 'profile_view', 'profile_edit'
    ]
  }
];

async function initRoles() {
  console.log('🚀 Инициализация ролей и прав доступа...');

  try {
    // Очищаем существующие роли (кроме системных пользователей)
    await prisma.role.deleteMany();
    console.log('✅ Старые роли удалены');

    // Создаем роли
    for (const roleData of roles) {
      const role = await prisma.role.create({
        data: {
          name: roleData.name,
          description: roleData.description,
          isSystem: roleData.isSystem,
          permissions: roleData.permissions
        }
      });
      console.log(`✅ Роль создана: ${role.name}`);
    }

    console.log('🎉 Роли и права доступа инициализированы успешно!');
    console.log(`📊 Создано ролей: ${roles.length}`);
    console.log(`📊 Создано прав: ${permissions.length}`);
    console.log('📋 Предустановленные роли:');
    roles.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role.name} (${role.permissions.length} прав)`);
    });

  } catch (error) {
    console.error('❌ Ошибка инициализации ролей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initRoles();

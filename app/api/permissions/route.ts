import { NextResponse } from 'next/server';

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

// GET /api/permissions - Получить все права доступа
export async function GET() {
  try {
    // Группируем права по категориям
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, typeof permissions>);

    return NextResponse.json({ 
      permissions,
      groupedPermissions,
      categories: Object.keys(groupedPermissions)
    });
  } catch (error) {
    console.error('Ошибка получения прав доступа:', error);
    return NextResponse.json(
      { error: 'Ошибка получения прав доступа' },
      { status: 500 }
    );
  }
}

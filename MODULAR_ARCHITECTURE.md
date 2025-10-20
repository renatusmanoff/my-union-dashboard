# Модульная архитектура MyUnion Dashboard

## Структура ролей и интерфейсов

### 1. SUPER_ADMIN (Супер-администратор)
**Путь:** `/dashboard/super-admin`
**Интерфейс:** Полноценная административная панель
- Управление всеми организациями
- Системные настройки
- Аналитика и отчеты
- Управление пользователями
- Мониторинг системы

### 2. FEDERAL_CHAIRMAN (Федеральный председатель)
**Путь:** `/dashboard/federal-admin`
**Интерфейс:** Федеральное управление
- Управление федеральными организациями
- Создание региональных организаций
- Назначение региональных председателей
- Федеральная аналитика

### 3. REGIONAL_CHAIRMAN (Региональный председатель)
**Путь:** `/dashboard/regional-admin`
**Интерфейс:** Региональное управление
- Управление региональными организациями
- Создание местных организаций
- Назначение местных председателей
- Региональная аналитика

### 4. LOCAL_CHAIRMAN (Местный председатель)
**Путь:** `/dashboard/local-admin`
**Интерфейс:** Местное управление
- Управление местными организациями
- Создание первичных организаций
- Назначение первичных председателей
- Местная аналитика

### 5. PRIMARY_CHAIRMAN (Первичный председатель)
**Путь:** `/dashboard/primary-admin`
**Интерфейс:** Управление первичной организацией
- Управление своей организацией
- Прием новых членов
- Обработка заявлений
- Локальная аналитика

### 6. PRIMARY_MEMBER (Член профсоюза)
**Путь:** `/dashboard/member`
**Интерфейс:** Личный кабинет члена
- Личная информация
- Мои заявления
- Мои документы
- Новости организации
- Льготы и скидки

## Архитектура компонентов

```
components/
├── dashboards/
│   ├── SuperAdminDashboard.tsx
│   ├── FederalAdminDashboard.tsx
│   ├── RegionalAdminDashboard.tsx
│   ├── LocalAdminDashboard.tsx
│   ├── PrimaryAdminDashboard.tsx
│   └── MemberDashboard.tsx
├── layouts/
│   ├── SuperAdminLayout.tsx
│   ├── AdminLayout.tsx
│   └── MemberLayout.tsx
├── features/
│   ├── super-admin/
│   │   ├── SystemSettings.tsx
│   │   ├── GlobalAnalytics.tsx
│   │   └── UserManagement.tsx
│   ├── admin/
│   │   ├── OrganizationManagement.tsx
│   │   ├── MemberManagement.tsx
│   │   └── Reports.tsx
│   └── member/
│       ├── PersonalInfo.tsx
│       ├── MyApplications.tsx
│       └── MyDocuments.tsx
└── shared/
    ├── StatsCard.tsx
    ├── DataTable.tsx
    └── Modal.tsx
```

## Система роутинга

### Главный роутер дашборда
```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  const { user } = useUser();
  
  // Редирект в зависимости от роли
  useEffect(() => {
    if (user?.role) {
      const roleRoutes = {
        'SUPER_ADMIN': '/dashboard/super-admin',
        'FEDERAL_CHAIRMAN': '/dashboard/federal-admin',
        'REGIONAL_CHAIRMAN': '/dashboard/regional-admin',
        'LOCAL_CHAIRMAN': '/dashboard/local-admin',
        'PRIMARY_CHAIRMAN': '/dashboard/primary-admin',
        'PRIMARY_MEMBER': '/dashboard/member'
      };
      
      router.push(roleRoutes[user.role]);
    }
  }, [user]);
  
  return <LoadingSpinner />;
}
```

### Отдельные страницы для каждой роли
```
app/dashboard/
├── super-admin/
│   ├── page.tsx
│   ├── organizations/
│   ├── users/
│   ├── settings/
│   └── analytics/
├── federal-admin/
│   ├── page.tsx
│   └── regional-organizations/
├── regional-admin/
│   ├── page.tsx
│   └── local-organizations/
├── local-admin/
│   ├── page.tsx
│   └── primary-organizations/
├── primary-admin/
│   ├── page.tsx
│   ├── members/
│   └── applications/
└── member/
    ├── page.tsx
    ├── profile/
    ├── applications/
    └── documents/
```

## Преимущества модульной архитектуры

1. **Изоляция:** Каждая роль имеет свой интерфейс
2. **Масштабируемость:** Легко добавлять новые роли
3. **Безопасность:** Разделение доступа на уровне компонентов
4. **Поддержка:** Изменения в одной роли не влияют на другие
5. **Тестирование:** Каждый модуль можно тестировать отдельно
6. **Производительность:** Загружаются только нужные компоненты

## Система переключения ролей

### Для супер-админа
```typescript
// Возможность переключиться в режим любой роли
const switchToRole = (role: UserRole) => {
  // Сохраняем текущую роль
  sessionStorage.setItem('originalRole', user.role);
  // Переключаемся на выбранную роль
  setUser({ ...user, role });
  router.push(getRoleRoute(role));
};
```

### Компонент переключения ролей
```typescript
// components/SuperAdminRoleSwitcher.tsx
export function SuperAdminRoleSwitcher() {
  const roles = [
    { role: 'FEDERAL_CHAIRMAN', label: 'Федеральный председатель' },
    { role: 'REGIONAL_CHAIRMAN', label: 'Региональный председатель' },
    { role: 'LOCAL_CHAIRMAN', label: 'Местный председатель' },
    { role: 'PRIMARY_CHAIRMAN', label: 'Первичный председатель' },
    { role: 'PRIMARY_MEMBER', label: 'Член профсоюза' }
  ];
  
  return (
    <Select onValueChange={switchToRole}>
      <SelectTrigger>
        <SelectValue placeholder="Переключить роль" />
      </SelectTrigger>
      <SelectContent>
        {roles.map(role => (
          <SelectItem key={role.role} value={role.role}>
            {role.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

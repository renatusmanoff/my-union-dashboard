# 🚀 Настройка MyUnion Dashboard

## 📋 Требования

- Node.js 18+ 
- PostgreSQL 12+
- npm или yarn

## ⚙️ Установка и настройка

### 1. Клонирование и установка зависимостей

```bash
git clone <repository-url>
cd my-union-dashboard
npm install
```

### 2. Настройка базы данных

Создайте файл `.env` в корне проекта:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/myunion_dashboard?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Email Configuration (for sending credentials)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Настройка базы данных

```bash
# Генерация Prisma клиента
npm run db:generate

# Применение схемы к базе данных
npm run db:push

# Заполнение тестовыми данными
npm run db:seed
```

### 4. Запуск приложения

```bash
# Режим разработки
npm run dev

# Сборка для продакшена
npm run build
npm start
```

## 🔐 Тестовые учетные данные

После выполнения `npm run db:seed` будут созданы следующие пользователи:

### Супер администратор
- **Email:** `support@myunion.pro`
- **Пароль:** `123321ZxQ@*`
- **Права:** Полный доступ ко всем функциям системы

### Федеральный председатель
- **Email:** `admin@example.com`
- **Пароль:** `password`
- **Права:** Управление федеральными организациями

### Региональный председатель
- **Email:** `regional@example.com`
- **Пароль:** `password`
- **Права:** Управление региональными организациями

### Местный председатель
- **Email:** `local@example.com`
- **Пароль:** `password`
- **Права:** Управление местными организациями

### Первичный председатель
- **Email:** `primary@example.com`
- **Пароль:** `password`
- **Права:** Управление первичными организациями

### Обычный пользователь
- **Email:** `user@example.com`
- **Пароль:** `userpass123`
- **Права:** Базовый доступ

## 🛠️ Доступные команды

```bash
# Разработка
npm run dev              # Запуск в режиме разработки
npm run build           # Сборка для продакшена
npm run start           # Запуск продакшен версии
npm run lint            # Проверка кода линтером

# База данных
npm run db:generate     # Генерация Prisma клиента
npm run db:push         # Применение схемы к БД
npm run db:seed         # Заполнение тестовыми данными
```

## 🔧 Структура проекта

```
my-union-dashboard/
├── app/                    # Next.js App Router
│   ├── api/               # API маршруты
│   ├── dashboard/         # Страницы дашборда
│   ├── login/            # Страница входа
│   └── register/         # Страница регистрации
├── components/           # React компоненты
├── lib/                 # Утилиты и конфигурация
├── prisma/              # Схема базы данных
├── scripts/             # Скрипты для БД
├── types/               # TypeScript типы
└── middleware.ts        # Next.js middleware
```

## 🔒 Безопасность

### Реализованные меры безопасности:

- ✅ JWT токены с истечением срока действия
- ✅ Хеширование паролей с bcrypt
- ✅ HTTP-only cookies
- ✅ Middleware для защиты маршрутов
- ✅ Валидация входных данных
- ✅ Обработка ошибок без утечки информации

### Рекомендации для продакшена:

- 🔄 Измените `JWT_SECRET` на уникальный ключ
- 🔄 Настройте HTTPS
- 🔄 Добавьте rate limiting
- 🔄 Настройте мониторинг и логирование
- 🔄 Регулярно обновляйте зависимости

## 📊 Система ролей

### Иерархия ролей:

1. **SUPER_ADMIN** - Супер администратор системы
2. **FEDERAL_*** - Федеральный уровень
3. **REGIONAL_*** - Региональный уровень  
4. **LOCAL_*** - Местный уровень
5. **PRIMARY_*** - Первичный уровень
6. **PROF_*** - Структурные подразделения
7. **MEMBER** - Член профсоюза

### Права доступа:

- **Создание организаций:** SUPER_ADMIN, FEDERAL_CHAIRMAN
- **Управление пользователями:** Все административные роли
- **Валидация членства:** Председатели и их заместители
- **Создание контента:** Все административные роли

## 🐛 Устранение неполадок

### Проблемы с базой данных:

```bash
# Сброс базы данных
npx prisma db push --force-reset

# Повторное заполнение данными
npm run db:seed
```

### Проблемы с зависимостями:

```bash
# Очистка кэша
rm -rf node_modules package-lock.json
npm install
```

### Проблемы с Prisma:

```bash
# Регенерация клиента
npm run db:generate
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи в консоли браузера
2. Проверьте логи сервера в терминале
3. Убедитесь, что база данных запущена
4. Проверьте настройки в `.env` файле

## 🔄 Обновления

При обновлении проекта:

```bash
# Обновление зависимостей
npm update

# Применение изменений схемы БД
npm run db:push

# Регенерация Prisma клиента
npm run db:generate
```

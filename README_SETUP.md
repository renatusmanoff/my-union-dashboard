# MyUnion Dashboard - Руководство по настройке

## 🎉 Все задачи выполнены!

### ✅ Выполненные задачи:

1. **Создана организация МООП РЗ РФ**
   - Московская областная организация профсоюза работников здравоохранения РФ
   - Полная структура ключевых сотрудников
   - Все учетные записи с паролем `123456` для тестирования

2. **Обновлена логика регистрации**
   - Члены профсоюза обязательно должны указывать организацию
   - Реализована проверка на самостоятельную регистрацию ролей
   - Создан API `/api/organizations/list` для получения списка организаций

3. **Исправлены импорты Prisma**
   - Обновлен `/app/api/organizations/list/route.ts`
   - Исправлен импорт nodemailer в `/app/api/test-email/route.ts`

4. **Исправлен middleware**
   - Корректная работа с JWT токенами
   - Защищенные маршруты доступны авторизованным пользователям

5. **Настроены .env файлы**
   - `.env` - базовые настройки
   - `.env.local` - локальная разработка
   - `.env.production` - продакшен (для Vercel)
   - `.env.example` - шаблон для документации

6. **Настроен SMTP и отправка писем**
   - Успешно настроен SMTP через Mail.ru
   - Протестирована отправка на `9061109990@mail.ru`
   - API endpoint: `/api/test-email`

7. **Обновлен фронтенд регистрации**
   - Новая форма регистрации с выбором организации
   - Загрузка реального списка организаций из API
   - Валидация всех полей
   - Современный UI/UX дизайн

---

## 📋 Пользователи МООП РЗ РФ

Все пользователи используют пароль: **123456**

### Руководство:
- **Председатель**: `chairman@moop-rz-rf.ru`
- **Заместитель председателя**: `vice-chairman@moop-rz-rf.ru`
- **Главный специалист (секретарь)**: `secretary@moop-rz-rf.ru`

### Контрольные органы:
- **Председатель КРК**: `audit-chairman@moop-rz-rf.ru`
- **Председатель молодежного совета**: `youth-chairman@moop-rz-rf.ru`

### Члены:
- **Член президиума**: `presidium@moop-rz-rf.ru`
- **Член профсоюза**: `member@moop-rz-rf.ru`

---

## 🚀 Запуск проекта

### 1. Установка зависимостей:
```bash
npm install
```

### 2. Настройка базы данных:
```bash
# Генерация Prisma Client
npm run db:generate

# Применение схемы к БД
npm run db:push

# Заполнение БД тестовыми данными
npm run db:seed
```

### 3. Запуск сервера разработки:
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

---

## 🔧 Настройка переменных окружения

### Локальная разработка (.env.local):
```env
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://neondb_owner:npg_ncCVmL61qwaF@ep-red-grass-agqnc0m1-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# JWT Secret
JWT_SECRET="ca281bab4c5b17ebf450add970ea029a6f735630073e229575fbf3da0153de32"

# API URL
NEXT_PUBLIC_API_URL="http://localhost:3000"

# SMTP Configuration
SMTP_HOST="smtp.mail.ru"
SMTP_PORT="587"
SMTP_USER="support@myunion.pro"
SMTP_PASS="8uld1thwBBN1XVNbmW9p"
SMTP_FROM="support@myunion.pro"

# Environment
NODE_ENV="development"
```

### Продакшен (Vercel):
В Vercel Dashboard добавьте те же переменные, заменив:
- `NEXT_PUBLIC_API_URL` на ваш домен Vercel
- `NODE_ENV="production"`

---

## 📧 Тестирование SMTP

Для отправки тестового письма используйте API:

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "subject": "Test", "text": "Test message"}'
```

---

## 🎯 Основные маршруты

- `/` - Главная страница (редирект на `/login` если не авторизован)
- `/login` - Страница входа
- `/register` - Регистрация нового члена профсоюза
- `/dashboard` - Панель управления (требует авторизацию)
- `/dashboard/organizations` - Управление организациями

### API маршруты:
- `POST /api/auth/login` - Авторизация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/logout` - Выход
- `GET /api/auth/me` - Текущий пользователь
- `GET /api/organizations/list` - Список организаций
- `POST /api/test-email` - Отправка тестового письма

---

## 🔐 Роли и права доступа

### Федеральный уровень:
- `SUPER_ADMIN` - Супер администратор
- `FEDERAL_CHAIRMAN` - Председатель
- `FEDERAL_VICE_CHAIRMAN` - Заместитель председателя
- И другие...

### Региональный уровень:
- `REGIONAL_CHAIRMAN` - Председатель
- `REGIONAL_VICE_CHAIRMAN` - Заместитель председателя
- `REGIONAL_CHIEF_SPECIALIST` - Главный специалист
- `REGIONAL_AUDIT_CHAIRMAN` - Председатель КРК
- `REGIONAL_YOUTH_CHAIRMAN` - Председатель молодежного совета
- `REGIONAL_PRESIDIUM_MEMBER` - Член президиума

### Первичная организация:
- `PRIMARY_MEMBER` - Член профсоюза (может регистрироваться самостоятельно)
- `PROF_GROUP_ORGANIZER` - Профгруппорг (может регистрироваться самостоятельно)

---

## 📝 Логика регистрации

1. **Самостоятельная регистрация доступна только для:**
   - `PRIMARY_MEMBER`
   - `PROF_GROUP_ORGANIZER`

2. **При регистрации обязательно указание:**
   - Email
   - Пароль
   - ФИО
   - Телефон
   - **Организация** (выбирается из списка)

3. **Все остальные роли создаются через:**
   - Админ-панель супер администратором
   - Председателями соответствующих уровней

---

## 🛠️ Полезные команды

```bash
# Просмотр БД через Prisma Studio
npm run db:studio

# Генерация Prisma Client
npm run db:generate

# Применение схемы к БД
npm run db:push

# Заполнение БД тестовыми данными
npm run db:seed

# Запуск сервера разработки
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшен сервера
npm start
```

---

## 🎨 Стек технологий

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: JWT, bcrypt
- **Email**: Nodemailer

---

## 📞 Поддержка

При возникновении проблем обратитесь к:
- Документации Neon: https://neon.com/docs
- Документации Prisma: https://www.prisma.io/docs
- Документации Next.js: https://nextjs.org/docs


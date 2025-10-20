# 🐳 Настройка локальной PostgreSQL с Docker

## Быстрый старт

### 1. Запуск PostgreSQL контейнера
```bash
# Запуск контейнера
docker-compose up -d

# Проверка статуса
docker-compose ps
```

### 2. Настройка переменных окружения
Создайте файл `.env.local` в корне проекта:
```bash
# Локальная PostgreSQL для разработки
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/my_union_dashboard?schema=public"

# JWT секрет
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Email настройки (для тестирования)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-email@gmail.com"

# Настройки приложения
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### 3. Применение миграций и seed данных
```bash
# Генерация Prisma Client
npx prisma generate

# Применение миграций
npx prisma db push

# Загрузка тестовых данных
npm run db:seed
```

### 4. Проверка подключения
```bash
# Открытие Prisma Studio
npx prisma studio

# Или проверка через psql
docker exec -it my_union_postgres psql -U postgres -d my_union_dashboard
```

## 🚀 Для продакшена

### Вариант 1: Docker на VPS
1. Разверните VPS (DigitalOcean, AWS, Vultr)
2. Установите Docker и Docker Compose
3. Скопируйте `docker-compose.yml` на сервер
4. Настройте SSL и firewall
5. Настройте автоматические бэкапы

### Вариант 2: Managed PostgreSQL (рекомендуется)
- **AWS RDS** - полностью управляемый
- **Google Cloud SQL** - автоматические бэкапы
- **DigitalOcean Managed Databases** - простота настройки

## 🔧 Полезные команды

```bash
# Остановка контейнера
docker-compose down

# Остановка с удалением данных
docker-compose down -v

# Просмотр логов
docker-compose logs postgres

# Бэкап базы данных
docker exec my_union_postgres pg_dump -U postgres my_union_dashboard > backup.sql

# Восстановление из бэкапа
docker exec -i my_union_postgres psql -U postgres my_union_dashboard < backup.sql
```

## 📊 Мониторинг

```bash
# Статистика контейнера
docker stats my_union_postgres

# Использование диска
docker exec my_union_postgres df -h
```

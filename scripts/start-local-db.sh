#!/bin/bash

# 🐳 Скрипт быстрого запуска локальной PostgreSQL

echo "🚀 Запуск локальной PostgreSQL для My Union Dashboard..."

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose"
    exit 1
fi

# Запуск PostgreSQL контейнера
echo "📦 Запуск PostgreSQL контейнера..."
docker-compose up -d

# Ожидание запуска базы данных
echo "⏳ Ожидание запуска базы данных..."
sleep 10

# Проверка статуса
if docker-compose ps | grep -q "Up"; then
    echo "✅ PostgreSQL успешно запущен!"
    echo "🔗 Подключение: postgresql://postgres:postgres123@localhost:5432/my_union_dashboard"
    echo ""
    echo "📋 Следующие шаги:"
    echo "1. Создайте файл .env.local с DATABASE_URL"
    echo "2. Запустите: npx prisma generate"
    echo "3. Запустите: npx prisma db push"
    echo "4. Запустите: npm run db:seed"
    echo ""
    echo "🛠️  Полезные команды:"
    echo "   docker-compose logs postgres    # Просмотр логов"
    echo "   docker-compose down            # Остановка"
    echo "   npx prisma studio              # Веб-интерфейс БД"
else
    echo "❌ Ошибка запуска PostgreSQL"
    echo "📋 Проверьте логи: docker-compose logs postgres"
    exit 1
fi

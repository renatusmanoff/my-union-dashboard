#!/bin/bash

# 🌐 Скрипт тестирования подключения к Timeweb Cloud PostgreSQL

echo "🌐 Тестирование подключения к Timeweb Cloud PostgreSQL..."

# Проверка наличия переменной DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Переменная DATABASE_URL не установлена"
    echo "📋 Установите переменную окружения:"
    echo "   export DATABASE_URL='postgresql://username:password@host:port/database_name?schema=public&sslmode=require'"
    exit 1
fi

# Проверка наличия Prisma
if ! command -v npx &> /dev/null; then
    echo "❌ npx не найден. Установите Node.js"
    exit 1
fi

# Тест подключения через Prisma
echo "🔍 Тестирование подключения через Prisma..."
if npx prisma db pull --preview-feature 2>/dev/null; then
    echo "✅ Подключение к Timeweb Cloud успешно!"
    echo ""
    echo "📋 Следующие шаги:"
    echo "1. Запустите: npx prisma generate"
    echo "2. Запустите: npx prisma db push"
    echo "3. Запустите: npm run db:seed"
    echo ""
    echo "🛠️  Полезные команды:"
    echo "   npx prisma studio              # Веб-интерфейс БД"
    echo "   npx prisma db pull              # Синхронизация схемы"
    echo "   npx prisma db push              # Применение изменений"
else
    echo "❌ Ошибка подключения к Timeweb Cloud"
    echo "📋 Проверьте:"
    echo "1. Правильность DATABASE_URL"
    echo "2. Доступность хоста и порта"
    echo "3. Правильность логина и пароля"
    echo "4. Настройки firewall в Timeweb Cloud"
    exit 1
fi

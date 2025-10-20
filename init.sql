-- Инициализация базы данных для My Union Dashboard
-- Этот файл выполняется при первом запуске контейнера

-- Создание расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Настройка кодировки
SET client_encoding = 'UTF8';

-- Создание пользователя для приложения (опционально)
-- CREATE USER app_user WITH PASSWORD 'app_password';
-- GRANT ALL PRIVILEGES ON DATABASE my_union_dashboard TO app_user;

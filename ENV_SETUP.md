# 🔐 Переменные окружения (Environment Variables)

## Текущая конфигурация (Timeweb Cloud - ОБНОВЛЕНО)

### Database - Timeweb Cloud
```
DATABASE_URL="postgresql://gen_user:%3C!zq%3F)gO4K8lvh@194.31.173.95:5432/myunion_db"
```

**Важно:** IP адрес сервера: `194.31.173.95` (НЕ 185.220.101.39)

### DaData API (Поиск по ИНН)
```
DADATA_API_KEY="a12104dc4412d6a72a1adf7d4cc9a75428266690"
DADATA_SECRET_KEY="f809e7b27bc2122758df32669efdc4887e795898"
```

### Email (SMTP)
```
SMTP_HOST="smtp.beget.com"
SMTP_PORT="465"
SMTP_USER="support@myunion.pro"
SMTP_PASSWORD="MyUnion2024!"
SMTP_FROM="support@myunion.pro"
```

### Security
```
JWT_SECRET="ca281bab4c5b17ebf450add970ea029a6f735630073e229575fbf3da0153de32"
NEXTAUTH_SECRET="ca281bab4c5b17ebf450add970ea029a6f735630073e229575fbf3da0153de32"
```

### Development Environment
```
NODE_ENV="development"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Production Environment
```
NODE_ENV="production"
NEXTAUTH_URL="https://www.myunion.pro"
NEXT_PUBLIC_API_URL="https://www.myunion.pro"
```

## Файлы конфигурации

- `.env` - базовые переменные для разработки
- `.env.local` - локальные переменные (игнорируется git)
- `.env.production` - переменные для production

## Как восстановить переменные?

Если переменные потеряны, используйте команду:

```bash
cat > .env.local << 'ENVEOF'
DATABASE_URL="postgresql://gen_user:%3C!zq%3F)gO4K8lvh@194.31.173.95:5432/myunion_db"
DADATA_API_KEY="a12104dc4412d6a72a1adf7d4cc9a75428266690"
DADATA_SECRET_KEY="f809e7b27bc2122758df32669efdc4887e795898"
SMTP_HOST="smtp.beget.com"
SMTP_PORT="465"
SMTP_USER="support@myunion.pro"
SMTP_PASSWORD="MyUnion2024!"
SMTP_FROM="support@myunion.pro"
JWT_SECRET="ca281bab4c5b17ebf450add970ea029a6f735630073e229575fbf3da0153de32"
NODE_ENV="development"
NEXTAUTH_SECRET="ca281bab4c5b17ebf450add970ea029a6f735630073e229575fbf3da0153de32"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"
ENVEOF
```

## Проверка подключения

Убедитесь, что переменные загружены:
```bash
psql 'postgresql://gen_user:%3C!zq%3F)gO4K8lvh@194.31.173.95:5432/myunion_db'
```

Проверьте API на работоспособность:
```bash
curl 'http://localhost:3000/api/organizations/search-inn?inn=7701014160'
```

## Безопасность

⚠️ **ВАЖНО**: Никогда не коммитьте файлы `.env*` в git!
Убедитесь, что они в `.gitignore`:
```
.env.local
.env.production
.env
```

Для production используйте переменные окружения хостинга.

## Список всех переменных

| Переменная | Значение | Место использования |
|---|---|---|
| `DATABASE_URL` | postgresql://gen_user:...@194.31.173.95:5432/myunion_db | Prisma ORM, подключение к Timeweb Cloud |
| `DADATA_API_KEY` | a12104dc4412... | Поиск по ИНН |
| `DADATA_SECRET_KEY` | f809e7b27bc... | Поиск по ИНН |
| `SMTP_HOST` | smtp.beget.com | Отправка писем |
| `SMTP_PORT` | 465 | Отправка писем |
| `SMTP_USER` | support@myunion.pro | Отправка писем |
| `SMTP_PASSWORD` | MyUnion2024! | Отправка писем |
| `SMTP_FROM` | support@myunion.pro | Отправка писем |
| `JWT_SECRET` | ca281bab4c5b... | JWT аутентификация |
| `NEXTAUTH_SECRET` | ca281bab4c5b... | NextAuth сессии |
| `NODE_ENV` | development/production | Окружение |
| `NEXTAUTH_URL` | http://localhost:3000 или https://www.myunion.pro | Адрес приложения |
| `NEXT_PUBLIC_API_URL` | http://localhost:3000 или https://www.myunion.pro | Публичный API URL |

## История изменений

- **2025-10-20**: Обновлены учетные данные Timeweb Cloud с новым IP адресом (194.31.173.95)

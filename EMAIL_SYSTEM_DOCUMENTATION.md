# 📧 Система отправки email в MyUnion

## ✅ **Приоритет email при создании организации**

### 🎯 **Как работает система:**

#### **1. Email организации vs Email председателя:**
- **Email организации** (`org@example.com`) - используется для официальной переписки
- **Email председателя** (`chairman@test-org.com`) - **ПРИОРИТЕТНЫЙ** для получения учетных данных

#### **2. Процесс создания организации:**
1. **Создается организация** с email `org@example.com`
2. **Создается председатель** с email `chairman@test-org.com`
3. **Учетные данные отправляются** на email председателя (`chairman@test-org.com`)
4. **Приветственное письмо** приходит на email председателя

### 📋 **Что получает председатель на свой email:**

#### **Тема письма:** "Учетные данные для входа в систему MyUnion"

#### **Содержимое письма:**
- **Приветствие** с именем председателя
- **Email для входа** (email председателя)
- **Временный пароль** (генерируется автоматически)
- **Роли** (например, "PRIMARY_CHAIRMAN")
- **Название организации**
- **Ссылка для входа** в систему
- **Предупреждение** о необходимости смены пароля

### 🔧 **Технические детали:**

#### **API Endpoints:**
- `POST /api/organizations` - создание организации
- `POST /api/admin/create` - создание председателя и отправка email

#### **Email настройки:**
- **SMTP Host:** `smtp.mail.ru`
- **SMTP Port:** `587`
- **From:** `support@myunion.pro`
- **To:** email председателя (приоритетный)

#### **Временный пароль:**
- **Длина:** 12 символов
- **Символы:** A-Z, a-z, 0-9, !@#$%^&*
- **Пример:** `Kj8#mN2$pL9!`

### 🚀 **Пример создания организации:**

#### **1. Данные организации:**
```json
{
  "name": "Тестовая организация с председателем",
  "type": "PRIMARY",
  "address": "г. Москва, ул. Тестовая, д. 1",
  "phone": "+7 (495) 123-45-67",
  "email": "org@example.com",
  "industry": "EDUCATION"
}
```

#### **2. Данные председателя:**
```json
{
  "email": "chairman@test-org.com",
  "firstName": "Иван",
  "lastName": "Председателев",
  "middleName": "Иванович",
  "phone": "+7 (495) 987-65-43",
  "roles": ["PRIMARY_CHAIRMAN"]
}
```

#### **3. Результат:**
- ✅ Организация создана
- ✅ Председатель создан
- ✅ Email отправлен на `chairman@test-org.com`
- ✅ Учетные данные получены председателем

### 📧 **Формат приветственного письма:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Учетные данные MyUnion</title>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MyUnion</div>
            <h1>Добро пожаловать в систему!</h1>
        </div>
        
        <p>Здравствуйте, <strong>Иван Председателев</strong>!</p>
        
        <div class="credentials-box">
            <div class="credential-item">
                <div class="label">Email:</div>
                <div class="value">chairman@test-org.com</div>
            </div>
            <div class="credential-item">
                <div class="label">Временный пароль:</div>
                <div class="value">Kj8#mN2$pL9!</div>
            </div>
            <div class="credential-item">
                <div class="label">Роли:</div>
                <div class="value">PRIMARY_CHAIRMAN</div>
            </div>
            <div class="credential-item">
                <div class="label">Организация:</div>
                <div class="value">Тестовая организация с председателем</div>
            </div>
        </div>
        
        <div class="warning">
            <strong>⚠️ Важно:</strong> После первого входа в систему обязательно смените временный пароль на постоянный в разделе "Профиль".
        </div>
        
        <div style="text-align: center;">
            <a href="http://localhost:3000/login" class="button">
                Войти в систему
            </a>
        </div>
    </div>
</body>
</html>
```

### ✅ **Итог:**

**Email председателя является приоритетным для получения учетных данных!**

- 📧 **Учетные данные** → email председателя
- 📧 **Приветственное письмо** → email председателя  
- 📧 **Официальная переписка** → email организации
- 🔐 **Вход в систему** → email председателя

**Система работает корректно и отправляет все важные уведомления на email председателя!** 🎉

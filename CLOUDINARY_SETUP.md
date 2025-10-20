# 🎯 Cloudinary Setup - Пошаговая инструкция

## ✅ ВАЖНО: Ваш Cloud Name уже известен!

**Cloud Name: `dpcstrzi5`**

Это значит что регистрация уже готова! 🎉

---

## ШАГ 1: Получение API Key и API Secret (1 минута)

1. **Откройте** https://cloudinary.com/console/c-/api_keys
   - Или войдите на https://cloudinary.com, откройте Settings → API Keys
   
2. **Вы увидите:**
   ```
   Cloud Name: dpcstrzi5
   API Key: 123456789012345 (это номер)
   API Secret: abcdefghijklmnopqrstuvwxyz (это длинная строка)
   ```

3. **Скопируйте эти два значения** (они нам понадобятся дальше)

---

## ШАГ 2: Добавление в файлы конфигурации

### Вариант 1: Используем отдельные переменные (РЕКОМЕНДУЕТСЯ)

Откройте `.env.local` в корне проекта и добавьте:

```env
CLOUDINARY_CLOUD_NAME=dpcstrzi5
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

Замените числа на ваши API Key и API Secret из шага 1.

### Вариант 2: Используем CLOUDINARY_URL (АЛЬТЕРНАТИВА)

Если у вас есть полная строка, добавьте в `.env.local`:

```env
CLOUDINARY_URL=cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz@dpcstrzi5
```

---

## ШАГ 3: Добавление на Vercel (для production)

1. **Откройте** https://vercel.com/dashboard
2. **Выберите** ваш проект MyUnion
3. **Перейдите** Settings → Environment Variables
4. **Добавьте переменные:**

   Вариант 1 (отдельные):
   ```
   CLOUDINARY_CLOUD_NAME = dpcstrzi5
   CLOUDINARY_API_KEY = 123456789012345
   CLOUDINARY_API_SECRET = abcdefghijklmnopqrstuvwxyz
   ```

   Или Вариант 2 (одна строка):
   ```
   CLOUDINARY_URL = cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz@dpcstrzi5
   ```

5. **Нажмите Save**
6. **Redeploy** проект (нажмите кнопку "Redeploy" на главной странице)

---

## ШАГ 4: Перезагрузить локальный сервер

```bash
# Остановите текущий сервер (Ctrl+C) или выполните:
pkill -f "next dev"
sleep 2

# Запустите сервер заново
npm run dev
```

---

## ШАГ 5: Проверка что все работает

1. **Откройте** http://localhost:3000/dashboard/documents
2. **Нажмите** "+ Создать документ"
3. **Выберите** любой PDF или документ для загрузки
4. **Отправьте форму**

**Если в консоли браузера (F12 → Console) вы видите:**
```
☁️ [CLOUDINARY] File uploaded: https://res.cloudinary.com/dpcstrzi5/...
```

✅ **ВСЕ РАБОТАЕТ ИДЕАЛЬНО!**

---

## ❓ Частые вопросы

### Q: Где найти API Key и API Secret?
A: https://cloudinary.com/console/c-/api_keys (нужно быть залогиненным)

### Q: Что такое Dynamic folders?
A: Это значит что файлы автоматически сортируются по папкам. Для нас это включено - не нужно ничего менять.

### Q: Безопасны ли мои данные?
A: Да! API Secret никогда не отправляется на клиент (только на сервер). Файлы защищены.

### Q: Сколько я могу загружать файлов?
A: Бесплатный план = 25 GB + неограниченные загрузки. Этого достаточно для годов использования.

### Q: Как удалить файл из Cloudinary?
A: На Cloudinary Dashboard → Media Library → найдите файл → Delete

### Q: Что если я скопировал неправильно API Key?
A: Просто отредактируйте `.env.local` и перезагрузите сервер.

### Q: На Vercel показывает ошибку?
A: Проверьте:
- Environment Variables добавлены правильно (Settings → Environment Variables)
- Нажали Save
- Проект переразвернут (Redeploy)
- Подождите 1-2 минуты после redeploy

---

## 🎉 Готово!

Теперь ваше приложение готово к production!

**Документы будут:**
- ✅ Загружаться в облако
- ✅ Сохраняться вечно
- ✅ Быстро доступны
- ✅ Защищены от потери при переразвертывании

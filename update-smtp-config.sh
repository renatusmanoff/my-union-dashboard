# Обновляем все env файлы с правильным SMTP
for file in .env .env.local .env.production; do
  echo "📝 Обновляю $file..."
  
  # Меняем SMTP_HOST
  sed -i '' 's/SMTP_HOST=.*/SMTP_HOST="smtp.mail.ru"/' "$file"
  
  # Меняем SMTP_PORT на 465 (SSL)
  sed -i '' 's/SMTP_PORT=.*/SMTP_PORT="465"/' "$file"
  
  echo "✅ $file обновлен"
done

echo ""
echo "📋 Проверяем обновленные параметры:"
grep "SMTP_HOST\|SMTP_PORT" .env.local

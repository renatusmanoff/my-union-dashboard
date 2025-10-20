// Простой тест для проверки функций
console.log('=== ТЕСТ ФРОНТЕНДА ===');

// Проверяем, что функции существуют
if (typeof handleDeleteAdmin === 'function') {
  console.log('✅ handleDeleteAdmin существует');
} else {
  console.log('❌ handleDeleteAdmin НЕ существует');
}

if (typeof handleEditAdmin === 'function') {
  console.log('✅ handleEditAdmin существует');
} else {
  console.log('❌ handleEditAdmin НЕ существует');
}

if (typeof handleDeleteOrganization === 'function') {
  console.log('✅ handleDeleteOrganization существует');
} else {
  console.log('❌ handleDeleteOrganization НЕ существует');
}

if (typeof handleEditOrganization === 'function') {
  console.log('✅ handleEditOrganization существует');
} else {
  console.log('❌ handleEditOrganization НЕ существует');
}

console.log('=== КОНЕЦ ТЕСТА ===');

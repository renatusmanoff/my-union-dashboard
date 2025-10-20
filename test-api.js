const fetch = require('node-fetch');

async function test() {
  try {
    // Логируемся
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'support@myunion.pro',
        password: 'password'
      })
    });
    const cookies = loginRes.headers.get('set-cookie');
    
    // Получаем список администраторов
    const adminsRes = await fetch('http://localhost:3000/api/admin', {
      method: 'GET',
      headers: { 'Cookie': cookies || '' }
    });
    
    const adminsData = await adminsRes.json();
    console.log('Администраторы:', adminsData.admins?.length || 0);
    
    if (adminsData.admins && adminsData.admins.length > 0) {
      const admin = adminsData.admins[0];
      console.log('Тестируем удаление администратора:', admin.id);
      
      // Тестируем удаление
      const deleteRes = await fetch(`http://localhost:3000/api/admin?id=${admin.id}`, {
        method: 'DELETE',
        headers: { 'Cookie': cookies || '' }
      });
      
      console.log('DELETE статус:', deleteRes.status);
      const deleteData = await deleteRes.text();
      console.log('DELETE ответ:', deleteData);
    }
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

test();

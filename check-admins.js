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
    
    // Получаем администраторов
    const adminsRes = await fetch('http://localhost:3000/api/admin', {
      method: 'GET',
      headers: { 'Cookie': cookies || '' }
    });
    
    const adminsData = await adminsRes.json();
    console.log('Статус:', adminsRes.status);
    console.log('Данные:', JSON.stringify(adminsData, null, 2));
    
    if (adminsData.admins) {
      console.log(`\nНайдено администраторов: ${adminsData.admins.length}`);
      adminsData.admins.forEach((admin, i) => {
        console.log(`${i+1}. ${admin.firstName} ${admin.lastName} (${admin.email}) - ${admin.role}`);
      });
    } else {
      console.log('❌ Поле admins отсутствует в ответе');
    }
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

test();

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
    
    // Создаем организацию
    const orgRes = await fetch('http://localhost:3000/api/organizations', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify({
        name: 'TEST ORG 123',
        type: 'FEDERAL',
        address: 'Address',
        phone: '+7499-138-51-34',
        email: 'test-org-123@test.ru',
        industry: 'EDUCATION'
      })
    });
    
    console.log('Organization Response:');
    console.log('Status:', orgRes.status);
    const orgText = await orgRes.text();
    console.log('Body:', orgText);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();

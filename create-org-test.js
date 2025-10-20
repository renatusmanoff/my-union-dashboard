const fetch = require('node-fetch');

async function test() {
  try {
    console.log('\n=== ШАГИ СОЗДАНИЯ ОРГАНИЗАЦИИ ===\n');
    
    // Шаг 1: Логируемся
    console.log('1️⃣ ЛОГИН СУПЕР-АДМИНА...');
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'support@myunion.pro',
        password: 'password'
      })
    });
    const loginData = await loginRes.json();
    console.log(`   ✓ Login статус: ${loginRes.status}`);
    console.log(`   ✓ Получена авторизация`);
    
    // Получаем cookies из заголовков
    const cookies = loginRes.headers.get('set-cookie');
    console.log(`   ✓ Cookies установлены в браузер`);
    
    // Шаг 2: Создаем организацию
    console.log('\n2️⃣ СОЗДАНИЕ ОРГАНИЗАЦИИ...');
    const orgRes = await fetch('http://localhost:3000/api/organizations', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify({
        name: 'МОСКОВСКАЯ ОБЛАСТНАЯ ОРГАНИЗАЦИЯ ПРОФСОЮЗА РАБОТНИКОВ ЗДРАВООХРАНЕНИЯ РОССИЙСКОЙ ФЕДЕРАЦИИ',
        type: 'FEDERAL',
        address: 'г Москва, ул Марии Ульяновой, д 9 к 1',
        phone: '+7499-138-51-34',
        email: '39-99-38@mail.ru',
        industry: 'EDUCATION'
      })
    });
    
    const orgData = await orgRes.json();
    console.log(`   ✓ Create организация статус: ${orgRes.status}`);
    if (orgData.organization) {
      console.log(`   ✓ Организация создана с ID: ${orgData.organization.id}`);
      console.log(`   ✓ Email организации: ${orgData.organization.email}`);
      console.log(`   ✓ chairmanId: ${orgData.organization.chairmanId || 'NULL'}`);
      console.log(`   ✓ chairmanName: ${orgData.organization.chairmanName || 'NULL'}`);
    } else {
      console.log(`   ✗ Ошибка: ${orgData.error}`);
    }
    
    // Шаг 3: Создаем администратора
    console.log('\n3️⃣ СОЗДАНИЕ АДМИНИСТРАТОРА...');
    const adminRes = await fetch('http://localhost:3000/api/admin/create', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify({
        email: '39-99-38@mail.ru',
        firstName: 'Нина',
        lastName: 'Суслонова',
        middleName: 'Владимировна',
        phone: '+7 499-138-51-34',
        role: 'FEDERAL_CHAIRMAN',
        organizationId: orgData.organization?.id
      })
    });
    
    const adminData = await adminRes.json();
    console.log(`   ✓ Create администратор статус: ${adminRes.status}`);
    if (adminData.user) {
      console.log(`   ✓ Администратор создан с ID: ${adminData.user.id}`);
      console.log(`   ✓ Email администратора: ${adminData.user.email}`);
      console.log(`   ✓ Временный пароль: ${adminData.user.temporaryPassword}`);
    } else {
      console.log(`   ✗ Ошибка: ${adminData.error}`);
    }
    
    // Шаг 4: Проверяем организацию после создания админа
    console.log('\n4️⃣ ПРОВЕРКА ОРГАНИЗАЦИИ ПОСЛЕ СОЗДАНИЯ АДМИНИСТРАТОРА...');
    const checkRes = await fetch('http://localhost:3000/api/organizations', {
      method: 'GET',
      headers: { 
        'Cookie': cookies || ''
      }
    });
    
    const orgsData = await checkRes.json();
    if (orgsData.organizations) {
      const org = orgsData.organizations.find(o => o.email === '39-99-38@mail.ru');
      if (org) {
        console.log(`   ✓ Организация найдена в списке`);
        console.log(`   ✓ ID: ${org.id}`);
        console.log(`   ✓ chairmanId: ${org.chairmanId || 'NULL'}`);
        console.log(`   ✓ chairmanName: ${org.chairmanName || 'NULL'}`);
        console.log(`   📊 СТАТУС: ${org.chairmanId && org.chairmanName ? '✅ РУКОВОДИТЕЛЬ НАЗНАЧЕН' : '❌ РУКОВОДИТЕЛЬ НЕ НАЗНАЧЕН'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

test();

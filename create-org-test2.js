const fetch = require('node-fetch');

async function test() {
  try {
    console.log('\n=== ПОЛНЫЙ ПРОЦЕСС СОЗДАНИЯ ОРГАНИЗАЦИИ ===\n');
    
    // Шаг 1: Логируемся
    console.log('1️⃣ ЛОГИН СУПЕР-АДМИНА');
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'support@myunion.pro',
        password: 'password'
      })
    });
    
    const cookies = loginRes.headers.get('set-cookie');
    console.log(`✓ Login успешен, получен cookie\n`);
    
    // Шаг 2: Создаем организацию
    console.log('2️⃣ СОЗДАНИЕ ОРГАНИЗАЦИИ (без администратора)');
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
    const orgId = orgData.organization?.id;
    console.log(`✓ Организация создана с ID: ${orgId}`);
    console.log(`✓ chairmanId: ${orgData.organization?.chairmanId || '❌ NULL'}`);
    console.log(`✓ chairmanName: ${orgData.organization?.chairmanName || '❌ NULL'}`);
    console.log(`STATUS: ❌ Руководитель НЕ назначен\n`);
    
    // Шаг 3: Создаем администратора (ПРАВИЛЬНО)
    console.log('3️⃣ СОЗДАНИЕ АДМИНИСТРАТОРА');
    console.log('   (обновляет организацию с chairmanId и chairmanName)');
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
        roles: ['FEDERAL_CHAIRMAN'],  // ← МАССИВ!
        organizationId: orgId,
        organizationType: 'FEDERAL',   // ← ОБЯЗАТЕЛЬНО!
        organizationName: 'МОСКОВСКАЯ ОБЛАСТНАЯ ОРГАНИЗАЦИЯ ПРОФСОЮЗА РАБОТНИКОВ ЗДРАВООХРАНЕНИЯ РОССИЙСКОЙ ФЕДЕРАЦИИ'
      })
    });
    
    const adminData = await adminRes.json();
    console.log(`✓ Администратор статус: ${adminRes.status}`);
    
    if (adminRes.status === 201 || adminRes.status === 200) {
      console.log(`✓ Администратор создан`);
      console.log(`✓ Email: ${adminData.admin?.email}`);
      console.log(`✓ Временный пароль: ${adminData.temporaryPassword || 'отправлен на email'}\n`);
    } else {
      console.log(`❌ Ошибка: ${adminData.error}\n`);
      return;
    }
    
    // Шаг 4: ПРОВЕРЯЕМ результат
    console.log('4️⃣ ПРОВЕРКА ОРГАНИЗАЦИИ ПОСЛЕ СОЗДАНИЯ АДМИНИСТРАТОРА');
    const checkRes = await fetch('http://localhost:3000/api/organizations', {
      method: 'GET',
      headers: { 
        'Cookie': cookies || ''
      }
    });
    
    const orgsData = await checkRes.json();
    const updatedOrg = orgsData.organizations.find(o => o.email === '39-99-38@mail.ru');
    
    if (updatedOrg) {
      console.log(`✓ Организация найдена`);
      console.log(`✓ chairmanId: ${updatedOrg.chairmanId}`);
      console.log(`✓ chairmanName: ${updatedOrg.chairmanName || '❌ NULL'}`);
      console.log(`\n📊 ИТОГОВЫЙ СТАТУС:`);
      console.log(`${updatedOrg.chairmanId && updatedOrg.chairmanName ? '✅ РУКОВОДИТЕЛЬ НАЗНАЧЕН' : '❌ РУКОВОДИТЕЛЬ НЕ НАЗНАЧЕН'}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

test();

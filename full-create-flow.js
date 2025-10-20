const fetch = require('node-fetch');

async function test() {
  try {
    console.log('\n📋 ПОЛНЫЙ ПРОЦЕСС СОЗДАНИЯ ОРГАНИЗАЦИИ С АДМИНИСТРАТОРОМ\n');
    console.log('─'.repeat(70));
    
    // 1. Логируемся
    console.log('\n1️⃣  АВТОРИЗАЦИЯ СУПЕР-АДМИНИСТРАТОРА');
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'support@myunion.pro',
        password: 'password'
      })
    });
    const cookies = loginRes.headers.get('set-cookie');
    console.log('   ✅ Успешная авторизация');
    
    // 2. Создаем организацию
    console.log('\n2️⃣  СОЗДАНИЕ ОРГАНИЗАЦИИ');
    console.log('   📝 Данные:');
    console.log('      - Название: МОСКОВСКАЯ ОБЛАСТНАЯ ОРГАНИЗАЦИЯ...');
    console.log('      - Тип: FEDERAL');
    console.log('      - Email: 39-99-38@mail.ru');
    
    const orgRes = await fetch('http://localhost:3000/api/organizations', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify({
        name: 'МОСКОВСКАЯ ОБЛАСТНАЯ ОРГАНИЗАЦИЯ ПРОФСОЮЗА РАБОТНИКОВ ЗДРАВООХРАНЕНИЯ',
        type: 'FEDERAL',
        address: 'г Москва, ул Марии Ульяновой, д 9 к 1',
        phone: '+7499-138-51-34',
        email: '39-99-38@mail.ru',
        industry: 'EDUCATION'
      })
    });
    
    const orgData = await orgRes.json();
    const orgId = orgData.organization.id;
    
    console.log(`   ✅ Организация создана`);
    console.log(`   📌 ID: ${orgId}`);
    console.log(`   ❌ chairmanId: ${orgData.organization.chairmanId || 'не назначен'}`);
    console.log(`   ❌ chairmanName: ${orgData.organization.chairmanName || 'не назначена'}`);
    console.log(`   \n   🚨 ПРОБЛЕМА: После создания организации руководитель НЕ назначен`);
    
    // 3. Создаем администратора
    console.log('\n3️⃣  СОЗДАНИЕ АДМИНИСТРАТОРА');
    console.log('   📝 Данные:');
    console.log('      - Email: 39-99-38@mail.ru');
    console.log('      - Имя: Нина Суслонова Владимировна');
    console.log('      - Роль: FEDERAL_CHAIRMAN');
    console.log('      - Организация ID: ' + orgId);
    
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
        roles: ['FEDERAL_CHAIRMAN'],
        organizationId: orgId,
        organizationType: 'FEDERAL',
        organizationName: 'МОСКОВСКАЯ ОБЛАСТНАЯ ОРГАНИЗАЦИЯ ПРОФСОЮЗА РАБОТНИКОВ ЗДРАВООХРАНЕНИЯ'
      })
    });
    
    const adminData = await adminRes.json();
    
    if (adminRes.status !== 200) {
      console.log(`   ❌ Ошибка ${adminRes.status}: ${adminData.error}`);
      return;
    }
    
    console.log(`   ✅ Администратор создан`);
    console.log(`   📌 ID: ${adminData.admin.id}`);
    console.log(`   📧 Email: ${adminData.admin.email}`);
    console.log(`   🔑 Временный пароль: ${adminData.temporaryPassword || '(отправлен на email)'}`);
    console.log(`   ✉️  Email отправлен: ${adminData.emailSent ? 'ДА' : 'НЕТ'}`);
    
    // 4. Проверяем результат
    console.log('\n4️⃣  ПРОВЕРКА ОРГАНИЗАЦИИ ПОСЛЕ СОЗДАНИЯ АДМИНИСТРАТОРА');
    
    const checkRes = await fetch('http://localhost:3000/api/organizations', {
      method: 'GET',
      headers: { 
        'Cookie': cookies || ''
      }
    });
    
    const orgsData = await checkRes.json();
    const updatedOrg = orgsData.organizations.find(o => o.email === '39-99-38@mail.ru');
    
    console.log(`   📌 ID: ${updatedOrg.id}`);
    console.log(`   📧 Email: ${updatedOrg.email}`);
    console.log(`   👤 chairmanId: ${updatedOrg.chairmanId || '❌ не назначен'}`);
    console.log(`   📝 chairmanName: ${updatedOrg.chairmanName || '❌ не назначена'}`);
    
    console.log('\n' + '─'.repeat(70));
    if (updatedOrg.chairmanId && updatedOrg.chairmanName) {
      console.log('✅ ИТОГ: Руководитель УСПЕШНО назначен');
    } else {
      console.log('❌ ИТОГ: Руководитель НЕ назначен (проблема в /api/admin/create)');
    }
    console.log('─'.repeat(70) + '\n');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

test();

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
    const randomEmail = `org-${Date.now()}@test.ru`;
    console.log('   📝 Данные:');
    console.log(`      - Email: ${randomEmail}`);
    
    const orgRes = await fetch('http://localhost:3000/api/organizations', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify({
        name: 'МОСКОВСКАЯ ОБЛАСТНАЯ ОРГАНИЗАЦИЯ ПРОФСОЮЗА',
        type: 'FEDERAL',
        address: 'г Москва, ул Марии Ульяновой, д 9 к 1',
        phone: '+7499-138-51-34',
        email: randomEmail,
        industry: 'EDUCATION'
      })
    });
    
    const orgData = await orgRes.json();
    const orgId = orgData.organization.id;
    
    console.log(`   ✅ Организация создана`);
    console.log(`   📌 ID: ${orgId}`);
    console.log(`   ❌ chairmanId: ${orgData.organization.chairmanId || 'не назначен'}`);
    console.log(`   ❌ chairmanName: ${orgData.organization.chairmanName || 'не назначена'}`);
    console.log(`   \n   🚨 СТАТУС: Руководитель НЕ назначен (это нормально)`);
    
    // 3. Создаем администратора
    console.log('\n3️⃣  СОЗДАНИЕ АДМИНИСТРАТОРА');
    const adminEmail = `admin-${Date.now()}@test.ru`;
    console.log('   📝 Данные:');
    console.log(`      - Email: ${adminEmail}`);
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
        email: adminEmail,
        firstName: 'Нина',
        lastName: 'Суслонова',
        middleName: 'Владимировна',
        phone: '+7 499-138-51-34',
        roles: ['FEDERAL_CHAIRMAN'],
        organizationId: orgId,
        organizationType: 'FEDERAL',
        organizationName: 'МОСКОВСКАЯ ОБЛАСТНАЯ ОРГАНИЗАЦИЯ ПРОФСОЮЗА'
      })
    });
    
    const adminData = await adminRes.json();
    
    if (adminRes.status !== 200) {
      console.log(`   ❌ Ошибка ${adminRes.status}: ${adminData.error}`);
      return;
    }
    
    console.log(`   ✅ Администратор создан`);
    console.log(`   📌 ID администратора: ${adminData.admin.id}`);
    console.log(`   📧 Email: ${adminData.admin.email}`);
    console.log(`   ✉️  Email отправлен: ${adminData.emailSent ? '✅ ДА' : '❌ НЕТ'}`);
    
    // 4. Проверяем результат
    console.log('\n4️⃣  ПРОВЕРКА ОРГАНИЗАЦИИ ПОСЛЕ СОЗДАНИЯ АДМИНИСТРАТОРА');
    
    const checkRes = await fetch('http://localhost:3000/api/organizations', {
      method: 'GET',
      headers: { 
        'Cookie': cookies || ''
      }
    });
    
    const orgsData = await checkRes.json();
    const updatedOrg = orgsData.organizations.find(o => o.id === orgId);
    
    console.log(`   📌 ID организации: ${updatedOrg.id}`);
    console.log(`   📧 Email организации: ${updatedOrg.email}`);
    console.log(`   👤 chairmanId: ${updatedOrg.chairmanId ? '✅ ' + updatedOrg.chairmanId : '❌ не назначен'}`);
    console.log(`   📝 chairmanName: ${updatedOrg.chairmanName ? '✅ ' + updatedOrg.chairmanName : '❌ не назначена'}`);
    
    console.log('\n' + '─'.repeat(70));
    if (updatedOrg.chairmanId && updatedOrg.chairmanName) {
      console.log('✅ УСПЕХ: Руководитель УСПЕШНО назначен!');
      console.log(`   ${updatedOrg.chairmanName} (ID: ${updatedOrg.chairmanId})`);
    } else {
      console.log('❌ ПРОБЛЕМА: Руководитель НЕ назначен');
      console.log('   Нужно проверить /api/admin/create endpoint');
    }
    console.log('─'.repeat(70) + '\n');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

test();

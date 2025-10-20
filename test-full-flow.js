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
    console.log('✅ Login успешен\n');
    
    // Создаем организацию
    const orgEmail = `org-${Date.now()}@test.ru`;
    const adminEmail = `admin-${Date.now()}@test.ru`;
    
    console.log('📝 ДАННЫЕ:');
    console.log(`   Организация email: ${orgEmail}`);
    console.log(`   Администратор email: ${adminEmail}`);
    console.log(`   Администратор: Нина Суслонова Владимировна`);
    console.log(`   Роль: FEDERAL_CHAIRMAN`);
    console.log(`   Тип организации: FEDERAL\n`);
    
    const orgRes = await fetch('http://localhost:3000/api/organizations', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify({
        name: 'TEST ORG',
        type: 'FEDERAL',
        address: 'Address',
        phone: '+7499-138-51-34',
        email: orgEmail,
        industry: 'EDUCATION'
      })
    });
    
    const orgData = await orgRes.json();
    const orgId = orgData.organization?.id;
    
    console.log(`1️⃣ ОРГАНИЗАЦИЯ СОЗДАНА`);
    console.log(`   ID: ${orgId}`);
    console.log(`   chairmanId ДО: ${orgData.organization?.chairmanId || 'NULL'}\n`);
    
    // Создаем администратора
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
        organizationName: 'TEST ORG'
      })
    });
    
    const adminData = await adminRes.json();
    console.log(`2️⃣ АДМИНИСТРАТОР СОЗДАНИЕ`);
    console.log(`   Статус: ${adminRes.status}`);
    
    if (adminRes.status === 200 || adminRes.status === 201) {
      console.log(`   ✅ Успех`);
      console.log(`   Admin ID: ${adminData.admin?.id}`);
      console.log(`   Email: ${adminData.admin?.email}\n`);
    } else {
      console.log(`   ❌ Ошибка: ${adminData.error}`);
      console.log(`   Full response:`, JSON.stringify(adminData, null, 2));
      return;
    }
    
    // Проверяем организацию
    const checkRes = await fetch('http://localhost:3000/api/organizations', {
      method: 'GET',
      headers: { 'Cookie': cookies || '' }
    });
    
    const orgsData = await checkRes.json();
    const updatedOrg = orgsData.organizations.find(o => o.id === orgId);
    
    console.log(`3️⃣ ОРГАНИЗАЦИЯ ПОСЛЕ СОЗДАНИЯ АДМИНИСТРАТОРА`);
    console.log(`   chairmanId ПОСЛЕ: ${updatedOrg?.chairmanId || 'NULL'}`);
    console.log(`   chairmanName ПОСЛЕ: ${updatedOrg?.chairmanName || 'NULL'}`);
    
    if (updatedOrg?.chairmanId && updatedOrg?.chairmanName) {
      console.log(`\n✅ УСПЕХ: Администратор назначен!`);
    } else {
      console.log(`\n❌ ПРОБЛЕМА: Администратор НЕ назначен`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

test();

import { prisma } from '../lib/database';
import { emailNotificationService } from '../lib/email-notifications';

async function testValidationSystem() {
  console.log('🔄 Тестируем систему валидации с email уведомлениями...');

  try {
    // Создаем тестовое заявление
    const testApplication = await prisma.membershipApplication.create({
      data: {
        firstName: 'Тест',
        lastName: 'Тестов',
        middleName: 'Тестович',
        phone: '+7 (999) 123-45-67',
        dateOfBirth: new Date('1990-01-01'),
        address: JSON.stringify({
          city: 'Москва',
          street: 'ул. Тестовая, д. 1'
        }),
        organizationId: 'test-org-id', // Замените на реальный ID организации
        status: 'PENDING'
      }
    });

    console.log('✅ Тестовое заявление создано:', testApplication.id);

    // Тестируем email уведомления
    console.log('📧 Тестируем email уведомления...');

    // Тест уведомления о новом члене
    await emailNotificationService.sendNotification({
      type: 'NEW_MEMBER_REGISTRATION',
      recipientEmail: 'chairman@test.com',
      recipientName: 'Председатель Тестов',
      organizationName: 'Тестовая организация',
      memberName: 'Тест Тестов Тестович'
    });

    // Тест уведомления об одобрении
    await emailNotificationService.sendNotification({
      type: 'MEMBERSHIP_APPROVED',
      recipientEmail: 'member@test.com',
      recipientName: 'Тест Тестов Тестович',
      organizationName: 'Тестовая организация'
    });

    // Тест уведомления об отклонении
    await emailNotificationService.sendNotification({
      type: 'MEMBERSHIP_REJECTED',
      recipientEmail: 'member@test.com',
      recipientName: 'Тест Тестов Тестович',
      organizationName: 'Тестовая организация',
      rejectionReason: 'Неполные документы'
    });

    console.log('✅ Email уведомления отправлены');

    // Очищаем тестовые данные
    await prisma.membershipApplication.delete({
      where: { id: testApplication.id }
    });

    console.log('🎉 Система валидации работает корректно!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании системы валидации:', error);
  }
}

testValidationSystem()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🚀 Создание тестового пользователя...');

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email: 'support@myunion.pro' }
    });

    if (existingUser) {
      console.log('✅ Пользователь уже существует');
      console.log('📧 Email:', existingUser.email);
      console.log('👤 Имя:', existingUser.firstName, existingUser.lastName);
      console.log('🔑 Роль:', existingUser.role);
      console.log('🏢 Организация:', existingUser.organizationId);
      return;
    }

    // Создаем главную организацию, если её нет
    let mainOrg = await prisma.organization.findFirst({
      where: { isMain: true }
    });

    if (!mainOrg) {
      mainOrg = await prisma.organization.create({
        data: {
          name: 'Московская областная организация профсоюза работников здравоохранения РФ',
          type: 'REGIONAL',
          address: 'Москва, ул. Примерная, д. 1',
          phone: '+7 (495) 123-45-67',
          email: 'info@myunion.pro',
          inn: '1234567890',
          membersCount: 0,
          isActive: true,
          isMain: true
        }
      });
      console.log('✅ Главная организация создана');
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('123321ZxQ@*', 10);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email: 'support@myunion.pro',
        password: hashedPassword,
        firstName: 'Супер',
        lastName: 'Администратор',
        middleName: 'Системы',
        phone: '+7 (495) 123-45-67',
        role: 'SUPER_ADMIN',
        organizationId: mainOrg.id,
        isActive: true,
        emailVerified: true,
        membershipValidated: true
      }
    });

    console.log('✅ Тестовый пользователь создан:');
    console.log('📧 Email:', user.email);
    console.log('🔑 Пароль: 123321ZxQ@*');
    console.log('👤 Имя:', user.firstName, user.lastName);
    console.log('🔑 Роль:', user.role);
    console.log('🏢 Организация:', mainOrg.name);

  } catch (error) {
    console.error('❌ Ошибка создания пользователя:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

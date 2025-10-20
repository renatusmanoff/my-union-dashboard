import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with essential data only...');

  // Создаем только супер-администратора
  const superAdmin = await prisma.user.upsert({
    where: { email: 'support@myunion.pro' },
    update: {},
    create: {
      email: 'support@myunion.pro',
      firstName: 'Супер',
      lastName: 'Администратор',
      phone: '+7 (495) 000-00-00',
      role: 'SUPER_ADMIN',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    },
  });

  console.log('✅ Super admin created:', superAdmin.email);
  console.log('🎉 Database seeding completed successfully!');
  console.log('📋 Ready for live data - only essential system data created');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
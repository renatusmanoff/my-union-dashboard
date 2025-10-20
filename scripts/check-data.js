const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Проверяем данные в базе...\n');

    // Подсчитываем пользователей
    const userCount = await prisma.user.count();
    console.log(`👥 Всего пользователей: ${userCount}`);

    const primaryMembers = await prisma.user.count({
      where: { role: 'PRIMARY_MEMBER' }
    });
    console.log(`👤 Членов профсоюза (PRIMARY_MEMBER): ${primaryMembers}`);

    const superAdmins = await prisma.user.count({
      where: { role: 'SUPER_ADMIN' }
    });
    console.log(`🔑 Супер-администраторов: ${superAdmins}`);

    const chairmen = await prisma.user.count({
      where: { role: 'PRIMARY_CHAIRMAN' }
    });
    console.log(`👨‍💼 Председателей: ${chairmen}`);

    // Подсчитываем организации
    const orgCount = await prisma.organization.count();
    console.log(`🏢 Организаций: ${orgCount}`);

    // Подсчитываем заявления
    const appCount = await prisma.membershipApplication.count();
    console.log(`📝 Заявлений на вступление: ${appCount}`);

    const approvedApps = await prisma.membershipApplication.count({
      where: { status: 'APPROVED' }
    });
    console.log(`✅ Одобренных заявлений: ${approvedApps}`);

    const pendingApps = await prisma.membershipApplication.count({
      where: { status: 'PENDING' }
    });
    console.log(`⏳ Заявлений на рассмотрении: ${pendingApps}`);

    const rejectedApps = await prisma.membershipApplication.count({
      where: { status: 'REJECTED' }
    });
    console.log(`❌ Отклоненных заявлений: ${rejectedApps}`);

    // Показываем список членов профсоюза
    console.log('\n📋 Список членов профсоюза:');
    const members = await prisma.user.findMany({
      where: { role: 'PRIMARY_MEMBER' },
      include: {
        organization: {
          select: { name: true }
        },
        membershipApplications: {
          select: { status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    members.forEach((member, index) => {
      const latestApp = member.membershipApplications[0];
      const status = latestApp ? latestApp.status : 'Нет заявления';
      console.log(`${index + 1}. ${member.lastName} ${member.firstName} ${member.middleName || ''} (${member.email}) - ${status}`);
    });

  } catch (error) {
    console.error('❌ Ошибка при проверке данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();

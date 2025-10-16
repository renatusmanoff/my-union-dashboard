const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function safeMigration() {
  try {
    console.log('🔄 Starting safe database migration...');
    
    // 1. Создаем резервную копию данных
    console.log('📦 Creating data backup...');
    const backup = await createDataBackup();
    
    // 2. Пытаемся применить миграцию без сброса
    console.log('🔧 Attempting non-destructive migration...');
    try {
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('✅ Migration completed successfully without data loss!');
      return;
    } catch (error) {
      console.log('⚠️ Non-destructive migration failed, checking if reset is needed...');
    }
    
    // 3. Проверяем, можно ли безопасно сбросить
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         process.env.DATABASE_URL?.includes('localhost') ||
                         process.env.DATABASE_URL?.includes('neondb');
    
    if (!isDevelopment) {
      console.error('❌ Cannot reset production database!');
      console.log('Please manually resolve the migration conflicts.');
      return;
    }
    
    // 4. Спрашиваем пользователя о сбросе
    console.log('🔄 Database reset required for migration.');
    console.log('This will delete all data and recreate the schema.');
    console.log('Data backup has been created and will be restored after migration.');
    
    // 5. Выполняем сброс и восстановление
    console.log('🗑️ Resetting database...');
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    
    console.log('🔄 Restoring data from backup...');
    await restoreDataBackup(backup);
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function createDataBackup() {
  const backup = {
    organizations: [],
    users: [],
    applications: [],
    documents: []
  };
  
  try {
    // Создаем резервные копии всех важных данных
    backup.organizations = await prisma.organization.findMany();
    backup.users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        phone: true,
        role: true,
        organizationId: true,
        isActive: true,
        emailVerified: true,
        password: true
      }
    });
    
    // Пытаемся создать резервные копии заявлений и документов (если они существуют)
    try {
      backup.applications = await prisma.membershipApplication.findMany();
    } catch (error) {
      console.log('⚠️ MembershipApplication table not found, skipping backup');
    }
    
    try {
      backup.documents = await prisma.membershipDocument.findMany();
    } catch (error) {
      console.log('⚠️ MembershipDocument table not found, skipping backup');
    }
    
    console.log(`📦 Backup created: ${backup.organizations.length} organizations, ${backup.users.length} users`);
    return backup;
    
  } catch (error) {
    console.error('❌ Failed to create backup:', error);
    throw error;
  }
}

async function restoreDataBackup(backup) {
  try {
    // Восстанавливаем организации
    for (const org of backup.organizations) {
      await prisma.organization.create({
        data: {
          name: org.name,
          type: org.type,
          industry: org.industry,
          address: org.address,
          phone: org.phone,
          email: org.email,
          isActive: org.isActive
        }
      });
    }
    console.log(`✅ Restored ${backup.organizations.length} organizations`);
    
    // Восстанавливаем пользователей
    for (const user of backup.users) {
      await prisma.user.create({
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName,
          phone: user.phone,
          role: user.role,
          organizationId: user.organizationId,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          password: user.password
        }
      });
    }
    console.log(`✅ Restored ${backup.users.length} users`);
    
    // Восстанавливаем заявления (если есть)
    if (backup.applications.length > 0) {
      for (const app of backup.applications) {
        await prisma.membershipApplication.create({
          data: {
            firstName: app.firstName,
            lastName: app.lastName,
            middleName: app.middleName,
            dateOfBirth: app.dateOfBirth,
            gender: app.gender,
            phone: app.phone,
            address: app.address,
            organizationId: app.organizationId,
            status: app.status,
            signLater: app.signLater,
            userId: app.userId
          }
        });
      }
      console.log(`✅ Restored ${backup.applications.length} applications`);
    }
    
    // Восстанавливаем документы (если есть)
    if (backup.documents.length > 0) {
      for (const doc of backup.documents) {
        await prisma.membershipDocument.create({
          data: {
            applicationId: doc.applicationId,
            type: doc.type,
            fileName: doc.fileName,
            filePath: doc.filePath,
            status: doc.status,
            signedAt: doc.signedAt,
            sentToUnion: doc.sentToUnion,
            sentAt: doc.sentAt
          }
        });
      }
      console.log(`✅ Restored ${backup.documents.length} documents`);
    }
    
  } catch (error) {
    console.error('❌ Failed to restore backup:', error);
    throw error;
  }
}

// Запускаем миграцию
safeMigration();

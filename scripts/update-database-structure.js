#!/usr/bin/env node

/**
 * Скрипт для безопасного обновления структуры базы данных
 * Добавляет новые таблицы и поля без потери существующих данных
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateDatabaseStructure() {
  console.log('🔄 Начинаем обновление структуры базы данных...');

  try {
    // 1. Создаем новые enum типы
    console.log('📝 Создаем новые enum типы...');
    
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "WorkflowDocumentType" AS ENUM ('PROTOCOL_MEETING', 'AGENDA', 'MEETING_CONDUCT', 'RESOLUTION');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "WorkflowDocumentStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "DocumentParticipantStatus" AS ENUM ('PENDING', 'APPROVED', 'SIGNED', 'REJECTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "NotificationType" AS ENUM ('NEW_MEMBER_REGISTRATION', 'MEMBERSHIP_APPROVED', 'MEMBERSHIP_REJECTED', 'DOCUMENT_CREATED', 'DOCUMENT_SIGNED', 'DOCUMENT_REJECTED', 'DOCUMENT_APPROVED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    console.log('✅ Enum типы созданы');

    // 2. Создаем таблицу workflow_documents
    console.log('📄 Создаем таблицу workflow_documents...');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "workflow_documents" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "type" "WorkflowDocumentType" NOT NULL,
        "content" TEXT,
        "pdfPath" TEXT,
        "status" "WorkflowDocumentStatus" NOT NULL DEFAULT 'DRAFT',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "creatorId" TEXT NOT NULL,
        "organizationId" TEXT,

        CONSTRAINT "workflow_documents_pkey" PRIMARY KEY ("id")
      );
    `;

    // 3. Создаем таблицу document_participants
    console.log('👥 Создаем таблицу document_participants...');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "document_participants" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "documentId" TEXT NOT NULL,
        "status" "DocumentParticipantStatus" NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "document_participants_pkey" PRIMARY KEY ("id")
      );
    `;

    // 4. Создаем таблицу document_signatures
    console.log('✍️ Создаем таблицу document_signatures...');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "document_signatures" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "documentId" TEXT NOT NULL,
        "signature" TEXT,
        "signedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "document_signatures_pkey" PRIMARY KEY ("id")
      );
    `;

    // 5. Создаем таблицу notifications
    console.log('🔔 Создаем таблицу notifications...');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" TEXT NOT NULL,
        "type" "NotificationType" NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "senderId" TEXT,
        "recipientId" TEXT NOT NULL,
        "workflowDocumentId" TEXT,
        "membershipApplicationId" TEXT,

        CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
      );
    `;

    console.log('✅ Таблицы созданы');

    // 6. Добавляем внешние ключи
    console.log('🔗 Добавляем внешние ключи...');

    // Внешние ключи для workflow_documents
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "workflow_documents" ADD CONSTRAINT "workflow_documents_creatorId_fkey" 
        FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "workflow_documents" ADD CONSTRAINT "workflow_documents_organizationId_fkey" 
        FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Внешние ключи для document_participants
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "document_participants" ADD CONSTRAINT "document_participants_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "document_participants" ADD CONSTRAINT "document_participants_documentId_fkey" 
        FOREIGN KEY ("documentId") REFERENCES "workflow_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Внешние ключи для document_signatures
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_documentId_fkey" 
        FOREIGN KEY ("documentId") REFERENCES "workflow_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Внешние ключи для notifications
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "notifications" ADD CONSTRAINT "notifications_senderId_fkey" 
        FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientId_fkey" 
        FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workflowDocumentId_fkey" 
        FOREIGN KEY ("workflowDocumentId") REFERENCES "workflow_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "notifications" ADD CONSTRAINT "notifications_membershipApplicationId_fkey" 
        FOREIGN KEY ("membershipApplicationId") REFERENCES "membership_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    console.log('✅ Внешние ключи добавлены');

    // 7. Создаем уникальные индексы
    console.log('🔍 Создаем уникальные индексы...');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE UNIQUE INDEX "document_participants_userId_documentId_key" ON "document_participants"("userId", "documentId");
      EXCEPTION
        WHEN duplicate_table THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE UNIQUE INDEX "document_signatures_userId_documentId_key" ON "document_signatures"("userId", "documentId");
      EXCEPTION
        WHEN duplicate_table THEN null;
      END $$;
    `;

    console.log('✅ Индексы созданы');

    console.log('🎉 Структура базы данных успешно обновлена!');
    console.log('📊 Добавлены новые таблицы:');
    console.log('   - workflow_documents (документооборот)');
    console.log('   - document_participants (участники документов)');
    console.log('   - document_signatures (подписи документов)');
    console.log('   - notifications (уведомления)');

  } catch (error) {
    console.error('❌ Ошибка при обновлении структуры БД:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт
updateDatabaseStructure()
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });

import { prisma } from '@/lib/database';
import { WorkflowDocumentType, WorkflowDocumentStatus, DocumentParticipantStatus } from '@prisma/client';

async function createTestWorkflowDocuments() {
  console.log('🔄 Создаем тестовые документы документооборота...');

  try {
    // Получаем организацию и пользователей
    const organization = await prisma.organization.findFirst({
      where: { name: 'Первичная профсоюзная организация МГУ' }
    });

    if (!organization) {
      console.log('❌ Организация не найдена');
      return;
    }

    const chairman = await prisma.user.findFirst({
      where: {
        organizationId: organization.id,
        role: 'PRIMARY_CHAIRMAN'
      }
    });

    if (!chairman) {
      console.log('❌ Председатель не найден');
      return;
    }

    // Получаем несколько членов профсоюза для участия в документах
    const members = await prisma.user.findMany({
      where: {
        organizationId: organization.id,
        role: 'PRIMARY_MEMBER'
      },
      take: 3
    });

    if (members.length === 0) {
      console.log('❌ Члены профсоюза не найдены');
      return;
    }

    // Создаем тестовые документы
    const documents = [
      {
        title: 'Протокол заседания профкома от 15.10.2025',
        type: 'PROTOCOL_MEETING' as WorkflowDocumentType,
        content: '<h1>Протокол заседания</h1><p>Содержание протокола...</p>',
        status: 'PENDING_APPROVAL' as WorkflowDocumentStatus
      },
      {
        title: 'Повестка дня на октябрь 2025',
        type: 'AGENDA' as WorkflowDocumentType,
        content: '<h1>Повестка дня</h1><p>Основные вопросы для обсуждения...</p>',
        status: 'DRAFT' as WorkflowDocumentStatus
      },
      {
        title: 'Постановление о размере членских взносов',
        type: 'RESOLUTION' as WorkflowDocumentType,
        content: '<h1>Постановление</h1><p>О размере членских взносов на 2026 год...</p>',
        status: 'APPROVED' as WorkflowDocumentStatus
      }
    ];

    for (const docData of documents) {
      // Создаем документ
      const document = await prisma.workflowDocument.create({
        data: {
          title: docData.title,
          type: docData.type,
          content: docData.content,
          status: docData.status,
          creatorId: chairman.id,
          organizationId: organization.id
        }
      });

      // Добавляем участников
      const participantData = members.map(member => ({
        userId: member.id,
        documentId: document.id,
        status: docData.status === 'APPROVED' ? 'SIGNED' as DocumentParticipantStatus : 'PENDING' as DocumentParticipantStatus
      }));

      await prisma.documentParticipant.createMany({
        data: participantData
      });

      // Если документ одобрен, создаем подписи
      if (docData.status === 'APPROVED') {
        const signatureData = members.map(member => ({
          userId: member.id,
          documentId: document.id,
          signedAt: new Date()
        }));

        await prisma.documentSignature.createMany({
          data: signatureData
        });
      }

      console.log(`✅ Создан документ: ${docData.title}`);
    }

    console.log('🎉 Тестовые документы документооборота созданы успешно!');

  } catch (error) {
    console.error('❌ Ошибка при создании тестовых документов:', error);
  }
}

// Запускаем создание тестовых документов
createTestWorkflowDocuments()
  .then(() => {
    console.log('✅ Скрипт завершен');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  });

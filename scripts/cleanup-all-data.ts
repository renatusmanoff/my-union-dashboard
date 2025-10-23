import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupAllData() {
  try {
    console.log('🗑️ Полная очистка базы данных...')

    // Удаляем в правильном порядке (сначала зависимые таблицы)
    await prisma.session.deleteMany({})
    console.log('✅ Сессии удалены')

    await prisma.notification.deleteMany({})
    console.log('✅ Уведомления удалены')

    await prisma.message.deleteMany({})
    console.log('✅ Сообщения удалены')

    await prisma.task.deleteMany({})
    console.log('✅ Задачи удалены')

    await prisma.document.deleteMany({})
    console.log('✅ Документы удалены')

    await prisma.membershipApplication.deleteMany({})
    console.log('✅ Заявки на членство удалены')

    await prisma.news.deleteMany({})
    console.log('✅ Новости удалены')

    await prisma.calendarEvent.deleteMany({})
    console.log('✅ События календаря удалены')

    await prisma.knowledgeBaseItem.deleteMany({})
    console.log('✅ База знаний очищена')

    await prisma.report.deleteMany({})
    console.log('✅ Отчеты удалены')

    await prisma.project.deleteMany({})
    console.log('✅ Проекты удалены')

    await prisma.workflowDocument.deleteMany({})
    console.log('✅ Рабочие документы удалены')

    // Теперь удаляем пользователей
    await prisma.user.deleteMany({})
    console.log('✅ Пользователи удалены')

    // И организации
    await prisma.organization.deleteMany({})
    console.log('✅ Организации удалены')

    console.log('✅ База данных полностью очищена')

  } catch (error) {
    console.error('❌ Ошибка очистки:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupAllData()

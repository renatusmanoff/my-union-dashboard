import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupFederalData() {
  try {
    console.log('🗑️ Удаление федеральных данных...')

    // Удаляем все сессии
    await prisma.session.deleteMany({})
    console.log('✅ Сессии удалены')

    // Удаляем всех пользователей
    await prisma.user.deleteMany({})
    console.log('✅ Пользователи удалены')

    // Удаляем все организации
    await prisma.organization.deleteMany({})
    console.log('✅ Организации удалены')

    console.log('✅ Все данные очищены')

  } catch (error) {
    console.error('❌ Ошибка очистки:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupFederalData()

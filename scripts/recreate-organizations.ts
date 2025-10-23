import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function recreateOrganizations() {
  try {
    console.log('🚀 Пересоздание структуры организаций без федерального уровня...')

    // Удаляем все существующие организации и пользователей (кроме супер-админа)
    console.log('🗑️ Очистка старых данных...')
    
    // Удаляем сессии
    await prisma.session.deleteMany({})
    
    // Удаляем пользователей (кроме супер-админа)
    await prisma.user.deleteMany({
      where: {
        email: {
          not: 'support@myunion.pro'
        }
      }
    })
    
    // Удаляем организации
    await prisma.organization.deleteMany({})

    console.log('✅ Старые данные удалены')

    // 1. Создаем главную региональную организацию МООП РЗ РФ
    const mainOrg = await prisma.organization.create({
      data: {
        name: 'Московская областная организация профсоюза работников здравоохранения РФ',
        type: 'REGIONAL',
        address: 'Московская область, г. Подольск, ул. Ленина, 10',
        phone: '8-499-138-51-34, 499-138-03-57',
        email: 'info@myunion.pro',
        inn: '7706045006',
        chairmanName: 'Суслонова Нина Владимировна',
        isMain: true,
        isActive: true
      }
    })

    console.log('✅ Главная региональная организация создана:', mainOrg.name)

    // 2. Создаем супер-администратора Суслонова Н.В.
    const hashedPassword = await bcrypt.hash('123321ZxQ@*', 10)
    
    const superAdmin = await prisma.user.create({
      data: {
        email: 'suslonova@myunion.pro',
        password: hashedPassword,
        firstName: 'Нина',
        lastName: 'Суслонова',
        middleName: 'Владимировна',
        phone: '8-499-138-51-34',
        role: 'SUPER_ADMIN',
        organizationId: mainOrg.id,
        isActive: true,
        emailVerified: true,
        membershipValidated: true
      }
    })

    console.log('✅ Супер-администратор создан:', superAdmin.firstName, superAdmin.lastName)

    // 3. Создаем главного бухгалтера Григорьева Н.Л.
    const accountant = await prisma.user.create({
      data: {
        email: 'grigorieva@myunion.pro',
        password: hashedPassword,
        firstName: 'Наталья',
        lastName: 'Григорьева',
        middleName: 'Леонидовна',
        phone: '8-499-138-03-57',
        role: 'REGIONAL_CHIEF_ACCOUNTANT',
        organizationId: mainOrg.id,
        isActive: true,
        emailVerified: true,
        membershipValidated: true
      }
    })

    console.log('✅ Главный бухгалтер создан:', accountant.firstName, accountant.lastName)

    // 4. Создаем местные организации
    const dubnaLocal = await prisma.organization.create({
      data: {
        name: 'Дубненская местная организация',
        type: 'LOCAL',
        parentId: mainOrg.id,
        address: 'Московская область, г. Дубна',
        phone: '8-496-21-123-45',
        email: 'dubna@myunion.pro',
        inn: '5001001001',
        chairmanName: 'Иванов Иван Иванович',
        isActive: true
      }
    })

    const voskresenskLocal = await prisma.organization.create({
      data: {
        name: 'Воскресенская местная организация',
        type: 'LOCAL',
        parentId: mainOrg.id,
        address: 'Московская область, г. Воскресенск',
        phone: '8-496-44-123-45',
        email: 'voskresensk@myunion.pro',
        inn: '5002002002',
        chairmanName: 'Петров Петр Петрович',
        isActive: true
      }
    })

    console.log('✅ Местные организации созданы')

    // 5. Создаем первичные организации под Дубной
    const dubnaStomatology = await prisma.organization.create({
      data: {
        name: 'ППО ГБУЗ МО «Дубненская стоматологическая поликлиника»',
        type: 'PRIMARY',
        parentId: dubnaLocal.id,
        address: 'Московская область, г. Дубна, ул. Стоматологическая, 1',
        phone: '8-496-21-111-11',
        email: 'dubna-stomatology@myunion.pro',
        inn: '5001001003',
        chairmanName: 'Сидоров Сидор Сидорович',
        isActive: true
      }
    })

    const dubnaHospital = await prisma.organization.create({
      data: {
        name: 'ППО ГБУЗ МО «Дубненская больница»',
        type: 'PRIMARY',
        parentId: dubnaLocal.id,
        address: 'Московская область, г. Дубна, ул. Больничная, 2',
        phone: '8-496-21-222-22',
        email: 'dubna-hospital@myunion.pro',
        inn: '5001001004',
        chairmanName: 'Козлов Козел Козлович',
        isActive: true
      }
    })

    // 6. Создаем первичные организации под Воскресенском
    const voskresenskStomatology = await prisma.organization.create({
      data: {
        name: 'ППО ГБУЗ МО «Воскресенская стоматологическая поликлиника»',
        type: 'PRIMARY',
        parentId: voskresenskLocal.id,
        address: 'Московская область, г. Воскресенск, ул. Стоматологическая, 3',
        phone: '8-496-44-333-33',
        email: 'voskresensk-stomatology@myunion.pro',
        inn: '5002002003',
        chairmanName: 'Морозов Мороз Морозович',
        isActive: true
      }
    })

    const voskresenskHospital = await prisma.organization.create({
      data: {
        name: 'ППО ГБУЗ МО «Воскресенская больница»',
        type: 'PRIMARY',
        parentId: voskresenskLocal.id,
        address: 'Московская область, г. Воскресенск, ул. Больничная, 4',
        phone: '8-496-44-444-44',
        email: 'voskresensk-hospital@myunion.pro',
        inn: '5002002004',
        chairmanName: 'Волков Волк Волкович',
        isActive: true
      }
    })

    // 7. Создаем первичные организации, подчиняющиеся напрямую главной региональной
    const directPrimaryOrgs = [
      {
        name: 'ППО ГБУЗ МО «Домодедовская стоматологическая поликлиника»',
        email: 'domodedovo-stomatology@myunion.pro',
        inn: '5003003001',
        phone: '8-496-79-555-55',
        address: 'Московская область, г. Домодедово, ул. Стоматологическая, 5',
        chairmanName: 'Орлов Орел Орлович'
      },
      {
        name: 'ППО ГБУЗ МО «МОНИКИ им. М.Ф. Владимирского»',
        email: 'moniki@myunion.pro',
        inn: '5004004001',
        phone: '8-495-123-66-66',
        address: 'Московская область, г. Подольск, ул. Медицинская, 6',
        chairmanName: 'Соколов Сокол Соколович'
      },
      {
        name: 'ППО ГБУ «Мособлмедсервис»',
        email: 'mosoblmedservis@myunion.pro',
        inn: '5005005001',
        phone: '8-495-777-77-77',
        address: 'Московская область, г. Подольск, ул. Сервисная, 7',
        chairmanName: 'Белов Белый Белович'
      },
      {
        name: 'ППО ГБУ «МОМИАЦ»',
        email: 'momiac@myunion.pro',
        inn: '5006006001',
        phone: '8-495-888-88-88',
        address: 'Московская область, г. Подольск, ул. Информационная, 8',
        chairmanName: 'Чернов Черный Чернович'
      },
      {
        name: 'ППО ГБУЗ МО «МОНИИАГ»',
        email: 'moniiag@myunion.pro',
        inn: '5007007001',
        phone: '8-495-999-99-99',
        address: 'Московская область, г. Подольск, ул. Научная, 9',
        chairmanName: 'Рыжов Рыжий Рыжович'
      }
    ]

    for (const orgData of directPrimaryOrgs) {
      await prisma.organization.create({
        data: {
          name: orgData.name,
          type: 'PRIMARY',
          parentId: mainOrg.id,
          address: orgData.address,
          phone: orgData.phone,
          email: orgData.email,
          inn: orgData.inn,
          chairmanName: orgData.chairmanName,
          isActive: true
        }
      })
    }

    console.log('✅ Первичные организации созданы')

    // 8. Создаем руководителей для каждой организации
    const orgs = await prisma.organization.findMany({
      where: { isActive: true }
    })

    for (const org of orgs) {
      if (org.chairmanName && !org.chairmanId) {
        const [firstName, lastName, middleName] = org.chairmanName.split(' ')
        
        const chairman = await prisma.user.create({
          data: {
            email: `${org.email.split('@')[0]}-chairman@myunion.pro`,
            password: hashedPassword,
            firstName: firstName || 'Председатель',
            lastName: lastName || 'Организации',
            middleName: middleName,
            phone: org.phone,
            role: org.type === 'REGIONAL' ? 'REGIONAL_CHAIRMAN' : 
                  org.type === 'LOCAL' ? 'LOCAL_CHAIRMAN' : 'PRIMARY_CHAIRMAN',
            organizationId: org.id,
            isActive: true,
            emailVerified: true,
            membershipValidated: true
          }
        })

        // Обновляем chairmanId в организации
        await prisma.organization.update({
          where: { id: org.id },
          data: { chairmanId: chairman.id }
        })
      }
    }

    console.log('✅ Руководители организаций созданы')

    console.log('🎉 Новая структура создана успешно!')
    console.log('📊 Структура организаций:')
    console.log('   - Главная региональная: МООП РЗ РФ')
    console.log('   - Местные: 2 (Дубна, Воскресенск)')
    console.log('   - Первичные: 9 (4 под местными, 5 под главной)')
    console.log('   - Пользователи: 12 (супер-админ, бухгалтер, 10 руководителей)')

  } catch (error) {
    console.error('❌ Ошибка пересоздания:', error)
  } finally {
    await prisma.$disconnect()
  }
}

recreateOrganizations()

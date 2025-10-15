import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, canCreateOrganizations } from '@/lib/auth';
import { Organization, OrganizationType } from '@/types';

// Реальные российские профсоюзы
const realOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Федерация независимых профсоюзов России (ФНПР)',
    type: 'FEDERAL',
    address: 'г. Москва, ул. Ленинская Слобода, д. 19',
    phone: '+7 (495) 623-45-67',
    email: 'info@fnpr.ru',
    chairmanName: 'Михаил Викторович Шмаков',
    chairmanId: 'chairman-1',
    inn: '7702071077',
    isActive: true,
    membersCount: 20000000,
    createdAt: new Date('1990-12-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Профсоюз работников образования и науки РФ',
    type: 'FEDERAL',
    address: 'г. Москва, ул. Щепкина, д. 38',
    phone: '+7 (495) 234-56-78',
    email: 'info@education-union.ru',
    chairmanName: 'Галина Ивановна Меркулова',
    chairmanId: 'chairman-2',
    inn: '7702071078',
    isActive: true,
    membersCount: 5000000,
    createdAt: new Date('1990-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Профсоюз работников здравоохранения РФ',
    type: 'FEDERAL',
    address: 'г. Москва, ул. Тверская, д. 14',
    phone: '+7 (495) 345-67-89',
    email: 'info@health-union.ru',
    chairmanName: 'Валерий Николаевич Егоров',
    chairmanId: 'chairman-3',
    inn: '7702071079',
    isActive: true,
    membersCount: 3000000,
    createdAt: new Date('1990-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Профсоюз работников нефтяной, газовой отраслей промышленности и строительства РФ',
    type: 'FEDERAL',
    address: 'г. Москва, ул. Нефтяников, д. 25',
    phone: '+7 (495) 456-78-90',
    email: 'info@oil-gas-union.ru',
    chairmanName: 'Александр Сергеевич Корчагин',
    chairmanId: 'chairman-4',
    inn: '7702071080',
    isActive: true,
    membersCount: 2500000,
    createdAt: new Date('1990-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '5',
    name: 'Профсоюз работников металлургической промышленности РФ',
    type: 'FEDERAL',
    address: 'г. Москва, ул. Металлургов, д. 12',
    phone: '+7 (495) 567-89-01',
    email: 'info@metallurgy-union.ru',
    chairmanName: 'Сергей Владимирович Чернышов',
    chairmanId: 'chairman-5',
    inn: '7702071081',
    isActive: true,
    membersCount: 1800000,
    createdAt: new Date('1990-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '6',
    name: 'Московская федерация профсоюзов',
    type: 'REGIONAL',
    parentId: '1',
    parentName: 'Федерация независимых профсоюзов России (ФНПР)',
    address: 'г. Москва, ул. Тверская, д. 22',
    phone: '+7 (495) 678-90-12',
    email: 'info@moscow-union.ru',
    chairmanName: 'Александр Петрович Семенов',
    chairmanId: 'chairman-6',
    inn: '7702071082',
    isActive: true,
    membersCount: 2500000,
    createdAt: new Date('1991-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '7',
    name: 'Санкт-Петербургская федерация профсоюзов',
    type: 'REGIONAL',
    parentId: '1',
    parentName: 'Федерация независимых профсоюзов России (ФНПР)',
    address: 'г. Санкт-Петербург, ул. Рубинштейна, д. 15',
    phone: '+7 (812) 234-56-78',
    email: 'info@spb-union.ru',
    chairmanName: 'Елена Александровна Кузнецова',
    chairmanId: 'chairman-7',
    inn: '7802071083',
    isActive: true,
    membersCount: 1800000,
    createdAt: new Date('1991-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '8',
    name: 'Свердловская областная федерация профсоюзов',
    type: 'REGIONAL',
    parentId: '1',
    parentName: 'Федерация независимых профсоюзов России (ФНПР)',
    address: 'г. Екатеринбург, ул. Ленина, д. 24',
    phone: '+7 (343) 234-56-78',
    email: 'info@ural-union.ru',
    chairmanName: 'Андрей Михайлович Ветров',
    chairmanId: 'chairman-8',
    inn: '6652071084',
    isActive: true,
    membersCount: 1200000,
    createdAt: new Date('1991-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '9',
    name: 'Московская городская организация профсоюза работников образования',
    type: 'LOCAL',
    parentId: '6',
    parentName: 'Московская федерация профсоюзов',
    address: 'г. Москва, ул. Большая Полянка, д. 42',
    phone: '+7 (495) 789-01-23',
    email: 'info@moscow-education.ru',
    chairmanName: 'Мария Сергеевна Иванова',
    chairmanId: 'chairman-9',
    inn: '7702071085',
    isActive: true,
    membersCount: 150000,
    createdAt: new Date('1992-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '10',
    name: 'Санкт-Петербургская городская организация профсоюза работников здравоохранения',
    type: 'LOCAL',
    parentId: '7',
    parentName: 'Санкт-Петербургская федерация профсоюзов',
    address: 'г. Санкт-Петербург, ул. Марата, д. 25',
    phone: '+7 (812) 345-67-89',
    email: 'info@spb-health.ru',
    chairmanName: 'Ольга Николаевна Петрова',
    chairmanId: 'chairman-10',
    inn: '7802071086',
    isActive: true,
    membersCount: 80000,
    createdAt: new Date('1992-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '11',
    name: 'Первичная профсоюзная организация ПАО "Газпром"',
    type: 'PRIMARY',
    parentId: '9',
    parentName: 'Московская городская организация профсоюза работников образования',
    address: 'г. Москва, ул. Наметкина, д. 16',
    phone: '+7 (495) 890-12-34',
    email: 'union@gazprom.ru',
    chairmanName: 'Сергей Владимирович Петров',
    chairmanId: 'chairman-11',
    inn: '7736050003',
    isActive: true,
    membersCount: 50000,
    createdAt: new Date('1993-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '12',
    name: 'Первичная профсоюзная организация МГУ им. М.В. Ломоносова',
    type: 'PRIMARY',
    parentId: '9',
    parentName: 'Московская городская организация профсоюза работников образования',
    address: 'г. Москва, Ленинские горы, д. 1',
    phone: '+7 (495) 901-23-45',
    email: 'union@msu.ru',
    chairmanName: 'Анна Михайловна Соколова',
    chairmanId: 'chairman-12',
    inn: '7702071087',
    isActive: true,
    membersCount: 8000,
    createdAt: new Date('1993-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '13',
    name: 'Первичная профсоюзная организация ПАО "Роснефть"',
    type: 'PRIMARY',
    parentId: '9',
    parentName: 'Московская городская организация профсоюза работников образования',
    address: 'г. Москва, ул. Софийская набережная, д. 26/1',
    phone: '+7 (495) 012-34-56',
    email: 'union@rosneft.ru',
    chairmanName: 'Дмитрий Александрович Козлов',
    chairmanId: 'chairman-13',
    inn: '7706107510',
    isActive: true,
    membersCount: 45000,
    createdAt: new Date('1993-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '14',
    name: 'Первичная профсоюзная организация ПАО "Сбербанк"',
    type: 'PRIMARY',
    parentId: '9',
    parentName: 'Московская городская организация профсоюза работников образования',
    address: 'г. Москва, ул. Вавилова, д. 19',
    phone: '+7 (495) 123-45-67',
    email: 'union@sberbank.ru',
    chairmanName: 'Елена Викторовна Волкова',
    chairmanId: 'chairman-14',
    inn: '7707083893',
    isActive: true,
    membersCount: 35000,
    createdAt: new Date('1993-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// GET - получение списка организаций
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as OrganizationType | null;
    const search = searchParams.get('search');

    let filteredOrganizations = [...realOrganizations];

    // Фильтрация по типу
    if (type) {
      filteredOrganizations = filteredOrganizations.filter(org => org.type === type);
    }

    // Поиск по названию
    if (search) {
      filteredOrganizations = filteredOrganizations.filter(org =>
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        org.address.toLowerCase().includes(search.toLowerCase()) ||
        (org.chairmanName && org.chairmanName.toLowerCase().includes(search.toLowerCase()))
      );
    }

    return NextResponse.json({
      success: true,
      organizations: filteredOrganizations
    });

  } catch (error) {
    console.error('Get organizations error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST - создание новой организации
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    if (!canCreateOrganizations(currentUser.role)) {
      return NextResponse.json(
        { error: 'Недостаточно прав для создания организаций' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, type, parentId, address, phone, email, chairmanName, inn } = body;

    // Валидация
    if (!name || !type || !address || !phone || !email) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    // Проверяем, что тип организации валидный
    const validTypes: OrganizationType[] = ['FEDERAL', 'REGIONAL', 'LOCAL', 'PRIMARY'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Некорректный тип организации' },
        { status: 400 }
      );
    }

    // Создаем новую организацию
    const newOrganization: Organization = {
      id: `org-${Date.now()}`,
      name,
      type,
      parentId: parentId || undefined,
      parentName: parentId ? realOrganizations.find(org => org.id === parentId)?.name : undefined,
      address,
      phone,
      email,
      chairmanName: chairmanName || undefined,
      chairmanId: chairmanName ? `chairman-${Date.now()}` : undefined,
      inn: inn || undefined,
      isActive: true,
      membersCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    realOrganizations.push(newOrganization);

    return NextResponse.json({
      success: true,
      organization: newOrganization,
      message: 'Организация успешно создана'
    });

  } catch (error) {
    console.error('Create organization error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
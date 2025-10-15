import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, canCreateOrganizations } from '@/lib/auth';
import { Organization, OrganizationType } from '@/types';

// Моковые данные для организаций
const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Центральный комитет профсоюза',
    type: 'FEDERAL',
    address: 'г. Москва, ул. Тверская, д. 1',
    phone: '+7 (495) 123-45-67',
    email: 'info@union.ru',
    chairmanName: 'Иван Петров',
    chairmanId: 'chairman-1',
    isActive: true,
    membersCount: 15000,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Региональная организация Москвы',
    type: 'REGIONAL',
    parentId: '1',
    parentName: 'Центральный комитет профсоюза',
    address: 'г. Москва, ул. Арбат, д. 10',
    phone: '+7 (495) 234-56-78',
    email: 'moscow@union.ru',
    chairmanName: 'Мария Сидорова',
    chairmanId: 'chairman-2',
    isActive: true,
    membersCount: 5000,
    createdAt: new Date('2020-02-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Местная организация Центрального округа',
    type: 'LOCAL',
    parentId: '2',
    parentName: 'Региональная организация Москвы',
    address: 'г. Москва, ул. Красная площадь, д. 1',
    phone: '+7 (495) 345-67-89',
    email: 'central@union.ru',
    chairmanName: 'Алексей Козлов',
    chairmanId: 'chairman-3',
    isActive: true,
    membersCount: 1000,
    createdAt: new Date('2020-03-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Первичная организация завода "Москва"',
    type: 'PRIMARY',
    parentId: '3',
    parentName: 'Местная организация Центрального округа',
    address: 'г. Москва, ул. Заводская, д. 5',
    phone: '+7 (495) 456-78-90',
    email: 'factory@union.ru',
    chairmanName: 'Елена Волкова',
    chairmanId: 'chairman-4',
    isActive: true,
    membersCount: 500,
    createdAt: new Date('2020-04-01'),
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

    let filteredOrganizations = [...mockOrganizations];

    // Фильтрация по типу
    if (type) {
      filteredOrganizations = filteredOrganizations.filter(org => org.type === type);
    }

    // Поиск по названию
    if (search) {
      filteredOrganizations = filteredOrganizations.filter(org =>
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        org.address.toLowerCase().includes(search.toLowerCase()) ||
        org.chairmanName.toLowerCase().includes(search.toLowerCase())
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
    const { name, type, parentId, address, phone, email, chairmanName } = body;

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
      parentName: parentId ? mockOrganizations.find(org => org.id === parentId)?.name : undefined,
      address,
      phone,
      email,
      chairmanName: chairmanName || undefined,
      chairmanId: chairmanName ? `chairman-${Date.now()}` : undefined,
      isActive: true,
      membersCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockOrganizations.push(newOrganization);

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

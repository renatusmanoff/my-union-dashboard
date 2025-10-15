import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, canCreateOrganizations } from '@/lib/auth';
import { Organization } from '@/types';

// Моковые данные (в реальности это будет база данных)
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

// GET - получение организации по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    const organization = mockOrganizations.find(org => org.id === params.id);

    if (!organization) {
      return NextResponse.json(
        { error: 'Организация не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      organization
    });

  } catch (error) {
    console.error('Get organization error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT - обновление организации
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Недостаточно прав для редактирования организаций' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, type, parentId, address, phone, email, chairmanName, isActive } = body;

    const organizationIndex = mockOrganizations.findIndex(org => org.id === params.id);

    if (organizationIndex === -1) {
      return NextResponse.json(
        { error: 'Организация не найдена' },
        { status: 404 }
      );
    }

    // Обновляем организацию
    const updatedOrganization: Organization = {
      ...mockOrganizations[organizationIndex],
      name: name || mockOrganizations[organizationIndex].name,
      type: type || mockOrganizations[organizationIndex].type,
      parentId: parentId !== undefined ? parentId : mockOrganizations[organizationIndex].parentId,
      parentName: parentId ? mockOrganizations.find(org => org.id === parentId)?.name : mockOrganizations[organizationIndex].parentName,
      address: address || mockOrganizations[organizationIndex].address,
      phone: phone || mockOrganizations[organizationIndex].phone,
      email: email || mockOrganizations[organizationIndex].email,
      chairmanName: chairmanName !== undefined ? chairmanName : mockOrganizations[organizationIndex].chairmanName,
      chairmanId: chairmanName ? mockOrganizations[organizationIndex].chairmanId : undefined,
      isActive: isActive !== undefined ? isActive : mockOrganizations[organizationIndex].isActive,
      updatedAt: new Date()
    };

    mockOrganizations[organizationIndex] = updatedOrganization;

    return NextResponse.json({
      success: true,
      organization: updatedOrganization,
      message: 'Организация успешно обновлена'
    });

  } catch (error) {
    console.error('Update organization error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - удаление организации
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Недостаточно прав для удаления организаций' },
        { status: 403 }
      );
    }

    const organizationIndex = mockOrganizations.findIndex(org => org.id === params.id);

    if (organizationIndex === -1) {
      return NextResponse.json(
        { error: 'Организация не найдена' },
        { status: 404 }
      );
    }

    // Проверяем, есть ли дочерние организации
    const hasChildren = mockOrganizations.some(org => org.parentId === params.id);
    if (hasChildren) {
      return NextResponse.json(
        { error: 'Нельзя удалить организацию, у которой есть дочерние организации' },
        { status: 400 }
      );
    }

    // Удаляем организацию
    const deletedOrganization = mockOrganizations[organizationIndex];
    mockOrganizations.splice(organizationIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Организация успешно удалена',
      organization: deletedOrganization
    });

  } catch (error) {
    console.error('Delete organization error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

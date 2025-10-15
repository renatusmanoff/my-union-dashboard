import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, canCreateOrganizations } from '@/lib/auth';
import { Organization } from '@/types';

// Реальные российские профсоюзы (в реальности это будет база данных)
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
    isActive: true,
    membersCount: 5000000,
    createdAt: new Date('1990-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Московская федерация профсоюзов',
    type: 'REGIONAL',
    parentId: '1',
    parentName: 'Федерация независимых профсоюзов России (ФНПР)',
    address: 'г. Москва, ул. Тверская, д. 22',
    phone: '+7 (495) 678-90-12',
    email: 'info@moscow-union.ru',
    chairmanName: 'Александр Петрович Семенов',
    chairmanId: 'chairman-3',
    isActive: true,
    membersCount: 2500000,
    createdAt: new Date('1991-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Первичная профсоюзная организация ПАО "Газпром"',
    type: 'PRIMARY',
    parentId: '3',
    parentName: 'Московская федерация профсоюзов',
    address: 'г. Москва, ул. Наметкина, д. 16',
    phone: '+7 (495) 890-12-34',
    email: 'union@gazprom.ru',
    chairmanName: 'Сергей Владимирович Петров',
    chairmanId: 'chairman-4',
    isActive: true,
    membersCount: 50000,
    createdAt: new Date('1993-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// GET - получение организации по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const organization = realOrganizations.find(org => org.id === id);

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
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const organizationIndex = realOrganizations.findIndex(org => org.id === id);

    if (organizationIndex === -1) {
      return NextResponse.json(
        { error: 'Организация не найдена' },
        { status: 404 }
      );
    }

    // Обновляем организацию
    const updatedOrganization: Organization = {
      ...realOrganizations[organizationIndex],
      name: name || realOrganizations[organizationIndex].name,
      type: type || realOrganizations[organizationIndex].type,
      parentId: parentId !== undefined ? parentId : realOrganizations[organizationIndex].parentId,
      parentName: parentId ? realOrganizations.find(org => org.id === parentId)?.name : realOrganizations[organizationIndex].parentName,
      address: address || realOrganizations[organizationIndex].address,
      phone: phone || realOrganizations[organizationIndex].phone,
      email: email || realOrganizations[organizationIndex].email,
      chairmanName: chairmanName !== undefined ? chairmanName : realOrganizations[organizationIndex].chairmanName,
      chairmanId: chairmanName ? realOrganizations[organizationIndex].chairmanId : undefined,
      isActive: isActive !== undefined ? isActive : realOrganizations[organizationIndex].isActive,
      updatedAt: new Date()
    };

    realOrganizations[organizationIndex] = updatedOrganization;

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
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const organizationIndex = realOrganizations.findIndex(org => org.id === id);

    if (organizationIndex === -1) {
      return NextResponse.json(
        { error: 'Организация не найдена' },
        { status: 404 }
      );
    }

    // Проверяем, есть ли дочерние организации
    const hasChildren = realOrganizations.some(org => org.parentId === id);
    if (hasChildren) {
      return NextResponse.json(
        { error: 'Нельзя удалить организацию, у которой есть дочерние организации' },
        { status: 400 }
      );
    }

    // Удаляем организацию
    const deletedOrganization = realOrganizations[organizationIndex];
    realOrganizations.splice(organizationIndex, 1);

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

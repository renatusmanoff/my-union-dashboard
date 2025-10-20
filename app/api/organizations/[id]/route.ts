import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, canCreateOrganizations } from '@/lib/auth';
import { prisma } from '@/lib/database';

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
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          where: {
            role: {
              in: ['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
            }
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            role: true
          }
        }
      }
    });

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
    const { name, type, parentId, address, phone, email, chairmanName, isActive, industry } = body;

    const { id } = await params;
    
    // Проверяем, существует ли организация
    const existingOrganization = await prisma.organization.findUnique({
      where: { id }
    });

    if (!existingOrganization) {
      return NextResponse.json(
        { error: 'Организация не найдена' },
        { status: 404 }
      );
    }

    // Обновляем организацию
    const updateData: any = {
      name: name || existingOrganization.name,
      type: type || existingOrganization.type,
      address: address || existingOrganization.address,
      phone: phone || existingOrganization.phone,
      email: email || existingOrganization.email,
      chairmanName: chairmanName !== undefined ? chairmanName : existingOrganization.chairmanName,
      isActive: isActive !== undefined ? isActive : existingOrganization.isActive,
      industry: industry || existingOrganization.industry
    };

    // Только добавляем parentId если он явно передан
    if (parentId !== undefined) {
      updateData.parentId = parentId || null;
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: updateData,
      include: {
        users: {
          where: {
            role: {
              in: ['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
            }
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            role: true
          }
        }
      }
    });

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
    
    // Проверяем, существует ли организация
    const existingOrganization = await prisma.organization.findUnique({
      where: { id }
    });

    if (!existingOrganization) {
      return NextResponse.json(
        { error: 'Организация не найдена' },
        { status: 404 }
      );
    }

    // Проверяем, есть ли дочерние организации
    const hasChildren = await prisma.organization.count({
      where: { parentId: id }
    });
    
    if (hasChildren > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить организацию, у которой есть дочерние организации' },
        { status: 400 }
      );
    }

    // Проверяем, есть ли пользователи в организации
    const hasUsers = await prisma.user.count({
      where: { organizationId: id }
    });
    
    if (hasUsers > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить организацию, в которой есть пользователи' },
        { status: 400 }
      );
    }

    // Удаляем организацию
    const deletedOrganization = await prisma.organization.delete({
      where: { id }
    });

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
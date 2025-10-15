import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { generateApplicationPDF } from '@/lib/pdf-generator';

// GET - получение заявлений (для администраторов)
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
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');

    // Строим фильтры для запроса
    const where: any = {};

    // Фильтрация по организации (если пользователь не супер-админ)
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.organizationId) {
      where.organizationId = currentUser.organizationId;
    } else if (organizationId) {
      where.organizationId = organizationId;
    }

    // Фильтрация по статусу
    if (status) {
      where.status = status;
    }

    const applications = await prisma.membershipApplication.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
            industry: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      applications
    });

  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST - создание нового заявления
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      gender,
      education,
      specialties,
      positions,
      address,
      phone,
      additionalPhone,
      email,
      children,
      hobbies,
      organizationId,
      applicationDate
    } = body;

    // Валидация обязательных полей
    if (!firstName || !lastName || !dateOfBirth || !gender || !education || 
        !address || !phone || !email || !organizationId) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    // Проверяем, что организация существует
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Организация не найдена' },
        { status: 400 }
      );
    }

    // Создаем новое заявление
    const newApplication = await prisma.membershipApplication.create({
      data: {
        firstName,
        lastName,
        middleName: middleName || null,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        education,
        specialties: specialties || [],
        positions: positions || [],
        addressIndex: address.index || '',
        addressRegion: address.region || '',
        addressMunicipality: address.municipality || '',
        addressLocality: address.locality || '',
        addressStreet: address.street || '',
        addressHouse: address.house || '',
        addressApartment: address.apartment || null,
        phone,
        additionalPhone: additionalPhone || null,
        email,
        children: children || [],
        hobbies: hobbies || [],
        organizationId,
        applicationDate: new Date(applicationDate)
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
            industry: true
          }
        }
      }
    });

    // Генерация PDF заявления
    try {
      const pdfUrl = await generateApplicationPDF(newApplication);
      
      // Обновляем заявление с PDF URL
      const updatedApplication = await prisma.membershipApplication.update({
        where: { id: newApplication.id },
        data: { pdfUrl }
      });
      
      return NextResponse.json({
        success: true,
        application: updatedApplication,
        message: 'Заявление успешно подано'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Возвращаем заявление без PDF
      return NextResponse.json({
        success: true,
        application: newApplication,
        message: 'Заявление успешно подано (PDF будет сгенерирован позже)'
      });
    }

  } catch (error) {
    console.error('Create application error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
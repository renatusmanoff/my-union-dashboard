import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { generateMembershipDocuments } from '@/lib/pdf-generator';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      firstName,
      lastName,
      middleName,
      gender,
      dateOfBirth,
      phone,
      organizationId,
      address,
      signLater = false,
      userId = null
    } = body;

    // Валидация обязательных полей
    if (!firstName || !lastName || !gender || !dateOfBirth || !phone || !organizationId || !address) {
      return NextResponse.json(
        { error: "Все обязательные поля должны быть заполнены" },
        { status: 400 }
      );
    }

    // Исправляем формат даты
    let parsedDateOfBirth;
    try {
      // Если дата в формате DD.MM.YYYY, конвертируем в ISO
      if (typeof dateOfBirth === 'string' && dateOfBirth.includes('.')) {
        const [day, month, year] = dateOfBirth.split('.');
        parsedDateOfBirth = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      } else {
        parsedDateOfBirth = new Date(dateOfBirth);
      }
      
      if (isNaN(parsedDateOfBirth.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch {
      return NextResponse.json(
        { error: "Неверный формат даты рождения" },
        { status: 400 }
      );
    }

    // Пытаемся получить текущего пользователя (может быть null для публичной регистрации)
    const currentUser = await getCurrentUser();

    // Получаем организацию
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Организация не найдена" },
        { status: 404 }
      );
    }

    // Получаем председателя организации
    const chairman = await prisma.user.findFirst({
      where: {
        organizationId: organization.id,
        role: {
          in: ['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
        }
      }
    });

    // Создаем заявление
    const application = await prisma.membershipApplication.create({
      data: {
        firstName,
        lastName,
        middleName: middleName || undefined,
        gender,
        dateOfBirth: parsedDateOfBirth,
        phone,
        address: JSON.stringify(address),
        organizationId,
        status: 'PENDING',
        signLater,
        userId: currentUser?.id || userId
      },
      include: {
        organization: true
      }
    });

    // Генерируем PDF документы
    const documents = await generateMembershipDocuments({
      application: {
        ...application,
        middleName: application.middleName || undefined
      },
      organization,
      chairman
    });

    // Сохраняем документы в БД
    const savedDocuments = await Promise.all(
      documents.map(doc => 
        prisma.membershipDocument.create({
          data: {
            applicationId: application.id,
            type: doc.type,
            fileName: doc.fileName,
            filePath: doc.filePath,
            status: 'NOT_SIGNED',
            signedAt: null
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      application: {
        ...application,
        documents: savedDocuments
      },
      redirectUrl: currentUser ? `/dashboard/member-documents` : `/register/documents?id=${application.id}`,
      message: "Заявление создано! Теперь вы можете скачать и подписать документы."
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: "Ошибка при регистрации",
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Внутренняя ошибка сервера'
      },
      { status: 500 }
    );
  }
}

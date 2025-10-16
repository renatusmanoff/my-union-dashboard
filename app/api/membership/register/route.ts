import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { generateMembershipDocuments } from '@/lib/pdf-generator';

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
        middleName: middleName || '',
        gender,
        dateOfBirth: new Date(dateOfBirth),
        phone,
        address: JSON.stringify(address),
        organizationId,
        status: 'PENDING',
        signLater,
        userId
      },
      include: {
        organization: true
      }
    });

    // Генерируем PDF документы
    const documents = await generateMembershipDocuments({
      application,
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
            status: signLater ? 'NOT_SIGNED' : 'SIGNED',
            signedAt: signLater ? null : new Date()
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
      message: signLater 
        ? "Заявление создано. Документы можно подписать позже в личном кабинете."
        : "Заявление успешно подано с подписанными документами."
    });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { 
        error: "Ошибка при регистрации",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

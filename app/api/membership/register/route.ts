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

    // Временно отключаем генерацию PDF для продакшена
    // TODO: Настроить Puppeteer для Vercel
    const documents: any[] = [];
    const savedDocuments: any[] = [];

    return NextResponse.json({
      success: true,
      application: {
        ...application,
        documents: savedDocuments
      },
      message: "Заявление успешно подано. PDF документы будут сгенерированы позже."
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

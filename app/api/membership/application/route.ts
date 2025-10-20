import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { generateMembershipDocuments } from "@/lib/pdf-generator";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Пользователь не авторизован" },
        { status: 401 }
      );
    }

    // Определяем, какие заявления показывать в зависимости от роли
    let whereClause = {};
    
    if (currentUser.role === 'PRIMARY_MEMBER') {
      // Члены профсоюза видят только свои заявления
      whereClause = { 
        OR: [
          { userId: currentUser.id },
          { userId: null, organizationId: currentUser.organizationId } // Заявления без привязки к пользователю в той же организации
        ]
      };
    } else if (['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN'].includes(currentUser.role)) {
      // Председатели видят заявления своей организации
      whereClause = { organizationId: currentUser.organizationId };
    } else if (currentUser.role === 'SUPER_ADMIN') {
      // Супер-администратор видит все заявления
      whereClause = {};
    } else {
      // Для других ролей показываем только свои заявления
      whereClause = { userId: currentUser.id };
    }

    // Получаем заявления
    const applications = await prisma.membershipApplication.findMany({
      where: whereClause,
      include: {
        organization: true,
        documents: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            middleName: true
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
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Регистрация не требует авторизации
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
      signLater = false
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
        userId: null // Пока без привязки к пользователю
      },
      include: {
        organization: true
      }
    });

    // Получаем председателя организации
    const chairman = await prisma.user.findFirst({
      where: {
        organizationId: organization.id,
        role: {
          in: ['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN']
        }
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
      { error: "Ошибка при регистрации" },
      { status: 500 }
    );
  }
}

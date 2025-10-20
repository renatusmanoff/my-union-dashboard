import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { sendDocumentSigningInvitation } from '@/lib/email';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

// GET - список документов
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    const userId = verified.payload.userId as string;

    // Получаем организацию пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization' }, { status: 400 });
    }

    // Получаем документы организации
    const documents = await prisma.workflowDocument.findMany({
      where: {
        organizationId: user.organizationId
      },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        organization: {
          select: { id: true, name: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        },
        signatures: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - создание документа
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    const userId = verified.payload.userId as string;

    const body = await req.json();
    const {
      title,
      type,
      meetingDate,
      meetingLocation,
      documentDate,
      questionsList,
      decisions,
      votingData,
      extractedDecisions,
      participantIds,
      uploadedFilePath
    } = body;

    // Получаем пользователя и его организацию
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization' }, { status: 400 });
    }

    // Создаем документ
    const document = await prisma.workflowDocument.create({
      data: {
        title,
        type,
        meetingDate: meetingDate ? new Date(meetingDate) : undefined,
        meetingLocation,
        documentDate: documentDate ? new Date(documentDate) : new Date(),
        questionsList: questionsList ? JSON.stringify(questionsList) : null,
        decisions: decisions ? JSON.stringify(decisions) : null,
        votingData: votingData ? JSON.stringify(votingData) : null,
        extractedDecisions: extractedDecisions ? JSON.stringify(extractedDecisions) : null,
        uploadedFilePath,
        creatorId: userId,
        organizationId: user.organizationId,
        status: 'DRAFT'
      }
    });

    // Добавляем участников (включая создателя как подписанного)
    if (participantIds && participantIds.length > 0) {
      // Добавляем создателя как SIGNED
      await prisma.documentParticipant.create({
        data: {
          userId,
          documentId: document.id,
          status: 'SIGNED'
        }
      });

      // Добавляем других участников как PENDING
      const otherParticipants = participantIds.filter((id: string) => id !== userId);
      
      for (const participantId of otherParticipants) {
        try {
          await prisma.documentParticipant.create({
            data: {
              userId: participantId,
              documentId: document.id,
              status: 'PENDING'
            }
          });
        } catch (e) {
          // Пропускаем дубликаты
        }
      }

      // Добавляем создателя в подписи как подписавшего
      await prisma.documentSignature.create({
        data: {
          userId,
          documentId: document.id,
          signedAt: new Date()
        }
      });

      // Отправляем приглашения на подпись остальным участникам
      const participantsData = await prisma.user.findMany({
        where: {
          id: { in: otherParticipants }
        }
      });

      const documentTypeNames: Record<string, string> = {
        AGENDA: 'Повестка дня',
        PROTOCOL_MEETING: 'Протокол заседания',
        EXTRACT_FROM_PROTOCOL: 'Выписка из протокола',
        RESOLUTION: 'Постановление'
      };

      const signingUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/dashboard/document-signing/${document.id}`;

      for (const participant of participantsData) {
        await sendDocumentSigningInvitation({
          participantEmail: participant.email,
          participantName: `${participant.firstName} ${participant.lastName}`,
          documentTitle: title,
          documentType: documentTypeNames[type] || type,
          creatorName: `${user.firstName} ${user.lastName}`,
          organizationName: user.organization?.name || 'Unknown',
          signingUrl
        });
      }
    }

    return NextResponse.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Create document error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

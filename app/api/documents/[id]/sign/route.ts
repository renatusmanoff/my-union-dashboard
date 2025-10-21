import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    const userId = verified.payload.userId as string;

    const body = await req.json();
    const { approved = true } = body;

    const { id } = await params;
    const documentId = id;

    // Проверяем, что пользователь является участником документа
    const participant = await prisma.documentParticipant.findUnique({
      where: {
        userId_documentId: {
          userId,
          documentId
        }
      }
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Not a participant' },
        { status: 403 }
      );
    }

    if (participant.status === 'SIGNED' || participant.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'Already signed or rejected' },
        { status: 400 }
      );
    }

    // Обновляем статус участника
    const newStatus = approved ? 'SIGNED' : 'REJECTED';
    
    await prisma.documentParticipant.update({
      where: {
        userId_documentId: {
          userId,
          documentId
        }
      },
      data: {
        status: newStatus
      }
    });

    // Добавляем подпись если одобрено
    if (approved) {
      await prisma.documentSignature.create({
        data: {
          userId,
          documentId,
          signedAt: new Date()
        }
      });
    }

    // Получаем обновленный документ
    const document = await prisma.workflowDocument.findUnique({
      where: { id: documentId },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        },
        signatures: true
      }
    });

    // Проверяем, все ли подписали
    const allParticipants = document?.participants || [];
    const allSigned = allParticipants.every(p => p.status === 'SIGNED');

    // Если все подписали, обновляем статус документа
    if (allSigned && allParticipants.length > 0) {
      await prisma.workflowDocument.update({
        where: { id: documentId },
        data: { status: 'COMPLETED' }
      });
    }

    return NextResponse.json({
      success: true,
      message: approved ? 'Document signed' : 'Document rejected',
      document
    });
  } catch (error) {
    console.error('Sign document error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

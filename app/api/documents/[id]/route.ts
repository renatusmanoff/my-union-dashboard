import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function GET(
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

    const { id } = await params;
    const documentId = id;

    // Получаем документ
    const document = await prisma.workflowDocument.findUnique({
      where: { id: documentId },
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
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Проверяем, что пользователь является создателем или участником
    const isCreator = document.creatorId === userId;
    const isParticipant = document.participants.some(p => p.userId === userId);

    if (!isCreator && !isParticipant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Get document error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

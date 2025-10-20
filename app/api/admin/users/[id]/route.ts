import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// DELETE - удаление пользователя с каскадным удалением всех связанных данных
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    // Проверяем права доступа (только супер-админ или председатель организации)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
    const isChairman = ['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN'].includes(currentUser.role);

    if (!isSuperAdmin && !isChairman) {
      return NextResponse.json(
        { error: 'Недостаточно прав для удаления пользователей' },
        { status: 403 }
      );
    }

    const { id: userId } = await params;

    // Проверяем, существует ли пользователь
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        membershipApplications: {
          include: {
            documents: true
          }
        }
      }
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Если не супер-админ, проверяем, что пользователь из той же организации
    if (!isSuperAdmin && userToDelete.organizationId !== currentUser.organizationId) {
      return NextResponse.json(
        { error: 'Можно удалять только пользователей своей организации' },
        { status: 403 }
      );
    }

    // Собираем все файлы документов для удаления
    const filesToDelete: string[] = [];
    
    // Добавляем файлы из заявлений на членство
    for (const application of userToDelete.membershipApplications) {
      for (const document of application.documents) {
        if (document.filePath) {
          const fullPath = path.join(process.cwd(), 'public', document.filePath);
          if (fs.existsSync(fullPath)) {
            filesToDelete.push(fullPath);
          }
        }
      }
    }

    // Удаляем пользователя (каскадное удаление автоматически удалит связанные записи)
    await prisma.user.delete({
      where: { id: userId }
    });

    // Удаляем физические файлы документов
    for (const filePath of filesToDelete) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error(`Ошибка при удалении файла ${filePath}:`, error);
        // Не прерываем процесс, если не удалось удалить файл
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Пользователь и все связанные данные успешно удалены',
      deletedFiles: filesToDelete.length
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при удалении пользователя',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - получение информации о пользователе
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const { id: userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        membershipApplications: {
          include: {
            documents: {
              select: {
                id: true,
                type: true,
                fileName: true,
                status: true,
                createdAt: true
              }
            }
          }
        },
        _count: {
          select: {
            createdNews: true,
            createdTasks: true,
            createdDocuments: true,
            sentMessages: true,
            receivedMessages: true,
            createdProjects: true,
            createdEvents: true,
            createdKnowledge: true,
            createdReports: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при получении информации о пользователе',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

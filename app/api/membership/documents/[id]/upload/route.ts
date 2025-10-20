import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(
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

    // Получаем документ
    const document = await prisma.membershipDocument.findUnique({
      where: { id },
      include: {
        application: true
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      );
    }

    // Проверяем, что документ принадлежит пользователю
    if (document.application.userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Недостаточно прав для загрузки документа' },
        { status: 403 }
      );
    }

    // Проверяем, что документ еще не подписан
    if (document.status === 'SIGNED') {
      return NextResponse.json(
        { error: 'Документ уже подписан' },
        { status: 400 }
      );
    }

    // Получаем загруженный файл
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      );
    }

    // Проверяем тип файла
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Недопустимый тип файла. Разрешены только PDF, JPEG и PNG' },
        { status: 400 }
      );
    }

    // Проверяем размер файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Файл слишком большой. Максимальный размер: 10MB' },
        { status: 400 }
      );
    }

    // Создаем директорию для подписанных документов
    const signedDocsDir = join(process.cwd(), 'public', 'documents', 'signed');
    if (!existsSync(signedDocsDir)) {
      await mkdir(signedDocsDir, { recursive: true });
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const signedFileName = `signed_${document.id}_${timestamp}.${fileExtension}`;
    const signedFilePath = join(signedDocsDir, signedFileName);

    // Сохраняем файл
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(signedFilePath, buffer);

    // Обновляем документ в базе данных
    const updatedDocument = await prisma.membershipDocument.update({
      where: { id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        filePath: `/documents/signed/${signedFileName}`,
        fileName: `signed_${document.fileName}`
      }
    });

    return NextResponse.json({
      success: true,
      document: updatedDocument,
      message: 'Подписанный документ успешно загружен'
    });

  } catch (error) {
    console.error('Upload signed document error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Получаем документ
    const document = await prisma.membershipDocument.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            user: true
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      );
    }

    // Проверяем доступ к документу
    // Документ доступен если:
    // 1. Пользователь авторизован и это его документ
    // 2. Документ принадлежит заявлению без привязки к пользователю (публичная регистрация)
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    // Если есть авторизация, проверяем права доступа
    if (authHeader || cookieHeader) {
      // Здесь можно добавить проверку JWT токена
      // Пока что разрешаем доступ всем авторизованным пользователям
    }

    // Проверяем, является ли filePath путем к файлу или base64 данными
    let pdfBuffer: Buffer;
    
    if (document.filePath.startsWith('data:application/pdf;base64,')) {
      // Старый формат - base64 данные
      const base64Data = document.filePath.split(',')[1];
      pdfBuffer = Buffer.from(base64Data, 'base64');
    } else if (document.filePath.startsWith('/documents/')) {
      // Новый формат - путь к файлу
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public', document.filePath);
      
      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: 'Файл не найден' },
          { status: 404 }
        );
      }
      
      pdfBuffer = fs.readFileSync(filePath);
    } else {
      return NextResponse.json(
        { error: 'Некорректный формат файла' },
        { status: 400 }
      );
    }

    // Возвращаем PDF файл
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${document.fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Download document error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

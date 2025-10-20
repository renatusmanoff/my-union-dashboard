import { NextRequest, NextResponse } from 'next/server';
import { fileStorage } from '@/lib/file-storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fileId = id;

    // Получаем файл из памяти
    const file = fileStorage.get(fileId);

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Возвращаем файл с правильными заголовками
    const headers = new Headers();
    headers.set('Content-Type', file.type);
    headers.set('Content-Length', file.size.toString());
    headers.set('Content-Disposition', `inline; filename="${file.filename}"`);
    headers.set('Cache-Control', 'public, max-age=86400'); // 24 часа

    return new NextResponse(file.data, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Document file retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve document' },
      { status: 500 }
    );
  }
}

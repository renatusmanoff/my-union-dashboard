import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { v2 as cloudinary } from 'cloudinary';
import { fileStorage } from '@/lib/file-storage';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Инициализируем Cloudinary если есть данные
// Поддерживаем оба формата: отдельные переменные и CLOUDINARY_URL
if (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL) {
  try {
    if (process.env.CLOUDINARY_URL) {
      // Формат: cloudinary://api_key:api_secret@cloud_name
      cloudinary.config({
        secure: true,
        url: process.env.CLOUDINARY_URL
      });
      console.log('✅ Cloudinary configured via CLOUDINARY_URL');
    } else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      // Формат: отдельные переменные
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
      });
      console.log('✅ Cloudinary configured via separate environment variables');
    }
  } catch (error) {
    console.warn('⚠️ Cloudinary configuration error:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const verified = await jwtVerify(token, JWT_SECRET);

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Проверяем размер файла
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Проверяем тип файла
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, TXT' },
        { status: 400 }
      );
    }

    // Генерируем уникальный ID для файла
    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const filename = file.name;
    
    let publicUrl = '';
    let uploadSuccess = false;

    // Пробуем загрузить в Cloudinary если он доступен
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Загружаем в Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              public_id: `documents/${fileId}`,
              folder: 'myunion/documents',
              access_control: [{ access_type: 'token' }]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(buffer);
        });

        const uploadResult = result as { secure_url: string };
        publicUrl = uploadResult.secure_url;
        uploadSuccess = true;

        console.log('☁️ [CLOUDINARY] File uploaded:', publicUrl);
      } catch (error) {
        console.warn('⚠️ Cloudinary upload failed, falling back to local storage:', error);
      }
    }

    // Если Cloudinary не доступен, используем local storage (development или fallback)
    if (!uploadSuccess) {
      if (ENVIRONMENT === 'production') {
        console.warn('⚠️ [PRODUCTION] Cloudinary not configured, using in-memory storage (temporary)');
      }

      try {
        if (ENVIRONMENT === 'production') {
          // В production используем in-memory storage (временное хранилище)
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          fileStorage.set(fileId, {
            data: buffer,
            filename: filename,
            type: file.type,
            size: file.size
          });

          publicUrl = `/api/document-file/${fileId}`;
          console.log('📁 [MEMORY] File stored in memory:', publicUrl);
        } else {
          // В development сохраняем на диск
          const { writeFile, mkdir } = await import('fs/promises');
          const { join } = await import('path');

          const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'documents');

          try {
            await mkdir(UPLOAD_DIR, { recursive: true });
          } catch (error) {
            // Директория может уже существовать
          }

          const filepath = join(UPLOAD_DIR, fileId);
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          await writeFile(filepath, buffer);

          publicUrl = `/uploads/documents/${fileId}`;
          console.log('✅ [LOCAL] File uploaded:', publicUrl);
        }
      } catch (error) {
        console.error('File storage error:', error);
        return NextResponse.json(
          { error: 'File upload failed' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      filePath: publicUrl,
      filename: file.name,
      size: file.size,
      fileId: fileId,
      storage: uploadSuccess ? 'cloudinary' : (ENVIRONMENT === 'production' ? 'memory' : 'local')
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
  }
}

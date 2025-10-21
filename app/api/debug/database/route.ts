import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const start = Date.now();
    
    // Простой запрос к базе данных
    const userCount = await prisma.user.count();
    const orgCount = await prisma.organization.count();
    
    const duration = Date.now() - start;
    
    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        responseTime: `${duration}ms`,
        userCount,
        orgCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      database: {
        connected: false
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

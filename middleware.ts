import { NextRequest, NextResponse } from 'next/server';

// Маршруты, которые требуют авторизации
const protectedRoutes = [
  '/dashboard',
  '/api/admin',
  '/api/membership'
];

// Маршруты, которые доступны только неавторизованным пользователям
const publicOnlyRoutes = [
  '/login',
  '/register'
];

// Простая функция для проверки JWT токена
function isValidJWT(token: string): boolean {
  try {
    // Простая проверка структуры JWT
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // Декодируем payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Проверяем, не истек ли токен
    const currentTime = Date.now() / 1000;
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Получаем токен из cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // Проверяем, является ли маршрут защищенным
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Проверяем, является ли маршрут только для неавторизованных
  const isPublicOnlyRoute = publicOnlyRoutes.some(route => 
    pathname === route
  );
  
  // Если маршрут защищенный
  if (isProtectedRoute) {
    if (!token || !isValidJWT(token)) {
      // Перенаправляем на страницу входа
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Если маршрут только для неавторизованных и пользователь авторизован
  if (isPublicOnlyRoute && token && isValidJWT(token)) {
    // Перенаправляем на дашборд
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

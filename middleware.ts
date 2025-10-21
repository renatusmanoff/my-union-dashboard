import { NextRequest, NextResponse } from 'next/server';

// Маршруты, которые требуют авторизации
const protectedRoutes = [
  '/dashboard',
  '/api/admin',
  '/api/membership/application'
];

// Публичные API маршруты (не требуют авторизации)
const publicApiRoutes = [
  '/api/membership/register',
  '/api/organizations/public',
  '/api/organizations/search-inn'
];

// Публичные API маршруты с параметрами (не требуют авторизации)
const publicApiRoutesWithParams = [
  '/api/membership/application/', // Allows access to /api/membership/application/[id]
  '/api/membership/document/' // Allows access to /api/membership/document/[id]/download
];

// Маршруты, которые доступны только неавторизованным пользователям
const publicOnlyRoutes = [
  '/login',
  '/register'
];

// Простая функция для проверки JWT токена (больше не используется)
// function isValidJWT(token: string): boolean {
//   try {
//     // Простая проверка структуры JWT
//     const parts = token.split('.');
//     if (parts.length !== 3) {
//       return false;
//     }
//     
//     // Декодируем payload
//     const payload = JSON.parse(atob(parts[1]));
//     
//     // Проверяем, не истек ли токен
//     const currentTime = Date.now() / 1000;
//     if (payload.exp && payload.exp < currentTime) {
//       return false;
//     }
//     
//     return true;
//   } catch (error) {
//     return false;
//   }
// }

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Получаем sessionId из cookies
  const sessionId = request.cookies.get('session-id')?.value;
  
  // Проверяем, является ли маршрут публичным API
  const isPublicApiRoute = publicApiRoutes.some(route => 
    pathname === route
  );
  
  // Проверяем, является ли маршрут публичным API с параметрами
  const isPublicApiRouteWithParams = publicApiRoutesWithParams.some(route => 
    pathname.startsWith(route)
  );
  
  // Если это публичный API маршрут, пропускаем без проверки авторизации
  if (isPublicApiRoute || isPublicApiRouteWithParams) {
    return NextResponse.next();
  }
  
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
    if (!sessionId) {
      // Перенаправляем на страницу входа
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Если маршрут только для неавторизованных и пользователь авторизован
  if (isPublicOnlyRoute && sessionId) {
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

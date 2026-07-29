// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('mitoonito_session')?.value;
  const { pathname } = request.nextUrl;

  // اگر توکن ندارد و می‌خواهد به مسیرهای خصوصی برود
  if (!token && pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // اگر توکن دارد و می‌خواهد به لاگین برود
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/app/today', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/login', '/register'],
};

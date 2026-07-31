// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("mitoonito_session")?.value;
  const { pathname } = request.nextUrl;

  if (!token && pathname.startsWith("/app")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (token && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/app/today";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login", "/register"],
};

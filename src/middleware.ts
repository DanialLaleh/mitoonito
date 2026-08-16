import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

const protectedRoutes = [
  "/dashboard",
  "/today",
  "/areas",
  "/goals",
  "/tasks",
  "/habits",
  "/reminders",
  "/finances",
  "/settings",
];
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) => path.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  const token = request.cookies.get("session")?.value;
  let isLoggedIn = false;

  if (token) {
    try {
      await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
      isLoggedIn = true;
    } catch {
      isLoggedIn = false;
    }
  }

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

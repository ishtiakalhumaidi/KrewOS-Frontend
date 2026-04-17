// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AuthRoutes = ["/login", "/register", "/forgot-password"];
const ProtectedRoutes = ["/dashboard", "/super-admin", "/admin", "/member"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // 1. If user is logged in and tries to access Auth routes (Login/Register), redirect them to dashboard
  if (accessToken && AuthRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. If user is NOT logged in and tries to access Protected routes, redirect to Login
  const isProtectedRoute = ProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!accessToken && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/dashboard/:path*",
    "/super-admin/:path*",
    "/admin/:path*",
    "/member/:path*",
  ],
};
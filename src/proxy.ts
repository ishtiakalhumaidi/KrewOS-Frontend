/* eslint-disable @typescript-eslint/no-explicit-any */
// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

const AuthRoutes = ["/login", "/register", "/forgot-password"];
const ProtectedRoutes = ["/dashboard", "/super-admin", "/admin", "/member"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  let decodedToken: any = null;
  let isValidToken = false;

  // 1. Verify the token is actually valid and not expired
  if (accessToken) {
    try {
      decodedToken = jwtDecode(accessToken);
      if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
        isValidToken = true;
      }
    } catch (error) {
      isValidToken = false;
    }
  }

  // 2. Self-Healing: If token is bad, delete the cookie and force login
  if (!isValidToken && accessToken) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("accessToken");
    return response;
  }

  // 3. If user is logged in, prevent them from seeing Auth routes OR handle the base /dashboard route
  if (isValidToken && (AuthRoutes.includes(pathname) || pathname === "/dashboard")) {
    const role = decodedToken?.role;
    let redirectUrl = "/dashboard"; // fallback

    // Perform the role redirect perfectly on the server edge!
    if (role === "SUPER_ADMIN") redirectUrl = "/super-admin";
    else if (role === "ADMIN" || role === "OWNER") redirectUrl = "/admin";
    else if (role === "MEMBER") redirectUrl = "/member";

    // Prevent redirecting to the exact same URL if we are already there
    if (pathname !== redirectUrl) {
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // 4. If user is NOT logged in and tries to access Protected routes
  const isProtectedRoute = ProtectedRoutes.some((route) => pathname.startsWith(route));
  if (!isValidToken && isProtectedRoute) {
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
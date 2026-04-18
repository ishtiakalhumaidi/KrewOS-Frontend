/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute } from "./lib/authUtils";

// 1. Edge-compatible token refresh function using native fetch
async function refreshTokenMiddleware(refreshToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
    });
    return res.ok;
  } catch (error) {
    console.error("Error refreshing token in middleware:", error);
    return false;
  }
}

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const pathWithQuery = `${pathname}${request.nextUrl.search}`;
    
    // 👉 Grab ALL necessary cookies
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const betterAuthToken = request.cookies.get("better-auth.session_token")?.value;

    let decodedToken: any = null;
    let isValidAccessToken = false;
    let userRole: string | null = null;
    let isExpiringSoon = false;

    // 👉 SECURITY CHECK: Ensure betterAuthToken exists AND isn't a fake "null" string
    const isBetterAuthValid = 
      !!betterAuthToken && 
      betterAuthToken !== "null" && 
      betterAuthToken !== "j%3Anull" && 
      betterAuthToken !== "j:null";

    // 2. Decode the token ONLY if BOTH the access token and better-auth session are valid
    if (accessToken && isBetterAuthValid) {
      try {
        decodedToken = jwtDecode(accessToken);
        const expTime = decodedToken.exp * 1000;
        
        if (expTime > Date.now()) {
          isValidAccessToken = true;
          userRole = decodedToken.role;
          
          // Check if token expires in less than 5 minutes (300 seconds)
          const remainingSeconds = (expTime - Date.now()) / 1000;
          isExpiringSoon = remainingSeconds <= 300;
        }
      } catch (error) {
        isValidAccessToken = false;
      }
    }

    const routeOwner = getRouteOwner(pathname);
    const isAuth = isAuthRoute(pathname);

    // Unify OWNER and ADMIN because they share the /admin dashboard in Krewos
    const unifiedRole = userRole === "OWNER" ? "ADMIN" : userRole;

    // 3. Proactively refresh token if needed
    if (isValidAccessToken && refreshToken && isExpiringSoon) {
      const requestHeaders = new Headers(request.headers);
      const response = NextResponse.next({ request: { headers: requestHeaders } });

      const refreshed = await refreshTokenMiddleware(refreshToken);
      if (refreshed) {
        requestHeaders.set("x-token-refreshed", "1");
      }

      return NextResponse.next({
        request: { headers: requestHeaders },
        headers: response.headers,
      });
    }

    // Rule 1: Logged-in users should not access auth pages
    if (isAuth && isValidAccessToken && pathname !== "/reset-password") {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as string), request.url)
      );
    }

    // Rule 2: Handle explicit /dashboard redirect
    if (pathname === "/dashboard" && isValidAccessToken) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as string), request.url)
      );
    }

    // Rule 3: Public routes -> allow
    if (routeOwner === null && !isAuth) {
      return NextResponse.next();
    }

    // Rule 4: User is Not logged in (or better-auth is null) but trying to access a protected route -> login
    if (!isValidAccessToken && routeOwner !== null) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathWithQuery);
      
      // Self-heal: clear ALL dead cookies so they don't get stuck in a loop
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      response.cookies.delete("better-auth.session_token");
      return response;
    }

    // Rule 5: User trying to visit role-based protected route but doesn't have required role
    if (routeOwner !== null && unifiedRole !== null) {
      if (routeOwner !== unifiedRole) {
        return NextResponse.redirect(
          new URL(getDefaultDashboardRoute(userRole as string), request.url)
        );
      }
    }

    return NextResponse.next();

  } catch (error) {
    console.error("Error in proxy middleware:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
  ],
};
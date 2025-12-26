import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware for server-side authentication.
 * Runs before every matched request to protect routes at the edge.
 */

// Routes that don't require authentication
const PUBLIC_PATHS = ["/", "/login"];

// Routes that require authentication
const PROTECTED_PATH_PREFIXES = ["/dashboard"];

// API routes that should pass through (handled by their own auth)
const API_PATHS = ["/api/"];

// Static assets that should pass through
const STATIC_PATHS = ["/_next/", "/favicon", "/images/", "/fonts/"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname) || PUBLIC_PATHS.includes(pathname.replace(/\/$/, ""));
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isApiPath(pathname: string): boolean {
  return API_PATHS.some((prefix) => pathname.startsWith(prefix));
}

function isStaticPath(pathname: string): boolean {
  return STATIC_PATHS.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and API routes
  if (isStaticPath(pathname) || isApiPath(pathname)) {
    return NextResponse.next();
  }

  // Check for auth cookies
  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");
  const hasAuthCookies = !!(accessToken || refreshToken);

  // If user has auth cookies and tries to access login, redirect to dashboard
  if (hasAuthCookies && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If accessing protected route without auth cookies, redirect to login
  if (isProtectedPath(pathname) && !hasAuthCookies) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the intended destination for redirect after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For protected routes with cookies, verify with backend
  if (isProtectedPath(pathname) && hasAuthCookies) {
    try {
      const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Forward cookies to backend for verification
      const cookieHeader = request.headers.get("cookie") || "";

      const verifyResponse = await fetch(`${backendUrl}/api/v1/auth/verify`, {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
        },
        // Short timeout to avoid blocking the request too long
        signal: AbortSignal.timeout(3000),
      });

      if (!verifyResponse.ok) {
        // Auth failed, redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);

        // Clear invalid cookies
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("access_token");
        response.cookies.delete("refresh_token");
        return response;
      }

      // Auth succeeded, forward any refreshed cookies
      const response = NextResponse.next();
      const responseCookies = verifyResponse.headers.getSetCookie?.() || [];
      responseCookies.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie);
      });

      return response;
    } catch (error) {
      // On network error, let the request through and let client-side handle it
      // This prevents middleware from blocking the app if backend is slow
      console.error("Middleware auth check failed:", error);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

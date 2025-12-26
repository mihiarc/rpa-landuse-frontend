"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/", "/login"];

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Check if a path is a public (unauthenticated) path.
 * Public paths are the landing page and login.
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

/**
 * Check if a path is a dashboard (protected) path.
 * Dashboard paths start with /dashboard.
 */
function isDashboardPath(pathname: string): boolean {
  return pathname.startsWith("/dashboard");
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, isLoading, verify, refresh } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    // Only verify once on mount
    if (!hasVerifiedRef.current) {
      hasVerifiedRef.current = true;
      verify();
    }
  }, [verify]);

  // Optional: Periodic token refresh
  // Refresh token every 14 minutes (assuming 15 minute token expiry)
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshInterval = setInterval(
      () => {
        refresh().catch(() => {
          // Token refresh failed, user will be redirected on next API call
        });
      },
      14 * 60 * 1000
    ); // 14 minutes

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, refresh]);

  useEffect(() => {
    if (isLoading) return;

    const publicPath = isPublicPath(pathname);
    const dashboardPath = isDashboardPath(pathname);

    // Unauthenticated users trying to access dashboard -> redirect to login
    if (!isAuthenticated && dashboardPath) {
      router.push("/login");
    }
    // Authenticated users on login page -> redirect to dashboard
    else if (isAuthenticated && pathname === "/login") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // For unauthenticated users on dashboard paths, show nothing (redirect happens in useEffect)
  if (!isAuthenticated && isDashboardPath(pathname)) {
    return null;
  }

  // Navigation is now handled by route group layouts, so just render children
  return <>{children}</>;
}

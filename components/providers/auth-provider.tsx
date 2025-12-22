"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Navigation } from "@/components/shared/navigation";

const PUBLIC_PATHS = ["/login"];

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, isLoading, verify } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    verify();
  }, [verify]);

  useEffect(() => {
    if (isLoading) return;

    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    if (!isAuthenticated && !isPublicPath) {
      router.push("/login");
    } else if (isAuthenticated && isPublicPath) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

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

  // For unauthenticated users on non-public paths, show nothing (redirect happens in useEffect)
  if (!isAuthenticated && !isPublicPath) {
    return null;
  }

  // For login page, render only the children (full screen, no navigation)
  if (isPublicPath) {
    return <>{children}</>;
  }

  // For authenticated routes, render full layout with navigation
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}

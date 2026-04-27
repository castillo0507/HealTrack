"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHealth } from "@/lib/health-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useHealth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

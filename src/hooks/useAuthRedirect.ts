"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store";

export function useAuthRedirect() {
  const { isAuthenticated, isLoading } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    // Check if the auth state has settled
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

"use client";

import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";
import { auth, IS_MOCK } from "@/firebase/config";
import { useAppStore } from "@/store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const fetchProfile = useAppStore((state) => state.fetchProfile);
  const logout = useAppStore((state) => state.logout);

  useEffect(() => {
    if (IS_MOCK || !auth) {
      // If Firebase is in mock mode, the app will log in a mock user manually on the Login page.
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await fetchProfile(
            firebaseUser.uid,
            firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
            firebaseUser.email || ""
          );
        } catch (error) {
          console.error("Error syncing profile on auth state change:", error);
        }
      } else {
        logout();
      }
    });

    return () => unsubscribe();
  }, [fetchProfile, logout]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

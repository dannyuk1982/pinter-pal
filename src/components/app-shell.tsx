"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { AuthGate } from "./auth-gate";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { NotificationChecker } from "./notification-checker";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Header />
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-4">
        <AuthGate>{children}</AuthGate>
      </main>
      <BottomNav />
      <NotificationChecker />
    </AuthProvider>
  );
}

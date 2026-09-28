import type { ReactNode } from "react";
import { AuthSheet, OfflineBar, ToastHost } from "@/components/chrome";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#E8D7C3] dark:bg-[#0C0708]">
      <div className="relative mx-auto min-h-dvh w-full max-w-[430px] bg-background shadow-[0_20px_80px_rgba(85,32,38,0.18)]">
        <OfflineBar />
        {children}
        <ToastHost />
        <AuthSheet />
      </div>
    </div>
  );
}

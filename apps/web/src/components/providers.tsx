"use client";

import { Toaster } from "@graphora/ui/components/sonner";

import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false} disableTransitionOnChange>
      {children}
      <Toaster richColors />
    </ThemeProvider>
  );
}

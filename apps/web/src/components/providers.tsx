"use client";

import { Toaster } from "@graphora/ui/components/sonner";
import { TooltipProvider } from "@graphora/ui/components/tooltip";
import { ApolloProvider } from "@apollo/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { ThemeProvider } from "./theme-provider";
import { apolloClient } from "@/lib/apollo-client";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange
    >
      <ApolloProvider client={apolloClient}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {children}
            <Toaster richColors />
          </TooltipProvider>
        </QueryClientProvider>
      </ApolloProvider>
    </ThemeProvider>
  );
}

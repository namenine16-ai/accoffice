"use client";

import { ToastProvider } from "@/components/ui/use-toast";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <ToastProvider>{children}</ToastProvider>;
}

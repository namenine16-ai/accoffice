"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

let toastId = 0;

function subscribeNoop() {
  return () => undefined;
}

function useIsClient() {
  return React.useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}

function getVariantStyles(variant: ToastOptions["variant"]) {
  switch (variant) {
    case "success":
      return "border-emerald-300 bg-emerald-50 text-emerald-900";
    case "error":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    case "warning":
      return "border-amber-300 bg-amber-50 text-amber-900";
    default:
      return "border-slate-300 bg-slate-50 text-slate-900";
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<ToastOptions & { id: number }>>([]);
  const isClient = useIsClient();

  const toast = React.useCallback((options: ToastOptions) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, variant: "default", ...options }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {isClient &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
            {toasts.map((toastItem) => (
              <div
                key={toastItem.id}
                className={cn(
                  "max-w-sm rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm",
                  getVariantStyles(toastItem.variant)
                )}
              >
                <div className="font-semibold">{toastItem.title}</div>
                {toastItem.description ? (
                  <p className="text-sm text-muted-foreground">{toastItem.description}</p>
                ) : null}
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("useToast must be used within a ToastProvider. Falling back to a no-op toast.");
    }

    return {
      toast: () => undefined,
    };
  }
  return context;
}

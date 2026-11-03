import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error";
type Toast = { id: number; text: string; type: ToastType };

const ToastContext = createContext<(text: string, type?: ToastType) => void>(() => {});

let nextId = 0;

// Short messages in the bottom corner after an action, e.g. "Student enrolled".
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((text: string, type: ToastType = "success") => {
    const id = nextId++;
    setToasts((list) => [...list, { id, text, type }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium shadow-xl",
              t.type === "error" ? "bg-red-600 text-white" : "bg-foreground text-background",
            )}
          >
            {t.type === "error" ? <XCircle className="size-4 shrink-0" /> : <CheckCircle2 className="size-4 shrink-0" />}
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

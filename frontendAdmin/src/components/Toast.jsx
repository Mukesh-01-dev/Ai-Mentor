import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useToast } from "../context/ToastContext";

const TYPE_CONFIG = {
  error: {
    icon: AlertTriangle,
    iconColor: "text-red-500",
    bg: "bg-red-500/5",
    bar: "bg-red-500",
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-teal-500",
    bg: "bg-teal-500/5",
    bar: "bg-teal-500",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    bg: "bg-amber-500/5",
    bar: "bg-amber-500",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    bg: "bg-blue-500/5",
    bar: "bg-blue-500",
  },
};

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const config = TYPE_CONFIG[toast.type] || TYPE_CONFIG.error;
  const Icon = config.icon;

  // Slide in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Shrink progress bar over 4 seconds
  useEffect(() => {
    const start = Date.now();
    const duration = 4000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`
        relative w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border
        bg-card shadow-2xl overflow-hidden pointer-events-auto
        transition-all duration-300 ease-out
        ${config.bg}
    ${visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
      `}
    >
      {/* Content */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconColor}`} />
        <p className="text-sm font-medium text-main leading-relaxed flex-1 pr-2">
          {toast.message}
        </p>
        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-muted hover:text-main hover:bg-canvas-alt transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-border/50">
        <div
          className={`h-full transition-none ${config.bar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function Toast() {
  const { toasts, dismiss } = useToast();

  return createPortal(
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 items-center pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>,
    document.body
  );
}

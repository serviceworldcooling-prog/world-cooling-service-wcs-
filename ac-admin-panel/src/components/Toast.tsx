'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Style map ───────────────────────────────────────────────────────────────
const STYLES: Record<ToastType, {
  bar: string; bg: string; border: string;
  icon: string; title: string; msg: string;
  Icon: React.ElementType;
}> = {
  success: {
    bar:    'bg-emerald-500',
    bg:     'bg-white',
    border: 'border-emerald-200',
    icon:   'text-emerald-500 bg-emerald-50',
    title:  'text-slate-900',
    msg:    'text-slate-500',
    Icon:   CheckCircle2,
  },
  error: {
    bar:    'bg-red-500',
    bg:     'bg-white',
    border: 'border-red-200',
    icon:   'text-red-500 bg-red-50',
    title:  'text-slate-900',
    msg:    'text-slate-500',
    Icon:   XCircle,
  },
  warning: {
    bar:    'bg-amber-400',
    bg:     'bg-white',
    border: 'border-amber-200',
    icon:   'text-amber-500 bg-amber-50',
    title:  'text-slate-900',
    msg:    'text-slate-500',
    Icon:   AlertTriangle,
  },
  info: {
    bar:    'bg-blue-500',
    bg:     'bg-white',
    border: 'border-blue-200',
    icon:   'text-blue-500 bg-blue-50',
    title:  'text-slate-900',
    msg:    'text-slate-500',
    Icon:   Info,
  },
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => [...prev.slice(-4), { id, type, title, message }]); // max 5 at once
    timers.current[id] = setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const success = useCallback((title: string, msg?: string) => toast('success', title, msg), [toast]);
  const error   = useCallback((title: string, msg?: string) => toast('error',   title, msg), [toast]);
  const warning = useCallback((title: string, msg?: string) => toast('warning', title, msg), [toast]);
  const info    = useCallback((title: string, msg?: string) => toast('info',    title, msg), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}

      {/* Portal-style fixed container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 w-80 pointer-events-none"
      >
        {toasts.map(t => {
          const s = STYLES[t.type];
          const Icon = s.Icon;
          return (
            <div
              key={t.id}
              role="alert"
              className={`
                pointer-events-auto relative flex items-start gap-3 rounded-2xl border
                ${s.bg} ${s.border} shadow-xl px-4 py-3.5 overflow-hidden
                animate-slide-up
              `}
            >
              {/* Coloured left bar */}
              <span className={`absolute left-0 inset-y-0 w-1 rounded-l-2xl ${s.bar}`} />

              {/* Icon */}
              <span className={`mt-0.5 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${s.icon}`}>
                <Icon size={16} />
              </span>

              {/* Text */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className={`text-sm font-700 leading-snug ${s.title}`}>{t.title}</p>
                {t.message && <p className={`text-xs mt-0.5 leading-relaxed ${s.msg}`}>{t.message}</p>}
              </div>

              {/* Dismiss */}
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all mt-0.5"
                aria-label="Dismiss notification"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

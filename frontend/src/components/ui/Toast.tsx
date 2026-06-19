'use client';

import React from 'react';
import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export function ToastContainer() {
  const toasts = useToast((state) => state.toasts);
  const removeToast = useToast((state) => state.removeToast);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-400" />,
    info: <Info className="h-5 w-5 text-cyan-400" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-400" />,
  };

  const bgColors = {
    success: 'border-emerald-500/30 bg-zinc-950/85 hover:border-emerald-500/50',
    error: 'border-red-500/30 bg-zinc-950/85 hover:border-red-500/50',
    info: 'border-cyan-500/30 bg-zinc-950/85 hover:border-cyan-500/50',
    warning: 'border-amber-500/30 bg-zinc-950/85 hover:border-amber-500/50',
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col space-y-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`flex items-start justify-between p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-colors duration-300 ${bgColors[toast.type]}`}
          >
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
              <p className="text-sm font-medium text-zinc-200">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 shrink-0 rounded-full p-0.5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Helpers for quick consumption in pages
export const showToast = {
  success: (msg: string, dur?: number) => useToast.getState().addToast(msg, 'success', dur),
  error: (msg: string, dur?: number) => useToast.getState().addToast(msg, 'error', dur),
  info: (msg: string, dur?: number) => useToast.getState().addToast(msg, 'info', dur),
  warning: (msg: string, dur?: number) => useToast.getState().addToast(msg, 'warning', dur),
};

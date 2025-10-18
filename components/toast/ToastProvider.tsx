"use client";

import React, { createContext, useCallback, useContext, useState } from 'react';
import Toast, { ToastItem } from './Toast';

type ShowToast = (t: Omit<ToastItem, 'id'>) => void;

const ToastContext = createContext<{ show: ShowToast } | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export function ToastProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((s) => s.filter((x) => x.id !== id));
  }, []);

  const show: ShowToast = useCallback((t) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 7);
    const item: ToastItem = { id, ...t } as ToastItem;
    setToasts((s) => [...s, item]);
    // auto-dismiss
    setTimeout(() => removeToast(id), 4500);
  }, [removeToast]);

  const value = React.useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <Toast key={t.id} item={t} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

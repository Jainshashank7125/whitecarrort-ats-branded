"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  type?: "info" | "success" | "error" | "warning";
}

export default function Toast({
  item,
  onDismiss,
}: Readonly<{ item: ToastItem; onDismiss: (id: string) => void }>) {
  const getBg = () => {
    if (item.type === "success")
      return "bg-green-50 border-green-200 text-green-800";
    if (item.type === "error") return "bg-red-50 border-red-200 text-red-800";
    if (item.type === "warning")
      return "bg-yellow-50 border-yellow-200 text-yellow-800";
    return "bg-slate-50 border-slate-200 text-slate-800";
  };
  const bg = getBg();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        role="output"
        aria-live="polite"
        className={`max-w-sm w-full ${bg} border px-4 py-3 rounded-lg shadow-sm flex items-start justify-between gap-3`}
      >
        <div className="flex-1">
          {item.title && <div className="font-semibold">{item.title}</div>}
          {item.description && (
            <div className="text-sm mt-1">{item.description}</div>
          )}
        </div>

        <button
          aria-label="Dismiss notification"
          onClick={() => onDismiss(item.id)}
          className="ml-3 p-1 rounded hover:bg-slate-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

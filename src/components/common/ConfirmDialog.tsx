"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "info" | "warning";
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  type = "danger",
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const content = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-[6px] transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Dialog Body */}
      <div className="relative bg-white w-full max-w-[420px] rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-10 text-center">
          {/* Icon Header */}
          <div className={`w-24 h-24 rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center flex-col gap-1 ${
            type === 'danger' ? 'bg-red-50 text-red-500' : 
            type === 'warning' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
          }`}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>

          <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter mb-3 italic">
            {title}
          </h3>
          <p className="text-sm font-bold text-gray-500 leading-relaxed px-2">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-8 pt-0 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 h-16 rounded-[2rem] bg-gray-50 border-2 border-gray-100 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 h-16 rounded-[2rem] text-[11px] font-black uppercase tracking-widest text-white transition-all shadow-2xl ${
              type === 'danger' ? 'bg-primary shadow-red-200 hover:bg-rose-700' : 
              type === 'warning' ? 'bg-orange-500 shadow-orange-200 hover:bg-orange-600' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

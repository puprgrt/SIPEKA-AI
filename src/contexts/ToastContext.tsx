import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-20 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`
                pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-center gap-3 w-80 backdrop-blur-xl
                ${toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-50' : ''}
                ${toast.type === 'error' ? 'bg-red-950/80 border-red-800 text-red-50' : ''}
                ${toast.type === 'warning' ? 'bg-amber-950/80 border-amber-800 text-amber-50' : ''}
                ${toast.type === 'info' ? 'bg-slate-900/80 border-slate-700 text-slate-50' : ''}
              `}
            >
              {toast.type === 'success' && <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle size={20} className="text-red-400 shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle size={20} className="text-amber-400 shrink-0" />}
              {toast.type === 'info' && <Info size={20} className="text-blue-400 shrink-0" />}
              
              <span className="text-[13px] font-semibold flex-1 leading-snug">{toast.message}</span>
              
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

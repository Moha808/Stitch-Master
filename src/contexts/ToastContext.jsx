import React, { createContext, useState, useContext, useCallback } from 'react';
import { HiCheckCircle, HiXCircle, HiExclamationTriangle, HiInformationCircle, HiXMark } from 'react-icons/hi2';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full sm:w-auto px-4 sm:px-0 no-print">
        {toasts.map((toast) => {
          let bgClass = 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/80 dark:text-emerald-300';
          let Icon = HiCheckCircle;
          let iconColor = 'text-emerald-500 dark:text-emerald-400';

          if (toast.type === 'error') {
            bgClass = 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/80 dark:text-rose-300';
            Icon = HiXCircle;
            iconColor = 'text-rose-500 dark:text-rose-400';
          } else if (toast.type === 'warning') {
            bgClass = 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800/80 dark:text-amber-300';
            Icon = HiExclamationTriangle;
            iconColor = 'text-amber-500 dark:text-amber-400';
          } else if (toast.type === 'info') {
            bgClass = 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800/80 dark:text-sky-300';
            Icon = HiInformationCircle;
            iconColor = 'text-sky-500 dark:text-sky-400';
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgClass} animate-slide-in-right transition-all duration-300`}
              role="alert"
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
              <div className="flex-1 text-sm font-medium leading-5">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded-lg p-0.5"
              >
                <HiXMark className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};


import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  priority: number; // Higher is more important
  timestamp: number;
  count?: number; // For coalesced toasts
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Priority mapping
const PRIORITY_MAP: Record<ToastType, number> = {
    'error': 3,
    'warning': 2,
    'success': 1,
    'info': 0
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const queueRef = useRef<Toast[]>([]);
  const MAX_VISIBLE_TOASTS = 3;

  const processQueue = useCallback(() => {
    setToasts(prev => {
        // If we have space
        if (prev.length < MAX_VISIBLE_TOASTS && queueRef.current.length > 0) {
            // Get highest priority items from queue
            // Queue sort: Priority Desc, then Timestamp Asc
            queueRef.current.sort((a, b) => {
                if (a.priority !== b.priority) return b.priority - a.priority;
                return a.timestamp - b.timestamp;
            });
            
            const nextToast = queueRef.current.shift();
            if (nextToast) {
                 // Auto-dismiss logic
                 setTimeout(() => removeToast(nextToast.id), nextToast.type === 'error' ? 8000 : 5000);
                 return [...prev, nextToast];
            }
        }
        return prev;
    });
  }, []);

  // Trigger processing whenever toasts state changes (slot frees up)
  useEffect(() => {
    if (toasts.length < MAX_VISIBLE_TOASTS) {
        processQueue();
    }
  }, [toasts.length, processQueue]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    // DEDUPLICATION: Check if identical toast is already visible or in queue
    const isDuplicateVisible = toasts.some(t => t.message === message && t.type === type);
    const isDuplicateQueued = queueRef.current.some(t => t.message === message && t.type === type);

    if (isDuplicateVisible || isDuplicateQueued) {
        // Optional: We could increment a counter on the visible toast here
        return;
    }

    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { 
        id, 
        message, 
        type, 
        priority: PRIORITY_MAP[type],
        timestamp: Date.now() 
    };
    
    queueRef.current.push(newToast);
    processQueue();
  }, [toasts, processQueue]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[6000] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-center w-80 p-4 rounded-lg shadow-lg border animate-in slide-in-from-right-full duration-300",
              "bg-white dark:bg-slate-800",
              toast.type === 'success' ? "border-green-500" :
              toast.type === 'error' ? "border-red-500" :
              toast.type === 'warning' ? "border-amber-500" : "border-blue-500"
            )}
          >
            <div className="shrink-0 mr-3">
              {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
              {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
              {toast.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
            </div>
            <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

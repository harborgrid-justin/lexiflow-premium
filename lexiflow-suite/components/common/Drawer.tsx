
import { X } from 'lucide-react';
import React, { useEffect } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children, width = 'max-w-md' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        className="fixed inset-0 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`relative w-full ${width} bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300`}>
        <div style={{ backgroundColor: 'var(--color-surfaceHover)', borderColor: 'var(--color-border)' }} className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg text-slate-900">{title}</h3>
          <button onClick={onClose} style={{ color: 'var(--color-textMuted)' }} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

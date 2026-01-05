
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  actions?: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, defaultOpen = false, className = '', actions }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-slate-200 rounded-lg overflow-hidden bg-white ${className}`}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="font-medium text-slate-900 select-none flex-1">{title}</div>
        <div className="flex items-center gap-3">
          {actions && <div onClick={e => e.stopPropagation()}>{actions}</div>}
          <button className="text-slate-400 hover:text-slate-600">
            {isOpen ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="p-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

export const Accordion: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {children}
  </div>
);

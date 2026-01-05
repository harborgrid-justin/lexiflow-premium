
import React, { useId } from 'react';
import { Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{label}</label>}
      <input 
        id={inputId}
        className={`w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
        disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props} 
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', id, ...props }) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{label}</label>}
      <textarea 
        id={inputId}
        className={`w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${className}`}
        {...props} 
      />
    </div>
  );
};

export const SearchInput: React.FC<InputProps> = (props) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
    <Input {...props} className={`pl-10 ${props.className || ''}`} />
  </div>
);

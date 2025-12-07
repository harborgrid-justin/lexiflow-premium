
import React from 'react';
import { Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  const { theme } = useTheme();
  
  return (
    <div className="w-full">
      {label && <label className={cn("block text-xs font-semibold uppercase tracking-wide mb-1.5 ml-0.5", theme.text.secondary)}>{label}</label>}
      <input
        className={cn(
          "w-full h-10 px-3 py-2 border rounded-md text-sm shadow-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600",
          theme.surface.input,
          error ? theme.border.error : cn(theme.border.default, theme.border.focused),
          theme.text.primary,
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => {
  const { theme } = useTheme();
  
  return (
    <div className="w-full">
      {label && <label className={cn("block text-xs font-semibold uppercase tracking-wide mb-1.5 ml-0.5", theme.text.secondary)}>{label}</label>}
      <textarea
        className={cn(
          "w-full px-3 py-2 border rounded-md text-sm shadow-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600",
          theme.surface.input,
          theme.border.default,
          theme.text.primary,
          theme.border.focused,
          className
        )}
        {...props}
      />
    </div>
  );
};

export const SearchInput: React.FC<InputProps> = (props) => {
  const { theme } = useTheme();
  
  return (
    <div className="relative">
      <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none", theme.text.tertiary)} />
      <Input {...props} className={cn("pl-10", props.className)} />
    </div>
  );
};

import React from 'react';
import { Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface SearchToolbarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({ value, onChange, placeholder = "Search (Press /)...", actions, className = "" }) => {
  const { theme } = useTheme();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={cn("flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg border shadow-sm", theme.surface, theme.border.default, className)}>
      <div className="relative w-full md:max-w-md">
        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)} />
        <input 
          ref={inputRef}
          className={cn(
            "w-full pl-9 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500",
            theme.surfaceHighlight,
            theme.border.default,
            theme.text.primary
          )}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {actions && (
        <div className="flex gap-2 w-full md:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

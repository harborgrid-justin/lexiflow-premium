
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Loader2, Search } from 'lucide-react';

// Re-export the standardized component to maintain import compatibility
export { StatusBadge } from './StatusBadge';

// 2. CentredLoader: Standard full-container loading spinner
export const CentredLoader: React.FC<{ className?: string, message?: string }> = ({ className, message }) => {
  const { theme } = useTheme();
  return (
    <div className={cn("flex h-full w-full items-center justify-center p-8 flex-col gap-2", className)}>
      <Loader2 className={cn("animate-spin h-8 w-8", theme.primary.text)}/>
      {message && <span className={cn("text-xs", theme.text.secondary)}>{message}</span>}
    </div>
  );
};

// 3. EmptyListState: Consistent empty state messaging
export const EmptyListState: React.FC<{ label: string, message?: string, icon?: React.ElementType }> = ({ label, message, icon: Icon }) => {
    const { theme } = useTheme();
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 text-center h-full w-full", theme.text.tertiary)}>
            {Icon && <Icon className="h-12 w-12 mb-3 opacity-20"/>}
            <div className="font-medium italic text-sm">{label}</div>
            {message && <div className="text-xs mt-1 opacity-75">{message}</div>}
        </div>
    );
};

// 4. SectionTitle: Standard sidebar/card section header typography
export const SectionTitle: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    const { theme } = useTheme();
    return <h4 className={cn("text-xs font-bold uppercase tracking-wide mb-3", theme.text.tertiary, className)}>{children}</h4>;
};

// 5. InfoGrid: Key-Value grid layout for inspectors
export const InfoGrid: React.FC<{ items: { label: string, value: React.ReactNode, span?: number }[], cols?: number }> = ({ items, cols = 2 }) => {
    const { theme } = useTheme();
    return (
        <div className={`grid grid-cols-${cols} gap-4`}>
            {items.map((item, i) => (
                <div key={i} className={item.span ? `col-span-${item.span}` : ''}>
                    <p className={cn("text-xs font-bold uppercase mb-1", theme.text.secondary)}>{item.label}</p>
                    <div className={cn("text-sm font-medium break-words", theme.text.primary)}>{item.value}</div>
                </div>
            ))}
        </div>
    );
};

// 6. SearchInputBar: Standard styled search input without full toolbar overhead
export const SearchInputBar: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
    const { theme } = useTheme();
    return (
        <div className={cn("relative w-full", className)}>
            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)}/>
            <input 
                className={cn("w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600", theme.surface.default, theme.border.default, theme.text.primary)}
                {...props}
            />
        </div>
    );
};

// 7. ActionRow: Header pattern for modules with Title, Description and Actions
export const ActionRow: React.FC<{ title: string, subtitle?: string, children?: React.ReactNode, className?: string }> = ({ title, subtitle, children, className }) => {
    const { theme } = useTheme();
    return (
        <div className={cn("flex flex-col md:flex-row justify-between items-center p-4 rounded-lg border shadow-sm gap-4", theme.surface.default, theme.border.default, className)}>
            <div>
                <h3 className={cn("font-bold text-lg", theme.text.primary)}>{title}</h3>
                {subtitle && <p className={cn("text-sm", theme.text.secondary)}>{subtitle}</p>}
            </div>
            <div className="flex gap-2">{children}</div>
        </div>
    );
};

// 8. TabStrip: The navigation container used in module headers
export const TabStrip: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    const { theme } = useTheme();
    return (
        <div className={cn("px-6 pt-6 border-b shrink-0", theme.border.default, className)}>
            {children}
        </div>
    );
};

// 9. ModalFooter: Standard bottom action bar for modals
export const ModalFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { theme } = useTheme();
    return (
        <div className={cn("flex justify-end gap-3 pt-4 border-t mt-4", theme.border.light)}>
            {children}
        </div>
    );
};

// 10. MetricTile: Simplified metric card for dense grids
export const MetricTile: React.FC<{ label: string, value: string | number | React.ReactNode, icon?: any, trend?: string, trendUp?: boolean, className?: string }> = ({ label, value, icon: Icon, trend, trendUp, className }) => {
    const { theme } = useTheme();
    return (
        <div className={cn("p-4 rounded-lg border shadow-sm flex flex-col justify-between h-full", theme.surface.default, theme.border.default, className)}>
             <div className="flex justify-between items-start">
                 <div>
                    <p className={cn("text-xs font-bold uppercase mb-1", theme.text.secondary)}>{label}</p>
                    <div className={cn("text-2xl font-bold", theme.text.primary)}>{value}</div>
                 </div>
                 {Icon && <Icon className={cn("h-5 w-5", theme.text.tertiary)} />}
             </div>
             {trend && <p className={cn("text-xs mt-2 font-medium", trendUp ? "text-green-600" : "text-red-600")}>{trend}</p>}
        </div>
    );
};

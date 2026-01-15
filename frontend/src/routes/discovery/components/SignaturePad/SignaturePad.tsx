/**
 * @module components/common/SignaturePad
 * @category Common
 * @description Digital signature pad with animation.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState } from 'react';
import { PenTool, CheckCircle, RefreshCcw, X } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/theme';

// Utils & Constants
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface SignaturePadProps {
  value: boolean;
  onChange: (signed: boolean) => void;
  label?: string;
  subtext?: string;
  isSigning?: boolean;
}

/**
 * SignaturePad - React 18 optimized with React.memo and useId
 */
export const SignaturePad = React.memo<SignaturePadProps>(({ 
  value, onChange, label = "Digital Signature", subtext = "I certify this record is accurate.", isSigning 
}) => {
  const { theme } = useTheme();
  const [localSigning, setLocalSigning] = useState(false);

  const handleClick = () => {
    if (value) return; 
    
    setLocalSigning(true);
    setTimeout(() => {
      setLocalSigning(false);
      onChange(true);
    }, 800);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(false);
  };

  const loading = isSigning || localSigning;

  return (
    <div className="relative">
      <div 
        className={cn(
          "p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer group relative overflow-hidden",
          value 
            ? cn(theme.status.info.bg, theme.status.info.border) 
            : cn(theme.surface.highlight, theme.border.default, `hover:${theme.border.default}`)
        )} 
        onClick={handleClick}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            value 
              ? cn(theme.primary.DEFAULT, theme.text.inverse) 
              : cn(theme.surface.default, theme.border.default, "border text-slate-400 group-hover:border-slate-300")
          )}>
            {loading ? <RefreshCcw className="h-5 w-5 animate-spin"/> : value ? <CheckCircle className="h-6 w-6"/> : <PenTool className="h-5 w-5"/>}
          </div>
          <div>
            <span className={cn("block text-sm font-bold", value ? theme.primary.text : theme.text.primary)}>
              {value ? 'Signed & Verified' : label}
            </span>
            <span className={cn("text-xs", theme.text.secondary)}>{subtext}</span>
          </div>
        </div>
        
        {value && (
             <div className="absolute top-0 right-0 p-2">
                 <button 
                    onClick={handleClear}
                    className={cn("p-1 rounded-full transition-colors", theme.action.danger.hover, theme.text.secondary)}
                    title="Clear Signature"
                    aria-label="Clear Signature"
                 >
                     <X className="h-4 w-4"/>
                 </button>
             </div>
        )}
      </div>
    </div>
  );
});

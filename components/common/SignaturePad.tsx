
import React, { useState } from 'react';
import { PenTool, CheckCircle, RefreshCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface SignaturePadProps {
  value: boolean;
  onChange: (signed: boolean) => void;
  label?: string;
  subtext?: string;
  isSigning?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ 
  value, onChange, label = "Digital Signature", subtext = "I certify this record is accurate.", isSigning 
}) => {
  const { theme } = useTheme();
  const [localSigning, setLocalSigning] = useState(false);

  const handleClick = () => {
    if (value) {
      onChange(false);
      return;
    }
    setLocalSigning(true);
    setTimeout(() => {
      setLocalSigning(false);
      onChange(true);
    }, 800);
  };

  const loading = isSigning || localSigning;

  return (
    <div 
      className={cn(
        "p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer group",
        value 
          ? cn(theme.status.info.bg, theme.status.info.border) 
          : cn(theme.surfaceHighlight, theme.border.default, `hover:${theme.border.light}`)
      )} 
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all",
          value 
            ? "bg-blue-600 text-white" 
            : cn(theme.surface, theme.border.default, "border text-slate-400 group-hover:border-slate-300")
        )}>
          {loading ? <RefreshCcw className="h-5 w-5 animate-spin"/> : value ? <CheckCircle className="h-6 w-6"/> : <PenTool className="h-5 w-5"/>}
        </div>
        <div>
          <span className={cn("block text-sm font-bold", value ? "text-blue-900 dark:text-blue-200" : theme.text.primary)}>
            {value ? 'Signed & Verified' : label}
          </span>
          <span className={cn("text-xs", theme.text.secondary)}>{subtext}</span>
        </div>
      </div>
    </div>
  );
};

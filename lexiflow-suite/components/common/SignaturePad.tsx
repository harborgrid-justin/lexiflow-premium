
import React, { useState } from 'react';
import { PenTool, CheckCircle, RefreshCcw } from 'lucide-react';

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
    <div className={`p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer group ${value ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-300 hover:border-slate-400'}`} onClick={handleClick}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${value ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-400 group-hover:border-slate-300'}`}>
          {loading ? <RefreshCcw className="h-5 w-5 animate-spin"/> : value ? <CheckCircle className="h-6 w-6"/> : <PenTool className="h-5 w-5"/>}
        </div>
        <div>
          <span className={`block text-sm font-bold ${value ? 'text-blue-900' : 'text-slate-700'}`}>
            {value ? 'Signed & Verified' : label}
          </span>
          <span className="text-xs text-slate-500">{subtext}</span>
        </div>
      </div>
    </div>
  );
};

import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SignalCheckerProps {
  citation: string;
  status: 'Positive' | 'Caution' | 'Negative' | 'Unknown';
}

export const SignalChecker: React.FC<SignalCheckerProps> = ({ status }) => {

  const getIcon = () => {
    switch (status) {
      case 'Positive': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'Caution': return <AlertTriangle className="h-3 w-3 text-amber-500" />;
      case 'Negative': return <XCircle className="h-3 w-3 text-red-500" />;
      default: return <HelpCircle className="h-3 w-3 text-slate-400" />;
    }
  };

  const getLabel = () => {
      switch(status) {
          case 'Positive': return 'Good Law';
          case 'Caution': return 'Distinguished';
          case 'Negative': return 'Overruled';
          default: return 'Unverified';
      }
  };

  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider", 
        status === 'Positive' ? "bg-green-50 border-green-200 text-green-700" :
        status === 'Caution' ? "bg-amber-50 border-amber-200 text-amber-700" :
        status === 'Negative' ? "bg-red-50 border-red-200 text-red-700" :
        "bg-slate-50 border-slate-200 text-slate-500"
    )}>
      {getIcon()}
      {getLabel()}
    </div>
  );
};

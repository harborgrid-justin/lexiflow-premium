/**
 * @module components/workflow/ProcessIcon
 * @category Workflow Components
 * @description Icon component for firm process visualization
 */

import React from 'react';
import { 
  UserPlus, FileCheck, RefreshCw, Database, ShieldAlert, 
  Scale, Archive, Lock 
} from 'lucide-react';

export interface ProcessIconProps {
  processName: string;
  className?: string;
}

/**
 * Get the appropriate icon component for a firm process based on its name
 */
export function ProcessIcon({ processName, className }: ProcessIconProps) {
  const name = processName.toLowerCase();
  
  if (name.includes('client') || name.includes('onboarding')) {
    return <UserPlus className={className || "h-5 w-5 text-blue-600"}/>;
  }
  if (name.includes('billing') || name.includes('bill')) {
    return <FileCheck className={className || "h-5 w-5 text-green-600"}/>;
  }
  if (name.includes('discovery') || name.includes('data') || name.includes('log')) {
    return <Database className={className || "h-5 w-5 text-purple-600"}/>;
  }
  if (name.includes('audit') || name.includes('compliance') || name.includes('risk') || name.includes('conflict')) {
    return <ShieldAlert className={className || "h-5 w-5 text-red-600"}/>;
  }
  if (name.includes('admission') || name.includes('pro hac')) {
    return <Scale className={className || "h-5 w-5 text-indigo-600"}/>;
  }
  if (name.includes('closing') || name.includes('archive')) {
    return <Archive className={className || "h-5 w-5 text-slate-600"}/>;
  }
  if (name.includes('hold') || name.includes('enforcement')) {
    return <Lock className={className || "h-5 w-5 text-amber-600"}/>;
  }
  
  return <RefreshCw className={className || "h-5 w-5 text-gray-600"}/>;
}

// Memoized for performance (icon selection is pure)
ProcessIcon.displayName = 'ProcessIcon';

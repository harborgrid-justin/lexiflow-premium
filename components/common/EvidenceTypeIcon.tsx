
import React from 'react';
import { Box, Activity, FileText, Fingerprint } from 'lucide-react';
import { EvidenceType } from '../../types';

interface EvidenceTypeIconProps {
  type: EvidenceType;
  className?: string;
}

export const EvidenceTypeIcon: React.FC<EvidenceTypeIconProps> = ({ type, className = "h-5 w-5" }) => {
  switch(type) {
    case 'Physical': return <Box className={`text-amber-600 ${className}`}/>;
    case 'Digital': return <Activity className={`text-blue-600 ${className}`}/>;
    case 'Document': return <FileText className={`text-slate-600 ${className}`}/>;
    default: return <Fingerprint className={`text-purple-600 ${className}`}/>;
  }
};

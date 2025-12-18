/**
 * @module components/common/primitives/FileIcon
 * @category Common Components - UI Primitives
 * @description File type icon selector based on MIME type or extension
 */

import React from 'react';
import { FileText, Image, Film, Music, Box, Shield } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface FileIconProps {
  type: string;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ 
  type, 
  className = "h-5 w-5" 
}) => {
  const t = type.toLowerCase();
  
  if (t.includes('image') || t.includes('jpg') || t.includes('png')) {
    return <Image className={cn("text-purple-600", className)} />;
  }
  if (t.includes('video') || t.includes('mp4')) {
    return <Film className={cn("text-rose-600", className)} />;
  }
  if (t.includes('audio')) {
    return <Music className={cn("text-pink-600", className)} />;
  }
  if (t.includes('evidence')) {
    return <Shield className={cn("text-amber-600", className)} />;
  }
  if (t.includes('physical')) {
    return <Box className={cn("text-slate-600", className)} />;
  }
  
  return <FileText className={cn("text-blue-600", className)} />;
};

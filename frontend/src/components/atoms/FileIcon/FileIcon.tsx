/**
 * @module components/common/primitives/FileIcon
 * @category Common Components - UI Primitives
 * @description File type icon selector based on MIME type or extension
 */

import React from 'react';
import { FileText, Image, Film, Music, Box, Shield } from 'lucide-react';
import { iconColors, getIconClass } from './FileIcon.styles';

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
    return <Image className={getIconClass(iconColors.image, className)} />;
  }
  if (t.includes('video') || t.includes('mp4')) {
    return <Film className={getIconClass(iconColors.video, className)} />;
  }
  if (t.includes('audio')) {
    return <Music className={getIconClass(iconColors.audio, className)} />;
  }
  if (t.includes('evidence')) {
    return <Shield className={getIconClass(iconColors.evidence, className)} />;
  }
  if (t.includes('physical')) {
    return <Box className={getIconClass(iconColors.physical, className)} />;
  }
  
  return <FileText className={getIconClass(iconColors.default, className)} />;
};

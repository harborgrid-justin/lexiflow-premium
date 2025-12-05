
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './Button';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md';
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, label = "Copy", variant = "secondary", size = "sm" }) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleCopy} 
      icon={copied ? Check : Copy}
      className={copied ? cn(theme.status.success.text, theme.status.success.bg, theme.status.success.border) : ''}
    >
      {copied ? 'Copied' : label}
    </Button>
  );
};

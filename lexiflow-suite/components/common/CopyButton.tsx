
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './Button.tsx';

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md';
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, label = "Copy", variant = "secondary", size = "sm" }) => {
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
      className={copied ? 'text-green-600 border-green-200 bg-green-50' : ''}
    >
      {copied ? 'Copied' : label}
    </Button>
  );
};

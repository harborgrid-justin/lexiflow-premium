/**
 * @module components/common/CopyButton
 * @category Common
 * @description Copy to clipboard button with feedback.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Components
import { Button } from '../Button';

// Utils & Constants
import { NOTIFICATION_AUTO_DISMISS_MS } from '@/config/master.config';
import { getSuccessStyles } from './CopyButton.styles';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md';
}

export function CopyButton({ text, label = "Copy", variant = "secondary", size = "sm" }: CopyButtonProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), NOTIFICATION_AUTO_DISMISS_MS);
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleCopy} 
      icon={copied ? Check : Copy}
      className={copied ? getSuccessStyles(theme) : ''}
    >
      {copied ? 'Copied' : label}
    </Button>
  );
};

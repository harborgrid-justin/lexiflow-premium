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
import { Check, Copy } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { NOTIFICATION_AUTO_DISMISS_MS } from '@/config/features/ui.config';
import { useTheme } from "@/hooks/useTheme";

// Components
import { Button } from '../Button/Button';

// Utils & Constants
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

export const CopyButton = React.memo<CopyButtonProps>(({ text, label = "Copy", variant = "secondary", size = "sm" }) => {
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
});

CopyButton.displayName = 'CopyButton';

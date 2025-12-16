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
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { Button } from './Button';

// Utils & Constants
import { cn } from '../../utils/cn';
import { NOTIFICATION_AUTO_DISMISS_MS } from '../../config/master.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
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
    setTimeout(() => setCopied(false), NOTIFICATION_AUTO_DISMISS_MS);
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

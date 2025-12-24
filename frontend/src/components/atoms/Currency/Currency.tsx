/**
 * @module components/common/primitives/Currency
 * @category Common Components - UI Primitives
 * @description Formatted currency display using standardized Formatters
 */

import React from 'react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { Formatters } from '@/utils/formatters';
import { currencyStyles } from './Currency.styles';

export interface CurrencyProps {
  value: number;
  className?: string;
  hideSymbol?: boolean;
}

export const Currency: React.FC<CurrencyProps> = ({ 
  value, 
  className = "", 
  hideSymbol = false 
}) => {
  const { theme } = useTheme();
  const formatted = Formatters.currency(value);
  
  return (
    <span className={cn(currencyStyles(theme), className)}>
      {!hideSymbol && formatted}
      {hideSymbol && formatted.replace('$', '')}
    </span>
  );
};

/**
 * @module components/common/Accordion
 * @category Common
 * @description Collapsible accordion component.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useId } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  actions?: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, defaultOpen = false, className = '', actions }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { theme } = useTheme();
  const contentId = useId();
  const buttonId = useId();

  return (
    <div className={cn("border rounded-lg overflow-hidden", theme.surface.default, theme.border.default, className)}>
      <button
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className={cn("p-4 flex items-center justify-between cursor-pointer transition-colors w-full text-left", theme.surface.highlight, `hover:${theme.surface.default}`)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={cn("font-medium select-none flex-1", theme.text.primary)}>{title}</div>
        <div className="flex items-center gap-3">
          {actions && <div onClick={e => e.stopPropagation()}>{actions}</div>}
          <span className={cn("hover:text-blue-600 transition-colors", theme.text.tertiary)} aria-hidden="true">
            {isOpen ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
          </span>
        </div>
      </button>
      <div 
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        className="accordion-content" 
        data-state={isOpen ? 'open' : 'closed'}
        hidden={!isOpen}
      >
        <div>
          <div className={cn("p-4 border-t", theme.border.default)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Accordion: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={cn("space-y-3", className)}>
    {children}
  </div>
);

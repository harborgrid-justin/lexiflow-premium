/**
 * @module components/enterprise/forms/FormSection
 * @category Enterprise - Forms
 * @description Collapsible form section/fieldset component with accessibility
 *
 * FEATURES:
 * - Collapsible sections
 * - Keyboard navigation
 * - ARIA attributes
 * - Smooth animations
 */

import React, { useState, useId } from 'react';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';
import type { FormSection as FormSectionType } from '@/types/forms';

// ============================================================================
// TYPES
// ============================================================================

export interface FormSectionProps {
  /** Section configuration */
  section: FormSectionType;
  /** Is collapsible */
  collapsible?: boolean;
  /** Initially collapsed */
  defaultCollapsed?: boolean;
  /** Children (field components) */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const FormSectionComponent: React.FC<FormSectionProps> = ({
  section,
  collapsible = false,
  defaultCollapsed = false,
  children,
  className,
}) => {
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const sectionId = useId();
  const contentId = useId();

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (collapsible && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <fieldset
      id={sectionId}
      className={cn(
        'form-section border rounded-lg p-6',
        theme.border.default,
        className
      )}
    >
      {/* Section Header */}
      <legend className="contents">
        <div
          className={cn(
            'flex items-center justify-between mb-4 -mt-2 -mx-2 px-2',
            collapsible && 'cursor-pointer hover:bg-gray-50 rounded-lg py-2'
          )}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          role={collapsible ? 'button' : undefined}
          aria-expanded={collapsible ? !isCollapsed : undefined}
          aria-controls={collapsible ? contentId : undefined}
          tabIndex={collapsible ? 0 : undefined}
        >
          <div className="flex-1">
            <h3
              className={cn(
                'text-lg font-semibold',
                theme.text.primary
              )}
            >
              {section.title}
            </h3>
            {section.description && (
              <p className={cn('text-sm mt-1', theme.text.secondary)}>
                {section.description}
              </p>
            )}
          </div>
          {collapsible && (
            <div
              className={cn(
                'ml-4 transform transition-transform',
                isCollapsed ? 'rotate-0' : 'rotate-180'
              )}
              aria-hidden="true"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          )}
        </div>
      </legend>

      {/* Section Content */}
      <div
        id={contentId}
        className={cn(
          'transition-all duration-200 ease-in-out',
          isCollapsed && collapsible
            ? 'max-h-0 overflow-hidden opacity-0'
            : 'max-h-none opacity-100'
        )}
        aria-hidden={collapsible && isCollapsed}
      >
        {children}
      </div>
    </fieldset>
  );
};

FormSectionComponent.displayName = 'FormSection';

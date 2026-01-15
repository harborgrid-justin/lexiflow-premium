/**
 * @module components/common/EmptyState
 * @category Common
 * @description Empty state placeholder with icon and action.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { LucideIcon } from 'lucide-react';
import React, { useId } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from "@/hooks/useTheme";

// Utils & Constants
import { cn } from '@/lib/cn';

// Primitives
import { Box } from '@/components/atoms/Box/Box';
import { Text } from '@/components/atoms/Text/Text';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action, className = '' }) => {
  const { theme } = useTheme();
  const titleId = useId();

  return (
    <Box
      aria-labelledby={titleId}
      flex
      direction="col"
      align="center"
      justify="center"
      spacing="lg"
      rounded="lg"
      className={cn(
        "py-12 text-center h-full w-full border-2 border-dashed",
        theme.border.default,
        theme.text.tertiary,
        className
      )}
    >
      <Box
        rounded="full"
        spacing="md"
        className={cn(theme.surface.highlight)}
      >
        <Icon className={cn("h-12 w-12 opacity-40", theme.text.tertiary)} />
      </Box>
      <Text id={titleId} variant="heading" size="lg" className="mb-1">{title}</Text>
      <Text size="sm" color="secondary" className="max-w-sm mb-6">{description}</Text>
      {action}
    </Box>
  );
};

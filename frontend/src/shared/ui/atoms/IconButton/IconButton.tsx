/**
 * IconButton.tsx
 * 
 * Reusable icon button component with consistent styling
 * Replaces repeated inline button patterns
 */

import { LucideIcon } from 'lucide-react';
import { getButtonClasses, getIconClasses, variantClasses, sizeClasses } from './IconButton.styles';

// ============================================================================
// TYPES
// ============================================================================
export type IconButtonVariant = keyof typeof variantClasses;
export type IconButtonSize = keyof typeof sizeClasses;

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Visual style variant */
  variant?: IconButtonVariant;
  /** Size of button */
  size?: IconButtonSize;
  /** Accessible label (required for screen readers) */
  'aria-label': string;
  /** Show tooltip */
  tooltip?: string;
  /** Make button circular */
  rounded?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * IconButton - Consistent icon button component
 * 
 * @example
 * `	sx
 * <IconButton icon={Play} variant="success" aria-label="Start" />
 * <IconButton icon={Pause} variant="warning" aria-label="Pause" size="lg" />
 * <IconButton icon={StopCircle} variant="danger" aria-label="Stop" rounded />
 * ``r
 */
export const IconButton = React.memo<IconButtonProps>(({
  icon: Icon,
  variant = 'primary',
  size = 'md',
  'aria-label': ariaLabel,
  tooltip,
  rounded = true,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={getButtonClasses(variant, size, rounded, className)}
      aria-label={ariaLabel}
      title={tooltip || ariaLabel}
      disabled={disabled}
      {...props}
    >
      <Icon className={getIconClasses(size, disabled)} />
    </button>
  );
});

IconButton.displayName = 'IconButton';
